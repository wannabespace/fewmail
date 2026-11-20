import { db } from '@fewmail/db'
import {
  actions,
  analyses,
  botPosts,
  bots,
  mailboxes as mailboxRows,
  messages,
  userSettings,
} from '@fewmail/db/schema'
import { botOfCard, IMPORTANCE, PROPOSAL_KINDS } from '@fewmail/shared/agent'
import type { ActionKind } from '@fewmail/shared/agent'
import { differenceInHours, max, min, subDays, subHours } from 'date-fns'
import {
  and,
  arrayContains,
  desc,
  eq,
  exists,
  gte,
  inArray,
  isNotNull,
  isNull,
  notExists,
  or,
  sql,
} from 'drizzle-orm'

import { localClock } from '../lib/clock'
import { announceChange } from '../lib/live'
import { expectRow } from '../lib/rows'
import { newSenders, botSuggestions } from './cleanup'
import {
  countImportant,
  freshCodes,
  handledSince,
  listHandled,
  listQueue,
  notBinned,
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
const DATES_SHOWN = 6
const JOURNAL_DAYS = 7
const ISO_DATE = /^\d{4}-\d{2}-\d{2}/u

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

type Dated = Awaited<ReturnType<typeof mailWithDates>>[number]

const isoDue = ({ analysis }: Dated) =>
  analysis.extracted.dueDate && ISO_DATE.test(analysis.extracted.dueDate)
    ? analysis.extracted.dueDate.slice(0, 10)
    : null

/** A thread's newest dated email is the one that holds: a moved meeting leaves the old time behind. */
const newestPerThread = (dated: Dated[]) => {
  const threads = new Set<string>()
  return dated.filter(({ message }) => {
    const isNewest = !threads.has(message.threadId)
    threads.add(message.threadId)
    return isNewest
  })
}

/** A code has its own block while fresh and means nothing once it expired. */
const hasCode = ({ message }: { message: { code: string | null } }) =>
  !!message.code

/** A due date the model wrote as ISO sorts soonest first and drops once passed; any other date stays as written, newest mail first. */
const upcoming = (dated: Dated[], today: string) =>
  dated
    .filter((item) => (isoDue(item) ?? today) >= today)
    .toSorted((a, b) => {
      const [dueA, dueB] = [isoDue(a), isoDue(b)]
      if (dueA && dueB) {
        return dueA.localeCompare(dueB)
      }
      return Number(!dueA) - Number(!dueB)
    })

/** Unanalysed inbox mail of the last day, counted only while a sync is under way, so a failed analysis never reads forever. */
const readingNow = async (userId: string) => {
  const [row] = await db
    .select({ total: sql<number>`count(*)::int` })
    .from(messages)
    .where(
      and(
        eq(messages.userId, userId),
        eq(messages.isFromMe, false),
        arrayContains(messages.labelIds, ['INBOX']),
        gte(messages.receivedAt, subDays(new Date(), 1)),
        exists(
          db
            .select({ id: mailboxRows.id })
            .from(mailboxRows)
            .where(
              and(
                eq(mailboxRows.userId, userId),
                isNotNull(mailboxRows.syncStartedAt)
              )
            )
        ),
        notExists(
          db
            .select({ id: analyses.messageId })
            .from(analyses)
            .where(eq(analyses.messageId, messages.id))
        ),
        notExists(
          db
            .select({ id: actions.id })
            .from(actions)
            .where(eq(actions.messageId, messages.id))
        )
      )
    )
  return expectRow(row).total
}

export const getToday = async (userId: string) => {
  const settings = await getSettings(userId)
  const { days, since } = catchUp(settings)
  const [
    queue,
    handled,
    mailboxes,
    important,
    pulse,
    dates,
    awaiting,
    saved,
    tidy,
    codes,
    senders,
    reading,
    suggestions,
  ] = await Promise.all([
    listQueue(userId),
    handledSince(userId, since),
    listMailboxes(userId),
    recentImportant(userId, since),
    mailPulse(userId, since),
    mailWithDates(userId),
    awaitingReplies(userId),
    savedThisWeek(userId),
    listTidy(userId),
    freshCodes(userId),
    newSenders(userId),
    readingNow(userId),
    botSuggestions(userId),
  ])
  // What the agent proposes to tidy is noise by its own judgement, so Worth knowing never offers it to read as well.
  const shown = new Set([
    ...queue.map(({ message }) => message?.id),
    ...codes.map(({ id }) => id),
    ...tidy.map(({ message }) => message.id),
  ])
  const datesShown = upcoming(
    newestPerThread(dates).filter(
      (item) => !shown.has(item.message.id) && !hasCode(item)
    ),
    localClock(settings?.timezone ?? 'UTC').date
  ).slice(0, DATES_SHOWN)
  for (const { message } of datesShown) {
    shown.add(message.id)
  }
  const askedSenders = new Set(senders.map(({ fromEmail }) => fromEmail))
  return {
    awaiting,
    codes,
    dates: datesShown,
    days,
    handled,
    mailboxes,
    pulse,
    newSenders: senders,
    queue,
    reading,
    recent: important
      .filter((item) => !shown.has(item.message.id) && !hasCode(item))
      .slice(0, RECENT_SHOWN_PER_DAY * days),
    botSuggestions: suggestions.filter(
      ({ fromEmail }) => !askedSenders.has(fromEmail)
    ),
    saved,
    tidy,
  }
}

/**
 * Each bot's report of the day, after the first read and every morning: Fewmail's always, with its headline's counts,
 * another bot's only while cards of its own wait. The cards are kept as ids, so the chat reads them as they are now.
 */
export const writeDigests = async (userId: string) => {
  const settings = await getSettings(userId)
  const { days, since } = catchUp(settings)
  const [queue, own, decisions, handled, pulse] = await Promise.all([
    listQueue(userId),
    db.select({ id: bots.id }).from(bots).where(eq(bots.userId, userId)),
    countImportant(userId),
    handledSince(userId, since),
    mailPulse(userId, since),
  ])
  const waiting = queue.filter(
    ({ action }) => !(PROPOSAL_KINDS as readonly string[]).includes(action.kind)
  )
  const idsOf = (bot: string) =>
    waiting
      .filter((card) => botOfCard(card) === bot)
      .map(({ action }) => action.id)
  await db.insert(botPosts).values([
    {
      actionIds: idsOf('fewmail'),
      bot: 'fewmail',
      counts: {
        days,
        decisions,
        handled: handled.total,
        people: pulse.people,
        total: pulse.total,
      },
      kind: 'digest',
      userId,
    },
    ...own
      .map(({ id }) => ({ actionIds: idsOf(id), bot: id }))
      .filter(({ actionIds }) => actionIds.length > 0)
      .map((post) => ({ ...post, kind: 'digest' as const, userId })),
  ])
  await announceChange(userId, ['bots'])
}

/** Only the person looking at Home is a visit (never a live refetch or the agent); `seenAt` is the one before, so the page can mark what came since. */
export const openToday = async (userId: string) => {
  const settings = await getSettings(userId)
  if (!settings) {
    return { seenAt: null }
  }
  const now = new Date()
  await db
    .update(userSettings)
    .set({ todayOpenedAt: now, todaySince: lastVisit(settings, now) })
    .where(eq(userSettings.userId, userId))
  return { seenAt: settings.todayOpenedAt }
}

export const listJournal = (userId: string) =>
  listHandled(userId, subDays(new Date(), JOURNAL_DAYS))

/** A card is news in the banner for a day; after that it only waits on Home. */
const BANNER_HOURS = 24
const BANNER_SHOWN = 10
const BANNER_ORDER = ['risk', 'consent', 'urgent'] as const
const BANNER_KINDS: Partial<Record<ActionKind, (typeof BANNER_ORDER)[number]>> =
  { consent: 'consent', security: 'risk' }

/**
 * What every page's notice bar raises besides codes and mailbox trouble, most pressing first: a risk, a request
 * waiting for the user's yes, urgent mail. Only pending cards of the last day whose banner the user did not put away;
 * the yes itself is never in the banner, it opens the card.
 */
export const listBanner = async (userId: string) => {
  const rows = await db
    .select({
      createdAt: actions.createdAt,
      fromEmail: messages.fromEmail,
      fromName: messages.fromName,
      id: actions.id,
      kind: actions.kind,
      reason: actions.reason,
      subject: messages.subject,
      threadId: actions.threadId,
      title: actions.title,
    })
    .from(actions)
    .leftJoin(messages, eq(messages.id, actions.messageId))
    .leftJoin(analyses, eq(analyses.messageId, actions.messageId))
    .where(
      and(
        eq(actions.userId, userId),
        eq(actions.status, 'pending'),
        notBinned,
        isNull(actions.bannerDismissedAt),
        gte(actions.createdAt, subHours(new Date(), BANNER_HOURS)),
        or(
          inArray(actions.kind, ['security', 'consent']),
          gte(analyses.importance, IMPORTANCE.critical)
        )
      )
    )
    .orderBy(desc(actions.createdAt))
    .limit(BANNER_SHOWN)
  const items = rows.map(({ kind, ...row }) => ({
    ...row,
    kind: BANNER_KINDS[kind] ?? ('urgent' as const),
  }))
  return items.toSorted(
    (a, b) => BANNER_ORDER.indexOf(a.kind) - BANNER_ORDER.indexOf(b.kind)
  )
}

/** Put away in one tab, gone in every other and on the phone; the card stays on Home. */
export const dismissBanner = async (userId: string, actionId: string) => {
  await db
    .update(actions)
    .set({ bannerDismissedAt: new Date() })
    .where(and(eq(actions.id, actionId), eq(actions.userId, userId)))
  await announceChange(userId, ['today'])
}
