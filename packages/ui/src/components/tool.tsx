import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@fewmail/ui/components/collapsible'
import { Spinner } from '@fewmail/ui/components/spinner'
import { cn } from '@fewmail/ui/lib/utils'
import {
  ArrowDown01Icon,
  Cancel01Icon,
  Tick02Icon,
} from '@hugeicons/core-free-icons'
import type { IconSvgElement } from '@hugeicons/react'
import { HugeiconsIcon } from '@hugeicons/react'
import type { ComponentProps, ReactNode } from 'react'

type ToolState = 'done' | 'error' | 'running'

const STATE_ICONS: Record<Exclude<ToolState, 'running'>, IconSvgElement> = {
  done: Tick02Icon,
  error: Cancel01Icon,
}

/** What the assistant did or offers as one block of the chat: a header, and what it holds when there is anything. */
const Tool = ({ className, ...props }: ComponentProps<typeof Collapsible>) => (
  <Collapsible
    data-slot="tool"
    className={cn(
      'bg-popover ring-foreground/6 w-full overflow-hidden rounded-xl ring',
      className
    )}
    {...props}
  />
)

const ToolHeader = ({
  action,
  className,
  icon,
  isOpenable = true,
  state,
  title,
}: {
  /** At the header's end, beside the chevron: the block's one quick decision. */
  action?: ReactNode
  className?: string
  icon: IconSvgElement
  isOpenable?: boolean
  state?: ToolState
  title: ReactNode
}) => {
  const head = (
    <>
      <HugeiconsIcon
        icon={icon}
        strokeWidth={2}
        className="text-muted-foreground size-4 shrink-0"
      />
      <span className="min-w-0 flex-1 truncate text-left text-sm font-medium">
        {title}
      </span>
      {state === 'running' && <Spinner className="text-muted-foreground" />}
      {state && state !== 'running' && (
        <HugeiconsIcon
          icon={STATE_ICONS[state]}
          strokeWidth={2}
          className={cn(
            'size-4 shrink-0',
            state === 'done' ? 'text-success' : 'text-destructive'
          )}
        />
      )}
    </>
  )
  return (
    <div
      data-slot="tool-header"
      className={cn('flex items-center gap-2 px-3.5 py-2.5', className)}
    >
      {isOpenable ? (
        <CollapsibleTrigger className="focus-visible:focus-ring group/tool flex min-w-0 flex-1 cursor-pointer items-center gap-2 rounded-md outline-none">
          {head}
          <HugeiconsIcon
            icon={ArrowDown01Icon}
            strokeWidth={2}
            className="text-muted-foreground size-4 shrink-0 transition-transform group-data-panel-open/tool:rotate-180"
          />
        </CollapsibleTrigger>
      ) : (
        <div className="flex min-w-0 flex-1 items-center gap-2">{head}</div>
      )}
      {action}
    </div>
  )
}

/** `rows`: rows that run to the block's edges, parted by their own hairlines (`Accordion variant="rows"`). */
const ToolContent = ({
  className,
  variant = 'default',
  ...props
}: Omit<ComponentProps<typeof CollapsibleContent>, 'variant'> & {
  variant?: 'default' | 'rows'
}) => (
  <CollapsibleContent
    data-slot="tool-content"
    className={cn(
      'border-t',
      variant === 'default' && 'px-3.5 py-3',
      className
    )}
    {...props}
  />
)

export { Tool, ToolContent, ToolHeader }
export type { ToolState }
