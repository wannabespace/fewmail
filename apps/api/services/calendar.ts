import { db } from '@fewmail/db'
import { mailboxes } from '@fewmail/db/schema'
import { and, asc, eq, isNull } from 'drizzle-orm'

import type { CalendarEventFields } from '../lib/calendar'
import {
  CalendarScopeMissingError,
  deleteEvent as deleteGoogleEvent,
  insertEvent,
  listEvents as listGoogleEvents,
  patchEvent,
} from '../lib/calendar'
import { logError } from '../lib/log'
import { NotFoundError } from './mail-errors'
import { ownMailbox } from './mailboxes'

export interface EventRef {
  id: string
  mailboxId: string
}

const EVENTS_CACHE_MS = 60_000

type Mailbox = typeof mailboxes.$inferSelect
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
        email: mailbox.email,
        mailboxId: mailbox.id,
        signIn: mailbox.googleAccountId === null,
      }
      try {
        const events = await cachedEvents(mailbox, range)
        return {
          calendar: { ...calendar, connected: true },
          events: events.map((event) => ({ ...event, mailboxId: mailbox.id })),
        }
      } catch (error) {
        if (!(error instanceof CalendarScopeMissingError)) {
          logError('calendar list failed', error)
        }
        return { calendar: { ...calendar, connected: false }, events: [] }
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
  const created = await insertEvent(mailbox, event)
  forgetEvents(userId)
  return { ...created, mailboxId: mailbox.id }
}

export const updateEvent = async (
  userId: string,
  ref: EventRef,
  event: CalendarEventFields
) => {
  const updated = await patchEvent(
    await ownMailbox(userId, ref.mailboxId),
    ref.id,
    event
  )
  forgetEvents(userId)
  return { ...updated, mailboxId: ref.mailboxId }
}

export const deleteEvent = async (userId: string, ref: EventRef) => {
  await deleteGoogleEvent(await ownMailbox(userId, ref.mailboxId), ref.id)
  forgetEvents(userId)
}
