import { oauthProviderAuthServerMetadata } from '@better-auth/oauth-provider'
import { runMigrations } from '@fewmail/db'
import { onError } from '@orpc/server'
import { RPCHandler } from '@orpc/server/fetch'
import { BatchHandlerPlugin } from '@orpc/server/plugins'
import { Result } from 'better-result'
import { Hono } from 'hono'
import { except } from 'hono/combine'
import { compress } from 'hono/compress'
import { cors } from 'hono/cors'
import { createMiddleware } from 'hono/factory'
import { secureHeaders } from 'hono/secure-headers'

import { env } from './env'
import { auth, MAILBOX_CALLBACK_PATH } from './lib/auth'
import { canSpeak } from './lib/elevenlabs'
import { contactPhoto } from './lib/google-contacts'
import { relayChanges } from './lib/live'
import { logError, logErrorAs, logSecurityEvent } from './lib/log'
import { capture } from './lib/posthog'
import { siteIcon } from './lib/site-icon'
import { handleMcp, mcpResourceMetadata } from './mcp'
import { router } from './orpc/router'
import { readAttachment } from './services/attachments'
import { handleStripeWebhook } from './services/billing'
import { handleGmailPush } from './services/gmail-push'
import { LimitReachedError } from './services/limit-error'
import { NotFoundError } from './services/mail-errors'
import { finishAddingMailbox } from './services/mailboxes'
import { speakFor, spokenReading } from './services/messenger'
import { getPlanInfo, hasAgent } from './services/plan'
import { syncMailbox } from './services/sync'
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

const HEADERS = {
  // The web is another origin on the same site and loads avatars, attachments and voice from here.
  crossOriginResourcePolicy: 'same-site',
  referrerPolicy: 'strict-origin-when-cross-origin',
  strictTransportSecurity: 'max-age=31536000; includeSubDomains',
} as const

/** Rejected requests and sign-ins that failed at Google are the security log; only the route's first segment, as a path can hold an address (`/avatar/:email`). */
const logRefusals = createMiddleware(async (c, next) => {
  // oxlint-disable-next-line node/callback-return -- the status is known only after the route ran
  await next()
  const isFailedSignIn =
    c.req.path.startsWith('/auth/callback/') &&
    c.res.headers.get('location')?.includes('error=')
  if ([401, 403, 429].includes(c.res.status) || isFailedSignIn) {
    logSecurityEvent(
      'refused',
      c.req.method,
      c.req.path.split('/')[1] ?? '',
      c.res.status
    )
  }
})

// Per IP and in memory: right while the API runs as one replica (`.railway/railway.ts`). Providers' webhooks are left out, Google pushes every user's mail from a few addresses.
const RATE_WINDOW_MS = 60_000
const RATE_LIMIT = 1000
let requestsByIp = new Map<string, number>()
setInterval(() => {
  requestsByIp = new Map()
}, RATE_WINDOW_MS).unref()

const rateLimit = createMiddleware((c, next) => {
  const ip = c.req.header('cf-connecting-ip') ?? ''
  const count = (requestsByIp.get(ip) ?? 0) + 1
  requestsByIp.set(ip, count)
  if (count > RATE_LIMIT) {
    return Promise.resolve(
      c.text('Too many requests', 429, {
        'retry-after': String(RATE_WINDOW_MS / 1000),
      })
    )
  }
  return next()
})

const WEBHOOKS = ['/telegram', '/whatsapp', '/stripe/webhook', '/gmail/push']

/** Voice is part of the agent and needs a speaking key; anyone else gets a 404. A GET, so another site's link must not spend the month's speech. */
const voiceUser = async (headers: Headers) => {
  if (headers.get('sec-fetch-site') === 'cross-site') {
    return null
  }
  const session = await auth.api.getSession({ headers })
  return session && canSpeak && hasAgent(await getPlanInfo(session.user.id))
    ? session.user.id
    : null
}

/** The month's speech used up answers 429 with when it comes back; the web then stays silent. */
const spokenResponse = async (userId: string, text: () => Promise<string>) => {
  const spoken = await Result.tryPromise(async () =>
    speakFor(userId, await text(), 'web')
  )
  if (spoken.isOk()) {
    return new Response(spoken.value, {
      headers: { 'cache-control': 'no-store', 'content-type': 'audio/mpeg' },
    })
  }
  const { cause } = spoken.error
  if (cause instanceof LimitReachedError) {
    return Response.json({ resetsAt: cause.resetsAt }, { status: 429 })
  }
  logError('voice speak', cause)
  return new Response(null, { status: 500 })
}

// Short enough that photos granted by a new sign-in replace the initials within a day.
const AVATAR_CACHE_SECONDS = 86_400

// Fetched from elsewhere and served from our origin: never anything a browser would run (HTML, SVG).
const AVATAR_TYPES = new Set([
  'image/gif',
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/x-icon',
  'image/vnd.microsoft.icon',
])

// The sender names the type: anything a browser would run (HTML, SVG) on our origin is only ever downloaded.
const VIEWABLE = new Set([
  'application/pdf',
  'image/gif',
  'image/jpeg',
  'image/png',
  'image/webp',
])

const attachmentResponse = (file: {
  bytes: Buffer
  filename: string
  mimeType: string
}) => {
  const isViewable = VIEWABLE.has(file.mimeType.toLowerCase())
  return new Response(new Uint8Array(file.bytes), {
    headers: {
      'cache-control': 'private, max-age=86400',
      'content-disposition': `${isViewable ? 'inline' : 'attachment'}; filename*=UTF-8''${encodeURIComponent(file.filename)}`,
      'content-type': isViewable ? file.mimeType : 'application/octet-stream',
      'x-content-type-options': 'nosniff',
    },
  })
}

const app = new Hono()
  .use(logRefusals)
  .use(except(WEBHOOKS, rateLimit))
  // Chrome's PDF viewer does not open a file under `default-src 'none'`.
  .use(
    except(
      '/attachments/*',
      secureHeaders({
        ...HEADERS,
        contentSecurityPolicy: {
          defaultSrc: ["'none'"],
          frameAncestors: ["'none'"],
        },
      })
    )
  )
  .use('/attachments/*', secureHeaders(HEADERS))
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
    const userId = session?.user.id ?? null
    const { mailboxId, result } = await finishAddingMailbox(
      userId,
      new URL(c.req.url).searchParams
    ).catch((error: unknown) => {
      logError('add mailbox failed', error)
      return { mailboxId: undefined, result: 'failed' as const }
    })
    if (userId) {
      capture(userId, 'mailbox_add_finished', { result })
    }
    if (mailboxId) {
      void syncMailbox({ id: mailboxId }).catch(logErrorAs('first sync'))
    }
    return c.redirect(`${env.WEB_URL}/settings?mailbox=${result}`)
  })
  .get('/voice/reading', async (c) => {
    const userId = await voiceUser(c.req.raw.headers)
    if (!userId) {
      return c.notFound()
    }
    const day = c.req.query('day')
    return spokenResponse(userId, () => spokenReading(userId, day))
  })
  .get('/attachments/:messageId/:partId', async (c) => {
    const session = await auth.api.getSession({ headers: c.req.raw.headers })
    if (!session) {
      return c.notFound()
    }
    const file = await Result.tryPromise(() =>
      readAttachment(
        session.user.id,
        c.req.param('messageId'),
        c.req.param('partId')
      )
    )
    if (file.isErr()) {
      if (!(file.error.cause instanceof NotFoundError)) {
        logError('attachment read', file.error.cause)
      }
      return c.notFound()
    }
    return attachmentResponse(file.value)
  })
  .get('/avatar/:email', async (c) => {
    const session = await auth.api.getSession({ headers: c.req.raw.headers })
    if (!session) {
      return c.notFound()
    }
    const email = c.req.param('email').toLowerCase()
    const icon =
      (await contactPhoto(session.user, email)) ??
      (await siteIcon(email.split('@')[1] ?? ''))
    const isImage = icon && AVATAR_TYPES.has(icon.type.split(';')[0] ?? '')
    return new Response(isImage ? icon.bytes : null, {
      headers: {
        'cache-control': `private, max-age=${AVATAR_CACHE_SECONDS}`,
        ...(isImage && { 'content-type': icon.type }),
      },
      status: isImage ? 200 : 404,
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
  .get('/health', (c) => {
    const ip = (value?: string) =>
      value === undefined ? 'none' : value.startsWith('104.') || value.startsWith('172.') || value.startsWith('162.158') || value.startsWith('2606:4700') || value.startsWith('2a06:98c0') ? 'cf?' : 'other'
    const hops = c.req.header('x-forwarded-for')?.split(',').map((hop) => hop.trim())
    console.warn('origin probe', c.req.header('cf-connecting-ip') ? 'cf-header' : 'no-cf-header', 'real', ip(c.req.header('x-real-ip')), 'first', ip(hops?.[0]), 'last', ip(hops?.at(-1)), 'hops', hops?.length ?? 0)
    return c.text('ok')
  })
  .get('/health/:commit', (c) =>
    c.req.param('commit') === env.RAILWAY_GIT_COMMIT_SHA
      ? c.text('ok')
      : c.text('another commit', 503)
  )

await runMigrations()
await relayChanges()
void startTelegram()

export default {
  fetch: app.fetch,
  idleTimeout: 120,
  port: env.PORT ?? 3910,
}
