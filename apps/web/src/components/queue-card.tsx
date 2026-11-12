import type { RouterOutputs } from '@fewmail/api/router'
import { ACTION_KIND_TRAITS, sendsDraft } from '@fewmail/shared/agent'
import type { CleanupSender } from '@fewmail/shared/agent'
import { textToHtml } from '@fewmail/shared/email'
import type { Messages } from '@fewmail/shared/i18n'
import {
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@fewmail/ui/components/accordion'
import { Button } from '@fewmail/ui/components/button'
import { Kbd } from '@fewmail/ui/components/kbd'
import { cn } from '@fewmail/ui/lib/utils'
import { Tick02Icon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
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
  isPicked,
  isSelected,
  item: { action, analysis, message },
}: {
  index: number
  isPicked: boolean
  isSelected: boolean
  item: QueueItem
}) => {
  const dates = useDates()

  return (
    <AccordionTrigger>
      <span
        className={cn(
          'flex size-5.5 shrink-0 items-center justify-center rounded-md text-xs font-semibold tabular-nums',
          isSelected || isPicked
            ? 'bg-primary text-primary-foreground'
            : 'bg-secondary text-foreground/70'
        )}
      >
        {isPicked ? (
          <HugeiconsIcon
            icon={Tick02Icon}
            strokeWidth={2.5}
            className="size-3.5"
          />
        ) : (
          index + 1
        )}
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
    </AccordionTrigger>
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
  isPicked,
  isSelected,
  item,
  onApprove,
  onDraftChange,
  onEdit,
  onOpen,
  onPick,
  onRedraft,
  onSkip,
  onStopEditing,
}: {
  draft: string
  index: number
  isBusy: boolean
  isEditing: boolean
  isPicked: boolean
  isSelected: boolean
  item: QueueItem
  onApprove: () => void
  onDraftChange: (draft: string) => void
  onEdit: () => void
  onOpen: () => void
  onPick: () => void
  onRedraft: () => void
  onSkip: () => void
  onStopEditing: () => void
}) => {
  const t = useT()
  const { action, analysis, message } = item
  const isReply = sendsDraft(action)
  const isSecurity = action.kind === 'security'
  const reason = action.reason || analysis?.reason
  const ref = useRef<HTMLDivElement>(null)
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
    <AccordionItem
      ref={ref}
      value={action.id}
      tone={isSecurity ? 'destructive' : 'default'}
    >
      <QueueCardHeader
        index={index}
        isPicked={isPicked}
        isSelected={isSelected}
        item={item}
      />

      <AccordionContent>
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
            <Button size="sm" variant="ghost-muted" onClick={onPick}>
              {isPicked ? t.queue.unpick : t.queue.pick} <Kbd>X</Kbd>
            </Button>
            <span className="text-muted-foreground ml-auto text-xs">
              {isReply ? t.queue.draftedInVoice : null}
            </span>
          </div>
        </div>
      </AccordionContent>
    </AccordionItem>
  )
}
