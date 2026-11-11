import type {
  BillingPeriod,
  TaskAutonomy,
  TaskStatus,
  TransactionKind,
} from '@fewmail/shared/agent'
import * as d from 'drizzle-orm/pg-core'

import { baseTable } from '../base-table'
import { encryptedText } from '../utils'
import { users } from './auth'
import { messages } from './mail'

const userId = () =>
  d
    .uuid()
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' })

/** One row per user and sender they unsubscribed from; `ignoredAt` is set when mail keeps coming after the grace period. */
export const unsubscribes = d.snakeCase.table(
  'unsubscribes',
  {
    ...baseTable,
    ignoredAt: d.timestamp({ withTimezone: true }),
    senderHash: d.text().notNull(),
    userId: userId(),
  },
  (table) => [
    d
      .uniqueIndex('unsubscribes_user_sender_idx')
      .on(table.userId, table.senderHash),
    d.index('unsubscribes_sender_idx').on(table.senderHash),
  ]
)

/** Simhash of a body with personal details stripped, split in 4 bands so near-duplicates share an index; not reversible. */
export const bulkPrints = d.snakeCase.table(
  'bulk_prints',
  {
    band0: d.integer().notNull(),
    band1: d.integer().notNull(),
    band2: d.integer().notNull(),
    band3: d.integer().notNull(),
    createdAt: d.timestamp({ withTimezone: true }).defaultNow().notNull(),
    id: d.uuid().primaryKey().defaultRandom(),
    print: d.text().notNull(),
    userHash: d.text().notNull(),
  },
  (table) => [
    d.index('bulk_prints_band0_idx').on(table.band0),
    d.index('bulk_prints_band1_idx').on(table.band1),
    d.index('bulk_prints_band2_idx').on(table.band2),
    d.index('bulk_prints_band3_idx').on(table.band3),
  ]
)

/** Which sender domains the network has seen and since when; users only as keyed hashes. */
export const domainSightings = d.snakeCase.table(
  'domain_sightings',
  {
    createdAt: d.timestamp({ withTimezone: true }).defaultNow().notNull(),
    domain: d.text().notNull(),
    userHash: d.text().notNull(),
  },
  (table) => [
    d.primaryKey({ columns: [table.domain, table.userHash] }),
    d.index('domain_sightings_domain_idx').on(table.domain),
  ]
)

/** Hashes of payment details (IBAN, account, wallet) a sender domain used before, per user. */
export const paymentDetails = d.snakeCase.table(
  'payment_details',
  {
    createdAt: d.timestamp({ withTimezone: true }).defaultNow().notNull(),
    detailHash: d.text().notNull(),
    senderDomain: d.text().notNull(),
    userId: userId(),
  },
  (table) => [
    d.primaryKey({
      columns: [table.userId, table.senderDomain, table.detailHash],
    }),
  ]
)

export const commitments = d.snakeCase.table(
  'commitments',
  {
    ...baseTable,
    dueAt: d.timestamp({ withTimezone: true }).notNull(),
    messageId: d.uuid().references(() => messages.id, { onDelete: 'cascade' }),
    promise: encryptedText().notNull(),
    recipient: d.text(),
    status: d.text().$type<'open' | 'reminded' | 'done'>().notNull(),
    threadId: d.text().notNull(),
    userId: userId(),
  },
  (table) => [d.index('commitments_due_idx').on(table.status, table.dueAt)]
)

export const people = d.snakeCase.table(
  'people',
  {
    ...baseTable,
    email: d.text().notNull(),
    note: encryptedText(),
    noteUpdatedAt: d.timestamp({ withTimezone: true }),
    userId: userId(),
  },
  (table) => [
    d.uniqueIndex('people_user_email_idx').on(table.userId, table.email),
  ]
)

export const transactions = d.snakeCase.table(
  'transactions',
  {
    ...baseTable,
    amountCents: d.integer().notNull(),
    chargedAt: d.timestamp({ withTimezone: true }).notNull(),
    currency: d.text().notNull(),
    dueAt: d.timestamp({ withTimezone: true }),
    kind: d.text().$type<TransactionKind>().notNull(),
    merchant: d.text().notNull(),
    messageId: d
      .uuid()
      .notNull()
      .unique()
      .references(() => messages.id, { onDelete: 'cascade' }),
    period: d.text().$type<BillingPeriod>(),
    userId: userId(),
  },
  (table) => [
    d.index('transactions_user_merchant_idx').on(table.userId, table.merchant),
  ]
)

/** "Handle this": the agent carries a thread toward a goal, asking before each email unless autonomy is `auto`. */
export const tasks = d.snakeCase.table(
  'tasks',
  {
    ...baseTable,
    autonomy: d.text().$type<TaskAutonomy>().notNull(),
    goal: encryptedText().notNull(),
    status: d.text().$type<TaskStatus>().notNull(),
    summary: encryptedText(),
    threadId: d.text().notNull(),
    userId: userId(),
  },
  (table) => [d.index('tasks_user_thread_idx').on(table.userId, table.threadId)]
)
