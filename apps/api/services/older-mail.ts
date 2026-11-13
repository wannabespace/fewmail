import type { mailboxes } from '@fewmail/db/schema'

import { inBatches } from '../lib/batches'
import {
  getMessageSummary,
  getThreadSummary,
  isMissing,
  listThreadIds,
} from '../lib/gmail'
import type { ParsedMessage } from '../lib/gmail'

type Mailbox = typeof mailboxes.$inferSelect

const OLDER_MAIL_CACHE_MS = 60_000
const READ_CONCURRENCY = 8

/**
 * A live row's id is a version-8 UUID, which Postgres never generates, holding the mailbox (the first 48 bits of its
 * v7 id) and the Gmail id, so every procedure that takes a message id takes it as is (`ownMessage` stores it).
 */
export const liveMessageId = (mailboxId: string, gmailId: string) => {
  const mailbox = mailboxId.replaceAll('-', '').slice(0, 12)
  const gmail = gmailId.padStart(18, '0')
  return `${mailbox.slice(0, 8)}-${mailbox.slice(8)}-8${gmail.slice(0, 3)}-8${gmail.slice(3, 6)}-${gmail.slice(6)}`
}

export const parseLiveMessageId = (id: string) => {
  const hex = id.replaceAll('-', '')
  return hex[12] === '8'
    ? {
        gmailId: `${hex.slice(13, 16)}${hex.slice(17)}`.replace(/^0+/u, ''),
        mailboxPrefix: hex.slice(0, 12),
      }
    : null
}

type Cache = Map<string, { expiresAt: number; value: unknown }>

// Replaced, never cleared, on a change: a read still in flight then fills the dropped map, not the new one.
const caches = new Map<string, Cache>()

const cached = async <T>(
  userId: string,
  key: string,
  read: () => Promise<T>
) => {
  const cache: Cache = caches.get(userId) ?? new Map()
  caches.set(userId, cache)
  const now = Date.now()
  const hit = cache.get(key)
  if (hit && hit.expiresAt > now) {
    return hit.value as T
  }
  const value = await read()
  for (const [stale, { expiresAt }] of cache) {
    if (expiresAt <= now) {
      cache.delete(stale)
    }
  }
  cache.set(key, { expiresAt: now + OLDER_MAIL_CACHE_MS, value })
  return value
}

export const forgetOlderMail = (userId: string) => {
  caches.delete(userId)
}

const seconds = (date: Date) => Math.floor(date.getTime() / 1000)

/**
 * A list's threads from before the mailbox's held mail, newest first, each with the newest email `isListed` keeps (its
 * row). Read live from Gmail, cached for a minute, never stored.
 */
export const listOlderThreads = async (
  mailbox: Mailbox,
  list: { isListed: (message: ParsedMessage) => boolean; query: string },
  range: { after?: Date; before?: Date },
  max: number
) => {
  const before =
    range.before && range.before < mailbox.heldSince
      ? range.before
      : mailbox.heldSince
  const query = [
    list.query,
    `before:${seconds(before)}`,
    range.after && `after:${seconds(range.after)}`,
  ]
    .filter(Boolean)
    .join(' ')
  const threads = await cached(
    mailbox.userId,
    `${mailbox.id} ${query}`,
    async () => {
      const read: ParsedMessage[][] = []
      await inBatches(
        await listThreadIds(mailbox, query, max),
        READ_CONCURRENCY,
        async (threadId) => {
          read.push(await getThreadSummary(mailbox, threadId))
        }
      )
      return read
    }
  )
  // Gmail matches a thread by any of its emails: one whose row is held mail is listed from the database instead.
  return threads.flatMap((thread) => {
    const message = thread.findLast(list.isListed)
    return message && message.receivedAt < before
      ? [{ mailbox, message, thread }]
      : []
  })
}

/** Found mail Fewmail does not hold, read live and cached like the lists. */
export const readOlderMessages = async (mailbox: Mailbox, ids: string[]) => {
  const read: ParsedMessage[] = []
  await inBatches(ids, READ_CONCURRENCY, async (id) => {
    const message = await cached(mailbox.userId, `${mailbox.id} ${id}`, () =>
      getMessageSummary(mailbox, id).catch((error) => {
        if (isMissing(error)) {
          return null
        }
        throw error
      })
    )
    if (message) {
      read.push(message)
    }
  })
  return read.map((message) => ({ mailbox, message, thread: [message] }))
}
