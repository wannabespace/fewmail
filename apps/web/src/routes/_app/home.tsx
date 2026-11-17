import type { RouterOutputs } from '@fewmail/api/router'
import { isImportant, usedPercent } from '@fewmail/shared/agent'
import type { ActionKind } from '@fewmail/shared/agent'
import type { Messages } from '@fewmail/shared/i18n'
import { formatResetDay } from '@fewmail/shared/i18n/locales'
import {
  Accordion,
  cardsBleedClassName,
} from '@fewmail/ui/components/accordion'
import { Button } from '@fewmail/ui/components/button'
import { MotionCollapse } from '@fewmail/ui/components/collapse.motion'
import {
  SettingsGroup,
  SettingsGroupTitle,
  SettingsRows,
} from '@fewmail/ui/components/custom/settings-group'
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@fewmail/ui/components/empty'
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemMedia,
  ItemTitle,
} from '@fewmail/ui/components/item'
import { Kbd } from '@fewmail/ui/components/kbd'
import { ProgressSegments } from '@fewmail/ui/components/progress'
import { Skeleton } from '@fewmail/ui/components/skeleton'
import { Spinner } from '@fewmail/ui/components/spinner'
import { copy } from '@fewmail/ui/lib/copy'
import { cn } from '@fewmail/ui/lib/utils'
import { Calendar03Icon, RepeatIcon } from '@hugeicons/core-free-icons'
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

import { BoardCard, BoardPane, useBoardHints } from '~/components/board'
import { confirm } from '~/components/confirm-dialog'
import { ConnectHint } from '~/components/connect-hint'
import { EmailRow } from '~/components/email-row'
import {
  collapseExpanded,
  expandRow,
  showRow,
  useExpandedRow,
  useIsThreadExpanded,
} from '~/components/expand-row'
import { HomeCard, HomeCardPane, PageHeading } from '~/components/home-card'
import type { HomeCardPage, HomeCardRow } from '~/components/home-card'
import { KeyHints } from '~/components/key-hints'
import { LogoMark } from '~/components/logo'
import { ExtractedChips, ImportanceDot } from '~/components/mail-meta'
import { PaneRows } from '~/components/pane-rows'
import type { RowPlace } from '~/components/pane-rows'
import {
  isProposal,
  PROPOSALS_ID,
  ProposalsGroup,
  ProposalsReview,
  useProposals,
} from '~/components/proposals'
import {
  cardHeadlineOf,
  foldedVerb,
  QueueCard,
  useCardActions,
  whoOf,
} from '~/components/queue-card'
import type { QueueItem } from '~/components/queue-card'
import {
  newsletterHints,
  NewslettersCard,
  NewslettersPane,
  useFreshNewsletters,
} from '~/components/reading'
import { RuleSuggestionCard } from '~/components/rule-suggestion'
import { SenderAvatar } from '~/components/sender-avatar'
import { CodeActions, sweepOf, useMailActions } from '~/components/thread-view'
import { upgradeStore } from '~/components/upgrade-dialog'
import { eventTimes } from '~/lib/calendar'
import { queueCards, todayLists, useToday } from '~/lib/home-db'
import { useDates, useLocale, useT } from '~/lib/i18n'
import { connectedApps } from '~/lib/lists-db'
import { isReadingFirstTime } from '~/lib/mail-db'
import { useHasAgent, useMe } from '~/lib/me'
import { offerBlock } from '~/lib/offer-block'
import { client, orpc } from '~/lib/orpc'
import { showUntilSettled, warmQuery } from '~/lib/query-client'
import { holdClicksUntilMove, STILL_POINTER_GUARD } from '~/lib/still-pointer'
import { pendingToast, toastUndo } from '~/lib/undo'

type Today = RouterOutputs['today']['get']

const NEW_SENDER_TOAST = 'new-sender'
const RULE_OFFER_TOAST = 'rule-offer'

const isImportantCard = ({ action, analysis }: QueueItem) =>
  isImportant(action.kind, analysis?.importance)

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
    return showUntilSettled(() => {
      if (messageId && todayLists.newSenders.has(messageId)) {
        todayLists.newSenders.delete(messageId)
      }
    })
  }
  const refetch = () =>
    queryClient.invalidateQueries({ queryKey: orpc.today.key() })
  const archive = useMutation(
    orpc.rules.createSimple.mutationOptions({
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
            queryClient.invalidateQueries({ queryKey: orpc.rules.key() }),
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

  return (
    <AnimatePresence initial={false}>
      {senders.map((sender, index) => {
        const answer = answers(sender)
        const key = (letter: string) => index === 0 && <Kbd>{letter}</Kbd>
        return (
          <MotionCollapse key={sender.messageId} initial={false}>
            <Item variant="card" size="sm">
              <ItemMedia variant="avatar">
                <SenderAvatar sender={sender} size="sm" />
              </ItemMedia>
              <ItemContent>
                <ItemTitle className="flex-wrap gap-y-0.5">
                  <span data-mask>{sender.fromName ?? sender.fromEmail}</span>
                  <span className="text-muted-foreground text-xs font-normal whitespace-nowrap">
                    {t.today.newSender.label}
                  </span>
                </ItemTitle>
                <ItemDescription>
                  {t.today.newSender.lead(sender.count, sender.opened)}
                  {sender.leftShare !== null &&
                    ` · ${t.subscriptions.leftBy(Math.round(sender.leftShare * 100))}`}
                </ItemDescription>
              </ItemContent>
              <ItemActions>
                <Button
                  size="sm"
                  variant="ghost-muted"
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
              </ItemActions>
            </Item>
          </MotionCollapse>
        )
      })}
    </AnimatePresence>
  )
}

/** Each card folds itself away on an answer; the refetch then drops it from Home's count. */
const RuleSuggestions = ({ today }: { today: Today | undefined }) =>
  today?.ruleSuggestions.map((suggestion) => (
    <RuleSuggestionCard
      key={suggestion.fromEmail}
      suggestion={suggestion}
      onAnswer={holdClicksUntilMove}
    />
  ))

/** A starter rule that changes Gmail starts off: it acts only once the user says yes here (or turns it on in Rules). */
const RuleOffers = ({
  onSettle,
  today,
}: {
  onSettle: () => void
  today: Today | undefined
}) => {
  const t = useT()
  const queryClient = useQueryClient()
  const answer = useMutation(
    orpc.rules.update.mutationOptions({
      onError: () => toast.dismiss(RULE_OFFER_TOAST),
      onMutate: ({ enabled, id }) => {
        if (enabled) {
          toast.loading(t.today.working, { id: RULE_OFFER_TOAST })
        }
        onSettle()
        return showUntilSettled(() => {
          if (todayLists.ruleOffers.has(id)) {
            todayLists.ruleOffers.delete(id)
          }
        })
      },
      onSettled: (_, __, ___, settle) =>
        settle?.(
          Promise.all([
            queryClient.invalidateQueries({ queryKey: orpc.today.key() }),
            queryClient.invalidateQueries({ queryKey: orpc.rules.key() }),
          ])
        ),
      onSuccess: ({ enabled }) =>
        enabled &&
        toast.success(t.today.ruleOffer.turnedOn, { id: RULE_OFFER_TOAST }),
    })
  )

  return (
    <AnimatePresence initial={false}>
      {today?.ruleOffers.map((rule) => (
        <MotionCollapse key={rule.id} initial={false}>
          <Item variant="card" size="sm">
            <ItemMedia variant="icon">
              <HugeiconsIcon icon={RepeatIcon} strokeWidth={2} />
            </ItemMedia>
            <ItemContent>
              <ItemTitle className="flex-wrap gap-y-0.5">
                <span data-mask>{rule.instruction}</span>
                <span className="text-muted-foreground text-xs font-normal whitespace-nowrap">
                  {t.rules.effect[rule.effect]}
                </span>
              </ItemTitle>
              <ItemDescription>{t.today.ruleOffer.lead}</ItemDescription>
            </ItemContent>
            <ItemActions>
              <Button
                size="sm"
                variant="ghost-muted"
                onClick={() => answer.mutate({ enabled: false, id: rule.id })}
              >
                {t.today.ruleOffer.no}
              </Button>
              <Button
                size="sm"
                onClick={() => answer.mutate({ enabled: true, id: rule.id })}
              >
                {t.today.ruleOffer.yes}
              </Button>
            </ItemActions>
          </Item>
        </MotionCollapse>
      ))}
    </AnimatePresence>
  )
}

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
    <SettingsGroup title={t.today.worthKnowing} isTitleSticky>
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
                  {t.today.awaiting} · <span data-mask>{row.sent.subject}</span>
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
    </SettingsGroup>
  )
}

type Newsletters = ReturnType<typeof useFreshNewsletters>['rows']

const pageHints = (
  t: Messages,
  page: HomeCardPage,
  newsletters: Newsletters,
  board: [string, string][]
): [string, string][] => {
  if (page === 'board') {
    return board
  }
  if (page === 'improve') {
    return [['esc', t.keys.close]]
  }
  if (page === 'tidy') {
    return [
      ['J / K', t.keys.move],
      ['⏎', t.keys.approve],
      ['S', t.keys.keep],
      ['O', t.keys.open],
      ['T', t.today.tidy.run],
      ['esc', t.keys.close],
    ]
  }
  return [...newsletterHints(t, newsletters), ['esc', t.keys.close]]
}

/** ⏎ on a card: one with an email opens it in the sidebar, where its proposal waits; one without says yes. */
const primaryHints = (t: Messages, item: QueueItem): [string, string][] => [
  ['⏎', item.message ? t.keys.open : t.keys.approve],
]

/** The keys that open Home's cards over its column. */
const cardHints = (
  t: Messages,
  state: {
    hasBoard: boolean
    hasImprove: boolean
    hasLater: boolean
    hasLook: boolean
    hasNewsletters: boolean
  }
): [string, string][] => [
  ...(state.hasLook ? [['Q', t.today.needsLook] as [string, string]] : []),
  ...(state.hasLater ? [['W', t.today.canWait] as [string, string]] : []),
  ...(state.hasImprove
    ? [['R', t.today.improve.title] as [string, string]]
    : []),
  ...(state.hasNewsletters
    ? [['N', t.mail.group.newsletters] as [string, string]]
    : []),
  ...(state.hasBoard ? [['B', t.nav.board] as [string, string]] : []),
]

const homeHints = (
  t: Messages,
  state: {
    alike: number
    board: [string, string][]
    hasBoard: boolean
    hasImprove: boolean
    hasLater: boolean
    hasLook: boolean
    today: Today | undefined
    hasNewsletters: boolean
    newsletters: Newsletters
    picked: number
    selected: QueueItem | undefined
    isOnProposals: boolean
    isOnWorth: boolean
    stale: number
    page: HomeCardPage | undefined
    tidy: number
  }
): [string, string][] => {
  // Needs you's and Can wait's panes hold Home's own cards: their keys are Home's.
  if (state.page && state.page !== 'look' && state.page !== 'later') {
    return pageHints(t, state.page, state.newsletters, state.board)
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
    ...(state.isOnProposals
      ? [
          ['J / K', t.keys.move] as [string, string],
          ['⏎', t.today.tidy.run] as [string, string],
          ['D', t.today.tidy.review] as [string, string],
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
    ...(state.tidy > 0
      ? [
          ['T', t.today.tidy.run] as [string, string],
          ['D', t.today.tidy.review] as [string, string],
        ]
      : []),
    ...(state.today?.newSenders.length
      ? [
          ['A', t.today.newSender.archive] as [string, string],
          ['U', t.actionKind.unsubscribe] as [string, string],
          ['I', t.today.newSender.keep] as [string, string],
        ]
      : []),
    ...cardHints(t, state),
    ...(state.today?.codes.length
      ? [['Y', t.mail.oneTimeCode.copy] as [string, string]]
      : []),
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

const headlineOf = (t: Messages, isFirstRead: boolean, decisions: number) => {
  if (isFirstRead) {
    return t.nav.syncing
  }
  return decisions === 0 ? t.today.allDone : t.today.headline(decisions)
}

/** What happened, in one sentence computed here from the counts (no model text), then what is ahead today. */
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
  const dates = useDates()
  const locale = useLocale()
  const { plan, usage } = useMe()
  // A spent allowance pauses the agent's writing, never its watch: Home says which, so nothing stops silently.
  const paused =
    plan.kind !== 'free' &&
    usedPercent(plan.kind, usage.spent) >= 100 &&
    t.today.allowanceSpent(formatResetDay(locale, usage.resetsAt))
  const lead = [
    ...(decisions === 0
      ? [t.today.allDoneLead]
      : [
          data &&
            data.pulse.total > 0 &&
            `${t.today.pulse.total(data.pulse.total, t.today.period(data.days))}.`,
          data &&
            data.pulse.people * 2 < data.pulse.total &&
            t.today.mostlyNoise(data.pulse.people),
          data && data.handled.total > 0 && t.today.byRules(data.handled.total),
        ]),
    paused,
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <header className="flex flex-col gap-3">
      <div className="text-muted-foreground flex min-h-8 items-center gap-3 text-sm">
        <p className="first-letter:uppercase">
          {updatedAt > 0 && dates.format(updatedAt, 'EEEE, d MMMM')}
        </p>
        {!!data?.reading && !isFirstRead && (
          <span className="flex items-center gap-1.5">
            <Spinner />
            {t.today.readingNow(data.reading)}
          </span>
        )}
      </div>
      {data ? (
        <h1 className="text-display font-serif tracking-tight">
          {headlineOf(t, isFirstRead, decisions)}
        </h1>
      ) : (
        <Skeleton className="my-1 h-9 w-3/5" />
      )}
      {isFirstRead ? (
        <p className="text-muted-foreground flex items-center gap-2 text-sm">
          <Spinner />
          {t.today.firstRead}
        </p>
      ) : (
        data && (
          <p className="text-brief text-foreground/80 font-serif text-balance">
            {lead}
          </p>
        )
      )}
      <DayStrip />
    </header>
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

/** Picked cards swap Needs you's title for what can be done to all of them at once. */
const LookHeading = ({
  onClose,
  picked,
  ...actions
}: {
  onApprove: () => void
  onClear: () => void
  onClose: () => void
  onSkip: () => void
  onTrash: () => void
  picked: number
}) => {
  const t = useT()
  return (
    <PageHeading
      title={picked > 0 ? t.queue.picked(picked) : t.today.needsLook}
      onClose={onClose}
      actions={picked > 0 && <PickedActions {...actions} />}
    />
  )
}

/** Needs you with its last card settled: the bird smiles over Home's own all-done words, never a bare title. */
const LookDone = ({ queue }: { queue: QueueItem[] }) => {
  const t = useT()
  if (queue.length > 0) {
    return null
  }
  return (
    <Empty>
      <EmptyHeader>
        <EmptyMedia>
          <LogoMark isHappy className="size-20" />
        </EmptyMedia>
        <EmptyTitle>{t.today.allDone}</EmptyTitle>
        <EmptyDescription>{t.today.allDoneLead}</EmptyDescription>
      </EmptyHeader>
    </Empty>
  )
}

type Settled = ReturnType<typeof useSettled>

/** Each card's share of the day's progress, in its own color: Needs you, Can wait and Quick. */
const DecisionsHeader = ({
  later,
  look,
  quick,
}: Record<'later' | 'look' | 'quick', Settled>) => {
  const t = useT()
  const parts = [
    { className: 'bg-primary', key: 'look', name: t.today.needsLook, ...look },
    { className: 'bg-success', key: 'quick', name: t.today.quick, ...quick },
    {
      className: 'bg-foreground/30',
      key: 'later',
      name: t.today.canWait,
      ...later,
    },
  ]
  const settled = parts.reduce((sum, part) => sum + part.settled, 0)
  const total = parts.reduce((sum, part) => sum + part.total, 0)

  return (
    settled < total && (
      <div className="flex min-h-7 items-center gap-3">
        <h2 className="text-muted-foreground text-xs font-medium">
          {t.today.decisions}
        </h2>
        <ProgressSegments
          className="flex-1"
          max={total}
          segments={parts.map(({ className, key, name, ...part }) => ({
            className,
            key,
            label: `${name}: ${t.today.progress(part.settled, part.total)}`,
            value: part.settled,
          }))}
        />
        <span className="text-muted-foreground text-xs font-medium tabular-nums">
          {t.today.progress(settled, total)}
        </span>
      </div>
    )
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

/** Home's important cards as one card, opened over Home's column (`Q`, `?page=look`): what they ask and the first few. */
const LookCard = ({ queue }: { queue: QueueItem[] }) => {
  const t = useT()
  if (queue.length === 0) {
    return null
  }
  return (
    <HomeCard
      heading={t.today.needsLook}
      lead={kindsOf(t, queue)
        .map(({ count, label }) => `${label} ${count}`)
        .join(' · ')}
      page="look"
      rows={queue.map(cardRowOf)}
    />
  )
}

const cardRowOf = (item: QueueItem): HomeCardRow => ({
  id: item.action.id,
  sender: whoOf(item) ?? { fromEmail: '', fromName: 'Fewmail' },
  text: cardHeadlineOf(item),
})

const laterCountOf = (cards: QueueItem[], today: Today) =>
  cards.length + worthRowsOf(today).length + today.newSenders.length

const homeFlagsOf = (today: Today | undefined, laterCards: QueueItem[]) => ({
  hasLater: Boolean(today && laterCountOf(laterCards, today) > 0),
  isFirstRead: Boolean(today && isReadingFirstTime(today.mailboxes)),
})

/** What can wait as one card (`W`, `?page=later`): the cards that only ask to read, Worth knowing's mail, new senders. */
const LaterCard = ({
  cards,
  today,
}: {
  cards: QueueItem[]
  today: Today | undefined
}) => {
  const t = useT()
  if (!today || laterCountOf(cards, today) === 0) {
    return null
  }
  const lead = [
    ...kindsOf(t, cards).map(({ count, label }) => `${label} ${count}`),
    today.recent.length > 0 && t.today.worth.important(today.recent.length),
    today.dates.length > 0 && t.today.worth.dated(today.dates.length),
    today.awaiting.length > 0 && t.today.worth.awaiting(today.awaiting.length),
    today.newSenders.length > 0 &&
      `${t.today.newSender.label} ${today.newSenders.length}`,
  ]
    .filter((part) => typeof part === 'string')
    .join(' · ')
  const rows: HomeCardRow[] = [
    ...cards.map(cardRowOf),
    ...[...today.recent, ...today.dates].map(({ analysis, message }) => ({
      id: message.id,
      sender: message,
      text: analysis.summary,
    })),
    ...today.awaiting.map((sent) => ({
      id: sent.threadId,
      sender: { fromEmail: sent.to[0] ?? '', fromName: sent.toName },
      text: `${t.today.awaiting} · ${sent.subject}`,
    })),
  ]
  return (
    <HomeCard
      heading={t.today.canWait}
      lead={`${lead.charAt(0).toUpperCase()}${lead.slice(1)}`}
      page="later"
      rows={rows}
    />
  )
}

/** What the agent offers to take over (`R`, `?page=improve`): rules for a sender it keeps judging quiet, starter rules. */
const ImproveCard = ({ today }: { today: Today | undefined }) => {
  const t = useT()
  const total = improveCountOf(today)
  if (!today || total === 0) {
    return null
  }
  const rows: HomeCardRow[] = [
    ...today.ruleSuggestions.map((suggestion) => ({
      id: suggestion.fromEmail,
      sender: suggestion,
      text: t.today.ruleSuggestion.yes[suggestion.effect],
    })),
    ...today.ruleOffers.map((rule) => ({
      icon: RepeatIcon,
      id: rule.id,
      name: rule.instruction,
      text: t.rules.effect[rule.effect],
    })),
  ]
  return (
    <HomeCard
      heading={t.today.improve.title}
      lead={t.today.improve.lead(total)}
      page="improve"
      rows={rows}
    />
  )
}

const improveCountOf = (today: Today | undefined) =>
  (today?.ruleSuggestions.length ?? 0) + (today?.ruleOffers.length ?? 0)

/**
 * The cursor holds a card, not a position: a card arriving above it live must never take ⏎ from the one being read.
 * A card that leaves hands the cursor to whichever card takes its place.
 * There is none until J / K or a click: a lit card nobody picked reads as ⏎'s target.
 */
const useCursor = (stops: string[], page: HomeCardPage | undefined) => {
  // Each pane has its own: carried into the next one, it lit the card at its old place there, which scrolled itself into
  // view while the pane was still growing out of its card, and the pane opened scrolled and jumped.
  const [selected, setSelected] = useState<{
    id: string
    page?: HomeCardPage
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

/** A card's key opens its pane over Home's column; the same key or esc brings Home back. */
const useHomeSubpage = (
  page: HomeCardPage | undefined,
  canSwitch: boolean,
  {
    hasAgent,
    hasImprove,
    hasLater,
    hasLook,
    hasNewsletters,
    hasProposals,
  }: {
    hasAgent: boolean
    hasImprove: boolean
    hasLater: boolean
    hasLook: boolean
    hasNewsletters: boolean
    hasProposals: boolean
  }
) => {
  const navigate = useNavigate()
  const show = (next: HomeCardPage | undefined) =>
    navigate({ search: (prev) => ({ ...prev, page: next }), to: '/home' })
  const toggle = (next: HomeCardPage) => show(page === next ? undefined : next)
  useHotkey('Escape', () => show(undefined), { enabled: canSwitch && !!page })
  useHotkey('N', () => toggle('newsletters'), {
    enabled: canSwitch && hasNewsletters,
  })
  useHotkey('D', () => toggle('tidy'), {
    enabled: canSwitch && hasProposals && page !== 'board',
  })
  useHotkey('B', () => toggle('board'), { enabled: canSwitch && hasAgent })
  useHotkey('Q', () => toggle('look'), { enabled: canSwitch && hasLook })
  useHotkey('W', () => toggle('later'), { enabled: canSwitch && hasLater })
  // The Board's pane takes R for reopening a promise.
  useHotkey('R', () => toggle('improve'), {
    enabled: canSwitch && hasImprove && page !== 'board',
  })
}

/** Home's keys rest while an expanded email lies over Home, its proposal taking them. */
const useHomeFocus = (page: HomeCardPage | undefined) => {
  const isFocused = !useIsThreadExpanded()
  const isInList = page === 'look' || page === 'later'
  // Needs you's and Can wait's panes hold Home's own cards and rows, so Home's cursor walks them there, and only them.
  return {
    isFocused,
    isInQueue: isFocused && isInList,
    isStepping: isFocused && (!page || isInList),
    isWalking: isFocused && !page,
  }
}

/** Where Home's cursor goes: on Home the agent's proposals; in a card's pane its cards, then (Can wait) its mail. */
const stopsOf = (
  page: HomeCardPage | undefined,
  {
    hasProposals,
    queue,
    worth,
  }: { hasProposals: boolean; queue: QueueItem[]; worth: WorthRow[] }
) => {
  if (page === 'look' || page === 'later') {
    return [
      ...queue.map(({ action }) => action.id),
      ...(page === 'later' ? worth.map(({ id }) => worthStop(id)) : []),
    ]
  }
  return hasProposals ? [PROPOSALS_ID] : []
}

/** What left a card since the page opened, however it left (here, the sidebar, another tab); an Undo brings one back. */
const useSettled = (current: string[]) => {
  const [seen, setSeen] = useState<ReadonlySet<string>>(new Set())
  const ids = new Set(current)
  const fresh = [...ids].filter((id) => !seen.has(id))
  if (fresh.length > 0) {
    setSeen(new Set([...seen, ...fresh]))
  }
  const settled = [...seen].filter((id) => !ids.has(id)).length
  return { settled, total: settled + ids.size }
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

/** Needs you holds the important cards; Can wait the rest but the agent's proposals, which Tidy's card holds. */
const useHomeLists = (cards: QueueItem[]) => {
  const importantCards = cards.filter(isImportantCard)
  return {
    groups: useKindGroups(importantCards),
    importantCards,
    laterCards: cards.filter(
      (card) => !isProposal(card) && !isImportantCard(card)
    ),
  }
}

const HomePage = () => {
  const t = useT()
  const navigate = useNavigate()
  const closePage = () =>
    navigate({ search: (prev) => ({ ...prev, page: undefined }), to: '/home' })
  const hasAgent = useHasAgent()
  const queryClient = useQueryClient()
  const search = Route.useSearch()
  const { page } = search
  const { rows: newsletters } = useFreshNewsletters()
  const hasNewsletters = newsletters.length > 0
  const { data, dataUpdatedAt } = useToday()

  const { data: cards } = useLiveQuery((query) =>
    query.from({ card: queueCards }).orderBy(({ card }) => card.rank)
  )
  const { groups, importantCards, laterCards } = useHomeLists(cards)
  const { hasLater, isFirstRead } = homeFlagsOf(data, laterCards)
  const decisions = importantCards.length
  const proposals = useProposals(data, cards, holdClicksUntilMove)
  const hasProposals = proposals.proposals.length > 0
  const worth = worthRowsOf(data)
  const settled = {
    later: useSettled([
      ...laterCards.map(({ action }) => action.id),
      ...worth.map(({ id }) => id),
      ...(data?.newSenders ?? []).map(({ fromEmail }) => fromEmail),
    ]),
    look: useSettled(importantCards.map(({ action }) => action.id)),
    quick: useSettled(proposals.proposals.map(({ id }) => id)),
  }
  const hasImprove = improveCountOf(data) > 0
  const queue = page === 'later' ? laterCards : groups.shown
  const stops = stopsOf(page, { hasProposals, queue, worth })
  const { cursorId, cursorIndex, setSelectedId } = useCursor(stops, page)
  const isOnProposals = cursorId === PROPOSALS_ID
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
  const stale = importantCards.filter(
    ({ action }) => action.createdAt < staleBefore
  )

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

  const move = (step: number) => {
    const next =
      stops[Math.min(stops.length - 1, Math.max(0, cursorIndex + step))]
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
    } else if (isOnProposals) {
      proposals.approve(proposals.proposals)
    } else if (selected?.message) {
      openCardEmail(selected)
    } else if (selected) {
      approve.mutate({ id: selected.action.id })
    }
  }
  const skipTargets = () => skipCards(targets.map(({ action }) => action.id))

  const { isFocused, isInQueue, isStepping, isWalking } = useHomeFocus(page)
  useHomeSubpage(page, isFocused, {
    hasAgent,
    hasImprove,
    hasLater,
    hasLook: importantCards.length > 0,
    hasNewsletters,
    hasProposals,
  })
  const boardHints = useBoardHints()
  const walkKeys = { enabled: isStepping && stops.length > 0 }
  const listKeys = { enabled: isInQueue && !!selected }
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
    { enabled: isInQueue && queue.length > 0 }
  )
  useHotkey('Escape', () => setPickedIds([]), {
    enabled: isInQueue && picked.length > 0,
  })
  useHotkey('Space', () => selected && openCard(selected), listKeys)
  useOpenKey(worthRow, selected, isStepping)
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
  const cardList = (items: QueueItem[], key?: string) => (
    <Accordion
      variant="list"
      hidden={items.length === 0}
      value={openIds}
      onValueChange={toggleCard}
    >
      <PaneRows listKey={key} rowKey={({ action }) => action.id} rows={items}>
        {cardOf}
      </PaneRows>
    </Accordion>
  )

  return (
    <div className="flex min-h-0 min-w-0 flex-1 flex-col">
      <main className="flex min-h-0 flex-1 flex-col">
        <div className="relative min-h-0 flex-1">
          <div className="under-notice h-full overflow-y-auto">
            <div
              className={cn(
                'mx-auto flex max-w-3xl flex-col gap-8 px-10 pt-12 pb-16 max-md:px-4 max-md:pt-6',
                STILL_POINTER_GUARD
              )}
            >
              <HomeHeader
                data={data}
                decisions={decisions}
                isFirstRead={isFirstRead}
                updatedAt={dataUpdatedAt}
              />
              <ConnectHint />
              <FreshCodes today={data} canUseKeys={isWalking} />

              <section
                aria-label={t.today.decisions}
                className="flex flex-col gap-2.5"
              >
                <DecisionsHeader {...settled} />
                <div
                  className={cn(
                    'flex flex-col gap-3 empty:hidden',
                    cardsBleedClassName
                  )}
                >
                  <LookCard queue={importantCards} />
                  <div className="grid gap-3 empty:hidden md:grid-cols-2 md:[&>:last-child:nth-child(odd)]:col-span-2">
                    <LaterCard cards={laterCards} today={data} />
                    <ImproveCard today={data} />
                    <ProposalsGroup
                      canUseKeys={isWalking}
                      isSelected={isOnProposals}
                      proposals={proposals}
                    />
                    {hasAgent && <BoardCard />}
                  </div>
                </div>
              </section>
              <div className={cn('empty:hidden', cardsBleedClassName)}>
                <NewslettersCard isActive={isWalking} />
              </div>
            </div>
          </div>
          {/* A closing pane stays mounted while it shrinks back into its card; one open on load is simply there. */}
          <AnimatePresence initial={false}>
            {page === 'look' && (
              <HomeCardPane key="look" page="look">
                <LookHeading
                  picked={picked.length}
                  onApprove={approveTargets}
                  onClear={() => setPickedIds([])}
                  onClose={closePage}
                  onSkip={skipTargets}
                  onTrash={() => trashMany.mutate(picked)}
                />
                <LookDone queue={importantCards} />
                {groups.groups.map((group) => (
                  <section key={group.kind} className="flex flex-col gap-2">
                    <SettingsGroupTitle
                      isSticky
                      action={
                        (group.shown.length < group.count ||
                          group.isUnfolded) && (
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
                    >
                      {group.label}
                      <span className="tabular-nums opacity-60">
                        {group.count}
                      </span>
                    </SettingsGroupTitle>
                    {cardList(group.shown, `${group.kind}:${group.isUnfolded}`)}
                  </section>
                ))}
                <StaleCards
                  canUseKeys={isInQueue}
                  count={stale.length}
                  onSkip={() => skipCards(stale.map(({ action }) => action.id))}
                />
              </HomeCardPane>
            )}
            {page === 'later' && (
              <HomeCardPane key="later" page="later">
                <PageHeading title={t.today.canWait} onClose={closePage} />
                {cardList(laterCards)}
                <WorthKnowing
                  cursorId={cursorId}
                  isWalking={isStepping}
                  today={data}
                  onSelect={setSelectedId}
                />
                <div
                  className={cn(
                    'flex flex-col gap-2.5 empty:hidden',
                    cardsBleedClassName
                  )}
                >
                  <NewSenders
                    senders={data?.newSenders ?? []}
                    canUseKeys={isStepping}
                    onSettle={holdClicksUntilMove}
                  />
                </div>
              </HomeCardPane>
            )}
            {page === 'improve' && (
              <HomeCardPane key="improve" page="improve">
                <PageHeading
                  title={t.today.improve.title}
                  onClose={closePage}
                />
                <div
                  className={cn('flex flex-col gap-2.5', cardsBleedClassName)}
                >
                  <RuleSuggestions today={data} />
                  <RuleOffers today={data} onSettle={holdClicksUntilMove} />
                </div>
              </HomeCardPane>
            )}
            {page === 'board' && (
              <HomeCardPane key="board" page="board">
                <BoardPane isActive={isFocused} onClose={closePage} />
              </HomeCardPane>
            )}
            {page === 'newsletters' && (
              <HomeCardPane key="newsletters" page="newsletters">
                <NewslettersPane isActive={isFocused} onClose={closePage} />
              </HomeCardPane>
            )}
            {page === 'tidy' && (
              <HomeCardPane key="tidy" page="tidy">
                <ProposalsReview
                  canUseKeys={isFocused}
                  proposals={proposals}
                  onClose={closePage}
                />
              </HomeCardPane>
            )}
          </AnimatePresence>
        </div>
        <KeyHints
          hints={homeHints(t, {
            alike: alike.length,
            board: boardHints,
            hasBoard: hasAgent,
            hasImprove,
            hasLater,
            hasLook: importantCards.length > 0,
            hasNewsletters,
            newsletters,
            page,
            selected,
            isOnProposals,
            isOnWorth: !!worthRow,
            picked: picked.length,
            stale: stale.length,
            tidy: proposals.proposals.length,
            today: data,
          })}
        />
      </main>
    </div>
  )
}

export const Route = createFileRoute('/_app/home')({
  beforeLoad: ({ context: { me }, preload, search }) => {
    // The Board is what the agent writes down: Free gets the upgrade dialog instead (`domain.md` → Free).
    if (search.page === 'board' && me.plan.kind === 'free') {
      if (!preload) {
        upgradeStore.set('board')
      }
      throw redirect({ search: {}, to: '/home' })
    }
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
    day: z.optional(z.string().check(z.regex(/^\d{4}-\d{2}-\d{2}$/u))),
    page: z.optional(
      z.enum(['board', 'improve', 'later', 'look', 'newsletters', 'tidy'])
    ),
    thread: z.optional(z.string()),
  }),
  // Everything Home draws on its first frame: loaded after it, the newsletters' card came in under cards already
  // there and the connect hint pushed the page down as it came in.
  loader: async ({ context: { me } }) => {
    const hasAgent = me.plan.kind !== 'free'
    await Promise.all([
      warmQuery(orpc.today.get.queryOptions()),
      warmQuery(orpc.reading.issues.queryOptions()).then((issues) =>
        issues?.[0]?.isFresh
          ? warmQuery(
              orpc.reading.day.queryOptions({ input: { day: issues[0].day } })
            )
          : null
      ),
      connectedApps.preload(),
      hasAgent && warmQuery(orpc.integrations.telegram.get.queryOptions()),
      hasAgent && warmQuery(orpc.integrations.whatsapp.get.queryOptions()),
      queueCards.preload(),
      ...Object.values(todayLists).map((list) => list.preload()),
    ])
  },
})
