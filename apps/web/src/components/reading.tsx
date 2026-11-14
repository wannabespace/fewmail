import type { RouterOutputs } from '@fewmail/api/router'
import { Badge } from '@fewmail/ui/components/badge'
import { Button } from '@fewmail/ui/components/button'
import {
  SettingsGroup,
  SettingsRow,
} from '@fewmail/ui/components/custom/settings-group'
import { Empty, EmptyDescription } from '@fewmail/ui/components/empty'
import { Kbd } from '@fewmail/ui/components/kbd'
import { Skeleton } from '@fewmail/ui/components/skeleton'
import { News01Icon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { useHotkey } from '@tanstack/react-hotkeys'
import { useQuery } from '@tanstack/react-query'
import { Link, useNavigate } from '@tanstack/react-router'
import { isToday } from 'date-fns'
import { Fragment, useState } from 'react'

import { ListenButton } from '~/components/listen-button'
import { useDates, useT } from '~/lib/i18n'
import { prefetchThread, warmThread } from '~/lib/mail-db'
import { orpc } from '~/lib/orpc'

type Row = RouterOutputs['reading']['list'][number]
type Summary = NonNullable<RouterOutputs['reading']['summary']>

const senderOf = (row: Row) => row.fromName ?? row.fromEmail

/** The day's newsletters and the agent's one summary of them, written only when there are newsletters. */
export const useReading = () => {
  const { data: rows = [], isPending } = useQuery(
    orpc.reading.list.queryOptions()
  )
  const summary = useQuery(
    orpc.reading.summary.queryOptions({ enabled: rows.length > 0 })
  )
  return {
    isPending,
    isWriting: summary.isPending,
    rows,
    summary: summary.data ?? undefined,
  }
}

const citedIn = (summary: Summary | undefined) =>
  new Set(
    summary?.sections.flatMap(({ sentences }) =>
      sentences.flatMap(({ messageIds }) => messageIds)
    )
  )

const SummarySkeleton = () => (
  <div className="flex flex-col gap-3">
    <Skeleton className="h-5 w-full" />
    <Skeleton className="h-5 w-11/12" />
    <Skeleton className="h-5 w-3/5" />
  </div>
)

/** Home's glance at the newsletters, read like the header (no card, see `patterns.md`): the summary's opening and its topics, the whole of it one key away. */
export const ReadingBrief = () => {
  const t = useT()
  const { isWriting, rows, summary } = useReading()

  if (rows.length === 0) {
    return null
  }
  return (
    <section aria-label={t.reading.title} className="flex flex-col gap-3">
      <div className="flex min-h-7 items-center gap-3">
        <h2 className="text-muted-foreground text-xs font-medium">
          {t.reading.summary}
        </h2>
        <Button
          size="xs"
          variant="ghost-muted"
          className="ml-auto"
          render={
            <Link
              to="/home"
              search={(prev) => ({ ...prev, page: 'reading' })}
            />
          }
        >
          <HugeiconsIcon
            icon={News01Icon}
            strokeWidth={2}
            data-icon="inline-start"
          />
          {t.reading.digest(rows.length)} <Kbd>N</Kbd>
        </Button>
      </div>
      {isWriting ? (
        <SummarySkeleton />
      ) : (
        <p data-mask className="text-brief text-foreground/80 font-serif">
          {summary?.intro ?? t.reading.lead}
        </p>
      )}
      {!!summary?.sections.length && (
        <p data-mask className="text-muted-foreground font-serif">
          {summary.sections.map(({ title }) => title).join(' · ')}
        </p>
      )}
    </section>
  )
}

/** The agent's one text over every newsletter; each sentence ends on the newsletters it came from. */
const SummaryText = ({ rows, summary }: { rows: Row[]; summary: Summary }) => {
  const t = useT()
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
          render={
            <Link
              to="/home"
              search={(prev) => ({ ...prev, thread: row.threadId })}
            />
          }
          onPointerEnter={() => {
            void warmThread(row.threadId)
          }}
        >
          {senderOf(row)}
        </Badge>
      )
    )
  }

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
                        to="/home"
                        search={(prev) => ({ ...prev, thread: row.threadId })}
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
    </>
  )
}

/** Where a newsletter stands against the summary: in it, worth reading, left out, or come since. */
const useNoteOf = (summary: Summary | undefined) => {
  const t = useT()
  const cited = citedIn(summary)
  const worth = new Set(summary?.worth.map(({ messageId }) => messageId))
  return (row: Row) => {
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
}

/** Home's reading view (`N`): the whole summary, then every newsletter; J / K walk them, also while one is open. */
export const ReadingView = ({ thread }: { thread: string | undefined }) => {
  const t = useT()
  const dates = useDates()
  const navigate = useNavigate()
  const { isPending, isWriting, rows, summary } = useReading()
  const noteOf = useNoteOf(summary)
  const [cursor, setCursor] = useState<number | null>(null)
  const current =
    cursor ?? rows.findIndex(({ threadId }) => threadId === thread)

  const open = (threadId: string | undefined) =>
    navigate({
      replace: !!thread,
      search: (prev) => ({ ...prev, thread: threadId }),
      to: '/home',
    })
  const move = (step: number) => {
    const next = Math.max(0, Math.min(rows.length - 1, current + step))
    const threadId = rows[next]?.threadId
    setCursor(next)
    if (threadId) {
      void prefetchThread(threadId)
      if (thread) {
        void open(threadId)
      }
    }
  }
  const keys = { enabled: rows.length > 0 }
  useHotkey('J', () => move(1), keys)
  useHotkey('ArrowDown', () => move(1), keys)
  useHotkey('K', () => move(-1), keys)
  useHotkey('ArrowUp', () => move(-1), keys)
  useHotkey('Enter', () => open(rows[current]?.threadId), {
    enabled: current !== -1 && !thread,
  })

  const cited = citedIn(summary)
  const leftOut = summary?.messageIds.filter((id) => !cited.has(id)).length ?? 0
  const since = summary
    ? rows.filter(({ id }) => !summary.messageIds.includes(id)).length
    : 0

  return (
    <>
      <header className="flex flex-col gap-3">
        <h1 className="text-display font-serif tracking-tight">
          {t.reading.summary}
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
      {rows.length > 0 && isWriting && <SummarySkeleton />}
      {rows.length > 0 && !isWriting && !summary && (
        <p className="text-brief text-muted-foreground font-serif">
          {t.reading.lead}
        </p>
      )}
      {summary && <SummaryText rows={rows} summary={summary} />}
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
      {rows.length > 0 && (
        <SettingsGroup title={t.reading.digest(rows.length)}>
          {rows.map((row, index) => (
            <SettingsRow
              key={row.id}
              active={index === current}
              render={
                <Link
                  to="/home"
                  search={(prev) => ({ ...prev, thread: row.threadId })}
                  onPointerEnter={() => {
                    void warmThread(row.threadId)
                  }}
                  onClick={() => setCursor(index)}
                />
              }
              title={<span data-mask>{senderOf(row)}</span>}
              description={
                <>
                  <span data-mask>{row.subject}</span>
                  {' · '}
                  <span data-mask={!summary || undefined}>{noteOf(row)}</span>
                </>
              }
            >
              <span className="text-muted-foreground text-xs tabular-nums">
                {dates.format(
                  row.receivedAt,
                  isToday(row.receivedAt) ? 'HH:mm' : 'd MMM'
                )}
              </span>
            </SettingsRow>
          ))}
        </SettingsGroup>
      )}
    </>
  )
}
