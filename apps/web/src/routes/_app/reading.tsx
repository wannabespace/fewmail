import type { RouterOutputs } from '@fewmail/api/router'
import { Badge } from '@fewmail/ui/components/badge'
import {
  SettingsGroup,
  SettingsRow,
} from '@fewmail/ui/components/custom/settings-group'
import { Empty, EmptyDescription } from '@fewmail/ui/components/empty'
import { Skeleton } from '@fewmail/ui/components/skeleton'
import { cn } from '@fewmail/ui/lib/utils'
import { useHotkey } from '@tanstack/react-hotkeys'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { type } from 'arktype'
import { isToday } from 'date-fns'
import { Fragment, useState } from 'react'
import { useSubscription } from 'seitu/react'
import { createMediaQuery } from 'seitu/web'

import { KeyHints } from '~/components/key-hints'
import { ListenButton } from '~/components/listen-button'
import { ThreadView } from '~/components/thread-view'
import { useDates, useT } from '~/lib/i18n'
import { prefetchThread, warmThread } from '~/lib/mail-db'
import { useHasAgent } from '~/lib/me'
import { orpc } from '~/lib/orpc'
import { warmQuery } from '~/lib/query-client'

type Row = RouterOutputs['reading']['list'][number]
type Summary = NonNullable<RouterOutputs['reading']['summary']>

/** Too narrow for the list beside the summary: the list goes under it. */
const narrowScreen = createMediaQuery({ query: '(max-width: 1100px)' })

const senderOf = (row: Row) => row.fromName ?? row.fromEmail

const ReadingPage = () => {
  const t = useT()
  const dates = useDates()
  const queryClient = useQueryClient()
  const navigate = useNavigate({ from: Route.fullPath })
  const { thread } = Route.useSearch()
  const hasAgent = useHasAgent()
  const isNarrow = useSubscription(narrowScreen)
  const {
    data: rows = [],
    dataUpdatedAt,
    isPending,
  } = useQuery(orpc.reading.list.queryOptions())
  const summary =
    useQuery(
      orpc.reading.summary.queryOptions({
        enabled: hasAgent && rows.length > 0,
      })
    ).data ?? undefined
  const [cursor, setCursor] = useState(0)
  const [pointed, setPointed] = useState<string>()

  const open = (threadId: string | undefined) => {
    void navigate({ replace: !!thread, search: { thread: threadId } })
  }

  const listKeys = { enabled: rows.length > 0 }
  const move = (step: number) => {
    const next = Math.max(0, Math.min(rows.length - 1, cursor + step))
    const threadId = rows[next]?.threadId
    setCursor(next)
    if (threadId) {
      void prefetchThread(threadId)
      if (thread) {
        open(threadId)
      }
    }
  }
  useHotkey('J', () => move(1), listKeys)
  useHotkey('ArrowDown', () => move(1), listKeys)
  useHotkey('K', () => move(-1), listKeys)
  useHotkey('ArrowUp', () => move(-1), listKeys)
  useHotkey('Enter', () => open(rows[cursor]?.threadId), listKeys)
  useHotkey('Escape', () => open(undefined), { enabled: !!thread })

  const issues = (
    <IssueList
      active={thread}
      cursor={rows[cursor]?.id}
      pointed={pointed}
      rows={rows}
      summary={summary}
      onOpen={(index) => {
        setCursor(index)
        open(rows[index]?.threadId)
      }}
    />
  )

  return (
    <main className="flex min-h-0 flex-1 overflow-hidden">
      {thread ? (
        <div className="bg-background flex min-w-0 flex-1 flex-col">
          <ThreadView
            key={thread}
            isSnoozed={false}
            threadId={thread}
            onClose={() => open(undefined)}
            onDone={() =>
              queryClient.invalidateQueries({ queryKey: orpc.reading.key() })
            }
          />
          <KeyHints
            hints={[
              ['J / K', t.keys.move],
              ['esc', hasAgent ? t.keys.summary : t.keys.close],
            ]}
          />
        </div>
      ) : (
        <div className="flex min-w-0 flex-1 flex-col">
          <div className="flex-1 overflow-y-auto">
            <div className="mx-auto flex max-w-3xl flex-col gap-8 px-10 pt-12 pb-16">
              <header className="flex flex-col gap-3">
                <p className="text-muted-foreground text-sm first-letter:uppercase">
                  {dataUpdatedAt > 0 &&
                    dates.format(dataUpdatedAt, 'EEEE, d MMMM')}
                  {rows.length > 0 && ` · ${t.reading.digest(rows.length)}`}
                </p>
                <h1 className="text-display font-serif tracking-tight">
                  {hasAgent ? t.reading.summary : t.reading.title}
                </h1>
                {summary && (
                  <div>
                    <ListenButton path="/voice/reading" />
                  </div>
                )}
              </header>
              {!isPending && rows.length === 0 && (
                <Empty>
                  <EmptyDescription>{t.reading.empty}</EmptyDescription>
                </Empty>
              )}
              {rows.length > 0 && !hasAgent && (
                <p className="text-brief text-muted-foreground font-serif">
                  {t.reading.lead}
                </p>
              )}
              {rows.length > 0 && hasAgent && (
                <SummaryText
                  rows={rows}
                  summary={summary}
                  onPoint={setPointed}
                />
              )}
              {isNarrow && issues}
            </div>
          </div>
          {rows.length > 0 && (
            <KeyHints
              hints={[
                ['J / K', t.keys.move],
                ['⏎', t.keys.open],
              ]}
            />
          )}
        </div>
      )}
      {!isNarrow && (
        <aside
          aria-label={t.reading.title}
          className="flex w-96 shrink-0 flex-col overflow-y-auto border-l"
        >
          {issues}
        </aside>
      )}
    </main>
  )
}

/** The agent's one text over every newsletter; each sentence ends on the newsletters it came from, which open beside it. */
const SummaryText = ({
  onPoint,
  rows,
  summary,
}: {
  onPoint: (rowId: string | undefined) => void
  rows: Row[]
  summary: Summary | undefined
}) => {
  const t = useT()
  if (!summary) {
    return (
      <div className="flex flex-col gap-3">
        <Skeleton className="h-5 w-full" />
        <Skeleton className="h-5 w-11/12" />
        <Skeleton className="h-5 w-3/5" />
      </div>
    )
  }
  const byId = new Map(rows.map((row) => [row.id, row]))
  const source = (rowId: string) => {
    const row = byId.get(rowId)
    return (
      row && (
        <Badge
          key={rowId}
          data-mask
          variant="source"
          className="mx-0.5 align-[0.15em]"
          render={<Link to="/reading" search={{ thread: row.threadId }} />}
          onPointerEnter={() => {
            onPoint(row.id)
            void warmThread(row.threadId)
          }}
          onPointerLeave={() => onPoint(undefined)}
        >
          {senderOf(row)}
        </Badge>
      )
    )
  }
  const cited = new Set(
    summary.sections.flatMap(({ sentences }) =>
      sentences.flatMap(({ messageIds }) => messageIds)
    )
  )
  const leftOut = summary.messageIds.filter((id) => !cited.has(id)).length
  const since = rows.filter(({ id }) => !summary.messageIds.includes(id)).length

  return (
    <>
      <p data-mask className="text-brief font-serif">
        {summary.intro}
      </p>
      {summary.sections.map(({ sentences, title }) => (
        <section key={title} className="flex flex-col gap-2">
          <h2 data-mask className="text-brief font-serif font-semibold">
            {title}
          </h2>
          <p data-mask className="text-brief font-serif">
            {sentences.map(({ messageIds, text }) => (
              <Fragment key={text}>
                {text}
                {messageIds.map(source)}{' '}
              </Fragment>
            ))}
          </p>
        </section>
      ))}
      {summary.worth.length > 0 && (
        <SettingsGroup title={t.reading.worth}>
          {summary.worth.flatMap(({ messageId, why }) => {
            const row = byId.get(messageId)
            return row
              ? [
                  <SettingsRow
                    key={messageId}
                    title={
                      <Link
                        to="/reading"
                        search={{ thread: row.threadId }}
                        data-mask
                      >
                        {senderOf(row)}
                      </Link>
                    }
                    description={<span data-mask>{why}</span>}
                  />,
                ]
              : []
          })}
        </SettingsGroup>
      )}
      {(leftOut > 0 || since > 0) && (
        <p className="text-muted-foreground text-sm">
          {[
            leftOut > 0 && t.reading.leftOut(leftOut),
            since > 0 && t.reading.since(since),
          ]
            .filter(Boolean)
            .join(' ')}
        </p>
      )}
    </>
  )
}

const IssueList = ({
  active,
  cursor,
  onOpen,
  pointed,
  rows,
  summary,
}: {
  active: string | undefined
  cursor: string | undefined
  onOpen: (index: number) => void
  pointed: string | undefined
  rows: Row[]
  summary: Summary | undefined
}) => {
  const t = useT()
  const dates = useDates()
  const cited = new Set(
    summary?.sections.flatMap(({ sentences }) =>
      sentences.flatMap(({ messageIds }) => messageIds)
    )
  )
  const worth = new Set(summary?.worth.map(({ messageId }) => messageId))
  const noteOf = (row: Row) => {
    if (!summary) {
      return row.summary
    }
    if (!summary.messageIds.includes(row.id)) {
      return t.reading.note.since
    }
    if (worth.has(row.id)) {
      return t.reading.worth
    }
    return cited.has(row.id) ? t.reading.note.inSummary : t.reading.note.leftOut
  }

  return (
    <ul>
      {rows.map((row, index) => (
        <li
          key={row.id}
          className={cn(
            'hover:bg-accent border-b',
            (row.id === cursor || row.id === pointed) && 'bg-accent',
            row.threadId === active && 'bg-secondary hover:bg-secondary'
          )}
        >
          <button
            type="button"
            tabIndex={-1}
            aria-current={row.threadId === active}
            onPointerEnter={() => {
              void warmThread(row.threadId)
            }}
            onClick={() => onOpen(index)}
            className="flex w-full cursor-pointer flex-col gap-1 px-5 py-3 text-left outline-none"
          >
            <span className="text-muted-foreground flex items-center gap-2 text-xs">
              <span data-mask className="min-w-0 flex-1 truncate">
                {senderOf(row)}
              </span>
              <span className="shrink-0 tabular-nums">
                {dates.format(
                  row.receivedAt,
                  isToday(row.receivedAt) ? 'HH:mm' : 'd MMM'
                )}
              </span>
            </span>
            <span data-mask className="line-clamp-2 text-sm font-medium">
              {row.subject}
            </span>
            <span
              data-mask={!summary || undefined}
              className="text-muted-foreground line-clamp-2 text-xs"
            >
              {noteOf(row)}
            </span>
          </button>
        </li>
      ))}
    </ul>
  )
}

export const Route = createFileRoute('/_app/reading')({
  component: ReadingPage,
  validateSearch: type({ 'thread?': 'string' }),
  loader: () => warmQuery(orpc.reading.list.queryOptions()),
})
