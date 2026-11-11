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
import { Tabs, TabsList, TabsTrigger } from '@fewmail/ui/components/tabs'
import { cn } from '@fewmail/ui/lib/utils'
import {
  Archive02Icon,
  Clock01Icon,
  Delete02Icon,
  Mail01Icon,
  Search01Icon,
} from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
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
import { useEffect, useRef, useState } from 'react'
import { useSubscription } from 'seitu/react'
import { createWebStorageValue } from 'seitu/web'

import { useCompose } from '~/components/compose/compose-context'
import { KeyHints } from '~/components/key-hints'
import { ExtractedChips, ImportanceDot } from '~/components/mail-meta'
import {
  SnoozeMenuItems,
  ThreadView,
  useMailActions,
} from '~/components/thread-view'
import { useDates, useT } from '~/lib/i18n'
import { useHasAgent } from '~/lib/me'
import { orpc } from '~/lib/orpc'

const FILTERS = [
  'inbox',
  'important',
  'needs_reply',
  'quiet',
  'snoozed',
  'drafts',
  'spam',
] as const

type Filter = (typeof FILTERS)[number]

const stepFilter = (filter: Filter, step: number) =>
  FILTERS[(FILTERS.indexOf(filter) + step + FILTERS.length) % FILTERS.length] ??
  filter

const ALL_MAILBOXES = 'all'

const isCounted = (
  filter: Filter
): filter is keyof RouterOutputs['mail']['unread'] =>
  filter !== 'snoozed' && filter !== 'spam' && filter !== 'drafts'

const READER_WIDTH = { default: 640, max: '70%', min: 420 } as const

const readerWidthStore = createWebStorageValue({
  defaultValue: READER_WIDTH.default as number,
  key: 'fewmail.reader-width',
  schema: type('number'),
  type: 'localStorage',
})

type MailRowData = RouterOutputs['mail']['list'][number]

const MailRowMeta = ({
  insight,
  message,
}: {
  insight: MailRowData['analysis']
  message: MailRowData['message']
}) => {
  const t = useT()
  if (
    !insight &&
    !message.hasAttachments &&
    (message.bulkCount ?? 0) < BULK_THRESHOLD
  ) {
    return null
  }
  return (
    <span
      className={cn(
        'text-muted-foreground flex flex-wrap items-center gap-1.5 pl-4 text-xs'
      )}
    >
      {insight && <span>{t.category[insight.category]}</span>}
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
}: {
  actions: ReturnType<typeof useMailActions>
  canSnooze: boolean
  isSnoozeOpen: boolean
  messageId: string
  onSnoozeOpenChange: (open: boolean) => void
}) => {
  const t = useT()
  const target = { messageId }
  return (
    <span
      className={cn(
        'absolute top-1.5 right-4 flex bg-inherit opacity-0 group-hover:opacity-100',
        isSnoozeOpen && 'opacity-100'
      )}
    >
      <IconButton
        icon={Archive02Icon}
        label={t.mail.archive}
        shortcut={<Kbd>E</Kbd>}
        size="icon-sm"
        variant="ghost-muted"
        onClick={() => actions.archive.mutate(target)}
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
        shortcut={<Kbd>#</Kbd>}
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
}: {
  actions: ReturnType<typeof useMailActions>
  canSnooze: boolean
  isCursor: boolean
  isOpen: boolean
  isSnoozeOpen: boolean
  onOpen: () => void
  onSnoozeOpenChange: (open: boolean) => void
  row: MailRowData
}) => {
  const t = useT()
  const dates = useDates()

  return (
    <li
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
          <span className="text-muted-foreground flex-1 text-xs tabular-nums">
            {threadSize > 1 && threadSize}
          </span>
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
        <span data-mask className="text-muted-foreground truncate pl-4 text-sm">
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
        <MailRowMeta insight={analysis} message={message} />
      </button>
      <MailRowActions
        actions={actions}
        canSnooze={canSnooze}
        isSnoozeOpen={isSnoozeOpen}
        messageId={message.id}
        onSnoozeOpenChange={onSnoozeOpenChange}
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
  const deleteDraft = useMutation(
    orpc.mail.deleteDraft.mutationOptions({
      onSuccess: () =>
        queryClient.invalidateQueries({ queryKey: orpc.mail.drafts.key() }),
    })
  )
  const open = (index: number) => {
    const saved = rows[index]
    if (saved) {
      openCompose({
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
  const remove = ({ id, mailboxId }: DraftRowData) =>
    deleteDraft.mutate({ id, mailboxId })
  return { isFetching, open, remove, rows }
}

const useListRows = ({
  filter,
  mailbox,
  q,
}: {
  filter: Filter
  mailbox: string | undefined
  q: string | undefined
}) => {
  const isDrafts = filter === 'drafts'
  const mail = useQuery(
    orpc.mail.list.queryOptions({
      input: isDrafts
        ? skipToken
        : { filter, mailboxId: mailbox, ...(q && { search: q }) },
    })
  )
  const drafts = useDrafts({ isEnabled: isDrafts, mailbox, q })
  const rows = mail.data ?? []
  return {
    drafts,
    isDrafts,
    isFetching: isDrafts ? drafts.isFetching : mail.isFetching,
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
  const keys = { enabled: isEnabled && !!messageId }
  useHotkey('E', () => messageId && actions.archive.mutate({ messageId }), keys)
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
  const hints: [string, string][] =
    filter === 'drafts'
      ? []
      : [
          ['E', t.keys.archive],
          ...(canSnooze ? [['H', t.keys.snooze] as [string, string]] : []),
        ]
  return { actions, canSnooze, hints, setSnoozeOpenId, snoozeOpenId }
}

const MailPage = () => {
  const t = useT()
  const readerWidth = useSubscription(readerWidthStore)
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
  const { drafts, isDrafts, isFetching, rows, total } = useListRows({
    filter,
    mailbox,
    q,
  })

  const { actions, canSnooze, hints, setSnoozeOpenId, snoozeOpenId } =
    useListActions({
      filter,
      isEnabled: !thread,
      messageId: rows[cursor]?.message.id,
    })

  useEffect(() => {
    listRef.current?.children[cursor]?.scrollIntoView({ block: 'nearest' })
  }, [cursor])

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

  useHotkey('J', () => setCursor((index) => Math.min(total - 1, index + 1)))
  useHotkey('ArrowDown', () =>
    setCursor((index) => Math.min(total - 1, index + 1))
  )
  useHotkey('K', () => setCursor((index) => Math.max(0, index - 1)))
  useHotkey('ArrowUp', () => setCursor((index) => Math.max(0, index - 1)))
  useHotkey('Enter', () => open(cursor))
  useHotkey('O', () => open(cursor))
  const showFilter = (next: Filter) =>
    navigate({
      search: (prev) => ({ ...prev, filter: next, thread: undefined }),
    })
  useHotkey('[', () => showFilter(stepFilter(filter, -1)))
  useHotkey(']', () => showFilter(stepFilter(filter, 1)))
  useHotkey('/', () => searchRef.current?.focus())
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
  useHotkey(
    'Enter',
    () =>
      navigate({
        search: (prev) => ({
          ...prev,
          q: search.trim() || undefined,
          thread: undefined,
        }),
      }),
    { ignoreInputs: false, target: searchRef }
  )
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
                <Kbd className="group-focus-within/input-group:hidden">/</Kbd>
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
                      size="xs"
                      variant="flat"
                      className="max-w-48"
                    >
                      <SelectValue data-mask={mailbox ? true : undefined} />
                    </SelectTrigger>
                    <SelectContent align="end">
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
              </InputGroupAddon>
            </InputGroup>
            <Tabs value={filter} onValueChange={(value) => showFilter(value)}>
              <TabsList
                variant="pill"
                className="scroll-fade-x max-w-full scrollbar-none justify-start overflow-x-auto"
              >
                {FILTERS.map((value) => (
                  <TabsTrigger key={value} value={value}>
                    {t.mail.filter[value]}
                    {isCounted(value) && Boolean(unread?.[value]) && (
                      <span className="text-xs tabular-nums opacity-60">
                        {unread?.[value]}
                      </span>
                    )}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
          </div>
          {total === 0 && !isFetching && (
            <Empty size="sm">
              <EmptyHeader>
                <EmptyMedia variant="muted">
                  <HugeiconsIcon icon={Mail01Icon} />
                </EmptyMedia>
                <EmptyTitle>{t.mail.empty}</EmptyTitle>
                <EmptyDescription>{t.mail.emptyHint}</EmptyDescription>
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
              <MailRow
                key={row.message.id}
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
              />
            ))}
          </ul>
          {!thread && (
            <KeyHints
              hints={[
                ['J / K', t.keys.move],
                ['⏎', t.keys.open],
                ...hints,
                ['[ / ]', t.keys.filter],
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
                ['E', t.keys.archive],
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
      "'inbox' | 'important' | 'needs_reply' | 'quiet' | 'snoozed' | 'drafts' | 'spam'",
    'mailbox?': 'string.uuid',
    'q?': 'string',
    'thread?': 'string',
  }),
})
