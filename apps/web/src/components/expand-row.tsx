import type { ComponentProps } from 'react'
import { createStore } from 'seitu'
import { useSubscription } from 'seitu/react'

import { prefetchThread } from '~/lib/mail-db'
import { posthog } from '~/lib/posthog'

export interface Expanded {
  /** A Reading sentence: its source message's body is centred on the passage it came from. */
  cite?: { messageId: string; text: string }
  from: 'board' | 'home' | 'journal' | 'mail' | 'reading'
  pathname: string
  /** The `ExpandTrigger` that opened it, by its `data-expand-trigger`. */
  sourceId: string
  threadId: string
}
export const expandedThread = createStore<Expanded | null>(null)

export const useExpanded = () => useSubscription(expandedThread)
export const useIsThreadExpanded = () => !!useExpanded()

export const collapseExpanded = () => expandedThread.set(null)

/** Opens a row's email in `ThreadPane`, or closes it; another row's email takes the sidebar. */
const toggleExpanded = (open: Omit<Expanded, 'pathname'>) => {
  if (expandedThread.get()?.sourceId === open.sourceId) {
    collapseExpanded()
    return
  }
  expandedThread.set({ ...open, pathname: location.pathname })
  posthog.capture('thread_expanded', { from: open.from })
}

type RowEmail = Pick<Expanded, 'cite' | 'from' | 'threadId'>

const rowSourceId = (rowId: string) => `email-${rowId}`

/** Opens the email of `rowId` in the sidebar, as a click on its `ExpandTrigger` does: a list's ⏎ on its cursor row. */
export const expandRow = (rowId: string, email: RowEmail) =>
  toggleExpanded({ ...email, sourceId: rowSourceId(rowId) })

/** Moves the sidebar to a row's email and never closes it: Home's next card once one is settled. */
export const showRow = (rowId: string, email: RowEmail) =>
  expandedThread.set({
    ...email,
    pathname: location.pathname,
    sourceId: rowSourceId(rowId),
  })

/** The row whose email the sidebar shows, among `rowIds`. */
export const useExpandedRow = (rowIds: string[]) => {
  const sourceId = useExpanded()?.sourceId
  return rowIds.find((rowId) => rowSourceId(rowId) === sourceId)
}

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
