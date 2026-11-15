import {
  createPopoverHandle,
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@fewmail/ui/components/popover'
import { useHotkey } from '@tanstack/react-hotkeys'
import { useRouterState } from '@tanstack/react-router'
import { motion, useReducedMotion } from 'motion/react'
import type { Transition } from 'motion/react'
import { useEffect } from 'react'
import type { ComponentProps, ReactNode } from 'react'
import { createStore } from 'seitu'
import { useSubscription } from 'seitu/react'

import { KeyHints } from '~/components/key-hints'
import { ThreadPeek, ThreadView } from '~/components/thread-view'
import { useT } from '~/lib/i18n'
import { prefetchThread } from '~/lib/mail-db'
import { posthog } from '~/lib/posthog'

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

export const useMorph = (): { morph: Transition; reveal: Transition } =>
  useReducedMotion()
    ? { morph: { duration: 0 }, reveal: { duration: 0 } }
    : {
        morph: { bounce: 0.1, type: 'spring', visualDuration: 0.3 },
        reveal: { delay: 0.05, duration: 0.2, ease: [0.32, 0.72, 0, 1] },
      }

export const HIDDEN = { opacity: 0, y: 6 }
export const SHOWN = { opacity: 1, y: 0 }

const PANE_ID = 'thread-pane'

interface Expanded {
  close: () => void
  from: Peeked['from']
  pathname: string
  threadId: string
}
const expandedThread = createStore<Expanded | null>(null)

export const useIsThreadExpanded = () => !!useSubscription(expandedThread)

/** The peek's ↗ and ⇧O: grows the peek into `ThreadPane` and back. `close` closes the peek it grew out of. */
export const toggleExpanded = (open: Omit<Expanded, 'pathname'>) => {
  if (expandedThread.get()) {
    expandedThread.set(null)
    return
  }
  expandedThread.set({ ...open, pathname: location.pathname })
  posthog.capture('thread_expanded', { from: open.from })
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
      expandedThread.set(null)
    }
  }
}

export const dropPane = (open: boolean) => {
  if (!open) {
    expandedThread.set(null)
  }
}

/**
 * The peek's own card, the box that grows into `ThreadPane` (one `layoutId`, as Reading's card does); its popover goes
 * `surface="none"` and `data-expanded:invisible`, so the peek stays where it was while the pane is open.
 */
export const PeekSurface = ({ children }: { children: ReactNode }) => {
  const isExpanded = useIsThreadExpanded()
  const { morph, reveal } = useMorph()
  return (
    <div className="relative flex min-h-0 flex-col">
      {!isExpanded && (
        <motion.div
          layoutId={PANE_ID}
          transition={morph}
          initial={false}
          animate={{ borderRadius: 12 }}
          className="bg-popover ring-foreground/4 absolute inset-0 shadow-xl ring"
        />
      )}
      <motion.div
        initial={false}
        animate={
          isExpanded
            ? { opacity: 0, transition: { duration: 0 } }
            : { opacity: 1 }
        }
        transition={reveal}
        className="relative flex min-h-0 flex-col"
      >
        {children}
      </motion.div>
    </div>
  )
}

/** An expanded peek over the page's column: `esc` (through `keepUnderPane`), ⇧O and the collapse shrink it back into the peek; leaving the page closes both. */
export const ThreadPane = () => {
  const t = useT()
  const open = useSubscription(expandedThread)
  const pathname = useRouterState({
    select: (state) => state.location.pathname,
  })
  const { morph, reveal } = useMorph()
  const isHere = open?.pathname === pathname
  useEffect(() => {
    if (open && !isHere) {
      open.close()
    }
  }, [open, isHere])
  const collapse = () => expandedThread.set(null)
  if (!open || !isHere) {
    return null
  }
  return (
    <motion.div
      layoutId={PANE_ID}
      transition={morph}
      initial={false}
      animate={{ borderRadius: 0 }}
      className="bg-background absolute inset-0 z-20 flex flex-col overflow-hidden"
    >
      <motion.div
        layout="position"
        initial={HIDDEN}
        animate={SHOWN}
        transition={reveal}
        className="flex min-h-0 flex-1 flex-col"
      >
        <ThreadView
          key={open.threadId}
          isFullPage
          isSnoozed={false}
          threadId={open.threadId}
          onClose={collapse}
          onDone={() => open.close()}
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

/** One peek for every `PeekTrigger`, mounted once in the app's layout. */
export const ThreadPeekPopover = () => {
  const isExpanded = useIsThreadExpanded()
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
          surface="none"
          data-expanded={isExpanded || undefined}
          className="w-160 data-expanded:invisible"
        >
          {payload && (
            <PeekSurface>
              <ThreadPeek
                key={payload.id}
                from={payload.from}
                message={payload}
                onOpen={() =>
                  toggleExpanded({
                    close: () => threadPeek.close(),
                    from: payload.from,
                    threadId: payload.threadId,
                  })
                }
              />
            </PeekSurface>
          )}
        </PopoverContent>
      )}
    </Popover>
  )
}
