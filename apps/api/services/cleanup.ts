import { db } from '@fewmail/db'
import { actions, messages, unsubscribes } from '@fewmail/db/schema'
import type { CleanupSender } from '@fewmail/shared/agent'
import { messages as dictionaries } from '@fewmail/shared/i18n'
import { subDays } from 'date-fns'
import { and, eq, gte, isNotNull, sql } from 'drizzle-orm'

import { localClock } from '../lib/clock'
import { unsubscribeOneClick } from '../lib/gmail'
import { senderHashOf } from '../lib/keyed-hash'
import { getSettings } from './settings'
import { changeThreadLabels } from './thread-labels'
import { recordUnsubscribe } from './zombies'

const LOOKBACK_DAYS = 30
const MIN_UNOPENED = 3
const MAX_SENDERS = 25
const WEEKDAY_SUNDAY = 0

/** Mailing lists the user got at least three times in a month and never opened. */
const unopenedSenders = async (userId: string): Promise<CleanupSender[]> => {
  const rows = await db
    .select({
      count: sql<number>`count(*)::int`,
      fromEmail: messages.fromEmail,
      fromName: sql<string | null>`max(${messages.fromName})`,
      messageId: sql<string>`(array_agg(${messages.id} order by ${messages.receivedAt} desc))[1]`,
      opened: sql<number>`count(*) filter (where not ${messages.isUnread})::int`,
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
    .groupBy(messages.fromEmail)
  const unsubscribedRows = await db
    .select({ senderHash: unsubscribes.senderHash })
    .from(unsubscribes)
    .where(eq(unsubscribes.userId, userId))
  const unsubscribed = new Set(
    unsubscribedRows.map(({ senderHash }) => senderHash)
  )
  return rows
    .filter(
      ({ count, fromEmail, opened }) =>
        count >= MIN_UNOPENED &&
        opened === 0 &&
        !unsubscribed.has(senderHashOf(fromEmail))
    )
    .toSorted((left, right) => right.count - left.count)
    .slice(0, MAX_SENDERS)
    .map(({ count, fromEmail, fromName, messageId }) => ({
      count,
      fromEmail,
      fromName,
      messageId,
    }))
}

/** Once a week, on Sunday after the brief hour, one card offers to unsubscribe from everything unopened. */
export const offerCleanup = async (userId: string) => {
  const settings = await getSettings(userId)
  if (!settings) {
    return
  }
  const clock = localClock(settings.timezone)
  const weekday = new Date(`${clock.date}T12:00:00Z`).getUTCDay()
  if (weekday !== WEEKDAY_SUNDAY || clock.hour < settings.briefHour) {
    return
  }
  const [recent] = await db
    .select({ id: actions.id })
    .from(actions)
    .where(
      and(
        eq(actions.userId, userId),
        eq(actions.kind, 'cleanup'),
        gte(actions.createdAt, subDays(new Date(), 6))
      )
    )
    .limit(1)
  if (recent) {
    return
  }
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
}

export const runCleanup = async (userId: string, senders: CleanupSender[]) => {
  await Promise.all(
    senders.map(async ({ fromEmail, messageId }) => {
      const [message] = await db
        .select()
        .from(messages)
        .where(and(eq(messages.id, messageId), eq(messages.userId, userId)))
      if (!message) {
        return
      }
      if (message.listUnsubscribe) {
        await unsubscribeOneClick(
          message.listUnsubscribe,
          message.listUnsubscribePost
        ).catch(() => false)
      }
      await recordUnsubscribe(userId, fromEmail)
      const threads = await db
        .selectDistinct({ threadId: messages.threadId })
        .from(messages)
        .where(
          and(eq(messages.userId, userId), eq(messages.fromEmail, fromEmail))
        )
      await Promise.all(
        threads.map(({ threadId }) =>
          changeThreadLabels(userId, threadId, {
            remove: ['INBOX', 'UNREAD'],
          }).catch(() => null)
        )
      )
    })
  )
}
