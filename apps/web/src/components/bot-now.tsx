import type { RouterOutputs } from '@fewmail/api/router'
import { botOfCard, usedPercent } from '@fewmail/shared/agent'
import type { ActionKind } from '@fewmail/shared/agent'
import type { Messages } from '@fewmail/shared/i18n'
import { formatResetDay } from '@fewmail/shared/i18n/locales'
import { Accordion } from '@fewmail/ui/components/accordion'
import { Button } from '@fewmail/ui/components/button'
import { MotionCollapse } from '@fewmail/ui/components/collapse.motion'
import { Kbd } from '@fewmail/ui/components/kbd'
import { Spinner } from '@fewmail/ui/components/spinner'
import { Tool, ToolContent, ToolHeader } from '@fewmail/ui/components/tool'
import {
  BookOpen01Icon,
  Calendar03Icon,
  Mail01Icon,
  MailAdd01Icon,
  Tick02Icon,
  ZapIcon,
} from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { useHotkey } from '@tanstack/react-hotkeys'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Link } from '@tanstack/react-router'
import { endOfTomorrow, format, isTomorrow, max, startOfToday } from 'date-fns'
import { AnimatePresence } from 'motion/react'
import { useState } from 'react'
import type { ReactNode } from 'react'
import { toast } from 'sonner'

import { BoardPane } from '~/components/board'
import { DigestHeader, DigestLead, digestLead } from '~/components/bot-chat'
import { BotAvatar, digestHeadline, useBots } from '~/components/bot-list'
import {
  BotSuggestionRow,
  PresetSuggestionRow,
} from '~/components/bot-suggestion'
import { confirm } from '~/components/confirm-dialog'
import { EmailRow } from '~/components/email-row'
import { expandRow } from '~/components/expand-row'
import type { useJournal } from '~/components/journal'
import { Journal } from '~/components/journal'
import { ExtractedChips, ImportanceDot } from '~/components/mail-meta'
import { PaneRows } from '~/components/pane-rows'
import type { RowPlace } from '~/components/pane-rows'
import { foldedVerb } from '~/components/queue-card'
import type { QueueItem } from '~/components/queue-card'
import { closeSender, SenderRow, showSender } from '~/components/sender-card'
import { sweepOf, useMailActions } from '~/components/thread-view'
import { upgradeStore } from '~/components/upgrade-dialog'
import { eventTimes } from '~/lib/calendar'
import { todayLists, useWaiting } from '~/lib/home-db'
import { useDates, useLocale, useT } from '~/lib/i18n'
import { useHasAgent, useMe } from '~/lib/me'
import { offerBlock } from '~/lib/offer-block'
import { orpc } from '~/lib/orpc'
import { showUntilSettled } from '~/lib/query-client'
import { holdClicksUntilMove } from '~/lib/still-pointer'
import { pendingToast } from '~/lib/undo'

type Today = RouterOutputs['today']['get']

const NEW_SENDER_TOAST = 'new-sender'

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
        description: t.subscriptions.unsubscribeHint,
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
            <SenderRow
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
            </SenderRow>
          </MotionCollapse>
        )
      })}
    </AnimatePresence>
  )
}

/** Each row folds itself away on an answer; the refetch then drops it from Home's count. */
const BotSuggestions = ({ today }: { today: Today | undefined }) =>
  today?.botSuggestions.map((suggestion) => (
    <BotSuggestionRow
      key={suggestion.fromEmail}
      isShowable
      suggestion={suggestion}
      onAnswer={() => {
        closeSender()
        holdClicksUntilMove()
      }}
    />
  ))

/** What Fewmail asks (a ready-made bot, a sender's bot, a new list), one tool block of rows like every list in a chat. */
export const SenderQuestions = ({
  canUseKeys,
  today,
}: {
  canUseKeys: boolean
  today: Today | undefined
}) => {
  const t = useT()
  const senders = today?.newSenders ?? []
  const presets = today?.presets ?? []
  const count =
    presets.length + senders.length + (today?.botSuggestions.length ?? 0)
  return (
    count > 0 && (
      <Tool open>
        <ToolHeader
          icon={MailAdd01Icon}
          isOpenable={false}
          title={
            <>
              {t.bots.suggestions}
              <span className="text-muted-foreground ml-1.5 tabular-nums">
                {count}
              </span>
            </>
          }
        />
        <ToolContent variant="rows">
          {presets.map((preset) => (
            <PresetSuggestionRow
              key={preset}
              preset={preset}
              onAnswer={holdClicksUntilMove}
            />
          ))}
          <BotSuggestions today={today} />
          <NewSenders
            senders={senders}
            canUseKeys={canUseKeys}
            onSettle={holdClicksUntilMove}
          />
        </ToolContent>
      </Tool>
    )
  )
}

export interface WorthRow {
  id: string
  messageId?: string
  threadId: string
}

export const worthStop = (rowId: string) => `worth:${rowId}`

/** Worth knowing's rows in their order: Home's cursor walks them after the cards. */
export const worthRowsOf = (today: Today | undefined): WorthRow[] =>
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

export const openWorthRow = ({ id, threadId }: WorthRow) =>
  expandRow(id, { from: 'home', threadId })

/**
 * Mail that needs no decision: important unread, dated mail no card shows, and sent mail still waiting for an answer.
 * Home's cursor walks it after the cards; on a row, `E` archives and ⌫ trashes its email.
 */
export const WorthKnowing = ({
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

/** Where the headline's things wait, a bot each with its count: Fewmail's digest speaks for every bot, so it says which chat holds what. */
const WaitingWhere = ({ onOpen }: { onOpen: (bot: string) => void }) => {
  const bots = useBots()
  const waiting = Map.groupBy(useWaiting(), botOfCard)
  const holding = bots.filter(({ bot }) => waiting.has(bot))
  if (holding.length < 2 && !holding.some(({ bot }) => bot !== 'fewmail')) {
    return null
  }
  return (
    <div className="flex flex-wrap items-center gap-2">
      {holding.map((bot) => (
        <Button
          key={bot.bot}
          size="sm"
          variant="secondary"
          onClick={() => onOpen(bot.bot)}
        >
          <BotAvatar bot={bot} size="xs" />
          <span data-mask={!!bot.own}>{bot.name}</span>
          <span className="text-muted-foreground tabular-nums">
            {waiting.get(bot.bot)?.length}
          </span>
        </Button>
      ))}
    </div>
  )
}

const headlineOf = (t: Messages, isFirstRead: boolean, decisions: number) =>
  isFirstRead ? t.nav.syncing : digestHeadline(t, decisions)

/** What happened, in one sentence computed here from the counts (no model text), then what is ahead today: Fewmail's digest, live. */
export const HomeHeader = ({
  data,
  decisions,
  isFirstRead,
  onOpenBot,
  updatedAt,
}: {
  data?: Today
  decisions: number
  isFirstRead: boolean
  onOpenBot: (bot: string) => void
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
      {decisions > 0 && <WaitingWhere onOpen={onOpenBot} />}
      <DayStrip />
    </DigestHeader>
  )
}

export const PickedActions = ({
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

export const useKindGroups = (queue: QueueItem[]) => {
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

export const StaleCards = ({
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
    <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
      <span className="text-muted-foreground">{t.queue.stale(count)}</span>
      <Button
        size="sm"
        variant="secondary"
        onClick={onSkip}
        shortcut={<Kbd>⇧S</Kbd>}
      >
        {t.queue.skipStale}
      </Button>
    </div>
  )
}

/** Fewmail's record of every change in the mail, folded to one quiet line in its chat; opened, each change with its yes or its bot and an undo where one exists. */
export const QuietWork = ({
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
      <div className="text-muted-foreground flex flex-wrap items-center gap-x-2">
        <HugeiconsIcon icon={Tick02Icon} strokeWidth={2} className="size-4" />
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
            <Journal
              cursorId={cursorId}
              journal={journal}
              onSelect={setCursorId}
            />
          </MotionCollapse>
        )}
      </AnimatePresence>
    </>
  )
}

/** What the Board waits on: its lists, or on Free what Pro adds. */
export const BoardNow = ({ isActive }: { isActive: boolean }) => {
  const t = useT()
  const hasAgent = useHasAgent()
  return hasAgent ? (
    <BoardPane isActive={isActive} />
  ) : (
    <Button
      size="sm"
      className="self-start"
      onClick={() => upgradeStore.set('board')}
    >
      {t.bots.subscribe}
    </Button>
  )
}

type KindGroups = ReturnType<typeof useKindGroups>

/** The open bot's cards by what they ask, a tool block each, every kind but the last folded to its first few. */
export const CardGroups = ({
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
