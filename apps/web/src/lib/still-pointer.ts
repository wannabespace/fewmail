const MOVED_PX = 3
const DOUBLE_CLICK_MS = 300

/** Goes inside the scroller, never on it: a scroller without pointer events stops taking the wheel. */
export const STILL_POINTER_GUARD = 'in-data-pointer-still:pointer-events-none'

let release: (() => void) | undefined

/**
 * A row or card that leaves slides the next one under a resting pointer, its buttons right where the last ones were,
 * so the second click of a double click acts on it. Until the pointer really moves or a double click's time is up,
 * `data-pointer-still` on `<html>` takes pointer events off every `STILL_POINTER_GUARD` area; keys never wait. Each
 * action restarts the hold, so a key repeat cannot end it early. A touch never moves before its tap, so only a
 * hovering pointer is held.
 */
export const holdClicksUntilMove = () => {
  if (!matchMedia('(hover: hover)').matches) {
    return
  }
  release?.()
  const root = document.documentElement
  root.dataset.pointerStill = ''
  let moved = 0
  const onMove = (event: PointerEvent) => {
    moved += Math.abs(event.movementX) + Math.abs(event.movementY)
    if (moved >= MOVED_PX) {
      release?.()
    }
  }
  const timer = setTimeout(() => release?.(), DOUBLE_CLICK_MS)
  release = () => {
    delete root.dataset.pointerStill
    window.removeEventListener('pointermove', onMove)
    clearTimeout(timer)
    release = undefined
  }
  window.addEventListener('pointermove', onMove)
}
