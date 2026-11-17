import { SettingsRows } from '@fewmail/ui/components/custom/settings-group'
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

import { usePaneMorph } from '~/components/expand-row'

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

/** Anything above the list changing height (a card leaving, the pane growing) moves where its rows start. */
const useListTop = (
  area: HTMLDivElement | null,
  start: RefObject<HTMLDivElement | null>
) => {
  const [top, setTop] = useState<number | null>(null)
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
 * `listKey`: a new one replaces every row at once, so nothing folds out (a group's Show all / Show fewer). While its pane grows out of
 * its card, or back into it, it holds only the rows one screen shows: every row in it is laid out at the box's width on
 * every frame, and dozens of them stalled the growth.
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
  const morph = usePaneMorph()
  const start = useRef<HTMLDivElement>(null)
  const top = useListTop(scroller, start)
  const keys = rows.map(rowKey)
  // oxlint-disable-next-line react/incompatible-library -- the compiler skips this component, which re-renders on every scroll; keep it small
  const virtualizer = useVirtualizer({
    count: rows.length,
    estimateSize: () => ROW_SIZE,
    getItemKey: (index) => keys[index] ?? index,
    // Not the pane's scroller while it grows: a screen's height, not the box's, so no row comes in mid-growth. Shrinking,
    // it keeps the scroller, so the rows left are the ones where the user scrolled to.
    getScrollElement: () => (morph === 'growing' ? null : scroller),
    initialRect: { height: window.innerHeight, width: 0 },
    overscan: morph ? 0 : 10,
    scrollMargin: top ?? 0,
  })
  // Until the list knows where it starts, a list under the screen's edge would take it for the top and draw a screen of rows.
  const shown = top === null ? [] : virtualizer.getVirtualItems()
  const listTop = top ?? 0
  const below =
    virtualizer.getTotalSize() - ((shown.at(-1)?.end ?? listTop) - listTop)
  return (
    <>
      <RowsGap ref={start} height={(shown[0]?.start ?? listTop) - listTop} />
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
      {below > 0 && <RowsGap height={below} />}
    </>
  )
}
