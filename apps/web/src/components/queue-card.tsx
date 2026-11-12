import type { RouterOutputs } from '@fewmail/api/router'
import { ACTION_KIND_TRAITS, sendsDraft } from '@fewmail/shared/agent'
import type { CleanupSender } from '@fewmail/shared/agent'
import { textToHtml } from '@fewmail/shared/email'
import type { Messages } from '@fewmail/shared/i18n'
import { Button } from '@fewmail/ui/components/button'
import { Kbd } from '@fewmail/ui/components/kbd'
import { cn } from '@fewmail/ui/lib/utils'
import { useEffect, useRef } from 'react'

import { useDates, useT } from '~/lib/i18n'
import { useHasAgent } from '~/lib/me'
import { client } from '~/lib/orpc'

import type { ComposerEditorHandle } from './composer/composer-editor'
import { ComposerEditor } from './composer/composer-editor'

export type QueueItem = RouterOutputs['today']['get']['queue'][number]
type Action = QueueItem['action']

export const DraftText = ({ text }: { text: string }) => (
  <p
    data-mask
    className="bg-secondary/60 text-foreground/90 rounded-xl px-4 py-3 font-serif text-base/relaxed whitespace-pre-wrap"
  >
    {text}
  </p>
)

const headline = ({ action, analysis, message }: QueueItem) => {
  if (action.kind === 'commitment') {
    return action.detail ?? action.title
  }
  if (action.kind === 'cleanup') {
    return action.title
  }
  return analysis?.summary ?? message?.subject ?? action.title
}

const CleanupList = ({ action }: { action: Action }) => {
  const t = useT()
  const senders = (action.payload?.senders ?? []) as CleanupSender[]

  return (
    <ul className="flex flex-col gap-1 text-sm">
      {senders.map((sender) => (
        <li key={sender.fromEmail} className="flex items-center gap-2">
          <span data-mask className="truncate">
            {sender.fromName ?? sender.fromEmail}
          </span>
          <span className="text-muted-foreground ml-auto shrink-0 text-xs tabular-nums">
            {t.cleanup.emails(sender.count)}
          </span>
        </li>
      ))}
    </ul>
  )
}

const QueueCardHeader = ({
  index,
  isSelected,
  item: { action, analysis, message },
}: {
  index: number
  isSelected: boolean
  item: QueueItem
}) => {
  const dates = useDates()

  return (
    <header className="flex items-center gap-3">
      <span
        className={cn(
          'flex size-5.5 shrink-0 items-center justify-center rounded-md text-xs font-semibold tabular-nums',
          isSelected
            ? 'bg-primary text-primary-foreground'
            : 'bg-secondary text-foreground/70'
        )}
      >
        {index + 1}
      </span>
      <strong data-mask className="truncate font-semibold">
        {action.kind === 'cleanup'
          ? 'Fewmail'
          : (message?.fromName ?? message?.fromEmail ?? 'Fewmail')}
      </strong>
      <span data-mask className="text-muted-foreground min-w-0 flex-1 truncate">
        {headline({ action, analysis, message })}
      </span>
      {message && (
        <span className="text-muted-foreground shrink-0 text-xs">
          {dates.ago(message.receivedAt)}
        </span>
      )}
    </header>
  )
}

const approveLabel = (t: Messages, action: Action, isReply: boolean) => {
  if (isReply) {
    return t.queue.send
  }
  return ACTION_KIND_TRAITS[action.kind].ownLabel
    ? t.actionKind[action.kind]
    : action.title || t.actionKind[action.kind]
}

const completerFor = (hasAgent: boolean, message: QueueItem['message']) =>
  hasAgent && message
    ? ({
        prefix,
        signal,
        suffix,
      }: {
        prefix: string
        signal: AbortSignal
        suffix: string
      }) =>
        client.mail
          .complete(
            { prefix, replyToMessageId: message.id, suffix },
            { signal }
          )
          .then(({ text }) => text)
    : undefined

export const QueueCard = ({
  draft,
  index,
  isBusy,
  isEditing,
  isSelected,
  item,
  onApprove,
  onDraftChange,
  onEdit,
  onOpen,
  onRedraft,
  onSelect,
  onSkip,
  onStopEditing,
}: {
  draft: string
  index: number
  isBusy: boolean
  isEditing: boolean
  isSelected: boolean
  item: QueueItem
  onApprove: () => void
  onDraftChange: (draft: string) => void
  onEdit: () => void
  onOpen: () => void
  onRedraft: () => void
  onSelect: () => void
  onSkip: () => void
  onStopEditing: () => void
}) => {
  const t = useT()
  const { action, analysis, message } = item
  const isReply = sendsDraft(action)
  const isSecurity = action.kind === 'security'
  const reason = action.reason || analysis?.reason
  const ref = useRef<HTMLElement>(null)
  const editorRef = useRef<ComposerEditorHandle>(null)
  const hasAgent = useHasAgent()

  useEffect(() => {
    if (isSelected) {
      ref.current?.scrollIntoView({ block: 'nearest' })
    }
  }, [isSelected])

  useEffect(() => {
    if (isEditing) {
      editorRef.current?.focus()
    }
  }, [isEditing])

  return (
    // oxlint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-noninteractive-element-interactions -- J/K select cards; the click only mirrors it for the mouse
    <article
      ref={ref}
      aria-current={isSelected}
      onClick={onSelect}
      className={cn(
        'bg-popover flex flex-col gap-3 rounded-2xl px-4.5 py-4 ring transition-shadow',
        isSelected
          ? 'ring-foreground/10 shadow-sm'
          : 'ring-foreground/6 hover:ring-foreground/10 cursor-pointer',
        isSecurity && 'ring-destructive/40 hover:ring-destructive/60'
      )}
    >
      <QueueCardHeader index={index} isSelected={isSelected} item={item} />

      {isSelected && (
        <div className="flex flex-col gap-3 pl-8.5">
          {isReply &&
            (isEditing ? (
              <ComposerEditor
                ref={editorRef}
                aria-label={t.actionKind.reply}
                placeholder={t.compose.placeholder}
                initialHtml={textToHtml(draft)}
                onChange={({ text }) => onDraftChange(text)}
                onSubmit={onApprove}
                onEscape={onStopEditing}
                complete={completerFor(hasAgent, message)}
              />
            ) : (
              <DraftText text={draft} />
            ))}
          {action.kind === 'cleanup' && <CleanupList action={action} />}
          {!isReply && action.kind !== 'cleanup' && reason && (
            <p
              data-mask
              className={cn(
                'text-sm',
                isSecurity ? 'text-destructive' : 'text-muted-foreground'
              )}
            >
              {reason}
            </p>
          )}
          <div className="flex flex-wrap items-center gap-2">
            <Button size="sm" disabled={isBusy} onClick={onApprove}>
              {approveLabel(t, action, isReply)}
              <Kbd>{isEditing ? '⌘⏎' : '⏎'}</Kbd>
            </Button>
            {isReply && !isEditing && (
              <Button
                size="sm"
                variant="secondary"
                disabled={isBusy}
                onClick={onEdit}
              >
                {t.queue.edit} <Kbd>E</Kbd>
              </Button>
            )}
            {isReply && (
              <Button
                size="sm"
                variant="ghost-muted"
                disabled={isBusy}
                onClick={onRedraft}
              >
                {t.queue.shorter} <Kbd>R</Kbd>
              </Button>
            )}
            {message && (
              <Button size="sm" variant="ghost-muted" onClick={onOpen}>
                {t.queue.open} <Kbd>O</Kbd>
              </Button>
            )}
            <Button
              size="sm"
              variant="ghost-muted"
              disabled={isBusy}
              onClick={onSkip}
            >
              {t.queue.skip} <Kbd>S</Kbd>
            </Button>
            <span className="text-muted-foreground ml-auto text-xs">
              {isReply ? t.queue.draftedInVoice : null}
            </span>
          </div>
        </div>
      )}
    </article>
  )
}
