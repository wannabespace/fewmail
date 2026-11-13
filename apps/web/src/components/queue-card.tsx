import type { RouterOutputs } from '@fewmail/api/router'
import { sendsDraft } from '@fewmail/shared/agent'
import type { CleanupSender } from '@fewmail/shared/agent'
import { replyRecipients, textToHtml } from '@fewmail/shared/email'
import type { Messages } from '@fewmail/shared/i18n'
import {
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@fewmail/ui/components/accordion'
import { Button } from '@fewmail/ui/components/button'
import { Checkbox } from '@fewmail/ui/components/checkbox'
import { IconButton } from '@fewmail/ui/components/custom/icon-button'
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from '@fewmail/ui/components/input-group'
import { Kbd } from '@fewmail/ui/components/kbd'
import { cn } from '@fewmail/ui/lib/utils'
import {
  MailOpen01Icon,
  NextIcon,
  Tick02Icon,
} from '@hugeicons/core-free-icons'
import { useHotkey } from '@tanstack/react-hotkeys'
import { useEffect, useRef, useState } from 'react'
import type { RefObject } from 'react'

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
  isSelected,
  onApprove,
  onOpen,
  onSkip,
}: {
  action: Action
  hasMessage: boolean
  isSelected: boolean
  onApprove: () => void
  onOpen: () => void
  onSkip: () => void
}) => {
  const t = useT()

  return (
    <span className="flex opacity-0 group-hover:opacity-100">
      {/* A reply is never sent unread: it needs the open card. */}
      {!isSelected && !sendsDraft(action) && (
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
          shortcut={isSelected && <Kbd>O</Kbd>}
          size="icon-sm"
          variant="ghost-muted"
          onClick={onOpen}
        />
      )}
      <IconButton
        icon={NextIcon}
        label={t.queue.skip}
        shortcut={isSelected && <Kbd>S</Kbd>}
        size="icon-sm"
        variant="ghost-muted"
        onClick={onSkip}
      />
    </span>
  )
}

const QueueCardHeader = ({
  index,
  isNew,
  isPicked,
  isSelected,
  item: { action, analysis, message },
  onApprove,
  onOpen,
  onPick,
  onSkip,
}: {
  index: number
  isNew: boolean
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
          {!isSelected && (
            <span className="text-muted-foreground mr-3 text-xs whitespace-nowrap">
              {approveLabel(t, action, sendsDraft(action))}
            </span>
          )}
          <span className={cn(ROW_SWAP, 'mr-3')}>
            {message && (
              <span className="text-muted-foreground text-xs group-hover:opacity-0">
                {dates.ago(message.receivedAt)}
              </span>
            )}
            <QuickActions
              action={action}
              hasMessage={!!message}
              isSelected={isSelected}
              onApprove={onApprove}
              onOpen={onOpen}
              onSkip={onSkip}
            />
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
      {isNew && (
        <span className="bg-primary size-1.5 shrink-0 rounded-full">
          <span className="sr-only">{t.queue.new}</span>
        </span>
      )}
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

const RewriteField = ({
  onCancel,
  onSubmit,
}: {
  onCancel: () => void
  onSubmit: (instruction: string) => void
}) => {
  const t = useT()
  const inputRef = useRef<HTMLInputElement>(null)
  const [instruction, setInstruction] = useState('')
  const submit = () =>
    onSubmit(instruction.trim() || t.queue.shorterInstruction)
  const keys = { ignoreInputs: false, target: inputRef }
  useHotkey('Enter', submit, keys)
  useHotkey('Escape', onCancel, keys)
  useEffect(() => inputRef.current?.focus(), [])

  return (
    <InputGroup size="sm">
      <InputGroupInput
        ref={inputRef}
        value={instruction}
        onChange={(event) => setInstruction(event.target.value)}
        onBlur={() => !instruction && onCancel()}
        placeholder={t.queue.shorterInstruction}
        aria-label={t.queue.rewrite}
        data-mask
      />
      <InputGroupAddon align="inline-end">
        <Kbd>⏎</Kbd>
      </InputGroupAddon>
    </InputGroup>
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

/** What they wrote, then the draft (or its editor) and the rewrite field: a reply is judged against the email, never alone. */
const ReplyBody = ({
  draft,
  editorRef,
  hasAgent,
  isEditing,
  isRewriting,
  message,
  onApprove,
  onDraftChange,
  onRewrite,
  onRewriteChange,
  onStopEditing,
}: {
  draft: string
  editorRef: RefObject<ComposerEditorHandle | null>
  hasAgent: boolean
  isEditing: boolean
  isRewriting: boolean
  message: QueueItem['message']
  onApprove: () => void
  onDraftChange: (draft: string) => void
  onRewrite: (instruction: string) => void
  onRewriteChange: (isRewriting: boolean) => void
  onStopEditing: () => void
}) => {
  const t = useT()

  return (
    <>
      {message?.snippet && (
        <p
          data-mask
          className="text-muted-foreground line-clamp-3 border-l-2 pl-3 font-serif text-sm/relaxed"
        >
          {message.snippet}
        </p>
      )}
      {isEditing ? (
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
      )}
      {isRewriting && (
        <RewriteField
          onCancel={() => onRewriteChange(false)}
          onSubmit={onRewrite}
        />
      )}
    </>
  )
}

export const QueueCard = ({
  draft,
  index,
  isBusy,
  isEditing,
  isNew,
  isPicked,
  isRewriting,
  isSelected,
  item,
  onApprove,
  onDraftChange,
  onEdit,
  onOpen,
  onPick,
  onRewrite,
  onRewriteChange,
  onSkip,
  onStopEditing,
}: {
  draft: string
  index: number
  isBusy: boolean
  isEditing: boolean
  isNew: boolean
  isPicked: boolean
  isRewriting: boolean
  isSelected: boolean
  item: QueueItem
  onApprove: () => void
  onDraftChange: (draft: string) => void
  onEdit: () => void
  onOpen: () => void
  onPick: () => void
  onRewrite: (instruction: string) => void
  onRewriteChange: (isRewriting: boolean) => void
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
        isNew={isNew}
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
          {isReply && (
            <ReplyBody
              draft={draft}
              editorRef={editorRef}
              hasAgent={hasAgent}
              isEditing={isEditing}
              isRewriting={isRewriting}
              message={message}
              onApprove={onApprove}
              onDraftChange={onDraftChange}
              onRewrite={onRewrite}
              onRewriteChange={onRewriteChange}
              onStopEditing={onStopEditing}
            />
          )}
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
            {isReply && !isRewriting && (
              <Button
                size="sm"
                variant="ghost-muted"
                disabled={isBusy}
                onClick={() => onRewriteChange(true)}
              >
                {t.queue.rewrite} <Kbd>R</Kbd>
              </Button>
            )}
            {isReply && message && (
              <span className="text-muted-foreground ml-auto truncate text-xs">
                <span data-mask>
                  {t.agent.to(replyRecipients(message).join(', '))}
                </span>
                {` · ${t.queue.draftedInVoice}`}
              </span>
            )}
          </div>
        </div>
      </AccordionContent>
    </AccordionItem>
  )
}
