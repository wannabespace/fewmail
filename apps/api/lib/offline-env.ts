import { mock } from 'bun:test'
import process from 'node:process'

/** The economics import the services, whose env must parse; nothing there may reach a database or call a model. */
const PLACEHOLDERS = {
  API_URL: 'http://localhost',
  BETTER_AUTH_SECRET: 'kq3V8xNw1pZr7LsT2yHc9bJf4mDe6uAa',
  DATABASE_URL: 'postgres://offline@127.0.0.1:1/offline',
  ENCRYPTION_SECRET: 'offline',
  GOOGLE_CLIENT_ID: 'offline',
  GOOGLE_CLIENT_SECRET: 'offline',
  OPENROUTER_API_KEY: 'offline',
  WEB_URL: 'http://localhost',
}

for (const [name, value] of Object.entries(PLACEHOLDERS)) {
  process.env[name] ||= value
}

/** Seeds its MCP resource in Postgres as soon as `lib/auth.ts` is imported. */
mock.module('@better-auth/oauth-provider', () => ({
  oauthProvider: () => ({ id: 'oauth-provider' }),
}))
