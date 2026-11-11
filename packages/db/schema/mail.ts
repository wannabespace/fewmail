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
  RuleEffect,
  SimpleMatchField,
} from '@fewmail/shared/agent'
import * as d from 'drizzle-orm/pg-core'

import { baseTable } from '../base-table'
import { encryptedJson, encryptedText, searchableText, searchableTextArray } from '../utils'
import { users } from './auth'

const userId = () =>
  d
    .uuid()
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' })

export const mailboxes = d.snakeCase.table('mailboxes', {
  ...baseTable,
  email: encryptedText().notNull(),
  historyId: d.text(),
  /** Category → Gmail label id, created on demand when the user turns on agent labels. */
  labelIds: d
    .jsonb()
    .$type<Partial<Record<MailCategory, string>>>()
    .default({})
    .notNull(),
  lastSyncedAt: d.timestamp({ withTimezone: true }),
  syncError: encryptedText(),
  userId: userId().unique(),
})

export const messages = d.snakeCase.table(
  'messages',
  {
    ...baseTable,
    body: encryptedText().notNull(),
    /** Distinct Fewmail users who got a near-identical body in the last 30 days (null until computed). */
    auth: d.jsonb().$type<MailAuth>(),
    bulkCount: d.integer(),
    cc: searchableTextArray().notNull(),
    fromDomain: searchableText().notNull(),
    fromEmail: searchableText().notNull(),
    fromName: encryptedText(),
    gmailId: d.text().notNull(),
    hasAttachments: d.boolean().notNull(),
    isFromMe: d.boolean().notNull(),
    isUnread: d.boolean().notNull(),
    labelIds: d.text().array().notNull(),
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
  ]
)

export interface SimpleMatch {
  field: SimpleMatchField
  value: string
}

export interface Extracted {
  amount: string | null
  dueDate: string | null
  meetingTime: string | null
}

export const rules = d.snakeCase.table('rules', {
  ...baseTable,
  autonomous: d.boolean().notNull(),
  effect: d.text().$type<RuleEffect>().notNull(),
  enabled: d.boolean().default(true).notNull(),
  /** Plain-language rule matched by the agent (Pro); null for a simple rule. */
  instruction: encryptedText(),
  /** Simple rule matched without AI, available on every plan; null for an agent rule. */
  match: encryptedJson<SimpleMatch>(),
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
  ruleId: d.uuid().references(() => rules.id, { onDelete: 'set null' }),
  summary: encryptedText().notNull(),
})

export const actions = d.snakeCase.table(
  'actions',
  {
    ...baseTable,
    autonomous: d.boolean().notNull(),
    detail: encryptedText(),
    kind: d.text().$type<ActionKind>().notNull(),
    messageId: d.uuid().references(() => messages.id, { onDelete: 'cascade' }),
    notifiedAt: d.timestamp({ withTimezone: true }),
    /** Structured data for kinds that carry more than text (cleanup senders, price changes). */
    payload: encryptedJson<Record<string, unknown>>(),
    reason: encryptedText().notNull(),
    resolvedAt: d.timestamp({ withTimezone: true }),
    ruleId: d.uuid().references(() => rules.id, { onDelete: 'set null' }),
    status: d.text().$type<ActionStatus>().notNull(),
    threadId: d.text(),
    title: encryptedText().notNull(),
    userId: userId(),
  },
  (table) => [d.index('actions_user_status_idx').on(table.userId, table.status)]
)

export interface BriefStats {
  archived: number
  filed: number
  handled: number
  needYou: number
  unsubscribed: number
}

export const briefs = d.snakeCase.table(
  'briefs',
  {
    ...baseTable,
    body: encryptedText().notNull(),
    date: d.date().notNull(),
    headline: encryptedText().notNull(),
    stats: d.jsonb().$type<BriefStats>().notNull(),
    telegramSentAt: d.timestamp({ withTimezone: true }),
    userId: userId(),
  },
  (table) => [
    d.uniqueIndex('briefs_user_date_idx').on(table.userId, table.date),
  ]
)

export const outbox = d.snakeCase.table(
  'outbox',
  {
    ...baseTable,
    actionId: d.uuid().references(() => actions.id, { onDelete: 'set null' }),
    bcc: searchableTextArray().notNull(),
    cc: searchableTextArray().notNull(),
    error: encryptedText(),
    html: encryptedText().notNull(),
    inReplyTo: encryptedText(),
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
