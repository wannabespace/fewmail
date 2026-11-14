import process from 'node:process'

import { db } from '@fewmail/db'
import {
  actions,
  analyses,
  boards,
  mailboxes,
  userSettings,
} from '@fewmail/db/schema'
import { IMPORTANCE } from '@fewmail/shared/agent'
import { Result } from 'better-result'
import { subMinutes } from 'date-fns'
import { and, eq, gt, gte, isNotNull, isNull, lt, or, sql } from 'drizzle-orm'

import { localClock } from './lib/clock'
import { logError } from './lib/log'
import { seedBoards } from './services/boards'
import { offerCleanup } from './services/cleanup'
import { mailboxesToWatch, watchMailbox } from './services/gmail-push'
import { savedThisWeek } from './services/home'
import {
  chatIdForUser,
  urgentPushTargets,
  whatsappForUser,
} from './services/integrations'
import { refreshKnownDomains } from './services/known-domains'
import { listQueue } from './services/mail'
import {
  flushNotifications,
  notify,
  urgentNotification,
} from './services/notifications'
import { dispatchDueOutbox } from './services/outbox'
import { getPlanInfo, hasAgent, hasAgentSql } from './services/plan'
import { getReadingSummary } from './services/reading'
import {
  processDueCommitments,
  processDueReminders,
} from './services/reminders'
import {
  ensureMailbox,
  HELD_MONTHS,
  holdEarlierMail,
  readBoardHistory,
  syncMailbox,
} from './services/sync'
import { sendReading, sendUrgent, sendWeek } from './telegram'
import {
  sendWhatsappReading,
  sendWhatsappUrgent,
  sendWhatsappWeek,
} from './whatsapp'

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

/** After the first sync, so the inbox is read before any history. */
const seedDueBoards = async () => {
  const due = await db
    .select()
    .from(mailboxes)
    .where(
      and(
        isNull(mailboxes.googleAccountId),
        isNull(mailboxes.boardsSeededAt),
        isNotNull(mailboxes.lastSyncedAt),
        hasAgentSql(mailboxes.userId)
      )
    )
  await Promise.all(
    due.map((mailbox) =>
      once(`boards-seed:${mailbox.userId}`, async () => {
        await seedBoards(mailbox.userId)
        await db
          .update(mailboxes)
          .set({ boardsSeededAt: new Date() })
          .where(eq(mailboxes.id, mailbox.id))
      })
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

const readDueBoardHistory = async () => {
  const due = await db.select().from(boards).where(isNull(boards.historyReadAt))
  await Promise.all(
    due.map((board) =>
      once(`board-history:${board.id}`, () => readBoardHistory(board))
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

const sendReadingDigest = async (userId: string, chatId: string | null) => {
  const reading = await getReadingSummary(userId)
  if (reading.rows.length === 0) {
    return
  }
  await Promise.all([
    chatId && sendReading(chatId, userId, reading),
    sendWhatsappReading(userId, reading),
  ])
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

/** Marked sent before sending, so a failed digest is not summarized and retried every minute. */
const sendMorningIfDue = async (settings: typeof userSettings.$inferSelect) => {
  const { userId } = settings
  if (!isMorningDue(settings)) {
    return
  }
  await db
    .update(userSettings)
    .set({ morningSentAt: new Date() })
    .where(eq(userSettings.userId, userId))
  const [chatId, whatsapp] = await Promise.all([
    chatIdForUser(userId),
    whatsappForUser(userId),
  ])
  if (!chatId && !whatsapp) {
    return
  }
  if (settings.readingDigest) {
    await sendReadingDigest(userId, chatId)
  }
  const { date } = localClock(settings.timezone)
  if (new Date(`${date}T12:00:00Z`).getUTCDay() === MONDAY) {
    await sendWeeklyReport(userId, chatId)
  }
}

const settingsWithAgent = () =>
  db.select().from(userSettings).where(hasAgentSql(userSettings.userId))

const sendDueMornings = async () => {
  for (const settings of await settingsWithAgent()) {
    // oxlint-disable-next-line eslint/no-await-in-loop -- digests are summarized one user at a time
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

/** Telegram and WhatsApp are Pro channels; device push reaches every plan. A failed channel never re-sends the others. */
const sendUrgentEverywhere = async (id: string, userId: string) => {
  const queue = await listQueue(userId)
  const item = queue.find(({ action }) => action.id === id)
  if (!item) {
    return
  }
  notify(userId, urgentNotification(item))
  if (!hasAgent(await getPlanInfo(userId))) {
    return
  }
  const { telegramChat, whatsapp } = await urgentPushTargets(userId)
  const sent = await Promise.allSettled([
    telegramChat && sendUrgent(telegramChat, userId, item),
    whatsapp && sendWhatsappUrgent(userId, item),
  ])
  for (const result of sent) {
    if (result.status === 'rejected') {
      logError(`urgent ${id}`, result.reason)
    }
  }
}

const notifyUrgent = async (id: string, userId: string) => {
  try {
    await sendUrgentEverywhere(id, userId)
  } finally {
    await db
      .update(actions)
      .set({ notifiedAt: new Date() })
      .where(eq(actions.id, id))
  }
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
      seedDueBoards(),
      readDueBoardHistory(),
      holdDueMail(),
      once('mornings', sendDueMornings),
      once('cleanups', offerDueCleanups),
      once('urgent', pushUrgent),
      once('outbox', dispatchDueOutbox),
      once('reminders', processDueReminders),
      once('commitments', processDueCommitments),
      once('known-domains', refreshKnownDomains),
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
  await flushNotifications()
  console.log(`worker stopped, ${running.size} jobs left`)
  process.exit(0)
})
