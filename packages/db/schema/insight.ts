import type {
  CommitmentActor,
  CommitmentKind,
  CommitmentStatus,
  DomainList,
  PatternKind,
  SpamVerdict,
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

/** Who gets a mailing list, as keyed hashes of both: with `unsubscribes` it tells what share of its readers left it. */
export const listSightings = d.snakeCase.table(
  'list_sightings',
  {
    createdAt: d.timestamp({ withTimezone: true }).defaultNow().notNull(),
    listHash: d.text().notNull(),
    userHash: d.text().notNull(),
  },
  (table) => [d.primaryKey({ columns: [table.listHash, table.userHash] })]
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
    /** Money the promise is about (a refund, a payment), with `currency`; null when it is not money. */
    amountCents: d.integer(),
    currency: d.text(),
    dueAt: d.timestamp({ withTimezone: true }).notNull(),
    /** The user changed its text, date or status by hand: the agent never rewrites what they wrote. */
    editedAt: d.timestamp({ withTimezone: true }),
    /** The email that proved it fulfilled, acknowledged or cancelled. */
    evidenceMessageId: d
      .uuid()
      .references(() => messages.id, { onDelete: 'set null' }),
    kind: d.text().$type<CommitmentKind>().notNull().default('mine'),
    messageId: d.uuid().references(() => messages.id, { onDelete: 'cascade' }),
    promise: encryptedText().notNull(),
    recipient: searchableText(),
    /** Its card went to Home once (`processDueCommitments`); it never surfaces again, whatever its status. */
    remindedAt: d.timestamp({ withTimezone: true }),
    status: d.text().$type<CommitmentStatus>().notNull(),
    threadId: d.text().notNull(),
    userId: userId(),
  },
  (table) => [
    d.index('commitments_due_idx').on(table.status, table.dueAt),
    d.index('commitments_user_thread_idx').on(table.userId, table.threadId),
  ]
)

/** Append-only: every status a promise went through, who moved it and the email that showed it. No text, so nothing to encrypt. */
export const commitmentEvents = d.snakeCase.table(
  'commitment_events',
  {
    ...baseTable,
    by: d.text().$type<CommitmentActor>().notNull(),
    commitmentId: d
      .uuid()
      .notNull()
      .references(() => commitments.id, { onDelete: 'cascade' }),
    from: d.text().$type<CommitmentStatus>(),
    messageId: d.uuid().references(() => messages.id, { onDelete: 'set null' }),
    to: d.text().$type<CommitmentStatus>().notNull(),
    userId: userId(),
  },
  (table) => [
    d.index('commitment_events_commitment_idx').on(table.commitmentId),
  ]
)

export interface ReadingSummary {
  intro: string
  sections: {
    sentences: { messageIds: string[]; text: string }[]
    title: string
  }[]
  worth: { messageId: string; why: string }[]
}

/**
 * One calendar day of newsletters in the user's time zone, written once the morning after; `messageIds` are the
 * newsletters it covers, `summary` the agent's text over them (null on Free or with the allowance spent).
 */
export const readingIssues = d.snakeCase.table(
  'reading_issues',
  {
    ...baseTable,
    day: d.date({ mode: 'string' }).notNull(),
    messageIds: d.uuid().array().notNull(),
    summary: encryptedJson<ReadingSummary>(),
    userId: userId(),
  },
  (table) => [
    d.uniqueIndex('reading_issues_user_day_idx').on(table.userId, table.day),
  ]
)

export const people = d.snakeCase.table(
  'people',
  {
    ...baseTable,
    email: searchableText().notNull(),
    hiddenAt: d.timestamp({ withTimezone: true }),
    note: encryptedText(),
    noteUpdatedAt: d.timestamp({ withTimezone: true }),
    userId: userId(),
  },
  (table) => [
    d.uniqueIndex('people_user_email_idx').on(table.userId, table.email),
  ]
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
