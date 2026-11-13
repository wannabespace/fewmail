import type { BuildConfig } from 'railway/iac'
import {
  defineRailway,
  github,
  postgres,
  preserve,
  project,
  service,
} from 'railway/iac'

const REPO = 'wannabespace/fewmail'

/** Values live only in Railway (set once on `api`); the worker reads the same ones by reference. */
const SECRETS = [
  'BETTER_AUTH_SECRET',
  'ENCRYPTION_SECRET',
  'GOOGLE_CLIENT_ID',
  'GOOGLE_CLIENT_SECRET',
  'MISTRAL_API_KEY',
  'ELEVENLABS_API_KEY',
  'ELEVENLABS_VOICE_ID',
  'OPENROUTER_API_KEY',
  'STRIPE_MAX_MONTHLY_PRICE_ID',
  'STRIPE_MAX_YEARLY_PRICE_ID',
  'STRIPE_PRO_MONTHLY_PRICE_ID',
  'STRIPE_PRO_YEARLY_PRICE_ID',
  'STRIPE_SECRET_KEY',
  'STRIPE_WEBHOOK_SECRET',
  'TELEGRAM_BOT_TOKEN',
  'TELEGRAM_BOT_USERNAME',
  'TELEGRAM_WEBHOOK_SECRET',
  'VAPID_PRIVATE_KEY',
  'VAPID_PUBLIC_KEY',
  'WHATSAPP_APP_SECRET',
  'WHATSAPP_NUMBER',
  'WHATSAPP_PHONE_NUMBER_ID',
  'WHATSAPP_TEMPLATE',
  'WHATSAPP_TOKEN',
  'WHATSAPP_VERIFY_TOKEN',
] as const

/**
 * The API and the web deploy on the same changes: the web waits for the API to run its commit
 * (`/health` in `apps/web/Caddyfile`), so a commit the API skipped would never go live.
 */
const watchPatterns = [
  'apps/api/**',
  'apps/web/**',
  'packages/**',
  'pnpm-lock.yaml',
]

/** One image for the API and the worker: the Dockerfile is built with the repo root as context. */
const build: BuildConfig = {
  builder: 'DOCKERFILE',
  dockerfilePath: 'apps/api/Dockerfile',
  watchPatterns,
}

const secrets = Object.fromEntries(
  SECRETS.map((name) => [name, preserve()])
) as Record<(typeof SECRETS)[number], ReturnType<typeof preserve>>

export default defineRailway(() => {
  /** Names match the services that already exist, so `apply` updates them instead of adding copies. */
  const db = postgres('Postgres')

  const api = service('@fewmail/api', {
    build,
    domains: ['api.fewmail.app'],
    env: {
      API_URL: preserve(),
      DATABASE_URL: db.env.DATABASE_URL,
      GMAIL_PUSH_SERVICE_ACCOUNT: 'gmail-push@fewmail.iam.gserviceaccount.com',
      GMAIL_PUSH_TOPIC: 'projects/fewmail/topics/gmail-push',
      WEB_URL: preserve(),
      ...secrets,
    },
    healthcheck: '/health',
    healthcheckTimeout: 120,
    replicas: 1,
    source: github(REPO, { branch: 'main' }),
  })

  /**
   * Exactly one replica, and the old one drains before the new one starts: the worker's locks are
   * in memory, so two at once would send the same morning message or Telegram push twice.
   */
  const worker = service('worker', {
    build,
    deploy: {
      drainingSeconds: 30,
      overlapSeconds: 0,
      restartPolicyType: 'ALWAYS',
    },
    env: {
      API_URL: api.env.API_URL,
      DATABASE_URL: db.env.DATABASE_URL,
      GMAIL_PUSH_TOPIC: api.env.GMAIL_PUSH_TOPIC,
      WEB_URL: api.env.WEB_URL,
      ...Object.fromEntries(SECRETS.map((name) => [name, api.env[name]])),
    },
    replicas: 1,
    source: github(REPO, { branch: 'main' }),
    start: 'env NODE_ENV=production bun run ./worker.ts',
  })

  /** Static `dist` behind Caddy (`apps/web/Dockerfile`); API_URL reaches the build as a build arg. */
  const web = service('@fewmail/web', {
    build: {
      builder: 'DOCKERFILE',
      dockerfilePath: 'apps/web/Dockerfile',
      watchPatterns,
    },
    domains: ['fewmail.app'],
    env: {
      API_URL: api.env.API_URL,
      WEB_URL: api.env.WEB_URL,
    },
    healthcheck: '/health',
    /** Covers the API's whole build, type check and migrations, which run while the web waits. */
    healthcheckTimeout: 600,
    replicas: 1,
    source: github(REPO, { branch: 'main' }),
  })

  return project('fewmail', { resources: [db, api, worker, web] })
})
