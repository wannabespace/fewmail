import {
  BOARD_PERIODS,
  BOARD_PRESET_PERIODS,
  BOARD_PRESETS,
  DEFAULT_BOARD_PERIOD,
} from '@fewmail/shared/agent'
import type { BoardPeriod } from '@fewmail/shared/agent'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@fewmail/ui/components/alert-dialog'
import { Button } from '@fewmail/ui/components/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@fewmail/ui/components/dialog'
import { Input } from '@fewmail/ui/components/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@fewmail/ui/components/select'
import { Textarea } from '@fewmail/ui/components/textarea'
import { useMutation } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import { useState } from 'react'
import { createStore } from 'seitu'
import { useSubscription } from 'seitu/react'

import { useT } from '~/lib/i18n'
import { orpc, refetchChanged } from '~/lib/orpc'
import { queryClient } from '~/lib/query-client'
import { pendingToast, settleToast } from '~/lib/undo'

/** Opened from the sidebar and from ⌘K, so it lives outside both. */
export const newBoardStore = createStore(false)

/** Asked from the page, the sidebar and ⌘K; deleting has no undo, so it always confirms here. */
export const deletingBoardStore = createStore<{
  id: string
  name: string
} | null>(null)

const refetchBoards = () => refetchChanged(['boards', 'today'])

const HEADS_UP_DAYS = [1, 2, 3, 5, 7, 14] as const
const NEVER = 'never'

const SETTING_ROW = 'grid grid-cols-[1fr_auto] items-center gap-2 text-sm'

/** How far back the board collects: its history read stops there and older entries leave it. */
const PeriodRow = ({
  onChange,
  value,
}: {
  onChange: (period: BoardPeriod) => void
  value: BoardPeriod
}) => {
  const t = useT()
  return (
    <div className={SETTING_ROW}>
      <span className="text-muted-foreground">{t.boards.period}</span>
      <Select
        items={BOARD_PERIODS.map((days) => ({
          label: t.boards.periods[days],
          value: String(days),
        }))}
        value={String(value)}
        onValueChange={(next) => {
          const period = BOARD_PERIODS.find((days) => String(days) === next)
          if (period) {
            onChange(period)
          }
        }}
      >
        <SelectTrigger aria-label={t.boards.period}>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {BOARD_PERIODS.map((days) => (
            <SelectItem key={days} value={String(days)}>
              {t.boards.periods[days]}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}

const NewBoardForm = ({ onDone }: { onDone: () => void }) => {
  const t = useT()
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [period, setPeriod] = useState<BoardPeriod>(DEFAULT_BOARD_PERIOD)

  const create = useMutation(
    orpc.boards.create.mutationOptions({
      onSuccess: ({ id }) => {
        onDone()
        refetchBoards()
        void navigate({ params: { boardId: id }, to: '/boards/$boardId' })
      },
    })
  )
  const input = { description: description.trim(), name: name.trim() }
  const isFilled = Boolean(input.name) && input.description.length >= 3

  return (
    <form
      className="flex flex-col gap-4"
      onSubmit={(event) => {
        event.preventDefault()
        if (isFilled) {
          create.mutate({ ...input, periodDays: period })
        }
      }}
    >
      {/* Stays after a pick: the row leaving slid the fields and Create under the pointer. */}
      <div className="flex flex-wrap gap-2">
        {BOARD_PRESETS.map((preset) => (
          <Button
            key={preset}
            type="button"
            size="sm"
            variant={
              name === t.boards.starter[preset].name ? 'secondary' : 'outline'
            }
            onClick={() => {
              setName(t.boards.starter[preset].name)
              setDescription(t.boards.starter[preset].description)
              setPeriod(BOARD_PRESET_PERIODS[preset] ?? DEFAULT_BOARD_PERIOD)
            }}
          >
            {t.boards.starter[preset].name}
          </Button>
        ))}
      </div>
      <Input
        autoFocus
        value={name}
        onChange={(event) => setName(event.target.value)}
        placeholder={t.boards.namePlaceholder}
        aria-label={t.boards.name}
        data-mask
      />
      <Textarea
        value={description}
        onChange={(event) => setDescription(event.target.value)}
        placeholder={t.boards.descriptionPlaceholder}
        aria-label={t.boards.description}
        data-mask
      />
      <PeriodRow value={period} onChange={setPeriod} />
      <DialogFooter>
        <Button type="submit" disabled={!isFilled || create.isPending}>
          {create.isPending ? t.boards.planning : t.boards.create}
        </Button>
      </DialogFooter>
    </form>
  )
}

export const NewBoardDialog = () => {
  const t = useT()
  const open = useSubscription(newBoardStore)
  const [formKey, setFormKey] = useState(0)

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => newBoardStore.set(next)}
      onOpenChangeComplete={(isOpen) => !isOpen && setFormKey(formKey + 1)}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t.boards.new}</DialogTitle>
          <DialogDescription>{t.boards.newHint}</DialogDescription>
        </DialogHeader>
        <NewBoardForm key={formKey} onDone={() => newBoardStore.set(false)} />
      </DialogContent>
    </Dialog>
  )
}

interface BoardSettings {
  bannerDays: number | null
  id: string
  periodDays: BoardPeriod
}

const SettingsForm = ({
  board,
  onDone,
}: {
  board: BoardSettings
  onDone: () => void
}) => {
  const t = useT()
  const [days, setDays] = useState(board.bannerDays)
  const [period, setPeriod] = useState(board.periodDays)
  const update = useMutation(
    orpc.boards.update.mutationOptions({
      onMutate: ({ id }) => pendingToast(id).onMutate(),
      onSettled: (_board, _error, { id }) => {
        settleToast(id)()
        refetchBoards()
      },
    })
  )

  return (
    <form
      className="flex flex-col gap-4"
      onSubmit={(event) => {
        event.preventDefault()
        onDone()
        update.mutate({ bannerDays: days, id: board.id, periodDays: period })
      }}
    >
      <PeriodRow value={period} onChange={setPeriod} />
      <div className={SETTING_ROW}>
        <span className="text-muted-foreground">
          {t.boards.settings.bannerDays}
        </span>
        <Select
          items={[
            { label: t.boards.settings.never, value: NEVER },
            ...HEADS_UP_DAYS.map((count) => ({
              label: t.boards.settings.days(count),
              value: String(count),
            })),
          ]}
          value={days === null ? NEVER : String(days)}
          onValueChange={(next) =>
            next && setDays(next === NEVER ? null : Number(next))
          }
        >
          <SelectTrigger aria-label={t.boards.settings.bannerDays}>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={NEVER}>{t.boards.settings.never}</SelectItem>
            {HEADS_UP_DAYS.map((count) => (
              <SelectItem key={count} value={String(count)}>
                {t.boards.settings.days(count)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <DialogFooter>
        <Button type="submit">{t.boards.save}</Button>
      </DialogFooter>
    </form>
  )
}

export const BoardSettingsDialog = ({
  board,
  onOpenChange,
  open,
}: {
  board: BoardSettings
  onOpenChange: (open: boolean) => void
  open: boolean
}) => {
  const t = useT()
  const [formKey, setFormKey] = useState(0)

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
      onOpenChangeComplete={(isOpen) => !isOpen && setFormKey(formKey + 1)}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t.boards.settings.title}</DialogTitle>
          <DialogDescription>{t.boards.settings.hint}</DialogDescription>
        </DialogHeader>
        <SettingsForm
          key={formKey}
          board={board}
          onDone={() => onOpenChange(false)}
        />
      </DialogContent>
    </Dialog>
  )
}

export const DeleteBoardDialog = () => {
  const t = useT()
  const navigate = useNavigate()
  const deleting = useSubscription(deletingBoardStore)
  // Keeps the name on screen while the dialog fades out after the store clears.
  const [shown, setShown] = useState(deleting)
  if (deleting && deleting !== shown) {
    setShown(deleting)
  }
  const remove = useMutation(
    orpc.boards.delete.mutationOptions({
      onMutate: ({ id }) => {
        pendingToast(id).onMutate()
        deletingBoardStore.set(null)
        if (window.location.pathname === `/boards/${id}`) {
          void navigate({ to: '/home' })
        }
        queryClient.setQueryData(orpc.boards.list.queryKey(), (old) =>
          old?.filter((item) => item.id !== id)
        )
      },
      onSettled: (_result, _error, { id }) => {
        settleToast(id)()
        refetchBoards()
      },
    })
  )

  return (
    <AlertDialog
      open={Boolean(deleting)}
      onOpenChange={(open) => !open && deletingBoardStore.set(null)}
      onOpenChangeComplete={(open) => !open && setShown(null)}
    >
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle data-mask>
            {shown && t.boards.deleteConfirm(shown.name)}
          </AlertDialogTitle>
          <AlertDialogDescription>{t.boards.deleteHint}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>{t.boards.cancel}</AlertDialogCancel>
          <AlertDialogAction
            variant="destructive"
            onClick={() => shown && remove.mutate({ id: shown.id })}
          >
            {t.boards.delete}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
