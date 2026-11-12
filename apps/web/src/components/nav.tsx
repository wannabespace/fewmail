import { PLAN_LIMITS } from '@fewmail/shared/agent'
import {
  Avatar,
  AvatarBadge,
  AvatarFallback,
} from '@fewmail/ui/components/avatar'
import { Button } from '@fewmail/ui/components/button'
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from '@fewmail/ui/components/context-menu'
import { IconButton } from '@fewmail/ui/components/custom/icon-button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from '@fewmail/ui/components/dropdown-menu'
import { Kbd } from '@fewmail/ui/components/kbd'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@fewmail/ui/components/tooltip'
import { useModifierHold } from '@fewmail/ui/hooks/use-shortcut-reveal'
import type { Theme } from '@fewmail/ui/theme-store'
import { themeStore, useTheme } from '@fewmail/ui/theme-store'
import {
  Add01Icon,
  AiChat02Icon,
  ArrowDown01Icon,
  ArrowUp01Icon,
  Calendar03Icon,
  ComputerIcon,
  CrownIcon,
  DashboardSquare01Icon,
  Delete02Icon,
  Edit02Icon,
  Logout01Icon,
  Mail01Icon,
  MailRemove01Icon,
  News01Icon,
  Moon02Icon,
  PencilEdit02Icon,
  Search01Icon,
  Settings01Icon,
  SpamIcon,
  Sun03Icon,
  Tag01Icon,
  TextAlignLeftIcon,
  UnfoldMoreIcon,
  ZapIcon,
} from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { useHotkey } from '@tanstack/react-hotkeys'
import { useMutation, useQuery } from '@tanstack/react-query'
import { Link, useNavigate, useRouterState } from '@tanstack/react-router'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { useEffect, useState } from 'react'

import { deletingBoardStore, newBoardStore } from '~/components/board-dialog'
import { signOut } from '~/lib/auth'
import { useT } from '~/lib/i18n'
import { useHasAgent, useMe } from '~/lib/me'
import { orpc, refetchChanged } from '~/lib/orpc'
import { queryClient } from '~/lib/query-client'
import { SITE_NAME } from '~/lib/seo'

import { useCompose } from './compose/compose-context'
import { Logo } from './logo'
import { useWithAgent } from './upgrade-dialog'

export const NAV_ITEMS = [
  { icon: Sun03Icon, key: 'today', sequence: ['G', 'T'], to: '/today' },
  { icon: AiChat02Icon, key: 'agent', sequence: ['G', 'A'], to: '/agent' },
  { icon: Mail01Icon, key: 'mail', sequence: ['G', 'M'], to: '/mail' },
  {
    icon: Calendar03Icon,
    key: 'calendar',
    sequence: ['G', 'L'],
    to: '/calendar',
  },
  { icon: News01Icon, key: 'reading', sequence: ['G', 'N'], to: '/reading' },
  { icon: ZapIcon, key: 'rules', sequence: ['G', 'R'], to: '/rules' },
  {
    icon: MailRemove01Icon,
    key: 'subscriptions',
    sequence: ['G', 'U'],
    to: '/subscriptions',
  },
  {
    icon: Settings01Icon,
    key: 'settings',
    sequence: ['G', 'S'],
    to: '/settings',
  },
] as const

const isAgentOnly = (key: string): key is 'agent' | 'today' =>
  key === 'today' || key === 'agent'

/** Today and Agent show on Free too; opening one there asks for Pro instead. */
export const useGoTo = () => {
  const navigate = useNavigate()
  const withAgent = useWithAgent()
  return (item: (typeof NAV_ITEMS)[number]) =>
    isAgentOnly(item.key)
      ? withAgent(item.key, () => navigate({ to: item.to }))
      : navigate({ to: item.to })
}

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

export const useVisibleNavItems = () => {
  const { data: reading = 0 } = useQuery(orpc.reading.count.queryOptions())
  return NAV_ITEMS.filter((item) => item.key !== 'reading' || reading > 0)
}

const NAV_ROW =
  'text-foreground/75 hover:bg-accent data-[status=active]:bg-secondary data-[status=active]:text-foreground focus-visible:focus-ring flex h-8 cursor-pointer items-center gap-2 rounded-lg px-2.5 text-sm outline-none [&>svg]:size-4 [&>svg]:shrink-0 [&>svg]:opacity-70 data-[status=active]:font-medium'

const BOARD_KEYS = ['1', '2', '3', '4', '5', '6', '7', '8', '9'] as const

interface BoardRow {
  id: string
  name: string
}

/** Right-click on a board row: the board page's edits, the order and delete, without opening the board first. */
const BoardLink = ({
  board,
  index,
  onMove,
  showKeys,
  total,
}: {
  board: BoardRow
  index: number
  onMove: (by: -1 | 1) => void
  showKeys: boolean
  total: number
}) => {
  const t = useT()
  const navigate = useNavigate()
  const key = BOARD_KEYS[index]
  const open = (intent?: 'describe' | 'rename') =>
    navigate({
      params: { boardId: board.id },
      search: intent ? { do: intent } : {},
      to: '/boards/$boardId',
    })
  useHotkey(['G', key ?? '0'], () => open(), { enabled: Boolean(key) })

  return (
    <ContextMenu>
      <ContextMenuTrigger
        render={
          <Link
            to="/boards/$boardId"
            params={{ boardId: board.id }}
            className={NAV_ROW}
          />
        }
      >
        <HugeiconsIcon icon={DashboardSquare01Icon} strokeWidth={2} />
        <span className="flex-1 truncate" data-mask>
          {board.name}
        </span>
        {showKeys && key && <Kbd>G {key}</Kbd>}
      </ContextMenuTrigger>
      <ContextMenuContent>
        <ContextMenuItem onClick={() => open('rename')}>
          <HugeiconsIcon icon={Edit02Icon} strokeWidth={2} />
          {t.boards.rename}
        </ContextMenuItem>
        <ContextMenuItem onClick={() => open('describe')}>
          <HugeiconsIcon icon={TextAlignLeftIcon} strokeWidth={2} />
          {t.boards.describe}
        </ContextMenuItem>
        <ContextMenuItem disabled={index === 0} onClick={() => onMove(-1)}>
          <HugeiconsIcon icon={ArrowUp01Icon} strokeWidth={2} />
          {t.boards.moveUp}
        </ContextMenuItem>
        <ContextMenuItem
          disabled={index === total - 1}
          onClick={() => onMove(1)}
        >
          <HugeiconsIcon icon={ArrowDown01Icon} strokeWidth={2} />
          {t.boards.moveDown}
        </ContextMenuItem>
        <ContextMenuSeparator />
        <ContextMenuItem
          variant="destructive"
          onClick={() => deletingBoardStore.set(board)}
        >
          <HugeiconsIcon icon={Delete02Icon} strokeWidth={2} />
          {t.boards.delete}
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  )
}

const Boards = ({ showKeys }: { showKeys: boolean }) => {
  const t = useT()
  const hasAgent = useHasAgent()
  const withAgent = useWithAgent()
  const { data: boards = [] } = useQuery(
    orpc.boards.list.queryOptions({ enabled: hasAgent })
  )
  const reorder = useMutation(
    orpc.boards.reorder.mutationOptions({
      onMutate: ({ ids }) =>
        queryClient.setQueryData(orpc.boards.list.queryKey(), (old) =>
          ids.flatMap((id) => old?.find((board) => board.id === id) ?? [])
        ),
      onSettled: () => refetchChanged(['boards']),
    })
  )
  const move = (index: number, by: -1 | 1) => {
    const ids = boards.map(({ id }) => id)
    const [moved] = ids.splice(index, 1)
    if (moved) {
      ids.splice(index + by, 0, moved)
      reorder.mutate({ ids })
    }
  }

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
          total={boards.length}
          showKeys={showKeys}
          onMove={(by) => move(index, by)}
        />
      ))}
      <button
        type="button"
        className={NAV_ROW}
        onClick={() => withAgent('boards', () => newBoardStore.set(true))}
      >
        <HugeiconsIcon icon={Add01Icon} strokeWidth={2} />
        <span className="text-muted-foreground">{t.nav.newBoard}</span>
      </button>
    </section>
  )
}

export const FOLDER_ITEMS = [
  { filter: 'spam', icon: SpamIcon },
  { filter: 'trash', icon: Delete02Icon },
] as const

/** Gmail's folders the view picker tucks away, then the user's own labels, each opening the Mail search for it. */
const Folders = () => {
  const t = useT()
  const { data: labels = [] } = useQuery(orpc.mail.labels.queryOptions())

  return (
    <section aria-label={t.nav.folders} className="mt-4 flex flex-col gap-1">
      <h2 className="text-muted-foreground px-2.5 pb-1 text-xs font-medium">
        {t.nav.folders}
      </h2>
      {FOLDER_ITEMS.map(({ filter, icon }) => (
        <Link key={filter} to="/mail" search={{ filter }} className={NAV_ROW}>
          <HugeiconsIcon icon={icon} strokeWidth={2} />
          <span className="flex-1">{t.mail.filter[filter]}</span>
        </Link>
      ))}
      {labels.map(({ name, query }) => (
        <Link key={name} to="/mail" search={{ q: query }} className={NAV_ROW}>
          <HugeiconsIcon icon={Tag01Icon} strokeWidth={2} />
          <span className="flex-1 truncate" data-mask>
            {name}
          </span>
        </Link>
      ))}
    </section>
  )
}

const ROLL = { duration: 0.25, ease: [0.32, 0.72, 0, 1] } as const

const roll = {
  enter: (direction: number) => ({ y: `${direction * 100}%` }),
  exit: (direction: number) => ({ y: `${direction * -100}%` }),
  shown: { y: 0 },
}

const RollingCount = ({ flash, value }: { flash?: boolean; value: number }) => {
  const reduceMotion = useReducedMotion()
  const [last, setLast] = useState({ grew: false, value })
  if (last.value !== value) {
    setLast({ grew: value > last.value, value })
  }
  const direction = last.grew ? 1 : -1

  return (
    <span className="relative inline-flex overflow-hidden">
      <AnimatePresence mode="popLayout" initial={false} custom={direction}>
        <motion.span
          key={value}
          custom={direction}
          variants={roll}
          initial="enter"
          animate="shown"
          exit="exit"
          transition={reduceMotion ? { duration: 0 } : ROLL}
          className={flash && last.grew ? 'animate-count-flash' : undefined}
        >
          {value}
        </motion.span>
      </AnimatePresence>
    </span>
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
  const hasAgent = useHasAgent()
  const goTo = useGoTo()
  useHotkey(item.sequence, () => goTo(item))

  return (
    <Link
      to={item.to}
      className={NAV_ROW}
      onClick={(event) => {
        if (!hasAgent && isAgentOnly(item.key)) {
          event.preventDefault()
          goTo(item)
        }
      }}
    >
      <HugeiconsIcon icon={item.icon} strokeWidth={2} />
      <span className="flex-1">{t.nav[item.key]}</span>
      {showKeys && <Kbd>{item.sequence.join(' ')}</Kbd>}
      {!showKeys && Boolean(badge) && (
        <span className="bg-primary text-primary-foreground flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-xs font-medium tabular-nums">
          <RollingCount value={badge ?? 0} />
        </span>
      )}
      {!showKeys && !badge && Boolean(count) && (
        <span className="text-muted-foreground text-xs tabular-nums">
          <RollingCount flash value={count ?? 0} />
        </span>
      )}
    </Link>
  )
}

const THEME_ICONS = {
  dark: Moon02Icon,
  light: Sun03Icon,
  system: ComputerIcon,
} as const

/** The account's state in one line, flagged when the user should act on it. */
const useAccountStatus = (
  mailboxes?: { lastSyncedAt: Date | null; syncError: string | null }[]
) => {
  const t = useT()
  const { plan, usage } = useMe()
  const hasAgent = useHasAgent()
  const percent =
    plan.kind === 'free' ? 0 : usagePercent(PLAN_LIMITS[plan.kind], usage)
  const isSyncing =
    !mailboxes?.length || mailboxes.some(({ lastSyncedAt }) => !lastSyncedAt)

  if (hasAgent && mailboxes?.some(({ syncError }) => syncError)) {
    return { isAlert: true, isTitled: true, text: t.nav.syncFailed }
  }
  if (hasAgent && isSyncing) {
    return { isAlert: false, isTitled: true, text: t.nav.syncing }
  }
  if (percent >= USAGE_SHOWN_FROM) {
    return { isAlert: true, isTitled: true, text: t.nav.usage(percent) }
  }
  if (plan.trialDaysLeft) {
    return { isAlert: false, text: t.nav.trialLeft(plan.trialDaysLeft) }
  }
  return hasAgent ? { isAlert: false, text: t.nav.watching } : null
}

/** The tab says what waits without opening it: `(3) Today · Fewmail`. */
const useDocumentTitle = ({
  count,
  mailboxes,
}: {
  count?: number
  mailboxes?: { lastSyncedAt: Date | null; syncError: string | null }[]
}) => {
  const t = useT()
  const status = useAccountStatus(mailboxes)
  const pathname = useRouterState({
    select: ({ location }) => location.pathname,
  })
  const { data: boards } = useQuery(
    orpc.boards.list.queryOptions({ enabled: pathname.startsWith('/boards/') })
  )
  const page = NAV_ITEMS.find(({ to }) => pathname.startsWith(to))?.key ?? null
  const board = boards?.find(({ id }) => pathname === `/boards/${id}`)
  const title = [
    count ? `(${count})` : '',
    [
      board?.name ?? (page && t.nav[page]),
      status?.isTitled && status.text,
      SITE_NAME,
    ]
      .filter(Boolean)
      .join(' · '),
  ]
    .filter(Boolean)
    .join(' ')

  useEffect(() => {
    document.title = title
  }, [title])
}

const AccountMenu = ({
  email,
  mailboxes,
}: {
  email: string
  mailboxes?: { lastSyncedAt: Date | null; syncError: string | null }[]
}) => {
  const t = useT()
  const navigate = useNavigate()
  const { plan } = useMe()
  const theme = useTheme()
  const status = useAccountStatus(mailboxes)

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className={`${NAV_ROW} ps-1`}>
        <Avatar size="sm">
          <AvatarFallback data-mask>{email[0]?.toUpperCase()}</AvatarFallback>
          {status?.isAlert && <AvatarBadge />}
        </Avatar>
        <span className="flex-1 truncate text-left" data-mask>
          {email}
        </span>
        <HugeiconsIcon icon={UnfoldMoreIcon} strokeWidth={2} />
      </DropdownMenuTrigger>
      <DropdownMenuContent side="top">
        <DropdownMenuGroup>
          <DropdownMenuLabel>
            <span className="text-foreground block truncate" data-mask>
              {email}
            </span>
            {status && <span className="block">{status.text}</span>}
          </DropdownMenuLabel>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        {(plan.kind === 'free' || Boolean(plan.trialDaysLeft)) && (
          <DropdownMenuItem onClick={() => navigate({ to: '/settings' })}>
            <HugeiconsIcon icon={CrownIcon} strokeWidth={2} />
            {t.command.upgrade}
          </DropdownMenuItem>
        )}
        <DropdownMenuSub>
          <DropdownMenuSubTrigger>
            <HugeiconsIcon icon={THEME_ICONS[theme]} strokeWidth={2} />
            {t.command.appearance}
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent>
            <DropdownMenuRadioGroup
              value={theme}
              onValueChange={(value: Theme) => themeStore.set(value)}
            >
              {(['light', 'dark', 'system'] as const).map((option) => (
                <DropdownMenuRadioItem key={option} value={option}>
                  {t.command.theme[option]}
                </DropdownMenuRadioItem>
              ))}
            </DropdownMenuRadioGroup>
          </DropdownMenuSubContent>
        </DropdownMenuSub>
        <DropdownMenuSeparator />
        <DropdownMenuItem variant="destructive" onClick={signOut}>
          <HugeiconsIcon icon={Logout01Icon} strokeWidth={2} />
          {t.settings.signOut}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
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
  const { openCompose } = useCompose()
  const { data: queued } = useQuery(
    orpc.today.count.queryOptions({ enabled: hasAgent })
  )
  const navItems = useVisibleNavItems()
  const { data: mailboxes } = useQuery(
    orpc.mailboxes.list.queryOptions({ enabled: hasAgent })
  )
  const { data: unread } = useQuery(
    orpc.mail.unread.queryOptions({ input: {} })
  )
  useDocumentTitle({
    count: hasAgent ? queued : unread?.inbox,
    mailboxes,
  })

  return (
    <nav
      aria-label="Main"
      className="flex w-full flex-col gap-1 border-r px-3.5 py-5"
    >
      <div className="px-2.5 pb-4">
        <Logo to={hasAgent ? '/today' : '/mail'} />
      </div>
      <div className="mb-3 flex items-center gap-1.5">
        <Tooltip shortcut={<Kbd>⌘K</Kbd>}>
          <TooltipTrigger
            render={
              <Button
                variant="outline-muted"
                className="min-w-0 flex-1 justify-start"
                onClick={onSearch}
              />
            }
          >
            <HugeiconsIcon
              icon={Search01Icon}
              strokeWidth={2}
              data-icon="inline-start"
            />
            <span className="truncate">{t.nav.search}</span>
          </TooltipTrigger>
          <TooltipContent>{t.nav.search}</TooltipContent>
        </Tooltip>
        <IconButton
          icon={PencilEdit02Icon}
          label={t.command.compose}
          shortcut={<Kbd>C</Kbd>}
          size="icon"
          variant="outline-muted"
          onClick={() => openCompose()}
        />
      </div>
      {navItems.map((item) => (
        <NavLink
          key={item.to}
          item={item}
          showKeys={isModifierHeld}
          badge={item.to === '/today' ? queued : undefined}
          count={item.to === '/mail' ? unread?.inbox : undefined}
        />
      ))}
      <div className="-mx-1 flex min-h-0 flex-1 flex-col overflow-y-auto px-1 pb-3">
        <Boards showKeys={isModifierHeld} />
        <Folders />
      </div>
      <AccountMenu email={email} mailboxes={mailboxes} />
    </nav>
  )
}
