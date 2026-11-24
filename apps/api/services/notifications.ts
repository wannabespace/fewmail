import { db } from '@fewmail/db'
import { deliveries, devices } from '@fewmail/db/schema'
import { DELIVERY_CHANNELS } from '@fewmail/shared/agent'
import type {
  DeliveryChannel,
  DeliveryNotice,
  DeviceKind,
} from '@fewmail/shared/agent'
import { messages } from '@fewmail/shared/i18n'
import { Result } from 'better-result'
import { addMilliseconds, addMinutes, subDays, subMinutes } from 'date-fns'
import { and, eq, inArray, lt, lte, min } from 'drizzle-orm'
import { sendNotification, WebPushError } from 'web-push'

import { env } from '../env'
import { announceNotice } from '../lib/live'
import { logError, logErrorAs } from '../lib/log'
import {
  chatIdForUser,
  urgentPushTargets,
  whatsappForUser,
} from './integrations'
import type { listQueue } from './mail'
import type { Transaction } from './patterns'
import { getPlanInfo, hasAgent } from './plan'
import { getSettings } from './settings'

type Device = typeof devices.$inferSelect
type QueueItem = Awaited<ReturnType<typeof listQueue>>[number]
type Notification = DeliveryNotice
type Executor = Transaction | typeof db

const BATCH_MS = 10_000
const BODY_LIMIT = 240
const TTL_SECONDS = 12 * 60 * 60
const GONE = new Set([404, 410])
/** A desktop app on the live stream marks itself seen this often; one not seen for twice as long is closed. */
export const DESKTOP_SEEN_MS = 60_000

export const webPushKey = () => env.VAPID_PUBLIC_KEY ?? null

/** One browser is one device whoever signs in on it, so registering takes the row over. */
export const registerDevice = (
  userId: string,
  {
    keys = null,
    ...device
  }: Pick<Device, 'kind' | 'token'> & Partial<Pick<Device, 'keys'>>
) =>
  db
    .insert(devices)
    .values({ ...device, keys, userId })
    .onConflictDoUpdate({
      set: { keys, userId },
      target: devices.token,
    })

export const removeDevice = (userId: string, token: string) =>
  db
    .delete(devices)
    .where(and(eq(devices.userId, userId), eq(devices.token, token)))

/** `gone` removes the device for good; `away` (a closed desktop app) keeps it and lets the next channel try. */
type DeviceOutcome = 'away' | 'gone' | 'sent'

const sendWeb = async (
  device: Device,
  notification: Notification
): Promise<DeviceOutcome> => {
  if (!(env.VAPID_PUBLIC_KEY && env.VAPID_PRIVATE_KEY && device.keys)) {
    return 'sent'
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
    sendNotification(subscription, JSON.stringify(notification), options)
  )
  if (sent.isOk()) {
    return 'sent'
  }
  const error = sent.error.cause
  if (error instanceof WebPushError && GONE.has(error.statusCode)) {
    return 'gone'
  }
  throw error
}

/** The desktop app has no push service: it shows what reaches it over the live stream while it is open. */
const sendDesktop = async (
  device: Device,
  notification: Notification
): Promise<DeviceOutcome> => {
  if (!device.seenAt || device.seenAt < subMinutes(new Date(), 2)) {
    return 'away'
  }
  await announceNotice(device.userId, notification)
  return 'sent'
}

const senders: Record<
  DeviceKind,
  (device: Device, notification: Notification) => Promise<DeviceOutcome>
> = { desktop: sendDesktop, web: sendWeb }

/** While a desktop app holds the live stream it is seen every `DESKTOP_SEEN_MS`, so notifications go to it. */
export const keepDeviceSeen = (
  userId: string,
  token: string,
  signal?: AbortSignal
) => {
  const see = () =>
    db
      .update(devices)
      .set({ seenAt: new Date() })
      .where(and(eq(devices.userId, userId), eq(devices.token, token)))
      .catch(logErrorAs('device seen'))
  void see()
  const timer = setInterval(see, DESKTOP_SEEN_MS)
  signal?.addEventListener('abort', () => clearInterval(timer))
}

/** Settings' test goes to the one device, past the batch: the user is watching for it now. */
export const sendTestPush = async (
  userId: string,
  token: string
): Promise<DeviceOutcome> => {
  const [device] = await db
    .select()
    .from(devices)
    .where(and(eq(devices.userId, userId), eq(devices.token, token)))
  if (!device) {
    return 'gone'
  }
  const settings = await getSettings(userId)
  const t = messages[settings?.language ?? 'en']
  const outcome = await senders[device.kind](device, {
    body: t.notifications.testBody,
    title: t.notifications.testTitle,
    url: '/settings',
  })
  if (outcome === 'gone') {
    await db.delete(devices).where(eq(devices.id, device.id))
  }
  return outcome
}

const combine = async (userId: string, batch: DeliveryNotice[]) => {
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

type Outcome = 'gone' | 'sent' | 'skipped'

/** Sent when any device took it; `gone` when none is left; throws when every device failed, to be tried again. */
const sendToDevices = async (
  userId: string,
  batch: DeliveryNotice[]
): Promise<Outcome> => {
  const targets = await db
    .select()
    .from(devices)
    .where(eq(devices.userId, userId))
  if (targets.length === 0) {
    return 'gone'
  }
  const notification = await combine(userId, batch)
  const results = await Promise.all(
    targets.map((device) =>
      Result.tryPromise(async () => {
        const outcome = await senders[device.kind](device, notification)
        if (outcome === 'gone') {
          await db.delete(devices).where(eq(devices.id, device.id))
        }
        return outcome === 'sent'
      })
    )
  )
  if (results.some((result) => result.isOk() && result.value)) {
    return 'sent'
  }
  const failed = results.find((result) => result.isErr())
  if (failed?.isErr()) {
    throw failed.error.cause
  }
  return 'gone'
}

type Delivery = typeof deliveries.$inferSelect
/** Delivers one row on a messenger: `gone` when that messenger is no longer linked; throws to be tried again. */
export type MessengerSender = (delivery: Delivery) => Promise<Outcome>
type MessengerSenders = Record<Exclude<DeliveryChannel, 'web'>, MessengerSender>

const MAX_ATTEMPTS = 6
/** A row left `sending` this long died with its process: tried again, since a lost alert is worse than a repeated one. */
const STUCK_MINUTES = 5
const CLAIMED_PER_RUN = 100
/** What went out is kept a week for a look back, then goes with the text it carried. */
const KEPT_DAYS = 7

/** Channels the user has, among those a notification may use: urgent cards go only to messengers whose urgent push is on. */
export const availableChannels = async (
  userId: string,
  isUrgent: boolean
): Promise<DeliveryChannel[]> => {
  const [hasDevices, plan, telegram, whatsapp, urgent] = await Promise.all([
    db.$count(devices, eq(devices.userId, userId)),
    getPlanInfo(userId),
    chatIdForUser(userId),
    whatsappForUser(userId),
    isUrgent ? urgentPushTargets(userId) : null,
  ])
  // Telegram and WhatsApp are Pro channels; devices reach every plan.
  const withAgent = hasAgent(plan)
  const linked = {
    telegram: withAgent && (urgent ? !!urgent.telegramChat : !!telegram),
    web: hasDevices > 0,
    whatsapp: withAgent && (urgent ? urgent.whatsapp : !!whatsapp),
  }
  return DELIVERY_CHANNELS.filter((channel) => linked[channel])
}

/** Every web row of a user not tried yet goes out as one push: a new one joins the batch already waiting. */
const webBatchAt = async (tx: Executor, userId: string) => {
  const [waiting] = await tx
    .select({ at: min(deliveries.nextAttemptAt) })
    .from(deliveries)
    .where(
      and(
        eq(deliveries.userId, userId),
        eq(deliveries.channel, 'web'),
        eq(deliveries.status, 'pending')
      )
    )
  return waiting?.at ?? null
}

/** Rows for one notification, one per channel; a fallback goes through here alone, so nothing loops back into the dispatcher. */
const insertDeliveries = async (
  userId: string,
  input: {
    actionId?: string
    channels: readonly DeliveryChannel[]
    groupId?: string
    notice: DeliveryNotice
  },
  tx: Executor = db
) => {
  const batchAt = input.channels.includes('web')
    ? await webBatchAt(tx, userId)
    : null
  const groupId = input.groupId ?? crypto.randomUUID()
  await tx.insert(deliveries).values(
    input.channels.map((channel) => ({
      actionId: input.actionId ?? null,
      channel,
      groupId,
      nextAttemptAt:
        channel === 'web'
          ? (batchAt ?? addMilliseconds(new Date(), BATCH_MS))
          : new Date(),
      notice: input.notice,
      userId,
    }))
  )
  return { opensBatch: input.channels.includes('web') && !batchAt }
}

/** A dead row whose group reached nobody tries the next channel the group has not used. */
const fallBack = async (delivery: Delivery) => {
  const group = await db
    .select({ channel: deliveries.channel, status: deliveries.status })
    .from(deliveries)
    .where(eq(deliveries.groupId, delivery.groupId))
  if (group.some(({ status }) => status !== 'dead')) {
    return
  }
  const tried = new Set(group.map(({ channel }) => channel))
  const available = await availableChannels(
    delivery.userId,
    delivery.actionId !== null
  )
  const next = available.find((channel) => !tried.has(channel))
  if (next) {
    // The worker's next tick sends it.
    await insertDeliveries(delivery.userId, {
      actionId: delivery.actionId ?? undefined,
      channels: [next],
      groupId: delivery.groupId,
      notice: delivery.notice,
    })
  }
}

const settle = async (rows: Delivery[], outcome: Outcome | Error) => {
  const ids = rows.map(({ id }) => id)
  if (outcome === 'sent' || outcome === 'skipped') {
    await db
      .update(deliveries)
      .set({ sentAt: outcome === 'sent' ? new Date() : null, status: outcome })
      .where(inArray(deliveries.id, ids))
    return
  }
  if (outcome instanceof Error) {
    logError(`delivery on ${rows[0]?.channel} failed`, outcome)
  }
  for (const row of rows) {
    const attempts = row.attempts + 1
    const isDead = outcome === 'gone' || attempts >= MAX_ATTEMPTS
    // oxlint-disable-next-line eslint/no-await-in-loop -- each row keeps its own count
    await db
      .update(deliveries)
      .set({
        attempts,
        nextAttemptAt: addMinutes(new Date(), 2 ** (attempts - 1)),
        status: isDead ? 'dead' : 'failed',
      })
      .where(eq(deliveries.id, row.id))
    if (isDead) {
      // oxlint-disable-next-line eslint/no-await-in-loop -- a fallback reads the group as this row left it
      await fallBack(row)
    }
  }
}

const tryOutcome = async (send: () => Promise<Outcome>) => {
  const sent = await Result.tryPromise(send)
  if (sent.isOk()) {
    return sent.value
  }
  const { cause } = sent.error
  return cause instanceof Error ? cause : new Error(String(cause))
}

/**
 * Claims what is due (one claimant per row, `skip locked`) and sends it: a user's pushes as one, each messenger row
 * alone. `messengers` lives with the bots, which import the services; a process without them sends pushes only.
 */
export const dispatchDeliveries = async (
  messengers: Partial<MessengerSenders> = {},
  userId?: string
) => {
  await db
    .update(deliveries)
    .set({ status: 'failed' })
    .where(
      and(
        eq(deliveries.status, 'sending'),
        lt(deliveries.updatedAt, subMinutes(new Date(), STUCK_MINUTES))
      )
    )
  await db
    .delete(deliveries)
    .where(
      and(
        inArray(deliveries.status, ['sent', 'skipped', 'dead']),
        lt(deliveries.updatedAt, subDays(new Date(), KEPT_DAYS))
      )
    )
  const channels: DeliveryChannel[] = [
    'web',
    ...(Object.keys(messengers) as DeliveryChannel[]),
  ]
  const claimed = await db
    .update(deliveries)
    .set({ status: 'sending' })
    .where(
      inArray(
        deliveries.id,
        db
          .select({ id: deliveries.id })
          .from(deliveries)
          .where(
            and(
              inArray(deliveries.status, ['pending', 'failed']),
              lte(deliveries.nextAttemptAt, new Date()),
              inArray(deliveries.channel, channels),
              userId ? eq(deliveries.userId, userId) : undefined
            )
          )
          .orderBy(deliveries.createdAt)
          .limit(CLAIMED_PER_RUN)
          .for('update', { skipLocked: true })
      )
    )
    .returning()
  const pushes = Map.groupBy(
    claimed.filter(({ channel }) => channel === 'web'),
    ({ userId: owner }) => owner
  )
  await Promise.all([
    ...[...pushes].map(async ([owner, rows]) =>
      settle(
        rows,
        await tryOutcome(() =>
          sendToDevices(
            owner,
            rows.map(({ notice }) => notice)
          )
        )
      )
    ),
    ...claimed
      .filter(({ channel }) => channel !== 'web')
      .map(async (row) => {
        const send = messengers[row.channel as keyof MessengerSenders]
        await settle(
          [row],
          send ? await tryOutcome(() => send(row)) : new Error('no sender')
        )
      }),
  ])
}

/** Queues one notification on each channel; inside the caller's transaction when it claims something with it. */
export const enqueueDelivery = async (
  userId: string,
  input: Parameters<typeof insertDeliveries>[1],
  tx: Executor = db
) => {
  if (input.channels.length === 0) {
    return
  }
  const { opensBatch } = await insertDeliveries(userId, input, tx)
  if (opensBatch) {
    setTimeout(() => {
      void dispatchDeliveries({}, userId).catch(logErrorAs('notifications'))
    }, BATCH_MS)
  }
}

/** A push on its own: batched for `BATCH_MS` and kept in Postgres, so a restart never loses it. */
export const notify = async (userId: string, notice: DeliveryNotice) => {
  if ((await db.$count(devices, eq(devices.userId, userId))) > 0) {
    await enqueueDelivery(userId, { channels: ['web'], notice })
  }
}

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

export const homeNotification = (
  title: string,
  body: string
): Notification => ({
  body: body.slice(0, BODY_LIMIT),
  title,
  url: '/home',
})
