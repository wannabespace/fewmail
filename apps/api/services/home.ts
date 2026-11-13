import { db } from '@fewmail/db'
import { userSettings } from '@fewmail/db/schema'
import { differenceInHours, max, min, subDays, subHours } from 'date-fns'
import { eq } from 'drizzle-orm'

import { localClock } from '../lib/clock'
import { boardBanners, boardsDigest } from './boards'
import {
  freshCodes,
  handledSince,
  listHandled,
  listQueue,
  listTidy,
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

export const savedThisWeek = (userId: string) =>
  timeSaved(userId, subDays(new Date(), SAVED_WINDOW_DAYS))

export const getToday = async (userId: string) => {
  const { days, since } = catchUp(await getSettings(userId))
  const [
    queue,
    handled,
    mailboxes,
    important,
    pulse,
    dates,
    awaiting,
    boards,
    saved,
    banners,
    tidy,
    codes,
  ] = await Promise.all([
    listQueue(userId),
    handledSince(userId, since),
    listMailboxes(userId),
    recentImportant(userId, since),
    mailPulse(userId, since),
    mailWithDates(userId),
    awaitingReplies(userId),
    boardsDigest(userId),
    savedThisWeek(userId),
    boardBanners(userId),
    listTidy(userId),
    freshCodes(userId),
  ])
  const shown = new Set([
    ...queue.map(({ message }) => message?.id),
    ...codes.map(({ id }) => id),
  ])
  return {
    awaiting,
    banners,
    boards,
    codes,
    dates,
    days,
    handled,
    mailboxes,
    pulse,
    queue,
    recent: important
      .filter(({ message }) => !shown.has(message.id))
      .slice(0, RECENT_SHOWN_PER_DAY * days),
    saved,
    tidy,
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
