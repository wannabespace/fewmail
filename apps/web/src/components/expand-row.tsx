import { motion, useReducedMotion } from 'motion/react'
import type { Transition } from 'motion/react'
import type { ComponentProps } from 'react'
import { createStore } from 'seitu'
import { useSubscription } from 'seitu/react'

import { prefetchThread } from '~/lib/mail-db'
import { posthog } from '~/lib/posthog'

export const useMorph = (): { morph: Transition; reveal: Transition } =>
  useReducedMotion()
    ? { morph: { duration: 0 }, reveal: { duration: 0 } }
    : {
        morph: { bounce: 0.1, type: 'spring', visualDuration: 0.3 },
        reveal: { delay: 0.05, duration: 0.2, ease: [0.32, 0.72, 0, 1] },
      }

export const HIDDEN = { opacity: 0, y: 6 }
export const SHOWN = { opacity: 1, y: 0 }

export const PEEK_ID = 'thread-peek'

export interface Expanded {
  close: () => void
  from: 'board' | 'home' | 'journal' | 'mail' | 'reading'
  /** What the pane grows out of: a peek (`PEEK_ID`) or a row (`ExpandTrigger`). */
  layoutId: string
  pathname: string
  threadId: string
}
export const expandedThread = createStore<Expanded | null>(null)

export const useIsThreadExpanded = () => !!useSubscription(expandedThread)

export const collapseExpanded = () => expandedThread.set(null)

/** Grows a peek or a row into `ThreadPane` and back. `close` closes what it grew out of. */
export const toggleExpanded = (open: Omit<Expanded, 'pathname'>) => {
  if (expandedThread.get()) {
    expandedThread.set(null)
    return
  }
  expandedThread.set({ ...open, pathname: location.pathname })
  posthog.capture('thread_expanded', { from: open.from })
}

interface RowEmail {
  from: Expanded['from']
  threadId: string
}

const layoutIdOf = (rowId: string) => `email-${rowId}`

/** Grows the `ExpandTrigger` of `rowId` into its email, as a click on it does: a list's ⏎ on its cursor row. */
export const expandRow = (rowId: string, { from, threadId }: RowEmail) =>
  toggleExpanded({
    close: collapseExpanded,
    from,
    layoutId: layoutIdOf(rowId),
    threadId,
  })

/** A row that grows into its email over the page instead of peeking: `SettingsRow trigger` lays it over the whole row, and it is the box the pane grows out of and shrinks back into. */
export const ExpandTrigger = ({
  email,
  rowId,
  ...props
}: ComponentProps<typeof motion.button> & {
  email: RowEmail
  rowId: string
}) => {
  const { morph } = useMorph()
  return (
    <motion.button
      type="button"
      layoutId={layoutIdOf(rowId)}
      transition={morph}
      onPointerEnter={() => {
        void prefetchThread(email.threadId)
      }}
      // A click that kept focus here made the list's ⏎ open this row instead of the J / K cursor's.
      onMouseDown={(event) => event.preventDefault()}
      onClick={() => expandRow(rowId, email)}
      {...props}
    />
  )
}
