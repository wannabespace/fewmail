import type { RouterOutputs } from '@fewmail/api/router'
import { Badge } from '@fewmail/ui/components/badge'
import { Button } from '@fewmail/ui/components/button'
import { IconButton } from '@fewmail/ui/components/custom/icon-button'
import {
  SettingsGroup,
  SettingsRow,
} from '@fewmail/ui/components/custom/settings-group'
import { Kbd } from '@fewmail/ui/components/kbd'
import { Skeleton } from '@fewmail/ui/components/skeleton'
import { cn } from '@fewmail/ui/lib/utils'
import { Cancel01Icon, News01Icon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { useHotkey } from '@tanstack/react-hotkeys'
import { useQuery } from '@tanstack/react-query'
import { Link, useNavigate } from '@tanstack/react-router'
import { isToday } from 'date-fns'
import { useReducedMotion } from 'motion/react'
import { AnimateView } from 'motion/react-animate-view'
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
            <Link to="/mail/$threadId" params={{ threadId: row.threadId }} />
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
                        to="/mail/$threadId"
                        params={{ threadId: row.threadId }}
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

// Back from an email, the cursor is on the newsletter that was opened.
let lastOpened: string | undefined

/** Every newsletter under the whole summary; J / K walk them, ⏎ opens one. */
const NewsletterList = ({
  rows,
  summary,
}: {
  rows: Row[]
  summary: Summary | undefined
}) => {
  const t = useT()
  const dates = useDates()
  const navigate = useNavigate()
  const noteOf = useNoteOf(summary)
  const listRef = useRef<HTMLDivElement>(null)
  const [cursor, setCursor] = useState<number | null>(null)
  const current =
    cursor ?? rows.findIndex(({ threadId }) => threadId === lastOpened)

  useEffect(() => {
    const row = listRef.current?.querySelectorAll('[data-slot="item"]')[current]
    row?.scrollIntoView({ block: 'nearest' })
  }, [current])

  const open = (threadId: string) => {
    lastOpened = threadId
    void navigate({ params: { threadId }, to: '/mail/$threadId' })
  }
  const move = (step: number) => {
    const next = Math.max(0, Math.min(rows.length - 1, current + step))
    const threadId = rows[next]?.threadId
    setCursor(next)
    if (threadId) {
      void prefetchThread(threadId)
    }
  }
  useHotkey('J', () => move(1))
  useHotkey('ArrowDown', () => move(1))
  useHotkey('K', () => move(-1))
  useHotkey('ArrowUp', () => move(-1))
  useHotkey('Enter', () => rows[current] && open(rows[current].threadId), {
    enabled: current !== -1,
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
                to="/mail/$threadId"
                params={{ threadId: row.threadId }}
                onPointerEnter={() => {
                  void warmThread(row.threadId)
                }}
                onClick={() => {
                  lastOpened = row.threadId
                  setCursor(index)
                }}
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

// One clock for the folded head and the open pane, so the pane grows out of the section and shrinks back into it.
const useMorph = () =>
  useReducedMotion()
    ? { duration: 0 }
    : { duration: 0.4, ease: [0.32, 0.72, 0, 1] as const }

const ReadingIntro = ({
  isWriting,
  summary,
}: {
  isWriting: boolean
  summary: Summary | undefined
}) => {
  const t = useT()
  return isWriting ? (
    <SummarySkeleton />
  ) : (
    <p
      data-mask={!!summary || undefined}
      className="text-brief text-foreground/80 font-serif"
    >
      {summary?.intro ?? t.reading.lead}
    </p>
  )
}

/**
 * What your newsletters said, on Home under the header: the opening and the topics. `N` (`?page=reading`) grows it
 * into `ReadingPane`; while the pane is open the section keeps its place, unseen, so it shrinks back into the same spot.
 */
export const ReadingSection = ({ isOpen }: { isOpen: boolean }) => {
  const t = useT()
  const transition = useMorph()
  const { isWriting, rows, summary } = useReading()
  if (rows.length === 0) {
    return null
  }
  const section = (
    <section
      aria-label={t.reading.title}
      className={cn('flex flex-col gap-3', isOpen && 'invisible')}
    >
      <div className="flex min-h-8 items-center gap-2">
        <h2 className="text-muted-foreground text-xs font-medium">
          {t.reading.summary}
        </h2>
        <div className="ml-auto flex gap-2">
          {summary && <ListenButton path="/voice/reading" />}
          <Button
            size="sm"
            variant="ghost-muted"
            render={
              <Link
                to="/home"
                search={(prev) => ({ ...prev, page: 'reading' })}
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
          </Button>
        </div>
      </div>
      <ReadingIntro isWriting={isWriting} summary={summary} />
      {!!summary?.sections.length && (
        <p data-mask className="text-muted-foreground font-serif">
          {summary.sections.map(({ title }) => title).join(' · ')}
        </p>
      )}
    </section>
  )
  return isOpen ? (
    section
  ) : (
    <AnimateView name="reading" transition={transition}>
      {section}
    </AnimateView>
  )
}

/** The whole summary and every newsletter, over Home's column: it grows out of `ReadingSection` like an App Store card. */
export const ReadingPane = ({ isOpen }: { isOpen: boolean }) => {
  const t = useT()
  const navigate = useNavigate()
  const transition = useMorph()
  const { isWriting, rows, summary } = useReading()
  if (!isOpen || rows.length === 0) {
    return null
  }
  return (
    <AnimateView name="reading" transition={transition}>
      <div className="bg-background absolute inset-0 overflow-y-auto">
        <section
          aria-label={t.reading.title}
          className="mx-auto flex max-w-3xl flex-col gap-3 px-10 pt-12 pb-16"
        >
          <div className="flex min-h-8 items-center gap-2">
            <h2 className="text-muted-foreground text-xs font-medium">
              {t.reading.summary}
            </h2>
            <div className="ml-auto flex gap-2">
              {summary && <ListenButton path="/voice/reading" />}
              <IconButton
                icon={Cancel01Icon}
                label={t.mail.close}
                shortcut={<Kbd>esc</Kbd>}
                size="icon-sm"
                variant="ghost-muted"
                onClick={() =>
                  navigate({
                    search: (prev) => ({ ...prev, page: undefined }),
                    to: '/home',
                  })
                }
              />
            </div>
          </div>
          <ReadingIntro isWriting={isWriting} summary={summary} />
          <div className="flex flex-col gap-6 pt-2">
            {summary && <SummaryText rows={rows} summary={summary} />}
            {summary && <SummaryGaps rows={rows} summary={summary} />}
            <NewsletterList rows={rows} summary={summary} />
          </div>
        </section>
      </div>
    </AnimateView>
  )
}
