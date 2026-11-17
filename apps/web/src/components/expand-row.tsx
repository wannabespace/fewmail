import { cn } from '@fewmail/ui/lib/utils'
import {
  animate,
  motion,
  PresenceContext,
  useMotionValue,
  usePresence,
  useReducedMotion,
  useTransform,
} from 'motion/react'
import type { MotionStyle, Transition } from 'motion/react'
import { useContext, useEffect, useLayoutEffect, useRef, useState } from 'react'
import type { ComponentProps, ReactNode } from 'react'
import { createStore } from 'seitu'
import { useSubscription } from 'seitu/react'

import { prefetchThread } from '~/lib/mail-db'
import { posthog } from '~/lib/posthog'

const HOUSE_EASE = [0.32, 0.72, 0, 1] as const

/**
 * One clock for a card growing into its pane and back: the card's content grows with the box and hands over to
 * the pane's while it is still growing, one blurring out as the other fades in; closing, the pane's content
 * fades out at once and the card's is back while the box shrinks into its place. Shown over the card's content from the
 * start, the pane's read as a second layer opening on it.
 */
const clockOf = (isReduced: boolean | null) => {
  const at = (delay: number, duration: number): Transition =>
    isReduced ? { duration: 0 } : { delay, duration, ease: HOUSE_EASE }
  // A spring: the house curve's fast start jerked the box and then crawled the rest of the way.
  const spring = (bounce: number): Transition =>
    isReduced
      ? { duration: 0 }
      : { bounce, type: 'spring', visualDuration: 0.25 }
  return {
    box: spring(0.15),
    copyIn: at(0.04, 0.13),
    copyOut: at(0.04, 0.13),
    paneIn: at(0.04, 0.18),
    paneOut: at(0, 0.13),
  } satisfies Record<string, Transition>
}

const useMorphClock = () => clockOf(useReducedMotion())

const HIDDEN = { filter: 'blur(4px)', opacity: 0 }
const SHOWN = { filter: 'blur(0px)', opacity: 1 }

const CARD_RADIUS = 16

/**
 * What a pane shows: it fades in as the card's content blurs out, and out as the box starts to shrink. Never blurred: a
 * blur over a whole pane, laid out again on every frame of the growth, lagged on phones.
 */
export const PaneReveal = ({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}) => {
  const clock = useMorphClock()
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1, transition: clock.paneIn }}
      exit={{ opacity: 0, transition: clock.paneOut }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

const sourceOf = (source: string) =>
  document.querySelector<HTMLElement>(
    `[data-morph-source="${CSS.escape(source)}"]`
  )

const insetOver = (source: string, area: string) => {
  const areaBox = document
    .querySelector(`[data-slot=${area}]`)
    ?.getBoundingClientRect()
  const box = sourceOf(source)?.getBoundingClientRect()
  if (!areaBox || !box) {
    return null
  }
  return {
    bottom: areaBox.bottom - box.bottom,
    height: box.height,
    left: box.left - areaBox.left,
    right: areaBox.right - box.right,
    top: box.top - areaBox.top,
    width: box.width,
  }
}

/** A still copy of the source to blur in the box where the source is: a card's own content cannot be drawn in its pane. */
const copyOf = (source: string) => {
  const copy = sourceOf(source)?.cloneNode(true)
  if (!(copy instanceof HTMLElement)) {
    return null
  }
  delete copy.dataset.morphSource
  copy.inert = true
  copy.style.visibility = 'visible'
  // The box behind it is the fill now; the source's bleed margins would shift it off the source.
  copy.style.background = 'none'
  copy.style.boxShadow = 'none'
  copy.style.margin = '0'
  copy.style.width = '100%'
  return copy
}

/**
 * The card or row marked `data-morph-source={source}` growing into a pane over `area` (`data-slot`), and back: the box
 * itself takes the source's place, fill, ring and corners (the source hides under it), with a still copy of its content,
 * then grows to the pane while its fill turns into the page's. The copy grows with it, laid out at the box's width in the
 * pane's column, its padding growing into the pane's, so the card's own content rides to the top of the pane; only then
 * does it blur out as the pane's content (`PaneReveal`) fades in. Closing runs it back into the same box (measured once: the
 * source stays where it is under the pane), with a fresh copy, so it needs an `AnimatePresence`. Already open when
 * the page loads (`AnimatePresence initial={false}`, a reload on `?page=`), it is simply there, and measures its card
 * only to close into it.
 */
export const MorphPane = ({
  area,
  children,
  className,
  radius = CARD_RADIUS,
  source,
}: {
  area: string
  children: ReactNode
  className?: string
  /** The source's corners, held until the box has nearly grown: dropped with the growth, they were gone a third of the way in. */
  radius?: number
  source: string
}) => {
  const isReduced = useReducedMotion()
  const [isPresent, safeToRemove] = usePresence()
  const isThereOnLoad = useContext(PresenceContext)?.initial === false
  const [from, setFrom] = useState(() =>
    isThereOnLoad ? null : insetOver(source, area)
  )
  if (!isPresent && !from) {
    setFrom(insetOver(source, area))
  }
  const grown = useMotionValue(from ? 0 : 1)
  const drift = useMotionValue(0)
  const box = useRef<HTMLDivElement>(null)
  const ghost = useRef<HTMLDivElement>(null)
  useLayoutEffect(() => {
    const card = sourceOf(source)
    if (!card) {
      return
    }
    // Hidden under its pane: shown, it filled in around a box springing back past it, and the bounce never showed.
    card.style.visibility = 'hidden'
    return () => {
      card.style.visibility = ''
    }
  }, [source])
  useLayoutEffect(() => {
    const card = sourceOf(source)
    if (!box.current || !ghost.current || !from || !card) {
      return
    }
    box.current.style.boxShadow = getComputedStyle(card).boxShadow
    // A closing pane starts its copy blurred out, where the opening one left it.
    ghost.current.style.cssText = isPresent
      ? ''
      : `opacity:0;filter:${HIDDEN.filter}`
    ghost.current.replaceChildren(
      ...[copyOf(source)].filter((copy) => copy !== null)
    )
  }, [from, isPresent, source])
  useEffect(() => {
    // A closing pane lets the pointer through, so the page under it can scroll: the box lands where its card is now.
    const follow = () =>
      drift.set((insetOver(source, area)?.top ?? 0) - (from?.top ?? 0))
    document.addEventListener('scroll', follow, {
      capture: true,
      passive: true,
    })
    return () =>
      document.removeEventListener('scroll', follow, { capture: true })
  }, [area, drift, from, source])
  useEffect(() => {
    const clock = clockOf(isReduced)
    let isCurrent = true
    const turns = [animate(grown, isPresent ? 1 : 0, clock.box)]
    if (ghost.current && from) {
      turns.push(
        animate(
          ghost.current,
          isPresent ? HIDDEN : SHOWN,
          isPresent ? clock.copyOut : clock.copyIn
        )
      )
    }
    void Promise.all(turns).then(
      () => isCurrent && !isPresent && safeToRemove()
    )
    return () => {
      isCurrent = false
      for (const turn of turns) {
        turn.stop()
      }
    }
  }, [from, grown, isPresent, isReduced, safeToRemove])
  // The box's real edges, not a clip over a whole pane: clipped, the pane's content stayed full size and was cut off by
  // the edges closing in, a mask over the page instead of the card shrinking.
  const edges = useTransform(() => {
    if (!from) {
      return '0px'
    }
    const at = grown.get()
    const dy = drift.get()
    // Springing back past its card, the box sinks into it from every side; the growth run below 0 drew it off towards
    // the column's far corner.
    const sink =
      (Math.max(0, -at) * (from.top + from.right + from.bottom + from.left)) / 4
    return [from.top + dy, from.right, from.bottom - dy, from.left]
      .map((side) => `${side * (1 - Math.max(0, at)) + sink}px`)
      .join(' ')
  })
  const corners = useTransform(
    grown,
    (at) => `${from ? radius * Math.max(0, 1 - at ** 4) : 0}px`
  )
  const cardFill = useTransform(grown, [0, 1], [1, 0])
  const growth = useTransform(grown, (at) => Math.min(1, Math.max(0, at)))
  const copyX = useTransform(growth, (at) => `${at * 1.3125}rem`)
  const copyTop = useTransform(growth, (at) => `${at * 2}rem`)
  const copyTopNarrow = useTransform(growth, (at) => `${at * 0.5}rem`)
  return (
    <motion.div
      ref={box}
      style={
        {
          '--morph-corners': corners,
          '--morph-edges': edges,
          '--morph-copy-top': copyTop,
          '--morph-copy-top-narrow': copyTopNarrow,
          '--morph-copy-x': copyX,
        } as MotionStyle
      }
      className={cn(
        'bg-background absolute inset-(--morph-edges) isolate overflow-hidden rounded-(--morph-corners)',
        // A closing pane lets the pointer through at once, so the next card (or this one again) opens while it lands.
        !isPresent && 'pointer-events-none',
        className
      )}
    >
      <motion.div
        aria-hidden
        style={{ '--morph-fill': cardFill } as MotionStyle}
        className="bg-card pointer-events-none absolute inset-0 -z-10 opacity-(--morph-fill)"
      />
      <div className="h-full">{children}</div>
      {/* The pane's column (`mx-auto max-w-3xl px-10 pt-12`, a card's `px-4.75 py-4` already in the copy): the card's
          content ends where the pane's begins. As tall as the copy, never the box: its blur is redrawn over its whole
          area on every frame. */}
      <div
        ref={ghost}
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 mx-auto max-w-3xl px-(--morph-copy-x) pt-(--morph-copy-top) max-md:px-0 max-md:pt-(--morph-copy-top-narrow)"
      />
    </motion.div>
  )
}

export interface Expanded {
  /** A Reading sentence: its source message's body is centred on the passage it came from. */
  cite?: { messageId: string; text: string }
  from: 'board' | 'home' | 'journal' | 'mail' | 'reading'
  pathname: string
  /** The `ExpandTrigger` that opened it, by its `data-expand-trigger`. */
  sourceId: string
  threadId: string
}
export const expandedThread = createStore<Expanded | null>(null)

export const useExpanded = () => useSubscription(expandedThread)
export const useIsThreadExpanded = () => !!useExpanded()

export const collapseExpanded = () => expandedThread.set(null)

/** Opens a row's email in `ThreadPane`, or closes it; another row's email takes the sidebar. */
const toggleExpanded = (open: Omit<Expanded, 'pathname'>) => {
  if (expandedThread.get()?.sourceId === open.sourceId) {
    collapseExpanded()
    return
  }
  expandedThread.set({ ...open, pathname: location.pathname })
  posthog.capture('thread_expanded', { from: open.from })
}

type RowEmail = Pick<Expanded, 'cite' | 'from' | 'threadId'>

const rowSourceId = (rowId: string) => `email-${rowId}`

/** Opens the email of `rowId` in the sidebar, as a click on its `ExpandTrigger` does: a list's ⏎ on its cursor row. */
export const expandRow = (rowId: string, email: RowEmail) =>
  toggleExpanded({ ...email, sourceId: rowSourceId(rowId) })

/** Moves the sidebar to a row's email and never closes it: Home's next card once one is settled. */
export const showRow = (rowId: string, email: RowEmail) =>
  expandedThread.set({
    ...email,
    pathname: location.pathname,
    sourceId: rowSourceId(rowId),
  })

/** The row whose email the sidebar shows, among `rowIds`. */
export const useExpandedRow = (rowIds: string[]) => {
  const sourceId = useExpanded()?.sourceId
  return rowIds.find((rowId) => rowSourceId(rowId) === sourceId)
}

/** A row (`SettingsRow trigger` lays it over the whole row) or a chip that opens its email in the sidebar, `aria-expanded` while it is open. */
export const ExpandTrigger = ({
  email,
  onClick,
  rowId,
  ...props
}: ComponentProps<'button'> & { email: RowEmail; rowId: string }) => {
  const isOpen = useExpanded()?.sourceId === rowSourceId(rowId)
  return (
    <button
      type="button"
      aria-expanded={isOpen}
      data-expand-trigger
      onPointerEnter={() => {
        void prefetchThread(email.threadId)
      }}
      // A click that kept focus here made the list's ⏎ open this row instead of the J / K cursor's.
      onMouseDown={(event) => event.preventDefault()}
      {...props}
      onClick={(event) => {
        expandRow(rowId, email)
        onClick?.(event)
      }}
    />
  )
}
