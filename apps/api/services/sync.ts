import { db } from '@fewmail/db'
import {
  actions,
  analyses,
  mailboxes,
  messages,
  users,
} from '@fewmail/db/schema'
import { subDays } from 'date-fns'
import { and, eq, gte, inArray, isNull, notExists } from 'drizzle-orm'

import {
  getMessage,
  getProfile,
  GmailHistoryExpiredError,
  listHistory,
  listMessageIds,
} from '../lib/gmail'
import { expectRow } from '../lib/rows'
import { analyzeMessage } from './agent'
import { getPlanInfo, hasAgent } from './plan'
import { watchSentMail } from './reminders'
import { applySimpleRules } from './simple-rules'
import { applySpamShield } from './spam'

const INITIAL_INBOX_QUERY = 'in:inbox newer_than:3d'
const INITIAL_INBOX_LIMIT = 60
const VOICE_SAMPLE_QUERY = 'in:sent newer_than:60d'
const VOICE_SAMPLE_LIMIT = 15
const ANALYZE_CONCURRENCY = 4
/** Mail older than this is never sent to the model, so an upgrade does not pay for the whole backlog. */
const ANALYZE_WINDOW_DAYS = 3

type Mailbox = typeof mailboxes.$inferSelect

export const ensureMailbox = async (userId: string) => {
  const [existing] = await db
    .select()
    .from(mailboxes)
    .where(eq(mailboxes.userId, userId))
  if (existing) {
    return existing
  }
  const profile = await getProfile(userId)
  const [created] = await db
    .insert(mailboxes)
    .values({ email: profile.emailAddress, userId })
    .onConflictDoNothing()
    .returning()
  if (created) {
    return created
  }
  const [raced] = await db
    .select()
    .from(mailboxes)
    .where(eq(mailboxes.userId, userId))
  return expectRow(raced)
}

const newMessageIds = async (mailbox: Mailbox) => {
  if (mailbox.historyId) {
    try {
      return await listHistory(mailbox.userId, mailbox.historyId)
    } catch (error) {
      if (!(error instanceof GmailHistoryExpiredError)) {
        throw error
      }
    }
  }

  const { historyId } = await getProfile(mailbox.userId)
  const [inbox, sent] = await Promise.all([
    listMessageIds(mailbox.userId, INITIAL_INBOX_QUERY, INITIAL_INBOX_LIMIT),
    listMessageIds(mailbox.userId, VOICE_SAMPLE_QUERY, VOICE_SAMPLE_LIMIT),
  ])
  return {
    historyId,
    ids: [...new Set([...inbox, ...sent])],
    labelChanges: new Map<string, string[]>(),
  }
}

const inBatches = async <T>(
  items: T[],
  size: number,
  run: (item: T) => Promise<unknown>
) => {
  for (let index = 0; index < items.length; index += size) {
    // oxlint-disable-next-line eslint/no-await-in-loop -- batches cap concurrency
    await Promise.allSettled(items.slice(index, index + size).map(run))
  }
}

export const analyzePending = async (userId: string) => {
  const [user] = await db
    .select({ email: users.email })
    .from(users)
    .where(eq(users.id, userId))
  const pending = await db
    .select({ message: messages })
    .from(messages)
    .leftJoin(analyses, eq(analyses.messageId, messages.id))
    .where(
      and(
        eq(messages.userId, userId),
        eq(messages.isFromMe, false),
        isNull(analyses.messageId),
        gte(messages.receivedAt, subDays(new Date(), ANALYZE_WINDOW_DAYS)),
        notExists(
          db
            .select({ id: actions.id })
            .from(actions)
            .where(eq(actions.messageId, messages.id))
        )
      )
    )

  if (!user) {
    return
  }
  await inBatches(pending, ANALYZE_CONCURRENCY, ({ message }) =>
    analyzeMessage(message, user.email).catch((error) =>
      console.error(`analyze ${message.id} failed`, error)
    )
  )
}

export const syncMailbox = async (mailbox: Mailbox) => {
  try {
    const { historyId, ids, labelChanges } = await newMessageIds(mailbox)
    await Promise.all(
      [...labelChanges].map(([gmailId, labelIds]) =>
        db
          .update(messages)
          .set({ isUnread: labelIds.includes('UNREAD'), labelIds })
          .where(
            and(
              eq(messages.mailboxId, mailbox.id),
              eq(messages.gmailId, gmailId)
            )
          )
      )
    )
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

    const inserted: (typeof messages.$inferSelect)[] = []
    await inBatches(
      ids.filter((id) => !knownIds.has(id)),
      ANALYZE_CONCURRENCY,
      async (id) => {
        const parsed = await getMessage(mailbox.userId, id)
        if (parsed.labelIds.includes('DRAFT')) {
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

    await db
      .update(mailboxes)
      .set({ historyId, lastSyncedAt: new Date(), syncError: null })
      .where(eq(mailboxes.id, mailbox.id))

    const movedToSpam = await applySpamShield(mailbox.userId, inserted)
    await applySimpleRules(
      mailbox.userId,
      inserted.filter((message) => !movedToSpam.has(message.id))
    )
    if (hasAgent(await getPlanInfo(mailbox.userId))) {
      await analyzePending(mailbox.userId)
      await Promise.all(
        inserted
          .filter((message) => message.isFromMe && mailbox.historyId)
          .map((message) =>
            watchSentMail(mailbox.userId, message.threadId, message.body).catch(
              (error) => console.error('follow-up watch failed', error)
            )
          )
      )
    }
  } catch (error) {
    await db
      .update(mailboxes)
      .set({
        lastSyncedAt: new Date(),
        syncError: error instanceof Error ? error.message : String(error),
      })
      .where(eq(mailboxes.id, mailbox.id))
    throw error
  }
}
