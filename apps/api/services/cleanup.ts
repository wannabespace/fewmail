import { db } from '@fewmail/db'
import {
  actions,
  messages,
  unsubscribes,
  userSettings,
} from '@fewmail/db/schema'
import type { CleanupSender } from '@fewmail/shared/agent'
import { messages as dictionaries } from '@fewmail/shared/i18n'
import { subDays } from 'date-fns'
import { and, eq, gte, isNotNull, sql } from 'drizzle-orm'

import { localClock } from '../lib/clock'
import { senderHashOf } from '../lib/keyed-hash'
import { announceChange } from '../lib/live'
import { logError } from '../lib/log'
import { unsubscribeMessage } from './thread-effects'

const LOOKBACK_DAYS = 30
const MIN_UNOPENED = 3
const MAX_SENDERS = 25
const WEEKDAY_SUNDAY = 0

/** Every mailing list that wrote in the last month and the user has not left, busiest first. */
export const listSubscriptions = async (userId: string) => {
  const rows = await db
    .select({
      count: sql<number>`count(*)::int`,
      fromEmail: messages.fromEmail,
      fromName: sql<string | null>`max(${messages.fromName})`.mapWith(
        messages.fromName
      ),
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

/** Once a week, on Sunday after the brief hour, one card offers to unsubscribe from everything unopened. `cleanupCheckedAt` is set before looking, so a week with nothing to offer is not looked at again every minute. */
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
      try {
        await unsubscribeMessage(userId, messageId, 'sender')
      } catch (error) {
        logError('cleanup unsubscribe failed', error)
      }
    })
  )
