import type { RouterOutputs } from '@fewmail/api/router'
import { ACTIVE_COMMITMENT_STATUSES } from '@fewmail/shared/agent'
import type { CommitmentStatus } from '@fewmail/shared/agent'
import type { Messages } from '@fewmail/shared/i18n'
import { Button } from '@fewmail/ui/components/button'
import { IconButton } from '@fewmail/ui/components/custom/icon-button'
import {
  SettingsGroup,
  SettingsRow,
  SettingsRows,
} from '@fewmail/ui/components/custom/settings-group'
import { Kbd } from '@fewmail/ui/components/kbd'
import { Cancel01Icon, Tick02Icon } from '@hugeicons/core-free-icons'
import { useHotkey } from '@tanstack/react-hotkeys'
import { useMutation, useQuery } from '@tanstack/react-query'
import { createFileRoute, redirect } from '@tanstack/react-router'
import { startOfToday, subDays } from 'date-fns'
import { useState } from 'react'

import { ExpandTrigger, expandRow } from '~/components/expand-row'
import { KeyHints } from '~/components/key-hints'
import { SenderAvatar } from '~/components/sender-avatar'
import { upgradeStore } from '~/components/upgrade-dialog'
import { useDates, useLocale, useT } from '~/lib/i18n'
import { orpc } from '~/lib/orpc'
import { queryClient, warmQuery } from '~/lib/query-client'
import { toastUndo } from '~/lib/undo'

type Commitment = RouterOutputs['commitments']['list'][number]
type Section = 'owed' | 'promised' | 'coming' | 'settled'

const SECTIONS: Section[] = ['owed', 'promised', 'coming', 'settled']
/** What was settled stays in sight this long, so a promise the agent closed on its own never vanishes unseen. */
const SETTLED_DAYS = 14

const isActive = (status: CommitmentStatus) =>
  (ACTIVE_COMMITMENT_STATUSES as readonly string[]).includes(status)

const changedAt = ({ history }: Commitment) => history.at(-1)?.at ?? null

const sectionOf = (commitment: Commitment, today: Date): Section | null => {
  if (!isActive(commitment.status)) {
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
  return parts.length > 0 ? parts.join(' ') : t.board.lead.empty
}

/** In people's words, never the status names: "they answered, not done yet", "overdue". */
const stateOf = (t: Messages, commitment: Commitment, today: Date) =>
  commitment.status === 'open' && commitment.dueAt < today
    ? t.board.state.overdue
    : t.board.state[commitment.status]

const hintsOf = (t: Messages, row: Commitment | undefined) => {
  if (!row) {
    return [['J / K', t.keys.move]] as [string, string][]
  }
  return [
    ['J / K', t.keys.move],
    ['⏎', t.keys.open],
    ...(isActive(row.status)
      ? [
          ['D', t.keys.done],
          ['⌫', t.keys.forget],
        ]
      : [['R', t.keys.reopen]]),
  ] as [string, string][]
}

const BoardPage = () => {
  const t = useT()
  const dates = useDates()
  const locale = useLocale()
  const today = startOfToday()
  const { data = [], isPending } = useQuery(
    orpc.commitments.list.queryOptions()
  )
  const sections = Object.fromEntries(
    SECTIONS.map((section) => [
      section,
      data.filter((row) => sectionOf(row, today) === section),
    ])
  ) as Record<Section, Commitment[]>
  const ordered = SECTIONS.flatMap((section) => sections[section])
  const [cursorId, setCursorId] = useState<string | null>(null)
  const active = ordered.find(({ id }) => id === cursorId)

  const listKey = orpc.commitments.list.queryKey()
  const setStatus = useMutation(
    orpc.commitments.setStatus.mutationOptions({
      onMutate: ({ id, status }) => {
        queryClient.setQueryData(listKey, (rows) =>
          rows?.map((row) =>
            row.id === id
              ? {
                  ...row,
                  history: [
                    ...row.history,
                    {
                      at: new Date(),
                      by: 'user' as const,
                      messageId: null,
                      to: status,
                    },
                  ],
                  status,
                }
              : row
          )
        )
      },
      onSettled: () => queryClient.invalidateQueries({ queryKey: listKey }),
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
  const threadOf = (row: Commitment) =>
    (row.status === 'fulfilled' && row.evidenceThreadId) || row.threadId
  const open = (row?: Commitment) =>
    row && expandRow(row.id, { from: 'board', threadId: threadOf(row) })

  const step = (by: number) => {
    const index = ordered.findIndex(({ id }) => id === cursorId)
    const next = ordered[Math.max(0, Math.min(ordered.length - 1, index + by))]
    setCursorId(next?.id ?? null)
  }
  const listKeys = { enabled: ordered.length > 0 }
  const isOpenRow = !!active && isActive(active.status)
  useHotkey('J', () => step(1), listKeys)
  useHotkey('ArrowDown', () => step(1), listKeys)
  useHotkey('K', () => step(-1), listKeys)
  useHotkey('ArrowUp', () => step(-1), listKeys)
  useHotkey('Enter', () => open(active), { enabled: !!active })
  useHotkey('O', () => open(active), { enabled: !!active })
  useHotkey('D', () => done(active), { enabled: isOpenRow })
  useHotkey('Backspace', () => forget(active), { enabled: isOpenRow })
  useHotkey('R', () => reopen(active), {
    enabled: !!active && !isOpenRow,
  })
  useHotkey('Escape', () => setCursorId(null), { enabled: !!active })

  const rowOf = (row: Commitment) => {
    const isCursor = row === active
    const date =
      row.kind === 'deadline'
        ? t.board.lastDay(dates.format(row.dueAt, 'd MMM'))
        : t.board.by(dates.format(row.dueAt, 'd MMM'))
    const settledOn = changedAt(row)
    const sender =
      row.kind === 'mine' && row.recipient
        ? { fromEmail: row.recipient, fromName: null }
        : row.from
    return (
      <SettingsRow
        key={row.id}
        rowKey={row.id}
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
        description={
          isActive(row.status)
            ? `${stateOf(t, row, today)} · ${date}`
            : `${t.board.state[row.status]}${settledOn ? ` · ${dates.format(settledOn, 'd MMM')}` : ''}`
        }
      >
        {row.amountCents !== null && row.currency && (
          <span data-mask className="text-sm tabular-nums">
            {moneyText(locale, row.amountCents, row.currency)}
          </span>
        )}
        {isActive(row.status) ? (
          <>
            <IconButton
              icon={Tick02Icon}
              label={t.board.done}
              size="icon-sm"
              variant="ghost-muted"
              shortcut={isCursor ? 'D' : undefined}
              onClick={() => done(row)}
            />
            <IconButton
              icon={Cancel01Icon}
              label={t.board.forget}
              size="icon-sm"
              variant="ghost-muted"
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
    <main className="flex flex-1 flex-col overflow-hidden">
      <div className="flex-1 overflow-y-auto">
        <div className="mx-auto flex max-w-3xl flex-col gap-8 px-10 pt-12 pb-16 max-md:px-4 max-md:pt-6">
          <header className="flex flex-col gap-3">
            <h1 className="text-display font-serif tracking-tight">
              {t.nav.board}
            </h1>
            {!isPending && (
              <p className="text-brief text-foreground/85 font-serif">
                {leadOf(t, locale, sections)}
              </p>
            )}
          </header>
          {SECTIONS.map(
            (section) =>
              sections[section].length > 0 && (
                <SettingsGroup key={section} title={t.board.section[section]}>
                  <SettingsRows>{sections[section].map(rowOf)}</SettingsRows>
                </SettingsGroup>
              )
          )}
        </div>
      </div>
      {ordered.length > 0 && <KeyHints hints={hintsOf(t, active)} />}
    </main>
  )
}

export const Route = createFileRoute('/_app/board')({
  // What the agent writes down is Pro: Free sees the entry point and gets the upgrade dialog instead (`domain.md` → Free).
  beforeLoad: ({ context: { me }, preload }) => {
    if (me.plan.kind === 'free') {
      if (!preload) {
        upgradeStore.set('board')
      }
      throw redirect({ to: '/mail' })
    }
  },
  component: BoardPage,
  loader: () => warmQuery(orpc.commitments.list.queryOptions()),
})
