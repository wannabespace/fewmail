import {
  createPopoverHandle,
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@fewmail/ui/components/popover'
import { useHotkey } from '@tanstack/react-hotkeys'
import { useRouterState } from '@tanstack/react-router'
import {
  animate,
  AnimatePresence,
  motion,
  useReducedMotion,
} from 'motion/react'
import type { Transition } from 'motion/react'
import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import type { ComponentProps, CSSProperties, RefObject } from 'react'

import {
  collapseExpanded,
  dropExpanded,
  expandedThread,
  PEEK_ID,
  sourceOf,
  toggleExpanded,
  useExpanded,
} from '~/components/expand-row'
import type { Expanded } from '~/components/expand-row'
import { KeyHints } from '~/components/key-hints'
import { ThreadPeek, ThreadView } from '~/components/thread-view'
import { useT } from '~/lib/i18n'
import { prefetchThread } from '~/lib/mail-db'

type Peeked = ComponentProps<typeof ThreadPeek>['message'] & {
  from: ComponentProps<typeof ThreadPeek>['from']
}

const threadPeek = createPopoverHandle<Peeked>()

/** Opens the email over the page; `SettingsRow trigger` lays it over the whole row, or `render` makes it a button. */
export const PeekTrigger = ({
  message,
  ...props
}: Omit<ComponentProps<typeof PopoverTrigger>, 'handle' | 'payload'> & {
  message: Peeked
}) => (
  <PopoverTrigger
    handle={threadPeek}
    payload={message}
    onPointerEnter={() => {
      void prefetchThread(message.threadId)
    }}
    {...props}
  />
)

/** The id a row's `PeekTrigger` takes, so its list's `O` can peek from it. */
export const peekIdOf = (rowId: string) => `peek-${rowId}`

const hasTrigger = (triggerId: string | undefined) =>
  !!triggerId && !!document.querySelector(`#${CSS.escape(triggerId)}`)

/** `O` peeks at the cursor row's email, or closes the peek; an open peek follows the cursor, and closes on a row with no email. */
export const usePeekKey = (rowId: string | undefined, enabled: boolean) => {
  const triggerId = rowId && peekIdOf(rowId)
  useHotkey(
    'O',
    () => {
      if (threadPeek.isOpen) {
        threadPeek.close()
      } else if (triggerId && hasTrigger(triggerId)) {
        threadPeek.open(triggerId)
      }
    },
    { enabled: enabled && !!rowId }
  )
  useEffect(() => {
    if (!threadPeek.isOpen) {
      return
    }
    if (triggerId && hasTrigger(triggerId)) {
      threadPeek.open(triggerId)
    } else {
      threadPeek.close()
    }
  }, [triggerId])
}

// Esc in the pane's reply belongs to the reply: collapsing there dropped the draft.
const isTyping = (target: EventTarget | null) =>
  target instanceof HTMLElement &&
  (target.isContentEditable || !!target.closest('input, textarea, select'))

/** A peek's popover stays open under its pane: a click there must not close what the pane shrinks back into, and esc, which the popover takes first, shrinks the pane. */
export const keepUnderPane: NonNullable<
  ComponentProps<typeof Popover>['onOpenChange']
> = (open, details) => {
  if (!open && expandedThread.get() && details.reason !== 'imperative-action') {
    details.cancel()
    if (details.reason === 'escape-key' && !isTyping(details.event.target)) {
      collapseExpanded()
    }
  }
}

export const dropPane = (open: boolean) => {
  if (!open) {
    dropExpanded()
  }
}

/** Grows a peek into the pane, as a row grows: the peek is the card. */
export const expandPeek = ({
  close,
  from,
  threadId,
}: {
  close: () => void
  from: Peeked['from']
  threadId: string
}) =>
  toggleExpanded({
    close,
    from,
    sourceId: PEEK_ID,
    surface: 'popover',
    threadId,
  })

interface Box {
  height: number
  left: number
  top: number
  width: number
}

const boxOf = (sourceId: string): Box | null => {
  const box = sourceOf(sourceId)?.getBoundingClientRect()
  return box
    ? { height: box.height, left: box.left, top: box.top, width: box.width }
    : null
}

const GUTTER = 24
const HOLD_FRAMES = 12
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
 * landed back on it (a row by itself, a peek's popover by `data-expanded`).
 */
const SourceCopy = ({
  ref,
  shown,
}: {
  ref: RefObject<HTMLDivElement | null>
  shown: Expanded
}) => {
  useLayoutEffect(() => {
    const trigger = sourceOf(shown.sourceId)
    const source = shown.surface === 'row' ? trigger?.parentElement : trigger
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
    // The popover's own entry animation and its hiding under the card ride on these.
    delete copy.dataset.open
    delete copy.dataset.expanded
    copy.style.width = `${source.offsetWidth}px`
    copy.style.height = `${source.offsetHeight}px`
    ref.current?.replaceChildren(copy)
    if (shown.surface === 'row') {
      source.style.visibility = 'hidden'
    }
    return () => {
      source.style.visibility = ''
    }
  }, [ref, shown.sourceId, shown.surface])
  return <div ref={ref} className="absolute top-0 left-0" />
}

/**
 * What of the source reappears in the email, by where it sits in each (a row's slots, a peek's and the email's marks),
 * and whether its size is its width or its type's.
 */
const PARTS = [
  ['[data-slot=avatar]', '[data-slot=avatar]', 'width'],
  [
    '[data-slot=item-title], [data-morph-part=name]',
    '[data-morph-part=name]',
    'type',
  ],
  ['[data-slot=item-description]', '[data-morph-part=summary]', 'type'],
  ['[data-morph-part=subject]', '[data-morph-part=subject]', 'type'],
  ['[data-morph-part=body]', '[data-morph-part=body]', 'width'],
] as const

const placeIn = (element: HTMLElement, layer: HTMLElement) => {
  const box = element.getBoundingClientRect()
  const origin = layer.getBoundingClientRect()
  return { left: box.left - origin.left, top: box.top - origin.top }
}

// A copy's part is still where its last flight left it when the card closes: where it sits is read past that.
const sitsIn = (element: HTMLElement, root: HTMLElement) => {
  let left = 0
  let top = 0
  for (
    let node: Element | null = element;
    node instanceof HTMLElement && node !== root;
    node = node.offsetParent
  ) {
    left += node.offsetLeft
    top += node.offsetTop
  }
  return { left, top }
}

const sizeOf = (element: HTMLElement, measure: 'type' | 'width') =>
  measure === 'width'
    ? element.offsetWidth
    : Number(getComputedStyle(element).fontSize.replace('px', ''))

interface Flight {
  copy: HTMLElement
  scale: number
  target: HTMLElement
  x: number
  y: number
}

/** Each part of the copy paired with its place in the email, if the email shows where it starts without scrolling. */
const flightsOf = (copy: HTMLElement, email: HTMLElement): Flight[] =>
  PARTS.flatMap(([from, to, measure]) => {
    const source = copy.querySelector<HTMLElement>(from)
    const target = [...email.querySelectorAll<HTMLElement>(to)].find(
      (element) => {
        const { top } = placeIn(element, email)
        return top >= 0 && top < email.offsetHeight
      }
    )
    if (!source || !target) {
      return []
    }
    const a = sitsIn(source, copy)
    const b = placeIn(target, email)
    for (const element of [source, target]) {
      element.style.transformOrigin = '0 0'
    }
    return [
      {
        copy: source,
        scale: sizeOf(target, measure) / sizeOf(source, measure),
        target,
        x: b.left - a.left,
        y: b.top - a.top,
      },
    ]
  })

const HOME = { scale: 1, x: 0, y: 0 }

const between = (from: typeof HOME, to: typeof HOME) => ({
  scale: [from.scale, to.scale],
  x: [from.x, to.x],
  y: [from.y, to.y],
})

/**
 * Flies each part between its place in the source, the card at the source's `width`, and its place in the email, on the
 * card's spring, the copy's and the email's together. Closing starts from wherever they are.
 */
const flyParts = (
  copy: HTMLElement,
  email: HTMLElement,
  {
    isOpening,
    spring,
    width,
  }: { isOpening: boolean; spring: Transition; width: number }
) => {
  // The email is centred in the card, so in the source's box it sits this much further left than the copy.
  const shift = (email.offsetWidth - width) / 2
  for (const flight of flightsOf(copy, email)) {
    const { scale, x, y } = flight
    const over = { scale, x, y }
    const away = { scale: 1 / scale, x: shift - x, y: -y }
    animate(flight.copy, isOpening ? between(HOME, over) : HOME, spring)
    animate(flight.target, isOpening ? between(away, HOME) : away, spring)
  }
}

const SPRINGS = {
  close: { bounce: 0.08, type: 'spring', visualDuration: 0.4 },
  open: { bounce: 0.2, type: 'spring', visualDuration: 0.5 },
} as const
const INSTANT = { close: { duration: 0 }, open: { duration: 0 } }

const useCardSprings = () => (useReducedMotion() ? INSTANT : SPRINGS)

const EASE = [0.32, 0.72, 0, 1] as const
// One shape in both, so motion can tween between them.
const RESTING = '0 1px 2px 0 rgb(0 0 0 / 0.05), 0 0 0 1px rgb(0 0 0 / 0.05)'
const FLOATING =
  '0 32px 64px -16px rgb(0 0 0 / 0.3), 0 0 0 1px rgb(0 0 0 / 0.05)'

/**
 * An email opened out of a row or a peek as an App Store card: the source lifts into a very large card over the dimmed
 * page on one spring, its avatar, name and line flying to where the email shows them while the rest of it dissolves into
 * the email. The card starts as the source's exact copy, and the email is laid out at the card's open size from the first
 * frame, pinned to its top left, so nothing reflows; every part flies on the card's own spring, so it keeps to a straight
 * line. Closing runs it all back into the source, which shows again only once the card is on it. `esc` (a peek's through
 * `keepUnderPane`), ⇧O, the collapse and a click on the page shrink it; leaving the page drops it.
 */
export const ThreadPane = () => {
  const t = useT()
  const open = useExpanded()
  const pathname = useRouterState({
    select: (state) => state.location.pathname,
  })
  const springs = useCardSprings()
  const card = useCardBox()
  const copyRef = useRef<HTMLDivElement>(null)
  const emailRef = useRef<HTMLDivElement>(null)
  const isHere = open?.pathname === pathname
  // The card keeps its email and where it grew from while it shrinks back.
  const [shown, setShown] = useState<(Expanded & { box: Box | null }) | null>(
    null
  )
  if (open && !open.isClosing && open.sourceId !== shown?.sourceId) {
    setShown({ ...open, box: boxOf(open.sourceId) })
  }
  useEffect(() => {
    if (open && !isHere) {
      open.close()
    }
  }, [open, isHere])
  // The card holds as the source until the email has drawn the parts it flies to, a frame or two once prefetched.
  const [readyFor, setReadyFor] = useState<string | null>(null)
  const isReady = !!shown && readyFor === shown.sourceId
  useEffect(() => {
    if (!shown) {
      return
    }
    let frames = 0
    let frame = 0
    const check = () => {
      frames += 1
      if (
        emailRef.current?.querySelector('[data-morph-part]') ||
        frames > HOLD_FRAMES
      ) {
        setReadyFor(shown.sourceId)
      } else {
        frame = requestAnimationFrame(check)
      }
    }
    check()
    return () => cancelAnimationFrame(frame)
  }, [shown])
  useLayoutEffect(() => {
    if (isReady && shown?.box && copyRef.current && emailRef.current) {
      flyParts(copyRef.current, emailRef.current, {
        isOpening: true,
        spring: springs.open,
        width: shown.box.width,
      })
    }
  }, [isReady, shown, springs.open])
  const isClosing = !!open?.isClosing
  useLayoutEffect(() => {
    const end = isClosing && boxOf(expandedThread.get()?.sourceId ?? '')
    if (end && copyRef.current && emailRef.current) {
      flyParts(copyRef.current, emailRef.current, {
        isOpening: false,
        spring: springs.close,
        width: end.width,
      })
    }
  }, [isClosing, springs.close])
  // A peek's popover takes esc and the peek its ⇧O; a row leaves both to the card.
  const rowKeys = { enabled: isHere && open?.surface === 'row' }
  useHotkey('Escape', collapseExpanded, rowKeys)
  useHotkey('Shift+O', collapseExpanded, rowKeys)
  const back = isClosing && open ? boxOf(open.sourceId) : null
  const isOpen = open && !open.isClosing && isHere && shown
  return (
    <AnimatePresence
      custom={back}
      onExitComplete={() => {
        setShown(null)
        if (expandedThread.get()?.isClosing) {
          dropExpanded()
        }
      }}
    >
      {isOpen && (
        <motion.div
          key="backdrop"
          aria-hidden
          initial={{ opacity: 0 }}
          animate={{ opacity: 1, transition: { duration: 0.3, ease: EASE } }}
          exit={{ opacity: 0, transition: { duration: 0.25, ease: EASE } }}
          onClick={collapseExpanded}
          className="fixed inset-0 z-40 bg-black/30 supports-backdrop-filter:backdrop-blur-sm"
        />
      )}
      {isOpen && (
        <motion.div
          key="card"
          custom={back}
          variants={{
            held: shown.box
              ? { ...shown.box, borderRadius: 12, boxShadow: RESTING }
              : { ...card, opacity: 0 },
            open: {
              ...card,
              borderRadius: 24,
              boxShadow: FLOATING,
              opacity: 1,
              transition: springs.open,
            },
            source: (box: Box | null) =>
              box
                ? {
                    ...box,
                    borderRadius: 12,
                    boxShadow: RESTING,
                    transition: springs.close,
                  }
                : { opacity: 0, transition: springs.close },
          }}
          initial="held"
          animate={isReady ? 'open' : 'held'}
          exit="source"
          className="bg-background fixed z-40 overflow-hidden"
        >
          <motion.div
            aria-hidden
            inert
            variants={{
              held: { opacity: 1 },
              open: { opacity: 0, transition: { duration: 0.3, ease: EASE } },
              source: {
                opacity: 1,
                transition: { delay: 0.12, duration: 0.2, ease: EASE },
              },
            }}
            className="bg-popover absolute inset-0"
          >
            <SourceCopy ref={copyRef} shown={shown} />
          </motion.div>
          <motion.div
            ref={emailRef}
            variants={{
              held: { opacity: 0 },
              open: {
                opacity: 1,
                transition: { delay: 0.05, duration: 0.3, ease: EASE },
              },
              source: {
                opacity: 0,
                transition: { delay: 0.15, duration: 0.2, ease: EASE },
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
      )}
    </AnimatePresence>
  )
}

/**
 * One peek for every `PeekTrigger`, mounted once in the app's layout. Its email grows out of it: it fades over the pane
 * starting as its copy, and shows again at once when the pane has landed back on it, where the copy is.
 */
export const ThreadPeekPopover = () => {
  const open = useExpanded()
  return (
    <Popover
      handle={threadPeek}
      onOpenChange={keepUnderPane}
      onOpenChangeComplete={dropPane}
    >
      {({ payload }) => (
        <PopoverContent
          align="start"
          initialFocus={false}
          finalFocus={false}
          padding="none"
          data-morph-source={PEEK_ID}
          data-expanded={open ? true : undefined}
          className="w-160 data-expanded:pointer-events-none data-expanded:opacity-0"
        >
          {payload && (
            <ThreadPeek
              key={payload.id}
              from={payload.from}
              message={payload}
              onOpen={() =>
                expandPeek({
                  close: () => threadPeek.close(),
                  from: payload.from,
                  threadId: payload.threadId,
                })
              }
            />
          )}
        </PopoverContent>
      )}
    </Popover>
  )
}
