import type { RouterOutputs } from '@fewmail/api/router'
import { Button } from '@fewmail/ui/components/button'
import { DatePicker } from '@fewmail/ui/components/custom/date-picker'
import { IconButton } from '@fewmail/ui/components/custom/icon-button'
import { Field, FieldGroup, FieldLabel } from '@fewmail/ui/components/field'
import { Input } from '@fewmail/ui/components/input'
import { Kbd } from '@fewmail/ui/components/kbd'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@fewmail/ui/components/select'
import { Switch } from '@fewmail/ui/components/switch'
import { Textarea } from '@fewmail/ui/components/textarea'
import {
  Cancel01Icon,
  Delete02Icon,
  LinkSquare02Icon,
} from '@hugeicons/core-free-icons'
import { useHotkey } from '@tanstack/react-hotkeys'
import { useMutation } from '@tanstack/react-query'
import {
  addDays,
  addMinutes,
  differenceInCalendarDays,
  differenceInMinutes,
  format,
  formatDuration,
  parse,
} from 'date-fns'
import { useId, useRef } from 'react'
import { toast } from 'sonner'

import { KeyHints } from '~/components/key-hints'
import type { CalendarEvent } from '~/lib/calendar'
import { eventTimes } from '~/lib/calendar'
import { useDates, useT } from '~/lib/i18n'
import { orpc } from '~/lib/orpc'
import { queryClient } from '~/lib/query-client'
import { toastDeferred } from '~/lib/undo'

/** `end` is the last day itself for all-day drafts, not Google's exclusive next day. */
export interface EventDraft {
  allDay: boolean
  description: string
  end: Date
  id?: string
  link?: string
  location: string
  mailboxId?: string
  start: Date
  title: string
}

export const draftOf = (event: CalendarEvent): EventDraft => {
  const { end, start } = eventTimes(event)
  return { ...event, end: event.allDay ? addDays(end, -1) : end, start }
}

const DAY = 'yyyy-MM-dd'
const TIME = 'HH:mm'

const at = (day: string, time: string) =>
  parse(`${day} ${time}`, `${DAY} ${TIME}`, new Date())

export const isValidDraft = (draft: EventDraft) =>
  draft.allDay
    ? format(draft.end, DAY) >= format(draft.start, DAY)
    : draft.end > draft.start

const fieldsOf = (draft: EventDraft) => ({
  allDay: draft.allDay,
  description: draft.description,
  end: draft.allDay
    ? format(addDays(draft.end, 1), DAY)
    : draft.end.toISOString(),
  location: draft.location,
  start: draft.allDay ? format(draft.start, DAY) : draft.start.toISOString(),
  title: draft.title.trim(),
})

/** The draft as the grid draws it, so the event moves while its times are typed. */
export const previewOf = (draft: EventDraft): CalendarEvent => ({
  ...fieldsOf(draft),
  id: draft.id ?? '',
  link: draft.link ?? '',
  mailboxId: draft.mailboxId ?? '',
})

const isSameDraft = (a: EventDraft, b: EventDraft) =>
  JSON.stringify(fieldsOf(a)) === JSON.stringify(fieldsOf(b))

const invalidate = () =>
  queryClient.invalidateQueries({ queryKey: orpc.calendar.key() })

const changeEvents = (change: (events: CalendarEvent[]) => CalendarEvent[]) =>
  queryClient.setQueriesData<RouterOutputs['calendar']['events']>(
    { queryKey: orpc.calendar.events.key() },
    (data) => data && { ...data, events: change(data.events) }
  )

const useDuration = (draft: EventDraft) => {
  const { locale } = useDates()
  if (!isValidDraft(draft)) {
    return ''
  }
  if (draft.allDay) {
    return formatDuration(
      { days: differenceInCalendarDays(draft.end, draft.start) + 1 },
      { locale }
    )
  }
  const minutes = differenceInMinutes(draft.end, draft.start)
  return formatDuration(
    {
      days: Math.floor(minutes / 1440),
      hours: Math.floor((minutes % 1440) / 60),
      minutes: minutes % 60,
    },
    { locale }
  )
}

/** Controlled by the page, which draws `value` on the grid while it is edited; `draft` is what was opened. */
export const EventPane = ({
  calendars,
  draft,
  onChange,
  onClose,
  value,
}: {
  calendars: { email: string; mailboxId: string }[]
  draft: EventDraft
  onChange: (value: EventDraft) => void
  onClose: () => void
  value: EventDraft
}) => {
  const t = useT()
  const { locale, weekStartsOn } = useDates()
  const id = useId()
  const formRef = useRef<HTMLFormElement>(null)
  const titleRef = useRef<HTMLTextAreaElement>(null)
  const duration = useDuration(value)
  const ref =
    draft.id && draft.mailboxId
      ? { id: draft.id, mailboxId: draft.mailboxId }
      : undefined
  const mailboxId = value.mailboxId ?? calendars[0]?.mailboxId
  const isChanged = !ref || !isSameDraft(draft, value)
  const change = (fields: Partial<EventDraft>) =>
    onChange({ ...value, ...fields })

  const create = useMutation(
    orpc.calendar.create.mutationOptions({
      onMutate: (event) => {
        onClose()
        changeEvents((events) =>
          [
            ...events,
            {
              ...previewOf(value),
              id: crypto.randomUUID(),
              mailboxId: event.mailboxId ?? '',
            },
          ].toSorted((a, b) => a.start.localeCompare(b.start))
        )
      },
      onSettled: invalidate,
      onSuccess: () => toast.success(t.calendar.saved),
    })
  )
  const update = useMutation(
    orpc.calendar.update.mutationOptions({
      onMutate: (event) => {
        onClose()
        changeEvents((events) =>
          events.map((item) =>
            item.id === event.id ? { ...item, ...previewOf(value) } : item
          )
        )
      },
      onSettled: invalidate,
      onSuccess: () => toast.success(t.calendar.saved),
    })
  )
  const remove = useMutation(
    orpc.calendar.delete.mutationOptions({ onSettled: invalidate })
  )
  // Google sends guests a cancellation on delete, so the event goes only once the toast closes without Undo.
  const deleteEvent = () => {
    if (!ref) {
      return
    }
    onClose()
    changeEvents((events) => events.filter((event) => event.id !== ref.id))
    toastDeferred(t.calendar.deleted, () => remove.mutate(ref), invalidate)
  }

  const save = () => {
    if (!isChanged) {
      onClose()
      return
    }
    if (!isValidDraft(value)) {
      toast.error(t.calendar.endBeforeStart)
      return
    }
    if (ref) {
      update.mutate({ ...fieldsOf(value), ...ref })
    } else {
      create.mutate({ ...fieldsOf(value), mailboxId })
    }
  }

  useHotkey('Mod+Enter', save)
  useHotkey('Backspace', deleteEvent, { enabled: Boolean(ref) })
  useHotkey('Enter', save, {
    ignoreInputs: false,
    preventDefault: true,
    target: titleRef,
  })
  // Escape steps back one state: a field loses focus first, the pane closes next.
  useHotkey('Escape', () => {
    const field = document.activeElement
    if (
      field instanceof HTMLElement &&
      field.matches('input, textarea') &&
      formRef.current?.contains(field)
    ) {
      field.blur()
    } else {
      onClose()
    }
  })

  const moveStart = (start: Date) =>
    change({
      end: addMinutes(start, differenceInMinutes(value.end, value.start)),
      start,
    })

  return (
    <form
      ref={formRef}
      aria-label={ref ? t.calendar.editEvent : t.calendar.newEvent}
      className="flex min-h-0 flex-1 flex-col"
      onSubmit={(submit) => {
        submit.preventDefault()
        save()
      }}
    >
      <header className="flex items-center gap-1 px-6 pt-4">
        <span className="text-muted-foreground flex-1 text-xs font-medium">
          {ref ? t.calendar.editEvent : t.calendar.newEvent}
        </span>
        {draft.link && (
          <IconButton
            icon={LinkSquare02Icon}
            label={t.calendar.openInGoogle}
            size="icon-sm"
            variant="ghost-muted"
            render={
              <a
                href={draft.link}
                target="_blank"
                rel="noreferrer"
                aria-label={t.calendar.openInGoogle}
              />
            }
          />
        )}
        {ref && (
          <IconButton
            icon={Delete02Icon}
            label={t.calendar.delete}
            shortcut={<Kbd>⌫</Kbd>}
            size="icon-sm"
            variant="ghost-destructive"
            onClick={deleteEvent}
          />
        )}
        <IconButton
          icon={Cancel01Icon}
          label={t.mail.close}
          shortcut={<Kbd>esc</Kbd>}
          size="icon-sm"
          variant="ghost-muted"
          onClick={onClose}
        />
      </header>

      <div className="flex min-h-0 flex-1 flex-col gap-6 overflow-y-auto px-6 pt-3 pb-6">
        <Textarea
          ref={titleRef}
          variant="heading"
          rows={1}
          autoFocus={!ref}
          value={value.title}
          onChange={(event) => change({ title: event.target.value })}
          placeholder={t.calendar.titlePlaceholder}
          aria-label={t.calendar.titlePlaceholder}
          data-mask
        />
        <FieldGroup size="sm">
          <div className="flex flex-col gap-2">
            {(
              [
                [t.calendar.starts, value.start, moveStart],
                [t.calendar.ends, value.end, (end: Date) => change({ end })],
              ] as const
            ).map(([label, time, onTime]) => (
              <div
                key={label}
                className="grid grid-cols-[3.5rem_1fr_auto] items-center gap-2 text-sm"
              >
                <span className="text-muted-foreground">{label}</span>
                <DatePicker
                  aria-label={label}
                  value={time}
                  onChange={(day) =>
                    onTime(at(format(day, DAY), format(time, TIME)))
                  }
                  locale={locale}
                  weekStartsOn={weekStartsOn}
                  className={value.allDay ? 'col-span-2' : undefined}
                />
                {!value.allDay && (
                  <Input
                    type="time"
                    required
                    aria-label={label}
                    value={format(time, TIME)}
                    onChange={(event) =>
                      event.target.value &&
                      onTime(at(format(time, DAY), event.target.value))
                    }
                    aria-invalid={label === t.calendar.ends && !duration}
                  />
                )}
              </div>
            ))}
            <div className="flex items-center gap-3 text-sm">
              {/* oxlint-disable-next-line jsx-a11y/label-has-associated-control -- Switch renders its control inside the label */}
              <label className="flex flex-1 cursor-pointer items-center gap-3">
                <Switch
                  checked={value.allDay}
                  onCheckedChange={(allDay) => change({ allDay })}
                />
                {t.calendar.allDay}
              </label>
              <span className="text-muted-foreground tabular-nums">
                {duration}
              </span>
            </div>
          </div>
          <Field>
            <FieldLabel htmlFor={`${id}-location`}>
              {t.calendar.location}
            </FieldLabel>
            <Input
              id={`${id}-location`}
              value={value.location}
              onChange={(event) => change({ location: event.target.value })}
              data-mask
            />
          </Field>
          <Field>
            <FieldLabel htmlFor={`${id}-description`}>
              {t.calendar.description}
            </FieldLabel>
            <Textarea
              id={`${id}-description`}
              value={value.description}
              onChange={(event) => change({ description: event.target.value })}
              data-mask
            />
          </Field>
          {calendars.length > 1 && (
            <Field>
              <FieldLabel>{t.calendar.calendar}</FieldLabel>
              {ref ? (
                <span className="text-muted-foreground text-sm" data-mask>
                  {
                    calendars.find(
                      (calendar) => calendar.mailboxId === ref.mailboxId
                    )?.email
                  }
                </span>
              ) : (
                <Select
                  items={calendars.map((calendar) => ({
                    label: calendar.email,
                    value: calendar.mailboxId,
                  }))}
                  value={mailboxId}
                  onValueChange={(next) => next && change({ mailboxId: next })}
                >
                  <SelectTrigger aria-label={t.calendar.calendar}>
                    <SelectValue data-mask />
                  </SelectTrigger>
                  <SelectContent>
                    {calendars.map((calendar) => (
                      <SelectItem
                        key={calendar.mailboxId}
                        value={calendar.mailboxId}
                      >
                        <span data-mask>{calendar.email}</span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </Field>
          )}
        </FieldGroup>
      </div>

      <footer className="flex justify-end border-t px-6 py-4">
        <Button type="submit" disabled={!isChanged} shortcut={<Kbd>⌘⏎</Kbd>}>
          {ref ? t.calendar.save : t.calendar.create}
        </Button>
      </footer>
      <KeyHints
        hints={[
          ['⌘⏎', t.keys.save],
          ...(ref ? [['⌫', t.keys.deleteEvent] as [string, string]] : []),
          ['esc', t.keys.close],
        ]}
      />
    </form>
  )
}
