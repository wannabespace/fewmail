import { useIsMobile } from '@fewmail/ui/hooks/use-is-mobile'
import { cn } from '@fewmail/ui/lib/utils'
import { useHotkey } from '@tanstack/react-hotkeys'
import { useRouterState } from '@tanstack/react-router'
import {
  AnimatePresence,
  animate,
  motion,
  useReducedMotion,
} from 'motion/react'
import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import type { CSSProperties } from 'react'
import { useSubscription } from 'seitu/react'

import { collapseExpanded, useExpanded } from '~/components/expand-row'
import { KeyHints } from '~/components/key-hints'
import { noticeHeightStore } from '~/components/notice-bar'
import {
  READER_FOLD,
  ThreadView,
  useReaderWidthIn,
} from '~/components/thread-view'
import { useT } from '~/lib/i18n'

const pageArea = () =>
  document.querySelector<HTMLElement>('[data-slot=thread-pane-area]')

const NOTICE_GAP = 8

const INSTANT = { duration: 0 } as const

const usePageAreaRect = () => {
  const [area, setArea] = useState(() => pageArea()?.getBoundingClientRect())
  useEffect(() => {
    const element = pageArea()
    if (!element) {
      return
    }
    const observer = new ResizeObserver(() =>
      setArea(element.getBoundingClientRect())
    )
    observer.observe(element)
    return () => observer.disconnect()
  }, [])
  return area
}

/** Whether a notice floats over the page: an email beside the page then starts a gap below it, with a top border and corner. */
export const useIsUnderNotice = () => {
  const noticeHeight = useSubscription(noticeHeightStore)
  const isMobile = useIsMobile()
  return noticeHeight > 0 && !isMobile
}

/** The sidebar's box: the page area's right edge, top to bottom, as wide as Mail's reader beside its list; under a notice it starts a gap below it. */
const useSidebarBox = () => {
  const area = usePageAreaRect()
  const right = area?.right ?? innerWidth
  const readerWidth = useReaderWidthIn(area?.width ?? innerWidth)
  const isMobile = useIsMobile()
  // A phone has no room beside the page: the email covers it.
  const width = isMobile ? (area?.width ?? innerWidth) : readerWidth
  const noticeHeight = useSubscription(noticeHeightStore)
  const top = (area?.top ?? 0) + noticeHeight
  const isUnderNotice = noticeHeight > 0 && !isMobile
  const gap = isUnderNotice ? NOTICE_GAP : 0
  return {
    height: (area?.height ?? innerHeight) - noticeHeight - gap,
    isUnderNotice,
    left: right - width,
    top: top + gap,
    width,
  }
}

/**
 * An email opened out of a row or a source chip, in a sidebar at the page area's right edge while the page makes room
 * beside it. `esc`, ✕, the same row again and a click on the page close it; another row moves it to that email; leaving
 * the page drops it.
 */
export const ThreadPane = () => {
  const t = useT()
  const open = useExpanded()
  const pathname = useRouterState({
    select: (state) => state.location.pathname,
  })
  const isOpen = !!open && open.pathname === pathname
  useEffect(() => {
    if (open && !isOpen) {
      collapseExpanded()
    }
  }, [open, isOpen])
  const box = useSidebarBox()
  const isMobile = useIsMobile()
  const isReduced = useReducedMotion()
  // Leaving the page drops the email at once, never folding it shut over the next page.
  const fold = isReduced || (open && !isOpen) ? INSTANT : READER_FOLD.transition
  const pageRoom = isOpen && !isMobile ? box.width : 0
  const wasOpen = useRef(isOpen)
  useLayoutEffect(() => {
    const isToggled = wasOpen.current !== isOpen
    wasOpen.current = isOpen
    // A Home card's pane lies over the page area, so it makes room too.
    const areas = document.querySelectorAll<HTMLElement>(
      '[data-slot=thread-pane-area], [data-slot=home-card-pane]'
    )
    const folds = [...areas].map((area) =>
      animate(
        area,
        { paddingRight: `${pageRoom}px` },
        isToggled ? fold : INSTANT
      )
    )
    return () => {
      for (const area of folds) {
        area.stop()
      }
    }
  }, [fold, isOpen, pageRoom])
  useHotkey('Escape', collapseExpanded, {
    enabled: isOpen,
    ignoreDefaultPrevented: true,
  })
  useEffect(() => {
    const area = pageArea()
    if (!isOpen || !area) {
      return
    }
    // A row's own trigger opens its email in the sidebar instead.
    const onPointerDown = ({ target }: PointerEvent) => {
      if (
        !(target instanceof Element && target.closest('[data-expand-trigger]'))
      ) {
        collapseExpanded()
      }
    }
    area.addEventListener('pointerdown', onPointerDown)
    return () => area.removeEventListener('pointerdown', onPointerDown)
  }, [isOpen])
  return (
    // Keyed by the page: leaving it drops the email without folding it on the next one.
    <AnimatePresence key={pathname}>
      {isOpen && (
        <div
          key="sidebar"
          style={
            {
              '--sidebar-height': `${box.height}px`,
              '--sidebar-left': `${box.left}px`,
              '--sidebar-top': `${box.top}px`,
              '--sidebar-width': `${box.width}px`,
            } as CSSProperties
          }
          className="pointer-events-none fixed top-(--sidebar-top) left-(--sidebar-left) z-40 flex h-(--sidebar-height) w-(--sidebar-width) justify-end"
        >
          {/* In percent of the sidebar's box, so a resize never plays the fold. */}
          <motion.div
            initial={{ width: '0%' }}
            animate={{ width: '100%' }}
            exit={{ width: '0%' }}
            transition={fold}
            className={cn(
              'bg-background border-foreground/6 pointer-events-auto flex overflow-hidden border-l',
              box.isUnderNotice && 'rounded-tl-xl border-t'
            )}
          >
            <motion.div
              initial={READER_FOLD.initial}
              animate={READER_FOLD.animate}
              exit={READER_FOLD.initial}
              transition={fold}
              className="flex w-(--sidebar-width) shrink-0 flex-col pt-6"
            >
              <ThreadView
                key={open.sourceId}
                cite={open.cite}
                isSnoozed={false}
                threadId={open.threadId}
                onClose={collapseExpanded}
                onDone={collapseExpanded}
              />
              <KeyHints
                hints={[
                  ['R', t.keys.reply],
                  ['E', t.keys.archive],
                  ['/', t.keys.ask],
                  ['esc', t.keys.close],
                ]}
              />
            </motion.div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
