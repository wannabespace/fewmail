import { getKeyStateTracker, useKeyHold } from '@tanstack/react-hotkeys'
import { type } from 'arktype'
import { useEffect, useState } from 'react'
import { useSubscription } from 'seitu/react'
import { createWebStorageValue } from 'seitu/web'

import { isMac } from '../lib/os'

const REVEAL_DELAY_MS = 800

export const shortcutRevealStore = createWebStorageValue({
  defaultValue: true,
  key: 'shortcut-reveal',
  schema: type('boolean'),
  type: 'localStorage',
})

const isUncovered = (trigger: HTMLElement) => {
  const { left, top, width, height } = trigger.getBoundingClientRect()
  return trigger.contains(
    document.elementFromPoint(left + width / 2, top + height / 2)
  )
}

/** ⌘ (Ctrl elsewhere) held alone past the reveal delay, with `trigger` (when given) not covered by anything. */
export const useModifierHold = (trigger?: HTMLElement) => {
  const isHeld = useKeyHold(isMac ? 'Meta' : 'Control')
  const [heldLongEnough, setHeldLongEnough] = useState(false)

  useEffect(() => {
    if (!isHeld) {
      return
    }
    // The trigger is hit-tested only once, so a shortcut pressed mid-hold must end the reveal: what it opens would sit under the hints.
    const timeout = setTimeout(
      () => setHeldLongEnough(!trigger || isUncovered(trigger)),
      REVEAL_DELAY_MS
    )
    const combo = getKeyStateTracker().store.subscribe(({ heldKeys }) => {
      if (heldKeys.length > 1) {
        clearTimeout(timeout)
        setHeldLongEnough(false)
      }
    })
    return () => {
      clearTimeout(timeout)
      combo.unsubscribe()
      setHeldLongEnough(false)
    }
  }, [isHeld, trigger])

  return isHeld && heldLongEnough
}

export const useShortcutReveal = (trigger: HTMLElement | null) => {
  const isEnabled = useSubscription(shortcutRevealStore)
  const isHeld = useModifierHold(trigger ?? undefined)
  return isEnabled && !!trigger && isHeld
}

export const ShortcutRevealObserver = () => {
  const isEnabled = useSubscription(shortcutRevealStore)
  const isRevealed = useModifierHold() && isEnabled

  useEffect(() => {
    document.documentElement.toggleAttribute(
      'data-shortcuts-revealed',
      isRevealed
    )
  }, [isRevealed])

  return null
}
