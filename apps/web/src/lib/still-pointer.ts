const MOVED_PX = 3

/** Goes inside the scroller, never on it: a scroller without pointer events stops taking the wheel. */
export const STILL_POINTER_GUARD = 'in-data-pointer-still:pointer-events-none'

/**
 * A row or card that leaves slides the next one under a resting pointer, its buttons right where the last ones were,
 * so the second click of a double click acts on it. Until the pointer really moves, `data-pointer-still` on `<html>`
 * takes pointer events off every `STILL_POINTER_GUARD` area; keys never wait. A touch never moves before its tap, so
 * only a hovering pointer is held.
 */
export const holdClicksUntilMove = () => {
  const root = document.documentElement
  if (
    root.dataset.pointerStill !== undefined ||
    !matchMedia('(hover: hover)').matches
  ) {
    return
  }
  root.dataset.pointerStill = ''
  let moved = 0
  const release = (event: PointerEvent) => {
    moved += Math.abs(event.movementX) + Math.abs(event.movementY)
    if (moved >= MOVED_PX) {
      delete root.dataset.pointerStill
      window.removeEventListener('pointermove', release)
    }
  }
  window.addEventListener('pointermove', release)
}
