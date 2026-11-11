import type { Router } from '@fewmail/api/router'
import { createORPCClient, onError, ORPCError } from '@orpc/client'
import { RPCLink } from '@orpc/client/fetch'
import type { RouterClient } from '@orpc/server'
import { createTanstackQueryUtils } from '@orpc/tanstack-query'
import { toast } from 'sonner'

import { queryClient } from './query-client'

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
          toast.error(error.message)
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
