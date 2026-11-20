const MOVED_PX = 3
const DOUBLE_CLICK_MS = 300
const GUARD = 'still-pointer-guard'
const PRESSES = ['mousedown', 'click', 'dblclick'] as const

export const STILL_POINTER_GUARD = GUARD

let release: (() => void) | undefined

const swallowDoubleClick = (event: MouseEvent) => {
  if (
    event.detail >= 2 &&
    event.target instanceof Element &&
    event.target.closest(`.${GUARD}`)
  ) {
    event.preventDefault()
    event.stopImmediatePropagation()
  }
}

/**
 * A row or card that leaves slides the next one under a resting pointer, its buttons right where the last ones were,
 * so the second click of a double click acts on it. Until the pointer really moves or a double click's time is up,
 * a press the browser counts as a double click's (`detail` 2 and up) inside a `STILL_POINTER_GUARD` area is
 * swallowed; a single click and keys never wait. Never `pointer-events: none`: the browser recomputes `:hover` only
 * on a move or a layout, so the next row's buttons stayed hidden and dead until the server's answer re-laid the page.
 * Each action restarts the hold, so a key repeat cannot end it early. A touch never moves before its tap, so only a
 * hovering pointer is held.
 */
export const holdClicksUntilMove = () => {
  if (!matchMedia('(hover: hover)').matches) {
    return
  }
  release?.()
  let moved = 0
  const onMove = (event: PointerEvent) => {
    moved += Math.abs(event.movementX) + Math.abs(event.movementY)
    if (moved >= MOVED_PX) {
      release?.()
    }
  }
  const timer = setTimeout(() => release?.(), DOUBLE_CLICK_MS)
  release = () => {
    window.removeEventListener('pointermove', onMove)
    for (const press of PRESSES) {
      window.removeEventListener(press, swallowDoubleClick, true)
    }
    clearTimeout(timer)
    release = undefined
  }
  window.addEventListener('pointermove', onMove)
  for (const press of PRESSES) {
    window.addEventListener(press, swallowDoubleClick, true)
  }
}
