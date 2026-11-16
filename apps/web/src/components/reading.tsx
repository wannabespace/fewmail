import type { RouterOutputs } from '@fewmail/api/router'
import { readingSpeech } from '@fewmail/shared/agent'
import { cardsBleedClassName } from '@fewmail/ui/components/accordion'
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
import {
  Cancel01Icon,
  News01Icon,
  TickDouble02Icon,
} from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { useHotkey } from '@tanstack/react-hotkeys'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Link, useNavigate } from '@tanstack/react-router'
import { isToday, parseISO } from 'date-fns'
import { AnimatePresence, motion } from 'motion/react'
import { Fragment, useEffect, useMemo, useRef, useState } from 'react'
import { toast } from 'sonner'

import {
  clipOver,
  ExpandTrigger,
  HIDDEN,
  OPEN_CLIP,
  SHOWN,
  useIsThreadExpanded,
  useMorph,
} from '~/components/expand-row'
import { ListenButton } from '~/components/listen-button'
import { SenderAvatar } from '~/components/sender-avatar'
import { useDates, useT } from '~/lib/i18n'
import { prefetchThread, warmThread } from '~/lib/mail-db'
import { client, orpc } from '~/lib/orpc'
import { posthog } from '~/lib/posthog'
import { toastUndo } from '~/lib/undo'

type Issue = RouterOutputs['reading']['day']
type Row = Issue['rows'][number]
type Summary = NonNullable<Issue['summary']>

const senderOf = (row: Row) => row.fromName ?? row.fromEmail

// The card's `rounded-2xl` as a motion value: motion keeps only its own radius round while the card scales.
const CARD_RADIUS = 16

/** Every written issue and the fresh one Home shows (this morning's, until the next morning's); the day still filling is never shown. */
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

/** The panes over Home: `N`'s (`page=reading`, the latest issue) and the day a row or a link opened, over it or alone. */
export const openReadingDays = (
  page: string | undefined,
  day: string | undefined,
  latestDay: string | undefined
) => {
  const base = page === 'reading' ? latestDay : undefined
  return { base, top: day && day !== base ? day : undefined }
}

/** The pane a row grows into is clipped out of it, measured over Reading's area. */
const READING_AREA = 'reading-area'
const issueMorphId = (day: string) => `reading-${day}`

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

// Back from an email, the cursor is on the newsletter that was opened.
let lastOpened: string | undefined

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

/** Every newsletter under the whole summary; J / K walk them, ⏎ opens one. */
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
  const dates = useDates()
  const navigate = useNavigate()
  const noteOf = useNoteOf(summary)
  const whyOf = new Map(
    summary?.worth.map(({ messageId, why }) => [messageId, why])
  )
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
  const keys = { enabled: isActive }
  useHotkey('J', () => move(1), keys)
  useHotkey('ArrowDown', () => move(1), keys)
  useHotkey('K', () => move(-1), keys)
  useHotkey('ArrowUp', () => move(-1), keys)
  useHotkey('Enter', () => rows[current] && open(rows[current].threadId), {
    enabled: isActive && current !== -1,
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
            iconVariant="avatar"
            icon={<SenderAvatar sender={row} size="sm" />}
            title={<span data-mask>{senderOf(row)}</span>}
            description={
              <>
                <span data-mask>{row.subject}</span>
                {' · '}
                <span data-mask={!summary || undefined}>{noteOf(row)}</span>
                {whyOf.has(row.id) && (
                  <>
                    <br />
                    <span data-mask>{whyOf.get(row.id)}</span>
                  </>
                )}
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

// One spring for the card and the pane, so the pane grows out of the card and shrinks back into it; what only one of
// them has (the topic line, the whole summary) fades in once the box is on its way.
const HEAD_HIDDEN = { opacity: 0, scale: 0.9 }
const HEAD_SHOWN = { opacity: 1, scale: 1 }

const listenPath = (day: string) => `/voice/reading?day=${day}`

/** One Listen for the card and the pane, so it slides to its new spot in the head instead of jumping. */
const ReadingListen = ({ day, summary }: { day: string; summary: Summary }) => {
  const { morph } = useMorph()
  return (
    <motion.div layout="position" layoutId="reading-listen" transition={morph}>
      <ListenButton path={listenPath(day)} text={readingSpeech(summary)} />
    </motion.div>
  )
}

/** The summary's opening, or what Reading is when the issue has none (Free). */
const ReadingIntro = ({ day }: { day: string }) => {
  const t = useT()
  const { isLoading, summary } = useReadingDay(day)
  if (isLoading) {
    return <SummarySkeleton />
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

/**
 * Yesterday's issue, a card on Home under the header: the opening and the topics. A click anywhere on it or `N`
 * (`?page=reading`) grows it into the pane (one `layoutId`); while the pane is open the card keeps its place, unseen, so
 * it shrinks back into the same spot.
 */
const IssueCard = ({
  day,
  isActive,
  isOpen,
}: {
  day: string
  isActive: boolean
  isOpen: boolean
}) => {
  const t = useT()
  const { morph: transition, reveal } = useMorph()
  const { rows, summary } = useReadingDay(day)
  // Only a card coming back from the pane fades its topics in; on Home's first render they are simply there.
  const [hasOpened, setHasOpened] = useState(isOpen)
  if (isOpen && !hasOpened) {
    setHasOpened(true)
  }
  const content = (
    <>
      <div className="flex min-h-8 flex-wrap items-center gap-2">
        <IssueHeading day={day} />
        <div className="pointer-events-auto ml-auto flex flex-wrap gap-2">
          {summary && !isOpen && <ReadingListen day={day} summary={summary} />}
          {!isOpen && (
            <motion.div
              initial={hasOpened ? HEAD_HIDDEN : false}
              animate={HEAD_SHOWN}
              transition={reveal}
            >
              <MarkAllRead
                day={day}
                isActive={isActive}
                rows={rows}
                variant="ghost-muted"
              />
            </motion.div>
          )}
        </div>
      </div>
      <ReadingIntro day={day} />
      {!!summary?.sections.length && (
        <motion.p
          initial={hasOpened ? HIDDEN : false}
          animate={SHOWN}
          transition={reveal}
          data-mask
          className="text-muted-foreground font-serif"
        >
          {summary.sections.map(({ title }) => title).join(' · ')}
        </motion.p>
      )}
    </>
  )
  const cardClassName = cn(
    'bg-card ring-foreground/6 flex flex-col gap-3 px-4.75 py-4 ring',
    cardsBleedClassName
  )
  return isOpen ? (
    <section aria-hidden className={cn(cardClassName, 'invisible rounded-2xl')}>
      {content}
    </section>
  ) : (
    <motion.section
      layoutId="reading"
      transition={transition}
      aria-label={t.reading.title}
      initial={false}
      animate={{ borderRadius: CARD_RADIUS }}
      data-morph-source={issueMorphId(day)}
      className={cn(
        cardClassName,
        'hover:ring-foreground/10 relative z-10 overflow-hidden'
      )}
    >
      <Link
        to="/home"
        search={(prev) => ({ ...prev, page: 'reading' })}
        aria-label={t.reading.digest(rows.length)}
        className="focus-visible:focus-ring absolute inset-0 cursor-pointer rounded-2xl outline-none focus-visible:ring-inset"
      />
      {/* Positioned to paint over the card's link, and lets clicks through to it; only the head's buttons take their own. */}
      <motion.div
        layout="position"
        layoutId="reading-content"
        transition={transition}
        className="pointer-events-none relative flex flex-col gap-3"
      >
        {content}
      </motion.div>
    </motion.section>
  )
}

/** Reading on Home: yesterday's issue as a card while it is fresh. */
export const ReadingSection = ({
  base,
  top,
}: ReturnType<typeof openReadingDays>) => {
  const { fresh } = useReadingIssues()
  if (!fresh) {
    return null
  }
  return (
    <IssueCard
      day={fresh.day}
      isActive={!base && !top}
      isOpen={base === fresh.day}
    />
  )
}

/** Every issue but the one shown, newest first; a row grows into its issue over this one. */
const IssueList = ({ shownDay }: { shownDay: string }) => {
  const t = useT()
  const titleOf = useIssueTitle()
  const { issues } = useReadingIssues()
  const entries = issues.filter(({ day }) => day !== shownDay)
  if (entries.length === 0) {
    return null
  }
  return (
    <SettingsGroup title={t.reading.issues}>
      {entries.map(({ count, day, titles }) => (
        <SettingsRow
          key={day}
          render={
            <Link
              to="/home"
              search={(prev) => ({ ...prev, day })}
              data-morph-source={issueMorphId(day)}
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
      ))}
    </SettingsGroup>
  )
}

/** Everything under an issue's opening: the whole summary, every newsletter, Mark all read. */
const IssueBody = ({ day, isActive }: { day: string; isActive: boolean }) => {
  const { rows, summary } = useReadingDay(day)
  const isExpanded = useIsThreadExpanded()
  const isFocused = isActive && !isExpanded
  return (
    <>
      {summary && <SummaryText rows={rows} summary={summary} />}
      {summary && <SummaryGaps rows={rows} summary={summary} />}
      {rows.length > 0 && (
        <NewsletterList isActive={isFocused} rows={rows} summary={summary} />
      )}
      <MarkAllRead
        day={day}
        isActive={isFocused}
        rows={rows}
        variant="secondary"
      />
    </>
  )
}

const CloseIssue = ({ onClose }: { onClose: () => void }) => {
  const t = useT()
  const { reveal } = useMorph()
  return (
    <motion.div initial={HEAD_HIDDEN} animate={HEAD_SHOWN} transition={reveal}>
      <IconButton
        icon={Cancel01Icon}
        label={t.mail.close}
        shortcut={<Kbd>esc</Kbd>}
        size="icon-sm"
        variant="ghost-muted"
        onClick={onClose}
      />
    </motion.div>
  )
}

const PANE_COLUMN =
  'mx-auto max-w-3xl px-10 pt-12 pb-16 max-md:px-4 max-md:pt-6'

/** `N`'s pane over Home's column, the latest issue: it grows out of `IssueCard` like an App Store card. */
const LatestPane = ({
  day,
  isCovered,
}: {
  day: string
  isCovered: boolean
}) => {
  const t = useT()
  const navigate = useNavigate()
  const { morph: transition, reveal } = useMorph()
  const { summary } = useReadingDay(day)
  return (
    <motion.div
      layoutId="reading"
      transition={transition}
      initial={false}
      animate={{ borderRadius: 0 }}
      className="bg-background absolute inset-0 z-10 overflow-hidden"
    >
      <motion.div layoutScroll className="h-full overflow-y-auto">
        <section aria-label={t.reading.title} className={PANE_COLUMN}>
          <motion.div
            layout="position"
            layoutId="reading-content"
            transition={transition}
            className="flex flex-col gap-3"
          >
            <div className="flex min-h-8 flex-wrap items-center gap-2">
              <IssueHeading day={day} />
              <div className="ml-auto flex flex-wrap gap-2">
                {summary && <ReadingListen day={day} summary={summary} />}
                <CloseIssue
                  onClose={() =>
                    navigate({
                      search: (prev) => ({ ...prev, page: undefined }),
                      to: '/home',
                    })
                  }
                />
              </div>
            </div>
            <ReadingIntro day={day} />
            <motion.div
              initial={HIDDEN}
              animate={SHOWN}
              transition={reveal}
              className="flex flex-col gap-6 pt-2"
            >
              <IssueBody day={day} isActive={!isCovered} />
              <IssueList shownDay={day} />
            </motion.div>
          </motion.div>
        </section>
      </motion.div>
    </motion.div>
  )
}

/** Another day's issue, grown out of its row in the list (or Home's today line) by its clip; esc shrinks it back. */
const DayPane = ({ day }: { day: string }) => {
  const t = useT()
  const navigate = useNavigate()
  const { morph, reveal } = useMorph()
  const { summary } = useReadingDay(day)
  // Measured once as it opens: the row it grew from stays where it was under it, so it closes back into the same box.
  const clip = useMemo(
    () => clipOver(issueMorphId(day), 12, READING_AREA),
    [day]
  )
  return (
    <motion.div
      initial={{ clipPath: clip }}
      animate={{ clipPath: OPEN_CLIP }}
      exit={{ clipPath: clip }}
      transition={morph}
      className="bg-background absolute inset-0 z-20 overflow-hidden"
    >
      <div className="h-full overflow-y-auto">
        <section aria-label={t.reading.title} className={PANE_COLUMN}>
          <div className="flex flex-col gap-3">
            <div className="flex min-h-8 flex-wrap items-center gap-2">
              <IssueHeading day={day} />
              <div className="ml-auto flex flex-wrap gap-2">
                {summary && (
                  <ListenButton
                    path={listenPath(day)}
                    text={readingSpeech(summary)}
                  />
                )}
                <CloseIssue
                  onClose={() =>
                    navigate({
                      search: (prev) => ({ ...prev, day: undefined }),
                      to: '/home',
                    })
                  }
                />
              </div>
            </div>
            <motion.div
              initial={HIDDEN}
              animate={SHOWN}
              transition={reveal}
              className="flex flex-col gap-6"
            >
              <ReadingIntro day={day} />
              <IssueBody day={day} isActive />
            </motion.div>
          </div>
        </section>
      </div>
    </motion.div>
  )
}

/** Reading's panes over Home's column: the latest issue (`N`), and over it the day a row, a link or Home's today line opened. */
export const ReadingPane = ({
  base,
  top,
}: ReturnType<typeof openReadingDays>) => (
  <>
    {base && <LatestPane day={base} isCovered={!!top} />}
    <AnimatePresence>{top && <DayPane key={top} day={top} />}</AnimatePresence>
  </>
)
