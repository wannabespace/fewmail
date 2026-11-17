import { db } from '@fewmail/db'
import { mailboxes } from '@fewmail/db/schema'
import type { EventScope } from '@fewmail/shared/agent'
import { Result } from 'better-result'
import { and, asc, eq, isNull } from 'drizzle-orm'

import { CALENDAR_SCOPE, hasSignInScope } from '../lib/auth'
import type { CalendarEventFields } from '../lib/calendar'
import {
  deleteEvent as deleteGoogleEvent,
  insertEvent,
  listEvents as listGoogleEvents,
  patchEvent,
} from '../lib/calendar'
import { logError } from '../lib/log'
import { NotFoundError } from './mail-errors'
import { ownMailbox } from './mailboxes'

interface EventRef {
  id: string
  mailboxId: string
}

const EVENTS_CACHE_MS = 60_000

type Mailbox = typeof mailboxes.$inferSelect

/** Google's consent screen lets the user untick Calendar while keeping Gmail. */
export class CalendarAccessError extends Error {
  override name = 'CalendarAccessError'

  constructor() {
    super('Fewmail has no access to this Google calendar')
  }
}

/** Added mailboxes are refused without the Calendar scope, so only the sign-in grant can lack it. */
const isConnected = async (mailbox: Mailbox) =>
  Boolean(mailbox.googleAccountId) ||
  (await hasSignInScope(mailbox.userId, CALENDAR_SCOPE))

/** Any calendar of the user's: without one the web hides the Calendar page and everything leading to it. */
export const hasCalendar = async (userId: string) => {
  const owned = await db
    .select()
    .from(mailboxes)
    .where(eq(mailboxes.userId, userId))
  const connected = await Promise.all(owned.map(isConnected))
  return connected.some(Boolean)
}

/** A card's meeting goes in its email's mailbox calendar, so a mailbox without one gets no meeting to approve. */
export const hasMailboxCalendar = async (mailboxId: string) => {
  const [mailbox] = await db
    .select()
    .from(mailboxes)
    .where(eq(mailboxes.id, mailboxId))
  return mailbox ? isConnected(mailbox) : false
}

const requireConnected = async (mailbox: Mailbox) => {
  if (!(await isConnected(mailbox))) {
    throw new CalendarAccessError()
  }
  return mailbox
}
type EventCache = Map<
  string,
  {
    events: Awaited<ReturnType<typeof listGoogleEvents>>
    expiresAt: number
  }
>

// Replaced, never cleared, on a change: a read still in flight then fills the dropped map, not the new one.
const eventCaches = new Map<string, EventCache>()

const cachedEvents = async (
  mailbox: Mailbox,
  range: { from: Date; to: Date }
) => {
  const cache: EventCache = eventCaches.get(mailbox.userId) ?? new Map()
  eventCaches.set(mailbox.userId, cache)
  const key = `${mailbox.id} ${range.from.toISOString()} ${range.to.toISOString()}`
  const now = Date.now()
  const hit = cache.get(key)
  if (hit && hit.expiresAt > now) {
    return hit.events
  }
  const events = await listGoogleEvents(mailbox, range)
  for (const [stale, { expiresAt }] of cache) {
    if (expiresAt <= now) {
      cache.delete(stale)
    }
  }
  cache.set(key, { events, expiresAt: now + EVENTS_CACHE_MS })
  return events
}

const forgetEvents = (userId: string) => {
  eventCaches.delete(userId)
}

/** Events are read live from each mailbox's primary Google calendar, never stored; reads are cached for a minute. */
export const listEvents = async (
  userId: string,
  range: { from: Date; to: Date }
) => {
  const owned = await db
    .select()
    .from(mailboxes)
    .where(eq(mailboxes.userId, userId))
    .orderBy(asc(mailboxes.createdAt))
  const perMailbox = await Promise.all(
    owned.map(async (mailbox) => {
      const calendar = {
        connected: await isConnected(mailbox),
        email: mailbox.email,
        mailboxId: mailbox.id,
      }
      if (!calendar.connected) {
        return { calendar, events: [] }
      }
      const events = await Result.tryPromise(() => cachedEvents(mailbox, range))
      if (events.isErr()) {
        logError('calendar list failed', events.error.cause)
        return { calendar, events: [] }
      }
      return {
        calendar,
        events: events.value.map((event) => ({
          ...event,
          mailboxId: mailbox.id,
        })),
      }
    })
  )
  return {
    calendars: perMailbox.map(({ calendar }) => calendar),
    events: perMailbox
      .flatMap(({ events }) => events)
      .toSorted((a, b) => a.start.localeCompare(b.start)),
  }
}

/** Without `mailboxId` the event goes to the sign-in mailbox's calendar. */
export const createEvent = async (
  userId: string,
  event: CalendarEventFields & { mailboxId?: string }
) => {
  const [mailbox] = event.mailboxId
    ? [await ownMailbox(userId, event.mailboxId)]
    : await db
        .select()
        .from(mailboxes)
        .where(
          and(eq(mailboxes.userId, userId), isNull(mailboxes.googleAccountId))
        )
  if (!mailbox) {
    throw new NotFoundError('Mailbox not found')
  }
  const created = await insertEvent(await requireConnected(mailbox), event)
  forgetEvents(userId)
  return { ...created, mailboxId: mailbox.id }
}

export const updateEvent = async (
  userId: string,
  ref: EventRef,
  event: CalendarEventFields,
  scope?: EventScope
) => {
  const updated = await patchEvent(
    await requireConnected(await ownMailbox(userId, ref.mailboxId)),
    ref.id,
    event,
    scope
  )
  forgetEvents(userId)
  return { ...updated, mailboxId: ref.mailboxId }
}

export const deleteEvent = async (
  userId: string,
  ref: EventRef,
  scope?: EventScope
) => {
  await deleteGoogleEvent(
    await requireConnected(await ownMailbox(userId, ref.mailboxId)),
    ref.id,
    scope
  )
  forgetEvents(userId)
}
