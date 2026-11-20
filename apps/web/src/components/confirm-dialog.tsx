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
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@fewmail/ui/components/dialog'
import { Input } from '@fewmail/ui/components/input'
import { useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { createStore } from 'seitu'
import { useSubscription } from 'seitu/react'

import { useT } from '~/lib/i18n'

interface Confirmation {
  title: ReactNode
  description: ReactNode
  action: string
  /** `destructive` keeps Cancel focused so a stray Enter never deletes; `warning` takes Enter, since the key that opened it was deliberate. */
  variant: 'destructive' | 'warning'
  onConfirm: () => void
}

const confirmationStore = createStore<Confirmation | null>(null)

export const confirm = (confirmation: Confirmation) =>
  confirmationStore.set(confirmation)

export const ConfirmDialog = () => {
  const t = useT()
  const asked = useSubscription(confirmationStore)
  const actionRef = useRef<HTMLButtonElement>(null)
  // Keeps the text on screen while the dialog fades out after the store clears.
  const [shown, setShown] = useState(asked)
  if (asked && asked !== shown) {
    setShown(asked)
  }

  return (
    <AlertDialog
      open={Boolean(asked)}
      onOpenChange={(open) => !open && confirmationStore.set(null)}
      onOpenChangeComplete={(open) => !open && setShown(null)}
    >
      <AlertDialogContent
        initialFocus={shown?.variant === 'warning' ? actionRef : undefined}
      >
        <AlertDialogHeader>
          <AlertDialogTitle data-mask>{shown?.title}</AlertDialogTitle>
          <AlertDialogDescription>{shown?.description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>{t.settings.cancel}</AlertDialogCancel>
          <AlertDialogAction
            ref={actionRef}
            variant={shown?.variant}
            onClick={() => {
              confirmationStore.set(null)
              shown?.onConfirm()
            }}
          >
            {shown?.action}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

interface NameRequest {
  title: ReactNode
  /** The name it starts with: empty for something new. */
  value: string
  maxLength: number
  onSave: (name: string) => void
}

const nameStore = createStore<NameRequest | null>(null)

/** A name to type: a new folder, a bot or folder renamed. */
export const askName = (request: NameRequest) => nameStore.set(request)

export const NameDialog = () => {
  const t = useT()
  const asked = useSubscription(nameStore)
  const [shown, setShown] = useState(asked)
  const [name, setName] = useState('')
  if (asked && asked !== shown) {
    setShown(asked)
    setName(asked.value)
  }
  const save = () => {
    if (name.trim()) {
      nameStore.set(null)
      shown?.onSave(name.trim())
    }
  }

  return (
    <Dialog
      open={Boolean(asked)}
      onOpenChange={(open) => !open && nameStore.set(null)}
      onOpenChangeComplete={(open) => !open && setShown(null)}
    >
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle data-mask>{shown?.title}</DialogTitle>
        </DialogHeader>
        <form
          className="flex flex-col gap-4"
          onSubmit={(event) => {
            event.preventDefault()
            save()
          }}
        >
          <Input
            autoFocus
            aria-label={typeof shown?.title === 'string' ? shown.title : ''}
            data-mask
            maxLength={shown?.maxLength}
            value={name}
            onChange={(event) => setName(event.target.value)}
          />
          <DialogFooter>
            <DialogClose render={<Button variant="ghost-muted" />}>
              {t.settings.cancel}
            </DialogClose>
            <Button type="submit" disabled={!name.trim()}>
              {t.bots.save}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
