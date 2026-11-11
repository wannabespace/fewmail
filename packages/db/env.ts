import process from 'node:process'

import { type } from 'arktype'

export const env = type({
  DATABASE_URL: 'string',
  ENCRYPTION_SECRET: 'string',
}).assert(process.env)
