import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@fewmail/ui/components/collapsible'
import { cn } from '@fewmail/ui/lib/utils'
import { ArrowDown01Icon, CircleIcon } from '@hugeicons/core-free-icons'
import type { IconSvgElement } from '@hugeicons/react'
import { HugeiconsIcon } from '@hugeicons/react'
import type { ComponentProps, ReactNode } from 'react'

/** How the assistant got to its answer: one folded line, each step under it when opened. */
const ChainOfThought = ({
  className,
  ...props
}: ComponentProps<typeof Collapsible>) => (
  <Collapsible
    data-slot="chain-of-thought"
    className={cn('flex w-full min-w-0 flex-col', className)}
    {...props}
  />
)

const ChainOfThoughtHeader = ({
  children,
  className,
  icon,
  ...props
}: ComponentProps<typeof CollapsibleTrigger> & { icon: IconSvgElement }) => (
  <CollapsibleTrigger
    data-slot="chain-of-thought-header"
    className={cn(
      'group/cot text-muted-foreground hover:text-foreground focus-visible:focus-ring flex w-fit max-w-full cursor-pointer items-center gap-2 rounded-md text-sm transition-colors outline-none',
      className
    )}
    {...props}
  >
    <HugeiconsIcon icon={icon} strokeWidth={2} className="size-4 shrink-0" />
    <span className="min-w-0 truncate text-left">{children}</span>
    <HugeiconsIcon
      icon={ArrowDown01Icon}
      strokeWidth={2}
      className="size-4 shrink-0 transition-transform group-data-panel-open/cot:rotate-180"
    />
  </CollapsibleTrigger>
)

const ChainOfThoughtContent = ({
  children,
  className,
  ...props
}: ComponentProps<typeof CollapsibleContent>) => (
  <CollapsibleContent data-slot="chain-of-thought-content" {...props}>
    <div className={cn('flex flex-col gap-3 pt-3', className)}>{children}</div>
  </CollapsibleContent>
)

/** One step, joined to the next by a hairline; `active` while it runs. */
const ChainOfThoughtStep = ({
  className,
  description,
  icon = CircleIcon,
  label,
  status = 'complete',
  ...props
}: ComponentProps<'div'> & {
  description?: ReactNode
  icon?: IconSvgElement
  label: ReactNode
  status?: 'active' | 'complete' | 'pending'
}) => (
  <div
    data-slot="chain-of-thought-step"
    data-status={status}
    className={cn(
      'group/step text-muted-foreground data-[status=active]:text-foreground data-[status=pending]:text-muted-foreground/50 flex gap-2 text-sm',
      className
    )}
    {...props}
  >
    <div className="relative mt-0.5">
      <HugeiconsIcon icon={icon} strokeWidth={2} className="size-4" />
      <div className="bg-border absolute top-6 -bottom-2.5 left-1/2 w-px -translate-x-1/2 group-last/step:hidden" />
    </div>
    <div className="flex min-w-0 flex-1 flex-col gap-1">
      <div className="group-data-[status=active]/step:shimmer motion-reduce:shimmer-none min-w-0">
        {label}
      </div>
      {description && <div className="text-xs">{description}</div>}
    </div>
  </div>
)

export {
  ChainOfThought,
  ChainOfThoughtContent,
  ChainOfThoughtHeader,
  ChainOfThoughtStep,
}
