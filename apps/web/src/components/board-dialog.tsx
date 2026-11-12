import { BOARD_PRESETS } from '@fewmail/shared/agent'
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

const NewBoardForm = ({ onDone }: { onDone: () => void }) => {
  const t = useT()
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')

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
          create.mutate(input)
        }
      }}
    >
      {!name && (
        <div className="flex flex-wrap gap-2">
          {BOARD_PRESETS.map((preset) => (
            <Button
              key={preset}
              type="button"
              size="sm"
              variant="outline"
              onClick={() => {
                setName(t.boards.starter[preset].name)
                setDescription(t.boards.starter[preset].description)
              }}
            >
              {t.boards.starter[preset].name}
            </Button>
          ))}
        </div>
      )}
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

interface SearchSettings {
  bannerDays: number | null
  gmailQuery: string
  id: string
}

const SettingsForm = ({
  board,
  onDone,
}: {
  board: SearchSettings
  onDone: () => void
}) => {
  const t = useT()
  const [query, setQuery] = useState(board.gmailQuery)
  const [days, setDays] = useState(board.bannerDays)
  const update = useMutation(
    orpc.boards.update.mutationOptions({ onSettled: refetchBoards })
  )
  const isRequeried = query.trim() !== board.gmailQuery

  return (
    <form
      className="flex flex-col gap-4"
      onSubmit={(event) => {
        event.preventDefault()
        if (!query.trim()) {
          return
        }
        onDone()
        update.mutate({
          bannerDays: days,
          id: board.id,
          ...(isRequeried && { gmailQuery: query.trim() }),
        })
      }}
    >
      <div className="flex flex-col gap-1.5 text-sm">
        <span className="text-muted-foreground">{t.boards.settings.query}</span>
        <Textarea
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          aria-label={t.boards.settings.query}
          data-mask
        />
        <span className="text-muted-foreground text-xs">
          {t.boards.settings.queryHint}
        </span>
      </div>
      <div className="grid grid-cols-[1fr_auto] items-center gap-2 text-sm">
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
        <Button
          type="submit"
          variant={isRequeried ? 'warning' : 'default'}
          disabled={!query.trim()}
        >
          {isRequeried ? t.boards.redescribe : t.boards.save}
        </Button>
      </DialogFooter>
    </form>
  )
}

export const BoardSettingsDialog = ({
  board,
  onOpenChange,
  open,
}: {
  board: SearchSettings
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
        deletingBoardStore.set(null)
        if (window.location.pathname === `/boards/${id}`) {
          void navigate({ to: '/today' })
        }
        queryClient.setQueryData(orpc.boards.list.queryKey(), (old) =>
          old?.filter((item) => item.id !== id)
        )
      },
      onSettled: refetchBoards,
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
