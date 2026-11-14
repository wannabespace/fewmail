import { Badge } from '@fewmail/ui/components/badge'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@fewmail/ui/components/tooltip'
import { cn } from '@fewmail/ui/lib/utils'
import { parseISO } from 'date-fns'

import { useDates, useT } from '~/lib/i18n'

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

  return (
    <>
      {extracted.amount && (
        <Badge variant="secondary" size={size} data-mask>
          {extracted.amount}
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
        <Badge variant="secondary" size={size} data-mask>
          {extracted.meetingTime}
        </Badge>
      )}
    </>
  )
}
