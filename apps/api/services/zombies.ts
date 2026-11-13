import { db } from '@fewmail/db'
import type { messages } from '@fewmail/db/schema'
import { senderReports, unsubscribes } from '@fewmail/db/schema'
import { listLabelOf } from '@fewmail/shared/agent'
import { messages as dictionaries } from '@fewmail/shared/i18n'
import { subDays } from 'date-fns'
import { and, eq, inArray, isNull, lt, sql } from 'drizzle-orm'

import { keyedHash, senderHashOf } from '../lib/keyed-hash'
import { getSettings } from './settings'
import { moveToSpam } from './thread-labels'

type Message = typeof messages.$inferSelect

/** Senders get time to process an unsubscribe (CAN-SPAM allows 10 business days). */
const GRACE_DAYS = 14
/** A sender is a known zombie once this many people saw mail after unsubscribing… */
const MIN_IGNORED = 3
/** …and they are at least this share of everyone who unsubscribed from it. */
const IGNORED_SHARE = 0.5

/** What leaving a list is remembered by: its List-Id, or the sender for mail without one. */
export const listHashOf = ({
  fromEmail,
  listId,
}: Pick<Message, 'fromEmail' | 'listId'>) =>
  listId ? keyedHash(`list:${listLabelOf(listId)}`) : senderHashOf(fromEmail)

export const recordUnsubscribe = (userId: string, message: Message) =>
  db
    .insert(unsubscribes)
    .values({ senderHash: listHashOf(message), userId })
    .onConflictDoNothing()

export const zombieStats = async (
  message: Pick<Message, 'fromEmail' | 'listId'>
) => {
  const [row] = await db
    .select({
      ignored: sql<number>`count(*) filter (where ${unsubscribes.ignoredAt} is not null)::int`,
      total: sql<number>`count(*)::int`,
    })
    .from(unsubscribes)
    .where(eq(unsubscribes.senderHash, listHashOf(message)))
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

/** Mail from a list the user left long ago goes to spam, and counts against the list for everyone — unless the user marked its sender not spam. */
export const catchZombies = async (userId: string, incoming: Message[]) => {
  const inbound = incoming.filter((message) => !message.isFromMe)
  if (inbound.length === 0) {
    return new Set<string>()
  }
  const overdue = await db
    .select({ senderHash: unsubscribes.senderHash })
    .from(unsubscribes)
    .where(
      and(
        eq(unsubscribes.userId, userId),
        inArray(unsubscribes.senderHash, [...new Set(inbound.map(listHashOf))]),
        lt(unsubscribes.createdAt, subDays(new Date(), GRACE_DAYS))
      )
    )
  if (overdue.length === 0) {
    return new Set<string>()
  }
  const overdueHashes = new Set(overdue.map(({ senderHash }) => senderHash))
  const vouched = await db
    .select({ senderHash: senderReports.senderHash })
    .from(senderReports)
    .where(
      and(
        eq(senderReports.userId, userId),
        eq(senderReports.verdict, 'not_spam'),
        inArray(senderReports.senderHash, [
          ...new Set(inbound.map(({ fromEmail }) => senderHashOf(fromEmail))),
        ])
      )
    )
  const vouchedHashes = new Set(vouched.map(({ senderHash }) => senderHash))
  const zombies = inbound.filter(
    (message) =>
      overdueHashes.has(listHashOf(message)) &&
      !vouchedHashes.has(senderHashOf(message.fromEmail))
  )
  if (zombies.length === 0) {
    return new Set<string>()
  }
  const settings = await getSettings(userId)
  const t = dictionaries[settings?.language ?? 'en']

  await Promise.all(
    zombies.map((message) => moveToSpam(userId, message, t.zombie.reason, t))
  )
  await db
    .update(unsubscribes)
    .set({ ignoredAt: new Date() })
    .where(
      and(
        eq(unsubscribes.userId, userId),
        inArray(unsubscribes.senderHash, [...new Set(zombies.map(listHashOf))]),
        isNull(unsubscribes.ignoredAt)
      )
    )
  return new Set(zombies.map(({ id }) => id))
}
