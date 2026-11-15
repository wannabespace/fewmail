import type { RouterOutputs } from '@fewmail/api/router'
import {
  parseLoadSubsetOptions,
  queryCollectionOptions,
} from '@tanstack/query-db-collection'
import { createCollection } from '@tanstack/react-db'

import { client, orpc } from './orpc'
import { queryClient } from './query-client'
import { holdClicksUntilMove } from './still-pointer'

export const MAIL_LISTS = [
  'inbox',
  'unread',
  'pinned',
  'snoozed',
  'spam',
  'archive',
  'trash',
] as const

export type MailList = (typeof MAIL_LISTS)[number]

export type MailRow = RouterOutputs['mail']['list'][number] & {
  key: string
  list: MailList
}

export type Thread = RouterOutputs['mail']['thread'] & { threadId: string }

/** A failed first sync still sets `lastSyncedAt`, so only `hasSynced` tells an empty inbox from one not read yet. */
export const isReadingFirstTime = (mailboxes: { hasSynced: boolean }[]) =>
  mailboxes.every(({ hasSynced }) => !hasSynced)

// Keys sit under `orpc.mail.key()` so every existing mail invalidation (and the live stream) refreshes them too. Their
// second part must stay an object: `orpc.mail.key()` ends in `{}`, which never matches a string or null there.
const [mailKey] = orpc.mail.key()

const readPage = async (
  list: MailList,
  mailboxId: string | undefined,
  before?: Date
): Promise<MailRow[]> => {
  const rows = await client.mail.list({ before, filter: list, mailboxId })
  return rows.map((row) => ({
    ...row,
    key: `${list}:${row.message.id}`,
    list,
  }))
}

const oldestOf = (rows: MailRow[]) =>
  rows
    .map(({ message }) => message.receivedAt)
    .toSorted((left, right) => left.getTime() - right.getTime())[0]

const mailRowsByMailbox = new Map<string, ReturnType<typeof createMailRows>>()

/** Pages past the first stay through a refetch as the collection holds them now, acted-on rows included; only the first is read again. */
const keptOlderRows = (
  mailboxId: string | undefined,
  list: MailList,
  firstPage: MailRow[]
): MailRow[] => {
  const oldest = oldestOf(firstPage)
  const rows = mailRowsByMailbox.get(mailboxId ?? '')
  return [...(rows?.values() ?? [])].filter(
    (row) => row.list === list && (!oldest || row.message.receivedAt < oldest)
  )
}

/** Every list of a mailbox in one collection, so switching tabs and acting on mail never waits for the network. */
const createMailRows = (mailboxId: string | undefined) =>
  createCollection(
    queryCollectionOptions({
      getKey: (row: MailRow) => row.key,
      id: `mail-rows:${mailboxId ?? 'all'}`,
      queryClient,
      queryFn: async (): Promise<MailRow[]> => {
        const lists = await Promise.all(
          MAIL_LISTS.map(async (list) => {
            const firstPage = await readPage(list, mailboxId)
            return [...firstPage, ...keptOlderRows(mailboxId, list, firstPage)]
          })
        )
        return lists.flat()
      },
      queryKey: [[...mailKey, 'rows'], { mailboxId: mailboxId ?? null }],
    })
  )

export const mailRowsOf = (mailboxId?: string) => {
  const key = mailboxId ?? ''
  const existing = mailRowsByMailbox.get(key)
  if (existing) {
    return existing
  }
  const created = createMailRows(mailboxId)
  mailRowsByMailbox.set(key, created)
  return created
}

const endedLists = new Set<string>()

export const hasOlderRows = (mailboxId: string | undefined, list: MailList) =>
  !endedLists.has(`${mailboxId ?? ''}:${list}`)

/** The next page of a list after its oldest row; an empty page ends the list. */
export const loadOlderRows = async (
  mailboxId: string | undefined,
  list: MailList
) => {
  const rows = mailRowsOf(mailboxId)
  if (!hasOlderRows(mailboxId, list)) {
    return
  }
  const oldest = oldestOf([...rows.values()].filter((row) => row.list === list))
  const page = await readPage(list, mailboxId, oldest ?? new Date())
  const fresh = page.filter((row) => !rows.has(row.key))
  if (fresh.length === 0) {
    endedLists.add(`${mailboxId ?? ''}:${list}`)
    return
  }
  rows.utils.writeInsert(fresh)
}

const threadKey = (threadId?: string) =>
  threadId ? [[...mailKey, 'thread'], { threadId }] : [[...mailKey, 'thread']]

const fetchThread = async (threadId: string): Promise<Thread[]> => {
  const thread = await client.mail.thread({ threadId })
  return [{ ...thread, threadId }]
}

/** Loaded one thread at a time as a reader asks for it; `prefetchThread` fills the same cache entry ahead of the click. */
export const threads = createCollection(
  queryCollectionOptions({
    getKey: (thread: Thread) => thread.threadId,
    id: 'threads',
    queryClient,
    queryFn: ({ queryKey: [, key] }) => {
      const threadId = (key as { threadId?: string } | undefined)?.threadId
      return threadId ? fetchThread(threadId) : []
    },
    queryKey: (options) =>
      threadKey(
        parseLoadSubsetOptions(options).filters.find(
          ({ field, operator }) => field[0] === 'threadId' && operator === 'eq'
        )?.value as string | undefined
      ),
    syncMode: 'on-demand',
  })
)

export const prefetchThread = (threadId: string) =>
  queryClient.prefetchQuery({
    queryFn: () => fetchThread(threadId),
    queryKey: threadKey(threadId),
  })

const isPixel = (image: HTMLImageElement) =>
  ['width', 'height'].some((side) => {
    const size = image.getAttribute(side)
    return size !== null && Number(size) <= 2
  })

const warmedImages = new Set<string>()

/**
 * A pointer on a row loads the thread and the newest email's images, so the reader's frame takes them from the browser
 * cache. Tracking pixels wait for the open: a hover must never tell a sender the email was read. Spam keeps its images
 * hidden even when open (`HtmlBody`), so it loads none.
 */
export const warmThread = async (threadId: string) => {
  await prefetchThread(threadId)
  const [thread] = queryClient.getQueryData<Thread[]>(threadKey(threadId)) ?? []
  const latest = thread?.messages.at(-1)?.message
  const html = latest?.html
  if (!html || latest.labelIds.includes('SPAM')) {
    return
  }
  // A parsed document is inert: its images load only through the `Image` below.
  const { images } = new DOMParser().parseFromString(html, 'text/html')
  for (const image of images) {
    const src = image.getAttribute('src') ?? ''
    if (
      src.startsWith('https://') &&
      !isPixel(image) &&
      !warmedImages.has(src)
    ) {
      warmedImages.add(src)
      new Image().src = src
    }
  }
}

const rowsOfThread = (threadId: string) =>
  [...mailRowsByMailbox.values()].map((rows) => ({
    keys: [...rows.values()]
      .filter((row) => row.message.threadId === threadId)
      .map((row) => row.key),
    rows,
  }))

/** Takes a thread out of every list at once; the server's answer (or a refetch after a failure) settles it. */
export const hideThread = (threadId: string) => {
  holdClicksUntilMove()
  for (const { keys, rows } of rowsOfThread(threadId)) {
    if (keys.length > 0) {
      void rows.utils.writeDelete(keys)
    }
  }
}

export const showThreadRead = (threadId: string, isRead = true) => {
  const thread = threads.get(threadId)
  if (thread) {
    void threads.utils.writeUpdate({
      messages: thread.messages.map((entry) => ({
        ...entry,
        message: { ...entry.message, isUnread: !isRead },
      })),
      threadId,
    })
  }
  for (const { keys, rows } of rowsOfThread(threadId)) {
    void rows.utils.writeUpdate(
      keys.flatMap((key) => {
        const row = rows.get(key)
        return row
          ? [{ key, message: { ...row.message, isUnread: !isRead } }]
          : []
      })
    )
  }
}

const withStar = (labelIds: string[], pinned: boolean) =>
  pinned
    ? [...new Set([...labelIds, 'STARRED'])]
    : labelIds.filter((label) => label !== 'STARRED')

/** Flips the pin everywhere at once: the thread's rows, its Pinned row (only an inbox thread has one) and the open thread. */
export const showThreadPinned = (threadId: string, pinned: boolean) => {
  const thread = threads.get(threadId)
  if (thread) {
    void threads.utils.writeUpdate({
      messages: thread.messages.map((entry) => ({
        ...entry,
        message: {
          ...entry.message,
          labelIds: withStar(entry.message.labelIds, pinned),
        },
      })),
      threadId,
    })
  }
  for (const { keys, rows } of rowsOfThread(threadId)) {
    const found = keys.flatMap((key) => rows.get(key) ?? [])
    const listed = found.filter((row) => row.list !== 'pinned')
    void rows.utils.writeUpdate(
      listed.map((row) => ({
        key: row.key,
        message: { ...row.message, isPinned: pinned },
      }))
    )
    const inInbox = listed.find((row) => row.list === 'inbox')
    const inPinned = found.filter((row) => row.list === 'pinned')
    if (!pinned && inPinned.length > 0) {
      void rows.utils.writeDelete(inPinned.map((row) => row.key))
    }
    if (pinned && inPinned.length === 0 && inInbox) {
      void rows.utils.writeInsert({
        ...inInbox,
        key: `pinned:${inInbox.message.id}`,
        list: 'pinned',
        message: { ...inInbox.message, isPinned: true },
      })
    }
  }
}

export const threadOfMessage = (messageId: string) => {
  for (const rows of mailRowsByMailbox.values()) {
    for (const row of rows.values()) {
      if (row.message.id === messageId) {
        return row.message.threadId
      }
    }
  }
  for (const thread of threads.values()) {
    if (thread.messages.some(({ message }) => message.id === messageId)) {
      return thread.threadId
    }
  }
  return null
}
