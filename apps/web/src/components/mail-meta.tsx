import { Badge } from '@fewmail/ui/components/badge'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@fewmail/ui/components/tooltip'
import { cn } from '@fewmail/ui/lib/utils'
import { isToday, parseISO } from 'date-fns'
import { useEffect, useState } from 'react'

import { useDates, useLocale, useMoneyFormat, useT } from '~/lib/i18n'

// The meta and the actions share one cell, so the cell is always as wide as the actions and hovering never shifts the row.
// The actions must stay last and `relative`: the faded meta (opacity < 1) paints above unpositioned siblings and would swallow their clicks.
export const ROW_SWAP =
  'grid items-center justify-items-end *:[grid-area:1/1] *:transition-opacity *:duration-150 *:ease-house *:last:relative'

const HOUR = 3_600_000

/** Mail's time: "15 min ago" within the hour, the hour today, the day before. */
export const RowTime = ({ date }: { date: Date }) => {
  const t = useT()
  const locale = useLocale()
  const dates = useDates()
  const [now, setNow] = useState(Date.now)
  const age = now - date.getTime()
  const isRecent = age < HOUR
  useEffect(() => {
    if (!isRecent) {
      return
    }
    const timer = setInterval(() => setNow(Date.now()), 60_000)
    return () => clearInterval(timer)
  }, [isRecent])
  if (age < 60_000) {
    return t.justNow
  }
  if (isRecent) {
    return new Intl.RelativeTimeFormat(locale, { style: 'short' }).format(
      -Math.floor(age / 60_000),
      'minute'
    )
  }
  return dates.format(date, isToday(date) ? 'HH:mm' : 'd MMM')
}

export const ImportanceDot = ({
  importance,
  reason,
}: {
  importance: number
  reason?: string
}) => {
  const label = useT().importance[importance]

  return (
    <Tooltip>
      <TooltipTrigger
        render={<span />}
        aria-label={label}
        className={cn(
          'size-2 shrink-0 rounded-full',
          importance >= 3 && 'bg-destructive',
          importance === 2 && 'bg-primary',
          importance === 1 && 'bg-foreground/30',
          importance <= 0 && 'ring-foreground/25 ring'
        )}
      />
      <TooltipContent>
        {label}
        {reason && ` · ${reason}`}
      </TooltipContent>
    </Tooltip>
  )
}

const ISO_DATE = /^\d{4}-\d{2}-\d{2}/u
const AMOUNT = /^(?<value>-?\d+(?:\.\d+)?) (?<currency>[A-Z]{3})$/u

export const ExtractedChips = ({
  extracted,
  size,
}: {
  extracted: {
    amount: string | null
    dueDate: string | null
    meetingTime: string | null
  }
  size?: 'sm'
}) => {
  const t = useT()
  const dates = useDates()
  const money = useMoneyFormat()
  const { currency, value } = AMOUNT.exec(extracted.amount ?? '')?.groups ?? {}

  return (
    <>
      {extracted.amount && (
        <Badge variant="secondary" size={size} data-mask>
          {value && currency
            ? money(Math.round(Number(value) * 100), currency)
            : extracted.amount}
        </Badge>
      )}
      {extracted.dueDate && (
        <Tooltip>
          <TooltipTrigger
            render={<Badge variant="secondary" size={size} data-mask />}
          >
            {t.mail.due(
              ISO_DATE.test(extracted.dueDate)
                ? dates.format(
                    parseISO(extracted.dueDate.slice(0, 10)),
                    'd MMM'
                  )
                : extracted.dueDate
            )}
          </TooltipTrigger>
          <TooltipContent>{t.mail.dueHint}</TooltipContent>
        </Tooltip>
      )}
      {extracted.meetingTime && (
        <Tooltip>
          <TooltipTrigger
            render={
              // A narrow row's meta ends at its right edge: a chip that cannot shrink was cut off at its start.
              <Badge
                variant="secondary"
                size={size}
                className="max-w-48 min-w-0 shrink"
                data-mask
              />
            }
          >
            <span className="truncate">{extracted.meetingTime}</span>
          </TooltipTrigger>
          <TooltipContent data-mask>{extracted.meetingTime}</TooltipContent>
        </Tooltip>
      )}
    </>
  )
}
