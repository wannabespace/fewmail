import type { RouterOutputs } from '@fewmail/api/router'
import {
  cardPayload,
  hostOf,
  listSearch,
  sendsDraft,
} from '@fewmail/shared/agent'
import type { CleanupSender } from '@fewmail/shared/agent'
import { replyRecipients, textToHtml } from '@fewmail/shared/email'
import { approveTitle } from '@fewmail/shared/i18n'
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
  LinkSquare02Icon,
  NextIcon,
  Tick02Icon,
  ViewIcon,
} from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { useHotkey } from '@tanstack/react-hotkeys'
import { Link } from '@tanstack/react-router'
import { motion, useIsPresent, useReducedMotion } from 'motion/react'
import { useEffect, useRef, useState } from 'react'
import type { ReactNode, RefObject } from 'react'

import { useDates, useT } from '~/lib/i18n'
import { useHasAgent } from '~/lib/me'
import { client } from '~/lib/orpc'

import type { ComposerEditorHandle } from './composer/composer-editor'
import { ComposerEditor } from './composer/composer-editor'
import { ConsentDetails, DraftText } from './consent-details'
import { ExtractedChips } from './mail-meta'
import { SenderAvatar } from './sender-avatar'
import { PeekTrigger, peekIdOf } from './thread-link'
import { ROW_SWAP } from './thread-view'

export type QueueItem = RouterOutputs['today']['get']['queue'][number]
type Action = QueueItem['action']

const headline = ({ action, analysis, message }: QueueItem) => {
  if (action.kind === 'commitment') {
    return action.detail ?? action.title
  }
  if (action.kind === 'cleanup' || action.kind === 'consent') {
    return action.title
  }
  return analysis?.summary ?? message?.subject ?? action.title
}

const showsGist = ({ action, analysis }: QueueItem) =>
  !!analysis &&
  !sendsDraft(action) &&
  action.kind !== 'cleanup' &&
  action.kind !== 'consent'

/** The open card says the email whole, so its title gives the subject instead of repeating it. */
const titleOf = (item: QueueItem, isOpen: boolean) =>
  isOpen && showsGist(item)
    ? (item.message?.subject ?? headline(item))
    : headline(item)

/** What the email says and the facts in it, so the card can be settled without opening the email. */
const Gist = ({
  analysis,
}: {
  analysis: NonNullable<QueueItem['analysis']>
}) => (
  <>
    <p data-mask className="font-serif text-base/relaxed">
      {analysis.summary}
    </p>
    <ExtractedChips extracted={analysis.extracted} />
  </>
)

/** A request from the agent or an MCP client: every input of what the yes does, then who asked (the reason). */
const ConsentBody = ({ action }: { action: Action }) => {
  const { context, input, tool } = cardPayload(action)
  return (
    tool && <ConsentDetails context={context} input={input ?? {}} name={tool} />
  )
}

const CleanupList = ({ action }: { action: Action }) => {
  const t = useT()
  const senders = (action.payload?.senders ?? []) as CleanupSender[]

  return (
    <ul className="flex flex-col gap-1 text-sm">
      {senders.map((sender) => (
        <li key={sender.messageId} className="flex items-center gap-2">
          <SenderAvatar sender={sender} />
          <Link
            to="/mail"
            search={{ q: listSearch(sender) }}
            data-mask
            className="truncate underline-offset-3 hover:underline"
          >
            {sender.fromName ?? sender.fromEmail}
          </Link>
          <span className="text-muted-foreground ml-auto shrink-0 text-xs tabular-nums">
            {t.cleanup.emails(sender.count)}
          </span>
        </li>
      ))}
    </ul>
  )
}

/** What ⏎ does on a card: open the email's own link, draft the reminder, or say yes; the yes then moves to M. */
export const primaryStep = (action: Action) => {
  if (cardPayload(action).link) {
    return 'link' as const
  }
  return action.kind === 'follow_up'
    ? ('remind' as const)
    : ('approve' as const)
}

export const openCardLink = (action: Action) => {
  const { link } = cardPayload(action)
  if (link) {
    window.open(link.url, '_blank', 'noopener,noreferrer')
  }
}

const approveKey = (
  step: ReturnType<typeof primaryStep>,
  isEditing: boolean
) => {
  if (isEditing) {
    return '⌘⏎'
  }
  return step === 'approve' ? '⏎' : 'M'
}

/** The card's own step before its yes: the email's link, or drafting the reminder. */
const StepButton = ({
  action,
  isBusy,
  onRemind,
}: {
  action: Action
  isBusy: boolean
  onRemind: () => void
}) => {
  const t = useT()
  const { link } = cardPayload(action)
  if (link) {
    const host = hostOf(link.url)
    return (
      <Button
        size="sm"
        render={
          <a
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`${t.actionLink[link.purpose]} · ${host}`}
          />
        }
        shortcut={<Kbd>⏎</Kbd>}
      >
        <HugeiconsIcon icon={LinkSquare02Icon} strokeWidth={2} />
        {t.actionLink[link.purpose]} · <span data-mask>{host}</span>
      </Button>
    )
  }
  if (action.kind !== 'follow_up') {
    return null
  }
  return (
    <Button
      size="sm"
      disabled={isBusy}
      onClick={onRemind}
      shortcut={<Kbd>⏎</Kbd>}
    >
      {t.queue.writeReminder}
    </Button>
  )
}

const approveLabel = (t: Messages, action: Action, isReply: boolean) => {
  if (isReply) {
    return t.queue.send
  }
  return approveTitle(t, action)
}

/** What the card asks, never its yes: "I paid it" there repeats the ✓ beside it. */
const foldedVerb = (t: Messages, action: Action) => {
  if (sendsDraft(action)) {
    return t.queue.send
  }
  const { event, link, tool } = cardPayload(action)
  if (tool || event) {
    return approveTitle(t, action)
  }
  return link ? t.actionLink[link.purpose] : t.actionKind[action.kind]
}

const QuickActions = ({
  action,
  isOpen,
  isSelected,
  message,
  onApprove,
  onSkip,
}: {
  action: Action
  isOpen: boolean
  isSelected: boolean
  message: QueueItem['message']
  onApprove: () => void
  onSkip: () => void
}) => {
  const t = useT()

  return (
    <span className="flex opacity-0 group-hover:opacity-100 has-data-popup-open:opacity-100">
      {/* A reply is never sent unread: it needs the open card. The open card's own yes button is the ✓. */}
      {!isOpen && !sendsDraft(action) && (
        <IconButton
          icon={Tick02Icon}
          label={approveLabel(t, action, false)}
          size="icon-sm"
          variant="ghost-muted"
          onClick={onApprove}
        />
      )}
      {message && (
        <PeekTrigger
          id={peekIdOf(action.id)}
          message={{ ...message, from: 'home' }}
          render={
            <IconButton
              icon={ViewIcon}
              label={t.mail.peek}
              shortcut={isSelected && <Kbd>O</Kbd>}
              size="icon-sm"
              variant="ghost-muted"
            />
          }
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
  isOpen,
  isPicked,
  isSelected,
  item: { action, analysis, message },
  onApprove,
  onPick,
  onSkip,
}: {
  index: number
  isNew: boolean
  isOpen: boolean
  isPicked: boolean
  isSelected: boolean
  item: QueueItem
  onApprove: () => void
  onPick: () => void
  onSkip: () => void
}) => {
  const t = useT()
  const dates = useDates()

  return (
    <AccordionTrigger
      trailing={
        <>
          {!isOpen && (
            <span className="text-muted-foreground mr-3 text-xs whitespace-nowrap">
              {foldedVerb(t, action)}
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
              isOpen={isOpen}
              isSelected={isSelected}
              message={message}
              onApprove={onApprove}
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
          isOpen
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
      {message && action.kind !== 'cleanup' && (
        <SenderAvatar sender={message} />
      )}
      <strong data-mask className="truncate font-semibold">
        {action.kind === 'cleanup'
          ? 'Fewmail'
          : (message?.fromName ?? message?.fromEmail ?? 'Fewmail')}
      </strong>
      <span data-mask className="text-muted-foreground min-w-0 flex-1 truncate">
        {titleOf({ action, analysis, message }, isOpen)}
      </span>
    </AccordionTrigger>
  )
}

const CARD_LEAVE = { duration: 0.2, ease: [0.32, 0.72, 0, 1] } as const

/**
 * A settled card folds out and the cards below rise into its place, the next one opening as it comes.
 * The margin must end at minus the cards Accordion's gap-2.5, or the cards snap up by the gap once the fold ends; it starts in rem because motion cannot tween px into rem.
 */
const LeavingCard = ({ children }: { children: ReactNode }) => {
  const isPresent = useIsPresent()
  const isReducedMotion = useReducedMotion()
  return (
    <motion.div
      initial={false}
      animate={{ marginBottom: '0rem' }}
      exit={{ height: 0, marginBottom: '-0.625rem', opacity: 0 }}
      transition={isReducedMotion ? { duration: 0 } : CARD_LEAVE}
      className={cn(
        !isPresent && 'pointer-events-none [clip-path:inset(-4px_-4px_0)]'
      )}
    >
      {children}
    </motion.div>
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
  isOpen,
  isPicked,
  isRewriting,
  isSelected,
  item,
  onApprove,
  onDraftChange,
  onEdit,
  onPick,
  onRemind,
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
  isOpen: boolean
  isPicked: boolean
  isRewriting: boolean
  isSelected: boolean
  item: QueueItem
  onApprove: () => void
  onDraftChange: (draft: string) => void
  onEdit: () => void
  onPick: () => void
  onRemind: () => void
  onRewrite: (instruction: string) => void
  onRewriteChange: (isRewriting: boolean) => void
  onSkip: () => void
  onStopEditing: () => void
}) => {
  const t = useT()
  const { action, analysis, message } = item
  const isReply = sendsDraft(action)
  const step = primaryStep(action)
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
    <LeavingCard>
      <AccordionItem
        ref={ref}
        value={action.id}
        tone={isSecurity ? 'destructive' : 'default'}
        active={isSelected}
        className="group"
      >
        <QueueCardHeader
          index={index}
          isNew={isNew}
          isOpen={isOpen}
          isPicked={isPicked}
          isSelected={isSelected}
          item={item}
          onApprove={onApprove}
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
            {action.kind === 'consent' && <ConsentBody action={action} />}
            {analysis && showsGist(item) && <Gist analysis={analysis} />}
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
              <StepButton action={action} isBusy={isBusy} onRemind={onRemind} />
              <Button
                size="sm"
                variant={step === 'approve' ? 'default' : 'secondary'}
                disabled={isBusy}
                onClick={onApprove}
                shortcut={<Kbd>{approveKey(step, isEditing)}</Kbd>}
              >
                {approveLabel(t, action, isReply)}
              </Button>
              {isReply && !isEditing && (
                <Button
                  size="sm"
                  variant="secondary"
                  disabled={isBusy}
                  onClick={onEdit}
                  shortcut={<Kbd>E</Kbd>}
                >
                  {t.queue.edit}
                </Button>
              )}
              {isReply && !isRewriting && (
                <Button
                  size="sm"
                  variant="ghost-muted"
                  disabled={isBusy}
                  onClick={() => onRewriteChange(true)}
                  shortcut={<Kbd>R</Kbd>}
                >
                  {t.queue.rewrite}
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
    </LeavingCard>
  )
}
