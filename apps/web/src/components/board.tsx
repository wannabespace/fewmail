import type { RouterOutputs } from '@fewmail/api/router'
import { ACTIVE_COMMITMENT_STATUSES } from '@fewmail/shared/agent'
import type { CommitmentStatus } from '@fewmail/shared/agent'
import type { Messages } from '@fewmail/shared/i18n'
import { Button } from '@fewmail/ui/components/button'
import { IconButton } from '@fewmail/ui/components/custom/icon-button'
import {
  SettingsGroup,
  SettingsRow,
} from '@fewmail/ui/components/custom/settings-group'
import { Kbd } from '@fewmail/ui/components/kbd'
import { Cancel01Icon, Tick02Icon } from '@hugeicons/core-free-icons'
import { useHotkey } from '@tanstack/react-hotkeys'
import { useMutation } from '@tanstack/react-query'
import { startOfToday, subDays } from 'date-fns'
import { useEffect, useState } from 'react'
import { createStore } from 'seitu'
import { useSubscription } from 'seitu/react'

import { ExpandTrigger, expandRow } from '~/components/expand-row'
import { PaneEmpty } from '~/components/pane-empty'
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
type Section = 'owed' | 'promised' | 'coming' | 'settled'

const SECTIONS: Section[] = ['owed', 'promised', 'coming', 'settled']
/** What was settled stays in sight this long, so a promise the agent closed on its own never vanishes unseen. */
const SETTLED_DAYS = 14

const isOpenStatus = (status: CommitmentStatus) =>
  (ACTIVE_COMMITMENT_STATUSES as readonly string[]).includes(status)

const changedAt = ({ history }: Commitment) => history.at(-1)?.at ?? null

const sectionOf = (commitment: Commitment, today: Date): Section | null => {
  if (!isOpenStatus(commitment.status)) {
    const at = changedAt(commitment)
    return at && at > subDays(today, SETTLED_DAYS) ? 'settled' : null
  }
  if (commitment.kind === 'deadline') {
    return commitment.dueAt >= today ? 'coming' : null
  }
  return commitment.kind === 'theirs' ? 'owed' : 'promised'
}

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
  const owedByCurrency = Map.groupBy(
    sections.owed.filter(
      ({ amountCents, currency }) => amountCents && currency
    ),
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
      sections.owed.length > 0 &&
      t.board.lead.waiting(sections.owed.length),
    sections.promised.length > 0 &&
      t.board.lead.promised(sections.promised.length),
    sections.coming.length > 0 && t.board.lead.coming(sections.coming.length),
  ].filter(Boolean)
  return parts.length > 0
    ? parts.join(' ')
    : `${t.board.empty.title} ${t.board.empty.lead}`
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
    ...(isOpenStatus(row.status)
      ? [
          ['D', t.keys.done],
          ['⌫', t.keys.forget],
        ]
      : [['R', t.keys.reopen]]),
    close,
  ] as [string, string][]
}

/** Every promise and last day sorted into the Board's lists; nothing is asked on Free, where there is none. */
const useBoard = () => {
  const hasAgent = useHasAgent()
  const { data = [], isLoading } = useRanked(commitments, hasAgent)
  const rows: Commitment[] = data
  const today = startOfToday()
  const sections = Object.fromEntries(
    SECTIONS.map((section) => [
      section,
      rows.filter((row) => sectionOf(row, today) === section),
    ])
  ) as Record<Section, Commitment[]>
  return {
    isPending: !hasAgent || isLoading,
    ordered: SECTIONS.flatMap((section) => sections[section]),
    sections,
    today,
  }
}

/** The Board's chat on Home: the sentence, then the lists. */
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
  const done = (row?: Commitment) => move(row, 'fulfilled', t.board.markedDone)
  const forget = (row?: Commitment) => move(row, 'cancelled', t.board.forgotten)
  const reopen = (row?: Commitment) => move(row, 'open', t.board.reopened)

  const step = (by: number) => {
    const index = ordered.findIndex(({ id }) => id === cursorId)
    const next = ordered[Math.max(0, Math.min(ordered.length - 1, index + by))]
    setCursorId(next?.id ?? null)
  }
  const listKeys = { enabled: isActive && ordered.length > 0 }
  const isOpenRow = isActive && !!active && isOpenStatus(active.status)
  useHotkey('J', () => step(1), listKeys)
  useHotkey('ArrowDown', () => step(1), listKeys)
  useHotkey('K', () => step(-1), listKeys)
  useHotkey('ArrowUp', () => step(-1), listKeys)
  const rowKeys = { enabled: isActive && !!active }
  useHotkey('Enter', () => openRow(active), rowKeys)
  useHotkey('O', () => openRow(active), rowKeys)
  useHotkey('D', () => done(active), { enabled: isOpenRow })
  useHotkey('Backspace', () => forget(active), { enabled: isOpenRow })
  useHotkey('R', () => reopen(active), {
    enabled: isActive && !!active && !isOpenStatus(active.status),
  })

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
        title={<span data-mask>{row.promise}</span>}
        description={descriptionOf(t, dates, row, today)}
      >
        {row.amountCents !== null && row.currency && (
          <span data-mask className="text-sm tabular-nums">
            {moneyText(locale, row.amountCents, row.currency)}
          </span>
        )}
        {isOpenStatus(row.status) ? (
          <>
            <IconButton
              icon={Tick02Icon}
              label={t.board.done}
              size="icon-sm"
              variant="ghost-tint-muted"
              shortcut={isCursor ? 'D' : undefined}
              onClick={() => done(row)}
            />
            <IconButton
              icon={Cancel01Icon}
              label={t.board.forget}
              size="icon-sm"
              variant="ghost-tint-muted"
              shortcut={isCursor ? '⌫' : undefined}
              onClick={() => forget(row)}
            />
          </>
        ) : (
          <Button
            size="sm"
            variant="ghost"
            shortcut={isCursor && <Kbd>R</Kbd>}
            onClick={() => reopen(row)}
          >
            {t.board.reopen}
          </Button>
        )}
      </SettingsRow>
    )
  }

  return (
    <>
      {!isPending && ordered.length > 0 && (
        <p className="text-brief text-foreground/85 font-serif text-balance">
          {leadOf(t, locale, sections)}
        </p>
      )}
      <PaneEmpty
        isShown={!isPending && ordered.length === 0}
        {...t.board.empty}
      />
      {SECTIONS.map(
        (section) =>
          sections[section].length > 0 && (
            <SettingsGroup key={section} title={t.board.section[section]}>
              <PaneRows rowKey={({ id }) => id} rows={sections[section]}>
                {rowOf}
              </PaneRows>
            </SettingsGroup>
          )
      )}
    </>
  )
}

/** The Board's keys for Home's hints, which change with the cursor's row. */
export const useBoardHints = () => {
  const t = useT()
  return hintsOf(t, useSubscription(boardCursor))
}
