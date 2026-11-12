import { db } from '@fewmail/db'
import {
  actions,
  commitments,
  messages,
  reminders,
  userSettings,
} from '@fewmail/db/schema'
import type { ReminderKind } from '@fewmail/shared/agent'
import { messages as dictionaries } from '@fewmail/shared/i18n'
import { addDays, addHours } from 'date-fns'
import { and, asc, desc, eq, gt, inArray, lte } from 'drizzle-orm'

import { localClock } from '../lib/clock'
import { GmailError } from '../lib/gmail'
import { announceChange } from '../lib/live'
import { NotFoundError } from './mail-errors'
import { getPlanInfo, hasAgent, hasAgentSql } from './plan'
import { getSettings } from './settings'
import { changeThreadLabels } from './thread-labels'

const pendingOn = (userId: string, threadId: string, kind: ReminderKind) =>
  and(
    eq(reminders.userId, userId),
    eq(reminders.threadId, threadId),
    eq(reminders.kind, kind),
    eq(reminders.status, 'pending')
  )

const cancelPending = (userId: string, threadId: string, kind: ReminderKind) =>
  db
    .update(reminders)
    .set({ status: 'canceled' })
    .where(pendingOn(userId, threadId, kind))

export const snoozeThread = async (
  userId: string,
  threadId: string,
  until: Date
) => {
  await cancelPending(userId, threadId, 'snooze')
  await changeThreadLabels(userId, threadId, { remove: ['INBOX'] })
  await db.insert(reminders).values({
    dueAt: until,
    kind: 'snooze',
    status: 'pending',
    threadId,
    userId,
  })
}

export const unsnoozeThread = async (userId: string, threadId: string) => {
  await cancelPending(userId, threadId, 'snooze')
  await changeThreadLabels(userId, threadId, { add: ['INBOX'] })
}

const insertFollowup = (userId: string, threadId: string, days: number) =>
  db.insert(reminders).values({
    dueAt: addDays(new Date(), days),
    kind: 'followup',
    since: new Date(),
    status: 'pending',
    threadId,
    userId,
  })

/** The user's own choice when sending: replaces whatever follow-up the thread had. */
export const scheduleFollowup = async (
  userId: string,
  threadId: string,
  days: number
) => {
  await cancelPending(userId, threadId, 'followup')
  await insertFollowup(userId, threadId, days)
}

/** Automatic: never replaces a pending follow-up, which may be the one the user chose when sending. */
export const watchForReply = async (
  userId: string,
  threadId: string,
  days: number
) => {
  const [pending] = await db
    .select({ id: reminders.id })
    .from(reminders)
    .where(pendingOn(userId, threadId, 'followup'))
    .limit(1)
  if (!pending) {
    await insertFollowup(userId, threadId, days)
  }
}

const AWAITING_SHOWN = 6

/** Sent mail the agent is watching for an answer that has not come yet, longest waiting first. */
export const awaitingReplies = async (userId: string) => {
  const watched = await db
    .select({ since: reminders.since, threadId: reminders.threadId })
    .from(reminders)
    .where(
      and(
        eq(reminders.userId, userId),
        eq(reminders.kind, 'followup'),
        eq(reminders.status, 'pending')
      )
    )
    .orderBy(asc(reminders.since))
    .limit(AWAITING_SHOWN)
  if (watched.length === 0) {
    return []
  }
  const sent = await db
    .select({
      receivedAt: messages.receivedAt,
      subject: messages.subject,
      threadId: messages.threadId,
      to: messages.to,
    })
    .from(messages)
    .where(
      and(
        eq(messages.userId, userId),
        eq(messages.isFromMe, true),
        inArray(
          messages.threadId,
          watched.map(({ threadId }) => threadId)
        )
      )
    )
    .orderBy(desc(messages.receivedAt))
  return watched.flatMap(({ threadId }) => {
    const last = sent.find((message) => message.threadId === threadId)
    return last ? [last] : []
  })
}

const hasReplySince = async (userId: string, threadId: string, since: Date) => {
  const [reply] = await db
    .select({ id: messages.id })
    .from(messages)
    .where(
      and(
        eq(messages.userId, userId),
        eq(messages.threadId, threadId),
        eq(messages.isFromMe, false),
        gt(messages.receivedAt, since)
      )
    )
    .limit(1)
  return !!reply
}

const resurface = (userId: string, threadId: string) =>
  changeThreadLabels(userId, threadId, { add: ['INBOX', 'UNREAD'] })

/** A reply already brought the thread back; waking it would mark it unread after the user answered. */
const wakeSnooze = async (reminder: typeof reminders.$inferSelect) => {
  if (
    await hasReplySince(reminder.userId, reminder.threadId, reminder.createdAt)
  ) {
    return 'canceled' as const
  }
  await resurface(reminder.userId, reminder.threadId)
  return 'done' as const
}

/** The mailbox was removed or the thread deleted in Gmail: retrying every minute would never succeed. */
const isGone = (error: unknown) =>
  error instanceof NotFoundError ||
  (error instanceof GmailError && error.status === 404)

const fireFollowup = async (reminder: typeof reminders.$inferSelect) => {
  if (
    await hasReplySince(
      reminder.userId,
      reminder.threadId,
      reminder.since ?? reminder.createdAt
    )
  ) {
    return 'canceled' as const
  }
  if (!hasAgent(await getPlanInfo(reminder.userId))) {
    await resurface(reminder.userId, reminder.threadId)
    return 'done' as const
  }
  const [lastSent] = await db
    .select()
    .from(messages)
    .where(
      and(
        eq(messages.userId, reminder.userId),
        eq(messages.threadId, reminder.threadId)
      )
    )
    .orderBy(desc(messages.receivedAt))
    .limit(1)
  const settings = await getSettings(reminder.userId)
  const t = dictionaries[settings?.language ?? 'en']
  await db.insert(actions).values({
    autonomous: false,
    kind: 'follow_up',
    messageId: lastSent?.id ?? null,
    reason: t.reminders.noReply,
    status: 'pending',
    threadId: reminder.threadId,
    title: t.reminders.followUp,
    userId: reminder.userId,
  })
  return 'done' as const
}

export const processDueReminders = async () => {
  const due = await db
    .select()
    .from(reminders)
    .where(
      and(eq(reminders.status, 'pending'), lte(reminders.dueAt, new Date()))
    )

  await Promise.all(
    due.map(async (reminder) => {
      const status = await (
        reminder.kind === 'snooze'
          ? wakeSnooze(reminder)
          : fireFollowup(reminder)
      ).catch((error: unknown) => {
        if (isGone(error)) {
          return 'canceled' as const
        }
        throw error
      })
      await db
        .update(reminders)
        .set({ status })
        .where(eq(reminders.id, reminder.id))
      await announceChange(reminder.userId)
    })
  )
}

export const snoozedThreadIds = async (userId: string) => {
  const rows = await db
    .select({ dueAt: reminders.dueAt, threadId: reminders.threadId })
    .from(reminders)
    .where(
      and(
        eq(reminders.userId, userId),
        eq(reminders.kind, 'snooze'),
        eq(reminders.status, 'pending')
      )
    )
  return new Map(rows.map(({ dueAt, threadId }) => [threadId, dueAt]))
}

const MORNING_HOUR = 8
const MAX_UTC_OFFSET_HOURS = 14

/** `dueAt` is a calendar date at UTC midnight; it is due from that date's morning where the user is. */
const isDueMorning = (dueAt: Date, timezone: string) => {
  const { date, hour } = localClock(timezone)
  const dueDate = dueAt.toISOString().slice(0, 10)
  return date > dueDate || (date === dueDate && hour >= MORNING_HOUR)
}

/** A promise surfaces on its due morning as a Today card; approving it closes the commitment. */
export const processDueCommitments = async () => {
  const candidates = await db
    .select({
      commitment: commitments,
      language: userSettings.language,
      timezone: userSettings.timezone,
    })
    .from(commitments)
    .leftJoin(userSettings, eq(userSettings.userId, commitments.userId))
    .where(
      and(
        eq(commitments.status, 'open'),
        lte(commitments.dueAt, addHours(new Date(), MAX_UTC_OFFSET_HOURS)),
        hasAgentSql(commitments.userId)
      )
    )
  await Promise.all(
    candidates
      .filter(({ commitment, timezone }) =>
        isDueMorning(commitment.dueAt, timezone ?? 'UTC')
      )
      .map(async ({ commitment, language }) => {
        // Claim before inserting: a failure after the insert must not surface it again next minute.
        const [claimed] = await db
          .update(commitments)
          .set({ status: 'reminded' })
          .where(
            and(
              eq(commitments.id, commitment.id),
              eq(commitments.status, 'open')
            )
          )
          .returning({ id: commitments.id })
        if (!claimed) {
          return
        }
        await db.insert(actions).values({
          autonomous: false,
          detail: commitment.promise,
          kind: 'commitment',
          messageId: commitment.messageId,
          payload: { commitmentId: commitment.id },
          reason: commitment.recipient ?? '',
          status: 'pending',
          threadId: commitment.threadId,
          title: dictionaries[language ?? 'en'].commitments.title,
          userId: commitment.userId,
        })
        await announceChange(commitment.userId)
      })
  )
}
