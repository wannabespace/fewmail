import type { EventScope } from '@fewmail/shared/agent'

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
  timeZone?: string
}

interface GoogleEvent {
  description?: string
  end: GoogleTime
  htmlLink: string
  id: string
  location?: string
  originalStartTime?: GoogleTime
  recurrence?: string[]
  recurringEventId?: string
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

const timeOf = (time: GoogleTime) => time.date ?? time.dateTime ?? ''

const fromGoogleEvent = (event: GoogleEvent) => ({
  allDay: Boolean(event.start.date),
  description: event.description ?? '',
  end: timeOf(event.end),
  id: event.id,
  link: event.htmlLink,
  location: event.location ?? '',
  seriesId: event.recurringEventId,
  start: timeOf(event.start),
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

const eventPath = (id: string) => `/${encodeURIComponent(id)}`

const getEvent = (account: GmailAccount, id: string) =>
  calendar<GoogleEvent>(account, eventPath(id))

const patch = (account: GmailAccount, id: string, body: object) =>
  calendar<GoogleEvent>(account, eventPath(id), {
    body: JSON.stringify(body),
    method: 'PATCH',
  })

const DAY_MS = 86_400_000

/** All-day times move by whole days, or an hour of DST lands them on the day before. */
const shiftTime = (value: string, by: number, allDay: boolean) =>
  allDay
    ? new Date(Date.parse(value) + Math.round(by / DAY_MS) * DAY_MS)
        .toISOString()
        .slice(0, 10)
    : new Date(Date.parse(value) + by).toISOString()

/** RFC 5545 wants UNTIL in DTSTART's own type: a date for all-day series. */
const untilBefore = (original: GoogleTime) =>
  original.date
    ? new Date(Date.parse(original.date) - DAY_MS)
        .toISOString()
        .slice(0, 10)
        .replaceAll('-', '')
    : new Date(Date.parse(timeOf(original)) - 1000)
        .toISOString()
        .replaceAll(/[-:]|\.\d{3}/gu, '')

const isRule = (line: string) => line.startsWith('RRULE:')

/** The change lands on the series itself, moved by as much as the edited occurrence was. */
const patchSeries = (
  account: GmailAccount,
  occurrence: GoogleEvent,
  series: GoogleEvent,
  event: CalendarEventFields
) => {
  const isMoved =
    event.allDay !== Boolean(occurrence.start.date) ||
    Date.parse(event.start) !== Date.parse(timeOf(occurrence.start)) ||
    Date.parse(event.end) !== Date.parse(timeOf(occurrence.end))
  if (!isMoved) {
    const { description, location, summary } = toGoogleEvent(event)
    return patch(account, series.id, { description, location, summary })
  }
  const by =
    Date.parse(timeOf(series.start)) -
    Date.parse(timeOf(occurrence.originalStartTime ?? occurrence.start))
  return patch(
    account,
    series.id,
    toGoogleEvent({
      ...event,
      end: shiftTime(event.end, by, event.allDay),
      start: shiftTime(event.start, by, event.allDay),
      timeZone: event.timeZone ?? series.start.timeZone,
    })
  )
}

const occurrencesBefore = async (
  account: GmailAccount,
  seriesId: string,
  original: GoogleTime
) => {
  const { items } = await calendar<{ items: GoogleEvent[] }>(
    account,
    `${eventPath(seriesId)}/instances?${new URLSearchParams({
      maxResults: String(MAX_EVENTS),
      showDeleted: 'true',
      timeMax: timeOf(original),
    })}`
  )
  return items.length
}

const endSeriesBefore = (
  account: GmailAccount,
  series: GoogleEvent,
  original: GoogleTime
) =>
  patch(account, series.id, {
    recurrence: series.recurrence?.map((line) =>
      isRule(line)
        ? `${line
            .split(';')
            .filter((part) => !/^(?:COUNT|UNTIL)=/u.test(part))
            .join(';')};UNTIL=${untilBefore(original)}`
        : line
    ),
  })

/** Google's own "this and following": the series ends before this occurrence and a copy of it starts here with the change. */
const splitSeries = async (
  account: GmailAccount,
  series: GoogleEvent,
  original: GoogleTime,
  event: CalendarEventFields
) => {
  const count = Number(
    /;COUNT=(?<count>\d+)/u.exec(series.recurrence?.find(isRule) ?? '')?.groups
      ?.count
  )
  const remaining = count
    ? count - (await occurrencesBefore(account, series.id, original))
    : 0
  const created = await calendar<GoogleEvent>(account, '', {
    body: JSON.stringify({
      ...series,
      ...toGoogleEvent({
        ...event,
        timeZone: event.timeZone ?? series.start.timeZone,
      }),
      iCalUID: undefined,
      id: undefined,
      recurrence: series.recurrence?.map((line) =>
        isRule(line) && remaining
          ? line.replace(/COUNT=\d+/u, `COUNT=${remaining}`)
          : line
      ),
    }),
    method: 'POST',
  })
  // Created first: a failed split then leaves a duplicate, never lost occurrences.
  await endSeriesBefore(account, series, original)
  return created
}

/** The series a change to this occurrence reaches past it, and whether it reaches all of it; none for `this` or a single event. */
const seriesOf = async (
  account: GmailAccount,
  id: string,
  scope: EventScope
) => {
  const occurrence = scope === 'this' ? undefined : await getEvent(account, id)
  if (!occurrence?.recurringEventId || !occurrence.originalStartTime) {
    return
  }
  const series = await getEvent(account, occurrence.recurringEventId)
  const original = occurrence.originalStartTime
  const isWhole =
    scope === 'all' ||
    Date.parse(timeOf(original)) === Date.parse(timeOf(series.start))
  return { isWhole, occurrence, original, series }
}

export const patchEvent = async (
  account: GmailAccount,
  id: string,
  event: CalendarEventFields,
  scope: EventScope = 'this'
) => {
  const reach = await seriesOf(account, id, scope)
  if (!reach) {
    return fromGoogleEvent(await patch(account, id, toGoogleEvent(event)))
  }
  return fromGoogleEvent(
    reach.isWhole
      ? await patchSeries(account, reach.occurrence, reach.series, event)
      : await splitSeries(account, reach.series, reach.original, event)
  )
}

export const deleteEvent = async (
  account: GmailAccount,
  id: string,
  scope: EventScope = 'this'
) => {
  const reach = await seriesOf(account, id, scope)
  if (reach && !reach.isWhole) {
    await endSeriesBefore(account, reach.series, reach.original)
    return
  }
  await calendar(account, eventPath(reach?.series.id ?? id), {
    method: 'DELETE',
  })
}
