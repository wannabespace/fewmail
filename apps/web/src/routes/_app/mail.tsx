import type { RouterOutputs } from '@fewmail/api/router'
import { BULK_THRESHOLD } from '@fewmail/shared/agent'
import { Button } from '@fewmail/ui/components/button'
import { IconButton } from '@fewmail/ui/components/custom/icon-button'
import {
  ResizableGroup,
  ResizablePanel,
  ResizableSeparator,
} from '@fewmail/ui/components/custom/resizable'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@fewmail/ui/components/dropdown-menu'
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@fewmail/ui/components/empty'
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from '@fewmail/ui/components/input-group'
import { Kbd } from '@fewmail/ui/components/kbd'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@fewmail/ui/components/select'
import { Spinner } from '@fewmail/ui/components/spinner'
import { useDebouncedMemo } from '@fewmail/ui/hookas/use-debounced-memo'
import { cn } from '@fewmail/ui/lib/utils'
import {
  Clock01Icon,
  Delete02Icon,
  Mail01Icon,
  Search01Icon,
  Shield01Icon,
} from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { eq, useLiveQuery } from '@tanstack/react-db'
import { useHotkey } from '@tanstack/react-hotkeys'
import {
  skipToken,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { type } from 'arktype'
import { isToday } from 'date-fns'
import { Fragment, useEffect, useEffectEvent, useRef, useState } from 'react'
import { useSubscription } from 'seitu/react'
import { createWebStorageValue } from 'seitu/web'

import { useCompose } from '~/components/compose/compose-context'
import { KeyHints } from '~/components/key-hints'
import { ExtractedChips, ImportanceDot } from '~/components/mail-meta'
import {
  SnoozeMenuItems,
  sweepOf,
  ThreadView,
  useMailActions,
} from '~/components/thread-view'
import type { Place, Sweep } from '~/components/thread-view'
import { useDates, useT } from '~/lib/i18n'
import { mailRowsOf, prefetchThread } from '~/lib/mail-db'
import type { MailRow as MailRowData } from '~/lib/mail-db'
import { useHasAgent } from '~/lib/me'
import { orpc } from '~/lib/orpc'

const FILTERS = [
  'inbox',
  'important',
  'needs_reply',
  'quiet',
  'snoozed',
  'drafts',
  'archive',
  'spam',
  'trash',
] as const

type Filter = (typeof FILTERS)[number]

const ARRIVING = new Set<Filter>([
  'inbox',
  'important',
  'needs_reply',
  'quiet',
  'spam',
])

const OUT_OF_INBOX: Partial<Record<Filter, Place>> = {
  archive: 'elsewhere',
  spam: 'spam',
  trash: 'elsewhere',
}

const stepFilter = (filter: Filter, step: number) =>
  FILTERS[(FILTERS.indexOf(filter) + step + FILTERS.length) % FILTERS.length] ??
  filter

const ALL_MAILBOXES = 'all'

const COUNTED: Record<keyof RouterOutputs['mail']['unread'], true> = {
  important: true,
  inbox: true,
  needs_reply: true,
  quiet: true,
}

const isCounted = (
  filter: Filter
): filter is keyof RouterOutputs['mail']['unread'] => filter in COUNTED

/** Threads read ahead of the click; the cursor's neighbours and a hovered row are added as they come. */
const PREFETCHED_ROWS = 10

const READER_WIDTH = { default: 640, max: '70%', min: 420 } as const

const readerWidthStore = createWebStorageValue({
  defaultValue: READER_WIDTH.default as number,
  key: 'fewmail.reader-width',
  schema: type('number'),
  type: 'localStorage',
})

const GROUPINGS = ['none', 'category', 'sender', 'importance'] as const

type Grouping = (typeof GROUPINGS)[number]

const groupingStore = createWebStorageValue({
  defaultValue: 'none' as Grouping,
  key: 'fewmail.mail-grouping',
  schema: type("'none' | 'category' | 'sender' | 'importance'"),
  type: 'localStorage',
})

type ListedRow = Omit<MailRowData, 'key' | 'list'>

const groupKeyOf = (grouping: Grouping, { analysis, message }: ListedRow) => {
  if (grouping === 'sender') {
    return message.fromEmail
  }
  if (grouping === 'importance') {
    return String(analysis?.importance ?? 0)
  }
  return analysis?.category ?? 'other'
}

const groupRows = <Row extends ListedRow>(rows: Row[], grouping: Grouping) => {
  if (grouping === 'none') {
    return []
  }
  const groups = [
    ...Map.groupBy(rows, (row) => groupKeyOf(grouping, row)).entries(),
  ]
  if (grouping === 'importance') {
    groups.sort(([a], [b]) => Number(b) - Number(a))
  }
  return groups.map(([key, members]) => ({ key, rows: members }))
}

const useGroupedRows = <Row extends ListedRow>(
  listedRows: Row[],
  grouping: Grouping
) => {
  const groups = groupRows(listedRows, grouping)
  if (groups.length === 0) {
    return {
      groupStarts: new Map<number, (typeof groups)[number]>(),
      rows: listedRows,
    }
  }
  let start = 0
  const groupStarts = new Map<number, (typeof groups)[number]>()
  for (const group of groups) {
    groupStarts.set(start, group)
    start += group.rows.length
  }
  return { groupStarts, rows: groups.flatMap((group) => group.rows) }
}

const GroupHeader = ({
  group,
  grouping,
}: {
  group: ReturnType<typeof groupRows>[number] | undefined
  grouping: Grouping
}) => {
  const t = useT()
  const first = group?.rows[0]
  if (!group || !first) {
    return null
  }
  const { message } = first
  const groupKey = group.key
  const labels = {
    category: () => t.category[groupKey as keyof typeof t.category],
    importance: () => t.importance[Number(groupKey)],
    sender: () => message.fromName ?? message.fromEmail,
  }
  const label = grouping === 'none' ? null : labels[grouping]()
  return (
    <li className="bg-body text-muted-foreground sticky top-0 z-10 flex items-center gap-2 border-b px-5 py-1.5 pl-9 text-xs font-medium">
      <span data-mask={grouping === 'sender' || undefined} className="truncate">
        {label}
      </span>
      <span className="tabular-nums opacity-60">{group.rows.length}</span>
    </li>
  )
}

const SearchHint = ({ isPending }: { isPending: boolean }) =>
  isPending ? (
    <Spinner className="text-muted-foreground" />
  ) : (
    <Kbd className="group-focus-within/input-group:hidden">/</Kbd>
  )

const FilterSelect = ({
  filter,
  onChange,
  unread,
}: {
  filter: Filter
  onChange: (filter: Filter) => void
  unread: RouterOutputs['mail']['unread'] | undefined
}) => {
  const t = useT()
  const countOf = (value: Filter) =>
    isCounted(value) &&
    Boolean(unread?.[value]) && (
      <span className="text-muted-foreground text-xs tabular-nums">
        {unread?.[value]}
      </span>
    )
  return (
    <Select
      items={FILTERS.map((value) => ({ label: t.mail.filter[value], value }))}
      value={filter}
      onValueChange={(next) => next && onChange(next)}
    >
      <SelectTrigger aria-label={t.mail.filter[filter]} size="sm">
        <SelectValue />
        {countOf(filter)}
      </SelectTrigger>
      <SelectContent align="start">
        {FILTERS.map((value) => (
          <SelectItem key={value} value={value}>
            {t.mail.filter[value]}
            <span className="ml-auto">{countOf(value)}</span>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}

const GroupingSelect = ({ grouping }: { grouping: Grouping }) => {
  const t = useT()
  return (
    <Select
      items={GROUPINGS.map((value) => ({
        label: value === 'none' ? t.mail.group.title : t.mail.group[value],
        value,
      }))}
      value={grouping}
      onValueChange={(next) => next && groupingStore.set(next)}
    >
      <SelectTrigger
        aria-label={t.mail.group.title}
        size="sm"
        className="ml-auto"
      >
        <SelectValue />
      </SelectTrigger>
      <SelectContent align="end">
        {GROUPINGS.map((value) => (
          <SelectItem key={value} value={value}>
            {t.mail.group[value]}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}

const MailRowMeta = ({
  insight,
  message,
}: {
  insight: MailRowData['analysis']
  message: MailRowData['message']
}) => {
  const t = useT()
  return (
    <span className="text-muted-foreground flex min-w-0 flex-1 items-center gap-1.5 overflow-hidden text-xs whitespace-nowrap">
      {insight?.category === 'security' ? (
        <span className="text-destructive flex items-center gap-1 font-medium">
          <HugeiconsIcon
            icon={Shield01Icon}
            strokeWidth={2}
            className="size-3"
          />
          {t.category.security}
        </span>
      ) : (
        insight && <span>{t.category[insight.category]}</span>
      )}
      {insight?.needsReply && (
        <span className="text-primary">· {t.mail.expectsReply}</span>
      )}
      {message.hasAttachments && <span>· {t.mail.attachment}</span>}
      {(message.bulkCount ?? 0) >= BULK_THRESHOLD && (
        <span>· {t.bulk.badge(message.bulkCount ?? 0)}</span>
      )}
      {insight && <ExtractedChips extracted={insight.extracted} />}
    </span>
  )
}

const MailRowActions = ({
  actions,
  canSnooze,
  isSnoozeOpen,
  messageId,
  onSnoozeOpenChange,
  sweep,
}: {
  actions: ReturnType<typeof useMailActions>
  canSnooze: boolean
  isSnoozeOpen: boolean
  messageId: string
  onSnoozeOpenChange: (open: boolean) => void
  sweep: Sweep
}) => {
  const t = useT()
  const target = { messageId }
  return (
    <span
      className={cn(
        'absolute top-1.5 right-4 flex bg-inherit opacity-0 group-hover:opacity-100 has-data-popup-open:opacity-100',
        isSnoozeOpen && 'opacity-100'
      )}
    >
      <IconButton
        icon={sweep.icon}
        label={sweep.label}
        size="icon-sm"
        variant="ghost-muted"
        onClick={() => sweep.action.mutate(target)}
      />
      {canSnooze && (
        <DropdownMenu open={isSnoozeOpen} onOpenChange={onSnoozeOpenChange}>
          <DropdownMenuTrigger
            render={
              <Button
                aria-label={t.snooze.title}
                size="icon-sm"
                variant="ghost-muted"
              />
            }
          >
            <HugeiconsIcon icon={Clock01Icon} strokeWidth={2} />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <SnoozeMenuItems
              onSnooze={(until) => actions.snooze.mutate({ ...target, until })}
            />
          </DropdownMenuContent>
        </DropdownMenu>
      )}
      <IconButton
        icon={Delete02Icon}
        label={t.mail.trash}
        size="icon-sm"
        variant="ghost-destructive"
        onClick={() => actions.trash.mutate(target)}
      />
    </span>
  )
}

const MailRow = ({
  actions,
  canSnooze,
  isCursor,
  isOpen,
  isSnoozeOpen,
  onOpen,
  onSnoozeOpenChange,
  row: { analysis, message, threadSize },
  sweep,
}: {
  actions: ReturnType<typeof useMailActions>
  canSnooze: boolean
  isCursor: boolean
  isOpen: boolean
  isSnoozeOpen: boolean
  onOpen: () => void
  onSnoozeOpenChange: (open: boolean) => void
  row: ListedRow
  sweep: Sweep
}) => {
  const t = useT()
  const dates = useDates()

  return (
    <li
      data-row
      className={cn(
        'group relative border-b',
        isCursor || isSnoozeOpen ? 'bg-accent' : 'hover:bg-accent',
        isOpen && 'bg-secondary'
      )}
    >
      <button
        type="button"
        tabIndex={-1}
        onClick={onOpen}
        onPointerEnter={() => {
          void prefetchThread(message.threadId)
        }}
        aria-current={isOpen}
        className="flex w-full cursor-pointer flex-col gap-0.5 px-5 py-2.5 text-left outline-none"
      >
        <span className="flex items-center gap-2 text-sm">
          <span
            aria-label={message.isUnread ? t.mail.unread : undefined}
            className={cn(
              'size-2 shrink-0 rounded-full',
              message.isUnread && 'bg-primary'
            )}
          />
          <span
            data-mask
            className={cn(
              'min-w-0 truncate',
              message.isUnread ? 'font-semibold' : 'text-foreground/70'
            )}
          >
            {message.fromName ?? message.fromEmail}
          </span>
          <span className="text-muted-foreground shrink-0 text-xs tabular-nums">
            {threadSize > 1 && threadSize}
          </span>
          <MailRowMeta insight={analysis} message={message} />
          {analysis ? (
            <ImportanceDot
              importance={analysis.importance}
              reason={analysis.reason}
            />
          ) : (
            <span className="bg-foreground/10 size-2 shrink-0 animate-pulse rounded-full" />
          )}
          <span
            className={cn(
              'shrink-0 text-xs tabular-nums',
              message.isUnread
                ? 'text-foreground font-medium'
                : 'text-muted-foreground'
            )}
          >
            {dates.format(
              message.receivedAt,
              isToday(message.receivedAt) ? 'HH:mm' : 'd MMM'
            )}
          </span>
        </span>
        <span
          data-mask
          className={cn(
            'truncate pl-4 text-sm',
            message.isUnread
              ? 'text-foreground/90 font-medium'
              : 'text-foreground/60'
          )}
        >
          {message.subject}
        </span>
        <span
          data-mask
          className="text-muted-foreground/80 truncate pl-4 text-xs"
        >
          {analysis?.summary ?? message.snippet}
        </span>
        {message.risk && (
          <span className="text-destructive pl-4 text-xs font-medium">
            {t.risk.title}
          </span>
        )}
        {!message.risk && message.suspicion && (
          <span className="text-muted-foreground pl-4 text-xs">
            {t.spam.suspect}
          </span>
        )}
      </button>
      <MailRowActions
        actions={actions}
        canSnooze={canSnooze}
        isSnoozeOpen={isSnoozeOpen}
        messageId={message.id}
        onSnoozeOpenChange={onSnoozeOpenChange}
        sweep={sweep}
      />
    </li>
  )
}

type DraftRowData = RouterOutputs['mail']['drafts'][number]

const DraftRow = ({
  draft,
  isCursor,
  onDelete,
  onOpen,
}: {
  draft: DraftRowData
  isCursor: boolean
  onDelete: () => void
  onOpen: () => void
}) => {
  const t = useT()
  const dates = useDates()
  return (
    <li
      data-row
      className={cn(
        'group relative border-b',
        isCursor ? 'bg-accent' : 'hover:bg-accent'
      )}
    >
      <button
        type="button"
        tabIndex={-1}
        onClick={onOpen}
        className="flex w-full cursor-pointer flex-col gap-0.5 px-5 py-2.5 text-left outline-none"
      >
        <span className="flex items-center gap-2 pl-4 text-sm">
          <span
            data-mask
            className="text-foreground/70 min-w-0 flex-1 truncate"
          >
            {draft.to.join(', ') || t.mail.noRecipients}
          </span>
          <span className="text-muted-foreground shrink-0 text-xs tabular-nums">
            {dates.format(
              draft.savedAt,
              isToday(draft.savedAt) ? 'HH:mm' : 'd MMM'
            )}
          </span>
        </span>
        <span data-mask className="text-foreground/60 truncate pl-4 text-sm">
          {draft.subject}
        </span>
        <span data-mask className="text-muted-foreground truncate pl-4 text-sm">
          {draft.snippet}
        </span>
        {draft.isFailed && (
          <span className="text-destructive pl-4 text-xs font-medium">
            {t.mail.notSent}
          </span>
        )}
      </button>
      <span className="absolute top-1.5 right-4 flex bg-inherit opacity-0 group-hover:opacity-100">
        <IconButton
          icon={Delete02Icon}
          label={t.mail.deleteDraft}
          size="icon-sm"
          variant="ghost-destructive"
          onClick={onDelete}
        />
      </span>
    </li>
  )
}

const useDrafts = ({
  isEnabled,
  mailbox,
  q,
}: {
  isEnabled: boolean
  mailbox: string | undefined
  q: string | undefined
}) => {
  const { openCompose } = useCompose()
  const queryClient = useQueryClient()
  const { data: rows = [], isFetching } = useQuery(
    orpc.mail.drafts.queryOptions({
      input: isEnabled
        ? { mailboxId: mailbox, ...(q && { search: q }) }
        : skipToken,
    })
  )
  const refetchDrafts = () =>
    queryClient.invalidateQueries({ queryKey: orpc.mail.drafts.key() })
  const deleteDraft = useMutation(
    orpc.mail.deleteDraft.mutationOptions({ onSuccess: refetchDrafts })
  )
  const takeBackFailed = useMutation(
    orpc.mail.cancelSend.mutationOptions({ onSuccess: refetchDrafts })
  )
  const open = (index: number) => {
    const saved = rows[index]
    if (saved?.isFailed) {
      takeBackFailed.mutate({ id: saved.id }, { onSuccess: openCompose })
    } else if (saved) {
      openCompose({
        bcc: saved.bcc,
        cc: saved.cc,
        gmailDraft: { id: saved.id, mailboxId: saved.mailboxId },
        html: saved.html,
        mailboxId: saved.mailboxId,
        mode: saved.mode,
        replyToMessageId: saved.replyToMessageId,
        subject: saved.subject,
        to: saved.to,
      })
    }
  }
  const remove = ({ id, isFailed, mailboxId }: DraftRowData) =>
    isFailed
      ? takeBackFailed.mutate({ id })
      : deleteDraft.mutate({ id, mailboxId })
  return { isFetching, open, remove, rows }
}

const useListRows = ({
  filter,
  mailbox,
  q,
  typed,
}: {
  filter: Filter
  mailbox: string | undefined
  q: string | undefined
  typed: string
}) => {
  const isDrafts = filter === 'drafts'
  const found = useQuery(
    orpc.mail.list.queryOptions({
      input:
        q && !isDrafts ? { filter, mailboxId: mailbox, search: q } : skipToken,
    })
  )
  const listed = useLiveQuery((query) =>
    q || isDrafts
      ? undefined
      : query
          .from({ row: mailRowsOf(mailbox) })
          .where(({ row }) => eq(row.list, filter))
          .orderBy(({ row }) => row.message.receivedAt, 'desc')
  )
  const drafts = useDrafts({ isEnabled: isDrafts, mailbox, q })
  const source = q
    ? { isFetching: found.isFetching, rows: found.data }
    : { isFetching: listed.isLoading, rows: listed.data }
  const rows = source.rows ?? []
  return {
    isSearchPending: typed !== (q ?? '') || (!!q && found.isFetching),
    drafts,
    isDrafts,
    isFetching: isDrafts ? drafts.isFetching : source.isFetching,
    rows,
    total: isDrafts ? drafts.rows.length : rows.length,
  }
}

const useListActions = ({
  filter,
  isEnabled,
  messageId,
}: {
  filter: Filter
  isEnabled: boolean
  messageId: string | undefined
}) => {
  const t = useT()
  const actions = useMailActions()
  const [snoozeOpenId, setSnoozeOpenId] = useState<string | null>(null)
  const canSnooze = filter !== 'snoozed'
  const sweep = sweepOf(actions, t, OUT_OF_INBOX[filter] ?? 'inbox')
  const keys = { enabled: isEnabled && !!messageId }
  useHotkey('E', () => messageId && sweep.action.mutate({ messageId }), keys)
  useHotkey('H', () => messageId && setSnoozeOpenId(messageId), {
    enabled: keys.enabled && canSnooze,
  })
  useHotkey(
    'Shift+3',
    () => messageId && actions.trash.mutate({ messageId }),
    keys
  )
  useHotkey(
    'Shift+1',
    () => messageId && actions.reportSpam.mutate({ messageId }),
    keys
  )
  const sweepHint: [string, string] = [
    'E',
    filter in OUT_OF_INBOX ? t.keys.restore : t.keys.archive,
  ]
  const hints: [string, string][] =
    filter === 'drafts'
      ? []
      : [
          sweepHint,
          ...(canSnooze ? [['H', t.keys.snooze] as [string, string]] : []),
          ['#', t.keys.trash],
        ]
  return {
    actions,
    canSnooze,
    hints,
    setSnoozeOpenId,
    snoozeOpenId,
    sweep,
    sweepHint,
  }
}

const MailPage = () => {
  const t = useT()
  const readerWidth = useSubscription(readerWidthStore)
  const grouping = useSubscription(groupingStore)
  const hasAgent = useHasAgent()
  const { filter = 'inbox', mailbox, q, thread } = Route.useSearch()
  const navigate = useNavigate({ from: Route.fullPath })
  const searchRef = useRef<HTMLInputElement>(null)
  const listRef = useRef<HTMLUListElement>(null)
  const [search, setSearch] = useState(q ?? '')
  const [cursor, setCursor] = useState(0)
  const listKey = `${filter}:${mailbox ?? ''}:${q ?? ''}`
  const [cursorListKey, setCursorListKey] = useState(listKey)
  if (cursorListKey !== listKey) {
    setCursorListKey(listKey)
    setCursor(0)
  }

  const { data: mailboxes = [] } = useQuery(orpc.mailboxes.list.queryOptions())
  const { data: unread } = useQuery(
    orpc.mail.unread.queryOptions({ input: { mailboxId: mailbox } })
  )
  const {
    drafts,
    isDrafts,
    isFetching,
    isSearchPending,
    rows: listedRows,
    total,
  } = useListRows({ filter, mailbox, q, typed: search.trim() })
  const { groupStarts, rows } = useGroupedRows(listedRows, grouping)

  const {
    actions,
    canSnooze,
    hints,
    setSnoozeOpenId,
    snoozeOpenId,
    sweep,
    sweepHint,
  } = useListActions({
    filter,
    isEnabled: !thread,
    messageId: rows[cursor]?.message.id,
  })

  useEffect(() => {
    const row = listRef.current?.querySelectorAll('[data-row]')[cursor]
    row?.scrollIntoView({ block: 'nearest' })
  }, [cursor])
  useEffect(() => {
    const ahead = [
      ...rows.slice(0, PREFETCHED_ROWS),
      ...rows.slice(Math.max(0, cursor - 1), cursor + 2),
    ]
    for (const { message } of ahead) {
      void prefetchThread(message.threadId)
    }
  }, [rows, cursor])

  const open = (index: number) => {
    if (isDrafts) {
      setCursor(index)
      drafts.open(index)
      return
    }
    const row = rows[index]
    if (row) {
      setCursor(index)
      void navigate({
        search: (prev) => ({ ...prev, thread: row.message.threadId }),
      })
    }
  }

  const moveCursor = (step: number) => {
    // A focused tab or button owns Enter, so the list's Enter would never fire.
    ;(document.activeElement as HTMLElement | null)?.blur()
    setCursor((index) => Math.min(total - 1, Math.max(0, index + step)))
  }
  useHotkey('J', () => moveCursor(1))
  useHotkey('ArrowDown', () => moveCursor(1))
  useHotkey('K', () => moveCursor(-1))
  useHotkey('ArrowUp', () => moveCursor(-1))
  useHotkey('Enter', () => open(cursor))
  useHotkey('O', () => open(cursor))
  const showFilter = (next: Filter) =>
    navigate({
      search: (prev) => ({ ...prev, filter: next, thread: undefined }),
    })
  useHotkey('[', () => showFilter(stepFilter(filter, -1)))
  useHotkey(']', () => showFilter(stepFilter(filter, 1)))
  useHotkey('/', () => searchRef.current?.focus())
  useHotkey('V', () =>
    groupingStore.set(
      GROUPINGS[(GROUPINGS.indexOf(grouping) + 1) % GROUPINGS.length] ?? 'none'
    )
  )
  useHotkey(
    'Escape',
    () => {
      if (thread) {
        void navigate({ search: (prev) => ({ ...prev, thread: undefined }) })
      } else if (q) {
        setSearch('')
        void navigate({ search: (prev) => ({ ...prev, q: undefined }) })
      }
    },
    { enabled: !!thread || !!q }
  )
  const applySearch = (value: string) =>
    navigate({
      replace: true,
      search: (prev) => ({ ...prev, q: value || undefined, thread: undefined }),
    })
  const typedSearch = useDebouncedMemo(() => search.trim(), [search], 400)
  const onTyped = useEffectEvent((value: string) => {
    if (value !== (q ?? '')) {
      void applySearch(value)
    }
  })
  useEffect(() => onTyped(typedSearch), [typedSearch])
  useHotkey('Enter', () => applySearch(search.trim()), {
    ignoreInputs: false,
    target: searchRef,
  })
  useHotkey('Escape', () => searchRef.current?.blur(), {
    ignoreInputs: false,
    target: searchRef,
  })

  return (
    <ResizableGroup className="flex min-h-0 flex-1">
      <ResizablePanel className="flex min-w-0">
        <section
          aria-label={t.nav.mail}
          className="flex min-w-0 flex-1 flex-col border-r"
        >
          <div className="flex flex-col gap-2.5 border-b px-5 pt-4 pb-3">
            <InputGroup>
              <InputGroupAddon>
                <HugeiconsIcon icon={Search01Icon} strokeWidth={2} />
              </InputGroupAddon>
              <InputGroupInput
                ref={searchRef}
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder={t.mail.search}
                aria-label={t.mail.search}
              />
              <InputGroupAddon align="inline-end">
                <SearchHint isPending={isSearchPending} />
              </InputGroupAddon>
            </InputGroup>
            <div className="flex items-center gap-2">
              <FilterSelect
                filter={filter}
                unread={unread}
                onChange={showFilter}
              />
              {mailboxes.length > 1 && (
                <Select
                  items={[
                    { label: t.mail.allMailboxes, value: ALL_MAILBOXES },
                    ...mailboxes.map(({ email, id }) => ({
                      label: email,
                      value: id,
                    })),
                  ]}
                  value={mailbox ?? ALL_MAILBOXES}
                  onValueChange={(next) =>
                    navigate({
                      search: (prev) => ({
                        ...prev,
                        mailbox:
                          next && next !== ALL_MAILBOXES ? next : undefined,
                        thread: undefined,
                      }),
                    })
                  }
                >
                  <SelectTrigger
                    aria-label={t.mail.allMailboxes}
                    size="sm"
                    className="max-w-48"
                  >
                    <SelectValue data-mask={mailbox ? true : undefined} />
                  </SelectTrigger>
                  <SelectContent align="start">
                    <SelectItem value={ALL_MAILBOXES}>
                      {t.mail.allMailboxes}
                    </SelectItem>
                    {mailboxes.map(({ email, id }) => (
                      <SelectItem key={id} value={id}>
                        <span data-mask>{email}</span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
              {!isDrafts && <GroupingSelect grouping={grouping} />}
            </div>
          </div>
          {total === 0 && !isFetching && (
            <Empty size="sm">
              <EmptyHeader>
                <EmptyMedia variant="muted">
                  <HugeiconsIcon icon={Mail01Icon} />
                </EmptyMedia>
                <EmptyTitle>{t.mail.empty}</EmptyTitle>
                <EmptyDescription hidden={!ARRIVING.has(filter)}>
                  {t.mail.emptyHint}
                </EmptyDescription>
              </EmptyHeader>
            </Empty>
          )}
          <ul
            ref={listRef}
            className={cn(
              'overflow-y-auto',
              total > 0 && 'flex-1',
              isFetching && 'opacity-70'
            )}
          >
            {drafts.rows.map((saved, index) => (
              <DraftRow
                key={saved.id}
                draft={saved}
                isCursor={index === cursor}
                onOpen={() => open(index)}
                onDelete={() => drafts.remove(saved)}
              />
            ))}
            {rows.map((row, index) => (
              <Fragment key={row.message.id}>
                <GroupHeader
                  grouping={grouping}
                  group={groupStarts.get(index)}
                />
                <MailRow
                  row={row}
                  actions={actions}
                  canSnooze={canSnooze}
                  isCursor={index === cursor}
                  isOpen={row.message.threadId === thread}
                  isSnoozeOpen={snoozeOpenId === row.message.id}
                  onOpen={() => open(index)}
                  onSnoozeOpenChange={(isOpen) =>
                    setSnoozeOpenId(isOpen ? row.message.id : null)
                  }
                  sweep={sweep}
                />
              </Fragment>
            ))}
          </ul>
          {!thread && (
            <KeyHints
              hints={[
                ['J / K', t.keys.move],
                ['⏎', t.keys.open],
                ...hints,
                ['[ / ]', t.keys.filter],
                ['V', t.keys.group],
                ['/', t.keys.search],
                ['⌘K', t.keys.anything],
              ]}
            />
          )}
        </section>
      </ResizablePanel>
      <ResizableSeparator />
      <ResizablePanel
        className="flex"
        size={readerWidth}
        minSize={READER_WIDTH.min}
        maxSize={READER_WIDTH.max}
        onSizeChange={(width) => readerWidthStore.set(width)}
      >
        {thread ? (
          <div className="bg-background flex min-w-0 flex-1 flex-col">
            <ThreadView
              key={thread}
              isSnoozed={filter === 'snoozed'}
              threadId={thread}
              onDone={() =>
                navigate({ search: (prev) => ({ ...prev, thread: undefined }) })
              }
            />
            <KeyHints
              hints={[
                sweepHint,
                ...(hasAgent
                  ? [['R', t.keys.draftReply] as [string, string]]
                  : []),
                ['esc', t.keys.close],
                ['J / K', t.keys.move],
              ]}
            />
          </div>
        ) : (
          <div className="bg-background flex min-w-0 flex-1">
            <Empty>
              <EmptyDescription>{t.mail.noThread}</EmptyDescription>
            </Empty>
          </div>
        )}
      </ResizablePanel>
    </ResizableGroup>
  )
}

export const Route = createFileRoute('/_app/mail')({
  component: MailPage,
  validateSearch: type({
    'filter?':
      "'inbox' | 'important' | 'needs_reply' | 'quiet' | 'snoozed' | 'drafts' | 'archive' | 'spam' | 'trash'",
    'mailbox?': 'string.uuid',
    'q?': 'string',
    'thread?': 'string',
  }),
})
