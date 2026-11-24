import type { RouterOutputs } from '@fewmail/api/router'
import { botOfCard } from '@fewmail/shared/agent'
import type { Messages } from '@fewmail/shared/i18n'
import {
  MessageScroller,
  MessageScrollerButton,
  MessageScrollerContent,
  MessageScrollerProvider,
  MessageScrollerViewport,
} from '@fewmail/ui/components/message-scroller'
import { cn } from '@fewmail/ui/lib/utils'
import { useLiveQuery } from '@tanstack/react-db'
import { useHotkey } from '@tanstack/react-hotkeys'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { differenceInMinutes, isToday, subDays } from 'date-fns'
import { useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import { toast } from 'sonner'
import { z } from 'zod/mini'

import { useBoard, useBoardHints } from '~/components/board'
import {
  BotNow,
  NowPart,
  BotTimeline,
  useAskBot,
  useReadBot,
} from '~/components/bot-chat'
import { BotComposer } from '~/components/bot-composer'
import { BotHeader } from '~/components/bot-header'
import {
  BotAvatar,
  isBoardBot,
  openBotIdOf,
  useBots,
} from '~/components/bot-list'
import type { HomeBot } from '~/components/bot-list'
import {
  BoardNow,
  CardGroups,
  HomeHeader,
  openWorthRow,
  PickedActions,
  QuietWork,
  SenderQuestions,
  StaleCards,
  useKindGroups,
  WorthKnowing,
  worthRowsOf,
  worthStop,
} from '~/components/bot-now'
import type { WorthRow } from '~/components/bot-now'
import { BotProfile } from '~/components/bot-profile'
import {
  collapseExpanded,
  expandRow,
  showRow,
  useExpandedRow,
  useIsThreadExpanded,
} from '~/components/expand-row'
import { useJournal } from '~/components/journal'
import { KeyHints } from '~/components/key-hints'
import { ChatScroller } from '~/components/pane-rows'
import type { RowPlace } from '~/components/pane-rows'
import {
  isProposal,
  ProposalsReview,
  useProposals,
} from '~/components/proposals'
import { QueueCard, useCardActions } from '~/components/queue-card'
import type { QueueItem } from '~/components/queue-card'
import { closeSender, useIsSenderShown } from '~/components/sender-card'
import { SenderSidebar } from '~/components/sender-stack'
import { ReaderSidebar } from '~/components/thread-link'
import {
  botChats,
  ownBots,
  queueCards,
  todayLists,
  useToday,
  useWaiting,
} from '~/lib/home-db'
import { useT } from '~/lib/i18n'
import { connectedApps } from '~/lib/lists-db'
import { isReadingFirstTime } from '~/lib/mail-db'
import { client, orpc } from '~/lib/orpc'
import { posthog } from '~/lib/posthog'
import { showUntilSettled, warmQuery } from '~/lib/query-client'
import { holdClicksUntilMove, STILL_POINTER_GUARD } from '~/lib/still-pointer'
import { toastUndo } from '~/lib/undo'

type Today = RouterOutputs['today']['get']

const idsOf = (items: QueueItem[]) =>
  items.map(({ action }) => action.id).join(',')

/** `O` opens the email of the cursor's card or worth-knowing row. */
const useOpenKey = (
  worthRow: WorthRow | undefined,
  card: QueueItem | undefined,
  isWalking: boolean
) => {
  const row =
    worthRow ??
    (card?.message && {
      id: card.action.id,
      threadId: card.message.threadId,
    })
  useHotkey('O', () => row && openWorthRow(row), {
    enabled: isWalking && !!row,
  })
}

/** ⏎ on a card: one with an email opens it in the sidebar, where its proposal waits; one without says yes. */
const primaryHints = (t: Messages, item: QueueItem): [string, string][] => [
  ['⏎', item.message ? t.keys.open : t.keys.approve],
]

const homeHints = (
  t: Messages,
  state: {
    alike: number
    board: [string, string][] | null
    isOnWorth: boolean
    picked: number
    selected: QueueItem | undefined
    stale: number
    tidy: number
    today: Today | undefined
  }
): [string, string][] => {
  const bots: [string, string][] = [
    ['[ / ]', t.keys.period],
    ['/', t.keys.reply],
    ['P', t.bots.profile],
  ]
  if (state.board) {
    return [...state.board, ...bots]
  }
  if (state.picked > 0) {
    return [
      ['J / K', t.keys.move],
      ['X', t.keys.pick],
      ['⏎', t.keys.approvePicked(state.picked)],
      ['S', t.keys.skip],
      ['⌫', t.keys.trash],
      ['esc', t.keys.unpick],
    ]
  }
  return [
    ...(state.selected
      ? [
          ['J / K', t.keys.move] as [string, string],
          ...primaryHints(t, state.selected),
        ]
      : []),
    ...(state.isOnWorth
      ? [
          ['J / K', t.keys.move] as [string, string],
          ['⏎', t.keys.open] as [string, string],
          ['E', t.keys.archive] as [string, string],
          ['⌫', t.keys.trash] as [string, string],
        ]
      : []),
    ...(state.alike > 1
      ? [['⇧⏎', t.keys.approveAll(state.alike)] as [string, string]]
      : []),
    ...(state.selected
      ? [
          ['S', t.keys.skip] as [string, string],
          ['⌫', t.keys.trash] as [string, string],
          ['X', t.keys.pick] as [string, string],
        ]
      : []),
    ...(state.stale > 0 ? [['⇧S', t.queue.skipStale] as [string, string]] : []),
    ...(state.tidy > 0 ? [['T', t.today.tidy.run] as [string, string]] : []),
    ...(state.today?.newSenders.length
      ? [
          ['V', t.nav.personMail] as [string, string],
          ['A', t.today.newSender.archive] as [string, string],
          ['U', t.actionKind.unsubscribe] as [string, string],
          ['I', t.today.newSender.keep] as [string, string],
        ]
      : []),
    ...bots,
  ]
}

const STALE_DAYS = 7
/** Coming back to the tab after this long is a new look at Home: what came since is marked new. */
const AWAY_MINUTES = 10

/** Records each real look at Home (opening it, or coming back to the tab after a while) and hands back the look before it. */
const useVisits = (onVisit: () => Promise<unknown>) => {
  const [seenAt, setSeenAt] = useState<Date | null>(null)
  const { mutate: open } = useMutation(
    orpc.today.open.mutationOptions({
      onSuccess: (visit) => {
        setSeenAt(visit.seenAt)
        // The first look on a new day moves the catch-up window.
        if (visit.seenAt && !isToday(visit.seenAt)) {
          void onVisit()
        }
      },
    })
  )
  useEffect(() => {
    open()
    let hiddenAt: Date | null = null
    const onVisibility = () => {
      if (document.hidden) {
        hiddenAt = new Date()
      } else if (
        hiddenAt &&
        differenceInMinutes(new Date(), hiddenAt) >= AWAY_MINUTES
      ) {
        open()
      }
    }
    document.addEventListener('visibilitychange', onVisibility)
    return () => document.removeEventListener('visibilitychange', onVisibility)
  }, [open])
  return seenAt
}

/**
 * The cursor holds a card, not a position: a card arriving above it live must never take ⏎ from the one being read.
 * A card that leaves hands the cursor to whichever card takes its place.
 * There is none until J / K or a click: a lit card nobody picked reads as ⏎'s target.
 */
const useCursor = (stops: string[], page: string) => {
  // Each pane has its own: carried into the next one, it lit the card at its old place there, which scrolled itself into
  // view while the pane was still growing out of its card, and the pane opened scrolled and jumped.
  const [selected, setSelected] = useState<{
    id: string
    page: string
  } | null>(null)
  const selectedId = selected && selected.page === page ? selected.id : null
  const setSelectedId = (id: string) => setSelected({ id, page })
  const [lastIndex, setLastIndex] = useState(0)
  const foundIndex = selectedId === null ? -1 : stops.indexOf(selectedId)
  const cursorIndex =
    selectedId !== null && foundIndex === -1
      ? Math.max(0, Math.min(lastIndex, stops.length - 1))
      : foundIndex
  // Not `at`: with no cursor the index is -1, and `at(-1)` would light the last card.
  const cursorId = cursorIndex === -1 ? undefined : stops[cursorIndex]
  if (selectedId !== null && foundIndex === -1 && cursorId) {
    setSelectedId(cursorId)
  }
  if (foundIndex !== -1 && foundIndex !== lastIndex) {
    setLastIndex(foundIndex)
  }
  return { cursorId, cursorIndex, setSelectedId }
}

const openCardEmail = ({ action, message }: QueueItem) =>
  message && expandRow(action.id, { from: 'home', threadId: message.threadId })

/** Once the card whose email the sidebar shows is settled, the next card with an email takes the sidebar, as J would. */
const useNextInSidebar = (queue: QueueItem[], onNext: (id: string) => void) => {
  const ids = queue.map(({ action }) => action.id)
  const [shown, setShown] = useState<{ id: string; index: number } | null>(null)
  const openId = useExpandedRow(shown ? [...ids, shown.id] : ids)
  if (openId && ids.includes(openId) && openId !== shown?.id) {
    setShown({ id: openId, index: ids.indexOf(openId) })
  }
  const isSettled = !!shown && openId === shown.id && !ids.includes(shown.id)
  useEffect(() => {
    if (!isSettled || !shown) {
      return
    }
    const next =
      queue.slice(shown.index).find(({ message }) => message) ??
      queue.find(({ message }) => message)
    if (!next?.message) {
      collapseExpanded()
      return
    }
    onNext(next.action.id)
    showRow(next.action.id, { from: 'home', threadId: next.message.threadId })
  }, [isSettled, onNext, queue, shown])
}

/** The bots as a row of faces over the chat, where the sidebar is a sheet. */
const BotStrip = ({
  bots,
  onOpen,
  openId,
}: {
  bots: HomeBot[]
  onOpen: (bot: string) => void
  openId: string
}) => (
  <div className="flex gap-1 overflow-x-auto md:hidden">
    {bots.map((bot) => (
      <button
        key={bot.bot}
        type="button"
        aria-label={bot.name}
        aria-current={bot.bot === openId || undefined}
        className="aria-current:bg-secondary hover:bg-accent cursor-pointer rounded-full p-1"
        onClick={() => onOpen(bot.bot)}
      >
        <BotAvatar bot={bot} size="md" />
      </button>
    ))}
  </div>
)

/** The open bot: its name, its chat with what it waits on now under it, and where to write to it, floating over the chat's end. Fewmail's latest message is the day's brief. */
const BotPane = ({
  ask,
  asking,
  bot,
  bots,
  children,
  head,
  isFocused,
  isProfileOpen,
  isWaiting,
  onOpen,
  onProfile,
}: {
  ask: ReturnType<typeof useAskBot>['ask']
  asking: ReturnType<typeof useAskBot>['asking']
  bot: HomeBot
  bots: HomeBot[]
  children: ReactNode
  head: ReactNode
  isFocused: boolean
  isProfileOpen: boolean
  isWaiting: boolean
  onOpen: (bot: string) => void
  onProfile: () => void
}) => {
  const t = useT()
  return (
    <div className="under-notice relative flex min-w-0 flex-1">
      {/* A container: an email open beside the page narrows the chat as a phone would, and it takes a phone's gutter. */}
      <div className="@container flex min-w-0 flex-1 flex-col">
        <BotHeader bot={bot} onProfile={onProfile} />
        {/* Keyed: a bot opens at its newest message, not where the last one was scrolled to. */}
        <MessageScrollerProvider key={bot.bot} autoScroll>
          <ChatScroller>
            <MessageScroller className="flex-1">
              <MessageScrollerViewport aria-label={bot.name}>
                <MessageScrollerContent
                  // oxlint-disable shadcn/require-static-classes -- the guard goes on the content itself: a wrapper inside it would hide the messages from the scroller
                  className={cn(
                    'mx-auto w-full max-w-3xl gap-5 px-10 pt-6 pb-6 max-md:px-4 @max-xl:px-4',
                    STILL_POINTER_GUARD
                  )}
                  // oxlint-enable shadcn/require-static-classes
                >
                  <BotStrip bots={bots} openId={bot.bot} onOpen={onOpen} />
                  <BotTimeline bot={bot} asking={asking}>
                    {(bot.bot === 'fewmail' || isWaiting) && (
                      <BotNow>
                        {bot.bot === 'fewmail' && <NowPart>{head}</NowPart>}
                        {isWaiting && children}
                      </BotNow>
                    )}
                  </BotTimeline>
                </MessageScrollerContent>
              </MessageScrollerViewport>
              <MessageScrollerButton
                aria-label={t.bots.toLatest}
                className="data-[direction=end]:bottom-2"
              />
            </MessageScroller>
          </ChatScroller>
          <div className="mx-auto w-full max-w-3xl px-10 pb-4 max-md:px-4 @max-xl:px-4">
            <BotComposer
              bot={bot}
              isActive={isFocused}
              isSending={ask.isPending}
              onSend={(message) => ask.mutate({ ...message, bot: bot.bot })}
            />
          </div>
        </MessageScrollerProvider>
      </div>
      <ReaderSidebar isOpen={isProfileOpen}>
        <BotProfile bot={bot} onClose={onProfile} />
      </ReaderSidebar>
    </div>
  )
}

/** Whether the open bot waits on anything now: with nothing, its chat ends on its last message, never an empty one. */
const waitsOnAnything = ({
  board,
  botId,
  data,
  isBoard,
  journal,
  proposals,
  queue,
  worth,
}: {
  /** Pending too on Free, where it offers Pro instead. */
  board: ReturnType<typeof useBoard>
  botId: string
  data: Today | undefined
  isBoard: boolean
  journal: number
  proposals: number
  queue: number
  worth: number
}) =>
  (isBoard && (board.isPending || board.ordered.length > 0)) ||
  queue + proposals + worth > 0 ||
  (data?.newSenders.length ?? 0) + (data?.botSuggestions.length ?? 0) > 0 ||
  (botId === 'fewmail' && journal > 0)

/** The open bot's own part of Today: Fewmail keeps what no bot of the user's takes, and what is not anyone's mail. */
const todayOf = (today: Today | undefined, bot: string): Today | undefined => {
  if (!today) {
    return undefined
  }
  const isMine = ({ analysis }: { analysis: { botId: string | null } }) =>
    (analysis.botId ?? 'fewmail') === bot
  const isFewmail = bot === 'fewmail'
  return {
    ...today,
    awaiting: isFewmail ? today.awaiting : [],
    botSuggestions: isFewmail ? today.botSuggestions : [],
    dates: today.dates.filter(isMine),
    newSenders: isFewmail ? today.newSenders : [],
    recent: today.recent.filter(isMine),
  }
}

const useOpenBot = (bots: HomeBot[]) => {
  const navigate = useNavigate()
  const { bot: picked } = Route.useSearch()
  const id = openBotIdOf(bots, picked)
  const bot = bots.find((each) => each.bot === id) ?? bots[0]
  const open = (next: string) => {
    void navigate({ search: { bot: next }, to: '/home' })
  }
  const step = (by: number) => {
    const index = bots.findIndex((each) => each.bot === bot?.bot)
    const next = bots[Math.max(0, Math.min(bots.length - 1, index + by))]
    if (next) {
      open(next.bot)
    }
  }
  return { bot, open, step }
}

/** Home's keys work while nothing lies beside it: an email or a sender's emails take them. */
const useIsHomeFocused = () => {
  const isThreadOpen = useIsThreadExpanded()
  const isSenderOpen = useIsSenderShown()
  return !isThreadOpen && !isSenderOpen
}

/**
 * The open bot's profile in the reader's sidebar, kept open from bot to bot: `P` opens and closes it, esc closes it. It
 * takes the sidebar from an open email or sender, and gives it back to the next one opened.
 */
const useProfile = (bot: string, isFocused: boolean, picked: number) => {
  const [isOpen, setIsOpen] = useState(false)
  if (isOpen && !isFocused) {
    setIsOpen(false)
  }
  const canUseKeys = isFocused && picked === 0
  const handleToggle = () => {
    if (!isOpen) {
      collapseExpanded()
      closeSender()
      posthog.capture('bot_profile_opened', { system: bot === 'fewmail' })
    }
    setIsOpen(!isOpen)
  }
  useHotkey('P', handleToggle, { enabled: canUseKeys })
  useHotkey('Escape', () => setIsOpen(false), {
    enabled: canUseKeys && isOpen,
  })
  return { handleToggle, isOpen }
}

/** What the open bot waits on now, under its chat: its cards by kind, its emails to tidy, its mail worth knowing. */
const useBotCards = (cards: QueueItem[], bot: string | undefined) => {
  const own = cards.filter(
    (card) => botOfCard(card) === bot && !isProposal(card)
  )
  return { groups: useKindGroups(own), own }
}

const HomePage = () => {
  const t = useT()
  const queryClient = useQueryClient()
  const { data: today, dataUpdatedAt } = useToday()
  const bots = useBots()
  const { bot, open: openBot, step: stepBot } = useOpenBot(bots)
  const botId = bot?.bot ?? 'fewmail'
  useReadBot(bot)
  const { ask, asking } = useAskBot()

  const { data: cards } = useLiveQuery((query) =>
    query.from({ card: queueCards }).orderBy(({ card }) => card.rank)
  )
  const decisions = useWaiting().length
  const isFirstRead = Boolean(today && isReadingFirstTime(today.mailboxes))
  const { groups } = useBotCards(cards, botId)
  const allProposals = useProposals(today, cards, holdClicksUntilMove)
  const proposals = {
    ...allProposals,
    proposals: allProposals.proposals.filter(
      (proposal) => proposal.bot === botId
    ),
  }
  const data = todayOf(today, botId)
  const worth = worthRowsOf(data)
  const queue = groups.shown
  const stops = [
    ...queue.map(({ action }) => action.id),
    ...worth.map(({ id }) => worthStop(id)),
  ]
  const { cursorId, cursorIndex, setSelectedId } = useCursor(stops, botId)
  // Only a card without an email unfolds in place; one with an email opens it in the sidebar.
  const [isOpen, setIsOpen] = useState(false)
  const openIds = isOpen && cursorId ? [cursorId] : []
  const selected = queue.find(({ action }) => action.id === cursorId)
  const openCard = (item: QueueItem) => {
    setSelectedId(item.action.id)
    if (item.message) {
      openCardEmail(item)
    } else {
      setIsOpen((open) => !open)
    }
  }
  const toggleCard = ([id]: string[]) => {
    const item = queue.find(({ action }) => action.id === id)
    if (item) {
      openCard(item)
    } else {
      setIsOpen(false)
    }
  }
  useNextInSidebar(queue, setSelectedId)
  const [pickedIds, setPickedIds] = useState<string[]>([])
  const picked = queue.filter(({ action }) => pickedIds.includes(action.id))
  const targets =
    picked.length > 0 ? picked : queue.filter((item) => item === selected)
  const staleBefore = subDays(dataUpdatedAt, STALE_DAYS)
  const stale = queue.filter(({ action }) => action.createdAt < staleBefore)

  const { approve, approveMany, refresh, skip } = useCardActions()
  const seenAt = useVisits(() =>
    queryClient.invalidateQueries({ queryKey: orpc.today.key() })
  )
  const skipCards = (ids: string[]) => {
    setPickedIds([])
    skip.mutate(ids)
  }
  const trashMany = useMutation({
    meta: { event: 'cards_trashed' },
    mutationFn: (items: QueueItem[]) =>
      Promise.all(
        items.map(async ({ action, message }) => {
          if (message) {
            await client.mail.trash({ messageId: message.id })
          }
          await client.actions.dismiss({ id: action.id })
        })
      ),
    onError: (_, items) => toast.dismiss(idsOf(items)),
    onMutate: (items) => {
      setPickedIds([])
      holdClicksUntilMove()
      toast.loading(t.today.working, { id: idsOf(items) })
      return showUntilSettled(() =>
        queueCards.delete(items.map(({ action }) => action.id))
      )
    },
    onSettled: (_, __, ___, settle) => settle?.(refresh()),
    onSuccess: (_, items) =>
      toastUndo(
        t.mail.trashed,
        () =>
          Promise.all(
            items.map(async ({ action, message }) => {
              if (message) {
                await client.mail.moveToInbox({ messageId: message.id })
              }
              await client.actions.restore({ id: action.id })
            })
          ).finally(refresh),
        idsOf(items)
      ),
  })

  const alike = queue.filter(
    ({ action }) => action.kind === selected?.action.kind
  )
  const approveAlike = () =>
    alike.length > 1 &&
    approveMany.mutate({ ids: alike.map(({ action }) => action.id) })
  const move = (by: number) => {
    const next =
      stops[Math.min(stops.length - 1, Math.max(0, cursorIndex + by))]
    if (next) {
      setSelectedId(next)
    }
  }
  const togglePick = (actionId: string) =>
    setPickedIds((current) =>
      current.includes(actionId)
        ? current.filter((id) => id !== actionId)
        : [...current, actionId]
    )
  const worthRow = worth.find(({ id }) => worthStop(id) === cursorId)
  const approveTargets = () => {
    if (picked.length > 0) {
      setPickedIds([])
      approveMany.mutate({ ids: picked.map(({ action }) => action.id) })
    } else if (worthRow) {
      openWorthRow(worthRow)
    } else if (selected?.message) {
      openCardEmail(selected)
    } else if (selected) {
      approve.mutate({ id: selected.action.id })
    }
  }
  const skipTargets = () => skipCards(targets.map(({ action }) => action.id))

  const isFocused = useIsHomeFocused()
  const isBoard = isBoardBot(bot)
  const isStepping = isFocused && !isBoard
  const walkKeys = { enabled: isStepping && stops.length > 0 }
  const listKeys = { enabled: isStepping && !!selected }
  useHotkey('[', () => stepBot(-1), { enabled: isFocused })
  useHotkey(']', () => stepBot(1), { enabled: isFocused })
  useHotkey('J', () => move(1), walkKeys)
  useHotkey('ArrowDown', () => move(1), walkKeys)
  useHotkey('K', () => move(-1), walkKeys)
  useHotkey('ArrowUp', () => move(-1), walkKeys)
  useHotkey('Enter', approveTargets, walkKeys)
  useHotkey('Shift+Enter', approveAlike, listKeys)
  useHotkey('S', skipTargets, listKeys)
  useHotkey('Backspace', () => trashMany.mutate(targets), listKeys)
  useHotkey('X', () => selected && togglePick(selected.action.id), listKeys)
  useHotkey(
    'Mod+A',
    () =>
      setPickedIds(
        picked.length === queue.length
          ? []
          : queue.map(({ action }) => action.id)
      ),
    { enabled: isStepping && queue.length > 0 }
  )
  useHotkey('Escape', () => setPickedIds([]), {
    enabled: isStepping && picked.length > 0,
  })
  const profile = useProfile(botId, isFocused, picked.length)
  useHotkey('Space', () => selected && openCard(selected), listKeys)
  useOpenKey(worthRow, selected, isStepping)
  const boardHints = useBoardHints()
  const board = useBoard(isBoard)
  const journal = useJournal()
  const isWaiting = waitsOnAnything({
    board,
    botId,
    data,
    isBoard,
    journal: journal.rows.length,
    proposals: proposals.proposals.length,
    queue: queue.length,
    worth: worth.length,
  })

  const cardOf = (item: QueueItem, place: RowPlace) => (
    <QueueCard
      item={item}
      place={place}
      isNew={!!seenAt && item.action.createdAt > seenAt}
      isPicked={pickedIds.includes(item.action.id)}
      isOpen={isOpen && item === selected}
      isSelected={item === selected}
      onApprove={() => approve.mutate({ id: item.action.id })}
      onPick={() => togglePick(item.action.id)}
      onSkip={() => skipCards([item.action.id])}
    />
  )
  const now = (
    <>
      {isBoard && <BoardNow isActive={isFocused} />}
      {picked.length > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="mr-auto font-medium">
            {t.queue.picked(picked.length)}
          </span>
          <PickedActions
            onApprove={approveTargets}
            onClear={() => setPickedIds([])}
            onSkip={skipTargets}
            onTrash={() => trashMany.mutate(picked)}
          />
        </div>
      )}
      <CardGroups
        cardOf={cardOf}
        groups={groups}
        listKey={botId}
        openIds={openIds}
        onToggle={toggleCard}
      />
      <StaleCards
        canUseKeys={isStepping}
        count={stale.length}
        onSkip={() => skipCards(stale.map(({ action }) => action.id))}
      />
      <WorthKnowing
        cursorId={cursorId}
        isWalking={isStepping}
        today={data}
        onSelect={setSelectedId}
      />
      {proposals.proposals.length > 0 && (
        <ProposalsReview
          canUseKeys={isFocused && stops.length === 0}
          proposals={proposals}
        />
      )}
      <SenderQuestions today={data} canUseKeys={isStepping} />
      <QuietWork isShown={botId === 'fewmail'} journal={journal} />
    </>
  )

  return (
    <div className="flex min-h-0 min-w-0 flex-1 flex-col">
      <main className="flex min-h-0 flex-1">
        {bot && (
          <BotPane
            ask={ask}
            asking={asking}
            bot={bot}
            bots={bots}
            head={
              <HomeHeader
                data={today}
                decisions={decisions}
                isFirstRead={isFirstRead}
                updatedAt={dataUpdatedAt}
                onOpenBot={openBot}
              />
            }
            isFocused={isFocused}
            isProfileOpen={profile.isOpen}
            isWaiting={isWaiting}
            onOpen={openBot}
            onProfile={profile.handleToggle}
          >
            {now}
          </BotPane>
        )}
      </main>
      <SenderSidebar />
      <KeyHints
        hints={homeHints(t, {
          alike: alike.length,
          board: isBoard ? boardHints : null,
          isOnWorth: !!worthRow,
          picked: picked.length,
          selected,
          stale: stale.length,
          tidy: proposals.proposals.length,
          today: data,
        })}
      />
    </div>
  )
}

export const Route = createFileRoute('/_app/home')({
  component: HomePage,
  validateSearch: z.object({
    bot: z.optional(z.string()),
  }),
  // Everything Home draws on its first frame: the list of bots and the open bot's chat come with the page.
  loader: async () => {
    await Promise.all([
      warmQuery(orpc.today.get.queryOptions()),
      botChats.preload(),
      ownBots.preload(),
      connectedApps.preload(),
      queueCards.preload(),
      ...Object.values(todayLists).map((list) => list.preload()),
    ])
  },
})
