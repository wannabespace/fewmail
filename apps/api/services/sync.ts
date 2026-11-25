import { db } from '@fewmail/db'
import { actions, analyses, mailboxes, messages } from '@fewmail/db/schema'
import { ANALYZE_WINDOW_DAYS } from '@fewmail/shared/agent'
import { Result } from 'better-result'
import { max, subDays, subMinutes, subMonths } from 'date-fns'
import {
  and,
  arrayContains,
  desc,
  eq,
  gt,
  gte,
  inArray,
  isNull,
  lt,
  notExists,
  notInArray,
  or,
  sql,
} from 'drizzle-orm'
import { alias } from 'drizzle-orm/pg-core'

import { inBatches } from '../lib/batches'
import { localClock, previousDay } from '../lib/clock'
import {
  getProfile,
  isMissing,
  listHistory,
  listMessageIds,
  listThreadMessageIds,
} from '../lib/gmail'
import { announceChange, MAIL_TOPICS } from '../lib/live'
import { logError } from '../lib/log'
import { capture } from '../lib/posthog'
import { expectRow } from '../lib/rows'
import { analyzeMessage, recordNewsletter, retireStaleActions } from './agent'
import { introduceUser } from './bot-chat'
import { measureBulk } from './bulk'
import { trackCommitments } from './commitments'
import { writeDigests } from './home'
import { listMailboxes, watchStorage } from './mailboxes'
import { emailAllowance } from './plan'
import { writeReadingIssue } from './reading'
import { assessRisks } from './risk'
import { watchSentMail } from './sent-mail'
import { getSettings } from './settings'
import { applySpamShield } from './spam'
import { forget, insertMessages } from './stored-mail'
import { catchZombies, recordListReaders } from './zombies'

const INITIAL_INBOX_QUERY = 'in:inbox newer_than:3d'
const INITIAL_INBOX_LIMIT = 60
export const FIRST_ISSUE_DAYS = 7
// A day more than the issues: the oldest local day can start before Gmail's `newer_than` cut.
const FIRST_WEEK_QUERY = `unsubscribe newer_than:${FIRST_ISSUE_DAYS + 1}d`
export const FIRST_WEEK_LIMIT = 100
const VOICE_SAMPLE_QUERY = 'in:sent newer_than:60d'
const VOICE_SAMPLE_LIMIT = 15
const ANALYZE_CONCURRENCY = 4
export const HELD_MONTHS = 3
const HELD_STEP_DAYS = 7
const HELD_STEP_LIMIT = 5000
/** A sync that died without releasing its claim (a crash, a deploy) is taken over after this. */
const SYNC_CLAIM_MINUTES = 15

const seconds = (date: Date) => Math.floor(date.getTime() / 1000)

type Mailbox = typeof mailboxes.$inferSelect
type Message = typeof messages.$inferSelect

const signInMailbox = (userId: string) =>
  and(eq(mailboxes.userId, userId), isNull(mailboxes.googleAccountId))

export const ensureMailbox = async (userId: string) => {
  const [existing] = await db
    .select()
    .from(mailboxes)
    .where(signInMailbox(userId))
  if (existing) {
    return existing
  }
  const profile = await getProfile({ refreshToken: null, userId })
  const [created] = await db
    .insert(mailboxes)
    .values({ email: profile.emailAddress, userId })
    .onConflictDoNothing()
    .returning()
  if (created) {
    return created
  }
  const [raced] = await db.select().from(mailboxes).where(signInMailbox(userId))
  return expectRow(raced)
}

const newMessageIds = async (mailbox: Mailbox) => {
  const { historyId: since } = mailbox
  if (since) {
    const history = await Result.tryPromise(() => listHistory(mailbox, since))
    if (history.isOk()) {
      return { ...history.value, hasGap: false }
    }
    if (!isMissing(history.error.cause)) {
      throw history.error.cause
    }
  }

  const { historyId } = await getProfile(mailbox)
  const [inbox, sent] = await Promise.all([
    listMessageIds(mailbox, INITIAL_INBOX_QUERY, INITIAL_INBOX_LIMIT),
    listMessageIds(mailbox, VOICE_SAMPLE_QUERY, VOICE_SAMPLE_LIMIT),
  ])
  return {
    historyId,
    ids: [...new Set([...inbox, ...sent])],
    // Gmail forgot the history since the last sync (a mailbox turned off for over a week): `closeGap` catches it up.
    hasGap: since !== null,
    labelChanges: new Map<string, string[]>(),
  }
}

const later = alias(messages, 'later')

/**
 * A thread is judged once, by its latest email when that one is incoming; older ones in it are
 * context only. Only what this sync inserted is judged: history and context mail never is, and an
 * insert returns a row to one sync only, so parallel mailbox syncs never analyse an email twice.
 */
const analyzePending = async (userId: string, inserted: Message[]) => {
  if (inserted.length === 0) {
    return
  }
  const allowance = await emailAllowance(userId)
  const pending = await db
    .select({ address: mailboxes.email, message: messages })
    .from(messages)
    .innerJoin(mailboxes, eq(mailboxes.id, messages.mailboxId))
    .leftJoin(analyses, eq(analyses.messageId, messages.id))
    .where(
      and(
        eq(messages.userId, userId),
        inArray(
          messages.id,
          inserted.map(({ id }) => id)
        ),
        eq(messages.isFromMe, false),
        isNull(analyses.messageId),
        gte(messages.receivedAt, subDays(new Date(), ANALYZE_WINDOW_DAYS)),
        notExists(
          db
            .select({ id: actions.id })
            .from(actions)
            .where(eq(actions.messageId, messages.id))
        ),
        notExists(
          db
            .select({ id: later.id })
            .from(later)
            .where(
              and(
                eq(later.userId, userId),
                eq(later.threadId, messages.threadId),
                gt(later.receivedAt, messages.receivedAt)
              )
            )
        )
      )
    )

  // Mail between the user's own mailboxes is theirs, not a stranger's: Gmail marks it SENT only in the one that sent it.
  const mailboxList = await listMailboxes(userId)
  const own = new Set(mailboxList.map(({ email }) => email.toLowerCase()))
  await inBatches(
    pending.filter(({ message }) => !own.has(message.fromEmail.toLowerCase())),
    ANALYZE_CONCURRENCY,
    ({ address, message }) =>
      analyzeMessage(message, address, allowance).catch((error) =>
        logError(`analyze ${message.id} failed`, error)
      )
  )
}

/**
 * Order matters: risk and bulk facts are on the message before anything judges it, zombie and
 * spam moves win over bots, and the agent only sees what is left.
 */
const processIncoming = async (mailbox: Mailbox, inserted: Message[]) => {
  const { userId } = mailbox
  await assessRisks(userId, inserted)
  await measureBulk(userId, inserted)
  const zombies = await catchZombies(userId, inserted)
  await recordListReaders(userId, inserted)
  await applySpamShield(
    userId,
    inserted.filter((message) => !zombies.has(message.id))
  )
  await analyzePending(userId, inserted)
  await Promise.all(
    inserted
      .filter((message) => message.isFromMe)
      .map((message) => retireStaleActions(userId, message))
  )
  await Promise.all(
    inserted
      .filter((message) => message.isFromMe && mailbox.historyId)
      .map((message) =>
        watchSentMail(userId, {
          messageId: message.id,
          text: message.body,
          threadId: message.threadId,
        }).catch((error) => logError('follow-up watch failed', error))
      )
  )
  await trackCommitments(userId, inserted)
  await watchStorage(mailbox, inserted).catch((error) =>
    logError('storage watch failed', error)
  )
}

/**
 * Earlier mail of a thread Fewmail first sees now (started before sign-up, or archived) is stored
 * for reading and context only — never passed to `processIncoming`, so nothing acts on it.
 */
const completeThreads = async (mailbox: Mailbox, inserted: Message[]) => {
  const incoming = [
    ...new Set(
      inserted
        .filter((message) => !message.isFromMe)
        .map(({ threadId }) => threadId)
    ),
  ]
  if (incoming.length === 0) {
    return
  }
  const known = await db
    .select({ threadId: messages.threadId })
    .from(messages)
    .where(
      and(
        eq(messages.mailboxId, mailbox.id),
        inArray(messages.threadId, incoming)
      )
    )
  const stored = Map.groupBy(known, ({ threadId }) => threadId)
  const ids: string[] = []
  await inBatches(
    incoming.filter((threadId) => stored.get(threadId)?.length === 1),
    ANALYZE_CONCURRENCY,
    async (threadId) => {
      ids.push(...(await listThreadMessageIds(mailbox, threadId)))
    }
  )
  await insertMessages(mailbox, ids)
}

// The request goes in before the claim attempt: set after a failed claim, it could land once the holder already released and wait for the poll.
const claimSync = async (mailboxId: string) => {
  await db
    .update(mailboxes)
    .set({ syncRequested: true })
    .where(eq(mailboxes.id, mailboxId))
  const [claimed] = await db
    .update(mailboxes)
    .set({ syncRequested: false, syncStartedAt: new Date() })
    .where(
      and(
        eq(mailboxes.id, mailboxId),
        eq(mailboxes.enabled, true),
        or(
          isNull(mailboxes.syncStartedAt),
          lt(
            mailboxes.syncStartedAt,
            subMinutes(new Date(), SYNC_CLAIM_MINUTES)
          )
        )
      )
    )
    .returning()
  return claimed
}

/**
 * A new user's Reading starts with the week before sign-up: its newsletters anywhere in Gmail, judged by Jev alone and
 * left as they are, then one issue per day that had any.
 */
const writeFirstIssues = async (mailbox: Mailbox) => {
  const ids = await listMessageIds(mailbox, FIRST_WEEK_QUERY, FIRST_WEEK_LIMIT)
  const inserted = await insertMessages(mailbox, ids)
  await inBatches(
    inserted.filter(({ isFromMe }) => !isFromMe),
    ANALYZE_CONCURRENCY,
    (message) =>
      recordNewsletter(message, mailbox.email).catch((error) =>
        logError(`newsletter ${message.id} failed`, error)
      )
  )
  const settings = await getSettings(mailbox.userId)
  let day = localClock(settings?.timezone ?? 'UTC').date
  for (let left = FIRST_ISSUE_DAYS; left > 0; left -= 1) {
    day = previousDay(day)
    // oxlint-disable-next-line eslint/no-await-in-loop -- the newest day is written last, so it is the fresh issue Home shows
    await writeReadingIssue(mailbox.userId, day)
  }
  await announceChange(mailbox.userId, ['mail', 'reading'])
}

/** Takes the label off held mail Gmail no longer lists with it. */
const dropLabel = async (
  mailbox: Mailbox,
  label: 'INBOX' | 'UNREAD',
  query: string
) => {
  const listed = await listMessageIds(
    mailbox,
    `${query} after:${seconds(mailbox.heldSince) - 1}`,
    HELD_STEP_LIMIT
  )
  // A list cut at the limit says nothing about the mail past it.
  if (listed.length >= HELD_STEP_LIMIT) {
    return
  }
  await db
    .update(messages)
    .set({
      labelIds: sql`array_remove(${messages.labelIds}, ${label})`,
      ...(label === 'UNREAD' && { isUnread: false }),
    })
    .where(
      and(
        eq(messages.mailboxId, mailbox.id),
        gte(messages.receivedAt, mailbox.heldSince),
        arrayContains(messages.labelIds, [label]),
        notInArray(messages.gmailId, listed)
      )
    )
}

/**
 * Before the sync stores its own `fresh` mail, whose rows would hide the gap from a retry: the rest of the gap is for
 * reading only, never `processIncoming`, and what Gmail archived or read meanwhile follows.
 */
const closeGap = async (mailbox: Mailbox, fresh: string[]) => {
  const [newest] = await db
    .select({ receivedAt: messages.receivedAt })
    .from(messages)
    .where(eq(messages.mailboxId, mailbox.id))
    .orderBy(desc(messages.receivedAt))
    .limit(1)
  const missed = await listMessageIds(
    mailbox,
    `in:anywhere after:${seconds(newest?.receivedAt ?? mailbox.heldSince)}`,
    HELD_STEP_LIMIT
  )
  await insertMessages(
    mailbox,
    missed.filter((id) => !fresh.includes(id)),
    { keepsHtml: false }
  )
  await dropLabel(mailbox, 'INBOX', 'in:inbox')
  await dropLabel(mailbox, 'UNREAD', 'in:anywhere is:unread')
}

/** While another process syncs the same mailbox, leaves it a request to go again instead; a mailbox that is off is not read. */
export const syncMailbox = async ({ id }: Pick<Mailbox, 'id'>) => {
  const mailbox = await claimSync(id)
  if (!mailbox) {
    return
  }
  const synced = await Result.tryPromise(async () => {
    const { hasGap, historyId, ids, labelChanges } =
      await newMessageIds(mailbox)
    if (hasGap) {
      await closeGap(mailbox, ids)
    }
    const byLabels = Map.groupBy(labelChanges, ([, labelIds]) =>
      labelIds.toSorted().join(' ')
    )
    await Promise.all(
      [...byLabels].map(([joined, changes]) => {
        const labelIds = joined ? joined.split(' ') : []
        return db
          .update(messages)
          .set({ isUnread: labelIds.includes('UNREAD'), labelIds })
          .where(
            and(
              eq(messages.mailboxId, mailbox.id),
              inArray(
                messages.gmailId,
                changes.map(([gmailId]) => gmailId)
              )
            )
          )
      })
    )
    const inserted = await insertMessages(mailbox, ids)
    const hasChanges = inserted.length > 0 || labelChanges.size > 0
    const processed = await Result.tryPromise(async () => {
      await completeThreads(mailbox, inserted)
      if (hasChanges) {
        // 'today' too: Home says the agent is reading while processIncoming runs.
        await announceChange(mailbox.userId, ['mail', 'mailboxes', 'today'])
      }
      await processIncoming(mailbox, inserted)
    })
    if (processed.isErr()) {
      await forget(inserted)
      throw processed.error.cause
    }
    const [released] = await db
      .update(mailboxes)
      .set({
        historyId,
        lastSyncedAt: new Date(),
        syncError: null,
        syncStartedAt: null,
      })
      .where(eq(mailboxes.id, mailbox.id))
      .returning({ syncRequested: mailboxes.syncRequested })
    if (hasChanges || hasGap || !mailbox.lastSyncedAt || mailbox.syncError) {
      await announceChange(mailbox.userId, MAIL_TOPICS)
    }
    if (!mailbox.historyId) {
      capture(mailbox.userId, 'mailbox_first_synced', {
        added: Boolean(mailbox.googleAccountId),
        messages: inserted.length,
      })
    }
    if (!(mailbox.historyId || mailbox.googleAccountId)) {
      void writeFirstIssues(mailbox).catch((error) =>
        logError('first issues failed', error)
      )
      void introduceUser(mailbox).catch((error) =>
        logError('introduction failed', error)
      )
      void writeDigests(mailbox.userId).catch((error) =>
        logError('first digest failed', error)
      )
    }
    if (released?.syncRequested) {
      await syncMailbox(mailbox).catch((error) =>
        logError('requested sync failed', error)
      )
    }
  })
  if (synced.isErr()) {
    const error = synced.error.cause
    await db
      .update(mailboxes)
      .set({
        lastSyncedAt: new Date(),
        syncError: error instanceof Error ? error.message : String(error),
        syncStartedAt: null,
      })
      .where(eq(mailboxes.id, mailbox.id))
    if (!mailbox.syncError) {
      await announceChange(mailbox.userId, ['mailboxes'])
    }
    throw error
  }
}

/** One failing mailbox (a revoked grant) must not stop the others; its error is on the row. */
export const syncMailboxes = async (userId: string) => {
  await ensureMailbox(userId)
  const owned = await db
    .select({ id: mailboxes.id })
    .from(mailboxes)
    .where(eq(mailboxes.userId, userId))
  await Promise.allSettled(owned.map((mailbox) => syncMailbox(mailbox)))
}

/**
 * Stores a week of the mail before `heldSince` per call, back to `HELD_MONTHS` before the mailbox was added. Reading
 * only, never `processIncoming`; `heldSince` moves once the week is stored, so a run cut off is read again.
 */
export const holdEarlierMail = async (mailbox: Mailbox) => {
  const from = max([
    subMonths(mailbox.createdAt, HELD_MONTHS),
    subDays(mailbox.heldSince, HELD_STEP_DAYS),
  ])
  if (from >= mailbox.heldSince) {
    return
  }
  // A second of overlap keeps an email on the boundary from falling between two weeks; it is stored once either way.
  const ids = await listMessageIds(
    mailbox,
    `in:anywhere after:${seconds(from) - 1} before:${seconds(mailbox.heldSince)}`,
    HELD_STEP_LIMIT
  )
  await insertMessages(mailbox, ids, { keepsHtml: false })
  await db
    .update(mailboxes)
    .set({ heldSince: from })
    .where(eq(mailboxes.id, mailbox.id))
  await announceChange(mailbox.userId, ['mail'])
}
