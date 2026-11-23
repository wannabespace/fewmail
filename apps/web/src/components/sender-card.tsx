import { SettingsRow } from '@fewmail/ui/components/custom/settings-group'
import type { ReactNode } from 'react'
import { createStore } from 'seitu'
import { useSubscription } from 'seitu/react'

import { collapseExpanded } from '~/components/expand-row'
import { SenderAvatar } from '~/components/sender-avatar'
import { useT } from '~/lib/i18n'
import { posthog } from '~/lib/posthog'

export interface StackSender {
  fromEmail: string
  listId?: string | null
}

/** The sender a Home card asks about; it stays through the sidebar's fold, which only `isOpen` closes. */
const shownStore = createStore<{ isOpen: boolean; sender: StackSender } | null>(
  null
)

const sameSender = (a: StackSender, b: StackSender) =>
  a.fromEmail === b.fromEmail && (a.listId ?? null) === (b.listId ?? null)

export const showSender = (sender: StackSender) => {
  collapseExpanded()
  posthog.capture('sender_emails_opened', { from: 'home' })
  shownStore.set({ isOpen: true, sender })
}

export const closeSender = () => {
  const shown = shownStore.get()
  if (shown?.isOpen) {
    shownStore.set({ ...shown, isOpen: false })
  }
}

/** Whether this sender's emails are open beside Home, for its card's highlight. */
export const useIsSenderShown = (sender?: StackSender) => {
  const shown = useSubscription(shownStore)
  return !!shown?.isOpen && (sender ? sameSender(shown.sender, sender) : true)
}

export const useShownSender = () => useSubscription(shownStore)

/**
 * A question about a sender (a new one, a suggested bot), one row of a list: the whole row opens its emails beside the
 * chat, so the user sees what they decide on; its answers stay buttons of their own.
 */
export const SenderRow = ({
  children,
  isShowable = true,
  label,
  lead,
  sender,
}: {
  children: ReactNode
  /** Off inside an open email, which is already the sender's. */
  isShowable?: boolean
  label: string
  lead: ReactNode
  sender: StackSender & { fromName: string | null }
}) => {
  const t = useT()
  const isShown = useIsSenderShown(sender)
  return (
    <SettingsRow
      icon={<SenderAvatar sender={sender} size="sm" />}
      iconVariant="avatar"
      title={
        <span className="flex flex-wrap items-baseline gap-x-2">
          <span data-mask>{sender.fromName ?? sender.fromEmail}</span>
          <span className="text-muted-foreground text-xs font-normal whitespace-nowrap">
            {label}
          </span>
        </span>
      }
      description={lead}
      trigger={
        isShowable ? (
          <button
            type="button"
            aria-label={t.nav.personMail}
            aria-expanded={isShown}
            onClick={() => showSender(sender)}
          />
        ) : undefined
      }
    >
      {children}
    </SettingsRow>
  )
}
