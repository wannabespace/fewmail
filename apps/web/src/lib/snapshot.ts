import { hashKey } from '@tanstack/react-query'
import type { QueryKey } from '@tanstack/react-query'
import { createIndexedDb, createIndexedDbStorage } from 'seitu/web'
import { z } from 'zod/mini'

import { mailRowsKey } from './mail-db'
import type { MailRow } from './mail-db'
import { orpc } from './orpc'
import { queryClient } from './query-client'

const SAVE_EVERY_MS = 3000
// Only what Mail opens on (Focused, Categories and Inbox read `inbox`); its other lists come with the first refetch.
const KEPT_LISTS = new Set<MailRow['list']>(['inbox', 'unread'])
const KEPT_ROWS_PER_LIST = 100

const keptKeys = (): QueryKey[] => [
  orpc.today.get.queryKey(),
  orpc.today.queue.key(),
  mailRowsKey(),
]

const db = createIndexedDb({
  name: 'fewmail',
  stores: {
    snapshot: createIndexedDbStorage({
      defaultValues: { last: null },
      schemas: {
        last: z.nullable(
          z.object({
            entries: z.array(
              z.object({ data: z.unknown(), queryKey: z.array(z.unknown()) })
            ),
            savedAt: z.number(),
            userId: z.string(),
          })
        ),
      },
    }),
  },
})
const { snapshot } = db.stores

const firstPagesOf = (rows: MailRow[]) => {
  const counts = new Map<string, number>()
  return rows.filter(({ list }) => {
    const count = counts.get(list) ?? 0
    counts.set(list, count + 1)
    return KEPT_LISTS.has(list) && count < KEPT_ROWS_PER_LIST
  })
}

const codesIn = (value: unknown): string[] => {
  if (Array.isArray(value)) {
    return value.flatMap(codesIn)
  }
  if (value === null || typeof value !== 'object' || value instanceof Date) {
    return []
  }
  return Object.entries(value).flatMap(([key, entry]) =>
    key === 'code' && typeof entry === 'string' ? [entry] : codesIn(entry)
  )
}

const masked = (value: unknown, codes: RegExp | null): unknown => {
  if (typeof value === 'string') {
    return codes
      ? value.replace(codes, (code) => '•'.repeat(code.length))
      : value
  }
  if (Array.isArray(value)) {
    return value.map((entry) => masked(entry, codes))
  }
  if (value === null || typeof value !== 'object' || value instanceof Date) {
    return value
  }
  return Object.fromEntries(
    Object.entries(value).map(([key, entry]) => {
      if (key === 'code') {
        return [key, null]
      }
      return [key, key === 'codes' ? [] : masked(entry, codes)]
    })
  )
}

const save = (userId: string) => {
  const mailHash = hashKey(mailRowsKey())
  const entries = keptKeys().flatMap((queryKey) => {
    const data = queryClient.getQueryData(queryKey)
    if (data === undefined) {
      return []
    }
    return [
      {
        data:
          hashKey(queryKey) === mailHash
            ? firstPagesOf(data as MailRow[])
            : data,
        queryKey: [...queryKey],
      },
    ]
  })
  // One-time codes never reach the disk, not even in another field (a subject, a summary): their rows keep their place
  // masked until the refetch brings them back.
  const found = codesIn(entries.map(({ data }) => data))
  const codes =
    found.length > 0
      ? new RegExp(
          found
            .map((code) =>
              code.replaceAll(/[$()*+.?[\\\]^{|}]/gu, String.raw`\$&`)
            )
            .join('|'),
          'gu'
        )
      : null
  return snapshot.set({
    last: {
      entries: entries.map((entry) => ({
        ...entry,
        data: masked(entry.data, codes),
      })),
      savedAt: Date.now(),
      userId,
    },
  })
}

let restored: Promise<void> | undefined

/**
 * Home and the inbox as this user last saw them, in IndexedDB, so a cold start shows them at once and refreshes
 * behind. Restored before any collection syncs (they read the cache as they start), marked stale so each refetches,
 * and only for the user who saved them; the snapshot follows every refetch of those keys after that.
 */
export const restoreSnapshot = (userId: string) => {
  restored ??= (async () => {
    const { last } = await snapshot.hydrate()
    if (last?.userId === userId) {
      for (const { data, queryKey } of last.entries) {
        if (queryClient.getQueryData(queryKey) === undefined) {
          queryClient.setQueryData(queryKey, data, { updatedAt: last.savedAt })
          void queryClient.invalidateQueries({
            exact: true,
            queryKey,
            refetchType: 'none',
          })
        }
      }
    }
    const kept = new Set(keptKeys().map(hashKey))
    let timer: ReturnType<typeof setTimeout> | undefined
    queryClient.getQueryCache().subscribe((event) => {
      if (
        event.type === 'updated' &&
        event.action.type === 'success' &&
        !event.action.manual &&
        kept.has(event.query.queryHash) &&
        !timer
      ) {
        timer = setTimeout(() => {
          timer = undefined
          void save(userId)
        }, SAVE_EVERY_MS)
      }
    })
  })()
  return restored
}

/** Signed out, nothing of the account stays on this device. */
export const clearSnapshot = () => snapshot.clear()
