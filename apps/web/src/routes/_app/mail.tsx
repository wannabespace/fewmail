import type { RouterOutputs } from '@fewmail/api/router'
import { BULK_THRESHOLD } from '@fewmail/shared/agent'
import { Button } from '@fewmail/ui/components/button'
import { CopyButton } from '@fewmail/ui/components/custom/copy-button'
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
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@fewmail/ui/components/popover'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@fewmail/ui/components/select'
import { Spinner } from '@fewmail/ui/components/spinner'
import { Tabs, TabsList, TabsTrigger } from '@fewmail/ui/components/tabs'
import { useDebouncedMemo } from '@fewmail/ui/hookas/use-debounced-memo'
import { copy } from '@fewmail/ui/lib/copy'
import { cn } from '@fewmail/ui/lib/utils'
import {
  Archive02Icon,
  ArrowDown01Icon,
  Clock01Icon,
  Delete02Icon,
  FileEditIcon,
  Flag02Icon,
  InboxIcon,
  Mail01Icon,
  MailReply01Icon,
  NotificationOff01Icon,
  Search01Icon,
  Shield01Icon,
  SpamIcon,
} from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import type { IconSvgElement } from '@hugeicons/react'
import { eq, useLiveQuery } from '@tanstack/react-db'
import { useHotkey } from '@tanstack/react-hotkeys'
import {
  keepPreviousData,
  skipToken,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { type } from 'arktype'
import { differenceInMinutes, isToday } from 'date-fns'
import { Fragment, useEffect, useEffectEvent, useRef, useState } from 'react'
import { useSubscription } from 'seitu/react'
import {
  createElementSize,
  createMediaQuery,
  createWebStorageValue,
} from 'seitu/web'

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
import { isReadingFirstTime, mailRowsOf, prefetchThread } from '~/lib/mail-db'
import type { MailRow as MailRowData } from '~/lib/mail-db'
import { useHasAgent } from '~/lib/me'
import { orpc } from '~/lib/orpc'

const INBOX_VIEWS = ['inbox', 'important', 'needs_reply', 'quiet'] as const

const FOLDERS = ['snoozed', 'drafts', 'archive', 'spam', 'trash'] as const

const FILTERS = [...INBOX_VIEWS, ...FOLDERS] as const

type Filter = (typeof FILTERS)[number]

const FILTER_ICONS: Record<Filter, IconSvgElement> = {
  archive: Archive02Icon,
  drafts: FileEditIcon,
  important: Flag02Icon,
  inbox: InboxIcon,
  needs_reply: MailReply01Icon,
  quiet: NotificationOff01Icon,
  snoozed: Clock01Icon,
  spam: SpamIcon,
  trash: Delete02Icon,
}

const ARRIVING = new Set<Filter>([
  'inbox',
  'important',
  'needs_reply',
  'quiet',
  'spam',
])

const MailListEmpty = ({
  filter,
  isSearch,
  mailboxes,
}: {
  filter: Filter
  isSearch: boolean
  mailboxes: { hasSynced: boolean }[]
}) => {
  const t = useT()
  const isFirstRead = mailboxes.length > 0 && isReadingFirstTime(mailboxes)
  if (isSearch) {
    return (
      <Empty size="sm">
        <EmptyHeader>
          <EmptyMedia variant="muted">
            <HugeiconsIcon icon={Search01Icon} />
          </EmptyMedia>
          <EmptyTitle>{t.mail.noResults}</EmptyTitle>
          <EmptyDescription>{t.mail.noResultsHint}</EmptyDescription>
        </EmptyHeader>
      </Empty>
    )
  }

  return (
    <Empty size="sm">
      <EmptyHeader>
        <EmptyMedia variant="muted">
          {isFirstRead ? <Spinner /> : <HugeiconsIcon icon={Mail01Icon} />}
        </EmptyMedia>
        <EmptyTitle>{isFirstRead ? t.nav.syncing : t.mail.empty}</EmptyTitle>
        <EmptyDescription hidden={isFirstRead || !ARRIVING.has(filter)}>
          {t.mail.emptyHint}
        </EmptyDescription>
      </EmptyHeader>
    </Empty>
  )
}

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

/** At most 60%: a wider reader squeezed the list into unreadable initials on a 1024px screen. */
const READER_WIDTH = { default: 640, max: '60%', min: 420 } as const
const READER_SHARE = 0.6

/** Too narrow for both panes: the reader folds away while no thread is open. */
const narrowScreen = createMediaQuery({ query: '(max-width: 1100px)' })

const readerWidthStore = createWebStorageValue({
  defaultValue: READER_WIDTH.default as number,
  key: 'fewmail.reader-width',
  schema: type('number'),
  type: 'localStorage',
})

const GROUPINGS = [
  'unread',
  'category',
  'sender',
  'importance',
  'none',
] as const

type Grouping = (typeof GROUPINGS)[number]

const groupingStore = createWebStorageValue({
  defaultValue: 'unread' as Grouping,
  key: 'fewmail.mail-grouping',
  schema: type("'none' | 'unread' | 'category' | 'sender' | 'importance'"),
  type: 'localStorage',
})

type ListedRow = Omit<MailRowData, 'key' | 'list'>

/** Threads opened from the Unread group stay in it until the list changes, so reading one never moves the rows under the cursor. */
type KeptUnread = ReadonlySet<string>

const groupKeyOf = (
  grouping: Grouping,
  { analysis, message }: ListedRow,
  keptUnread: KeptUnread
) => {
  if (grouping === 'unread') {
    return message.isUnread || keptUnread.has(message.threadId)
      ? 'unread'
      : 'read'
  }
  if (grouping === 'sender') {
    return message.fromEmail
  }
  if (grouping === 'importance') {
    return String(analysis?.importance ?? 0)
  }
  return analysis?.category ?? 'other'
}

const groupRows = <Row extends ListedRow>(
  rows: Row[],
  grouping: Grouping,
  keptUnread: KeptUnread
) => {
  if (grouping === 'none') {
    return []
  }
  const groups = [
    ...Map.groupBy(rows, (row) =>
      groupKeyOf(grouping, row, keptUnread)
    ).entries(),
  ]
  if (grouping === 'unread' && groups.length < 2) {
    return []
  }
  if (grouping === 'unread') {
    groups.sort(([a]) => (a === 'unread' ? -1 : 1))
  }
  if (grouping === 'importance') {
    groups.sort(([a], [b]) => Number(b) - Number(a))
  }
  return groups.map(([key, members]) => ({ key, rows: members }))
}

const BURST_MINUTES = 10

const ROW_ACTIONS =
  'absolute top-1.5 right-4 flex bg-inherit opacity-0 transition-opacity duration-150 ease-house group-hover:opacity-100 before:pointer-events-none before:absolute before:inset-y-0 before:right-full before:w-10 before:bg-inherit before:[mask-image:linear-gradient(to_right,transparent,black)]'

/** A sender's quick run of mail (a retried payment, a split notice) is one row, acted on as a whole, until opened. */
const collapseBursts = <Row extends ListedRow>(
  rows: Row[],
  expanded: ReadonlySet<string>
) => {
  const collapsed: (Row & { messageIds: string[] })[] = []
  let previous: Row | undefined
  for (const row of rows) {
    const head = collapsed.at(-1)
    if (
      head &&
      previous &&
      !expanded.has(head.message.id) &&
      previous.message.fromEmail === row.message.fromEmail &&
      differenceInMinutes(previous.message.receivedAt, row.message.receivedAt) <
        BURST_MINUTES
    ) {
      head.messageIds.push(row.message.id)
      head.message.isUnread ||= row.message.isUnread
    } else {
      collapsed.push({
        ...row,
        message: { ...row.message },
        messageIds: [row.message.id],
      })
    }
    previous = row
  }
  return collapsed
}

const onEach =
  (messageIds: string[], mutate: (input: { messageId: string }) => void) =>
  () => {
    for (const messageId of messageIds) {
      mutate({ messageId })
    }
  }

const useGroupedRows = <Row extends ListedRow>(
  listedRows: Row[],
  grouping: Grouping,
  keptUnread: KeptUnread
) => {
  const groups = groupRows(listedRows, grouping, keptUnread)
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
    unread: () => (groupKey === 'unread' ? t.mail.unread : t.mail.group.read),
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

const UnreadCount = ({
  filter,
  unread,
}: {
  filter: Filter
  unread: RouterOutputs['mail']['unread'] | undefined
}) =>
  isCounted(filter) &&
  Boolean(unread?.[filter]) && (
    <span className="text-muted-foreground text-xs tabular-nums">
      {unread?.[filter]}
    </span>
  )

const VIEW_CHOICE =
  'focus-visible:focus-ring cursor-pointer rounded-lg ring transition-[box-shadow,background-color] outline-none hover:bg-accent'

const viewChoiceOf = (isActive: boolean) =>
  cn(VIEW_CHOICE, isActive ? 'ring-primary ring-2' : 'ring-foreground/6')

const ViewPicker = ({
  filter,
  grouping,
  onChange,
  unread,
}: {
  filter: Filter
  grouping: Grouping
  onChange: (filter: Filter) => void
  unread: RouterOutputs['mail']['unread'] | undefined
}) => {
  const t = useT()
  const [isOpen, setIsOpen] = useState(false)
  const pick = (next: Filter) => {
    setIsOpen(false)
    onChange(next)
  }
  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger render={<Button variant="outline" size="sm" />}>
        <HugeiconsIcon icon={FILTER_ICONS[filter]} strokeWidth={2} />
        {t.mail.filter[filter]}
        <UnreadCount filter={filter} unread={unread} />
        <HugeiconsIcon
          icon={ArrowDown01Icon}
          strokeWidth={2}
          className="text-muted-foreground"
        />
      </PopoverTrigger>
      <PopoverContent align="start" className="w-112">
        <div className="grid grid-cols-2 gap-2">
          {INBOX_VIEWS.map((value) => (
            <button
              key={value}
              type="button"
              aria-current={value === filter || undefined}
              onClick={() => pick(value)}
              className={cn(
                viewChoiceOf(value === filter),
                'flex flex-col gap-1.5 p-3 text-left'
              )}
            >
              <span className="flex items-center gap-2 font-medium">
                <HugeiconsIcon
                  icon={FILTER_ICONS[value]}
                  strokeWidth={2}
                  className="text-muted-foreground size-4"
                />
                {t.mail.filter[value]}
                <span className="ml-auto">
                  <UnreadCount filter={value} unread={unread} />
                </span>
              </span>
              <span className="text-muted-foreground line-clamp-2 text-xs">
                {t.mail.filterAbout[value]}
              </span>
            </button>
          ))}
        </div>
        <div className="grid grid-cols-5 gap-2">
          {FOLDERS.map((value) => (
            <button
              key={value}
              type="button"
              aria-current={value === filter || undefined}
              onClick={() => pick(value)}
              className={cn(
                viewChoiceOf(value === filter),
                'flex min-w-0 flex-col items-center gap-1 px-1 py-2.5 text-xs'
              )}
            >
              <HugeiconsIcon
                icon={FILTER_ICONS[value]}
                strokeWidth={2}
                className="text-muted-foreground size-5"
              />
              <span className="max-w-full truncate">
                {t.mail.filter[value]}
              </span>
            </button>
          ))}
        </div>
        {filter !== 'drafts' && (
          <div className="flex flex-col gap-2">
            <span className="text-muted-foreground text-xs font-medium">
              {t.mail.group.title}
            </span>
            <Tabs
              value={grouping}
              onValueChange={(next: Grouping) => groupingStore.set(next)}
            >
              <TabsList variant="pill">
                {GROUPINGS.map((value) => (
                  <TabsTrigger key={value} value={value}>
                    {t.mail.group[value]}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
          </div>
        )}
      </PopoverContent>
    </Popover>
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
  messageIds,
  onSnoozeOpenChange,
  sweep,
}: {
  actions: ReturnType<typeof useMailActions>
  canSnooze: boolean
  isSnoozeOpen: boolean
  messageIds: string[]
  onSnoozeOpenChange: (open: boolean) => void
  sweep: Sweep
}) => {
  const t = useT()
  return (
    <span
      className={cn(
        ROW_ACTIONS,
        'has-data-popup-open:opacity-100',
        isSnoozeOpen && 'opacity-100'
      )}
    >
      <IconButton
        icon={sweep.icon}
        label={sweep.label}
        size="icon-sm"
        variant="ghost-muted"
        onClick={onEach(messageIds, sweep.action.mutate)}
      />
      {canSnooze && (
        <DropdownMenu open={isSnoozeOpen} onOpenChange={onSnoozeOpenChange}>
          <DropdownMenuTrigger
            render={
              <IconButton
                icon={Clock01Icon}
                label={t.snooze.title}
                size="icon-sm"
                variant="ghost-muted"
              />
            }
          />
          <DropdownMenuContent align="end">
            <SnoozeMenuItems
              onSnooze={(until) =>
                onEach(messageIds, ({ messageId }) =>
                  actions.snooze.mutate({ messageId, until })
                )()
              }
            />
          </DropdownMenuContent>
        </DropdownMenu>
      )}
      <IconButton
        icon={Delete02Icon}
        label={t.mail.trash}
        size="icon-sm"
        variant="ghost-destructive"
        onClick={onEach(messageIds, actions.trash.mutate)}
      />
    </span>
  )
}

/** Like iOS's verification codes: copied without opening the email, then the email goes away in the same click. */
const MailRowCode = ({
  actions,
  code,
  messageIds,
  sweep,
}: {
  actions: ReturnType<typeof useMailActions>
  code: string | null
  messageIds: string[]
  sweep: Sweep
}) => {
  const t = useT()
  if (!code) {
    return null
  }
  const copyThen = (mutate: (input: { messageId: string }) => void) => () => {
    void copy(code)
    onEach(messageIds, mutate)()
  }
  return (
    <span className="absolute top-12.5 right-4 flex items-center gap-0.5 bg-inherit">
      <span className="flex bg-inherit opacity-0 group-hover:opacity-100 has-focus-visible:opacity-100">
        {sweep.action === actions.archive && (
          <IconButton
            icon={sweep.icon}
            label={t.mail.oneTimeCode.archive}
            size="icon-xs"
            variant="ghost-muted"
            onClick={copyThen(actions.archive.mutate)}
          />
        )}
        <IconButton
          icon={Delete02Icon}
          label={t.mail.oneTimeCode.trash}
          size="icon-xs"
          variant="ghost-destructive"
          onClick={copyThen(actions.trash.mutate)}
        />
      </span>
      <CopyButton
        text={code}
        size="xs"
        variant="outline"
        aria-label={t.mail.oneTimeCode.copy}
      >
        <span data-mask className="font-mono tracking-wider tabular-nums">
          {code}
        </span>
      </CopyButton>
    </span>
  )
}

const rowSurfaceOf = ({
  isActive,
  isOpen,
  isUnread,
}: {
  isActive: boolean
  isOpen: boolean
  isUnread: boolean
}) =>
  cn(
    'group relative border-b',
    isUnread && 'bg-background',
    isActive ? 'bg-accent' : 'hover:bg-accent',
    isOpen && 'bg-secondary hover:bg-secondary'
  )

const useCursorOnOpenThread = ({
  rows,
  setCursor,
  thread,
}: {
  rows: { message: { threadId: string } }[]
  setCursor: (index: number) => void
  thread: string | undefined
}) => {
  const openIndex = rows.findIndex((row) => row.message.threadId === thread)
  const [followedKey, setFollowedKey] = useState('')
  if (openIndex !== -1 && followedKey !== `${thread}:${openIndex}`) {
    setFollowedKey(`${thread}:${openIndex}`)
    setCursor(openIndex)
  }
}

const MailRow = ({
  actions,
  canSnooze,
  isCursor,
  isOpen,
  isSnoozeOpen,
  onOpen,
  onSnoozeOpenChange,
  row: { analysis, message, messageIds, threadSize },
  sweep,
}: {
  actions: ReturnType<typeof useMailActions>
  canSnooze: boolean
  isCursor: boolean
  isOpen: boolean
  isSnoozeOpen: boolean
  onOpen: () => void
  onSnoozeOpenChange: (open: boolean) => void
  row: ListedRow & { messageIds: string[] }
  sweep: Sweep
}) => {
  const t = useT()
  const dates = useDates()
  const codeRoom = message.code ? 'pr-28' : undefined

  return (
    <li
      data-row
      className={rowSurfaceOf({
        isActive: isCursor || isSnoozeOpen,
        isOpen,
        isUnread: message.isUnread,
      })}
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
          {messageIds.length > 1 && (
            <span className="text-muted-foreground shrink-0 text-xs">
              {t.cleanup.emails(messageIds.length)}
            </span>
          )}
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
            codeRoom,
            message.isUnread
              ? 'text-foreground/90 font-medium'
              : 'text-foreground/60'
          )}
        >
          {message.subject}
        </span>
        <span
          data-mask
          className={cn(
            'text-muted-foreground/80 truncate pl-4 text-xs',
            codeRoom
          )}
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
        messageIds={messageIds}
        onSnoozeOpenChange={onSnoozeOpenChange}
        sweep={sweep}
      />
      <MailRowCode
        actions={actions}
        code={message.code}
        messageIds={messageIds}
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
      <span className={ROW_ACTIONS}>
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
      placeholderData: keepPreviousData,
    })
  )
  const refetchDrafts = () =>
    queryClient.invalidateQueries({ queryKey: orpc.mail.drafts.key() })
  const leave = {
    onMutate: ({ id }: { id: string }) =>
      queryClient.setQueriesData<DraftRowData[]>(
        { queryKey: orpc.mail.drafts.key() },
        (old) => old?.filter((draft) => draft.id !== id)
      ),
    onSettled: refetchDrafts,
  }
  const deleteDraft = useMutation(orpc.mail.deleteDraft.mutationOptions(leave))
  const takeBackFailed = useMutation(
    orpc.mail.cancelSend.mutationOptions(leave)
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
  expanded,
  filter,
  mailbox,
  q,
  typed,
}: {
  expanded: ReadonlySet<string>
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
    isDrafts
      ? undefined
      : query
          .from({ row: mailRowsOf(mailbox) })
          .where(({ row }) => eq(row.list, filter))
          .orderBy(({ row }) => row.message.receivedAt, 'desc')
  )
  const drafts = useDrafts({ isEnabled: isDrafts, mailbox, q })
  const needle = typed.toLowerCase()
  const rows = collapseBursts(
    (q === typed ? found.data : undefined) ??
      (typed
        ? listed.data?.filter(({ message }) =>
            [
              message.subject,
              message.fromName,
              message.fromEmail,
              message.snippet,
            ]
              .join(' ')
              .toLowerCase()
              .includes(needle)
          )
        : listed.data) ??
      [],
    expanded
  )
  const isSearchPending = typed !== (q ?? '') || (!!q && found.isFetching)
  return {
    isSearchPending,
    drafts,
    isDrafts,
    isFetching: isDrafts
      ? drafts.isFetching
      : listed.isLoading || isSearchPending,
    rows,
    total: isDrafts ? drafts.rows.length : rows.length,
  }
}

const useListActions = ({
  filter,
  isEnabled,
  row,
}: {
  filter: Filter
  isEnabled: boolean
  row: { message: { code: string | null }; messageIds: string[] } | undefined
}) => {
  const messageIds = row?.messageIds ?? []
  const code = row?.message.code
  const t = useT()
  const actions = useMailActions()
  const [snoozeOpenId, setSnoozeOpenId] = useState<string | null>(null)
  const canSnooze = filter !== 'snoozed'
  const sweep = sweepOf(actions, t, OUT_OF_INBOX[filter] ?? 'inbox')
  const [head] = messageIds
  const keys = { enabled: isEnabled && !!head }
  useHotkey('E', onEach(messageIds, sweep.action.mutate), keys)
  useHotkey('H', () => head && setSnoozeOpenId(head), {
    enabled: keys.enabled && canSnooze,
  })
  useHotkey('Shift+3', onEach(messageIds, actions.trash.mutate), keys)
  useHotkey('Shift+1', onEach(messageIds, actions.reportSpam.mutate), keys)
  useHotkey('Y', () => code && copy(code, t.mail.oneTimeCode.copied), {
    enabled: keys.enabled && !!code,
  })
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
          ...(code ? [['Y', t.keys.copyCode] as [string, string]] : []),
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
  const isNarrow = useSubscription(narrowScreen)
  const rememberedWidth = useSubscription(readerWidthStore)
  const [panes, setPanes] = useState<HTMLElement | null>(null)
  const { width: panesWidth } = useSubscription(
    () => createElementSize({ element: panes }),
    { deps: [panes] }
  )
  // `maxSize` bounds only a drag; the remembered width is applied as is, so a smaller window clamps it here.
  const readerWidth =
    panesWidth > 0
      ? Math.min(
          rememberedWidth,
          Math.max(READER_WIDTH.min, Math.round(panesWidth * READER_SHARE))
        )
      : rememberedWidth
  const grouping = useSubscription(groupingStore)
  const hasAgent = useHasAgent()
  const { filter = 'inbox', mailbox, q, thread } = Route.useSearch()
  const navigate = useNavigate({ from: Route.fullPath })
  const searchRef = useRef<HTMLInputElement>(null)
  const listRef = useRef<HTMLUListElement>(null)
  const [search, setSearch] = useState(q ?? '')
  const [cursor, setCursor] = useState(0)
  const [expandedBursts, setExpandedBursts] = useState<ReadonlySet<string>>(
    new Set()
  )
  const [keptUnread, setKeptUnread] = useState<KeptUnread>(new Set())
  const listKey = `${filter}:${mailbox ?? ''}:${q ?? ''}`
  const [cursorListKey, setCursorListKey] = useState(listKey)
  if (cursorListKey !== listKey) {
    setCursorListKey(listKey)
    setCursor(0)
    setKeptUnread(new Set())
  }

  const { data: mailboxes = [] } = useQuery(orpc.mailboxes.list.queryOptions())
  const { data: unread } = useQuery(
    orpc.mail.unread.queryOptions({
      input: { mailboxId: mailbox },
      placeholderData: keepPreviousData,
    })
  )
  const {
    drafts,
    isDrafts,
    isFetching,
    isSearchPending,
    rows: listedRows,
    total,
  } = useListRows({
    expanded: expandedBursts,
    filter,
    mailbox,
    q,
    typed: search.trim(),
  })
  const { groupStarts, rows } = useGroupedRows(listedRows, grouping, keptUnread)
  useCursorOnOpenThread({ rows, setCursor, thread })

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
    row: rows[cursor],
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

  const expandBurst = (index: number) => {
    const row = rows[index]
    if (row && row.messageIds.length > 1) {
      setExpandedBursts((expanded) => new Set(expanded).add(row.message.id))
    }
  }

  const open = (index: number) => {
    if (isDrafts) {
      setCursor(index)
      drafts.open(index)
      return
    }
    const row = rows[index]
    if (row) {
      setCursor(index)
      expandBurst(index)
      if (row.message.isUnread) {
        setKeptUnread((kept) => new Set(kept).add(row.message.threadId))
      }
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
  useHotkey('ArrowRight', () => expandBurst(cursor))
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
  const closeThread = () =>
    navigate({ search: (prev) => ({ ...prev, thread: undefined }) })
  useHotkey(
    'Escape',
    () => {
      if (thread) {
        void closeThread()
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
    <ResizableGroup ref={setPanes} className="flex min-h-0 flex-1">
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
              <ViewPicker
                filter={filter}
                grouping={grouping}
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
            </div>
          </div>
          {total === 0 && !isFetching && (
            <MailListEmpty
              filter={filter}
              isSearch={!!q}
              mailboxes={mailboxes}
            />
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
              ]}
            />
          )}
        </section>
      </ResizablePanel>
      <ResizableSeparator />
      <ResizablePanel
        className="flex"
        collapsed={isNarrow && !thread}
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
              onClose={closeThread}
              onDone={closeThread}
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
