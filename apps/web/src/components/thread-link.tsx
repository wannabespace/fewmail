import {
  ResizableGroup,
  ResizablePanel,
  ResizableSeparator,
} from '@fewmail/ui/components/custom/resizable'
import { useIsMobile } from '@fewmail/ui/hooks/use-is-mobile'
import { cn } from '@fewmail/ui/lib/utils'
import { useHotkey } from '@tanstack/react-hotkeys'
import { useRouterState } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import { useSubscription } from 'seitu/react'

import { collapseExpanded, useExpanded } from '~/components/expand-row'
import type { Expanded } from '~/components/expand-row'
import { KeyHints } from '~/components/key-hints'
import { noticeHeightStore } from '~/components/notice-bar'
import {
  READER_FOLD,
  READER_WIDTH,
  ThreadView,
  readerWidthStore,
  useIsReaderCrowded,
  useReaderWidthIn,
} from '~/components/thread-view'
import { useT } from '~/lib/i18n'

const pageArea = () =>
  document.querySelector<HTMLElement>('[data-slot=thread-pane-area]')

const NOTICE_GAP = 8

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

/** The sidebar's room: the page area, top to bottom; under a notice it starts a gap below it. */
const useSidebarBox = () => {
  const area = usePageAreaRect()
  const isUnderNotice = useIsUnderNotice()
  const noticeHeight = useSubscription(noticeHeightStore)
  const gap = isUnderNotice ? NOTICE_GAP : 0
  return {
    height: (area?.height ?? innerHeight) - noticeHeight - gap,
    isUnderNotice,
    left: area?.left ?? 0,
    top: (area?.top ?? 0) + noticeHeight + gap,
    width: area?.width ?? 0,
  }
}

/** The page makes room for the email as wide as it is on screen, so it follows every frame of a fold and a drag. */
const useMakeRoom = (panes: HTMLElement | null, isCrowded: boolean) => {
  useEffect(() => {
    const fill = panes?.querySelector<HTMLElement>('[data-motion-panels-fill]')
    if (!panes || !fill) {
      return
    }
    let lastRoom = 0
    const observer = new ResizeObserver(() => {
      // With no room beside the page (a phone, a narrow window) the email covers it.
      const room = isCrowded
        ? 0
        : panes.getBoundingClientRect().width -
          fill.getBoundingClientRect().width
      // Every page has a shut sidebar of its own: one that stays shut never takes another's room away.
      if (room === lastRoom) {
        return
      }
      lastRoom = room
      for (const area of document.querySelectorAll<HTMLElement>(
        '[data-slot=thread-pane-area]'
      )) {
        area.style.paddingRight = `${room}px`
      }
    })
    observer.observe(fill)
    return () => observer.disconnect()
  }, [isCrowded, panes])
}

/**
 * Mail's reader for every other page: a sidebar at the page area's right edge, the same width, bounds, grip and fold,
 * while the page makes room beside it. Keyed by the page, so leaving it drops the sidebar without folding it on the
 * next one.
 */
export const ReaderSidebar = ({
  children,
  className,
  isOpen,
}: {
  children: ReactNode
  className?: string
  isOpen: boolean
}) => {
  const box = useSidebarBox()
  const isCrowded = useIsReaderCrowded(box.width)
  const readerWidth = useReaderWidthIn(box.width)
  const [panes, setPanes] = useState<HTMLElement | null>(null)
  useMakeRoom(panes, isCrowded)
  return (
    <ResizableGroup
      ref={setPanes}
      // oxlint-disable shadcn/no-inline-styles -- the group's own inline style sets it to 100% of its parent, which a class cannot beat
      style={{
        height: box.height,
        left: box.left,
        top: box.top,
        width: box.width,
      }}
      // oxlint-enable shadcn/no-inline-styles
      className="pointer-events-none fixed z-40"
    >
      <ResizablePanel />
      <ResizableSeparator className="pointer-events-auto" />
      {/* Held shut until the page area is measured: opening at the remembered width and then clamping it springs the width. */}
      <ResizablePanel
        className="pointer-events-auto flex"
        collapsed={!isOpen || box.width === 0}
        {...READER_FOLD}
        keepMounted={false}
        size={isCrowded ? box.width : readerWidth}
        minSize={READER_WIDTH.min}
        maxSize={READER_WIDTH.max}
        onSizeChange={(width: number) => readerWidthStore.set(width)}
      >
        <div
          className={cn(
            'bg-background border-foreground/6 flex min-w-0 flex-1 flex-col border-l',
            // Clipped: the email's filled header bar would cover the corner and the top border.
            box.isUnderNotice && 'overflow-clip rounded-tl-xl border-t',
            className
          )}
        >
          {children}
        </div>
      </ResizablePanel>
    </ResizableGroup>
  )
}

/** The closed email stays in the sidebar while it folds away. */
const useShownEmail = (open: Expanded | null) => {
  const [last, setLast] = useState(open)
  if (open && open !== last) {
    setLast(open)
  }
  return open ?? last
}

/**
 * An email opened out of a row or a source chip, in `ReaderSidebar`. `esc`, ✕, the same row again and a click on the page
 * close it; another row moves it to that email; leaving the page drops it.
 */
export const ThreadPane = () => {
  const t = useT()
  const open = useExpanded()
  const pathname = useRouterState({
    select: (state) => state.location.pathname,
  })
  const isOpen = !!open && open.pathname === pathname
  const shown = useShownEmail(open)
  useEffect(() => {
    if (open && !isOpen) {
      collapseExpanded()
    }
  }, [open, isOpen])
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
    <ReaderSidebar key={pathname} isOpen={isOpen} className="pt-6">
      {shown && (
        <>
          <ThreadView
            key={shown.sourceId}
            cite={shown.cite}
            isSnoozed={false}
            threadId={shown.threadId}
            onClose={collapseExpanded}
            onDone={collapseExpanded}
          />
          <KeyHints
            hints={[
              ['R', t.keys.reply],
              ['E', t.keys.archive],
              ['esc', t.keys.close],
            ]}
          />
        </>
      )}
    </ReaderSidebar>
  )
}
