import process from 'node:process'

import { type } from 'arktype'
import { defineConfig } from 'drizzle-kit'

const { DATABASE_URL } = type({ DATABASE_URL: 'string' }).assert(process.env)

export default defineConfig({
  dbCredentials: { url: DATABASE_URL },
  dialect: 'postgresql',
  out: './migrations',
  schema: './schema/index.ts',
})
