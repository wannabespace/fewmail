import { Collapsible as CollapsiblePrimitive } from '@base-ui/react/collapsible'
import { cn } from '@fewmail/ui/lib/utils'

const Collapsible = ({ ...props }: CollapsiblePrimitive.Root.Props) => (
  <CollapsiblePrimitive.Root data-slot="collapsible" {...props} />
)

const CollapsibleTrigger = ({
  className,
  variant,
  ...props
}: CollapsiblePrimitive.Trigger.Props & { variant?: 'disclosure' }) => (
  <CollapsiblePrimitive.Trigger
    data-slot="collapsible-trigger"
    className={cn(
      variant === 'disclosure' &&
        'text-muted-foreground hover:text-foreground focus-visible:focus-ring flex cursor-pointer items-center gap-1 rounded-sm text-xs font-medium transition-colors outline-none [&>svg]:size-3.5 [&>svg]:transition-transform data-panel-open:[&>svg]:rotate-90',
      className
    )}
    {...props}
  />
)

const CollapsibleContent = ({
  className,
  variant,
  ...props
}: CollapsiblePrimitive.Panel.Props & { variant?: 'disclosure' }) => (
  <CollapsiblePrimitive.Panel
    data-slot="collapsible-content"
    // clip-path, not overflow-hidden: overflow-hidden would also cut the focus rings (3px) of the controls inside
    className={cn(
      'ease-house h-(--collapsible-panel-height) transition-[height] duration-200 [clip-path:inset(-4px_-4px_0)] data-ending-style:h-0 data-starting-style:h-0 motion-reduce:transition-none',
      variant === 'disclosure' && 'border-l pl-3',
      className
    )}
    {...props}
  />
)

export { Collapsible, CollapsibleContent, CollapsibleTrigger }
