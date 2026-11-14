import { usedPercent } from '@fewmail/shared/agent'
import {
  Avatar,
  AvatarBadge,
  AvatarFallback,
} from '@fewmail/ui/components/avatar'
import { Button } from '@fewmail/ui/components/button'
import { MotionCollapse } from '@fewmail/ui/components/collapse.motion'
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
  DropdownMenuShortcut,
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
import { cn } from '@fewmail/ui/lib/utils'
import type { Theme } from '@fewmail/ui/theme-store'
import { themeStore, useTheme } from '@fewmail/ui/theme-store'
import {
  Add01Icon,
  Archive02Icon,
  ArrowDown01Icon,
  ArrowRight01Icon,
  ArrowUp01Icon,
  Calendar03Icon,
  Clock01Icon,
  ComputerIcon,
  CrownIcon,
  DashboardSquare01Icon,
  Delete02Icon,
  Edit02Icon,
  FileEditIcon,
  Home01Icon,
  Logout01Icon,
  Mail01Icon,
  MailRemove01Icon,
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
import {
  Link,
  useNavigate,
  useRouterState,
  useSearch,
} from '@tanstack/react-router'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { Fragment, useEffect, useState } from 'react'

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

const SETTINGS_ITEM = {
  icon: Settings01Icon,
  key: 'settings',
  place: 'account',
  sequence: ['G', 'S'],
  to: '/settings',
} as const

/** `place` is where the sidebar shows it: daily places on top, set-up tools at the bottom, Settings in the account menu. */
export const NAV_ITEMS = [
  {
    icon: Home01Icon,
    key: 'home',
    place: 'top',
    sequence: ['G', 'H'],
    to: '/home',
  },
  {
    icon: Mail01Icon,
    key: 'mail',
    place: 'top',
    sequence: ['G', 'M'],
    to: '/mail',
  },
  {
    icon: Calendar03Icon,
    key: 'calendar',
    place: 'top',
    sequence: ['G', 'L'],
    to: '/calendar',
  },
  {
    icon: ZapIcon,
    key: 'rules',
    place: 'bottom',
    sequence: ['G', 'R'],
    to: '/rules',
  },
  {
    icon: MailRemove01Icon,
    key: 'subscriptions',
    place: 'bottom',
    sequence: ['G', 'U'],
    to: '/subscriptions',
  },
  SETTINGS_ITEM,
] as const

export const useGoTo = () => {
  const navigate = useNavigate()
  return (item: (typeof NAV_ITEMS)[number]) => navigate({ to: item.to })
}

/** Quiet until the month is nearly spent: never push. */
const USAGE_SHOWN_FROM = 90

const NAV_ROW =
  'text-foreground/75 hover:bg-accent data-[status=active]:bg-secondary data-[status=active]:text-foreground focus-visible:focus-ring flex h-8 shrink-0 cursor-pointer items-center gap-2 rounded-lg px-2.5 text-sm outline-none [&>svg]:size-4 [&>svg]:shrink-0 [&>svg]:opacity-70 data-[status=active]:font-medium'

const NAV_SUBROW = cn(NAV_ROW, 'h-7')

/** Mail's row stays plain while a folder or label under it is the one open. */
const QUIET_ROW =
  'data-[status=active]:bg-transparent data-[status=active]:font-normal'

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
      <div className="flex items-center justify-between ps-2.5">
        <h2 className="text-muted-foreground text-xs font-medium">
          {t.nav.boards}
        </h2>
        <IconButton
          icon={Add01Icon}
          label={t.nav.newBoard}
          size="icon-xs"
          variant="ghost-muted"
          onClick={() => withAgent('boards', () => newBoardStore.set(true))}
        />
      </div>
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
    </section>
  )
}

export const FOLDER_ITEMS = [
  { filter: 'snoozed', icon: Clock01Icon },
  { filter: 'drafts', icon: FileEditIcon },
  { filter: 'archive', icon: Archive02Icon },
  { filter: 'spam', icon: SpamIcon },
  { filter: 'trash', icon: Delete02Icon },
] as const

const LABELS_SHOWN = 5

interface LabelNode {
  children: LabelNode[]
  name: string
  query: string
  title: string
}

/** Gmail nests `Grok/GCP-seen` under `Grok`; a child whose parent is missing stays at the top under its full name. */
const toLabelTree = (labels: { name: string; query: string }[]) => {
  const nodes = new Map<string, LabelNode>(
    labels.map((label) => [
      label.name,
      { ...label, children: [], title: label.name },
    ])
  )
  const roots: LabelNode[] = []
  for (const node of nodes.values()) {
    const cut = node.name.lastIndexOf('/')
    const parent = nodes.get(node.name.slice(0, cut))
    if (cut > 0 && parent) {
      node.title = node.name.slice(cut + 1)
      parent.children.push(node)
    } else {
      roots.push(node)
    }
  }
  return roots
}

const LabelRow = ({ label }: { label: LabelNode }) => {
  const t = useT()
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      <div className="relative flex flex-col">
        <Link
          to="/mail"
          search={{ q: label.query }}
          className={cn(NAV_SUBROW, label.children.length > 0 && 'pe-8')}
        >
          <HugeiconsIcon icon={Tag01Icon} strokeWidth={2} />
          <span className="flex-1 truncate" data-mask>
            {label.title}
          </span>
        </Link>
        {label.children.length > 0 && (
          <IconButton
            icon={isOpen ? ArrowDown01Icon : ArrowRight01Icon}
            label={
              isOpen ? t.mail.showFewer : t.mail.showAll(label.children.length)
            }
            aria-expanded={isOpen}
            size="icon-xs"
            variant="ghost-muted"
            className="absolute inset-e-0.5 top-0.5"
            onClick={() => setIsOpen(!isOpen)}
          />
        )}
      </div>
      <AnimatePresence initial={false}>
        {isOpen && (
          <MotionCollapse key="children">
            <div className="ms-4.5 flex flex-col gap-0.5 border-s ps-1.5">
              {label.children.map((child) => (
                <LabelRow key={child.name} label={child} />
              ))}
            </div>
          </MotionCollapse>
        )}
      </AnimatePresence>
    </>
  )
}

/** Gmail's folders, then the user's own labels, each opening the Mail search for it: a branch of Mail, open while Mail is. */
const MailFolders = () => {
  const t = useT()
  const [isShowingAll, setIsShowingAll] = useState(false)
  const { data: labels = [] } = useQuery(orpc.mail.labels.queryOptions())
  const tree = toLabelTree(labels)

  return (
    <section
      aria-label={t.nav.folders}
      className="my-0.5 ms-4.5 flex flex-col gap-0.5 border-s ps-1.5"
    >
      {FOLDER_ITEMS.map(({ filter, icon }) => (
        <Link
          key={filter}
          to="/mail"
          search={{ filter }}
          className={NAV_SUBROW}
        >
          <HugeiconsIcon icon={icon} strokeWidth={2} />
          <span className="flex-1">{t.mail.filter[filter]}</span>
        </Link>
      ))}
      {labels.length > 0 && (
        <h2 className="text-muted-foreground px-2.5 pt-2 pb-0.5 text-xs font-medium">
          {t.nav.labels}
        </h2>
      )}
      {(isShowingAll ? tree : tree.slice(0, LABELS_SHOWN)).map((label) => (
        <LabelRow key={label.name} label={label} />
      ))}
      {tree.length > LABELS_SHOWN && (
        <button
          type="button"
          className={NAV_SUBROW}
          onClick={() => setIsShowingAll(!isShowingAll)}
        >
          <HugeiconsIcon
            icon={isShowingAll ? ArrowUp01Icon : ArrowDown01Icon}
            strokeWidth={2}
          />
          <span className="text-muted-foreground">
            {isShowingAll ? t.mail.showFewer : t.mail.showAll(tree.length)}
          </span>
        </button>
      )}
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
  className,
  item,
  count,
  showKeys,
}: {
  className?: string
  count?: number
  item: (typeof NAV_ITEMS)[number]
  showKeys: boolean
}) => {
  const t = useT()
  const goTo = useGoTo()
  useHotkey(item.sequence, () => goTo(item))

  return (
    <Link to={item.to} className={cn(NAV_ROW, className)}>
      <HugeiconsIcon icon={item.icon} strokeWidth={2} />
      <span className="flex-1">{t.nav[item.key]}</span>
      {showKeys && <Kbd>{item.sequence.join(' ')}</Kbd>}
      {!showKeys && Boolean(count) && (
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

interface MailboxSync {
  email: string
  lastSyncedAt: Date | null
  signIn: boolean
  syncError: string | null
}

/** The account's state in one line, flagged when the user should act on it. */
const useAccountStatus = (mailboxes?: MailboxSync[]) => {
  const t = useT()
  const { plan, usage } = useMe()
  const hasAgent = useHasAgent()
  const percent = plan.kind === 'free' ? 0 : usedPercent(plan.kind, usage.spent)
  const failed = mailboxes?.find(({ syncError }) => syncError)
  const reading = mailboxes?.find(({ lastSyncedAt }) => !lastSyncedAt)

  if (hasAgent && failed) {
    return {
      isAlert: true,
      isTitled: true,
      label: failed.signIn ? undefined : t.nav.syncFailedIn(failed.email),
      text: t.nav.syncFailed,
    }
  }
  if (hasAgent && (!mailboxes?.length || reading)) {
    return {
      isAlert: false,
      isTitled: true,
      label:
        reading && !reading.signIn ? t.nav.syncingIn(reading.email) : undefined,
      text: t.nav.syncing,
    }
  }
  if (percent >= USAGE_SHOWN_FROM) {
    return { isAlert: true, isTitled: true, text: t.nav.usage(percent) }
  }
  if (plan.trialDaysLeft) {
    return { isAlert: false, text: t.nav.trialLeft(plan.trialDaysLeft) }
  }
  return hasAgent ? { isAlert: false, text: t.nav.watching } : null
}

/** The tab says what waits without opening it: `(3) Home · Fewmail`. */
const useDocumentTitle = ({
  count,
  mailboxes,
}: {
  count?: number
  mailboxes?: MailboxSync[]
}) => {
  const t = useT()
  const status = useAccountStatus(mailboxes)
  const pathname = useRouterState({
    select: ({ location }) => location.pathname,
  })
  const { data: boards } = useQuery(
    orpc.boards.list.queryOptions({ enabled: pathname.startsWith('/boards/') })
  )
  const navPage = NAV_ITEMS.find(({ to }) => pathname.startsWith(to))?.key
  const page = navPage
    ? t.nav[navPage]
    : (
        [
          ['/compose', t.command.compose],
          ['/settings', t.nav.settings],
          ['/wrapped', t.wrapped.title.year],
        ] as const
      ).find(([to]) => pathname.startsWith(to))?.[1]
  const board = boards?.find(({ id }) => pathname === `/boards/${id}`)
  const title = [
    count ? `(${count})` : '',
    [board?.name ?? page, status?.isTitled && status.text, SITE_NAME]
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
  mailboxes?: MailboxSync[]
}) => {
  const t = useT()
  const navigate = useNavigate()
  const goTo = useGoTo()
  const { plan } = useMe()
  const theme = useTheme()
  const status = useAccountStatus(mailboxes)
  useHotkey(SETTINGS_ITEM.sequence, () => goTo(SETTINGS_ITEM))

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className={`${NAV_ROW} ps-1`}>
        <Avatar size="sm">
          <AvatarFallback data-mask>{email[0]?.toUpperCase()}</AvatarFallback>
          {status?.isAlert && <AvatarBadge />}
        </Avatar>
        <span className="flex-1 truncate text-left" data-mask>
          {email.split('@')[0]}
        </span>
        <HugeiconsIcon icon={UnfoldMoreIcon} strokeWidth={2} />
      </DropdownMenuTrigger>
      <DropdownMenuContent side="top">
        <DropdownMenuGroup>
          <DropdownMenuLabel>
            <span className="text-foreground block truncate" data-mask>
              {email}
            </span>
            {status && (
              <span className="block" data-mask>
                {status.label ?? status.text}
              </span>
            )}
          </DropdownMenuLabel>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => goTo(SETTINGS_ITEM)}>
          <HugeiconsIcon icon={SETTINGS_ITEM.icon} strokeWidth={2} />
          {t.nav.settings}
          <DropdownMenuShortcut>
            {SETTINGS_ITEM.sequence.join(' ')}
          </DropdownMenuShortcut>
        </DropdownMenuItem>
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
  const pathname = useRouterState({
    select: ({ location }) => location.pathname,
  })
  const { filter, q } = useSearch({ strict: false })
  const isOnMail = pathname.startsWith('/mail')
  const isInFolder =
    FOLDER_ITEMS.some((item) => item.filter === filter) ||
    Boolean(q?.startsWith('label:'))
  const { data: queued } = useQuery(orpc.today.count.queryOptions())
  const { data: mailboxes } = useQuery(
    orpc.mailboxes.list.queryOptions({ enabled: hasAgent })
  )
  const { data: unread } = useQuery(
    orpc.mail.unread.queryOptions({ input: {} })
  )
  const counts: Partial<Record<(typeof NAV_ITEMS)[number]['to'], number>> = {
    '/home': queued,
    '/mail': unread?.inbox,
  }
  useDocumentTitle({
    count: queued,
    mailboxes,
  })

  return (
    <nav
      aria-label="Main"
      className="flex w-full flex-col gap-1 border-r px-3.5 py-5"
    >
      <div className="px-2.5 pb-4">
        <Logo to="/home" />
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
      <div className="scroll-fade -mx-1 flex min-h-0 flex-1 scrollbar-none flex-col gap-1 overflow-y-auto px-1 pb-3">
        {NAV_ITEMS.filter(({ place }) => place === 'top').map((item) => (
          <Fragment key={item.to}>
            <NavLink
              item={item}
              showKeys={isModifierHeld}
              count={counts[item.to]}
              className={
                item.key === 'mail' && isInFolder ? QUIET_ROW : undefined
              }
            />
            {item.key === 'mail' && (
              <AnimatePresence initial={false}>
                {isOnMail && (
                  <MotionCollapse key="folders">
                    <MailFolders />
                  </MotionCollapse>
                )}
              </AnimatePresence>
            )}
          </Fragment>
        ))}
        <Boards showKeys={isModifierHeld} />
        <div className="mt-auto flex flex-col gap-1 pt-4">
          {NAV_ITEMS.filter(({ place }) => place === 'bottom').map((item) => (
            <NavLink key={item.to} item={item} showKeys={isModifierHeld} />
          ))}
        </div>
      </div>
      <AccountMenu email={email} mailboxes={mailboxes} />
    </nav>
  )
}
