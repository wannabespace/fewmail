import type { Messages } from '@fewmail/shared/i18n'
import { Kbd } from '@fewmail/ui/components/kbd'
import { useHotkey } from '@tanstack/react-hotkeys'
import { useQuery } from '@tanstack/react-query'
import { Link, useNavigate } from '@tanstack/react-router'

import { useT } from '~/lib/i18n'
import { useHasAgent, useMe } from '~/lib/me'
import { orpc } from '~/lib/orpc'

import { LogoMark } from './logo'

export const NAV_ITEMS = [
  { key: 'today', sequence: ['G', 'T'], to: '/today' },
  { key: 'mail', sequence: ['G', 'M'], to: '/mail' },
  { key: 'rules', sequence: ['G', 'R'], to: '/rules' },
  { key: 'settings', sequence: ['G', 'S'], to: '/settings' },
] as const

export const visibleNavItems = (hasAgent: boolean) =>
  NAV_ITEMS.filter((item) => hasAgent || item.key !== 'today')

const NavLink = ({
  item,
  badge,
}: {
  badge?: number
  item: (typeof NAV_ITEMS)[number]
}) => {
  const t = useT()
  const navigate = useNavigate()
  useHotkey(item.sequence, () => navigate({ to: item.to }))

  return (
    <Link
      to={item.to}
      className="text-foreground/75 hover:bg-accent data-[status=active]:bg-secondary data-[status=active]:text-foreground focus-visible:focus-ring flex h-8 cursor-default items-center justify-between rounded-lg px-2.5 text-sm outline-none data-[status=active]:font-medium"
    >
      <span>{t.nav[item.key]}</span>
      {badge ? (
        <span className="bg-primary text-primary-foreground flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-xs font-medium tabular-nums">
          {badge}
        </span>
      ) : (
        <Kbd>{item.sequence.join(' ')}</Kbd>
      )}
    </Link>
  )
}

const syncStatus = (
  t: Messages,
  mailbox:
    | { lastSyncedAt: Date | null; syncError: string | null }
    | null
    | undefined
) => {
  if (mailbox?.syncError) {
    return t.nav.syncFailed
  }
  return mailbox?.lastSyncedAt ? t.nav.watching : t.nav.syncing
}

export const Sidebar = ({
  email,
  onSearch,
}: {
  email: string
  onSearch: () => void
}) => {
  const t = useT()
  const { plan } = useMe()
  const hasAgent = useHasAgent()
  const { data: today } = useQuery(
    orpc.today.get.queryOptions({
      enabled: hasAgent,
      refetchInterval: 30_000,
    })
  )

  return (
    <nav
      aria-label="Main"
      className="flex w-58 shrink-0 flex-col gap-1 border-r px-3.5 py-5"
    >
      <div className="flex items-center gap-2.5 px-2.5 pb-4">
        <LogoMark />
        <span className="font-serif text-xl font-medium tracking-tight">
          Fewmail
        </span>
      </div>
      <button
        type="button"
        onClick={onSearch}
        className="bg-input text-muted-foreground ring-foreground/6 hover:ring-foreground/12 focus-visible:focus-ring mb-3 flex h-8 cursor-default items-center justify-between rounded-lg px-2.5 text-sm shadow-2xs ring outline-none"
      >
        <span>{t.nav.search}</span>
        <Kbd>⌘K</Kbd>
      </button>
      {visibleNavItems(hasAgent).map((item) => (
        <NavLink
          key={item.to}
          item={item}
          badge={item.to === '/today' ? today?.queue.length : undefined}
        />
      ))}
      <div className="flex-1" />
      <div className="text-muted-foreground flex flex-col gap-0.5 px-2.5 text-xs">
        <span data-mask className="text-foreground/80 truncate">
          {email}
        </span>
        {hasAgent && <span>{syncStatus(t, today?.mailbox)}</span>}
        {plan.trialDaysLeft && (
          <Link to="/settings" className="text-muted-foreground">
            {t.nav.trialLeft(plan.trialDaysLeft)}
          </Link>
        )}
      </div>
    </nav>
  )
}
