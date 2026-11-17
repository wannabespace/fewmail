import type { Router } from '@fewmail/api/router'
import { formatResetDay } from '@fewmail/shared/i18n/locales'
import { createORPCClient, onError, ORPCError } from '@orpc/client'
import { RPCLink } from '@orpc/client/fetch'
import { BatchLinkPlugin } from '@orpc/client/plugins'
import type { RouterClient } from '@orpc/server'
import { createTanstackQueryUtils } from '@orpc/tanstack-query'
import { Result } from 'better-result'
import { toast } from 'sonner'

import {
  badgeDesktop,
  desktopDeviceStore,
  isDesktop,
  notifyDesktop,
} from './desktop'
import { getT, localeStore } from './i18n'
import { queryClient } from './query-client'

/** The spent allowance the server refused with, in the user's language; `null` for any other error. */
const limitText = (error: unknown) => {
  if (!(error instanceof ORPCError) || error.code !== 'TOO_MANY_REQUESTS') {
    return null
  }
  const { resetsAt } = error.data as { resetsAt: Date }
  const locale = localeStore.get()
  return getT().limits.usage(formatResetDay(locale, new Date(resetsAt)))
}

const ERROR_TEXT_BY_CODE = {
  CONFLICT: 'alreadySent',
  FORBIDDEN: 'needsPro',
  NOT_FOUND: 'notFound',
  PRECONDITION_FAILED: 'calendarAccess',
} as const

/** The server's own messages are English and meant for logs; the user reads what went wrong in their language. */
const errorText = (error: unknown) => {
  const t = getT().errors
  if (error instanceof TypeError) {
    return t.offline
  }
  if (
    error instanceof ORPCError &&
    (error.data as { consentChanged?: boolean } | undefined)?.consentChanged
  ) {
    return t.consentChanged
  }
  const key =
    error instanceof ORPCError
      ? ERROR_TEXT_BY_CODE[error.code as keyof typeof ERROR_TEXT_BY_CODE]
      : undefined
  return limitText(error) ?? t[key ?? 'failed']
}

let isPageLeaving = false

/** What is sent while the page closes must outlive it: kept alive, and never batched, since a batch waits a tick. */
export const keepRequestsAlive = () => {
  isPageLeaving = true
}

addEventListener('pageshow', () => {
  isPageLeaving = false
})

export const client: RouterClient<Router> = createORPCClient(
  new RPCLink({
    fetch: (url, init) =>
      globalThis.fetch(url, {
        ...init,
        credentials: 'include',
        keepalive: isPageLeaving,
      }),
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
        filter: ({ path }) => path[0] !== 'live' && !isPageLeaving,
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
let nextFlush = Promise.withResolvers<unknown>()

/** Refetches whole router namespaces, `null` everything; calls close together refetch once, and resolve once it has landed. */
export const refetchChanged = (topics: string[] | null) => {
  if (topics) {
    for (const topic of topics) {
      pendingTopics.add(topic)
    }
  } else {
    isEverythingPending = true
  }
  clearTimeout(flushTimer)
  const flush = nextFlush
  flushTimer = setTimeout(() => {
    const refetches = isEverythingPending
      ? [queryClient.invalidateQueries()]
      : [...pendingTopics].map((topic) =>
          queryClient.invalidateQueries({ queryKey: [[topic]] })
        )
    pendingTopics = new Set()
    isEverythingPending = false
    nextFlush = Promise.withResolvers()
    void Promise.all(refetches).then(flush.resolve)
  }, LIVE_SETTLE_MS)
  return flush.promise
}

/** The server says which parts changed; a dropped stream reconnects and refetches everything it may have missed. */
/** Reopens the stream at once: the desktop app's device changed, and the server sees it only from the stream's input. */
let reopenLive: () => void = () => null

export const listenForChanges = async (signal: AbortSignal) => {
  while (!signal.aborted) {
    const connection = new AbortController()
    signal.addEventListener('abort', () => connection.abort(), { once: true })
    reopenLive = () => connection.abort()
    // oxlint-disable-next-line eslint/no-await-in-loop -- one stream at a time, reopened after it drops
    const streamed = await Result.tryPromise(async () => {
      // The desktop app's device keeps receiving notifications while this stream is open.
      const device = desktopDeviceStore.get() || undefined
      const stream = await client.live(
        { device },
        {
          signal: connection.signal,
        }
      )
      for await (const { notice, topics } of stream) {
        if (notice) {
          notifyDesktop(notice)
        } else {
          refetchChanged(topics)
        }
      }
    })
    if (streamed.isErr() && !connection.signal.aborted) {
      // oxlint-disable-next-line eslint/no-await-in-loop, promise/avoid-new -- waits before reconnecting
      await new Promise((resolve) => {
        setTimeout(resolve, LIVE_RECONNECT_MS)
      })
      refetchChanged(null)
    }
  }
}

export const reopenLiveStream = () => reopenLive()

if (isDesktop) {
  const countHash = JSON.stringify(orpc.today.count.queryKey())
  queryClient.getQueryCache().subscribe(({ query, type }) => {
    if (type === 'updated' && JSON.stringify(query.queryKey) === countHash) {
      badgeDesktop(typeof query.state.data === 'number' ? query.state.data : 0)
    }
  })
}
