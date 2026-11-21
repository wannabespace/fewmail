import type { RouterOutputs } from '@fewmail/api/router'
import { ACTIVE_COMMITMENT_STATUSES } from '@fewmail/shared/agent'
import type { CommitmentStatus } from '@fewmail/shared/agent'
import type { Messages } from '@fewmail/shared/i18n'
import { IconButton } from '@fewmail/ui/components/custom/icon-button'
import {
  SettingsGroup,
  SettingsRow,
} from '@fewmail/ui/components/custom/settings-group'
import { cn } from '@fewmail/ui/lib/utils'
import { Cancel01Icon, Tick02Icon } from '@hugeicons/core-free-icons'
import { useHotkey } from '@tanstack/react-hotkeys'
import { useMutation } from '@tanstack/react-query'
import { startOfToday, subDays } from 'date-fns'
import { useEffect, useState } from 'react'
import { createStore } from 'seitu'
import { useSubscription } from 'seitu/react'

import { DigestLead, NowMessage } from '~/components/bot-chat'
import { ExpandTrigger, expandRow } from '~/components/expand-row'
import { PaneRows } from '~/components/pane-rows'
import type { RowPlace } from '~/components/pane-rows'
import { SenderAvatar } from '~/components/sender-avatar'
import { useDates, useLocale, useT } from '~/lib/i18n'
import { useHasAgent } from '~/lib/me'
import { client, orpc } from '~/lib/orpc'
import {
  listCollection,
  queryClient,
  showUntilSettled,
  useRanked,
} from '~/lib/query-client'
import { toastUndo } from '~/lib/undo'

type Commitment = RouterOutputs['commitments']['list'][number]

const commitments = listCollection({
  getKey: ({ id }) => id,
  id: 'commitments',
  queryFn: () => client.commitments.list(),
  queryKey: orpc.commitments.list.key(),
})
type Section = 'owed' | 'promised' | 'coming'

const SECTIONS: Section[] = ['owed', 'promised', 'coming']
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
  return [
    ['J / K', t.keys.move],
    ['⏎', t.keys.open],
    ['D', row.status === 'fulfilled' ? t.keys.reopen : t.keys.done],
    ['⌫', row.status === 'cancelled' ? t.keys.reopen : t.keys.forget],
    close,
  ] as [string, string][]
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

/** What the Board waits on, as any bot's messages: the sentence, then a message per list. */
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

  const setStatus = useMutation(
    orpc.commitments.setStatus.mutationOptions({
      onMutate: ({ id, status }) =>
        showUntilSettled(() => {
          if (commitments.has(id)) {
            commitments.update(id, (row) => {
              row.history = [
                ...row.history,
                { at: new Date(), by: 'user', messageId: null, to: status },
              ]
              row.status = status
            })
          }
        }),
      onSettled: (_, __, ___, settle) =>
        settle?.(
          queryClient.invalidateQueries({ queryKey: orpc.commitments.key() })
        ),
    })
  )
  const move = (
    row: Commitment | undefined,
    status: CommitmentStatus,
    message: string
  ) => {
    if (!row) {
      return
    }
    const previous = row.status
    setStatus.mutate({ id: row.id, status })
    toastUndo(message, () => setStatus.mutate({ id: row.id, status: previous }))
  }
  const toggle = (
    row: Commitment | undefined,
    status: CommitmentStatus,
    message: string
  ) =>
    row?.status === status
      ? move(row, 'open', t.board.reopened)
      : move(row, status, message)
  const done = (row?: Commitment) =>
    toggle(row, 'fulfilled', t.board.markedDone)
  const forget = (row?: Commitment) =>
    toggle(row, 'cancelled', t.board.forgotten)

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
  useHotkey('D', () => done(active), rowKeys)
  useHotkey('Backspace', () => forget(active), rowKeys)

  const rowOf = (row: Commitment, place: RowPlace) => {
    const isCursor = row === active
    const isDone = row.status === 'fulfilled'
    const isForgotten = row.status === 'cancelled'
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
        <IconButton
          icon={Tick02Icon}
          label={isDone ? t.board.reopen : t.board.done}
          aria-pressed={isDone}
          size="icon-sm"
          variant="ghost-tint-muted"
          shortcut={isCursor ? 'D' : undefined}
          onClick={() => done(row)}
        />
        <IconButton
          icon={Cancel01Icon}
          label={isForgotten ? t.board.reopen : t.board.forget}
          aria-pressed={isForgotten}
          size="icon-sm"
          variant="ghost-tint-muted"
          shortcut={isCursor ? '⌫' : undefined}
          onClick={() => forget(row)}
        />
      </SettingsRow>
    )
  }

  return (
    !isPending &&
    ordered.length > 0 && (
      <>
        <NowMessage isWide={false}>
          <DigestLead>{leadOf(t, locale, sections)}</DigestLead>
        </NowMessage>
        {SECTIONS.map(
          (section) =>
            sections[section].length > 0 && (
              <NowMessage key={section}>
                <SettingsGroup title={t.board.section[section]}>
                  <PaneRows rowKey={({ id }) => id} rows={sections[section]}>
                    {rowOf}
                  </PaneRows>
                </SettingsGroup>
              </NowMessage>
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
