import { SettingsRow } from '@fewmail/ui/components/custom/settings-group'
import { cn } from '@fewmail/ui/lib/utils'
import type { ReactNode } from 'react'

import { ExpandTrigger } from '~/components/expand-row'
import type { Expanded } from '~/components/expand-row'
import { ROW_SWAP, RowTime } from '~/components/mail-meta'
import type { RowPlace } from '~/components/pane-rows'
import { SenderAvatar } from '~/components/sender-avatar'
import { MailRowActions, sweepOf } from '~/components/thread-view'
import type { useMailActions } from '~/components/thread-view'
import { useT } from '~/lib/i18n'

export const readIconOf = (isUnread: boolean) =>
  cn('flex shrink-0', !isUnread && 'opacity-50')

export const senderTextOf = (isUnread: boolean) =>
  isUnread ? 'font-semibold' : 'text-muted-foreground'

interface Sender {
  fromEmail: string
  fromName?: string | null
}

/**
 * Any email outside Mail's list, drawn as Mail draws it: the sender's avatar beside the sender and a line, read mail sunk,
 * the facts and the time, swapped on hover for Mail's own actions. Without `actions` (sent mail) it only opens.
 */
export const EmailRow = ({
  actions,
  active,
  children,
  description,
  facts,
  from,
  message,
  onSelect,
  place,
  rowId,
  sender = message,
}: {
  actions?: ReturnType<typeof useMailActions>
  active?: boolean
  /** Always shown, ending the row after the time: a code's copy button. Before the time, the hover actions' reserved width left it floating mid-row. */
  children?: ReactNode
  description: ReactNode
  /** Beside the time, until the hover's actions take their place. */
  facts?: ReactNode
  from: Expanded['from']
  message: Sender & {
    id: string
    isInInbox?: boolean
    isPinned?: boolean
    isUnread?: boolean
    receivedAt: Date
    threadId: string
  }
  onSelect?: () => void
  place?: RowPlace
  rowId?: string
  sender?: Sender
}) => {
  const t = useT()
  const { isUnread = false } = message
  const time = (
    <span
      className={cn(
        'shrink-0 text-xs tabular-nums',
        isUnread ? 'text-foreground font-medium' : 'text-muted-foreground'
      )}
    >
      <RowTime date={message.receivedAt} />
    </span>
  )
  return (
    <SettingsRow
      {...place}
      active={active}
      trigger={
        <ExpandTrigger
          email={{ from, threadId: message.threadId }}
          rowId={rowId ?? message.id}
          onClick={onSelect}
        />
      }
      iconVariant="avatar"
      icon={
        <span className={readIconOf(isUnread)}>
          <SenderAvatar sender={sender} size="sm" />
        </span>
      }
      title={
        <>
          <span data-mask className={senderTextOf(isUnread)}>
            {sender.fromName ?? sender.fromEmail}
          </span>
          {isUnread && (
            <span className="bg-primary size-1.5 shrink-0 rounded-full">
              <span className="sr-only">{t.mail.unread}</span>
            </span>
          )}
        </>
      }
      description={description}
    >
      {actions ? (
        <span className={`${ROW_SWAP} group/swap`}>
          <span className="flex items-center gap-2 group-hover/item:opacity-0 group-has-data-popup-open/swap:opacity-0">
            {facts}
            {time}
          </span>
          <MailRowActions
            actions={actions}
            canSnooze
            className="group-hover/item:opacity-100"
            isPinned={message.isPinned}
            messageIds={[message.id]}
            sweep={sweepOf(
              actions,
              t,
              message.isInInbox ? 'inbox' : 'elsewhere'
            )}
            thread={{ isUnread, threadId: message.threadId }}
          />
        </span>
      ) : (
        <span className="flex items-center gap-2">
          {facts}
          {time}
        </span>
      )}
      {children}
    </SettingsRow>
  )
}
