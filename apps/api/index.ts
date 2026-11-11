import { RPCHandler } from '@orpc/server/fetch'
import { Hono } from 'hono'
import { cors } from 'hono/cors'

import { env } from './env'
import { auth } from './lib/auth'
import { handleMcp } from './mcp'
import { router } from './orpc/router'
import { handleStripeWebhook } from './services/billing'
import { startTelegram, telegramWebhook } from './telegram'
import { startWorker } from './worker'

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
  .post('/stripe/webhook', (c) => handleStripeWebhook(c.req.raw))
  .get('/health', (c) => c.text('ok'))

startWorker()
void startTelegram()

export default {
  fetch: app.fetch,
  idleTimeout: 120,
  port: env.PORT ?? 3910,
}
