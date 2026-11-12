import { Calendar } from '@fewmail/ui/components/calendar'
import { cn } from '@fewmail/ui/lib/utils'
import {
  addDays,
  differenceInMinutes,
  eachDayOfInterval,
  eachMonthOfInterval,
  endOfMonth,
  endOfWeek,
  endOfYear,
  isSameMonth,
  isToday,
  max,
  min,
  set,
  startOfDay,
  startOfMonth,
  startOfWeek,
  startOfYear,
} from 'date-fns'
import type { CSSProperties } from 'react'
import { useEffect, useState } from 'react'

import type { CalendarEvent } from '~/lib/calendar'
import { eventTimes, isOnDay } from '~/lib/calendar'
import { useDates, useT } from '~/lib/i18n'

const HOUR_PX = 48
const MIN_EVENT_MINUTES = 20
const MONTH_CELL_EVENTS = 3
const SCROLL_TO_HOUR = 8
const HOURS = Array.from({ length: 24 }, (_, hour) => hour)

const EVENT_SURFACE =
  'bg-primary/12 hover:bg-primary/20 focus-visible:focus-ring cursor-pointer rounded-md text-left text-xs outline-none'

interface ViewProps {
  date: Date
  events: CalendarEvent[]
  onOpenEvent: (event: CalendarEvent) => void
}

const EventChip = ({
  event,
  onOpen,
}: {
  event: CalendarEvent
  onOpen: (event: CalendarEvent) => void
}) => {
  const t = useT()
  const dates = useDates()

  return (
    <button
      type="button"
      className={cn(
        EVENT_SURFACE,
        'relative flex w-full min-w-0 items-center gap-1.5 px-1.5 py-0.5'
      )}
      onClick={() => onOpen(event)}
    >
      {!event.allDay && (
        <span className="text-muted-foreground shrink-0 tabular-nums">
          {dates.format(eventTimes(event).start, 'p')}
        </span>
      )}
      <span className="truncate" data-mask>
        {event.title || t.calendar.untitled}
      </span>
    </button>
  )
}

/** Sits under a cell's events, so a press on empty space creates one; N is the keyboard's way. */
const EmptySpace = ({
  label,
  onPick,
}: {
  label: string
  onPick: (click: React.MouseEvent<HTMLButtonElement>) => void
}) => (
  <button
    type="button"
    tabIndex={-1}
    aria-label={label}
    className="hover:bg-accent/50 absolute inset-0 cursor-pointer"
    onClick={onPick}
  />
)

const useWeekdays = (from: Date) => {
  const dates = useDates()
  return Array.from({ length: 7 }, (_, index) =>
    dates.format(addDays(from, index), 'EEE')
  )
}

export const MonthView = ({
  date,
  events,
  onOpenEvent,
  onPickDay,
  onShowDay,
}: ViewProps & {
  onPickDay: (day: Date) => void
  onShowDay: (day: Date) => void
}) => {
  const dates = useDates()
  const first = startOfWeek(startOfMonth(date), {
    weekStartsOn: dates.weekStartsOn,
  })
  const days = eachDayOfInterval({
    end: endOfWeek(endOfMonth(date), { weekStartsOn: dates.weekStartsOn }),
    start: first,
  })
  const weekdays = useWeekdays(first)

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="text-muted-foreground grid grid-cols-7 border-b text-xs">
        {weekdays.map((weekday) => (
          <span key={weekday} className="px-2 py-1.5">
            {weekday}
          </span>
        ))}
      </div>
      <div className="grid flex-1 auto-rows-fr grid-cols-7">
        {days.map((day) => {
          const dayEvents = events.filter((event) => isOnDay(event, day))
          const hidden = dayEvents.length - MONTH_CELL_EVENTS
          return (
            <div
              key={day.toISOString()}
              className="relative flex min-h-0 flex-col gap-0.5 overflow-hidden border-r border-b p-1 nth-[7n]:border-r-0"
            >
              <EmptySpace
                label={dates.format(day, 'PPPP')}
                onPick={() => onPickDay(day)}
              />
              <span
                className={cn(
                  'pointer-events-none relative flex size-6 shrink-0 items-center justify-center self-end rounded-full text-xs tabular-nums',
                  !isSameMonth(day, date) && 'text-muted-foreground/60',
                  isToday(day) &&
                    'bg-primary text-primary-foreground font-medium'
                )}
              >
                {day.getDate()}
              </span>
              {dayEvents.slice(0, MONTH_CELL_EVENTS).map((event) => (
                <EventChip key={event.id} event={event} onOpen={onOpenEvent} />
              ))}
              {hidden > 0 && (
                <button
                  type="button"
                  className="text-muted-foreground hover:text-foreground relative cursor-pointer px-1.5 text-left text-xs"
                  onClick={() => onShowDay(day)}
                >
                  +{hidden}
                </button>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

/** Overlapping events share their cluster's width side by side, Google's way. */
const layoutDay = (events: CalendarEvent[], day: Date) => {
  const dayStart = startOfDay(day)
  const dayEnd = addDays(dayStart, 1)
  const placed: {
    end: Date
    event: CalendarEvent
    lane: number
    lanes: number
    start: Date
  }[] = []
  let cluster: typeof placed = []
  let laneEnds: number[] = []
  let clusterEnd = 0
  const closeCluster = () => {
    for (const item of cluster) {
      item.lanes = laneEnds.length
    }
    cluster = []
    laneEnds = []
  }
  const byStart = events.toSorted(
    (a, b) => eventTimes(a).start.getTime() - eventTimes(b).start.getTime()
  )
  for (const event of byStart) {
    const times = eventTimes(event)
    const start = max([times.start, dayStart])
    const end = min([
      max([times.end, new Date(start.getTime() + MIN_EVENT_MINUTES * 60_000)]),
      dayEnd,
    ])
    if (start.getTime() >= clusterEnd) {
      closeCluster()
    }
    let lane = laneEnds.findIndex((laneEnd) => laneEnd <= start.getTime())
    if (lane === -1) {
      lane = laneEnds.length
      laneEnds.push(0)
    }
    laneEnds[lane] = end.getTime()
    clusterEnd = Math.max(clusterEnd, end.getTime())
    const item = { end, event, lane, lanes: 1, start }
    cluster.push(item)
    placed.push(item)
  }
  closeCluster()
  return placed
}

const NowLine = () => {
  const [now, setNow] = useState(() => new Date())
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 60_000)
    return () => clearInterval(timer)
  }, [])
  return (
    <div
      className="bg-primary pointer-events-none absolute inset-x-0 top-(--top) z-20 h-px"
      style={
        {
          '--top': `${(differenceInMinutes(now, startOfDay(now)) / 60) * HOUR_PX}px`,
        } as CSSProperties
      }
    />
  )
}

export const TimeGrid = ({
  days,
  events,
  onOpenEvent,
  onPickTime,
}: Omit<ViewProps, 'date'> & {
  days: Date[]
  onPickTime: (start: Date, allDay: boolean) => void
}) => {
  const t = useT()
  const dates = useDates()
  const [scrolled, setScrolled] = useState(false)
  const allDay = events.filter((event) => event.allDay)
  const timed = events.filter((event) => !event.allDay)
  const columns = { '--days': days.length } as CSSProperties
  const grid = 'grid grid-cols-[3.5rem_repeat(var(--days),1fr)]'

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className={cn(grid, 'border-b')} style={columns}>
        <span className="text-muted-foreground text-2xs self-end px-2 pb-1.5">
          {t.calendar.allDay}
        </span>
        {days.map((day) => (
          <div
            key={day.toISOString()}
            className="relative flex min-w-0 flex-col gap-0.5 border-l p-1"
          >
            <EmptySpace
              label={`${dates.format(day, 'PPPP')}, ${t.calendar.allDay}`}
              onPick={() => onPickTime(day, true)}
            />
            {days.length > 1 && (
              <span className="pointer-events-none relative flex items-center gap-1.5 px-1 text-xs">
                <span className="text-muted-foreground">
                  {dates.format(day, 'EEE')}
                </span>
                <span
                  className={cn(
                    'flex size-6 items-center justify-center rounded-full tabular-nums',
                    isToday(day) &&
                      'bg-primary text-primary-foreground font-medium'
                  )}
                >
                  {day.getDate()}
                </span>
              </span>
            )}
            {allDay
              .filter((event) => isOnDay(event, day))
              .map((event) => (
                <EventChip key={event.id} event={event} onOpen={onOpenEvent} />
              ))}
          </div>
        ))}
      </div>
      <div
        className="min-h-0 flex-1 overflow-y-auto"
        ref={(element) => {
          if (element && !scrolled) {
            element.scrollTop = SCROLL_TO_HOUR * HOUR_PX
            setScrolled(true)
          }
        }}
      >
        <div className={grid} style={columns}>
          <div>
            {HOURS.map((hour) => (
              <div
                key={hour}
                className="text-muted-foreground text-2xs h-12 pe-2 text-right tabular-nums"
              >
                {hour > 0 && (
                  <span className="relative -top-2">
                    {dates.format(set(0, { hours: hour, minutes: 0 }), 'p')}
                  </span>
                )}
              </div>
            ))}
          </div>
          {days.map((day) => (
            <div key={day.toISOString()} className="relative border-l">
              {HOURS.map((hour) => (
                <div key={hour} className="h-12 border-b last:border-b-0" />
              ))}
              <EmptySpace
                label={dates.format(day, 'PPPP')}
                onPick={(click) => {
                  const offset =
                    click.clientY -
                    click.currentTarget.getBoundingClientRect().top
                  const halfHours = Math.floor(offset / (HOUR_PX / 2))
                  onPickTime(
                    set(startOfDay(day), {
                      hours: Math.floor(halfHours / 2),
                      minutes: (halfHours % 2) * 30,
                    }),
                    false
                  )
                }}
              />
              {isToday(day) && <NowLine />}
              {layoutDay(
                timed.filter((event) => isOnDay(event, day)),
                day
              ).map(({ end, event, lane, lanes, start }) => (
                <button
                  key={event.id}
                  type="button"
                  className={cn(
                    EVENT_SURFACE,
                    'absolute top-(--top) left-(--left) z-10 flex h-(--height) w-(--width) flex-col overflow-hidden px-1.5 py-1'
                  )}
                  style={
                    {
                      '--height': `${(differenceInMinutes(end, start) / 60) * HOUR_PX - 2}px`,
                      '--left': `calc(${(lane / lanes) * 100}% + 2px)`,
                      '--top': `${(differenceInMinutes(start, startOfDay(day)) / 60) * HOUR_PX}px`,
                      '--width': `calc(${100 / lanes}% - 4px)`,
                    } as CSSProperties
                  }
                  onClick={() => onOpenEvent(event)}
                >
                  <span className="truncate font-medium" data-mask>
                    {event.title || t.calendar.untitled}
                  </span>
                  <span className="text-muted-foreground truncate tabular-nums">
                    {dates.format(eventTimes(event).start, 'p')}
                  </span>
                </button>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export const YearView = ({
  date,
  events,
  onShowDay,
}: Omit<ViewProps, 'onOpenEvent'> & { onShowDay: (day: Date) => void }) => {
  const { locale, weekStartsOn } = useDates()
  const busy = new Set(
    events.flatMap((event) => {
      const { end, start } = eventTimes(event)
      const last = event.allDay ? addDays(end, -1) : end
      return eachDayOfInterval({
        end: min([max([last, start]), endOfYear(date)]),
        start: max([start, startOfYear(date)]),
      }).map((day) => day.toDateString())
    })
  )

  return (
    <div className="grid flex-1 grid-cols-2 content-start gap-6 overflow-y-auto px-10 py-6 md:grid-cols-3 xl:grid-cols-4">
      {eachMonthOfInterval({
        end: endOfYear(date),
        start: startOfYear(date),
      }).map((month) => (
        <Calendar
          key={month.toISOString()}
          month={month}
          hideNavigation
          disableNavigation
          showOutsideDays={false}
          locale={locale}
          weekStartsOn={weekStartsOn}
          modifiers={{ marked: (day) => busy.has(day.toDateString()) }}
          onDayClick={onShowDay}
        />
      ))}
    </div>
  )
}
