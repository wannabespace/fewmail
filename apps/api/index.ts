import { oauthProviderAuthServerMetadata } from '@better-auth/oauth-provider'
import { runMigrations } from '@fewmail/db'
import { onError } from '@orpc/server'
import { RPCHandler } from '@orpc/server/fetch'
import { Hono } from 'hono'
import { cors } from 'hono/cors'

import { env } from './env'
import { auth, MAILBOX_CALLBACK_PATH } from './lib/auth'
import { relayChanges } from './lib/live'
import { logError, logErrorAs } from './lib/log'
import { serveWeb } from './lib/web'
import { handleMcp, mcpResourceMetadata } from './mcp'
import { router } from './orpc/router'
import { handleStripeWebhook } from './services/billing'
import { handleGmailPush } from './services/gmail-push'
import { finishAddingMailbox } from './services/mailboxes'
import { syncMailbox } from './services/sync'
import { startTelegram, telegramWebhook } from './telegram'
import { verifyWhatsappWebhook, whatsappWebhook } from './whatsapp'

const rpc = new RPCHandler(router, {
  interceptors: [onError((cause) => logError('rpc failed', cause))],
})

const app = new Hono()
  .use('/auth/*', cors({ credentials: true, origin: env.WEB_URL }))
  .use('/rpc/*', cors({ credentials: true, origin: env.WEB_URL }))
  .on(['GET', 'POST'], '/auth/*', (c) => auth.handler(c.req.raw))
  .all('/rpc/*', async (c) => {
    const { matched, response } = await rpc.handle(c.req.raw, {
      context: { headers: c.req.raw.headers },
      prefix: '/rpc',
    })
    return matched ? response : c.notFound()
  })
  .use('/.well-known/*', cors({ origin: '*' }))
  .get('/.well-known/oauth-authorization-server/auth', (c) =>
    oauthProviderAuthServerMetadata(auth)(c.req.raw)
  )
  .get('/.well-known/oauth-protected-resource/mcp', async (c) =>
    c.json(await mcpResourceMetadata())
  )
  .all('/mcp', (c) => handleMcp(c.req.raw))
  .post('/telegram', (c) =>
    telegramWebhook ? telegramWebhook(c.req.raw) : c.notFound()
  )
  .get('/whatsapp', (c) => verifyWhatsappWebhook(new URL(c.req.url)))
  .post('/whatsapp', (c) => whatsappWebhook(c.req.raw))
  .post('/stripe/webhook', (c) => handleStripeWebhook(c.req.raw))
  .post('/gmail/push', (c) => handleGmailPush(c.req.raw))
  .get(MAILBOX_CALLBACK_PATH, async (c) => {
    const session = await auth.api.getSession({ headers: c.req.raw.headers })
    const { mailboxId, result } = await finishAddingMailbox(
      session?.user.id ?? null,
      new URL(c.req.url).searchParams
    ).catch((error: unknown) => {
      logError('add mailbox failed', error)
      return { mailboxId: undefined, result: 'failed' as const }
    })
    if (mailboxId) {
      void syncMailbox({ id: mailboxId }).catch(logErrorAs('first sync'))
    }
    return c.redirect(`${env.WEB_URL}/settings?mailbox=${result}`)
  })
  .get('/health', (c) => c.text('ok'))

const WEB_HOST = new URL(env.WEB_URL).host

await runMigrations()
await relayChanges()
void startTelegram()

export default {
  fetch: (request: Request, server: unknown) => {
    const url = new URL(request.url)
    return url.host === WEB_HOST
      ? serveWeb(url.pathname)
      : app.fetch(request, server)
  },
  idleTimeout: 120,
  port: env.PORT ?? 3910,
}
