import { db } from '@fewmail/db'
import { devices } from '@fewmail/db/schema'
import type { DeviceKind } from '@fewmail/shared/agent'
import { messages } from '@fewmail/shared/i18n'
import type { Locale } from '@fewmail/shared/i18n/locales'
import { formatIssueDay } from '@fewmail/shared/i18n/locales'
import { Result } from 'better-result'
import { and, eq } from 'drizzle-orm'
import webpush from 'web-push'

import { env } from '../env'
import { logError } from '../lib/log'
import type { listQueue } from './mail'
import type { getReadingDay } from './reading'
import { getSettings } from './settings'

type Device = typeof devices.$inferSelect
type QueueItem = Awaited<ReturnType<typeof listQueue>>[number]

interface Notification {
  body: string
  title: string
  url: string
}

const BATCH_MS = 10_000
const BODY_LIMIT = 240
const TTL_SECONDS = 12 * 60 * 60
const GONE = new Set([404, 410])

export const webPushKey = () => env.VAPID_PUBLIC_KEY ?? null

/** One browser is one device whoever signs in on it, so registering takes the row over. */
export const registerDevice = (
  userId: string,
  device: Pick<Device, 'keys' | 'kind' | 'token'>
) =>
  db
    .insert(devices)
    .values({ ...device, userId })
    .onConflictDoUpdate({
      set: { keys: device.keys, userId },
      target: devices.token,
    })

export const removeDevice = (userId: string, token: string) =>
  db
    .delete(devices)
    .where(and(eq(devices.userId, userId), eq(devices.token, token)))

/** Resolves false when the device is gone for good and its row should be removed. */
const sendWeb = async (device: Device, notification: Notification) => {
  if (!(env.VAPID_PUBLIC_KEY && env.VAPID_PRIVATE_KEY && device.keys)) {
    return true
  }
  const subscription = { endpoint: device.token, keys: device.keys }
  const options = {
    TTL: TTL_SECONDS,
    vapidDetails: {
      privateKey: env.VAPID_PRIVATE_KEY,
      publicKey: env.VAPID_PUBLIC_KEY,
      subject: env.WEB_URL,
    },
  }
  const sent = await Result.tryPromise(() =>
    webpush.sendNotification(
      subscription,
      JSON.stringify(notification),
      options
    )
  )
  if (sent.isOk()) {
    return true
  }
  const error = sent.error.cause
  if (error instanceof webpush.WebPushError && GONE.has(error.statusCode)) {
    return false
  }
  throw error
}

const senders: Record<
  DeviceKind,
  (device: Device, notification: Notification) => Promise<boolean>
> = { web: sendWeb }

const combine = async (userId: string, batch: Notification[]) => {
  const [single] = batch
  if (single && batch.length === 1) {
    return single
  }
  const settings = await getSettings(userId)
  const t = messages[settings?.language ?? 'en']
  return {
    body: batch
      .map(({ body, title }) => `${title} · ${body.split('\n')[0]}`)
      .join('\n')
      .slice(0, BODY_LIMIT),
    title: t.notifications.many(batch.length),
    url: '/home',
  }
}

const deliver = async (userId: string, batch: Notification[]) => {
  const targets = await db
    .select()
    .from(devices)
    .where(eq(devices.userId, userId))
  if (targets.length === 0) {
    return
  }
  const notification = await combine(userId, batch)
  await Promise.all(
    targets.map(async (device) => {
      const delivered = await Result.tryPromise(async () => {
        if (!(await senders[device.kind](device, notification))) {
          await db.delete(devices).where(eq(devices.id, device.id))
        }
      })
      if (delivered.isErr()) {
        logError(`notification to ${device.kind} failed`, delivered.error.cause)
      }
    })
  )
}

const pending = new Map<string, Notification[]>()

const flush = async (userId: string) => {
  const batch = pending.get(userId)
  pending.delete(userId)
  if (batch) {
    await deliver(userId, batch).catch((error) =>
      logError('notifications', error)
    )
  }
}

/** The first notification opens a `BATCH_MS` window per user; whatever arrives within it goes out as one. Buffered in memory, so call `flushNotifications` before the process exits. */
export const notify = (userId: string, notification: Notification) => {
  const batch = pending.get(userId)
  if (batch) {
    batch.push(notification)
    return
  }
  pending.set(userId, [notification])
  setTimeout(() => flush(userId), BATCH_MS)
}

export const flushNotifications = () =>
  Promise.all([...pending.keys()].map(flush))

export const urgentNotification = ({
  action,
  analysis,
  message,
}: QueueItem): Notification => ({
  body: [message?.subject ?? action.title, analysis?.summary]
    .filter(Boolean)
    .join('\n')
    .slice(0, BODY_LIMIT),
  title: message?.fromName ?? message?.fromEmail ?? 'Fewmail',
  url: '/home',
})

/** The morning's issue where no messenger carries it: the day and its count, then the summary's opening. */
export const readingNotification = (
  locale: Locale,
  { day, rows, summary }: Awaited<ReturnType<typeof getReadingDay>>
): Notification => ({
  body: [
    `${formatIssueDay(locale, day)} · ${messages[locale].reading.digest(rows.length)}`,
    summary?.intro,
  ]
    .filter(Boolean)
    .join('\n')
    .slice(0, BODY_LIMIT),
  title: messages[locale].reading.summary,
  url: `/home?day=${day}`,
})

export const homeNotification = (
  title: string,
  body: string
): Notification => ({
  body: body.slice(0, BODY_LIMIT),
  title,
  url: '/home',
})
