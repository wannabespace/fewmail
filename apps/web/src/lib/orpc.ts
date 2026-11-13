import type { Router } from '@fewmail/api/router'
import { messages } from '@fewmail/shared/i18n'
import { formatResetDay } from '@fewmail/shared/i18n/locales'
import { createORPCClient, onError, ORPCError } from '@orpc/client'
import { RPCLink } from '@orpc/client/fetch'
import { BatchLinkPlugin } from '@orpc/client/plugins'
import type { RouterClient } from '@orpc/server'
import { createTanstackQueryUtils } from '@orpc/tanstack-query'
import { Result } from 'better-result'
import { toast } from 'sonner'

import { localeStore } from './i18n'
import { queryClient } from './query-client'

/** The spent allowance the server refused with, in the user's language; `null` for any other error. */
export const limitText = (error: unknown) => {
  if (!(error instanceof ORPCError) || error.code !== 'TOO_MANY_REQUESTS') {
    return null
  }
  const { resetsAt } = error.data as { resetsAt: Date }
  const locale = localeStore.get()
  return messages[locale].limits.usage(
    formatResetDay(locale, new Date(resetsAt))
  )
}

const ERROR_TEXT_BY_CODE = {
  CONFLICT: 'alreadySent',
  FORBIDDEN: 'needsPro',
  NOT_FOUND: 'notFound',
  PRECONDITION_FAILED: 'calendarAccess',
} as const

/** The server's own messages are English and meant for logs; the user reads what went wrong in their language. */
export const errorText = (error: unknown) => {
  const t = messages[localeStore.get()].errors
  if (error instanceof TypeError) {
    return t.offline
  }
  const key =
    error instanceof ORPCError
      ? ERROR_TEXT_BY_CODE[error.code as keyof typeof ERROR_TEXT_BY_CODE]
      : undefined
  return limitText(error) ?? t[key ?? 'failed']
}

export const client: RouterClient<Router> = createORPCClient(
  new RPCLink({
    fetch: (url, init) =>
      globalThis.fetch(url, { ...init, credentials: 'include' }),
    interceptors: [
      // oxlint-disable-next-line promise/prefer-await-to-callbacks -- oRPC interceptor API
      onError((error, { path }) => {
        const isSignedOut =
          error instanceof ORPCError && error.code === 'UNAUTHORIZED'
        if (
          error instanceof Error &&
          error.name !== 'AbortError' &&
          !isSignedOut &&
          path[0] !== 'live'
        ) {
          toast.error(errorText(error))
        }
      }),
    ],
    origin: import.meta.env.API_URL,
    plugins: [
      new BatchLinkPlugin({
        // The live stream never ends, so a batch holding it would never answer.
        filter: ({ path }) => path[0] !== 'live',
        groups: [{ condition: () => true, context: {} }],
        mode: 'streaming',
      }),
    ],
    url: '/rpc',
  })
)

export const orpc = createTanstackQueryUtils(client)

const LIVE_RECONNECT_MS = 5000
const LIVE_SETTLE_MS = 200

let pendingTopics = new Set<string>()
let isEverythingPending = false
let flushTimer: ReturnType<typeof setTimeout> | undefined

/** Refetches whole router namespaces, `null` everything; calls close together refetch once. */
export const refetchChanged = (topics: string[] | null) => {
  if (topics) {
    for (const topic of topics) {
      pendingTopics.add(topic)
    }
  } else {
    isEverythingPending = true
  }
  clearTimeout(flushTimer)
  flushTimer = setTimeout(() => {
    if (isEverythingPending) {
      void queryClient.invalidateQueries()
    } else {
      for (const topic of pendingTopics) {
        void queryClient.invalidateQueries({ queryKey: [[topic]] })
      }
    }
    pendingTopics = new Set()
    isEverythingPending = false
  }, LIVE_SETTLE_MS)
}

/** The server says which parts changed; a dropped stream reconnects and refetches everything it may have missed. */
export const listenForChanges = async (signal: AbortSignal) => {
  while (!signal.aborted) {
    // oxlint-disable-next-line eslint/no-await-in-loop -- one stream at a time, reopened after it drops
    const streamed = await Result.tryPromise(async () => {
      for await (const { topics } of await client.live(undefined, { signal })) {
        refetchChanged(topics)
      }
    })
    if (streamed.isErr()) {
      // oxlint-disable-next-line eslint/no-await-in-loop, promise/avoid-new -- waits before reconnecting
      await new Promise((resolve) => {
        setTimeout(resolve, LIVE_RECONNECT_MS)
      })
      refetchChanged(null)
    }
  }
}
