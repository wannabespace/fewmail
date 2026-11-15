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
import {
  createPopoverHandle,
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@fewmail/ui/components/popover'
import { Skeleton } from '@fewmail/ui/components/skeleton'
import { cn } from '@fewmail/ui/lib/utils'
import { Cancel01Icon, TickDouble02Icon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { useHotkey } from '@tanstack/react-hotkeys'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Link, useNavigate } from '@tanstack/react-router'
import { isToday } from 'date-fns'
import { motion } from 'motion/react'
import { Fragment, useEffect, useRef, useState } from 'react'
import { toast } from 'sonner'

import { ListenButton } from '~/components/listen-button'
import { SenderAvatar } from '~/components/sender-avatar'
import {
  dropPane,
  HIDDEN,
  keepUnderPane,
  PeekSurface,
  SHOWN,
  toggleExpanded,
  useIsThreadExpanded,
  useMorph,
} from '~/components/thread-link'
import { ThreadPeek } from '~/components/thread-view'
import { useDates, useT } from '~/lib/i18n'
import { prefetchThread, warmThread } from '~/lib/mail-db'
import { useHasAgent } from '~/lib/me'
import { client, orpc } from '~/lib/orpc'
import { toastUndo } from '~/lib/undo'

type Row = RouterOutputs['reading']['list'][number]
type Summary = NonNullable<RouterOutputs['reading']['summary']>

const senderOf = (row: Row) => row.fromName ?? row.fromEmail

// The card's `rounded-2xl` as a motion value: motion keeps only its own radius round while the card scales.
const CARD_RADIUS = 16

/** The day's newsletters and the agent's one summary of them, written only when there are newsletters; Free gets the list alone. */
export const useReading = () => {
  const hasAgent = useHasAgent()
  const { data: rows = [] } = useQuery(orpc.reading.list.queryOptions())
  const isSummarized = hasAgent && rows.length > 0
  const summary = useQuery(
    orpc.reading.summary.queryOptions({ enabled: isSummarized })
  )
  return {
    isWriting: isSummarized && summary.isPending,
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

// Back from an email, the cursor is on the newsletter that was opened.
let lastOpened: string | undefined

interface Peek {
  cite: string
  row: Row
}
const peek = createPopoverHandle<Peek>()

/** A cited newsletter over Reading, opened on the passage the sentence came from, so the summary stays in place. */
const NewsletterPeek = ({
  onOpenChange,
}: {
  onOpenChange: (isOpen: boolean) => void
}) => {
  const isExpanded = useIsThreadExpanded()
  return (
    <Popover
      handle={peek}
      onOpenChange={(open, details) => {
        keepUnderPane(open, details)
        if (!details.isCanceled) {
          onOpenChange(open)
        }
      }}
      onOpenChangeComplete={dropPane}
    >
      {({ payload }) => (
        <PopoverContent
          padding="none"
          surface="none"
          data-expanded={isExpanded || undefined}
          className="w-160 data-expanded:pointer-events-none"
        >
          {payload && (
            <PeekSurface>
              <ThreadPeek
                key={`${payload.row.id} ${payload.cite}`}
                cite={payload.cite}
                from="reading"
                message={payload.row}
                onOpen={() =>
                  toggleExpanded({
                    close: () => peek.close(),
                    from: 'reading',
                    threadId: payload.row.threadId,
                  })
                }
              />
            </PeekSurface>
          )}
        </PopoverContent>
      )}
    </Popover>
  )
}

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
          render={<PopoverTrigger handle={peek} payload={{ cite, row }} />}
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
    if (!summary.messageIds.includes(row.id)) {
      return t.reading.note.since
    }
    if (worth.has(row.id)) {
      return t.reading.worth
    }
    return cited.has(row.id) ? t.reading.note.inSummary : t.reading.note.leftOut
  }
}

/** Every newsletter under the whole summary; J / K walk them, ⏎ opens one. */
const NewsletterList = ({
  isPeeking,
  rows,
  summary,
}: {
  isPeeking: boolean
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
  const keys = { enabled: !isPeeking }
  useHotkey('J', () => move(1), keys)
  useHotkey('ArrowDown', () => move(1), keys)
  useHotkey('K', () => move(-1), keys)
  useHotkey('ArrowUp', () => move(-1), keys)
  useHotkey('Enter', () => rows[current] && open(rows[current].threadId), {
    enabled: !isPeeking && current !== -1,
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

const MARK_READ_TOAST = 'reading-read'

/** Ends Reading: every newsletter on it marked read in one yes (⇧I), with an Undo that marks them unread again. */
const MarkAllRead = ({
  rows,
  variant,
}: {
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
  useHotkey('Shift+I', () => markRead.mutate(), { enabled: canMark })

  return (
    <Button
      size="sm"
      variant={variant}
      className="self-start"
      disabled={!canMark}
      onClick={() => markRead.mutate()}
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

/** One Listen for the card and the pane, so it slides to its new spot in the head instead of jumping. */
const ReadingListen = ({ summary }: { summary: Summary }) => {
  const { morph } = useMorph()
  return (
    <motion.div layout="position" layoutId="reading-listen" transition={morph}>
      <ListenButton path="/voice/reading" text={readingSpeech(summary)} />
    </motion.div>
  )
}

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
 * What your newsletters said, a card on Home under the header: the opening and the topics. A click anywhere on it or
 * `N` (`?page=reading`) grows it into `ReadingPane` (one `layoutId`); while the pane is open the card keeps its place, unseen, so it shrinks back
 * into the same spot.
 */
export const ReadingSection = ({ isOpen }: { isOpen: boolean }) => {
  const t = useT()
  const { morph: transition, reveal } = useMorph()
  const { isWriting, rows, summary } = useReading()
  // Only a card coming back from the pane fades its topics in; on Home's first render they are simply there.
  const [hasOpened, setHasOpened] = useState(isOpen)
  if (isOpen && !hasOpened) {
    setHasOpened(true)
  }
  if (rows.length === 0) {
    return null
  }
  const content = (
    <>
      <div className="flex min-h-8 items-center gap-2">
        <h2 className="text-muted-foreground text-xs font-medium">
          {t.reading.summary}
        </h2>
        <div className="pointer-events-auto ml-auto flex gap-2">
          {summary && !isOpen && <ReadingListen summary={summary} />}
          {!isOpen && (
            <motion.div
              initial={hasOpened ? HEAD_HIDDEN : false}
              animate={HEAD_SHOWN}
              transition={reveal}
            >
              <MarkAllRead rows={rows} variant="ghost-muted" />
            </motion.div>
          )}
        </div>
      </div>
      <ReadingIntro isWriting={isWriting} summary={summary} />
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

/** The whole summary and every newsletter, over Home's column: it grows out of `ReadingSection` like an App Store card. */
export const ReadingPane = ({ isOpen }: { isOpen: boolean }) => {
  const t = useT()
  const navigate = useNavigate()
  const { morph: transition, reveal } = useMorph()
  const { isWriting, rows, summary } = useReading()
  const [isPeeking, setIsPeeking] = useState(false)
  if (!isOpen || rows.length === 0) {
    return null
  }
  return (
    <motion.div
      layoutId="reading"
      transition={transition}
      initial={false}
      animate={{ borderRadius: 0 }}
      className="bg-background absolute inset-0 z-10 overflow-hidden"
    >
      <div className="h-full overflow-y-auto">
        <section
          aria-label={t.reading.title}
          className="mx-auto max-w-3xl px-10 pt-12 pb-16"
        >
          <motion.div
            layout="position"
            layoutId="reading-content"
            transition={transition}
            className="flex flex-col gap-3"
          >
            <div className="flex min-h-8 items-center gap-2">
              <h2 className="text-muted-foreground text-xs font-medium">
                {t.reading.summary}
              </h2>
              <div className="ml-auto flex gap-2">
                {summary && <ReadingListen summary={summary} />}
                <motion.div
                  initial={HEAD_HIDDEN}
                  animate={HEAD_SHOWN}
                  transition={reveal}
                >
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
                </motion.div>
              </div>
            </div>
            <ReadingIntro isWriting={isWriting} summary={summary} />
            <motion.div
              initial={HIDDEN}
              animate={SHOWN}
              transition={reveal}
              className="flex flex-col gap-6 pt-2"
            >
              {summary && <SummaryText rows={rows} summary={summary} />}
              {summary && <SummaryGaps rows={rows} summary={summary} />}
              <NewsletterList
                isPeeking={isPeeking}
                rows={rows}
                summary={summary}
              />
              <MarkAllRead rows={rows} variant="secondary" />
              <NewsletterPeek onOpenChange={setIsPeeking} />
            </motion.div>
          </motion.div>
        </section>
      </div>
    </motion.div>
  )
}
