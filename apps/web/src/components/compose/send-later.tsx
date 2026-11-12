import { Button } from '@fewmail/ui/components/button'
import { Calendar } from '@fewmail/ui/components/calendar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@fewmail/ui/components/dropdown-menu'
import { Input } from '@fewmail/ui/components/input'
import { Popover, PopoverContent } from '@fewmail/ui/components/popover'
import { Calendar03Icon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { addDays, isAfter, parse, startOfToday } from 'date-fns'
import { useRef, useState } from 'react'

import { useDates, useT } from '~/lib/i18n'

import type { LaterPreset } from './schedule'
import { LATER_PRESETS } from './schedule'

const LATER_OPTIONS: LaterPreset[] = ['inHour', 'tomorrow', 'monday']

export const SendLater = ({
  onSchedule,
}: {
  onSchedule: (sendAt: Date) => void
}) => {
  const t = useT()
  const { locale, weekStartsOn } = useDates()
  const trigger = useRef<HTMLButtonElement>(null)
  const [isPicking, setIsPicking] = useState(false)
  const [day, setDay] = useState(() => addDays(startOfToday(), 1))
  const [time, setTime] = useState('08:00')
  const [isPast, setIsPast] = useState(false)

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger
          ref={trigger}
          render={<Button size="sm" variant="secondary" />}
        >
          {t.compose.sendLater}
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          {LATER_OPTIONS.map((preset) => (
            <DropdownMenuItem
              key={preset}
              onClick={() => onSchedule(LATER_PRESETS[preset]())}
            >
              {t.compose.later[preset]}
            </DropdownMenuItem>
          ))}
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => setIsPicking(true)}>
            <HugeiconsIcon icon={Calendar03Icon} strokeWidth={2} />
            {t.compose.later.pick}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <Popover open={isPicking} onOpenChange={setIsPicking}>
        <PopoverContent anchor={trigger} align="start">
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
              const sendAt = parse(time, 'HH:mm', day)
              if (!isAfter(sendAt, new Date())) {
                setIsPast(true)
                return
              }
              setIsPicking(false)
              onSchedule(sendAt)
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
            <Button type="submit">{t.compose.later.schedule}</Button>
          </form>
        </PopoverContent>
      </Popover>
    </>
  )
}
