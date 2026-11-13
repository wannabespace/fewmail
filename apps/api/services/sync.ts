import { db } from '@fewmail/db'
import {
  actions,
  analyses,
  boards,
  mailboxes,
  messages,
} from '@fewmail/db/schema'
import { ANALYZE_WINDOW_DAYS, isForwardToAgent } from '@fewmail/shared/agent'
import { Result } from 'better-result'
import { max, subDays, subMinutes, subMonths } from 'date-fns'
import {
  and,
  eq,
  gt,
  gte,
  inArray,
  isNull,
  lt,
  notExists,
  or,
} from 'drizzle-orm'
import { alias } from 'drizzle-orm/pg-core'

import { inBatches } from '../lib/batches'
import {
  getProfile,
  isMissing,
  listHistory,
  listMessageIds,
  listThreadMessageIds,
} from '../lib/gmail'
import { announceChange, MAIL_TOPICS } from '../lib/live'
import { logError } from '../lib/log'
import { expectRow } from '../lib/rows'
import { analyzeMessage, retireStaleActions } from './agent'
import {
  BOARD_HISTORY_LIMIT,
  collectEntries,
  collectForNewMail,
  collectMatching,
  isUnchanged,
} from './boards'
import { measureBulk } from './bulk'
import { searchMailboxes } from './mailboxes'
import { emailAllowance, getPlanInfo, hasAgent } from './plan'
import { assessRisks } from './risk'
import { watchSentMail } from './sent-mail'
import { applySimpleRules } from './simple-rules'
import { applySpamShield } from './spam'
import { forget, insertMessages, readMessages } from './stored-mail'
import { advanceTasksFor } from './tasks'
import { catchZombies } from './zombies'

const INITIAL_INBOX_QUERY = 'in:inbox newer_than:3d'
const INITIAL_INBOX_LIMIT = 60
const VOICE_SAMPLE_QUERY = 'in:sent newer_than:60d'
const VOICE_SAMPLE_LIMIT = 15
const ANALYZE_CONCURRENCY = 4
export const HELD_MONTHS = 3
const HELD_STEP_DAYS = 7
const HELD_STEP_LIMIT = 5000
/** A sync that died without releasing its claim (a crash, a deploy) is taken over after this. */
const SYNC_CLAIM_MINUTES = 15

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
      return history.value
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
  const { allowance, save } = await emailAllowance(userId)
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

  await inBatches(pending, ANALYZE_CONCURRENCY, ({ address, message }) =>
    analyzeMessage(message, address, allowance).catch((error) =>
      logError(`analyze ${message.id} failed`, error)
    )
  )
  await save()
}

/**
 * Order matters: risk and bulk facts are on the message before anything judges it, zombie and
 * spam moves win over rules, and the agent only sees what is left.
 */
type NewMailHandler = (userId: string, inserted: Message[]) => Promise<void>
const newMailHandlers: NewMailHandler[] = []

/** For agent features that import sync back through the chat (a cycle): the entry points register them. */
export const onNewMail = (handler: NewMailHandler) => {
  newMailHandlers.push(handler)
}

const processIncoming = async (mailbox: Mailbox, inserted: Message[]) => {
  const { userId } = mailbox
  await assessRisks(userId, inserted)
  await measureBulk(userId, inserted)
  const zombies = await catchZombies(userId, inserted)
  const spam = await applySpamShield(
    userId,
    inserted.filter((message) => !zombies.has(message.id))
  )
  await applySimpleRules(
    userId,
    inserted.filter(
      (message) => !zombies.has(message.id) && !spam.has(message.id)
    )
  )
  await analyzePending(userId, inserted)
  await Promise.all(
    inserted
      .filter((message) => message.isFromMe)
      .map((message) => retireStaleActions(userId, message))
  )
  await Promise.all(
    inserted
      .filter(
        (message) =>
          message.isFromMe && mailbox.historyId && !isForwardToAgent(message.to)
      )
      .map((message) =>
        watchSentMail(userId, {
          messageId: message.id,
          text: message.body,
          threadId: message.threadId,
        }).catch((error) => logError('follow-up watch failed', error))
      )
  )
  if (!hasAgent(await getPlanInfo(userId))) {
    return
  }
  await collectForNewMail(userId, inserted).catch((error) =>
    logError('board collection failed', error)
  )
  for (const handler of newMailHandlers) {
    // oxlint-disable-next-line eslint/no-await-in-loop -- handlers run in the order they registered
    await handler(userId, inserted)
  }
  await advanceTasksFor(userId, [
    ...new Set(
      inserted
        .filter((message) => !message.isFromMe)
        .map(({ threadId }) => threadId)
    ),
  ]).catch((error) => logError('task advance failed', error))
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

/** While another process syncs the same mailbox, leaves it a request to go again instead. */
export const syncMailbox = async ({ id }: Pick<Mailbox, 'id'>) => {
  const mailbox = await claimSync(id)
  if (!mailbox) {
    return
  }
  const synced = await Result.tryPromise(async () => {
    const { historyId, ids, labelChanges } = await newMessageIds(mailbox)
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
        await announceChange(mailbox.userId, ['mail', 'mailboxes'])
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
    if (hasChanges || !mailbox.lastSyncedAt || mailbox.syncError) {
      await announceChange(mailbox.userId, MAIL_TOPICS)
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

const seconds = (date: Date) => Math.floor(date.getTime() / 1000)

const gmailKey = (message: { gmailId: string; mailboxId: string }) =>
  `${message.mailboxId}:${message.gmailId}`

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

/** Pro: a new board starts with its period's mail, not only what arrives from now on; what Fewmail does not hold is read in memory. */
export const readBoardHistory = async (board: typeof boards.$inferSelect) => {
  const searchedAt = new Date()
  const results = await searchMailboxes(
    board.userId,
    `(${board.gmailQuery}) newer_than:${board.periodDays}d`,
    BOARD_HISTORY_LIMIT
  )
  const found = await Promise.all(
    results.map(({ ids, mailbox }) => readMessages(mailbox, ids))
  )
  const candidates = found.flat()
  if (!(await isUnchanged(board))) {
    return
  }
  await db
    .update(boards)
    .set({ historyFound: candidates.length })
    .where(eq(boards.id, board.id))
  await announceChange(board.userId, ['boards'])
  await collectEntries(board, candidates)
  if (!(await isUnchanged(board))) {
    return
  }
  const readAt = new Date()
  await db
    .update(boards)
    .set({ historyReadAt: readAt })
    .where(eq(boards.id, board.id))
  await announceChange(board.userId, ['boards', 'today'])
  // Only after `historyReadAt` is set: from then on `collectForNewMail` takes new mail, so nothing falls between the two.
  const read = new Set(candidates.map(gmailKey))
  const arrived = await db
    .select()
    .from(messages)
    .where(
      and(
        eq(messages.userId, board.userId),
        eq(messages.isFromMe, false),
        gte(messages.createdAt, searchedAt),
        lt(messages.createdAt, readAt)
      )
    )
  const missed = arrived.filter((message) => !read.has(gmailKey(message)))
  if (missed.length > 0) {
    await collectMatching(board, missed)
    await announceChange(board.userId, ['boards', 'today'])
  }
}
