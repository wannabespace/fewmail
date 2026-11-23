import { Buffer } from 'node:buffer'
import { createHmac, timingSafeEqual } from 'node:crypto'

import { db } from '@fewmail/db'
import { analyses, messages, unsubscribes } from '@fewmail/db/schema'
import { LIST_CATEGORIES, PEOPLE_CATEGORIES } from '@fewmail/shared/agent'
import type { WrappedPeriod, WrappedStats } from '@fewmail/shared/agent'
import type { Locale } from '@fewmail/shared/i18n/locales'
import {
  and,
  count,
  desc,
  eq,
  gte,
  inArray,
  notInArray,
  sql,
} from 'drizzle-orm'

import { env } from '../env'
import { localClock, postgresZone } from '../lib/clock'
import { handledSince, mailPulse, timeSaved } from './mail'
import { NotFoundError } from './mail-errors'
import { getSettings } from './settings'

const TOP_PEOPLE = 3

/** Read in UTC: a few hours either side of midnight do not change a month's numbers. */
const periodOf = (timezone: string, period: WrappedPeriod) => {
  const [year = '', month = ''] = localClock(timezone).date.split('-')
  return period === 'year'
    ? { label: year, since: new Date(`${year}-01-01T00:00:00Z`) }
    : {
        label: `${year}-${month}`,
        since: new Date(`${year}-${month}-01T00:00:00Z`),
      }
}

const busiest = async (
  userId: string,
  since: Date,
  timezone: string,
  unit: 'isodow' | 'hour'
) => {
  const bucket = sql<number>`extract(${sql.raw(unit)} from ${messages.receivedAt} at time zone ${timezone})::int`
  const [row] = await db
    .select({ bucket, total: count() })
    .from(messages)
    .where(
      and(
        eq(messages.userId, userId),
        eq(messages.isFromMe, false),
        gte(messages.receivedAt, since)
      )
    )
    // By position: the timezone is a bound parameter, so a repeated `bucket` is a different expression to Postgres.
    .groupBy(sql`1`)
    .orderBy(desc(count()))
    .limit(1)
  return row?.bucket ?? null
}

/** Counted the way `mailPulse` counts people: all a person sent except mailing-list mail. */
const topPeople = (userId: string, since: Date) => {
  const sent = sql<number>`count(*) filter (where ${analyses.category} is null or ${notInArray(analyses.category, [...LIST_CATEGORIES])})::int`
  return db
    .select({
      count: sent,
      fromEmail: messages.fromEmail,
      fromName: sql<string | null>`max(${messages.fromName})`.mapWith(
        messages.fromName
      ),
    })
    .from(messages)
    .leftJoin(analyses, eq(analyses.messageId, messages.id))
    .where(
      and(
        eq(messages.userId, userId),
        eq(messages.isFromMe, false),
        gte(messages.receivedAt, since)
      )
    )
    .groupBy(messages.fromEmail)
    .having(sql`bool_or(${inArray(analyses.category, [...PEOPLE_CATEGORIES])})`)
    .orderBy(desc(sent))
    .limit(TOP_PEOPLE)
}

const unsubscribedSince = async (userId: string, since: Date) => {
  const [row] = await db
    .select({ total: count() })
    .from(unsubscribes)
    .where(
      and(eq(unsubscribes.userId, userId), gte(unsubscribes.createdAt, since))
    )
  return row?.total ?? 0
}

const signature = (payload: string) =>
  createHmac('sha256', env.BETTER_AUTH_SECRET)
    .update(`wrapped:${payload}`)
    .digest('base64url')

export interface Shared {
  label: string
  /** The sharer's language, for the link's preview image. */
  locale: Locale
  period: WrappedPeriod
  stats: WrappedStats
}

/** The link carries its own numbers, signed so nobody can mint a card in our name. */
const shareToken = (shared: Shared) => {
  const payload = Buffer.from(JSON.stringify(shared)).toString('base64url')
  return `${payload}.${signature(payload)}`
}

export const readSharedWrapped = (token: string): Shared => {
  const [payload = '', signed = '', ...rest] = token.split('.')
  if (rest.length > 0) {
    throw new NotFoundError('Wrapped link not found')
  }
  const expected = Buffer.from(signature(payload))
  const given = Buffer.from(signed)
  if (given.length !== expected.length || !timingSafeEqual(given, expected)) {
    throw new NotFoundError('Wrapped link not found')
  }
  return JSON.parse(Buffer.from(payload, 'base64url').toString()) as Shared
}

/** The user's mail so far this year or month; `people` stays in the app and never goes into the link. */
export const getWrapped = async (userId: string, period: WrappedPeriod) => {
  const settings = await getSettings(userId)
  if (!settings) {
    throw new NotFoundError('Open the app once first')
  }
  const { label, since } = periodOf(settings.timezone, period)
  const zone = await postgresZone(settings.timezone)
  const [pulse, handled, saved, unsubscribed, weekday, hour, people] =
    await Promise.all([
      mailPulse(userId, since),
      handledSince(userId, since, true),
      timeSaved(userId, since),
      unsubscribedSince(userId, since),
      busiest(userId, since, zone, 'isodow'),
      busiest(userId, since, zone, 'hour'),
      topPeople(userId, since),
    ])
  const stats: WrappedStats = {
    busiestHour: hour,
    busiestWeekday: weekday,
    emails: pulse.total,
    fromLists: pulse.lists,
    fromPeople: pulse.people,
    handled: handled.total,
    replies: saved.replies,
    savedMinutes: saved.minutes,
    spam: handled.spam,
    unsubscribed,
  }
  return {
    label,
    people,
    period,
    shareToken: shareToken({
      label,
      locale: settings.language,
      period,
      stats,
    }),
    stats,
  }
}
