import type { mailboxes } from '@fewmail/db/schema'

import { inBatches } from '../lib/batches'
import {
  getMessageSummary,
  getThreadSummary,
  isMissing,
  listMessagePage,
} from '../lib/gmail'
import type { ParsedMessage } from '../lib/gmail'

type Mailbox = typeof mailboxes.$inferSelect

const OLDER_MAIL_CACHE_MS = 60_000
const READ_CONCURRENCY = 8
const MAX_PAGES_READ = 4
const PAGE_READ = 50

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

interface OlderList {
  isListed: (message: ParsedMessage) => boolean
  query: string
}

/** One page of emails as rows: a thread whose row is newer than `before` is listed already, held or live. */
const readOlderPage = async (
  mailbox: Mailbox,
  { isListed, query }: OlderList,
  before: Date,
  pageToken?: string
) => {
  const listed = await listMessagePage(mailbox, query, PAGE_READ, pageToken)
  const threads: ParsedMessage[][] = []
  await inBatches(
    [...new Set(listed.messages.map(({ threadId }) => threadId))],
    READ_CONCURRENCY,
    async (threadId) => {
      threads.push(await getThreadSummary(mailbox, threadId))
    }
  )
  const last = listed.messages.at(-1)?.id
  return {
    floor: listed.nextPageToken
      ? threads.flat().find(({ gmailId }) => gmailId === last)?.receivedAt
      : undefined,
    nextPageToken: listed.nextPageToken,
    threads: threads.flatMap((thread) => {
      // Gmail matches a thread by any of its emails, so its row can be an older email or none.
      const message = thread.findLast(isListed)
      return message && message.receivedAt < before
        ? [{ mailbox, message, thread }]
        : []
    }),
  }
}

/**
 * A list's threads from before the mailbox's held mail, newest first, each with the newest email `isListed` keeps (its
 * row), and `floor`: every thread whose row is from `floor` on is in, older ones are not promised (undefined when Gmail
 * has nothing older). Read live from Gmail, cached for a minute, never stored.
 */
export const listOlderThreads = (
  mailbox: Mailbox,
  list: OlderList,
  range: { after?: Date; before?: Date }
) => {
  const before =
    range.before && range.before < mailbox.heldSince
      ? range.before
      : mailbox.heldSince
  // Gmail's `before:` takes whole seconds: rounded down, it skipped emails from earlier in the cursor's own second.
  const query = [
    list.query,
    `before:${seconds(before) + 1}`,
    range.after && `after:${seconds(range.after)}`,
  ]
    .filter(Boolean)
    .join(' ')
  const pageList = { ...list, query }
  // Emails, not threads: `threads.list` orders by a thread's newest email, so a thread replied to today stood in for a
  // years-old row and the next page started past every thread between. A page that yields no row would end the list in
  // the web, so a few more are read.
  return cached(
    mailbox.userId,
    `${mailbox.id} ${query} ${before.getTime()}`,
    async () => {
      let page = await readOlderPage(mailbox, pageList, before)
      for (
        let left = MAX_PAGES_READ - 1;
        left > 0 && page.threads.length === 0 && page.nextPageToken;
        left -= 1
      ) {
        // oxlint-disable-next-line eslint/no-await-in-loop -- pages chain via nextPageToken
        page = await readOlderPage(
          mailbox,
          pageList,
          before,
          page.nextPageToken
        )
      }
      return { floor: page.floor, threads: page.threads }
    }
  )
}

/**
 * Threads snoozed in Gmail itself: the API has no label and no wake time for them, only the `in:snoozed` search.
 * Cached like the lists; a mailbox Gmail refuses counts as having none, so Snoozed and Archive still open.
 */
export const listSnoozedInGmail = (mailbox: Mailbox) =>
  cached(mailbox.userId, `${mailbox.id} in:snoozed`, async () => {
    const { messages } = await listMessagePage(mailbox, 'in:snoozed', 500)
    return messages.map(({ threadId }) => threadId)
  }).catch(() => [])

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
