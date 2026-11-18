import { noop } from '@fewmail/shared/utils'
import {
  Alert02Icon,
  CheckmarkCircle02Icon,
  InformationCircleIcon,
  Loading03Icon,
  MultiplicationSignCircleIcon,
} from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { useEffect, useRef, useState, useSyncExternalStore } from 'react'
import type { CSSProperties } from 'react'
import { createPortal } from 'react-dom'
import { Toaster as Sonner } from 'sonner'

import { useTheme } from '../theme-store'

const subscribeNever = () => noop

const CONTROL =
  'a[href], button, input, select, textarea, [role="button"], [role="checkbox"], [role="switch"]'
const PROBE_STEP = 12
const CONTROL_GAP = 8
// sonner's `visibleToasts` and `gap` defaults: passing either prop to `Sonner` must change these too.
const STACK_VISIBLE = 3
const STACK_PEEK = 14
const SETTLE_MS = 250

interface Box {
  bottom: number
  left: number
  right: number
  top: number
}

const controlTopsUnder = (toaster: Element, box: Box) => {
  const tops: number[] = []
  for (let y = box.top + 2; y < box.bottom; y += PROBE_STEP) {
    for (let x = box.left + 2; x < box.right; x += PROBE_STEP) {
      const under = document
        .elementsFromPoint(x, y)
        .find((node) => !toaster.contains(node))
      const control = under?.closest(CONTROL)
      // A row's hover buttons wait at opacity 0 yet are still hit: counted, the toast climbed Mail's rows to a gap mid-list.
      if (
        !control?.checkVisibility({
          opacityProperty: true,
          visibilityProperty: true,
        })
      ) {
        continue
      }
      const rect = control.getBoundingClientRect()
      // A row or a field wider than the toast is an area, not a control: counted, Mail's list would never let it sit.
      if (rect.width < box.right - box.left) {
        tops.push(rect.top)
      }
    }
  }
  return tops
}

const liftOffControls = (toaster: HTMLElement) => {
  const stack = toaster.querySelectorAll(
    '[data-sonner-toast]:not([data-removed="true"])'
  ).length
  if (!stack) {
    return 0
  }
  const { left, right } = toaster.getBoundingClientRect()
  const front = toaster.querySelector<HTMLElement>('[data-front="true"]')
  // The list has no height of its own, so its top is the toasts' bottom; offsetTop leaves out the lift's translate.
  const bottom = toaster.offsetTop
  const height =
    (front?.offsetHeight ?? 0) +
    (Math.min(stack, STACK_VISIBLE) - 1) * STACK_PEEK
  let lift = 0
  while (lift < innerHeight * 0.4) {
    const tops = controlTopsUnder(toaster, {
      bottom: bottom - lift,
      left,
      right,
      top: bottom - lift - height,
    })
    if (!tops.length) {
      return lift
    }
    lift = bottom - Math.min(...tops) + CONTROL_GAP
  }
  return 0
}

const useControlLift = () => {
  const ref = useRef<HTMLDivElement>(null)
  const [lift, setLift] = useState(0)

  useEffect(() => {
    let timer = 0
    const place = () => {
      const toaster = ref.current?.querySelector<HTMLElement>(
        '[data-sonner-toaster]'
      )
      if (!toaster) {
        setLift(0)
      } else if (!toaster.matches(':hover')) {
        setLift(liftOffControls(toaster))
      }
    }
    const schedule = () => {
      clearTimeout(timer)
      timer = window.setTimeout(place, SETTLE_MS)
    }
    const observer = new MutationObserver(schedule)
    observer.observe(document.body, { childList: true, subtree: true })
    addEventListener('scroll', schedule, { capture: true, passive: true })
    addEventListener('resize', schedule)
    return () => {
      clearTimeout(timer)
      observer.disconnect()
      removeEventListener('scroll', schedule, { capture: true })
      removeEventListener('resize', schedule)
    }
  }, [])

  return { lift, ref }
}

const Toaster = () => {
  const theme = useTheme()
  const isClient = useSyncExternalStore(
    subscribeNever,
    () => true,
    () => false
  )
  const { lift, ref } = useControlLift()

  if (!isClient) {
    return null
  }

  return createPortal(
    <div
      ref={ref}
      data-mask
      style={{ '--toast-lift': `${lift}px` } as CSSProperties}
      className="[&_ol]:ease-house contents [&_ol]:z-60! [&_ol]:-translate-y-(--toast-lift) [&_ol]:transition-[transform,translate] [&_ol]:duration-300 motion-reduce:[&_ol]:transition-none"
    >
      <Sonner
        theme={theme}
        position="bottom-right"
        className="group"
        icons={{
          error: (
            <HugeiconsIcon
              icon={MultiplicationSignCircleIcon}
              strokeWidth={2}
              className="text-destructive size-4"
            />
          ),
          info: (
            <HugeiconsIcon
              icon={InformationCircleIcon}
              strokeWidth={2}
              className="text-muted-foreground size-4"
            />
          ),
          loading: (
            <HugeiconsIcon
              icon={Loading03Icon}
              strokeWidth={2}
              className="text-muted-foreground size-4 animate-spin"
            />
          ),
          success: (
            <HugeiconsIcon
              icon={CheckmarkCircle02Icon}
              strokeWidth={2}
              className="text-success size-4"
            />
          ),
          warning: (
            <HugeiconsIcon
              icon={Alert02Icon}
              strokeWidth={2}
              className="text-warning size-4"
            />
          ),
        }}
        toastOptions={{
          classNames: {
            actionButton: `
              h-6 shrink-0 self-center rounded-md bg-primary px-2 text-xs
              font-medium whitespace-nowrap text-primary-foreground
              hover:bg-primary/90
            `,
            cancelButton: `
              h-6 shrink-0 self-center rounded-md bg-input px-2 text-xs
              font-medium whitespace-nowrap text-foreground
              hover:bg-accent
            `,
            closeButton: `
              absolute -top-1.5 -left-1.5 flex size-5 items-center justify-center
              rounded-full bg-popover text-muted-foreground shadow-xs ring
              ring-foreground/4
              hover:text-foreground
            `,
            content: 'flex min-w-0 flex-1 flex-col gap-0.5',
            description: 'text-xs leading-snug text-muted-foreground',
            icon: `
              flex h-lh w-4 shrink-0 items-center justify-center text-sm
              leading-tight
            `,
            title: 'text-sm leading-tight font-medium text-foreground',
            toast: `
              flex w-(--width) items-center gap-2.5 rounded-xl bg-background/80
              p-3 shadow-lg ring-1 ring-foreground/4 backdrop-blur-xl
              select-none
              has-data-description:items-start
              data-[expanded=false]:data-[front=false]:*:opacity-0
            `,
          },
          unstyled: true,
        }}
      />
    </div>,
    document.body
  )
}

export { Toaster }
