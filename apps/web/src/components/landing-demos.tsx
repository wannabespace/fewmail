import { Badge } from '@fewmail/ui/components/badge'
import { Button } from '@fewmail/ui/components/button'
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemTitle,
} from '@fewmail/ui/components/item'
import { Kbd } from '@fewmail/ui/components/kbd'
import {
  Message,
  MessageContent,
  MessageTime,
} from '@fewmail/ui/components/message'
import { cn } from '@fewmail/ui/lib/utils'
import {
  ArrowRight01Icon,
  ArrowUp02Icon,
  McpServerIcon,
  MinusSignIcon,
  Tick02Icon,
} from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { useHotkey } from '@tanstack/react-hotkeys'
import { Link } from '@tanstack/react-router'
import type { MotionStyle, MotionValue } from 'motion/react'
import {
  cubicBezier,
  motion,
  useInView,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
  useTransform,
} from 'motion/react'
import type { ReactNode } from 'react'
import { Fragment, useRef, useState } from 'react'

import { LogoMark } from '~/components/logo'
import { useLocale, useT } from '~/lib/i18n'

import { ImportanceDot } from './mail-meta'
import { CONTAINER, Reveal, StartButton, TrialNote } from './site'

const HOUSE = cubicBezier(0.32, 0.72, 0, 1)

type Fate = 'archived' | 'markedRead' | 'spam' | 'summarised' | 'unsubscribed'

/** Mail is shown in the language it was written in; only the agent's words are translated. */
const NOISE: { fate: Fate; from: string; snippet: string; subject: string }[] =
  [
    {
      fate: 'unsubscribed',
      from: 'Lumen Weekly',
      snippet: 'This week: a calendar for your calendar and…',
      subject: '10 tools you will never use',
    },
    {
      fate: 'spam',
      from: 'paypa1-billing.com',
      snippet: 'Confirm your details within 24 hours or…',
      subject: 'Your account has been limited',
    },
    {
      fate: 'archived',
      from: 'Parcelhub',
      snippet: 'Track your delivery: arriving between 9 and…',
      subject: 'Your parcel is on its way',
    },
    {
      fate: 'unsubscribed',
      from: 'Coursely',
      snippet: 'Your cart misses you. So do we. Finish…',
      subject: 'Last chance: 70% off ends tonight',
    },
    {
      fate: 'summarised',
      from: 'Taskboard',
      snippet: '“@sam can you take a look when you…',
      subject: 'Ivan mentioned you in 3 comments',
    },
    {
      fate: 'archived',
      from: 'Mira at Growthly',
      snippet: 'Hi Sam, I noticed your company is hiring…',
      subject: 'Quick question about your team',
    },
    {
      fate: 'markedRead',
      from: 'Linkwork',
      snippet: 'See who is looking at your profile this…',
      subject: 'You appeared in 14 searches',
    },
    {
      fate: 'archived',
      from: 'Cloudnest',
      snippet: 'Upgrade now to keep your files syncing…',
      subject: 'Your storage is 92% full',
    },
    {
      fate: 'unsubscribed',
      from: 'Webinarly',
      snippet: 'Join the live session now with…',
      subject: 'Starting in 10 minutes',
    },
    {
      fate: 'archived',
      from: 'Brew & Co',
      snippet: 'Thanks for your order. Flat white ×2…',
      subject: 'Receipt #48213',
    },
    {
      fate: 'unsubscribed',
      from: 'The Morning Edit',
      snippet: 'Markets are up, a new phone is out and…',
      subject: 'Five things to know today',
    },
    {
      fate: 'markedRead',
      from: 'Codehub',
      snippet: 'All checks have passed for commit 8a8ea60…',
      subject: '[web] Build passed on main',
    },
  ]

/** In the same order as `site.hero.queue`. */
const IMPORTANT = [
  {
    at: 2,
    draft: 'Hi Anna, signed and attached. See you Friday at ten. Best, Sam',
    from: 'Anna Kovacs',
    importance: 3,
    snippet: 'Could you send the signed contract back…',
    subject: 'Contract for Friday’s kickoff',
  },
  {
    at: 6,
    from: 'Northwind Studio',
    importance: 2,
    snippet: 'Please find attached the invoice for…',
    subject: 'October invoice',
  },
  {
    at: 10,
    draft:
      'Ciao Marco, giovedì va bene, ma possiamo fare alle 16? A presto, Sam',
    from: 'Marco Rossi',
    importance: 2,
    snippet: 'Would Thursday at 15:00 work for…',
    subject: 'Quarterly review',
  },
]

/** The inbox as it arrives: the important emails buried among the noise at their `at`. */
const INBOX = Array.from(
  { length: NOISE.length + IMPORTANT.length },
  (_, row) => {
    const important = IMPORTANT.findIndex(({ at }) => at === row)
    return important === -1
      ? {
          index: row - IMPORTANT.filter(({ at }) => at < row).length,
          kind: 'noise' as const,
        }
      : { index: important, kind: 'important' as const }
  }
)
/** Newest first: each row a little earlier than the one above it. */
const timeAt = (row: number) => {
  const minutes = 8 * 60 + 2 - row * 17
  return `${String(Math.floor(minutes / 60)).padStart(2, '0')}:${String(minutes % 60).padStart(2, '0')}`
}
const UNREAD = 4218
const HANDLED_TODAY = UNREAD - IMPORTANT.length

const SORT_START = 0.08
const SORT_END = 0.6
const OPEN_START = 0.6
const OPEN_END = 0.8
/** Where each line of copy beside the inbox takes over, halfway through its cross-fade. */
const PHASE_STARTS = [0, 0.11, 0.64]
/** The cross-fades between phases: a scroll that stops inside one glides on to the phase it was heading for. */
const FADES = [
  [0.06, 0.15],
  [0.6, 0.72],
] as const

const Parts = ({ parts }: { parts: (ReactNode | string)[] }) =>
  parts.map((part, index) => (
    // oxlint-disable-next-line react/no-array-index-key -- parts of one sentence never reorder
    <Fragment key={index}>{part}</Fragment>
  ))

/** Sets the translated `emphasis` (a part of `text`) in the accent italic. */
export const Emphasized = ({
  emphasis,
  text,
}: {
  emphasis: string
  text: string
}) => {
  const at = text.lastIndexOf(emphasis)
  if (at === -1) {
    return text
  }
  return (
    <>
      {text.slice(0, at)}
      <em className="text-primary italic">{emphasis}</em>
      {text.slice(at + emphasis.length)}
    </>
  )
}

const DESK = ['fewmail', 'important', 'later', 'quick', 'board'] as const
type DeskChat = (typeof DESK)[number] | 'made'
type Choice = 'send' | 'skip'

// Not `BotAvatar`: bot-list loads Home's collections, which a public page must not.
const DeskAvatar = ({
  chat,
  name,
  size = 'sm',
}: {
  chat: DeskChat
  name: string
  size?: 'md' | 'sm'
}) => (
  <span
    aria-hidden
    className={cn(
      'bg-popover ring-foreground/8 text-foreground/80 grid shrink-0 place-items-center rounded-full font-medium ring [&>svg]:size-4',
      size === 'md' ? 'size-8 text-sm' : 'size-6 text-xs'
    )}
  >
    {chat === 'fewmail' ? <LogoMark /> : name.charAt(0).toUpperCase()}
  </span>
)

const Count = ({ value }: { value: MotionValue<number> }) => {
  const locale = useLocale()
  const text = useTransform(value, (count) =>
    Math.round(count).toLocaleString(locale)
  )
  return (
    <motion.b className="text-foreground font-medium tabular-nums">
      {text}
    </motion.b>
  )
}

const MailLine = ({
  dot,
  end,
  from,
  snippet,
  subject,
}: {
  dot?: ReactNode
  end: ReactNode
  from: string
  snippet: string
  subject: string
}) => (
  <div className="relative grid h-(--row) grid-cols-[0.5rem_minmax(0,5.5rem)_minmax(0,1fr)_auto] items-center gap-3 px-4 text-sm sm:grid-cols-[0.5rem_minmax(0,8rem)_minmax(0,1fr)_auto] sm:px-5">
    <span className="bg-foreground/25 grid size-2 rounded-full">{dot}</span>
    <span className="truncate font-medium">{from}</span>
    <span className="text-muted-foreground truncate">
      <span className="text-foreground">{subject}</span> · {snippet}
    </span>
    <span className="grid justify-items-end text-xs *:col-start-1 *:row-start-1">
      {end}
    </span>
  </div>
)

const NoiseRow = ({
  gone,
  index,
  mail,
  row,
}: {
  gone: MotionValue<number>
  index: number
  mail: (typeof NOISE)[number]
  row: number
}) => {
  const t = useT().site.hero
  const local = useTransform(gone, (count) => count - index)
  const stamp = useTransform(local, [0, 0.3], [0, 1])
  const time = useTransform(stamp, (shown) => 1 - shown)
  const leave = useTransform(local, [0.3, 0.75], [0, 1], { ease: HOUSE })
  const fold = useTransform(local, [0.45, 1], [0, 1], { ease: HOUSE })
  const opacity = useTransform(leave, (left) => 1 - left)
  const scale = useTransform(leave, [0, 1], [1, 0.97])
  return (
    <motion.div
      className="h-[calc(var(--row)*(1-var(--fold)))] overflow-hidden border-b"
      style={{ '--fold': fold, opacity, scale } as MotionStyle}
    >
      <MailLine
        {...mail}
        end={
          <>
            <motion.time
              className="text-muted-foreground tabular-nums"
              style={{ opacity: time }}
            >
              {timeAt(row)}
            </motion.time>
            <motion.span style={{ opacity: stamp }}>
              <Badge
                variant={mail.fate === 'spam' ? 'destructive' : 'secondary'}
              >
                {t.fates[mail.fate]}
              </Badge>
            </motion.span>
          </>
        }
      />
    </motion.div>
  )
}

const ImportantRow = ({
  gone,
  index,
  mail,
  progress,
}: {
  gone: MotionValue<number>
  index: number
  mail: (typeof IMPORTANT)[number]
  progress: MotionValue<number>
}) => {
  const t = useT()
  const { hero } = t.site
  const noiseAbove = mail.at - index
  const lit = useTransform(gone, [noiseAbove - 0.2, noiseAbove + 0.6], [0, 1])
  const open = useTransform(
    progress,
    [OPEN_START + index * 0.03, OPEN_END + index * 0.03],
    [0, 1],
    { ease: HOUSE }
  )
  const more = useRef<HTMLDivElement>(null)
  const time = useTransform(lit, (shown) => 1 - shown)
  const lift = useTransform(open, [0, 0.2], [0, 1])
  const height = useTransform(
    open,
    (opened) => `${opened * (more.current?.scrollHeight ?? 0)}px`
  )
  const moreOpacity = useTransform(open, [0.4, 1], [0, 1])
  return (
    <div className="relative border-b">
      <motion.div
        className="bg-popover absolute inset-0"
        style={{ opacity: lift }}
      />
      <MailLine
        {...mail}
        dot={
          <motion.span
            className={cn(
              'rounded-full',
              mail.importance === 3 ? 'bg-destructive' : 'bg-primary'
            )}
            style={{ opacity: lit }}
          />
        }
        end={
          <>
            <motion.time
              className="text-muted-foreground tabular-nums"
              style={{ opacity: time }}
            >
              {timeAt(mail.at)}
            </motion.time>
            <motion.span
              className={cn(
                'font-medium whitespace-nowrap',
                mail.importance === 3 ? 'text-destructive' : 'text-primary'
              )}
              style={{ opacity: lit }}
            >
              {hero.queue[index]?.reason}
            </motion.span>
          </>
        }
      />
      <motion.div
        ref={more}
        className="relative h-(--open) overflow-hidden"
        style={{ '--open': height, opacity: moreOpacity } as MotionStyle}
      >
        <div className="flex flex-col gap-3 pr-4 pb-4 pl-9 sm:pr-5 sm:pl-10">
          <p className="font-serif text-base/relaxed">
            {hero.queue[index]?.summary}
          </p>
          <div className="flex gap-2">
            <Button size="sm" shortcut={<Kbd>⏎</Kbd>}>
              {mail.draft ? t.queue.send : hero.remind}
            </Button>
            <Button size="sm" variant="secondary" shortcut={<Kbd>S</Kbd>}>
              {t.queue.skip}
            </Button>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

const Phase = ({
  children,
  isActive,
  opacity,
  rise,
}: {
  children: ReactNode
  isActive: boolean
  opacity: MotionValue<number>
  rise: number
}) => {
  const translateY = useTransform(opacity, (shown) => (1 - shown) * rise)
  return (
    <motion.div
      inert={!isActive}
      className="col-start-1 row-start-1 flex flex-col gap-4 sm:gap-6"
      style={{ opacity, translateY }}
    >
      {children}
    </motion.div>
  )
}

/** The hero: scrolling lets the agent read the inbox until three emails are left. */
export const InboxStory = () => {
  const strings = useT()
  const t = strings.site.hero
  const important = strings.starterBots.important.name
  const locale = useLocale()
  const story = useRef<HTMLElement>(null)
  const { scrollYProgress: progress } = useScroll({
    offset: ['start start', 'end end'],
    target: story,
  })
  const gone = useTransform(progress, [SORT_START, SORT_END], [0, NOISE.length])
  const handled = useTransform(
    gone,
    (count) => (count / NOISE.length) * HANDLED_TODAY
  )
  const unread = useTransform(handled, (count) => UNREAD - count)
  const phases = [
    useTransform(progress, [0.06, 0.12], [1, 0]),
    useTransform(progress, [0.09, 0.15, 0.6, 0.67], [0, 1, 1, 0]),
    useTransform(progress, [0.64, 0.72], [0, 1]),
  ] as const
  const [phase, setPhase] = useState(0)
  const isReduced = useReducedMotion()
  const heading = useRef(1)
  const idle = useRef<ReturnType<typeof setTimeout>>(undefined)
  useMotionValueEvent(progress, 'change', (at) => {
    setPhase(PHASE_STARTS.findLastIndex((start) => at >= start))
    heading.current =
      Math.sign(at - (progress.getPrevious() ?? at)) || heading.current
    clearTimeout(idle.current)
    idle.current = setTimeout(() => {
      const fade = FADES.find(
        ([from, to]) => at > from + 0.002 && at < to - 0.002
      )
      const section = story.current
      if (!fade || !section) {
        return
      }
      const rest = heading.current > 0 ? fade[1] : fade[0]
      const { height, top } = section.getBoundingClientRect()
      scrollTo({
        behavior: isReduced ? 'instant' : 'smooth',
        top: scrollY + top + rest * (height - innerHeight),
      })
    }, 160)
  })
  const counter = (
    <p className="text-muted-foreground flex items-center gap-2 font-serif">
      <span className="bg-primary size-2 rounded-full" />
      <span>
        <Parts parts={t.unreadInbox({ count: <Count value={unread} /> })} />
      </span>
    </p>
  )

  return (
    <section ref={story} className="relative h-[340svh] md:h-[360svh]">
      <div className="sticky top-16 h-[calc(100svh-4rem)] min-h-136 overflow-hidden">
        <div
          className={cn(
            CONTAINER,
            'grid h-full grid-rows-[auto_minmax(0,1fr)] gap-3 pt-5 md:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] md:grid-rows-1 md:items-center md:gap-10 md:pt-0'
          )}
        >
          <div className="grid">
            <Phase isActive={phase === 0} opacity={phases[0]} rise={-12}>
              {counter}
              <h1 className="text-display sm:text-hero font-serif tracking-tight text-balance">
                {t.title}
              </h1>
              <p className="text-brief text-foreground/75 max-w-lg font-serif text-pretty">
                {t.lead}
              </p>
              <div className="flex flex-col gap-3">
                <div>
                  <StartButton>{t.start}</StartButton>
                </div>
                <TrialNote />
              </div>
            </Phase>
            <Phase isActive={phase === 1} opacity={phases[1]} rise={12}>
              {counter}
              <h2 className="text-display sm:text-hero font-serif tracking-tight text-balance">
                <Emphasized {...t.reading} text={t.reading.title} />
              </h2>
              <p className="text-brief text-foreground/75 max-w-lg font-serif text-pretty">
                {t.reading.lead}
              </p>
            </Phase>
            <Phase isActive={phase === 2} opacity={phases[2]} rise={12}>
              <p className="text-primary text-sm font-medium">
                {t.needs.tag(important)}
              </p>
              <h2 className="text-display sm:text-hero font-serif tracking-tight text-balance">
                <Emphasized {...t.needs} text={t.needs.title} />
              </h2>
              <p className="text-brief text-foreground/75 max-w-lg font-serif text-pretty">
                {t.needs.lead(HANDLED_TODAY.toLocaleString(locale), important)}
              </p>
              <div className="flex flex-wrap gap-2">
                <StartButton>{t.start}</StartButton>
                <Button
                  size="lg"
                  variant="secondary"
                  render={<Link to="/" hash="bots" />}
                >
                  {t.seeBots}
                </Button>
              </div>
            </Phase>
          </div>
          <div
            inert
            aria-hidden
            className="flex min-h-0 items-center justify-center pb-4 md:h-full md:pb-0"
          >
            <div className="bg-background ring-foreground/6 flex h-full max-h-160 w-full max-w-xl flex-col overflow-hidden rounded-3xl shadow-sm ring [--row:--spacing(12)] sm:[--row:--spacing(13)] md:h-[calc(100%-3rem)]">
              <div className="flex h-13 shrink-0 items-center justify-between gap-4 border-b px-4 text-sm sm:px-5">
                {phase === 2 ? (
                  <span className="flex items-center gap-2 font-medium">
                    <DeskAvatar chat="important" name={important} />
                    {important}
                  </span>
                ) : (
                  <span className="font-medium">{t.inbox}</span>
                )}
                <span className="text-muted-foreground">
                  <Parts
                    parts={
                      phase === 2
                        ? t.needYou({ count: IMPORTANT.length })
                        : t.unread({ count: <Count value={unread} /> })
                    }
                  />
                </span>
              </div>
              <div className="min-h-0 flex-1 overflow-hidden mask-b-from-75%">
                {INBOX.map(({ index, kind }, row) => {
                  if (kind === 'important') {
                    const mail = IMPORTANT[index]
                    return (
                      mail && (
                        <ImportantRow
                          key={mail.from}
                          gone={gone}
                          index={index}
                          mail={mail}
                          progress={progress}
                        />
                      )
                    )
                  }
                  const mail = NOISE[index]
                  return (
                    mail && (
                      <NoiseRow
                        key={mail.subject}
                        gone={gone}
                        index={index}
                        mail={mail}
                        row={row}
                      />
                    )
                  )
                })}
              </div>
              <p className="text-muted-foreground m-3 flex shrink-0 items-center gap-2 rounded-xl border border-dashed px-3.5 py-2.5 text-xs">
                <HugeiconsIcon
                  icon={Tick02Icon}
                  strokeWidth={2}
                  className="text-primary size-3.5"
                />
                <span>
                  <Parts
                    parts={t.handled({ count: <Count value={handled} /> })}
                  />
                </span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

/** Each problem is struck through as it scrolls past the middle of the screen. */
export const Ledger = () => (
  <div className="mt-12 border-t sm:mt-16">
    {useT().site.gone.rows.map(({ fix, problem }) => (
      <div
        key={problem}
        className="grid gap-x-12 gap-y-4 border-b py-6 sm:py-8 md:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)] md:items-center"
      >
        <p className="text-display font-serif tracking-tight text-balance">
          <span className="strike-on-scroll">{problem}</span>
        </p>
        <div className="motion-safe:animate-in fade-in slide-in-from-bottom-2 fill-mode-both flex gap-3 [animation-range:cover_54%_cover_68%] [animation-timeline:view()]">
          <HugeiconsIcon
            icon={Tick02Icon}
            strokeWidth={2}
            className="text-primary mt-1 size-4.5 shrink-0"
          />
          <p className="text-foreground/75 max-w-md text-pretty">{fix}</p>
        </div>
      </div>
    ))}
  </div>
)

/** Mail on the desk keeps the language it was written in, like the hero's. */
const COLLECTED = [
  { at: '07:52', from: 'Skyline Air', subject: 'Check-in is open: LIS → BER' },
  {
    at: '07:20',
    from: 'Taskboard',
    subject: 'Ivan mentioned you in 3 comments',
  },
  { at: '06:48', from: 'Cityparking', subject: 'Your permit renews on Dec 1' },
  { at: '06:05', from: 'Bookshelf', subject: 'Your hold is ready to pick up' },
]
const TIDIED: { fate: Fate; from: string; subject: string }[] = [
  {
    fate: 'unsubscribed',
    from: 'Lumen Weekly',
    subject: '10 tools you will never use',
  },
  {
    fate: 'archived',
    from: 'Mira at Growthly',
    subject: 'Quick question about your team',
  },
  {
    fate: 'unsubscribed',
    from: 'Coursely',
    subject: 'Last chance: 70% off ends tonight',
  },
  {
    fate: 'markedRead',
    from: 'Linkwork',
    subject: 'You appeared in 14 searches',
  },
]
const TIDIED_TODAY = 38
const NEW_SINCE = 48
const FROM_PEOPLE = 5

const DESK_UNREAD: Record<DeskChat, number> = {
  board: 2,
  fewmail: 1,
  important: IMPORTANT.length,
  later: COLLECTED.length,
  made: 0,
  quick: 1,
}
const LAST_AT: Record<DeskChat, string> = {
  board: '07:31',
  fewmail: '08:14',
  important: '08:12',
  later: '07:52',
  made: '08:15',
  quick: '08:02',
}

const Said = ({
  children,
  from = 'assistant',
  time,
}: {
  children: ReactNode
  from?: 'assistant' | 'user'
  time: string
}) => (
  <Message from={from}>
    <MessageContent>
      {children}
      <MessageTime>{time}</MessageTime>
    </MessageContent>
  </Message>
)

const DeskList = ({ children }: { children: ReactNode }) => (
  <div className="bg-popover ring-foreground/6 overflow-hidden rounded-2xl ring">
    {children}
  </div>
)

const DeskRow = ({
  end,
  from,
  subject,
}: {
  end: ReactNode
  from: string
  subject: string
}) => (
  <Item variant="grouped" size="sm">
    <ItemContent>
      <ItemTitle>{from}</ItemTitle>
      <ItemDescription>{subject}</ItemDescription>
    </ItemContent>
    <ItemActions>{end}</ItemActions>
  </Item>
)

const settledAs = (choice: Choice, mail: (typeof IMPORTANT)[number]) => {
  if (choice === 'skip') {
    return 'skip'
  }
  return mail.draft ? 'send' : 'remind'
}

const ImportantChat = ({
  decided,
  onAgain,
  onDecide,
}: {
  decided: Choice[]
  onAgain: () => void
  onDecide: (choice: Choice) => void
}) => {
  const t = useT()
  const { bots, hero } = t.site
  const left = IMPORTANT.length - decided.length
  const active = IMPORTANT[decided.length]
  const card = hero.queue[decided.length]
  return (
    <>
      <Said time={LAST_AT.important}>
        {t.bots.cards.pending(IMPORTANT.length)}
      </Said>
      {decided.map((choice, index) => {
        const mail = IMPORTANT[index]
        return (
          mail && (
            <p
              key={mail.from}
              className="text-muted-foreground flex items-center gap-1.5 text-sm"
            >
              <HugeiconsIcon
                icon={choice === 'skip' ? MinusSignIcon : Tick02Icon}
                strokeWidth={2}
                className={cn('size-4', choice === 'send' && 'text-primary')}
              />
              <span className="text-foreground font-medium">{mail.from}</span>
              {bots.settled[settledAs(choice, mail)]}
            </p>
          )
        )
      })}
      {active ? (
        <motion.article
          key={active.from}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, ease: HOUSE }}
          className="bg-popover ring-foreground/10 flex flex-col gap-3 rounded-2xl p-4 shadow-sm ring"
        >
          <div className="flex min-w-0 items-center gap-2.5 text-sm">
            <ImportanceDot
              importance={active.importance}
              reason={card?.reason}
            />
            <span className="shrink-0 font-medium">{active.from}</span>
            <span className="text-muted-foreground truncate">
              {active.subject}
            </span>
          </div>
          <p className="font-serif text-base/relaxed">{card?.summary}</p>
          <p
            className={cn(
              'text-xs font-medium',
              active.importance === 3 ? 'text-destructive' : 'text-primary'
            )}
          >
            {card?.reason}
          </p>
          <div className="bg-secondary/60 rounded-xl px-3.5 py-2.5">
            <p className="text-muted-foreground mb-1 text-xs">
              {active.draft ? t.queue.draftedInVoice : hero.willDo}
            </p>
            <p className="text-foreground/80 font-serif text-base/relaxed">
              {active.draft ?? hero.remindPlan}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              size="sm"
              onClick={() => onDecide('send')}
              shortcut={<Kbd>⏎</Kbd>}
            >
              {active.draft ? t.queue.send : hero.remind}
            </Button>
            <Button
              size="sm"
              variant="secondary"
              onClick={() => onDecide('skip')}
              shortcut={<Kbd>S</Kbd>}
            >
              {t.queue.skip}
            </Button>
          </div>
        </motion.article>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, ease: HOUSE }}
          className="flex flex-col items-start gap-3"
        >
          <Said time="08:16">{t.today.allDone}</Said>
          <Button size="sm" variant="secondary" onClick={onAgain}>
            {bots.again}
          </Button>
        </motion.div>
      )}
      {left > 1 && (
        <DeskList>
          {IMPORTANT.slice(decided.length + 1).map((mail, index) => (
            <DeskRow
              key={mail.from}
              from={mail.from}
              subject={mail.subject}
              end={
                <span className="text-primary text-xs font-medium whitespace-nowrap">
                  {hero.queue[decided.length + 1 + index]?.reason}
                </span>
              }
            />
          ))}
        </DeskList>
      )}
    </>
  )
}

const FewmailChat = ({
  isMade,
  onMake,
}: {
  isMade: boolean
  onMake: () => void
}) => {
  const t = useT()
  const { fewmail } = t.site.bots
  return (
    <>
      <Said time="08:00">
        <span className="font-medium">
          {t.today.headline(IMPORTANT.length)}
        </span>
        <span>
          {fewmail.digest(NEW_SINCE, FROM_PEOPLE)}{' '}
          {t.today.byBots(NEW_SINCE - FROM_PEOPLE - 2)}
        </span>
      </Said>
      <Said from="user" time="08:14">
        {fewmail.ask}
      </Said>
      {isMade ? (
        <Said time={LAST_AT.made}>{t.bots.created}</Said>
      ) : (
        <Said time={LAST_AT.fewmail}>
          <span>{fewmail.proposal}</span>
          <Item variant="muted" size="xs">
            <DeskAvatar chat="made" name={fewmail.botName} />
            <ItemContent>
              <ItemTitle>{fewmail.botName}</ItemTitle>
              <ItemDescription>
                {t.bots.effect.mark_read} · {t.bots.status.asks}
              </ItemDescription>
            </ItemContent>
          </Item>
          <div>
            <Button size="sm" onClick={onMake}>
              {fewmail.approve}
            </Button>
          </div>
        </Said>
      )}
    </>
  )
}

const BoardChat = () => {
  const t = useT()
  const { board } = t.site.bots
  return (
    <>
      <Said time={LAST_AT.board}>{t.bots.promises(2)}</Said>
      {(['owed', 'promised', 'coming'] as const).map((section) => (
        <div key={section} className="flex flex-col gap-1.5">
          <p className="text-muted-foreground text-xs font-medium">
            {t.board.section[section]}
          </p>
          <DeskList>
            <DeskRow
              from={board[section].text}
              subject={board[section].state}
              end={
                <HugeiconsIcon
                  icon={Tick02Icon}
                  strokeWidth={2}
                  className="text-muted-foreground size-4"
                />
              }
            />
          </DeskList>
        </div>
      ))}
    </>
  )
}

const DeskChatBody = ({
  chat,
  decided,
  isMade,
  onAgain,
  onDecide,
  onMake,
}: {
  chat: DeskChat
  decided: Choice[]
  isMade: boolean
  onAgain: () => void
  onDecide: (choice: Choice) => void
  onMake: () => void
}) => {
  const t = useT()
  const { bots, hero } = t.site
  if (chat === 'important') {
    return (
      <ImportantChat decided={decided} onAgain={onAgain} onDecide={onDecide} />
    )
  }
  if (chat === 'fewmail') {
    return <FewmailChat isMade={isMade} onMake={onMake} />
  }
  if (chat === 'board') {
    return <BoardChat />
  }
  if (chat === 'later') {
    return (
      <>
        <Said time={LAST_AT.later}>{bots.later}</Said>
        <DeskList>
          {COLLECTED.map((mail) => (
            <DeskRow
              key={mail.from}
              {...mail}
              end={
                <time className="text-muted-foreground text-xs tabular-nums">
                  {mail.at}
                </time>
              }
            />
          ))}
        </DeskList>
      </>
    )
  }
  if (chat === 'quick') {
    return (
      <>
        <Said time="07:40">{t.bots.cards.autoDone(TIDIED_TODAY)}</Said>
        <DeskList>
          {TIDIED.map((mail) => (
            <DeskRow
              key={mail.from}
              {...mail}
              end={<Badge variant="secondary">{hero.fates[mail.fate]}</Badge>}
            />
          ))}
        </DeskList>
        <Said time={LAST_AT.quick}>{bots.quick}</Said>
      </>
    )
  }
  return (
    <Said time={LAST_AT.made}>
      <span>{t.bots.intro.own(bots.fewmail.botName)}</span>
      <span className="font-serif text-base/relaxed italic">
        {bots.fewmail.ask}
      </span>
      <span>{t.bots.intro.asks}</span>
    </Said>
  )
}

/** Home as it is: the bots down the side, the open one's chat beside them, `[` / `]` and ⏎ / S as in the app. */
export const BotDesk = () => {
  const t = useT()
  const { bots } = t.site
  const desk = useRef<HTMLDivElement>(null)
  const isInView = useInView(desk, { amount: 0.4 })
  const [open, setOpen] = useState<DeskChat>('important')
  const [seen, setSeen] = useState<DeskChat[]>(['important'])
  const [decided, setDecided] = useState<Choice[]>([])
  const [isMade, setIsMade] = useState(false)
  const chats: DeskChat[] = isMade ? [...DESK, 'made'] : [...DESK]
  const left = IMPORTANT.length - decided.length
  const names: Record<DeskChat, string> = {
    board: t.starterBots.board.name,
    fewmail: t.bots.fewmail,
    important: t.starterBots.important.name,
    later: t.starterBots.later.name,
    made: bots.fewmail.botName,
    quick: t.starterBots.quick.name,
  }
  const jobs: Record<DeskChat, string> = {
    board: t.bots.effect.promises,
    fewmail: t.bots.fewmailJob,
    important: t.starterBots.important.instruction,
    later: t.starterBots.later.instruction,
    made: bots.fewmail.ask,
    quick: t.starterBots.quick.instruction,
  }
  const lines: Record<DeskChat, string> = {
    board: t.bots.promises(2),
    fewmail: isMade ? t.bots.created : bots.fewmail.proposal,
    important: left > 0 ? t.bots.cards.pending(left) : t.today.allDone,
    later: bots.later,
    made: t.bots.intro.asks,
    quick: bots.quick,
  }
  const show = (chat: DeskChat) => {
    setOpen(chat)
    setSeen((done) => (done.includes(chat) ? done : [...done, chat]))
  }
  const step = (by: number) =>
    show(
      chats[(chats.indexOf(open) + by + chats.length) % chats.length] ?? open
    )
  const decide = (choice: Choice) =>
    setDecided((done) =>
      done.length < IMPORTANT.length ? [...done, choice] : done
    )
  const make = () => {
    setIsMade(true)
    setSeen((done) => done.filter((chat) => chat !== 'made'))
  }
  const deciding = { enabled: isInView && open === 'important' && left > 0 }
  useHotkey('[', () => step(-1), { enabled: isInView })
  useHotkey(']', () => step(1), { enabled: isInView })
  useHotkey('Enter', () => decide('send'), deciding)
  useHotkey('S', () => decide('skip'), deciding)
  const waiting = open === 'important' && left > 0

  return (
    <Reveal className="mt-12">
      <div
        ref={desk}
        className="bg-background ring-foreground/6 grid h-160 overflow-hidden rounded-3xl shadow-sm ring sm:grid-cols-[15rem_minmax(0,1fr)] lg:grid-cols-[17rem_minmax(0,1fr)]"
      >
        <nav
          aria-label={t.bots.title}
          className="flex gap-1 overflow-x-auto border-b p-2 sm:flex-col sm:overflow-visible sm:border-e sm:border-b-0"
        >
          <p className="text-muted-foreground hidden px-2 pt-1 pb-2 text-xs font-medium sm:block">
            {t.bots.title}
          </p>
          {chats.map((chat) => {
            const unread = seen.includes(chat) ? 0 : DESK_UNREAD[chat]
            return (
              <button
                key={chat}
                type="button"
                aria-current={open === chat || undefined}
                aria-label={names[chat]}
                onClick={() => show(chat)}
                className="text-foreground/75 hover:bg-accent aria-current:bg-secondary aria-current:text-foreground focus-visible:focus-ring flex shrink-0 cursor-pointer items-center gap-2.5 rounded-lg p-1.5 text-left text-sm outline-none sm:w-full sm:px-2"
              >
                <DeskAvatar chat={chat} name={names[chat]} />
                <span className="hidden min-w-0 flex-1 flex-col sm:flex">
                  <span className="flex items-center gap-1.5">
                    <span className="text-foreground min-w-0 flex-1 truncate font-medium">
                      {names[chat]}
                    </span>
                    <span className="text-muted-foreground text-2xs shrink-0 tabular-nums">
                      {LAST_AT[chat]}
                    </span>
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="text-muted-foreground min-w-0 flex-1 truncate text-xs">
                      {lines[chat]}
                    </span>
                    {unread > 0 && (
                      <span className="bg-primary text-primary-foreground shrink-0 rounded-full px-1.5 text-xs/4 font-medium tabular-nums">
                        {unread}
                      </span>
                    )}
                  </span>
                </span>
              </button>
            )
          })}
        </nav>
        <section className="flex min-h-0 min-w-0 flex-col">
          <div className="flex h-14 shrink-0 items-center gap-3 border-b px-4">
            <DeskAvatar chat={open} name={names[open]} size="md" />
            <span className="flex min-w-0 flex-col">
              <span className="truncate text-sm font-medium">
                {names[open]}
              </span>
              <span
                className={cn(
                  'truncate text-xs',
                  waiting ? 'text-primary' : 'text-muted-foreground'
                )}
              >
                {waiting ? t.bots.status.waiting(left) : t.bots.status.watching}
              </span>
            </span>
          </div>
          <p className="text-muted-foreground flex h-9 shrink-0 items-center border-b px-4 text-xs">
            <span className="truncate">{jobs[open]}</span>
          </p>
          <motion.div
            key={open}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25, ease: HOUSE }}
            className="flex min-h-0 flex-1 flex-col justify-end gap-3 overflow-hidden mask-t-from-90% p-4 *:shrink-0 sm:px-6"
          >
            <DeskChatBody
              chat={open}
              decided={decided}
              isMade={isMade}
              onAgain={() => setDecided([])}
              onDecide={decide}
              onMake={make}
            />
          </motion.div>
          <div inert className="shrink-0 px-4 pb-4 sm:px-6">
            <div className="bg-popover ring-foreground/8 text-muted-foreground flex h-11 items-center gap-2 rounded-2xl ps-4 pe-1.5 text-sm shadow-xs ring">
              <span className="min-w-0 flex-1 truncate">
                {t.bots.composer(names[open])}
              </span>
              <span className="bg-primary/50 text-primary-foreground grid size-8 place-items-center rounded-xl">
                <HugeiconsIcon
                  icon={ArrowUp02Icon}
                  strokeWidth={2}
                  className="size-4"
                />
              </span>
            </div>
          </div>
        </section>
      </div>
    </Reveal>
  )
}

/** The three things a bot is, under the desk. */
export const BotPoints = () => (
  <Reveal className="mt-12 grid gap-8 md:grid-cols-3">
    {useT().site.bots.points.map(({ description, title }) => (
      <div key={title} className="flex flex-col gap-3 border-t pt-6">
        <h3 className="font-serif text-xl tracking-tight">{title}</h3>
        <p className="text-muted-foreground text-sm/relaxed text-pretty">
          {description}
        </p>
      </div>
    ))}
  </Reveal>
)

const MCP_CLIENTS = ['Claude', 'ChatGPT', 'Claude Code', 'Cursor']

/** An assistant answering from the mail through Fewmail's MCP tools. */
export const McpShowcase = () => {
  const t = useT().site
  return (
    <div className="mt-12 grid gap-10 md:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] md:items-center">
      <div className="flex flex-col gap-6">
        <p className="text-muted-foreground text-brief font-serif text-pretty">
          {t.mcp.lead}
        </p>
        <p className="flex flex-wrap items-center gap-2 text-sm">
          <span className="text-muted-foreground mr-1">{t.mcp.clients}</span>
          {MCP_CLIENTS.map((client) => (
            <Badge key={client} variant="secondary">
              {client}
            </Badge>
          ))}
        </p>
        <div className="flex flex-col items-start gap-3">
          <Button size="lg" variant="secondary" render={<Link to="/mcp" />}>
            {t.mcp.setup}
            <HugeiconsIcon
              icon={ArrowRight01Icon}
              strokeWidth={2}
              data-icon="inline-end"
            />
          </Button>
          <p className="text-muted-foreground text-sm">{t.mcp.free}</p>
        </div>
      </div>
      <div
        inert
        className="bg-background ring-foreground/6 flex flex-col gap-4 rounded-3xl p-5 ring sm:p-8"
      >
        <p className="bg-secondary ml-auto max-w-[85%] rounded-2xl rounded-br-md px-4 py-2.5 text-sm">
          {t.mcp.question}
        </p>
        <div className="flex flex-wrap gap-2">
          {['list_mail', 'read_thread'].map((tool) => (
            <span
              key={tool}
              className="text-muted-foreground ring-foreground/8 flex items-center gap-1.5 rounded-lg px-2.5 py-1 font-mono text-xs ring"
            >
              <HugeiconsIcon
                icon={McpServerIcon}
                strokeWidth={2}
                className="text-primary size-3.5"
              />
              fewmail · {tool}
            </span>
          ))}
        </div>
        <p className="text-brief font-serif text-pretty">{t.mcp.answer}</p>
      </div>
    </div>
  )
}

const PLACES = ['Gmail', 'Telegram', 'WhatsApp', 'Claude', 'ChatGPT']

export const TrustBand = () => {
  const t = useT().site.trust
  return (
    <section className={cn(CONTAINER, 'py-14 sm:py-20')}>
      <div className="bg-foreground text-background flex flex-col gap-12 rounded-4xl px-6 py-14 sm:gap-16 sm:px-14 sm:py-20">
        <div className="flex max-w-3xl flex-col gap-5">
          <p className="text-background/60 text-sm font-medium">{t.label}</p>
          <h2 className="text-display sm:text-hero font-serif tracking-tight text-balance">
            <Emphasized emphasis={t.emphasis} text={t.title} />
          </h2>
        </div>
        <div className="grid gap-8 md:grid-cols-3">
          {t.vows.map(({ description, title }) => (
            <div
              key={title}
              className="border-background/15 flex flex-col gap-3 border-t pt-6"
            >
              <h3 className="font-serif text-xl tracking-tight">{title}</h3>
              <p className="text-background/65 text-sm/relaxed text-pretty">
                {description}
              </p>
            </div>
          ))}
        </div>
        <p className="text-background/65 flex flex-wrap items-center gap-2 text-sm">
          <span className="mr-1">{t.places}</span>
          {PLACES.map((place) => (
            <span
              key={place}
              className="bg-background/10 text-background rounded-full px-3 py-1"
            >
              {place}
            </span>
          ))}
        </p>
      </div>
    </section>
  )
}
