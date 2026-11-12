import { Accordion as AccordionPrimitive } from '@base-ui/react/accordion'
import { cn } from '@fewmail/ui/lib/utils'
import { ArrowDown01Icon, ArrowUp01Icon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { createContext, useContext } from 'react'

type AccordionVariant = 'default' | 'cards'

const VariantContext = createContext<AccordionVariant>('default')

const Accordion = ({
  className,
  variant = 'default',
  ...props
}: AccordionPrimitive.Root.Props & { variant?: AccordionVariant }) => (
  <VariantContext value={variant}>
    <AccordionPrimitive.Root
      data-slot="accordion"
      className={cn(
        'flex w-full flex-col',
        variant === 'cards' ? 'gap-2.5' : 'overflow-hidden rounded-2xl border',
        className
      )}
      {...props}
    />
  </VariantContext>
)

const AccordionItem = ({
  className,
  tone = 'default',
  ...props
}: AccordionPrimitive.Item.Props & { tone?: 'default' | 'destructive' }) => {
  const variant = useContext(VariantContext)

  return (
    <AccordionPrimitive.Item
      data-slot="accordion-item"
      className={cn(
        variant === 'cards'
          ? cn(
              'bg-popover data-open:ring-foreground/10 rounded-2xl ring transition-shadow data-open:shadow-sm',
              tone === 'destructive'
                ? 'ring-destructive/40 hover:ring-destructive/60 data-open:ring-destructive/40'
                : 'ring-foreground/6 hover:ring-foreground/10'
            )
          : 'data-open:bg-muted/50 not-last:border-b',
        className
      )}
      {...props}
    />
  )
}

const AccordionTrigger = ({
  className,
  children,
  ...props
}: AccordionPrimitive.Trigger.Props) => {
  const variant = useContext(VariantContext)

  return (
    <AccordionPrimitive.Header className="flex">
      <AccordionPrimitive.Trigger
        data-slot="accordion-trigger"
        className={cn(
          `group/accordion-trigger focus-visible:focus-ring relative flex min-w-0 flex-1 border border-transparent text-left transition-all outline-none focus-visible:ring-inset aria-disabled:pointer-events-none aria-disabled:opacity-50`,
          variant === 'cards'
            ? 'cursor-pointer items-center gap-3 rounded-2xl px-4.5 py-4'
            : `**:data-[slot=accordion-trigger-icon]:text-muted-foreground items-start justify-between gap-6 p-4 text-sm font-medium hover:underline **:data-[slot=accordion-trigger-icon]:ml-auto **:data-[slot=accordion-trigger-icon]:size-4`,
          className
        )}
        {...props}
      >
        {children}
        {variant === 'default' && (
          <>
            <HugeiconsIcon
              icon={ArrowDown01Icon}
              strokeWidth={2}
              data-slot="accordion-trigger-icon"
              className="pointer-events-none shrink-0 group-aria-expanded/accordion-trigger:hidden"
            />
            <HugeiconsIcon
              icon={ArrowUp01Icon}
              strokeWidth={2}
              data-slot="accordion-trigger-icon"
              className="pointer-events-none hidden shrink-0 group-aria-expanded/accordion-trigger:inline"
            />
          </>
        )}
      </AccordionPrimitive.Trigger>
    </AccordionPrimitive.Header>
  )
}

const AccordionContent = ({
  className,
  children,
  ...props
}: AccordionPrimitive.Panel.Props) => {
  const variant = useContext(VariantContext)

  return (
    <AccordionPrimitive.Panel
      data-slot="accordion-content"
      // clip-path, not overflow-hidden: the panel must clip while its height moves, and overflow-hidden would also cut the focus rings (3px) of the controls inside; the bottom stays flush so closing content never peeks past the item
      className={cn(
        'ease-house h-(--accordion-panel-height) text-sm transition-[height] duration-200 [clip-path:inset(-4px_-4px_0)] data-ending-style:h-0 data-starting-style:h-0 motion-reduce:transition-none',
        variant === 'cards' ? 'px-4.5' : 'px-4'
      )}
      {...props}
    >
      <div
        className={cn(
          `[&_a]:hover:text-foreground pt-0 pb-4 [&_a]:underline [&_a]:underline-offset-3 [&_p:not(:last-child)]:mb-4`,
          className
        )}
      >
        {children}
      </div>
    </AccordionPrimitive.Panel>
  )
}

export { Accordion, AccordionContent, AccordionItem, AccordionTrigger }
