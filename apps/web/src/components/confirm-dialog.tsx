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
