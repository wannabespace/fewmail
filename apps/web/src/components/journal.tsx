import type { RouterOutputs } from '@fewmail/api/router'
import type { Messages } from '@fewmail/shared/i18n'
import { Button } from '@fewmail/ui/components/button'
import {
  SettingsGroup,
  SettingsRow,
} from '@fewmail/ui/components/custom/settings-group'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { format, isToday } from 'date-fns'
import { useState } from 'react'
import { toast } from 'sonner'

import { ExpandTrigger } from '~/components/expand-row'
import { ROW_SWAP } from '~/components/mail-meta'
import { SenderAvatar } from '~/components/sender-avatar'
import { useDates, useT } from '~/lib/i18n'
import { hideThread, threadOfMessage } from '~/lib/mail-db'
import { orpc } from '~/lib/orpc'
import { pendingToast } from '~/lib/undo'

type JournalEntry = RouterOutputs['today']['handled'][number]

const ROWS_PER_DAY = 5
const UNDO_TOAST = 'journal-undo'

/** Newest first in, newest day first out: each day keeps the moment of its first entry for its title. */
const groupByDay = (entries: JournalEntry[]) => {
  const days: { day: Date; key: string; rows: JournalEntry[] }[] = []
  for (const entry of entries) {
    const key = format(entry.action.actedAt, 'yyyy-MM-dd')
    const last = days.at(-1)
    if (last?.key === key) {
      last.rows.push(entry)
    } else {
      days.push({ day: entry.action.actedAt, key, rows: [entry] })
    }
  }
  return days
}

/** The journal as it shows: failed first, then each day cut to its first rows until opened, the order its cursor walks. */
export const useJournal = () => {
  const [openDays, setOpenDays] = useState<string[]>([])
  const { data: entries = [] } = useQuery(orpc.today.handled.queryOptions())
  const failed = entries.filter(({ action }) => action.status === 'failed')
  const days = groupByDay(
    entries.filter(({ action }) => action.status !== 'failed')
  ).map((day) => {
    const isOpen = openDays.includes(day.key)
    return {
      ...day,
      isOpen,
      shown: isOpen ? day.rows : day.rows.slice(0, ROWS_PER_DAY),
    }
  })
  const toggleDay = (key: string) =>
    setOpenDays((open) =>
      open.includes(key) ? open.filter((k) => k !== key) : [...open, key]
    )
  return {
    days,
    failed,
    rows: [...failed, ...days.flatMap(({ shown }) => shown)],
    toggleDay,
  }
}

const whoAllowed = (t: Messages, { action, rule }: JournalEntry) => {
  if (action.status === 'failed') {
    return t.today.journal.failed
  }
  return rule ? t.today.journal.byRule(rule) : t.today.journal.approved
}

/** Everything done in the mail, each with who allowed it: a rule the user turned on or their yes. Lives under Rules, since rules do most of it. */
export const Journal = ({
  cursorId,
  journal: { days, failed, rows, toggleDay },
  onSelect,
}: {
  cursorId: string | undefined
  journal: ReturnType<typeof useJournal>
  onSelect: (id: string) => void
}) => {
  const t = useT()
  const dates = useDates()
  const queryClient = useQueryClient()
  const [undoneIds, setUndoneIds] = useState<string[]>([])
  const refresh = () =>
    Promise.all([
      queryClient.invalidateQueries({ queryKey: orpc.today.key() }),
      queryClient.invalidateQueries({ queryKey: orpc.mail.key() }),
    ])
  const toInbox = useMutation(
    orpc.mail.moveToInbox.mutationOptions({
      ...pendingToast(UNDO_TOAST),
      onSettled: refresh,
      onSuccess: () => toast(t.mail.backInInbox, { id: UNDO_TOAST }),
    })
  )
  const notSpam = useMutation(
    orpc.mail.notSpam.mutationOptions({
      ...pendingToast(UNDO_TOAST),
      onMutate: ({ messageId }) => {
        pendingToast(UNDO_TOAST).onMutate()
        const threadId = threadOfMessage(messageId)
        if (threadId) {
          hideThread(threadId)
        }
      },
      onSettled: refresh,
      onSuccess: () => toast(t.mail.movedToInbox, { id: UNDO_TOAST }),
    })
  )
  const undos: Partial<
    Record<string, { label: string; run: (messageId: string) => void }>
  > = {
    archive: {
      label: t.mail.moveToInbox,
      run: (messageId) => toInbox.mutate({ messageId }),
    },
    spam: {
      label: t.mail.notSpam,
      run: (messageId) => notSpam.mutate({ messageId }),
    },
  }

  const row = (entry: JournalEntry) => {
    const { action, message, rule, summary } = entry
    const undo =
      action.status === 'failed' || undoneIds.includes(action.id)
        ? undefined
        : undos[action.kind]
    const who = whoAllowed(t, entry)
    const time = (
      <span className="text-muted-foreground text-xs tabular-nums">
        {dates.format(action.actedAt, 'p')}
      </span>
    )
    return (
      <SettingsRow
        key={action.id}
        active={cursorId === action.id}
        trigger={
          message ? (
            <ExpandTrigger
              email={{ from: 'journal', threadId: message.threadId }}
              rowId={action.id}
              onClick={() => onSelect(action.id)}
            />
          ) : undefined
        }
        iconVariant="avatar"
        icon={message && <SenderAvatar sender={message} size="sm" />}
        title={
          message ? (
            <span data-mask>{message.fromName ?? message.fromEmail}</span>
          ) : (
            <span data-mask>{action.title}</span>
          )
        }
        description={
          <>
            <span data-mask>
              {[
                action.title || t.actionKind[action.kind],
                // A rule's action carries the rule as its reason: `who` already names it. A promise's reason is only its recipient.
                !rule &&
                  (action.kind === 'commitment' || action.kind === 'heads_up'
                    ? action.detail
                    : action.reason || summary),
              ]
                .filter(Boolean)
                .join(' · ')}
            </span>
            {' · '}
            <span data-mask={!!rule && action.status !== 'failed'}>{who}</span>
          </>
        }
      >
        {message && undo ? (
          <span className={ROW_SWAP}>
            <span className="flex group-focus-within/item:opacity-0 group-hover/item:opacity-0">
              {time}
            </span>
            <span className="opacity-0 group-focus-within/item:opacity-100 group-hover/item:opacity-100">
              <Button
                size="sm"
                variant="ghost-tint-muted"
                onClick={() => {
                  setUndoneIds((ids) => [...ids, action.id])
                  undo.run(message.id)
                }}
              >
                {undo.label}
              </Button>
            </span>
          </span>
        ) : (
          time
        )}
      </SettingsRow>
    )
  }
  if (rows.length === 0) {
    return null
  }
  return (
    <section className="flex flex-col gap-6">
      <header className="flex flex-col gap-1">
        <h2 className="text-brief font-serif">{t.today.journal.title}</h2>
        <p className="text-muted-foreground text-sm">{t.today.journal.lead}</p>
      </header>
      {failed.length > 0 && (
        <SettingsGroup title={t.today.journal.failed}>
          {failed.map(row)}
        </SettingsGroup>
      )}
      {days.map(({ day, isOpen, key, rows: dayRows, shown }) => (
        <div key={key} className="flex flex-col gap-2">
          <SettingsGroup
            title={
              <span className="inline-block first-letter:uppercase">
                {isToday(day)
                  ? t.calendar.today
                  : dates.format(day, 'EEEE, d MMMM')}
              </span>
            }
          >
            {shown.map(row)}
          </SettingsGroup>
          {dayRows.length > ROWS_PER_DAY && (
            <Button
              size="sm"
              variant="ghost-muted"
              className="self-start"
              onClick={() => toggleDay(key)}
            >
              {isOpen ? t.mail.showFewer : t.mail.showAll(dayRows.length)}
            </Button>
          )}
        </div>
      ))}
    </section>
  )
}
