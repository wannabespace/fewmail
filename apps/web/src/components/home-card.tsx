import { cardsBleedClassName } from '@fewmail/ui/components/accordion'
import { Button } from '@fewmail/ui/components/button'
import { IconButton } from '@fewmail/ui/components/custom/icon-button'
import { Item } from '@fewmail/ui/components/item'
import { Kbd } from '@fewmail/ui/components/kbd'
import { cn } from '@fewmail/ui/lib/utils'
import { Cancel01Icon } from '@hugeicons/core-free-icons'
import { Link } from '@tanstack/react-router'
import type { ReactNode } from 'react'

import { ExpandTrigger } from '~/components/expand-row'
import { SenderAvatar } from '~/components/sender-avatar'
import { useT } from '~/lib/i18n'
import { warmThread } from '~/lib/mail-db'

/** What a Home card opens over Home's column (`?page=`). */
export type HomeCardPage = 'board' | 'tidy' | 'worth'

/** One line of what a card holds: who, then what; it opens its email in the sidebar. */
export interface HomeCardRow {
  id: string
  sender: { fromEmail: string; fromName?: string | null }
  text: ReactNode
  threadId: string
}

/** A card names its first few; the rest are Show all's. */
export const HOME_CARD_ROWS = 3

/**
 * A block of Home as a card: a muted heading, one serif line saying what is there, the first few of it as one-line rows
 * (each opens its email in the sidebar), then the block's quick decision and Show all, which opens the whole of it over
 * Home's column. What it holds never unfolds on Home, so Home stays a few cards long.
 */
export const HomeCard = ({
  actions,
  heading,
  isActive,
  lead,
  openKey,
  page,
  rows,
  total,
}: {
  actions?: ReactNode
  heading: string
  /** Home's cursor is on it: the same ring as a decision card under the cursor. */
  isActive?: boolean
  lead: ReactNode
  /** Home's key for Show all. */
  openKey: string
  page: HomeCardPage
  rows: HomeCardRow[]
  total: number
}) => {
  const t = useT()
  return (
    <section
      aria-label={heading}
      data-active={isActive || undefined}
      className={cn(
        'bg-card ring-foreground/6 data-active:ring-foreground/25 flex flex-col gap-3 rounded-2xl px-4.75 py-4 ring',
        cardsBleedClassName
      )}
    >
      <h2 className="text-muted-foreground text-xs font-medium">{heading}</h2>
      <p className="text-brief text-foreground/80 font-serif">{lead}</p>
      {rows.length > 0 && (
        <ul className="flex flex-col">
          {rows.slice(0, HOME_CARD_ROWS).map((row) => (
            <li key={row.id}>
              <Item
                size="2xs"
                className="-mx-2.5 flex-nowrap"
                render={
                  <ExpandTrigger
                    email={{ from: 'home', threadId: row.threadId }}
                    rowId={`${page}:${row.id}`}
                    onPointerEnter={() => {
                      void warmThread(row.threadId)
                    }}
                  />
                }
              >
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
      <div className="flex flex-wrap items-center gap-2">
        {actions}
        <Button
          size="sm"
          variant="secondary"
          render={<Link to="/home" search={(prev) => ({ ...prev, page })} />}
          shortcut={<Kbd>{openKey}</Kbd>}
        >
          {t.mail.showAll(total)}
        </Button>
      </div>
    </section>
  )
}

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
