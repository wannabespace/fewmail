import { messages } from '@fewmail/shared/i18n'
import { toast } from 'sonner'

import { localeStore } from './i18n'

const undoLabel = () => messages[localeStore.get()].compose.undo

export const toastUndo = (message: string, undo: () => unknown, id?: string) =>
  toast.success(message, {
    action: { label: undoLabel(), onClick: () => undo() },
    id,
  })

/**
 * For what the server cannot take back (a deleted Gmail draft, a calendar event): the caller hides it at once
 * and `commit` runs only when the toast closes without Undo. A tab closed before that keeps it, never loses it.
 */
export const toastDeferred = (
  message: string,
  commit: () => unknown,
  undo: () => unknown
) =>
  toast.success(message, {
    action: { label: undoLabel(), onClick: () => undo() },
    onAutoClose: () => commit(),
    onDismiss: () => commit(),
  })
