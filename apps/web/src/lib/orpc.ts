import type { Router } from '@fewmail/api/router'
import type { Limit } from '@fewmail/shared/agent'
import { messages } from '@fewmail/shared/i18n'
import { formatResetDay } from '@fewmail/shared/i18n/locales'
import { createORPCClient, onError, ORPCError } from '@orpc/client'
import { RPCLink } from '@orpc/client/fetch'
import type { RouterClient } from '@orpc/server'
import { createTanstackQueryUtils } from '@orpc/tanstack-query'
import { toast } from 'sonner'

import { localeStore } from './i18n'
import { queryClient } from './query-client'

/** A plan limit the server refused with, in the user's language; `null` for any other error. */
export const limitText = (error: unknown) => {
  if (!(error instanceof ORPCError) || error.code !== 'TOO_MANY_REQUESTS') {
    return null
  }
  const { limit, resetsAt, total } = error.data as {
    limit: Limit
    resetsAt: Date
    total: number
  }
  const locale = localeStore.get()
  const t = messages[locale].limits
  return limit === 'messages'
    ? t.messages(formatResetDay(locale, new Date(resetsAt)))
    : t[limit](total)
}

const ERROR_TEXT_BY_CODE = {
  CONFLICT: 'alreadySent',
  FORBIDDEN: 'needsPro',
  NOT_FOUND: 'notFound',
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
    url: '/rpc',
  })
)

export const orpc = createTanstackQueryUtils(client)

const LIVE_RECONNECT_MS = 5000

/** The server says when mail, the queue or the brief changed; a dropped stream reconnects and refetches what it missed. */
export const listenForChanges = async (signal: AbortSignal) => {
  while (!signal.aborted) {
    try {
      // oxlint-disable-next-line eslint/no-await-in-loop -- one stream at a time, reopened after it drops
      for await (const _change of await client.live(undefined, { signal })) {
        void queryClient.invalidateQueries()
      }
    } catch {
      // oxlint-disable-next-line eslint/no-await-in-loop, promise/avoid-new -- waits before reconnecting
      await new Promise((resolve) => {
        setTimeout(resolve, LIVE_RECONNECT_MS)
      })
      void queryClient.invalidateQueries()
    }
  }
}
