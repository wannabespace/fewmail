import { Badge } from '@fewmail/ui/components/badge'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@fewmail/ui/components/tooltip'
import { cn } from '@fewmail/ui/lib/utils'

import { useT } from '~/lib/i18n'

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

export const ExtractedChips = ({
  extracted,
}: {
  extracted: {
    amount: string | null
    dueDate: string | null
    meetingTime: string | null
  }
}) => {
  const t = useT()

  return (
    <>
      {extracted.amount && (
        <Badge variant="secondary" data-mask>
          {extracted.amount}
        </Badge>
      )}
      {extracted.dueDate && (
        <Badge variant="secondary" data-mask>
          {t.mail.due(extracted.dueDate)}
        </Badge>
      )}
      {extracted.meetingTime && (
        <Badge variant="secondary" data-mask>
          {extracted.meetingTime}
        </Badge>
      )}
    </>
  )
}
