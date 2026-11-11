import process from 'node:process'

import { db } from '@fewmail/db'
import {
  actions,
  analyses,
  briefs,
  mailboxes,
  userSettings,
} from '@fewmail/db/schema'
import { IMPORTANCE } from '@fewmail/shared/agent'
import { subMinutes } from 'date-fns'
import { and, eq, gte, isNotNull, isNull, lt, or } from 'drizzle-orm'

import { generateBrief, isBriefDue } from './services/brief'
import { offerCleanup } from './services/cleanup'
import { chatIdForUser } from './services/integrations'
import { refreshKnownDomains } from './services/known-domains'
import { listQueue } from './services/mail'
import {
  briefNotification,
  flushNotifications,
  notify,
  urgentNotification,
} from './services/notifications'
import { dispatchDueOutbox } from './services/outbox'
import { getPlanInfo, hasAgent } from './services/plan'
import {
  processDueCommitments,
  processDueReminders,
} from './services/reminders'
import { ensureMailbox, readMoneyHistory, syncMailbox } from './services/sync'
import { sendBrief, sendUrgent } from './telegram'
import { sendWhatsappBrief, sendWhatsappUrgent } from './whatsapp'

const TICK_MS = 60_000
const SYNC_EVERY_MINUTES = 2

const running = new Set<string>()

const once = async (key: string, run: () => Promise<unknown>) => {
  if (running.has(key)) {
    return
  }
  running.add(key)
  try {
    await run()
  } catch (error) {
    console.error(`worker ${key}`, error)
  } finally {
    running.delete(key)
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

/** After the first sync, so the inbox is read before the history. */
const readDueMoneyHistory = async () => {
  const due = await db
    .select()
    .from(mailboxes)
    .where(
      and(isNull(mailboxes.moneyHistoryAt), isNotNull(mailboxes.lastSyncedAt))
    )
  await Promise.all(
    due.map((mailbox) =>
      once(`money-history:${mailbox.id}`, async () => {
        if (hasAgent(await getPlanInfo(mailbox.userId))) {
          await readMoneyHistory(mailbox)
        }
      })
    )
  )
}

const sendBriefIfDue = async (settings: typeof userSettings.$inferSelect) => {
  if (!hasAgent(await getPlanInfo(settings.userId))) {
    return
  }
  await offerCleanup(settings.userId)
  if (
    !(await isBriefDue(settings.userId, settings.timezone, settings.briefHour))
  ) {
    return
  }
  await once(`brief:${settings.userId}`, async () => {
    const brief = await generateBrief(settings.userId)
    const chatId = await chatIdForUser(settings.userId)
    if (chatId) {
      await sendBrief(chatId, settings.userId, brief)
      await db
        .update(briefs)
        .set({ telegramSentAt: new Date() })
        .where(eq(briefs.id, brief.id))
    }
    await sendWhatsappBrief(settings.userId, brief)
    notify(settings.userId, briefNotification(brief))
  })
}

const sendDueBriefs = async () => {
  const everyone = await db.select().from(userSettings)
  for (const settings of everyone) {
    // oxlint-disable-next-line eslint/no-await-in-loop -- briefs are generated one user at a time
    await sendBriefIfDue(settings)
  }
}

const notifyUrgent = async (id: string, userId: string) => {
  const queue = await listQueue(userId)
  const item = queue.find(({ action }) => action.id === id)
  if (item) {
    const chatId = await chatIdForUser(userId)
    if (chatId) {
      await sendUrgent(chatId, userId, item)
    }
    await sendWhatsappUrgent(userId, item)
    notify(userId, urgentNotification(item))
  }
  await db
    .update(actions)
    .set({ notifiedAt: new Date() })
    .where(eq(actions.id, id))
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
    await notifyUrgent(id, userId)
  }
}

const tick = async () => {
  try {
    await Promise.all([
      syncDueMailboxes(),
      readDueMoneyHistory(),
      once('briefs', sendDueBriefs),
      once('urgent', pushUrgent),
      once('outbox', dispatchDueOutbox),
      once('reminders', processDueReminders),
      once('commitments', processDueCommitments),
      once('known-domains', refreshKnownDomains),
    ])
  } catch (error) {
    console.error('worker tick', error)
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
