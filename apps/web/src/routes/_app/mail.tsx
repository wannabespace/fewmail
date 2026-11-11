import type { RouterOutputs } from '@fewmail/api/router'
import { BULK_THRESHOLD } from '@fewmail/shared/agent'
import {
  ResizableGroup,
  ResizablePanel,
  ResizableSeparator,
} from '@fewmail/ui/components/custom/resizable'
import { Empty, EmptyDescription } from '@fewmail/ui/components/empty'
import { Input } from '@fewmail/ui/components/input'
import { Tabs, TabsList, TabsTrigger } from '@fewmail/ui/components/tabs'
import { cn } from '@fewmail/ui/lib/utils'
import { useHotkey } from '@tanstack/react-hotkeys'
import { useQuery } from '@tanstack/react-query'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { type } from 'arktype'
import { isToday } from 'date-fns'
import { useEffect, useRef, useState } from 'react'
import { useSubscription } from 'seitu/react'
import { createWebStorageValue } from 'seitu/web'

import { KeyHints } from '~/components/key-hints'
import { ExtractedChips, ImportanceDot } from '~/components/mail-meta'
import { ThreadView } from '~/components/thread-view'
import { useDates, useT } from '~/lib/i18n'
import { useHasAgent } from '~/lib/me'
import { orpc } from '~/lib/orpc'

const FILTERS = [
  'inbox',
  'important',
  'needs_reply',
  'quiet',
  'snoozed',
  'spam',
] as const

type Filter = (typeof FILTERS)[number]

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

const MailRow = ({
  isCursor,
  isOpen,
  onOpen,
  row: { analysis, message },
}: {
  isCursor: boolean
  isOpen: boolean
  onOpen: () => void
  row: MailRowData
}) => {
  const t = useT()
  const dates = useDates()

  return (
    <li>
      <button
        type="button"
        tabIndex={-1}
        onClick={onOpen}
        aria-current={isOpen}
        className={cn(
          'flex w-full cursor-default flex-col gap-0.5 border-b px-5 py-2.5 text-left outline-none',
          isCursor ? 'bg-accent' : 'hover:bg-accent/60',
          isOpen && 'bg-secondary'
        )}
      >
        <span className="flex items-center gap-2 text-sm">
          {analysis ? (
            <ImportanceDot
              importance={analysis.importance}
              reason={analysis.reason}
            />
          ) : (
            <span className="bg-foreground/10 size-2 shrink-0 animate-pulse rounded-full" />
          )}
          <span
            data-mask
            className={cn(
              'max-w-1/3 shrink-0 truncate',
              message.isUnread ? 'font-semibold' : 'text-foreground/70'
            )}
          >
            {message.fromName ?? message.fromEmail}
          </span>
          <span
            data-mask
            className={cn(
              'min-w-0 flex-1 truncate',
              message.isUnread ? 'text-foreground/90' : 'text-foreground/60'
            )}
          >
            {message.subject}
          </span>
          <span className="text-muted-foreground shrink-0 text-xs tabular-nums">
            {dates.format(
              message.receivedAt,
              isToday(message.receivedAt) ? 'HH:mm' : 'd MMM'
            )}
          </span>
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
    </li>
  )
}

const MailPage = () => {
  const t = useT()
  const readerWidth = useSubscription(readerWidthStore)
  const hasAgent = useHasAgent()
  const { filter = 'inbox', q, thread } = Route.useSearch()
  const navigate = useNavigate({ from: Route.fullPath })
  const searchRef = useRef<HTMLInputElement>(null)
  const listRef = useRef<HTMLUListElement>(null)
  const [search, setSearch] = useState(q ?? '')
  const [cursor, setCursor] = useState(0)
  const listKey = `${filter}:${q ?? ''}`
  const [cursorListKey, setCursorListKey] = useState(listKey)
  if (cursorListKey !== listKey) {
    setCursorListKey(listKey)
    setCursor(0)
  }

  const { data: rows = [], isFetching } = useQuery(
    orpc.mail.list.queryOptions({ input: { filter, ...(q && { search: q }) } })
  )

  useEffect(() => {
    listRef.current?.children[cursor]?.scrollIntoView({ block: 'nearest' })
  }, [cursor])

  const open = (index: number) => {
    const row = rows[index]
    if (row) {
      setCursor(index)
      void navigate({
        search: (prev) => ({ ...prev, thread: row.message.threadId }),
      })
    }
  }

  useHotkey('J', () =>
    setCursor((index) => Math.min(rows.length - 1, index + 1))
  )
  useHotkey('ArrowDown', () =>
    setCursor((index) => Math.min(rows.length - 1, index + 1))
  )
  useHotkey('K', () => setCursor((index) => Math.max(0, index - 1)))
  useHotkey('ArrowUp', () => setCursor((index) => Math.max(0, index - 1)))
  useHotkey('Enter', () => open(cursor))
  useHotkey('O', () => open(cursor))
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
          <div className="flex flex-col gap-3 border-b px-5 pt-5 pb-3">
            <Input
              ref={searchRef}
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder={t.mail.search}
              aria-label={t.mail.search}
            />
            <Tabs
              value={filter}
              onValueChange={(value) =>
                navigate({
                  search: (prev) => ({
                    ...prev,
                    filter: value as Filter,
                    thread: undefined,
                  }),
                })
              }
            >
              <TabsList
                variant="line"
                className="scroll-fade-x max-w-full scrollbar-none justify-start overflow-x-auto"
              >
                {FILTERS.map((value) => (
                  <TabsTrigger key={value} value={value}>
                    {t.mail.filter[value]}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
          </div>
          <ul
            ref={listRef}
            className={cn('flex-1 overflow-y-auto', isFetching && 'opacity-70')}
          >
            {rows.length === 0 && !isFetching && (
              <li className="text-muted-foreground px-5 py-8 text-sm">
                {t.mail.empty}
              </li>
            )}
            {rows.map((row, index) => (
              <MailRow
                key={row.message.id}
                row={row}
                isCursor={index === cursor}
                isOpen={row.message.threadId === thread}
                onOpen={() => open(index)}
              />
            ))}
          </ul>
          {!thread && (
            <KeyHints
              hints={[
                ['J / K', t.keys.move],
                ['⏎', t.keys.open],
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
      "'inbox' | 'important' | 'needs_reply' | 'quiet' | 'snoozed' | 'spam'",
    'q?': 'string',
    'thread?': 'string',
  }),
})
