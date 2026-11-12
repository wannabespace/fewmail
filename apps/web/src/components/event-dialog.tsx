import { Button } from '@fewmail/ui/components/button'
import { IconButton } from '@fewmail/ui/components/custom/icon-button'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@fewmail/ui/components/dialog'
import { Input } from '@fewmail/ui/components/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@fewmail/ui/components/select'
import { Switch } from '@fewmail/ui/components/switch'
import { Textarea } from '@fewmail/ui/components/textarea'
import { LinkSquare02Icon } from '@hugeicons/core-free-icons'
import { useMutation } from '@tanstack/react-query'
import {
  addDays,
  addMinutes,
  differenceInMinutes,
  format,
  parse,
} from 'date-fns'
import { useState } from 'react'
import { toast } from 'sonner'

import type { CalendarEvent } from '~/lib/calendar'
import { eventTimes } from '~/lib/calendar'
import { useT } from '~/lib/i18n'
import { orpc } from '~/lib/orpc'
import { queryClient } from '~/lib/query-client'

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

const invalidate = () =>
  queryClient.invalidateQueries({ queryKey: orpc.calendar.key() })

const EventForm = ({
  calendars,
  draft,
  onDone,
}: {
  calendars: { email: string; mailboxId: string }[]
  draft: EventDraft
  onDone: () => void
}) => {
  const t = useT()
  const [title, setTitle] = useState(draft.title)
  const [allDay, setAllDay] = useState(draft.allDay)
  const [start, setStart] = useState(draft.start)
  const [end, setEnd] = useState(draft.end)
  const [location, setLocation] = useState(draft.location)
  const [description, setDescription] = useState(draft.description)
  const [mailboxId, setMailboxId] = useState(
    draft.mailboxId ?? calendars[0]?.mailboxId
  )

  const done = (message: string) => {
    toast.success(message)
    onDone()
    void invalidate()
  }
  const create = useMutation(
    orpc.calendar.create.mutationOptions({
      onSuccess: () => done(t.calendar.saved),
    })
  )
  const update = useMutation(
    orpc.calendar.update.mutationOptions({
      onSuccess: () => done(t.calendar.saved),
    })
  )
  const remove = useMutation(
    orpc.calendar.delete.mutationOptions({
      onSuccess: () => done(t.calendar.deleted),
    })
  )

  const moveStart = (next: Date) => {
    setEnd(addMinutes(next, differenceInMinutes(end, start)))
    setStart(next)
  }
  const isValid = allDay ? format(end, DAY) >= format(start, DAY) : end > start

  return (
    <form
      className="flex flex-col gap-4"
      onSubmit={(submit) => {
        submit.preventDefault()
        if (!isValid) {
          toast.error(t.calendar.endBeforeStart)
          return
        }
        const fields = {
          allDay,
          description,
          end: allDay ? format(addDays(end, 1), DAY) : end.toISOString(),
          location,
          start: allDay ? format(start, DAY) : start.toISOString(),
          title: title.trim(),
        }
        if (draft.id && draft.mailboxId) {
          update.mutate({ ...fields, id: draft.id, mailboxId: draft.mailboxId })
        } else {
          create.mutate({ ...fields, mailboxId })
        }
      }}
    >
      <Input
        autoFocus
        value={title}
        onChange={(change) => setTitle(change.target.value)}
        placeholder={t.calendar.titlePlaceholder}
        aria-label={t.calendar.titlePlaceholder}
        data-mask
      />
      {(
        [
          [t.calendar.starts, start, moveStart],
          [t.calendar.ends, end, setEnd],
        ] as const
      ).map(([label, value, onChange]) => (
        <div
          key={label}
          className="grid grid-cols-[5rem_1fr_7rem] items-center gap-2 text-sm"
        >
          <span className="text-muted-foreground">{label}</span>
          <Input
            type="date"
            required
            aria-label={label}
            value={format(value, DAY)}
            onChange={(change) =>
              change.target.value &&
              onChange(at(change.target.value, format(value, TIME)))
            }
            className={allDay ? 'col-span-2' : undefined}
          />
          {!allDay && (
            <Input
              type="time"
              required
              aria-label={label}
              value={format(value, TIME)}
              onChange={(change) =>
                change.target.value &&
                onChange(at(format(value, DAY), change.target.value))
              }
            />
          )}
        </div>
      ))}
      {/* oxlint-disable-next-line jsx-a11y/label-has-associated-control -- Switch renders its control inside the label */}
      <label className="flex items-center gap-3 text-sm">
        <Switch checked={allDay} onCheckedChange={setAllDay} />
        {t.calendar.allDay}
      </label>
      <Input
        value={location}
        onChange={(change) => setLocation(change.target.value)}
        placeholder={t.calendar.location}
        aria-label={t.calendar.location}
        data-mask
      />
      <Textarea
        value={description}
        onChange={(change) => setDescription(change.target.value)}
        placeholder={t.calendar.description}
        aria-label={t.calendar.description}
        data-mask
      />
      {!draft.id && calendars.length > 1 && (
        <Select
          items={calendars.map(({ email, mailboxId: value }) => ({
            label: email,
            value,
          }))}
          value={mailboxId}
          onValueChange={(next) => next && setMailboxId(next)}
        >
          <SelectTrigger aria-label={t.calendar.calendar}>
            <SelectValue data-mask />
          </SelectTrigger>
          <SelectContent>
            {calendars.map(({ email, mailboxId: value }) => (
              <SelectItem key={value} value={value}>
                <span data-mask>{email}</span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}
      <DialogFooter>
        {draft.id && draft.mailboxId && (
          <Button
            type="button"
            variant="ghost-destructive"
            className="mr-auto"
            disabled={remove.isPending}
            onClick={() =>
              draft.id &&
              draft.mailboxId &&
              remove.mutate({ id: draft.id, mailboxId: draft.mailboxId })
            }
          >
            {t.calendar.delete}
          </Button>
        )}
        {draft.link && (
          <IconButton
            icon={LinkSquare02Icon}
            label={t.calendar.openInGoogle}
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
        <Button type="submit" disabled={create.isPending || update.isPending}>
          {draft.id ? t.calendar.save : t.calendar.create}
        </Button>
      </DialogFooter>
    </form>
  )
}

export const EventDialog = ({
  calendars,
  draft,
  onOpenChange,
  open,
}: {
  calendars: { email: string; mailboxId: string }[]
  draft: EventDraft | null
  onOpenChange: (open: boolean) => void
  open: boolean
}) => {
  const t = useT()

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {draft?.id ? t.calendar.editEvent : t.calendar.newEvent}
          </DialogTitle>
        </DialogHeader>
        {draft && (
          <EventForm
            key={`${draft.id}${draft.start.toISOString()}`}
            calendars={calendars}
            draft={draft}
            onDone={() => onOpenChange(false)}
          />
        )}
      </DialogContent>
    </Dialog>
  )
}
