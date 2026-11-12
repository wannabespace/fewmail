import { Button } from '@fewmail/ui/components/button'
import { IconButton } from '@fewmail/ui/components/custom/icon-button'
import { Kbd } from '@fewmail/ui/components/kbd'
import { Tabs, TabsList, TabsTrigger } from '@fewmail/ui/components/tabs'
import {
  Add01Icon,
  ArrowLeft01Icon,
  ArrowRight01Icon,
} from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { useHotkey } from '@tanstack/react-hotkeys'
import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { type } from 'arktype'
import {
  add,
  addHours,
  eachDayOfInterval,
  endOfDay,
  endOfMonth,
  endOfWeek,
  endOfYear,
  format,
  isValid,
  parseISO,
  set,
  startOfDay,
  startOfHour,
  startOfMonth,
  startOfToday,
  startOfWeek,
  startOfYear,
} from 'date-fns'
import { useState } from 'react'

import { MonthView, TimeGrid, YearView } from '~/components/calendar-views'
import type { EventDraft } from '~/components/event-dialog'
import { draftOf, EventDialog } from '~/components/event-dialog'
import { KeyHints } from '~/components/key-hints'
import type { CalendarView } from '~/lib/calendar'
import { CALENDAR_VIEWS } from '~/lib/calendar'
import { localeStore, useDates, useT, weekStartOf } from '~/lib/i18n'
import { orpc } from '~/lib/orpc'

const STEP = {
  day: 'days',
  month: 'months',
  week: 'weeks',
  year: 'years',
} as const

const visibleRange = (
  view: CalendarView,
  date: Date,
  weekStartsOn: 0 | 1 | 2 | 3 | 4 | 5 | 6
) => {
  switch (view) {
    case 'day': {
      return { from: startOfDay(date), to: endOfDay(date) }
    }
    case 'week': {
      return {
        from: startOfWeek(date, { weekStartsOn }),
        to: endOfWeek(date, { weekStartsOn }),
      }
    }
    case 'month': {
      return {
        from: startOfWeek(startOfMonth(date), { weekStartsOn }),
        to: endOfWeek(endOfMonth(date), { weekStartsOn }),
      }
    }
    default: {
      return { from: startOfYear(date), to: endOfYear(date) }
    }
  }
}

const usePeriodLabel = (
  view: CalendarView,
  range: { from: Date; to: Date }
) => {
  const dates = useDates()
  switch (view) {
    case 'day': {
      return dates.format(range.from, 'PPPP')
    }
    case 'week': {
      return `${dates.format(range.from, 'd MMM')} – ${dates.format(range.to, 'd MMM yyyy')}`
    }
    case 'month': {
      return dates.format(add(range.from, { weeks: 1 }), 'LLLL yyyy')
    }
    default: {
      return dates.format(range.from, 'yyyy')
    }
  }
}

const periodOf = (search: { date?: string; view?: CalendarView }) => {
  const parsed = search.date ? parseISO(search.date) : startOfToday()
  return {
    date: isValid(parsed) ? parsed : startOfToday(),
    view: search.view ?? 'month',
  }
}

const CalendarPage = () => {
  const t = useT()
  const { weekStartsOn } = useDates()
  const navigate = useNavigate({ from: Route.fullPath })
  const { date, view } = periodOf(Route.useSearch())
  const range = visibleRange(view, date, weekStartsOn)
  const label = usePeriodLabel(view, range)
  const isCurrentPeriod =
    visibleRange(view, startOfToday(), weekStartsOn).from.getTime() ===
    range.from.getTime()

  const { data } = useQuery(
    orpc.calendar.events.queryOptions({
      input: range,
      placeholderData: keepPreviousData,
    })
  )
  const events = data?.events ?? []

  const [draft, setDraft] = useState<EventDraft | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const openDraft = (next: EventDraft) => {
    setDraft(next)
    setIsDialogOpen(true)
  }
  const newEvent = (start: Date, allDay: boolean) =>
    openDraft({
      allDay,
      description: '',
      end: allDay ? start : addHours(start, 1),
      location: '',
      start,
      title: '',
    })
  const newEventNow = () =>
    newEvent(startOfHour(addHours(new Date(), 1)), false)

  const show = (next: { date?: Date; view?: CalendarView }) =>
    navigate({
      replace: true,
      search: {
        date: format(next.date ?? date, 'yyyy-MM-dd'),
        view: next.view ?? view,
      },
    })
  const step = (direction: 1 | -1) =>
    show({ date: add(date, { [STEP[view]]: direction }) })
  const showDay = (day: Date) => show({ date: day, view: 'day' })

  const keys = { enabled: !isDialogOpen }
  useHotkey('T', () => show({ date: new Date() }), {
    enabled: keys.enabled && !isCurrentPeriod,
  })
  useHotkey('ArrowLeft', () => step(-1), keys)
  useHotkey('ArrowRight', () => step(1), keys)
  useHotkey('N', newEventNow, keys)
  useHotkey('D', () => show({ view: 'day' }), keys)
  useHotkey('W', () => show({ view: 'week' }), keys)
  useHotkey('M', () => show({ view: 'month' }), keys)
  useHotkey('Y', () => show({ view: 'year' }), keys)

  const openEvent = (event: (typeof events)[number]) =>
    openDraft(draftOf(event))
  const pickDay = (day: Date) =>
    newEvent(
      set(day, { hours: 9, milliseconds: 0, minutes: 0, seconds: 0 }),
      false
    )

  return (
    <main className="flex min-h-0 flex-1 flex-col">
      <header className="flex items-center gap-2 px-10 pt-10 pb-5 *:shrink-0">
        <h1 className="text-display min-w-0 flex-1 truncate font-serif tracking-tight">
          {label}
        </h1>
        {!isCurrentPeriod && (
          <Button variant="outline" onClick={() => show({ date: new Date() })}>
            {t.calendar.today}
            <Kbd>T</Kbd>
          </Button>
        )}
        <IconButton
          icon={ArrowLeft01Icon}
          label={t.calendar.previous}
          shortcut={<Kbd>←</Kbd>}
          variant="ghost-muted"
          onClick={() => step(-1)}
        />
        <IconButton
          icon={ArrowRight01Icon}
          label={t.calendar.next}
          shortcut={<Kbd>→</Kbd>}
          variant="ghost-muted"
          onClick={() => step(1)}
        />
        <Tabs
          value={view}
          onValueChange={(next: CalendarView) => show({ view: next })}
        >
          <TabsList>
            {CALENDAR_VIEWS.map((option) => (
              <TabsTrigger key={option} value={option}>
                {t.calendar.views[option]}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
        <Button onClick={newEventNow}>
          <HugeiconsIcon icon={Add01Icon} strokeWidth={2} />
          {t.calendar.newEvent}
          <Kbd>N</Kbd>
        </Button>
      </header>

      <div className="flex min-h-0 flex-1 flex-col border-t">
        {view === 'month' && (
          <MonthView
            date={date}
            events={events}
            onOpenEvent={openEvent}
            onPickDay={pickDay}
            onShowDay={showDay}
          />
        )}
        {(view === 'week' || view === 'day') && (
          <TimeGrid
            days={eachDayOfInterval({ end: range.to, start: range.from })}
            events={events}
            onOpenEvent={openEvent}
            onPickTime={newEvent}
          />
        )}
        {view === 'year' && (
          <YearView date={date} events={events} onShowDay={showDay} />
        )}
      </div>

      <KeyHints
        hints={[
          ...(isCurrentPeriod
            ? []
            : [['T', t.keys.calendarToday] as [string, string]]),
          ['← / →', t.keys.period],
          ['D W M Y', t.keys.view],
          ['N', t.keys.newEvent],
          ['⌘K', t.keys.anything],
        ]}
      />
      <EventDialog
        calendars={data?.calendars ?? []}
        draft={draft}
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
      />
    </main>
  )
}

export const Route = createFileRoute('/_app/calendar')({
  component: CalendarPage,
  validateSearch: type({
    'date?': 'string',
    'view?': type.enumerated(...CALENDAR_VIEWS),
  }),
  loaderDeps: ({ search }) => search,
  // Google answers slowly: awaiting here would hold every step; the neighbours load ahead for ← / →.
  loader: ({ context: { queryClient }, deps }) => {
    const { date, view } = periodOf(deps)
    for (const step of [0, -1, 1]) {
      void queryClient.prefetchQuery(
        orpc.calendar.events.queryOptions({
          input: visibleRange(
            view,
            add(date, { [STEP[view]]: step }),
            weekStartOf(localeStore.get())
          ),
        })
      )
    }
  },
})
