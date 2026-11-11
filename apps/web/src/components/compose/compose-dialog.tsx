import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@fewmail/ui/components/dialog'
import { useState } from 'react'

import { useT } from '~/lib/i18n'

import type { Draft } from './compose-context'
import { ComposeForm } from './compose-form'

export const ComposeDialog = ({
  draft,
  onClose,
}: {
  draft: Draft | null
  onClose: () => void
}) => {
  const t = useT()
  const [shown, setShown] = useState(draft)
  if (draft && draft !== shown) {
    setShown(draft)
  }

  return (
    <Dialog
      open={!!draft}
      onOpenChange={(open) => !open && onClose()}
      onOpenChangeComplete={(open) => !open && setShown(null)}
    >
      {shown && (
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>{t.compose[shown.mode]}</DialogTitle>
          </DialogHeader>
          <ComposeForm draft={shown} onDone={onClose} />
        </DialogContent>
      )}
    </Dialog>
  )
}
