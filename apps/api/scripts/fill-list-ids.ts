import { db } from '@fewmail/db'
import { mailboxes, messages, unsubscribes } from '@fewmail/db/schema'
import { subDays } from 'date-fns'
import { and, eq, gte, isNotNull, isNull } from 'drizzle-orm'

import { inBatches } from '../lib/batches'
import { GmailError, getMessageHeaders } from '../lib/gmail'
import { senderHashOf } from '../lib/keyed-hash'
import { logError } from '../lib/log'
import { listHashOf } from '../services/zombies'

type Mailbox = typeof mailboxes.$inferSelect

/** As far back as Subscriptions looks. */
const LOOKBACK_DAYS = 30
/** Gmail allows 250 quota units a second per user, five per read. */
const CONCURRENCY = 10

const fillMailbox = async (mailbox: Mailbox) => {
  const unfilled = await db
    .select({ gmailId: messages.gmailId, id: messages.id })
    .from(messages)
    .where(
      and(
        eq(messages.mailboxId, mailbox.id),
        isNotNull(messages.listUnsubscribe),
        isNull(messages.listId),
        gte(messages.receivedAt, subDays(new Date(), LOOKBACK_DAYS))
      )
    )
  await inBatches(unfilled, CONCURRENCY, async ({ gmailId, id }) => {
    const headers = await getMessageHeaders(mailbox, gmailId).catch(
      (error: unknown) => {
        if (error instanceof GmailError && error.status === 404) {
          return null
        }
        throw error
      }
    )
    if (headers?.listId) {
      await db
        .update(messages)
        .set({ listId: headers.listId })
        .where(eq(messages.id, id))
    }
  })
  return unfilled.length
}

/** An unsubscribe kept by sender moves to the sender's one list; a sender of several lists cannot tell which was left, so it is dropped. */
const rekeyUnsubscribes = async (userId: string) => {
  const [lists, kept] = await Promise.all([
    db
      .selectDistinct({
        fromEmail: messages.fromEmail,
        listId: messages.listId,
      })
      .from(messages)
      .where(and(eq(messages.userId, userId), isNotNull(messages.listId))),
    db.select().from(unsubscribes).where(eq(unsubscribes.userId, userId)),
  ])
  const bySender = Map.groupBy(lists, ({ fromEmail }) =>
    senderHashOf(fromEmail)
  )
  let moved = 0
  for (const row of kept) {
    const listHashes = new Set(bySender.get(row.senderHash)?.map(listHashOf))
    if (listHashes.size > 0) {
      // oxlint-disable-next-line eslint/no-await-in-loop -- a handful of rows per user
      await db.delete(unsubscribes).where(eq(unsubscribes.id, row.id))
      const [listHash] = listHashes
      if (listHashes.size === 1 && listHash) {
        // oxlint-disable-next-line eslint/no-await-in-loop -- a handful of rows per user
        await db
          .insert(unsubscribes)
          .values({ ...row, senderHash: listHash })
          .onConflictDoNothing()
      }
      moved += 1
    }
  }
  return moved
}

const owned = await db.select().from(mailboxes)
let filled = 0
for (const mailbox of owned) {
  // oxlint-disable-next-line eslint/no-await-in-loop -- one mailbox at a time keeps within Gmail's quota
  filled += await fillMailbox(mailbox).catch((error: unknown) => {
    logError('fill list ids failed', error)
    return 0
  })
}
let rekeyed = 0
for (const userId of new Set(owned.map((mailbox) => mailbox.userId))) {
  // oxlint-disable-next-line eslint/no-await-in-loop -- per user, after every mailbox is filled
  rekeyed += await rekeyUnsubscribes(userId)
}
console.log({ filled, mailboxes: owned.length, rekeyed })
process.exit(0)
