import type { RouterOutputs } from '@fewmail/api/router'
import { BOT_REACTIONS, cardPayload, needsPurpose } from '@fewmail/shared/agent'
import type { BotReaction, DigestCounts } from '@fewmail/shared/agent'
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
import {
  Message,
  MessageActions,
  MessageBubble,
  MessageContent,
  MessageDay,
  MessageReactions,
  MessageTime,
} from '@fewmail/ui/components/message'
import {
  MessageScrollerItem,
  useMessageScroller,
} from '@fewmail/ui/components/message-scroller'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@fewmail/ui/components/popover'
import { Skeleton } from '@fewmail/ui/components/skeleton'
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
  Cancel01Icon,
  Clock01Icon,
  Copy01Icon,
  DashboardSquare01Icon,
  Mail01Icon,
  NextIcon,
  ReplyIcon,
  SmilePlusIcon,
  Tick02Icon,
  Wrench01Icon,
  ZapIcon,
} from '@hugeicons/core-free-icons'
import type { IconSvgElement } from '@hugeicons/react'
import { HugeiconsIcon } from '@hugeicons/react'
import { useInfiniteQuery, useMutation } from '@tanstack/react-query'
import type { InfiniteData } from '@tanstack/react-query'
import { isSameDay, isToday } from 'date-fns'
import {
  createContext,
  Fragment,
  use,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from 'react'
import type { ReactNode } from 'react'
import { createStore } from 'seitu'
import { toast } from 'sonner'

import { cardsLine, digestHeadline, isBoardBot } from '~/components/bot-list'
import type { HomeBot } from '~/components/bot-list'
import { ConsentDetails } from '~/components/consent-details'
import { expandRow } from '~/components/expand-row'
import {
  cardHeadlineOf,
  foldedVerb,
  useCardActions,
  whoOf,
} from '~/components/queue-card'
import { upgradeStore } from '~/components/upgrade-dialog'
import { botChats, useWaitingIds } from '~/lib/home-db'
import { useDates, useLocale, useT } from '~/lib/i18n'
import { useMe } from '~/lib/me'
import { client, orpc } from '~/lib/orpc'
import { posthog } from '~/lib/posthog'
import { queryClient, showUntilSettled } from '~/lib/query-client'

type ChatPage = RouterOutputs['bots']['chat']
type Entry = ChatPage['entries'][number]
type Post = Extract<Entry, { type: 'post' }>
type Card = Extract<Entry, { type: 'cards' }>['cards'][number]
export type Quote = NonNullable<Post['replyTo']>
type BotStep =
  RouterOutputs['bots']['ask'] extends AsyncIterable<infer Step> ? Step : never

export const refreshBots = () =>
  queryClient.invalidateQueries({ queryKey: orpc.bots.key() })

/** The open chat's bot, for what its messages need of it: its name on a quote, its id on a reply. */
const ChatBot = createContext<HomeBot | null>(null)

/** The message the user is replying to, in the composer of its bot's chat. */
export const replyStore = createStore<{ bot: string; quote: Quote } | null>(
  null
)

const anchorOf = (id: string) => `bot-post-${id}`

/** The message a reply answers: whose it is and its first line; a click goes to it. */
export const ReplyQuote = ({
  botName,
  quote,
}: {
  botName: string
  quote: Quote
}) => {
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
const AnswerText = ({ text }: { text: string }) =>
  text.trim() && (
    <PostBubble>
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
    </PostBubble>
  )

const CLOCK_SKEW_MS = 60_000

const STATUS_ICONS: Record<Card['action']['status'], IconSvgElement> = {
  auto_done: Tick02Icon,
  dismissed: NextIcon,
  done: Tick02Icon,
  failed: Cancel01Icon,
  pending: Clock01Icon,
}

/** What the bot says in words, in its bubble; nothing to say draws nothing. */
const Speech = ({ children }: { children: ReactNode }) =>
  children ? (
    <PostBubble>
      <p>{children}</p>
    </PostBubble>
  ) : null

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
      <MessageBubble>
        {status && <p className="text-muted-foreground text-sm">{status}</p>}
        {headline === null ? (
          <Skeleton className="my-1 h-4 w-48" />
        ) : (
          <Title className="font-medium">{headline}</Title>
        )}
        {lead}
      </MessageBubble>
      {children}
      {at && <MessageTime>{dates.format(at, 'p')}</MessageTime>}
    </>
  )
}

export const DigestLead = ({ children }: { children: ReactNode }) => (
  <p>{children}</p>
)

/** When a message was written. */
const TimeOf = ({ at }: { at?: Date }) => {
  const dates = useDates()
  return at && <MessageTime>{dates.format(at, 'p')}</MessageTime>
}

/**
 * A bot's message: what it says in a bubble with the user's reaction on it, what it did or offers under it, then when.
 * The chat's bar names the bot, so no message does.
 */
const BotMessage = ({
  at,
  children,
  post,
}: {
  /** None while it is being written. */
  at?: Date
  children: ReactNode
  /** What it said in words: it can be reacted on, replied to and copied. */
  post?: Post
}) => (
  <Message from="assistant" id={post && anchorOf(post.id)}>
    <MessageMenu
      post={post}
      quote={post && { from: 'bot', id: post.id, text: post.text ?? '' }}
    >
      <ReactedPost value={post}>{children}</ReactedPost>
      <TimeOf at={at} />
    </MessageMenu>
  </Message>
)

const ReactedPost = createContext<Post | undefined>(undefined)

/** The bot's words in their bubble, the user's reaction over its edge when they are a post. */
const PostBubble = ({ children }: { children: ReactNode }) => {
  const post = use(ReactedPost)
  return (
    <MessageBubble>
      {children}
      {post && <ReactionPicker post={post} />}
    </MessageBubble>
  )
}

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
export const CardsTrace = ({ cards }: { cards: Card[] }) => {
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
  const waiting = useWaitingIds()
  return (
    <>
      {entry.counts && (
        <DigestHeader
          headline={digestHeadline(t, entry.counts.decisions)}
          lead={<DigestLead>{digestLead(t, entry.counts)}</DigestLead>}
        />
      )}
      {!entry.counts && <Speech>{cardsLine(t, entry.cards, waiting)}</Speech>}
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
      <PostBubble>
        <p data-mask>{entry.text}</p>
        {entry.replied !== null && (
          <p className="text-muted-foreground">
            {entry.replied ? t.bots.nudge.replied : t.bots.nudge.noReply}
          </p>
        )}
      </PostBubble>
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
  const waiting = useWaitingIds()
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
          <Speech>{cardsLine(t, entry.cards, waiting)}</Speech>
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

/** What the bot waits on now, after its last report: one more message of its own, its parts (`NowPart`) one under another. */
export const BotNow = ({ children }: { children: ReactNode }) => {
  const t = useT()
  return (
    <Message from="assistant" aria-label={t.bots.now}>
      <MessageContent>{children}</MessageContent>
    </Message>
  )
}

/** One part of it: words, a tool block, a list; a part with nothing to show takes no room. */
export const NowPart = ({ children }: { children: ReactNode }) => (
  <div className="flex flex-col gap-2.5 empty:hidden">{children}</div>
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

/** One bot's chat, oldest first; older days come on `fetchNextPage`. */
export const useBotChat = (bot: string) => {
  const chat = useInfiniteQuery(
    orpc.bots.chat.infiniteOptions({
      getNextPageParam: ({ earlier }) => earlier ?? undefined,
      initialPageParam: undefined as Date | undefined,
      input: (before) => ({ before, bot }),
    })
  )
  return {
    ...chat,
    entries: (chat.data?.pages ?? [])
      .toReversed()
      .flatMap(({ entries: page }) => page),
  }
}

/** How a bot's chat begins: it says what it looks after and how, in words computed here, so even an empty chat says what the bot is for. */
const BotIntro = ({ bot }: { bot: HomeBot }) => {
  const t = useT()
  if (!bot.own) {
    return (
      <BotMessage>
        <Speech>{t.bots.intro.fewmail}</Speech>
      </BotMessage>
    )
  }
  if (isBoardBot(bot)) {
    return (
      <BotMessage>
        <Speech>{t.bots.intro.board}</Speech>
      </BotMessage>
    )
  }
  if (needsPurpose(bot.own)) {
    return (
      <BotMessage>
        <MessageBubble>
          <p data-mask>{t.bots.purpose.intro(bot.name)}</p>
        </MessageBubble>
      </BotMessage>
    )
  }
  return (
    <BotMessage>
      <MessageBubble>
        <p data-mask>{t.bots.intro.own(bot.name)}</p>
        <BotJob bot={bot} />
        <p>
          {bot.own.enabled ? t.bots.intro.acts : t.bots.intro.asks}{' '}
          {t.bots.intro.change}
        </p>
      </MessageBubble>
    </BotMessage>
  )
}

/** Which mail is the bot's and what it does with it, quoted in its own words, in the chat's type like any quote. */
export const BotJob = ({ bot }: { bot: HomeBot }) => (
  <blockquote data-mask className="border-foreground/20 border-l-2 pl-3">
    {bot.job}
  </blockquote>
)

const INTRO_ID = 'intro'

/** Room left over the first unread message, so its day chip still shows above it. */
const UNREAD_PEEK_PX = 48

const firstUnreadOf = (
  shown: Entry[],
  since: Date | null,
  isIntroShown: boolean
) => {
  const unread =
    since &&
    shown.find(
      (entry) =>
        entry.at > since && !(entry.type === 'post' && entry.kind === 'message')
    )
  if (!unread) {
    return null
  }
  return unread === shown[0] && isIntroShown ? INTRO_ID : unread.id
}

/**
 * A chat opens at the first thing its bot said since the user last looked (its intro when all of it is new), when what
 * came since is taller than the chat; otherwise at its end. That moment is kept from when the chat opened: opening it
 * reads it, and the refreshed list says nothing is new.
 */
const useOpenAtUnread = (
  bot: HomeBot,
  shown: Entry[],
  { isIntroShown, isLoaded }: { isIntroShown: boolean; isLoaded: boolean }
) => {
  const [opening, setOpening] = useState<{
    since: Date | null
    target?: string | null
  }>({ since: bot.unread > 0 ? bot.unreadSince : null })
  const { target } = opening
  if (target === undefined && isLoaded) {
    setOpening({
      ...opening,
      target: firstUnreadOf(shown, opening.since, isIntroShown),
    })
  }
  const { scrollToMessage } = useMessageScroller()
  const ref = useRef<HTMLDivElement>(null)
  // Before paint, or the chat shows its end for a frame and jumps.
  useLayoutEffect(() => {
    const item = ref.current
    const viewport = item?.closest('[data-slot="message-scroller-viewport"]')
    if (!target || !item || !viewport) {
      return
    }
    const top =
      item.getBoundingClientRect().top -
      viewport.getBoundingClientRect().top +
      viewport.scrollTop
    // The intro even when it all fits: the suggestions over the composer come later and would push its first line out.
    if (
      target === INTRO_ID ||
      viewport.scrollHeight - top > viewport.clientHeight
    ) {
      scrollToMessage(target, { scrollMargin: UNREAD_PEEK_PX })
    }
  }, [scrollToMessage, target])
  return [ref, target] as const
}

/**
 * The chat with one bot, oldest first, older days on demand; `children` is what it waits on now, after its latest report.
 * Its parts are the page's `MessageScrollerContent` children, so it renders no box of its own; the message being sent anchors at the top while its answer streams in.
 */
export const BotTimeline = ({
  asking,
  bot,
  children,
}: {
  asking: Asking | null
  bot: HomeBot
  children?: ReactNode
}) => {
  const t = useT()
  const chat = useBotChat(bot.bot)
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage } = chat
  const waiting = useWaitingIds()
  // A report whose cards all wait no more (their email binned) has nothing left to say.
  const entries = chat.entries.filter(
    (entry) =>
      !(
        (entry.type === 'cards' ||
          (entry.type === 'digest' && !entry.counts)) &&
        entry.cards.every(
          ({ action }) => action.status === 'pending' && !waiting.has(action.id)
        )
      )
  )
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
  const isIntroShown = !!data && !hasNextPage
  const [unreadRef, opensAt] = useOpenAtUnread(
    bot,
    [...reported, ...shownSaid],
    {
      isIntroShown,
      isLoaded: !!data,
    }
  )
  const view = (entry: Entry) =>
    entry.id === opensAt ? (
      <MessageScrollerItem ref={unreadRef} messageId={entry.id}>
        <EntryView entry={entry} />
      </MessageScrollerItem>
    ) : (
      <EntryView entry={entry} />
    )

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
      {isIntroShown &&
        (opensAt === INTRO_ID ? (
          <MessageScrollerItem ref={unreadRef} messageId={INTRO_ID}>
            <BotIntro bot={bot} />
          </MessageScrollerItem>
        ) : (
          <BotIntro bot={bot} />
        ))}
      {reported.map((entry) => (
        <Fragment key={entry.id}>
          <DayOf entries={entries} entry={entry} />
          {view(entry)}
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
            view(entry)
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

export interface Ask {
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
