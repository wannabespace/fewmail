import type { EnsureQueryDataOptions, QueryKey } from '@tanstack/react-query'
import { MutationCache, QueryClient } from '@tanstack/react-query'

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
})

/** For route loaders: only data never loaded holds the navigation; cached data renders at once and refreshes behind it. A failure is left to the page's own query. */
export const warmQuery = <Data, Key extends QueryKey>(
  options: EnsureQueryDataOptions<Data, Error, Data, Key>
) =>
  queryClient
    .ensureQueryData({ ...options, revalidateIfStale: true })
    .catch(() => null)
