import { BOARD_PRESETS } from '@fewmail/shared/agent'
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

const refetchBoards = () => refetchChanged(['boards', 'today'])

const BoardForm = ({
  board,
  onDone,
}: {
  board?: { description: string; id: string; name: string }
  onDone: () => void
}) => {
  const t = useT()
  const navigate = useNavigate()
  const [name, setName] = useState(board?.name ?? '')
  const [description, setDescription] = useState(board?.description ?? '')

  const create = useMutation(
    orpc.boards.create.mutationOptions({
      onSuccess: ({ id }) => {
        onDone()
        refetchBoards()
        void navigate({ params: { boardId: id }, to: '/boards/$boardId' })
      },
    })
  )
  const update = useMutation(
    orpc.boards.update.mutationOptions({
      onMutate: ({ id, ...change }) => {
        onDone()
        queryClient.setQueryData(
          orpc.boards.get.queryKey({ input: { id } }),
          (old) =>
            old && {
              ...old,
              description: change.description ?? old.description,
              name: change.name ?? old.name,
            }
        )
        queryClient.setQueryData(orpc.boards.list.queryKey(), (old) =>
          old?.map((item) =>
            item.id === id ? { ...item, name: change.name ?? item.name } : item
          )
        )
      },
      onSettled: refetchBoards,
    })
  )
  const remove = useMutation(
    orpc.boards.delete.mutationOptions({
      onMutate: ({ id }) => {
        onDone()
        void navigate({ to: '/today' })
        queryClient.setQueryData(orpc.boards.list.queryKey(), (old) =>
          old?.filter((item) => item.id !== id)
        )
      },
      onSettled: refetchBoards,
    })
  )
  const input = { description: description.trim(), name: name.trim() }
  const isFilled = Boolean(input.name) && input.description.length >= 3
  const submitLabel = board ? t.boards.save : t.boards.create

  return (
    <form
      className="flex flex-col gap-4"
      onSubmit={(event) => {
        event.preventDefault()
        if (!isFilled) {
          return
        }
        if (board) {
          update.mutate({ ...input, id: board.id })
        } else {
          create.mutate(input)
        }
      }}
    >
      {!board && !name && (
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
        {board && (
          <Button
            type="button"
            variant="ghost-destructive"
            className="mr-auto"
            onClick={() => remove.mutate({ id: board.id })}
          >
            {t.boards.delete}
          </Button>
        )}
        <Button type="submit" disabled={!isFilled || create.isPending}>
          {create.isPending ? t.boards.planning : submitLabel}
        </Button>
      </DialogFooter>
    </form>
  )
}

export const BoardDialog = ({
  board,
  onOpenChange,
  open,
}: {
  board?: { description: string; id: string; name: string }
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
          <DialogTitle>{board ? t.boards.edit : t.boards.new}</DialogTitle>
          <DialogDescription>
            {board ? t.boards.editHint : t.boards.newHint}
          </DialogDescription>
        </DialogHeader>
        <BoardForm
          key={formKey}
          board={board}
          onDone={() => onOpenChange(false)}
        />
      </DialogContent>
    </Dialog>
  )
}

export const NewBoardDialog = () => {
  const open = useSubscription(newBoardStore)
  return (
    <BoardDialog open={open} onOpenChange={(next) => newBoardStore.set(next)} />
  )
}
