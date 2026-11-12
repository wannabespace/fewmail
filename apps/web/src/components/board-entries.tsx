import type { RouterOutputs } from '@fewmail/api/router'
import { Button } from '@fewmail/ui/components/button'
import { IconButton } from '@fewmail/ui/components/custom/icon-button'
import {
  SettingsGroup,
  SettingsRow,
} from '@fewmail/ui/components/custom/settings-group'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@fewmail/ui/components/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from '@fewmail/ui/components/dropdown-menu'
import { Input } from '@fewmail/ui/components/input'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@fewmail/ui/components/popover'
import {
  DashboardSquare01Icon,
  Edit02Icon,
  Mail01Icon,
  MinusSignCircleIcon,
  MoreHorizontalIcon,
} from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { useMutation, useQuery } from '@tanstack/react-query'
import { Link, useNavigate } from '@tanstack/react-router'
import { format } from 'date-fns'
import { useState } from 'react'
import { toast } from 'sonner'

import { useDates, useMoneyFormat, useT } from '~/lib/i18n'
import { useHasAgent } from '~/lib/me'
import { orpc, refetchChanged } from '~/lib/orpc'
import { queryClient } from '~/lib/query-client'

export type Board = RouterOutputs['boards']['get']
export type Entry = Board['entries'][number]
type Group = Board['groups'][number]

const GROUPS_SHOWN = 6

const refetchBoards = () => refetchChanged(['boards', 'today'])

const patchBoard = (boardId: string, patch: (board: Board) => Board) =>
  queryClient.setQueryData(
    orpc.boards.get.queryKey({ input: { id: boardId } }),
    (old) => old && patch(old)
  )

/** Taking an entry off is undone from its toast; the board learns from it either way once the toast is gone. */
export const useEntryActions = (boardId: string) => {
  const t = useT()
  const navigate = useNavigate()
  const dismiss = useMutation(
    orpc.boards.dismissEntry.mutationOptions({
      onMutate: ({ id, isDismissed }) =>
        isDismissed === false ||
        patchBoard(boardId, (board) => ({
          ...board,
          entries: board.entries.filter((entry) => entry.id !== id),
          total: board.total - 1,
        })),
      onSettled: refetchBoards,
    })
  )
  return {
    open: (entry: Entry) =>
      navigate({ search: { thread: entry.threadId }, to: '/mail' }),
    remove: (entry: Entry) => {
      dismiss.mutate({ id: entry.id })
      toast(t.boards.entry.removed, {
        action: {
          label: t.compose.undo,
          onClick: () => dismiss.mutate({ id: entry.id, isDismissed: false }),
        },
      })
    },
  }
}

const dayOf = (date: Date | null) => (date ? format(date, 'yyyy-MM-dd') : '')
const fromDay = (day: string) => (day ? new Date(`${day}T12:00:00`) : null)
const centsOf = (amount: string) => {
  const value = Number(amount.replace(',', '.').replaceAll(/\s/gu, ''))
  return amount.trim() && Number.isFinite(value)
    ? Math.round(value * 100)
    : null
}

const EntryForm = ({
  board,
  entry,
  onDone,
}: {
  board: Board
  entry: Entry
  onDone: () => void
}) => {
  const t = useT()
  const [title, setTitle] = useState(entry.title)
  const [group, setGroup] = useState(entry.group ?? '')
  const [status, setStatus] = useState(entry.status ?? '')
  const [amount, setAmount] = useState(
    entry.amountCents === null ? '' : String(entry.amountCents / 100)
  )
  const [currency, setCurrency] = useState(
    entry.currency ?? board.summary.currency ?? ''
  )
  const [date, setDate] = useState(dayOf(entry.occurredAt))
  const [due, setDue] = useState(dayOf(entry.dueAt))
  const update = useMutation(
    orpc.boards.updateEntry.mutationOptions({ onSettled: refetchBoards })
  )
  const amountCents = centsOf(amount)
  const change = {
    amountCents,
    currency:
      amountCents === null ? null : currency.trim().toUpperCase() || null,
    dueAt: fromDay(due),
    group: group.trim() || null,
    status: status.trim() || null,
    title: title.trim(),
    ...(date && { occurredAt: fromDay(date) ?? entry.occurredAt }),
  }
  const fields = [
    [t.boards.entry.group, group, setGroup, 'groups'],
    [t.boards.entry.status, status, setStatus, 'statuses'],
  ] as const

  return (
    <form
      className="flex flex-col gap-3"
      onSubmit={(event) => {
        event.preventDefault()
        if (!change.title) {
          return
        }
        onDone()
        patchBoard(board.id, (old) => ({
          ...old,
          entries: old.entries.map((item) =>
            item.id === entry.id
              ? {
                  ...item,
                  ...change,
                  isEdited: true,
                  occurredAt: change.occurredAt ?? item.occurredAt,
                }
              : item
          ),
        }))
        update.mutate({ id: entry.id, ...change })
      }}
    >
      <Input
        autoFocus
        value={title}
        onChange={(event) => setTitle(event.target.value)}
        aria-label={t.boards.entry.title}
        data-mask
      />
      {fields.map(([label, value, onChange, list]) => (
        <label
          key={list}
          className="grid grid-cols-[7rem_1fr] items-center gap-2 text-sm"
        >
          <span className="text-muted-foreground">{label}</span>
          <Input
            value={value}
            aria-label={label}
            list={`board-${list}`}
            onChange={(event) => onChange(event.target.value)}
            data-mask
          />
        </label>
      ))}
      <datalist id="board-groups">
        {board.groups.map(({ name }) => (
          <option key={name} value={name}>
            {name}
          </option>
        ))}
      </datalist>
      <datalist id="board-statuses">
        {board.statuses.map((name) => (
          <option key={name} value={name}>
            {name}
          </option>
        ))}
      </datalist>
      <div className="grid grid-cols-[7rem_1fr_5rem] items-center gap-2 text-sm">
        <span className="text-muted-foreground">{t.boards.entry.amount}</span>
        <Input
          value={amount}
          inputMode="decimal"
          onChange={(event) => setAmount(event.target.value)}
          aria-label={t.boards.entry.amount}
          data-mask
        />
        <Input
          value={currency}
          maxLength={3}
          onChange={(event) => setCurrency(event.target.value)}
          aria-label={t.boards.entry.currency}
          data-mask
        />
      </div>
      {(
        [
          [t.boards.entry.date, date, setDate],
          [t.boards.entry.next, due, setDue],
        ] as const
      ).map(([label, value, onChange]) => (
        <label
          key={label}
          className="grid grid-cols-[7rem_1fr] items-center gap-2 text-sm"
        >
          <span className="text-muted-foreground">{label}</span>
          <Input
            type="date"
            value={value}
            aria-label={label}
            onChange={(event) => onChange(event.target.value)}
            data-mask
          />
        </label>
      ))}
      <DialogFooter>
        <Button type="submit" disabled={!change.title}>
          {t.boards.save}
        </Button>
      </DialogFooter>
    </form>
  )
}

export const EntryDialog = ({
  board,
  entry,
  onClose,
}: {
  board: Board
  entry: Entry | null
  onClose: () => void
}) => {
  const t = useT()
  // Keeps the form on screen while the dialog fades out after `entry` clears.
  const [shown, setShown] = useState(entry)
  if (entry && entry !== shown) {
    setShown(entry)
  }

  return (
    <Dialog
      open={Boolean(entry)}
      onOpenChange={(open) => !open && onClose()}
      onOpenChangeComplete={(open) => !open && setShown(null)}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t.boards.entry.edit}</DialogTitle>
        </DialogHeader>
        {shown && (
          <EntryForm
            key={shown.id}
            board={board}
            entry={shown}
            onDone={onClose}
          />
        )}
      </DialogContent>
    </Dialog>
  )
}

export const EntryRow = ({
  entry,
  isActive,
  onEdit,
  onOpen,
  onRemove,
}: {
  entry: Entry
  isActive: boolean
  onEdit: () => void
  onOpen: () => void
  onRemove: () => void
}) => {
  const t = useT()
  const dates = useDates()
  const money = useMoneyFormat()

  return (
    <SettingsRow
      active={isActive}
      title={
        <Link to="/mail" search={{ thread: entry.threadId }} data-mask>
          {entry.title}
        </Link>
      }
      description={
        <span data-mask>
          {[
            entry.group,
            entry.status,
            dates.format(entry.occurredAt, 'd MMM yyyy'),
            entry.dueAt &&
              t.boards.entry.nextOn(dates.format(entry.dueAt, 'd MMM')),
            entry.isEdited && t.boards.entry.edited,
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
      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <Button
              size="icon-sm"
              variant="ghost-muted"
              aria-label={t.mail.more}
            />
          }
        >
          <HugeiconsIcon icon={MoreHorizontalIcon} strokeWidth={2} />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={onOpen}>
            <HugeiconsIcon icon={Mail01Icon} strokeWidth={2} />
            {t.mail.open}
            <DropdownMenuShortcut>↵</DropdownMenuShortcut>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={onEdit}>
            <HugeiconsIcon icon={Edit02Icon} strokeWidth={2} />
            {t.boards.entry.edit}
            <DropdownMenuShortcut>E</DropdownMenuShortcut>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem variant="destructive" onClick={onRemove}>
            <HugeiconsIcon icon={MinusSignCircleIcon} strokeWidth={2} />
            {t.boards.entry.remove}
            <DropdownMenuShortcut>#</DropdownMenuShortcut>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </SettingsRow>
  )
}

const RenameGroup = ({ boardId, name }: { boardId: string; name: string }) => {
  const t = useT()
  const [open, setOpen] = useState(false)
  const [to, setTo] = useState(name)
  const rename = useMutation(
    orpc.boards.renameGroup.mutationOptions({
      onMutate: () =>
        patchBoard(boardId, (board) => ({
          ...board,
          entries: board.entries.map((entry) =>
            entry.group === name ? { ...entry, group: to.trim() } : entry
          ),
        })),
      onSettled: refetchBoards,
    })
  )

  return (
    <Popover
      open={open}
      onOpenChange={(next) => {
        setOpen(next)
        if (next) {
          setTo(name)
        }
      }}
    >
      <PopoverTrigger
        render={
          <IconButton
            icon={Edit02Icon}
            label={t.boards.groups.rename}
            size="icon-sm"
            variant="ghost-muted"
          />
        }
      />
      <PopoverContent align="end" className="w-72">
        <form
          className="flex flex-col gap-2"
          onSubmit={(event) => {
            event.preventDefault()
            setOpen(false)
            if (to.trim() && to.trim() !== name) {
              rename.mutate({ from: name, id: boardId, to: to.trim() })
            }
          }}
        >
          <Input
            autoFocus
            value={to}
            onChange={(event) => setTo(event.target.value)}
            aria-label={t.boards.groups.rename}
            data-mask
          />
          <p className="text-muted-foreground text-xs">
            {t.boards.groups.renameHint}
          </p>
        </form>
      </PopoverContent>
    </Popover>
  )
}

const GroupRow = ({
  boardId,
  group,
  isPicked,
  onPick,
}: {
  boardId: string
  group: Group
  isPicked: boolean
  onPick: () => void
}) => {
  const t = useT()
  const dates = useDates()
  const money = useMoneyFormat()
  const nextOn = group.nextAt && dates.format(group.nextAt, 'd MMM')

  return (
    <SettingsRow
      active={isPicked}
      title={
        <button
          type="button"
          className="cursor-pointer text-left"
          onClick={onPick}
          data-mask
        >
          {group.name}
        </button>
      }
      description={
        <span data-mask>
          {[
            t.boards.entries(group.count),
            group.every && t.boards.groups.every[group.every],
            nextOn &&
              (group.isNextPredicted
                ? t.boards.groups.expected(nextOn)
                : t.boards.groups.next(nextOn)),
          ]
            .filter(Boolean)
            .join(' · ')}
        </span>
      }
    >
      {group.currency && (
        <span className="tabular-nums" data-mask>
          {group.monthlyCents === null
            ? group.totalCents !== null &&
              money(group.totalCents, group.currency)
            : t.boards.groups.perMonth(
                money(group.monthlyCents, group.currency)
              )}
        </span>
      )}
      <RenameGroup boardId={boardId} name={group.name} />
    </SettingsRow>
  )
}

/** Who or what the entries belong to; picking one filters the entries below to it. */
export const BoardGroups = ({
  board,
  onPick,
  picked,
}: {
  board: Board
  onPick: (group: string | null) => void
  picked: string | null
}) => {
  const t = useT()
  const [isAll, setIsAll] = useState(false)
  const shown = isAll ? board.groups : board.groups.slice(0, GROUPS_SHOWN)

  return (
    <SettingsGroup title={t.boards.groups.title}>
      {shown.map((group) => (
        <GroupRow
          key={group.name}
          boardId={board.id}
          group={group}
          isPicked={group.name === picked}
          onPick={() => onPick(group.name === picked ? null : group.name)}
        />
      ))}
      {board.groups.length > GROUPS_SHOWN && (
        <SettingsRow
          title={
            <Button
              size="sm"
              variant="link-muted"
              onClick={() => setIsAll(!isAll)}
            >
              {isAll
                ? t.boards.groups.showFewer
                : t.boards.groups.showAll(board.groups.length)}
            </Button>
          }
        />
      )}
    </SettingsGroup>
  )
}

/** The thread's More menu: puts the email on a board its search missed. */
export const AddToBoardItems = ({ messageId }: { messageId: string }) => {
  const t = useT()
  const hasAgent = useHasAgent()
  const { data: boards = [] } = useQuery(
    orpc.boards.list.queryOptions({ enabled: hasAgent })
  )
  const add = useMutation(
    orpc.boards.addEmail.mutationOptions({ onSettled: refetchBoards })
  )
  if (!hasAgent || boards.length === 0) {
    return null
  }

  return (
    <DropdownMenuSub>
      <DropdownMenuSubTrigger>
        <HugeiconsIcon icon={DashboardSquare01Icon} strokeWidth={2} />
        {t.boards.addTo}
      </DropdownMenuSubTrigger>
      <DropdownMenuSubContent>
        {boards.map((board) => (
          <DropdownMenuItem
            key={board.id}
            onClick={() => {
              add.mutate({ id: board.id, messageId })
              toast.success(t.boards.added(board.name))
            }}
          >
            <HugeiconsIcon icon={DashboardSquare01Icon} strokeWidth={2} />
            <span data-mask>{board.name}</span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuSubContent>
    </DropdownMenuSub>
  )
}
