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
import { Switch } from '@fewmail/ui/components/switch'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { toast } from 'sonner'

import { useT } from '~/lib/i18n'
import { orpc } from '~/lib/orpc'

/** "Handle this": the user states a goal once; asking before each email is the default. */
export const HandleDialog = ({
  messageId,
  onOpenChange,
  open,
}: {
  messageId: string
  onOpenChange: (open: boolean) => void
  open: boolean
}) => {
  const t = useT()
  const queryClient = useQueryClient()
  const [goal, setGoal] = useState('')
  const [isAuto, setIsAuto] = useState(false)
  const create = useMutation(
    orpc.tasks.create.mutationOptions({
      onSuccess: () => {
        toast.success(t.tasks.started)
        setGoal('')
        onOpenChange(false)
        void queryClient.invalidateQueries()
      },
    })
  )

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t.tasks.handle}</DialogTitle>
          <DialogDescription>{t.tasks.goal}</DialogDescription>
        </DialogHeader>
        <form
          className="flex flex-col gap-4"
          onSubmit={(event) => {
            event.preventDefault()
            if (goal.trim().length > 3) {
              create.mutate({
                autonomy: isAuto ? 'auto' : 'ask',
                goal: goal.trim(),
                messageId,
              })
            }
          }}
        >
          <Input
            autoFocus
            value={goal}
            onChange={(event) => setGoal(event.target.value)}
            placeholder={t.tasks.goalPlaceholder}
            aria-label={t.tasks.goal}
            data-mask
          />
          {/* oxlint-disable-next-line jsx-a11y/label-has-associated-control -- Switch renders its control inside the label */}
          <label className="flex items-start gap-3 text-sm">
            <Switch checked={isAuto} onCheckedChange={setIsAuto} />
            <span className="flex flex-col gap-0.5">
              <span>{t.tasks.auto}</span>
              <span className="text-muted-foreground text-xs">
                {t.tasks.autoHint}
              </span>
            </span>
          </label>
          <DialogFooter>
            <Button type="submit" disabled={create.isPending}>
              {t.tasks.start}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
