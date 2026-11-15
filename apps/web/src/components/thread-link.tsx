import {
  createPopoverHandle,
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@fewmail/ui/components/popover'
import { useHotkey } from '@tanstack/react-hotkeys'
import { useRouterState } from '@tanstack/react-router'
import { AnimatePresence, motion } from 'motion/react'
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
  useMorph,
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

const AREA = '[data-slot=thread-pane-area]'

/** Where the source sits in the pane's area, the box the pane grows out of and shrinks back into. */
const boxOver = (sourceId: string): Box | null => {
  const area = document.querySelector(AREA)?.getBoundingClientRect()
  const box = sourceOf(sourceId)?.getBoundingClientRect()
  return area && box
    ? {
        height: box.height,
        left: box.left - area.left,
        top: box.top - area.top,
        width: box.width,
      }
    : null
}

/** The area's size, so the email lays out at its final size from the morph's first frame and never reflows in it. */
const useAreaSize = () => {
  const [size, setSize] = useState({ height: 0, width: 0 })
  useLayoutEffect(() => {
    const area = document.querySelector(AREA)
    if (!area) {
      return
    }
    const observer = new ResizeObserver(([entry]) => {
      if (entry) {
        setSize({
          height: entry.contentRect.height,
          width: entry.contentRect.width,
        })
      }
    })
    observer.observe(area)
    return () => observer.disconnect()
  }, [])
  return size
}

/**
 * The source as it looked, laid where it was: the pane starts as this copy, while the source hides until the pane has
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
    // The popover's own entry animation and its hiding under the pane ride on these.
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

const EASE = [0.32, 0.72, 0, 1] as const
// One shape in both, so motion can tween between them; the lift outlines the box over a page of its own colour.
const LIFTED = '0 24px 48px -12px rgb(0 0 0 / 0.2), 0 0 0 1px rgb(0 0 0 / 0.05)'
const LANDED = '0 0px 0px 0px rgb(0 0 0 / 0), 0 0 0 0px rgb(0 0 0 / 0)'

/**
 * An email grown out of a row or a peek over the page's column, as an App Store card opens: one box, the source's, moves
 * and grows to the column on the morph spring, starting as the source's exact copy (a row's clone, a peek's card under
 * its fading popover) that fades into the email, which is laid out at its final size from the first frame and rides the
 * box's top. Closing runs it back into the source, which shows again only once the box is on it. `esc` (a peek's through
 * `keepUnderPane`), ⇧O and the collapse shrink it; leaving the page drops it.
 */
export const ThreadPane = () => {
  const t = useT()
  const open = useExpanded()
  const pathname = useRouterState({
    select: (state) => state.location.pathname,
  })
  const { morph } = useMorph()
  const area = useAreaSize()
  const isHere = open?.pathname === pathname
  // The pane keeps its email and where it grew from while it shrinks back.
  const [shown, setShown] = useState<(Expanded & { box: Box | null }) | null>(
    null
  )
  if (open && !open.isClosing && open.sourceId !== shown?.sourceId) {
    setShown({ ...open, box: boxOver(open.sourceId) })
  }
  useEffect(() => {
    if (open && !isHere) {
      open.close()
    }
  }, [open, isHere])
  // A peek's popover takes esc and the peek its ⇧O; a row leaves both to the pane.
  const rowKeys = { enabled: isHere && open?.surface === 'row' }
  useHotkey('Escape', collapseExpanded, rowKeys)
  useHotkey('Shift+O', collapseExpanded, rowKeys)
  const radius = shown?.surface === 'popover' ? 12 : 0
  const back = open?.isClosing ? boxOver(open.sourceId) : null
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
      {open && !open.isClosing && isHere && shown && (
        <motion.div
          key="pane"
          custom={back}
          variants={{
            source: (box: Box | null) =>
              box
                ? { ...box, borderRadius: radius, boxShadow: LIFTED }
                : { opacity: 0 },
          }}
          initial={
            shown.box
              ? { ...shown.box, borderRadius: radius, boxShadow: LIFTED }
              : { opacity: 0 }
          }
          animate={{
            borderRadius: 0,
            boxShadow: LANDED,
            height: area.height,
            left: 0,
            opacity: 1,
            top: 0,
            width: area.width,
          }}
          exit="source"
          transition={morph}
          className="bg-background absolute z-20 overflow-hidden"
        >
          <motion.div
            aria-hidden
            inert
            initial={{ opacity: 1 }}
            animate={{ opacity: 0, transition: { duration: 0.12, ease: EASE } }}
            exit={{
              opacity: 1,
              transition: { delay: 0.06, duration: 0.15, ease: EASE },
            }}
            className="bg-popover absolute inset-0"
          >
            <SourceCopy shown={shown} />
          </motion.div>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{
              opacity: 1,
              transition: { delay: 0.06, duration: 0.2, ease: EASE },
            }}
            exit={{ opacity: 0, transition: { duration: 0.1, ease: EASE } }}
            style={
              {
                '--area-height': `${area.height}px`,
                '--area-width': `${area.width}px`,
              } as CSSProperties
            }
            className="absolute top-0 left-1/2 flex h-(--area-height) w-(--area-width) -translate-x-1/2 flex-col"
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
