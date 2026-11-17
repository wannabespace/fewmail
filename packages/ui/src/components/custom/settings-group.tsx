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
import {
  AnimatePresence,
  motion,
  useIsPresent,
  useReducedMotion,
} from 'motion/react'
import { createContext, use, useEffect, useId } from 'react'
import type { ComponentProps, ReactElement, ReactNode } from 'react'

import { IconButton } from './icon-button'

/** A group's title over a card of its own (`SettingsGroup`'s, or a `list` `Accordion`); `action` ends the row without growing it. */
export const SettingsGroupTitle = ({
  action,
  children,
  isSticky,
}: {
  action?: ReactNode
  children: ReactNode
  /** In a Home pane: the title sticks under its heading row (`top-17`) and spans the pane's gutter (`home-card.tsx`), covering the cards scrolling under it. */
  isSticky?: boolean
}) => (
  <div
    className={cn(
      'text-muted-foreground flex items-center gap-2 text-xs font-medium',
      isSticky &&
        'bg-background sticky top-17 z-5 -mx-4 -my-2 px-4 py-2 md:-mx-10 md:px-10'
    )}
  >
    <h2 className="flex min-w-0 items-center gap-2">{children}</h2>
    {action && <div className="-my-1 ml-auto">{action}</div>}
  </div>
)

export const SettingsGroup = ({
  children,
  isTitleSticky,
  title,
}: {
  children: ReactNode
  isTitleSticky?: boolean
  title?: ReactNode
}) => (
  <section className="flex flex-col gap-2">
    {title && (
      <SettingsGroupTitle isSticky={isTitleSticky}>{title}</SettingsGroupTitle>
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

const ROW_FOLD = {
  borderBottomWidth: 0,
  height: 0,
  opacity: 0,
  paddingBottom: 0,
  paddingTop: 0,
}
const ROW_LEAVE = { duration: 0.2, ease: [0.32, 0.72, 0, 1] } as const

// Only rows of a list fold: a row inside a pane or card that leaves as a whole would fold inside it.
const ListContext = createContext<{ listed?: ReadonlySet<string> } | null>(null)

/**
 * Keyed rows that come and go: a row that leaves folds and the rows below rise into its place; a link row (`render`) just goes.
 * `listed`: every row's key, for a virtualized list whose rows pass `rowKey`. A row the window scrolled past is still listed and goes at once, taking no room, or the rows below jump by its height.
 */
export const SettingsRows = ({
  children,
  listed,
}: {
  children: ReactNode
  listed?: ReadonlySet<string>
}) => (
  <ListContext value={{ listed }}>
    <AnimatePresence initial={false}>{children}</AnimatePresence>
  </ListContext>
)

/** A row of `SettingsRows` folds as it leaves; one the window scrolled past (still in `listed`) goes at once. */
export const useRowFold = (rowKey: string | undefined) => {
  const list = use(ListContext)
  const isLeaving = !useIsPresent() && !!list
  const isScrolledPast =
    isLeaving && rowKey !== undefined && !!list?.listed?.has(rowKey)
  const isReducedMotion = useReducedMotion()
  return {
    isLeaving,
    isScrolledPast,
    motionProps: list && {
      exit: isScrolledPast ? undefined : ROW_FOLD,
      initial: false as const,
      transition: isReducedMotion ? { duration: 0 } : ROW_LEAVE,
    },
  }
}

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
  rowKey,
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
  /** The row's key in a `SettingsRows` given `listed`. */
  rowKey?: string
  title: ReactNode
  trigger?: ReactElement
}) => {
  const titleId = useId()
  const { isLeaving, isScrolledPast, motionProps } = useRowFold(rowKey)
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
        isLeaving && 'pointer-events-none overflow-hidden',
        trigger &&
          'has-data-popup-open:bg-accent hover:bg-accent has-[[data-slot=row-trigger][aria-expanded=true]]:bg-secondary has-[[data-slot=row-trigger]:focus-visible]:focus-ring relative cursor-pointer'
      )}
      data-active={active || undefined}
      // A leaving row's index is stale, so the virtualizer stops measuring it (-1 is out of range).
      data-index={isLeaving ? -1 : dataIndex}
      hidden={isScrolledPast}
      ref={isLeaving ? undefined : ref}
      // oxlint-disable-next-line jsx-a11y/label-has-associated-control -- Item renders the title and description into this label
      render={
        render ??
        (htmlFor ? (
          <motion.label htmlFor={htmlFor} {...motionProps} />
        ) : (
          <motion.div {...motionProps} />
        ))
      }
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
