import { db } from '@fewmail/db'
import {
  actions,
  analyses,
  boards,
  mailboxes,
  messages,
} from '@fewmail/db/schema'
import { ANALYZE_WINDOW_DAYS } from '@fewmail/shared/agent'
import { subDays, subMinutes } from 'date-fns'
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
  getMessage,
  getProfile,
  GmailError,
  listHistory,
  listMessageIds,
  listThreadMessageIds,
} from '../lib/gmail'
import { announceChange } from '../lib/live'
import { logError } from '../lib/log'
import { expectRow } from '../lib/rows'
import { analyzeMessage, retireStaleActions } from './agent'
import { collectEntries, collectForNewMail, isUnchanged } from './boards'
import { measureBulk } from './bulk'
import { searchMailboxes } from './mailboxes'
import { emailAllowance, getPlanInfo, hasAgent } from './plan'
import { assessRisks } from './risk'
import { watchSentMail } from './sent-mail'
import { applySimpleRules } from './simple-rules'
import { applySpamShield } from './spam'
import { advanceTasksFor } from './tasks'
import { catchZombies } from './zombies'

const INITIAL_INBOX_QUERY = 'in:inbox newer_than:3d'
const INITIAL_INBOX_LIMIT = 60
const VOICE_SAMPLE_QUERY = 'in:sent newer_than:60d'
const VOICE_SAMPLE_LIMIT = 15
const ANALYZE_CONCURRENCY = 4
const BOARD_HISTORY = 'newer_than:6m'
const BOARD_HISTORY_LIMIT = 300
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

/** Also an expired history id, when it comes from `listHistory`. */
const isMissing = (error: unknown) =>
  error instanceof GmailError && error.status === 404

const newMessageIds = async (mailbox: Mailbox) => {
  if (mailbox.historyId) {
    try {
      return await listHistory(mailbox, mailbox.historyId)
    } catch (error) {
      if (!isMissing(error)) {
        throw error
      }
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
      .filter((message) => message.isFromMe && mailbox.historyId)
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
  await advanceTasksFor(userId, [
    ...new Set(
      inserted
        .filter((message) => !message.isFromMe)
        .map(({ threadId }) => threadId)
    ),
  ]).catch((error) => logError('task advance failed', error))
}

/**
 * A failed sync keeps its history id, so the same mail comes back next time; forgetting what it
 * stored lets that mail be processed then instead of being skipped as known.
 */
const forget = async (inserted: Message[]) => {
  if (inserted.length > 0) {
    await db.delete(messages).where(
      inArray(
        messages.id,
        inserted.map(({ id }) => id)
      )
    )
  }
}

/** Only stores: mail found by search or for a board must never reach `processIncoming`. */
export const insertMessages = async (mailbox: Mailbox, ids: string[]) => {
  const known = ids.length
    ? await db
        .select({ gmailId: messages.gmailId })
        .from(messages)
        .where(
          and(
            eq(messages.mailboxId, mailbox.id),
            inArray(messages.gmailId, ids)
          )
        )
    : []
  const knownIds = new Set(known.map(({ gmailId }) => gmailId))

  const inserted: Message[] = []
  try {
    await inBatches(
      ids.filter((id) => !knownIds.has(id)),
      ANALYZE_CONCURRENCY,
      async (id) => {
        const parsed = await getMessage(mailbox, id).catch((error) => {
          if (isMissing(error)) {
            return null
          }
          throw error
        })
        if (!parsed || parsed.labelIds.includes('DRAFT')) {
          return
        }
        const rows = await db
          .insert(messages)
          .values({ ...parsed, mailboxId: mailbox.id, userId: mailbox.userId })
          .onConflictDoNothing()
          .returning()
        inserted.push(...rows)
      }
    )
  } catch (error) {
    await forget(inserted)
    throw error
  }
  return inserted
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

const claimSync = async (mailboxId: string) => {
  const [claimed] = await db
    .update(mailboxes)
    .set({ syncStartedAt: new Date() })
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

/** Does nothing while another process syncs the same mailbox. */
export const syncMailbox = async ({ id }: Pick<Mailbox, 'id'>) => {
  const mailbox = await claimSync(id)
  if (!mailbox) {
    return
  }
  try {
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
    try {
      await completeThreads(mailbox, inserted)
      if (hasChanges) {
        await announceChange(mailbox.userId)
      }
      await processIncoming(mailbox, inserted)
    } catch (error) {
      await forget(inserted)
      throw error
    }
    await db
      .update(mailboxes)
      .set({
        historyId,
        lastSyncedAt: new Date(),
        syncError: null,
        syncStartedAt: null,
      })
      .where(eq(mailboxes.id, mailbox.id))
    if (hasChanges || !mailbox.lastSyncedAt) {
      await announceChange(mailbox.userId)
    }
  } catch (error) {
    await db
      .update(mailboxes)
      .set({
        lastSyncedAt: new Date(),
        syncError: error instanceof Error ? error.message : String(error),
        syncStartedAt: null,
      })
      .where(eq(mailboxes.id, mailbox.id))
    await announceChange(mailbox.userId)
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

/** Pro: a new board starts with half a year of its mail, not only what arrives from now on. */
export const readBoardHistory = async (board: typeof boards.$inferSelect) => {
  const results = await searchMailboxes(
    board.userId,
    `(${board.gmailQuery}) ${BOARD_HISTORY}`,
    BOARD_HISTORY_LIMIT
  )
  const found = await Promise.all(
    results.map(async ({ ids, mailbox }) => {
      await insertMessages(mailbox, ids)
      return ids.length
        ? db
            .select()
            .from(messages)
            .where(
              and(
                eq(messages.mailboxId, mailbox.id),
                inArray(messages.gmailId, ids)
              )
            )
        : []
    })
  )
  await collectEntries(board, found.flat())
  if (!(await isUnchanged(board))) {
    return
  }
  await db
    .update(boards)
    .set({ historyReadAt: new Date() })
    .where(eq(boards.id, board.id))
  await announceChange(board.userId)
}
