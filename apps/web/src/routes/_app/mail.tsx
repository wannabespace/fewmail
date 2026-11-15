import type { RouterOutputs } from '@fewmail/api/router'
import {
  ANALYZE_WINDOW_DAYS,
  isBulk,
  isAutomatedSender,
} from '@fewmail/shared/agent'
import type { MailCategory } from '@fewmail/shared/agent'
import type { Participant } from '@fewmail/shared/email'
import { Badge } from '@fewmail/ui/components/badge'
import { Button } from '@fewmail/ui/components/button'
import { Checkbox } from '@fewmail/ui/components/checkbox'
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
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@fewmail/ui/components/tooltip'
import { useDebouncedMemo } from '@fewmail/ui/hookas/use-debounced-memo'
import { copy } from '@fewmail/ui/lib/copy'
import { cn } from '@fewmail/ui/lib/utils'
import {
  Archive02Icon,
  ArrowDown01Icon,
  Attachment01Icon,
  ArrowLeft01Icon,
  Clock01Icon,
  DashboardSquare01Icon,
  Delete02Icon,
  FileEditIcon,
  FlashIcon,
  InboxIcon,
  InboxUnreadIcon,
  Mail01Icon,
  MailOpenIcon,
  PinIcon,
  PinOffIcon,
  Search01Icon,
  Shield01Icon,
  SpamIcon,
} from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import type { IconSvgElement } from '@hugeicons/react'
import { inArray, useLiveQuery } from '@tanstack/react-db'
import { useHotkey } from '@tanstack/react-hotkeys'
import {
  keepPreviousData,
  skipToken,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { defaultRangeExtractor, useVirtualizer } from '@tanstack/react-virtual'
import type { VirtualItem } from '@tanstack/react-virtual'
import { type } from 'arktype'
import { isToday, subDays } from 'date-fns'
import {
  AnimatePresence,
  MotionConfig,
  motion,
  useIsPresent,
  useReducedMotion,
} from 'motion/react'
import {
  createContext,
  startTransition,
  use,
  useEffect,
  useEffectEvent,
  useRef,
  useState,
} from 'react'
import type { ComponentProps, CSSProperties, ReactNode, RefObject } from 'react'
import { useSubscription } from 'seitu/react'
import { createElementSize, createWebStorageValue } from 'seitu/web'

import { useCompose } from '~/components/compose/compose-context'
import { KeyHints } from '~/components/key-hints'
import { SleepingLogoMark } from '~/components/logo'
import { ExtractedChips } from '~/components/mail-meta'
import { MailSearchStart, rememberSearch } from '~/components/mail-search'
import {
  ParticipantAvatars,
  participantNamesOf,
  SenderAvatar,
} from '~/components/sender-avatar'
import {
  CodeActions,
  MailRowActions,
  onEach,
  pinEach,
  ROW_ACTIONS,
  UNDER_ROW_ACTIONS,
  SnoozeMenuItems,
  sweepOf,
  ThreadView,
  useMailActions,
} from '~/components/thread-view'
import type { Place, Sweep } from '~/components/thread-view'
import { useDates, useLocale, useT } from '~/lib/i18n'
import {
  hasOlderRows,
  isReadingFirstTime,
  loadOlderRows,
  mailRowsOf,
  prefetchThread,
  warmThread,
} from '~/lib/mail-db'
import type { MailList, MailRow as MailRowData } from '~/lib/mail-db'
import { useHasAgent } from '~/lib/me'
import { orpc } from '~/lib/orpc'
import { posthog } from '~/lib/posthog'
import { STILL_POINTER_GUARD } from '~/lib/still-pointer'
import { pendingToast, settleToast, toastDeferred } from '~/lib/undo'

const INBOX_VIEWS = ['focused', 'unread', 'categories', 'inbox'] as const

type InboxView = (typeof INBOX_VIEWS)[number]

const FOLDERS = ['snoozed', 'drafts', 'archive', 'spam', 'trash'] as const

const FILTERS = [...INBOX_VIEWS, ...FOLDERS] as const

type Filter = (typeof FILTERS)[number]

const isInboxView = (filter: Filter): filter is InboxView =>
  (INBOX_VIEWS as readonly Filter[]).includes(filter)

const FILTER_ICONS: Record<Filter, IconSvgElement> = {
  archive: Archive02Icon,
  categories: DashboardSquare01Icon,
  drafts: FileEditIcon,
  focused: FlashIcon,
  inbox: InboxIcon,
  snoozed: Clock01Icon,
  spam: SpamIcon,
  trash: Delete02Icon,
  unread: InboxUnreadIcon,
}

/** Unread also lists the inbox's read mail, under Read, and reaches unread threads older than the inbox's newest page. */
const LISTS_OF: Record<Exclude<Filter, 'drafts'>, MailList[]> = {
  archive: ['archive'],
  categories: ['inbox'],
  focused: ['inbox'],
  inbox: ['inbox'],
  snoozed: ['snoozed'],
  spam: ['spam'],
  trash: ['trash'],
  unread: ['unread', 'inbox'],
}

const inboxViewStore = createWebStorageValue({
  defaultValue: 'focused' as InboxView,
  key: 'fewmail.inbox-view',
  schema: type("'focused' | 'unread' | 'categories' | 'inbox'"),
  type: 'localStorage',
})

const ARRIVING = new Set<Filter>([...INBOX_VIEWS, 'spam'])

const MailListEmpty = ({
  filter,
  hasOlder,
  isPending,
  isSearch,
  mailboxes,
}: {
  filter: Filter
  hasOlder: boolean
  isPending: boolean
  isSearch: boolean
  mailboxes: { hasSynced: boolean }[]
}) => {
  const t = useT()
  const isFirstRead = mailboxes.length > 0 && isReadingFirstTime(mailboxes)
  // Nothing held is not an empty list: the loader below is reading older mail from Gmail.
  if (hasOlder && !isSearch) {
    return null
  }
  if (isSearch && isPending) {
    return (
      <Empty size="sm">
        <EmptyHeader>
          <EmptyMedia variant="muted">
            <Spinner />
          </EmptyMedia>
          <EmptyTitle>{t.mail.find.searching}</EmptyTitle>
        </EmptyHeader>
      </Empty>
    )
  }
  if (isPending) {
    return <Empty />
  }
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
        {isFirstRead ? (
          <EmptyMedia variant="muted">
            <Spinner />
          </EmptyMedia>
        ) : (
          <EmptyMedia>
            <SleepingLogoMark className="text-muted-foreground/50 size-16" />
          </EmptyMedia>
        )}
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

/** Threads read ahead of the click; the cursor's neighbours and a hovered row are added as they come. */
const PREFETCHED_ROWS = 10

/** At most 60%: a wider reader squeezed the list into unreadable initials on a 1024px screen. */
const READER_WIDTH = { default: 640, max: '60%', min: 420 } as const
const READER_SHARE = 0.6

const readerWidthStore = createWebStorageValue({
  defaultValue: READER_WIDTH.default as number,
  key: 'fewmail.reader-width',
  schema: type('number'),
  type: 'localStorage',
})

type Grouping = 'focused' | 'unread' | 'categories' | 'none'

const groupingOf = (filter: Filter): Grouping =>
  filter === 'focused' || filter === 'unread' || filter === 'categories'
    ? filter
    : 'none'

const GROUPS = [
  'important',
  'people',
  'plans',
  'money',
  'updates',
  'newsletters',
  'promotions',
  'earlier',
  'read',
] as const

/** Mail that needs the user leads; `other` also holds mail never analysed. */
const CATEGORY_GROUPS = [
  'security',
  'person',
  'work',
  'finance',
  'receipt',
  'calendar',
  'travel',
  'notification',
  'newsletter',
  'promotion',
  'other',
] as const satisfies readonly MailCategory[]

type GroupKey = (typeof GROUPS)[number] | MailCategory

const GROUP_OF: Record<MailCategory, GroupKey> = {
  calendar: 'plans',
  finance: 'money',
  newsletter: 'newsletters',
  notification: 'updates',
  other: 'updates',
  person: 'people',
  promotion: 'promotions',
  receipt: 'money',
  security: 'updates',
  travel: 'plans',
  work: 'people',
}

/** Groups show their newest few rows until asked, so no group pushes the next one away. */
const GROUP_SHOWN = 5

type ListedRow = Omit<MailRowData, 'key' | 'list'>

/** Threads opened from an unread group stay in it until the list changes, so reading one never moves the rows under the cursor. */
type KeptUnread = ReadonlySet<string>

const groupKeyOf = (
  grouping: Grouping,
  { analysis, message }: ListedRow,
  keptUnread: KeptUnread
): GroupKey => {
  if (grouping === 'categories') {
    return message.risk ? 'security' : (analysis?.category ?? 'other')
  }
  if (
    grouping === 'unread' &&
    !message.isUnread &&
    !keptUnread.has(message.threadId)
  ) {
    return 'read'
  }
  if (message.risk || (analysis && analysis.importance >= 2)) {
    return 'important'
  }
  // Mail on its way to analysis stays with people's, never folded out of sight; older mail is never analysed.
  if (
    !analysis &&
    message.receivedAt <= subDays(new Date(), ANALYZE_WINDOW_DAYS)
  ) {
    return 'earlier'
  }
  const group = analysis ? GROUP_OF[analysis.category] : 'people'
  // Mail analysed before senders were checked may still call a service a person.
  return group === 'people' && isAutomatedSender(message.fromEmail)
    ? 'updates'
    : group
}

const groupRows = <Row extends ListedRow>(
  rows: Row[],
  grouping: Grouping,
  keptUnread: KeptUnread,
  unfolded: ReadonlySet<GroupKey>
) => {
  if (grouping === 'none') {
    return []
  }
  const byKey = Map.groupBy(rows, (row) =>
    groupKeyOf(grouping, row, keptUnread)
  )
  const order: readonly GroupKey[] =
    grouping === 'categories' ? CATEGORY_GROUPS : GROUPS
  const keys = order.filter((key) => byKey.has(key))
  // The last group never folds: the list pages on as it scrolls, and a folded last group ended it at Show all.
  return keys.map((key) => {
    const members = byKey.get(key) ?? []
    return {
      key,
      rows:
        unfolded.has(key) || key === keys.at(-1)
          ? members
          : members.slice(0, GROUP_SHOWN),
      total: members.length,
    }
  })
}

type ListedMessage = ListedRow['message']

const pinHint = (
  t: ReturnType<typeof useT>,
  isPinned: boolean
): [string, string] => ['S', isPinned ? t.keys.unpin : t.keys.pin]

const usePinnedRows = <Row extends ListedRow>(
  pinned: ListedRow[],
  listedRows: Row[]
) => {
  const [isExpanded, setIsExpanded] = useState(false)
  const shown = isExpanded ? pinned : pinned.slice(0, PINNED_SHOWN)
  return {
    isExpanded,
    rows: [...shown, ...listedRows],
    shown: shown.length,
    toggle: () => setIsExpanded((expanded) => !expanded),
  }
}

const useGroupedRows = <Row extends ListedRow>(
  listedRows: Row[],
  grouping: Grouping,
  keptUnread: KeptUnread,
  unfolded: ReadonlySet<GroupKey>
) => {
  const groups = groupRows(listedRows, grouping, keptUnread, unfolded)
  if (groups.length === 0) {
    return {
      groupStarts: new Map<string, (typeof groups)[number]>(),
      rows: listedRows,
    }
  }
  const groupStarts = new Map(
    groups.flatMap((group) =>
      group.rows[0] ? [[group.rows[0].message.id, group] as const] : []
    )
  )
  return { groupStarts, rows: groups.flatMap((group) => group.rows) }
}

/** Each row's card: the pins, then each group's rows, or the rest of the list when it has no groups. */
const cardsOf = (
  rows: { message: { id: string } }[],
  groupStarts: ReadonlyMap<string, { key: string }>,
  pinnedCount: number
) => {
  const cards: string[] = []
  for (const [index, { message }] of rows.entries()) {
    const group = groupStarts.get(message.id)
    const previous = cards.at(-1)
    if (index < pinnedCount) {
      cards.push('pinned')
    } else if (group) {
      cards.push(`group:${group.key}`)
    } else {
      cards.push(!previous || previous === 'pinned' ? 'list' : previous)
    }
  }
  return cards
}

// Not sticky: pins share the list's <ul>, so a sticky pinned header would ride over every row below it.
const LIST_HEADER =
  'bg-body text-muted-foreground flex h-13 items-center gap-2 pt-5 pr-1 pb-2 pl-9 text-xs font-medium'

const GROUP_HEADER = cn(LIST_HEADER, 'sticky top-0 z-10')

/** Pins sit above the list in one line each, and only the first few until asked, so they never push the inbox away. */
const PINNED_SHOWN = 3

const GroupHeader = ({
  group,
  isPicking,
  isUnfolded,
  item,
  onMarkRead,
  onPick,
  onToggle,
  pickedIds,
}: {
  group: ReturnType<typeof groupRows>[number]
  isPicking: boolean
  isUnfolded: boolean
  item: VirtualItem
  onMarkRead: (() => void) | undefined
  onPick: () => void
  onToggle: () => void
  pickedIds: ReadonlySet<string>
}) => {
  const t = useT()
  const pickedCount = group.rows.filter(({ message }) =>
    pickedIds.has(message.id)
  ).length
  return (
    <ListRow item={item} className={cn(GROUP_HEADER, 'group')}>
      <RowPick
        aria-label={t.keys.pickAll}
        checked={pickedCount === group.rows.length}
        className="bottom-2 h-6 items-center"
        indeterminate={pickedCount > 0 && pickedCount < group.rows.length}
        isPicking={isPicking}
        onCheckedChange={onPick}
      />
      <span className="truncate">
        {{ ...t.category, ...t.mail.group }[group.key]}
      </span>
      <span className="tabular-nums opacity-60">{group.total}</span>
      <span className="ml-auto" />
      {onMarkRead && (
        <Button size="xs" variant="link-muted" onClick={onMarkRead}>
          <HugeiconsIcon
            icon={MailOpenIcon}
            strokeWidth={2}
            data-icon="inline-start"
          />
          {t.mail.markShownRead(unreadOf(group.rows).length)}
        </Button>
      )}
      {(group.rows.length < group.total || isUnfolded) && (
        <Button size="xs" variant="link-muted" onClick={onToggle}>
          {isUnfolded ? t.mail.showFewer : t.mail.showAll(group.total)}
        </Button>
      )}
    </ListRow>
  )
}

const UnreadCount = ({
  filter,
  unread,
}: {
  filter: Filter
  unread: RouterOutputs['mail']['unread'] | undefined
}) =>
  isInboxView(filter) &&
  Boolean(unread?.inbox) && (
    <span className="text-muted-foreground text-xs tabular-nums">
      {unread?.inbox}
    </span>
  )

/** The inbox as Gmail counts it: Fewmail holds only recent mail and reads the rest as the list scrolls. */
const InGmailCount = ({
  filter,
  mailbox,
}: {
  filter: Filter
  mailbox: string | undefined
}) => {
  const t = useT()
  const locale = useLocale()
  const { data: total } = useQuery(
    orpc.mail.inGmail.queryOptions({
      input: isInboxView(filter) ? { mailboxId: mailbox } : skipToken,
      placeholderData: keepPreviousData,
    })
  )
  return (
    isInboxView(filter) &&
    total !== undefined && (
      <span className="text-muted-foreground text-xs tabular-nums">
        {t.mail.inGmail(total.toLocaleString(locale))}
      </span>
    )
  )
}

type SketchLine = 'group' | 'unread' | 'read' | 'urgent' | 'quiet'

const VIEW_SKETCHES: Record<InboxView, SketchLine[]> = {
  categories: ['group', 'urgent', 'group', 'unread', 'group', 'read', 'group'],
  focused: ['group', 'urgent', 'unread', 'group', 'quiet', 'quiet'],
  inbox: ['unread', 'read', 'unread', 'read', 'read'],
  unread: ['group', 'unread', 'unread', 'group', 'unread', 'group', 'read'],
}

const SKETCH_MARKS: Record<Exclude<SketchLine, 'group'>, string> = {
  quiet: 'bg-foreground/20',
  read: '',
  unread: 'bg-primary',
  urgent: 'bg-destructive',
}

const ViewSketch = ({ lines }: { lines: SketchLine[] }) => (
  <span className="bg-body flex h-20 overflow-hidden rounded-md px-3 pt-3">
    <span className="bg-popover ring-foreground/6 flex flex-1 flex-col gap-1.5 rounded-t-md p-2 shadow-xs ring">
      {lines.map((line, index) =>
        line === 'group' ? (
          // oxlint-disable-next-line react/no-array-index-key -- a fixed sketch, never reordered
          <span
            key={index}
            className="bg-foreground/30 h-1 w-8 shrink-0 rounded-full"
          />
        ) : (
          // oxlint-disable-next-line react/no-array-index-key -- a fixed sketch, never reordered
          <span key={index} className="flex items-center gap-1.5">
            <span className={cn('size-1.5 rounded-full', SKETCH_MARKS[line])} />
            <span
              className={cn(
                'flex flex-1 flex-col gap-0.5',
                line === 'quiet' && 'opacity-50'
              )}
            >
              <span className="bg-foreground/25 h-1 w-3/4 rounded-full" />
              <span className="bg-foreground/10 h-1 w-1/2 rounded-full" />
            </span>
          </span>
        )
      )}
    </span>
  </span>
)

const ViewPicker = ({
  filter,
  onChange,
  unread,
}: {
  filter: Filter
  onChange: (filter: Filter) => void
  unread: RouterOutputs['mail']['unread'] | undefined
}) => {
  const t = useT()
  const [isOpen, setIsOpen] = useState(false)
  const active = useRef<HTMLButtonElement>(null)
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
      {/* Focus lands on the picked view: a focus ring on the first card read as a second pick. */}
      <PopoverContent align="start" className="w-160" initialFocus={active}>
        <div className="grid grid-cols-4 gap-2">
          {INBOX_VIEWS.map((value) => (
            <button
              key={value}
              ref={value === filter ? active : undefined}
              type="button"
              aria-current={value === filter || undefined}
              onClick={() => pick(value)}
              className={cn(
                'focus-visible:focus-ring hover:bg-accent flex cursor-pointer flex-col gap-2 rounded-lg p-2 text-left ring transition-[box-shadow,background-color] outline-none',
                value === filter ? 'ring-primary ring-2' : 'ring-foreground/6'
              )}
            >
              <ViewSketch lines={VIEW_SKETCHES[value]} />
              <span className="flex flex-col gap-0.5 px-1 pb-0.5">
                <span className="font-medium">{t.mail.filter[value]}</span>
                <span className="text-muted-foreground text-xs">
                  {t.mail.filterAbout[value]}
                </span>
              </span>
            </button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  )
}

const MailboxSelect = ({
  mailbox,
  mailboxes,
  onChange,
}: {
  mailbox: string | undefined
  mailboxes: { email: string; id: string }[]
  onChange: (mailbox: string | undefined) => void
}) => {
  const t = useT()
  if (mailboxes.length < 2) {
    return null
  }
  return (
    <Select
      items={[
        { label: t.mail.allMailboxes, value: ALL_MAILBOXES },
        ...mailboxes.map(({ email, id }) => ({ label: email, value: id })),
      ]}
      value={mailbox ?? ALL_MAILBOXES}
      onValueChange={(next) =>
        onChange(next && next !== ALL_MAILBOXES ? next : undefined)
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
        <SelectItem value={ALL_MAILBOXES}>{t.mail.allMailboxes}</SelectItem>
        {mailboxes.map(({ email, id }) => (
          <SelectItem key={id} value={id}>
            <span data-mask>{email}</span>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}

const MailRowMeta = ({
  hidesCategory,
  insight,
  message,
}: {
  hidesCategory: boolean
  insight: MailRowData['analysis']
  message: MailRowData['message']
}) => {
  const t = useT()
  const category = hidesCategory ? undefined : insight?.category
  return (
    // Wrapping onto a clipped second line drops what does not fit whole; a clipped single line cut a chip in half.
    <span
      className={cn(
        'text-muted-foreground flex h-5 min-w-0 flex-1 flex-wrap items-center justify-end gap-x-1.5 gap-y-5 overflow-hidden text-xs whitespace-nowrap',
        UNDER_ROW_ACTIONS
      )}
    >
      {insight && <ExtractedChips extracted={insight.extracted} size="sm" />}
      {category === 'security' ? (
        <span className="text-destructive flex items-center gap-1 font-medium">
          <HugeiconsIcon
            icon={Shield01Icon}
            strokeWidth={2}
            className="size-3"
          />
          {t.category.security}
        </span>
      ) : (
        category && <span>{t.category[category]}</span>
      )}
      {insight?.needsReply && (
        <span className="text-primary">· {t.mail.expectsReply}</span>
      )}
      {message.hasAttachments && (
        <span className="flex">
          <HugeiconsIcon
            icon={Attachment01Icon}
            strokeWidth={2}
            className="size-3"
          />
          <span className="sr-only">{t.mail.attachment}</span>
        </span>
      )}
      {isBulk(message.bulkCount, insight?.category) && (
        <span>· {t.bulk.badge(message.bulkCount ?? 0)}</span>
      )}
    </span>
  )
}

const MailRowCode = ({
  actions,
  code,
  messageId,
  sweep,
}: {
  actions: ReturnType<typeof useMailActions>
  code: string | null
  messageId: string
  sweep: Sweep
}) =>
  code && (
    <CodeActions
      actions={actions}
      className="absolute top-7.5 right-4"
      code={code}
      messageIds={[messageId]}
      sweep={sweep}
    />
  )

// Read mail sinks into the page, as in Gmail: a dimmer fill, muted text and a faded icon, so unread rows stand out at a glance.
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
    // `--avatar-ring` follows every fill, the card's own by default, so a thread's avatars cut out exactly what lies under them.
    'group relative border-b [--avatar-ring:var(--color-popover)]',
    !isUnread && 'bg-background [--avatar-ring:var(--color-background)]',
    isActive
      ? 'bg-accent [--avatar-ring:var(--color-accent)]'
      : 'hover:bg-accent hover:[--avatar-ring:var(--color-accent)]',
    isOpen &&
      'bg-secondary hover:bg-secondary [--avatar-ring:var(--color-secondary)] hover:[--avatar-ring:var(--color-secondary)]'
  )

/** The row's sender, or everyone in its thread once someone answered. */
const RowAvatar = ({
  message,
  participants,
  size,
}: {
  message: ListedMessage
  participants: Participant[]
  size?: 'xs' | 'sm'
}) =>
  participants.length > 1 ? (
    <ParticipantAvatars participants={participants} size={size} />
  ) : (
    <SenderAvatar sender={message} size={size} />
  )

const rowSenderOf = (
  t: ReturnType<typeof useT>,
  message: ListedMessage,
  participants: Participant[]
) =>
  participants.length > 1
    ? participantNamesOf(participants, t.mail.you)
    : (message.fromName ?? message.fromEmail)

// The box lies over the unread dot, so the dot steps aside whenever the box shows.
const RowPick = ({
  className,
  isPicking,
  ...props
}: ComponentProps<typeof Checkbox> & {
  className: string
  isPicking: boolean
}) => (
  <span
    className={cn(
      'absolute left-3 flex',
      className,
      !isPicking &&
        'ease-house opacity-0 transition-opacity duration-150 group-hover:opacity-100'
    )}
  >
    <Checkbox {...props} />
  </span>
)

const readIconOf = (isUnread: boolean) =>
  cn('flex shrink-0', !isUnread && 'opacity-50')

const unreadDotOf = (isUnread: boolean, isPicking: boolean) =>
  cn(
    'mr-1 size-2 shrink-0 rounded-full',
    isUnread && 'bg-primary',
    isPicking ? 'invisible' : 'group-hover:invisible'
  )

const ROW_LEAVE = { duration: 0.2, ease: [0.32, 0.72, 0, 1] } as const

const HIDDEN_CURSOR = -1

/** First guesses, until a row is measured; near them, the scrollbar barely jumps. */
const ROW_SIZE = {
  draft: 82,
  header: 52,
  line: 37,
  mail: 63,
  relatedFirst: 59,
}

const ROW_FOLD = { borderBottomWidth: 0, height: 0, opacity: 0 }

interface CardEdge {
  isFirst: boolean
  isLast: boolean
}

// A group's rows are one `SettingsGroup` card drawn row by row, since the window renders rows, never their group: no margins here, the window measures borders but not margins.
// Its edge is drawn by shadows that never overlap, as a ring per row did at every rule and under the sticky header: the sides beside each row, the top inside the first row (the header lies over anything above it), the bottom and the card's shadow under the last.
const CARD_EDGES = {
  first:
    'shadow-[inset_0_1px_var(--edge),-1px_0_var(--edge),1px_0_var(--edge)]',
  last: 'shadow-[-1px_0_var(--edge),1px_0_var(--edge),0_1px_var(--edge),0_2px_4px_0_rgb(60_40_20/0.03)]',
  middle: 'shadow-[-1px_0_var(--edge),1px_0_var(--edge)]',
  only: 'shadow-[inset_0_1px_var(--edge),-1px_0_var(--edge),1px_0_var(--edge),0_1px_var(--edge),0_2px_4px_0_rgb(60_40_20/0.03)]',
}

const cardEdgeOf = ({ isFirst, isLast }: CardEdge) => {
  if (isFirst) {
    return isLast ? CARD_EDGES.only : CARD_EDGES.first
  }
  return isLast ? CARD_EDGES.last : CARD_EDGES.middle
}

const cardPieceOf = (edge: CardEdge | null) =>
  edge &&
  cn(
    'bg-popover border-foreground/6 [--edge:color-mix(in_oklab,var(--color-foreground)_4%,transparent)]',
    cardEdgeOf(edge),
    edge.isFirst && 'rounded-t-xl',
    edge.isLast && 'rounded-b-xl'
  )

const ListWindowContext = createContext<{
  edgeOf: (index: number) => CardEdge | null
  keys: ReadonlySet<VirtualItem['key']>
  measure: (node: Element | null) => void
}>({ edgeOf: () => null, keys: new Set(), measure: () => null })

// A row gone from the list folds; a row the window scrolled past is still listed and goes at once, taking no room, or the rows below jump by its height. Either way its index is stale, so it stops being measured (-1 is out of range).
const ListRow = ({
  className,
  item,
  ...props
}: ComponentProps<typeof motion.li> & { item: VirtualItem }) => {
  const isPresent = useIsPresent()
  const { edgeOf, keys, measure } = use(ListWindowContext)
  const edge = edgeOf(item.index)
  const isScrolledPast = !isPresent && keys.has(item.key)
  return (
    <motion.li
      ref={isPresent ? measure : undefined}
      data-index={isPresent ? item.index : -1}
      hidden={isScrolledPast}
      initial={false}
      exit={isScrolledPast ? undefined : ROW_FOLD}
      className={cn(
        STILL_POINTER_GUARD,
        'mx-auto w-full max-w-3xl',
        cardPieceOf(edge),
        className,
        edge?.isLast && 'border-b-0',
        !isPresent && 'pointer-events-none overflow-hidden'
      )}
      {...props}
    />
  )
}

const ListGap = ({ height }: { height: number }) => (
  <li
    aria-hidden
    className="h-(--gap)"
    style={{ '--gap': `${height}px` } as CSSProperties}
  />
)

interface ListWindowItem {
  /** The card the row belongs to; consecutive rows of one card share its frame. Headers have none. */
  card?: string
  isCursor?: boolean
  isSticky?: boolean
  key: string
  render: (item: VirtualItem) => ReactNode
  size: number
}

/**
 * Renders the rows in and near view between spacers that hold the rest of the list's height, so the rows stay in the flow: a folding row pulls up the ones below and group headers stick.
 * Keyed by the list: a view, mailbox or search swap replaces every row at once, so nothing folds out; typing in search churns rows, so they leave at once.
 */
const ListWindow = ({
  isSearching,
  items,
  listKey,
  scroller,
}: {
  isSearching: boolean
  items: ListWindowItem[]
  listKey: string
  scroller: RefObject<HTMLElement | null>
}) => {
  const isReducedMotion = useReducedMotion()
  const stickyIndexes = items.flatMap(({ isSticky }, index) =>
    isSticky ? [index] : []
  )
  // oxlint-disable-next-line react/incompatible-library -- the compiler skips this component, which re-renders on every scroll; keep it small
  const virtualizer = useVirtualizer({
    count: items.length,
    estimateSize: (index) => items[index]?.size ?? 0,
    getItemKey: (index) => items[index]?.key ?? index,
    getScrollElement: () => scroller.current,
    overscan: 10,
    // A sticky header out of the DOM no longer sticks, so the one over the rows in view stays rendered.
    rangeExtractor: (range) => {
      const indexes = defaultRangeExtractor(range)
      const sticky = stickyIndexes.findLast(
        (index) => index <= range.startIndex
      )
      return sticky === undefined || indexes.includes(sticky)
        ? indexes
        : [sticky, ...indexes]
    },
  })
  const cursorIndex = items.findIndex(({ isCursor }) => isCursor)
  useEffect(() => {
    if (cursorIndex !== HIDDEN_CURSOR) {
      virtualizer.scrollToIndex(cursorIndex)
    }
  }, [cursorIndex, virtualizer])
  const shown = virtualizer.getVirtualItems()
  const [head, second] = shown
  const sticky =
    head && second && second.index !== head.index + 1 ? head : undefined
  const flowing = sticky ? shown.slice(1) : shown
  const render = (item: VirtualItem) => items[item.index]?.render(item)
  return (
    <ListWindowContext
      value={{
        edgeOf: (index) => {
          const card = items[index]?.card
          if (card === undefined) {
            return null
          }
          return {
            isFirst: items[index - 1]?.card !== card,
            isLast: items[index + 1]?.card !== card,
          }
        },
        keys: new Set(items.map(({ key }) => key)),
        measure: virtualizer.measureElement,
      }}
    >
      <ListGap height={head?.start ?? 0} />
      {sticky && render(sticky)}
      {sticky && <ListGap height={(flowing[0]?.start ?? 0) - sticky.end} />}
      <MotionConfig
        transition={
          isSearching || isReducedMotion ? { duration: 0 } : ROW_LEAVE
        }
      >
        <AnimatePresence key={listKey} initial={false}>
          {flowing.map(render)}
        </AnimatePresence>
      </MotionConfig>
      <ListGap height={virtualizer.getTotalSize() - (shown.at(-1)?.end ?? 0)} />
    </ListWindowContext>
  )
}

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

const RELATED_SHOWN = 5
const UNRELATED_LISTS = new Set<MailList>(['pinned', 'spam', 'trash'])

/**
 * Under the row → was pressed on, the sender's other threads from every list as real rows (J / K, ⏎ and E reach them);
 * never one the list already shows. Never under a pin (`pinnedCount` rows lead the list) or in search, which shows only matches.
 */
const useRelatedRows = <Row extends ListedRow>({
  anchor,
  isEnabled,
  mailbox,
  pinnedCount,
  rows,
}: {
  anchor: string | null
  isEnabled: boolean
  mailbox: string | undefined
  pinnedCount: number
  rows: Row[]
}) => {
  const pinned = new Set<ListedRow>(rows.slice(0, pinnedCount))
  const isAnchor = (row: ListedRow) => isEnabled && !pinned.has(row)
  const everything = useLiveQuery((query) =>
    query
      .from({ row: mailRowsOf(mailbox) })
      .orderBy(({ row }) => row.message.receivedAt, 'desc')
  )
  const seen = new Set(rows.map(({ message }) => message.threadId))
  const others = (everything.data ?? []).filter(({ list, message }) => {
    if (UNRELATED_LISTS.has(list) || seen.has(message.threadId)) {
      return false
    }
    seen.add(message.threadId)
    return true
  })
  const bySender = Map.groupBy(others, ({ message }) => message.fromEmail)
  const anchorIndex = rows.findIndex(
    (row) => isAnchor(row) && row.message.threadId === anchor
  )
  const related = (
    bySender.get(rows[anchorIndex]?.message.fromEmail ?? '') ?? []
  )
    .slice(0, RELATED_SHOWN)
    .map((row) => ({ ...row, isRelated: true as const }))
  return {
    anchorIndex,
    canShowFor: (row: ListedRow | undefined) =>
      !!row &&
      !('isRelated' in row) &&
      isAnchor(row) &&
      row.message.threadId !== anchor &&
      bySender.has(row.message.fromEmail),
    rows: [
      ...rows.slice(0, anchorIndex + 1),
      ...related,
      ...rows.slice(anchorIndex + 1),
    ],
  }
}

/**
 * One sub-list under its sender's row: the card's fill and no rule until the last of them. The first names the sender,
 * or the lines read as more of the row above and opened threads nobody expected.
 */
const RelatedRow = ({
  isCursor,
  isFirst,
  isLast,
  isOpen,
  item,
  onOpen,
  row: { message },
}: {
  isCursor: boolean
  isFirst: boolean
  isLast: boolean
  isOpen: boolean
  item: VirtualItem
  onOpen: () => void
  row: ListedRow
}) => {
  const t = useT()
  const dates = useDates()
  return (
    <ListRow
      item={item}
      className={cn(
        rowSurfaceOf({ isActive: isCursor, isOpen, isUnread: true }),
        !isLast && 'border-b-0'
      )}
    >
      {isFirst && (
        <span
          data-mask
          className="text-muted-foreground block truncate pt-1.5 pr-5 pl-18 text-xs"
        >
          {t.mail.moreFrom(message.fromName ?? message.fromEmail)}
        </span>
      )}
      <button
        type="button"
        tabIndex={-1}
        onClick={onOpen}
        onPointerEnter={() => {
          void warmThread(message.threadId)
        }}
        aria-current={isOpen}
        className="flex w-full cursor-pointer items-center gap-2 py-1.5 pr-5 pl-18 text-left text-sm outline-none"
      >
        <span
          data-mask
          className={cn(
            'min-w-0 flex-1 truncate',
            message.isUnread ? 'font-medium' : 'text-muted-foreground'
          )}
        >
          {message.subject}
        </span>
        <span className="text-muted-foreground shrink-0 text-xs tabular-nums">
          {dates.format(message.receivedAt, 'd MMM')}
        </span>
      </button>
    </ListRow>
  )
}

const RowWarning = ({ message }: { message: ListedMessage }) => {
  const t = useT()
  if (message.risk) {
    return (
      <span className="text-destructive text-xs font-medium">
        {t.risk.title}
      </span>
    )
  }
  return (
    message.suspicion && (
      <span className="text-muted-foreground text-xs">{t.spam.suspect}</span>
    )
  )
}

const MailRow = ({
  actions,
  canSnooze,
  hidesCategory = false,
  isCursor,
  isOpen,
  isPicked,
  isPicking,
  isSnoozeOpen,
  item,
  onOpen,
  onPick,
  onSnoozeOpenChange,
  row: { analysis, message, participants, threadSize },
  sweep,
}: {
  actions: ReturnType<typeof useMailActions>
  canSnooze: boolean
  hidesCategory?: boolean
  isCursor: boolean
  isOpen: boolean
  isPicked: boolean
  isPicking: boolean
  isSnoozeOpen: boolean
  item: VirtualItem
  onOpen: () => void
  onPick: () => void
  onSnoozeOpenChange: (open: boolean) => void
  row: ListedRow
  sweep: Sweep
}) => {
  const t = useT()
  const dates = useDates()
  const codeRoom = message.code ? 'pr-28' : undefined

  return (
    <ListRow
      item={item}
      className={rowSurfaceOf({
        isActive: isCursor || isPicked || isSnoozeOpen,
        isOpen,
        isUnread: message.isUnread,
      })}
    >
      <button
        type="button"
        tabIndex={-1}
        onClick={onOpen}
        onPointerEnter={() => {
          void warmThread(message.threadId)
        }}
        aria-current={isOpen}
        className="flex w-full cursor-pointer items-center gap-2 py-2.5 pr-5 pl-4 text-left outline-none"
      >
        <span
          aria-label={message.isUnread ? t.mail.unread : undefined}
          className={unreadDotOf(message.isUnread, isPicking)}
        />
        <span className={readIconOf(message.isUnread)}>
          <RowAvatar message={message} participants={participants} size="sm" />
        </span>
        <span className="ml-1 flex min-w-0 flex-1 flex-col gap-0.5">
          <span className="flex items-center gap-2 text-sm">
            <span
              data-mask
              className={cn(
                'min-w-0 truncate',
                message.isUnread ? 'font-semibold' : 'text-muted-foreground'
              )}
            >
              {rowSenderOf(t, message, participants)}
            </span>
            {threadSize > 1 && (
              <Tooltip>
                <TooltipTrigger render={<Badge size="sm" variant="outline" />}>
                  {threadSize}
                </TooltipTrigger>
                <TooltipContent>
                  {t.mail.inThread(t.cleanup.emails(threadSize))}
                </TooltipContent>
              </Tooltip>
            )}
            <MailRowMeta
              hidesCategory={hidesCategory}
              insight={analysis}
              message={message}
            />
            <span
              className={cn(
                'shrink-0 text-xs tabular-nums',
                UNDER_ROW_ACTIONS,
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
              'truncate text-sm',
              codeRoom,
              message.isUnread
                ? 'text-foreground font-medium'
                : 'text-muted-foreground'
            )}
          >
            {message.subject}
          </span>
          <RowWarning message={message} />
        </span>
      </button>
      <MailRowActions
        actions={actions}
        canSnooze={canSnooze}
        className={ROW_ACTIONS}
        isPinned={message.isPinned}
        isSnoozeOpen={isSnoozeOpen}
        messageIds={[message.id]}
        onSnoozeOpenChange={onSnoozeOpenChange}
        sweep={sweep}
      />
      <MailRowCode
        actions={actions}
        code={message.code}
        messageId={message.id}
        sweep={sweep}
      />
      <RowPick
        className="top-1/2 -translate-y-1/2"
        aria-label={t.queue.pick}
        checked={isPicked}
        isPicking={isPicking}
        onCheckedChange={onPick}
      />
    </ListRow>
  )
}

const PinnedRow = ({
  actions,
  canSnooze,
  isCursor,
  isOpen,
  isPicked,
  isPicking,
  isSnoozeOpen,
  item,
  onOpen,
  onPick,
  onSnoozeOpenChange,
  row: { message, participants },
  sweep,
}: Parameters<typeof MailRow>[0]) => {
  const t = useT()
  const dates = useDates()
  return (
    <ListRow
      item={item}
      className={rowSurfaceOf({
        isActive: isCursor || isPicked || isSnoozeOpen,
        isOpen,
        isUnread: message.isUnread,
      })}
    >
      <button
        type="button"
        tabIndex={-1}
        onClick={onOpen}
        onPointerEnter={() => {
          void warmThread(message.threadId)
        }}
        aria-current={isOpen}
        className="flex w-full cursor-pointer items-center gap-2 py-2 pr-5 pl-4 text-left text-sm outline-none"
      >
        <span
          aria-label={message.isUnread ? t.mail.unread : undefined}
          className={unreadDotOf(message.isUnread, isPicking)}
        />
        <span className={readIconOf(message.isUnread)}>
          <RowAvatar message={message} participants={participants} />
        </span>
        <span
          data-mask
          className={cn(
            'max-w-2/5 shrink-0 truncate',
            message.isUnread ? 'font-semibold' : 'text-muted-foreground'
          )}
        >
          {rowSenderOf(t, message, participants)}
        </span>
        <span
          data-mask
          className={cn(
            'min-w-0 flex-1 truncate',
            message.isUnread ? 'text-foreground' : 'text-muted-foreground'
          )}
        >
          {message.subject}
        </span>
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
      </button>
      <MailRowActions
        actions={actions}
        canSnooze={canSnooze}
        className={cn(ROW_ACTIONS, 'top-1')}
        isPinned
        isSnoozeOpen={isSnoozeOpen}
        messageIds={[message.id]}
        onSnoozeOpenChange={onSnoozeOpenChange}
        sweep={sweep}
      />
      <RowPick
        className="top-2.5"
        aria-label={t.queue.pick}
        checked={isPicked}
        isPicking={isPicking}
        onCheckedChange={onPick}
      />
    </ListRow>
  )
}

const PinnedHeader = ({
  hidden,
  isExpanded,
  item,
  onToggle,
  total,
}: {
  hidden: number
  isExpanded: boolean
  item: VirtualItem
  onToggle: () => void
  total: number
}) => {
  const t = useT()
  return (
    <ListRow item={item} className={LIST_HEADER}>
      <span>{t.mail.pinned}</span>
      <span className="tabular-nums opacity-60">{total}</span>
      {(hidden > 0 || isExpanded) && (
        <Button
          size="xs"
          variant="link-muted"
          className="ml-auto"
          onClick={onToggle}
        >
          {isExpanded ? t.mail.showFewer : t.mail.showAll(total)}
        </Button>
      )}
    </ListRow>
  )
}

type DraftRowData = RouterOutputs['mail']['drafts'][number]

const DraftRow = ({
  draft,
  isCursor,
  item,
  onDelete,
  onOpen,
}: {
  draft: DraftRowData
  isCursor: boolean
  item: VirtualItem
  onDelete: () => void
  onOpen: () => void
}) => {
  const t = useT()
  const dates = useDates()
  return (
    <ListRow
      item={item}
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
        <span className="flex items-center gap-2 pl-6 text-sm">
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
        <span data-mask className="text-foreground/60 truncate pl-6 text-sm">
          {draft.subject}
        </span>
        <span data-mask className="text-muted-foreground truncate pl-6 text-sm">
          {draft.snippet}
        </span>
        {draft.isFailed && (
          <span className="text-destructive pl-6 text-xs font-medium">
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
    </ListRow>
  )
}

/** The drafts, or the pinned header: what comes before the mail rows. */
const headItemsOf = ({
  cursor,
  drafts,
  open,
  pinnedCount,
  pinnedRows,
}: {
  cursor: number
  drafts: Pick<ReturnType<typeof useDrafts>, 'remove' | 'rows'>
  open: (index: number) => void
  pinnedCount: number
  pinnedRows: Pick<
    ReturnType<typeof usePinnedRows>,
    'isExpanded' | 'shown' | 'toggle'
  >
}): ListWindowItem[] => [
  ...drafts.rows.map((saved, index) => ({
    card: 'drafts',
    isCursor: index === cursor,
    key: `draft:${saved.id}`,
    render: (item: VirtualItem) => (
      <DraftRow
        key={item.key}
        draft={saved}
        isCursor={index === cursor}
        item={item}
        onOpen={() => open(index)}
        onDelete={() => drafts.remove(saved)}
      />
    ),
    size: ROW_SIZE.draft,
  })),
  ...(pinnedCount > 0
    ? [
        {
          key: 'pinned',
          render: (item: VirtualItem) => (
            <PinnedHeader
              key={item.key}
              hidden={pinnedCount - pinnedRows.shown}
              isExpanded={pinnedRows.isExpanded}
              item={item}
              total={pinnedCount}
              onToggle={() => pinnedRows.toggle()}
            />
          ),
          size: ROW_SIZE.header,
        },
      ]
    : []),
]

const useDrafts = ({
  isEnabled,
  mailbox,
  q,
}: {
  isEnabled: boolean
  mailbox: string | undefined
  q: string | undefined
}) => {
  const t = useT()
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
  const hide = (id: string) =>
    queryClient.setQueriesData<DraftRowData[]>(
      { queryKey: orpc.mail.drafts.key() },
      (old) => old?.filter((draft) => draft.id !== id)
    )
  const deleteDraft = useMutation(
    orpc.mail.deleteDraft.mutationOptions({ onSettled: refetchDrafts })
  )
  const takeBackFailed = useMutation(
    orpc.mail.cancelSend.mutationOptions({
      onMutate: ({ id }) => {
        hide(id)
        pendingToast(id).onMutate()
      },
      onSettled: (_draft, _error, { id }) =>
        refetchDrafts().finally(settleToast(id)),
    })
  )
  const open = (index: number) => {
    const saved = rows[index]
    if (saved?.isFailed) {
      takeBackFailed.mutate({ id: saved.id }, { onSuccess: openCompose })
    } else if (saved) {
      openCompose({
        attachments: saved.attachments,
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
  // Gmail deletes a draft for good, so it goes only once the toast closes without Undo.
  const remove = ({ id, isFailed, mailboxId }: DraftRowData) => {
    hide(id)
    toastDeferred(
      t.mail.draftDeleted,
      () =>
        isFailed
          ? takeBackFailed.mutate({ id })
          : deleteDraft.mutate({ id, mailboxId }),
      refetchDrafts
    )
  }
  return { isFetching, open, remove, rows }
}

const newestPerThread = <Row extends ListedRow>(newestFirst: Row[]) =>
  [
    ...Map.groupBy(newestFirst, ({ message }) => message.threadId).values(),
  ].flatMap(([newest]) => (newest ? [newest] : []))

const isRefinedFrom = (typed: string, answered: string) =>
  typed.startsWith(answered) || answered.startsWith(typed)

/** `from:` alone is a tip just picked, not a query: Gmail would answer it with everything. */
const isIncompleteOperator = (typed: string) => typed.endsWith(':')

const searchRowsOf = ({
  answered,
  listed,
  typed,
}: {
  answered: ListedRow[]
  listed: ListedRow[]
  typed: string
}) => {
  if (!typed) {
    return []
  }
  const needle = typed.toLowerCase()
  const matching = listed.filter(({ message }) =>
    [message.subject, message.fromName, message.fromEmail, message.snippet]
      .join(' ')
      .toLowerCase()
      .includes(needle)
  )
  return newestPerThread(
    [...answered, ...matching].toSorted(
      (left, right) =>
        right.message.receivedAt.getTime() - left.message.receivedAt.getTime()
    )
  )
}

/** The last answer stays while the query is refined, so the list grows and shrinks instead of blinking empty. */
const useSearchAnswer = ({
  isEnabled,
  mailbox,
  q,
  typed,
}: {
  isEnabled: boolean
  mailbox: string | undefined
  q: string | undefined
  typed: string
}) => {
  const found = useQuery(
    orpc.mail.list.queryOptions({
      input:
        q && isEnabled
          ? { filter: 'inbox', mailboxId: mailbox, search: q }
          : skipToken,
    })
  )
  const [answer, setAnswer] = useState<{
    mailbox: string | undefined
    q: string
    rows: ListedRow[]
  }>()
  if (q && found.data && found.data !== answer?.rows) {
    setAnswer({ mailbox, q, rows: found.data })
  }
  const isRelated =
    !!answer && answer.mailbox === mailbox && isRefinedFrom(typed, answer.q)
  return {
    isFetching: found.isFetching,
    rows: isRelated ? answer.rows : [],
  }
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
  const found = useSearchAnswer({ isEnabled: !isDrafts, mailbox, q, typed })
  const listed = useLiveQuery((query) =>
    filter === 'drafts'
      ? undefined
      : query
          .from({ row: mailRowsOf(mailbox) })
          .where(({ row }) => inArray(row.list, LISTS_OF[filter]))
          .orderBy(({ row }) => row.message.receivedAt, 'desc')
  )
  const showsPinned = q === undefined && isInboxView(filter)
  const pinned = useLiveQuery((query) =>
    showsPinned
      ? query
          .from({ row: mailRowsOf(mailbox) })
          .where(({ row }) => inArray(row.list, ['pinned']))
          .orderBy(({ row }) => row.message.receivedAt, 'desc')
      : undefined
  )
  const drafts = useDrafts({ isEnabled: isDrafts, mailbox, q })
  const rows =
    q === undefined
      ? newestPerThread(listed.data ?? []).filter(
          ({ message }) => !showsPinned || !message.isPinned
        )
      : searchRowsOf({
          answered: found.rows,
          listed: listed.data ?? [],
          typed,
        })
  const isSearchPending =
    !!typed && !isIncompleteOperator(typed) && (typed !== q || found.isFetching)
  return {
    isSearchPending,
    drafts,
    isDrafts,
    isFetching: isDrafts ? drafts.isFetching : listed.isLoading,
    pinned: (showsPinned && pinned.data) || [],
    rows,
    total: isDrafts ? drafts.rows.length : rows.length,
  }
}

/**
 * Scrolling near the end reads the next page of the view's own list (Unread's Read group stays as loaded); past the
 * held mail the server reads Gmail, one list at a time, which keeps inside Gmail's per-user quota.
 */
const useOlderRows = ({
  filter,
  isLoading,
  mailbox,
  q,
}: {
  filter: Filter
  isLoading: boolean
  mailbox: string | undefined
  q: string | undefined
}) => {
  const [list] = filter === 'drafts' || q !== undefined ? [] : LISTS_OF[filter]
  const load = useMutation({
    meta: { event: 'mail_older_loaded' },
    mutationFn: () => (list ? loadOlderRows(mailbox, list) : Promise.resolve()),
    retry: 2,
  })
  return {
    hasMore: !isLoading && !!list && hasOlderRows(mailbox, list),
    isFailed: load.isError,
    isLoading: load.isPending,
    load: () => {
      if (!load.isPending) {
        load.mutate()
      }
    },
  }
}

/**
 * Watches the list's end inside its own scroller; the spinner holds the place while the page comes. A failed page waits
 * for Try again: read again on every render, it hammered Gmail's quota.
 */
const OlderRowsLoader = ({
  hasMore,
  isFailed,
  isLoading,
  load,
}: ReturnType<typeof useOlderRows>) => {
  const t = useT()
  const ref = useRef<HTMLLIElement>(null)
  useEffect(() => {
    const node = ref.current
    if (!node || !hasMore || isLoading || isFailed) {
      return
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          load()
        }
      },
      { root: node.closest('ul'), rootMargin: '0px 0px 600px 0px' }
    )
    observer.observe(node)
    return () => observer.disconnect()
  }, [hasMore, isFailed, isLoading, load])
  return (
    <li ref={ref} hidden={!hasMore} className="flex justify-center py-3">
      {isLoading && <Spinner label={t.nav.loading} />}
      {isFailed && !isLoading && (
        <Button size="xs" variant="link-muted" onClick={load}>
          {t.agent.retry}
        </Button>
      )}
    </li>
  )
}

interface ActedRow {
  message: ListedMessage
}

const unreadOf = (rows: ActedRow[]) =>
  rows.filter(({ message }) => message.isUnread)

/** Marks the rows' threads read, or unread with `toUnread`; undefined when none is in the other state, so its control can hide. */
const markReadOf = (
  rows: ActedRow[],
  mutate: (input: { threadId: string }) => void,
  toUnread = false
) => {
  const threadIds = new Set(
    rows
      .map(({ message }) => message)
      .filter(({ isUnread }) => isUnread !== toUnread)
      .map(({ threadId }) => threadId)
  )
  return threadIds.size > 0
    ? () => {
        for (const threadId of threadIds) {
          mutate({ threadId })
        }
      }
    : undefined
}

const NONE_PICKED: ReadonlySet<string> = new Set()
const PICKED_SNOOZE = 'picked'

const usePicks = ({
  cursorRow,
  isEnabled,
  picks: [pickedIds, setPickedIds],
  rows,
}: {
  cursorRow: ActedRow | undefined
  isEnabled: boolean
  picks: [ReadonlySet<string>, (ids: ReadonlySet<string>) => void]
  rows: ActedRow[]
}) => {
  const picked = rows.filter(({ message }) => pickedIds.has(message.id))
  // A picked row that left the list (acted on, or changed elsewhere) must leave the picks, or esc would clear picks nobody sees.
  if (picked.length !== pickedIds.size) {
    setPickedIds(new Set(picked.map(({ message }) => message.id)))
  }
  const isAllPicked = rows.length > 0 && picked.length === rows.length
  const onUnpick = () => setPickedIds(NONE_PICKED)
  const onPickAll = () =>
    setPickedIds(new Set(rows.map(({ message }) => message.id)))
  const onPickGroup = (ids: string[]) =>
    setPickedIds(
      ids.every((id) => pickedIds.has(id))
        ? new Set([...pickedIds].filter((id) => !ids.includes(id)))
        : new Set([...pickedIds, ...ids])
    )
  const onToggle = (id: string) => {
    const next = new Set(pickedIds)
    if (!next.delete(id)) {
      next.add(id)
    }
    setPickedIds(next)
  }
  const keys = { enabled: isEnabled && rows.length > 0 }
  useHotkey('X', () => cursorRow && onToggle(cursorRow.message.id), keys)
  useHotkey('Mod+A', isAllPicked ? onUnpick : onPickAll, keys)
  useHotkey('Escape', onUnpick, {
    enabled: isEnabled && picked.length > 0,
  })
  return {
    isAllPicked,
    onPickAll,
    onPickGroup,
    onToggle,
    onUnpick,
    picked,
    pickedIds,
  }
}

/** The keys that act on the cursor row or the picks, in the order their controls sit. */
const targetHintsOf = ({
  canSnooze,
  code,
  onTargets,
  sweepHint,
  t,
}: {
  canSnooze: boolean
  code: string | null | undefined
  onTargets: {
    isPinned: boolean
    onMarkRead?: () => void
    onMarkUnread?: () => void
  }
  sweepHint: [string, string]
  t: ReturnType<typeof useT>
}): [string, string][] => [
  sweepHint,
  ...(onTargets.onMarkRead
    ? [['⇧I', t.keys.markRead] as [string, string]]
    : []),
  ...(onTargets.onMarkUnread
    ? [['⇧U', t.keys.markUnread] as [string, string]]
    : []),
  ...(canSnooze ? [['H', t.keys.snooze] as [string, string]] : []),
  pinHint(t, onTargets.isPinned),
  ['⌫', t.keys.trash],
  ...(code ? [['Y', t.keys.copyCode] as [string, string]] : []),
]

const useListActions = ({
  filter,
  isEnabled,
  onUnpick,
  picked,
  row,
}: {
  filter: Filter
  isEnabled: boolean
  onUnpick: () => void
  picked: ActedRow[]
  row: ActedRow | undefined
}) => {
  const isPicking = picked.length > 0
  const cursorRows = row ? [row] : []
  const targets = isPicking ? picked : cursorRows
  const messageIds = targets.map(({ message }) => message.id)
  const code = isPicking ? null : row?.message.code
  const isPinned =
    targets.length > 0 && targets.every(({ message }) => message.isPinned)
  const t = useT()
  const actions = useMailActions()
  const [snoozeOpenId, setSnoozeOpenId] = useState<string | null>(null)
  const canSnooze = filter !== 'snoozed'
  const sweep = sweepOf(actions, t, OUT_OF_INBOX[filter] ?? 'inbox')
  const [head] = messageIds
  const keys = { enabled: isEnabled && !!head }
  const thenUnpick = (run: () => void) => () => {
    run()
    onUnpick()
  }
  const each = (mutate: (input: { messageId: string }) => void) =>
    thenUnpick(onEach(messageIds, mutate))
  const markRead = markReadOf(targets, actions.markRead.mutate)
  const markUnread = markReadOf(targets, actions.markUnread.mutate, true)
  const onTargets = {
    isPinned,
    onMarkRead: markRead && thenUnpick(markRead),
    onMarkUnread: markUnread && thenUnpick(markUnread),
    onPin: thenUnpick(pinEach(messageIds, !isPinned, actions.pin.mutate)),
    onSnooze: (until: Date) =>
      each(({ messageId }) => actions.snooze.mutate({ messageId, until }))(),
    onSweep: each(sweep.action.mutate),
    onTrash: each(actions.trash.mutate),
  }
  useHotkey('E', onTargets.onSweep, keys)
  useHotkey(
    'H',
    () => head && setSnoozeOpenId(isPicking ? PICKED_SNOOZE : head),
    { enabled: keys.enabled && canSnooze }
  )
  useHotkey('Backspace', onTargets.onTrash, keys)
  useHotkey('Shift+1', each(actions.reportSpam.mutate), keys)
  useHotkey('S', onTargets.onPin, keys)
  useHotkey('Shift+I', () => onTargets.onMarkRead?.(), {
    enabled: keys.enabled && !!onTargets.onMarkRead,
  })
  useHotkey('Shift+U', () => onTargets.onMarkUnread?.(), {
    enabled: keys.enabled && !!onTargets.onMarkUnread,
  })
  useHotkey('Y', () => code && copy(code, t.mail.oneTimeCode.copied), {
    enabled: keys.enabled && !!code,
  })
  const sweepHint: [string, string] = [
    'E',
    filter in OUT_OF_INBOX ? t.keys.restore : t.keys.archive,
  ]
  const hints =
    filter === 'drafts'
      ? []
      : targetHintsOf({ canSnooze, code, onTargets, sweepHint, t })
  return {
    actions,
    canSnooze,
    hints,
    onTargets,
    setSnoozeOpenId,
    snoozeOpenId,
    sweep,
    sweepHint,
  }
}

// The header stays mounted under the bar: remounting the search field would take focus back with its autoFocus.
const PickedBar = ({
  children,
  list: { canSnooze, onTargets, setSnoozeOpenId, snoozeOpenId, sweep },
  picks: { isAllPicked, onPickAll, onUnpick, picked },
}: {
  children: ReactNode
  list: ReturnType<typeof useListActions>
  picks: ReturnType<typeof usePicks>
}) => {
  const t = useT()
  const {
    isPinned,
    onMarkRead,
    onMarkUnread,
    onPin,
    onSnooze,
    onSweep,
    onTrash,
  } = onTargets
  return (
    <>
      {picked.length > 0 && (
        <div className="mx-auto flex w-full max-w-[calc(var(--container-3xl)+3rem)] items-center gap-1 px-6 py-3">
          <Checkbox
            aria-label={t.keys.pickAll}
            checked={isAllPicked}
            onCheckedChange={isAllPicked ? onUnpick : onPickAll}
          />
          <span className="ml-2 text-sm font-medium tabular-nums">
            {t.queue.picked(picked.length)}
          </span>
          <span className="ml-auto flex items-center gap-1">
            <IconButton
              icon={isPinned ? PinOffIcon : PinIcon}
              label={isPinned ? t.mail.unpin : t.mail.pin}
              shortcut={<Kbd>S</Kbd>}
              size="icon-sm"
              variant="ghost-muted"
              onClick={onPin}
            />
            <IconButton
              icon={sweep.icon}
              label={sweep.label}
              shortcut={<Kbd>E</Kbd>}
              size="icon-sm"
              variant="ghost-muted"
              onClick={onSweep}
            />
            {onMarkRead && (
              <IconButton
                icon={MailOpenIcon}
                label={t.actionKind.mark_read}
                shortcut={<Kbd>⇧I</Kbd>}
                size="icon-sm"
                variant="ghost-muted"
                onClick={onMarkRead}
              />
            )}
            {onMarkUnread && (
              <IconButton
                icon={Mail01Icon}
                label={t.mail.markUnread}
                shortcut={<Kbd>⇧U</Kbd>}
                size="icon-sm"
                variant="ghost-muted"
                onClick={onMarkUnread}
              />
            )}
            {canSnooze && (
              <DropdownMenu
                open={snoozeOpenId === PICKED_SNOOZE}
                onOpenChange={(isOpen) =>
                  setSnoozeOpenId(isOpen ? PICKED_SNOOZE : null)
                }
              >
                <DropdownMenuTrigger
                  render={
                    <IconButton
                      icon={Clock01Icon}
                      label={t.snooze.title}
                      shortcut={<Kbd>H</Kbd>}
                      size="icon-sm"
                      variant="ghost-muted"
                    />
                  }
                />
                <DropdownMenuContent align="end">
                  <SnoozeMenuItems onSnooze={onSnooze} />
                </DropdownMenuContent>
              </DropdownMenu>
            )}
            <IconButton
              icon={Delete02Icon}
              label={t.mail.trash}
              shortcut={<Kbd>⌫</Kbd>}
              size="icon-sm"
              variant="ghost-destructive"
              onClick={onTrash}
            />
            <Button
              size="sm"
              variant="ghost-muted"
              shortcut={<Kbd>esc</Kbd>}
              onClick={onUnpick}
            >
              {t.queue.unpick}
            </Button>
          </span>
        </div>
      )}
      <div hidden={picked.length > 0}>{children}</div>
    </>
  )
}

const useSearchField = ({
  isPicking,
  isSearching,
  onCloseThread,
  q,
  thread,
}: {
  isPicking: boolean
  isSearching: boolean
  onCloseThread: () => Promise<void>
  q: string | undefined
  thread: string | undefined
}) => {
  const navigate = useNavigate({ from: Route.fullPath })
  const searchRef = useRef<HTMLInputElement>(null)
  // The field is uncontrolled and the list follows it in a transition, so a long list never holds a keystroke back.
  const [search, setSearch] = useState(q ?? '')
  const fill = (value: string) => {
    if (searchRef.current) {
      searchRef.current.value = value
    }
    setSearch(value)
  }
  const applySearch = (value: string) =>
    navigate({
      replace: isSearching,
      search: (prev) => ({ ...prev, q: value, thread: undefined }),
    })
  const leaveSearch = () => {
    setSearch('')
    void navigate({
      search: (prev) => ({ ...prev, q: undefined, thread: undefined }),
    })
  }
  useHotkey('/', () =>
    isSearching ? searchRef.current?.focus() : applySearch('')
  )
  const typedSearch = useDebouncedMemo(() => search.trim(), [search], 400)
  const onTyped = useEffectEvent((value: string) => {
    if (isSearching && value !== q && !isIncompleteOperator(value)) {
      void applySearch(value)
    }
  })
  useEffect(() => onTyped(typedSearch), [typedSearch])
  useHotkey(
    'Enter',
    () => {
      const value = searchRef.current?.value ?? search
      rememberSearch(value)
      void applySearch(value.trim())
    },
    { ignoreInputs: false, target: searchRef }
  )
  useHotkey('Escape', () => searchRef.current?.blur(), {
    ignoreInputs: false,
    target: searchRef,
  })
  useHotkey(
    'Escape',
    () => {
      if (thread) {
        void onCloseThread()
      } else if (q || search.trim()) {
        fill('')
        void applySearch('')
      } else {
        leaveSearch()
      }
    },
    { enabled: !!thread || (isSearching && !isPicking) }
  )
  return {
    addToSearch: (text: string) => {
      const current = searchRef.current?.value.trim() ?? ''
      fill(
        `${[current, text].filter(Boolean).join(' ')}${isIncompleteOperator(text) ? '' : ' '}`
      )
      searchRef.current?.focus()
    },
    applySearch,
    isSearchStart: isSearching && !search.trim(),
    leaveSearch,
    onSearchInput: (value: string) => startTransition(() => setSearch(value)),
    search,
    searchFor: (query: string) => {
      fill(query)
      rememberSearch(query)
      void applySearch(query)
    },
    searchRef,
  }
}

const listModeOf = (q: string | undefined, picked: Filter) => {
  const isSearching = q !== undefined
  const filter: Filter = isSearching ? 'inbox' : picked
  return {
    filter,
    grouping: isSearching ? ('none' as const) : groupingOf(filter),
    isSearching,
    shownFilter: picked,
  }
}

const listHintsOf = ({
  canShowRelated,
  hints,
  isPicking,
  isSearching,
  t,
  total,
}: {
  canShowRelated: boolean
  hints: [string, string][]
  isPicking: boolean
  isSearching: boolean
  t: ReturnType<typeof useT>
  total: number
}): [string, string][] => {
  if (isPicking) {
    return [
      ['J / K', t.keys.move],
      ['X', t.keys.pick],
      ['⌘A', t.keys.pickAll],
      ...hints,
      ['esc', t.keys.unpick],
    ]
  }
  const walk: [string, string][] =
    total > 0
      ? [
          ['J / K', t.keys.move],
          ['⏎', t.keys.open],
          ...(canShowRelated
            ? [['→', t.keys.fromSender] as [string, string]]
            : []),
          ...hints,
          ...(hints.length > 0 ? [['X', t.keys.pick] as [string, string]] : []),
        ]
      : []
  return isSearching
    ? [...walk, ['esc', t.keys.close]]
    : [...walk, ['[ / ]', t.keys.filter], ['/', t.keys.search]]
}

const readerHintsOf = ({
  hasAgent,
  isPinned,
  sweepHint,
  t,
}: {
  hasAgent: boolean
  isPinned: boolean
  sweepHint: [string, string]
  t: ReturnType<typeof useT>
}): [string, string][] => [
  sweepHint,
  pinHint(t, isPinned),
  ['⇧U', t.keys.markUnread],
  ...(hasAgent ? [['R', t.keys.draftReply] as [string, string]] : []),
  ['⇧O', t.mail.openFullPage],
  ['esc', t.keys.close],
  ['J / K', t.keys.move],
]

const useReaderWidth = () => {
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
  return { panesWidth, readerWidth, setPanes }
}

const MailPage = () => {
  const t = useT()
  const { panesWidth, readerWidth, setPanes } = useReaderWidth()
  const hasAgent = useHasAgent()
  const { filter: picked, mailbox, q, thread } = Route.useSearch()
  const inboxView = useSubscription(inboxViewStore)
  const { filter, grouping, isSearching, shownFilter } = listModeOf(
    q,
    picked ?? inboxView
  )
  const navigate = useNavigate({ from: Route.fullPath })
  const listRef = useRef<HTMLUListElement>(null)
  const closeThread = () =>
    navigate({ search: (prev) => ({ ...prev, thread: undefined }) })
  const [pickedIds, setPickedIds] = useState(NONE_PICKED)
  const {
    addToSearch,
    applySearch,
    isSearchStart,
    leaveSearch,
    search,
    onSearchInput,
    searchFor,
    searchRef,
  } = useSearchField({
    isPicking: pickedIds.size > 0,
    isSearching,
    onCloseThread: closeThread,
    q,
    thread,
  })
  const [cursor, setCursor] = useState(HIDDEN_CURSOR)
  const [keptUnread, setKeptUnread] = useState<KeptUnread>(new Set())
  const [unfolded, setUnfolded] = useState<ReadonlySet<GroupKey>>(new Set())
  const [relatedOf, setRelatedOf] = useState<string | null>(null)
  const listKey = `${filter}:${mailbox ?? ''}:${q ?? ''}`
  const [cursorListKey, setCursorListKey] = useState(listKey)
  if (cursorListKey !== listKey) {
    setCursorListKey(listKey)
    setCursor(HIDDEN_CURSOR)
    setKeptUnread(new Set())
    setUnfolded(new Set())
    setRelatedOf(null)
    setPickedIds(NONE_PICKED)
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
    pinned,
    rows: listedRows,
    total: listedTotal,
  } = useListRows({
    filter,
    mailbox,
    q,
    typed: search.trim(),
  })
  const older = useOlderRows({ filter, isLoading: isFetching, mailbox, q })
  const { groupStarts, rows: groupedRows } = useGroupedRows(
    listedRows,
    grouping,
    keptUnread,
    unfolded
  )
  const toggleGroup = (key: GroupKey) =>
    setUnfolded((current) => {
      const next = new Set(current)
      if (!next.delete(key)) {
        next.add(key)
      }
      return next
    })
  const pinnedRows = usePinnedRows(pinned, groupedRows)
  const related = useRelatedRows({
    anchor: relatedOf,
    isEnabled: !isSearching,
    mailbox,
    pinnedCount: pinnedRows.shown,
    rows: pinnedRows.rows,
  })
  const { rows } = related
  const total = isDrafts ? listedTotal : rows.length
  useCursorOnOpenThread({ rows, setCursor, thread })
  const picks = usePicks({
    cursorRow: rows[cursor],
    isEnabled: !thread,
    picks: [pickedIds, setPickedIds],
    rows,
  })
  const isPicking = picks.picked.length > 0
  const list = useListActions({
    filter,
    isEnabled: !thread,
    onUnpick: picks.onUnpick,
    picked: picks.picked,
    row: rows[cursor],
  })
  const {
    actions,
    canSnooze,
    hints,
    setSnoozeOpenId,
    snoozeOpenId,
    sweep,
    sweepHint,
  } = list

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
      const { message } = row
      setCursor(index)
      if (!('isRelated' in row) && message.threadId !== relatedOf) {
        setRelatedOf(null)
      }
      if (message.isUnread) {
        setKeptUnread((kept) => new Set(kept).add(message.threadId))
      }
      if (q) {
        rememberSearch(q)
      }
      void navigate({
        search: (prev) => ({ ...prev, thread: message.threadId }),
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
  useHotkey('ArrowDown', () => moveCursor(1), {
    enabled: total > 0,
    ignoreInputs: false,
    target: searchRef,
  })
  const canShowRelated = related.canShowFor(rows[cursor])
  useHotkey(
    'ArrowRight',
    () => setRelatedOf(rows[cursor]?.message.threadId ?? null),
    { enabled: canShowRelated }
  )
  useHotkey(
    'ArrowLeft',
    () => {
      setCursor(related.anchorIndex)
      setRelatedOf(null)
    },
    { enabled: related.anchorIndex !== -1 }
  )
  const showFilter = (next: Filter) => {
    if (isInboxView(next)) {
      inboxViewStore.set(next)
      posthog.capture('mail_view_picked', { view: next })
    }
    return navigate({
      search: (prev) => ({
        ...prev,
        filter: next,
        q: undefined,
        thread: undefined,
      }),
    })
  }
  useHotkey('[', () => showFilter(stepFilter(shownFilter, -1)))
  useHotkey(']', () => showFilter(stepFilter(shownFilter, 1)))
  const pickMailbox = (next: string | undefined) =>
    navigate({
      search: (prev) => ({ ...prev, mailbox: next, thread: undefined }),
    })

  const cards = cardsOf(rows, groupStarts, pinnedRows.shown)
  const listItems: ListWindowItem[] = [
    ...headItemsOf({
      cursor,
      drafts,
      open,
      pinnedCount: pinned.length,
      pinnedRows,
    }),
    ...rows.flatMap((row, index): ListWindowItem[] => {
      if ('isRelated' in row) {
        const isFirst = !('isRelated' in (rows[index - 1] ?? {}))
        return [
          {
            card: cards[index],
            isCursor: index === cursor,
            key: `related:${row.message.id}`,
            render: (item) => (
              <RelatedRow
                key={item.key}
                row={row}
                isCursor={index === cursor}
                isFirst={isFirst}
                isLast={!('isRelated' in (rows[index + 1] ?? {}))}
                isOpen={row.message.threadId === thread}
                item={item}
                onOpen={() => open(index)}
              />
            ),
            size: isFirst ? ROW_SIZE.relatedFirst : ROW_SIZE.line,
          },
        ]
      }
      const isPinnedRow = index < pinnedRows.shown
      const Row = isPinnedRow ? PinnedRow : MailRow
      const group = groupStarts.get(row.message.id)
      const mailItem: ListWindowItem = {
        card: cards[index],
        isCursor: index === cursor,
        key: row.message.id,
        render: (item) => (
          <Row
            key={item.key}
            row={row}
            actions={actions}
            canSnooze={canSnooze}
            hidesCategory={grouping === 'categories'}
            isCursor={index === cursor}
            isOpen={row.message.threadId === thread}
            isPicked={picks.pickedIds.has(row.message.id)}
            isPicking={isPicking}
            isSnoozeOpen={snoozeOpenId === row.message.id}
            item={item}
            onOpen={() => open(index)}
            onPick={() => picks.onToggle(row.message.id)}
            onSnoozeOpenChange={(isOpen) =>
              setSnoozeOpenId(isOpen ? row.message.id : null)
            }
            sweep={sweep}
          />
        ),
        size: isPinnedRow ? ROW_SIZE.line : ROW_SIZE.mail,
      }
      if (!group) {
        // Pins and the ungrouped list under them are two cards; without a header between, they would touch.
        return cards[index - 1] === 'pinned' && cards[index] === 'list'
          ? [
              {
                key: 'pinned-gap',
                render: (item) => (
                  <ListRow key={item.key} item={item} className="h-5" />
                ),
                size: 20,
              },
              mailItem,
            ]
          : [mailItem]
      }
      return [
        {
          isSticky: true,
          key: `group:${group.key}`,
          render: (item) => (
            <GroupHeader
              key={item.key}
              group={group}
              isPicking={isPicking}
              isUnfolded={unfolded.has(group.key)}
              item={item}
              onMarkRead={markReadOf(group.rows, actions.markRead.mutate)}
              onPick={() =>
                picks.onPickGroup(group.rows.map(({ message }) => message.id))
              }
              onToggle={() => toggleGroup(group.key)}
              pickedIds={picks.pickedIds}
            />
          ),
          size: ROW_SIZE.header,
        },
        mailItem,
      ]
    }),
  ]

  return (
    <ResizableGroup ref={setPanes} className="flex min-h-0 flex-1">
      <ResizablePanel className="flex min-w-0">
        <section
          aria-label={t.nav.mail}
          className="flex min-w-0 flex-1 flex-col border-r"
        >
          <PickedBar list={list} picks={picks}>
            {isSearching ? (
              <div className="mx-auto flex w-full max-w-[calc(var(--container-3xl)+3rem)] items-center gap-2 px-6 py-3">
                <IconButton
                  icon={ArrowLeft01Icon}
                  label={t.mail.find.back}
                  variant="ghost-muted"
                  size="icon-sm"
                  onClick={leaveSearch}
                />
                <InputGroup size="sm">
                  <InputGroupAddon>
                    <HugeiconsIcon icon={Search01Icon} strokeWidth={2} />
                  </InputGroupAddon>
                  <InputGroupInput
                    ref={searchRef}
                    autoFocus
                    defaultValue={search}
                    onChange={(event) => onSearchInput(event.target.value)}
                    placeholder={t.mail.search}
                    aria-label={t.mail.search}
                  />
                  {isSearchPending && (
                    <InputGroupAddon align="inline-end">
                      <Spinner
                        className="text-muted-foreground"
                        label={t.mail.find.searching}
                      />
                    </InputGroupAddon>
                  )}
                </InputGroup>
                <MailboxSelect
                  mailbox={mailbox}
                  mailboxes={mailboxes}
                  onChange={pickMailbox}
                />
              </div>
            ) : (
              <div className="mx-auto flex w-full max-w-[calc(var(--container-3xl)+3rem)] items-center gap-2 px-6 py-3">
                <ViewPicker
                  filter={shownFilter}
                  unread={unread}
                  onChange={showFilter}
                />
                <MailboxSelect
                  mailbox={mailbox}
                  mailboxes={mailboxes}
                  onChange={pickMailbox}
                />
                <div className="ml-auto flex items-center gap-3">
                  <InGmailCount filter={shownFilter} mailbox={mailbox} />
                  <IconButton
                    icon={Search01Icon}
                    label={t.mail.find.open}
                    shortcut={<Kbd>/</Kbd>}
                    variant="outline"
                    size="icon-sm"
                    onClick={() => applySearch('')}
                  />
                </div>
              </div>
            )}
          </PickedBar>
          {isSearchStart && (
            <MailSearchStart onAdd={addToSearch} onSearch={searchFor} />
          )}
          {total === 0 && !isSearchStart && (
            <MailListEmpty
              hasOlder={older.hasMore}
              filter={filter}
              isPending={isFetching || isSearchPending}
              isSearch={isSearching}
              mailboxes={mailboxes}
            />
          )}
          <ul
            ref={listRef}
            className={cn(
              'overflow-y-auto px-6 pb-6',
              total > 0 && 'flex-1',
              isFetching && 'opacity-70'
            )}
          >
            <ListWindow
              isSearching={isSearching}
              items={listItems}
              listKey={listKey}
              scroller={listRef}
            />
            <OlderRowsLoader {...older} />
          </ul>
          {!thread && (
            <KeyHints
              hints={listHintsOf({
                canShowRelated,
                hints,
                isPicking,
                isSearching,
                t,
                total,
              })}
            />
          )}
        </section>
      </ResizablePanel>
      <ResizableSeparator />
      {/* Held shut until the panes are measured: opening at the remembered width and then clamping it springs the width. */}
      <ResizablePanel
        className="flex"
        collapsed={!thread || panesWidth === 0}
        transition={{ duration: 0 }}
        size={readerWidth}
        minSize={READER_WIDTH.min}
        maxSize={READER_WIDTH.max}
        onSizeChange={(width) => readerWidthStore.set(width)}
      >
        {thread && (
          <div className="bg-background flex min-w-0 flex-1 flex-col">
            <ThreadView
              key={thread}
              canOpenFullPage
              isSnoozed={filter === 'snoozed'}
              threadId={thread}
              onClose={closeThread}
              onDone={closeThread}
            />
            <KeyHints
              hints={readerHintsOf({
                hasAgent,
                isPinned: rows.some(
                  ({ message }) =>
                    message.threadId === thread && message.isPinned
                ),
                sweepHint,
                t,
              })}
            />
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
      "'focused' | 'unread' | 'categories' | 'inbox' | 'snoozed' | 'drafts' | 'archive' | 'spam' | 'trash'",
    'mailbox?': 'string.uuid',
    'q?': 'string',
    'thread?': 'string',
  }),
})
