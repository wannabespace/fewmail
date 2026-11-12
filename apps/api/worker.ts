import process from 'node:process'

import { db } from '@fewmail/db'
import {
  actions,
  analyses,
  boards,
  briefs,
  mailboxes,
  schedules,
  userSettings,
} from '@fewmail/db/schema'
import { IMPORTANCE } from '@fewmail/shared/agent'
import { messages } from '@fewmail/shared/i18n'
import type { Messages } from '@fewmail/shared/i18n'
import { formatResetDay } from '@fewmail/shared/i18n/locales'
import { Result } from 'better-result'
import { subMinutes } from 'date-fns'
import { and, eq, gte, isNotNull, isNull, lt, lte, or } from 'drizzle-orm'

import { env } from './env'
import { announceChange } from './lib/live'
import { logError } from './lib/log'
import { seedBoards } from './services/boards'
import { generateBrief, getLatestBrief, isBriefDue } from './services/brief'
import { askAgent, postToChat } from './services/chat'
import { offerCleanup } from './services/cleanup'
import { followForwarded } from './services/forwarded'
import { mailboxesToWatch, watchMailbox } from './services/gmail-push'
import { chatIdForUser } from './services/integrations'
import { refreshKnownDomains } from './services/known-domains'
import { LimitReachedError } from './services/limit-error'
import { listQueue } from './services/mail'
import { briefVoice } from './services/messenger'
import {
  briefNotification,
  flushNotifications,
  notify,
  scheduleNotification,
  urgentNotification,
} from './services/notifications'
import { dispatchDueOutbox } from './services/outbox'
import {
  AgentRequiredError,
  getPlanInfo,
  hasAgent,
  hasAgentSql,
} from './services/plan'
import { getReading } from './services/reading'
import {
  processDueCommitments,
  processDueReminders,
} from './services/reminders'
import { nextRunAt } from './services/schedules'
import { getSettings } from './services/settings'
import {
  ensureMailbox,
  onNewMail,
  readBoardHistory,
  syncMailbox,
} from './services/sync'
import { sendBrief, sendReading, sendUrgent } from './telegram'
import {
  sendWhatsappBrief,
  sendWhatsappReading,
  sendWhatsappSchedule,
  sendWhatsappUrgent,
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

/** Today writes a brief the moment it opens, so one written while the first sync kept failing says the inbox is empty. */
const rewriteEarlyBrief = async (userId: string) => {
  if (hasAgent(await getPlanInfo(userId)) && (await getLatestBrief(userId))) {
    await generateBrief(userId)
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
      once(`sync:${mailbox.id}`, async () => {
        await syncMailbox(mailbox)
        if (!mailbox.historyId) {
          await rewriteEarlyBrief(mailbox.userId)
        }
      })
    ),
    ...withoutMailbox.map(({ userId }) =>
      once(`sync:${userId}`, async () =>
        syncMailbox(await ensureMailbox(userId))
      )
    ),
  ])
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

const BRIEF_RETRY_MS = 3_600_000

/** In memory: the worker runs as one replica, and a restart retrying at once is fine. */
const briefFailedAt = new Map<string, number>()

/** After the brief, once a day; nothing when no newsletter came. */
const sendReadingDigest = async (userId: string, chatId: string | null) => {
  const rows = await getReading(userId)
  if (rows.length === 0) {
    return
  }
  await Promise.all([
    chatId && sendReading(chatId, userId, rows),
    sendWhatsappReading(userId, rows),
  ])
}

const sendBriefIfDue = async (settings: typeof userSettings.$inferSelect) => {
  const { userId } = settings
  if (
    Date.now() - (briefFailedAt.get(userId) ?? 0) < BRIEF_RETRY_MS ||
    !(await isBriefDue(userId, settings.timezone, settings.briefHour))
  ) {
    return
  }
  const brief = await generateBrief(userId).catch((error: unknown) => {
    briefFailedAt.set(userId, Date.now())
    throw error
  })
  briefFailedAt.delete(userId)
  const chatId = await chatIdForUser(userId)
  const voice = await briefVoice(userId)
  if (chatId) {
    await sendBrief(chatId, userId, brief, voice)
    await db
      .update(briefs)
      .set({ telegramSentAt: new Date() })
      .where(eq(briefs.id, brief.id))
  }
  await sendWhatsappBrief(userId, brief, voice)
  notify(userId, briefNotification(brief))
  if (settings.readingDigest) {
    await sendReadingDigest(userId, chatId)
  }
}

const settingsWithAgent = () =>
  db.select().from(userSettings).where(hasAgentSql(userSettings.userId))

const sendDueBriefs = async () => {
  for (const settings of await settingsWithAgent()) {
    // oxlint-disable-next-line eslint/no-await-in-loop -- briefs are generated one user at a time
    await sendBriefIfDue(settings).catch((error) =>
      logError(`brief ${settings.userId}`, error)
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
  const chatId = await chatIdForUser(userId)
  const sent = await Promise.allSettled([
    chatId && sendUrgent(chatId, userId, item),
    sendWhatsappUrgent(userId, item),
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

type Schedule = typeof schedules.$inferSelect

const STALE_RUN_MINUTES = 15
const MAX_SCHEDULE_FAILURES = 3

/** Messengers get a link because approvals for a scheduled run happen in its web chat. */
const deliverScheduleRun = async (
  schedule: Schedule,
  t: Messages,
  text: string
) => {
  const { chatId, instruction, userId } = schedule
  notify(userId, scheduleNotification(instruction, text, chatId))
  await announceChange(userId, ['chats', 'schedules'])
  const run = {
    body: `${text}\n\n${t.schedule.open}: ${env.WEB_URL}/agent?chat=${chatId}`,
    headline: instruction,
  }
  const telegramChat = await chatIdForUser(userId)
  await Promise.all([
    telegramChat && sendBrief(telegramChat, userId, run),
    sendWhatsappSchedule(userId, run, chatId),
  ])
}

const runSchedule = async (schedule: Schedule) => {
  const { chatId, cron, id, instruction, userId } = schedule
  const settings = await getSettings(userId)
  const language = settings?.language ?? 'en'
  const t = messages[language]
  const finish = async (change: Partial<Schedule>) => {
    await db
      .update(schedules)
      .set({ runningSince: null, ...change })
      .where(eq(schedules.id, id))
  }
  const report = async (text: string) => {
    await postToChat(userId, { id: chatId, text, title: instruction })
    await deliverScheduleRun(schedule, t, text)
  }

  const answered = await Result.tryPromise(() =>
    askAgent(userId, { id: chatId, text: instruction })
  )
  if (answered.isErr()) {
    const error = answered.error.cause
    if (error instanceof AgentRequiredError) {
      await finish({ nextRunAt: await nextRunAt(userId, cron) })
      return
    }
    if (error instanceof LimitReachedError) {
      await finish({ nextRunAt: await nextRunAt(userId, cron, error.resetsAt) })
      await report(
        t.schedule.limitReached(formatResetDay(language, error.resetsAt))
      )
      return
    }
    logError(`schedule ${id}`, error)
    const failures = schedule.failures + 1
    if (failures >= MAX_SCHEDULE_FAILURES) {
      await db.delete(schedules).where(eq(schedules.id, id))
      await report(t.schedule.stopped)
      return
    }
    await finish({ failures, nextRunAt: await nextRunAt(userId, cron) })
    await report(t.schedule.failed)
    return
  }
  await finish({ failures: 0, nextRunAt: await nextRunAt(userId, cron) })
  await deliverScheduleRun(schedule, t, answered.value)
}

/** `runningSince` claims a run until it finishes; one older than `STALE_RUN_MINUTES` was cut off (a deploy, a crash) and runs again. */
const runDueSchedules = async () => {
  const now = new Date()
  const claimed = await db
    .update(schedules)
    .set({ runningSince: now })
    .where(
      and(
        lte(schedules.nextRunAt, now),
        or(
          isNull(schedules.runningSince),
          lt(schedules.runningSince, subMinutes(now, STALE_RUN_MINUTES))
        )
      )
    )
    .returning()
  await Promise.all(
    claimed.map((schedule) =>
      runSchedule(schedule).catch((error) =>
        logError(`schedule ${schedule.id}`, error)
      )
    )
  )
}

const tick = async () => {
  const ticked = await Result.tryPromise(() =>
    Promise.all([
      syncDueMailboxes(),
      renewWatches(),
      seedDueBoards(),
      readDueBoardHistory(),
      once('briefs', sendDueBriefs),
      once('cleanups', offerDueCleanups),
      once('urgent', pushUrgent),
      once('outbox', dispatchDueOutbox),
      once('reminders', processDueReminders),
      once('commitments', processDueCommitments),
      once('schedules', runDueSchedules),
      once('known-domains', refreshKnownDomains),
    ])
  )
  if (ticked.isErr()) {
    logError('worker tick', ticked.error.cause)
  }
}

/** Railway sends SIGTERM on deploy and waits `drainingSeconds`: finish the jobs in flight, start no new ones. */
const DRAIN_MS = 25_000

onNewMail(followForwarded)
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
