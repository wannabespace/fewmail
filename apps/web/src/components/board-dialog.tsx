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
import { orpc } from '~/lib/orpc'
import { queryClient } from '~/lib/query-client'

/** Opened from the sidebar and from ⌘K, so it lives outside both. */
export const newBoardStore = createStore(false)

const invalidate = () => queryClient.invalidateQueries()

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
        void invalidate()
        void navigate({ params: { boardId: id }, to: '/boards/$boardId' })
      },
    })
  )
  const update = useMutation(
    orpc.boards.update.mutationOptions({
      onSuccess: () => {
        onDone()
        void invalidate()
      },
    })
  )
  const remove = useMutation(
    orpc.boards.delete.mutationOptions({
      onSuccess: () => {
        onDone()
        void invalidate()
        void navigate({ to: '/today' })
      },
    })
  )
  const isPending = create.isPending || update.isPending
  const submitLabel = board ? t.boards.save : t.boards.create

  return (
    <form
      className="flex flex-col gap-4"
      onSubmit={(event) => {
        event.preventDefault()
        const input = { description: description.trim(), name: name.trim() }
        if (!input.name || input.description.length < 3) {
          return
        }
        if (board) {
          update.mutate({ ...input, id: board.id })
        } else {
          create.mutate(input)
        }
      }}
    >
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
            disabled={remove.isPending}
            onClick={() => remove.mutate({ id: board.id })}
          >
            {t.boards.delete}
          </Button>
        )}
        <Button type="submit" disabled={isPending}>
          {isPending ? t.boards.planning : submitLabel}
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
