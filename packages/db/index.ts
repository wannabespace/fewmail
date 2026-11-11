import { defineRelations } from 'drizzle-orm'
import { drizzle } from 'drizzle-orm/bun-sql/postgres'
import { migrate } from 'drizzle-orm/bun-sql/migrator'

import { env } from './env'
import * as schema from './schema'

export const relations = defineRelations(schema, (r) => ({
  accounts: { users: r.one.users({ from: r.accounts.userId, to: r.users.id }) },
  sessions: { users: r.one.users({ from: r.sessions.userId, to: r.users.id }) },
  users: { accounts: r.many.accounts(), sessions: r.many.sessions() },
}))

export const db = drizzle(env.DATABASE_URL, { relations })

export const runMigrations = () =>
  migrate(db, { migrationsFolder: `${import.meta.dirname}/migrations` })
