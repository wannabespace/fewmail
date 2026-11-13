import { cn } from '@fewmail/ui/lib/utils'
import { Calendar03Icon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import type { Locale } from 'date-fns'
import { format } from 'date-fns'
import type { ComponentProps } from 'react'
import { useState } from 'react'

import { Button } from '../button'
import { Calendar } from '../calendar'
import { Popover, PopoverContent, PopoverTrigger } from '../popover'

export const DatePicker = ({
  'aria-label': label,
  className,
  locale,
  onChange,
  value,
  weekStartsOn,
}: {
  'aria-label'?: string
  className?: string
  locale?: Locale
  onChange: (day: Date) => void
  value: Date
  weekStartsOn?: ComponentProps<typeof Calendar>['weekStartsOn']
}) => {
  const [open, setOpen] = useState(false)

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        render={
          <Button
            variant="outline"
            aria-label={label}
            className={cn('justify-start', className)}
          />
        }
      >
        <HugeiconsIcon
          icon={Calendar03Icon}
          strokeWidth={2}
          data-icon="inline-start"
        />
        {format(value, 'd MMM yyyy', { locale })}
      </PopoverTrigger>
      <PopoverContent align="start" className="w-auto">
        <Calendar
          mode="single"
          required
          selected={value}
          defaultMonth={value}
          onSelect={(day) => {
            onChange(day)
            setOpen(false)
          }}
          locale={locale}
          weekStartsOn={weekStartsOn}
        />
      </PopoverContent>
    </Popover>
  )
}
