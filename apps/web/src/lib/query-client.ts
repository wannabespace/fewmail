import { queryCollectionOptions } from '@tanstack/query-db-collection'
import {
  createCollection,
  createTransaction,
  useLiveQuery,
} from '@tanstack/react-db'
import type { Collection, UtilsRecord } from '@tanstack/react-db'
import type { EnsureQueryDataOptions, QueryKey } from '@tanstack/react-query'
import { MutationCache, QueryCache, QueryClient } from '@tanstack/react-query'

import { posthog } from './posthog'

declare module '@tanstack/react-query' {
  interface Register {
    mutationMeta: { event?: string }
  }
}

const DAY_MS = 86_400_000

/** An oRPC mutation's key starts with its procedure path; a custom `mutationFn` has none and names its event in `meta`. */
const eventOf = (key: QueryKey | undefined, meta?: { event?: string }) => {
  const [path] = key ?? []
  return meta?.event ?? (Array.isArray(path) ? path.join('.') : null)
}

/** Errors the queries got: a read that fails keeps what the page already shows. */
export const readErrors = new WeakSet<Error>()

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      gcTime: DAY_MS,
      retry: 0,
      staleTime: 30_000,
    },
  },
  mutationCache: new MutationCache({
    onSettled: (_data, error, _variables, _context, mutation) => {
      const event = eventOf(mutation.options.mutationKey, mutation.meta)
      if (event) {
        posthog.capture(event, {
          error: error && 'code' in error ? String(error.code) : undefined,
          success: !error,
        })
      }
    },
  }),
  queryCache: new QueryCache({ onError: (error) => readErrors.add(error) }),
})

/** For route loaders: only data never loaded holds the navigation; cached data renders at once and refreshes behind it. A failure is left to the page's own query. */
export const warmQuery = <Data, Key extends QueryKey>(
  options: EnsureQueryDataOptions<Data, Error, Data, Key>
) =>
  queryClient
    .ensureQueryData({ ...options, revalidateIfStale: true })
    .catch(() => null)

/**
 * Changes collections at once in a TanStack DB transaction that holds over every refetch until `settle` gets the
 * refetch after the server's answer. A direct write (`utils.writeDelete`) is overwritten by any refetch that lands
 * first, so a row acted on while an earlier action settles comes back and leaves again.
 */
export const showUntilSettled = (change: () => void) => {
  const settled = Promise.withResolvers<unknown>()
  createTransaction({ mutationFn: () => settled.promise }).mutate(change)
  return settled.resolve
}

export type Settle = ReturnType<typeof showUntilSettled>

/**
 * A server list as a TanStack DB collection under its oRPC procedure's `key()` (two long, so its router's invalidations
 * reach it, and never the procedure's own query, which holds rows without `rank`); `rank` keeps the server's order.
 */
export const listCollection = <Row extends object>({
  getKey,
  id,
  queryFn,
  queryKey,
}: {
  getKey: (row: Row) => string
  id: string
  queryFn: () => Promise<Row[]>
  queryKey: QueryKey
}) =>
  createCollection(
    queryCollectionOptions({
      getKey: (row: Row & { rank: number }) => getKey(row),
      id,
      queryClient,
      queryFn: async () => {
        const rows = await queryFn()
        return rows.map((row, rank) => ({ ...row, rank }))
      },
      queryKey,
    })
  )

/** A list's rows in the server's order; nothing is read while `isEnabled` is false. */
export const useRanked = <Row extends { rank: number }>(
  rows: Collection<Row, string, UtilsRecord>,
  isEnabled = true
) =>
  useLiveQuery((query) =>
    isEnabled
      ? query.from({ row: rows }).orderBy(({ row }) => row.rank)
      : undefined
  )
