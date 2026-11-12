import { db } from '@fewmail/db'
import { briefs } from '@fewmail/db/schema'
import { englishName } from '@fewmail/shared/i18n/locales'
import { generateText, Output } from 'ai'
import { type } from 'arktype'
import { subHours } from 'date-fns'
import { and, desc, eq } from 'drizzle-orm'

import { INFORMAL_ADDRESS, models, NO_EM_DASH } from '../lib/ai'
import { localClock } from '../lib/clock'
import { announceChange } from '../lib/live'
import { boardsDigest } from './boards'
import {
  handledSince,
  listQueue,
  listQueueWithLater,
  mailPulse,
  mailWithDates,
  recentImportant,
} from './mail'
import { listMailboxes } from './mailboxes'
import { awaitingReplies } from './reminders'
import { getSettings } from './settings'

const BRIEF_WINDOW_HOURS = 24
const RECENT_SHOWN = 8

const briefSchema = type({ body: 'string', headline: 'string' })

export const getLatestBrief = async (userId: string) => {
  const [brief] = await db
    .select()
    .from(briefs)
    .where(eq(briefs.userId, userId))
    .orderBy(desc(briefs.date))
    .limit(1)
  return brief ?? null
}

export const generateBrief = async (userId: string) => {
  const settings = await getSettings(userId)
  if (!settings) {
    throw new Error('Finish onboarding first')
  }

  const since = subHours(new Date(), BRIEF_WINDOW_HOURS)
  const [queue, important, handled] = await Promise.all([
    listQueue(userId),
    recentImportant(userId, BRIEF_WINDOW_HOURS),
    handledSince(userId, since),
  ])

  const { output } = await generateText({
    instructions: [
      `You write the user's email brief in ${englishName(settings.language)}, like a sharp personal assistant speaking to them directly.`,
      'headline: at most 6 words saying exactly needsUserCount things need the user (e.g. "Three things need you.") or, when it is 0, that all is calm.',
      'body: at most 2 short sentences and 35 words, plain prose without lists or markdown. The user sees every needsUser email as a card below, so do not enumerate them: name only the single most urgent of needsUser (of importantEmails only when needsUser is empty) with one concrete fact, then say in a few words how much was handled quietly.',
      'Never invent anything that is not in the data.',
      INFORMAL_ADDRESS,
      NO_EM_DASH,
    ].join('\n'),
    model: models.writer,
    output: Output.object({ schema: briefSchema }),
    prompt: JSON.stringify({
      handledQuietly: handled,
      importantEmails: important.map(({ analysis, message }) => ({
        from: message.fromName ?? message.fromEmail,
        importance: analysis.importance,
        summary: analysis.summary,
      })),
      needsUserCount: queue.length,
      needsUser: queue.map(({ action, analysis, message }) => ({
        from: message?.fromName ?? message?.fromEmail,
        kind: action.kind,
        receivedAt: message?.receivedAt,
        summary: analysis?.summary ?? action.title,
      })),
      now: new Date().toISOString(),
      timezone: settings.timezone,
    }),
  })

  const stats = {
    archived: handled.archived,
    filed: handled.markedRead,
    handled: handled.total,
    needYou: queue.length,
    unsubscribed: handled.unsubscribed,
  }
  const { date } = localClock(settings.timezone)

  const [brief] = await db
    .insert(briefs)
    .values({ ...output, date, stats, userId })
    .onConflictDoUpdate({
      set: { ...output, stats, telegramSentAt: null, updatedAt: new Date() },
      target: [briefs.userId, briefs.date],
    })
    .returning()
  if (!brief) {
    throw new Error('Brief upsert returned no row')
  }
  await announceChange(userId, ['today'])
  return brief
}

export const getToday = async (userId: string) => {
  const since = subHours(new Date(), BRIEF_WINDOW_HOURS)
  const [
    brief,
    { held, later, queue },
    handled,
    mailboxes,
    important,
    pulse,
    dates,
    awaiting,
    boards,
  ] = await Promise.all([
    getLatestBrief(userId),
    listQueueWithLater(userId),
    handledSince(userId, since),
    listMailboxes(userId),
    recentImportant(userId, BRIEF_WINDOW_HOURS),
    mailPulse(userId, since),
    mailWithDates(userId),
    awaitingReplies(userId),
    boardsDigest(userId),
  ])
  const queued = new Set([...queue, ...held].map(({ message }) => message?.id))
  return {
    awaiting,
    boards,
    brief,
    dates,
    handled,
    later,
    mailboxes,
    pulse,
    queue,
    recent: important
      .filter(({ message }) => !queued.has(message.id))
      .slice(0, RECENT_SHOWN),
  }
}

export const isBriefDue = async (
  userId: string,
  timezone: string,
  briefHour: number
) => {
  const { date, hour } = localClock(timezone)
  if (hour < briefHour) {
    return false
  }
  const [existing] = await db
    .select({ updatedAt: briefs.updatedAt })
    .from(briefs)
    .where(and(eq(briefs.userId, userId), eq(briefs.date, date)))
  return !existing || localClock(timezone, existing.updatedAt).hour < briefHour
}

export { localClock } from '../lib/clock'
