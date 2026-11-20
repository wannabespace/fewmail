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
import { posthog } from '~/lib/posthog'

type ProFeature = 'board' | 'chat' | 'drafts'

/** Free sees every Pro control; using one opens this instead (`domain.md` → Free). */
export const upgradeStore = createStore<ProFeature | null>(null)
upgradeStore.subscribe((feature) => {
  if (feature) {
    posthog.capture('upgrade_prompted', { feature })
  }
})

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
    board: t.nav.board,
    chat: t.bots.title,
    drafts: t.compose.writeForMe,
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
