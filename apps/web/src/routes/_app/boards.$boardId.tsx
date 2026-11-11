import type { BoardChart } from '@fewmail/shared/agent'
import { Button } from '@fewmail/ui/components/button'
import {
  SettingsGroup,
  SettingsRow,
} from '@fewmail/ui/components/custom/settings-group'
import { useHotkey } from '@tanstack/react-hotkeys'
import { useMutation, useQuery } from '@tanstack/react-query'
import { createFileRoute, Link, redirect } from '@tanstack/react-router'
import { useState } from 'react'

import { BoardChartCard } from '~/components/board-chart'
import { BoardDialog, newBoardStore } from '~/components/board-dialog'
import { KeyHints } from '~/components/key-hints'
import { useDates, useLocale, useT } from '~/lib/i18n'
import { orpc } from '~/lib/orpc'
import { queryClient } from '~/lib/query-client'

const useMoneyFormat = () => {
  const locale = useLocale()
  return (cents: number, currency: string) =>
    new Intl.NumberFormat(locale, { currency, style: 'currency' }).format(
      cents / 100
    )
}

const BoardPage = () => {
  const t = useT()
  const dates = useDates()
  const money = useMoneyFormat()
  const { boardId } = Route.useParams()
  const { data: board } = useQuery(
    orpc.boards.get.queryOptions({ input: { id: boardId } })
  )
  const [isEditing, setIsEditing] = useState(false)
  const update = useMutation(
    orpc.boards.update.mutationOptions({
      onSettled: () => queryClient.invalidateQueries(),
    })
  )

  useHotkey('E', () => setIsEditing(true))
  useHotkey('N', () => newBoardStore.set(true))

  const charts = board?.charts.map((series): BoardChart => series) ?? []
  const saveCharts = (next: BoardChart[]) =>
    update.mutate({
      charts: next.map(({ groupBy, id, measure, title, type }) => ({
        groupBy,
        id,
        measure,
        title,
        type,
      })),
      id: boardId,
    })

  return (
    <main className="flex min-h-0 flex-1 flex-col">
      <div className="flex-1 overflow-y-auto">
        <div className="mx-auto flex max-w-3xl flex-col gap-8 px-10 pt-12 pb-16">
          <header className="flex flex-col gap-3">
            <h1 className="text-display font-serif tracking-tight" data-mask>
              {board?.name}
            </h1>
            <p className="text-brief text-foreground/85 font-serif" data-mask>
              {board?.description}
            </p>
            {board?.isReadingHistory && (
              <p className="text-muted-foreground animate-pulse text-sm">
                {t.boards.readingHistory}
              </p>
            )}
          </header>

          {board && (
            <section
              aria-label={t.boards.charts}
              className="grid gap-3 sm:grid-cols-2"
            >
              {board.charts.map((series) => (
                <BoardChartCard
                  key={series.id}
                  series={series}
                  onChange={(chart) =>
                    saveCharts(
                      charts.map((current) =>
                        current.id === chart.id ? chart : current
                      )
                    )
                  }
                  onRemove={() =>
                    saveCharts(
                      charts.filter((current) => current.id !== series.id)
                    )
                  }
                />
              ))}
              <Button
                variant="secondary"
                className="justify-self-start"
                onClick={() =>
                  saveCharts([
                    ...charts,
                    {
                      groupBy: 'month',
                      id: crypto.randomUUID(),
                      measure: 'count',
                      title: t.boards.chart.untitled,
                      type: 'bar',
                    },
                  ])
                }
              >
                {t.boards.chart.add}
              </Button>
            </section>
          )}

          {board && board.entries.length === 0 && !board.isReadingHistory && (
            <p className="text-muted-foreground rounded-2xl border border-dashed px-4.5 py-4 text-sm">
              {t.boards.empty}
            </p>
          )}

          {board && board.entries.length > 0 && (
            <SettingsGroup title={t.boards.entries(board.total)}>
              {board.entries.map((entry) => (
                <SettingsRow
                  key={entry.id}
                  title={
                    <Link
                      to="/mail"
                      search={{ thread: entry.threadId }}
                      data-mask
                    >
                      {entry.title}
                    </Link>
                  }
                  description={
                    <span data-mask>
                      {[
                        entry.group,
                        entry.status,
                        dates.format(entry.occurredAt, 'd MMM yyyy'),
                      ]
                        .filter(Boolean)
                        .join(' · ')}
                    </span>
                  }
                >
                  {entry.amountCents !== null && entry.currency && (
                    <span className="tabular-nums" data-mask>
                      {money(entry.amountCents, entry.currency)}
                    </span>
                  )}
                </SettingsRow>
              ))}
            </SettingsGroup>
          )}
        </div>
      </div>
      <KeyHints
        hints={[
          ['E', t.boards.edit],
          ['N', t.boards.new],
        ]}
      />
      {board && (
        <BoardDialog
          board={board}
          open={isEditing}
          onOpenChange={setIsEditing}
        />
      )}
    </main>
  )
}

export const Route = createFileRoute('/_app/boards/$boardId')({
  beforeLoad: ({ context }) => {
    if (context.me.plan.kind === 'free') {
      throw redirect({ to: '/mail' })
    }
  },
  component: BoardPage,
})
