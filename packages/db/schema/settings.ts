import type {
  BotFolder,
  DeliveryChannel,
  DeliveryNotice,
  DeliveryStatus,
  DeviceKind,
} from '@fewmail/shared/agent'
import { TRIAL_DAYS } from '@fewmail/shared/agent'
import type { Locale } from '@fewmail/shared/i18n/locales'
import { sql } from 'drizzle-orm'
import * as d from 'drizzle-orm/pg-core'

import { baseTable } from '../base-table'
import { encryptedJson, encryptedText, searchableText } from '../utils'
import { users } from './auth'
import { actions } from './mail'

export const userSettings = d.snakeCase.table('user_settings', {
  /**
   * New senders Home asked about, by list hash, with the counts it asked with: the question stays in the chat until
   * answered, though opening the emails (in its stack) makes the sender fail the "opened at most once" test.
   */
  askedSenders: d
    .jsonb()
    .$type<
      {
        askedAt: string
        count: number
        messageId: string
        opened: number
        senderHash: string
      }[]
    >()
    .default([])
    .notNull(),
  /** When the user cleared each bot's chat (ISO), by bot: nothing before it shows again, its cards included. */
  botsClearedAt: d
    .jsonb()
    .$type<Record<string, string>>()
    .default({})
    .notNull(),
  /** The sidebar's folders of bots, in order, each bot in one at most; null is none. */
  botFolders: encryptedJson<BotFolder[]>(),
  /** When the user last looked at each bot's chat (ISO), by bot: what came after is new. */
  botsReadAt: d.jsonb().$type<Record<string, string>>().default({}).notNull(),
  cleanupCheckedAt: d.timestamp({ withTimezone: true }),
  gmailLabels: d.boolean().default(false).notNull(),
  knowledge: encryptedText(),
  morningSentAt: d.timestamp({ withTimezone: true }),
  /** Bots that never notify; their chat still fills. */
  mutedBots: d.text().array().default([]).notNull(),
  /** Bots kept at the top of the sidebar, in the order they were pinned. */
  pinnedBots: d.text().array().default([]).notNull(),
  language: d.text().$type<Locale>().notNull(),
  timezone: d.text().notNull(),
  todayOpenedAt: d.timestamp({ withTimezone: true }),
  todaySince: d.timestamp({ withTimezone: true }),
  trialEndsAt: d
    .timestamp({ withTimezone: true })
    .default(sql`now() + interval '${sql.raw(String(TRIAL_DAYS))} days'`)
    .notNull(),
  updatedAt: d
    .timestamp({ withTimezone: true })
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
  userId: d
    .uuid()
    .primaryKey()
    .references(() => users.id, { onDelete: 'cascade' }),
  voice: encryptedText(),
  voiceLearnedAt: d.timestamp({ withTimezone: true }),
})

export const telegramLinks = d.snakeCase.table('telegram_links', {
  chatId: searchableText().unique(),
  createdAt: d.timestamp({ withTimezone: true }).defaultNow().notNull(),
  linkCode: d.text().notNull().unique(),
  linkedAt: d.timestamp({ withTimezone: true }),
  urgentPush: d.boolean().default(true).notNull(),
  userId: d
    .uuid()
    .primaryKey()
    .references(() => users.id, { onDelete: 'cascade' }),
})

export const whatsappLinks = d.snakeCase.table('whatsapp_links', {
  createdAt: d.timestamp({ withTimezone: true }).defaultNow().notNull(),
  /** WhatsApp only allows free-form messages within 24 h of the user's last one; later pushes go out as a template. */
  lastInboundAt: d.timestamp({ withTimezone: true }),
  linkCode: d.text().notNull().unique(),
  linkedAt: d.timestamp({ withTimezone: true }),
  phone: searchableText().unique(),
  urgentPush: d.boolean().default(true).notNull(),
  userId: d
    .uuid()
    .primaryKey()
    .references(() => users.id, { onDelete: 'cascade' }),
})

/** Shared by the API and the worker: a bot message → the action it shows, a chat → the draft it is editing or its last question and answer, and WhatsApp inbound ids already handled (no action). Keys carry chat ids and phones, hence searchable. */
export const botMessages = d.snakeCase.table(
  'bot_messages',
  {
    actionId: d.uuid().references(() => actions.id, { onDelete: 'cascade' }),
    createdAt: d.timestamp({ withTimezone: true }).defaultNow().notNull(),
    exchange: encryptedJson<{ answer: string; question: string }>(),
    key: searchableText().primaryKey(),
  },
  (table) => [d.index('bot_messages_created_at_idx').on(table.createdAt)]
)

export const devices = d.snakeCase.table('devices', {
  ...baseTable,
  keys: encryptedJson<{ auth: string; p256dh: string }>(),
  kind: d.text().$type<DeviceKind>().notNull(),
  /** A desktop app's last moment on the live stream: it is sent notifications only while it is there to show them. */
  seenAt: d.timestamp({ withTimezone: true }),
  token: searchableText().notNull().unique(),
  userId: d
    .uuid()
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
})

/**
 * One notification on one channel, kept until it went out: a channel that fails is retried with backoff and, once
 * `dead`, its group (the same notification on every channel) falls back to a channel it has not tried. A messenger
 * reads an urgent card (`actionId`) again when it goes, so a card already answered is `skipped`; a push shows `notice`.
 */
export const deliveries = d.snakeCase.table(
  'deliveries',
  {
    ...baseTable,
    actionId: d.uuid().references(() => actions.id, { onDelete: 'cascade' }),
    attempts: d.smallint().default(0).notNull(),
    channel: d.text().$type<DeliveryChannel>().notNull(),
    groupId: d.uuid().notNull(),
    nextAttemptAt: d.timestamp({ withTimezone: true }).defaultNow().notNull(),
    notice: encryptedJson<DeliveryNotice>().notNull(),
    sentAt: d.timestamp({ withTimezone: true }),
    status: d.text().$type<DeliveryStatus>().default('pending').notNull(),
    userId: d
      .uuid()
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
  },
  (table) => [
    d.index('deliveries_due_idx').on(table.status, table.nextAttemptAt),
    d.index('deliveries_group_idx').on(table.groupId),
  ]
)

/** What the agent cost per user and calendar month (UTC), in USD, against `PLAN_ALLOWANCE_USD`. */
export const usage = d.snakeCase.table(
  'usage',
  {
    ...baseTable,
    month: d.date({ mode: 'string' }).notNull(),
    spent: d
      .numeric({ mode: 'number', precision: 12, scale: 8 })
      .default(0)
      .notNull(),
    userId: d
      .uuid()
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
  },
  (table) => [
    d.uniqueIndex('usage_user_month_idx').on(table.userId, table.month),
  ]
)

export type AiFeature =
  | 'analysis'
  | 'ask_answer'
  | 'ask_query'
  | 'autocomplete'
  | 'card_link'
  | 'chat'
  | 'digest'
  | 'draft'
  | 'intro'
  | 'person_note'
  | 'promises'
  | 'reading_summary'
  | 'suggest'
  | 'understand'
  | 'voice'

/** `cost` (USD) is the call at `MODEL_PRICES`, or OpenRouter's own report for a model missing there; null when neither. */
export const aiUsage = d.snakeCase.table(
  'ai_usage',
  {
    ...baseTable,
    cacheReadTokens: d.integer().default(0).notNull(),
    cacheWriteTokens: d.integer().default(0).notNull(),
    cost: d.numeric({ mode: 'number', precision: 12, scale: 8 }),
    feature: d.text().$type<AiFeature>().notNull(),
    inputTokens: d.integer().default(0).notNull(),
    model: d.text().notNull(),
    outputTokens: d.integer().default(0).notNull(),
    userId: d
      .uuid()
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
  },
  (table) => [d.index().on(table.userId, table.createdAt)]
)

export const subscriptions = d.snakeCase.table(
  'subscriptions',
  {
    ...baseTable,
    cancelAtPeriodEnd: d.boolean().default(false).notNull(),
    periodEnd: d.timestamp({ withTimezone: true }),
    status: d.text().notNull(),
    stripePriceId: d.text().notNull(),
    stripeSubscriptionId: d.text().notNull().unique(),
    userId: d
      .uuid()
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
  },
  (table) => [d.index('subscriptions_user_idx').on(table.userId)]
)
