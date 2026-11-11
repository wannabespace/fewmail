import { db } from '@fewmail/db'
import { briefs } from '@fewmail/db/schema'
import { englishName } from '@fewmail/shared/i18n/locales'
import { generateText, Output } from 'ai'
import { type } from 'arktype'
import { subHours } from 'date-fns'
import { and, desc, eq } from 'drizzle-orm'

import { models } from '../lib/ai'
import { getMailbox, handledSince, listQueue, recentImportant } from './mail'
import { getSettings } from './settings'

const BRIEF_WINDOW_HOURS = 24

export const localClock = (timezone: string, date = new Date()) => {
  const parts = Object.fromEntries(
    new Intl.DateTimeFormat('en-CA', {
      day: '2-digit',
      hour: '2-digit',
      hourCycle: 'h23',
      month: '2-digit',
      timeZone: timezone,
      year: 'numeric',
    })
      .formatToParts(date)
      .map(({ type: part, value }) => [part, value])
  )
  return {
    date: `${parts.year}-${parts.month}-${parts.day}`,
    hour: Number(parts.hour),
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

  const since = subHours(new Date(), BRIEF_WINDOW_HOURS)
  const [queue, important, handled] = await Promise.all([
    listQueue(userId),
    recentImportant(userId, BRIEF_WINDOW_HOURS),
    handledSince(userId, since),
  ])

  const { output } = await generateText({
    instructions: [
      `You write the user's email brief in ${englishName(settings.language)}, like a sharp personal assistant speaking to them directly.`,
      'headline: one short sentence saying how many things need the user (e.g. "Three things need you.") or that all is calm.',
      'body: 2–4 sentences, plain prose without lists or markdown. Name people and concrete facts (amounts, dates, times). End with what was handled quietly.',
      settings.persona === 'reader'
        ? 'The user mostly reads: reassure them nothing important was missed and mention what is worth reading.'
        : 'The user replies a lot: lead with who is waiting for an answer and for how long.',
      'Never invent anything that is not in the data.',
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
      set: { ...output, stats, telegramSentAt: null },
      target: [briefs.userId, briefs.date],
    })
    .returning()
  if (!brief) {
    throw new Error('Brief upsert returned no row')
  }
  return brief
}

export const getToday = async (userId: string) => {
  const settings = await getSettings(userId)
  const [brief, queue, handled, mailbox] = await Promise.all([
    getLatestBrief(userId),
    listQueue(userId),
    handledSince(userId, subHours(new Date(), BRIEF_WINDOW_HOURS)),
    getMailbox(userId),
  ])
  return {
    brief,
    handled,
    mailbox: mailbox && {
      email: mailbox.email,
      lastSyncedAt: mailbox.lastSyncedAt,
      syncError: mailbox.syncError,
    },
    queue,
    settings,
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
    .select({ id: briefs.id })
    .from(briefs)
    .where(and(eq(briefs.userId, userId), eq(briefs.date, date)))
  return !existing
}
