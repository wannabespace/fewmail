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
import { and, eq, gte, isNull, lt, or } from 'drizzle-orm'

import { generateBrief, isBriefDue } from './services/brief'
import { chatIdForUser } from './services/integrations'
import { listQueue } from './services/mail'
import { dispatchDueOutbox } from './services/outbox'
import { getPlanInfo, hasAgent } from './services/plan'
import { processDueReminders } from './services/reminders'
import { syncMailbox } from './services/sync'
import { sendBrief, sendUrgent } from './telegram'

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
  await Promise.all(
    due.map((mailbox) =>
      once(`sync:${mailbox.userId}`, () => syncMailbox(mailbox))
    )
  )
}

const sendBriefIfDue = async (settings: typeof userSettings.$inferSelect) => {
  if (
    !hasAgent(await getPlanInfo(settings.userId)) ||
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
  const chatId = await chatIdForUser(userId)
  if (chatId) {
    const queue = await listQueue(userId)
    const item = queue.find(({ action }) => action.id === id)
    if (item) {
      await sendUrgent(chatId, userId, item)
    }
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
    .innerJoin(analyses, eq(analyses.messageId, actions.messageId))
    .where(
      and(
        eq(actions.status, 'pending'),
        isNull(actions.notifiedAt),
        gte(analyses.importance, IMPORTANCE.critical)
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
      once('briefs', sendDueBriefs),
      once('urgent', pushUrgent),
      once('outbox', dispatchDueOutbox),
      once('reminders', processDueReminders),
    ])
  } catch (error) {
    console.error('worker tick', error)
  }
}

export const startWorker = () => {
  void tick()
  setInterval(tick, TICK_MS)
}
