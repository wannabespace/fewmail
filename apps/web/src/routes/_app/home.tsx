import type { RouterOutputs } from '@fewmail/api/router'
import { botOfCard, isImportant, usedPercent } from '@fewmail/shared/agent'
import type { ActionKind } from '@fewmail/shared/agent'
import type { Messages } from '@fewmail/shared/i18n'
import { formatResetDay } from '@fewmail/shared/i18n/locales'
import { Accordion } from '@fewmail/ui/components/accordion'
import { Button } from '@fewmail/ui/components/button'
import { MotionCollapse } from '@fewmail/ui/components/collapse.motion'
import {
  SettingsGroup,
  SettingsRows,
} from '@fewmail/ui/components/custom/settings-group'
import { Kbd } from '@fewmail/ui/components/kbd'
import {
  MessageScroller,
  MessageScrollerButton,
  MessageScrollerContent,
  MessageScrollerProvider,
  MessageScrollerViewport,
} from '@fewmail/ui/components/message-scroller'
import { Spinner } from '@fewmail/ui/components/spinner'
import { Tool, ToolContent, ToolHeader } from '@fewmail/ui/components/tool'
import { copy } from '@fewmail/ui/lib/copy'
import { cn } from '@fewmail/ui/lib/utils'
import {
  BookOpen01Icon,
  Calendar03Icon,
  Mail01Icon,
  Tick02Icon,
  ZapIcon,
} from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { useLiveQuery } from '@tanstack/react-db'
import { useHotkey } from '@tanstack/react-hotkeys'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  createFileRoute,
  Link,
  redirect,
  useNavigate,
} from '@tanstack/react-router'
import {
  differenceInMinutes,
  endOfTomorrow,
  format,
  isToday,
  isTomorrow,
  max,
  startOfToday,
  subDays,
} from 'date-fns'
import { AnimatePresence } from 'motion/react'
import { useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import { toast } from 'sonner'
import { z } from 'zod/mini'

import { BoardPane, useBoard, useBoardHints } from '~/components/board'
import {
  BotComposer,
  BotHeader,
  BotNow,
  NowMessage,
  BotTimeline,
  DigestHeader,
  DigestLead,
  digestLead,
  useAskBot,
  useReadBot,
} from '~/components/bot-chat'
import {
  BotAvatar,
  digestHeadline,
  isBoardBot,
  openBotIdOf,
  useBots,
} from '~/components/bot-list'
import type { HomeBot } from '~/components/bot-list'
import { BotProfile } from '~/components/bot-profile'
import { BotSuggestionCard } from '~/components/bot-suggestion'
import { confirm } from '~/components/confirm-dialog'
import { EmailRow } from '~/components/email-row'
import {
  collapseExpanded,
  expandRow,
  showRow,
  useExpandedRow,
  useIsThreadExpanded,
} from '~/components/expand-row'
import { Journal, useJournal } from '~/components/journal'
import { KeyHints } from '~/components/key-hints'
import { ExtractedChips, ImportanceDot } from '~/components/mail-meta'
import { ChatScroller, PaneRows } from '~/components/pane-rows'
import type { RowPlace } from '~/components/pane-rows'
import {
  isProposal,
  ProposalsReview,
  useProposals,
} from '~/components/proposals'
import { foldedVerb, QueueCard, useCardActions } from '~/components/queue-card'
import type { QueueItem } from '~/components/queue-card'
import {
  closeSender,
  SenderCard,
  showSender,
  useIsSenderShown,
} from '~/components/sender-card'
import { SenderSidebar } from '~/components/sender-stack'
import { ReaderSidebar } from '~/components/thread-link'
import { CodeActions, sweepOf, useMailActions } from '~/components/thread-view'
import { upgradeStore } from '~/components/upgrade-dialog'
import { eventTimes } from '~/lib/calendar'
import {
  botChats,
  ownBots,
  queueCards,
  todayLists,
  useToday,
} from '~/lib/home-db'
import { useDates, useLocale, useT } from '~/lib/i18n'
import { connectedApps } from '~/lib/lists-db'
import { isReadingFirstTime } from '~/lib/mail-db'
import { useHasAgent, useMe } from '~/lib/me'
import { offerBlock } from '~/lib/offer-block'
import { client, orpc } from '~/lib/orpc'
import { posthog } from '~/lib/posthog'
import { showUntilSettled, warmQuery } from '~/lib/query-client'
import { holdClicksUntilMove, STILL_POINTER_GUARD } from '~/lib/still-pointer'
import { pendingToast, toastUndo } from '~/lib/undo'

type Today = RouterOutputs['today']['get']

const NEW_SENDER_TOAST = 'new-sender'

const isImportantCard = ({ action, analysis }: QueueItem) =>
  isImportant(action.kind, analysis)

const idsOf = (items: QueueItem[]) =>
  items.map(({ action }) => action.id).join(',')

const TallyBox = ({ children }: { children: ReactNode }) => (
  <div className="text-foreground/75 flex items-center gap-3 rounded-2xl border border-dashed px-4.5 py-3.5 text-sm">
    {children}
  </div>
)

/** A list that started writing often and is barely opened: the agent asks once how to treat it. A, U and I answer the first. */
const NewSenders = ({
  canUseKeys,
  onSettle,
  senders,
}: {
  canUseKeys: boolean
  onSettle: () => void
  senders: Today['newSenders']
}) => {
  const t = useT()
  const queryClient = useQueryClient()
  const answered = (messageId: string | undefined) => {
    onSettle()
    closeSender()
    return showUntilSettled(() => {
      if (messageId && todayLists.newSenders.has(messageId)) {
        todayLists.newSenders.delete(messageId)
      }
    })
  }
  const refetch = () =>
    queryClient.invalidateQueries({ queryKey: orpc.today.key() })
  const archive = useMutation(
    orpc.bots.createSimple.mutationOptions({
      onError: pendingToast(NEW_SENDER_TOAST).onError,
      onMutate: ({ match }) => {
        pendingToast(NEW_SENDER_TOAST).onMutate()
        return answered(
          senders.find(({ fromEmail }) => fromEmail === match.value)?.messageId
        )
      },
      onSettled: (_, __, ___, settle) =>
        settle?.(
          Promise.all([
            refetch(),
            queryClient.invalidateQueries({ queryKey: orpc.bots.key() }),
          ])
        ),
      onSuccess: () =>
        toast.success(t.today.newSender.archived, { id: NEW_SENDER_TOAST }),
    })
  )
  const keep = useMutation(
    orpc.today.keepSender.mutationOptions({
      onMutate: ({ messageId }) => answered(messageId),
      onSettled: (_, __, ___, settle) => settle?.(refetch()),
    })
  )
  const unsubscribe = useMutation(
    orpc.subscriptions.unsubscribe.mutationOptions({
      // Leaving a list can take a while (its page, a mailto): the toast says so until the answer.
      onMutate: ({ messageId }) => {
        toast.loading(t.mail.unsubscribing, { id: messageId })
        return answered(messageId)
      },
      onError: (_, { messageId }) => toast.dismiss(messageId),
      onSettled: (_, __, ___, settle) =>
        settle?.(
          Promise.all([
            refetch(),
            queryClient.invalidateQueries({ queryKey: orpc.mail.key() }),
          ])
        ),
      onSuccess: ({ link, unsubscribed }, { messageId }) =>
        link
          ? toast(t.mail.unsubscribeYourself, {
              action: {
                label: t.mail.openUnsubscribePage,
                onClick: () => window.open(link, '_blank', 'noopener'),
              },
              id: messageId,
            })
          : toast.success(
              unsubscribed
                ? t.subscriptions.unsubscribed
                : t.subscriptions.archivedOnly,
              { id: messageId }
            ),
    })
  )
  const answers = (sender: Today['newSenders'][number]) => ({
    handleArchive: () =>
      archive.mutate({
        effect: 'archive',
        match: { field: 'from', value: sender.fromEmail },
        name: sender.fromName ?? sender.fromEmail,
      }),
    handleKeep: () => keep.mutate({ messageId: sender.messageId }),
    handleUnsubscribe: () =>
      confirm({
        action: t.subscriptions.unsubscribe,
        description: t.subscriptions.unsubscribeHint(
          t.cleanup.emails(sender.count)
        ),
        onConfirm: () =>
          unsubscribe.mutate(
            { messageId: sender.messageId },
            {
              onSuccess: ({ ignoresUnsubscribe }) =>
                ignoresUnsubscribe &&
                offerBlock(
                  t,
                  sender.fromName ?? sender.fromEmail,
                  sender.messageId
                ),
            }
          ),
        title: t.mail.unsubscribeConfirm(sender.fromName ?? sender.fromEmail),
        variant: 'warning',
      }),
  })
  const first = senders[0] && answers(senders[0])
  const keys = { enabled: canUseKeys && !!first }
  useHotkey('A', () => first?.handleArchive(), keys)
  useHotkey('U', () => first?.handleUnsubscribe(), keys)
  useHotkey('I', () => first?.handleKeep(), keys)
  useHotkey('V', () => senders[0] && showSender(senders[0]), keys)

  return (
    <AnimatePresence initial={false}>
      {senders.map((sender, index) => {
        const answer = answers(sender)
        const key = (letter: string) => index === 0 && <Kbd>{letter}</Kbd>
        return (
          <MotionCollapse key={sender.messageId} initial={false}>
            <SenderCard
              sender={sender}
              label={t.today.newSender.label}
              lead={
                <>
                  {t.today.newSender.lead(sender.count, sender.opened)}
                  {sender.leftShare !== null &&
                    ` · ${t.subscriptions.leftBy(Math.round(sender.leftShare * 100))}`}
                </>
              }
            >
              <Button
                size="sm"
                variant="ghost-tint-muted"
                onClick={answer.handleKeep}
                shortcut={key('I')}
              >
                {t.today.newSender.keep}
              </Button>
              <Button
                size="sm"
                variant="secondary"
                onClick={answer.handleUnsubscribe}
                shortcut={key('U')}
              >
                {t.actionKind.unsubscribe}
              </Button>
              <Button
                size="sm"
                onClick={answer.handleArchive}
                shortcut={key('A')}
              >
                {t.today.newSender.archive}
              </Button>
            </SenderCard>
          </MotionCollapse>
        )
      })}
    </AnimatePresence>
  )
}

/** Each card folds itself away on an answer; the refetch then drops it from Home's count. */
const BotSuggestions = ({ today }: { today: Today | undefined }) =>
  today?.botSuggestions.map((suggestion) => (
    <BotSuggestionCard
      key={suggestion.fromEmail}
      isShowable
      suggestion={suggestion}
      onAnswer={() => {
        closeSender()
        holdClicksUntilMove()
      }}
    />
  ))

const FreshCodes = ({
  canUseKeys,
  today,
}: {
  canUseKeys: boolean
  today: Today | undefined
}) => {
  const t = useT()
  const codes = today?.codes ?? []
  const actions = useMailActions(undefined, (messageId) => {
    if (todayLists.codes.has(messageId)) {
      todayLists.codes.delete(messageId)
    }
  })
  const sweep = sweepOf(actions, t, 'inbox')
  const newest = codes[0]?.code
  useHotkey('Y', () => newest && copy(newest, t.mail.oneTimeCode.copied), {
    enabled: canUseKeys && !!newest,
  })

  return (
    <div hidden={!newest}>
      <SettingsGroup>
        <SettingsRows>
          {codes.map(
            (message) =>
              message.code && (
                <EmailRow
                  key={message.id}
                  actions={actions}
                  from="home"
                  message={message}
                  description={<span data-mask>{message.subject}</span>}
                >
                  <CodeActions
                    actions={actions}
                    code={message.code}
                    messageIds={[message.id]}
                    sweep={sweep}
                  />
                </EmailRow>
              )
          )}
        </SettingsRows>
      </SettingsGroup>
    </div>
  )
}

interface WorthRow {
  id: string
  messageId?: string
  threadId: string
}

const worthStop = (rowId: string) => `worth:${rowId}`

/** Worth knowing's rows in their order: Home's cursor walks them after the cards. */
const worthRowsOf = (today: Today | undefined): WorthRow[] =>
  today
    ? [
        ...[...today.recent, ...today.dates].map(({ message }) => ({
          id: message.id,
          messageId: message.id,
          threadId: message.threadId,
        })),
        ...today.awaiting.map(({ threadId }) => ({ id: threadId, threadId })),
      ]
    : []

const openWorthRow = ({ id, threadId }: WorthRow) =>
  expandRow(id, { from: 'home', threadId })

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

/**
 * Mail that needs no decision: important unread, dated mail no card shows, and sent mail still waiting for an answer.
 * Home's cursor walks it after the cards; on a row, `E` archives and ⌫ trashes its email.
 */
const WorthKnowing = ({
  cursorId,
  isWalking,
  onSelect,
  today,
}: {
  cursorId: string | undefined
  isWalking: boolean
  onSelect: (stop: string) => void
  today: Today | undefined
}) => {
  const t = useT()
  const actions = useMailActions(undefined, (messageId) => {
    for (const list of [todayLists.dates, todayLists.recent]) {
      if (list.has(messageId)) {
        list.delete(messageId)
      }
    }
  })
  const sweep = sweepOf(actions, t, 'inbox')
  const messageId = worthRowsOf(today).find(
    ({ id }) => worthStop(id) === cursorId
  )?.messageId
  const rowKeys = { enabled: isWalking && !!messageId }
  useHotkey('E', () => messageId && sweep.action.mutate({ messageId }), rowKeys)
  useHotkey(
    'Backspace',
    () => messageId && actions.trash.mutate({ messageId }),
    rowKeys
  )
  const rowOf = (rowId: string, place: RowPlace) => ({
    actions,
    active: cursorId === worthStop(rowId),
    from: 'home' as const,
    onSelect: () => onSelect(worthStop(rowId)),
    place,
    rowId,
  })

  if (!today) {
    return null
  }
  const rows = [
    ...today.recent.map((item) => ({ ...item, kind: 'recent' as const })),
    ...today.dates.map((item) => ({ ...item, kind: 'dates' as const })),
    ...today.awaiting.map((sent) => ({ kind: 'awaiting' as const, sent })),
  ]
  if (rows.length === 0) {
    return null
  }
  return (
    <Tool open>
      <ToolHeader
        icon={BookOpen01Icon}
        isOpenable={false}
        title={
          <>
            {t.today.worthKnowing}
            <span className="text-muted-foreground ml-1.5 tabular-nums">
              {rows.length}
            </span>
          </>
        }
      />
      <ToolContent variant="rows">
        <PaneRows
          rowKey={(row) =>
            row.kind === 'awaiting' ? row.sent.threadId : row.message.id
          }
          rows={rows}
        >
          {(row, place) =>
            row.kind === 'awaiting' ? (
              <EmailRow
                {...rowOf(row.sent.threadId, place)}
                actions={undefined}
                message={{ ...row.sent, fromEmail: row.sent.to[0] ?? '' }}
                sender={{
                  fromEmail: row.sent.to[0] ?? '',
                  fromName: row.sent.toName,
                }}
                description={
                  <>
                    {t.today.awaiting} ·{' '}
                    <span data-mask>{row.sent.subject}</span>
                  </>
                }
              />
            ) : (
              <EmailRow
                {...rowOf(row.message.id, place)}
                message={row.message}
                description={<span data-mask>{row.analysis.summary}</span>}
                facts={
                  row.kind === 'recent' ? (
                    <ImportanceDot
                      importance={row.analysis.importance}
                      reason={row.analysis.reason}
                    />
                  ) : (
                    <ExtractedChips
                      extracted={{ ...row.analysis.extracted, amount: null }}
                    />
                  )
                }
              />
            )
          }
        </PaneRows>
      </ToolContent>
    </Tool>
  )
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
    ...(state.today?.codes.length
      ? [['Y', t.mail.oneTimeCode.copy] as [string, string]]
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

/** Today's strip under the headline: the calendar's events left today and tomorrow. */
const DayStrip = () => {
  const t = useT()
  const dates = useDates()
  const { hasCalendar } = useMe()
  const { data: events = [] } = useQuery(
    orpc.calendar.events.queryOptions({
      enabled: hasCalendar,
      input: { from: startOfToday(), to: endOfTomorrow() },
      select: (calendar) =>
        calendar.events.filter((event) => eventTimes(event).end > new Date()),
    })
  )
  if (events.length === 0) {
    return null
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      {events.map((event) => {
        const { start } = eventTimes(event)
        const day = max([start, startOfToday()])
        return (
          <Button
            key={`${event.mailboxId}:${event.id}`}
            size="sm"
            variant="secondary"
            render={
              <Link
                to="/calendar"
                search={{ date: format(day, 'yyyy-MM-dd'), view: 'day' }}
              />
            }
          >
            <HugeiconsIcon
              icon={Calendar03Icon}
              strokeWidth={2}
              data-icon="inline-start"
            />
            {isTomorrow(day) && `${t.calendar.tomorrow} `}
            {event.allDay ? t.calendar.allDay : dates.format(start, 'p')}{' '}
            <span data-mask>{event.title || t.calendar.untitled}</span>
          </Button>
        )
      })}
    </div>
  )
}

const headlineOf = (t: Messages, isFirstRead: boolean, decisions: number) =>
  isFirstRead ? t.nav.syncing : digestHeadline(t, decisions)

/** What happened, in one sentence computed here from the counts (no model text), then what is ahead today: Fewmail's digest, live. */
const HomeHeader = ({
  data,
  decisions,
  isFirstRead,
  updatedAt,
}: {
  data?: Today
  decisions: number
  isFirstRead: boolean
  updatedAt: number
}) => {
  const t = useT()
  const locale = useLocale()
  const { plan, usage } = useMe()
  // A spent allowance pauses the agent's writing, never its watch: Home says which, so nothing stops silently.
  const paused =
    plan.kind !== 'free' &&
    usedPercent(plan.kind, usage.spent) >= 100 &&
    t.today.allowanceSpent(formatResetDay(locale, usage.resetsAt))
  const lead = () => {
    if (isFirstRead) {
      return (
        <p className="text-muted-foreground flex items-center gap-2 text-sm">
          <Spinner />
          {t.today.firstRead}
        </p>
      )
    }
    return (
      data && (
        <DigestLead>
          {[
            digestLead(t, {
              days: data.days,
              decisions,
              handled: data.handled.total,
              people: data.pulse.people,
              total: data.pulse.total,
            }),
            paused,
          ]
            .filter(Boolean)
            .join(' ')}
        </DigestLead>
      )
    )
  }

  return (
    <DigestHeader
      at={updatedAt > 0 ? updatedAt : null}
      headline={data ? headlineOf(t, isFirstRead, decisions) : null}
      isLive
      lead={lead()}
      status={
        !!data?.reading &&
        !isFirstRead && (
          <span className="flex items-center gap-1.5 whitespace-nowrap">
            <Spinner />
            {t.today.readingNow(data.reading)}
          </span>
        )
      }
    >
      <DayStrip />
    </DigestHeader>
  )
}

const PickedActions = ({
  onApprove,
  onClear,
  onSkip,
  onTrash,
}: {
  onApprove: () => void
  onClear: () => void
  onSkip: () => void
  onTrash: () => void
}) => {
  const t = useT()

  return (
    <>
      <Button size="sm" onClick={onApprove} shortcut={<Kbd>⏎</Kbd>}>
        {t.queue.approve}
      </Button>
      <Button
        size="sm"
        variant="secondary"
        onClick={onTrash}
        shortcut={<Kbd>⌫</Kbd>}
      >
        {t.queue.delete}
      </Button>
      <Button
        size="sm"
        variant="ghost-muted"
        onClick={onSkip}
        shortcut={<Kbd>S</Kbd>}
      >
        {t.queue.skip}
      </Button>
      <Button
        size="sm"
        variant="ghost-muted"
        onClick={onClear}
        shortcut={<Kbd>esc</Kbd>}
      >
        {t.queue.unpick}
      </Button>
    </>
  )
}

/** Every kind but the last folds to its first few cards until Show all, so no kind pushes the next one away, as Mail's groups do. A kind keeps its place while Home is open: settling a group's first card must not send the group below the next. */
const KIND_GROUP_SHOWN = 5

const useKindGroups = (queue: QueueItem[]) => {
  const t = useT()
  const [unfolded, setUnfolded] = useState<ReadonlySet<ActionKind>>(new Set())
  const [placed, setPlaced] = useState<ActionKind[]>([])
  const inQueue = kindsOf(t, queue)
  const order = [
    ...placed,
    ...inQueue.map(({ kind }) => kind).filter((kind) => !placed.includes(kind)),
  ]
  if (order.length > placed.length) {
    setPlaced(order)
  }
  const kinds = inQueue.toSorted(
    (a, b) => order.indexOf(a.kind) - order.indexOf(b.kind)
  )
  const groups = kinds.map((group, index) => ({
    ...group,
    isUnfolded: unfolded.has(group.kind),
    shown:
      unfolded.has(group.kind) || index === kinds.length - 1
        ? group.cards
        : group.cards.slice(0, KIND_GROUP_SHOWN),
  }))
  return {
    groups,
    shown: groups.flatMap(({ shown }) => shown),
    toggle: (kind: ActionKind) =>
      setUnfolded((current) =>
        current.has(kind)
          ? new Set([...current].filter((each) => each !== kind))
          : new Set([...current, kind])
      ),
  }
}

/** Each kind of card in the queue with what its cards ask, the words of the filter and of Home's cards. */
const kindsOf = (t: Messages, queue: QueueItem[]) =>
  [...new Set(queue.map(({ action }) => action.kind))].map((kind) => {
    const cards = queue.filter(({ action }) => action.kind === kind)
    const verbs = new Set(cards.map(({ action }) => foldedVerb(t, action)))
    const [verb] = verbs
    return {
      cards,
      count: cards.length,
      kind,
      label: verbs.size === 1 && verb ? verb : t.actionKind[kind],
    }
  })

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

const StaleCards = ({
  canUseKeys,
  count,
  onSkip,
}: {
  canUseKeys: boolean
  count: number
  onSkip: () => void
}) => {
  const t = useT()
  useHotkey('Shift+S', onSkip, { enabled: canUseKeys && count > 0 })

  if (count === 0) {
    return null
  }
  return (
    <TallyBox>
      <span>{t.queue.stale(count)}</span>
      <Button
        size="sm"
        variant="secondary"
        className="ml-auto"
        onClick={onSkip}
        shortcut={<Kbd>⇧S</Kbd>}
      >
        {t.queue.skipStale}
      </Button>
    </TallyBox>
  )
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

/** Fewmail's record of every change in the mail, folded to one quiet line in its chat; opened, each change with its yes or its bot and an undo where one exists. */
const QuietWork = ({
  isShown,
  journal,
}: {
  isShown: boolean
  journal: ReturnType<typeof useJournal>
}) => {
  const t = useT()
  const [isOpen, setIsOpen] = useState(false)
  const [cursorId, setCursorId] = useState<string>()
  const count =
    journal.failed.length +
    journal.days.reduce((sum, { rows }) => sum + rows.length, 0)
  if (!isShown || count === 0) {
    return null
  }
  return (
    <>
      <div className="text-muted-foreground flex items-center gap-2 self-center rounded-full border border-dashed py-0.5 ps-3 pe-1 text-xs">
        <HugeiconsIcon icon={Tick02Icon} strokeWidth={2} className="size-3.5" />
        {t.bots.quiet.week(count)}
        <Button
          size="xs"
          variant="link-muted"
          aria-expanded={isOpen}
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? t.bots.quiet.hide : t.bots.quiet.show}
        </Button>
      </div>
      <AnimatePresence initial={false}>
        {isOpen && (
          <MotionCollapse key="journal">
            <NowMessage>
              <Journal
                cursorId={cursorId}
                journal={journal}
                onSelect={setCursorId}
              />
            </NowMessage>
          </MotionCollapse>
        )}
      </AnimatePresence>
    </>
  )
}

/** What the Board waits on: its lists, or on Free what Pro adds. */
const BoardNow = ({ isActive }: { isActive: boolean }) => {
  const t = useT()
  const hasAgent = useHasAgent()
  return hasAgent ? (
    <BoardPane isActive={isActive} />
  ) : (
    <NowMessage isWide={false}>
      <Button
        size="sm"
        className="self-start"
        onClick={() => upgradeStore.set('board')}
      >
        {t.bots.subscribe}
      </Button>
    </NowMessage>
  )
}

type KindGroups = ReturnType<typeof useKindGroups>

/** The open bot's cards by what they ask, a tool block each, every kind but the last folded to its first few. */
const CardGroups = ({
  cardOf,
  groups,
  listKey,
  onToggle,
  openIds,
}: {
  cardOf: (item: QueueItem, place: RowPlace) => ReactNode
  groups: KindGroups
  listKey: string
  onToggle: (ids: string[]) => void
  openIds: string[]
}) => {
  const t = useT()
  return groups.groups.map((group) => (
    <Tool key={group.kind} open>
      <ToolHeader
        icon={group.kind === 'consent' ? ZapIcon : Mail01Icon}
        isOpenable={false}
        title={
          <>
            {group.label}
            <span className="text-muted-foreground ml-1.5 tabular-nums">
              {group.count}
            </span>
          </>
        }
        action={
          (group.shown.length < group.count || group.isUnfolded) && (
            <Button
              size="xs"
              variant="link-muted"
              onClick={() => groups.toggle(group.kind)}
            >
              {group.isUnfolded
                ? t.mail.showFewer
                : t.mail.showAll(group.count)}
            </Button>
          )
        }
      />
      <ToolContent variant="rows">
        <Accordion variant="rows" value={openIds} onValueChange={onToggle}>
          <PaneRows
            listKey={`${listKey}:${group.kind}:${group.isUnfolded}`}
            rowKey={({ action }) => action.id}
            rows={group.shown}
          >
            {cardOf}
          </PaneRows>
        </Accordion>
      </ToolContent>
    </Tool>
  ))
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
  today,
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
  today: Today | undefined
}) => {
  const t = useT()
  return (
    <div className="under-notice relative flex min-w-0 flex-1">
      {/* A container: an email open beside the page narrows the chat as a phone would, and it takes a phone's gutter. */}
      <div className="@container flex min-w-0 flex-1 flex-col">
        <BotHeader
          bot={bot}
          isProfileOpen={isProfileOpen}
          onProfile={onProfile}
        />
        {/* Keyed: a bot opens at its newest message, not where the last one was scrolled to. */}
        <MessageScrollerProvider key={bot.bot} autoScroll>
          <ChatScroller>
            <MessageScroller className="flex-1">
              <MessageScrollerViewport aria-label={bot.name}>
                <MessageScrollerContent
                  // oxlint-disable shadcn/require-static-classes -- the guard goes on the content itself: a wrapper inside it would hide the messages from the scroller
                  className={cn(
                    'mx-auto w-full max-w-3xl gap-3 px-10 pt-6 pb-6 max-md:px-4 @max-xl:px-4',
                    STILL_POINTER_GUARD
                  )}
                  // oxlint-enable shadcn/require-static-classes
                >
                  <BotStrip bots={bots} openId={bot.bot} onOpen={onOpen} />
                  {bot.bot === 'fewmail' && (
                    <FreshCodes today={today} canUseKeys={isFocused} />
                  )}
                  <BotTimeline bot={bot} asking={asking}>
                    {bot.bot === 'fewmail' ? (
                      <BotNow>
                        <NowMessage isWide={false}>{head}</NowMessage>
                        {isWaiting && children}
                      </BotNow>
                    ) : (
                      isWaiting && <BotNow>{children}</BotNow>
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
    codes: isFewmail ? today.codes : [],
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
  const decisions = cards.filter(isImportantCard).length
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
  const now = isBoard ? (
    <BoardNow isActive={isFocused} />
  ) : (
    <>
      {picked.length > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="mr-auto text-sm font-medium">
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
      <NowMessage>
        <div className="flex flex-col gap-2.5 empty:hidden">
          <CardGroups
            cardOf={cardOf}
            groups={groups}
            listKey={botId}
            openIds={openIds}
            onToggle={toggleCard}
          />
          <WorthKnowing
            cursorId={cursorId}
            isWalking={isStepping}
            today={data}
            onSelect={setSelectedId}
          />
        </div>
      </NowMessage>
      <NowMessage>
        <StaleCards
          canUseKeys={isStepping}
          count={stale.length}
          onSkip={() => skipCards(stale.map(({ action }) => action.id))}
        />
      </NowMessage>
      {proposals.proposals.length > 0 && (
        <NowMessage>
          <ProposalsReview
            canUseKeys={isFocused && stops.length === 0}
            proposals={proposals}
          />
        </NowMessage>
      )}
      <NowMessage>
        <div className="flex flex-col gap-2.5 empty:hidden">
          <BotSuggestions today={data} />
          <NewSenders
            senders={data?.newSenders ?? []}
            canUseKeys={isStepping}
            onSettle={holdClicksUntilMove}
          />
        </div>
      </NowMessage>
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
              />
            }
            isFocused={isFocused}
            isProfileOpen={profile.isOpen}
            isWaiting={isWaiting}
            onOpen={openBot}
            onProfile={profile.handleToggle}
            today={today}
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
  beforeLoad: ({ search }) => {
    // Digests and notifications already sent still open an issue on Home.
    if (search.day) {
      throw redirect({ search: { day: search.day }, to: '/reading' })
    }
    // Agent answers and older links still open an email with `?thread=`.
    if (search.thread) {
      throw redirect({
        params: { threadId: search.thread },
        to: '/mail/$threadId',
      })
    }
  },
  component: HomePage,
  validateSearch: z.object({
    bot: z.optional(z.string()),
    day: z.optional(z.string().check(z.regex(/^\d{4}-\d{2}-\d{2}$/u))),
    thread: z.optional(z.string()),
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
