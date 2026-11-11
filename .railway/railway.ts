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
const PORT = 3910
const WEB_PORT = 4173

/** Values live only in Railway (set once on `api`); the worker reads the same ones by reference. */
const SECRETS = [
  'BETTER_AUTH_SECRET',
  'ENCRYPTION_SECRET',
  'GOOGLE_CLIENT_ID',
  'GOOGLE_CLIENT_SECRET',
  'MISTRAL_API_KEY',
  'OPENROUTER_API_KEY',
  'STRIPE_PRICE_ID',
  'STRIPE_SECRET_KEY',
  'STRIPE_WEBHOOK_SECRET',
  'TELEGRAM_BOT_TOKEN',
  'TELEGRAM_BOT_USERNAME',
  'TELEGRAM_WEBHOOK_SECRET',
  'TYPESAFE_API_KEY',
] as const

/** One image for the API and the worker: the Dockerfile is built with the repo root as context. */
const build: BuildConfig = {
  builder: 'DOCKERFILE',
  dockerfilePath: 'apps/api/Dockerfile',
  watchPatterns: ['apps/api/**', 'packages/**', 'pnpm-lock.yaml'],
}

const secrets = Object.fromEntries(
  SECRETS.map((name) => [name, preserve()])
) as Record<(typeof SECRETS)[number], ReturnType<typeof preserve>>

export default defineRailway((ctx) => {
  const isProduction = ctx.environment === 'production'
  /** Names match the services that already exist, so `apply` updates them instead of adding copies. */
  const db = postgres('Postgres')

  const api = service('@fewmail/api', {
    build,
    domains: isProduction ? [{ domain: 'api.fewmail.app', port: PORT }] : [],
    env: {
      API_URL: preserve(),
      DATABASE_URL: db.env.DATABASE_URL,
      PORT: String(PORT),
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
   * in memory, so two at once would send the same brief or Telegram push twice.
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
      watchPatterns: ['apps/web/**', 'packages/**', 'pnpm-lock.yaml'],
    },
    domains: isProduction ? [{ domain: 'fewmail.app', port: WEB_PORT }] : [],
    env: {
      API_URL: api.env.API_URL,
      PORT: String(WEB_PORT),
      WEB_URL: api.env.WEB_URL,
    },
    healthcheck: '/robots.txt',
    replicas: 1,
    source: github(REPO, { branch: 'main' }),
  })

  return project('fewmail', { resources: [db, api, worker, web] })
})
