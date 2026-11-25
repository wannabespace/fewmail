import type {
  MailAuth,
  OutboxMode,
  OutboxStatus,
  ReminderKind,
  ReminderStatus,
  SpamVerdict,
  MessageRisk,
  ActionKind,
  ActionStatus,
  MailCategory,
  BotEffect,
  SimpleMatchField,
} from '@fewmail/shared/agent'
import type { MailAttachment, OutgoingAttachment } from '@fewmail/shared/email'
import { sql } from 'drizzle-orm'
import * as d from 'drizzle-orm/pg-core'

import { baseTable } from '../base-table'
import {
  encryptedJson,
  encryptedText,
  searchableText,
  searchableTextArray,
} from '../utils'
import { users } from './auth'

const userId = () =>
  d
    .uuid()
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' })

/**
 * The sign-in mailbox reads Gmail through the user's Better Auth account; an added one keeps its own Google grant
 * here. Added grants must never become Better Auth accounts: Google sign-in finds the user by account, so whoever
 * owns an added mailbox would be signed in to this user.
 */
export const mailboxes = d.snakeCase.table(
  'mailboxes',
  {
    ...baseTable,
    /** Keyed hash of `email`: Gmail push names a mailbox only by its address, and `email` cannot be queried. */
    addressHash: d.text(),
    email: encryptedText().notNull(),
    /** Off, it is not read and its mail is shown nowhere, but all of it stays; the sign-in mailbox is always on. */
    enabled: d.boolean().default(true).notNull(),
    /** Null for the sign-in mailbox. */
    googleAccountId: searchableText(),
    /** Every email received since then is in `messages`; older mail is read live from Gmail. The worker moves it back to `HELD_MONTHS` before `createdAt`. */
    heldSince: d.timestamp({ withTimezone: true }).defaultNow().notNull(),
    historyId: d.text(),
    /** Category → Gmail label id, created on demand when the user turns on agent labels. */
    labelIds: d
      .jsonb()
      .$type<Partial<Record<MailCategory, string>>>()
      .default({})
      .notNull(),
    lastSyncedAt: d.timestamp({ withTimezone: true }),
    refreshToken: encryptedText(),
    /** Gmail's daily sending limit was hit; Gmail refuses every send until then. */
    sendBlockedUntil: d.timestamp({ withTimezone: true }),
    /** When Google wrote that the account's storage is full: Gmail bounces incoming mail until any non-Google email arrives again. */
    storageFullAt: d.timestamp({ withTimezone: true }),
    syncError: encryptedText(),
    /** Claimed atomically: the API and the worker both sync, and a doubled sync would analyze mail twice. */
    syncStartedAt: d.timestamp({ withTimezone: true }),
    /** Set by a sync that found the claim taken; the holder syncs again on release, so a push mid-sync is not left to the poll. */
    syncRequested: d.boolean().default(false).notNull(),
    userId: userId(),
    /** Gmail stops pushing at this time unless the watch is renewed. */
    watchExpiresAt: d.timestamp({ withTimezone: true }),
  },
  (table) => [
    d.index('mailboxes_address_hash_idx').on(table.addressHash),
    d
      .uniqueIndex('mailboxes_user_sign_in_idx')
      .on(table.userId)
      .where(sql`${table.googleAccountId} is null`),
    d
      .uniqueIndex('mailboxes_user_google_idx')
      .on(table.userId, table.googleAccountId),
  ]
)

export const messages = d.snakeCase.table(
  'messages',
  {
    ...baseTable,
    body: encryptedText().notNull(),
    /** Distinct Fewmail users who got a near-identical body in the last 30 days (null until computed). */
    auth: d.jsonb().$type<MailAuth>(),
    bulkCount: d.integer(),
    cc: searchableTextArray().notNull(),
    /** A sign-in or verification code found in the email (`oneTimeCode`), shown in the list to copy without opening it. */
    code: encryptedText(),
    fromDomain: searchableText().notNull(),
    fromEmail: searchableText().notNull(),
    fromName: encryptedText(),
    gmailId: d.text().notNull(),
    attachments: encryptedJson<MailAttachment[]>().notNull(),
    hasAttachments: d.boolean().notNull(),
    /** Empty when the email has no HTML part; null until first opened for held mail stored without it (`keepsHtml: false`). */
    html: encryptedText(),
    isFromMe: d.boolean().notNull(),
    isUnread: d.boolean().notNull(),
    /** Fewmail's archive took UNREAD off with the inbox (`ARCHIVE`): read in Gmail, yet never opened, so no opened count may take it. */
    readByArchive: d.boolean().default(false).notNull(),
    labelIds: d.text().array().notNull(),
    /** The List-Id header when it has a title (`titledListId`). Lists are left and caught as zombies by it, not by sender: notifications@github.com sends one list per repository. */
    listId: searchableText(),
    listUnsubscribe: encryptedText(),
    listUnsubscribePost: encryptedText(),
    mailboxId: d
      .uuid()
      .notNull()
      .references(() => mailboxes.id, { onDelete: 'cascade' }),
    infraHash: d.text(),
    messageIdHeader: encryptedText(),
    receivedAt: d.timestamp({ withTimezone: true }).notNull(),
    replyTo: encryptedText(),
    risk: d.jsonb().$type<MessageRisk>(),
    /** Keyed hashes of the subject's and sender's word beginnings (`searchTokensOf`). */
    searchTokens: d.text().array().notNull(),
    snippet: encryptedText().notNull(),
    suspicion: d.smallint(),
    subject: encryptedText().notNull(),
    threadId: d.text().notNull(),
    to: searchableTextArray().notNull(),
    userId: userId(),
  },
  (table) => [
    d
      .uniqueIndex('messages_mailbox_gmail_idx')
      .on(table.mailboxId, table.gmailId),
    d.index('messages_user_received_idx').on(table.userId, table.receivedAt),
    d.index('messages_thread_idx').on(table.userId, table.threadId),
    d.index('messages_user_from_idx').on(table.userId, table.fromEmail),
    d.index('messages_label_ids_idx').using('gin', table.labelIds),
    d.index('messages_to_idx').using('gin', table.to),
    d.index('messages_cc_idx').using('gin', table.cc),
    d.index('messages_search_tokens_idx').using('gin', table.searchTokens),
    // The worker drops old HTML every tick: without it that is a scan of every message.
    d
      .index('messages_html_kept_idx')
      .on(table.receivedAt)
      .where(sql`${table.html} is not null`),
  ]
)

export interface SimpleMatch {
  field: SimpleMatchField
  value: string
}

export interface Extracted {
  amount: string | null
  dueDate: string | null
  meetingStart: string | null
  meetingTime: string | null
}

/** The user's bots (Home's chats): which mail is theirs (`instruction` or `match`) and what they do with it. */
export const bots = d.snakeCase.table('bots', {
  ...baseTable,
  effect: d.text().$type<BotEffect>().notNull(),
  /** It acts on its own; off, it asks for a yes on each email instead. */
  enabled: d.boolean().default(true).notNull(),
  /** Plain-language bot matched by the agent (Pro); null for a simple bot. */
  instruction: encryptedText(),
  /** Simple bot matched without AI, available on every plan; null for an agent bot. */
  match: encryptedJson<SimpleMatch>(),
  /** What its chat is called. */
  name: encryptedText().notNull(),
  /** Until then it takes no mail: Jev and the simple bots skip it and its mail is Fewmail's; null, it works. */
  pausedUntil: d.timestamp({ withTimezone: true }),
  userId: userId(),
})

export const analyses = d.snakeCase.table('analyses', {
  category: d.text().$type<MailCategory>().notNull(),
  createdAt: d.timestamp({ withTimezone: true }).defaultNow().notNull(),
  extracted: encryptedJson<Extracted>().notNull(),
  importance: d.smallint().notNull(),
  messageId: d
    .uuid()
    .primaryKey()
    .references(() => messages.id, { onDelete: 'cascade' }),
  model: d.text().notNull(),
  needsReply: d.boolean().notNull(),
  reason: encryptedText().notNull(),
  botId: d.uuid().references(() => bots.id, { onDelete: 'set null' }),
  suggestedAction: d.text().$type<ActionKind>(),
  summary: encryptedText().notNull(),
})

export const actions = d.snakeCase.table(
  'actions',
  {
    ...baseTable,
    autonomous: d.boolean().notNull(),
    /** The user put its banner away (every page's notice bar); the card itself still waits on Home. */
    bannerDismissedAt: d.timestamp({ withTimezone: true }),
    detail: encryptedText(),
    kind: d.text().$type<ActionKind>().notNull(),
    messageId: d.uuid().references(() => messages.id, { onDelete: 'cascade' }),
    notifiedAt: d.timestamp({ withTimezone: true }),
    /** Structured data for kinds that carry more than text (cleanup senders, price changes). */
    payload: encryptedJson<Record<string, unknown>>(),
    reason: encryptedText().notNull(),
    resolvedAt: d.timestamp({ withTimezone: true }),
    botId: d.uuid().references(() => bots.id, { onDelete: 'set null' }),
    status: d.text().$type<ActionStatus>().notNull(),
    threadId: d.text(),
    title: encryptedText().notNull(),
    userId: userId(),
  },
  (table) => [
    d.index('actions_user_status_idx').on(table.userId, table.status),
    d.index('actions_user_thread_idx').on(table.userId, table.threadId),
    d.index('actions_message_idx').on(table.messageId),
  ]
)

export const outbox = d.snakeCase.table(
  'outbox',
  {
    ...baseTable,
    actionId: d.uuid().references(() => actions.id, { onDelete: 'set null' }),
    /** The files themselves, kept only until Gmail takes the mail: sending empties it. */
    attachments: encryptedJson<Required<OutgoingAttachment>[]>(),
    bcc: searchableTextArray().notNull(),
    cc: searchableTextArray().notNull(),
    error: encryptedText(),
    html: encryptedText().notNull(),
    inReplyTo: encryptedText(),
    mailboxId: d
      .uuid()
      .notNull()
      .references(() => mailboxes.id, { onDelete: 'cascade' }),
    mode: d.text().$type<OutboxMode>().notNull(),
    references: encryptedText(),
    remindAfterDays: d.smallint(),
    replyToMessageId: d
      .uuid()
      .references(() => messages.id, { onDelete: 'set null' }),
    sendAt: d.timestamp({ withTimezone: true }).notNull(),
    status: d.text().$type<OutboxStatus>().notNull(),
    subject: encryptedText().notNull(),
    text: encryptedText().notNull(),
    threadId: d.text(),
    to: searchableTextArray().notNull(),
    userId: userId(),
  },
  (table) => [d.index('outbox_due_idx').on(table.status, table.sendAt)]
)

export const reminders = d.snakeCase.table(
  'reminders',
  {
    ...baseTable,
    dueAt: d.timestamp({ withTimezone: true }).notNull(),
    kind: d.text().$type<ReminderKind>().notNull(),
    /** For a follow-up: when the user wrote, so any later inbound mail in the thread cancels it. */
    since: d.timestamp({ withTimezone: true }),
    status: d.text().$type<ReminderStatus>().notNull(),
    threadId: d.text().notNull(),
    userId: userId(),
  },
  (table) => [
    d.index('reminders_due_idx').on(table.status, table.dueAt),
    d.index('reminders_thread_idx').on(table.userId, table.threadId),
  ]
)

export const snippets = d.snakeCase.table('snippets', {
  ...baseTable,
  html: encryptedText().notNull(),
  name: encryptedText().notNull(),
  userId: userId(),
})

/**
 * Community spam votes. Senders are stored only as keyed hashes (no address, no message),
 * one vote per user and sender, so nobody can push a sender over the threshold alone.
 */
export const senderReports = d.snakeCase.table(
  'sender_reports',
  {
    ...baseTable,
    domainHash: d.text(),
    senderHash: d.text().notNull(),
    userId: userId(),
    verdict: d.text().$type<SpamVerdict>().notNull(),
  },
  (table) => [
    d
      .uniqueIndex('sender_reports_user_sender_idx')
      .on(table.userId, table.senderHash),
    d.index('sender_reports_sender_idx').on(table.senderHash),
    d.index('sender_reports_domain_idx').on(table.domainHash),
  ]
)

/** Senders whose suggested bot the user said no to, as keyed hashes: the offer never comes back, on Home or in their mail. */
export const declinedBotSuggestions = d.snakeCase.table(
  'declined_bot_suggestions',
  {
    ...baseTable,
    senderHash: d.text().notNull(),
    userId: userId(),
  },
  (table) => [
    d
      .uniqueIndex('declined_bot_suggestions_user_sender_idx')
      .on(table.userId, table.senderHash),
  ]
)
