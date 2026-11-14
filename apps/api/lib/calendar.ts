import type { GmailAccount } from './auth'
import { gmailAccessToken } from './auth'

const EVENTS_API =
  'https://www.googleapis.com/calendar/v3/calendars/primary/events'

const calendar = async <T>(
  account: GmailAccount,
  path: string,
  init?: RequestInit
) => {
  const response = await fetch(`${EVENTS_API}${path}`, {
    ...init,
    headers: {
      authorization: `Bearer ${await gmailAccessToken(account)}`,
      'content-type': 'application/json',
    },
  })
  if (!response.ok) {
    throw new Error(
      `Calendar ${path} failed: ${response.status} ${await response.text()}`
    )
  }
  return (response.status === 204 ? undefined : await response.json()) as T
}

/** `date` for all-day events (end exclusive), `dateTime` with offset otherwise. */
interface GoogleTime {
  date?: string
  dateTime?: string
}

interface GoogleEvent {
  description?: string
  end: GoogleTime
  htmlLink: string
  id: string
  location?: string
  start: GoogleTime
  status: string
  summary?: string
}

export interface CalendarEventFields {
  allDay: boolean
  description?: string
  /** `yyyy-MM-dd` (exclusive) when all-day, an ISO date-time otherwise. */
  end: string
  location?: string
  start: string
  /** Read `start` and `end` as wall times there; without it they carry their own offset. */
  timeZone?: string
  title: string
}

/** PATCH merges `start` and `end`: the other key must be cleared or switching all-day ↔ timed keeps both and Google rejects it. */
const toGoogleTime = (value: string, event: CalendarEventFields) =>
  event.allDay
    ? { date: value, dateTime: null }
    : { date: null, dateTime: value, timeZone: event.timeZone }

const toGoogleEvent = (event: CalendarEventFields) => ({
  description: event.description ?? '',
  end: toGoogleTime(event.end, event),
  location: event.location ?? '',
  start: toGoogleTime(event.start, event),
  summary: event.title,
})

const fromGoogleEvent = (event: GoogleEvent) => ({
  allDay: Boolean(event.start.date),
  description: event.description ?? '',
  end: event.end.date ?? event.end.dateTime ?? '',
  id: event.id,
  link: event.htmlLink,
  location: event.location ?? '',
  start: event.start.date ?? event.start.dateTime ?? '',
  title: event.summary ?? '',
})

const MAX_EVENTS = 2500

export const listEvents = async (
  account: GmailAccount,
  range: { from: Date; to: Date }
) => {
  const { items } = await calendar<{ items: GoogleEvent[] }>(
    account,
    `?${new URLSearchParams({
      maxResults: String(MAX_EVENTS),
      orderBy: 'startTime',
      singleEvents: 'true',
      timeMax: range.to.toISOString(),
      timeMin: range.from.toISOString(),
    })}`
  )
  return items
    .filter(({ status }) => status !== 'cancelled')
    .map(fromGoogleEvent)
}

export const insertEvent = async (
  account: GmailAccount,
  event: CalendarEventFields
) =>
  fromGoogleEvent(
    await calendar<GoogleEvent>(account, '', {
      body: JSON.stringify(toGoogleEvent(event)),
      method: 'POST',
    })
  )

export const patchEvent = async (
  account: GmailAccount,
  id: string,
  event: CalendarEventFields
) =>
  fromGoogleEvent(
    await calendar<GoogleEvent>(account, `/${encodeURIComponent(id)}`, {
      body: JSON.stringify(toGoogleEvent(event)),
      method: 'PATCH',
    })
  )

export const deleteEvent = async (account: GmailAccount, id: string) => {
  await calendar(account, `/${encodeURIComponent(id)}`, { method: 'DELETE' })
}
