import { useReducedMotion } from 'motion/react'
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
  /** Set while the pane shrinks back into its source, which stays hidden and its page's keys asleep until it is gone. */
  isClosing?: boolean
  pathname: string
  /** The row (`ExpandTrigger`) or the peek (`PEEK_ID`) the pane grows out of, by its `data-morph-source`. */
  sourceId: string
  surface: 'popover' | 'row'
  threadId: string
}
export const expandedThread = createStore<Expanded | null>(null)

export const useExpanded = () => useSubscription(expandedThread)
export const useIsThreadExpanded = () => !!useExpanded()

export const collapseExpanded = () => {
  const open = expandedThread.get()
  if (open && !open.isClosing) {
    expandedThread.set({ ...open, isClosing: true })
  }
}

export const dropExpanded = () => expandedThread.set(null)

export const OPEN_CLIP = 'inset(0px 0px 0px 0px round 0px)'

export const sourceOf = (sourceId: string) =>
  document.querySelector<HTMLElement>(
    `[data-morph-source="${CSS.escape(sourceId)}"]`
  )

export const clipOver = (
  morphId: string,
  radius: number,
  areaSlot = 'thread-pane-area'
) => {
  const area = document
    .querySelector(`[data-slot=${areaSlot}]`)
    ?.getBoundingClientRect()
  const box = sourceOf(morphId)?.getBoundingClientRect()
  if (!area || !box) {
    return OPEN_CLIP
  }
  return `inset(${box.top - area.top}px ${area.right - box.right}px ${area.bottom - box.bottom}px ${box.left - area.left}px round ${radius}px)`
}

/** Grows a peek or a row into `ThreadPane`, or shrinks it back. */
export const toggleExpanded = (
  open: Omit<Expanded, 'isClosing' | 'pathname'>
) => {
  if (expandedThread.get()) {
    collapseExpanded()
    return
  }
  expandedThread.set({ ...open, pathname: location.pathname })
  posthog.capture('thread_expanded', { from: open.from })
}

interface RowEmail {
  from: Expanded['from']
  threadId: string
}

const rowSourceId = (rowId: string) => `email-${rowId}`

/** Grows the `ExpandTrigger` of `rowId` into its email, as a click on it does: a list's ⏎ on its cursor row. */
export const expandRow = (rowId: string, { from, threadId }: RowEmail) =>
  toggleExpanded({
    close: dropExpanded,
    from,
    sourceId: rowSourceId(rowId),
    surface: 'row',
    threadId,
  })

/** A row that grows into its email over the page instead of peeking: `SettingsRow trigger` lays it over the whole row, the box the pane grows out of. */
export const ExpandTrigger = ({
  email,
  rowId,
  ...props
}: ComponentProps<'button'> & { email: RowEmail; rowId: string }) => (
  <button
    type="button"
    data-morph-source={rowSourceId(rowId)}
    onPointerEnter={() => {
      void prefetchThread(email.threadId)
    }}
    // A click that kept focus here made the list's ⏎ open this row instead of the J / K cursor's.
    onMouseDown={(event) => event.preventDefault()}
    onClick={() => expandRow(rowId, email)}
    {...props}
  />
)
