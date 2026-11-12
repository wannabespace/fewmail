import { CLEAR_OUT_GROUPS } from '@fewmail/shared/agent'
import type { ClearOutGroup } from '@fewmail/shared/agent'
import { Button } from '@fewmail/ui/components/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@fewmail/ui/components/dialog'
import { Spinner } from '@fewmail/ui/components/spinner'
import { Switch } from '@fewmail/ui/components/switch'
import { useMutation, useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import { createStore } from 'seitu'
import { useSubscription } from 'seitu/react'
import { toast } from 'sonner'

import { useT } from '~/lib/i18n'
import { orpc, refetchChanged } from '~/lib/orpc'

/** Opened from ⌘K and once right after onboarding, so it lives outside both. */
export const clearOutStore = createStore(false)

const SENDER_NAMES_SHOWN = 3
const UNDO_TOAST_MS = 30_000

const refetchMail = () => refetchChanged(['mail', 'subscriptions', 'today'])

const ClearOutForm = ({
  onRun,
}: {
  onRun: (groups: ClearOutGroup[]) => void
}) => {
  const t = useT()
  const { data: scan } = useQuery(
    orpc.subscriptions.scanClearOut.queryOptions({ staleTime: 0 })
  )
  const [chosen, setChosen] = useState<ClearOutGroup[]>(
    CLEAR_OUT_GROUPS.filter((group) => group !== 'old')
  )

  if (!scan) {
    return (
      <p
        aria-busy
        className="text-muted-foreground flex items-center gap-2 text-sm"
      >
        <Spinner />
        {t.clearOut.scanning}
      </p>
    )
  }

  const countOf = (groups: ClearOutGroup[]) =>
    scan.overlaps
      .filter((overlap) =>
        overlap.groups.some((group) => groups.includes(group))
      )
      .reduce((sum, { count }) => sum + count, 0)
  const offered = CLEAR_OUT_GROUPS.filter((group) => countOf([group]) > 0)
  const selected = chosen.filter((group) => offered.includes(group))
  const clearing = countOf(selected)
  const inbox = t.cleanup.emails(scan.inbox)
  const senderNames = scan.senders.map(
    ({ fromEmail, fromName }) => fromName ?? fromEmail
  )

  if (offered.length === 0) {
    return <p className="text-muted-foreground text-sm">{t.clearOut.empty}</p>
  }

  return (
    <form
      className="flex flex-col gap-4"
      onSubmit={(event) => {
        event.preventDefault()
        if (clearing > 0) {
          onRun(selected)
        }
      }}
    >
      <p className="text-sm">
        {scan.isCapped ? t.clearOut.leadCapped(inbox) : t.clearOut.lead(inbox)}
      </p>
      {offered.map((group) => (
        // oxlint-disable-next-line jsx-a11y/label-has-associated-control -- Switch renders its control inside the label
        <label key={group} className="flex items-start gap-3 text-sm">
          <Switch
            checked={selected.includes(group)}
            onCheckedChange={(isOn) =>
              setChosen((previous) =>
                isOn
                  ? [...previous, group]
                  : previous.filter((item) => item !== group)
              )
            }
          />
          <span className="flex flex-col gap-0.5">
            <span>{t.clearOut.groups[group]}</span>
            <span className="text-muted-foreground text-xs">
              {t.cleanup.emails(countOf([group]))}
              {group === 'lists' && (
                <span data-mask>
                  {' · '}
                  {t.clearOut.listsFrom(
                    senderNames.slice(0, SENDER_NAMES_SHOWN).join(', '),
                    Math.max(0, senderNames.length - SENDER_NAMES_SHOWN)
                  )}
                </span>
              )}
            </span>
          </span>
        </label>
      ))}
      <DialogFooter>
        <span className="text-muted-foreground mr-auto self-center text-sm">
          {t.clearOut.left(t.cleanup.emails(scan.inbox - clearing))}
        </span>
        <Button autoFocus type="submit" disabled={clearing === 0}>
          {t.clearOut.run(t.cleanup.emails(clearing))}
        </Button>
      </DialogFooter>
    </form>
  )
}

/** The run outlives the dialog, which closes at once: clearing a large inbox takes a while. */
export const ClearOutDialog = () => {
  const t = useT()
  const open = useSubscription(clearOutStore)
  const undo = useMutation(
    orpc.subscriptions.undoClearOut.mutationOptions({
      onSuccess: ({ restored }) =>
        toast.success(t.clearOut.undone(t.cleanup.emails(restored))),
      onSettled: refetchMail,
    })
  )
  const run = useMutation(
    orpc.subscriptions.clearOut.mutationOptions({
      onMutate: () => toast.loading(t.agent.steps.clear_out),
      onError: (_error, _input, toastId) => toast.dismiss(toastId),
      onSettled: refetchMail,
      onSuccess: ({ cleared }, _input, toastId) =>
        toast.success(t.clearOut.done(t.cleanup.emails(cleared)), {
          action: { label: t.clearOut.undo, onClick: () => undo.mutate() },
          duration: UNDO_TOAST_MS,
          id: toastId,
        }),
    })
  )

  return (
    <Dialog open={open} onOpenChange={(next) => clearOutStore.set(next)}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t.clearOut.title}</DialogTitle>
          <DialogDescription>{t.clearOut.safe}</DialogDescription>
        </DialogHeader>
        {open && (
          <ClearOutForm
            onRun={(groups) => {
              run.mutate({ groups })
              clearOutStore.set(false)
            }}
          />
        )}
      </DialogContent>
    </Dialog>
  )
}
