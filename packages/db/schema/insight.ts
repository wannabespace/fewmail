import type {
  BoardChart,
  DomainList,
  PatternKind,
  SpamVerdict,
  TaskAutonomy,
  TaskStatus,
} from '@fewmail/shared/agent'
import * as d from 'drizzle-orm/pg-core'

import { baseTable } from '../base-table'
import { encryptedJson, encryptedText, searchableText } from '../utils'
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
    domain: searchableText().notNull(),
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
    senderDomain: searchableText().notNull(),
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
    recipient: searchableText(),
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
    email: searchableText().notNull(),
    note: encryptedText(),
    noteUpdatedAt: d.timestamp({ withTimezone: true }),
    userId: userId(),
  },
  (table) => [
    d.uniqueIndex('people_user_email_idx').on(table.userId, table.email),
  ]
)

/** A page the user describes in their own words; the agent turns the description into a Gmail query and the charts. */
export const boards = d.snakeCase.table(
  'boards',
  {
    ...baseTable,
    charts: encryptedJson<BoardChart[]>().notNull(),
    description: encryptedText().notNull(),
    gmailQuery: encryptedText().notNull(),
    /** Null until the last half year was read; a new description resets it. */
    historyReadAt: d.timestamp({ withTimezone: true }),
    name: encryptedText().notNull(),
    userId: userId(),
  },
  (table) => [d.index('boards_user_idx').on(table.userId)]
)

export const boardEntries = d.snakeCase.table(
  'board_entries',
  {
    ...baseTable,
    amountCents: d.integer(),
    boardId: d
      .uuid()
      .notNull()
      .references(() => boards.id, { onDelete: 'cascade' }),
    currency: d.text(),
    group: encryptedText(),
    messageId: d
      .uuid()
      .notNull()
      .references(() => messages.id, { onDelete: 'cascade' }),
    occurredAt: d.timestamp({ withTimezone: true }).notNull(),
    status: encryptedText(),
    title: encryptedText().notNull(),
    userId: userId(),
  },
  (table) => [
    d
      .uniqueIndex('board_entries_board_message_idx')
      .on(table.boardId, table.messageId),
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

export const knownDomains = d.snakeCase.table(
  'known_domains',
  {
    domain: d.text().notNull(),
    list: d.text().$type<DomainList>().notNull(),
    rank: d.integer(),
    updatedAt: d.timestamp({ withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    d.primaryKey({ columns: [table.list, table.domain] }),
    d.index('known_domains_domain_idx').on(table.domain),
  ]
)

/** Spam votes on a message's text fingerprint, so a template stays flagged whichever address sends it next. */
export const templateReports = d.snakeCase.table(
  'template_reports',
  {
    band0: d.integer().notNull(),
    band1: d.integer().notNull(),
    band2: d.integer().notNull(),
    band3: d.integer().notNull(),
    createdAt: d.timestamp({ withTimezone: true }).defaultNow().notNull(),
    print: d.text().notNull(),
    userHash: d.text().notNull(),
    verdict: d.text().$type<SpamVerdict>().notNull(),
  },
  (table) => [
    d.primaryKey({ columns: [table.userHash, table.print] }),
    d.index('template_reports_band0_idx').on(table.band0),
    d.index('template_reports_band1_idx').on(table.band1),
    d.index('template_reports_band2_idx').on(table.band2),
    d.index('template_reports_band3_idx').on(table.band3),
  ]
)

export const patternReports = d.snakeCase.table(
  'pattern_reports',
  {
    hash: d.text().notNull(),
    kind: d.text().$type<PatternKind>().notNull(),
    updatedAt: d.timestamp({ withTimezone: true }).defaultNow().notNull(),
    userHash: d.text().notNull(),
    verdict: d.text().$type<SpamVerdict>().notNull(),
  },
  (table) => [
    d.primaryKey({ columns: [table.userHash, table.kind, table.hash] }),
    d.index('pattern_reports_hash_idx').on(table.kind, table.hash),
  ]
)

/** RDAP registration dates; `registeredAt` stays null when the registry does not say. */
export const domainAges = d.snakeCase.table('domain_ages', {
  checkedAt: d.timestamp({ withTimezone: true }).defaultNow().notNull(),
  domain: d.text().primaryKey(),
  registeredAt: d.timestamp({ withTimezone: true }),
})

/** Agent mode conversations; `messages` are the AI SDK UI messages, tool results included. */
export const chats = d.snakeCase.table(
  'chats',
  {
    ...baseTable,
    messages: encryptedJson<unknown[]>().notNull(),
    title: encryptedText().notNull(),
    userId: userId(),
  },
  (table) => [d.index('chats_user_idx').on(table.userId, table.updatedAt)]
)

/** A standing instruction the worker sends to the agent on `cron`, in the user's timezone; every run lands in `chatId`. */
export const schedules = d.snakeCase.table(
  'schedules',
  {
    ...baseTable,
    chatId: d.uuid().notNull(),
    cron: d.text().notNull(),
    /** Failed runs in a row; the schedule is deleted at `MAX_SCHEDULE_FAILURES`. */
    failures: d.smallint().default(0).notNull(),
    instruction: encryptedText().notNull(),
    nextRunAt: d.timestamp({ withTimezone: true }).notNull(),
    /** Set while a worker runs it; an old one means the run was cut off and is retried. */
    runningSince: d.timestamp({ withTimezone: true }),
    when: encryptedText().notNull(),
    userId: userId(),
  },
  (table) => [d.index('schedules_next_run_idx').on(table.nextRunAt)]
)
