import { IconButton } from '@fewmail/ui/components/custom/icon-button'
import { Item } from '@fewmail/ui/components/item'
import { Kbd } from '@fewmail/ui/components/kbd'
import { cn } from '@fewmail/ui/lib/utils'
import {
  Cancel01Icon,
  Coffee02Icon,
  DashboardSquare01Icon,
  Flag02Icon,
  News01Icon,
  SparklesIcon,
  ZapIcon,
} from '@hugeicons/core-free-icons'
import type { IconSvgElement } from '@hugeicons/react'
import { HugeiconsIcon } from '@hugeicons/react'
import { Link, useSearch } from '@tanstack/react-router'
import { useEffect, useRef } from 'react'
import type { ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { createStore } from 'seitu'
import { useSubscription } from 'seitu/react'

import { MorphPane, PaneReveal } from '~/components/expand-row'
import { PaneScroller } from '~/components/pane-rows'
import { SenderAvatar } from '~/components/sender-avatar'
import { useT } from '~/lib/i18n'

/** What a Home card opens over Home's column (`?page=`). */
export type HomeCardPage =
  | 'board'
  | 'improve'
  | 'later'
  | 'look'
  | 'newsletters'
  | 'tidy'

/** One line of what a card holds: who (or, with no sender, an icon and a name), then what. */
export type HomeCardRow = { id: string; text: ReactNode } & (
  | { sender: { fromEmail: string; fromName?: string | null } }
  | { icon: IconSvgElement; name: ReactNode }
)

/** A card names its first few; the rest are in what it opens. */
export const HOME_CARD_ROWS = 3

const morphIdOf = (page: HomeCardPage) => `home-${page}`

// The colours are the Decisions bar's shares, so each share names its card; the rest stay ink, never a second accent.
const HEADING_ICONS: Record<
  HomeCardPage,
  { className: string; icon: IconSvgElement }
> = {
  board: { className: 'text-muted-foreground', icon: DashboardSquare01Icon },
  improve: { className: 'text-muted-foreground', icon: ZapIcon },
  later: { className: 'text-foreground/30', icon: Coffee02Icon },
  look: { className: 'text-primary', icon: Flag02Icon },
  newsletters: { className: 'text-muted-foreground', icon: News01Icon },
  tidy: { className: 'text-success', icon: SparklesIcon },
}

// No bleed of its own: Home's bento grid bleeds as a whole, so the cards' text lines up with the page's.
const cardClassName =
  'bg-card ring-foreground/6 flex flex-col gap-3 px-4.75 py-4 ring'

/**
 * A block of Home as a card: a muted heading, one serif line saying what is there and its first few as one-line
 * rows, then its quick decision. A click anywhere else (or the block's key) grows the card into its pane over Home's
 * column (`HomeCardPane`); the card stays where it is under the pane, its content blurred out, so the pane shrinks back
 * into the same spot.
 */
export const HomeCard = ({
  actions,
  heading,
  isActive,
  lead,
  page,
  rows,
}: {
  actions?: ReactNode
  heading: string
  /** Home's cursor is on it: the same ring as a decision card under the cursor. */
  isActive?: boolean
  lead: ReactNode
  page: HomeCardPage
  rows: HomeCardRow[]
}) => {
  const isOpen = useSearch({ strict: false }).page === page
  const content = (
    <>
      <h2 className="text-muted-foreground flex items-center gap-1.5 text-xs font-medium">
        <HugeiconsIcon
          icon={HEADING_ICONS[page].icon}
          strokeWidth={2}
          className={cn('size-3.5 shrink-0', HEADING_ICONS[page].className)}
        />
        {heading}
      </h2>
      <p className="text-brief text-foreground/80 font-serif text-balance">
        {lead}
      </p>
      {rows.length > 0 && (
        <ul className="flex flex-col">
          {rows.slice(0, HOME_CARD_ROWS).map((row) => (
            <li key={row.id}>
              <Item size="2xs" className="-mx-2.5 flex-nowrap">
                {'sender' in row ? (
                  <SenderAvatar sender={row.sender} />
                ) : (
                  <HugeiconsIcon
                    icon={row.icon}
                    strokeWidth={2}
                    className="text-muted-foreground size-4 shrink-0"
                  />
                )}
                <span
                  data-mask
                  className={cn(
                    'font-medium',
                    'sender' in row ? 'shrink-0' : 'min-w-0 truncate'
                  )}
                >
                  {'sender' in row
                    ? (row.sender.fromName ?? row.sender.fromEmail)
                    : row.name}
                </span>
                <span
                  data-mask
                  className="text-muted-foreground min-w-0 truncate"
                >
                  {row.text}
                </span>
              </Item>
            </li>
          ))}
        </ul>
      )}
      {actions && (
        <div className="pointer-events-auto flex flex-wrap items-center gap-2">
          {actions}
        </div>
      )}
    </>
  )
  return (
    <section
      aria-label={heading}
      aria-hidden={isOpen || undefined}
      data-active={isActive || undefined}
      data-morph-source={morphIdOf(page)}
      className={cn(
        cardClassName,
        'hover:ring-foreground/10 data-active:ring-foreground/25 relative overflow-hidden rounded-2xl'
      )}
    >
      <Link
        to="/home"
        search={(prev) => ({ ...prev, page })}
        aria-label={heading}
        // The card stays under its pane: a click that kept focus here lit its ring when `esc` closed the pane.
        onMouseDown={(event) => event.preventDefault()}
        className="focus-visible:focus-ring absolute inset-0 cursor-pointer rounded-2xl outline-none focus-visible:ring-inset"
      />
      {/* Paints over the card's link and lets clicks through to it; only the quick decision takes its own. */}
      <div className="pointer-events-none relative flex flex-col gap-3">
        {content}
      </div>
    </section>
  )
}

/** The page column (`routes/_app.tsx` sets it by ref), which a Home card's pane covers. */
export const pageColumn = createStore<HTMLDivElement | null>(null)

/** What a Home card grows into: a pane over the page column (notices included). */
export const HomeCardPane = ({
  children,
  page,
}: {
  children: ReactNode
  page: HomeCardPage
}) => {
  // Over the notice bar too: the pane covers the whole page column, not only the page under the notices. Never drawn in
  // place first (a reload renders it before the column is in the DOM): moved into the column after, it remounted and
  // played its opening.
  const column = useSubscription(pageColumn)
  const pane = (
    <MorphPane area="page-column" source={morphIdOf(page)} className="z-10">
      <PaneScroller data-slot="home-card-pane">
        <PaneReveal className="mx-auto flex max-w-3xl flex-col gap-8 px-10 pt-12 pb-16 max-md:px-4 max-md:pt-6">
          {children}
        </PaneReveal>
      </PaneScroller>
    </MorphPane>
  )
  return column && createPortal(pane, column)
}

// Keep in step with the pane's padding, and with `SettingsGroup`'s `isTitleSticky` (`top-12` is the stuck bar's height): a sticky bar over the whole gutter covers every card's bleed and ring scrolling under it.
const paneGutterClassName = '-mx-4 px-4 md:-mx-10 md:px-10'

/**
 * What a Home card opened says on top: its name, its actions and ✕ (Home's `esc`) back to Home. The title scrolls away
 * like the open email's (`page-heading` in the kit's globals.css) while the bar with the actions sticks and repeats it;
 * `children` (a lead) scroll away under it. A fragment, so the bar sticks within the whole pane, not just its header.
 */
export const PageHeading = ({
  actions,
  children,
  onClose,
  title,
}: {
  actions?: ReactNode
  children?: ReactNode
  onClose: () => void
  title: string
}) => {
  const t = useT()
  const headerRef = useRef<HTMLElement>(null)
  const actionsRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const header = headerRef.current
    const bar = actionsRef.current
    if (!header || !bar) {
      return
    }
    const observer = new ResizeObserver(() =>
      header.style.setProperty(
        '--page-heading-actions',
        `calc(${bar.offsetWidth}px + 0.5rem)`
      )
    )
    observer.observe(bar)
    return () => observer.disconnect()
  }, [])
  return (
    <>
      <header ref={headerRef} className="page-heading">
        {/* -mt-3 / -mb-5 and the bar's resting padding line its row up with the title's: change them together. */}
        <div data-slot="page-heading-pin" className="-mt-3 -mb-5">
          <div
            data-slot="page-heading-bar"
            className={cn('flex items-center gap-2', paneGutterClassName)}
          >
            <p
              aria-hidden
              data-slot="page-heading-bar-title"
              className="min-w-0 flex-1 truncate font-serif text-lg tracking-tight"
            >
              {title}
            </p>
            <div ref={actionsRef} className="flex items-center gap-2">
              {actions}
              <IconButton
                icon={Cancel01Icon}
                label={t.mail.close}
                shortcut={<Kbd>esc</Kbd>}
                size="icon-sm"
                variant="ghost-muted"
                onClick={onClose}
              />
            </div>
          </div>
        </div>
        <h1
          data-slot="page-heading-title"
          className="text-display mb-3 font-serif tracking-tight"
        >
          {title}
        </h1>
      </header>
      {children && <div className="-mt-5 flex flex-col gap-3">{children}</div>}
    </>
  )
}
