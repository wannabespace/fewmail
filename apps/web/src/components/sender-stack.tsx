import { listSearch } from '@fewmail/shared/agent'
import { Spinner } from '@fewmail/ui/components/spinner'
import { useHotkey } from '@tanstack/react-hotkeys'
import { useQuery } from '@tanstack/react-query'
import type { ReactNode } from 'react'

import { closeSender, useShownSender } from '~/components/sender-card'
import type { StackSender } from '~/components/sender-card'
import { ReaderSidebar } from '~/components/thread-link'
import { StackView } from '~/components/thread-view'
import { useT } from '~/lib/i18n'
import { orpc, refetchChanged } from '~/lib/orpc'

/** A sender's emails of the last 30 days beside the page, newest first, as one stack: N / P step through them. */
export const SenderStack = ({
  children,
  onClose,
  onDone,
  sender,
}: {
  /** Actions of the place it was opened from, before the stack's own. */
  children?: ReactNode
  onClose: () => void
  onDone: () => void
  sender: StackSender
}) => {
  const t = useT()
  const { data } = useQuery(
    orpc.mail.list.queryOptions({
      input: { filter: 'inbox', search: listSearch(sender) },
    })
  )
  if (!data) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <Spinner label={t.nav.loading} />
      </div>
    )
  }
  return (
    <StackView
      emails={data.map(({ analysis, message }) => ({
        ...message,
        extracted: analysis?.extracted,
      }))}
      isSnoozed={false}
      place="inbox"
      onClose={onClose}
      onDone={onDone}
    >
      {children}
    </StackView>
  )
}

/** Home's sidebar for the emails a card is about: a new sender's, a suggested bot's; esc closes it. */
export const SenderSidebar = () => {
  const shown = useShownSender()
  useHotkey('Escape', closeSender, { enabled: !!shown?.isOpen })
  return (
    <ReaderSidebar isOpen={!!shown?.isOpen}>
      {shown && (
        <SenderStack
          key={`${shown.sender.fromEmail}:${shown.sender.listId}`}
          sender={shown.sender}
          onClose={closeSender}
          onDone={() => {
            closeSender()
            refetchChanged(['today', 'mail'])
          }}
        />
      )}
    </ReaderSidebar>
  )
}
