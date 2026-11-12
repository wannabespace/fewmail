import type { RouterOutputs } from '@fewmail/api/router'
import { sendsDraft, UNDO_SEND_SECONDS } from '@fewmail/shared/agent'
import type { Messages } from '@fewmail/shared/i18n'
import { Accordion } from '@fewmail/ui/components/accordion'
import { Button } from '@fewmail/ui/components/button'
import {
  SettingsGroup,
  SettingsRow,
} from '@fewmail/ui/components/custom/settings-group'
import { Kbd } from '@fewmail/ui/components/kbd'
import { Skeleton } from '@fewmail/ui/components/skeleton'
import { Spinner } from '@fewmail/ui/components/spinner'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@fewmail/ui/components/tooltip'
import { PlayIcon, StopIcon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { useHotkey } from '@tanstack/react-hotkeys'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  createFileRoute,
  Link,
  redirect,
  useNavigate,
} from '@tanstack/react-router'
import { endOfTomorrow, format, isTomorrow, max, startOfToday } from 'date-fns'
import { useEffect, useRef, useState } from 'react'
import { toast } from 'sonner'

import { BoardBanners } from '~/components/board-banners'
import { ConnectHint } from '~/components/connect-hint'
import { KeyHints } from '~/components/key-hints'
import { ExtractedChips, ImportanceDot } from '~/components/mail-meta'
import { QueueCard } from '~/components/queue-card'
import type { QueueItem } from '~/components/queue-card'
import { upgradeStore } from '~/components/upgrade-dialog'
import { eventTimes } from '~/lib/calendar'
import { useDates, useMoneyFormat, useT } from '~/lib/i18n'
import {
  hideThread,
  isReadingFirstTime,
  prefetchThread,
  threadOfMessage,
} from '~/lib/mail-db'
import { client, orpc } from '~/lib/orpc'
import { warmQuery } from '~/lib/query-client'

const HandledSummary = ({
  handled,
  onReview,
}: {
  handled: Today['handled']
  onReview: () => void
}) => {
  const t = useT().today.handled

  return (
    <div className="text-foreground/75 flex items-center gap-3 rounded-2xl border border-dashed px-4.5 py-3.5 text-sm">
      <span>
        <strong className="text-foreground font-semibold">
          {t.total(handled.total)}
        </strong>
        {handled.archived > 0 && ` · ${t.archived(handled.archived)}`}
        {handled.markedRead > 0 && ` · ${t.markedRead(handled.markedRead)}`}
        {handled.spam > 0 && ` · ${t.spam(handled.spam)}`}
        {handled.unsubscribed > 0 &&
          ` · ${t.unsubscribed(handled.unsubscribed)}`}
      </span>
      <Button size="sm" variant="link" className="ml-auto" onClick={onReview}>
        {t.review} <Kbd>H</Kbd>
      </Button>
    </div>
  )
}

const HandledList = () => {
  const t = useT()
  const queryClient = useQueryClient()
  const { data: handled = [] } = useQuery(orpc.today.handled.queryOptions())
  const notSpam = useMutation(
    orpc.mail.notSpam.mutationOptions({
      onMutate: ({ messageId }) => {
        const threadId = threadOfMessage(messageId)
        if (threadId) {
          hideThread(threadId)
        }
      },
      onSettled: () =>
        queryClient.invalidateQueries({ queryKey: orpc.mail.key() }),
      onSuccess: () => toast(t.mail.movedToInbox),
    })
  )

  return (
    <SettingsGroup title={t.today.handled.total(handled.length)}>
      {handled.map(({ action, message, summary }) => (
        <SettingsRow
          key={action.id}
          title={
            message ? (
              <ThreadLink
                threadId={message.threadId}
                text={message.fromName ?? message.fromEmail}
              />
            ) : (
              action.title
            )
          }
          description={
            <span data-mask>
              {[
                action.title || t.actionKind[action.kind],
                action.reason || summary,
              ]
                .filter(Boolean)
                .join(' · ')}
            </span>
          }
        >
          {action.kind === 'spam' && message ? (
            <Button
              size="sm"
              variant="ghost-muted"
              onClick={() => notSpam.mutate({ messageId: message.id })}
            >
              {t.mail.notSpam}
            </Button>
          ) : (
            <Ago date={action.createdAt} />
          )}
        </SettingsRow>
      ))}
    </SettingsGroup>
  )
}

type Today = RouterOutputs['today']['get']

const ThreadLink = ({ text, threadId }: { text: string; threadId: string }) => (
  <Link
    to="/mail"
    search={{ thread: threadId }}
    onPointerEnter={() => {
      void prefetchThread(threadId)
    }}
    data-mask
  >
    {text}
  </Link>
)

const Ago = ({ date }: { date: Date }) => (
  <span className="text-muted-foreground text-xs">{useDates().ago(date)}</span>
)

const MailDigest = ({ today }: { today: Today }) => {
  const t = useT()
  const money = useMoneyFormat()

  return (
    <>
      {today.awaiting.length > 0 && (
        <SettingsGroup title={t.today.awaiting}>
          {today.awaiting.map((sent) => (
            <SettingsRow
              key={sent.threadId}
              title={
                <ThreadLink
                  threadId={sent.threadId}
                  text={sent.to[0] ?? sent.subject}
                />
              }
              description={<span data-mask>{sent.subject}</span>}
            >
              <Ago date={sent.receivedAt} />
            </SettingsRow>
          ))}
        </SettingsGroup>
      )}
      {today.recent.length > 0 && (
        <SettingsGroup title={t.today.recent(t.today.period(today.days))}>
          {today.recent.map(({ analysis, message }) => (
            <SettingsRow
              key={message.id}
              icon={
                <span className="flex size-4 items-center justify-center">
                  <ImportanceDot
                    importance={analysis.importance}
                    reason={analysis.reason}
                  />
                </span>
              }
              title={
                <ThreadLink
                  threadId={message.threadId}
                  text={message.fromName ?? message.fromEmail}
                />
              }
              description={<span data-mask>{analysis.summary}</span>}
            >
              <Ago date={message.receivedAt} />
            </SettingsRow>
          ))}
        </SettingsGroup>
      )}
      {today.dates.length > 0 && (
        <SettingsGroup title={t.today.dates}>
          {today.dates.map(({ analysis, message }) => (
            <SettingsRow
              key={message.id}
              title={
                <ThreadLink
                  threadId={message.threadId}
                  text={message.fromName ?? message.fromEmail}
                />
              }
              description={<span data-mask>{analysis.summary}</span>}
            >
              <ExtractedChips
                extracted={{ ...analysis.extracted, amount: null }}
              />
            </SettingsRow>
          ))}
        </SettingsGroup>
      )}
      {today.boards.length > 0 && (
        <SettingsGroup title={t.nav.boards}>
          {today.boards.map((board) => (
            <SettingsRow
              key={board.id}
              title={
                <Link
                  to="/boards/$boardId"
                  params={{ boardId: board.id }}
                  data-mask
                >
                  {board.name}
                </Link>
              }
              description={
                <span data-mask>
                  {t.boards.entries(board.count)} · {board.newest}
                </span>
              }
            >
              {board.totals.length > 0 && (
                <span className="tabular-nums" data-mask>
                  {board.totals
                    .map(({ amountCents, currency }) =>
                      money(amountCents, currency)
                    )
                    .join(' · ')}
                </span>
              )}
            </SettingsRow>
          ))}
        </SettingsGroup>
      )}
    </>
  )
}

const Pulse = ({
  days,
  handled,
  pulse,
}: Pick<Today, 'days' | 'handled' | 'pulse'>) => {
  const t = useT().today

  return (
    <p className="text-muted-foreground text-sm">
      {[
        t.pulse.total(pulse.total, t.period(days)),
        pulse.people > 0 && t.pulse.people(pulse.people),
        pulse.lists > 0 && t.pulse.lists(pulse.lists),
        handled.total > 0 && t.handled.total(handled.total),
      ]
        .filter(Boolean)
        .join(' · ')}
    </p>
  )
}

const Saved = ({ saved }: { saved: Today['saved'] }) => {
  const t = useT().today

  return (
    <Tooltip>
      <TooltipTrigger
        render={<Link to="/wrapped" />}
        className="text-muted-foreground hover:text-foreground w-fit cursor-pointer text-sm"
      >
        {t.saved(saved.minutes)}
      </TooltipTrigger>
      <TooltipContent>
        {t.savedHow(saved.handled, saved.replies)}
      </TooltipContent>
    </Tooltip>
  )
}

/** Module-level so the ref stays the same function and scrolls once, when H opens the list below the fold. */
const revealOnMount = (node: HTMLElement | null) =>
  node?.scrollIntoView({ behavior: 'smooth', block: 'start' })

const DayTally = ({
  isReviewing,
  onReview,
  today,
}: {
  isReviewing: boolean
  onReview: () => void
  today: Today
}) => (
  <>
    {today.saved.minutes > 0 && <Saved saved={today.saved} />}
    {today.handled.total > 0 && (
      <HandledSummary handled={today.handled} onReview={onReview} />
    )}
    {isReviewing && (
      <div ref={revealOnMount}>
        <HandledList />
      </div>
    )}
  </>
)

const homeHints = (
  t: Messages,
  state: {
    alike: number
    hasHandled: boolean
    isEditing: boolean
    picked: number
  }
): [string, string][] => {
  if (state.isEditing) {
    return [
      ['⌘⏎', t.keys.send],
      ['esc', t.keys.stopEditing],
    ]
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
    ['J / K', t.keys.move],
    ['⏎', t.keys.approve],
    ...(state.alike > 1
      ? [['⇧⏎', t.keys.approveAll(state.alike)] as [string, string]]
      : []),
    ['E', t.keys.edit],
    ['S', t.keys.skip],
    ['⌫', t.keys.trash],
    ['X', t.keys.pick],
    ['⌘A', t.keys.pickAll],
    ...(state.hasHandled
      ? [['H', t.today.handled.review] as [string, string]]
      : []),
  ]
}

const HomeHeader = ({
  data,
  isFirstRead,
  updatedAt,
}: {
  data?: Today
  isFirstRead: boolean
  updatedAt: number
}) => {
  const t = useT()
  const dates = useDates()

  return (
    <header className="flex flex-col gap-3">
      <p className="text-muted-foreground text-sm first-letter:uppercase">
        {updatedAt > 0 && dates.format(updatedAt, 'EEEE, d MMMM')}
      </p>
      {data ? (
        <h1 className="text-display font-serif tracking-tight">
          {isFirstRead ? t.nav.syncing : t.today.headline(data.queue.length)}
        </h1>
      ) : (
        <Skeleton className="my-1 h-9 w-3/5" />
      )}
      {isFirstRead && (
        <p className="text-muted-foreground flex items-center gap-2 text-sm">
          <Spinner />
          {t.today.firstRead}
        </p>
      )}
      {data && !isFirstRead && data.pulse.total > 0 && (
        <Pulse days={data.days} handled={data.handled} pulse={data.pulse} />
      )}
      {data && data.queue.length > 0 && (
        <div>
          <ListenButton />
        </div>
      )}
    </header>
  )
}

/** Spoken by the API on demand, which takes a few seconds; the audio element carries the session cookie (same site). */
const ListenButton = () => {
  const t = useT()
  const audio = useRef<HTMLAudioElement | null>(null)
  const [state, setState] = useState<'idle' | 'loading' | 'playing'>('idle')
  useEffect(() => () => audio.current?.pause(), [])

  const toggle = () => {
    if (audio.current) {
      audio.current.pause()
      audio.current = null
      setState('idle')
      return
    }
    const player = new Audio(`${import.meta.env.API_URL}/voice/home`)
    audio.current = player
    setState('loading')
    player.addEventListener('playing', () => setState('playing'))
    const stop = () => {
      if (audio.current === player) {
        audio.current = null
        setState('idle')
      }
    }
    player.addEventListener('ended', stop)
    player.addEventListener('error', () => {
      stop()
      toast.error(t.errors.failed)
    })
    void player.play().catch(stop)
  }

  return (
    <Button size="sm" variant="secondary" onClick={toggle}>
      {state === 'loading' ? (
        <Spinner />
      ) : (
        <HugeiconsIcon
          icon={state === 'playing' ? StopIcon : PlayIcon}
          strokeWidth={2}
        />
      )}
      {state === 'idle' ? t.today.listen : t.today.stopListening}
    </Button>
  )
}

const CalendarAhead = () => {
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
    <SettingsGroup title={t.nav.calendar}>
      {events.map((event) => {
        const { start } = eventTimes(event)
        const day = max([start, startOfToday()])
        return (
          <SettingsRow
            key={`${event.mailboxId}:${event.id}`}
            title={
              <Link
                to="/calendar"
                search={{ date: format(day, 'yyyy-MM-dd'), view: 'day' }}
                data-mask
              >
                {event.title || t.calendar.untitled}
              </Link>
            }
            description={
              <span data-mask>
                {[
                  isTomorrow(day) ? t.calendar.tomorrow : t.calendar.today,
                  event.allDay ? t.calendar.allDay : dates.format(start, 'p'),
                  event.location,
                ]
                  .filter(Boolean)
                  .join(' · ')}
              </span>
            }
          />
        )
      })}
    </SettingsGroup>
  )
}

const HomePage = () => {
  const t = useT()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { data, dataUpdatedAt } = useQuery(orpc.today.get.queryOptions())

  const queue = data?.queue ?? []
  const isFirstRead = !!data && isReadingFirstTime(data.mailboxes)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [drafts, setDrafts] = useState<Record<string, string>>({})
  const [isReviewing, setIsReviewing] = useState(false)
  const [pickedIds, setPickedIds] = useState<string[]>([])

  const selectedIndex = Math.max(
    0,
    queue.findIndex(({ action }) => action.id === selectedId)
  )
  const selected = queue[selectedIndex]
  const picked = queue.filter(({ action }) => pickedIds.includes(action.id))
  const targets =
    picked.length > 0 ? picked : queue.slice(selectedIndex, selectedIndex + 1)

  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: orpc.today.key() })
  const removeAndAdvance = (actionId: string) => {
    const next = queue[selectedIndex + 1] ?? queue[selectedIndex - 1]
    setSelectedId(next?.action.id ?? null)
    setEditingId(null)
    queryClient.setQueryData(
      orpc.today.get.queryKey(),
      (old) =>
        old && {
          ...old,
          queue: old.queue.filter(({ action }) => action.id !== actionId),
        }
    )
  }

  const approve = useMutation(
    orpc.actions.approve.mutationOptions({
      onMutate: ({ id }) => removeAndAdvance(id),
      onSettled: invalidate,
      onSuccess: ({ outboxId }) => {
        if (!outboxId) {
          toast.success(t.today.done)
          return
        }
        toast.success(t.compose.sendingIn(UNDO_SEND_SECONDS), {
          action: {
            label: t.compose.undo,
            onClick: async () => {
              // The client's error toast already says it was sent.
              const canceled = await client.mail
                .cancelSend({ id: outboxId })
                .catch(() => null)
              if (canceled) {
                void invalidate()
                toast(t.compose.backInQueue)
              }
            },
          },
          duration: UNDO_SEND_SECONDS * 1000,
        })
      },
    })
  )
  const dropFromQueue = (ids: string[]) => {
    setSelectedId(null)
    setEditingId(null)
    setPickedIds([])
    queryClient.setQueryData(
      orpc.today.get.queryKey(),
      (old) =>
        old && {
          ...old,
          queue: old.queue.filter(({ action }) => !ids.includes(action.id)),
        }
    )
  }

  const approveMany = useMutation(
    orpc.actions.approveMany.mutationOptions({
      onMutate: ({ ids }) => dropFromQueue(ids),
      onSettled: invalidate,
      onSuccess: ({ approved }) =>
        toast.success(t.today.approvedMany(approved)),
    })
  )
  const dismiss = useMutation(
    orpc.actions.dismiss.mutationOptions({
      onMutate: ({ id }) => removeAndAdvance(id),
      onSettled: invalidate,
    })
  )
  const skipMany = useMutation({
    mutationFn: (ids: string[]) =>
      Promise.all(ids.map((id) => client.actions.dismiss({ id }))),
    onMutate: dropFromQueue,
    onSettled: invalidate,
  })
  const trashMany = useMutation({
    mutationFn: (items: QueueItem[]) =>
      Promise.all(
        items.map(async ({ action, message }) => {
          if (message) {
            await client.mail.trash({ messageId: message.id })
          }
          await client.actions.dismiss({ id: action.id })
        })
      ),
    onMutate: (items) => dropFromQueue(items.map(({ action }) => action.id)),
    onSettled: () =>
      Promise.all([
        invalidate(),
        queryClient.invalidateQueries({ queryKey: orpc.mail.key() }),
      ]),
    onSuccess: () => toast(t.mail.trashed),
  })
  const redraft = useMutation(
    orpc.actions.redraft.mutationOptions({
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
  const shorten = (id: string) =>
    redraft.mutate({ id, instruction: t.queue.shorterInstruction })

  const approveSelected = () => {
    if (!selected) {
      return
    }
    const edited = drafts[selected.action.id]
    approve.mutate({
      id: selected.action.id,
      ...(edited !== undefined && { detail: edited }),
    })
  }

  const alike = queue.filter(
    ({ action }) => action.kind === selected?.action.kind
  )
  const approveAlike = () =>
    alike.length > 1 &&
    approveMany.mutate({ ids: alike.map(({ action }) => action.id) })

  const move = (step: number) => {
    const next =
      queue[Math.min(queue.length - 1, Math.max(0, selectedIndex + step))]
    if (next) {
      setSelectedId(next.action.id)
      setEditingId(null)
    }
  }

  const pickedActionIds = picked.map(({ action }) => action.id)
  const togglePick = (actionId: string) =>
    setPickedIds((current) =>
      current.includes(actionId)
        ? current.filter((id) => id !== actionId)
        : [...current, actionId]
    )
  const approveTargets = () =>
    picked.length > 0
      ? approveMany.mutate({ ids: pickedActionIds })
      : approveSelected()
  const skipTargets = () =>
    picked.length > 0
      ? skipMany.mutate(pickedActionIds)
      : selected && dismiss.mutate({ id: selected.action.id })

  const listKeys = { enabled: !isEditing && !!selected }
  useHotkey('J', () => move(1), listKeys)
  useHotkey('ArrowDown', () => move(1), listKeys)
  useHotkey('K', () => move(-1), listKeys)
  useHotkey('ArrowUp', () => move(-1), listKeys)
  useHotkey('Enter', approveTargets, listKeys)
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
    listKeys
  )
  useHotkey('Escape', () => setPickedIds([]), {
    enabled: !isEditing && picked.length > 0,
  })
  useHotkey(
    'E',
    () =>
      selected &&
      sendsDraft(selected.action) &&
      setEditingId(selected.action.id),
    listKeys
  )
  useHotkey(
    'R',
    () =>
      selected && sendsDraft(selected.action) && shorten(selected.action.id),
    listKeys
  )
  const hasHandled = !!data?.handled.total
  const reviewHandled = () => setIsReviewing((current) => !current)
  useHotkey('H', reviewHandled, { enabled: !isEditing && hasHandled })
  useHotkey(
    'O',
    () =>
      selected?.message &&
      navigate({ search: { thread: selected.message.threadId }, to: '/mail' }),
    listKeys
  )

  return (
    <main className="flex min-h-0 flex-1 flex-col">
      <div className="flex-1 overflow-y-auto">
        <div className="mx-auto flex max-w-3xl flex-col gap-8 px-10 pt-12 pb-16">
          <HomeHeader
            data={data}
            isFirstRead={isFirstRead}
            updatedAt={dataUpdatedAt}
          />

          {data && data.banners.length > 0 && (
            <BoardBanners banners={data.banners} />
          )}

          <section
            aria-label={t.today.worthAttention}
            hidden={isFirstRead && queue.length === 0}
            className="flex flex-col gap-2.5"
          >
            <div className="flex min-h-7 items-center gap-1.5">
              <h2 className="text-muted-foreground mr-auto text-xs font-medium">
                {picked.length > 0
                  ? t.queue.picked(picked.length)
                  : t.today.worthAttention}
              </h2>
              {picked.length > 0 && (
                <>
                  <Button size="sm" onClick={approveTargets}>
                    {t.queue.approve} <Kbd>⏎</Kbd>
                  </Button>
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => trashMany.mutate(picked)}
                  >
                    {t.queue.delete} <Kbd>⌫</Kbd>
                  </Button>
                  <Button size="sm" variant="ghost-muted" onClick={skipTargets}>
                    {t.queue.skip} <Kbd>S</Kbd>
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost-muted"
                    onClick={() => setPickedIds([])}
                  >
                    {t.queue.unpick} <Kbd>esc</Kbd>
                  </Button>
                </>
              )}
            </div>
            {!!data && queue.length === 0 && (
              <p className="text-muted-foreground rounded-2xl border border-dashed px-4.5 py-4 text-sm">
                {t.today.nothingNeedsYou}
              </p>
            )}
            <Accordion
              variant="cards"
              hidden={queue.length === 0}
              value={selected ? [selected.action.id] : []}
              onValueChange={([id]) => id && setSelectedId(id)}
            >
              {queue.map((item, index) => (
                <QueueCard
                  key={item.action.id}
                  item={item}
                  index={index}
                  draft={draftOf(item)}
                  isPicked={pickedIds.includes(item.action.id)}
                  isSelected={item === selected}
                  isEditing={editingId === item.action.id}
                  isBusy={
                    redraft.isPending && redraft.variables.id === item.action.id
                  }
                  onApprove={approveSelected}
                  onEdit={() => setEditingId(item.action.id)}
                  onDraftChange={(draft) =>
                    setDrafts((current) => ({
                      ...current,
                      [item.action.id]: draft,
                    }))
                  }
                  onRedraft={() => shorten(item.action.id)}
                  onOpen={() =>
                    item.message &&
                    navigate({
                      search: { thread: item.message.threadId },
                      to: '/mail',
                    })
                  }
                  onPick={() => togglePick(item.action.id)}
                  onSkip={() => dismiss.mutate({ id: item.action.id })}
                  onStopEditing={() => setEditingId(null)}
                />
              ))}
            </Accordion>
          </section>

          <CalendarAhead />
          {data && <MailDigest today={data} />}
          {data && (
            <DayTally
              today={data}
              isReviewing={isReviewing}
              onReview={reviewHandled}
            />
          )}
          <ConnectHint />
        </div>
      </div>
      <KeyHints
        hints={homeHints(t, {
          alike: alike.length,
          hasHandled,
          isEditing,
          picked: picked.length,
        })}
      />
    </main>
  )
}

export const Route = createFileRoute('/_app/home')({
  beforeLoad: ({ context, preload }) => {
    if (context.me.plan.kind === 'free') {
      if (!preload) {
        upgradeStore.set('home')
      }
      throw redirect({ to: '/mail' })
    }
  },
  component: HomePage,
  loader: () => warmQuery(orpc.today.get.queryOptions()),
})
