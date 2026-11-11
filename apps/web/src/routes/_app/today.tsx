import { UNDO_SEND_SECONDS } from '@fewmail/shared/agent'
import type { Messages } from '@fewmail/shared/i18n'
import { Button } from '@fewmail/ui/components/button'
import { useHotkey } from '@tanstack/react-hotkeys'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  createFileRoute,
  Link,
  redirect,
  useNavigate,
  useRouter,
} from '@tanstack/react-router'
import { useState } from 'react'
import { toast } from 'sonner'

import { BriefHourSelect } from '~/components/agent-fields'
import { KeyHints } from '~/components/key-hints'
import { hasDraft, QueueCard } from '~/components/queue-card'
import { useDates, useT } from '~/lib/i18n'
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

const isReadingFirstTime = (data?: {
  mailboxes: { lastSyncedAt: Date | null; syncError: string | null }[]
}) =>
  !!data &&
  data.mailboxes.every((mailbox) => !mailbox.lastSyncedAt && !mailbox.syncError)

const quietCopy = (t: Messages, isFirstRead: boolean, queued: number) =>
  isFirstRead
    ? { headline: t.nav.syncing, note: t.today.firstRead }
    : { headline: t.today.headline(queued), note: t.today.nothingNeedsYou }

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
          persona: me.settings.persona,
          timezone: me.settings.timezone,
        })
      }
    />
  )
}

const TodayPage = () => {
  const t = useT()
  const dates = useDates()
  const { me } = Route.useRouteContext()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { data, dataUpdatedAt } = useQuery(orpc.today.get.queryOptions())

  const queue = data?.queue ?? []
  const quiet = quietCopy(t, isReadingFirstTime(data), queue.length)
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

  const sectionTitle =
    me.settings.persona === 'responder'
      ? t.today.waitingOnYou
      : t.today.worthAttention
  const brief = data?.brief
  const handled = data?.handled

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
            <h1 className="text-display font-serif tracking-tight" data-mask>
              {brief?.headline ?? quiet.headline}
            </h1>
            {brief ? (
              <p className="text-brief text-foreground/85 font-serif" data-mask>
                {brief.body}
              </p>
            ) : (
              <div className="text-muted-foreground -ml-3 flex items-center gap-3">
                <BriefTime label={t.today.briefArrives} />
                <Button
                  size="sm"
                  variant="secondary"
                  disabled={refreshBrief.isPending}
                  onClick={() => refreshBrief.mutate()}
                >
                  {refreshBrief.isPending ? t.today.writing : t.today.writeNow}
                </Button>
              </div>
            )}
          </header>

          <section aria-label={sectionTitle} className="flex flex-col gap-2.5">
            <h2 className="text-muted-foreground text-xs font-medium">
              {sectionTitle}
            </h2>
            {queue.length === 0 && (
              <p className="text-muted-foreground rounded-2xl border border-dashed px-4.5 py-4 text-sm">
                {quiet.note}
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

          {data?.later && (
            <p className="text-muted-foreground text-sm">
              {t.today.later(
                data.later.count,
                dates.format(data.later.at, 'p')
              )}
            </p>
          )}
          {handled && handled.total > 0 && <HandledSummary handled={handled} />}
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
