import { useChat } from '@ai-sdk/react'
import { UNDO_SEND_SECONDS } from '@fewmail/shared/agent'
import type { Messages } from '@fewmail/shared/i18n'
import { Bubble, BubbleContent } from '@fewmail/ui/components/bubble'
import { Button } from '@fewmail/ui/components/button'
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
import { Message, MessageContent } from '@fewmail/ui/components/message'
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
  Cancel01Icon,
  Tick02Icon,
} from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
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
  autonomous?: boolean
  effect?: keyof Messages['rules']['effect']
  goal?: string
  instruction?: string
  messageId?: string
  search?: string
  subject?: string
  text?: string
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
            {input.autonomous && ` · ${t.rules.withoutAsking}`}
          </span>
        </p>
      )}
      {input.goal && (
        <p data-mask className="text-sm">
          {input.goal}
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

const EmptyChat = ({ onPick }: { onPick: (text: string) => void }) => {
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
        {t.agent.suggestions.map((suggestion) => (
          <Button
            key={suggestion}
            size="sm"
            variant="secondary"
            onClick={() => onPick(suggestion)}
          >
            {suggestion}
          </Button>
        ))}
      </div>
    </div>
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

  const send = (value: string) => {
    if (!value.trim() || isBusy) {
      return
    }
    onSend()
    void sendMessage({ text: value.trim() })
    setText('')
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
        <EmptyChat onPick={send} />
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
                            return (
                              <Bubble key={key} variant="secondary">
                                <BubbleContent
                                  data-mask
                                  className="whitespace-pre-wrap"
                                >
                                  {part.text}
                                </BubbleContent>
                              </Bubble>
                            )
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
        className="mx-auto w-full max-w-2xl px-6 pb-5"
        onSubmit={(event) => {
          event.preventDefault()
          send(text)
        }}
      >
        <InputGroup>
          <InputGroupTextarea
            ref={composerRef}
            aria-label={t.agent.placeholder}
            placeholder={t.agent.placeholder}
            rows={2}
            value={text}
            onChange={(event) => setText(event.target.value)}
            onKeyDown={(event) => {
              if (
                event.key === 'Enter' &&
                !event.shiftKey &&
                !event.metaKey &&
                !event.nativeEvent.isComposing
              ) {
                event.preventDefault()
                send(text)
              }
            }}
          />
          <InputGroupAddon align="block-end">
            {isBusy ? (
              <InputGroupButton
                className="ml-auto"
                size="sm"
                variant="secondary"
                onClick={() => {
                  void stop()
                }}
              >
                {t.agent.stop} <Kbd>esc</Kbd>
              </InputGroupButton>
            ) : (
              <InputGroupButton
                className="ml-auto"
                disabled={!text.trim()}
                size="sm"
                type="submit"
                variant="default"
              >
                {t.agent.send} <Kbd>⏎</Kbd>
              </InputGroupButton>
            )}
          </InputGroupAddon>
        </InputGroup>
      </form>
    </div>
  )
}
