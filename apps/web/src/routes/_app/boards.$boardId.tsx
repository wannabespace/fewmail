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
import type { RefObject } from 'react'
import { useEffect, useRef, useState } from 'react'

import { BoardBanners } from '~/components/board-banners'
import { AddChart, BoardChartCard, toChart } from '~/components/board-chart'
import {
  BoardSettingsDialog,
  deletingBoardStore,
  newBoardStore,
} from '~/components/board-dialog'
import type { Board, Entry } from '~/components/board-entries'
import {
  BoardGroups,
  EntryDialog,
  EntryRow,
  useEntryActions,
} from '~/components/board-entries'
import { KeyHints } from '~/components/key-hints'
import { upgradeStore } from '~/components/upgrade-dialog'
import { useDates, useMoneyFormat, useT } from '~/lib/i18n'
import { orpc } from '~/lib/orpc'
import { queryClient, warmQuery } from '~/lib/query-client'

const BOARD_INTENTS = ['chart', 'describe', 'rename', 'settings'] as const
type BoardIntent = (typeof BOARD_INTENTS)[number]

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
    default: {
      return entry[filter.by] === filter.key
    }
  }
}

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
                  points: [],
                  rest: 0,
                  skipped: 0,
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
        >
          {t.boards.redescribe} <Kbd>⌘⏎</Kbd>
        </Button>
        <Button size="sm" variant="ghost-muted" onClick={onDone}>
          {t.boards.cancel} <Kbd>esc</Kbd>
        </Button>
        <span className="text-muted-foreground text-xs">
          {t.boards.redescribeHint}
        </span>
      </div>
    </div>
  )
}

const Summary = ({ board }: { board: Board }) => {
  const t = useT()
  const money = useMoneyFormat()
  const { currency, lastMonth, recurring, thisMonth, upcoming } = board.summary
  const valueOf = (span: typeof thisMonth) =>
    currency && span.amountCents !== null
      ? money(span.amountCents, currency)
      : String(span.count)
  const stats = [
    [
      t.boards.summary.thisMonth,
      valueOf(thisMonth),
      t.boards.entries(thisMonth.count),
    ],
    [
      t.boards.summary.lastMonth,
      valueOf(lastMonth),
      t.boards.entries(lastMonth.count),
    ],
    ...(recurring && currency
      ? [
          [
            t.boards.summary.recurring(recurring.count),
            t.boards.summary.perMonth(money(recurring.monthlyCents, currency)),
            null,
          ] as const,
        ]
      : []),
    ...(upcoming > 0
      ? [[t.boards.summary.upcoming, String(upcoming), null] as const]
      : []),
  ] as const

  return (
    <dl className="grid grid-cols-2 gap-x-6 gap-y-4 sm:grid-cols-4">
      {stats.map(([label, value, note]) => (
        <div key={label} className="flex flex-col gap-0.5">
          <dt className="text-muted-foreground text-xs">{label}</dt>
          <dd className="text-xl tabular-nums" data-mask>
            {value}
          </dd>
          {currency && note && (
            <dd className="text-muted-foreground text-xs">{note}</dd>
          )}
        </div>
      ))}
    </dl>
  )
}

type Editing = 'description' | 'name' | null
type BoardUpdate = ReturnType<typeof useBoardUpdate>

const BoardHeader = ({
  board,
  editing,
  onAddChart,
  onEditing,
  onSettings,
  update,
}: {
  board: Board
  editing: Editing
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
      {editing === 'description' ? (
        <DescriptionField
          description={board.description}
          onDone={() => onEditing(null)}
          onSave={(description) => update.mutate({ description, id: board.id })}
        />
      ) : (
        <p className="text-brief text-foreground/85 font-serif">
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
          onRemove={() =>
            saveCharts(charts.filter((current) => current.id !== series.id))
          }
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
  if (!filter) {
    return null
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

const BoardEntries = ({
  active,
  board,
  filter,
  onEdit,
  onPick,
  onSearch,
  search,
  searchRef,
  visible,
}: {
  active: Entry | undefined
  board: Board
  filter: Filter | null
  onEdit: (entry: Entry) => void
  onPick: (filter: Filter | null) => void
  onSearch: (search: string) => void
  search: string
  searchRef: RefObject<HTMLInputElement | null>
  visible: Entry[]
}) => {
  const t = useT()
  const filterLabel = useFilterLabel(filter)
  const entryActions = useEntryActions(board.id)
  const isNarrowed = Boolean(filter || search.trim())

  return (
    <section className="flex flex-col gap-3">
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
      {visible.length === 0 ? (
        <p className="text-muted-foreground px-1 text-sm">
          {t.boards.filter.nothing}
        </p>
      ) : (
        <SettingsGroup
          title={
            isNarrowed
              ? `${t.boards.entries(visible.length)} / ${board.total}`
              : t.boards.entries(board.total)
          }
        >
          {visible.map((entry) => (
            <EntryRow
              key={entry.id}
              entry={entry}
              isActive={entry === active}
              onOpen={() => entryActions.open(entry)}
              onEdit={() => onEdit(entry)}
              onRemove={() => entryActions.remove(entry)}
            />
          ))}
        </SettingsGroup>
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
    hints.push(['↵', t.keys.open], ['E', t.keys.edit], ['⌫', t.keys.notOnBoard])
  } else {
    hints.push(['E', t.keys.rename])
  }
  hints.push(['/', t.keys.search])
  if (isNarrowed) {
    hints.push(['esc', t.keys.clearFilter])
  }
  hints.push(['N', t.boards.new])
  return hints
}

/** The sidebar and ⌘K start an edit by linking here with `?do=`: it is taken once, then the address is cleaned. */
const useBoardIntent = (start: (intent: BoardIntent) => void) => {
  const navigate = useNavigate()
  const { do: intent } = Route.useSearch()
  const [taken, setTaken] = useState<BoardIntent>()
  if (intent !== taken) {
    setTaken(intent)
    if (intent) {
      start(intent)
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
    [entry.title, entry.group, entry.status].some((value) =>
      value?.toLowerCase().includes(query)
    ))

const narrow = (
  board: Board | undefined,
  {
    cursor,
    filter,
    search,
  }: { cursor: number | null; filter: Filter | null; search: string }
) => {
  const query = search.trim().toLowerCase()
  const visible = (board?.entries ?? []).filter((entry) =>
    matches(entry, filter, query)
  )
  return {
    active:
      cursor === null
        ? undefined
        : visible[Math.min(cursor, visible.length - 1)],
    query,
    visible,
  }
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
  const [editingEntry, setEditingEntry] = useState<Entry | null>(null)
  const searchRef = useRef<HTMLInputElement>(null)
  const update = useBoardUpdate(boardId)
  const entryActions = useEntryActions(boardId)

  useBoardIntent((intent) => {
    if (intent === 'settings') {
      setIsSettingsOpen(true)
    } else if (intent === 'chart') {
      setIsAddingChart(true)
    } else {
      setEditing(intent === 'rename' ? 'name' : 'description')
    }
  })

  const { active, query, visible } = narrow(board, { cursor, filter, search })
  const isFree = !editing && !editingEntry && !isSettingsOpen
  const listKeys = { enabled: isFree && visible.length > 0 }
  const rowKeys = { enabled: isFree && Boolean(active) }
  const step = (by: number) =>
    setCursor((index) =>
      Math.max(0, Math.min(visible.length - 1, (index ?? -1) + by))
    )
  const pick = (next: Filter | null) => {
    setFilter(next)
    setCursor(null)
  }
  const hints = useHints({
    hasRows: visible.length > 0,
    isActive: Boolean(active),
    isNarrowed: Boolean(filter || query),
  })

  useHotkey('J', () => step(1), listKeys)
  useHotkey('ArrowDown', () => step(1), listKeys)
  useHotkey('K', () => step(-1), listKeys)
  useHotkey('ArrowUp', () => step(-1), listKeys)
  useHotkey('Enter', () => active && entryActions.open(active), rowKeys)
  useHotkey('O', () => active && entryActions.open(active), rowKeys)
  useHotkey('Backspace', () => active && entryActions.remove(active), rowKeys)
  useHotkey(
    'E',
    () => (active ? setEditingEntry(active) : setEditing('name')),
    { enabled: isFree }
  )
  useHotkey('/', () => searchRef.current?.focus(), { enabled: isFree })
  useHotkey('N', () => newBoardStore.set(true), { enabled: isFree })
  useHotkey('Escape', () => searchRef.current?.blur(), {
    ignoreInputs: false,
    target: searchRef,
  })
  const unwind = () => {
    if (query) {
      setSearch('')
    } else if (filter) {
      pick(null)
    } else {
      setCursor(null)
    }
  }
  useHotkey('Escape', unwind, {
    enabled: isFree && Boolean(query || filter || active),
  })

  if (!board) {
    return <main className="flex min-h-0 flex-1 flex-col" />
  }

  return (
    <main className="flex min-h-0 flex-1 flex-col">
      <div className="flex-1 overflow-y-auto">
        <div className="mx-auto flex max-w-3xl flex-col gap-8 px-10 pt-12 pb-16">
          <BoardHeader
            board={board}
            editing={editing}
            update={update}
            onEditing={setEditing}
            onSettings={() => setIsSettingsOpen(true)}
            onAddChart={() => setIsAddingChart(true)}
          />
          {board.total > 0 && <Summary board={board} />}
          {board.banners.length > 0 && (
            <BoardBanners banners={board.banners} showBoard={false} />
          )}
          <BoardCharts
            board={board}
            filter={filter}
            update={update}
            isAddingChart={isAddingChart}
            onAddingChart={setIsAddingChart}
            onPick={pick}
          />
          {board.groups.length > 1 && (
            <BoardGroups
              board={board}
              picked={filter?.by === 'group' ? filter.key : null}
              onPick={(group) =>
                pick(group === null ? null : { by: 'group', key: group })
              }
            />
          )}
          {board.total === 0 && !board.isReadingHistory && (
            <BoardEmpty onDescribe={() => setEditing('description')} />
          )}
          {board.total > 0 && (
            <BoardEntries
              active={active}
              board={board}
              filter={filter}
              search={search}
              searchRef={searchRef}
              visible={visible}
              onEdit={setEditingEntry}
              onPick={pick}
              onSearch={(next) => {
                setSearch(next)
                setCursor(null)
              }}
            />
          )}
        </div>
      </div>
      <KeyHints hints={hints} />
      <BoardSettingsDialog
        board={board}
        open={isSettingsOpen}
        onOpenChange={setIsSettingsOpen}
      />
      <EntryDialog
        board={board}
        entry={editingEntry}
        onClose={() => setEditingEntry(null)}
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
