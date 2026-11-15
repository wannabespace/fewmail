import {
  createPopoverHandle,
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@fewmail/ui/components/popover'
import { useHotkey } from '@tanstack/react-hotkeys'
import { useRouterState } from '@tanstack/react-router'
import { AnimatePresence, motion } from 'motion/react'
import { useEffect, useState } from 'react'
import type { ComponentProps, ReactNode } from 'react'
import { useSubscription } from 'seitu/react'

import {
  collapseExpanded,
  expandedThread,
  HIDDEN,
  PEEK_ID,
  SHOWN,
  toggleExpanded,
  useIsThreadExpanded,
  useMorph,
} from '~/components/expand-row'
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
 * The peek's own card and the box that grows into `ThreadPane` (one `layoutId`). It stays mounted under the pane, so
 * motion crossfades the two both ways: the card follows the growing box while it fades, then waits, unseen, to take it
 * back. Its popover goes `surface="none"` and `data-expanded:pointer-events-none`, as the faded card lies over the pane.
 */
export const PeekSurface = ({ children }: { children: ReactNode }) => {
  const isExpanded = useIsThreadExpanded()
  const { morph } = useMorph()
  return (
    <motion.div
      layoutId={PEEK_ID}
      transition={morph}
      initial={false}
      animate={{ borderRadius: 12 }}
      className="bg-popover ring-foreground/4 flex min-h-0 flex-col overflow-hidden shadow-xl ring"
    >
      <motion.div
        layout="position"
        transition={morph}
        inert={isExpanded}
        className="flex min-h-0 flex-col"
      >
        {children}
      </motion.div>
    </motion.div>
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
  // The pane keeps its email while it shrinks back into the peek.
  const [shown, setShown] = useState(open)
  if (open && open !== shown) {
    setShown(open)
  }
  useEffect(() => {
    if (open && !isHere) {
      open.close()
    }
  }, [open, isHere])
  // A peek's popover takes esc and the peek its ⇧O; a row leaves both to the pane.
  const rowKeys = { enabled: isHere && open?.layoutId !== PEEK_ID }
  useHotkey('Escape', collapseExpanded, rowKeys)
  useHotkey('Shift+O', collapseExpanded, rowKeys)
  return (
    <AnimatePresence>
      {open && isHere && shown && (
        <motion.div
          key="pane"
          layoutId={shown.layoutId}
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
          className="w-160 data-expanded:pointer-events-none"
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
                    layoutId: PEEK_ID,
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
