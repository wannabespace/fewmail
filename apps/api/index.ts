import { runMigrations } from '@fewmail/db'
import { RPCHandler } from '@orpc/server/fetch'
import { Hono } from 'hono'
import { cors } from 'hono/cors'

import { env } from './env'
import { auth, MAILBOX_CALLBACK_PATH } from './lib/auth'
import { relayChanges } from './lib/live'
import { handleMcp } from './mcp'
import { router } from './orpc/router'
import { handleStripeWebhook } from './services/billing'
import { handleGmailPush } from './services/gmail-push'
import { finishAddingMailbox } from './services/mailboxes'
import { syncMailbox } from './services/sync'
import { startTelegram, telegramWebhook } from './telegram'
import { verifyWhatsappWebhook, whatsappWebhook } from './whatsapp'

const rpc = new RPCHandler(router)

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
      console.error('add mailbox failed', error)
      return { mailboxId: undefined, result: 'failed' as const }
    })
    if (mailboxId) {
      void syncMailbox({ id: mailboxId }).catch(console.error)
    }
    return c.redirect(`${env.WEB_URL}/settings?mailbox=${result}`)
  })
  .get('/health', (c) => c.text('ok'))

await runMigrations()
await relayChanges()
void startTelegram()

export default {
  fetch: app.fetch,
  idleTimeout: 120,
  port: env.PORT ?? 3910,
}
