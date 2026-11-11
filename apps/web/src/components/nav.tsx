import { Kbd } from '@fewmail/ui/components/kbd'
import { useModifierHold } from '@fewmail/ui/hooks/use-shortcut-reveal'
import { useHotkey } from '@tanstack/react-hotkeys'
import { useQuery } from '@tanstack/react-query'
import { Link, useNavigate } from '@tanstack/react-router'

import { newBoardStore } from '~/components/board-dialog'
import { useT } from '~/lib/i18n'
import { useHasAgent, useMe } from '~/lib/me'
import { orpc } from '~/lib/orpc'

import { Logo } from './logo'

export const NAV_ITEMS = [
  { key: 'today', sequence: ['G', 'T'], to: '/today' },
  { key: 'mail', sequence: ['G', 'M'], to: '/mail' },
  { key: 'rules', sequence: ['G', 'R'], to: '/rules' },
  { key: 'settings', sequence: ['G', 'S'], to: '/settings' },
] as const

const AGENT_ONLY = new Set(['today'])

export const visibleNavItems = (hasAgent: boolean) =>
  NAV_ITEMS.filter((item) => hasAgent || !AGENT_ONLY.has(item.key))

const NAV_ROW =
  'text-foreground/75 hover:bg-accent data-[status=active]:bg-secondary data-[status=active]:text-foreground focus-visible:focus-ring flex h-8 cursor-default items-center justify-between rounded-lg px-2.5 text-sm outline-none data-[status=active]:font-medium'

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
      <span className="truncate" data-mask>
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
        <span className="text-muted-foreground">{t.nav.newBoard}</span>
      </button>
    </section>
  )
}

const NavLink = ({
  item,
  badge,
  showKeys,
}: {
  badge?: number
  item: (typeof NAV_ITEMS)[number]
  showKeys: boolean
}) => {
  const t = useT()
  const navigate = useNavigate()
  useHotkey(item.sequence, () => navigate({ to: item.to }))

  return (
    <Link to={item.to} className={NAV_ROW}>
      <span>{t.nav[item.key]}</span>
      {showKeys ? (
        <Kbd>{item.sequence.join(' ')}</Kbd>
      ) : (
        Boolean(badge) && (
          <span className="bg-primary text-primary-foreground flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-xs font-medium tabular-nums">
            {badge}
          </span>
        )
      )}
    </Link>
  )
}

const SyncStatus = ({
  mailboxes,
}: {
  mailboxes?: { lastSyncedAt: Date | null; syncError: string | null }[]
}) => {
  const t = useT()
  if (mailboxes?.some(({ syncError }) => syncError)) {
    return (
      <Link to="/settings" className="text-muted-foreground">
        {t.nav.syncFailed}
      </Link>
    )
  }
  const isWatching =
    !!mailboxes?.length && mailboxes.every(({ lastSyncedAt }) => lastSyncedAt)
  return <span>{isWatching ? t.nav.watching : t.nav.syncing}</span>
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
  const isModifierHeld = useModifierHold()
  const { data: today } = useQuery(
    orpc.today.get.queryOptions({ enabled: hasAgent })
  )

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
        className="bg-input text-muted-foreground ring-foreground/6 hover:ring-foreground/12 focus-visible:focus-ring mb-3 flex h-8 cursor-default items-center justify-between rounded-lg px-2.5 text-sm shadow-2xs ring outline-none"
      >
        <span>{t.nav.search}</span>
        <Kbd>⌘K</Kbd>
      </button>
      {visibleNavItems(hasAgent).map((item) => (
        <NavLink
          key={item.to}
          item={item}
          showKeys={isModifierHeld}
          badge={item.to === '/today' ? today?.queue.length : undefined}
        />
      ))}
      {hasAgent && <Boards showKeys={isModifierHeld} />}
      <div className="flex-1" />
      <div className="text-muted-foreground flex flex-col gap-0.5 px-2.5 text-xs">
        <span data-mask className="text-foreground/80 truncate">
          {email}
        </span>
        {hasAgent && <SyncStatus mailboxes={today?.mailboxes} />}
        {plan.trialDaysLeft && (
          <Link to="/settings" className="text-muted-foreground">
            {t.nav.trialLeft(plan.trialDaysLeft)}
          </Link>
        )}
      </div>
    </nav>
  )
}
