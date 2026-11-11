import { db } from '@fewmail/db'
import { MemoryPublisher } from '@orpc/publisher/memory'
import { sql } from 'drizzle-orm'

const CHANNEL = 'mail_changed'

const publisher = new MemoryPublisher<Record<string, { at: number }>>()

/** Goes through Postgres, never straight to the publisher: the worker is another process and only the API holds the open tabs. */
export const announceChange = async (userId: string) => {
  try {
    await db.execute(sql`select pg_notify(${CHANNEL}, ${userId})`)
  } catch (error) {
    console.error('live announce failed', error)
  }
}

export const relayChanges = () =>
  db.$client.listen(CHANNEL, (userId) =>
    publisher.publish(userId, { at: Date.now() })
  )

export const watchChanges = (userId: string, signal?: AbortSignal) =>
  publisher.subscribe(userId, { signal })
