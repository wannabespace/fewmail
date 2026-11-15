import { useHotkey } from '@tanstack/react-hotkeys'
import { useRouterState } from '@tanstack/react-router'
import {
  animate,
  AnimatePresence,
  motion,
  useMotionValue,
  useReducedMotion,
} from 'motion/react'
import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import type { CSSProperties } from 'react'

import {
  collapseExpanded,
  dropExpanded,
  expandedThread,
  reopenExpanded,
  sourceOf,
  useExpanded,
} from '~/components/expand-row'
import type { Expanded } from '~/components/expand-row'
import { KeyHints } from '~/components/key-hints'
import { ThreadView, useReaderWidthIn } from '~/components/thread-view'
import { useT } from '~/lib/i18n'

interface Box {
  height: number
  left: number
  top: number
  width: number
}

const CORNERS = [
  ['borderTopLeftRadius', 'top', 'left'],
  ['borderTopRightRadius', 'top', 'right'],
  ['borderBottomRightRadius', 'bottom', 'right'],
  ['borderBottomLeftRadius', 'bottom', 'left'],
] as const

const px = (value: string) => Number(value.split('px')[0]) || 0

/**
 * The corners the source shows: its own, or those of the box that clips it where it sits in that box's corner, as a
 * list's first and last rows do.
 */
const cornersOf = (element: HTMLElement) => {
  let clip = element.parentElement
  while (clip && getComputedStyle(clip).overflow === 'visible') {
    clip = clip.parentElement
  }
  const box = element.getBoundingClientRect()
  const edges = clip?.getBoundingClientRect()
  const clipStyle = clip && getComputedStyle(clip)
  const own = getComputedStyle(element)
  return CORNERS.map(([corner, y, x]) => {
    const isInCorner =
      edges &&
      Math.abs(box[y] - edges[y]) < 1 &&
      Math.abs(box[x] - edges[x]) < 1
    const outer = isInCorner && clipStyle ? px(clipStyle[corner]) : 0
    return `${Math.max(px(own[corner]), outer)}px`
  }).join(' ')
}

type Source = Box & { borderRadius: string }

const boxOf = (sourceId: string): Source | null => {
  const source = sourceOf(sourceId)
  const box = source?.getBoundingClientRect()
  return source && box
    ? {
        borderRadius: cornersOf(source),
        height: box.height,
        left: box.left,
        top: box.top,
        width: box.width,
      }
    : null
}

// Four corners, as the source's are, so motion tweens each to its own.
const OPEN_CORNERS = '0px 0px 0px 0px'

const pageArea = () =>
  document.querySelector<HTMLElement>('[data-slot=thread-pane-area]')

/** Where the source sits once the page has its width back: the close lands there while the page widens on the same spring. */
const restingBoxOf = (sourceId: string) => {
  const area = pageArea()
  const padding = area?.style.paddingRight ?? ''
  area?.style.setProperty('padding-right', '0px')
  const box = boxOf(sourceId)
  area?.style.setProperty('padding-right', padding)
  return box
}

/** The sidebar's open box: the page area's right edge, top to bottom, as wide as Mail's reader beside its list. */
const useSidebarBox = (): Box => {
  const [area, setArea] = useState(() => pageArea()?.getBoundingClientRect())
  useEffect(() => {
    const element = pageArea()
    if (!element) {
      return
    }
    const observer = new ResizeObserver(() =>
      setArea(element.getBoundingClientRect())
    )
    // The padding the open sidebar gives the page would otherwise re-measure it every frame of the shift.
    observer.observe(element, { box: 'border-box' })
    return () => observer.disconnect()
  }, [])
  const right = area?.right ?? innerWidth
  const width = useReaderWidthIn(area?.width ?? innerWidth)
  return {
    height: area?.height ?? innerHeight,
    left: right - width,
    top: area?.top ?? 0,
    width,
  }
}

/**
 * The source as it looked, laid where it was: the card starts as this copy, while the source hides until the card has
 * landed back on it.
 */
const SourceCopy = ({ shown }: { shown: Expanded }) => {
  const ref = useRef<HTMLDivElement>(null)
  useLayoutEffect(() => {
    const trigger = sourceOf(shown.sourceId)
    const source =
      trigger?.dataset.slot === 'row-trigger' ? trigger.parentElement : trigger
    if (!source) {
      return
    }
    const copy = source.cloneNode(true) as HTMLElement
    for (const element of [
      copy,
      ...copy.querySelectorAll<HTMLElement>('[id], [data-morph-source]'),
    ]) {
      element.removeAttribute('id')
      delete element.dataset.morphSource
    }
    copy.style.width = `${source.offsetWidth}px`
    copy.style.height = `${source.offsetHeight}px`
    ref.current?.replaceChildren(copy)
    source.style.visibility = 'hidden'
    return () => {
      source.style.visibility = ''
    }
  }, [shown.sourceId])
  return <div ref={ref} className="absolute top-0 left-0" />
}

const SPRINGS = {
  close: {
    bounce: 0,
    // On the spring the shadow was nearly gone a few frames in, long before the card landed.
    boxShadow: { duration: 0.28, ease: 'easeIn', type: 'tween' },
    type: 'spring',
    visualDuration: 0.28,
  },
  open: { bounce: 0.15, type: 'spring', visualDuration: 0.35 },
} as const
const INSTANT = { close: { duration: 0 }, open: { duration: 0 } }

const useCardSprings = () => (useReducedMotion() ? INSTANT : SPRINGS)

const EASE = [0.32, 0.72, 0, 1] as const
// One shape in both, written as the browser computes it (colour first), or motion cannot tween from what it reads.
const RESTING =
  'rgba(0, 0, 0, 0.05) 0px 1px 2px 0px, rgba(0, 0, 0, 0.05) 0px 0px 0px 1px'
const FLOATING =
  'rgba(0, 0, 0, 0.16) -16px 0px 48px -16px, rgba(0, 0, 0, 0.05) 0px 0px 0px 1px'

/**
 * The card lands on the box its source will have once the page is back to its width, moved by however far the source has
 * scrolled since the close began, so a scroll during the close carries the card with the source.
 */
const EmailCard = ({
  card,
  isClosing,
  shown,
}: {
  card: Box
  isClosing: boolean
  shown: Expanded & { box: Source | null }
}) => {
  const t = useT()
  const springs = useCardSprings()
  const y = useMotionValue(0)
  // Measured once per close: a box measured again on a later render would count the scroll twice.
  const [back, setBack] = useState<{ box: Source | null } | null>(null)
  if (isClosing !== !!back) {
    setBack(isClosing ? { box: restingBoxOf(shown.sourceId) } : null)
  }
  const target = back?.box
  useEffect(() => {
    if (!target) {
      return
    }
    y.jump(0)
    // Only the source's height: the page widening under it moves it sideways, and its scroll anchoring keeps it in place.
    const follow = () => {
      const box = sourceOf(shown.sourceId)?.getBoundingClientRect()
      if (box) {
        y.set(box.top - target.top)
      }
    }
    addEventListener('scroll', follow, { capture: true, passive: true })
    return () => removeEventListener('scroll', follow, { capture: true })
  }, [target, shown.sourceId, y])
  return (
    <motion.div
      custom={target ?? null}
      style={{ translateY: y }}
      variants={{
        held: shown.box
          ? { ...shown.box, boxShadow: RESTING }
          : { ...card, opacity: 0 },
        open: {
          ...card,
          borderRadius: OPEN_CORNERS,
          boxShadow: FLOATING,
          opacity: 1,
          transition: springs.open,
          translateY: 0,
        },
        source: (box: Source | null) =>
          box
            ? {
                ...box,
                boxShadow: RESTING,
                transition: springs.close,
              }
            : { opacity: 0, transition: springs.close },
      }}
      initial="held"
      animate={isClosing ? 'source' : 'open'}
      exit="source"
      onAnimationComplete={(definition) => {
        if (definition === 'source' && expandedThread.get()?.isClosing) {
          dropExpanded()
        }
      }}
      // A click on a closing card opens it again from where it is.
      onClick={reopenExpanded}
      className="bg-background fixed z-40 overflow-hidden"
    >
      <motion.div
        aria-hidden
        inert
        variants={{
          held: { opacity: 1 },
          open: { opacity: 0, transition: { duration: 0.18, ease: EASE } },
          source: {
            opacity: 1,
            transition: { delay: 0.06, duration: 0.15, ease: EASE },
          },
        }}
        className="bg-popover absolute inset-0"
      >
        <SourceCopy shown={shown} />
      </motion.div>
      <motion.div
        // A click on a closing card only opens it again, never a button in its email.
        inert={isClosing}
        variants={{
          held: { opacity: 0 },
          open: {
            opacity: 1,
            transition: { delay: 0.03, duration: 0.22, ease: EASE },
          },
          source: {
            opacity: 0,
            transition: { delay: 0.08, duration: 0.15, ease: EASE },
          },
        }}
        style={
          {
            '--card-height': `${card.height}px`,
            '--card-width': `${card.width}px`,
          } as CSSProperties
        }
        className="absolute top-0 left-1/2 flex h-(--card-height) w-(--card-width) -translate-x-1/2 flex-col pt-6"
      >
        <ThreadView
          key={shown.threadId}
          canOpenFullPage
          isSnoozed={false}
          threadId={shown.threadId}
          onClose={collapseExpanded}
          onDone={() => shown.close()}
        />
        <KeyHints
          hints={[
            ['R', t.keys.reply],
            ['E', t.keys.archive],
            ['/', t.keys.ask],
            ['⇧O', t.mail.openFullPage],
            ['esc', t.keys.close],
          ]}
        />
      </motion.div>
    </motion.div>
  )
}

/**
 * An email opened out of a row or a source chip into a sidebar: the source grows into the page area's right edge on one
 * spring while the page makes room beside it, starting as the source's exact copy that dissolves into the email. The email is laid out at the sidebar's open
 * size from the first frame, centred in it, so nothing reflows. Closing runs it back into the source, the email dissolving
 * into the copy near the end, and the source shows again only once the sidebar is on it. `esc`, ✕ and a click on the page
 * shrink it; leaving the page drops it. The page stays in view and nothing waits for a close: a click on the closing
 * sidebar opens it again from where it is, and another row opens at once in a sidebar of its own.
 */
export const ThreadPane = () => {
  const open = useExpanded()
  const pathname = useRouterState({
    select: (state) => state.location.pathname,
  })
  const isHere = open?.pathname === pathname
  // The sidebar keeps its email and where it grew from while it shrinks back.
  const [shown, setShown] = useState<
    (Expanded & { box: Source | null }) | null
  >(null)
  if (open && !open.isClosing && open.sourceId !== shown?.sourceId) {
    setShown({ ...open, box: boxOf(open.sourceId) })
  }
  useEffect(() => {
    if (open && !isHere) {
      open.close()
    }
  }, [open, isHere])
  const isClosing = !!open?.isClosing
  const isShown = open && isHere && shown
  const isOpen = !!isShown && !isClosing
  const card = useSidebarBox()
  const springs = useCardSprings()
  // The page makes room beside the sidebar on the sidebar's own spring; a page left behind gets its width back at once.
  useLayoutEffect(() => {
    const area = pageArea()
    if (!area) {
      return
    }
    const shift = isHere ? springs.close : INSTANT.close
    const controls = animate(
      area,
      { paddingRight: isOpen ? card.width : 0 },
      isOpen ? springs.open : shift
    )
    return () => controls.stop()
  }, [isOpen, isHere, card.width, springs])
  useHotkey('Escape', collapseExpanded, {
    enabled: isHere,
    ignoreDefaultPrevented: true,
  })
  useEffect(() => {
    const area = pageArea()
    if (!isOpen || !area) {
      return
    }
    // A row's own trigger opens its email in the sidebar instead.
    const onPointerDown = ({ target }: PointerEvent) => {
      if (
        !(target instanceof Element && target.closest('[data-morph-source]'))
      ) {
        collapseExpanded()
      }
    }
    area.addEventListener('pointerdown', onPointerDown)
    return () => area.removeEventListener('pointerdown', onPointerDown)
  }, [isOpen])
  return (
    <AnimatePresence
      onExitComplete={() => {
        if (!expandedThread.get()) {
          setShown(null)
        }
      }}
    >
      {isShown && (
        // Another source gets a sidebar of its own; this one lands on its source meanwhile, or fades where it is if it was open.
        <EmailCard
          key={shown.sourceId}
          card={card}
          shown={shown}
          isClosing={isClosing}
        />
      )}
    </AnimatePresence>
  )
}
