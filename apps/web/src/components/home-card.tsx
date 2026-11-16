import { cardsBleedClassName } from '@fewmail/ui/components/accordion'
import { IconButton } from '@fewmail/ui/components/custom/icon-button'
import { Item } from '@fewmail/ui/components/item'
import { Kbd } from '@fewmail/ui/components/kbd'
import { cn } from '@fewmail/ui/lib/utils'
import { Cancel01Icon } from '@hugeicons/core-free-icons'
import { Link, useSearch } from '@tanstack/react-router'
import { motion } from 'motion/react'
import { useState } from 'react'
import type { ReactNode } from 'react'
import { createPortal } from 'react-dom'

import { HIDDEN, SHOWN, useMorph } from '~/components/expand-row'
import { SenderAvatar } from '~/components/sender-avatar'
import { useT } from '~/lib/i18n'

/** What a Home card opens over Home's column (`?page=`). */
export type HomeCardPage = 'board' | 'look' | 'tidy' | 'worth'

/** One line of what a card holds: who, then what. */
export interface HomeCardRow {
  id: string
  sender: { fromEmail: string; fromName?: string | null }
  text: ReactNode
}

/** A card names its first few; the rest are in what it opens. */
export const HOME_CARD_ROWS = 3

const CARD_RADIUS = 16

const morphIdOf = (page: HomeCardPage) => `home-${page}`

const cardClassName = cn(
  'bg-card ring-foreground/6 flex flex-col gap-3 px-4.75 py-4 ring',
  cardsBleedClassName
)

/**
 * A block of Home as Reading's card: a muted heading, one serif line saying what is there and its first few as one-line
 * rows, then its quick decision. A click anywhere else (or the block's key) grows the card into its pane over Home's
 * column (one `layoutId`, `HomeCardPane`); while the pane is open the card keeps its place, unseen, so it shrinks back
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
  const { morph, reveal } = useMorph()
  const isOpen = useSearch({ strict: false }).page === page
  // Only a card coming back from its pane fades its content in; on Home's first render it is simply there.
  const [hasOpened, setHasOpened] = useState(isOpen)
  if (isOpen && !hasOpened) {
    setHasOpened(true)
  }
  const content = (
    <>
      <h2 className="text-muted-foreground text-xs font-medium">{heading}</h2>
      <p className="text-brief text-foreground/80 font-serif">{lead}</p>
      {rows.length > 0 && (
        <ul className="flex flex-col">
          {rows.slice(0, HOME_CARD_ROWS).map((row) => (
            <li key={row.id}>
              <Item size="2xs" className="-mx-2.5 flex-nowrap">
                <SenderAvatar sender={row.sender} />
                <span data-mask className="shrink-0 font-medium">
                  {row.sender.fromName ?? row.sender.fromEmail}
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
  if (isOpen) {
    return (
      <section
        aria-hidden
        className={cn(cardClassName, 'invisible rounded-2xl')}
      >
        {content}
      </section>
    )
  }
  return (
    <motion.section
      layoutId={morphIdOf(page)}
      // The closing pane hides at once instead of fading over the card: scaled down, its rows would squash.
      layoutCrossfade={false}
      transition={morph}
      initial={false}
      animate={{ borderRadius: CARD_RADIUS }}
      aria-label={heading}
      data-active={isActive || undefined}
      className={cn(
        cardClassName,
        'hover:ring-foreground/10 data-active:ring-foreground/25 relative z-10 overflow-hidden'
      )}
    >
      <Link
        to="/home"
        search={(prev) => ({ ...prev, page })}
        aria-label={heading}
        className="focus-visible:focus-ring absolute inset-0 cursor-pointer rounded-2xl outline-none focus-visible:ring-inset"
      />
      {/* Paints over the card's link and lets clicks through to it; only the quick decision takes its own. `layout` keeps
          the text from stretching while the box scales back from the pane. */}
      <motion.div
        layout="position"
        initial={hasOpened ? HIDDEN : false}
        animate={SHOWN}
        transition={{ ...reveal, layout: morph }}
        className="pointer-events-none relative flex flex-col gap-3"
      >
        {content}
      </motion.div>
    </motion.section>
  )
}

/** What a Home card grows into: a pane over the page column (notices included), like Reading's; its content fades in once it has grown. */
export const HomeCardPane = ({
  children,
  page,
}: {
  children: ReactNode
  page: HomeCardPage
}) => {
  const { morph, reveal } = useMorph()
  // Over the notice bar too: the pane covers the whole page column, not only the page under the notices.
  const column = document.querySelector('[data-slot=page-column]')
  const pane = (
    <motion.div
      layoutId={morphIdOf(page)}
      transition={morph}
      initial={false}
      animate={{ borderRadius: 0 }}
      className="bg-background absolute inset-0 z-10 overflow-hidden"
    >
      <motion.div layoutScroll className="h-full overflow-y-auto">
        <motion.div
          initial={HIDDEN}
          animate={SHOWN}
          transition={reveal}
          className="mx-auto flex max-w-3xl flex-col gap-8 px-10 pt-12 pb-16 max-md:px-4 max-md:pt-6"
        >
          {children}
        </motion.div>
      </motion.div>
    </motion.div>
  )
  return column ? createPortal(pane, column) : pane
}

/**
 * What a Home card opened says on top: its name, its actions and ✕ (Home's `esc`) back to Home, held at the pane's top
 * while it scrolls; `children` (a lead) scroll away under it. A fragment, so the row sticks within the whole pane, not
 * just within its own header.
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
  return (
    <>
      <header className="bg-background sticky top-0 z-10 -mt-3 flex items-center gap-2 py-3">
        <h1 className="text-display font-serif tracking-tight">{title}</h1>
        <div className="ml-auto flex items-center gap-2">
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
      </header>
      {children && <div className="-mt-5 flex flex-col gap-3">{children}</div>}
    </>
  )
}
