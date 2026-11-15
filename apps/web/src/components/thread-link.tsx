import {
  createPopoverHandle,
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@fewmail/ui/components/popover'
import { useHotkey } from '@tanstack/react-hotkeys'
import { useRouterState } from '@tanstack/react-router'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import type { ComponentProps, CSSProperties } from 'react'

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
const SourceCopy = ({ shown }: { shown: Expanded }) => {
  const ref = useRef<HTMLDivElement>(null)
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
  }, [shown.sourceId, shown.surface])
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
 * An email opened out of a row or a peek as an App Store card: the source lifts into a very large card over the dimmed
 * page on one spring, starting as the source's exact copy that dissolves into the email. The email is laid out at the
 * card's open size from the first frame, centred in it, so nothing reflows. Closing runs it back into the source, the email
 * dissolving into the copy near the end, and the source shows again only once the card is on it. `esc` (a peek's through
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
  const isClosing = !!open?.isClosing
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
          animate={{ opacity: 1, transition: { duration: 0.25, ease: EASE } }}
          exit={{ opacity: 0, transition: { duration: 0.2, ease: EASE } }}
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
          animate="open"
          exit="source"
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
