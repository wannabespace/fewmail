import type { RouterOutputs } from '@fewmail/api/router'
import { readingSpeech } from '@fewmail/shared/agent'
import type { Messages } from '@fewmail/shared/i18n'
import { Badge } from '@fewmail/ui/components/badge'
import { Button } from '@fewmail/ui/components/button'
import {
  SettingsGroup,
  SettingsRow,
} from '@fewmail/ui/components/custom/settings-group'
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@fewmail/ui/components/empty'
import { Kbd } from '@fewmail/ui/components/kbd'
import { Skeleton } from '@fewmail/ui/components/skeleton'
import { News01Icon, TickDouble02Icon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { useHotkey } from '@tanstack/react-hotkeys'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Link, useNavigate } from '@tanstack/react-router'
import { parseISO } from 'date-fns'
import { Fragment, useState } from 'react'
import { toast } from 'sonner'

import { EmailRow } from '~/components/email-row'
import {
  ExpandTrigger,
  expandRow,
  useIsThreadExpanded,
} from '~/components/expand-row'
import { HomeCard, PageHeading } from '~/components/home-card'
import { KeyHints } from '~/components/key-hints'
import { ListenButton } from '~/components/listen-button'
import { SleepingLogoMark } from '~/components/logo'
import { PaneRows, PaneScroller } from '~/components/pane-rows'
import { sweepOf, useMailActions } from '~/components/thread-view'
import { useDates, useT } from '~/lib/i18n'
import { prefetchThread } from '~/lib/mail-db'
import { client, orpc } from '~/lib/orpc'
import { posthog } from '~/lib/posthog'
import { toastUndo } from '~/lib/undo'

type Issue = RouterOutputs['reading']['day']
type Row = Issue['rows'][number]
type Summary = NonNullable<Issue['summary']>

const senderOf = (row: Row) => row.fromName ?? row.fromEmail

/** Every written issue and the fresh one, whose newsletters Home shows (this morning's, until the next morning's); the day still filling is never shown. */
export const useReadingIssues = () => {
  const { data: issues = [] } = useQuery(orpc.reading.issues.queryOptions())
  return {
    fresh: issues[0]?.isFresh ? issues[0] : undefined,
    hasAny: issues.length > 0,
    issues,
    latestDay: issues[0]?.day,
  }
}

/** One day's issue: its newsletters and, once written the morning after, the agent's summary of them. */
export const useReadingDay = (day: string | undefined) => {
  const { data, isPending } = useQuery(
    orpc.reading.day.queryOptions({ enabled: !!day, input: { day } })
  )
  return {
    isLoading: !!day && isPending,
    issue: data,
    rows: data?.rows ?? [],
    summary: data?.summary ?? undefined,
  }
}

const useIssueTitle = () => {
  const dates = useDates()
  return (day: string) => dates.format(parseISO(day), 'EEEE, d MMMM')
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
  const byId = new Map(rows.map((row) => [row.id, row]))
  const source = (cite: string, rowId: string) => {
    const row = byId.get(rowId)
    return (
      row && (
        <Badge
          key={rowId}
          data-mask
          variant="source"
          className="mx-0.5 align-[0.15em]"
          render={
            <ExpandTrigger
              email={{
                cite: { messageId: rowId, text: cite },
                from: 'reading',
                threadId: row.threadId,
              }}
              rowId={`${rowId}:${cite}`}
            />
          }
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
                {messageIds.map((rowId) => source(text, rowId))}{' '}
              </Fragment>
            ))}
          </p>
        </section>
      ))}
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
    if (worth.has(row.id)) {
      return t.reading.worth
    }
    return cited.has(row.id) ? t.reading.note.inSummary : t.reading.note.leftOut
  }
}

/** Every newsletter under the whole summary, rows as Mail's; J / K walk them, ⏎ opens one in the sidebar, E and ⌫ act on it. */
const NewsletterList = ({
  isActive,
  rows,
  summary,
}: {
  isActive: boolean
  rows: Row[]
  summary: Summary | undefined
}) => {
  const t = useT()
  const noteOf = useNoteOf(summary)
  const whyOf = new Map(
    summary?.worth.map(({ messageId, why }) => [messageId, why])
  )
  const actions = useMailActions()
  const [cursor, setCursor] = useState<number | null>(null)
  const row = cursor === null ? undefined : rows[cursor]

  const move = (step: number) => {
    const next = Math.max(0, Math.min(rows.length - 1, (cursor ?? -1) + step))
    setCursor(next)
    const threadId = rows[next]?.threadId
    if (threadId) {
      void prefetchThread(threadId)
    }
  }
  const keys = { enabled: isActive }
  const rowKeys = { enabled: isActive && !!row }
  useHotkey('J', () => move(1), keys)
  useHotkey('ArrowDown', () => move(1), keys)
  useHotkey('K', () => move(-1), keys)
  useHotkey('ArrowUp', () => move(-1), keys)
  useHotkey(
    'Enter',
    () => row && expandRow(row.id, { from: 'reading', threadId: row.threadId }),
    rowKeys
  )
  useHotkey(
    'E',
    () =>
      row &&
      sweepOf(actions, t, row.isInInbox ? 'inbox' : 'elsewhere').action.mutate({
        messageId: row.id,
      }),
    rowKeys
  )
  useHotkey(
    'Backspace',
    () => row && actions.trash.mutate({ messageId: row.id }),
    rowKeys
  )

  return (
    <SettingsGroup title={t.reading.digest(rows.length)}>
      <PaneRows rowKey={({ id }) => id} rows={rows}>
        {(newsletter, place) => (
          <EmailRow
            actions={actions}
            active={place['data-index'] === cursor}
            from="reading"
            message={newsletter}
            onSelect={() => setCursor(place['data-index'])}
            place={place}
            description={
              <>
                <span data-mask>{newsletter.subject}</span>
                {' · '}
                <span data-mask={!summary || undefined}>
                  {noteOf(newsletter)}
                </span>
                {whyOf.has(newsletter.id) && (
                  <>
                    <br />
                    <span data-mask>{whyOf.get(newsletter.id)}</span>
                  </>
                )}
              </>
            }
          />
        )}
      </PaneRows>
    </SettingsGroup>
  )
}

/** The newsletters the summary left out: nothing new in them. */
const SummaryGaps = ({ rows, summary }: { rows: Row[]; summary: Summary }) => {
  const t = useT()
  const cited = citedIn(summary)
  const leftOut = rows.filter(({ id }) => !cited.has(id)).length
  return leftOut > 0 ? (
    <p className="text-muted-foreground text-sm">
      {t.reading.leftOut(leftOut)}
    </p>
  ) : null
}

const MARK_READ_TOAST = 'reading-read'

/** Ends an issue: every newsletter in it marked read in one yes (⇧I), with an Undo that marks them unread again. */
const MarkAllRead = ({
  day,
  isActive,
  rows,
  variant,
}: {
  day: string
  isActive: boolean
  rows: Row[]
  variant: 'ghost-muted' | 'secondary'
}) => {
  const t = useT()
  const queryClient = useQueryClient()
  const refetch = () =>
    Promise.all([
      queryClient.invalidateQueries({ queryKey: orpc.reading.key() }),
      queryClient.invalidateQueries({ queryKey: orpc.mail.key() }),
    ])
  const markRead = useMutation(
    orpc.reading.markRead.mutationOptions({
      onError: () => toast.dismiss(MARK_READ_TOAST),
      onMutate: () => toast.loading(t.today.working, { id: MARK_READ_TOAST }),
      onSettled: refetch,
      onSuccess: ({ threadIds }) =>
        toastUndo(
          t.today.handled.markedRead(threadIds.length),
          () =>
            Promise.all(
              threadIds.map((threadId) => client.mail.markUnread({ threadId }))
            ).finally(refetch),
          MARK_READ_TOAST
        ),
    })
  )
  const canMark = rows.some(({ isUnread }) => isUnread) && !markRead.isPending
  useHotkey('Shift+I', () => markRead.mutate({ day }), {
    enabled: isActive && canMark,
  })

  return (
    <Button
      size="sm"
      variant={variant}
      className="self-start"
      disabled={!canMark}
      onClick={() => markRead.mutate({ day })}
      shortcut={<Kbd>⇧I</Kbd>}
    >
      <HugeiconsIcon
        icon={TickDouble02Icon}
        strokeWidth={2}
        data-icon="inline-start"
      />
      {t.reading.markAllRead}
    </Button>
  )
}

const listenPath = (day: string) => `/voice/reading?day=${day}`

/** The summary's opening, or what Reading is when the issue has none (Free). */
const ReadingIntro = ({ day }: { day: string }) => {
  const t = useT()
  const { isLoading, summary } = useReadingDay(day)
  if (isLoading) {
    return <SummarySkeleton />
  }
  if (summary && !summary.intro) {
    return null
  }
  return (
    <p
      data-mask={!!summary || undefined}
      className="text-brief text-foreground/80 font-serif"
    >
      {summary?.intro ?? t.reading.lead}
    </p>
  )
}

/** What an issue's head says: "What your newsletters said · Saturday, 14 November". */
const IssueHeading = ({ day }: { day: string }) => {
  const t = useT()
  const titleOf = useIssueTitle()
  return (
    <h2 className="text-muted-foreground text-xs font-medium">
      {`${t.reading.summary} · ${titleOf(day)}`}
    </h2>
  )
}

/** Everything under an issue's opening: the whole summary, Mark all read, every newsletter. */
const IssueBody = ({ day, isActive }: { day: string; isActive: boolean }) => {
  const { rows, summary } = useReadingDay(day)
  return (
    <>
      {summary && <SummaryText rows={rows} summary={summary} />}
      {summary && <SummaryGaps rows={rows} summary={summary} />}
      <MarkAllRead
        day={day}
        isActive={isActive}
        rows={rows}
        variant="secondary"
      />
      {rows.length > 0 && (
        <NewsletterList isActive={isActive} rows={rows} summary={summary} />
      )}
    </>
  )
}

/** Every issue but the one shown, newest first; a row opens its day. */
const IssueList = ({ shownDay }: { shownDay: string }) => {
  const t = useT()
  const titleOf = useIssueTitle()
  const { issues, latestDay } = useReadingIssues()
  const entries = issues.filter(({ day }) => day !== shownDay)
  if (entries.length === 0) {
    return null
  }
  return (
    <SettingsGroup title={t.reading.issues}>
      <PaneRows rowKey={({ day }) => day} rows={entries}>
        {({ count, day, titles }, place) => (
          <SettingsRow
            {...place}
            render={
              <Link
                to="/reading"
                search={day === latestDay ? {} : { day }}
                onClick={() =>
                  posthog.capture('reading_issue_opened', { from: 'list' })
                }
              />
            }
            icon={<HugeiconsIcon icon={News01Icon} strokeWidth={2} />}
            title={
              <span className="inline-block first-letter:uppercase">
                {titleOf(day)}
              </span>
            }
            description={
              titles.length > 0 && <span data-mask>{titles.join(' · ')}</span>
            }
          >
            <span className="text-muted-foreground text-xs tabular-nums">
              {t.reading.digest(count)}
            </span>
          </SettingsRow>
        )}
      </PaneRows>
    </SettingsGroup>
  )
}

/** The keys a list of newsletters answers: Reading's and Home's newsletters pane. */
export const newsletterHints = (
  t: Messages,
  rows: Row[]
): [key: string, label: string][] => [
  ...(rows.length > 0
    ? ([
        ['J / K', t.keys.move],
        ['⏎', t.keys.open],
        ['E', t.keys.archive],
        ['⌫', t.keys.trash],
      ] as [string, string][])
    : []),
  ...(rows.some(({ isUnread }) => isUnread)
    ? [['⇧I', t.reading.markAllRead] as [string, string]]
    : []),
]

/**
 * Nothing to read: no issue yet, or every newsletter of one trashed. The bird sleeps, as over an empty mail list; the
 * hint says what will come, so only Reading's page carries it.
 */
const ReadingEmpty = ({ hasHint }: { hasHint?: boolean }) => {
  const t = useT()
  return (
    <Empty>
      <EmptyHeader>
        <EmptyMedia>
          <SleepingLogoMark className="text-muted-foreground/50 size-20" />
        </EmptyMedia>
        <EmptyTitle>{t.reading.empty}</EmptyTitle>
        {hasHint && <EmptyDescription>{t.reading.emptyHint}</EmptyDescription>}
      </EmptyHeader>
    </Empty>
  )
}

/**
 * `/reading`, a page of its own: the latest issue (or `?day=`), the whole summary, every newsletter it was written
 * from, then every other issue; `esc` goes from a day back to the latest.
 */
export const ReadingPage = ({ day: pickedDay }: { day?: string }) => {
  const t = useT()
  const navigate = useNavigate()
  const { latestDay } = useReadingIssues()
  const day = pickedDay ?? latestDay
  const { isLoading, rows, summary } = useReadingDay(day)
  const speech = summary && readingSpeech(summary)
  const isEmpty = !day || (!isLoading && rows.length === 0 && !summary)
  const isFocused = !useIsThreadExpanded()
  const canGoBack = isFocused && !!pickedDay
  useHotkey('Escape', () => navigate({ search: {}, to: '/reading' }), {
    enabled: canGoBack,
  })
  return (
    <main className="flex min-h-0 flex-1 flex-col">
      {/* Keyed by its day: another day opens at its top, not where the list was. */}
      <PaneScroller key={day} className="under-notice">
        <div className="mx-auto flex max-w-3xl flex-col gap-6 px-10 pt-12 pb-16 max-md:px-4 max-md:pt-6">
          <header className="flex flex-col gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-display font-serif tracking-tight">
                {t.reading.title}
              </h1>
              {day && speech && (
                <div className="ml-auto">
                  <ListenButton path={listenPath(day)} text={speech} />
                </div>
              )}
            </div>
            {day && <IssueHeading day={day} />}
            {day && !isEmpty && <ReadingIntro day={day} />}
          </header>
          {isEmpty ? (
            <ReadingEmpty hasHint />
          ) : (
            <IssueBody day={day} isActive={isFocused} />
          )}
          {day && <IssueList shownDay={day} />}
        </div>
      </PaneScroller>
      <KeyHints
        hints={[
          ...newsletterHints(t, rows),
          ...(canGoBack ? [['esc', t.keys.close] as [string, string]] : []),
        ]}
      />
    </main>
  )
}

/** The newsletters of the fresh issue: Home's own category of mail, while it is fresh. */
export const useFreshNewsletters = () => {
  const { fresh } = useReadingIssues()
  const { rows, summary } = useReadingDay(fresh?.day)
  return { day: fresh?.day, rows, summary }
}

/** Home's card for the fresh issue's newsletters (`N`, `?page=newsletters`): how many, the first few, Mark all read. */
export const NewslettersCard = ({ isActive }: { isActive: boolean }) => {
  const t = useT()
  const titleOf = useIssueTitle()
  const { day, rows } = useFreshNewsletters()
  if (!day || rows.length === 0) {
    return null
  }
  return (
    <HomeCard
      heading={t.mail.group.newsletters}
      lead={`${t.reading.digest(rows.length)} · ${titleOf(day)}`}
      page="newsletters"
      rows={rows.map((row) => ({ id: row.id, sender: row, text: row.subject }))}
      actions={
        <MarkAllRead
          day={day}
          isActive={isActive}
          rows={rows}
          variant="secondary"
        />
      }
    />
  )
}

/** What Home's newsletters card opens: every one of them as Mail's rows, with Reading's summary a page away. */
export const NewslettersPane = ({
  isActive,
  onClose,
}: {
  isActive: boolean
  onClose: () => void
}) => {
  const t = useT()
  const { day, rows, summary } = useFreshNewsletters()
  return (
    <>
      <PageHeading
        title={t.mail.group.newsletters}
        onClose={onClose}
        actions={
          summary && (
            <Button
              size="sm"
              variant="ghost-muted"
              render={<Link to="/reading" />}
            >
              <HugeiconsIcon
                icon={News01Icon}
                strokeWidth={2}
                data-icon="inline-start"
              />
              {t.reading.summary}
            </Button>
          )
        }
      />
      {day && rows.length > 0 ? (
        <>
          <MarkAllRead
            day={day}
            isActive={isActive}
            rows={rows}
            variant="secondary"
          />
          <NewsletterList isActive={isActive} rows={rows} summary={summary} />
        </>
      ) : (
        <ReadingEmpty />
      )}
    </>
  )
}
