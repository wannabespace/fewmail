import type { RouterOutputs } from '@fewmail/api/router'
import { endOfDay, isSameDay, parseISO, startOfDay } from 'date-fns'

export type CalendarEvent =
  RouterOutputs['calendar']['events']['events'][number]

export const CALENDAR_VIEWS = ['day', 'week', 'month', 'year'] as const
export type CalendarView = (typeof CALENDAR_VIEWS)[number]

/** All-day ends are exclusive, as Google stores them. */
export const eventTimes = (event: CalendarEvent) => ({
  end: parseISO(event.end),
  start: parseISO(event.start),
})

export const isOnDay = (event: CalendarEvent, day: Date) => {
  const { end, start } = eventTimes(event)
  return (
    (start <= endOfDay(day) && end > startOfDay(day)) || isSameDay(start, day)
  )
}
