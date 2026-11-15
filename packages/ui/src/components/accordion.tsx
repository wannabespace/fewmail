import { Accordion as AccordionPrimitive } from '@base-ui/react/accordion'
import { cardClass } from '@fewmail/ui/components/card.utils'
import { smallItemBleedClassName } from '@fewmail/ui/components/item'
import { cn } from '@fewmail/ui/lib/utils'
import { ArrowDown01Icon, ArrowUp01Icon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { createContext, useContext } from 'react'
import type { ReactNode } from 'react'

/** `list`: one card of hairline-parted rows, like `SettingsGroup`, each row unfolding in place. */
type AccordionVariant = 'default' | 'cards' | 'list'

// Keep in step with the cards trigger's inset (its 1px border + px-4.5): the bleed lines its content up with the text above.
const cardsBleedClassName = '-mx-4.75'

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
        'flex flex-col',
        {
          cards: `gap-2.5 ${cardsBleedClassName}`,
          default: 'w-full overflow-hidden rounded-2xl border',
          list: cn(
            cardClass,
            smallItemBleedClassName,
            'divide-foreground/6 divide-y overflow-hidden'
          ),
        }[variant],
        className
      )}
      {...props}
    />
  </VariantContext>
)

const AccordionItem = ({
  active,
  className,
  tone = 'default',
  ...props
}: AccordionPrimitive.Item.Props & {
  /** The keyboard cursor: a ring stronger than hover, so a folded card reads as "here" without looking open. */
  active?: boolean
  tone?: 'default' | 'destructive'
}) => {
  const variant = useContext(VariantContext)

  return (
    <AccordionPrimitive.Item
      data-slot="accordion-item"
      data-active={active || undefined}
      className={cn(
        {
          cards: cn(
            'bg-popover data-open:ring-foreground/10 rounded-2xl ring transition-shadow data-open:shadow-sm',
            tone === 'destructive'
              ? 'ring-destructive/40 hover:ring-destructive/60 data-active:ring-destructive/80 data-open:ring-destructive/40'
              : 'ring-foreground/6 hover:ring-foreground/10 data-active:ring-foreground/25'
          ),
          default: 'data-open:bg-muted/50 not-last:border-b',
          list: 'group/accordion-item',
        }[variant],
        className
      )}
      {...props}
    />
  )
}

/** `trailing` sits beside the trigger, not in it, so a control there (a checkbox) never nests a button in a button. */
const AccordionTrigger = ({
  className,
  children,
  trailing,
  ...props
}: AccordionPrimitive.Trigger.Props & { trailing?: ReactNode }) => {
  const variant = useContext(VariantContext)

  return (
    <AccordionPrimitive.Header
      className={cn(
        'flex',
        variant === 'list' &&
          'group-data-active/accordion-item:bg-accent hover:bg-accent'
      )}
    >
      <AccordionPrimitive.Trigger
        data-slot="accordion-trigger"
        className={cn(
          `group/accordion-trigger focus-visible:focus-ring relative flex min-w-0 flex-1 border border-transparent text-left transition-all outline-none focus-visible:ring-inset aria-disabled:pointer-events-none aria-disabled:opacity-50`,
          variant === 'cards' &&
            'cursor-pointer items-center gap-3 rounded-2xl px-4.5 py-4',
          variant === 'list' &&
            'cursor-pointer items-center gap-3.5 border-0 py-3 pl-3.5 text-sm',
          variant === 'default' &&
            `**:data-[slot=accordion-trigger-icon]:text-muted-foreground items-start justify-between gap-6 p-4 text-sm font-medium hover:underline **:data-[slot=accordion-trigger-icon]:ml-auto **:data-[slot=accordion-trigger-icon]:size-4`,
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
      {trailing && (
        <div
          className={cn(
            'relative flex shrink-0 items-center',
            variant === 'list' ? 'pr-3.5' : 'pr-4.5'
          )}
        >
          {trailing}
        </div>
      )}
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
        { cards: 'px-4.5', default: 'px-4', list: 'px-3.5' }[variant]
      )}
      {...props}
    >
      <div
        className={cn(
          `[&_a:not([data-slot])]:hover:text-foreground pt-0 pb-4 [&_a:not([data-slot])]:underline [&_a:not([data-slot])]:underline-offset-3 [&_p:not(:last-child)]:mb-4`,
          className
        )}
      >
        {children}
      </div>
    </AccordionPrimitive.Panel>
  )
}

export {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
  cardsBleedClassName,
}
