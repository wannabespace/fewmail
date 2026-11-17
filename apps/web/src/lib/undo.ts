import { UNDO_SEND_SECONDS } from '@fewmail/shared/agent'
import { toast } from 'sonner'

import { getT } from './i18n'
import { keepRequestsAlive } from './orpc'
import { posthog } from './posthog'
import { queryClient } from './query-client'

/** Every Undo stays as long as a send's, so none closes while the pointer is still on its way to it. */
export const UNDO_TOAST_MS = UNDO_SEND_SECONDS * 1000

const undoLabel = () => getT().compose.undo

/** An Undo is a request too: a toast spins until the server has put everything back. */
export const runUndo = <Result>(undo: () => Result) => {
  posthog.capture('undo_clicked')
  const id = toast.loading(getT().compose.undoing)
  return Promise.resolve(undo()).finally(() => toast.dismiss(id))
}

/** For a mutation whose press already shows its outcome: the toast spins until the answer's toast takes over the same `id`, or `settleToast` lets it go. */
export const pendingToast = (id: string) => ({
  onError: () => {
    toast.dismiss(id)
  },
  onMutate: () => {
    toast.loading(getT().today.working, { id })
  },
})

export const settleToast = (id: string) => () => {
  toast.dismiss(id)
}

const undoing = (undo: () => unknown) => () => runUndo(undo)

export const toastUndo = (message: string, undo: () => unknown, id?: string) =>
  toast.success(message, {
    action: { label: undoLabel(), onClick: undoing(undo) },
    duration: UNDO_TOAST_MS,
    id,
  })

const deferredCommits = new Map<string, () => unknown>()

addEventListener('pagehide', () => {
  keepRequestsAlive()
  for (const [id, commit] of deferredCommits) {
    commit()
    toast.dismiss(id)
  }
})

/**
 * For what the server cannot take back (a deleted Gmail draft, a calendar event): `hide` takes it off every screen
 * at once and again after each refetch, since the server still has it; `commit` runs once, when the toast closes
 * without Undo or the page closes first.
 */
export const toastDeferred = (
  message: string,
  {
    commit,
    hide,
    undo,
  }: { commit: () => unknown; hide: () => unknown; undo: () => unknown }
) => {
  void hide()
  // `hide` writes the cache itself, which is `manual`; reacting to it would loop.
  const stopHiding = queryClient.getQueryCache().subscribe((event) => {
    if (
      event.type === 'updated' &&
      event.action.type === 'success' &&
      !event.action.manual
    ) {
      void hide()
    }
  })
  const id = crypto.randomUUID()
  const settle = (run: () => unknown) => {
    if (!deferredCommits.delete(id)) {
      return
    }
    stopHiding()
    return run()
  }
  const commitOnce = () => settle(commit)
  deferredCommits.set(id, commitOnce)
  toast.success(message, {
    action: { label: undoLabel(), onClick: undoing(() => settle(undo)) },
    duration: UNDO_TOAST_MS,
    id,
    onAutoClose: commitOnce,
    onDismiss: commitOnce,
  })
}

/**
 * ⌘Z presses the newest Undo still on screen, as a click on it would, so every toast's own undo (a burst's, a send's, a
 * deferred delete's) runs exactly as it does for the mouse.
 */
export const undoLatest = () => {
  const labels = new Set([getT().compose.undo, getT().clearOut.undo])
  // Sonner numbers its toasts from the front, the newest being 0.
  const button = [
    ...document.querySelectorAll<HTMLElement>(
      '[data-sonner-toast]:not([data-removed=true])'
    ),
  ]
    .toSorted((a, b) => Number(a.dataset.index) - Number(b.dataset.index))
    .flatMap((shown) => [
      ...shown.querySelectorAll<HTMLButtonElement>('[data-button]'),
    ])
    .find(({ textContent }) => labels.has(textContent ?? ''))
  button?.click()
}
