import { usedPercent } from '@fewmail/shared/agent'
import { matchesContact } from '@fewmail/shared/email'
import {
  Avatar,
  AvatarBadge,
  AvatarFallback,
} from '@fewmail/ui/components/avatar'
import { MotionCollapse } from '@fewmail/ui/components/collapse.motion'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@fewmail/ui/components/collapsible'
import { IconButton } from '@fewmail/ui/components/custom/icon-button'
import { SearchInput } from '@fewmail/ui/components/custom/search-input'
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
import { Sheet, SheetContent } from '@fewmail/ui/components/sheet'
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
  Delete02Icon,
  FileEditIcon,
  GiftIcon,
  Home01Icon,
  Logout01Icon,
  Mail01Icon,
  MailRemove01Icon,
  News01Icon,
  Menu01Icon,
  Moon02Icon,
  PanelLeftCloseIcon,
  PanelLeftOpenIcon,
  PencilEdit02Icon,
  SentIcon,
  Settings01Icon,
  SpamIcon,
  Sun03Icon,
  Tag01Icon,
  UnfoldMoreIcon,
  UserRemove01Icon,
} from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { useHotkey } from '@tanstack/react-hotkeys'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  Link,
  useNavigate,
  useRouterState,
  useSearch,
} from '@tanstack/react-router'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { Fragment, lazy, Suspense, useEffect, useState } from 'react'

import { signOut } from '~/lib/auth'
import { useT } from '~/lib/i18n'
import { contacts, mailboxes as mailboxRows } from '~/lib/lists-db'
import { useHasAgent, useMe } from '~/lib/me'
import { client, orpc } from '~/lib/orpc'
import { showUntilSettled, useRanked } from '~/lib/query-client'
import type { Settle } from '~/lib/query-client'
import { SITE_NAME } from '~/lib/seo'
import { toastDeferred } from '~/lib/undo'

import { BotFolderRow, BotListRow, openBotIdOf, useBots } from './bot-list'
import type { HomeBot } from './bot-list'
import { useCompose } from './compose/compose-context'
import { Logo } from './logo'
import { SenderAvatar } from './sender-avatar'
import { FADES_IN_RAIL, GUIDE_IN_RAIL, RailTip } from './sidebar-rail'

const SETTINGS_ITEM = {
  icon: Settings01Icon,
  key: 'settings',
  place: 'account',
  sequence: ['G', 'S'],
  to: '/settings',
} as const

/** `place` is where the sidebar shows it: a row of its own, or Settings in the account menu. */
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
    icon: News01Icon,
    key: 'reading',
    place: 'top',
    sequence: ['G', 'N'],
    to: '/reading',
  },
  {
    icon: Calendar03Icon,
    key: 'calendar',
    place: 'top',
    sequence: ['G', 'L'],
    to: '/calendar',
  },
  {
    icon: MailRemove01Icon,
    key: 'subscriptions',
    place: 'top',
    sequence: ['G', 'U'],
    to: '/subscriptions',
  },
  {
    icon: GiftIcon,
    key: 'wrapped',
    place: 'top',
    sequence: ['G', 'W'],
    to: '/wrapped',
  },
  SETTINGS_ITEM,
] as const

/** Google's consent screen lets the user untick Calendar; without any calendar its page is gone everywhere, `G L` included. */
const useNavItems = () => {
  const { hasCalendar } = useMe()
  return NAV_ITEMS.filter(({ key }) => key !== 'calendar' || hasCalendar)
}

const useGoTo = () => {
  const navigate = useNavigate()
  return (item: (typeof NAV_ITEMS)[number]) => navigate({ to: item.to })
}

/** Quiet until the month is nearly spent: never push. */
const USAGE_SHOWN_FROM = 90

// Collapsed, the row is as wide as the rail's 36px: every icon keeps its place, so the rows narrow under it while the sidebar folds.
const NAV_ROW =
  'text-foreground/75 hover:bg-accent data-[status=active]:bg-secondary data-[status=active]:text-foreground focus-visible:focus-ring flex h-8 shrink-0 cursor-pointer items-center gap-2 overflow-hidden rounded-lg px-2.5 text-sm whitespace-nowrap outline-none [&>svg]:size-4 [&>svg]:shrink-0 [&>svg]:opacity-70 data-[status=active]:font-medium'

const NAV_SUBROW = cn(NAV_ROW, 'h-7')

/** Mail's row stays plain while a folder or label under it is the one open. */
const QUIET_ROW =
  'data-[status=active]:bg-transparent data-[status=active]:font-normal'

const PEOPLE_SHOWN = 20

/** Everyone the user can write to, the most written-to first; folded until opened, and a row's menu writes to them, shows their mail or deletes their saved Google contact. */
const People = () => {
  const t = useT()
  const { openCompose } = useCompose()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [query, setQuery] = useState('')
  const { data: people = [] } = useRanked(contacts)
  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: orpc.contacts.key() })
  const remove = useMutation({
    ...orpc.contacts.delete.mutationOptions(),
    mutationFn: ({ email }: { email: string; settle: Settle }) =>
      client.contacts.delete({ email }),
    onSettled: (_, __, { settle }) => settle(invalidate()),
  })
  if (people.length === 0) {
    return null
  }
  const found = query
    ? people.filter((person) => matchesContact(person, query))
    : people
  const deletePerson = (email: string) => {
    const settle = showUntilSettled(() => {
      if (contacts.has(email)) {
        contacts.update(email, (person) => {
          person.deletable = false
        })
      }
    })
    toastDeferred(t.nav.contactDeleted, {
      commit: () => remove.mutate({ email, settle }),
      hide: () => null,
      undo: () => settle(invalidate()),
    })
  }

  return (
    <Collapsible
      render={<section aria-label={t.nav.people} />}
      className="mt-4"
    >
      <div className="flex flex-col gap-1">
        <h2 className="flex ps-2.5">
          <CollapsibleTrigger variant="disclosure">
            {t.nav.people}
            <HugeiconsIcon icon={ArrowRight01Icon} strokeWidth={2} />
          </CollapsibleTrigger>
        </h2>
        <CollapsibleContent>
          <div className="flex flex-col gap-0.5">
            {people.length > PEOPLE_SHOWN && (
              <SearchInput
                className="mb-1"
                clearLabel={t.nav.clearSearch}
                value={query}
                placeholder={t.nav.findPerson}
                aria-label={t.nav.findPerson}
                data-mask
                onValueChange={setQuery}
                onKeyDown={(event) => {
                  if (event.key !== 'Escape') {
                    return
                  }
                  event.stopPropagation()
                  if (query) {
                    setQuery('')
                  } else {
                    event.currentTarget.blur()
                  }
                }}
              />
            )}
            {found.slice(0, PEOPLE_SHOWN).map((person) => (
              <DropdownMenu key={person.email}>
                <DropdownMenuTrigger className={NAV_SUBROW}>
                  <SenderAvatar
                    sender={{ fromEmail: person.email, fromName: person.name }}
                  />
                  <span className="flex-1 truncate text-left" data-mask>
                    {person.name ?? person.email}
                  </span>
                </DropdownMenuTrigger>
                <DropdownMenuContent side="right" align="start">
                  <DropdownMenuItem
                    onClick={() => openCompose({ to: [person.email] })}
                  >
                    <HugeiconsIcon icon={PencilEdit02Icon} strokeWidth={2} />
                    {t.compose.new}
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() =>
                      navigate({
                        search: {
                          q: `from:${person.email} OR to:${person.email}`,
                        },
                        to: '/mail',
                      })
                    }
                  >
                    <HugeiconsIcon icon={Mail01Icon} strokeWidth={2} />
                    {t.nav.personMail}
                  </DropdownMenuItem>
                  {person.deletable && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        variant="destructive"
                        onClick={() => deletePerson(person.email)}
                      >
                        <HugeiconsIcon
                          icon={UserRemove01Icon}
                          strokeWidth={2}
                        />
                        {t.nav.deleteContact}
                      </DropdownMenuItem>
                    </>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            ))}
            {found.length === 0 && (
              <p className="text-muted-foreground px-2.5 py-1 text-sm">
                {t.mail.noResults}
              </p>
            )}
          </div>
        </CollapsibleContent>
      </div>
    </Collapsible>
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

const FOLDER_ITEMS = [
  { folder: 'snoozed', icon: Clock01Icon },
  { folder: 'sent', icon: SentIcon },
  { folder: 'drafts', icon: FileEditIcon },
  { folder: 'archive', icon: Archive02Icon },
  { folder: 'spam', icon: SpamIcon },
  { folder: 'trash', icon: Delete02Icon },
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

/** Gmail's folders, then the user's own labels, each opening the Mail search for it: a branch of Mail, open while Mail is or a saved draft is being edited. */
const MailFolders = ({ isCollapsed }: { isCollapsed: boolean }) => {
  const t = useT()
  const [isShowingAll, setIsShowingAll] = useState(false)
  const { data: labels = [] } = useQuery(orpc.mail.labels.queryOptions())
  const { data: draftCount } = useQuery(orpc.mail.draftCount.queryOptions())
  const tree = toLabelTree(labels)

  return (
    <section
      aria-label={t.nav.folders}
      className={cn('my-0.5 flex flex-col gap-0.5', GUIDE_IN_RAIL)}
    >
      {FOLDER_ITEMS.map(({ folder, icon }) => (
        <RailTip
          key={folder}
          isCollapsed={isCollapsed}
          label={t.mail.filter[folder]}
        >
          <Link to={`/mail/${folder}`} className={NAV_SUBROW}>
            <HugeiconsIcon icon={icon} strokeWidth={2} />
            <span className={cn('flex-1', FADES_IN_RAIL)}>
              {t.mail.filter[folder]}
            </span>
            {folder === 'drafts' && Boolean(draftCount) && (
              <span
                className={cn(
                  'text-muted-foreground text-xs tabular-nums',
                  FADES_IN_RAIL
                )}
              >
                <RollingCount value={draftCount ?? 0} />
              </span>
            )}
          </Link>
        </RailTip>
      ))}
      <AnimatePresence initial={false}>
        {!isCollapsed && (
          <MotionCollapse key="labels">
            <div className="flex flex-col gap-0.5">
              {labels.length > 0 && (
                <h2 className="text-muted-foreground px-2.5 pt-2 pb-0.5 text-xs font-medium">
                  {t.nav.labels}
                </h2>
              )}
              {(isShowingAll ? tree : tree.slice(0, LABELS_SHOWN)).map(
                (label) => (
                  <LabelRow key={label.name} label={label} />
                )
              )}
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
                    {isShowingAll
                      ? t.mail.showFewer
                      : t.mail.showAll(tree.length)}
                  </span>
                </button>
              )}
            </div>
          </MotionCollapse>
        )}
      </AnimatePresence>
    </section>
  )
}

// The bot chat and its form stay in Home's chunk; the sidebar only borrows the dialog once a bot is being made.
const BotSettingsDialog = lazy(() =>
  import('./bot-form').then((module) => ({
    default: module.BotSettingsDialog,
  }))
)

/** The bots under the places, one nav row each: Home has no row of its own, Fewmail's chat is where it opens. */
const SidebarBots = ({ isCollapsed }: { isCollapsed: boolean }) => {
  const t = useT()
  const navigate = useNavigate()
  const bots = useBots()
  const isOnHome = useRouterState({
    select: ({ location }) => location.pathname === '/home',
  })
  const { bot: picked } = useSearch({ strict: false })
  const [adding, setAdding] = useState<{ bot: null; isOpen: boolean } | null>(
    null
  )
  const openId = isOnHome ? openBotIdOf(bots, picked) : undefined
  const open = (bot: string) =>
    navigate({ search: { bot }, state: { writeToBot: true }, to: '/home' })
  const { data: folders = [] } = useQuery(orpc.bots.folders.queryOptions())
  const pinned = bots.filter(({ pinned: isPinned }) => isPinned)
  const loose = bots.filter((bot) => !pinned.includes(bot))
  const rowOf = (bot: HomeBot) => (
    <BotListRow
      key={bot.bot}
      bot={bot}
      isCollapsed={isCollapsed}
      isOpen={bot.bot === openId}
      onOpen={() => open(bot.bot)}
    />
  )

  return (
    <section aria-label={t.bots.title} className="flex flex-col gap-0.5 pt-4">
      <div
        inert={isCollapsed}
        className={cn(
          'flex items-center justify-between ps-2.5 pb-0.5 whitespace-nowrap',
          FADES_IN_RAIL
        )}
      >
        <h2 className="text-muted-foreground text-xs font-medium">
          {t.bots.title}
        </h2>
        <IconButton
          icon={Add01Icon}
          label={t.bots.add}
          size="icon-xs"
          variant="ghost-muted"
          onClick={() => setAdding({ bot: null, isOpen: true })}
        />
      </div>
      {[...pinned, ...loose.filter(({ folder }) => !folder)].map(rowOf)}
      {folders.map((folder) => {
        const inside = loose.filter((bot) => bot.folder === folder.id)
        return (
          <BotFolderRow
            key={folder.id}
            folder={folder}
            isCollapsed={isCollapsed}
            unread={inside.reduce((sum, { unread }) => sum + unread, 0)}
          >
            {inside.map(rowOf)}
          </BotFolderRow>
        )
      })}
      {adding && (
        <Suspense>
          <BotSettingsDialog
            editing={adding}
            onClose={() =>
              setAdding((current) => current && { ...current, isOpen: false })
            }
            onClosed={() => setAdding(null)}
            onCreated={open}
          />
        </Suspense>
      )}
    </section>
  )
}

const NavLink = ({
  className,
  item,
  count,
  isCollapsed,
  showKeys,
}: {
  className?: string
  count?: number
  isCollapsed: boolean
  item: (typeof NAV_ITEMS)[number]
  showKeys: boolean
}) => {
  const t = useT()
  const goTo = useGoTo()
  useHotkey(item.sequence, () => goTo(item))

  return (
    <RailTip
      isCollapsed={isCollapsed}
      shortcut={<Kbd>{item.sequence.join(' ')}</Kbd>}
      label={
        <>
          {t.nav[item.key]}
          {Boolean(count) && (
            <span className="tabular-nums opacity-60">{count}</span>
          )}
        </>
      }
    >
      <Link to={item.to} className={cn(NAV_ROW, className)}>
        <HugeiconsIcon icon={item.icon} strokeWidth={2} />
        <span className={cn('flex-1', FADES_IN_RAIL)}>{t.nav[item.key]}</span>
        {showKeys && (
          <span className={cn('flex', FADES_IN_RAIL)}>
            <Kbd>{item.sequence.join(' ')}</Kbd>
          </span>
        )}
        {!showKeys && Boolean(count) && (
          <span
            className={cn(
              'text-muted-foreground text-xs tabular-nums',
              FADES_IN_RAIL
            )}
          >
            <RollingCount flash value={count ?? 0} />
          </span>
        )}
      </Link>
    </RailTip>
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
  const navPage = NAV_ITEMS.find(({ to }) => pathname.startsWith(to))?.key
  const page = navPage
    ? t.nav[navPage]
    : (
        [
          ['/compose', t.command.compose],
          ['/settings', t.nav.settings],
        ] as const
      ).find(([to]) => pathname.startsWith(to))?.[1]
  const title = [
    count ? `(${count})` : '',
    [page, status?.isTitled && status.text, SITE_NAME]
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
  isCollapsed,
  mailboxes,
}: {
  email: string
  isCollapsed: boolean
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
      <DropdownMenuTrigger className={`${NAV_ROW} ps-1.5`}>
        <Avatar size="sm">
          <AvatarFallback data-mask>{email[0]?.toUpperCase()}</AvatarFallback>
          {status?.isAlert && <AvatarBadge />}
        </Avatar>
        <span
          className={cn('flex-1 truncate text-left', FADES_IN_RAIL)}
          data-mask
        >
          {email.split('@')[0]}
        </span>
        <HugeiconsIcon
          icon={UnfoldMoreIcon}
          strokeWidth={2}
          className={FADES_IN_RAIL}
        />
      </DropdownMenuTrigger>
      <DropdownMenuContent
        side={isCollapsed ? 'right' : 'top'}
        align={isCollapsed ? 'end' : undefined}
      >
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

/** `onToggleRail` is absent in the phone's sheet, which has no rail. */
export const Sidebar = ({
  email,
  isCollapsed = false,
  onToggleRail,
}: {
  email: string
  isCollapsed?: boolean
  onToggleRail?: () => void
}) => {
  const t = useT()
  const hasAgent = useHasAgent()
  const navItems = useNavItems()
  const isModifierHeld = useModifierHold()
  const navigate = useNavigate()
  const { openCompose } = useCompose()
  useHotkey('C', () => openCompose())
  useHotkey(['G', 'H'], () => navigate({ to: '/home' }))
  useHotkey(['G', 'B'], () =>
    navigate({ search: { bot: 'board' }, to: '/home' })
  )
  const pathname = useRouterState({
    select: ({ location }) => location.pathname,
  })
  const isEditingDraft = useRouterState({
    select: ({ location }) => Boolean(location.state.compose?.gmailDraft),
  })
  const { q } = useSearch({ strict: false })
  const isOnMail = pathname.startsWith('/mail') || isEditingDraft
  const isInFolder =
    FOLDER_ITEMS.some(({ folder }) => pathname === `/mail/${folder}`) ||
    Boolean(q?.startsWith('label:'))
  const { data: queued } = useQuery(orpc.today.count.queryOptions())
  const { data: mailboxes } = useRanked(mailboxRows, hasAgent)
  const { data: unread } = useQuery(
    orpc.mail.unread.queryOptions({ input: {} })
  )
  const counts: Partial<Record<(typeof NAV_ITEMS)[number]['to'], number>> = {
    '/mail': unread?.inbox,
  }
  useDocumentTitle({
    count: queued,
    mailboxes,
  })

  return (
    <nav
      aria-label="Main"
      data-collapsed={isCollapsed || undefined}
      className="group/sidebar flex w-full min-w-0 flex-col gap-1 overflow-clip border-r px-3.5 py-5"
    >
      {/* The Mac app's traffic lights sit here, and the window is dragged by it. */}
      <div
        className="traffic-lights:block hidden h-6 shrink-0"
        data-tauri-drag-region
      />
      {/* The bird sits centred over the rail, so the logo's start padding narrows with it. */}
      <div className="ease-house relative flex items-center gap-0.5 ps-2.5 pb-3 transition-[padding] duration-250 group-data-collapsed/sidebar:ps-1.75">
        <Logo to="/mail" isMarkOnly={isCollapsed} />
        <div
          inert={isCollapsed}
          className={cn('ms-auto flex shrink-0 gap-0.5', FADES_IN_RAIL)}
        >
          {onToggleRail && (
            <IconButton
              icon={PanelLeftCloseIcon}
              label={t.nav.collapseSidebar}
              shortcut={<Kbd>⌘B</Kbd>}
              size="icon-sm"
              variant="ghost-muted"
              onClick={onToggleRail}
            />
          )}
          <IconButton
            icon={PencilEdit02Icon}
            label={t.command.compose}
            shortcut={<Kbd>C</Kbd>}
            size="icon-sm"
            variant="ghost-muted"
            onClick={() => openCompose()}
          />
        </div>
        {isCollapsed && (
          <RailTip
            isCollapsed
            label={t.nav.expandSidebar}
            shortcut={<Kbd>⌘B</Kbd>}
          >
            <button
              type="button"
              aria-label={t.nav.expandSidebar}
              className="bg-body hover:bg-accent text-foreground/75 focus-visible:focus-ring absolute inset-s-0 top-0 grid size-8 cursor-pointer place-items-center rounded-lg opacity-0 outline-none hover:opacity-100 focus-visible:opacity-100"
              onClick={onToggleRail}
            >
              <HugeiconsIcon
                icon={PanelLeftOpenIcon}
                strokeWidth={2}
                className="size-4"
              />
            </button>
          </RailTip>
        )}
      </div>
      <AnimatePresence initial={false}>
        {isCollapsed && (
          <MotionCollapse key="compose">
            <RailTip
              isCollapsed
              label={t.command.compose}
              shortcut={<Kbd>C</Kbd>}
            >
              <button
                type="button"
                aria-label={t.command.compose}
                className={cn(NAV_ROW, 'mb-3 w-full')}
                onClick={() => openCompose()}
              >
                <HugeiconsIcon icon={PencilEdit02Icon} strokeWidth={2} />
              </button>
            </RailTip>
          </MotionCollapse>
        )}
      </AnimatePresence>
      <div className="scroll-fade -mx-1 -mt-1 flex min-h-0 flex-1 scrollbar-none flex-col gap-1 overflow-y-auto px-1 pt-1 pb-3">
        {navItems
          .filter(({ key, place }) => place === 'top' && key !== 'home')
          .map((item) => (
            <Fragment key={item.to}>
              <NavLink
                item={item}
                isCollapsed={isCollapsed}
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
                      <MailFolders isCollapsed={isCollapsed} />
                    </MotionCollapse>
                  )}
                </AnimatePresence>
              )}
            </Fragment>
          ))}
        <SidebarBots isCollapsed={isCollapsed} />
        <AnimatePresence initial={false}>
          {!isCollapsed && (
            <MotionCollapse key="people">
              <People />
            </MotionCollapse>
          )}
        </AnimatePresence>
      </div>
      <AccountMenu
        email={email}
        isCollapsed={isCollapsed}
        mailboxes={mailboxes}
      />
    </nav>
  )
}

/** Below `md` the sidebar lives in a sheet behind a top bar; any navigation closes it. */
export const MobileBar = ({ email }: { email: string }) => {
  const t = useT()
  const { openCompose } = useCompose()
  const [isOpen, setIsOpen] = useState(false)
  const href = useRouterState({ select: ({ location }) => location.href })
  const [openedOn, setOpenedOn] = useState(href)
  if (openedOn !== href) {
    setOpenedOn(href)
    setIsOpen(false)
  }
  return (
    <header className="flex items-center gap-1 border-b px-2 py-2">
      <IconButton
        icon={Menu01Icon}
        label={t.nav.menu}
        size="icon"
        variant="ghost-muted"
        onClick={() => setIsOpen(true)}
      />
      <Logo to="/mail" />
      <IconButton
        icon={PencilEdit02Icon}
        label={t.command.compose}
        size="icon"
        variant="ghost-muted"
        className="ml-auto"
        onClick={() => openCompose()}
      />
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetContent aria-label={t.nav.menu} showCloseButton={false}>
          <Sidebar email={email} />
        </SheetContent>
      </Sheet>
    </header>
  )
}
