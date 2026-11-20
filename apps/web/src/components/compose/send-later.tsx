import { Button } from '@fewmail/ui/components/button'
import { Calendar } from '@fewmail/ui/components/calendar'
import { IconButton } from '@fewmail/ui/components/custom/icon-button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from '@fewmail/ui/components/dropdown-menu'
import { Input } from '@fewmail/ui/components/input'
import { Popover, PopoverContent } from '@fewmail/ui/components/popover'
import { ArrowDown01Icon, Calendar03Icon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { addDays, isAfter, parse, startOfToday } from 'date-fns'
import { useRef, useState } from 'react'

import { useDates, useT } from '~/lib/i18n'

import type { LaterPreset } from './schedule'
import { LATER_PRESETS, presetTimes } from './schedule'

const LATER_OPTIONS: LaterPreset[] = ['inHour', 'tomorrow', 'monday']

export const PickTime = ({
  action,
  onPick,
}: {
  action: string
  onPick: (at: Date) => void
}) => {
  const t = useT()
  const { locale, weekStartsOn } = useDates()
  const [day, setDay] = useState(() => addDays(startOfToday(), 1))
  const [time, setTime] = useState('08:00')
  const [isPast, setIsPast] = useState(false)
  return (
    <>
      <Calendar
        mode="single"
        required
        selected={day}
        onSelect={(next) => {
          setDay(next)
          setIsPast(false)
        }}
        defaultMonth={day}
        disabled={{ before: startOfToday() }}
        locale={locale}
        weekStartsOn={weekStartsOn}
      />
      <form
        className="flex gap-2"
        onSubmit={(event) => {
          event.preventDefault()
          const at = parse(time, 'HH:mm', day)
          if (!isAfter(at, new Date())) {
            setIsPast(true)
            return
          }
          onPick(at)
        }}
      >
        <Input
          type="time"
          required
          value={time}
          onChange={(event) => {
            setTime(event.target.value)
            setIsPast(false)
          }}
          aria-invalid={isPast}
          aria-label={t.compose.later.time}
        />
        <Button type="submit">{action}</Button>
      </form>
    </>
  )
}

export const SendLater = ({
  onSchedule,
}: {
  onSchedule: (sendAt: Date) => void
}) => {
  const t = useT()
  const { format } = useDates()
  const trigger = useRef<HTMLButtonElement>(null)
  const [isPicking, setIsPicking] = useState(false)

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger
          ref={trigger}
          render={
            <IconButton
              icon={ArrowDown01Icon}
              label={t.compose.sendLater}
              size="icon-sm"
            />
          }
        />
        <DropdownMenuContent>
          {presetTimes(LATER_PRESETS, LATER_OPTIONS).map(
            ({ preset, until }) => (
              <DropdownMenuItem key={preset} onClick={() => onSchedule(until)}>
                {t.compose.later[preset]}
                <DropdownMenuShortcut>
                  {format(until, 'EEE p')}
                </DropdownMenuShortcut>
              </DropdownMenuItem>
            )
          )}
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => setIsPicking(true)}>
            <HugeiconsIcon icon={Calendar03Icon} strokeWidth={2} />
            {t.compose.later.pick}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <Popover open={isPicking} onOpenChange={setIsPicking}>
        <PopoverContent anchor={trigger} align="start">
          <PickTime
            action={t.compose.later.schedule}
            onPick={(sendAt) => {
              setIsPicking(false)
              onSchedule(sendAt)
            }}
          />
        </PopoverContent>
      </Popover>
    </>
  )
}
