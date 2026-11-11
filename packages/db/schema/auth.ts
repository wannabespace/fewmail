import * as d from 'drizzle-orm/pg-core'

import { baseTable } from '../base-table'
import { encryptedText, searchableText } from '../utils'

export const users = d.snakeCase.table('users', {
  ...baseTable,
  email: searchableText().notNull().unique(),
  emailVerified: d.boolean().default(false).notNull(),
  image: encryptedText(),
  name: encryptedText().notNull(),
  stripeCustomerId: d.text(),
})

export const sessions = d.snakeCase.table(
  'sessions',
  {
    ...baseTable,
    expiresAt: d.timestamp({ withTimezone: true }).notNull(),
    ipAddress: encryptedText(),
    token: d.text().notNull().unique(),
    userAgent: encryptedText(),
    userId: d
      .uuid()
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
  },
  (table) => [d.index('sessions_userId_idx').on(table.userId)]
)

export const accounts = d.snakeCase.table(
  'accounts',
  {
    ...baseTable,
    accessToken: d.text(),
    accessTokenExpiresAt: d.timestamp({ withTimezone: true }),
    accountId: searchableText().notNull(),
    idToken: encryptedText(),
    password: d.text(),
    providerId: d.text().notNull(),
    refreshToken: d.text(),
    refreshTokenExpiresAt: d.timestamp({ withTimezone: true }),
    scope: d.text(),
    userId: d
      .uuid()
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
  },
  (table) => [d.index('accounts_userId_idx').on(table.userId)]
)

export const verifications = d.snakeCase.table(
  'verifications',
  {
    ...baseTable,
    expiresAt: d.timestamp({ withTimezone: true }).notNull(),
    identifier: d.text().notNull(),
    value: d.text().notNull(),
  },
  (table) => [d.index('verifications_identifier_idx').on(table.identifier)]
)
