import { useRender } from '@base-ui/react/use-render'
import { cardClass } from '@fewmail/ui/components/card.utils'
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemMedia,
  ItemTitle,
  smallItemBleedClassName,
} from '@fewmail/ui/components/item'
import { cn } from '@fewmail/ui/lib/utils'
import { InformationCircleIcon } from '@hugeicons/core-free-icons'
import { useEffect, useId } from 'react'
import type { ComponentProps, ReactElement, ReactNode } from 'react'

import { IconButton } from './icon-button'

export const SettingsGroup = ({
  children,
  title,
}: {
  children: ReactNode
  title?: ReactNode
}) => (
  <section className="flex flex-col gap-2">
    {title && (
      <h2 className="text-muted-foreground text-xs font-medium">{title}</h2>
    )}
    <div
      className={cn(
        cardClass,
        smallItemBleedClassName,
        'flex flex-col overflow-hidden'
      )}
    >
      {children}
    </div>
  </section>
)

/** Laid over the whole row; the row's actions are positioned after it, so they stay above it. */
const RowTrigger = ({
  labelledBy,
  render,
}: {
  labelledBy: string
  render: ReactElement
}) =>
  useRender({
    props: {
      'aria-labelledby': labelledBy,
      className: 'absolute inset-0 cursor-pointer outline-none',
      'data-slot': 'row-trigger',
    },
    render,
  })

/**
 * `htmlFor`: makes the whole row the control's label, for a `Switch`; leave it out for a control that opens a popup. `render`: the whole row as a link.
 * `trigger`: the whole row as a button (a popover's trigger) that can still hold actions, which a link or a label cannot.
 */
export const SettingsRow = ({
  active,
  children,
  'data-index': dataIndex,
  dense,
  description,
  hint,
  htmlFor,
  icon,
  iconVariant,
  ref,
  render,
  title,
  trigger,
}: Pick<ComponentProps<'div'>, 'ref'> & {
  /** The keyboard cursor's row in a list walked with J / K. */
  active?: boolean
  children?: ReactNode
  'data-index'?: number
  dense?: boolean
  description?: ReactNode
  /** What a long description would say, behind an info glyph so the row stays one line. */
  hint?: string
  htmlFor?: string
  icon?: ReactNode
  iconVariant?: 'avatar'
  render?: ReactElement
  title: ReactNode
  trigger?: ReactElement
}) => {
  const titleId = useId()
  // J / K walk a list past the screen's edge: the cursor's row comes into view.
  useEffect(() => {
    if (active) {
      document
        .querySelector(`#${titleId}`)
        ?.closest('[data-slot=item]')
        ?.scrollIntoView({ block: 'nearest' })
    }
  }, [active, titleId])
  return (
    <Item
      size="sm"
      variant="grouped"
      className={cn(
        dense && 'py-2',
        trigger &&
          'has-data-popup-open:bg-accent hover:bg-accent has-[[data-slot=row-trigger]:focus-visible]:focus-ring relative cursor-pointer'
      )}
      data-active={active || undefined}
      data-index={dataIndex}
      ref={ref}
      // oxlint-disable-next-line jsx-a11y/label-has-associated-control -- Item renders the title and description into this label
      render={htmlFor ? <label htmlFor={htmlFor} /> : render}
    >
      {trigger && <RowTrigger labelledBy={titleId} render={trigger} />}
      {icon && <ItemMedia variant={iconVariant}>{icon}</ItemMedia>}
      <ItemContent className="min-w-0">
        <ItemTitle id={titleId}>
          {title}
          {hint && (
            <IconButton
              icon={InformationCircleIcon}
              label={hint}
              size="icon-2xs"
              variant="ghost-muted"
              className="-my-1"
            />
          )}
        </ItemTitle>
        {description && <ItemDescription>{description}</ItemDescription>}
      </ItemContent>
      {children && (
        // Over the row's trigger only its controls take the click; text beside them (an amount, a time) opens the row.
        <ItemActions
          className={cn(
            trigger &&
              'pointer-events-none relative [&_:is(a,button,input,label,select,textarea,[role],[data-slot=tooltip-trigger])]:pointer-events-auto'
          )}
        >
          {children}
        </ItemActions>
      )}
    </Item>
  )
}
