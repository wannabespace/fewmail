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
import { NotFoundError } from './mail-errors'
import { ownMailbox } from './mailboxes'

export interface EventRef {
  id: string
  mailboxId: string
}

/** Events are read live from each mailbox's primary Google calendar, never stored. */
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
        const events = await listGoogleEvents(mailbox, range)
        return {
          calendar: { ...calendar, connected: true },
          events: events.map((event) => ({ ...event, mailboxId: mailbox.id })),
        }
      } catch (error) {
        if (error instanceof CalendarScopeMissingError) {
          return { calendar: { ...calendar, connected: false }, events: [] }
        }
        throw error
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
  return { ...(await insertEvent(mailbox, event)), mailboxId: mailbox.id }
}

export const updateEvent = async (
  userId: string,
  ref: EventRef,
  event: CalendarEventFields
) => ({
  ...(await patchEvent(await ownMailbox(userId, ref.mailboxId), ref.id, event)),
  mailboxId: ref.mailboxId,
})

export const deleteEvent = async (userId: string, ref: EventRef) => {
  await deleteGoogleEvent(await ownMailbox(userId, ref.mailboxId), ref.id)
}
