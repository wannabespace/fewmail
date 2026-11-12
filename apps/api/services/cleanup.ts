import { db } from '@fewmail/db'
import {
  actions,
  mailboxes,
  messages,
  unsubscribes,
  userSettings,
} from '@fewmail/db/schema'
import { CLEAR_OUT_GROUPS } from '@fewmail/shared/agent'
import type { CleanupSender, ClearOutGroup } from '@fewmail/shared/agent'
import { messages as dictionaries } from '@fewmail/shared/i18n'
import { Result } from 'better-result'
import { subDays } from 'date-fns'
import { and, eq, gte, inArray, isNotNull, sql } from 'drizzle-orm'

import { inBatches } from '../lib/batches'
import { localClock } from '../lib/clock'
import {
  GmailError,
  getMessageHeaders,
  listLabels,
  listMessageIds,
  modifyMessages,
} from '../lib/gmail'
import { senderHashOf } from '../lib/keyed-hash'
import { announceChange, MAIL_TOPICS } from '../lib/live'
import { logError } from '../lib/log'
import { findOrCreateLabel } from './labels'
import { insertMessages } from './sync'
import { unsubscribe, unsubscribeMessage } from './thread-effects'

const LOOKBACK_DAYS = 30
const MIN_UNOPENED = 3
const MAX_SENDERS = 25
const WEEKDAY_SUNDAY = 0

/** Every mailing list that wrote in the last month and the user has not left, busiest first. */
export const listSubscriptions = async (userId: string) => {
  const [rows, unsubscribedRows] = await Promise.all([
    db
      .select({
        count: sql<number>`count(*)::int`,
        fromEmail: messages.fromEmail,
        fromName: sql<string | null>`max(${messages.fromName})`.mapWith(
          messages.fromName
        ),
        messageId: sql<string>`(array_agg(${messages.id} order by ${messages.receivedAt} desc))[1]`,
        // An autonomous archive or mark-read clears UNREAD too: counted as opened, every list a starter rule handled looked read and was never offered for cleanup.
        opened: sql<number>`count(*) filter (where not ${messages.isUnread} and not exists (select 1 from ${actions} where ${actions.messageId} = ${messages.id} and ${actions.status} = 'auto_done' and ${actions.kind} in ('archive', 'mark_read')))::int`,
      })
      .from(messages)
      .where(
        and(
          eq(messages.userId, userId),
          eq(messages.isFromMe, false),
          isNotNull(messages.listUnsubscribe),
          gte(messages.receivedAt, subDays(new Date(), LOOKBACK_DAYS))
        )
      )
      .groupBy(messages.fromEmail),
    db
      .select({ senderHash: unsubscribes.senderHash })
      .from(unsubscribes)
      .where(eq(unsubscribes.userId, userId)),
  ])
  const unsubscribed = new Set(
    unsubscribedRows.map(({ senderHash }) => senderHash)
  )
  return rows
    .filter(({ fromEmail }) => !unsubscribed.has(senderHashOf(fromEmail)))
    .toSorted((left, right) => right.count - left.count)
}

/** Mailing lists the user got at least three times in a month and never opened. */
const unopenedSenders = async (userId: string): Promise<CleanupSender[]> => {
  const subscriptions = await listSubscriptions(userId)
  return subscriptions
    .filter(({ count, opened }) => count >= MIN_UNOPENED && opened === 0)
    .slice(0, MAX_SENDERS)
    .map(({ count, fromEmail, fromName, messageId }) => ({
      count,
      fromEmail,
      fromName,
      messageId,
    }))
}

const CLEANUP_EVERY_DAYS = 6

/** Once a week, on Sunday after the morning hour (`briefHour`), one card offers to unsubscribe from everything unopened. `cleanupCheckedAt` is set before looking, so a week with nothing to offer is not looked at again every minute. */
export const offerCleanup = async (
  settings: typeof userSettings.$inferSelect
) => {
  const { userId } = settings
  const clock = localClock(settings.timezone)
  const weekday = new Date(`${clock.date}T12:00:00Z`).getUTCDay()
  if (
    weekday !== WEEKDAY_SUNDAY ||
    clock.hour < settings.briefHour ||
    (settings.cleanupCheckedAt &&
      settings.cleanupCheckedAt > subDays(new Date(), CLEANUP_EVERY_DAYS))
  ) {
    return
  }
  await db
    .update(userSettings)
    .set({ cleanupCheckedAt: new Date() })
    .where(eq(userSettings.userId, userId))
  const senders = await unopenedSenders(userId)
  if (senders.length === 0) {
    return
  }
  const t = dictionaries[settings.language]
  await db.insert(actions).values({
    autonomous: false,
    kind: 'cleanup',
    payload: { senders },
    reason: t.cleanup.reason(
      senders.reduce((sum, { count }) => sum + count, 0)
    ),
    status: 'pending',
    title: t.cleanup.title(senders.length),
    userId,
  })
  await announceChange(userId, ['actions', 'today'])
}

export const runCleanup = (userId: string, senders: CleanupSender[]) =>
  Promise.all(
    senders.map(async ({ messageId }) => {
      const unsubscribed = await Result.tryPromise(() =>
        unsubscribeMessage(userId, messageId, 'sender')
      )
      if (unsubscribed.isErr()) {
        logError('cleanup unsubscribe failed', unsubscribed.error.cause)
      }
    })
  )

type Mailbox = typeof mailboxes.$inferSelect

const CLEAR_OUT_QUERIES: Record<Exclude<ClearOutGroup, 'lists'>, string> = {
  notifications:
    'in:inbox {category:updates category:forums} is:read older_than:30d',
  old: 'in:inbox older_than:1y',
  promotions: 'in:inbox {category:promotions category:social} older_than:3d',
}
const INBOX_QUERY = 'in:inbox'
/** Beyond it the counts read "50,000+": listing more costs a minute of the user's Gmail quota. */
export const CLEAR_OUT_CAP = 50_000
const SENDER_SAMPLE = 600
/** Header reads at once: Gmail allows 250 quota units a second per user, five per read. */
const SAMPLE_CONCURRENCY = 10
const SENDERS_PER_QUERY = 20
/** Gmail turns the slash into a hyphen in search. */
const CLEARED_LABEL = 'Fewmail/Cleared'
const CLEARED_QUERY = 'label:fewmail-cleared'

const ownedMailboxes = (userId: string) =>
  db.select().from(mailboxes).where(eq(mailboxes.userId, userId))

type Headers = Awaited<ReturnType<typeof getMessageHeaders>>

/** Mailing lists among the newest inbox mail that sent at least three emails, none of them opened. */
const unopenedListSenders = async (mailbox: Mailbox, inboxIds: string[]) => {
  const sample: Headers[] = []
  await inBatches(
    inboxIds.slice(0, SENDER_SAMPLE),
    SAMPLE_CONCURRENCY,
    async (id) => {
      const headers = await getMessageHeaders(mailbox, id).catch((error) => {
        if (error instanceof GmailError && error.status === 404) {
          return null
        }
        throw error
      })
      if (headers?.isList) {
        sample.push(headers)
      }
    }
  )
  const bySender = Map.groupBy(sample, ({ from }) => from.email)
  return [...bySender.values()].flatMap((mail) => {
    const [latest] = mail
    return latest &&
      mail.length >= MIN_UNOPENED &&
      mail.every(({ isUnread }) => isUnread)
      ? [{ count: mail.length, from: latest.from, gmailId: latest.gmailId }]
      : []
  })
}

const sendersInboxIds = async (mailbox: Mailbox, emails: string[]) => {
  const chunks = Array.from(
    { length: Math.ceil(emails.length / SENDERS_PER_QUERY) },
    (_, index) =>
      emails.slice(index * SENDERS_PER_QUERY, (index + 1) * SENDERS_PER_QUERY)
  )
  const pages = await Promise.all(
    chunks.map((chunk) =>
      listMessageIds(
        mailbox,
        `${INBOX_QUERY} {${chunk.map((email) => `from:${email}`).join(' ')}}`,
        CLEAR_OUT_CAP
      )
    )
  )
  return pages.flat()
}

const groupIds = (
  mailbox: Mailbox,
  group: ClearOutGroup,
  senderEmails: string[]
) =>
  group === 'lists'
    ? sendersInboxIds(mailbox, senderEmails)
    : listMessageIds(mailbox, CLEAR_OUT_QUERIES[group], CLEAR_OUT_CAP)

const scanMailbox = async (mailbox: Mailbox) => {
  const inbox = await listMessageIds(mailbox, INBOX_QUERY, CLEAR_OUT_CAP)
  const senders = await unopenedListSenders(mailbox, inbox)
  const emails = senders.map(({ from }) => from.email)
  const groups = await Promise.all(
    CLEAR_OUT_GROUPS.map(
      async (group) => new Set(await groupIds(mailbox, group, emails))
    )
  )
  return { inbox, groups, mailbox, senders }
}

/**
 * What a clear-out would move out of the inbox, read from Gmail directly (headers only, nothing stored).
 * `overlaps` counts inbox mail by the exact set of groups it falls in, so any choice of groups adds up
 * without counting an email twice.
 */
export const scanClearOut = async (userId: string) => {
  const owned = await ownedMailboxes(userId)
  const scans = await Promise.all(owned.map(scanMailbox))
  const overlaps = new Map<string, { count: number; groups: ClearOutGroup[] }>()
  for (const { groups, inbox } of scans) {
    for (const id of inbox) {
      const matched = CLEAR_OUT_GROUPS.filter((_, index) =>
        groups[index]?.has(id)
      )
      const key = matched.join(',')
      if (matched.length > 0) {
        overlaps.set(key, {
          count: (overlaps.get(key)?.count ?? 0) + 1,
          groups: matched,
        })
      }
    }
  }
  return {
    inbox: scans.reduce((sum, { inbox }) => sum + inbox.length, 0),
    isCapped: scans.some(({ inbox }) => inbox.length >= CLEAR_OUT_CAP),
    overlaps: [...overlaps.values()],
    senders: scans
      .flatMap(({ senders }) => senders)
      .toSorted((left, right) => right.count - left.count)
      .map(({ count, from }) => ({
        count,
        fromEmail: from.email,
        fromName: from.name,
      })),
  }
}

/** Leaves each list through the one email kept of it, the same path as any unsubscribe. */
const leaveLists = async (
  userId: string,
  mailbox: Mailbox,
  senders: Awaited<ReturnType<typeof unopenedListSenders>>
) => {
  const gmailIds = senders.map(({ gmailId }) => gmailId)
  await insertMessages(mailbox, gmailIds)
  const kept = gmailIds.length
    ? await db
        .select()
        .from(messages)
        .where(
          and(
            eq(messages.mailboxId, mailbox.id),
            inArray(messages.gmailId, gmailIds)
          )
        )
    : []
  const results = await Promise.all(
    kept.map((message) =>
      unsubscribe(userId, message, 'thread').catch((error: unknown) => {
        logError('clear-out unsubscribe failed', error)
        return { unsubscribed: false }
      })
    )
  )
  return results.filter(({ unsubscribed }) => unsubscribed).length
}

const clearMailbox = async (
  userId: string,
  mailbox: Mailbox,
  groups: ClearOutGroup[]
) => {
  const newest = groups.includes('lists')
    ? await listMessageIds(mailbox, INBOX_QUERY, SENDER_SAMPLE)
    : []
  const senders = await unopenedListSenders(mailbox, newest)
  const emails = senders.map(({ from }) => from.email)
  const matched = await Promise.all(
    groups.map((group) => groupIds(mailbox, group, emails))
  )
  const ids = new Set(matched.flat())
  const label = await findOrCreateLabel(mailbox, CLEARED_LABEL)
  await modifyMessages(mailbox, [...ids], {
    add: [label.id],
    remove: ['INBOX'],
  })
  const unsubscribed = await leaveLists(userId, mailbox, senders)
  return { cleared: ids.size, unsubscribed }
}

/** Archives the chosen groups under `Fewmail/Cleared`, so `undoClearOut` can bring every one back. */
export const runClearOut = async (userId: string, groups: ClearOutGroup[]) => {
  const owned = await ownedMailboxes(userId)
  const results = await Promise.all(
    owned.map((mailbox) => clearMailbox(userId, mailbox, groups))
  )
  await announceChange(userId, MAIL_TOPICS)
  return {
    cleared: results.reduce((sum, { cleared }) => sum + cleared, 0),
    unsubscribed: results.reduce(
      (sum, { unsubscribed }) => sum + unsubscribed,
      0
    ),
  }
}

/** Unsubscribes stay: a list once left cannot be rejoined from here. */
export const undoClearOut = async (userId: string) => {
  const owned = await ownedMailboxes(userId)
  const restored = await Promise.all(
    owned.map(async (mailbox) => {
      const labels = await listLabels(mailbox)
      const label = labels.find(({ name }) => name === CLEARED_LABEL)
      if (!label) {
        return 0
      }
      const ids = await listMessageIds(mailbox, CLEARED_QUERY, CLEAR_OUT_CAP)
      await modifyMessages(mailbox, ids, {
        add: ['INBOX'],
        remove: [label.id],
      })
      return ids.length
    })
  )
  await announceChange(userId, MAIL_TOPICS)
  return { restored: restored.reduce((sum, count) => sum + count, 0) }
}
