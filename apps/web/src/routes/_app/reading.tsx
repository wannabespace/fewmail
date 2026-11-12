import { Empty, EmptyDescription } from '@fewmail/ui/components/empty'
import { cn } from '@fewmail/ui/lib/utils'
import { useHotkey } from '@tanstack/react-hotkeys'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import { isToday } from 'date-fns'
import { useState } from 'react'
import { useSubscription } from 'seitu/react'
import { createMediaQuery } from 'seitu/web'

import { KeyHints } from '~/components/key-hints'
import { ThreadView } from '~/components/thread-view'
import { useDates, useT } from '~/lib/i18n'
import { prefetchThread } from '~/lib/mail-db'
import { orpc } from '~/lib/orpc'
import { warmQuery } from '~/lib/query-client'

/** Too narrow for both panes: the list gives way to the open newsletter. */
const narrowScreen = createMediaQuery({ query: '(max-width: 1100px)' })

const ReadingPage = () => {
  const t = useT()
  const dates = useDates()
  const queryClient = useQueryClient()
  const isNarrow = useSubscription(narrowScreen)
  const { data: rows = [], isPending } = useQuery(
    orpc.reading.list.queryOptions()
  )
  const [cursor, setCursor] = useState(0)
  const [reader, setReader] = useState<'auto' | 'open' | 'closed'>('auto')
  const active = rows[Math.min(cursor, rows.length - 1)]
  const isReading =
    !!active && (reader === 'open' || (reader === 'auto' && !isNarrow))

  const listKeys = { enabled: !!active }
  const move = (step: number) =>
    setCursor((index) => {
      const next = Math.max(0, Math.min(rows.length - 1, index + step))
      const threadId = rows[next]?.threadId
      if (threadId) {
        void prefetchThread(threadId)
      }
      return next
    })
  useHotkey('J', () => move(1), listKeys)
  useHotkey('ArrowDown', () => move(1), listKeys)
  useHotkey('K', () => move(-1), listKeys)
  useHotkey('ArrowUp', () => move(-1), listKeys)
  useHotkey('Enter', () => setReader('open'), listKeys)
  useHotkey('Escape', () => setReader('closed'), { enabled: isReading })

  return (
    <main className="flex min-h-0 flex-1 overflow-hidden">
      <section
        aria-label={t.reading.title}
        className={cn(
          'flex min-w-0 flex-col border-r',
          isNarrow ? 'flex-1' : 'w-96 shrink-0',
          isNarrow && isReading && 'hidden'
        )}
      >
        <header className="flex flex-col gap-1 border-b px-5 pt-6 pb-4">
          <h1 className="font-serif text-2xl tracking-tight">
            {t.reading.title}
          </h1>
          {rows.length > 0 && (
            <p className="text-muted-foreground text-xs">
              {t.reading.digest(rows.length)}
            </p>
          )}
        </header>
        {!isPending && rows.length === 0 && (
          <Empty>
            <EmptyDescription>{t.reading.empty}</EmptyDescription>
          </Empty>
        )}
        <ul className="flex-1 overflow-y-auto">
          {rows.map((row, index) => (
            <li
              key={row.id}
              className={cn(
                'border-b',
                row === active ? 'bg-accent' : 'hover:bg-accent',
                row === active && isReading && 'bg-secondary'
              )}
            >
              <button
                type="button"
                tabIndex={-1}
                aria-current={row === active && isReading}
                onPointerEnter={() => {
                  void prefetchThread(row.threadId)
                }}
                onClick={() => {
                  setCursor(index)
                  setReader('open')
                }}
                className="flex w-full cursor-pointer flex-col gap-1 px-5 py-3 text-left outline-none"
              >
                <span className="text-muted-foreground flex items-center gap-2 text-xs">
                  <span data-mask className="min-w-0 flex-1 truncate">
                    {row.fromName ?? row.fromEmail}
                  </span>
                  <span className="shrink-0 tabular-nums">
                    {dates.format(
                      row.receivedAt,
                      isToday(row.receivedAt) ? 'HH:mm' : 'd MMM'
                    )}
                  </span>
                </span>
                <span data-mask className="line-clamp-2 text-sm font-medium">
                  {row.subject}
                </span>
                <span
                  data-mask
                  className="text-muted-foreground line-clamp-2 text-xs"
                >
                  {row.summary}
                </span>
              </button>
            </li>
          ))}
        </ul>
        {active && !isReading && (
          <KeyHints
            hints={[
              ['J / K', t.keys.move],
              ['⏎', t.keys.open],
            ]}
          />
        )}
      </section>
      {isReading ? (
        <div className="bg-background flex min-w-0 flex-1 flex-col">
          <ThreadView
            key={active.threadId}
            isSnoozed={false}
            threadId={active.threadId}
            onClose={() => setReader('closed')}
            onDone={() =>
              queryClient.invalidateQueries({ queryKey: orpc.reading.key() })
            }
          />
          <KeyHints
            hints={[
              ['J / K', t.keys.move],
              ['esc', t.keys.close],
            ]}
          />
        </div>
      ) : (
        !isNarrow && (
          <div className="bg-background flex min-w-0 flex-1">
            <Empty>
              <EmptyDescription>{t.mail.noThread}</EmptyDescription>
            </Empty>
          </div>
        )
      )}
    </main>
  )
}

export const Route = createFileRoute('/_app/reading')({
  component: ReadingPage,
  loader: () => warmQuery(orpc.reading.list.queryOptions()),
})
