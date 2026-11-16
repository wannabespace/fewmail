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
  from: 'home' | 'journal' | 'mail' | 'reading'
  pathname: string
  /** The `ExpandTrigger` that opened it, by its `data-expand-trigger`. */
  sourceId: string
  threadId: string
}
export const expandedThread = createStore<Expanded | null>(null)

export const useExpanded = () => useSubscription(expandedThread)
export const useIsThreadExpanded = () => !!useExpanded()

export const collapseExpanded = () => expandedThread.set(null)

export const OPEN_CLIP = 'inset(0px 0px 0px 0px round 0px)'

export const clipOver = (
  morphId: string,
  radius: number,
  areaSlot = 'thread-pane-area'
) => {
  const area = document
    .querySelector(`[data-slot=${areaSlot}]`)
    ?.getBoundingClientRect()
  const box = document
    .querySelector(`[data-morph-source="${CSS.escape(morphId)}"]`)
    ?.getBoundingClientRect()
  if (!area || !box) {
    return OPEN_CLIP
  }
  return `inset(${box.top - area.top}px ${area.right - box.right}px ${area.bottom - box.bottom}px ${box.left - area.left}px round ${radius}px)`
}

/** Opens a row's email in `ThreadPane`, or closes it; another row's email takes the sidebar. */
const toggleExpanded = (open: Omit<Expanded, 'pathname'>) => {
  if (expandedThread.get()?.sourceId === open.sourceId) {
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

/** Opens the email of `rowId` in the sidebar, as a click on its `ExpandTrigger` does: a list's ⏎ on its cursor row. */
export const expandRow = (rowId: string, { from, threadId }: RowEmail) =>
  toggleExpanded({ from, sourceId: rowSourceId(rowId), threadId })

/** A row (`SettingsRow trigger` lays it over the whole row) or a chip that opens its email in the sidebar, `aria-expanded` while it is open. */
export const ExpandTrigger = ({
  email,
  onClick,
  rowId,
  ...props
}: ComponentProps<'button'> & { email: RowEmail; rowId: string }) => {
  const isOpen = useExpanded()?.sourceId === rowSourceId(rowId)
  return (
    <button
      type="button"
      aria-expanded={isOpen}
      data-expand-trigger
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
}
