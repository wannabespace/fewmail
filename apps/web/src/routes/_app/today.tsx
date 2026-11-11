import type { RouterOutputs } from '@fewmail/api/router'
import { UNDO_SEND_SECONDS } from '@fewmail/shared/agent'
import {
  SettingsGroup,
  SettingsRow,
} from '@fewmail/ui/components/custom/settings-group'
import { Skeleton } from '@fewmail/ui/components/skeleton'
import { Spinner } from '@fewmail/ui/components/spinner'
import { useHotkey } from '@tanstack/react-hotkeys'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  createFileRoute,
  Link,
  redirect,
  useNavigate,
  useRouter,
} from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'

import { BriefHourSelect } from '~/components/agent-fields'
import { ConnectHint } from '~/components/connect-hint'
import { KeyHints } from '~/components/key-hints'
import { ExtractedChips, ImportanceDot } from '~/components/mail-meta'
import { hasDraft, QueueCard } from '~/components/queue-card'
import { useDates, useMoneyFormat, useT } from '~/lib/i18n'
import { client, orpc } from '~/lib/orpc'

const HandledSummary = ({
  handled,
}: {
  handled: {
    archived: number
    markedRead: number
    spam: number
    total: number
    unsubscribed: number
  }
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
      <Link to="/mail" search={{ filter: 'quiet' }} className="ml-auto">
        {t.review}
      </Link>
    </div>
  )
}

type Today = RouterOutputs['today']['get']

const ThreadLink = ({ text, threadId }: { text: string; threadId: string }) => (
  <Link to="/mail" search={{ thread: threadId }} data-mask>
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
        <SettingsGroup title={t.today.recent}>
          {today.recent.map(({ analysis, message }) => (
            <SettingsRow
              key={message.id}
              icon={
                <ImportanceDot
                  importance={analysis.importance}
                  reason={analysis.reason}
                />
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

const Pulse = ({ pulse }: { pulse: Today['pulse'] }) => {
  const t = useT().today.pulse

  return (
    <p className="text-muted-foreground text-sm">
      {[
        t.total(pulse.total),
        pulse.people > 0 && t.people(pulse.people),
        pulse.lists > 0 && t.lists(pulse.lists),
      ]
        .filter(Boolean)
        .join(' · ')}
    </p>
  )
}

const DayTally = ({ today }: { today: Today }) => {
  const t = useT()
  const dates = useDates()

  return (
    <>
      {today.later && (
        <p className="text-muted-foreground text-sm">
          {t.today.later(today.later.count, dates.format(today.later.at, 'p'))}
        </p>
      )}
      {today.pulse.total > 0 && <Pulse pulse={today.pulse} />}
      {today.handled.total > 0 && <HandledSummary handled={today.handled} />}
    </>
  )
}

const isReadingFirstTime = (data?: {
  mailboxes: { lastSyncedAt: Date | null; syncError: string | null }[]
}) =>
  !!data &&
  data.mailboxes.every((mailbox) => !mailbox.lastSyncedAt && !mailbox.syncError)

const BriefLoading = ({ note }: { note: string }) => (
  <div aria-busy className="flex flex-col gap-5">
    <div className="flex flex-col gap-3 py-1.5">
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-[94%] [animation-delay:150ms]" />
      <Skeleton className="h-4 w-[97%] [animation-delay:300ms]" />
      <Skeleton className="h-4 w-[58%] [animation-delay:450ms]" />
    </div>
    <p className="text-muted-foreground flex items-center gap-2 text-sm">
      <Spinner />
      {note}
    </p>
  </div>
)

const BriefBody = ({
  brief,
  isFirstRead,
  isLoading,
  queued,
}: {
  brief?: Today['brief']
  isFirstRead: boolean
  isLoading: boolean
  queued: number
}) => {
  const t = useT()

  return (
    <>
      {isLoading && !isFirstRead ? (
        <Skeleton className="my-1 h-9 w-3/5" />
      ) : (
        <h1 className="text-display font-serif tracking-tight" data-mask>
          {brief?.headline ??
            (isFirstRead ? t.nav.syncing : t.today.headline(queued))}
        </h1>
      )}
      {brief && (
        <p className="text-brief text-foreground/85 font-serif" data-mask>
          {brief.body}
        </p>
      )}
      {isLoading && (
        <BriefLoading
          note={isFirstRead ? t.today.firstRead : t.today.writing}
        />
      )}
    </>
  )
}

const BriefTime = ({ label }: { label: (time: string) => string }) => {
  const { me } = Route.useRouteContext()
  const router = useRouter()
  const save = useMutation(
    orpc.settings.save.mutationOptions({ onSuccess: () => router.invalidate() })
  )

  return (
    <BriefHourSelect
      label={label}
      value={me.settings.briefHour}
      onChange={(briefHour) =>
        save.mutate({
          briefHour,
          language: me.settings.language,
          timezone: me.settings.timezone,
        })
      }
    />
  )
}

const TodayPage = () => {
  const t = useT()
  const dates = useDates()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { data, dataUpdatedAt } = useQuery(orpc.today.get.queryOptions())

  const queue = data?.queue ?? []
  const isFirstRead = isReadingFirstTime(data)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [drafts, setDrafts] = useState<Record<string, string>>({})

  const selectedIndex = Math.max(
    0,
    queue.findIndex(({ action }) => action.id === selectedId)
  )
  const selected = queue[selectedIndex]

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
              await client.mail.cancelSend({ id: outboxId })
              void invalidate()
              toast(t.compose.backInQueue)
            },
          },
          duration: UNDO_SEND_SECONDS * 1000,
        })
      },
    })
  )
  const dismiss = useMutation(
    orpc.actions.dismiss.mutationOptions({
      onMutate: ({ id }) => removeAndAdvance(id),
      onSettled: invalidate,
    })
  )
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
  const refreshBrief = useMutation(
    orpc.today.refreshBrief.mutationOptions({ onSuccess: invalidate })
  )
  const isMissingBrief = !!data && !data.brief && !isFirstRead
  const { isIdle: isBriefIdle, mutate: writeBrief } = refreshBrief
  useEffect(() => {
    if (isMissingBrief && isBriefIdle) {
      writeBrief()
    }
  }, [isMissingBrief, isBriefIdle, writeBrief])

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

  const move = (step: number) => {
    const next =
      queue[Math.min(queue.length - 1, Math.max(0, selectedIndex + step))]
    if (next) {
      setSelectedId(next.action.id)
      setEditingId(null)
    }
  }

  const listKeys = { enabled: !isEditing && !!selected }
  useHotkey('J', () => move(1), listKeys)
  useHotkey('ArrowDown', () => move(1), listKeys)
  useHotkey('K', () => move(-1), listKeys)
  useHotkey('ArrowUp', () => move(-1), listKeys)
  useHotkey('Enter', approveSelected, listKeys)
  useHotkey(
    'S',
    () => selected && dismiss.mutate({ id: selected.action.id }),
    listKeys
  )
  useHotkey(
    'E',
    () =>
      selected && hasDraft(selected.action) && setEditingId(selected.action.id),
    listKeys
  )
  useHotkey(
    'R',
    () => selected && hasDraft(selected.action) && shorten(selected.action.id),
    listKeys
  )
  useHotkey(
    'O',
    () =>
      selected?.message &&
      navigate({ search: { thread: selected.message.threadId }, to: '/mail' }),
    listKeys
  )

  const brief = data?.brief

  return (
    <main className="flex min-h-0 flex-1 flex-col">
      <div className="flex-1 overflow-y-auto">
        <div className="mx-auto flex max-w-3xl flex-col gap-8 px-10 pt-12 pb-16">
          <header className="flex flex-col gap-3">
            <div className="text-muted-foreground flex items-center text-sm">
              <span className="inline-block first-letter:uppercase">
                {dataUpdatedAt > 0 &&
                  dates.format(dataUpdatedAt, 'EEEE, d MMMM')}
              </span>
              {brief && <BriefTime label={t.today.briefFrom} />}
            </div>
            <BriefBody
              brief={brief}
              isFirstRead={isFirstRead}
              isLoading={!brief && !refreshBrief.isError}
              queued={queue.length}
            />
          </header>

          <section
            aria-label={t.today.worthAttention}
            hidden={isFirstRead && queue.length === 0}
            className="flex flex-col gap-2.5"
          >
            <h2 className="text-muted-foreground text-xs font-medium">
              {t.today.worthAttention}
            </h2>
            {queue.length === 0 && (
              <p className="text-muted-foreground rounded-2xl border border-dashed px-4.5 py-4 text-sm">
                {t.today.nothingNeedsYou}
              </p>
            )}
            {queue.map((item, index) => (
              <QueueCard
                key={item.action.id}
                item={item}
                index={index}
                draft={draftOf(item)}
                isSelected={item === selected}
                isEditing={editingId === item.action.id}
                isBusy={
                  redraft.isPending && redraft.variables.id === item.action.id
                }
                onSelect={() => setSelectedId(item.action.id)}
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
                onSkip={() => dismiss.mutate({ id: item.action.id })}
                onStopEditing={() => setEditingId(null)}
              />
            ))}
          </section>

          {data && <MailDigest today={data} />}
          {data && <DayTally today={data} />}
          <ConnectHint />
        </div>
      </div>
      <KeyHints
        hints={
          isEditing
            ? [
                ['⌘⏎', t.keys.send],
                ['esc', t.keys.stopEditing],
              ]
            : [
                ['J / K', t.keys.move],
                ['⏎', t.keys.approve],
                ['E', t.keys.edit],
                ['S', t.keys.skip],
                ['⌘K', t.keys.anything],
              ]
        }
      />
    </main>
  )
}

export const Route = createFileRoute('/_app/today')({
  beforeLoad: ({ context }) => {
    if (context.me.plan.kind === 'free') {
      throw redirect({ to: '/mail' })
    }
  },
  component: TodayPage,
})
