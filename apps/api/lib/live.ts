import { db } from '@fewmail/db'
import type { DeliveryNotice } from '@fewmail/shared/agent'
import { decrypt, encrypt } from '@fewmail/shared/crypto-node'
import { MemoryPublisher } from '@orpc/publisher/memory'
import { Result } from 'better-result'
import { sql } from 'drizzle-orm'

import { env } from '../env'
import { logError } from './log'

const CHANNEL = 'mail_changed'

/** Router namespaces whose queries the web refetches; an announce without topics refetches every query. */
const LIVE_TOPICS = [
  'actions',
  'bots',
  'commitments',
  'integrations',
  'mail',
  'mailboxes',
  'reading',
  'subscriptions',
  'today',
] as const

type LiveTopic = (typeof LIVE_TOPICS)[number]

/** Home's bot chats are read from cards and promises, so whatever changes those changes them too. */
const BOT_SOURCES: ReadonlySet<LiveTopic> = new Set([
  'actions',
  'commitments',
  'today',
])

const withBots = (topics: readonly LiveTopic[]) =>
  topics.some((topic) => BOT_SOURCES.has(topic)) && !topics.includes('bots')
    ? [...topics, 'bots']
    : topics

export const MAIL_TOPICS = [
  'actions',
  'commitments',
  'mail',
  'mailboxes',
  'reading',
  'subscriptions',
  'today',
] as const satisfies readonly LiveTopic[]

/** What a queued action touches: Home's cards, the actions list and the thread it belongs to. */
export const ACTION_TOPICS = [
  'actions',
  'mail',
  'today',
] as const satisfies readonly LiveTopic[]

/** A desktop app's notification rides the stream to its open window; topics are empty, so nothing refetches. */
const publisher = new MemoryPublisher<
  Record<string, { notice?: DeliveryNotice; topics: LiveTopic[] | null }>
>()

/** Marks a notification in the Postgres payload, which never holds a topic starting with it. */
const NOTICE = '!'

/** Goes through Postgres, never straight to the publisher: the worker is another process and only the API holds the open tabs. */
export const announceChange = async (
  userId: string,
  topics?: readonly LiveTopic[]
) => {
  const announced = await Result.tryPromise(() =>
    db.execute(
      sql`select pg_notify(${CHANNEL}, ${[userId, ...withBots(topics ?? [])].join(' ')})`
    )
  )
  if (announced.isErr()) {
    logError('live announce failed', announced.error.cause)
  }
}

/** Encrypted on its way through Postgres, which keeps no user data in clear text. */
export const announceNotice = async (
  userId: string,
  notice: DeliveryNotice
) => {
  const text = encrypt({
    secret: env.ENCRYPTION_SECRET,
    text: JSON.stringify(notice),
  })
  const announced = await Result.tryPromise(() =>
    db.execute(
      sql`select pg_notify(${CHANNEL}, ${`${userId} ${NOTICE}${text}`})`
    )
  )
  if (announced.isErr()) {
    logError('live notice failed', announced.error.cause)
  }
}

export const relayChanges = () =>
  db.$client.listen(CHANNEL, (payload) => {
    const [userId = '', ...topics] = payload.split(' ')
    const [notice] = topics
    if (notice?.startsWith(NOTICE)) {
      const encryptedText = notice.slice(NOTICE.length)
      publisher.publish(userId, {
        notice: JSON.parse(
          decrypt({ encryptedText, secret: env.ENCRYPTION_SECRET })
        ),
        topics: [],
      })
      return
    }
    publisher.publish(userId, {
      topics: topics.length > 0 ? (topics as LiveTopic[]) : null,
    })
  })

export const watchChanges = (userId: string, signal?: AbortSignal) =>
  publisher.subscribe(userId, { signal })

/** A desktop app waiting on its sign-in hears on the same channel, under its challenge instead of a user's id. */
const signInKey = (challenge: string) => `sign-in:${challenge}`

export const announceSignIn = (challenge: string) =>
  announceChange(signInKey(challenge))

export const watchSignIn = (challenge: string, signal?: AbortSignal) =>
  watchChanges(signInKey(challenge), signal)
