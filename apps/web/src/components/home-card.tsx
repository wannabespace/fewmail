import { cardsBleedClassName } from '@fewmail/ui/components/accordion'
import { IconButton } from '@fewmail/ui/components/custom/icon-button'
import { Kbd } from '@fewmail/ui/components/kbd'
import { cn } from '@fewmail/ui/lib/utils'
import { Cancel01Icon } from '@hugeicons/core-free-icons'
import { Link } from '@tanstack/react-router'
import type { ReactNode } from 'react'

import { useT } from '~/lib/i18n'

/** What a Home card opens over Home's column (`?page=`). */
export type HomeCardPage = 'board' | 'tidy' | 'worth'

/**
 * A block of Home as Reading's card: a muted heading with the block's quick decisions at its end, then one serif line
 * saying what is there and, under it, a muted one with its parts. What it holds never unfolds on Home: a click anywhere
 * else on the card opens it over Home's column, so Home stays a few cards long.
 */
export const HomeCard = ({
  actions,
  detail,
  heading,
  isActive,
  lead,
  page,
}: {
  actions?: ReactNode
  detail?: ReactNode
  heading: string
  /** Home's cursor is on it: the same ring as a decision card under the cursor. */
  isActive?: boolean
  lead: ReactNode
  page: HomeCardPage
}) => (
  <section
    aria-label={heading}
    data-active={isActive || undefined}
    className={cn(
      'bg-card ring-foreground/6 hover:ring-foreground/10 data-active:ring-foreground/25 relative flex flex-col gap-3 rounded-2xl px-4.75 py-4 ring',
      cardsBleedClassName
    )}
  >
    <Link
      to="/home"
      search={(prev) => ({ ...prev, page })}
      aria-label={heading}
      className="focus-visible:focus-ring absolute inset-0 cursor-pointer rounded-2xl outline-none focus-visible:ring-inset"
    />
    {/* Paints over the card's link and lets clicks through to it; only the heading's buttons take their own. */}
    <div className="pointer-events-none relative flex flex-col gap-3">
      <div className="flex min-h-8 flex-wrap items-center gap-2">
        <h2 className="text-muted-foreground text-xs font-medium">{heading}</h2>
        {actions && (
          <div className="pointer-events-auto ml-auto flex flex-wrap gap-2">
            {actions}
          </div>
        )}
      </div>
      <p className="text-brief text-foreground/80 font-serif">{lead}</p>
      {detail && <p className="text-muted-foreground font-serif">{detail}</p>}
    </div>
  </section>
)

/** What a Home card opened says on top: its name, and ✕ (Home's `esc`) back to Home. */
export const PageHeading = ({
  children,
  onClose,
  title,
}: {
  children?: ReactNode
  onClose: () => void
  title: string
}) => {
  const t = useT()
  return (
    <header className="flex flex-col gap-3">
      <div className="flex items-center gap-2">
        <h1 className="text-display font-serif tracking-tight">{title}</h1>
        <IconButton
          className="ml-auto"
          icon={Cancel01Icon}
          label={t.mail.close}
          shortcut={<Kbd>esc</Kbd>}
          size="icon-sm"
          variant="ghost-muted"
          onClick={onClose}
        />
      </div>
      {children}
    </header>
  )
}
