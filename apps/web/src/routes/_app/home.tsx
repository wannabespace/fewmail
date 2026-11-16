import type { RouterOutputs } from '@fewmail/api/router'
import {
  cardPayload,
  sendsDraft,
  UNDO_SEND_SECONDS,
  usedPercent,
} from '@fewmail/shared/agent'
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
  SettingsRows,
} from '@fewmail/ui/components/custom/settings-group'
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemMedia,
  ItemTitle,
} from '@fewmail/ui/components/item'
import { Kbd } from '@fewmail/ui/components/kbd'
import { Progress } from '@fewmail/ui/components/progress'
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
import { type } from 'arktype'
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
import { AnimatePresence, motion } from 'motion/react'
import { useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import { toast } from 'sonner'

import { BoardCard, BoardPane, useBoardHints } from '~/components/board'
import { confirm } from '~/components/confirm-dialog'
import { ConnectHint } from '~/components/connect-hint'
import { EmailRow } from '~/components/email-row'
import { expandRow, useIsThreadExpanded } from '~/components/expand-row'
import { HomeCard, HomeCardPane, PageHeading } from '~/components/home-card'
import type { HomeCardPage, HomeCardRow } from '~/components/home-card'
import { KeyHints } from '~/components/key-hints'
import { ExtractedChips, ImportanceDot } from '~/components/mail-meta'
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
  openCardLink,
  primaryStep,
  QueueCard,
  whoOf,
} from '~/components/queue-card'
import type { QueueItem } from '~/components/queue-card'
import {
  openReadingDays,
  ReadingPane,
  ReadingSection,
  useReadingDay,
  useReadingIssues,
} from '~/components/reading'
import { SenderAvatar } from '~/components/sender-avatar'
import { CodeActions, sweepOf, useMailActions } from '~/components/thread-view'
import { upgradeStore, useWithAgent } from '~/components/upgrade-dialog'
import { eventTimes } from '~/lib/calendar'
import { queueCards } from '~/lib/home-db'
import { useDates, useLocale, useT } from '~/lib/i18n'
import { isReadingFirstTime } from '~/lib/mail-db'
import { useHasAgent, useMe } from '~/lib/me'
import { offerBlock } from '~/lib/offer-block'
import { client, orpc } from '~/lib/orpc'
import { warmQuery } from '~/lib/query-client'
import { holdClicksUntilMove, STILL_POINTER_GUARD } from '~/lib/still-pointer'
import { pendingToast, runUndo, toastUndo } from '~/lib/undo'

type Today = RouterOutputs['today']['get']

const NEW_SENDER_TOAST = 'new-sender'
const RULE_OFFER_TOAST = 'rule-offer'
const ADD_EVENT_TOAST = 'add-event'

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
  const answered = (sender: Today['newSenders'][number]) => {
    onSettle()
    queryClient.setQueryData(
      orpc.today.get.queryKey(),
      (old) =>
        old && {
          ...old,
          newSenders: old.newSenders.filter(
            ({ messageId }) => messageId !== sender.messageId
          ),
        }
    )
  }
  const refetch = () =>
    queryClient.invalidateQueries({ queryKey: orpc.today.key() })
  const archive = useMutation(
    orpc.rules.createSimple.mutationOptions({
      ...pendingToast(NEW_SENDER_TOAST),
      onSettled: () =>
        Promise.all([
          refetch(),
          queryClient.invalidateQueries({ queryKey: orpc.rules.key() }),
        ]),
      onSuccess: () =>
        toast.success(t.today.newSender.archived, { id: NEW_SENDER_TOAST }),
    })
  )
  const keep = useMutation(
    orpc.today.keepSender.mutationOptions({ onSettled: refetch })
  )
  const unsubscribe = useMutation(
    orpc.subscriptions.unsubscribe.mutationOptions({
      // Leaving a list can take a while (its page, a mailto): the toast says so until the answer.
      onMutate: ({ messageId }) => {
        toast.loading(t.mail.unsubscribing, { id: messageId })
      },
      onError: (_, { messageId }) => toast.dismiss(messageId),
      onSettled: () =>
        Promise.all([
          refetch(),
          queryClient.invalidateQueries({ queryKey: orpc.mail.key() }),
        ]),
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
    handleArchive: () => {
      answered(sender)
      archive.mutate({
        effect: 'archive',
        match: { field: 'from', value: sender.fromEmail },
      })
    },
    handleKeep: () => {
      answered(sender)
      keep.mutate({ messageId: sender.messageId })
    },
    handleUnsubscribe: () =>
      confirm({
        action: t.subscriptions.unsubscribe,
        description: t.subscriptions.unsubscribeHint(
          t.cleanup.emails(sender.count)
        ),
        onConfirm: () => {
          answered(sender)
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
          )
        },
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
                <ItemTitle>
                  <span data-mask>{sender.fromName ?? sender.fromEmail}</span>
                  <span className="text-muted-foreground text-xs font-normal">
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
        queryClient.setQueryData(
          orpc.today.get.queryKey(),
          (old) =>
            old && {
              ...old,
              ruleOffers: old.ruleOffers.filter((rule) => rule.id !== id),
            }
        )
      },
      onSettled: () =>
        Promise.all([
          queryClient.invalidateQueries({ queryKey: orpc.today.key() }),
          queryClient.invalidateQueries({ queryKey: orpc.rules.key() }),
        ]),
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
              <ItemTitle>
                <span data-mask>{rule.instruction}</span>
                <span className="text-muted-foreground text-xs font-normal">
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
  const queryClient = useQueryClient()
  const actions = useMailActions((messageId) =>
    queryClient.setQueryData(
      orpc.today.get.queryKey(),
      (old) =>
        old && {
          ...old,
          codes: old.codes.filter(({ id }) => id !== messageId),
        }
    )
  )
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
  onClose,
  onSelect,
  today,
}: {
  cursorId: string | undefined
  isWalking: boolean
  onClose: () => void
  onSelect: (stop: string) => void
  today: Today | undefined
}) => {
  const t = useT()
  const queryClient = useQueryClient()
  const actions = useMailActions((messageId) =>
    queryClient.setQueryData(
      orpc.today.get.queryKey(),
      (old) =>
        old && {
          ...old,
          dates: old.dates.filter(({ message }) => message.id !== messageId),
          recent: old.recent.filter(({ message }) => message.id !== messageId),
        }
    )
  )
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
  const rowOf = (rowId: string) => ({
    actions,
    active: cursorId === worthStop(rowId),
    from: 'home' as const,
    onSelect: () => onSelect(worthStop(rowId)),
    rowId,
  })

  if (
    !today ||
    today.recent.length + today.dates.length + today.awaiting.length === 0
  ) {
    return null
  }
  return (
    <>
      <PageHeading title={t.today.worthKnowing} onClose={onClose} />
      <SettingsGroup>
        {today.recent.map(({ analysis, message }) => (
          <EmailRow
            key={message.id}
            {...rowOf(message.id)}
            message={message}
            description={<span data-mask>{analysis.summary}</span>}
            facts={
              <ImportanceDot
                importance={analysis.importance}
                reason={analysis.reason}
              />
            }
          />
        ))}
        {today.dates.map(({ analysis, message }) => (
          <EmailRow
            key={message.id}
            {...rowOf(message.id)}
            message={message}
            description={<span data-mask>{analysis.summary}</span>}
            facts={
              <ExtractedChips
                extracted={{ ...analysis.extracted, amount: null }}
              />
            }
          />
        ))}
        {today.awaiting.map((sent) => (
          <EmailRow
            key={sent.threadId}
            {...rowOf(sent.threadId)}
            actions={undefined}
            message={{ ...sent, fromEmail: sent.to[0] ?? '' }}
            sender={{ fromEmail: sent.to[0] ?? '', fromName: sent.toName }}
            description={
              <>
                {t.today.awaiting} · <span data-mask>{sent.subject}</span>
              </>
            }
          />
        ))}
      </SettingsGroup>
    </>
  )
}

/** Home's mail worth knowing as one card: how much of each kind and from whom; the rows open over Home's column (`W`). */
const WorthCard = ({ today }: { today: Today | undefined }) => {
  const t = useT()
  if (!today) {
    return null
  }
  const parts = [
    today.recent.length > 0 && t.today.worth.important(today.recent.length),
    today.dates.length > 0 && t.today.worth.dated(today.dates.length),
    today.awaiting.length > 0 && t.today.worth.awaiting(today.awaiting.length),
  ].filter((part) => typeof part === 'string')
  if (parts.length === 0) {
    return null
  }
  const lead = parts.join(', ')
  const rows: HomeCardRow[] = [
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
      heading={t.today.worthKnowing}
      lead={`${lead.charAt(0).toUpperCase()}${lead.slice(1)}.`}
      page="worth"
      rows={rows}
    />
  )
}

type HomeSubpage = HomeCardPage | 'reading'

type Newsletters = ReturnType<typeof useReadingDay>['rows']

const pageHints = (
  t: Messages,
  page: HomeSubpage,
  newsletters: Newsletters,
  board: [string, string][]
): [string, string][] => {
  if (page === 'board') {
    return board
  }
  if (page === 'worth') {
    return [
      ['J / K', t.keys.move],
      ['⏎', t.keys.open],
      ['E', t.keys.archive],
      ['⌫', t.keys.trash],
      ['esc', t.keys.close],
    ]
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
  return [
    ...(newsletters.length > 0
      ? ([
          ['J / K', t.keys.move],
          ['⏎', t.keys.open],
          ['E', t.keys.archive],
          ['⌫', t.keys.trash],
        ] as [string, string][])
      : []),
    ...(newsletters.some(({ isUnread }) => isUnread)
      ? [['⇧I', t.reading.markAllRead] as [string, string]]
      : []),
    ['esc', t.keys.close],
  ]
}

/** A reply card whose email names a meeting also adds it to the calendar (`L`), apart from Send. */
const hasEvent = (item: QueueItem | undefined) =>
  !!item && sendsDraft(item.action) && !!cardPayload(item.action).event

const primaryHints = (t: Messages, item: QueueItem): [string, string][] => {
  const step = primaryStep(item.action)
  if (hasEvent(item)) {
    return [
      ['⏎', t.keys.approve],
      ['L', t.queue.addToCalendar],
    ]
  }
  if (step === 'approve') {
    return [['⏎', t.keys.approve]]
  }
  return [
    ['⏎', step === 'link' ? t.keys.openLink : t.keys.writeReminder],
    ['M', t.keys.done],
  ]
}

/** The keys that open Home's cards over its column. */
const cardHints = (
  t: Messages,
  state: {
    hasBoard: boolean
    hasLook: boolean
    hasNewsletters: boolean
    hasWorth: boolean
  }
): [string, string][] => [
  ...(state.hasLook ? [['Q', t.today.needsLook] as [string, string]] : []),
  ...(state.hasNewsletters ? [['N', t.reading.title] as [string, string]] : []),
  ...(state.hasWorth ? [['W', t.today.worthKnowing] as [string, string]] : []),
  ...(state.hasBoard ? [['B', t.nav.board] as [string, string]] : []),
]

const homeHints = (
  t: Messages,
  state: {
    alike: number
    board: [string, string][]
    hasBoard: boolean
    hasLook: boolean
    hasWorth: boolean
    hasFilter: boolean
    today: Today | undefined
    isEditing: boolean
    isRewriting: boolean
    hasNewsletters: boolean
    newsletters: Newsletters
    picked: number
    selected: QueueItem | undefined
    isOnProposals: boolean
    stale: number
    page: HomeSubpage | undefined
    tidy: number
  }
): [string, string][] => {
  if (state.isRewriting) {
    return [
      ['⏎', t.keys.rewrite],
      ['esc', t.keys.stopEditing],
    ]
  }
  if (state.isEditing) {
    return [
      ['⌘⏎', t.keys.send],
      ['esc', t.keys.stopEditing],
    ]
  }
  // Needs a look's pane holds Home's own cards: their keys are Home's.
  if (state.page && state.page !== 'look') {
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
          ['Space', t.keys.expand] as [string, string],
          ...primaryHints(t, state.selected),
          ...(state.selected.message
            ? [['O', t.keys.open] as [string, string]]
            : []),
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
    ...(state.selected && sendsDraft(state.selected.action)
      ? [
          ['E', t.keys.edit] as [string, string],
          ['R', t.keys.rewrite] as [string, string],
        ]
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
    ...(state.hasFilter ? [['F', t.keys.filter] as [string, string]] : []),
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
const QUEUE_SHOWN = 5
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
  const { data: events = [] } = useQuery(
    orpc.calendar.events.queryOptions({
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
          t.today.readAll,
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
          <p className="text-brief text-foreground/80 font-serif">{lead}</p>
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

/** Picked cards swap the progress for what can be done to all of them at once. */
/** Needs a look's pane says what it holds, or how many are picked with what to do with them. */
const LookHeading = ({
  children,
  onClose,
  picked,
  ...actions
}: {
  children: ReactNode
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
    >
      {children}
    </PageHeading>
  )
}

const DecisionsHeader = ({
  decisions,
  settled,
}: {
  decisions: number
  settled: number
}) => {
  const t = useT()

  return (
    <div className="flex min-h-7 items-center gap-3">
      <h2 className="text-muted-foreground text-xs font-medium">
        {t.today.decisions}
      </h2>
      {decisions > 0 && (
        <>
          <Progress
            className="flex-1"
            value={(settled / (settled + decisions)) * 100}
          />
          <span className="text-muted-foreground text-xs font-medium tabular-nums">
            {t.today.progress(settled, settled + decisions)}
          </span>
        </>
      )}
    </div>
  )
}

const KIND_FILTER_FROM = 5

/** Narrows the queue to one kind of card (F cycles); a kind that empties falls back to all. */
const useKindFilter = (queue: QueueItem[]) => {
  const [kind, setKind] = useState<ActionKind | null>(null)
  const kinds = [...new Set(queue.map(({ action }) => action.kind))]
  const active = kind && kinds.includes(kind) ? kind : null
  const isOffered = kinds.length > 1 && queue.length >= KIND_FILTER_FROM
  const cycle = () =>
    setKind(kinds[(active ? kinds.indexOf(active) : -1) + 1] ?? null)
  return {
    active,
    cycle,
    isOffered,
    kinds,
    setKind,
    shown: active
      ? queue.filter(({ action }) => action.kind === active)
      : queue,
  }
}

/** Each kind of card in the queue with what its cards ask, the words of the filter and of Needs a look's card. */
const kindsOf = (t: Messages, queue: QueueItem[]) =>
  [...new Set(queue.map(({ action }) => action.kind))].map((kind) => {
    const cards = queue.filter(({ action }) => action.kind === kind)
    const verbs = new Set(cards.map(({ action }) => foldedVerb(t, action)))
    const [verb] = verbs
    return {
      count: cards.length,
      kind,
      label: verbs.size === 1 && verb ? verb : t.actionKind[kind],
    }
  })

/** Home's decision cards as one card, opened like Reading's (`Q`, `?page=look`): what they ask and the first few. */
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
      rows={queue.map((item) => ({
        id: item.action.id,
        sender: whoOf(item) ?? { fromEmail: '', fromName: 'Fewmail' },
        text: cardHeadlineOf(item),
      }))}
    />
  )
}

const KindFilter = ({
  canUseKeys,
  filter,
  queue,
}: {
  canUseKeys: boolean
  filter: ReturnType<typeof useKindFilter>
  queue: QueueItem[]
}) => {
  const t = useT()
  useHotkey('F', filter.cycle, { enabled: canUseKeys && filter.isOffered })
  const pill = (kind: ActionKind | null, label: string, count: number) => (
    <Button
      key={kind ?? 'all'}
      size="xs"
      variant={filter.active === kind ? 'secondary' : 'ghost-muted'}
      onClick={() => filter.setKind(kind)}
    >
      {label}
      <span className="text-muted-foreground tabular-nums">{count}</span>
    </Button>
  )

  return (
    filter.isOffered && (
      <div className="flex flex-wrap items-center gap-1">
        {pill(null, t.today.allKinds, queue.length)}
        {kindsOf(t, queue).map(({ count, kind, label }) =>
          pill(kind, label, count)
        )}
        <Kbd>F</Kbd>
      </div>
    )
  )
}

/**
 * The cursor holds a card, not a position: a card arriving above it live must never take ⏎ from the one being read.
 * A card that leaves hands the cursor to whichever card takes its place.
 * There is none until J / K or a click: a lit card nobody picked reads as ⏎'s target.
 */
const useCursor = (stops: string[]) => {
  const [selectedId, setSelectedId] = useState<string | null>(null)
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

/** Every card is one decision and all the agent's proposals one more, as `today.count` (the sidebar) counts them. */
const countDecisions = (
  data: Today | undefined,
  cards: number,
  proposals: number
) =>
  data
    ? cards +
      data.newSenders.length +
      data.ruleOffers.length +
      Math.min(proposals, 1)
    : 0

/** A reply card's meeting goes in the calendar apart from Send (`L` on the cursor card). */
const useAddEvent = (selected: QueueItem | undefined, canUseKeys: boolean) => {
  const t = useT()
  const queryClient = useQueryClient()
  const addEvent = useMutation(
    orpc.actions.addEvent.mutationOptions({
      ...pendingToast(ADD_EVENT_TOAST),
      onSettled: () =>
        Promise.all([
          queryClient.invalidateQueries({ queryKey: orpc.today.key() }),
          queryClient.invalidateQueries({ queryKey: orpc.calendar.key() }),
        ]),
      onSuccess: () => toast.success(t.calendar.saved, { id: ADD_EVENT_TOAST }),
    })
  )
  // The button leaves on the press, so a second press never adds the meeting twice.
  const addEventOf = (id: string) => {
    const card = queueCards.get(id)
    if (card) {
      queueCards.utils.writeUpdate({
        ...card,
        action: {
          ...card.action,
          payload: { ...card.action.payload, event: undefined },
        },
      })
    }
    addEvent.mutate({ id })
  }
  useHotkey('L', () => selected && addEventOf(selected.action.id), {
    enabled: canUseKeys && hasEvent(selected),
  })
  return addEventOf
}

/**
 * The proposals' review (`D`) takes Home's column and Reading (`N`) opens over it; the same key or esc brings Home back.
 * A day's issue (`day`) lies over both, so esc closes it first.
 */
const useHomeSubpage = (
  page: HomeSubpage | undefined,
  day: string | undefined,
  canSwitch: boolean,
  {
    hasAgent,
    hasNewsletters,
    hasLook,
    hasProposals,
    hasWorth,
  }: {
    hasAgent: boolean
    hasLook: boolean
    hasNewsletters: boolean
    hasProposals: boolean
    hasWorth: boolean
  }
) => {
  const navigate = useNavigate()
  const show = (next: HomeSubpage | undefined) =>
    navigate({ search: (prev) => ({ ...prev, page: next }), to: '/home' })
  const toggle = (next: HomeSubpage) => show(page === next ? undefined : next)
  useHotkey(
    'Escape',
    () =>
      day
        ? navigate({
            search: (prev) => ({ ...prev, day: undefined }),
            to: '/home',
          })
        : show(undefined),
    { enabled: canSwitch && (!!page || !!day) }
  )
  useHotkey('N', () => toggle('reading'), {
    enabled: canSwitch && hasNewsletters,
  })
  useHotkey('D', () => toggle('tidy'), {
    enabled: canSwitch && hasProposals && page !== 'board',
  })
  useHotkey('B', () => toggle('board'), { enabled: canSwitch && hasAgent })
  useHotkey('W', () => toggle('worth'), { enabled: canSwitch && hasWorth })
  useHotkey('Q', () => toggle('look'), { enabled: canSwitch && hasLook })
}

/** Home's keys rest while a card is edited or an expanded email lies over Home; the cursor walks only Home itself. */
const useHomeFocus = (isEditing: boolean, page: HomeSubpage | undefined) => {
  const isUnderEmail = useIsThreadExpanded()
  const isFocused = !isEditing && !isUnderEmail
  // Needs a look's and Worth knowing's panes hold Home's own cards and rows, so Home's cursor walks them there, and only them.
  return {
    isFocused,
    isInQueue: isFocused && page === 'look',
    isStepping: isFocused && (!page || page === 'look' || page === 'worth'),
    isWalking: isFocused && !page,
  }
}

/** Reading's panes and the newsletters of the one on top, whose keys Home shows. */
const useReadingPage = (
  page: HomeSubpage | undefined,
  day: string | undefined
) => {
  const { hasAny, latestDay } = useReadingIssues()
  const readingDays = openReadingDays(page, day, latestDay)
  const { rows } = useReadingDay(readingDays.top ?? readingDays.base)
  return {
    hasNewsletters: hasAny,
    newsletters: rows,
    // A day's issue opened alone (a digest's or a notification's link) is Reading as much as `N`'s pane.
    page: page ?? (readingDays.top ? ('reading' as const) : undefined),
    readingDays,
  }
}

/**
 * Where Home's cursor goes: on Home the agent's proposals; its decision cards and its mail worth knowing are one card
 * each there, so those are walked only in their panes.
 */
const stopsOf = (
  page: HomeSubpage | undefined,
  {
    hasProposals,
    queue,
    worth,
  }: { hasProposals: boolean; queue: QueueItem[]; worth: WorthRow[] }
) => {
  if (page === 'worth') {
    return { cardStops: [], stops: worth.map(({ id }) => worthStop(id)) }
  }
  if (page === 'look') {
    const cardStops = queue.map(({ action }) => action.id)
    return { cardStops, stops: cardStops }
  }
  const cardStops = hasProposals ? [PROPOSALS_ID] : []
  return { cardStops, stops: cardStops }
}

const HomePage = () => {
  const t = useT()
  const navigate = useNavigate()
  const closePage = () =>
    navigate({ search: (prev) => ({ ...prev, page: undefined }), to: '/home' })
  const hasAgent = useHasAgent()
  const queryClient = useQueryClient()
  const search = Route.useSearch()
  const { hasNewsletters, newsletters, page, readingDays } = useReadingPage(
    search.page,
    search.day
  )
  const { data, dataUpdatedAt } = useQuery(orpc.today.get.queryOptions())

  const { data: cards } = useLiveQuery((query) =>
    query.from({ card: queueCards }).orderBy(({ card }) => card.rank)
  )
  const decisionCards = cards.filter((card) => !isProposal(card))
  const filter = useKindFilter(decisionCards)
  // A long queue shows its first cards; the rest open with the button under them or J past the last.
  const [isQueueOpen, setIsQueueOpen] = useState(false)
  const queue = isQueueOpen ? filter.shown : filter.shown.slice(0, QUEUE_SHOWN)
  const hiddenCards = filter.shown.length - queue.length
  const isFirstRead = !!data && isReadingFirstTime(data.mailboxes)
  // Decisions closed since the page opened: the progress counts them against what is left.
  const [settled, setSettled] = useState(0)
  const settle = (count = 1) => {
    holdClicksUntilMove()
    setSettled((current) => current + count)
  }
  const unsettle = (count: number) =>
    setSettled((current) => Math.max(0, current - count))
  const proposals = useProposals(data, cards, settle)
  const hasProposals = proposals.proposals.length > 0
  // The cursor walks the agent's proposals first, then the cards, then the mail worth knowing.
  const worth = worthRowsOf(data)
  const { cardStops, stops } = stopsOf(search.page, {
    hasProposals,
    queue,
    worth,
  })
  const { cursorId, cursorIndex, setSelectedId } = useCursor(stops)
  const isOnProposals = cursorId === PROPOSALS_ID
  // Cards open only when asked (a header click, Space, E or R); while one is open, the card under the cursor opens instead.
  const [isOpen, setIsOpen] = useState(false)
  const openIds = isOpen && cursorId ? [cursorId] : []
  const toggleCard = ([id]: string[]) => {
    if (id) {
      setSelectedId(id)
    }
    setIsOpen(!!id)
  }
  const selectedIndex = queue.findIndex(({ action }) => action.id === cursorId)
  // Not `at`: on the proposals the index is -1, and `at(-1)` would hand the keys to the last card.
  const selected = queue[selectedIndex]
  const [editingId, setEditingId] = useState<string | null>(null)
  const [rewritingId, setRewritingId] = useState<string | null>(null)
  const [drafts, setDrafts] = useState<Record<string, string>>({})
  const [pickedIds, setPickedIds] = useState<string[]>([])

  const picked = queue.filter(({ action }) => pickedIds.includes(action.id))
  const targets =
    picked.length > 0 ? picked : queue.slice(selectedIndex, selectedIndex + 1)
  const staleBefore = subDays(dataUpdatedAt, STALE_DAYS)
  const stale = filter.shown.filter(
    ({ action }) => action.createdAt < staleBefore
  )
  const decisions = countDecisions(
    data,
    decisionCards.length,
    proposals.proposals.length
  )

  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: orpc.today.key() })
  const seenAt = useVisits(invalidate)
  const refreshMail = () =>
    Promise.all([
      invalidate(),
      queryClient.invalidateQueries({ queryKey: orpc.mail.key() }),
    ])
  const undoable = (
    message: string,
    count: number,
    undo: () => Promise<unknown>,
    toastId: string
  ) =>
    toastUndo(
      message,
      () => {
        unsettle(count)
        return undo().finally(refreshMail)
      },
      toastId
    )
  const undoSkip = (ids: string[]) =>
    undoable(
      ids.length === 1 ? t.telegram.skipped : t.queue.skipped(ids.length),
      ids.length,
      () => Promise.all(ids.map((id) => client.actions.restore({ id }))),
      ids.join(',')
    )
  const removeAndAdvance = (actionId: string) => {
    if (actionId === cursorId) {
      setSelectedId(stops[cursorIndex + 1] ?? stops[cursorIndex - 1] ?? null)
      setEditingId(null)
    }
    settle()
    queueCards.utils.writeDelete(actionId)
  }

  // A card's work can take seconds (leaving a list, a Gmail change): the toast says so until it is done.
  const working = (toastId: string) =>
    toast.loading(t.today.working, { id: toastId })
  const finishApproval = (
    toastId: string,
    approved: string,
    outboxIds: string[]
  ) => {
    if (outboxIds.length === 0) {
      toast.success(approved, { id: toastId })
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
            unsettle(canceled.filter(Boolean).length)
            void invalidate()
            toast(t.compose.backInQueue)
          }
        },
      },
      duration: UNDO_SEND_SECONDS * 1000,
      id: toastId,
    })
  }
  const approve = useMutation(
    orpc.actions.approve.mutationOptions({
      onError: (_, { id }) => toast.dismiss(id),
      onMutate: ({ id }) => {
        removeAndAdvance(id)
        working(id)
      },
      onSettled: invalidate,
      onSuccess: ({ outboxId }, { id }) =>
        finishApproval(id, t.today.done, outboxId ? [outboxId] : []),
    })
  )
  const dropFromQueue = (ids: string[]) => {
    setEditingId(null)
    setPickedIds([])
    settle(ids.length)
    queueCards.utils.writeDelete(ids)
  }

  const approveMany = useMutation(
    orpc.actions.approveMany.mutationOptions({
      onError: (_, { ids }) => toast.dismiss(ids.join(',')),
      onMutate: ({ ids }) => {
        dropFromQueue(ids)
        working(ids.join(','))
      },
      onSettled: invalidate,
      onSuccess: ({ approved, outboxIds }, { ids }) =>
        finishApproval(
          ids.join(','),
          t.today.approvedMany(approved),
          outboxIds
        ),
    })
  )
  const dismiss = useMutation(
    orpc.actions.dismiss.mutationOptions({
      onError: (_, { id }) => toast.dismiss(id),
      onMutate: ({ id }) => {
        removeAndAdvance(id)
        working(id)
      },
      onSettled: invalidate,
      onSuccess: (_, { id }) => undoSkip([id]),
    })
  )
  const skipMany = useMutation({
    meta: { event: 'cards_skipped' },
    mutationFn: (ids: string[]) =>
      Promise.all(ids.map((id) => client.actions.dismiss({ id }))),
    onError: (_, ids) => toast.dismiss(ids.join(',')),
    onMutate: (ids) => {
      dropFromQueue(ids)
      working(ids.join(','))
    },
    onSettled: invalidate,
    onSuccess: (_, ids) => undoSkip(ids),
  })
  const skipStale = () => skipMany.mutate(stale.map(({ action }) => action.id))
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
      dropFromQueue(items.map(({ action }) => action.id))
      working(idsOf(items))
    },
    onSettled: refreshMail,
    onSuccess: (_, items) =>
      undoable(
        t.mail.trashed,
        items.length,
        () =>
          Promise.all(
            items.map(async ({ action, message }) => {
              if (message) {
                await client.mail.moveToInbox({ messageId: message.id })
              }
              await client.actions.restore({ id: action.id })
            })
          ),
        idsOf(items)
      ),
  })
  const redraft = useMutation(
    orpc.actions.redraft.mutationOptions({
      onMutate: ({ id }) => {
        toast.loading(t.compose.writing, { id: `redraft-${id}` })
      },
      onSettled: (_action, _error, { id }) => toast.dismiss(`redraft-${id}`),
      onSuccess: (action) => {
        setDrafts((current) =>
          Object.fromEntries(
            Object.entries(current).filter(([id]) => id !== action.id)
          )
        )
        void invalidate()
      },
    })
  )
  const draftOf = (item: (typeof queue)[number]) =>
    drafts[item.action.id] ?? item.action.detail ?? ''
  const isEditing = !!selected && editingId === selected.action.id
  const isRewriting = !!selected && rewritingId === selected.action.id
  // A draft written before the plan ended stays on Free; writing it again needs the agent.
  const withAgent = useWithAgent()
  const rewrite = (id: string, instruction: string) => {
    setRewritingId(null)
    withAgent('drafts', () => redraft.mutate({ id, instruction }))
  }

  const approveItem = ({ action }: QueueItem) => {
    const edited = drafts[action.id]
    approve.mutate({
      id: action.id,
      ...(edited !== undefined && { detail: edited }),
    })
  }
  const remind = (id: string) =>
    withAgent('drafts', () => redraft.mutate({ id }))
  const runSelected = () => {
    if (!selected) {
      return
    }
    const step = primaryStep(selected.action)
    if (step === 'link') {
      openCardLink(selected.action)
    } else if (step === 'remind') {
      remind(selected.action.id)
    } else {
      approveItem(selected)
    }
  }

  const alike = filter.shown.filter(
    ({ action }) => action.kind === selected?.action.kind
  )
  const approveAlike = () =>
    alike.length > 1 &&
    approveMany.mutate({ ids: alike.map(({ action }) => action.id) })

  const move = (step: number) => {
    // J past the last card shown opens the rest of the queue before it goes on to the mail under it.
    if (step > 0 && cursorIndex === cardStops.length - 1 && hiddenCards > 0) {
      setIsQueueOpen(true)
      return
    }
    const next =
      stops[Math.min(stops.length - 1, Math.max(0, cursorIndex + step))]
    if (next) {
      setSelectedId(next)
      setEditingId(null)
      setRewritingId(null)
    }
  }

  const pickedActionIds = picked.map(({ action }) => action.id)
  const togglePick = (actionId: string) =>
    setPickedIds((current) =>
      current.includes(actionId)
        ? current.filter((id) => id !== actionId)
        : [...current, actionId]
    )
  const worthRow = worth.find(({ id }) => worthStop(id) === cursorId)
  const approveTargets = () => {
    if (picked.length > 0) {
      approveMany.mutate({ ids: pickedActionIds })
    } else if (worthRow) {
      openWorthRow(worthRow)
    } else if (isOnProposals) {
      proposals.approve(proposals.proposals)
    } else {
      runSelected()
    }
  }
  const skipTargets = () =>
    picked.length > 0
      ? skipMany.mutate(pickedActionIds)
      : selected && dismiss.mutate({ id: selected.action.id })

  const { isFocused, isInQueue, isStepping, isWalking } = useHomeFocus(
    isEditing,
    page
  )
  useHomeSubpage(search.page, readingDays.top, isFocused, {
    hasAgent,
    hasNewsletters,
    hasLook: decisionCards.length > 0,
    hasProposals,
    hasWorth: worth.length > 0,
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
  useHotkey(
    'M',
    () =>
      selected &&
      primaryStep(selected.action) !== 'approve' &&
      approveItem(selected),
    listKeys
  )
  useHotkey('S', skipTargets, listKeys)
  useHotkey('Backspace', () => trashMany.mutate(targets), listKeys)
  useHotkey('X', () => selected && togglePick(selected.action.id), listKeys)
  const addEventOf = useAddEvent(selected, isInQueue)
  useHotkey(
    'Mod+A',
    () => {
      setIsQueueOpen(true)
      setPickedIds(
        picked.length === filter.shown.length
          ? []
          : filter.shown.map(({ action }) => action.id)
      )
    },
    walkKeys
  )
  useHotkey('Escape', () => setPickedIds([]), {
    enabled: isInQueue && picked.length > 0,
  })
  const openAnd = (start: (id: string) => void) => () => {
    if (selected && sendsDraft(selected.action)) {
      setIsOpen(true)
      start(selected.action.id)
    }
  }
  useHotkey('E', openAnd(setEditingId), listKeys)
  useHotkey('R', openAnd(setRewritingId), listKeys)
  useHotkey('Space', () => cursorId && setIsOpen((open) => !open), walkKeys)
  useOpenKey(worthRow, selected, isStepping)

  return (
    <div className="flex min-h-0 min-w-0 flex-1 flex-col">
      <main className="flex min-h-0 flex-1 flex-col">
        <div data-slot="reading-area" className="relative min-h-0 flex-1">
          <motion.div layoutScroll className="h-full overflow-y-auto">
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
              <ReadingSection {...readingDays} />
              <FreshCodes today={data} canUseKeys={isWalking} />

              <section
                aria-label={t.today.decisions}
                hidden={decisions === 0}
                className="flex flex-col gap-2.5"
              >
                <DecisionsHeader decisions={decisions} settled={settled} />
                <ProposalsGroup
                  canUseKeys={isWalking}
                  isSelected={isOnProposals}
                  proposals={proposals}
                />
                <LookCard queue={decisionCards} />
                <div
                  className={cn(
                    'flex flex-col gap-2.5 empty:hidden',
                    cardsBleedClassName
                  )}
                >
                  <NewSenders
                    senders={data?.newSenders ?? []}
                    canUseKeys={isWalking}
                    onSettle={() => settle()}
                  />
                  <RuleOffers today={data} onSettle={() => settle()} />
                </div>
              </section>

              {hasAgent && <BoardCard />}
              <WorthCard today={data} />
            </div>
          </motion.div>
          <ReadingPane {...readingDays} />
          {/* A pane closing stays mounted until its card has grown back: unmounted at once, motion drops Home's scroll
              from the morph and the card flies in from below. */}
          <AnimatePresence>
            {page === 'look' && (
              <HomeCardPane key="look" page="look">
                <LookHeading
                  picked={picked.length}
                  onApprove={approveTargets}
                  onClear={() => setPickedIds([])}
                  onClose={closePage}
                  onSkip={skipTargets}
                  onTrash={() => trashMany.mutate(picked)}
                >
                  <KindFilter
                    canUseKeys={isInQueue}
                    filter={filter}
                    queue={decisionCards}
                  />
                </LookHeading>
                <div className="flex flex-col gap-2.5">
                  <Accordion
                    variant="list"
                    hidden={queue.length === 0}
                    value={openIds}
                    onValueChange={toggleCard}
                  >
                    {/* Keyed by the filter: a filter swap replaces the cards at once, so nothing folds out. */}
                    <AnimatePresence key={filter.active} initial={false}>
                      {queue.map((item) => (
                        <QueueCard
                          key={item.action.id}
                          item={item}
                          draft={draftOf(item)}
                          isNew={!!seenAt && item.action.createdAt > seenAt}
                          isPicked={pickedIds.includes(item.action.id)}
                          isRewriting={rewritingId === item.action.id}
                          isOpen={isOpen && item === selected}
                          isSelected={item === selected}
                          isEditing={editingId === item.action.id}
                          isBusy={
                            redraft.isPending &&
                            redraft.variables.id === item.action.id
                          }
                          onAddEvent={() => addEventOf(item.action.id)}
                          onApprove={() => approveItem(item)}
                          onEdit={() => setEditingId(item.action.id)}
                          onDraftChange={(draft) =>
                            setDrafts((current) => ({
                              ...current,
                              [item.action.id]: draft,
                            }))
                          }
                          onRewrite={(instruction) =>
                            rewrite(item.action.id, instruction)
                          }
                          onRewriteChange={(isOn) =>
                            setRewritingId(isOn ? item.action.id : null)
                          }
                          onPick={() => togglePick(item.action.id)}
                          onRemind={() => remind(item.action.id)}
                          onSkip={() => dismiss.mutate({ id: item.action.id })}
                          onStopEditing={() => setEditingId(null)}
                        />
                      ))}
                    </AnimatePresence>
                  </Accordion>
                  {hiddenCards > 0 && (
                    <Button
                      size="sm"
                      variant="ghost-muted"
                      className="self-start"
                      onClick={() => setIsQueueOpen(true)}
                    >
                      {t.mail.showAll(filter.shown.length)}
                    </Button>
                  )}
                  <StaleCards
                    canUseKeys={isInQueue}
                    count={stale.length}
                    onSkip={skipStale}
                  />
                </div>
              </HomeCardPane>
            )}
            {page === 'worth' && (
              <HomeCardPane key="worth" page="worth">
                <WorthKnowing
                  cursorId={cursorId}
                  isWalking={isStepping}
                  today={data}
                  onClose={closePage}
                  onSelect={setSelectedId}
                />
              </HomeCardPane>
            )}
            {page === 'board' && (
              <HomeCardPane key="board" page="board">
                <BoardPane isActive={isFocused} onClose={closePage} />
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
            hasLook: decisionCards.length > 0,
            hasWorth: worth.length > 0,
            hasFilter: filter.isOffered,
            isEditing,
            hasNewsletters,
            newsletters,
            page,
            selected,
            isOnProposals,
            isRewriting,
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
    // Agent answers and older links still open an email with `?thread=`.
    if (search.thread) {
      throw redirect({
        params: { threadId: search.thread },
        to: '/mail/$threadId',
      })
    }
  },
  component: HomePage,
  validateSearch: type({
    'thread?': 'string',
    'page?': "'board' | 'look' | 'reading' | 'tidy' | 'worth'",
    'day?': /^\d{4}-\d{2}-\d{2}$/u,
  }),
  loader: async () => {
    await Promise.all([
      warmQuery(orpc.today.get.queryOptions()),
      warmQuery(orpc.reading.issues.queryOptions()),
      queueCards.preload(),
    ])
  },
})
