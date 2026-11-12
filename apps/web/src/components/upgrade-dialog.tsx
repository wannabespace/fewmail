import { Button } from '@fewmail/ui/components/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@fewmail/ui/components/dialog'
import { CrownIcon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { useNavigate } from '@tanstack/react-router'
import { useState } from 'react'
import { createStore } from 'seitu'
import { useSubscription } from 'seitu/react'

import { useT } from '~/lib/i18n'
import { useHasAgent } from '~/lib/me'

type ProFeature = 'agent' | 'ask' | 'boards' | 'drafts' | 'tasks' | 'today'

/** Free sees every Pro control; using one opens this instead (`domain.md` → Free). */
export const upgradeStore = createStore<ProFeature | null>(null)

/** Runs `action` with the agent; on Free opens the upgrade dialog for `feature` instead. */
export const useWithAgent = () => {
  const hasAgent = useHasAgent()
  return (feature: ProFeature, action: () => unknown) => {
    if (hasAgent) {
      action()
      return
    }
    upgradeStore.set(feature)
  }
}

export const UpgradeDialog = () => {
  const t = useT()
  const navigate = useNavigate()
  const feature = useSubscription(upgradeStore)
  const [shown, setShown] = useState(feature)
  if (feature && feature !== shown) {
    setShown(feature)
  }
  const titles = {
    agent: t.nav.agent,
    ask: t.upgrade.ask,
    boards: t.nav.boards,
    drafts: t.compose.writeForMe,
    tasks: t.tasks.handle,
    today: t.nav.today,
  }

  return (
    <Dialog
      open={Boolean(feature)}
      onOpenChange={(open) => !open && upgradeStore.set(null)}
      onOpenChangeComplete={(open) => !open && setShown(null)}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{shown && titles[shown]}</DialogTitle>
          <DialogDescription>
            {shown && t.upgrade.hints[shown]}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button
            autoFocus
            onClick={() => {
              upgradeStore.set(null)
              void navigate({ to: '/settings' })
            }}
          >
            <HugeiconsIcon icon={CrownIcon} strokeWidth={2} />
            {t.command.upgrade}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
