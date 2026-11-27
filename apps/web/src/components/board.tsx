import type { RouterOutputs } from '@fewmail/api/router'
import { ACTIVE_COMMITMENT_STATUSES } from '@fewmail/shared/agent'
import type { CommitmentStatus } from '@fewmail/shared/agent'
import type { Messages } from '@fewmail/shared/i18n'
import { SettingsRow } from '@fewmail/ui/components/custom/settings-group'
import { Tool, ToolContent, ToolHeader } from '@fewmail/ui/components/tool'
import { cn } from '@fewmail/ui/lib/utils'
import {
  Agreement01Icon,
  ArrowDownLeft01Icon,
  Clock01Icon,
} from '@hugeicons/core-free-icons'
import type { IconSvgElement } from '@hugeicons/react'
import { useHotkey } from '@tanstack/react-hotkeys'
import { startOfToday, subDays } from 'date-fns'
import { useEffect, useState } from 'react'
import { createStore } from 'seitu'
import { useSubscription } from 'seitu/react'

import { NowPart } from '~/components/bot-chat'
import { ExpandTrigger, expandRow } from '~/components/expand-row'
import { PaneRows } from '~/components/pane-rows'
import type { RowPlace } from '~/components/pane-rows'
import { SenderAvatar } from '~/components/sender-avatar'
import { useDates, useLocale, useT } from '~/lib/i18n'
import { useHasAgent } from '~/lib/me'
import { client, orpc } from '~/lib/orpc'
import { listCollection, useRanked } from '~/lib/query-client'

type Commitment = RouterOutputs['commitments']['list'][number]

const commitments = listCollection({
  getKey: ({ id }) => id,
  id: 'commitments',
  queryFn: () => client.commitments.list(),
  queryKey: orpc.commitments.list.key(),
})
type Section = 'owed' | 'promised' | 'coming'

const SECTIONS: Section[] = ['owed', 'promised', 'coming']
const SECTION_ICONS: Record<Section, IconSvgElement> = {
  coming: Clock01Icon,
  owed: ArrowDownLeft01Icon,
  promised: Agreement01Icon,
}
/** What was settled stays in its list this long, marked so: a promise the agent closed on its own never vanishes unseen. */
const SETTLED_DAYS = 14

const isOpenStatus = (status: CommitmentStatus) =>
  (ACTIVE_COMMITMENT_STATUSES as readonly string[]).includes(status)

const changedAt = ({ history }: Commitment) => history.at(-1)?.at ?? null

const isShown = (commitment: Commitment, today: Date) => {
  if (!isOpenStatus(commitment.status)) {
    const at = changedAt(commitment)
    return !!at && at > subDays(today, SETTLED_DAYS)
  }
  return commitment.kind !== 'deadline' || commitment.dueAt >= today
}

const SECTION_OF: Record<Commitment['kind'], Section> = {
  deadline: 'coming',
  mine: 'promised',
  theirs: 'owed',
}

// By date, never by status (the server's order): a row ticked done stays where it was.
const byDue = (a: Commitment, b: Commitment) =>
  a.dueAt.getTime() - b.dueAt.getTime() || a.id.localeCompare(b.id)

const waiting = (rows: Commitment[]) =>
  rows.filter(({ status }) => isOpenStatus(status))

const moneyText = (locale: string, cents: number, currency: string) =>
  new Intl.NumberFormat(locale, { currency, style: 'currency' }).format(
    cents / 100
  )

/** The sentence on top, computed here from the rows (no model text): what is owed, what was promised, what is coming. */
const leadOf = (
  t: Messages,
  locale: string,
  sections: Record<Section, Commitment[]>
) => {
  const owed = waiting(sections.owed)
  const promised = waiting(sections.promised).length
  const coming = waiting(sections.coming).length
  const owedByCurrency = Map.groupBy(
    owed.filter(({ amountCents, currency }) => amountCents && currency),
    ({ currency }) => currency ?? ''
  )
  const amounts = [...owedByCurrency].map(([currency, rows]) =>
    moneyText(
      locale,
      rows.reduce((sum, { amountCents }) => sum + (amountCents ?? 0), 0),
      currency
    )
  )
  const parts = [
    amounts.length > 0 && t.board.lead.owed(amounts.join(', ')),
    amounts.length === 0 &&
      owed.length > 0 &&
      t.board.lead.waiting(owed.length),
    promised > 0 && t.board.lead.promised(promised),
    coming > 0 && t.board.lead.coming(coming),
  ].filter(Boolean)
  return parts.join(' ')
}

/** In people's words, never the status names: "they answered, not done yet", "overdue". */
const stateOf = (t: Messages, commitment: Commitment, today: Date) =>
  commitment.status === 'open' && commitment.dueAt < today
    ? t.board.state.overdue
    : t.board.state[commitment.status]

/** A promise kept opens the email that proved it; anything else the email it came from. */
const threadOf = (row: Commitment) =>
  (row.status === 'fulfilled' && row.evidenceThreadId) || row.threadId

const openRow = (row?: Commitment) =>
  row && expandRow(row.id, { from: 'board', threadId: threadOf(row) })

/** Whom a promise is with: your own names whom you promised, never you; theirs, who wrote. */
const senderOf = (row: Commitment) =>
  row.kind === 'mine' && row.recipient
    ? { fromEmail: row.recipient, fromName: null }
    : row.from

/** Its state in people's words and its date: by when, the last day, or when it was settled. */
const descriptionOf = (
  t: Messages,
  dates: ReturnType<typeof useDates>,
  row: Commitment,
  today: Date
) => {
  if (!isOpenStatus(row.status)) {
    const settledOn = changedAt(row)
    return `${t.board.state[row.status]}${settledOn ? ` · ${dates.format(settledOn, 'd MMM')}` : ''}`
  }
  const day = dates.format(row.dueAt, 'd MMM')
  return `${stateOf(t, row, today)} · ${row.kind === 'deadline' ? t.board.lastDay(day) : t.board.by(day)}`
}

/** The cursor's row, for Home's key hints. */
const boardCursor = createStore<Commitment | undefined>(undefined)

const hintsOf = (t: Messages, row: Commitment | undefined) => {
  const close: [string, string] = ['esc', t.keys.close]
  if (!row) {
    return [['J / K', t.keys.move], close] as [string, string][]
  }
  return [['J / K', t.keys.move], ['⏎', t.keys.open], close] as [
    string,
    string,
  ][]
}

/** Every promise and last day sorted into the Board's lists; nothing is asked on Free, where there is none, or while the Board is not open. */
export const useBoard = (isOpen = true) => {
  const hasAgent = useHasAgent()
  const { data = [], isLoading } = useRanked(commitments, hasAgent && isOpen)
  const rows: Commitment[] = data
  const today = startOfToday()
  const sections = Object.fromEntries(
    SECTIONS.map((section) => [
      section,
      rows
        .filter(
          (row) => isShown(row, today) && SECTION_OF[row.kind] === section
        )
        .toSorted(byDue),
    ])
  ) as Record<Section, Commitment[]>
  return {
    isPending: !hasAgent || isLoading,
    ordered: SECTIONS.flatMap((section) => sections[section]),
    sections,
    today,
  }
}

/** What the Board holds: its sentence, then a list each, to read; a promise is settled in words ("Rozetka paid me back"), which the agent does. */
export const BoardPane = ({ isActive }: { isActive: boolean }) => {
  const t = useT()
  const dates = useDates()
  const locale = useLocale()
  const { isPending, ordered, sections, today } = useBoard()
  const [cursorId, setCursorId] = useState<string | null>(null)
  const active = ordered.find(({ id }) => id === cursorId)
  useEffect(() => {
    boardCursor.set(active)
    return () => boardCursor.set(undefined)
  }, [active])

  const step = (by: number) => {
    const index = ordered.findIndex(({ id }) => id === cursorId)
    const next = ordered[Math.max(0, Math.min(ordered.length - 1, index + by))]
    setCursorId(next?.id ?? null)
  }
  const listKeys = { enabled: isActive && ordered.length > 0 }
  useHotkey('J', () => step(1), listKeys)
  useHotkey('ArrowDown', () => step(1), listKeys)
  useHotkey('K', () => step(-1), listKeys)
  useHotkey('ArrowUp', () => step(-1), listKeys)
  const rowKeys = { enabled: isActive && !!active }
  useHotkey('Enter', () => openRow(active), rowKeys)
  useHotkey('O', () => openRow(active), rowKeys)

  const rowOf = (row: Commitment, place: RowPlace) => {
    const isCursor = row === active
    const sender = senderOf(row)
    return (
      <SettingsRow
        {...place}
        active={isCursor}
        trigger={
          <ExpandTrigger
            email={{ from: 'board', threadId: threadOf(row) }}
            rowId={row.id}
            aria-label={row.promise}
            onClick={() => setCursorId(row.id)}
          />
        }
        iconVariant="avatar"
        icon={sender && <SenderAvatar sender={sender} size="sm" />}
        title={
          <span
            data-mask
            className={cn(!isOpenStatus(row.status) && 'text-muted-foreground')}
          >
            {row.promise}
          </span>
        }
        description={descriptionOf(t, dates, row, today)}
      >
        {row.amountCents !== null && row.currency && (
          <span data-mask className="text-sm tabular-nums">
            {moneyText(locale, row.amountCents, row.currency)}
          </span>
        )}
      </SettingsRow>
    )
  }

  return (
    !isPending &&
    ordered.length > 0 && (
      <>
        <NowPart>
          <p>{leadOf(t, locale, sections)}</p>
        </NowPart>
        {SECTIONS.map(
          (section) =>
            sections[section].length > 0 && (
              <Tool key={section} open>
                <ToolHeader
                  icon={SECTION_ICONS[section]}
                  isOpenable={false}
                  title={
                    <>
                      {t.board.section[section]}
                      <span className="text-muted-foreground ml-1.5 tabular-nums">
                        {sections[section].length}
                      </span>
                    </>
                  }
                />
                <ToolContent variant="rows">
                  <PaneRows rowKey={({ id }) => id} rows={sections[section]}>
                    {rowOf}
                  </PaneRows>
                </ToolContent>
              </Tool>
            )
        )}
      </>
    )
  )
}

/** The Board's keys for Home's hints, which change with the cursor's row. */
export const useBoardHints = () => {
  const t = useT()
  return hintsOf(t, useSubscription(boardCursor))
}
