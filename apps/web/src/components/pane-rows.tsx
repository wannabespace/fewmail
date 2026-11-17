import { SettingsRows } from '@fewmail/ui/components/custom/settings-group'
import { Item, ItemContent, ItemMedia } from '@fewmail/ui/components/item'
import { Skeleton } from '@fewmail/ui/components/skeleton'
import { cn } from '@fewmail/ui/lib/utils'
import { useVirtualizer } from '@tanstack/react-virtual'
import {
  createContext,
  Fragment,
  use,
  useLayoutEffect,
  useRef,
  useState,
} from 'react'
import type {
  ComponentProps,
  CSSProperties,
  ReactNode,
  Ref,
  RefObject,
} from 'react'

import { useIsPaneGrowing } from '~/components/expand-row'

/** Where a row of `PaneRows` sits: spread on its outermost element (a `SettingsRow` takes it as is). */
export interface RowPlace {
  'data-index': number
  ref: (node: Element | null) => void
  rowKey: string
}

const ROW_SIZE = 68

const ScrollerContext = createContext<HTMLDivElement | null>(null)

/** A pane scrolls as a whole: every `PaneRows` in it draws only the rows in and near view, on this one scroller. */
export const PaneScroller = ({
  children,
  className,
  ...props
}: ComponentProps<'div'>) => {
  // State, not a ref: the rows' layout effects run before this div's ref is set, and would never see it.
  const [scroller, setScroller] = useState<HTMLDivElement | null>(null)
  return (
    <div
      ref={setScroller}
      className={cn('h-full overflow-y-auto', className)}
      {...props}
    >
      <ScrollerContext value={scroller}>{children}</ScrollerContext>
    </div>
  )
}

// border-0: in a `divide-y` list the leading gap would draw a line over the first row.
const RowsGap = ({
  height,
  ref,
}: {
  height: number
  ref?: Ref<HTMLDivElement>
}) => (
  <div
    aria-hidden
    ref={ref}
    className="h-(--gap) border-0"
    style={{ '--gap': `${height}px` } as CSSProperties}
  />
)

// Each bar in a line of text, so the skeleton is as tall as the row it stands for and nothing moves when the row comes.
const RowSkeleton = () => (
  <Item size="sm" variant="grouped">
    <ItemMedia variant="avatar">
      <Skeleton className="size-8 rounded-full" />
    </ItemMedia>
    <ItemContent>
      <div className="flex h-lh items-center text-sm/snug">
        <Skeleton className="h-3 w-40" />
      </div>
      <div className="flex h-lh items-center text-sm/snug">
        <Skeleton className="h-3 w-64 max-w-full" />
      </div>
    </ItemContent>
  </Item>
)

/** Anything above the list changing height (a card leaving, the pane growing) moves where its rows start. */
const useListTop = (
  area: HTMLDivElement | null,
  start: RefObject<HTMLDivElement | null>
) => {
  const [top, setTop] = useState(0)
  useLayoutEffect(() => {
    const list = start.current
    if (!area || !list) {
      return
    }
    const measure = () =>
      setTop(
        list.getBoundingClientRect().top -
          area.getBoundingClientRect().top +
          area.scrollTop
      )
    measure()
    const observer = new ResizeObserver(measure)
    for (const child of area.children) {
      observer.observe(child)
    }
    return () => observer.disconnect()
  }, [area, start])
  return top
}

/**
 * A pane's list: the rows in and near view between gaps holding the rest of its height, so the rows stay in the flow
 * (a leaving row folds, the rows below rise) and the pane, not the list, scrolls. Goes straight inside the list's card.
 * `listKey`: a new one replaces every row at once, so nothing folds out (a filter swap). While its pane grows out of
 * its card the rows are skeletons: dozens of real ones, laid out at the box's width on every frame, stalled the growth.
 */
export const PaneRows = <Row,>({
  children,
  listKey,
  rowKey,
  rows,
}: {
  children: (row: Row, place: RowPlace) => ReactNode
  listKey?: string
  rowKey: (row: Row) => string
  rows: Row[]
}) => {
  const scroller = use(ScrollerContext)
  const isGrowing = useIsPaneGrowing()
  const start = useRef<HTMLDivElement>(null)
  const top = useListTop(scroller, start)
  const keys = rows.map(rowKey)
  // oxlint-disable-next-line react/incompatible-library -- the compiler skips this component, which re-renders on every scroll; keep it small
  const virtualizer = useVirtualizer({
    count: rows.length,
    estimateSize: () => ROW_SIZE,
    getItemKey: (index) => keys[index] ?? index,
    getScrollElement: () => scroller,
    overscan: 10,
    scrollMargin: top,
  })
  const shown = virtualizer.getVirtualItems()
  const below = virtualizer.getTotalSize() - ((shown.at(-1)?.end ?? top) - top)
  return (
    <>
      <RowsGap ref={start} height={(shown[0]?.start ?? top) - top} />
      {isGrowing ? (
        shown.map(({ key }) => <RowSkeleton key={key} />)
      ) : (
        <SettingsRows key={listKey} listed={new Set(keys)}>
          {shown.map(({ index }) => {
            const row = rows[index]
            const key = keys[index]
            return (
              row !== undefined &&
              key !== undefined && (
                <Fragment key={key}>
                  {children(row, {
                    'data-index': index,
                    ref: virtualizer.measureElement,
                    rowKey: key,
                  })}
                </Fragment>
              )
            )
          })}
        </SettingsRows>
      )}
      {below > 0 && <RowsGap height={below} />}
    </>
  )
}
