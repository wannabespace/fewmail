import { db } from '@fewmail/db'
import { actions, commitments, messages, reminders } from '@fewmail/db/schema'
import { messages as dictionaries } from '@fewmail/shared/i18n'
import { addDays } from 'date-fns'
import { and, desc, eq, gt, lte } from 'drizzle-orm'

import { announceChange } from '../lib/live'
import { getPlanInfo, hasAgent } from './plan'
import { getSettings } from './settings'
import { changeThreadLabels } from './thread-labels'

const cancelPending = (
  userId: string,
  threadId: string,
  kind: 'followup' | 'snooze'
) =>
  db
    .update(reminders)
    .set({ status: 'canceled' })
    .where(
      and(
        eq(reminders.userId, userId),
        eq(reminders.threadId, threadId),
        eq(reminders.kind, kind),
        eq(reminders.status, 'pending')
      )
    )

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

export const scheduleFollowup = async (
  userId: string,
  threadId: string,
  days: number
) => {
  await cancelPending(userId, threadId, 'followup')
  await db.insert(reminders).values({
    dueAt: addDays(new Date(), days),
    kind: 'followup',
    since: new Date(),
    status: 'pending',
    threadId,
    userId,
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
      const status =
        reminder.kind === 'snooze'
          ? await resurface(reminder.userId, reminder.threadId).then(
              () => 'done' as const
            )
          : await fireFollowup(reminder)
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

/** A promise surfaces on its due morning as a Today card; approving it closes the commitment. */
export const processDueCommitments = async () => {
  const due = await db
    .select()
    .from(commitments)
    .where(
      and(eq(commitments.status, 'open'), lte(commitments.dueAt, new Date()))
    )
  await Promise.all(
    due.map(async (commitment) => {
      const settings = await getSettings(commitment.userId)
      const t = dictionaries[settings?.language ?? 'en']
      await db.insert(actions).values({
        autonomous: false,
        detail: commitment.promise,
        kind: 'commitment',
        messageId: commitment.messageId,
        payload: { commitmentId: commitment.id },
        reason: commitment.recipient ?? '',
        status: 'pending',
        threadId: commitment.threadId,
        title: t.commitments.title,
        userId: commitment.userId,
      })
      await db
        .update(commitments)
        .set({ status: 'reminded' })
        .where(eq(commitments.id, commitment.id))
      await announceChange(commitment.userId)
    })
  )
}
