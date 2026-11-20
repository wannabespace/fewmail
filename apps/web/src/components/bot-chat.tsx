import type { RouterOutputs } from '@fewmail/api/router'
import {
  BOARD_EFFECT,
  BOT_MESSAGE_CHARS,
  BOT_PRESETS,
  BOT_REACTIONS,
  cardPayload,
} from '@fewmail/shared/agent'
import type {
  BotReaction,
  MailBotEffect,
  DigestCounts,
} from '@fewmail/shared/agent'
import type { Messages } from '@fewmail/shared/i18n'
import { formatResetDay } from '@fewmail/shared/i18n/locales'
import { Button } from '@fewmail/ui/components/button'
import {
  ChainOfThought,
  ChainOfThoughtContent,
  ChainOfThoughtHeader,
  ChainOfThoughtStep,
} from '@fewmail/ui/components/chain-of-thought'
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from '@fewmail/ui/components/context-menu'
import { IconButton } from '@fewmail/ui/components/custom/icon-button'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@fewmail/ui/components/dialog'
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
} from '@fewmail/ui/components/empty'
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from '@fewmail/ui/components/field'
import { Input } from '@fewmail/ui/components/input'
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupTextarea,
} from '@fewmail/ui/components/input-group'
import { Kbd } from '@fewmail/ui/components/kbd'
import {
  Message,
  MessageActions,
  MessageContent,
  MessageDay,
  MessageReactions,
  MessageTime,
} from '@fewmail/ui/components/message'
import { MessageScrollerItem } from '@fewmail/ui/components/message-scroller'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@fewmail/ui/components/popover'
import { Skeleton } from '@fewmail/ui/components/skeleton'
import { Switch } from '@fewmail/ui/components/switch'
import { Textarea } from '@fewmail/ui/components/textarea'
import { Tool, ToolContent, ToolHeader } from '@fewmail/ui/components/tool'
import {
  Trace,
  TraceDescription,
  TraceIcon,
  TraceLine,
  TraceTitle,
} from '@fewmail/ui/components/trace'
import { cn } from '@fewmail/ui/lib/utils'
import {
  ArrowUp02Icon,
  Cancel01Icon,
  Clock01Icon,
  Copy01Icon,
  DashboardSquare01Icon,
  Mail01Icon,
  NextIcon,
  Notification01Icon,
  NotificationOff01Icon,
  ReplyIcon,
  Settings01Icon,
  SmilePlusIcon,
  Tick02Icon,
  Wrench01Icon,
  ZapIcon,
} from '@hugeicons/core-free-icons'
import type { IconSvgElement } from '@hugeicons/react'
import { HugeiconsIcon } from '@hugeicons/react'
import { useHotkey } from '@tanstack/react-hotkeys'
import {
  skipToken,
  useInfiniteQuery,
  useMutation,
  useQuery,
} from '@tanstack/react-query'
import type { InfiniteData } from '@tanstack/react-query'
import { isSameDay, isToday } from 'date-fns'
import {
  createContext,
  Fragment,
  use,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import type { ReactNode } from 'react'
import { createDebouncedFn, createStore } from 'seitu'
import { useSubscription } from 'seitu/react'
import { toast } from 'sonner'

import { BotAvatar, ownName } from '~/components/bot-list'
import type { HomeBot, OwnBot } from '~/components/bot-list'
import { confirm } from '~/components/confirm-dialog'
import { ConsentDetails } from '~/components/consent-details'
import { expandRow } from '~/components/expand-row'
import {
  cardHeadlineOf,
  foldedVerb,
  useCardActions,
  whoOf,
} from '~/components/queue-card'
import { upgradeStore } from '~/components/upgrade-dialog'
import { botChats, ownBots } from '~/lib/home-db'
import { useDates, useLocale, useT } from '~/lib/i18n'
import { useMe } from '~/lib/me'
import { client, orpc } from '~/lib/orpc'
import { posthog } from '~/lib/posthog'
import { queryClient, showUntilSettled, useRanked } from '~/lib/query-client'

type ChatPage = RouterOutputs['bots']['chat']
type Entry = ChatPage['entries'][number]
type Post = Extract<Entry, { type: 'post' }>
type Card = Extract<Entry, { type: 'cards' }>['cards'][number]
type Quote = NonNullable<Post['replyTo']>
type BotStep =
  RouterOutputs['bots']['ask'] extends AsyncIterable<infer Step> ? Step : never

const refreshBots = () =>
  queryClient.invalidateQueries({ queryKey: orpc.bots.key() })

/** The open chat's bot, for what its messages need of it: its name on a quote, its id on a reply. */
const ChatBot = createContext<HomeBot | null>(null)

/** The message the user is replying to, in the composer of its bot's chat. */
const replyStore = createStore<{ bot: string; quote: Quote } | null>(null)

const anchorOf = (id: string) => `bot-post-${id}`

/** The message a reply answers: whose it is and its first line; a click goes to it. */
const ReplyQuote = ({ botName, quote }: { botName: string; quote: Quote }) => {
  const t = useT()
  return (
    <button
      type="button"
      className="border-primary flex min-w-0 cursor-pointer flex-col items-start border-l-2 pl-2 text-left text-xs"
      onClick={() =>
        document
          .querySelector(`#${anchorOf(quote.id)}`)
          ?.scrollIntoView({ behavior: 'smooth', block: 'center' })
      }
    >
      <span className="text-foreground font-medium">
        {quote.from === 'user' ? t.bots.you : botName}
      </span>
      <span data-mask className="text-muted-foreground line-clamp-1">
        {quote.text.replaceAll('**', '')}
      </span>
    </button>
  )
}

/** What a card burst says in its bot's words: what waits, what was done, by whom. */
const cardsLine = (t: Messages, cards: Card[]) => {
  const count = (status: Card['action']['status']) =>
    cards.filter(({ action }) => action.status === status).length
  return [
    count('pending') > 0 && t.bots.cards.pending(count('pending')),
    count('auto_done') > 0 && t.bots.cards.autoDone(count('auto_done')),
    count('done') > 0 && t.bots.cards.done(count('done')),
    count('dismissed') > 0 && t.bots.cards.dismissed(count('dismissed')),
    count('failed') > 0 && t.bots.cards.failed(count('failed')),
  ]
    .filter(Boolean)
    .join(' ')
}

const inlineOf = (line: string) =>
  line
    .split(/(?<bold>\*\*[^*]+\*\*)/u)
    .map((part, at) =>
      part.startsWith('**') && part.endsWith('**') ? (
        <strong key={at}>{part.slice(2, -2)}</strong>
      ) : (
        <Fragment key={at}>{part}</Fragment>
      )
    )

/** The answers' little Markdown (`**bold**`, `- ` lists, `> ` quotes) without a Markdown library: Home stays light. */
const AnswerText = ({ text }: { text: string }) => (
  <div className="flex flex-col gap-1.5">
    {text.split(/\n{2,}/u).map((block, index) => {
      const lines = block.split('\n')
      const isQuote = lines.every((line) => line.startsWith('>'))
      const isList = lines.every((line) => line.startsWith('- '))
      if (isQuote) {
        return (
          <blockquote
            key={index}
            data-mask
            className="border-foreground/20 border-l-2 pl-3 italic"
          >
            {lines.map((line, at) => (
              <p key={at}>{inlineOf(line.replace(/^>\s?/u, ''))}</p>
            ))}
          </blockquote>
        )
      }
      if (isList) {
        return (
          <ul key={index} data-mask className="list-disc pl-5">
            {lines.map((line, at) => (
              <li key={at}>{inlineOf(line.slice(2))}</li>
            ))}
          </ul>
        )
      }
      return (
        <p key={index} data-mask className="whitespace-pre-line">
          {inlineOf(block)}
        </p>
      )
    })}
  </div>
)

const CLOCK_SKEW_MS = 60_000

const STATUS_ICONS: Record<Card['action']['status'], IconSvgElement> = {
  auto_done: Tick02Icon,
  dismissed: NextIcon,
  done: Tick02Icon,
  failed: Cancel01Icon,
  pending: Clock01Icon,
}

const Speech = ({ children }: { children: ReactNode }) => <p>{children}</p>

export const digestHeadline = (t: Messages, decisions: number) =>
  decisions === 0 ? t.today.allDone : t.today.headline(decisions)

/** The digest's one sentence, computed from its counts (no model text). */
export const digestLead = (t: Messages, counts: DigestCounts) =>
  counts.decisions === 0
    ? t.today.allDoneLead
    : [
        counts.total > 0 &&
          `${t.today.pulse.total(counts.total, t.today.period(counts.days))}.`,
        counts.people * 2 < counts.total && t.today.mostlyNoise(counts.people),
        counts.handled > 0 && t.today.byBots(counts.handled),
      ]
        .filter(Boolean)
        .join(' ')

/**
 * Fewmail's digest of a day, said as a message: how many things need the user and what came. The live one (Home's,
 * `isLive`) is the page's title, adds what is going on now (`status`, `children`) and ends on when it was counted
 * (`at`); a null headline is still loading.
 */
export const DigestHeader = ({
  at,
  children,
  headline,
  isLive = false,
  lead,
  status,
}: {
  at?: number | null
  children?: ReactNode
  headline: string | null
  isLive?: boolean
  lead: ReactNode
  status?: ReactNode
}) => {
  const dates = useDates()
  const Title = isLive ? 'h1' : 'h2'
  return (
    <>
      {status && <p className="text-muted-foreground text-sm">{status}</p>}
      {headline === null ? (
        <Skeleton className="my-1 h-4 w-3/5" />
      ) : (
        <Title className="font-medium">{headline}</Title>
      )}
      {lead}
      {children}
      {at && <MessageTime>{dates.format(at, 'p')}</MessageTime>}
    </>
  )
}

export const DigestLead = ({ children }: { children: ReactNode }) => (
  <p>{children}</p>
)

/** When a message was written, in its bubble. */
const TimeOf = ({ at }: { at?: Date }) => {
  const dates = useDates()
  return at && <MessageTime>{dates.format(at, 'p')}</MessageTime>
}

/** A bot's bubble: what it says and what it did or offers, then when. The chat's header names the bot, so no bubble does. */
const BotMessage = ({
  at,
  children,
  isWide,
  post,
}: {
  /** None while it is being written. */
  at?: Date
  children: ReactNode
  isWide?: boolean
  /** What it said in words: it can be reacted on, replied to and copied. */
  post?: Post
}) => (
  <Message from="assistant" isWide={isWide} id={post && anchorOf(post.id)}>
    <MessageMenu
      post={post}
      quote={post && { from: 'bot', id: post.id, text: post.text ?? '' }}
    >
      {children}
      <TimeOf at={at} />
      {post && <ReactionPicker post={post} />}
    </MessageMenu>
  </Message>
)

const setReaction = (id: string, reaction: BotReaction | null) =>
  queryClient.setQueriesData<InfiniteData<ChatPage>>(
    { queryKey: orpc.bots.chat.key() },
    (data) =>
      data && {
        ...data,
        pages: data.pages.map((page) => ({
          ...page,
          entries: page.entries.map((entry) =>
            entry.type === 'post' && entry.id === id
              ? { ...entry, reaction }
              : entry
          ),
        })),
      }
  )

/** The picked one again takes it back. */
const useReact = () => {
  const react = useMutation(
    orpc.bots.react.mutationOptions({
      onMutate: ({ id, reaction }) => setReaction(id, reaction),
      onSettled: refreshBots,
    })
  )
  return (post: Post, reaction: BotReaction) =>
    react.mutate({
      id: post.id,
      reaction: reaction === post.reaction ? null : reaction,
    })
}

/** A right click or a long press on a message, as a messenger has it: the reactions on the bot's words, then Reply and Copy. */
const MessageMenu = ({
  children,
  post,
  quote,
}: {
  children: ReactNode
  /** The bot's, so the user can react on it. */
  post?: Post
  /** Its words: none on a report of cards, or on one still on its way. */
  quote?: Quote
}) => {
  const t = useT()
  const bot = use(ChatBot)
  const react = useReact()
  if (!quote?.text || !bot) {
    return <MessageContent>{children}</MessageContent>
  }
  return (
    <ContextMenu>
      <ContextMenuTrigger render={<MessageContent />} className="select-text">
        {children}
      </ContextMenuTrigger>
      <ContextMenuContent>
        {post && (
          <>
            <div className="flex">
              {BOT_REACTIONS.map((reaction) => (
                <ContextMenuItem
                  key={reaction}
                  aria-checked={reaction === post.reaction}
                  onClick={() => react(post, reaction)}
                >
                  <span
                    className={cn(
                      '-mx-1 rounded-md px-1 text-base',
                      reaction === post.reaction && 'bg-secondary'
                    )}
                  >
                    {reaction}
                  </span>
                </ContextMenuItem>
              ))}
            </div>
            <ContextMenuSeparator />
          </>
        )}
        <ContextMenuItem
          onClick={() => replyStore.set({ bot: bot.bot, quote })}
        >
          <HugeiconsIcon icon={ReplyIcon} strokeWidth={2} />
          {t.bots.reply}
        </ContextMenuItem>
        <ContextMenuItem
          onClick={() => {
            void navigator.clipboard
              .writeText(quote.text.replaceAll('**', ''))
              .then(() => toast.success(t.bots.copied))
          }}
        >
          <HugeiconsIcon icon={Copy01Icon} strokeWidth={2} />
          {t.bots.copy}
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  )
}

/** The user's reaction on the bot's words: the chip, or a smile on hover while there is none. */
const ReactionPicker = ({ post }: { post: Post }) => {
  const t = useT()
  const [isOpen, setIsOpen] = useState(false)
  const react = useReact()
  return (
    <MessageReactions
      className={cn(
        !post.reaction &&
          'opacity-0 transition-opacity group-hover/message:opacity-100 has-focus-visible:opacity-100 has-data-popup-open:opacity-100 pointer-coarse:opacity-100'
      )}
    >
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger
          render={
            <Button
              size="icon-xs"
              variant="ghost"
              aria-label={
                post.reaction
                  ? `${t.bots.reaction}: ${post.reaction}`
                  : t.bots.react
              }
            />
          }
        >
          {post.reaction ?? (
            <HugeiconsIcon icon={SmilePlusIcon} strokeWidth={2} />
          )}
        </PopoverTrigger>
        <PopoverContent side="top" padding="none" className="w-auto">
          <div className="flex gap-0.5 p-1">
            {BOT_REACTIONS.map((reaction) => (
              <Button
                key={reaction}
                size="icon-sm"
                variant={reaction === post.reaction ? 'secondary' : 'ghost'}
                aria-pressed={reaction === post.reaction}
                onClick={() => {
                  setIsOpen(false)
                  react(post, reaction)
                }}
              >
                {reaction}
              </Button>
            ))}
          </div>
        </PopoverContent>
      </Popover>
    </MessageReactions>
  )
}

const openCard = (card: Card) =>
  card.message &&
  expandRow(card.action.id, { from: 'home', threadId: card.message.threadId })

/** What was done with the emails, one muted line each, the email a click away; what still waits lives once, in Waiting now. */
const CardsTrace = ({ cards }: { cards: Card[] }) => {
  const t = useT()
  const settled = cards.filter(({ action }) => action.status !== 'pending')
  return (
    settled.length > 0 && (
      <Trace>
        {settled.map((card) => {
          const who = whoOf(card)
          const line = (
            <TraceLine
              status={card.action.status === 'failed' ? 'error' : undefined}
            >
              <TraceIcon>
                <HugeiconsIcon
                  icon={STATUS_ICONS[card.action.status]}
                  strokeWidth={2}
                />
              </TraceIcon>
              <TraceTitle data-mask>
                {who ? `${who.fromName ?? who.fromEmail}: ` : ''}
                {cardHeadlineOf(card)}
              </TraceTitle>
              <TraceDescription>
                {t.actionStatus[card.action.status]}
              </TraceDescription>
            </TraceLine>
          )
          return card.message ? (
            <button
              key={card.action.id}
              type="button"
              className="focus-visible:focus-ring w-fit max-w-full rounded-md outline-none"
              onClick={() => openCard(card)}
            >
              {line}
            </button>
          ) : (
            <Fragment key={card.action.id}>{line}</Fragment>
          )
        })}
      </Trace>
    )
  )
}

/**
 * What the bot offers and waits a yes for, as a tool block: one with an email opens it in the sidebar, where its
 * proposal waits; a consent shows every input it would run with, and its yes.
 */
const ProposalTool = ({ card }: { card: Card }) => {
  const t = useT()
  const { approve, skip } = useCardActions()
  const { context, input, tool } = cardPayload(card.action)
  const who = whoOf(card)
  return (
    <Tool defaultOpen={!!tool}>
      <ToolHeader
        icon={card.message ? Mail01Icon : ZapIcon}
        isOpenable={!!tool}
        title={
          <span data-mask>
            {who ? `${who.fromName ?? who.fromEmail}: ` : ''}
            {cardHeadlineOf(card)}
          </span>
        }
        action={
          card.message ? (
            <Button
              size="sm"
              variant="secondary"
              onClick={() => openCard(card)}
            >
              {foldedVerb(t, card.action)}
            </Button>
          ) : (
            <>
              <Button
                size="sm"
                variant="ghost-muted"
                onClick={() => skip.mutate([card.action.id])}
              >
                {t.queue.skip}
              </Button>
              <Button
                size="sm"
                onClick={() => approve.mutate({ id: card.action.id })}
              >
                {foldedVerb(t, card.action)}
              </Button>
            </>
          )
        }
      />
      {tool && (
        <ToolContent>
          <ConsentDetails context={context} input={input ?? {}} name={tool} />
        </ToolContent>
      )}
    </Tool>
  )
}

/** The emails a message is about: what waits as tool blocks, what is settled as a trace. */
const CardsOf = ({ cards }: { cards: Card[] }) => (
  <>
    <CardsTrace cards={cards} />
    {cards
      .filter(({ action }) => action.status === 'pending')
      .map((card) => (
        <ProposalTool key={card.action.id} card={card} />
      ))}
  </>
)

const stepOf = (t: Messages, tool: string) =>
  t.agent.steps[tool as keyof Messages['agent']['steps']] ?? tool

/** The same tool called again right after itself is one step, with how many times it ran. */
const stepsOf = (tools: string[]) => {
  const steps: { count: number; tool: string }[] = []
  for (const tool of tools) {
    const last = steps.at(-1)
    if (last?.tool === tool) {
      last.count += 1
    } else {
      steps.push({ count: 1, tool })
    }
  }
  return steps
}

const StepLabel = ({ count, tool }: { count: number; tool: string }) => {
  const t = useT()
  return (
    <>
      {stepOf(t, tool)}
      {count > 1 && (
        <span className="text-muted-foreground ml-1.5 tabular-nums">
          ×{count}
        </span>
      )}
    </>
  )
}

/** The tools the agent called for an answer: the running one in the header, the ones done under it; folded to a count after. */
const BotSteps = ({
  isRunning,
  tools,
}: {
  isRunning: boolean
  tools: string[]
}) => {
  const t = useT()
  const [isOpen, setIsOpen] = useState(false)
  const steps = stepsOf(tools)
  const running = isRunning ? steps.at(-1) : undefined
  const done = running ? steps.slice(0, -1) : steps
  return (
    steps.length > 0 && (
      <ChainOfThought
        open={isOpen || (!!running && done.length > 0)}
        onOpenChange={setIsOpen}
      >
        <ChainOfThoughtHeader icon={Wrench01Icon}>
          {running ? (
            <span className="shimmer motion-reduce:shimmer-none">
              <StepLabel {...running} />
            </span>
          ) : (
            t.bots.steps(steps.length)
          )}
        </ChainOfThoughtHeader>
        {done.length > 0 && (
          <ChainOfThoughtContent>
            {done.map((step, index) => (
              <ChainOfThoughtStep
                // oxlint-disable-next-line react/no-array-index-key -- the same tool can run again later in one answer
                key={`${step.tool}:${index}`}
                icon={Tick02Icon}
                label={<StepLabel {...step} />}
              />
            ))}
          </ChainOfThoughtContent>
        )}
      </ChainOfThought>
    )
  )
}

const UserMessage = ({
  id,
  reaction,
  replyTo,
  text,
  ...props
}: {
  at?: Date
  /** None while it is on its way. */
  id?: string
  /** The bot's, often in place of an answer. */
  reaction?: BotReaction | null
  replyTo?: Quote | null
  text: string
}) => {
  const t = useT()
  const bot = use(ChatBot)
  return (
    <Message from="user" id={id && anchorOf(id)}>
      <MessageMenu quote={id ? { from: 'user', id, text } : undefined}>
        {replyTo && <ReplyQuote botName={bot?.name ?? ''} quote={replyTo} />}
        <span data-mask>{text}</span>
        <TimeOf at={props.at} />
        {reaction && (
          <MessageReactions align="start">
            <span aria-hidden>{reaction}</span>
            <span className="sr-only">{`${t.bots.reaction}: ${reaction}`}</span>
          </MessageReactions>
        )}
      </MessageMenu>
    </Message>
  )
}

const PromisesTrace = ({
  promises,
}: {
  promises: Extract<Entry, { type: 'promises' }>['promises']
}) => {
  const dates = useDates()
  return (
    <Trace>
      {promises.map((promise) => (
        <TraceLine key={promise.id}>
          <TraceIcon>
            <HugeiconsIcon icon={DashboardSquare01Icon} strokeWidth={2} />
          </TraceIcon>
          <TraceTitle data-mask>{promise.promise}</TraceTitle>
          <TraceDescription>
            {dates.format(promise.dueAt, 'd MMM')}
          </TraceDescription>
        </TraceLine>
      ))}
    </Trace>
  )
}

/** A day's digest as it was written; its cards are read as they are now, so what was done since says so. */
const DigestView = ({
  entry,
}: {
  entry: Extract<Entry, { type: 'digest' }>
}) => {
  const t = useT()
  return (
    <>
      {entry.counts && (
        <DigestHeader
          headline={digestHeadline(t, entry.counts.decisions)}
          lead={<DigestLead>{digestLead(t, entry.counts)}</DigestLead>}
        />
      )}
      {entry.cards.length > 0 && <Speech>{cardsLine(t, entry.cards)}</Speech>}
      <CardsTrace cards={entry.cards} />
    </>
  )
}

const PostView = ({ entry }: { entry: Post }) => {
  const t = useT()
  const locale = useLocale()
  const { usage } = useMe()
  if (entry.kind === 'answer') {
    return (
      <>
        <BotSteps isRunning={false} tools={entry.tools} />
        <AnswerText text={entry.text ?? ''} />
        <CardsOf cards={entry.cards} />
      </>
    )
  }
  if (entry.kind === 'nudge') {
    return (
      <>
        <Speech>
          <span data-mask>{entry.text}</span>
        </Speech>
        {entry.replied !== null && (
          <p className="text-muted-foreground text-sm">
            {entry.replied ? t.bots.nudge.replied : t.bots.nudge.noReply}
          </p>
        )}
      </>
    )
  }
  if (entry.kind === 'no_plan') {
    return (
      <>
        <Speech>{t.bots.noPlan}</Speech>
        <MessageActions>
          <Button size="sm" onClick={() => upgradeStore.set('chat')}>
            {t.bots.subscribe}
          </Button>
        </MessageActions>
      </>
    )
  }
  return <Speech>{t.bots.spent(formatResetDay(locale, usage.resetsAt))}</Speech>
}

const EntryView = ({ entry }: { entry: Entry }) => {
  const t = useT()
  if (entry.type === 'post' && entry.kind === 'message') {
    return (
      <UserMessage
        at={entry.at}
        id={entry.id}
        reaction={entry.reaction}
        replyTo={entry.replyTo}
        text={entry.text ?? ''}
      />
    )
  }
  return (
    <BotMessage
      at={entry.at}
      post={entry.type === 'post' && entry.text ? entry : undefined}
    >
      {entry.type === 'cards' && (
        <>
          <Speech>{cardsLine(t, entry.cards)}</Speech>
          <CardsTrace cards={entry.cards} />
        </>
      )}
      {entry.type === 'digest' && <DigestView entry={entry} />}
      {entry.type === 'promises' && (
        <>
          <Speech>{t.bots.promises(entry.promises.length)}</Speech>
          <PromisesTrace promises={entry.promises} />
        </>
      )}
      {entry.type === 'post' && <PostView entry={entry} />}
    </BotMessage>
  )
}

/** What the bot waits on now, after its last report: a run of its messages, `NowMessage` each, as a messenger sends them. */
export const BotNow = ({ children }: { children: ReactNode }) => {
  const t = useT()
  return (
    <section aria-label={t.bots.now} className="flex flex-col gap-3">
      {children}
    </section>
  )
}

/** One of them, as wide as its lists; a part with nothing to show draws no empty bubble. */
export const NowMessage = ({
  children,
  isWide = true,
}: {
  children: ReactNode
  isWide?: boolean
}) => (
  <Message
    from="assistant"
    isWide={isWide}
    className="has-[[data-slot=message-content]:empty]:hidden has-[[data-slot=message-content]>:only-child:empty]:hidden"
  >
    <MessageContent>{children}</MessageContent>
  </Message>
)

/** A day's chip over the first message of that day. */
const DayOf = ({ entries, entry }: { entries: Entry[]; entry: Entry }) => {
  const t = useT()
  const dates = useDates()
  const index = entries.indexOf(entry)
  const before = entries[index - 1]
  if (before && isSameDay(before.at, entry.at)) {
    return null
  }
  return (
    <MessageDay>
      {isToday(entry.at) ? t.calendar.today : dates.format(entry.at, 'd MMMM')}
    </MessageDay>
  )
}

/** A message on its way, the agent's steps and the answer as it is written, until the chat holds them. */
interface Asking {
  answer: string
  /** When it was sent: the chat holds the message from its next refetch, and then it is shown from there. */
  at: Date
  bot: string
  /** The bot reacted on the message, and may say nothing more. */
  reaction?: BotReaction
  replyTo?: Quote
  text: string
  tools: string[]
}

/**
 * The last message sent here outlives `asking`: kept, it takes over as the scroller's anchor.
 * While it is on its way, its own bubble stays the one shown and the kept copy waits, so the scroller never loses what it anchors to.
 */
const useSentAnchor = (asking: Asking | null, said: Entry[]) => {
  const [sent, setSent] = useState(asking)
  if (asking && asking.at !== sent?.at) {
    setSent(asking)
  }
  const isSent = (entry: Entry) =>
    entry.type === 'post' &&
    entry.kind === 'message' &&
    !!sent &&
    // The server's clock may run a little behind the browser's.
    entry.at.getTime() > sent.at.getTime() - CLOCK_SKEW_MS &&
    entry.text === sent.text
  const keptAt = asking ? said.findIndex(isSent) : -1
  return {
    isSent,
    shownSaid: keptAt === -1 ? said : said.slice(0, keptAt),
  }
}

/**
 * The chat with one bot, oldest first, older days on demand; `children` is what it waits on now, after its latest report.
 * Its parts are the page's `MessageScrollerContent` children, so it renders no box of its own; the message being sent anchors at the top while its answer streams in.
 */
export const BotTimeline = ({
  asking,
  bot,
  children,
  isWaiting,
}: {
  asking: Asking | null
  bot: HomeBot
  children?: ReactNode
  /** The bot waits on something now (`children`): then the chat is never empty. */
  isWaiting: boolean
}) => {
  const t = useT()
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useInfiniteQuery(
      orpc.bots.chat.infiniteOptions({
        getNextPageParam: ({ earlier }) => earlier ?? undefined,
        initialPageParam: undefined as Date | undefined,
        input: (before) => ({ before, bot: bot.bot }),
      })
    )
  const entries = (data?.pages ?? [])
    .toReversed()
    .flatMap(({ entries: page }) => page)
  // What it waits on now follows its latest report, and the talk since comes under it, so a new answer lands at the end.
  const lastReport = entries.findLastIndex(({ type }) => type !== 'post')
  // Fewmail's latest digest, while no report came after it, is drawn live as the head of what it waits on now, never twice.
  const latest = entries[lastReport]
  const reported = entries
    .slice(0, lastReport + 1)
    .filter(
      (entry) => !(entry === latest && entry.type === 'digest' && entry.counts)
    )
  const said = entries.slice(lastReport + 1)
  const isMine = asking?.bot === bot.bot
  const { isSent, shownSaid } = useSentAnchor(isMine ? asking : null, said)

  return (
    <ChatBot value={bot}>
      {hasNextPage && (
        <Button
          size="sm"
          variant="ghost-muted"
          className="self-center"
          disabled={isFetchingNextPage}
          onClick={() => {
            void fetchNextPage()
          }}
        >
          {t.bots.earlier}
        </Button>
      )}
      {data && entries.length === 0 && !isMine && !isWaiting && (
        <Empty>
          <EmptyHeader>
            <EmptyMedia>
              <BotAvatar bot={bot} size="md" />
            </EmptyMedia>
            <EmptyDescription>{t.bots.empty}</EmptyDescription>
          </EmptyHeader>
        </Empty>
      )}
      {reported.map((entry) => (
        <Fragment key={entry.id}>
          <DayOf entries={entries} entry={entry} />
          <EntryView entry={entry} />
        </Fragment>
      ))}
      {children}
      {shownSaid.map((entry) => (
        <Fragment key={entry.id}>
          <DayOf entries={entries} entry={entry} />
          {isSent(entry) ? (
            <MessageScrollerItem scrollAnchor>
              <EntryView entry={entry} />
            </MessageScrollerItem>
          ) : (
            <EntryView entry={entry} />
          )}
        </Fragment>
      ))}
      {isMine && (
        <>
          <MessageScrollerItem scrollAnchor>
            <UserMessage
              reaction={asking.reaction}
              replyTo={asking.replyTo}
              text={asking.text}
            />
          </MessageScrollerItem>
          {(!asking.reaction || !!asking.answer || asking.tools.length > 0) && (
            <BotMessage>
              <BotSteps isRunning={!asking.answer} tools={asking.tools} />
              {asking.answer ? (
                <AnswerText text={asking.answer} />
              ) : (
                asking.tools.length === 0 && (
                  <span className="shimmer motion-reduce:shimmer-none w-fit text-sm">
                    {t.bots.answering}
                  </span>
                )
              )}
            </BotMessage>
          )}
        </>
      )}
    </ChatBot>
  )
}

const stepInto = (current: Asking, step: BotStep): Asking => {
  if (step.type === 'reaction') {
    return { ...current, reaction: step.reaction }
  }
  return step.type === 'text'
    ? { ...current, answer: current.answer + step.text }
    : { ...current, tools: [...current.tools, step.tool] }
}

interface Ask {
  bot: string
  replyTo?: Quote
  text: string
}

const streamAnswer = async (
  { bot, replyTo, text }: Ask,
  onStep: (step: BotStep) => void
) => {
  for await (const step of await client.bots.ask({
    bot,
    replyTo: replyTo?.id,
    text,
  })) {
    onStep(step)
  }
}

/** Sends a message to a bot and streams the agent's steps and answer in; the chat refetches once both are kept. */
export const useAskBot = () => {
  const [asking, setAsking] = useState<Asking | null>(null)
  const ask = useMutation({
    meta: { event: 'bot_asked' },
    mutationFn: (message: Ask) => {
      setAsking({ ...message, answer: '', at: new Date(), tools: [] })
      return streamAnswer(message, (step) =>
        setAsking((current) => current && stepInto(current, step))
      )
    },
    onSettled: async () => {
      await refreshBots()
      setAsking(null)
    },
  })
  return { ask, asking }
}

/** Where the user writes to the open bot: ⏎ sends, ⇧⏎ breaks the line, `/` comes here and esc drops the reply, then leaves. */
export const BotComposer = ({
  bot,
  isActive,
  onSend,
  isSending,
}: {
  bot: HomeBot
  isActive: boolean
  isSending: boolean
  onSend: (message: Omit<Ask, 'bot'>) => void
}) => {
  const t = useT()
  const ref = useRef<HTMLTextAreaElement>(null)
  const [text, setText] = useState('')
  const reply = useSubscription(replyStore)
  const replyTo = reply?.bot === bot.bot ? reply.quote : undefined
  useHotkey('/', () => ref.current?.focus(), { enabled: isActive })
  useEffect(() => {
    if (replyTo) {
      ref.current?.focus()
    }
  }, [replyTo])
  const send = () => {
    const message = text.trim()
    if (!message || isSending) {
      return
    }
    onSend({ replyTo, text: message })
    setText('')
    replyStore.set(null)
  }
  return (
    <form
      onSubmit={(event) => {
        event.preventDefault()
        send()
      }}
    >
      <InputGroup variant="composer">
        {replyTo && (
          <InputGroupAddon align="block-start">
            <div className="bg-muted flex w-full min-w-0 items-center gap-2.5 rounded-2xl py-2 ps-3 pe-2">
              <HugeiconsIcon
                icon={ReplyIcon}
                strokeWidth={2}
                className="text-primary size-4 shrink-0"
              />
              <ReplyQuote botName={bot.name} quote={replyTo} />
              <InputGroupButton
                size="icon-xs"
                aria-label={t.bots.cancelReply}
                className="ml-auto"
                onClick={() => replyStore.set(null)}
              >
                <HugeiconsIcon icon={Cancel01Icon} strokeWidth={2} />
              </InputGroupButton>
            </div>
          </InputGroupAddon>
        )}
        <InputGroupTextarea
          ref={ref}
          aria-label={t.bots.composer(bot.name)}
          placeholder={t.bots.composer(bot.name)}
          maxLength={BOT_MESSAGE_CHARS}
          rows={1}
          value={text}
          onChange={(event) => setText(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Enter' && !event.shiftKey) {
              event.preventDefault()
              send()
            }
            if (event.key === 'Escape' && replyTo) {
              replyStore.set(null)
            } else if (event.key === 'Escape') {
              ref.current?.blur()
            }
          }}
        />
        <InputGroupAddon align="inline-end">
          <InputGroupButton
            type="submit"
            size="icon-sm"
            variant="default"
            aria-label={t.compose.send}
            disabled={!text.trim() || isSending}
          >
            <HugeiconsIcon icon={ArrowUp02Icon} strokeWidth={2} />
          </InputGroupButton>
        </InputGroupAddon>
      </InputGroup>
    </form>
  )
}

/** The chat's bar, as a messenger's: the open bot's face and name, what it looks after, its mute and settings. */
export const BotHeader = ({
  bot,
  onEdit,
}: {
  bot: HomeBot
  onEdit: () => void
}) => {
  const t = useT()
  const mute = useMutation(
    orpc.bots.mute.mutationOptions({
      onMutate: ({ bot: id, muted }) =>
        showUntilSettled(() => {
          if (botChats.has(id)) {
            botChats.update(id, (row) => {
              row.muted = muted
            })
          }
        }),
      onSettled: (_, __, ___, settle) => settle?.(refreshBots()),
    })
  )
  return (
    <header className="flex h-14 shrink-0 border-b">
      <div className="mx-auto flex w-full max-w-3xl items-center gap-3 px-10 max-md:px-4">
        <BotAvatar bot={bot} size="md" />
        <div className="flex min-w-0 flex-1 flex-col">
          <h1 data-mask={!!bot.own} className="truncate text-sm font-medium">
            {bot.name}
          </h1>
          <p
            data-mask={!!bot.own}
            className="text-muted-foreground truncate text-xs"
          >
            {bot.muted ? t.bots.muted : bot.job}
          </p>
        </div>
        <IconButton
          icon={bot.muted ? NotificationOff01Icon : Notification01Icon}
          label={bot.muted ? t.bots.unmute : t.bots.mute}
          size="icon-sm"
          variant="ghost-muted"
          onClick={() => mute.mutate({ bot: bot.bot, muted: !bot.muted })}
        />
        {bot.own && (
          <IconButton
            icon={Settings01Icon}
            label={t.bots.edit}
            size="icon-sm"
            variant="ghost-muted"
            onClick={onEdit}
          />
        )}
      </div>
    </header>
  )
}

interface BotDraft {
  enabled: boolean
  name: string
  /** Which mail is its and what it does with it; a simple bot's keeps its match, so its text only says what it does. */
  text: string
}

const draftOf = (bot: OwnBot | null, t: Messages): BotDraft => ({
  enabled: bot?.enabled ?? true,
  name: bot?.name ?? '',
  text: bot?.match ? t.bots.effect[bot.effect] : (bot?.instruction ?? ''),
})

const READ_PAUSE_MS = 500
const READ_CHARS = 2000

/** Jev reads the text once typing pauses, so saving rarely waits on it; changed words that do not say what to do only collect. */
const useReadEffect = (text: string, bot: OwnBot | null, t: Messages) => {
  const [typed, setTyped] = useState(text)
  const afterTyping = useMemo(
    () => createDebouncedFn(setTyped, READ_PAUSE_MS),
    []
  )
  useEffect(() => {
    afterTyping(text)
  }, [afterTyping, text])
  useEffect(() => afterTyping.cancel, [afterTyping])
  const asked = (value: string) => {
    const words = value.trim()
    return words !== draftOf(bot, t).text.trim() && words.length > 2
      ? { simple: !!bot?.match, text: words.slice(0, READ_CHARS) }
      : null
  }
  useQuery(
    orpc.bots.readEffect.queryOptions({
      input: asked(typed) ?? skipToken,
      staleTime: Number.POSITIVE_INFINITY,
    })
  )
  /** Saving right after a keystroke reads the words as they stand, never the read from before the pause. */
  return async (): Promise<MailBotEffect> => {
    const latest = asked(text)
    if (!latest) {
      return bot && bot.effect !== BOARD_EFFECT ? bot.effect : 'collect'
    }
    return (
      (await queryClient.fetchQuery(
        orpc.bots.readEffect.queryOptions({
          input: latest,
          staleTime: Number.POSITIVE_INFINITY,
        })
      )) ?? 'collect'
    )
  }
}

/** The bot's name, which mail is its and what it does with it in one text (a sender's bot keeps its match), and whether it acts alone. */
const BotFields = ({
  draft,
  hasMatch,
  isBoard,
  onChange,
}: {
  draft: BotDraft
  hasMatch: boolean
  /** It takes no mail and moves none: only its name is the user's to change. */
  isBoard: boolean
  onChange: (change: Partial<BotDraft>) => void
}) => {
  const t = useT()
  return (
    <FieldGroup>
      <Field>
        <FieldLabel htmlFor="bot-name">{t.bots.name}</FieldLabel>
        <Input
          id="bot-name"
          data-mask
          maxLength={60}
          placeholder={t.bots.namePlaceholder}
          value={draft.name}
          onChange={(event) => onChange({ name: event.target.value })}
        />
      </Field>
      {!isBoard && (
        <BotMailFields draft={draft} hasMatch={hasMatch} onChange={onChange} />
      )}
    </FieldGroup>
  )
}

/** Which mail is its and what it does with it, and whether it acts alone. */
const BotMailFields = ({
  draft,
  hasMatch,
  onChange,
}: {
  draft: BotDraft
  hasMatch: boolean
  onChange: (change: Partial<BotDraft>) => void
}) => {
  const t = useT()
  return (
    <>
      <Field>
        <FieldLabel htmlFor="bot-text">
          {hasMatch ? t.bots.whatItDoes : t.bots.instruction}
        </FieldLabel>
        <Textarea
          id="bot-text"
          data-mask
          placeholder={hasMatch ? undefined : t.bots.instructionPlaceholder}
          value={draft.text}
          onChange={(event) => onChange({ text: event.target.value })}
        />
      </Field>
      <Field orientation="horizontal">
        <Switch
          id="bot-enabled"
          checked={draft.enabled}
          onCheckedChange={(enabled) => onChange({ enabled })}
        />
        <div className="flex flex-col">
          <FieldLabel htmlFor="bot-enabled">{t.bots.enabled}</FieldLabel>
          <FieldDescription>
            {t.bots.enabledHint[draft.enabled ? 'on' : 'off']}
          </FieldDescription>
        </div>
      </Field>
    </>
  )
}

/** New bot's ready-made ones, in the user's language; the Board only while the user has none. */
const BotPresets = ({ onCreated }: { onCreated: (id: string) => void }) => {
  const t = useT()
  const { data: own = [] } = useRanked(ownBots)
  const add = useMutation(
    orpc.bots.addPreset.mutationOptions({
      onSettled: refreshBots,
      onSuccess: ({ id }) => onCreated(id),
    })
  )
  const hasBoard = own.some(({ effect }) => effect === BOARD_EFFECT)
  return (
    <Field>
      <FieldLabel>{t.bots.presets}</FieldLabel>
      <div className="flex flex-wrap gap-2">
        {BOT_PRESETS.filter(
          ({ effect }) => effect !== BOARD_EFFECT || !hasBoard
        ).map(({ key }) => (
          <Button
            key={key}
            size="sm"
            variant="secondary"
            disabled={add.isPending}
            onClick={() => add.mutate({ preset: key })}
          >
            {t.starterBots[key].name}
          </Button>
        ))}
      </div>
    </Field>
  )
}

/** The form of a new bot (`bot` null) or one of the user's; mounted afresh each time the dialog opens. */
const BotForm = ({
  bot,
  onClose,
  onCreated,
}: {
  bot: OwnBot | null
  onClose: () => void
  onCreated: (id: string) => void
}) => {
  const t = useT()
  const [draft, setDraft] = useState(() => draftOf(bot, t))
  const readEffect = useReadEffect(draft.text, bot, t)
  const done = (message: string) => {
    toast.success(message)
    onClose()
  }
  const create = useMutation(
    orpc.bots.create.mutationOptions({
      onSettled: refreshBots,
      onSuccess: ({ id }) => {
        onCreated(id)
        done(t.bots.created)
      },
    })
  )
  const update = useMutation(
    orpc.bots.update.mutationOptions({
      onMutate: ({ id, ...change }) => {
        done(t.bots.saved)
        return showUntilSettled(() => {
          if (ownBots.has(id)) {
            ownBots.update(id, (row) => Object.assign(row, change))
          }
        })
      },
      onSettled: (_, __, ___, settle) => settle?.(refreshBots()),
    })
  )
  const remove = useMutation(
    orpc.bots.delete.mutationOptions({
      onMutate: ({ id }) => {
        done(t.bots.deleted)
        return showUntilSettled(() => {
          for (const rows of [ownBots, botChats]) {
            if (rows.has(id)) {
              rows.delete(id)
            }
          }
        })
      },
      onSettled: (_, __, ___, settle) => settle?.(refreshBots()),
    })
  )
  const isBoard = bot?.effect === BOARD_EFFECT
  const canSave =
    !!draft.name.trim() &&
    (isBoard || !!bot?.match || draft.text.trim().length > 2)
  const save = async () => {
    if (bot && isBoard) {
      update.mutate({ id: bot.id, name: draft.name.trim() })
      return
    }
    const fields = {
      effect: await readEffect(),
      enabled: draft.enabled,
      name: draft.name.trim(),
    }
    if (!bot) {
      create.mutate({ ...fields, instruction: draft.text.trim() })
      return
    }
    update.mutate({
      id: bot.id,
      ...fields,
      ...(bot.match ? {} : { instruction: draft.text.trim() }),
    })
  }
  const askToDelete = (own: OwnBot) =>
    confirm({
      action: t.bots.delete,
      description: t.bots.deleteHint,
      onConfirm: () => remove.mutate({ id: own.id }),
      title: t.bots.deleteConfirm(ownName(own)),
      variant: 'destructive',
    })
  return (
    <form
      className="contents"
      onSubmit={(event) => {
        event.preventDefault()
        if (canSave) {
          void save()
        }
      }}
    >
      {!bot && (
        <BotPresets
          onCreated={(id) => {
            onCreated(id)
            done(t.bots.created)
          }}
        />
      )}
      <BotFields
        draft={draft}
        hasMatch={!!bot?.match}
        isBoard={isBoard}
        onChange={(change) =>
          setDraft((current) => ({ ...current, ...change }))
        }
      />
      <DialogFooter>
        {bot && (
          <Button
            variant="ghost-destructive"
            className="mr-auto"
            onClick={() => askToDelete(bot)}
          >
            {t.bots.delete}
          </Button>
        )}
        <Button
          type="submit"
          disabled={!canSave || create.isPending || update.isPending}
          shortcut={<Kbd>⏎</Kbd>}
        >
          {bot ? t.bots.save : t.bots.add}
        </Button>
      </DialogFooter>
    </form>
  )
}

/** A new bot (`bot` null) or one of the user's to change; `editing` stays set through the fade-out (`onClosed` clears it). */
export const BotSettingsDialog = ({
  editing,
  onClose,
  onClosed,
  onCreated,
}: {
  editing: { bot: OwnBot | null; isOpen: boolean } | null
  onClose: () => void
  onClosed: () => void
  onCreated: (id: string) => void
}) => {
  const t = useT()
  return (
    <Dialog
      open={!!editing?.isOpen}
      onOpenChange={(open) => !open && onClose()}
      onOpenChangeComplete={(open) => !open && onClosed()}
    >
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{editing?.bot ? t.bots.edit : t.bots.add}</DialogTitle>
        </DialogHeader>
        {editing && (
          <BotForm
            key={editing.bot?.id ?? 'new'}
            bot={editing.bot}
            onClose={onClose}
            onCreated={onCreated}
          />
        )}
      </DialogContent>
    </Dialog>
  )
}

/** Opening a bot reads its chat; a bot left open reads what comes while it is open. */
export const useReadBot = (bot: HomeBot | undefined) => {
  const { mutate: read } = useMutation(
    orpc.bots.read.mutationOptions({
      onMutate: ({ bot: id }) =>
        showUntilSettled(() => {
          if (botChats.has(id)) {
            botChats.update(id, (row) => {
              row.unread = 0
            })
          }
        }),
      onSettled: (_, __, ___, settle) => settle?.(refreshBots()),
    })
  )
  const unread = bot?.unread ?? 0
  const id = bot?.bot
  useEffect(() => {
    if (id) {
      posthog.capture('bot_opened', { system: id === 'fewmail' })
    }
  }, [id])
  useEffect(() => {
    if (id && unread > 0) {
      read({ bot: id })
    }
  }, [id, read, unread])
}
