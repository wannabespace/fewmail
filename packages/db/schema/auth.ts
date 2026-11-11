import * as d from 'drizzle-orm/pg-core'

import { baseTable } from '../base-table'

export const users = d.snakeCase.table('users', {
  ...baseTable,
  email: d.text().notNull().unique(),
  emailVerified: d.boolean().default(false).notNull(),
  image: d.text(),
  name: d.text().notNull(),
  stripeCustomerId: d.text(),
})

export const sessions = d.snakeCase.table(
  'sessions',
  {
    ...baseTable,
    expiresAt: d.timestamp({ withTimezone: true }).notNull(),
    ipAddress: d.text(),
    token: d.text().notNull().unique(),
    userAgent: d.text(),
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
    accountId: d.text().notNull(),
    idToken: d.text(),
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
