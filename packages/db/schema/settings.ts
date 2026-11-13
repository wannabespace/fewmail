import type { BoardPreset, DeviceKind } from '@fewmail/shared/agent'
import type { Locale } from '@fewmail/shared/i18n/locales'
import { sql } from 'drizzle-orm'
import * as d from 'drizzle-orm/pg-core'

import { baseTable } from '../base-table'
import { encryptedJson, encryptedText, searchableText } from '../utils'
import { users } from './auth'
import { actions } from './mail'

export const userSettings = d.snakeCase.table('user_settings', {
  /** Named for the old daily brief: the hour of the morning messages (newsletter digest, Monday's report). */
  briefHour: d.smallint().default(8).notNull(),
  cleanupCheckedAt: d.timestamp({ withTimezone: true }),
  gmailLabels: d.boolean().default(false).notNull(),
  knowledge: encryptedText(),
  morningSentAt: d.timestamp({ withTimezone: true }),
  /** The day's newsletters sent to Telegram and WhatsApp at `briefHour`. */
  readingDigest: d.boolean().default(true).notNull(),
  language: d.text().$type<Locale>().notNull(),
  onboardedAt: d.timestamp({ withTimezone: true }).defaultNow().notNull(),
  starterBoards: d
    .text()
    .$type<BoardPreset>()
    .array()
    .default(['money'])
    .notNull(),
  timezone: d.text().notNull(),
  todayOpenedAt: d.timestamp({ withTimezone: true }),
  todaySince: d.timestamp({ withTimezone: true }),
  trialEndsAt: d
    .timestamp({ withTimezone: true })
    .default(sql`now() + interval '14 days'`)
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
})

export const telegramLinks = d.snakeCase.table('telegram_links', {
  chatId: searchableText().unique(),
  createdAt: d.timestamp({ withTimezone: true }).defaultNow().notNull(),
  linkCode: d.text().notNull().unique(),
  linkedAt: d.timestamp({ withTimezone: true }),
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
  token: searchableText().notNull().unique(),
  userId: d
    .uuid()
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
})

/** Agent usage per user and calendar month (UTC), against `PLAN_LIMITS`. */
export const usage = d.snakeCase.table(
  'usage',
  {
    ...baseTable,
    emails: d.integer().default(0).notNull(),
    messages: d.integer().default(0).notNull(),
    month: d.date({ mode: 'string' }).notNull(),
    userId: d
      .uuid()
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
  },
  (table) => [
    d.uniqueIndex('usage_user_month_idx').on(table.userId, table.month),
  ]
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
