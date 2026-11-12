import { db } from '@fewmail/db'
import { briefs, userSettings } from '@fewmail/db/schema'
import { englishName } from '@fewmail/shared/i18n/locales'
import { generateText, Output } from 'ai'
import { type } from 'arktype'
import { differenceInHours, max, min, subDays, subHours } from 'date-fns'
import { and, desc, eq } from 'drizzle-orm'

import { INFORMAL_ADDRESS, models, NO_EM_DASH } from '../lib/ai'
import { localClock } from '../lib/clock'
import { announceChange } from '../lib/live'
import { boardBanners, boardsDigest } from './boards'
import {
  handledSince,
  listHandled,
  listQueue,
  listQueueWithLater,
  mailPulse,
  mailWithDates,
  recentImportant,
  timeSaved,
} from './mail'
import { listMailboxes } from './mailboxes'
import { awaitingReplies } from './reminders'
import { getSettings } from './settings'

const CATCH_UP_MIN_HOURS = 24
const CATCH_UP_MAX_DAYS = 7
const RECENT_SHOWN_PER_DAY = 8
const SAVED_WINDOW_DAYS = 7

type Settings = typeof userSettings.$inferSelect

const lastVisit = (settings: Settings, now: Date) =>
  settings.todayOpenedAt &&
  localClock(settings.timezone, settings.todayOpenedAt).date !==
    localClock(settings.timezone, now).date
    ? settings.todayOpenedAt
    : settings.todaySince

const catchUp = (settings: Settings | null, now = new Date()) => {
  const since = max([
    subDays(now, CATCH_UP_MAX_DAYS),
    min([
      (settings && lastVisit(settings, now)) ?? now,
      subHours(now, CATCH_UP_MIN_HOURS),
    ]),
  ])
  return {
    days: Math.max(1, Math.round(differenceInHours(now, since) / 24)),
    since,
  }
}

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

  const { days, since } = catchUp(settings)
  const [queue, important, handled, saved] = await Promise.all([
    listQueue(userId),
    recentImportant(userId, since),
    handledSince(userId, since),
    timeSaved(userId, subDays(new Date(), SAVED_WINDOW_DAYS)),
  ])

  const { output } = await generateText({
    instructions: [
      `You write the user's email brief in ${englishName(settings.language)}, like a sharp personal assistant speaking to them directly.`,
      'headline: at most 6 words saying exactly needsUserCount things need the user (e.g. "Three things need you.") or, when it is 0, that all is calm.',
      'body: at most 2 short sentences and 35 words, plain prose without lists or markdown. The user sees every needsUser email as a card below, so do not enumerate them: name only the single most urgent of needsUser (of importantEmails only when needsUser is empty) with one concrete fact, then say in a few words how much was handled quietly.',
      'The data covers the last coversDays days, since the user last opened Fewmail; when that is more than 1, say the handled count is over those days.',
      'Never invent anything that is not in the data.',
      INFORMAL_ADDRESS,
      NO_EM_DASH,
    ].join('\n'),
    model: models.writer,
    output: Output.object({ schema: briefSchema }),
    prompt: JSON.stringify({
      coversDays: days,
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
    savedMinutes: saved.minutes,
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
  const { days, since } = catchUp(await getSettings(userId))
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
    saved,
    banners,
  ] = await Promise.all([
    getLatestBrief(userId),
    listQueueWithLater(userId),
    handledSince(userId, since),
    listMailboxes(userId),
    recentImportant(userId, since),
    mailPulse(userId, since),
    mailWithDates(userId),
    awaitingReplies(userId),
    boardsDigest(userId),
    timeSaved(userId, subDays(new Date(), SAVED_WINDOW_DAYS)),
    boardBanners(userId),
  ])
  const queued = new Set([...queue, ...held].map(({ message }) => message?.id))
  return {
    awaiting,
    banners,
    boards,
    brief,
    dates,
    days,
    handled,
    later,
    mailboxes,
    pulse,
    queue,
    recent: important
      .filter(({ message }) => !queued.has(message.id))
      .slice(0, RECENT_SHOWN_PER_DAY * days),
    saved,
  }
}

export const openToday = async (userId: string) => {
  const settings = await getSettings(userId)
  if (settings) {
    const now = new Date()
    await db
      .update(userSettings)
      .set({ todayOpenedAt: now, todaySince: lastVisit(settings, now) })
      .where(eq(userSettings.userId, userId))
  }
  return getToday(userId)
}

export const listTodayHandled = async (userId: string) =>
  listHandled(userId, catchUp(await getSettings(userId)).since)

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
