import { listSearch } from '@fewmail/shared/agent'
import { Spinner } from '@fewmail/ui/components/spinner'
import { useQuery } from '@tanstack/react-query'
import type { ReactNode } from 'react'

import { StackView } from '~/components/thread-view'
import { useT } from '~/lib/i18n'
import { orpc } from '~/lib/orpc'

export interface StackSender {
  fromEmail: string
  listId?: string | null
}

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
