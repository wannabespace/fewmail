import { oauthProviderAuthServerMetadata } from '@better-auth/oauth-provider'
import { runMigrations } from '@fewmail/db'
import { onError } from '@orpc/server'
import { RPCHandler } from '@orpc/server/fetch'
import { BatchHandlerPlugin } from '@orpc/server/plugins'
import { Result } from 'better-result'
import { Hono } from 'hono'
import { compress } from 'hono/compress'
import { cors } from 'hono/cors'

import { env } from './env'
import { auth, MAILBOX_CALLBACK_PATH } from './lib/auth'
import { canSpeak, speak } from './lib/elevenlabs'
import { relayChanges } from './lib/live'
import { logError, logErrorAs } from './lib/log'
import { handleMcp, mcpResourceMetadata } from './mcp'
import { router } from './orpc/router'
import { handleStripeWebhook } from './services/billing'
import { followForwarded } from './services/forwarded'
import { handleGmailPush } from './services/gmail-push'
import { LimitReachedError } from './services/limit-error'
import { finishAddingMailbox } from './services/mailboxes'
import { hear, spokenBrief } from './services/messenger'
import { getPlanInfo, hasAgent } from './services/plan'
import { onNewMail, syncMailbox } from './services/sync'
import { readSharedWrapped } from './services/wrapped'
import { wrappedImage, wrappedPreviewHtml } from './services/wrapped-image'
import { startTelegram, telegramWebhook } from './telegram'
import { verifyWhatsappWebhook, whatsappWebhook } from './whatsapp'

const rpc = new RPCHandler(router, {
  interceptors: [onError((cause) => logError('rpc failed', cause))],
  plugins: [new BatchHandlerPlugin()],
})

// Without a long max age the browser asks again before nearly every call: the web is on another origin.
const PREFLIGHT_CACHE_SECONDS = 86_400
const webCors = cors({
  credentials: true,
  maxAge: PREFLIGHT_CACHE_SECONDS,
  origin: env.WEB_URL,
})

/** Voice is part of the agent and needs a speaking key; anyone else gets a 404. */
const voiceUser = async (headers: Headers) => {
  const session = await auth.api.getSession({ headers })
  return session && canSpeak && hasAgent(await getPlanInfo(session.user.id))
    ? session.user.id
    : null
}

const app = new Hono()
  .use(compress())
  .use('/auth/*', webCors)
  .use('/rpc/*', webCors)
  .use('/voice/*', webCors)
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
  .post('/voice/hear', async (c) => {
    const userId = await voiceUser(c.req.raw.headers)
    if (!userId) {
      return c.notFound()
    }
    const type = c.req.header('content-type') ?? ''
    const heard = await Result.tryPromise(() =>
      hear(
        userId,
        () => c.req.arrayBuffer(),
        `voice.${type.includes('mp4') ? 'mp4' : 'webm'}`
      )
    )
    if (heard.isErr()) {
      logError('voice hear', heard.error.cause)
      return c.json(
        { text: '' },
        heard.error.cause instanceof LimitReachedError ? 429 : 500
      )
    }
    return c.json({ text: heard.value })
  })
  .post('/voice/speak', async (c) => {
    const userId = await voiceUser(c.req.raw.headers)
    if (!userId) {
      return c.notFound()
    }
    const { text } = await c.req.json<{ text: string }>()
    return new Response(await speak(text, 'web'), {
      headers: { 'cache-control': 'no-store', 'content-type': 'audio/mpeg' },
    })
  })
  .get('/voice/brief', async (c) => {
    const userId = await voiceUser(c.req.raw.headers)
    if (!userId) {
      return c.notFound()
    }
    const audio = await speak(await spokenBrief(userId), 'web')
    return new Response(audio, {
      headers: { 'cache-control': 'no-store', 'content-type': 'audio/mpeg' },
    })
  })
  .get('/og/w/:token', (c) => {
    const token = c.req.param('token')
    const shared = Result.try(() => readSharedWrapped(token))
    return shared.isOk()
      ? c.html(wrappedPreviewHtml(shared.value, token))
      : c.notFound()
  })
  .get('/og/w/:token/image.png', async (c) => {
    const shared = Result.try(() => readSharedWrapped(c.req.param('token')))
    if (shared.isErr()) {
      return c.notFound()
    }
    return new Response(await wrappedImage(shared.value), {
      headers: {
        'cache-control': 'public, max-age=86400, immutable',
        'content-type': 'image/png',
      },
    })
  })
  .get('/health', (c) => c.text('ok'))
  .get('/health/:commit', (c) =>
    c.req.param('commit') === env.RAILWAY_GIT_COMMIT_SHA
      ? c.text('ok')
      : c.text('another commit', 503)
  )

onNewMail(followForwarded)
await runMigrations()
await relayChanges()
void startTelegram()

export default {
  fetch: app.fetch,
  idleTimeout: 120,
  port: env.PORT ?? 3910,
}
