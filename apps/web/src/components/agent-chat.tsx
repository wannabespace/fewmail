import { useChat } from '@ai-sdk/react'
import {
  AGENT_TOOLS,
  parseSkill,
  SKILLS,
  UNDO_SEND_SECONDS,
} from '@fewmail/shared/agent'
import type {
  AgentToolName,
  ClearOutGroup,
  ConsentToolName,
  OpenThread,
  Skill,
} from '@fewmail/shared/agent'
import type { Messages } from '@fewmail/shared/i18n'
import { Bubble, BubbleContent } from '@fewmail/ui/components/bubble'
import { Button } from '@fewmail/ui/components/button'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@fewmail/ui/components/collapsible'
import {
  Command,
  CommandItem,
  CommandList,
  CommandShortcut,
} from '@fewmail/ui/components/command'
import { CopyIconButton } from '@fewmail/ui/components/custom/copy-button'
import { IconButton } from '@fewmail/ui/components/custom/icon-button'
import { InlineCode } from '@fewmail/ui/components/custom/inline-code'
import {
  InputGroup,
  InputGroupAddon,
  InputGroupTextarea,
} from '@fewmail/ui/components/input-group'
import { Kbd } from '@fewmail/ui/components/kbd'
import {
  Marker,
  MarkerContent,
  MarkerIcon,
} from '@fewmail/ui/components/marker'
import {
  Message,
  MessageContent,
  MessageFooter,
} from '@fewmail/ui/components/message'
import {
  MessageScroller,
  MessageScrollerButton,
  MessageScrollerContent,
  MessageScrollerItem,
  MessageScrollerProvider,
  MessageScrollerViewport,
  useMessageScroller,
  useMessageScrollerVisibility,
} from '@fewmail/ui/components/message-scroller'
import { Response } from '@fewmail/ui/components/response'
import { Spinner } from '@fewmail/ui/components/spinner'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@fewmail/ui/components/tooltip'
import { cn } from '@fewmail/ui/lib/utils'
import {
  Mic01Icon,
  StopIcon,
  CancelCircleIcon,
  News01Icon,
  Alert02Icon,
  ArrowRight01Icon,
  ArrowUp02Icon,
  Calendar03Icon,
  Cancel01Icon,
  Invoice03Icon,
  Mail01Icon,
  MailRemove01Icon,
  MailReply01Icon,
  PencilEdit02Icon,
  RefreshIcon,
  SlashIcon,
  StopCircleIcon,
  Sun03Icon,
  Tick02Icon,
  UserTime01Icon,
} from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import type { IconSvgElement } from '@hugeicons/react'
import { eventIteratorToUnproxiedDataStream } from '@orpc/client'
import { useHotkey } from '@tanstack/react-hotkeys'
import { useQueryClient } from '@tanstack/react-query'
import { Link } from '@tanstack/react-router'
import {
  getToolName,
  isToolUIPart,
  lastAssistantMessageIsCompleteWithApprovalResponses,
} from 'ai'
import type {
  ChatTransport,
  DynamicToolUIPart,
  ToolUIPart,
  UIMessage,
} from 'ai'
import { isSameDay, isToday, parseISO, subDays } from 'date-fns'
import type { ComponentProps, ReactNode } from 'react'
import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { createStore } from 'seitu'
import { toast } from 'sonner'

import { useDates, useT } from '~/lib/i18n'
import { client, limitText, orpc, refetchChanged } from '~/lib/orpc'
import { speakAloud, useVoice } from '~/lib/voice'

import { useCompose } from './compose/compose-context'
import { DraftText } from './queue-card'
import { useThread } from './thread-view'

type ToolPart = ToolUIPart | DynamicToolUIPart

interface Known {
  allDay?: boolean
  analysis?: { suggestedAction?: keyof Messages['rules']['effect'] | null }
  detail?: string | null
  email?: string
  end?: string
  fromEmail?: string
  fromName?: string | null
  id?: string
  instruction?: string
  kind?: string
  mailboxId?: string
  message?: Known
  messageId?: string | null
  name?: string
  start?: string
  subject?: string
  title?: string
}

interface ToolInput {
  actionId?: string
  allDay?: boolean
  cc?: string[]
  cron?: string
  description?: string
  effect?: keyof Messages['rules']['effect']
  end?: string
  groups?: ClearOutGroup[]
  id?: string
  instruction?: string
  location?: string
  mailboxId?: string
  messageId?: string
  messageIds?: string[]
  search?: string
  start?: string
  subject?: string
  text?: string
  title?: string
  to?: string[]
  until?: string
  when?: string
}

interface ConsentDetails {
  action?: Known
  calendar?: Known
  dates: ReturnType<typeof useDates>
  email?: Known
  /** What `input.id` names, from an earlier tool's output: the event, board or schedule. */
  target?: Known
  input: ToolInput
  tidy?: Known[]
  t: Messages
  text?: string | null
}

const transport: ChatTransport<UIMessage> = {
  reconnectToStream: () => Promise.resolve(null),
  sendMessages: async ({ abortSignal, chatId, messages }) => {
    const last = messages.at(-1)
    if (!last) {
      throw new Error('Nothing to send')
    }
    return eventIteratorToUnproxiedDataStream(
      await client.chats.send(
        {
          id: chatId,
          message: {
            id: last.id,
            parts: last.parts,
            role: last.role === 'user' ? 'user' : 'assistant',
          },
        },
        { signal: abortSignal }
      )
    )
  },
}

const findKnown = (
  value: unknown,
  matches: (known: Known) => boolean
): Known | undefined => {
  if (!value || typeof value !== 'object') {
    return undefined
  }
  if (matches(value as Known)) {
    return value as Known
  }
  for (const child of Object.values(value)) {
    const found = findKnown(child, matches)
    if (found) {
      return found
    }
  }
  return undefined
}

const toolOutputs = (messages: UIMessage[]) =>
  messages.flatMap((message) =>
    message.parts.flatMap((part) =>
      isToolUIPart(part) && part.state === 'output-available'
        ? [part.output]
        : []
    )
  )

const DRAFTS = new Set(['draft_reply', 'redraft_action'])
const SENDS = new Set(['approve_action', 'send_email'])
const STEP_OUTCOMES = ['failed', 'declined'] as const
const STEP_ICONS = {
  declined: Cancel01Icon,
  done: Tick02Icon,
  failed: Alert02Icon,
}

const SKILL_ICONS: Record<Skill, IconSvgElement> = {
  bills: Invoice03Icon,
  cancel: CancelCircleIcon,
  cleanup: MailRemove01Icon,
  followups: UserTime01Icon,
  reading: News01Icon,
  today: Sun03Icon,
  waiting: MailReply01Icon,
  week: Calendar03Icon,
}

const approvedHere = new Set<string>()

const stepState = (part: ToolPart, isAnswerable: boolean) => {
  switch (part.state) {
    case 'output-available': {
      return 'done'
    }
    case 'output-error': {
      return 'failed'
    }
    case 'output-denied': {
      return 'declined'
    }
    case 'approval-responded': {
      return part.approval.approved ? 'running' : 'declined'
    }
    case 'approval-requested': {
      return isAnswerable ? 'running' : 'declined'
    }
    default: {
      return 'running'
    }
  }
}

const useUndoToast = (part: ToolPart) => {
  const t = useT()
  const queryClient = useQueryClient()
  const { openCompose } = useCompose()
  const name = getToolName(part)

  useEffect(() => {
    if (
      part.state !== 'output-available' ||
      !SENDS.has(name) ||
      !approvedHere.delete(part.toolCallId)
    ) {
      return
    }
    const output = part.output as { id?: string; outboxId?: string | null }
    const outboxId = name === 'send_email' ? output.id : output.outboxId
    if (!outboxId) {
      return
    }
    toast.success(t.compose.sendingIn(UNDO_SEND_SECONDS), {
      action: {
        label: t.compose.undo,
        onClick: async () => {
          // The client's error toast already says it was sent.
          const restored = await client.mail
            .cancelSend({ id: outboxId })
            .catch(() => null)
          if (!restored) {
            return
          }
          void queryClient.invalidateQueries({ queryKey: orpc.today.key() })
          if (name === 'send_email') {
            openCompose(restored)
            toast(t.compose.canceled)
          } else {
            toast(t.compose.backInQueue)
          }
        },
      },
      duration: UNDO_SEND_SECONDS * 1000,
    })
  }, [name, openCompose, part, queryClient, t])
}

const EmailLine = ({ email }: { email?: Known }) =>
  email?.subject ? (
    <p data-mask className="text-muted-foreground truncate text-sm">
      {email.fromName ?? email.fromEmail} · {email.subject}
    </p>
  ) : null

const Recipients = ({ cc, to }: { cc?: string[]; to?: string[] }) => {
  const t = useT()

  return (
    <>
      {to && to.length > 0 && (
        <p data-mask className="text-muted-foreground text-sm">
          {t.agent.to(to.join(', '))}
        </p>
      )}
      {cc && cc.length > 0 && (
        <p data-mask className="text-muted-foreground text-sm">
          {t.agent.cc(cc.join(', '))}
        </p>
      )}
    </>
  )
}

const eventSpan = (
  dates: ReturnType<typeof useDates>,
  { allDay, end, start }: Known
) => {
  if (!start) {
    return ''
  }
  const from = parseISO(start)
  if (allDay) {
    const last = end ? subDays(parseISO(end), 1) : from
    return last > from
      ? `${dates.format(from, 'EEE PP')} – ${dates.format(last, 'EEE PP')}`
      : dates.format(from, 'EEE PP')
  }
  if (!end) {
    return dates.format(from, 'EEE PP p')
  }
  const to = parseISO(end)
  return `${dates.format(from, 'EEE PP p')} – ${dates.format(to, isSameDay(from, to) ? 'p' : 'EEE PP p')}`
}

const EventDetails = ({
  calendar,
  event,
  previous,
}: {
  calendar?: Known
  event: Known & { description?: string; location?: string }
  previous?: Known
}) => {
  const t = useT()
  const dates = useDates()

  return (
    <>
      {previous?.title && (
        <p data-mask className="text-muted-foreground text-sm line-through">
          {previous.title} · {eventSpan(dates, previous)}
        </p>
      )}
      <p className="text-sm">
        <span data-mask>{event.title}</span>
        <span className="text-muted-foreground" data-mask>
          {' · '}
          {eventSpan(dates, event)}
        </span>
      </p>
      {event.location && (
        <p data-mask className="text-muted-foreground text-sm">
          {event.location}
        </p>
      )}
      {event.description && (
        <p
          data-mask
          className="text-muted-foreground line-clamp-4 text-sm whitespace-pre-wrap"
        >
          {event.description}
        </p>
      )}
      {calendar?.email && (
        <p data-mask className="text-muted-foreground text-sm">
          {t.agent.calendar(calendar.email)}
        </p>
      )}
    </>
  )
}

/** Every input of a consent tool must show here, or the user says yes to something they cannot see. */
const CONSENT_DETAILS: Record<
  ConsentToolName,
  (details: ConsentDetails) => ReactNode
> = {
  approve_action: ({ action, email, text }) => (
    <>
      <EmailLine email={email} />
      {text ? (
        <>
          <Recipients to={email?.fromEmail ? [email.fromEmail] : undefined} />
          <DraftText text={text} />
        </>
      ) : (
        action?.title && (
          <p data-mask className="text-muted-foreground text-sm">
            {action.title}
          </p>
        )
      )}
    </>
  ),
  archive_thread: ({ email }) => <EmailLine email={email} />,
  clear_out: ({ input, t }) => (
    <p className="text-sm">
      {input.groups?.map((group) => t.clearOut.groups[group]).join(' · ')}
    </p>
  ),
  create_event: ({ calendar, input }) => (
    <EventDetails calendar={calendar} event={input} />
  ),
  create_rule: ({ input, t }) => (
    <p className="text-sm">
      <span data-mask>{input.instruction}</span>
      {input.effect && (
        <span className="text-muted-foreground">
          {' · '}
          {t.rules.effect[input.effect]}
        </span>
      )}
    </p>
  ),
  create_schedule: ({ input }) => (
    <>
      <p data-mask className="text-sm whitespace-pre-wrap">
        {input.instruction}
      </p>
      <p className="text-muted-foreground text-sm">
        <span data-mask>{input.when}</span> ·{' '}
        <InlineCode>{input.cron}</InlineCode>
      </p>
    </>
  ),
  delete_board: ({ target }) =>
    target?.name && (
      <p data-mask className="text-sm">
        {target.name}
      </p>
    ),
  delete_event: ({ calendar, target }) =>
    target && <EventDetails calendar={calendar} event={target} />,
  delete_schedule: ({ target }) =>
    target?.instruction && (
      <p data-mask className="text-sm whitespace-pre-wrap">
        {target.instruction}
      </p>
    ),
  send_email: ({ input }) => (
    <>
      <Recipients cc={input.cc} to={input.to} />
      {input.subject && (
        <p data-mask className="text-sm font-medium">
          {input.subject}
        </p>
      )}
      {input.text && <DraftText text={input.text} />}
    </>
  ),
  snooze_thread: ({ dates, email, input, t }) => (
    <>
      <EmailLine email={email} />
      {input.until && (
        <p className="text-muted-foreground text-sm">
          {t.agent.until(dates.format(new Date(input.until), 'EEE p'))}
        </p>
      )}
    </>
  ),
  mark_not_spam: ({ email }) => <EmailLine email={email} />,
  move_to_inbox: ({ email }) => <EmailLine email={email} />,
  report_spam: ({ email }) => <EmailLine email={email} />,
  trash_thread: ({ email }) => <EmailLine email={email} />,
  tidy_mail: ({ t, tidy }) =>
    tidy?.map(({ analysis, message }) => (
      <p key={message?.id} className="truncate text-sm">
        {analysis?.suggestedAction && t.rules.effect[analysis.suggestedAction]}
        <span data-mask className="text-muted-foreground">
          {' · '}
          {message?.fromName ?? message?.fromEmail} · {message?.subject}
        </span>
      </p>
    )),
  undo_clear_out: () => null,
  unsubscribe: ({ email }) => <EmailLine email={email} />,
  update_event: ({ calendar, input, target }) => (
    <EventDetails calendar={calendar} event={input} previous={target} />
  ),
}

const Confirmation = ({
  input,
  messages,
  name,
  onAnswer,
}: {
  input: ToolInput
  messages: UIMessage[]
  name: ConsentToolName
  onAnswer: (approved: boolean) => void
}) => {
  const t = useT()
  const dates = useDates()
  const outputs = toolOutputs(messages)
  const byId = (id: string | null | undefined) =>
    id ? findKnown(outputs, (known) => known.id === id) : undefined
  const action = byId(input.actionId)
  const email = byId(input.messageId ?? action?.messageId)
  const isReply = action?.kind === 'reply'
  const text = input.text ?? (isReply ? action?.detail : undefined)
  const key = name === 'approve_action' && text ? 'reply' : name

  useHotkey('Mod+Enter', () => onAnswer(true), { ignoreInputs: false })

  return (
    <div className="bg-popover ring-foreground/10 flex flex-col gap-3 rounded-2xl px-4.5 py-4 shadow-sm ring">
      <p className="text-sm font-medium">{t.agent.confirm[key]}</p>
      {CONSENT_DETAILS[name]({
        action,
        calendar: input.mailboxId
          ? findKnown(
              outputs,
              (known) => known.mailboxId === input.mailboxId && !!known.email
            )
          : undefined,
        dates,
        email,
        target: byId(input.id),
        input,
        t,
        text,
        tidy: input.messageIds?.flatMap(
          (id) => findKnown(outputs, (known) => known.message?.id === id) ?? []
        ),
      })}
      <div className="flex items-center gap-2">
        <Button size="sm" onClick={() => onAnswer(true)}>
          {t.agent.yes[key]} <Kbd>⌘⏎</Kbd>
        </Button>
        <Button size="sm" variant="ghost-muted" onClick={() => onAnswer(false)}>
          {t.agent.decline}
        </Button>
      </div>
    </div>
  )
}

const StepIcon = ({ state }: { state: ReturnType<typeof stepState> }) => (
  <MarkerIcon>
    {state === 'running' ? (
      <Spinner />
    ) : (
      <HugeiconsIcon icon={STEP_ICONS[state]} strokeWidth={2} />
    )}
  </MarkerIcon>
)

const StepLabel = ({
  part,
  state,
}: {
  part: ToolPart
  state: ReturnType<typeof stepState>
}) => {
  const t = useT()
  const input = (part.input ?? {}) as ToolInput
  const output = part.state === 'output-available' ? part.output : undefined
  return (
    <>
      {t.agent.steps[getToolName(part) as AgentToolName]}
      {input.search && <span data-mask> · {input.search}</span>}
      {Array.isArray(output) && ` · ${output.length}`}
      {state === 'declined' && ` · ${t.agent.declined}`}
    </>
  )
}

const ToolStep = ({
  isAnswerable,
  messages,
  onAnswer,
  part,
}: {
  isAnswerable: boolean
  messages: UIMessage[]
  onAnswer: (part: ToolPart, approved: boolean) => void
  part: ToolPart
}) => {
  const name = getToolName(part)
  const input = (part.input ?? {}) as ToolInput
  useUndoToast(part)

  if (part.state === 'approval-requested' && isAnswerable) {
    return (
      <Confirmation
        input={input}
        messages={messages}
        name={name as ConsentToolName}
        onAnswer={(approved) => onAnswer(part, approved)}
      />
    )
  }

  const state = stepState(part, isAnswerable)

  return (
    <Marker>
      <StepIcon state={state} />
      <MarkerContent>
        <StepLabel part={part} state={state} />
      </MarkerContent>
    </Marker>
  )
}

const draftOf = (part: ToolPart) =>
  DRAFTS.has(getToolName(part)) && part.state === 'output-available'
    ? (part.output as Known | undefined)?.detail
    : undefined

const StepGroup = ({
  isLive,
  parts,
  ...step
}: Omit<ComponentProps<typeof ToolStep>, 'part'> & {
  isLive: boolean
  parts: ToolPart[]
}) => {
  const t = useT()
  const states = parts.map((part) => stepState(part, step.isAnswerable))
  const last = parts.at(-1) as ToolPart
  const drafts = parts.flatMap((part) => {
    const draft = draftOf(part)
    return draft ? [<DraftText key={part.toolCallId} text={draft} />] : []
  })

  if (parts.length === 1 && !isLive) {
    return (
      <>
        <ToolStep part={last} {...step} />
        {drafts}
      </>
    )
  }

  const state = isLive
    ? 'running'
    : (STEP_OUTCOMES.find((outcome) => states.includes(outcome)) ?? 'done')

  return (
    <>
      <Collapsible>
        <Marker render={<CollapsibleTrigger />}>
          <StepIcon state={state} />
          <MarkerContent>
            {isLive ? (
              <StepLabel part={last} state={states.at(-1) ?? 'running'} />
            ) : (
              t.agent.stepCount(parts.length)
            )}
          </MarkerContent>
          <HugeiconsIcon
            icon={ArrowRight01Icon}
            strokeWidth={2}
            className="size-3.5 shrink-0 transition-transform group-aria-expanded/marker:rotate-90"
          />
        </Marker>
        <CollapsibleContent variant="disclosure" keepMounted className="ml-2">
          <div className="flex flex-col gap-2.5 pt-2.5">
            {parts.map((part) => (
              <ToolStep key={part.toolCallId} part={part} {...step} />
            ))}
          </div>
        </CollapsibleContent>
      </Collapsible>
      {drafts}
    </>
  )
}

const ThreadLink = ({ children, className, href }: ComponentProps<'a'>) => {
  const thread = new URLSearchParams(href?.split('?')[1]).get('thread')
  return thread ? (
    <Link
      to="/home"
      search={(prev) => ({ ...prev, thread })}
      className={cn(
        'data-[status=active]:bg-foreground/5 -mx-0.5 rounded-sm px-0.5',
        className
      )}
    >
      {children}
    </Link>
  ) : (
    <a href={href} target="_blank" rel="noreferrer" className={className}>
      {children}
    </a>
  )
}

const RESPONSE_COMPONENTS = { a: ThreadLink }

const useOpenThread = (thread: string | undefined) => {
  const { data } = useThread(thread)
  const latest =
    data?.messages.findLast(({ message }) => !message.isFromMe) ??
    data?.messages.at(-1)
  return thread && latest
    ? {
        from: latest.message.fromName ?? latest.message.fromEmail,
        messageId: latest.message.id,
        subject: latest.message.subject,
        threadId: thread,
      }
    : undefined
}

const ThreadChip = ({ thread }: { thread: OpenThread }) => (
  <Link
    to="/home"
    search={(prev) => ({ ...prev, thread: thread.threadId })}
    className="text-muted-foreground hover:text-foreground flex max-w-full items-center gap-1.5 self-end text-sm transition-colors"
  >
    <HugeiconsIcon icon={Mail01Icon} strokeWidth={2} className="size-4" />
    <span data-mask className="truncate">
      {thread.from}: {thread.subject}
    </span>
  </Link>
)

/** Asked from Home and the sidebar: Home starts a new chat and puts the caret in the composer. */
export const newChatStore = createStore<string | null>(null)

/** Home already is the `today` skill, so it is never suggested there. */
const SUGGESTED_SKILLS = SKILLS.filter((skill) => skill !== 'today')

const Suggestions = ({
  children,
  onPick,
}: {
  children: ReactNode
  onPick: (skill: Skill) => void
}) => {
  const t = useT()

  return (
    <div className="scroll-fade-x flex scrollbar-none gap-1.5 overflow-x-auto">
      {children}
      {SUGGESTED_SKILLS.map((skill) => (
        <Button
          key={skill}
          size="sm"
          variant="secondary"
          onClick={() => onPick(skill)}
        >
          <HugeiconsIcon icon={SKILL_ICONS[skill]} strokeWidth={2} />
          {t.skills[skill]}
        </Button>
      ))}
    </div>
  )
}

const SkillMenu = ({
  active,
  onPick,
  skills,
}: {
  active: Skill
  onPick: (skill: Skill) => void
  skills: Skill[]
}) => {
  const t = useT()

  return (
    <div className="bg-popover ring-foreground/6 absolute bottom-full left-0 mb-2 w-80 rounded-xl p-1 shadow-xl ring">
      <Command value={active} shouldFilter={false} variant="transparent">
        <CommandList>
          {skills.map((skill) => (
            <CommandItem
              key={skill}
              value={skill}
              onPointerDown={(event) => event.preventDefault()}
              onSelect={() => onPick(skill)}
            >
              <HugeiconsIcon icon={SKILL_ICONS[skill]} strokeWidth={2} />
              <span className="font-medium">/{skill}</span>
              <span className="text-muted-foreground truncate">
                {t.skills[skill]}
              </span>
              {skill === active && (
                <CommandShortcut>
                  <Kbd>⏎</Kbd>
                </CommandShortcut>
              )}
            </CommandItem>
          ))}
        </CommandList>
      </Command>
    </div>
  )
}

const UserBubble = ({ text }: { text: string }) => {
  const parsed = parseSkill(text)

  return parsed ? (
    <Bubble variant="tinted">
      <BubbleContent>
        <span className="flex items-center gap-2">
          <HugeiconsIcon
            icon={SKILL_ICONS[parsed.skill]}
            strokeWidth={2}
            className="size-4"
          />
          <span className="font-medium">/{parsed.skill}</span>
        </span>
        {parsed.details && (
          <p data-mask className="mt-1 whitespace-pre-wrap">
            {parsed.details}
          </p>
        )}
      </BubbleContent>
    </Bubble>
  ) : (
    <Bubble variant="secondary">
      <BubbleContent data-mask className="whitespace-pre-wrap">
        {text}
      </BubbleContent>
    </Bubble>
  )
}

const VoiceButton = ({
  isBusy,
  voice,
}: {
  isBusy: boolean
  voice: ReturnType<typeof useVoice>
}) => {
  const t = useT()
  const isRecording = voice.state === 'recording'

  return (
    <IconButton
      disabled={voice.state === 'hearing' || isBusy}
      icon={isRecording ? StopIcon : Mic01Icon}
      label={isRecording ? t.agent.voiceStop : t.agent.voice}
      shortcut={<Kbd>⌘⇧Space</Kbd>}
      size="icon-round"
      variant={isRecording ? 'destructive' : 'ghost-muted'}
      onClick={() => voice.toggle()}
    />
  )
}

const textOf = (message: UIMessage) =>
  message.parts
    .flatMap((part) => (part.type === 'text' ? [part.text] : []))
    .join('\n\n')

const MessageRail = ({ messages }: { messages: UIMessage[] }) => {
  const { scrollToMessage } = useMessageScroller()
  const { visibleMessageIds } = useMessageScrollerVisibility()
  const turns: { ids: string[]; question: UIMessage }[] = []
  for (const message of messages) {
    if (message.role === 'user') {
      turns.push({ ids: [message.id], question: message })
    } else {
      turns.at(-1)?.ids.push(message.id)
    }
  }

  return turns.length < 2 ? null : (
    <nav className="absolute top-1/2 right-3 flex max-h-[70%] -translate-y-1/2 scrollbar-none flex-col overflow-y-auto">
      {turns.map(({ ids, question }) => (
        <Tooltip key={question.id}>
          <TooltipTrigger
            render={
              <button
                type="button"
                className="group/rail flex cursor-pointer justify-end py-1 pl-3"
                onClick={() =>
                  scrollToMessage(question.id, {
                    align: 'start',
                    behavior: 'smooth',
                  })
                }
              >
                <span
                  className={cn(
                    'bg-foreground/15 group-hover/rail:bg-foreground/60 h-0.5 w-3 rounded-full transition-[width,background-color] group-hover/rail:w-5',
                    ids.some((id) => visibleMessageIds.includes(id)) &&
                      'bg-foreground/50'
                  )}
                />
                <span data-mask className="sr-only">
                  {textOf(question)}
                </span>
              </button>
            }
          />
          <TooltipContent side="left">
            <span data-mask className="line-clamp-2">
              {textOf(question)}
            </span>
          </TooltipContent>
        </Tooltip>
      ))}
    </nav>
  )
}

const MessageActions = ({
  message,
  onEdit,
  onRegenerate,
}: {
  message: UIMessage
  onEdit?: () => void
  onRegenerate?: () => void
}) => {
  const t = useT()
  const dates = useDates()
  const { createdAt } = (message.metadata ?? {}) as { createdAt?: number }
  const text = textOf(message)

  return (
    <MessageFooter>
      {createdAt && (
        <time
          dateTime={new Date(createdAt).toISOString()}
          className="px-1.5 font-normal tabular-nums group-data-[align=end]/message:order-last"
        >
          {dates.format(createdAt, isToday(createdAt) ? 'p' : 'd MMM, p')}
        </time>
      )}
      <div className="flex items-center gap-0.5 opacity-0 transition-opacity group-hover/message:opacity-100 focus-within:opacity-100 has-data-popup-open:opacity-100">
        {text && <CopyIconButton label={t.agent.copy} text={text} />}
        {onEdit && (
          <IconButton
            icon={PencilEdit02Icon}
            label={t.agent.edit}
            shortcut={<Kbd>↑</Kbd>}
            side="bottom"
            size="icon-xs"
            variant="ghost-muted"
            onClick={onEdit}
          />
        )}
        {onRegenerate && (
          <IconButton
            icon={RefreshIcon}
            label={t.agent.regenerate}
            side="bottom"
            size="icon-xs"
            variant="ghost-muted"
            onClick={onRegenerate}
          />
        )}
      </div>
    </MessageFooter>
  )
}

/** Hysteresis lives in the caller: once wide, the composer stays wide until emptied, or the row would flicker. */
const px = (value: string) => Number(value.replace('px', ''))

const wraps = (field: HTMLTextAreaElement) => {
  const style = getComputedStyle(field)
  const textHeight =
    field.scrollHeight - px(style.paddingTop) - px(style.paddingBottom)
  return textHeight > px(style.lineHeight) * 1.5
}

type Block =
  | { index: number; part: UIMessage['parts'][number] }
  | { index: number; steps: ToolPart[] }

const toBlocks = (parts: UIMessage['parts'], isAnswerable: boolean) => {
  const blocks: Block[] = []
  for (const [index, part] of parts.entries()) {
    const last = blocks.at(-1)
    if (
      isToolUIPart(part) &&
      !(part.state === 'approval-requested' && isAnswerable)
    ) {
      if (last && 'steps' in last) {
        last.steps.push(part)
      } else {
        blocks.push({ index, steps: [part] })
      }
    } else if (
      isToolUIPart(part) ||
      part.type === 'data-thread' ||
      (part.type === 'text' && part.text.trim())
    ) {
      blocks.push({ index, part })
    }
  }
  return blocks
}

const MessageParts = ({
  isBusy,
  isLast,
  message,
  ...props
}: Omit<ComponentProps<typeof ToolStep>, 'isAnswerable' | 'part'> & {
  isBusy: boolean
  isLast: boolean
  message: UIMessage
}) => {
  const step = { ...props, isAnswerable: isLast && !isBusy }
  const blocks = toBlocks(message.parts, step.isAnswerable)
  return blocks.map((block, index) => {
    const key = `${message.id}-${block.index}`
    if ('steps' in block) {
      return (
        <StepGroup
          key={key}
          parts={block.steps}
          isLive={isBusy && isLast && index === blocks.length - 1}
          {...step}
        />
      )
    }
    const { part } = block
    if (part.type === 'data-thread') {
      return <ThreadChip key={key} thread={part.data as OpenThread} />
    }
    if (part.type === 'text' && message.role === 'user') {
      return <UserBubble key={key} text={part.text} />
    }
    if (part.type === 'text') {
      return (
        <div key={key} data-mask>
          <Response variant="reading" components={RESPONSE_COMPONENTS}>
            {part.text}
          </Response>
        </div>
      )
    }
    return isToolUIPart(part) ? (
      <ToolStep key={key} part={part} {...step} />
    ) : null
  })
}

/** Only before the first step: after it, the live step line already says what the agent is doing. */
const Thinking = ({ last }: { last?: UIMessage }) => {
  const t = useT()
  return last?.role === 'user' ? (
    <MessageScrollerItem>
      <Marker render={<output />}>
        <MarkerIcon>
          <Spinner />
        </MarkerIcon>
        <MarkerContent>{t.agent.thinking}</MarkerContent>
      </Marker>
    </MessageScrollerItem>
  ) : null
}

/** Docked under Home: the conversation grows upward over the page while the composer stays put. */
export const AgentChat = ({
  autoFocus,
  chatId,
  header,
  initialMessages,
  onFocusChange,
  onSend,
  panel,
  thread,
  waiting,
}: {
  autoFocus: boolean
  chatId: string
  header: ReactNode
  initialMessages: UIMessage[]
  onFocusChange: (isFocused: boolean) => void
  onSend: () => void
  /** Where the conversation shows; none while the chat is closed. */
  panel: HTMLElement | null
  thread: string | undefined
  waiting: ReactNode
}) => {
  const t = useT()
  const [text, setText] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [skillIndex, setSkillIndex] = useState(0)
  const [isExpanded, setIsExpanded] = useState(false)
  const [dismissedText, setDismissedText] = useState<string | null>(null)
  const [detachedThread, setDetachedThread] = useState<string>()
  const composerRef = useRef<HTMLTextAreaElement>(null)
  /** The turn the user spoke is answered aloud too. */
  const isSpokenTurn = useRef(false)
  const openThread = useOpenThread(thread)
  const attached = thread === detachedThread ? undefined : openThread
  const {
    addToolApprovalResponse,
    error,
    messages,
    regenerate,
    sendMessage,
    status,
    stop,
  } = useChat({
    id: chatId,
    messages: initialMessages,
    onFinish: ({ message }) => {
      if (isSpokenTurn.current) {
        isSpokenTurn.current = false
        void speakAloud(textOf(message))
      }
      refetchChanged(
        message.parts.some(
          (part) =>
            isToolUIPart(part) &&
            AGENT_TOOLS[getToolName(part) as AgentToolName] !== 'read'
        )
          ? null
          : ['chats', 'me']
      )
    },
    sendAutomaticallyWhen: lastAssistantMessageIsCompleteWithApprovalResponses,
    transport,
  })
  const isBusy = status === 'submitted' || status === 'streaming'
  const lastId = messages.at(-1)?.id
  const lastUser = messages.findLast((message) => message.role === 'user')
  const canRegenerate = !isBusy && messages.at(-1)?.role === 'assistant'
  const skills =
    /^\/[a-z_]*$/u.test(text) && text !== dismissedText
      ? SKILLS.filter((name) => name.startsWith(text.slice(1)))
      : []
  const activeSkill = skills[skillIndex % skills.length]

  const pick = (name: Skill) => {
    setText(`/${name} `)
    composerRef.current?.focus()
  }
  const edit = (message: UIMessage) => {
    setEditingId(message.id)
    setText(textOf(message))
    composerRef.current?.focus()
  }
  const reset = () => {
    setText('')
    setIsExpanded(false)
    setEditingId(null)
  }
  const send = (spoken?: string) => {
    const value = spoken ?? text.trim()
    if (!value || isBusy) {
      return
    }
    onSend()
    void sendMessage({
      messageId: editingId ?? undefined,
      metadata: { createdAt: Date.now() },
      parts: [
        ...(attached ? [{ data: attached, type: 'data-thread' as const }] : []),
        { text: value, type: 'text' as const },
      ],
    })
    reset()
  }
  /** The `/` menu takes arrows, Tab or Enter (pick) and Escape (close) from the composer. */
  const navigateSkills = (key: string, active: Skill) => {
    if (key === 'ArrowDown' || key === 'ArrowUp') {
      setSkillIndex(
        (index) => index + (key === 'ArrowDown' ? 1 : skills.length - 1)
      )
    } else if (key === 'Tab' || key === 'Enter') {
      pick(active)
    } else if (key === 'Escape') {
      setDismissedText(text)
    } else {
      return false
    }
    return true
  }
  /** Escape is a ladder here: the menu above, then the edit, then giving the page its keys back. */
  const handleComposerKey = (key: string) => {
    if (key === 'Escape' && editingId) {
      reset()
    } else if (key === 'Escape') {
      composerRef.current?.blur()
    } else if (key === 'ArrowUp' && !text && lastUser && !isBusy) {
      edit(lastUser)
    } else {
      return false
    }
    return true
  }
  const answer = (part: ToolPart, approved: boolean) => {
    if (part.state !== 'approval-requested') {
      return
    }
    if (approved) {
      approvedHere.add(part.toolCallId)
    }
    void addToolApprovalResponse({ approved, id: part.approval.id })
  }

  useHotkey(
    'Escape',
    () => {
      void stop()
    },
    {
      enabled: isBusy,
      ignoreInputs: false,
    }
  )
  const voice = useVoice((heard) => {
    isSpokenTurn.current = true
    send(heard)
  })
  useHotkey('Mod+Shift+Space', voice.toggle, { ignoreInputs: false })
  useHotkey('/', () => composerRef.current?.focus())
  const composer = (
    <div className="flex flex-col gap-2">
      <form
        className="relative"
        onSubmit={(event) => {
          event.preventDefault()
          send()
        }}
      >
        {activeSkill && (
          <SkillMenu active={activeSkill} skills={skills} onPick={pick} />
        )}
        <InputGroup variant="composer" data-expanded={isExpanded}>
          {attached && (
            <InputGroupAddon align="block-start">
              <HugeiconsIcon icon={Mail01Icon} strokeWidth={2} />
              <span data-mask className="min-w-0 truncate">
                {attached.from}: {attached.subject}
              </span>
              <IconButton
                className="ml-auto"
                icon={Cancel01Icon}
                label={t.agent.detach}
                size="icon-xs"
                variant="ghost-muted"
                onClick={() => setDetachedThread(thread)}
              />
            </InputGroupAddon>
          )}
          {editingId && (
            <InputGroupAddon align="block-start">
              <HugeiconsIcon icon={PencilEdit02Icon} strokeWidth={2} />
              {t.agent.editing}
              <IconButton
                className="ml-auto"
                icon={Cancel01Icon}
                label={t.agent.cancelEdit}
                shortcut={<Kbd>esc</Kbd>}
                size="icon-xs"
                variant="ghost-muted"
                onClick={reset}
              />
            </InputGroupAddon>
          )}
          <InputGroupTextarea
            ref={composerRef}
            autoFocus={autoFocus || !!panel}
            aria-label={t.agent.placeholder}
            placeholder={t.agent.placeholder}
            rows={1}
            value={text}
            onFocus={() => onFocusChange(true)}
            onBlur={() => onFocusChange(false)}
            onChange={(event) => {
              setText(event.target.value)
              setSkillIndex(0)
              setIsExpanded(
                event.target.value !== '' && (isExpanded || wraps(event.target))
              )
            }}
            onKeyDown={(event) => {
              if (
                (activeSkill && navigateSkills(event.key, activeSkill)) ||
                handleComposerKey(event.key)
              ) {
                event.preventDefault()
                return
              }
              if (
                event.key === 'Enter' &&
                !event.shiftKey &&
                !event.metaKey &&
                !event.nativeEvent.isComposing
              ) {
                event.preventDefault()
                send()
              }
            }}
          />
          <InputGroupAddon align="inline-start">
            <IconButton
              icon={SlashIcon}
              label={t.agent.skills}
              size="icon-round"
              variant="ghost-muted"
              onClick={() => {
                setText('/')
                setDismissedText(null)
                composerRef.current?.focus()
              }}
            />
          </InputGroupAddon>
          <InputGroupAddon align="inline-end">
            <VoiceButton isBusy={isBusy} voice={voice} />
            {isBusy ? (
              <IconButton
                icon={StopCircleIcon}
                label={t.agent.stop}
                shortcut={<Kbd>esc</Kbd>}
                size="icon-round"
                variant="secondary"
                onClick={() => {
                  void stop()
                }}
              />
            ) : (
              <IconButton
                disabled={!text.trim()}
                icon={ArrowUp02Icon}
                label={t.agent.send}
                shortcut={<Kbd>⏎</Kbd>}
                size="icon-round"
                type="submit"
              />
            )}
          </InputGroupAddon>
        </InputGroup>
      </form>
      <Suggestions onPick={(skill) => send(`/${skill}`)}>{waiting}</Suggestions>
    </div>
  )
  if (!panel) {
    return composer
  }
  return createPortal(
    <>
      {header}
      <MessageScrollerProvider autoScroll>
        <MessageScroller>
          <MessageScrollerViewport>
            <MessageScrollerContent className="w-full px-5 pt-4 pb-3">
              {messages.map((message) => (
                <MessageScrollerItem key={message.id} messageId={message.id}>
                  <Message align={message.role === 'user' ? 'end' : 'start'}>
                    <MessageContent>
                      <MessageParts
                        message={message}
                        messages={messages}
                        isBusy={isBusy}
                        isLast={message.id === lastId}
                        onAnswer={answer}
                      />
                      {!(isBusy && message.id === lastId) && (
                        <MessageActions
                          message={message}
                          onEdit={
                            message.role === 'user' && !isBusy
                              ? () => edit(message)
                              : undefined
                          }
                          onRegenerate={
                            canRegenerate && message.id === lastId
                              ? () => {
                                  void regenerate()
                                }
                              : undefined
                          }
                        />
                      )}
                    </MessageContent>
                  </Message>
                </MessageScrollerItem>
              ))}
              {status === 'submitted' && <Thinking last={messages.at(-1)} />}
              {error && (
                <MessageScrollerItem>
                  <Marker role="alert">
                    <MarkerIcon>
                      <HugeiconsIcon icon={Alert02Icon} strokeWidth={2} />
                    </MarkerIcon>
                    <MarkerContent>
                      {limitText(error) ?? t.agent.failed}
                    </MarkerContent>
                    {!limitText(error) && (
                      <Button
                        size="xs"
                        variant="ghost-muted"
                        onClick={() => {
                          void regenerate()
                        }}
                      >
                        {t.agent.retry}
                      </Button>
                    )}
                  </Marker>
                </MessageScrollerItem>
              )}
            </MessageScrollerContent>
          </MessageScrollerViewport>
          <MessageRail messages={messages} />
          <MessageScrollerButton />
        </MessageScroller>
      </MessageScrollerProvider>
      <div className="px-4 pb-4">{composer}</div>
    </>,
    panel
  )
}
