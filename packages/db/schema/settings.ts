import type { Persona } from '@fewmail/shared/agent'
import type { Locale } from '@fewmail/shared/i18n/locales'
import { sql } from 'drizzle-orm'
import * as d from 'drizzle-orm/pg-core'

import { baseTable } from '../base-table'
import { encryptedText, searchableText } from '../utils'
import { users } from './auth'

export const userSettings = d.snakeCase.table('user_settings', {
  briefHour: d.smallint().default(8).notNull(),
  gmailLabels: d.boolean().default(false).notNull(),
  knowledge: encryptedText(),
  language: d.text().$type<Locale>().notNull(),
  onboardedAt: d.timestamp({ withTimezone: true }).defaultNow().notNull(),
  persona: d.text().$type<Persona>().notNull(),
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
