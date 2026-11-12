import { useChat } from '@ai-sdk/react'
import { parseSkill, SKILLS, UNDO_SEND_SECONDS } from '@fewmail/shared/agent'
import type { Skill } from '@fewmail/shared/agent'
import type { Messages } from '@fewmail/shared/i18n'
import { Bubble, BubbleContent } from '@fewmail/ui/components/bubble'
import { Button } from '@fewmail/ui/components/button'
import {
  Command,
  CommandItem,
  CommandList,
  CommandShortcut,
} from '@fewmail/ui/components/command'
import { CopyIconButton } from '@fewmail/ui/components/custom/copy-button'
import { IconButton } from '@fewmail/ui/components/custom/icon-button'
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
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
} from '@fewmail/ui/components/message-scroller'
import { Response } from '@fewmail/ui/components/response'
import { Spinner } from '@fewmail/ui/components/spinner'
import { cn } from '@fewmail/ui/lib/utils'
import {
  Alert02Icon,
  ArrowUp02Icon,
  Calendar03Icon,
  Cancel01Icon,
  Invoice03Icon,
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
import { isToday, parseISO } from 'date-fns'
import type { ComponentProps } from 'react'
import { useEffect, useRef, useState } from 'react'
import { toast } from 'sonner'

import { useDates, useT } from '~/lib/i18n'
import { client, limitText, orpc } from '~/lib/orpc'

import { useCompose } from './compose/compose-context'
import { DraftText } from './queue-card'

type ToolPart = ToolUIPart | DynamicToolUIPart
type ConfirmKey = keyof Messages['agent']['confirm']
type StepKey = keyof Messages['agent']['steps']

interface Known {
  detail?: string | null
  fromEmail?: string
  fromName?: string | null
  kind?: string
  subject?: string
  title?: string
}

interface ToolInput {
  actionId?: string
  allDay?: boolean
  effect?: keyof Messages['rules']['effect']
  goal?: string
  instruction?: string
  messageId?: string
  search?: string
  start?: string
  subject?: string
  text?: string
  title?: string
  to?: string[]
  until?: string
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

const findKnown = (value: unknown, id: string): Known | undefined => {
  if (!value || typeof value !== 'object') {
    return undefined
  }
  if ('id' in value && value.id === id) {
    return value as Known
  }
  for (const child of Object.values(value)) {
    const found = findKnown(child, id)
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
const STEP_ICONS = {
  declined: Cancel01Icon,
  done: Tick02Icon,
  failed: Alert02Icon,
}

const SKILL_ICONS: Record<Skill, IconSvgElement> = {
  bills: Invoice03Icon,
  cleanup: MailRemove01Icon,
  followups: UserTime01Icon,
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
          const restored = await client.mail.cancelSend({ id: outboxId })
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

const MailDetails = ({
  action,
  email,
  input,
  text,
}: {
  action?: Known
  email?: Known
  input: ToolInput
  text?: string | null
}) => {
  const t = useT()

  return (
    <>
      {email?.subject && (
        <p data-mask className="text-muted-foreground truncate text-sm">
          {email.fromName ?? email.fromEmail} · {email.subject}
        </p>
      )}
      {!text && action?.title && (
        <p data-mask className="text-muted-foreground text-sm">
          {action.title}
        </p>
      )}
      {input.to && (
        <p data-mask className="text-muted-foreground text-sm">
          {t.agent.to(input.to.join(', '))}
        </p>
      )}
      {input.subject && (
        <p data-mask className="text-sm font-medium">
          {input.subject}
        </p>
      )}
      {text && <DraftText text={text} />}
    </>
  )
}

const OtherDetails = ({ input, name }: { input: ToolInput; name: string }) => {
  const t = useT()
  const dates = useDates()

  return (
    <>
      {input.until && (
        <p className="text-muted-foreground text-sm">
          {t.agent.until(dates.format(new Date(input.until), 'EEE p'))}
        </p>
      )}
      {name === 'create_rule' && input.instruction && input.effect && (
        <p className="text-sm">
          <span data-mask>{input.instruction}</span>
          <span className="text-muted-foreground">
            {' · '}
            {t.rules.effect[input.effect]}
          </span>
        </p>
      )}
      {input.goal && (
        <p data-mask className="text-sm">
          {input.goal}
        </p>
      )}
      {input.title && input.start && (
        <p className="text-sm">
          <span data-mask>{input.title}</span>
          <span className="text-muted-foreground" data-mask>
            {' · '}
            {dates.format(
              parseISO(input.start),
              input.allDay ? 'EEE PP' : 'EEE PP p'
            )}
          </span>
        </p>
      )}
    </>
  )
}

const Confirmation = ({
  input,
  messages,
  name,
  onAnswer,
}: {
  input: ToolInput
  messages: UIMessage[]
  name: string
  onAnswer: (approved: boolean) => void
}) => {
  const t = useT()
  const outputs = toolOutputs(messages)
  const action = input.actionId ? findKnown(outputs, input.actionId) : undefined
  const email = input.messageId
    ? findKnown(outputs, input.messageId)
    : undefined
  const isReply = action?.kind === 'reply' || action?.kind === 'task'
  const text = input.text ?? (isReply ? action?.detail : undefined)
  const key = (name === 'approve_action' && text ? 'reply' : name) as ConfirmKey

  useHotkey('Mod+Enter', () => onAnswer(true), { ignoreInputs: false })

  return (
    <div className="bg-popover ring-foreground/10 flex flex-col gap-3 rounded-2xl px-4.5 py-4 shadow-sm ring">
      <p className="text-sm font-medium">{t.agent.confirm[key] ?? name}</p>
      <MailDetails action={action} email={email} input={input} text={text} />
      <OtherDetails input={input} name={name} />
      <div className="flex items-center gap-2">
        <Button size="sm" onClick={() => onAnswer(true)}>
          {t.agent.yes[key] ?? t.agent.yes.approve_action} <Kbd>⌘⏎</Kbd>
        </Button>
        <Button size="sm" variant="ghost-muted" onClick={() => onAnswer(false)}>
          {t.agent.decline}
        </Button>
      </div>
    </div>
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
  const t = useT()
  const name = getToolName(part)
  const input = (part.input ?? {}) as ToolInput
  useUndoToast(part)

  if (part.state === 'approval-requested' && isAnswerable) {
    return (
      <Confirmation
        input={input}
        messages={messages}
        name={name}
        onAnswer={(approved) => onAnswer(part, approved)}
      />
    )
  }

  const state = stepState(part, isAnswerable)
  const output = part.state === 'output-available' ? part.output : undefined
  const draft = (output as Known | undefined)?.detail

  return (
    <>
      <Marker>
        <MarkerIcon>
          {state === 'running' ? (
            <Spinner />
          ) : (
            <HugeiconsIcon icon={STEP_ICONS[state]} strokeWidth={2} />
          )}
        </MarkerIcon>
        <MarkerContent>
          {t.agent.steps[name as StepKey] ?? name}
          {input.search && <span data-mask> · {input.search}</span>}
          {Array.isArray(output) && ` · ${output.length}`}
          {state === 'declined' && ` · ${t.agent.declined}`}
        </MarkerContent>
      </Marker>
      {DRAFTS.has(name) && draft && <DraftText text={draft} />}
    </>
  )
}

const ThreadLink = ({ children, className, href }: ComponentProps<'a'>) => {
  const thread = new URLSearchParams(href?.split('?')[1]).get('thread')
  return thread ? (
    <Link
      to="/agent"
      search={(prev) => ({ ...prev, thread })}
      className={className}
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

const EmptyChat = ({ onPick }: { onPick: (skill: Skill) => void }) => {
  const t = useT()

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-4 px-6 pb-4">
      <h1 className="text-display font-serif tracking-tight">
        {t.agent.title}
      </h1>
      <p className="text-muted-foreground text-brief font-serif">
        {t.agent.lead}
      </p>
      <div className="flex flex-wrap gap-2 pt-2">
        {SKILLS.map((skill) => (
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
    <div className="bg-popover ring-foreground/6 absolute bottom-full left-6 mb-2 w-80 rounded-xl p-1 shadow-xl ring">
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
  const t = useT()
  const parsed = parseSkill(text)

  return parsed ? (
    <Bubble variant="tinted">
      <BubbleContent>
        <span className="flex items-center gap-2 font-medium">
          <HugeiconsIcon
            icon={SKILL_ICONS[parsed.skill]}
            strokeWidth={2}
            className="size-4"
          />
          {t.skills[parsed.skill]}
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

const textOf = (message: UIMessage) =>
  message.parts
    .flatMap((part) => (part.type === 'text' ? [part.text] : []))
    .join('\n\n')

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
            shortcut={<Kbd>R</Kbd>}
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

export const AgentChat = ({
  chatId,
  initialMessages,
  onSend,
}: {
  chatId: string
  initialMessages: UIMessage[]
  onSend: () => void
}) => {
  const t = useT()
  const queryClient = useQueryClient()
  const [text, setText] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [skillIndex, setSkillIndex] = useState(0)
  const [dismissedText, setDismissedText] = useState<string | null>(null)
  const composerRef = useRef<HTMLTextAreaElement>(null)
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
    onFinish: () => {
      void queryClient.invalidateQueries()
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
    setEditingId(null)
  }
  const send = () => {
    const value = text.trim()
    if (!value || isBusy) {
      return
    }
    onSend()
    void sendMessage({
      messageId: editingId ?? undefined,
      metadata: { createdAt: Date.now() },
      text: value,
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
  /** Escape is a ladder here: the menu above, then the edit. */
  const handleComposerKey = (key: string) => {
    if (key === 'Escape' && editingId) {
      reset()
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
  useHotkey('/', () => composerRef.current?.focus())
  useHotkey(
    'R',
    () => {
      void regenerate()
    },
    { enabled: canRegenerate }
  )
  useEffect(() => {
    composerRef.current?.focus()
  }, [])

  return (
    <div
      className={cn(
        'flex min-h-0 flex-1 flex-col',
        messages.length === 0 && 'justify-center pb-14'
      )}
    >
      {messages.length === 0 ? (
        <EmptyChat onPick={pick} />
      ) : (
        <MessageScrollerProvider autoScroll>
          <MessageScroller>
            <MessageScrollerViewport>
              <MessageScrollerContent className="mx-auto w-full max-w-2xl px-6 pt-10 pb-6">
                {messages.map((message) => (
                  <MessageScrollerItem key={message.id} messageId={message.id}>
                    <Message align={message.role === 'user' ? 'end' : 'start'}>
                      <MessageContent>
                        {message.parts.map((part, index) => {
                          const key = `${message.id}-${index}`
                          if (part.type === 'text' && message.role === 'user') {
                            return <UserBubble key={key} text={part.text} />
                          }
                          if (part.type === 'text') {
                            return (
                              <div key={key} data-mask>
                                <Response
                                  variant="reading"
                                  components={RESPONSE_COMPONENTS}
                                >
                                  {part.text}
                                </Response>
                              </div>
                            )
                          }
                          if (isToolUIPart(part)) {
                            return (
                              <ToolStep
                                key={key}
                                part={part}
                                messages={messages}
                                isAnswerable={message.id === lastId && !isBusy}
                                onAnswer={answer}
                              />
                            )
                          }
                          return null
                        })}
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
                {status === 'submitted' && (
                  <MessageScrollerItem>
                    <Marker render={<output />}>
                      <MarkerIcon>
                        <Spinner />
                      </MarkerIcon>
                      <MarkerContent>{t.agent.thinking}</MarkerContent>
                    </Marker>
                  </MessageScrollerItem>
                )}
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
            <MessageScrollerButton />
          </MessageScroller>
        </MessageScrollerProvider>
      )}
      <form
        className="relative mx-auto w-full max-w-2xl px-6 pb-5"
        onSubmit={(event) => {
          event.preventDefault()
          send()
        }}
      >
        {activeSkill && (
          <SkillMenu active={activeSkill} skills={skills} onPick={pick} />
        )}
        <InputGroup variant="composer">
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
            aria-label={t.agent.placeholder}
            placeholder={t.agent.placeholder}
            rows={1}
            value={text}
            onChange={(event) => {
              setText(event.target.value)
              setSkillIndex(0)
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
          <InputGroupAddon align="block-end">
            <InputGroupButton
              size="sm"
              variant="ghost-muted"
              onClick={() => {
                setText('/')
                setDismissedText(null)
                composerRef.current?.focus()
              }}
            >
              <HugeiconsIcon icon={SlashIcon} strokeWidth={2} />
              {t.agent.skills}
            </InputGroupButton>
            {isBusy ? (
              <IconButton
                className="ml-auto"
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
                className="ml-auto"
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
    </div>
  )
}
