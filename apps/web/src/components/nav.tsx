import { PLAN_LIMITS } from '@fewmail/shared/agent'
import { Kbd } from '@fewmail/ui/components/kbd'
import { useModifierHold } from '@fewmail/ui/hooks/use-shortcut-reveal'
import {
  Add01Icon,
  AiChat02Icon,
  DashboardSquare01Icon,
  Mail01Icon,
  Search01Icon,
  Settings01Icon,
  Sun03Icon,
  ZapIcon,
} from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { useHotkey } from '@tanstack/react-hotkeys'
import { useQuery } from '@tanstack/react-query'
import { Link, useNavigate } from '@tanstack/react-router'

import { newBoardStore } from '~/components/board-dialog'
import { useT } from '~/lib/i18n'
import { useHasAgent, useMe } from '~/lib/me'
import { orpc } from '~/lib/orpc'

import { Logo } from './logo'

export const NAV_ITEMS = [
  { icon: Sun03Icon, key: 'today', sequence: ['G', 'T'], to: '/today' },
  { icon: AiChat02Icon, key: 'agent', sequence: ['G', 'A'], to: '/agent' },
  { icon: Mail01Icon, key: 'mail', sequence: ['G', 'M'], to: '/mail' },
  { icon: ZapIcon, key: 'rules', sequence: ['G', 'R'], to: '/rules' },
  {
    icon: Settings01Icon,
    key: 'settings',
    sequence: ['G', 'S'],
    to: '/settings',
  },
] as const

const AGENT_ONLY = new Set(['today', 'agent'])

/** Quiet until the month is nearly spent: never push. */
const USAGE_SHOWN_FROM = 90

const usagePercent = (
  limits: { emails: number; messages: number },
  usage: { emails: number; messages: number }
) =>
  Math.min(
    100,
    Math.floor(
      Math.max(usage.emails / limits.emails, usage.messages / limits.messages) *
        100
    )
  )

export const visibleNavItems = (hasAgent: boolean) =>
  NAV_ITEMS.filter((item) => hasAgent || !AGENT_ONLY.has(item.key))

const NAV_ROW =
  'text-foreground/75 hover:bg-accent data-[status=active]:bg-secondary data-[status=active]:text-foreground focus-visible:focus-ring flex h-8 cursor-pointer items-center gap-2 rounded-lg px-2.5 text-sm outline-none [&>svg]:size-4 [&>svg]:shrink-0 [&>svg]:opacity-70 data-[status=active]:font-medium'

const BOARD_KEYS = ['1', '2', '3', '4', '5', '6', '7', '8', '9'] as const

const BoardLink = ({
  board,
  index,
  showKeys,
}: {
  board: { id: string; name: string }
  index: number
  showKeys: boolean
}) => {
  const navigate = useNavigate()
  const key = BOARD_KEYS[index]
  useHotkey(
    ['G', key ?? '0'],
    () => navigate({ params: { boardId: board.id }, to: '/boards/$boardId' }),
    { enabled: Boolean(key) }
  )

  return (
    <Link
      to="/boards/$boardId"
      params={{ boardId: board.id }}
      className={NAV_ROW}
    >
      <HugeiconsIcon icon={DashboardSquare01Icon} strokeWidth={2} />
      <span className="flex-1 truncate" data-mask>
        {board.name}
      </span>
      {showKeys && key && <Kbd>G {key}</Kbd>}
    </Link>
  )
}

const Boards = ({ showKeys }: { showKeys: boolean }) => {
  const t = useT()
  const { data: boards = [] } = useQuery(orpc.boards.list.queryOptions())

  return (
    <section aria-label={t.nav.boards} className="mt-4 flex flex-col gap-1">
      <h2 className="text-muted-foreground px-2.5 pb-1 text-xs font-medium">
        {t.nav.boards}
      </h2>
      {boards.map((board, index) => (
        <BoardLink
          key={board.id}
          board={board}
          index={index}
          showKeys={showKeys}
        />
      ))}
      <button
        type="button"
        className={NAV_ROW}
        onClick={() => newBoardStore.set(true)}
      >
        <HugeiconsIcon icon={Add01Icon} strokeWidth={2} />
        <span className="text-muted-foreground">{t.nav.newBoard}</span>
      </button>
    </section>
  )
}

const NavLink = ({
  item,
  badge,
  count,
  showKeys,
}: {
  badge?: number
  count?: number
  item: (typeof NAV_ITEMS)[number]
  showKeys: boolean
}) => {
  const t = useT()
  const navigate = useNavigate()
  useHotkey(item.sequence, () => navigate({ to: item.to }))

  return (
    <Link to={item.to} className={NAV_ROW}>
      <HugeiconsIcon icon={item.icon} strokeWidth={2} />
      <span className="flex-1">{t.nav[item.key]}</span>
      {showKeys && <Kbd>{item.sequence.join(' ')}</Kbd>}
      {!showKeys && Boolean(badge) && (
        <span className="bg-primary text-primary-foreground flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-xs font-medium tabular-nums">
          {badge}
        </span>
      )}
      {!showKeys && !badge && Boolean(count) && (
        <span className="text-muted-foreground text-xs tabular-nums">
          {count}
        </span>
      )}
    </Link>
  )
}

/** One line: the footer shows only what matters most right now. */
const FooterStatus = ({
  mailboxes,
}: {
  mailboxes?: { lastSyncedAt: Date | null; syncError: string | null }[]
}) => {
  const t = useT()
  const { plan, usage } = useMe()
  const hasAgent = useHasAgent()
  const percent =
    plan.kind === 'free' ? 0 : usagePercent(PLAN_LIMITS[plan.kind], usage)
  const isSyncing =
    !mailboxes?.length || mailboxes.some(({ lastSyncedAt }) => !lastSyncedAt)

  const toSettings = (text: string) => (
    <Link to="/settings" className="text-muted-foreground truncate">
      {text}
    </Link>
  )
  if (hasAgent && mailboxes?.some(({ syncError }) => syncError)) {
    return toSettings(t.nav.syncFailed)
  }
  if (hasAgent && isSyncing) {
    return <span className="truncate">{t.nav.syncing}</span>
  }
  if (percent >= USAGE_SHOWN_FROM) {
    return toSettings(t.nav.usage(percent))
  }
  if (plan.trialDaysLeft) {
    return toSettings(t.nav.trialLeft(plan.trialDaysLeft))
  }
  return hasAgent ? (
    <span className="truncate">{t.nav.watching}</span>
  ) : null
}

export const Sidebar = ({
  email,
  onSearch,
}: {
  email: string
  onSearch: () => void
}) => {
  const t = useT()
  const hasAgent = useHasAgent()
  const isModifierHeld = useModifierHold()
  const { data: today } = useQuery(
    orpc.today.get.queryOptions({ enabled: hasAgent })
  )
  const { data: unread } = useQuery(orpc.mail.unread.queryOptions())

  return (
    <nav
      aria-label="Main"
      className="flex w-full flex-col gap-1 border-r px-3.5 py-5"
    >
      <div className="px-2.5 pb-4">
        <Logo to={hasAgent ? '/today' : '/mail'} />
      </div>
      <button
        type="button"
        onClick={onSearch}
        className="bg-input text-muted-foreground ring-foreground/6 hover:ring-foreground/12 focus-visible:focus-ring mb-3 flex h-8 cursor-pointer items-center justify-between rounded-lg px-2.5 text-sm shadow-2xs ring outline-none"
      >
        <span className="flex items-center gap-2">
          <HugeiconsIcon
            icon={Search01Icon}
            strokeWidth={2}
            className="size-4"
          />
          {t.nav.search}
        </span>
        <Kbd>⌘K</Kbd>
      </button>
      {visibleNavItems(hasAgent).map((item) => (
        <NavLink
          key={item.to}
          item={item}
          showKeys={isModifierHeld}
          badge={item.to === '/today' ? today?.queue.length : undefined}
          count={item.to === '/mail' ? unread?.inbox : undefined}
        />
      ))}
      {hasAgent && <Boards showKeys={isModifierHeld} />}
      <div className="flex-1" />
      <div className="text-muted-foreground flex flex-col gap-0.5 px-2.5 text-xs">
        <span data-mask className="text-foreground/80 truncate">
          {email}
        </span>
        <FooterStatus mailboxes={today?.mailboxes} />
      </div>
    </nav>
  )
}
