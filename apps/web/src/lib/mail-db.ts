import type { RouterOutputs } from '@fewmail/api/router'
import {
  parseLoadSubsetOptions,
  queryCollectionOptions,
} from '@tanstack/query-db-collection'
import { createCollection } from '@tanstack/react-db'

import { client, orpc } from './orpc'
import { queryClient } from './query-client'

export const MAIL_LISTS = [
  'inbox',
  'important',
  'needs_reply',
  'quiet',
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

// Keys sit under `orpc.mail.key()` so every existing mail invalidation (and the live stream) refreshes them too.
const [mailKey] = orpc.mail.key()

/** Every list of a mailbox in one collection, so switching tabs and acting on mail never waits for the network. */
const createMailRows = (mailboxId: string | undefined) =>
  createCollection(
    queryCollectionOptions({
      getKey: (row: MailRow) => row.key,
      id: `mail-rows:${mailboxId ?? 'all'}`,
      queryClient,
      queryFn: async () => {
        const lists = await Promise.all(
          MAIL_LISTS.map(async (list) => {
            const rows = await client.mail.list({ filter: list, mailboxId })
            return rows.map((row) => ({
              ...row,
              key: `${list}:${row.message.id}`,
              list,
            }))
          })
        )
        return lists.flat()
      },
      queryKey: [[...mailKey, 'rows'], mailboxId ?? null],
    })
  )

const mailRowsByMailbox = new Map<string, ReturnType<typeof createMailRows>>()

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

const threadKey = (threadId?: string) =>
  threadId ? [[...mailKey, 'thread'], threadId] : [[...mailKey, 'thread']]

/** The reader's person panel asks next, so its answer is on the way before the thread renders. */
const fetchThread = async (threadId: string): Promise<Thread[]> => {
  const thread = await client.mail.thread({ threadId })
  const sender = thread.messages.findLast(({ message }) => !message.isFromMe)
  const plan = queryClient.getQueryData(orpc.me.queryKey())?.plan.kind
  if (sender && plan && plan !== 'free') {
    void queryClient.prefetchQuery(
      orpc.person.queryOptions({ input: { email: sender.message.fromEmail } })
    )
  }
  return [{ ...thread, threadId }]
}

/** Loaded one thread at a time as a reader asks for it; `prefetchThread` fills the same cache entry ahead of the click. */
export const threads = createCollection(
  queryCollectionOptions({
    getKey: (thread: Thread) => thread.threadId,
    id: 'threads',
    queryClient,
    queryFn: ({ queryKey: [, threadId] }) =>
      typeof threadId === 'string' ? fetchThread(threadId) : [],
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

const rowsOfThread = (threadId: string) =>
  [...mailRowsByMailbox.values()].map((rows) => ({
    keys: [...rows.values()]
      .filter((row) => row.message.threadId === threadId)
      .map((row) => row.key),
    rows,
  }))

/** Takes a thread out of every list at once; the server's answer (or a refetch after a failure) settles it. */
export const hideThread = (threadId: string) => {
  for (const { keys, rows } of rowsOfThread(threadId)) {
    if (keys.length > 0) {
      void rows.utils.writeDelete(keys)
    }
  }
}

export const showThreadRead = (threadId: string) => {
  const thread = threads.get(threadId)
  if (thread) {
    void threads.utils.writeUpdate({
      messages: thread.messages.map((entry) => ({
        ...entry,
        message: { ...entry.message, isUnread: false },
      })),
      threadId,
    })
  }
  for (const { keys, rows } of rowsOfThread(threadId)) {
    void rows.utils.writeUpdate(
      keys.flatMap((key) => {
        const row = rows.get(key)
        return row
          ? [{ key, message: { ...row.message, isUnread: false } }]
          : []
      })
    )
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
