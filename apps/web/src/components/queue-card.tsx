import type { RouterOutputs } from '@fewmail/api/router'
import {
  cardPayload,
  hostOf,
  IMPORTANCE,
  listSearch,
  sendsDraft,
  UNDO_SEND_SECONDS,
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
import { useRowFold } from '@fewmail/ui/components/custom/settings-group'
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from '@fewmail/ui/components/input-group'
import { Kbd } from '@fewmail/ui/components/kbd'
import { cn } from '@fewmail/ui/lib/utils'
import {
  Calendar03Icon,
  LinkSquare02Icon,
  NextIcon,
  Tick02Icon,
} from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { useHotkey } from '@tanstack/react-hotkeys'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Link } from '@tanstack/react-router'
import { motion } from 'motion/react'
import { useEffect, useRef, useState } from 'react'
import type { ReactNode, RefObject } from 'react'
import { toast } from 'sonner'

import { queueCards } from '~/lib/home-db'
import { useDates, useT } from '~/lib/i18n'
import { useHasAgent } from '~/lib/me'
import { client, orpc } from '~/lib/orpc'
import { showUntilSettled } from '~/lib/query-client'
import { holdClicksUntilMove } from '~/lib/still-pointer'
import { pendingToast, runUndo, toastUndo } from '~/lib/undo'

import type { ComposerEditorHandle } from './composer/composer-editor'
import { ComposerEditor } from './composer/composer-editor'
import { ConsentDetails } from './consent-details'
import { ImportanceDot, ROW_SWAP } from './mail-meta'
import type { RowPlace } from './pane-rows'
import { SenderAvatar } from './sender-avatar'
import { useWithAgent } from './upgrade-dialog'

export type QueueItem = RouterOutputs['today']['get']['queue'][number]
type Action = QueueItem['action']

export const cardHeadlineOf = ({ action, analysis, message }: QueueItem) => {
  if (action.kind === 'commitment' || action.kind === 'heads_up') {
    return action.detail ?? action.title
  }
  if (action.kind === 'cleanup' || action.kind === 'consent') {
    return action.title
  }
  return analysis?.summary ?? message?.subject ?? action.title
}

/** Whom the card is about: your own promise names whom you promised (its `reason`), never you, the sender of your mail. */
export const whoOf = ({ action, message }: QueueItem) =>
  action.kind === 'commitment' && action.reason
    ? { fromEmail: action.reason, fromName: null }
    : message

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

/** What the card asks, never its yes: "I paid it" there repeats the ✓ beside it. A link that does the card's own kind keeps the kind's word, so one kind reads the same on every card. */
export const foldedVerb = (t: Messages, action: Action) => {
  if (sendsDraft(action)) {
    return t.queue.send
  }
  const { event, link, tool } = cardPayload(action)
  if (tool || event) {
    return approveTitle(t, action)
  }
  return link && link.purpose !== action.kind
    ? t.actionLink[link.purpose]
    : t.actionKind[action.kind]
}

const QuickActions = ({
  action,
  isOpen,
  isSelected,
  onApprove,
  onSkip,
}: {
  action: Action
  isOpen: boolean
  isSelected: boolean
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
  isNew,
  isOpen,
  isPicked,
  isSelected,
  item,
  onApprove,
  onPick,
  onSkip,
}: {
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
  const { action, analysis, message } = item
  const who = whoOf(item)

  return (
    <AccordionTrigger
      trailing={
        <>
          <span className={cn(ROW_SWAP, 'mr-3')}>
            <span className="text-muted-foreground flex flex-col items-end gap-0.5 text-xs leading-5 whitespace-nowrap group-hover:opacity-0 group-has-data-popup-open:opacity-0">
              <span className="flex items-center gap-2">
                {message && dates.fromNow(message.receivedAt)}
                {analysis && analysis.importance >= IMPORTANCE.critical && (
                  <ImportanceDot
                    importance={analysis.importance}
                    reason={action.reason || analysis.reason}
                  />
                )}
              </span>
              {!isOpen && <span>{foldedVerb(t, action)}</span>}
            </span>
            <QuickActions
              action={action}
              isOpen={isOpen}
              isSelected={isSelected}
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
      {who && action.kind !== 'cleanup' ? (
        <SenderAvatar sender={who} size="sm" />
      ) : (
        <span className="size-6 shrink-0" />
      )}
      <span className="flex min-w-0 flex-1 flex-col gap-0.5">
        <span className="flex items-center gap-2">
          <span data-mask className="truncate font-medium">
            {action.kind === 'cleanup'
              ? 'Fewmail'
              : (who?.fromName ?? who?.fromEmail ?? 'Fewmail')}
          </span>
          {isNew && (
            <span className="bg-primary size-1.5 shrink-0 rounded-full">
              <span className="sr-only">{t.queue.new}</span>
            </span>
          )}
        </span>
        <span
          data-mask
          className={cn(
            'truncate',
            action.kind === 'security'
              ? 'text-destructive'
              : 'text-muted-foreground'
          )}
        >
          {cardHeadlineOf(item)}
        </span>
      </span>
    </AccordionTrigger>
  )
}

/** A settled row folds out and the rows below rise into its place, the next one opening as it comes. */
const LeavingCard = ({
  children,
  place,
}: {
  children: ReactNode
  place: RowPlace
}) => {
  const { isLeaving, isScrolledPast, motionProps } = useRowFold(place.rowKey)
  return (
    <motion.div
      {...motionProps}
      // A leaving card's index is stale, so the virtualizer stops measuring it (-1 is out of range).
      data-index={isLeaving ? -1 : place['data-index']}
      ref={isLeaving ? undefined : place.ref}
      hidden={isScrolledPast}
      className={cn(isLeaving && 'pointer-events-none overflow-hidden')}
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

/**
 * The draft and the rewrite field, under the email it answers. The draft is its own editor, so a click edits it where
 * it lands. Keyed by the agent's draft, so a rewrite replaces what the editor holds.
 */
const ReplyBody = ({
  draft,
  editorRef,
  hasAgent,
  isRewriting,
  message,
  onApprove,
  onDraftChange,
  onEdit,
  onRewrite,
  onRewriteChange,
  onStopEditing,
  savedDraft,
}: {
  draft: string
  editorRef: RefObject<ComposerEditorHandle | null>
  hasAgent: boolean
  isRewriting: boolean
  message: QueueItem['message']
  onApprove: () => void
  onDraftChange: (draft: string) => void
  onEdit: () => void
  onRewrite: (instruction: string) => void
  onRewriteChange: (isRewriting: boolean) => void
  onStopEditing: () => void
  savedDraft: string | null
}) => {
  const t = useT()

  return (
    <>
      <div
        className="bg-secondary/60 focus-within:ring-ring/50 cursor-text rounded-xl px-4 py-3 ring-0 focus-within:ring-2"
        onFocus={onEdit}
        onBlur={onStopEditing}
      >
        <ComposerEditor
          key={savedDraft}
          ref={editorRef}
          aria-label={t.actionKind.reply}
          placeholder={t.compose.placeholder}
          initialHtml={textToHtml(draft)}
          onChange={({ text }) => onDraftChange(text)}
          onSubmit={onApprove}
          onEscape={() =>
            (document.activeElement as HTMLElement | null)?.blur()
          }
          complete={completerFor(hasAgent, message)}
        />
      </div>
      {isRewriting && (
        <RewriteField
          onCancel={() => onRewriteChange(false)}
          onSubmit={onRewrite}
        />
      )}
    </>
  )
}

/** Why the card is here: the agent's reason, and the user's bot when one made it. */
const Why = ({ item: { action, analysis, bot } }: { item: QueueItem }) => {
  const t = useT()
  const why = [
    // A promise's `reason` is whom it was made to, already the card's name (`whoOf`).
    (action.kind === 'commitment' ? null : action.reason) || analysis?.reason,
    bot && t.today.journal.byBot(bot),
  ].filter(Boolean)
  return (
    why.length > 0 && (
      <p
        data-mask
        className={cn(
          'text-sm',
          action.kind === 'security'
            ? 'text-destructive'
            : 'text-muted-foreground'
        )}
      >
        {why.join(' · ')}
      </p>
    )
  )
}

/** Over the draft: who the reply goes to and why it was drafted. Only the addresses shorten, so the rest never cuts mid-word. */
const ReplyMeta = ({ item: { message, bot } }: { item: QueueItem }) => {
  const t = useT()
  return (
    message && (
      <p className="text-muted-foreground flex min-w-0 gap-1 text-xs whitespace-nowrap">
        <span data-mask className="truncate">
          {t.agent.to(replyRecipients(message).join(', '))}
        </span>
        <span>· {t.queue.draftedInVoice}</span>
        {bot && (
          <span data-mask className="truncate">
            · {t.today.journal.byBot(bot)}
          </span>
        )}
      </p>
    )
  )
}

/**
 * A row of Home's list. One with an email opens it in the sidebar, the proposal under it (`CardProposal`); one without
 * (an agent request, a clean-up, a promise) unfolds in place.
 */
export const QueueCard = ({
  isNew,
  isOpen,
  isPicked,
  isSelected,
  item,
  onApprove,
  onPick,
  onSkip,
  place,
}: {
  isNew: boolean
  isOpen: boolean
  isPicked: boolean
  isSelected: boolean
  item: QueueItem
  onApprove: () => void
  onPick: () => void
  onSkip: () => void
  place: RowPlace
}) => {
  const t = useT()
  const { action } = item
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (isSelected) {
      ref.current?.scrollIntoView({ block: 'nearest' })
    }
  }, [isSelected])

  return (
    <LeavingCard place={place}>
      <AccordionItem
        ref={ref}
        value={action.id}
        tone={action.kind === 'security' ? 'destructive' : 'default'}
        active={isSelected}
        className="group"
      >
        <QueueCardHeader
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
          <div className="flex flex-col gap-3 pl-9.5">
            {action.kind === 'cleanup' && <CleanupList action={action} />}
            {action.kind === 'consent' && <ConsentBody action={action} />}
            {action.kind !== 'cleanup' && <Why item={item} />}
            <div className="flex flex-wrap items-center gap-2">
              <Button size="sm" onClick={onApprove} shortcut={<Kbd>⏎</Kbd>}>
                {approveTitle(t, action)}
              </Button>
            </div>
          </div>
        </AccordionContent>
      </AccordionItem>
    </LeavingCard>
  )
}

const ADD_EVENT_TOAST = 'add-event'

/** Approving, skipping and redrafting a card, with their toasts: Home's list and the sidebar's proposal settle cards alike. */
export const useCardActions = () => {
  const t = useT()
  const queryClient = useQueryClient()
  const refresh = () =>
    Promise.all([
      queryClient.invalidateQueries({ queryKey: orpc.today.key() }),
      queryClient.invalidateQueries({ queryKey: orpc.mail.key() }),
    ])
  const sent = (outboxIds: string[], toastId: string, done: string) => {
    if (outboxIds.length === 0) {
      toast.success(done, { id: toastId })
      return
    }
    toast.success(t.compose.sendingIn(UNDO_SEND_SECONDS), {
      action: {
        label: t.compose.undo,
        onClick: async () => {
          // The client's error toast already says it was sent.
          const canceled = await runUndo(() =>
            Promise.all(
              outboxIds.map((id) =>
                client.mail.cancelSend({ id }).catch(() => null)
              )
            )
          )
          if (canceled.some(Boolean)) {
            void refresh()
            toast(t.compose.backInQueue)
          }
        },
      },
      duration: UNDO_SEND_SECONDS * 1000,
      id: toastId,
    })
  }
  const skipped = (ids: string[]) =>
    toastUndo(
      ids.length === 1 ? t.telegram.skipped : t.queue.skipped(ids.length),
      () =>
        Promise.all(ids.map((id) => client.actions.restore({ id }))).finally(
          refresh
        ),
      ids.join(',')
    )
  // A card's work can take seconds (leaving a list, a Gmail change): the toast says so until it is done.
  const leave = (ids: string[]) => {
    holdClicksUntilMove()
    toast.loading(t.today.working, { id: ids.join(',') })
    return showUntilSettled(() => queueCards.delete(ids))
  }
  const settleLeft = (
    _: unknown,
    __: unknown,
    ___: unknown,
    settle?: (refetched: Promise<unknown>) => void
  ) => settle?.(refresh())
  const approve = useMutation(
    orpc.actions.approve.mutationOptions({
      onError: (_, { id }) => toast.dismiss(id),
      onMutate: ({ id }) => leave([id]),
      onSettled: settleLeft,
      onSuccess: ({ outboxId }, { id }) =>
        sent(outboxId ? [outboxId] : [], id, t.today.done),
    })
  )
  const approveMany = useMutation(
    orpc.actions.approveMany.mutationOptions({
      onError: (_, { ids }) => toast.dismiss(ids.join(',')),
      onMutate: ({ ids }) => leave(ids),
      onSettled: settleLeft,
      onSuccess: ({ approved, outboxIds }, { ids }) =>
        sent(outboxIds, ids.join(','), t.today.approvedMany(approved)),
    })
  )
  const skip = useMutation({
    meta: { event: 'cards_skipped' },
    mutationFn: (ids: string[]) =>
      Promise.all(ids.map((id) => client.actions.dismiss({ id }))),
    onError: (_, ids) => toast.dismiss(ids.join(',')),
    onMutate: leave,
    onSettled: settleLeft,
    onSuccess: (_, ids) => skipped(ids),
  })
  const redraft = useMutation(
    orpc.actions.redraft.mutationOptions({
      onMutate: ({ id }) => {
        toast.loading(t.compose.writing, { id: `redraft-${id}` })
      },
      onSettled: (_action, _error, { id }) => toast.dismiss(`redraft-${id}`),
      onSuccess: refresh,
    })
  )
  const addEvent = useMutation(
    orpc.actions.addEvent.mutationOptions({
      onError: pendingToast(ADD_EVENT_TOAST).onError,
      // The button leaves on the press, so a second press never adds the meeting twice.
      onMutate: ({ id }) => {
        pendingToast(ADD_EVENT_TOAST).onMutate()
        return showUntilSettled(() => {
          if (queueCards.has(id)) {
            queueCards.update(id, (card) => {
              card.action = {
                ...card.action,
                payload: { ...card.action.payload, event: undefined },
              }
            })
          }
        })
      },
      onSettled: (_, __, ___, settle) =>
        settle?.(
          Promise.all([
            refresh(),
            queryClient.invalidateQueries({ queryKey: orpc.calendar.key() }),
          ])
        ),
      onSuccess: () => toast.success(t.calendar.saved, { id: ADD_EVENT_TOAST }),
    })
  )
  const addEventOf = (id: string) => addEvent.mutate({ id })
  return { addEventOf, approve, approveMany, redraft, refresh, skip }
}

const PROPOSAL_BOX =
  'bg-popover ring-foreground/6 flex flex-col gap-3 rounded-2xl p-4 shadow-sm ring'

/**
 * What the agent proposes for an email, under it in the sidebar: the draft or the step, the yes, Skip, and Home's keys
 * for them. `R` (the thread's reply key) edits the draft through `isEditing`.
 */
export const CardProposal = ({
  isEditing,
  item,
  onEdit,
  onStopEditing,
}: {
  isEditing: boolean
  item: QueueItem
  onEdit: () => void
  onStopEditing: () => void
}) => {
  const t = useT()
  const hasAgent = useHasAgent()
  const withAgent = useWithAgent()
  const editorRef = useRef<ComposerEditorHandle>(null)
  const { action, message } = item
  const isReply = sendsDraft(action)
  const step = primaryStep(action)
  const [draft, setDraft] = useState(action.detail ?? '')
  const [isRewriting, setIsRewriting] = useState(false)
  const { addEventOf, approve, redraft, skip } = useCardActions()
  const isBusy = redraft.isPending || approve.isPending
  const yes = () =>
    approve.mutate({
      id: action.id,
      ...(draft !== action.detail && { detail: draft }),
    })
  const remind = () =>
    withAgent('drafts', () => redraft.mutate({ id: action.id }))
  const rewrite = (instruction: string) => {
    setIsRewriting(false)
    withAgent('drafts', () => redraft.mutate({ id: action.id, instruction }))
  }
  const runStep = () => {
    if (step === 'link') {
      openCardLink(action)
    } else if (step === 'remind') {
      remind()
    } else if (!isReply) {
      yes()
    }
  }
  const keys = { enabled: !isEditing && !isRewriting && !isBusy }
  useHotkey('Enter', runStep, keys)
  useHotkey('Mod+Enter', yes, { enabled: keys.enabled && isReply })
  useHotkey('M', yes, { enabled: keys.enabled && step !== 'approve' })
  useHotkey('S', () => skip.mutate([action.id]), keys)
  useHotkey('L', () => addEventOf(action.id), {
    enabled: keys.enabled && !!cardPayload(action).event,
  })
  // A click already put the caret where it landed; only `R` brings the focus in.
  useEffect(() => {
    if (
      isEditing &&
      !(document.activeElement as HTMLElement | null)?.isContentEditable
    ) {
      editorRef.current?.focus()
    }
  }, [isEditing])

  return (
    <section className={PROPOSAL_BOX}>
      {isReply && <ReplyMeta item={item} />}
      {isReply ? (
        <ReplyBody
          draft={draft}
          editorRef={editorRef}
          hasAgent={hasAgent}
          isRewriting={isRewriting}
          message={message}
          onApprove={yes}
          onDraftChange={setDraft}
          onEdit={onEdit}
          onRewrite={rewrite}
          onRewriteChange={setIsRewriting}
          onStopEditing={onStopEditing}
          savedDraft={action.detail}
        />
      ) : (
        // A security card's reason is the risk warning the thread already shows over the email.
        action.kind !== 'security' && <Why item={item} />
      )}
      <div className="flex flex-wrap items-center gap-2">
        <StepButton action={action} isBusy={isBusy} onRemind={remind} />
        <Button
          size="sm"
          variant={step === 'approve' ? 'default' : 'secondary'}
          disabled={isBusy}
          onClick={yes}
          shortcut={<Kbd>{approveKey(step, isEditing || isReply)}</Kbd>}
        >
          {approveLabel(t, action, isReply)}
        </Button>
        {isReply && !isRewriting && (
          <Button
            size="sm"
            variant="ghost-muted"
            disabled={isBusy}
            onClick={() => setIsRewriting(true)}
          >
            {t.queue.rewrite}
          </Button>
        )}
        <Button
          size="sm"
          variant="ghost-muted"
          onClick={() => skip.mutate([action.id])}
          shortcut={<Kbd>S</Kbd>}
        >
          {t.queue.skip}
        </Button>
        {isReply && cardPayload(action).event && (
          <Button
            size="sm"
            variant="ghost-muted"
            onClick={() => addEventOf(action.id)}
            shortcut={<Kbd>L</Kbd>}
          >
            <HugeiconsIcon icon={Calendar03Icon} strokeWidth={2} />
            {t.queue.addToCalendar}
          </Button>
        )}
      </div>
    </section>
  )
}
