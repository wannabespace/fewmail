import type { BoardPreset, DeviceKind, Persona } from '@fewmail/shared/agent'
import type { Locale } from '@fewmail/shared/i18n/locales'
import { sql } from 'drizzle-orm'
import * as d from 'drizzle-orm/pg-core'

import { baseTable } from '../base-table'
import { encryptedJson, encryptedText, searchableText } from '../utils'
import { users } from './auth'

export const userSettings = d.snakeCase.table('user_settings', {
  briefHour: d.smallint().default(20).notNull(),
  gmailLabels: d.boolean().default(false).notNull(),
  knowledge: encryptedText(),
  language: d.text().$type<Locale>().notNull(),
  onboardedAt: d.timestamp({ withTimezone: true }).defaultNow().notNull(),
  persona: d.text().$type<Persona>().notNull(),
  starterBoards: d
    .text()
    .$type<BoardPreset>()
    .array()
    .default(['money'])
    .notNull(),
  timezone: d.text().notNull(),
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

export const apiKeys = d.snakeCase.table('api_keys', {
  ...baseTable,
  keyHash: d.text().notNull().unique(),
  lastUsedAt: d.timestamp({ withTimezone: true }),
  name: encryptedText().notNull(),
  prefix: d.text().notNull(),
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

export const subscriptions = d.snakeCase.table('subscriptions', {
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
})
