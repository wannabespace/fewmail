import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@fewmail/ui/components/collapsible'
import { cn } from '@fewmail/ui/lib/utils'
import { ArrowRight01Icon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import type { ComponentProps } from 'react'

/** The steps an agent took, one muted line each; a running one shimmers. */
const Trace = ({ className, ...props }: ComponentProps<'div'>) => (
  <div
    data-slot="trace"
    className={cn('flex w-full min-w-0 flex-col gap-2', className)}
    {...props}
  />
)

const TraceLine = ({
  className,
  status,
  ...props
}: ComponentProps<'span'> & { status?: 'error' | 'pending' | 'running' }) => (
  <span
    data-slot="trace-line"
    data-status={status}
    className={cn(
      'text-muted-foreground in-[a:hover,button:hover]:text-foreground data-[status=error]:text-destructive data-[status=running]:*:data-[slot=trace-title]:shimmer flex w-fit max-w-full min-w-0 items-center gap-2 text-sm transition-colors in-[a,button]:cursor-pointer data-[status=pending]:opacity-60',
      className
    )}
    {...props}
  />
)

const TraceIcon = ({ className, ...props }: ComponentProps<'span'>) => (
  <span
    data-slot="trace-icon"
    aria-hidden
    className={cn(
      "flex size-4 shrink-0 items-center justify-center [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4",
      className
    )}
    {...props}
  />
)

const TraceTitle = ({ className, ...props }: ComponentProps<'span'>) => (
  <span
    data-slot="trace-title"
    className={cn('motion-reduce:shimmer-none min-w-0 truncate', className)}
    {...props}
  />
)

const TraceDescription = ({ className, ...props }: ComponentProps<'span'>) => (
  <span
    data-slot="trace-description"
    className={cn('text-muted-foreground/70 shrink-0 tabular-nums', className)}
    {...props}
  />
)

const TraceCollapsible = ({
  className,
  ...props
}: ComponentProps<typeof Collapsible>) => (
  <Collapsible
    data-slot="trace-collapsible"
    className={cn('flex w-full min-w-0 flex-col', className)}
    {...props}
  />
)

const TraceCollapsibleTrigger = ({
  children,
  className,
  ...props
}: ComponentProps<typeof CollapsibleTrigger>) => (
  <CollapsibleTrigger
    data-slot="trace-collapsible-trigger"
    className={cn(
      'group/trace-trigger text-muted-foreground hover:text-foreground focus-visible:focus-ring flex w-fit max-w-full min-w-0 cursor-pointer items-center gap-1 rounded-lg text-left transition-colors outline-none',
      className
    )}
    {...props}
  >
    {children}
    <TraceIcon className="transition-transform group-data-panel-open/trace-trigger:rotate-90">
      <HugeiconsIcon icon={ArrowRight01Icon} strokeWidth={2} />
    </TraceIcon>
  </CollapsibleTrigger>
)

const TraceCollapsibleContent = ({
  children,
  className,
  ...props
}: ComponentProps<typeof CollapsibleContent>) => (
  <CollapsibleContent data-slot="trace-collapsible-content" {...props}>
    <div
      className={cn(
        'text-muted-foreground mt-2 mb-1 ml-[calc(--spacing(2)-1px)] min-w-0 border-l pr-1 pl-4 leading-relaxed wrap-break-word',
        className
      )}
    >
      {children}
    </div>
  </CollapsibleContent>
)

export {
  Trace,
  TraceCollapsible,
  TraceCollapsibleContent,
  TraceCollapsibleTrigger,
  TraceDescription,
  TraceIcon,
  TraceLine,
  TraceTitle,
}
