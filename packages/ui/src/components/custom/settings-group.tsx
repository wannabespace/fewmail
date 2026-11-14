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

/** `htmlFor`: makes the whole row the control's label, for a `Switch`; leave it out for a control that opens a popup. `render`: the whole row as a link. */
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
}) => (
  <Item
    size="sm"
    variant="grouped"
    className={cn(dense && 'py-2')}
    data-active={active || undefined}
    data-index={dataIndex}
    ref={ref}
    // oxlint-disable-next-line jsx-a11y/label-has-associated-control -- Item renders the title and description into this label
    render={htmlFor ? <label htmlFor={htmlFor} /> : render}
  >
    {icon && <ItemMedia variant={iconVariant}>{icon}</ItemMedia>}
    <ItemContent>
      <ItemTitle>
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
    {children && <ItemActions>{children}</ItemActions>}
  </Item>
)
