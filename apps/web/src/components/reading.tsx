import type { RouterOutputs } from '@fewmail/api/router'
import { Badge } from '@fewmail/ui/components/badge'
import { Button } from '@fewmail/ui/components/button'
import { MotionCollapse } from '@fewmail/ui/components/collapse.motion'
import {
  SettingsGroup,
  SettingsRow,
} from '@fewmail/ui/components/custom/settings-group'
import { Kbd } from '@fewmail/ui/components/kbd'
import { Skeleton } from '@fewmail/ui/components/skeleton'
import {
  ArrowDown01Icon,
  ArrowUp01Icon,
  News01Icon,
} from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { useHotkey } from '@tanstack/react-hotkeys'
import { useQuery } from '@tanstack/react-query'
import { Link, useNavigate } from '@tanstack/react-router'
import { isToday } from 'date-fns'
import { AnimatePresence } from 'motion/react'
import { Fragment, useEffect, useRef, useState } from 'react'

import { ListenButton } from '~/components/listen-button'
import { useDates, useT } from '~/lib/i18n'
import { prefetchThread, warmThread } from '~/lib/mail-db'
import { orpc } from '~/lib/orpc'

type Row = RouterOutputs['reading']['list'][number]
type Summary = NonNullable<RouterOutputs['reading']['summary']>

const senderOf = (row: Row) => row.fromName ?? row.fromEmail

/** The day's newsletters and the agent's one summary of them, written only when there are newsletters. */
export const useReading = () => {
  const { data: rows = [] } = useQuery(orpc.reading.list.queryOptions())
  const summary = useQuery(
    orpc.reading.summary.queryOptions({ enabled: rows.length > 0 })
  )
  return {
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
      {summary.sections.map(({ sentences, title }) => (
        <section key={title} className="flex flex-col gap-2">
          <h3 data-mask className="text-brief font-serif font-semibold">
            {title}
          </h3>
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

/** Every newsletter under the whole summary; J / K walk them, also while one is open in the reader. */
const NewsletterList = ({
  rows,
  summary,
  thread,
}: {
  rows: Row[]
  summary: Summary | undefined
  thread: string | undefined
}) => {
  const t = useT()
  const dates = useDates()
  const navigate = useNavigate()
  const noteOf = useNoteOf(summary)
  const listRef = useRef<HTMLDivElement>(null)
  const [cursor, setCursor] = useState<number | null>(null)
  const openIndex = rows.findIndex(({ threadId }) => threadId === thread)
  const current = cursor ?? openIndex

  useEffect(() => {
    const row = listRef.current?.querySelectorAll('[data-slot="item"]')[current]
    row?.scrollIntoView({ block: 'nearest' })
  }, [current])

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
  // A thread opened from elsewhere on Home is not walked through the newsletters.
  const keys = { enabled: !thread || openIndex !== -1 }
  useHotkey('J', () => move(1), keys)
  useHotkey('ArrowDown', () => move(1), keys)
  useHotkey('K', () => move(-1), keys)
  useHotkey('ArrowUp', () => move(-1), keys)
  useHotkey('Enter', () => open(rows[current]?.threadId), {
    enabled: current !== -1 && !thread,
  })

  return (
    <div ref={listRef}>
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
    </div>
  )
}

/** What the summary left for later: newsletters with nothing new, and those that came after it. */
const SummaryGaps = ({ rows, summary }: { rows: Row[]; summary: Summary }) => {
  const t = useT()
  const cited = citedIn(summary)
  const leftOut = summary.messageIds.filter((id) => !cited.has(id)).length
  const since = rows.filter(({ id }) => !summary.messageIds.includes(id)).length
  if (leftOut === 0 && since === 0) {
    return null
  }
  return (
    <p className="text-muted-foreground text-sm">
      {[
        leftOut > 0 && t.reading.leftOut(leftOut),
        since > 0 && t.reading.since(since),
      ]
        .filter(Boolean)
        .join(' ')}
    </p>
  )
}

/**
 * What your newsletters said, on Home under the header: the opening and the topics, and `N` (`?page=reading`) unfolds
 * the whole summary and every newsletter in place, so reading them never leaves Home.
 */
export const ReadingSection = ({
  isOpen,
  thread,
}: {
  isOpen: boolean
  thread: string | undefined
}) => {
  const t = useT()
  const { isWriting, rows, summary } = useReading()
  const sectionRef = useRef<HTMLElement>(null)
  useEffect(() => {
    if (isOpen) {
      sectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }, [isOpen])

  if (rows.length === 0) {
    return null
  }
  return (
    <section
      ref={sectionRef}
      aria-label={t.reading.title}
      className="flex scroll-mt-12 flex-col gap-3"
    >
      <div className="flex min-h-8 items-center gap-2">
        <h2 className="text-muted-foreground text-xs font-medium">
          {t.reading.summary}
        </h2>
        <div className="ml-auto flex gap-2">
          {isOpen && summary && <ListenButton path="/voice/reading" />}
          <Button
            size="sm"
            variant="ghost-muted"
            render={
              <Link
                to="/home"
                search={(prev) => ({
                  ...prev,
                  page: isOpen ? undefined : 'reading',
                })}
              />
            }
            shortcut={<Kbd>N</Kbd>}
          >
            <HugeiconsIcon
              icon={News01Icon}
              strokeWidth={2}
              data-icon="inline-start"
            />
            {t.reading.digest(rows.length)}
            <HugeiconsIcon
              icon={isOpen ? ArrowUp01Icon : ArrowDown01Icon}
              strokeWidth={2}
              data-icon="inline-end"
            />
          </Button>
        </div>
      </div>
      {isWriting ? (
        <SummarySkeleton />
      ) : (
        <p
          data-mask={!!summary || undefined}
          className="text-brief text-foreground/80 font-serif"
        >
          {summary?.intro ?? t.reading.lead}
        </p>
      )}
      <AnimatePresence initial={false}>
        {!isOpen && !!summary?.sections.length && (
          <MotionCollapse key="topics">
            <p data-mask className="text-muted-foreground font-serif">
              {summary.sections.map(({ title }) => title).join(' · ')}
            </p>
          </MotionCollapse>
        )}
        {isOpen && (
          <MotionCollapse key="whole">
            <div className="flex flex-col gap-6 pt-2">
              {summary && <SummaryText rows={rows} summary={summary} />}
              {summary && <SummaryGaps rows={rows} summary={summary} />}
              <NewsletterList rows={rows} summary={summary} thread={thread} />
            </div>
          </MotionCollapse>
        )}
      </AnimatePresence>
    </section>
  )
}
