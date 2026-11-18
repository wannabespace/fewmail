import process from 'node:process'

import { db } from '@fewmail/db'
import {
  actions,
  analyses,
  mailboxes,
  messages,
  userSettings,
} from '@fewmail/db/schema'
import { IMPORTANCE } from '@fewmail/shared/agent'
import { Result } from 'better-result'
import { subDays, subMinutes } from 'date-fns'
import {
  and,
  eq,
  exists,
  gt,
  gte,
  isNotNull,
  isNull,
  lt,
  or,
  sql,
} from 'drizzle-orm'

import { dispatchDeliveries } from './delivery'
import { localClock, previousDay } from './lib/clock'
import { logError } from './lib/log'
import { pruneBulkPrints } from './services/bulk'
import { offerCleanup } from './services/cleanup'
import { mailboxesToWatch, watchMailbox } from './services/gmail-push'
import { savedThisWeek } from './services/home'
import { chatIdForUser, whatsappForUser } from './services/integrations'
import { refreshKnownDomains } from './services/known-domains'
import { listQueue } from './services/mail'
import {
  availableChannels,
  enqueueDelivery,
  notify,
  readingNotification,
  urgentNotification,
} from './services/notifications'
import { dispatchDueOutbox } from './services/outbox'
import { getPlanInfo, hasAgent, hasAgentSql } from './services/plan'
import { writeReadingIssue } from './services/reading'
import {
  processDueCommitments,
  processDueReminders,
} from './services/reminders'
import { learnVoice, VOICE_EVERY_SENT } from './services/sent-mail'
import { dropOldHtml, indexStoredMail } from './services/stored-mail'
import {
  ensureMailbox,
  HELD_MONTHS,
  holdEarlierMail,
  syncMailbox,
} from './services/sync'
import { sendReading, sendWeek } from './telegram'
import { sendWhatsappReading, sendWhatsappWeek } from './whatsapp'

const TICK_MS = 60_000
const SYNC_EVERY_MINUTES = 2

const running = new Set<string>()

const once = async (key: string, run: () => Promise<unknown>) => {
  if (running.has(key)) {
    return
  }
  running.add(key)
  const ran = await Result.tryPromise(run)
  running.delete(key)
  if (ran.isErr()) {
    logError(`worker ${key}`, ran.error.cause)
  }
}

const syncDueMailboxes = async () => {
  const due = await db
    .select()
    .from(mailboxes)
    .where(
      or(
        isNull(mailboxes.lastSyncedAt),
        lt(mailboxes.lastSyncedAt, subMinutes(new Date(), SYNC_EVERY_MINUTES))
      )
    )
  const withoutMailbox = await db
    .select({ userId: userSettings.userId })
    .from(userSettings)
    .leftJoin(
      mailboxes,
      and(
        eq(mailboxes.userId, userSettings.userId),
        isNull(mailboxes.googleAccountId)
      )
    )
    .where(isNull(mailboxes.id))
  await Promise.all([
    ...due.map((mailbox) =>
      once(`sync:${mailbox.id}`, () => syncMailbox(mailbox))
    ),
    ...withoutMailbox.map(({ userId }) =>
      once(`sync:${userId}`, async () =>
        syncMailbox(await ensureMailbox(userId))
      )
    ),
  ])
}

/** After the first sync, so the inbox is read before any history; a week per mailbox per tick. */
const holdDueMail = async () => {
  const due = await db
    .select()
    .from(mailboxes)
    .where(
      and(
        isNotNull(mailboxes.lastSyncedAt),
        gt(
          mailboxes.heldSince,
          sql`${mailboxes.createdAt} - make_interval(months => ${HELD_MONTHS})`
        )
      )
    )
  await Promise.all(
    due.map((mailbox) =>
      once(`held:${mailbox.id}`, () => holdEarlierMail(mailbox))
    )
  )
}

const renewWatches = async () => {
  const due = await mailboxesToWatch()
  await Promise.all(
    due.map((mailbox) =>
      once(`watch:${mailbox.id}`, () => watchMailbox(mailbox))
    )
  )
}

const MONDAY = 1

const isMorningDue = (settings: typeof userSettings.$inferSelect) => {
  const now = localClock(settings.timezone)
  const sent =
    settings.morningSentAt &&
    localClock(settings.timezone, settings.morningSentAt)
  return (
    now.hour >= settings.briefHour &&
    (!sent || sent.date !== now.date || sent.hour < settings.briefHour)
  )
}

interface Messengers {
  chatId: string | null
  hasWhatsapp: boolean
}

/** Yesterday's issue is written for everyone, then goes to the messengers, or as a notification where there are none. */
const sendReadingIssue = async (
  settings: typeof userSettings.$inferSelect,
  { chatId, hasWhatsapp }: Messengers
) => {
  const { userId } = settings
  const issue = await writeReadingIssue(
    userId,
    previousDay(localClock(settings.timezone).date)
  )
  if (!(issue && settings.readingDigest)) {
    return
  }
  if (chatId || hasWhatsapp) {
    await Promise.all([
      chatId && sendReading(chatId, userId, issue),
      hasWhatsapp && sendWhatsappReading(userId, issue),
    ])
    return
  }
  await notify(userId, readingNotification(settings.language, issue))
}

const sendWeeklyReport = async (userId: string, chatId: string | null) => {
  const { minutes } = await savedThisWeek(userId)
  if (minutes > 0) {
    await Promise.all([
      chatId && sendWeek(chatId, userId, minutes),
      sendWhatsappWeek(userId, minutes),
    ])
  }
}

/** Telegram and WhatsApp are Pro channels: without the agent the morning reaches devices only. */
const messengersOf = async (userId: string): Promise<Messengers> => {
  if (!hasAgent(await getPlanInfo(userId))) {
    return { chatId: null, hasWhatsapp: false }
  }
  const [chatId, whatsapp] = await Promise.all([
    chatIdForUser(userId),
    whatsappForUser(userId),
  ])
  return { chatId, hasWhatsapp: !!whatsapp }
}

/** Marked sent before sending, so a failed issue is not summarized and retried every minute. */
const sendMorningIfDue = async (settings: typeof userSettings.$inferSelect) => {
  const { userId } = settings
  if (!isMorningDue(settings)) {
    return
  }
  await db
    .update(userSettings)
    .set({ morningSentAt: new Date() })
    .where(eq(userSettings.userId, userId))
  const messengers = await messengersOf(userId)
  await sendReadingIssue(settings, messengers)
  const { date } = localClock(settings.timezone)
  const hasMessenger = !!messengers.chatId || messengers.hasWhatsapp
  if (hasMessenger && new Date(`${date}T12:00:00Z`).getUTCDay() === MONDAY) {
    await sendWeeklyReport(userId, messengers.chatId)
  }
}

const settingsWithAgent = () =>
  db.select().from(userSettings).where(hasAgentSql(userSettings.userId))

const sendDueMornings = async () => {
  for (const settings of await db.select().from(userSettings)) {
    // oxlint-disable-next-line eslint/no-await-in-loop -- issues are summarized one user at a time
    await sendMorningIfDue(settings).catch((error) =>
      logError(`morning ${settings.userId}`, error)
    )
  }
}

const offerDueCleanups = async () => {
  for (const settings of await settingsWithAgent()) {
    // oxlint-disable-next-line eslint/no-await-in-loop -- one 30-day subscription scan at a time
    await offerCleanup(settings).catch((error) =>
      logError(`cleanup ${settings.userId}`, error)
    )
  }
}

/** Right after the first sync, then once the user has sent `VOICE_EVERY_SENT` more emails, at most once a day. */
const learnDueVoices = async () => {
  const due = await db
    .select({ userId: userSettings.userId })
    .from(userSettings)
    .where(
      and(
        hasAgentSql(userSettings.userId),
        exists(
          db
            .select()
            .from(mailboxes)
            .where(
              and(
                eq(mailboxes.userId, userSettings.userId),
                isNotNull(mailboxes.lastSyncedAt)
              )
            )
        ),
        or(
          isNull(userSettings.voiceLearnedAt),
          and(
            lt(userSettings.voiceLearnedAt, subDays(new Date(), 1)),
            gte(
              db.$count(
                messages,
                and(
                  eq(messages.userId, userSettings.userId),
                  eq(messages.isFromMe, true),
                  gt(messages.receivedAt, userSettings.voiceLearnedAt)
                )
              ),
              VOICE_EVERY_SENT
            )
          )
        )
      )
    )
  for (const { userId } of due) {
    // oxlint-disable-next-line eslint/no-await-in-loop -- one style read at a time
    await learnVoice(userId).catch((error) =>
      logError(`voice ${userId}`, error)
    )
  }
}

/**
 * `notifiedAt` and the card's deliveries are written together: the card is queued exactly once, and each channel
 * then retries and falls back on its own (`dispatchDeliveries`), so a messenger that is down loses nothing.
 */
const notifyUrgent = async (id: string, userId: string) => {
  const queue = await listQueue(userId)
  const item = queue.find(({ action }) => action.id === id)
  const channels = item ? await availableChannels(userId, true) : []
  await db.transaction(async (tx) => {
    const [claimed] = await tx
      .update(actions)
      .set({ notifiedAt: new Date() })
      .where(and(eq(actions.id, id), isNull(actions.notifiedAt)))
      .returning({ id: actions.id })
    if (claimed && item) {
      await enqueueDelivery(
        userId,
        { actionId: id, channels, notice: urgentNotification(item) },
        tx
      )
    }
  })
}

const pushUrgent = async () => {
  const urgent = await db
    .select({ id: actions.id, userId: actions.userId })
    .from(actions)
    .leftJoin(analyses, eq(analyses.messageId, actions.messageId))
    .where(
      and(
        eq(actions.status, 'pending'),
        isNull(actions.notifiedAt),
        or(
          gte(analyses.importance, IMPORTANCE.critical),
          eq(actions.kind, 'security')
        )
      )
    )
  for (const { id, userId } of urgent) {
    // oxlint-disable-next-line eslint/no-await-in-loop -- urgent pushes go out in order
    await notifyUrgent(id, userId).catch((error) =>
      logError(`urgent ${id}`, error)
    )
  }
}

const tick = async () => {
  const ticked = await Result.tryPromise(() =>
    Promise.all([
      syncDueMailboxes(),
      renewWatches(),
      holdDueMail(),
      once('mornings', sendDueMornings),
      once('cleanups', offerDueCleanups),
      once('voices', learnDueVoices),
      once('urgent', async () => {
        await pushUrgent()
        await dispatchDeliveries()
      }),
      once('outbox', dispatchDueOutbox),
      once('reminders', processDueReminders),
      once('commitments', processDueCommitments),
      once('known-domains', refreshKnownDomains),
      once('search-index', indexStoredMail),
      once('bulk-prints', pruneBulkPrints),
      once('old-html', dropOldHtml),
    ])
  )
  if (ticked.isErr()) {
    logError('worker tick', ticked.error.cause)
  }
}

/** Railway sends SIGTERM on deploy and waits `drainingSeconds`: finish the jobs in flight, start no new ones. */
const DRAIN_MS = 25_000

const interval = setInterval(tick, TICK_MS)
void tick()
console.log('worker started')

process.on('SIGTERM', async () => {
  clearInterval(interval)
  const deadline = Date.now() + DRAIN_MS
  while (running.size > 0 && Date.now() < deadline) {
    // oxlint-disable-next-line eslint/no-await-in-loop -- polling the in-flight jobs until they finish
    await Bun.sleep(250)
  }
  console.log(`worker stopped, ${running.size} jobs left`)
  process.exit(0)
})
