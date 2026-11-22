import type { RouterOutputs } from '@fewmail/api/router'
import {
  BOARD_EFFECT,
  BOT_FOLDER_NAME_CHARS,
  BOT_FOLDERS_MAX,
} from '@fewmail/shared/agent'
import type { Messages } from '@fewmail/shared/i18n'
import { MotionCollapse } from '@fewmail/ui/components/collapse.motion'
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuTrigger,
} from '@fewmail/ui/components/context-menu'
import { IconButton } from '@fewmail/ui/components/custom/icon-button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from '@fewmail/ui/components/dropdown-menu'
import { cn } from '@fewmail/ui/lib/utils'
import {
  Delete02Icon,
  Eraser01Icon,
  Folder01Icon,
  FolderAddIcon,
  FolderOpenIcon,
  MoreHorizontalIcon,
  PencilEdit01Icon,
  PinIcon,
  PinOffIcon,
} from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { useMutation, useQuery } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import { AnimatePresence } from 'motion/react'
import { useState } from 'react'
import type { ReactNode } from 'react'
import { toast } from 'sonner'

import { askName, confirm } from '~/components/confirm-dialog'
import { LogoMark } from '~/components/logo'
import { RowTime } from '~/components/mail-meta'
import {
  FADES_IN_RAIL,
  GUIDE_IN_RAIL,
  RailTip,
} from '~/components/sidebar-rail'
import { botChats, ownBots } from '~/lib/home-db'
import { useDates, useT } from '~/lib/i18n'
import { orpc } from '~/lib/orpc'
import { queryClient, showUntilSettled, useRanked } from '~/lib/query-client'

export type OwnBot = RouterOutputs['bots']['list'][number]
type Chat = RouterOutputs['bots']['chats'][number]
type Entry = NonNullable<Chat['last']>
type Card = Extract<Entry, { type: 'cards' }>['cards'][number]

/** What a card burst says in its bot's words: what waits, what was done, by whom. */
export const cardsLine = (t: Messages, cards: Card[]) => {
  const count = (status: Card['action']['status']) =>
    cards.filter(({ action }) => action.status === status).length
  return [
    count('pending') > 0 && t.bots.cards.pending(count('pending')),
    count('auto_done') > 0 && t.bots.cards.autoDone(count('auto_done')),
    count('done') > 0 && t.bots.cards.done(count('done')),
    count('dismissed') > 0 && t.bots.cards.dismissed(count('dismissed')),
    count('failed') > 0 && t.bots.cards.failed(count('failed')),
  ]
    .filter(Boolean)
    .join(' ')
}

export const digestHeadline = (t: Messages, decisions: number) =>
  decisions === 0 ? t.today.allDone : t.today.headline(decisions)

/** A bot's latest message in one line, as a messenger's list shows it under the chat's name. */
const lastLineOf = (t: Messages, entry: Entry) => {
  if (entry.type === 'cards') {
    return cardsLine(t, entry.cards)
  }
  if (entry.type === 'promises') {
    return t.bots.promises(entry.promises.length)
  }
  if (entry.type === 'digest') {
    return entry.counts
      ? digestHeadline(t, entry.counts.decisions)
      : cardsLine(t, entry.cards)
  }
  if (entry.kind === 'no_plan') {
    return t.bots.noPlan
  }
  const text = (entry.text ?? '').replaceAll('**', '')
  return entry.kind === 'message' ? `${t.bots.you}: ${text}` : text
}

/** Until when a bot of the user's takes no mail; null while it works. */
export const pausedUntilOf = (bot: Pick<HomeBot, 'own'>) =>
  bot.own?.pausedUntil && bot.own.pausedUntil > new Date()
    ? bot.own.pausedUntil
    : null

export interface HomeBot extends Chat {
  job: string
  name: string
  own: OwnBot | null
}

export const ownName = (bot: OwnBot) => bot.name ?? ''

/** Fewmail, then the user's bots newest first, each with its name and what it looks after. */
export const useBots = (): HomeBot[] => {
  const t = useT()
  const { data: chats = [] } = useRanked(botChats)
  const { data: own = [] } = useRanked(ownBots)
  return chats.flatMap((chat): HomeBot[] => {
    if (chat.bot === 'fewmail') {
      return [
        { ...chat, job: t.bots.fewmailJob, name: t.bots.fewmail, own: null },
      ]
    }
    const bot = own.find(({ id }) => id === chat.bot)
    return bot
      ? [
          {
            ...chat,
            job:
              bot.instruction ??
              (bot.match
                ? t.bots.simple.title[bot.match.field](bot.match.value)
                : t.bots.effect[bot.effect]),
            name: ownName(bot),
            own: bot,
          },
        ]
      : []
  })
}

/** Fewmail is the bird, a bot of the user's its first letter. */
export const BotAvatar = ({
  bot,
  size = 'sm',
}: {
  bot: Pick<HomeBot, 'bot' | 'name'>
  size?: 'xs' | 'sm' | 'md' | 'lg'
}) => (
  <span
    aria-hidden
    className={cn(
      'bg-popover ring-foreground/8 text-foreground/80 grid shrink-0 place-items-center rounded-full font-medium ring',
      {
        lg: 'size-14 text-xl [&>svg]:size-7',
        md: 'size-8 text-sm [&>svg]:size-4',
        sm: 'size-6 text-xs [&>svg]:size-4',
        xs: 'size-5 text-[10px] [&>svg]:size-3.5',
      }[size]
    )}
  >
    {bot.bot === 'fewmail' ? <LogoMark /> : bot.name.charAt(0).toUpperCase()}
  </span>
)

const refreshBots = () =>
  queryClient.invalidateQueries({ queryKey: orpc.bots.key() })

/** A change to one chat's row shown at once, kept until the server agrees. */
const changeChat = (
  bot: string,
  change: (row: Pick<HomeBot, 'folder' | 'pinned'>) => void
) =>
  showUntilSettled(() => {
    if (botChats.has(bot)) {
      botChats.update(bot, change)
    }
  })

const useChatActions = (bot: HomeBot, isOpen: boolean) => {
  const t = useT()
  const navigate = useNavigate()
  const pin = useMutation(
    orpc.bots.pin.mutationOptions({
      onMutate: ({ pinned }) =>
        changeChat(bot.bot, (row) => {
          row.pinned = pinned
        }),
      onSettled: (_, __, ___, settle) => settle?.(refreshBots()),
    })
  )
  const move = useMutation(
    orpc.bots.moveToFolder.mutationOptions({
      onMutate: ({ folder }) =>
        changeChat(bot.bot, (row) => {
          row.folder = folder
        }),
      onSettled: (_, __, ___, settle) => settle?.(refreshBots()),
    })
  )
  const createFolder = useMutation(
    orpc.bots.createFolder.mutationOptions({ onSettled: refreshBots })
  )
  const rename = useMutation(
    orpc.bots.update.mutationOptions({
      onMutate: ({ id, name }) =>
        showUntilSettled(() => {
          if (ownBots.has(id)) {
            ownBots.update(id, (row) => {
              row.name = name ?? row.name
            })
          }
        }),
      onSettled: (_, __, ___, settle) => settle?.(refreshBots()),
    })
  )
  const clear = useMutation(
    orpc.bots.clear.mutationOptions({
      onSettled: refreshBots,
      onSuccess: () => toast.success(t.bots.cleared),
    })
  )
  const remove = useMutation(
    orpc.bots.delete.mutationOptions({
      onMutate: ({ id }) => {
        toast.success(t.bots.deleted)
        if (isOpen) {
          void navigate({ search: { bot: 'fewmail' }, to: '/home' })
        }
        return showUntilSettled(() => {
          for (const rows of [ownBots, botChats]) {
            if (rows.has(id)) {
              rows.delete(id)
            }
          }
        })
      },
      onSettled: (_, __, ___, settle) => settle?.(refreshBots()),
    })
  )
  return { clear, createFolder, move, pin, remove, rename }
}

/** What a bot's right click in the sidebar and the ⋯ in its chat's bar offer: one set of items, since a context menu's items are a menu's. */
export const BotMenuItems = ({
  bot,
  isOpen,
}: {
  bot: HomeBot
  isOpen: boolean
}) => {
  const t = useT()
  const { data: folders = [] } = useQuery(orpc.bots.folders.queryOptions())
  const { clear, createFolder, move, pin, remove, rename } = useChatActions(
    bot,
    isOpen
  )
  const { own } = bot
  const isMovable = bot.bot !== 'fewmail'
  return (
    <>
      {isMovable && (
        <>
          <DropdownMenuItem
            onClick={() => pin.mutate({ bot: bot.bot, pinned: !bot.pinned })}
          >
            <HugeiconsIcon
              icon={bot.pinned ? PinOffIcon : PinIcon}
              strokeWidth={2}
            />
            {bot.pinned ? t.bots.unpin : t.bots.pin}
          </DropdownMenuItem>
          <DropdownMenuSub>
            <DropdownMenuSubTrigger>
              <HugeiconsIcon icon={Folder01Icon} strokeWidth={2} />
              {t.bots.moveTo}
            </DropdownMenuSubTrigger>
            <DropdownMenuSubContent>
              <DropdownMenuRadioGroup
                value={bot.folder ?? ''}
                onValueChange={(folder: string) =>
                  move.mutate({ bot: bot.bot, folder: folder || null })
                }
              >
                <DropdownMenuRadioItem value="">
                  {t.bots.noFolder}
                </DropdownMenuRadioItem>
                {folders.map((folder) => (
                  <DropdownMenuRadioItem key={folder.id} value={folder.id}>
                    <span data-mask className="truncate">
                      {folder.name}
                    </span>
                  </DropdownMenuRadioItem>
                ))}
              </DropdownMenuRadioGroup>
              {folders.length < BOT_FOLDERS_MAX && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() =>
                      askName({
                        maxLength: BOT_FOLDER_NAME_CHARS,
                        onSave: (name) =>
                          createFolder.mutate({ bot: bot.bot, name }),
                        title: t.bots.newFolder,
                        value: '',
                      })
                    }
                  >
                    <HugeiconsIcon icon={FolderAddIcon} strokeWidth={2} />
                    {t.bots.newFolder}
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuSubContent>
          </DropdownMenuSub>
        </>
      )}
      {own && (
        <DropdownMenuItem
          onClick={() =>
            askName({
              maxLength: 60,
              onSave: (name) => rename.mutate({ id: own.id, name }),
              title: t.bots.rename,
              value: bot.name,
            })
          }
        >
          <HugeiconsIcon icon={PencilEdit01Icon} strokeWidth={2} />
          {t.bots.rename}
        </DropdownMenuItem>
      )}
      {isMovable && <DropdownMenuSeparator />}
      <DropdownMenuItem
        variant="destructive"
        onClick={() =>
          confirm({
            action: t.bots.clear,
            description: t.bots.clearHint,
            onConfirm: () => clear.mutate({ bot: bot.bot }),
            title: t.bots.clearConfirm(bot.name),
            variant: 'destructive',
          })
        }
      >
        <HugeiconsIcon icon={Eraser01Icon} strokeWidth={2} />
        {t.bots.clear}
      </DropdownMenuItem>
      {own && (
        <DropdownMenuItem
          variant="destructive"
          onClick={() =>
            confirm({
              action: t.bots.delete,
              description: t.bots.deleteHint,
              onConfirm: () => remove.mutate({ id: own.id }),
              title: t.bots.deleteConfirm(bot.name),
              variant: 'destructive',
            })
          }
        >
          <HugeiconsIcon icon={Delete02Icon} strokeWidth={2} />
          {t.bots.delete}
        </DropdownMenuItem>
      )}
    </>
  )
}

/** A folder's sidebar row with its menu: ⋯ on hover at the row's end over its count, and the same items on a right click. */
export const RowWithMenu = ({
  children,
  items,
  label,
}: {
  children: ReactNode
  items: ReactNode
  label: string
}) => (
  <ContextMenu>
    <ContextMenuTrigger render={<div className="group/row relative" />}>
      {children}
      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <IconButton
              icon={MoreHorizontalIcon}
              label={label}
              size="icon-xs"
              variant="ghost-tint-muted"
              className="absolute inset-e-1 top-1/2 -translate-y-1/2 opacity-0 group-hover/row:opacity-100 group-data-collapsed/sidebar:hidden focus-visible:opacity-100 data-popup-open:opacity-100"
            />
          }
        />
        <DropdownMenuContent side="right" align="start">
          {items}
        </DropdownMenuContent>
      </DropdownMenu>
    </ContextMenuTrigger>
    <ContextMenuContent>{items}</ContextMenuContent>
  </ContextMenu>
)

/** One bot in the sidebar, as a messenger lists its chats: its face, its name and when it last wrote, its latest message and how much is new under them. */
export const BotListRow = ({
  bot,
  isCollapsed,
  isOpen,
  onOpen,
}: {
  bot: HomeBot
  isCollapsed: boolean
  isOpen: boolean
  onOpen: () => void
}) => {
  const t = useT()
  const dates = useDates()
  const pausedUntil = pausedUntilOf(bot)
  const line = pausedUntil
    ? t.bots.status.paused(dates.format(pausedUntil, 'd MMM'))
    : bot.last && lastLineOf(t, bot.last)
  return (
    // No ⋯ on a chat row, as in a messenger: over every row it read as one more ellipsis beside the cut preview. Its menu is the right click here and the ⋯ in the chat's bar.
    <ContextMenu>
      <ContextMenuTrigger render={<div />}>
        <RailTip
          isCollapsed={isCollapsed}
          label={
            <>
              <span data-mask={!!bot.own}>{bot.name}</span>
              {bot.unread > 0 && (
                <span className="tabular-nums opacity-60">{bot.unread}</span>
              )}
            </>
          }
        >
          <button
            type="button"
            aria-current={isOpen || undefined}
            aria-label={isCollapsed ? bot.name : undefined}
            onClick={onOpen}
            className="text-foreground/75 hover:bg-accent aria-current:bg-secondary aria-current:text-foreground focus-visible:focus-ring ease-house flex w-full shrink-0 cursor-pointer items-center gap-2.5 overflow-hidden rounded-lg px-2 py-1.5 text-left text-sm transition-[padding] duration-250 outline-none group-data-collapsed/sidebar:px-0.5"
          >
            <span
              className={cn(
                'relative flex shrink-0',
                pausedUntil && 'opacity-60'
              )}
            >
              <BotAvatar bot={bot} size="md" />
              {bot.unread > 0 && (
                <span
                  className={cn(
                    'ring-body absolute inset-e-0 top-0 size-2.5 rounded-full opacity-0 ring-2 transition-opacity duration-200 group-data-collapsed/sidebar:opacity-100',
                    bot.muted ? 'bg-muted-foreground' : 'bg-primary'
                  )}
                />
              )}
            </span>
            <span className={cn('flex min-w-0 flex-1 flex-col', FADES_IN_RAIL)}>
              <span className="flex items-center gap-1.5">
                <span
                  data-mask={!!bot.own}
                  className="text-foreground min-w-0 flex-1 truncate font-medium"
                >
                  {bot.name}
                </span>
                {bot.pinned && bot.bot !== 'fewmail' && (
                  <HugeiconsIcon
                    icon={PinIcon}
                    strokeWidth={2}
                    className="text-muted-foreground size-3 shrink-0"
                  />
                )}
                {bot.last && (
                  <span className="text-muted-foreground text-2xs shrink-0 tabular-nums">
                    <RowTime date={bot.last.at} />
                  </span>
                )}
              </span>
              <span className="flex items-center gap-1.5">
                <span
                  data-mask
                  className="text-muted-foreground min-w-0 flex-1 truncate text-xs"
                >
                  {line ?? bot.job}
                </span>
                {bot.unread > 0 && (
                  <span
                    className={cn(
                      'shrink-0 rounded-full px-1.5 text-xs/4 font-medium tabular-nums',
                      bot.muted
                        ? 'bg-secondary text-muted-foreground'
                        : 'bg-primary text-primary-foreground'
                    )}
                  >
                    {bot.unread}
                  </span>
                )}
              </span>
            </span>
          </button>
        </RailTip>
      </ContextMenuTrigger>
      <ContextMenuContent>
        <BotMenuItems bot={bot} isOpen={isOpen} />
      </ContextMenuContent>
    </ContextMenu>
  )
}

/** A folder of bots: a nav row that folds them, with its rename and delete in the same menu a bot has. */
export const BotFolderRow = ({
  children,
  folder,
  isCollapsed,
  unread,
}: {
  children: ReactNode
  folder: { id: string; name: string }
  isCollapsed: boolean
  unread: number
}) => {
  const t = useT()
  const [isOpen, setIsOpen] = useState(true)
  const rename = useMutation(
    orpc.bots.renameFolder.mutationOptions({ onSettled: refreshBots })
  )
  const remove = useMutation(
    orpc.bots.deleteFolder.mutationOptions({ onSettled: refreshBots })
  )
  return (
    <>
      <RowWithMenu
        label={t.bots.chatMenu}
        items={
          <>
            <DropdownMenuItem
              onClick={() =>
                askName({
                  maxLength: BOT_FOLDER_NAME_CHARS,
                  onSave: (name) => rename.mutate({ id: folder.id, name }),
                  title: t.bots.renameFolder,
                  value: folder.name,
                })
              }
            >
              <HugeiconsIcon icon={PencilEdit01Icon} strokeWidth={2} />
              {t.bots.renameFolder}
            </DropdownMenuItem>
            <DropdownMenuItem
              variant="destructive"
              onClick={() =>
                confirm({
                  action: t.bots.deleteFolder,
                  description: t.bots.deleteFolderHint,
                  onConfirm: () => remove.mutate({ id: folder.id }),
                  title: t.bots.deleteFolderConfirm(folder.name),
                  variant: 'destructive',
                })
              }
            >
              <HugeiconsIcon icon={Delete02Icon} strokeWidth={2} />
              {t.bots.deleteFolder}
            </DropdownMenuItem>
          </>
        }
      >
        <RailTip
          isCollapsed={isCollapsed}
          label={<span data-mask>{folder.name}</span>}
        >
          <button
            type="button"
            aria-expanded={isOpen}
            onClick={() => setIsOpen(!isOpen)}
            className="text-foreground/75 hover:bg-accent focus-visible:focus-ring flex h-8 w-full cursor-pointer items-center gap-2 overflow-hidden rounded-lg px-2.5 text-left text-sm whitespace-nowrap outline-none [&>svg]:size-4 [&>svg]:shrink-0 [&>svg]:opacity-70"
          >
            <HugeiconsIcon
              icon={isOpen ? FolderOpenIcon : Folder01Icon}
              strokeWidth={2}
            />
            <span
              data-mask
              className={cn('min-w-0 flex-1 truncate', FADES_IN_RAIL)}
            >
              {folder.name}
            </span>
            {!isOpen && unread > 0 && (
              <span
                className={cn(
                  'text-muted-foreground text-xs tabular-nums group-hover/row:invisible',
                  FADES_IN_RAIL
                )}
              >
                {unread}
              </span>
            )}
          </button>
        </RailTip>
      </RowWithMenu>
      <AnimatePresence initial={false}>
        {isOpen && (
          <MotionCollapse key="bots">
            <div className={cn('flex flex-col gap-0.5', GUIDE_IN_RAIL)}>
              {children}
            </div>
          </MotionCollapse>
        )}
      </AnimatePresence>
    </>
  )
}

/** The bot that keeps the promises, if the user has one; `?bot=board` (`G B`, the old `/board`) opens it. */
export const boardOf = (bots: HomeBot[]) => bots.find(isBoardBot)

export const isBoardBot = (bot?: Pick<HomeBot, 'own'>) =>
  bot?.own?.effect === BOARD_EFFECT

/** Without one in the address, Home opens the first bot with something new, else Fewmail. */
export const openBotIdOf = (bots: HomeBot[], picked: string | undefined) =>
  (picked === 'board' ? boardOf(bots)?.bot : picked) ??
  bots.find(({ unread }) => unread > 0)?.bot ??
  'fewmail'
