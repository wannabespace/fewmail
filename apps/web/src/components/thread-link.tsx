import { useHotkey } from '@tanstack/react-hotkeys'
import { useRouterState } from '@tanstack/react-router'
import {
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
import { ThreadView } from '~/components/thread-view'
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

const GUTTER = 24
// Four corners, as the source's are, so motion tweens each to its own.
const OPEN_CORNERS = '24px 24px 24px 24px'
const MAX_WIDTH = 960

/** The card's open box: very large, centred on the window, short of covering it. */
const useCardBox = (): Box => {
  const [viewport, setViewport] = useState({
    height: innerHeight,
    width: innerWidth,
  })
  useEffect(() => {
    const onResize = () =>
      setViewport({ height: innerHeight, width: innerWidth })
    addEventListener('resize', onResize)
    return () => removeEventListener('resize', onResize)
  }, [])
  const width = Math.min(MAX_WIDTH, viewport.width - 2 * GUTTER)
  return {
    height: viewport.height - 2 * GUTTER,
    left: (viewport.width - width) / 2,
    top: GUTTER,
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
  'rgba(0, 0, 0, 0.3) 0px 32px 64px -16px, rgba(0, 0, 0, 0.05) 0px 0px 0px 1px'

/**
 * The card lands on the box its source had when the close began, moved by however far the source has scrolled since,
 * so a scroll during the close carries the card with the source instead of leaving it on the window.
 */
const EmailCard = ({
  isClosing,
  shown,
}: {
  isClosing: boolean
  shown: Expanded & { box: Source | null }
}) => {
  const t = useT()
  const springs = useCardSprings()
  const card = useCardBox()
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  // Measured once per close: a box measured again on a later render would count the scroll twice.
  const [back, setBack] = useState<{ box: Source | null } | null>(null)
  if (isClosing !== !!back) {
    setBack(isClosing ? { box: boxOf(shown.sourceId) } : null)
  }
  const target = back?.box
  useEffect(() => {
    if (!target) {
      return
    }
    x.jump(0)
    y.jump(0)
    const follow = () => {
      const box = sourceOf(shown.sourceId)?.getBoundingClientRect()
      if (box) {
        x.set(box.left - target.left)
        y.set(box.top - target.top)
      }
    }
    addEventListener('scroll', follow, { capture: true, passive: true })
    return () => removeEventListener('scroll', follow, { capture: true })
  }, [target, shown.sourceId, x, y])
  return (
    <motion.div
      custom={target ?? null}
      style={{ translateX: x, translateY: y }}
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
          translateX: 0,
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
          isFullPage
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
            ['esc', t.keys.close],
          ]}
        />
      </motion.div>
    </motion.div>
  )
}

/**
 * An email opened out of a row or a source chip as an App Store card: the source lifts into a very large card over the dimmed
 * page on one spring, starting as the source's exact copy that dissolves into the email. The email is laid out at the
 * card's open size from the first frame, centred in it, so nothing reflows. Closing runs it back into the source, the email
 * dissolving into the copy near the end, and the source shows again only once the card is on it. `esc`, ⇧O, the collapse
 * and a click on the page shrink it; leaving the page drops it. Nothing waits for a close: a click on the card opens it
 * again from where it is, and another row opens at once.
 */
export const ThreadPane = () => {
  const open = useExpanded()
  const pathname = useRouterState({
    select: (state) => state.location.pathname,
  })
  const isHere = open?.pathname === pathname
  // The card keeps its email and where it grew from while it shrinks back.
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
  const keys = { enabled: isHere }
  useHotkey('Escape', collapseExpanded, {
    ...keys,
    ignoreDefaultPrevented: true,
  })
  useHotkey('Shift+O', collapseExpanded, keys)
  const isShown = open && isHere && shown
  return (
    <AnimatePresence
      onExitComplete={() => {
        if (!expandedThread.get()) {
          setShown(null)
        }
      }}
    >
      {isShown && !isClosing && (
        <motion.div
          key="backdrop"
          aria-hidden
          initial={{ opacity: 0 }}
          animate={{ opacity: 1, transition: { duration: 0.25, ease: EASE } }}
          // A closing card is not in the way: the page under it takes the next click.
          exit={{
            opacity: 0,
            pointerEvents: 'none',
            transition: { duration: 0.2, ease: EASE },
          }}
          onClick={collapseExpanded}
          className="fixed inset-0 z-40 bg-black/30 supports-backdrop-filter:backdrop-blur-sm"
        />
      )}
      {isShown && (
        // Another source while this one closes gets a card of its own; this one lands on its source meanwhile.
        <EmailCard key={shown.sourceId} shown={shown} isClosing={isClosing} />
      )}
    </AnimatePresence>
  )
}
