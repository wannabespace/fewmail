import { db } from '@fewmail/db'
import {
  actions,
  analyses,
  declinedBotSuggestions,
  mailboxes,
  messages,
  bots,
  unsubscribes,
  userSettings,
} from '@fewmail/db/schema'
import {
  CLEAR_OUT_GROUPS,
  IMPORTANCE,
  listLabelOf,
  listTitleOf,
  TIDY_KINDS,
} from '@fewmail/shared/agent'
import type { CleanupSender, ClearOutGroup } from '@fewmail/shared/agent'
import { messages as dictionaries } from '@fewmail/shared/i18n'
import { Result } from 'better-result'
import { subDays } from 'date-fns'
import { and, eq, gte, inArray, isNotNull, lt, sql } from 'drizzle-orm'
import type { AnyColumn } from 'drizzle-orm'

import { inBatches } from '../lib/batches'
import { localClock, MORNING_HOUR } from '../lib/clock'
import {
  GmailError,
  deleteLabel,
  getMessageHeaders,
  listLabels,
  listMessageIds,
  modifyMessages,
} from '../lib/gmail'
import { senderHashOf } from '../lib/keyed-hash'
import { announceChange, MAIL_TOPICS } from '../lib/live'
import { logError } from '../lib/log'
import { findOrCreateLabel } from './labels'
import { getSettings } from './settings'
import { fromMatches } from './simple-bots'
import { ownMessage, insertMessages } from './stored-mail'
import { unsubscribe, unsubscribeMessage } from './thread-effects'
import { isOpened } from './thread-labels'
import { leftShares, listHashOf } from './zombies'

const LOOKBACK_DAYS = 30
const MIN_UNOPENED = 3
const MAX_SENDERS = 25
const SUBSCRIPTIONS_PAGE = 100
const WEEKDAY_SUNDAY = 0

const latest = <T>(column: AnyColumn) =>
  sql`(array_agg(${column} order by ${messages.receivedAt} desc))[1]`.mapWith(
    (value) => column.mapFromDriverValue(value) as T
  )

/** Lists the user got in the last month, by List-Id (mail without one by sender), with the latest email of each. */
const receivedLists = (userId: string) =>
  db
    .select({
      count: sql<number>`count(*)::int`,
      fromEmail: latest<string>(messages.fromEmail),
      fromName: latest<string | null>(messages.fromName),
      listId: latest<string | null>(messages.listId),
      messageId: latest<string>(messages.id),
      opened: sql<number>`count(*) filter (where ${isOpened(messages)})::int`,
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
    .groupBy(sql`coalesce(${messages.listId}, ${messages.fromEmail})`)

/** A sender of several lists (notifications@github.com) names each by its List-Id title, not by whoever wrote its latest email. */
const namedLists = <
  T extends {
    fromEmail: string
    fromName: string | null
    listId: string | null
  },
>(
  lists: T[]
) => {
  const bySender = Map.groupBy(lists, ({ fromEmail }) => fromEmail)
  return lists.map((list) => ({
    ...list,
    fromName:
      list.listId && (bySender.get(list.fromEmail)?.length ?? 0) > 1
        ? listTitleOf(list.listId)
        : list.fromName,
  }))
}

/** Every mailing list that wrote in the last month and the user has not left, busiest first. */
export const listSubscriptions = async (userId: string) => {
  const [rows, unsubscribedRows] = await Promise.all([
    receivedLists(userId),
    db
      .select({ senderHash: unsubscribes.senderHash })
      .from(unsubscribes)
      .where(eq(unsubscribes.userId, userId)),
  ])
  const unsubscribed = new Set(
    unsubscribedRows.map(({ senderHash }) => senderHash)
  )
  const shares = await leftShares(rows)
  return namedLists(rows)
    .filter((row) => !unsubscribed.has(listHashOf(row)))
    .map((row) => ({ ...row, leftShare: shares.get(listHashOf(row)) ?? null }))
    .toSorted(
      (left, right) =>
        right.count - left.count ||
        left.messageId.localeCompare(right.messageId)
    )
}

/** The order is total (ties by messageId), or an offset would repeat or skip lists of equal count between pages. */
export const pageSubscriptions = async (userId: string, offset: number) => {
  const subscriptions = await listSubscriptions(userId)
  const nextOffset = offset + SUBSCRIPTIONS_PAGE
  return {
    nextOffset: nextOffset < subscriptions.length ? nextOffset : null,
    rows: subscriptions.slice(offset, nextOffset),
    total: subscriptions.length,
  }
}

/** Mailing lists the user got at least three times in a month and never opened. */
const unopenedSenders = async (userId: string): Promise<CleanupSender[]> => {
  const subscriptions = await listSubscriptions(userId)
  return subscriptions
    .filter(({ count, opened }) => count >= MIN_UNOPENED && opened === 0)
    .slice(0, MAX_SENDERS)
    .map(({ count, fromEmail, fromName, listId, messageId }) => ({
      count,
      fromEmail,
      fromName,
      listId,
      messageId,
    }))
}

const NEW_SENDER_DAYS = 14
const NEW_SENDER_MIN = 3
const NEW_SENDERS_SHOWN = 3

/**
 * Lists that started writing in the last two weeks, at least three times, opened at most once: the agent asks once
 * how to treat each (always archive, unsubscribe, keep). Any action on any of its emails (a bot, a tidy, a kept
 * answer) means the user already decided, so it is never asked again.
 */
export const newSenders = async (userId: string) => {
  const since = subDays(new Date(), NEW_SENDER_DAYS)
  const [lists, ownBots, unsubscribedRows] = await Promise.all([
    db
      .select({
        count: sql<number>`count(*)::int`,
        fromEmail: latest<string>(messages.fromEmail),
        fromName: latest<string | null>(messages.fromName),
        listId: latest<string | null>(messages.listId),
        messageId: latest<string>(messages.id),
        opened: sql<number>`count(*) filter (where ${isOpened(messages)})::int`,
      })
      .from(messages)
      .where(
        and(
          eq(messages.userId, userId),
          eq(messages.isFromMe, false),
          isNotNull(messages.listUnsubscribe)
        )
      )
      .groupBy(sql`coalesce(${messages.listId}, ${messages.fromEmail})`)
      .having(
        and(
          sql`min(${messages.receivedAt}) >= ${since}`,
          sql`count(*) >= ${NEW_SENDER_MIN}`,
          sql`count(*) filter (where ${isOpened(messages)}) <= 1`,
          sql`count(*) filter (where exists (select 1 from ${actions} where ${actions.messageId} = ${messages.id})) = 0`
        )
      ),
    db
      .select({ match: bots.match })
      .from(bots)
      .where(and(eq(bots.userId, userId), eq(bots.enabled, true))),
    db
      .select({ senderHash: unsubscribes.senderHash })
      .from(unsubscribes)
      .where(eq(unsubscribes.userId, userId)),
  ])
  if (ownBots.some(({ match }) => match?.field === 'mailingList')) {
    return []
  }
  const unsubscribed = new Set(
    unsubscribedRows.map(({ senderHash }) => senderHash)
  )
  const fromBots = ownBots.flatMap(({ match }) =>
    match?.field === 'from' ? [match.value] : []
  )
  const isOpen = (list: { fromEmail: string; listId: string | null }) =>
    !unsubscribed.has(listHashOf(list)) &&
    !fromBots.some((value) => fromMatches(value, list.fromEmail, null))
  const fresh = namedLists(lists)
    .filter(isOpen)
    .toSorted((left, right) => right.count - left.count)
    .slice(0, NEW_SENDERS_SHOWN)
  const shown = [...(await stillAsked(userId, fresh, isOpen)), ...fresh]
  const shares = await leftShares(shown)
  return shown.map((list) => ({
    ...list,
    leftShare: shares.get(listHashOf(list)) ?? null,
  }))
}

/**
 * The senders Home already asked about stay until the user answers (a kept answer is an action on the email it was
 * asked on; archiving makes a bot; unsubscribing is recorded), whatever was read since; the newly asked are remembered.
 */
const stillAsked = async (
  userId: string,
  fresh: {
    count: number
    fromEmail: string
    listId: string | null
    messageId: string
    opened: number
  }[],
  isOpen: (list: { fromEmail: string; listId: string | null }) => boolean
) => {
  const settings = await getSettings(userId)
  const since = subDays(new Date(), NEW_SENDER_DAYS).toISOString()
  const freshHashes = new Set(fresh.map(listHashOf))
  const asked = (settings?.askedSenders ?? []).filter(
    ({ askedAt, senderHash }) =>
      askedAt >= since && !freshHashes.has(senderHash)
  )
  const ids = asked.map(({ messageId }) => messageId)
  const rows =
    ids.length > 0
      ? await db
          .select({
            answered: sql<boolean>`exists (select 1 from ${actions} where ${actions.messageId} = ${messages.id})`,
            fromEmail: messages.fromEmail,
            fromName: messages.fromName,
            listId: messages.listId,
            messageId: messages.id,
          })
          .from(messages)
          .where(and(eq(messages.userId, userId), inArray(messages.id, ids)))
      : []
  const kept = asked.flatMap((each) => {
    const row = rows.find(({ messageId }) => messageId === each.messageId)
    return row && !row.answered && isOpen(row)
      ? [{ ...row, count: each.count, opened: each.opened }]
      : []
  })
  const now = new Date().toISOString()
  const remembered = [
    ...kept.map((list) => ({
      askedAt:
        asked.find(({ messageId }) => messageId === list.messageId)?.askedAt ??
        now,
      count: list.count,
      messageId: list.messageId,
      opened: list.opened,
      senderHash: listHashOf(list),
    })),
    ...fresh.map((list) => ({
      askedAt:
        settings?.askedSenders.find(
          ({ senderHash }) => senderHash === listHashOf(list)
        )?.askedAt ?? now,
      count: list.count,
      messageId: list.messageId,
      opened: list.opened,
      senderHash: listHashOf(list),
    })),
  ]
  if (
    JSON.stringify(remembered) !== JSON.stringify(settings?.askedSenders ?? [])
  ) {
    await db
      .update(userSettings)
      .set({ askedSenders: remembered })
      .where(eq(userSettings.userId, userId))
  }
  return namedLists(kept).map(({ answered: _, ...list }) => list)
}

/** "Keep as usual": a dismissed action on its latest email is the answer, so the sender is never asked about again. */
export const keepSender = async (userId: string, messageId: string) => {
  const message = await ownMessage(userId, messageId)
  const settings = await getSettings(userId)
  const t = dictionaries[settings?.language ?? 'en']
  await db.insert(actions).values({
    autonomous: false,
    kind: 'archive',
    messageId,
    reason: '',
    resolvedAt: new Date(),
    status: 'dismissed',
    threadId: message.threadId,
    title: t.bots.effect.archive,
    userId,
  })
}

const SUGGESTION_DAYS = 30
const SUGGESTION_MIN = 3
const SUGGESTIONS_SHOWN = 3

/**
 * Senders whose every analysed email of the last month the agent judged quiet and would archive or mark read, at least
 * three times: it offers to make that a standing bot. Never for a sender a bot already handled, one the user kept
 * an email of, one a simple bot covers or one the user said no to (`declinedBotSuggestions`). An unsubscribe
 * suggestion counts as archiving: a bot keeps acting, leaving a list is a one-off.
 */
export const botSuggestions = async (userId: string, fromEmail?: string) => {
  const [senders, ownBots, declined] = await Promise.all([
    db
      .select({
        count: sql<number>`count(*)::int`,
        effect: sql<
          'archive' | 'mark_read'
        >`case when bool_and(${analyses.suggestedAction} = 'mark_read') then 'mark_read' else 'archive' end`,
        fromEmail: messages.fromEmail,
        fromName: latest<string | null>(messages.fromName),
        messageId: latest<string>(messages.id),
      })
      .from(messages)
      .innerJoin(analyses, eq(analyses.messageId, messages.id))
      .where(
        and(
          eq(messages.userId, userId),
          eq(messages.isFromMe, false),
          gte(messages.receivedAt, subDays(new Date(), SUGGESTION_DAYS)),
          fromEmail === undefined
            ? undefined
            : eq(messages.fromEmail, fromEmail)
        )
      )
      .groupBy(messages.fromEmail)
      .having(
        and(
          sql`count(*) >= ${SUGGESTION_MIN}`,
          // bool_and skips nulls: an email with no suggestion must fail the test, not drop out of it.
          sql`bool_and(coalesce(${inArray(analyses.suggestedAction, [...TIDY_KINDS])}, false) and ${lt(analyses.importance, IMPORTANCE.high)} and ${analyses.botId} is null)`,
          sql`not bool_or(exists (select 1 from ${actions} where ${actions.messageId} = ${messages.id} and (${actions.botId} is not null or ${actions.status} = 'dismissed')))`
        )
      ),
    db
      .select({ match: bots.match })
      .from(bots)
      .where(and(eq(bots.userId, userId), eq(bots.enabled, true))),
    db
      .select({ senderHash: declinedBotSuggestions.senderHash })
      .from(declinedBotSuggestions)
      .where(eq(declinedBotSuggestions.userId, userId)),
  ])
  const declinedHashes = new Set(declined.map(({ senderHash }) => senderHash))
  const fromBots = ownBots.flatMap(({ match }) =>
    match?.field === 'from' ? [match.value] : []
  )
  return senders
    .filter(
      (sender) =>
        !declinedHashes.has(senderHashOf(sender.fromEmail)) &&
        !fromBots.some((value) =>
          fromMatches(value, sender.fromEmail, sender.fromName)
        )
    )
    .toSorted((left, right) => right.count - left.count)
    .slice(0, SUGGESTIONS_SHOWN)
}

/** "No" to a suggested bot is kept for the sender, so it is never offered again, on Home or in their mail. */
export const declineBotSuggestion = async (
  userId: string,
  fromEmail: string
) => {
  await db
    .insert(declinedBotSuggestions)
    .values({ senderHash: senderHashOf(fromEmail), userId })
    .onConflictDoNothing()
  await announceChange(userId, ['today', 'mail'])
}

const CLEANUP_EVERY_DAYS = 6

/** Once a week, on Sunday after the morning hour (`MORNING_HOUR`), one card offers to unsubscribe from everything unopened. `cleanupCheckedAt` is set before looking, so a week with nothing to offer is not looked at again every minute. */
export const offerCleanup = async (
  settings: typeof userSettings.$inferSelect
) => {
  const { userId } = settings
  const clock = localClock(settings.timezone)
  const weekday = new Date(`${clock.date}T12:00:00Z`).getUTCDay()
  if (
    weekday !== WEEKDAY_SUNDAY ||
    clock.hour < MORNING_HOUR ||
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
        unsubscribeMessage(userId, messageId, 'list')
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
const CLEAR_OUT_CAP = 50_000
const SENDER_SAMPLE = 600
/** Header reads at once: Gmail allows 250 quota units a second per user, five per read. */
const SAMPLE_CONCURRENCY = 10
const SENDERS_PER_QUERY = 20
/** Each run gets its own label under it (`Fewmail/Cleared/2026-11-15-140327`, UTC), so Undo brings back that run only. */
const CLEARED_LABEL = 'Fewmail/Cleared'
/** Digits and hyphens only: Gmail search finds a label by its name with each slash turned into a hyphen. */
export const CLEAR_OUT_RUN = /^\d{4}-\d{2}-\d{2}-\d{6}$/u
const runLabelOf = (run: string) => `${CLEARED_LABEL}/${run}`
const labelQueryOf = (name: string) =>
  `label:${name.toLowerCase().replaceAll('/', '-')}`

const ownedMailboxes = (userId: string) =>
  db.select().from(mailboxes).where(eq(mailboxes.userId, userId))

type Headers = Awaited<ReturnType<typeof getMessageHeaders>>

/** A list as the scan showed it: the run leaves exactly these, never lists it finds on its own. */
interface ClearOutList {
  fromEmail: string
  gmailId: string
  listId: string | null
  mailboxId: string
}

const listTerm = ({ fromEmail, listId }: Omit<ClearOutList, 'gmailId'>) =>
  listId ? `list:${listLabelOf(listId)}` : `from:${fromEmail}`

const listsQuery = (terms: string[]) => `${INBOX_QUERY} {${terms.join(' ')}}`

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
  const byList = Map.groupBy(sample, ({ from, listId }) => listId ?? from.email)
  return [...byList.values()].flatMap((mail) => {
    const [newest] = mail
    return newest &&
      mail.length >= MIN_UNOPENED &&
      mail.every(({ isUnread }) => isUnread)
      ? [
          {
            count: mail.length,
            fromEmail: newest.from.email,
            fromName: newest.from.name,
            gmailId: newest.gmailId,
            listId: newest.listId,
            mailboxId: mailbox.id,
          },
        ]
      : []
  })
}

const sendersInboxIds = async (mailbox: Mailbox, terms: string[]) => {
  const chunks = Array.from(
    { length: Math.ceil(terms.length / SENDERS_PER_QUERY) },
    (_, index) =>
      terms.slice(index * SENDERS_PER_QUERY, (index + 1) * SENDERS_PER_QUERY)
  )
  const pages = await Promise.all(
    chunks.map((chunk) =>
      listMessageIds(mailbox, listsQuery(chunk), CLEAR_OUT_CAP)
    )
  )
  return pages.flat()
}

const groupIds = (
  mailbox: Mailbox,
  group: ClearOutGroup,
  listTerms: string[]
) =>
  group === 'lists'
    ? sendersInboxIds(mailbox, listTerms)
    : listMessageIds(mailbox, CLEAR_OUT_QUERIES[group], CLEAR_OUT_CAP)

const scanMailbox = async (mailbox: Mailbox) => {
  const inbox = await listMessageIds(mailbox, INBOX_QUERY, CLEAR_OUT_CAP)
  const senders = await unopenedListSenders(mailbox, inbox)
  const groups = await Promise.all(
    CLEAR_OUT_GROUPS.map(
      async (group) =>
        new Set(await groupIds(mailbox, group, senders.map(listTerm)))
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
  const senders = scans.flatMap(({ senders: found }) => found)
  return {
    inbox: scans.reduce((sum, { inbox }) => sum + inbox.length, 0),
    isCapped: scans.some(({ inbox }) => inbox.length >= CLEAR_OUT_CAP),
    overlaps: [...overlaps.values()],
    searches: {
      ...CLEAR_OUT_QUERIES,
      lists: listsQuery([...new Set(senders.map(listTerm))]),
    } satisfies Record<ClearOutGroup, string>,
    senders: namedLists(senders).toSorted(
      (left, right) => right.count - left.count
    ),
  }
}

/** Leaves each list through the one email kept of it, the same path as any unsubscribe. */
const leaveLists = async (
  userId: string,
  mailbox: Mailbox,
  senders: ClearOutList[]
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
  groups: ClearOutGroup[],
  lists: ClearOutList[],
  run: string
) => {
  const leaving = groups.includes('lists')
    ? lists.filter(({ mailboxId }) => mailboxId === mailbox.id)
    : []
  const matched = await Promise.all(
    groups.map((group) => groupIds(mailbox, group, leaving.map(listTerm)))
  )
  const ids = [...new Set(matched.flat())]
  if (ids.length > 0) {
    await findOrCreateLabel(mailbox, CLEARED_LABEL)
    const label = await findOrCreateLabel(mailbox, runLabelOf(run))
    await modifyMessages(mailbox, ids, { add: [label.id], remove: ['INBOX'] })
  }
  const unsubscribed = await leaveLists(userId, mailbox, leaving)
  return { cleared: ids.length, unsubscribed }
}

/**
 * Archives the chosen groups under this run's label, so `undoClearOut` brings back this run and nothing earlier, and
 * leaves only the `lists` the scan showed. A mailbox Gmail refused does not stop the others: `failed` says so, and
 * what moved before the refusal is under the label too.
 */
export const runClearOut = async (
  userId: string,
  groups: ClearOutGroup[],
  lists: ClearOutList[]
) => {
  const owned = await ownedMailboxes(userId)
  const run = new Date()
    .toISOString()
    .slice(0, 19)
    .replace('T', '-')
    .replaceAll(':', '')
  const results = await Promise.all(
    owned.map(async (mailbox) => {
      const cleared = await Result.tryPromise(() =>
        clearMailbox(userId, mailbox, groups, lists, run)
      )
      if (cleared.isErr()) {
        logError('clear-out failed', cleared.error.cause)
        return null
      }
      return cleared.value
    })
  )
  await announceChange(userId, MAIL_TOPICS)
  const done = results.filter((result) => result !== null)
  return {
    cleared: done.reduce((sum, { cleared }) => sum + cleared, 0),
    failed: done.length < results.length,
    run,
    unsubscribed: done.reduce((sum, { unsubscribed }) => sum + unsubscribed, 0),
  }
}

/** Brings back one run, the latest unless `run` names it, and drops its label. Unsubscribes stay: a list once left cannot be rejoined from here. */
export const undoClearOut = async (userId: string, run?: string) => {
  const owned = await ownedMailboxes(userId)
  const labelled = await Promise.all(
    owned.map(async (mailbox) => {
      const labels = await listLabels(mailbox)
      return {
        labels: labels.filter(({ name }) =>
          name.startsWith(`${CLEARED_LABEL}/`)
        ),
        mailbox,
      }
    })
  )
  const name = run
    ? runLabelOf(run)
    : labelled
        .flatMap(({ labels }) => labels.map((label) => label.name))
        .toSorted()
        .at(-1)
  const restored = await Promise.all(
    labelled.map(async ({ labels, mailbox }) => {
      const label = labels.find((each) => each.name === name)
      if (!label) {
        return 0
      }
      const ids = await listMessageIds(
        mailbox,
        labelQueryOf(label.name),
        CLEAR_OUT_CAP
      )
      await modifyMessages(mailbox, ids, {
        add: ['INBOX'],
        remove: [label.id],
      })
      await deleteLabel(mailbox, label.id)
      return ids.length
    })
  )
  await announceChange(userId, MAIL_TOPICS)
  return { restored: restored.reduce((sum, count) => sum + count, 0) }
}
