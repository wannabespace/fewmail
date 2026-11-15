import type { BoardChart, BoardGrouping } from '@fewmail/shared/agent'
import { Button } from '@fewmail/ui/components/button'
import { SettingsGroup } from '@fewmail/ui/components/custom/settings-group'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from '@fewmail/ui/components/dropdown-menu'
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from '@fewmail/ui/components/input-group'
import { smallItemBleedClassName } from '@fewmail/ui/components/item'
import { Kbd } from '@fewmail/ui/components/kbd'
import { cn } from '@fewmail/ui/lib/utils'
import {
  Add01Icon,
  Cancel01Icon,
  Delete02Icon,
  Edit02Icon,
  MoreHorizontalIcon,
  Search01Icon,
  Settings01Icon,
  TextAlignLeftIcon,
} from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { useHotkey } from '@tanstack/react-hotkeys'
import { useMutation, useQuery } from '@tanstack/react-query'
import { createFileRoute, redirect, useNavigate } from '@tanstack/react-router'
import { type } from 'arktype'
import { motion } from 'motion/react'
import type { RefObject } from 'react'
import { useEffect, useRef, useState } from 'react'

import { AddChart, BoardChartCard, toChart } from '~/components/board-chart'
import {
  BoardSettingsDialog,
  deletingBoardStore,
  newBoardStore,
} from '~/components/board-dialog'
import type { Board, Entry } from '~/components/board-entries'
import {
  BoardAttention,
  BoardGroups,
  BoardRegular,
  BoardUpcoming,
  EntryRow,
  statusOf,
  upcomingRowId,
  useEntryActions,
  useStatusLabel,
} from '~/components/board-entries'
import { expandRow, useIsThreadExpanded } from '~/components/expand-row'
import { KeyHints } from '~/components/key-hints'
import { upgradeStore } from '~/components/upgrade-dialog'
import { useDates, useMoneyFormat, useT } from '~/lib/i18n'
import { orpc } from '~/lib/orpc'
import { queryClient, warmQuery } from '~/lib/query-client'
import { toastUndo } from '~/lib/undo'

const BOARD_INTENTS = ['chart', 'describe', 'rename', 'settings'] as const
type BoardIntent = (typeof BOARD_INTENTS)[number]

/** Until the user opens the whole history, it stops here, so the regular payments and the charts stay in reach. */
const ENTRIES_FIRST = 10

interface Filter {
  by: BoardGrouping
  key: string
}

const isIn = (entry: Entry, filter: Filter) => {
  switch (filter.by) {
    case 'month':
    case 'week': {
      return entry.keys[filter.by] === filter.key
    }
    case 'group': {
      return entry.group === filter.key
    }
    default: {
      return statusOf(entry) === filter.key
    }
  }
}

/** A board about money keeps no status of its own, its payment stands in; trips and orders carry amounts too, but read as dates. */
const isMoneyBoard = (board: Board) =>
  board.statuses.length === 0 && board.currencies.length > 0

const useBoardUpdate = (boardId: string) => {
  const boardKey = orpc.boards.get.queryKey({ input: { id: boardId } })
  // Each chart edit sends every chart: the next one must build on this one, so it shows at once and edits run in order.
  return useMutation(
    orpc.boards.update.mutationOptions({
      onMutate: async ({ charts: next, description, name }) => {
        await queryClient.cancelQueries({ queryKey: boardKey })
        queryClient.setQueryData(
          boardKey,
          (old) =>
            old && {
              ...old,
              ...(name && { name }),
              ...(description && { description, isReadingHistory: true }),
              ...(next && {
                charts: next.map((chart) => ({
                  currencies: [],
                  left: { amount: 0, currency: 0, payment: 0 },
                  points: [],
                  rest: 0,
                  sumCurrency: null,
                  ...old.charts.find(({ id }) => id === chart.id),
                  ...chart,
                })),
              }),
            }
        )
        if (name) {
          queryClient.setQueryData(orpc.boards.list.queryKey(), (old) =>
            old?.map((item) => (item.id === boardId ? { ...item, name } : item))
          )
        }
      },
      onSettled: () =>
        queryClient.isMutating({
          mutationKey: orpc.boards.update.mutationKey(),
        }) === 1 &&
        queryClient.invalidateQueries({ queryKey: orpc.boards.key() }),
      scope: { id: `board:${boardId}` },
    })
  )
}

/** Commits like a Finder rename: Enter or clicking away saves, Escape keeps the old name. */
const NameField = ({
  name,
  onDone,
  onSave,
}: {
  name: string
  onDone: () => void
  onSave: (name: string) => void
}) => {
  const t = useT()
  const [value, setValue] = useState(name)
  const save = () => {
    onDone()
    if (value.trim() && value.trim() !== name) {
      onSave(value.trim())
    }
  }

  return (
    <input
      // oxlint-disable-next-line jsx-a11y/no-autofocus -- opened by the user to type the name
      autoFocus
      value={value}
      aria-label={t.boards.name}
      onChange={(event) => setValue(event.target.value)}
      onBlur={save}
      onFocus={(event) => event.currentTarget.select()}
      onKeyDown={(event) => {
        if (event.nativeEvent.isComposing) {
          return
        }
        if (event.key === 'Enter') {
          save()
        }
        if (event.key === 'Escape') {
          event.stopPropagation()
          onDone()
        }
      }}
      className="text-display focus-visible:focus-ring -mx-1.5 min-w-0 flex-1 rounded-lg bg-transparent px-1.5 font-serif tracking-tight outline-none"
      data-mask
    />
  )
}

/** A new description reads the history again, so it never saves on blur: only the warning button or ⌘↵ commits it. */
const DescriptionField = ({
  description,
  onDone,
  onSave,
}: {
  description: string
  onDone: () => void
  onSave: (description: string) => void
}) => {
  const t = useT()
  const [value, setValue] = useState(description)
  const isChanged = value.trim().length >= 3 && value.trim() !== description
  const save = () => {
    onDone()
    if (isChanged) {
      onSave(value.trim())
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <textarea
        // oxlint-disable-next-line jsx-a11y/no-autofocus -- opened by the user to type the description
        autoFocus
        value={value}
        aria-label={t.boards.description}
        onChange={(event) => setValue(event.target.value)}
        onKeyDown={(event) => {
          if (event.nativeEvent.isComposing) {
            return
          }
          if (event.key === 'Enter' && (event.metaKey || event.ctrlKey)) {
            event.preventDefault()
            save()
          }
          if (event.key === 'Escape') {
            event.stopPropagation()
            onDone()
          }
        }}
        className="text-brief text-foreground/85 focus-visible:focus-ring -mx-1.5 field-sizing-content resize-none rounded-lg bg-transparent px-1.5 font-serif outline-none"
        data-mask
      />
      <div className="flex flex-wrap items-center gap-2">
        <Button
          size="sm"
          variant={isChanged ? 'warning' : 'secondary'}
          disabled={!isChanged}
          onMouseDown={(event) => event.preventDefault()}
          onClick={save}
          shortcut={<Kbd>⌘⏎</Kbd>}
        >
          {t.boards.redescribe}
        </Button>
        <Button
          size="sm"
          variant="ghost-muted"
          onClick={onDone}
          shortcut={<Kbd>esc</Kbd>}
        >
          {t.boards.cancel}
        </Button>
        <span className="text-muted-foreground text-xs">
          {t.boards.redescribeHint}
        </span>
      </div>
    </div>
  )
}

/** The page's answer in one sentence, worked out here, never by a model: what repeats a month, then what comes next. */
const Headline = ({ board, isMoney }: { board: Board; isMoney: boolean }) => {
  const t = useT()
  const dates = useDates()
  const money = useMoneyFormat()
  const { currency, recurring, upcoming } = board.summary
  const [next] = upcoming.items
  const sentences = [
    isMoney &&
      recurring &&
      currency &&
      t.boards.summary.perMonth(
        `≈ ${money(recurring.monthlyCents, currency)}`,
        recurring.count
      ),
    next &&
      t.boards.summary.next(
        next.title,
        dates.format(next.dueAt, 'd MMM'),
        next.amountCents !== null && next.currency
          ? `${next.isEstimate ? '≈ ' : ''}${money(next.amountCents, next.currency)}`
          : null
      ),
  ].filter(Boolean)
  if (sentences.length === 0) {
    return null
  }

  return (
    <p className="text-brief font-serif" data-mask>
      {sentences.join(' ')}
    </p>
  )
}

type Editing = 'description' | 'name' | null
type BoardUpdate = ReturnType<typeof useBoardUpdate>

const BoardHeader = ({
  board,
  editing,
  isMoney,
  onAddChart,
  onEditing,
  onSettings,
  update,
}: {
  board: Board
  editing: Editing
  isMoney: boolean
  onAddChart: () => void
  onEditing: (editing: Editing) => void
  onSettings: () => void
  update: BoardUpdate
}) => {
  const t = useT()

  return (
    <header className="flex flex-col gap-3">
      <div className="flex items-center justify-between gap-3">
        {editing === 'name' ? (
          <NameField
            name={board.name}
            onDone={() => onEditing(null)}
            onSave={(name) => update.mutate({ id: board.id, name })}
          />
        ) : (
          <h1 className="text-display font-serif tracking-tight">
            <button
              type="button"
              className="cursor-text text-left"
              onClick={() => onEditing('name')}
              data-mask
            >
              {board.name}
            </button>
          </h1>
        )}
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <Button
                size="icon"
                variant="ghost-muted"
                aria-label={t.boards.menu}
              />
            }
          >
            <HugeiconsIcon icon={MoreHorizontalIcon} strokeWidth={2} />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onEditing('name')}>
              <HugeiconsIcon icon={Edit02Icon} strokeWidth={2} />
              {t.boards.rename}
              <DropdownMenuShortcut>E</DropdownMenuShortcut>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onEditing('description')}>
              <HugeiconsIcon icon={TextAlignLeftIcon} strokeWidth={2} />
              {t.boards.describe}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onSettings}>
              <HugeiconsIcon icon={Settings01Icon} strokeWidth={2} />
              {t.boards.settings.title}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onAddChart}>
              <HugeiconsIcon icon={Add01Icon} strokeWidth={2} />
              {t.boards.chart.add}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              variant="destructive"
              onClick={() =>
                deletingBoardStore.set({ id: board.id, name: board.name })
              }
            >
              <HugeiconsIcon icon={Delete02Icon} strokeWidth={2} />
              {t.boards.delete}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      {board.total > 0 && <Headline board={board} isMoney={isMoney} />}
      {editing === 'description' ? (
        <DescriptionField
          description={board.description}
          onDone={() => onEditing(null)}
          onSave={(description) => update.mutate({ description, id: board.id })}
        />
      ) : (
        <p className="text-brief text-muted-foreground font-serif">
          <button
            type="button"
            className="cursor-text text-left"
            onClick={() => onEditing('description')}
            data-mask
          >
            {board.description}
          </button>
        </p>
      )}
      {board.isReadingHistory && (
        <p className="text-muted-foreground animate-pulse text-sm">
          {t.boards.history.reading(board.historyFound, board.total)}
        </p>
      )}
      {!board.isReadingHistory && board.isHistoryCapped && (
        <p className="text-muted-foreground text-xs">
          {t.boards.history.capped(board.historyFound ?? 0)}
        </p>
      )}
    </header>
  )
}

const BoardCharts = ({
  board,
  filter,
  isAddingChart,
  onAddingChart,
  onPick,
  update,
}: {
  board: Board
  filter: Filter | null
  isAddingChart: boolean
  onAddingChart: (open: boolean) => void
  onPick: (filter: Filter | null) => void
  update: BoardUpdate
}) => {
  const t = useT()
  const charts = board.charts.map(toChart)
  const saveCharts = (next: BoardChart[]) =>
    update.mutate({ charts: next.map(toChart), id: board.id })
  const moveChart = (index: number, by: -1 | 1) => {
    const next = [...charts]
    const [moved] = next.splice(index, 1)
    if (moved) {
      next.splice(index + by, 0, moved)
      saveCharts(next)
    }
  }

  // An empty board would show a screen of blank charts above the one line saying why.
  const shown = board.total > 0 || board.isReadingHistory ? board.charts : []

  return (
    <section aria-label={t.boards.charts} className="grid gap-3 sm:grid-cols-2">
      {shown.map((series, index) => (
        <BoardChartCard
          key={series.id}
          series={series}
          hasAmounts={board.currencies.length > 0}
          canMove={{
            earlier: index > 0,
            later: index < board.charts.length - 1,
          }}
          picked={filter?.by === series.groupBy ? filter.key : null}
          onPick={(key) =>
            onPick(key === null ? null : { by: series.groupBy, key })
          }
          onMove={(by) => moveChart(index, by)}
          onChange={(chart) =>
            saveCharts(
              charts.map((current) =>
                current.id === chart.id ? chart : current
              )
            )
          }
          onRemove={() => {
            saveCharts(charts.filter((current) => current.id !== series.id))
            toastUndo(t.boards.chartRemoved, () => saveCharts(charts))
          }}
        />
      ))}
      <AddChart
        boardId={board.id}
        open={isAddingChart}
        onOpenChange={onAddingChart}
      />
    </section>
  )
}

const useFilterLabel = (filter: Filter | null) => {
  const t = useT()
  const dates = useDates()
  const statusLabel = useStatusLabel()
  if (!filter) {
    return null
  }
  if (filter.by === 'status') {
    return statusLabel(filter.key)
  }
  if (filter.by === 'month') {
    return dates.format(new Date(`${filter.key}-01T00:00:00`), 'LLLL yyyy')
  }
  if (filter.by === 'week') {
    return t.boards.chart.weekOf(
      dates.format(new Date(`${filter.key}T00:00:00`), 'd MMM')
    )
  }
  return filter.key
}

/** What happened, newest month first; each month says what was paid, refunded and received in it, side by side, none taken off another. */
const BoardHistory = ({
  active,
  board,
  copies,
  filter,
  hidden,
  onCursor,
  onPick,
  onSearch,
  onShowAll,
  ref,
  search,
  searchRef,
  visible,
}: {
  active: string | undefined
  board: Board
  copies: Map<string, number>
  filter: Filter | null
  /** Entries past `ENTRIES_FIRST`, and on a money board those with no amount, while the history is folded. */
  hidden: number
  onCursor: (index: number) => void
  onPick: (filter: Filter | null) => void
  onSearch: (search: string) => void
  onShowAll: () => void
  ref: RefObject<HTMLElement | null>
  search: string
  searchRef: RefObject<HTMLInputElement | null>
  visible: Entry[]
}) => {
  const t = useT()
  const dates = useDates()
  const money = useMoneyFormat()
  const filterLabel = useFilterLabel(filter)
  const entryActions = useEntryActions(board.id)
  const months = new Map(
    board.summary.months.map((month) => [month.month, month])
  )
  const totalsOf = (key: string) => {
    const month = months.get(key)
    return (
      month &&
      [
        ...month.paid.map((total) => money(total.amountCents, total.currency)),
        ...month.refunded.map((total) =>
          t.boards.summary.refunded(money(total.amountCents, total.currency))
        ),
        ...month.received.map((total) =>
          t.boards.summary.received(money(total.amountCents, total.currency))
        ),
      ].join(' · ')
    )
  }
  const byMonth = Map.groupBy(
    visible.map((entry, index) => ({ entry, index })),
    ({ entry }) => entry.keys.month ?? ''
  )

  return (
    <section ref={ref} className="flex scroll-mt-6 flex-col gap-3">
      <div className={cn('flex items-center gap-2', smallItemBleedClassName)}>
        <InputGroup>
          <InputGroupAddon>
            <HugeiconsIcon icon={Search01Icon} strokeWidth={2} />
          </InputGroupAddon>
          <InputGroupInput
            ref={searchRef}
            value={search}
            onChange={(event) => onSearch(event.target.value)}
            placeholder={t.boards.filter.search}
            aria-label={t.boards.filter.search}
            data-mask
          />
          <InputGroupAddon align="inline-end">
            <Kbd>/</Kbd>
          </InputGroupAddon>
        </InputGroup>
        {filterLabel && (
          <Button
            size="sm"
            variant="secondary"
            aria-label={t.boards.filter.clear}
            onClick={() => onPick(null)}
          >
            <span data-mask>{filterLabel}</span>
            <HugeiconsIcon icon={Cancel01Icon} strokeWidth={2} />
          </Button>
        )}
      </div>
      {visible.length === 0 && (
        <p className="text-muted-foreground px-1 text-sm">
          {t.boards.filter.nothing}
        </p>
      )}
      {[...byMonth].map(([key, rows]) => (
        <SettingsGroup
          key={key}
          title={
            <span className="flex justify-between gap-3">
              {dates.format(new Date(`${key}-01T00:00:00`), 'LLLL yyyy')}
              <span className="tabular-nums" data-mask>
                {totalsOf(key)}
              </span>
            </span>
          }
        >
          {rows.map(({ entry, index }) => (
            <EntryRow
              key={entry.id}
              copies={copies.get(entry.id) ?? 0}
              entry={entry}
              isActive={entry.id === active}
              onOpen={() => entryActions.open(entry)}
              onRemove={() => entryActions.remove(entry)}
              onSelect={() => onCursor(index)}
            />
          ))}
        </SettingsGroup>
      ))}
      {hidden > 0 && (
        <Button
          size="sm"
          variant="link-muted"
          className="self-start"
          onClick={onShowAll}
        >
          {t.boards.groups.showAll(visible.length + hidden)}
        </Button>
      )}
    </section>
  )
}

const BoardEmpty = ({ onDescribe }: { onDescribe: () => void }) => {
  const t = useT()

  return (
    <div className="text-muted-foreground flex flex-col items-start gap-2 rounded-2xl border border-dashed px-4.5 py-4 text-sm">
      <p>{t.boards.empty}</p>
      <Button size="sm" variant="secondary" onClick={onDescribe}>
        {t.boards.describe}
      </Button>
    </div>
  )
}

const useHints = ({
  hasRows,
  isActive,
  isNarrowed,
}: {
  hasRows: boolean
  isActive: boolean
  isNarrowed: boolean
}) => {
  const t = useT()
  const hints: [key: string, label: string][] = []
  if (hasRows) {
    hints.push(['J / K', t.keys.move])
  }
  if (isActive) {
    hints.push(['↵', t.keys.open], ['⌫', t.keys.notOnBoard])
  }
  hints.push(['E', t.keys.rename], ['/', t.keys.search])
  if (isNarrowed) {
    hints.push(['esc', t.keys.clearFilter])
  }
  hints.push(['N', t.boards.new])
  return hints
}

/** The sidebar and ⌘K start an edit by linking here with `?do=`: it is taken once, then the address is cleaned. */
const useBoardIntent = (start: Record<BoardIntent, () => void>) => {
  const navigate = useNavigate()
  const { do: intent } = Route.useSearch()
  const [taken, setTaken] = useState<BoardIntent>()
  if (intent !== taken) {
    setTaken(intent)
    if (intent) {
      start[intent]()
    }
  }
  useEffect(() => {
    if (intent) {
      void navigate({ replace: true, search: {}, to: '.' })
    }
  }, [intent, navigate])
}

const matches = (entry: Entry, filter: Filter | null, query: string) =>
  (!filter || isIn(entry, filter)) &&
  (!query ||
    [entry.title, entry.group, statusOf(entry)].some((value) =>
      value?.toLowerCase().includes(query)
    ))

/**
 * One cursor walks what needs the user, the next dates and the history. A repeat of a charge folds into the one that counts;
 * on a money board an email with no amount waits for Show all. Narrowed, every match shows and the sections above step aside.
 */
const narrow = (
  board: Board | undefined,
  {
    cursor,
    filter,
    isAll,
    search,
  }: {
    cursor: number | null
    filter: Filter | null
    isAll: boolean
    search: string
  }
) => {
  const query = search.trim().toLowerCase()
  const isNarrowed = Boolean(filter || query)
  const isMoney = board ? isMoneyBoard(board) : false
  const entries = board?.entries ?? []
  const needsYou = new Set(board?.attention)
  const copies = new Map<string, number>()
  for (const { repeatOf } of entries) {
    if (repeatOf) {
      copies.set(repeatOf, (copies.get(repeatOf) ?? 0) + 1)
    }
  }
  const attention = isNarrowed
    ? []
    : entries.filter(({ id }) => needsYou.has(id))
  const all = entries.filter(
    (entry) =>
      entry.repeatOf === null &&
      (isNarrowed || !needsYou.has(entry.id)) &&
      matches(entry, filter, query)
  )
  const visible =
    isAll || isNarrowed
      ? all
      : all
          .filter((entry) => !isMoney || entry.amountCents !== null)
          .slice(0, ENTRIES_FIRST)
  const upcoming =
    board && !isNarrowed && !isMoney ? board.summary.upcoming.items : []
  const rows = [
    ...attention.map((entry) => ({
      entry,
      id: entry.id,
      threadId: entry.threadId,
    })),
    ...upcoming.map((item) => ({
      entry: null,
      id: upcomingRowId(item),
      threadId: item.threadId,
    })),
    ...visible.map((entry) => ({
      entry,
      id: entry.id,
      threadId: entry.threadId,
    })),
  ]
  return {
    active:
      cursor === null ? undefined : rows[Math.min(cursor, rows.length - 1)],
    attention,
    copies,
    hidden: all.length - visible.length,
    isMoney,
    isNarrowed,
    query,
    rows,
    upcoming,
    visible,
  }
}

/** Escape is a ladder: the search first, then the filter, then the cursor. */
const unwind = ({
  filter,
  pick,
  query,
  setCursor,
  setSearch,
}: {
  filter: Filter | null
  pick: (filter: null) => void
  query: string
  setCursor: (cursor: null) => void
  setSearch: (search: string) => void
}) => {
  if (query) {
    setSearch('')
  } else if (filter) {
    pick(null)
  } else {
    setCursor(null)
  }
}

type Row = ReturnType<typeof narrow>['rows'][number]

/** J / K walk the next dates and the entries as one list; ⌫ takes off only an entry, a next date is not on the board. */
const useRowKeys = ({
  active,
  boardId,
  isFree,
  onCursor,
  rows,
}: {
  active: Row | undefined
  boardId: string
  isFree: boolean
  onCursor: (move: (index: number | null) => number) => void
  rows: Row[]
}) => {
  const entryActions = useEntryActions(boardId)
  const listKeys = { enabled: isFree && rows.length > 0 }
  const rowKeys = { enabled: isFree && Boolean(active) }
  const step = (by: number) =>
    onCursor((index) =>
      Math.max(0, Math.min(rows.length - 1, (index ?? -1) + by))
    )
  const open = () =>
    active && expandRow(active.id, { from: 'board', threadId: active.threadId })

  useHotkey('J', () => step(1), listKeys)
  useHotkey('ArrowDown', () => step(1), listKeys)
  useHotkey('K', () => step(-1), listKeys)
  useHotkey('ArrowUp', () => step(-1), listKeys)
  useHotkey('Enter', open, rowKeys)
  useHotkey('O', open, rowKeys)
  useHotkey(
    'Backspace',
    () => active?.entry && entryActions.remove(active.entry),
    { enabled: isFree && Boolean(active?.entry) }
  )
}

const BoardPage = ({ boardId }: { boardId: string }) => {
  const { data: board } = useQuery(
    orpc.boards.get.queryOptions({ input: { id: boardId } })
  )
  const [editing, setEditing] = useState<Editing>(null)
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const [isAddingChart, setIsAddingChart] = useState(false)
  const [filter, setFilter] = useState<Filter | null>(null)
  const [search, setSearch] = useState('')
  const [cursor, setCursor] = useState<number | null>(null)
  const [isAll, setIsAll] = useState(false)
  const searchRef = useRef<HTMLInputElement>(null)
  const entriesRef = useRef<HTMLElement>(null)
  const update = useBoardUpdate(boardId)

  useBoardIntent({
    chart: () => setIsAddingChart(true),
    describe: () => setEditing('description'),
    rename: () => setEditing('name'),
    settings: () => setIsSettingsOpen(true),
  })

  const isUnderEmail = useIsThreadExpanded()
  const {
    active,
    attention,
    copies,
    hidden,
    isMoney,
    isNarrowed,
    query,
    rows,
    upcoming,
    visible,
  } = narrow(board, { cursor, filter, isAll, search })
  const isFree = !editing && !isSettingsOpen && !isUnderEmail
  // A chart or a group sits below the entries: the filtered list comes up into view.
  const pick = (next: Filter | null) => {
    setFilter(next)
    setCursor(null)
    if (next) {
      entriesRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }
  const pickedGroup = filter?.by === 'group' ? filter.key : null
  const activeId = active?.id
  const pickGroup = (group: string | null) =>
    pick(group === null ? null : { by: 'group', key: group })
  const hints = useHints({
    hasRows: rows.length > 0,
    isActive: Boolean(active),
    isNarrowed,
  })

  useRowKeys({ active, boardId, isFree, onCursor: setCursor, rows })
  useHotkey('E', () => setEditing('name'), { enabled: isFree })
  useHotkey('/', () => searchRef.current?.focus(), { enabled: isFree })
  useHotkey('N', () => newBoardStore.set(true), { enabled: isFree })
  useHotkey('Escape', () => searchRef.current?.blur(), {
    ignoreInputs: false,
    target: searchRef,
  })
  useHotkey(
    'Escape',
    () => unwind({ filter, pick, query, setCursor, setSearch }),
    {
      enabled: isFree && Boolean(query || filter || active),
    }
  )

  if (!board) {
    return <main className="flex min-h-0 flex-1 flex-col" />
  }

  return (
    <main className="flex min-h-0 flex-1 flex-col">
      <motion.div layoutScroll className="flex-1 overflow-y-auto">
        <div className="mx-auto flex max-w-3xl flex-col gap-8 px-10 pt-12 pb-16 max-md:px-4 max-md:pt-6">
          <BoardHeader
            board={board}
            editing={editing}
            isMoney={isMoney}
            update={update}
            onEditing={setEditing}
            onSettings={() => setIsSettingsOpen(true)}
            onAddChart={() => setIsAddingChart(true)}
          />
          {board.total === 0 && !board.isReadingHistory && (
            <BoardEmpty onDescribe={() => setEditing('description')} />
          )}
          {attention.length > 0 && (
            <BoardAttention
              active={activeId}
              boardId={board.id}
              entries={attention}
              onCursor={setCursor}
            />
          )}
          {upcoming.length > 0 && (
            <BoardUpcoming
              active={activeId}
              items={upcoming}
              onCursor={(index) => setCursor(attention.length + index)}
            />
          )}
          {isMoney && (
            <BoardRegular
              board={board}
              picked={pickedGroup}
              onPick={pickGroup}
            />
          )}
          {board.total > 0 && (
            <BoardHistory
              ref={entriesRef}
              active={activeId}
              board={board}
              copies={copies}
              filter={filter}
              hidden={hidden}
              search={search}
              searchRef={searchRef}
              visible={visible}
              onCursor={(index) =>
                setCursor(attention.length + upcoming.length + index)
              }
              onPick={pick}
              onShowAll={() => setIsAll(true)}
              onSearch={(next) => {
                setSearch(next)
                setCursor(null)
              }}
            />
          )}
          {!isMoney && board.groups.length > 1 && (
            <BoardGroups
              board={board}
              picked={pickedGroup}
              onPick={pickGroup}
            />
          )}
          <BoardCharts
            board={board}
            filter={filter}
            update={update}
            isAddingChart={isAddingChart}
            onAddingChart={setIsAddingChart}
            onPick={pick}
          />
        </div>
      </motion.div>
      <KeyHints hints={hints} />
      <BoardSettingsDialog
        board={board}
        open={isSettingsOpen}
        onOpenChange={setIsSettingsOpen}
      />
    </main>
  )
}

const BoardRoute = () => {
  const { boardId } = Route.useParams()
  return <BoardPage key={boardId} boardId={boardId} />
}

export const Route = createFileRoute('/_app/boards/$boardId')({
  beforeLoad: ({ context, preload }) => {
    if (context.me.plan.kind === 'free') {
      if (!preload) {
        upgradeStore.set('boards')
      }
      throw redirect({ to: '/mail' })
    }
  },
  component: BoardRoute,
  loader: ({ params }) =>
    warmQuery(orpc.boards.get.queryOptions({ input: { id: params.boardId } })),
  validateSearch: type({ 'do?': type.enumerated(...BOARD_INTENTS) }),
})
