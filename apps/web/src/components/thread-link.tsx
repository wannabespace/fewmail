import { useIsMobile } from '@fewmail/ui/hooks/use-is-mobile'
import { useHotkey } from '@tanstack/react-hotkeys'
import { useRouterState } from '@tanstack/react-router'
import { useEffect, useLayoutEffect, useState } from 'react'
import type { CSSProperties } from 'react'

import { collapseExpanded, useExpanded } from '~/components/expand-row'
import { KeyHints } from '~/components/key-hints'
import { ThreadView, useReaderWidthIn } from '~/components/thread-view'
import { useT } from '~/lib/i18n'

const pageArea = () =>
  document.querySelector<HTMLElement>('[data-slot=thread-pane-area]')

/** The sidebar's box: the page area's right edge, top to bottom, as wide as Mail's reader beside its list. */
const useSidebarBox = () => {
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
  const right = area?.right ?? innerWidth
  const readerWidth = useReaderWidthIn(area?.width ?? innerWidth)
  // A phone has no room beside the page: the email covers it.
  const width = useIsMobile() ? (area?.width ?? innerWidth) : readerWidth
  return {
    height: area?.height ?? innerHeight,
    left: right - width,
    top: area?.top ?? 0,
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
  useLayoutEffect(() => {
    const area = pageArea()
    if (!isOpen || !area || isMobile) {
      return
    }
    area.style.paddingRight = `${box.width}px`
    return () => {
      area.style.removeProperty('padding-right')
    }
  }, [isOpen, isMobile, box.width])
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
  if (!isOpen) {
    return null
  }
  return (
    <div
      style={
        {
          '--sidebar-height': `${box.height}px`,
          '--sidebar-left': `${box.left}px`,
          '--sidebar-top': `${box.top}px`,
          '--sidebar-width': `${box.width}px`,
        } as CSSProperties
      }
      className="bg-background border-foreground/6 fixed top-(--sidebar-top) left-(--sidebar-left) z-40 flex h-(--sidebar-height) w-(--sidebar-width) flex-col border-l pt-6"
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
    </div>
  )
}
