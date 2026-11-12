import { db } from '@fewmail/db'
import type { messages } from '@fewmail/db/schema'
import { senderReports, unsubscribes } from '@fewmail/db/schema'
import { messages as dictionaries } from '@fewmail/shared/i18n'
import { subDays } from 'date-fns'
import { and, eq, inArray, isNull, lt, notExists, sql } from 'drizzle-orm'

import { senderHashOf } from '../lib/keyed-hash'
import { getSettings } from './settings'
import { moveToSpam } from './thread-labels'

type Message = typeof messages.$inferSelect

/** Senders get time to process an unsubscribe (CAN-SPAM allows 10 business days). */
const GRACE_DAYS = 14
/** A sender is a known zombie once this many people saw mail after unsubscribing… */
const MIN_IGNORED = 3
/** …and they are at least this share of everyone who unsubscribed from it. */
const IGNORED_SHARE = 0.5

export const recordUnsubscribe = (userId: string, fromEmail: string) =>
  db
    .insert(unsubscribes)
    .values({ senderHash: senderHashOf(fromEmail), userId })
    .onConflictDoNothing()

export const zombieStats = async (fromEmail: string) => {
  const [row] = await db
    .select({
      ignored: sql<number>`count(*) filter (where ${unsubscribes.ignoredAt} is not null)::int`,
      total: sql<number>`count(*)::int`,
    })
    .from(unsubscribes)
    .where(eq(unsubscribes.senderHash, senderHashOf(fromEmail)))
  const ignored = row?.ignored ?? 0
  const total = row?.total ?? 0
  return {
    ignored,
    isZombie:
      ignored >= MIN_IGNORED && ignored / Math.max(total, 1) >= IGNORED_SHARE,
    share: total > 0 ? ignored / total : 0,
    total,
  }
}

/** Mail from a sender the user unsubscribed from long ago goes to spam, and counts against the sender for everyone — unless the user marked it not spam since. */
export const catchZombies = async (userId: string, incoming: Message[]) => {
  const inbound = incoming.filter((message) => !message.isFromMe)
  if (inbound.length === 0) {
    return new Set<string>()
  }
  const hashes = [
    ...new Set(inbound.map(({ fromEmail }) => senderHashOf(fromEmail))),
  ]
  const overdue = await db
    .select()
    .from(unsubscribes)
    .where(
      and(
        eq(unsubscribes.userId, userId),
        inArray(unsubscribes.senderHash, hashes),
        lt(unsubscribes.createdAt, subDays(new Date(), GRACE_DAYS)),
        notExists(
          db
            .select({ id: senderReports.id })
            .from(senderReports)
            .where(
              and(
                eq(senderReports.userId, userId),
                eq(senderReports.senderHash, unsubscribes.senderHash),
                eq(senderReports.verdict, 'not_spam')
              )
            )
        )
      )
    )
  if (overdue.length === 0) {
    return new Set<string>()
  }
  const overdueHashes = new Set(overdue.map(({ senderHash }) => senderHash))
  const settings = await getSettings(userId)
  const t = dictionaries[settings?.language ?? 'en']
  const moved = new Set<string>()

  await Promise.all(
    inbound
      .filter((message) => overdueHashes.has(senderHashOf(message.fromEmail)))
      .map(async (message) => {
        moved.add(message.id)
        await moveToSpam(userId, message, t.zombie.reason, t)
      })
  )
  await db
    .update(unsubscribes)
    .set({ ignoredAt: new Date() })
    .where(
      and(
        eq(unsubscribes.userId, userId),
        inArray(unsubscribes.senderHash, [...overdueHashes]),
        isNull(unsubscribes.ignoredAt)
      )
    )
  return moved
}
