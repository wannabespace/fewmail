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

export interface Expanded {
  close: () => void
  from: 'board' | 'home' | 'journal' | 'mail' | 'reading'
  /** Set while the card shrinks back into its source, which stays hidden until the card is on it. */
  isClosing?: boolean
  pathname: string
  /** The `ExpandTrigger` the pane grows out of, by its `data-morph-source`: its row when it lies over one, else itself (a source chip). */
  sourceId: string
  threadId: string
}
export const expandedThread = createStore<Expanded | null>(null)

export const useExpanded = () => useSubscription(expandedThread)
/** A closing card no longer covers its page: its keys work again at once. */
export const useIsThreadExpanded = () => {
  const open = useExpanded()
  return !!open && !open.isClosing
}

export const collapseExpanded = () => {
  const open = expandedThread.get()
  if (open && !open.isClosing) {
    expandedThread.set({ ...open, isClosing: true })
  }
}

export const dropExpanded = () => expandedThread.set(null)

export const reopenExpanded = () => {
  const open = expandedThread.get()
  if (open?.isClosing) {
    expandedThread.set({ ...open, isClosing: false })
    posthog.capture('thread_expanded', { from: open.from })
  }
}

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

/** Grows a row into `ThreadPane`, or shrinks it back; one still closing gives way at once. */
export const toggleExpanded = (
  open: Omit<Expanded, 'isClosing' | 'pathname'>
) => {
  const current = expandedThread.get()
  if (current && !current.isClosing) {
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
    threadId,
  })

/** A row that grows into its email over the page: `SettingsRow trigger` lays it over the whole row, the box the pane grows out of; rendered as a chip, it grows out of the chip. */
export const ExpandTrigger = ({
  email,
  onClick,
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
    {...props}
    onClick={(event) => {
      expandRow(rowId, email)
      onClick?.(event)
    }}
  />
)
