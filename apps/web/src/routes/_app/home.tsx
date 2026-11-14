import type { RouterOutputs } from '@fewmail/api/router'
import {
  sendsDraft,
  TIDY_KINDS,
  UNDO_SEND_SECONDS,
} from '@fewmail/shared/agent'
import type { Messages } from '@fewmail/shared/i18n'
import {
  Accordion,
  cardsBleedClassName,
} from '@fewmail/ui/components/accordion'
import { Button } from '@fewmail/ui/components/button'
import { IconButton } from '@fewmail/ui/components/custom/icon-button'
import {
  ResizableGroup,
  ResizablePanel,
  ResizableSeparator,
} from '@fewmail/ui/components/custom/resizable'
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
import { copy } from '@fewmail/ui/lib/copy'
import { cn } from '@fewmail/ui/lib/utils'
import {
  Add01Icon,
  BubbleChatIcon,
  PanelRightCloseIcon,
  PanelRightOpenIcon,
  RepeatIcon,
} from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
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
import { useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import { useSubscription } from 'seitu/react'
import { createWebStorageValue } from 'seitu/web'
import { toast } from 'sonner'

import { AgentChat, agentHiddenStore } from '~/components/agent-chat'
import { BoardBanners } from '~/components/board-banners'
import { confirm } from '~/components/confirm-dialog'
import { ConnectHint } from '~/components/connect-hint'
import { KeyHints } from '~/components/key-hints'
import { ListenButton } from '~/components/listen-button'
import { ExtractedChips, ImportanceDot } from '~/components/mail-meta'
import { QueueCard } from '~/components/queue-card'
import type { QueueItem } from '~/components/queue-card'
import {
  CodeActions,
  MailRowActions,
  ROW_SWAP,
  sweepOf,
  ThreadView,
  useMailActions,
} from '~/components/thread-view'
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
import { toastUndo } from '~/lib/undo'

const TallyBox = ({ children }: { children: ReactNode }) => (
  <div className="text-foreground/75 flex items-center gap-3 rounded-2xl border border-dashed px-4.5 py-3.5 text-sm">
    {children}
  </div>
)

const HandledSummary = ({
  handled,
  onReview,
}: {
  handled: Today['handled']
  onReview: () => void
}) => {
  const t = useT().today.handled

  return (
    <TallyBox>
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
    </TallyBox>
  )
}

const TIDY_TOAST = 'tidy'

const Tidy = ({
  canUseKeys,
  today,
}: {
  canUseKeys: boolean
  today: Today | undefined
}) => {
  const t = useT()
  const tidy = today?.tidy ?? []
  const queryClient = useQueryClient()
  const [isOpen, setIsOpen] = useState(false)
  const dropFromTidy = ({ messageIds }: { messageIds: string[] }) =>
    queryClient.setQueryData(
      orpc.today.get.queryKey(),
      (old) =>
        old && {
          ...old,
          tidy: old.tidy.filter(
            ({ message }) => !messageIds.includes(message.id)
          ),
        }
    )
  const refetch = () =>
    queryClient.invalidateQueries({ queryKey: orpc.today.key() })
  const refetchMail = () =>
    Promise.all([
      refetch(),
      queryClient.invalidateQueries({ queryKey: orpc.mail.key() }),
    ])
  const runTidy = useMutation(
    orpc.today.tidy.mutationOptions({
      onError: () => toast.dismiss(TIDY_TOAST),
      onMutate: (input) => {
        dropFromTidy(input)
        toast.loading(t.today.tidy.running, { id: TIDY_TOAST })
      },
      onSettled: refetchMail,
    })
  )
  const keep = useMutation(
    orpc.today.keep.mutationOptions({
      onMutate: dropFromTidy,
      onSettled: refetch,
    })
  )
  const run = () => {
    const idsOf = (kind?: (typeof TIDY_KINDS)[number]) =>
      tidy
        .filter(({ analysis }) => !kind || analysis.suggestedAction === kind)
        .map(({ message }) => message.id)
    const archived = idsOf('archive')
    const isLeavingLists = idsOf('unsubscribe').length > 0
    const tidyAll = () =>
      runTidy.mutate(
        { messageIds: idsOf() },
        {
          // Archived mail comes back; a list left or a read mark does not.
          onSuccess: ({ settled }) =>
            archived.length > 0
              ? toastUndo(
                  t.today.tidy.done(settled),
                  () =>
                    Promise.all(
                      archived.map((messageId) =>
                        client.mail.moveToInbox({ messageId })
                      )
                    ).finally(refetchMail),
                  TIDY_TOAST
                )
              : toast.success(t.today.tidy.done(settled), { id: TIDY_TOAST }),
        }
      )
    if (!isLeavingLists) {
      tidyAll()
      return
    }
    confirm({
      action: t.today.tidy.run,
      description: t.today.tidy.unsubscribeHint,
      onConfirm: tidyAll,
      title: t.today.tidy.confirm(t.cleanup.emails(tidy.length)),
      variant: 'warning',
    })
  }
  const toggle = () => setIsOpen((current) => !current)
  const keys = { enabled: canUseKeys && tidy.length > 0 }
  useHotkey('T', run, keys)
  useHotkey('D', toggle, keys)

  if (tidy.length === 0) {
    return null
  }
  return (
    <section aria-label={t.today.tidy.run} className="flex flex-col gap-2.5">
      <TallyBox>
        <span>
          <strong className="text-foreground font-semibold">
            {t.today.tidy.total(tidy.length)}
          </strong>
          {TIDY_KINDS.map((kind) => {
            const count = tidy.filter(
              ({ analysis }) => analysis.suggestedAction === kind
            ).length
            return count > 0 && ` · ${t.today.tidy[kind](count)}`
          })}
        </span>
        <Button size="sm" variant="link" className="ml-auto" onClick={toggle}>
          {t.today.tidy.details} <Kbd>D</Kbd>
        </Button>
        <Button size="sm" variant="secondary" onClick={run}>
          {t.today.tidy.run} <Kbd>T</Kbd>
        </Button>
      </TallyBox>
      {isOpen && (
        <SettingsGroup title={t.today.tidy.total(tidy.length)}>
          {tidy.map(({ analysis, message }) => (
            <SettingsRow
              key={message.id}
              title={
                <ThreadLink
                  threadId={message.threadId}
                  text={message.fromName ?? message.fromEmail}
                />
              }
              description={
                <>
                  {t.rules.effect[analysis.suggestedAction]} ·{' '}
                  <span data-mask>{analysis.reason || analysis.summary}</span>
                </>
              }
            >
              <Button
                size="sm"
                variant="ghost-muted"
                onClick={() => keep.mutate({ messageIds: [message.id] })}
              >
                {t.today.tidy.keep}
              </Button>
            </SettingsRow>
          ))}
        </SettingsGroup>
      )}
    </section>
  )
}

const HandledList = () => {
  const t = useT()
  const queryClient = useQueryClient()
  const { data: handled = [] } = useQuery(orpc.today.handled.queryOptions())
  const toInbox = useMutation(
    orpc.mail.moveToInbox.mutationOptions({
      onSettled: () =>
        queryClient.invalidateQueries({ queryKey: orpc.mail.key() }),
      onSuccess: () => toast(t.mail.backInInbox),
    })
  )
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

  const undos: Partial<
    Record<string, { label: string; run: (messageId: string) => void }>
  > = {
    archive: {
      label: t.mail.moveToInbox,
      run: (messageId) => toInbox.mutate({ messageId }),
    },
    spam: {
      label: t.mail.notSpam,
      run: (messageId) => notSpam.mutate({ messageId }),
    },
  }

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
          {message && undos[action.kind] ? (
            <Button
              size="sm"
              variant="ghost-muted"
              onClick={() => undos[action.kind]?.run(message.id)}
            >
              {undos[action.kind]?.label}
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

/** Opens in the reader beside Home, never in Mail: Home and the chat stay where they were. */
const ThreadLink = ({ text, threadId }: { text: string; threadId: string }) => (
  <Link
    to="/home"
    search={(prev) => ({ ...prev, thread: threadId })}
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
        old && { ...old, codes: old.codes.filter(({ id }) => id !== messageId) }
    )
  )
  const sweep = sweepOf(actions, t, 'inbox')
  const newest = codes[0]?.code
  useHotkey('Y', () => newest && copy(newest, t.mail.oneTimeCode.copied), {
    enabled: canUseKeys && !!newest,
  })

  if (!newest) {
    return null
  }
  return (
    <SettingsGroup title={t.today.codes}>
      {codes.map(
        (message) =>
          message.code && (
            <SettingsRow
              key={message.id}
              title={
                <ThreadLink
                  threadId={message.threadId}
                  text={message.fromName ?? message.fromEmail}
                />
              }
              description={<span data-mask>{message.subject}</span>}
            >
              <CodeActions
                actions={actions}
                code={message.code}
                messageIds={[message.id]}
                sweep={sweep}
              />
            </SettingsRow>
          )
      )}
    </SettingsGroup>
  )
}

const MailDigest = ({ today }: { today: Today }) => {
  const t = useT()
  const money = useMoneyFormat()
  const queryClient = useQueryClient()
  const actions = useMailActions((messageId) =>
    queryClient.setQueryData(
      orpc.today.get.queryKey(),
      (old) =>
        old && {
          ...old,
          recent: old.recent.filter(({ message }) => message.id !== messageId),
        }
    )
  )
  const sweep = sweepOf(actions, t, 'inbox')

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
              title={
                <ThreadLink
                  threadId={message.threadId}
                  text={message.fromName ?? message.fromEmail}
                />
              }
              description={<span data-mask>{analysis.summary}</span>}
            >
              <span className={`${ROW_SWAP} group/swap`}>
                <span className="flex items-center gap-2 group-hover/item:opacity-0 group-has-data-popup-open/swap:opacity-0">
                  <Ago date={message.receivedAt} />
                  <ImportanceDot
                    importance={analysis.importance}
                    reason={analysis.reason}
                  />
                </span>
                <MailRowActions
                  actions={actions}
                  canSnooze
                  className="group-hover/item:opacity-100"
                  messageIds={[message.id]}
                  sweep={sweep}
                />
              </span>
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
    today: Today | undefined
    isAsking: boolean
    isEditing: boolean
    isRewriting: boolean
    picked: number
    selected: QueueItem | undefined
    stale: number
  }
): [string, string][] => {
  if (state.isRewriting) {
    return [
      ['⏎', t.keys.rewrite],
      ['esc', t.keys.stopEditing],
    ]
  }
  if (state.isAsking) {
    return [
      ['⏎', t.keys.send],
      ['⌘⏎', t.keys.approve],
      ['⇧⌘O', t.agent.newChat],
      ['esc', t.keys.stopEditing],
    ]
  }
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
    ['/', t.keys.askAgent],
    ['J / K', t.keys.move],
    ['⏎', t.keys.approve],
    ...(state.alike > 1
      ? [['⇧⏎', t.keys.approveAll(state.alike)] as [string, string]]
      : []),
    ...(state.selected && sendsDraft(state.selected.action)
      ? [
          ['E', t.keys.edit] as [string, string],
          ['R', t.keys.rewrite] as [string, string],
        ]
      : []),
    ['S', t.keys.skip],
    ['⌫', t.keys.trash],
    ['X', t.keys.pick],
    ['⌘A', t.keys.pickAll],
    ...(state.stale > 0 ? [['⇧S', t.queue.skipStale] as [string, string]] : []),
    ...(state.today?.tidy.length
      ? [
          ['T', t.today.tidy.run] as [string, string],
          ['D', t.today.tidy.details] as [string, string],
        ]
      : []),
    ...(state.hasHandled
      ? [['H', t.today.handled.review] as [string, string]]
      : []),
    ...(state.today?.codes.length
      ? [['Y', t.mail.oneTimeCode.copy] as [string, string]]
      : []),
  ]
}

const AGENT_WIDTH = { default: 440, max: '50%', min: 360 } as const
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

const columnWidthStore = createWebStorageValue({
  defaultValue: AGENT_WIDTH.default as number,
  key: 'fewmail.home-agent-width',
  schema: type('number'),
  type: 'localStorage',
})

const CHATS_SHOWN = 4
const CHAT_ROW =
  'text-foreground/75 hover:bg-accent focus-visible:focus-ring flex h-8 shrink-0 cursor-pointer items-center gap-2 rounded-lg px-2.5 text-sm outline-none [&>svg]:size-4 [&>svg]:shrink-0 [&>svg]:opacity-70'

/** The agent's own column on Home: its chats on top, the open one under them, the composer at the bottom. */
const AgentColumn = ({
  chat,
  onFocusChange,
  thread,
}: {
  chat: string | undefined
  onFocusChange: (isFocused: boolean) => void
  thread: string | undefined
}) => {
  const t = useT()
  const navigate = useNavigate()
  const columnWidth = useSubscription(columnWidthStore)
  const isHidden = useSubscription(agentHiddenStore)
  const [draftId, setDraftId] = useState<string>(() => crypto.randomUUID())
  const [focusId, setFocusId] = useState<string>()
  const [shownChat, setShownChat] = useState(chat)
  // The draft that became the left chat must not take the next question.
  if (chat !== shownChat) {
    setShownChat(chat)
    if (shownChat === draftId) {
      setDraftId(crypto.randomUUID())
    }
  }
  const chatId = chat ?? draftId
  const isSaved = chat !== undefined && chat !== draftId
  const { data: saved } = useQuery(
    orpc.chats.get.queryOptions({ enabled: isSaved, input: { id: chatId } })
  )
  const { data: chats = [] } = useQuery(orpc.chats.list.queryOptions())
  const shown = chats
    .toSorted((a, b) => Number(b.waiting) - Number(a.waiting))
    .filter((item, index) => index < CHATS_SHOWN || item.id === chat)

  const showChat = (id: string | undefined) =>
    navigate({ search: (prev) => ({ ...prev, chat: id }), to: '/home' })
  const startChat = () => {
    const id = crypto.randomUUID()
    setDraftId(id)
    setFocusId(id)
    agentHiddenStore.set(false)
    void showChat(undefined)
  }
  useHotkey('Mod+Shift+O', startChat, { ignoreInputs: false })
  useHotkey('Mod+.', () => agentHiddenStore.set(!isHidden), {
    ignoreInputs: false,
  })
  useHotkey(['G', 'C'], () => navigate({ to: '/agent' }))

  return (
    <>
      <ResizableSeparator />
      <ResizablePanel
        className="flex"
        collapsed={isHidden}
        size={columnWidth}
        minSize={AGENT_WIDTH.min}
        maxSize={AGENT_WIDTH.max}
        onCollapsedChange={(isCollapsed) => agentHiddenStore.set(isCollapsed)}
        onSizeChange={(width) => columnWidthStore.set(width)}
      >
        <aside
          aria-label={t.agent.chats}
          className="bg-background flex min-w-0 flex-1 flex-col border-l"
        >
          <section className="flex flex-col gap-0.5 border-b p-2">
            <div className="flex h-7 items-center gap-1 ps-2.5">
              <h2 className="text-muted-foreground mr-auto text-xs font-medium">
                {t.agent.chats}
              </h2>
              <Button
                size="xs"
                variant="ghost-muted"
                render={<Link to="/agent" />}
              >
                {t.agent.allChats} <Kbd>G C</Kbd>
              </Button>
              <IconButton
                icon={Add01Icon}
                label={t.agent.newChat}
                shortcut={<Kbd>⇧⌘O</Kbd>}
                size="icon-xs"
                variant="ghost-muted"
                onClick={startChat}
              />
              <IconButton
                icon={PanelRightCloseIcon}
                label={t.agent.hide}
                shortcut={<Kbd>⌘.</Kbd>}
                size="icon-xs"
                variant="ghost-muted"
                onClick={() => agentHiddenStore.set(true)}
              />
            </div>
            {shown.map((item) => (
              <Link
                key={item.id}
                to="/home"
                search={(prev) => ({ ...prev, chat: item.id })}
                className={cn(
                  CHAT_ROW,
                  item.id === chat && 'bg-secondary text-foreground font-medium'
                )}
              >
                {item.waiting ? (
                  <span className="bg-primary mx-[5px] size-1.5 shrink-0 rounded-full" />
                ) : (
                  <HugeiconsIcon
                    icon={item.isScheduled ? RepeatIcon : BubbleChatIcon}
                    strokeWidth={2}
                  />
                )}
                <span className="min-w-0 flex-1 truncate" data-mask>
                  {item.title}
                </span>
                {item.waiting && (
                  <span className="text-primary shrink-0 text-xs">
                    {t.agent.waitingShort}
                  </span>
                )}
              </Link>
            ))}
          </section>
          {isSaved && !saved ? (
            <div className="flex-1" />
          ) : (
            <AgentChat
              key={chatId}
              autoFocus={chatId === focusId}
              chatId={chatId}
              initialMessages={saved?.messages ?? []}
              thread={thread}
              onFocusChange={onFocusChange}
              onSend={() =>
                navigate({
                  replace: !chat,
                  search: (prev) => ({ ...prev, chat: chatId }),
                  to: '/home',
                })
              }
            />
          )}
        </aside>
      </ResizablePanel>
    </>
  )
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
    <>
      <header className="flex flex-col gap-3">
        <p className="text-muted-foreground text-sm first-letter:uppercase">
          {updatedAt > 0 && dates.format(updatedAt, 'EEEE, d MMMM')}
        </p>
        {data ? (
          <h1 className="text-display font-serif tracking-tight">
            {isFirstRead
              ? t.nav.syncing
              : t.today.headline(data.queue.length + data.banners.length)}
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
            <ListenButton path="/voice/home" />
          </div>
        )}
      </header>
      {data && data.banners.length > 0 && (
        <BoardBanners banners={data.banners} />
      )}
    </>
  )
}

/** What is coming: the calendar's events left today and tomorrow, then mail naming a date (soonest first, from the server). */
const Ahead = ({ dated }: { dated: Today['dates'] }) => {
  const t = useT()
  const dates = useDates()
  const { data: events = [] } = useQuery(
    orpc.calendar.events.queryOptions({
      input: { from: startOfToday(), to: endOfTomorrow() },
      select: (calendar) =>
        calendar.events.filter((event) => eventTimes(event).end > new Date()),
    })
  )
  if (events.length === 0 && dated.length === 0) {
    return null
  }

  return (
    <SettingsGroup title={t.today.dates}>
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
      {dated.map(({ analysis, message }) => (
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
          <ExtractedChips extracted={{ ...analysis.extracted, amount: null }} />
        </SettingsRow>
      ))}
    </SettingsGroup>
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
      <Button size="sm" onClick={onApprove}>
        {t.queue.approve} <Kbd>⏎</Kbd>
      </Button>
      <Button size="sm" variant="secondary" onClick={onTrash}>
        {t.queue.delete} <Kbd>⌫</Kbd>
      </Button>
      <Button size="sm" variant="ghost-muted" onClick={onSkip}>
        {t.queue.skip} <Kbd>S</Kbd>
      </Button>
      <Button size="sm" variant="ghost-muted" onClick={onClear}>
        {t.queue.unpick} <Kbd>esc</Kbd>
      </Button>
    </>
  )
}

const ShowAgent = () => {
  const t = useT()
  const isHidden = useSubscription(agentHiddenStore)

  return (
    isHidden && (
      <IconButton
        className="absolute top-3 right-3 z-10"
        icon={PanelRightOpenIcon}
        label={t.agent.show}
        shortcut={<Kbd>⌘.</Kbd>}
        size="icon-sm"
        variant="ghost-muted"
        onClick={() => agentHiddenStore.set(false)}
      />
    )
  )
}

/** An email opens over the queue; the agent's column stays beside it. */
const Reader = ({
  onClose,
  thread,
}: {
  onClose: () => void
  thread: string
}) => {
  const t = useT()

  return (
    <div className="bg-background flex min-h-0 min-w-0 flex-1 flex-col">
      <ThreadView
        key={thread}
        isSnoozed={false}
        threadId={thread}
        onClose={onClose}
        onDone={onClose}
      />
      <KeyHints
        hints={[
          ['R', t.keys.reply],
          ['E', t.keys.archive],
          ['/', t.keys.ask],
          ['esc', t.keys.close],
        ]}
      />
    </div>
  )
}

/**
 * The cursor holds a card, not a position: a card arriving above it live must never take ⏎ from the one being read.
 * A card that leaves hands the cursor to whichever card takes its place.
 */
const useCursor = (queue: QueueItem[]) => {
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [lastIndex, setLastIndex] = useState(0)
  const foundIndex = queue.findIndex(({ action }) => action.id === selectedId)
  const selectedIndex =
    foundIndex === -1
      ? Math.max(0, Math.min(lastIndex, queue.length - 1))
      : foundIndex
  const selected = queue.at(selectedIndex)
  if (foundIndex === -1 && selected) {
    setSelectedId(selected.action.id)
  }
  if (foundIndex !== -1 && foundIndex !== lastIndex) {
    setLastIndex(foundIndex)
  }
  return { selected, selectedIndex, setSelectedId }
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
      >
        {t.queue.skipStale} <Kbd>⇧S</Kbd>
      </Button>
    </TallyBox>
  )
}

const HomePage = () => {
  const t = useT()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { chat, thread } = Route.useSearch()
  const [isAsking, setIsAsking] = useState(false)
  const { data, dataUpdatedAt } = useQuery(orpc.today.get.queryOptions())

  const queue = data?.queue ?? []
  const isFirstRead = !!data && isReadingFirstTime(data.mailboxes)
  const { selected, selectedIndex, setSelectedId } = useCursor(queue)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [rewritingId, setRewritingId] = useState<string | null>(null)
  const [drafts, setDrafts] = useState<Record<string, string>>({})
  const [isReviewing, setIsReviewing] = useState(false)
  const [pickedIds, setPickedIds] = useState<string[]>([])

  const picked = queue.filter(({ action }) => pickedIds.includes(action.id))
  const targets =
    picked.length > 0 ? picked : queue.slice(selectedIndex, selectedIndex + 1)
  const staleBefore = subDays(dataUpdatedAt, STALE_DAYS)
  const stale = queue.filter(({ action }) => action.createdAt < staleBefore)

  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: orpc.today.key() })
  const seenAt = useVisits(invalidate)
  const refreshMail = () =>
    Promise.all([
      invalidate(),
      queryClient.invalidateQueries({ queryKey: orpc.mail.key() }),
    ])
  const undoable = (message: string, undo: () => Promise<unknown>) =>
    toastUndo(message, () => undo().finally(refreshMail))
  const undoSkip = (ids: string[]) =>
    undoable(
      ids.length === 1 ? t.telegram.skipped : t.queue.skipped(ids.length),
      () => Promise.all(ids.map((id) => client.actions.restore({ id })))
    )
  const removeAndAdvance = (actionId: string) => {
    if (actionId === selected?.action.id) {
      const next = queue[selectedIndex + 1] ?? queue[selectedIndex - 1]
      setSelectedId(next?.action.id ?? null)
      setEditingId(null)
    }
    queryClient.setQueryData(
      orpc.today.get.queryKey(),
      (old) =>
        old && {
          ...old,
          queue: old.queue.filter(({ action }) => action.id !== actionId),
        }
    )
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
          const canceled = await Promise.all(
            outboxIds.map((id) =>
              client.mail.cancelSend({ id }).catch(() => null)
            )
          )
          if (canceled.some(Boolean)) {
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
      onMutate: ({ id }) => removeAndAdvance(id),
      onSettled: invalidate,
      onSuccess: (_, { id }) => undoSkip([id]),
    })
  )
  const skipMany = useMutation({
    mutationFn: (ids: string[]) =>
      Promise.all(ids.map((id) => client.actions.dismiss({ id }))),
    onMutate: dropFromQueue,
    onSettled: invalidate,
    onSuccess: (_, ids) => undoSkip(ids),
  })
  const skipStale = () => skipMany.mutate(stale.map(({ action }) => action.id))
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
    onSettled: refreshMail,
    onSuccess: (_, items) =>
      undoable(t.mail.trashed, () =>
        Promise.all(
          items.map(async ({ action, message }) => {
            if (message) {
              await client.mail.moveToInbox({ messageId: message.id })
            }
            await client.actions.restore({ id: action.id })
          })
        )
      ),
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
  const isRewriting = !!selected && rewritingId === selected.action.id
  const rewrite = (id: string, instruction: string) => {
    setRewritingId(null)
    redraft.mutate({ id, instruction })
  }

  const approveItem = ({ action }: QueueItem) => {
    const edited = drafts[action.id]
    approve.mutate({
      id: action.id,
      ...(edited !== undefined && { detail: edited }),
    })
  }
  const approveSelected = () => selected && approveItem(selected)

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
  const approveTargets = () =>
    picked.length > 0
      ? approveMany.mutate({ ids: pickedActionIds })
      : approveSelected()
  const skipTargets = () =>
    picked.length > 0
      ? skipMany.mutate(pickedActionIds)
      : selected && dismiss.mutate({ id: selected.action.id })

  const showThread = (id: string | undefined) =>
    navigate({ search: (prev) => ({ ...prev, thread: id }), to: '/home' })
  // The open thread brings its own R, E, S, H and ⌫.
  const isWalking = !isEditing && !thread
  const listKeys = { enabled: isWalking && !!selected }
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
    enabled: isWalking && picked.length > 0,
  })
  useHotkey('Escape', () => showThread(undefined), { enabled: !!thread })
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
      selected &&
      sendsDraft(selected.action) &&
      setRewritingId(selected.action.id),
    listKeys
  )
  const hasHandled = !!data?.handled.total
  const reviewHandled = () => setIsReviewing((current) => !current)
  useHotkey('H', reviewHandled, {
    enabled: isWalking && hasHandled,
  })
  useHotkey(
    'O',
    () => selected?.message && showThread(selected.message.threadId),
    listKeys
  )

  return (
    <ResizableGroup className="flex-1">
      <ResizablePanel className="flex min-w-0 flex-col">
        {thread && (
          <Reader thread={thread} onClose={() => showThread(undefined)} />
        )}
        <main hidden={!!thread} className="flex min-h-0 flex-1 flex-col">
          <div className="relative min-h-0 flex-1">
            <ShowAgent />
            <div className="h-full overflow-y-auto">
              <div className="mx-auto flex max-w-3xl flex-col gap-8 px-10 pt-12 pb-16">
                <HomeHeader
                  data={data}
                  isFirstRead={isFirstRead}
                  updatedAt={dataUpdatedAt}
                />
                <ConnectHint />
                <FreshCodes today={data} canUseKeys={isWalking} />

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
                      <PickedActions
                        onApprove={approveTargets}
                        onClear={() => setPickedIds([])}
                        onSkip={skipTargets}
                        onTrash={() => trashMany.mutate(picked)}
                      />
                    )}
                  </div>
                  {!!data && queue.length === 0 && (
                    <p
                      className={cn(
                        'text-muted-foreground rounded-2xl border border-dashed px-4.5 py-4 text-sm',
                        cardsBleedClassName
                      )}
                    >
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
                        isNew={!!seenAt && item.action.createdAt > seenAt}
                        isPicked={pickedIds.includes(item.action.id)}
                        isRewriting={rewritingId === item.action.id}
                        isSelected={item === selected}
                        isEditing={editingId === item.action.id}
                        isBusy={
                          redraft.isPending &&
                          redraft.variables.id === item.action.id
                        }
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
                        onOpen={() =>
                          item.message && showThread(item.message.threadId)
                        }
                        onPick={() => togglePick(item.action.id)}
                        onSkip={() => dismiss.mutate({ id: item.action.id })}
                        onStopEditing={() => setEditingId(null)}
                      />
                    ))}
                  </Accordion>
                  <StaleCards
                    canUseKeys={isWalking}
                    count={stale.length}
                    onSkip={skipStale}
                  />
                </section>

                {data && (
                  <>
                    <Ahead dated={data.dates} />
                    <MailDigest today={data} />
                    <Tidy today={data} canUseKeys={isWalking} />
                    <DayTally
                      today={data}
                      isReviewing={isReviewing}
                      onReview={reviewHandled}
                    />
                  </>
                )}
              </div>
            </div>
          </div>
          <KeyHints
            hints={homeHints(t, {
              alike: alike.length,
              hasHandled,
              isAsking,
              isEditing,
              selected,
              isRewriting,
              picked: picked.length,
              stale: stale.length,
              today: data,
            })}
          />
        </main>
      </ResizablePanel>
      <AgentColumn chat={chat} thread={thread} onFocusChange={setIsAsking} />
    </ResizableGroup>
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
  validateSearch: type({ 'chat?': 'string.uuid', 'thread?': 'string' }),
  loaderDeps: ({ search }) => ({ chat: search.chat }),
  loader: async ({ deps: { chat } }) => {
    const [, chats] = await Promise.all([
      warmQuery(orpc.today.get.queryOptions()),
      warmQuery(orpc.chats.list.queryOptions()),
    ])
    // A chat that is still being started is not saved yet: asking for it would answer "not found".
    if (chat && chats?.some(({ id }) => id === chat)) {
      await warmQuery(orpc.chats.get.queryOptions({ input: { id: chat } }))
    }
  },
})
