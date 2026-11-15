import { cn } from '@fewmail/ui/lib/utils'
import { useReducedMotion } from 'motion/react'
import type { Transition } from 'motion/react'
import type { ComponentProps, ReactNode } from 'react'
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

/** What flies from a row or a peek to the same thing in the email: the sender's avatar and name, the subject, the body. */
export type MorphPart = 'avatar' | 'body' | 'name' | 'title'

export interface Expanded {
  /** The pane's `clip-path` over what it grew out of, measured as it opens. */
  clip: string
  close: () => void
  from: 'board' | 'home' | 'journal' | 'mail' | 'reading'
  /** Set while the pane shrinks back; the source stays hidden and its keys asleep until it is gone. */
  isClosing?: boolean
  /** The email the parts fly to, unfolded in the pane. */
  messageId?: string
  /** A peek (`PEEK_ID`) or a row: its `MorphSource` parts and its box carry it. */
  morphId: string
  parts: MorphPart[]
  pathname: string
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

const sourceBox = (morphId: string) =>
  document.querySelector(`[data-morph-source="${CSS.escape(morphId)}"]`)

const clipOver = (morphId: string, radius: number) => {
  const area = document
    .querySelector('[data-slot=thread-pane-area]')
    ?.getBoundingClientRect()
  const box = sourceBox(morphId)?.getBoundingClientRect()
  if (!area || !box) {
    return OPEN_CLIP
  }
  return `inset(${box.top - area.top}px ${area.right - box.right}px ${area.bottom - box.bottom}px ${box.left - area.left}px round ${radius}px)`
}

/** Grows a peek or a row into `ThreadPane`, or shrinks it back. */
export const toggleExpanded = (
  open: Omit<Expanded, 'clip' | 'isClosing' | 'pathname'>
) => {
  const current = expandedThread.get()
  if (current) {
    collapseExpanded()
    return
  }
  expandedThread.set({
    ...open,
    clip: clipOver(open.morphId, open.surface === 'popover' ? 12 : 0),
    pathname: location.pathname,
  })
  posthog.capture('thread_expanded', { from: open.from })
}

/** One part of a row or a peek that flies into the email: `ThreadView`'s `Part` of the same name measures it. */
export const MorphSource = ({
  children,
  className,
  morphId,
  part,
}: {
  children: ReactNode
  className?: string
  morphId: string
  part: MorphPart
}) => (
  <span
    data-morph={`${morphId}-${part}`}
    className={cn('inline-flex max-w-full', className)}
  >
    {children}
  </span>
)

interface RowEmail {
  from: Expanded['from']
  /** The email the row names, when its avatar and title are its sender. */
  messageId?: string
  threadId: string
}

export const rowMorphId = (rowId: string) => `email-${rowId}`

/** Grows the `ExpandTrigger` of `rowId` into its email, as a click on it does: a list's ⏎ on its cursor row. */
export const expandRow = (
  rowId: string,
  { from, messageId, threadId }: RowEmail
) =>
  toggleExpanded({
    close: dropExpanded,
    from,
    messageId,
    morphId: rowMorphId(rowId),
    parts: messageId ? ['avatar', 'name'] : [],
    surface: 'row',
    threadId,
  })

/** A row that grows into its email over the page instead of peeking: `SettingsRow trigger` lays it over the whole row, which is the box the pane grows out of. */
export const ExpandTrigger = ({
  email,
  rowId,
  ...props
}: ComponentProps<'button'> & { email: RowEmail; rowId: string }) => (
  <button
    type="button"
    data-morph-source={rowMorphId(rowId)}
    onPointerEnter={() => {
      void prefetchThread(email.threadId)
    }}
    // A click that kept focus here made the list's ⏎ open this row instead of the J / K cursor's.
    onMouseDown={(event) => event.preventDefault()}
    onClick={() => expandRow(rowId, email)}
    {...props}
  />
)
