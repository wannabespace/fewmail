import type { RouterOutputs } from '@fewmail/api/router'
import { sendsDraft } from '@fewmail/shared/agent'
import type { CleanupSender } from '@fewmail/shared/agent'
import { textToHtml } from '@fewmail/shared/email'
import type { Messages } from '@fewmail/shared/i18n'
import {
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@fewmail/ui/components/accordion'
import { Button } from '@fewmail/ui/components/button'
import { Checkbox } from '@fewmail/ui/components/checkbox'
import { IconButton } from '@fewmail/ui/components/custom/icon-button'
import { Kbd } from '@fewmail/ui/components/kbd'
import { cn } from '@fewmail/ui/lib/utils'
import {
  MailOpen01Icon,
  NextIcon,
  Tick02Icon,
} from '@hugeicons/core-free-icons'
import { useEffect, useRef } from 'react'

import { useDates, useT } from '~/lib/i18n'
import { useHasAgent } from '~/lib/me'
import { client } from '~/lib/orpc'

import type { ComposerEditorHandle } from './composer/composer-editor'
import { ComposerEditor } from './composer/composer-editor'
import { ROW_SWAP } from './thread-view'

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

const approveLabel = (t: Messages, action: Action, isReply: boolean) => {
  if (isReply) {
    return t.queue.send
  }
  return t.actionKind[action.kind]
}

const QuickActions = ({
  action,
  hasMessage,
  onApprove,
  onOpen,
  onSkip,
}: {
  action: Action
  hasMessage: boolean
  onApprove: () => void
  onOpen: () => void
  onSkip: () => void
}) => {
  const t = useT()

  return (
    <span className="flex opacity-0 group-hover:opacity-100">
      {/* A reply is never sent unread: it needs the open card. */}
      {!sendsDraft(action) && (
        <IconButton
          icon={Tick02Icon}
          label={approveLabel(t, action, false)}
          size="icon-sm"
          variant="ghost-muted"
          onClick={onApprove}
        />
      )}
      {hasMessage && (
        <IconButton
          icon={MailOpen01Icon}
          label={t.queue.open}
          size="icon-sm"
          variant="ghost-muted"
          onClick={onOpen}
        />
      )}
      <IconButton
        icon={NextIcon}
        label={t.queue.skip}
        size="icon-sm"
        variant="ghost-muted"
        onClick={onSkip}
      />
    </span>
  )
}

const QueueCardHeader = ({
  index,
  isPicked,
  isSelected,
  item: { action, analysis, message },
  onApprove,
  onOpen,
  onPick,
  onSkip,
}: {
  index: number
  isPicked: boolean
  isSelected: boolean
  item: QueueItem
  onApprove: () => void
  onOpen: () => void
  onPick: () => void
  onSkip: () => void
}) => {
  const t = useT()
  const dates = useDates()

  return (
    <AccordionTrigger
      trailing={
        <>
          <span className={cn(ROW_SWAP, 'mr-3')}>
            {message && (
              <span
                className={cn(
                  'text-muted-foreground text-xs',
                  !isSelected && 'group-hover:opacity-0'
                )}
              >
                {dates.ago(message.receivedAt)}
              </span>
            )}
            {!isSelected && (
              <QuickActions
                action={action}
                hasMessage={!!message}
                onApprove={onApprove}
                onOpen={onOpen}
                onSkip={onSkip}
              />
            )}
          </span>
          <Checkbox
            aria-label={t.queue.pick}
            checked={isPicked}
            onCheckedChange={onPick}
          />
        </>
      }
    >
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
    </AccordionTrigger>
  )
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
      className="group"
    >
      <QueueCardHeader
        index={index}
        isPicked={isPicked}
        isSelected={isSelected}
        item={item}
        onApprove={onApprove}
        onOpen={onOpen}
        onPick={onPick}
        onSkip={onSkip}
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
            <span className="text-muted-foreground ml-auto text-xs">
              {isReply ? t.queue.draftedInVoice : null}
            </span>
          </div>
        </div>
      </AccordionContent>
    </AccordionItem>
  )
}
