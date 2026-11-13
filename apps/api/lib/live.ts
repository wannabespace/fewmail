import { db } from '@fewmail/db'
import { MemoryPublisher } from '@orpc/publisher/memory'
import { Result } from 'better-result'
import { sql } from 'drizzle-orm'

import { logError } from './log'

const CHANNEL = 'mail_changed'

/** Router namespaces whose queries the web refetches; an announce without topics refetches every query. */
export const LIVE_TOPICS = [
  'actions',
  'boards',
  'chats',
  'integrations',
  'mail',
  'mailboxes',
  'person',
  'reading',
  'schedules',
  'subscriptions',
  'today',
] as const

export type LiveTopic = (typeof LIVE_TOPICS)[number]

export const MAIL_TOPICS = [
  'actions',
  'boards',
  'mail',
  'mailboxes',
  'person',
  'reading',
  'subscriptions',
  'today',
] as const satisfies readonly LiveTopic[]

const publisher = new MemoryPublisher<
  Record<string, { topics: LiveTopic[] | null }>
>()

/** Goes through Postgres, never straight to the publisher: the worker is another process and only the API holds the open tabs. */
export const announceChange = async (
  userId: string,
  topics?: readonly LiveTopic[]
) => {
  const announced = await Result.tryPromise(() =>
    db.execute(
      sql`select pg_notify(${CHANNEL}, ${[userId, ...(topics ?? [])].join(' ')})`
    )
  )
  if (announced.isErr()) {
    logError('live announce failed', announced.error.cause)
  }
}

export const relayChanges = () =>
  db.$client.listen(CHANNEL, (payload) => {
    const [userId = '', ...topics] = payload.split(' ')
    publisher.publish(userId, {
      topics: topics.length > 0 ? (topics as LiveTopic[]) : null,
    })
  })

export const watchChanges = (userId: string, signal?: AbortSignal) =>
  publisher.subscribe(userId, { signal })
