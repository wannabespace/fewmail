import type { Router } from '@fewmail/api/router'
import { createORPCClient, onError, ORPCError } from '@orpc/client'
import { RPCLink } from '@orpc/client/fetch'
import type { RouterClient } from '@orpc/server'
import { createTanstackQueryUtils } from '@orpc/tanstack-query'
import { toast } from 'sonner'

export const client: RouterClient<Router> = createORPCClient(
  new RPCLink({
    fetch: (url, init) =>
      globalThis.fetch(url, { ...init, credentials: 'include' }),
    interceptors: [
      // oxlint-disable-next-line promise/prefer-await-to-callbacks -- oRPC interceptor API
      onError((error) => {
        const isSignedOut =
          error instanceof ORPCError && error.code === 'UNAUTHORIZED'
        if (
          error instanceof Error &&
          error.name !== 'AbortError' &&
          !isSignedOut
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
