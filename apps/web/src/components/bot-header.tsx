import { needsPurpose } from '@fewmail/shared/agent'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from '@fewmail/ui/components/dropdown-menu'
import { Spinner } from '@fewmail/ui/components/spinner'
import {
  Notification01Icon,
  NotificationOff01Icon,
  SidebarRight01Icon,
} from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { useMutation } from '@tanstack/react-query'
import { isToday } from 'date-fns'

import { refreshBots } from '~/components/bot-chat'
import {
  BotAvatar,
  BotMenuItems,
  isBoardBot,
  pausedUntilOf,
} from '~/components/bot-list'
import type { HomeBot } from '~/components/bot-list'
import { botChats, useToday, useWaiting } from '~/lib/home-db'
import { useDates, useT } from '~/lib/i18n'
import { orpc } from '~/lib/orpc'
import { showUntilSettled } from '~/lib/query-client'
/** What the bot is doing now, in the chat's bar and its profile: reading, paused, waiting on the user, or how it works and when it last wrote. */
export const BotStatus = ({ bot }: { bot: HomeBot }) => {
  const t = useT()
  const dates = useDates()
  const { data: today } = useToday()
  const pending = useWaiting(bot.bot).length
  const reading = bot.bot === 'fewmail' ? (today?.reading ?? 0) : 0
  const pausedUntil = pausedUntilOf(bot)
  if (reading > 0) {
    return (
      <span className="text-primary flex items-center gap-1.5">
        <Spinner />
        {t.bots.status.reading(reading)}
      </span>
    )
  }
  if (pausedUntil) {
    return t.bots.status.paused(dates.format(pausedUntil, 'd MMM p'))
  }
  if (pending > 0) {
    return (
      <span className="text-primary font-medium">
        {t.bots.status.waiting(pending)}
      </span>
    )
  }
  if (bot.own && needsPurpose(bot.own)) {
    return (
      <span className="text-primary font-medium">{t.bots.purpose.status}</span>
    )
  }
  const how =
    bot.own && !isBoardBot(bot)
      ? t.bots.status[bot.own.enabled ? 'acts' : 'asks']
      : t.bots.status.watching
  return [
    how,
    bot.last &&
      t.bots.status.last(
        dates.format(bot.last.at, isToday(bot.last.at) ? 'p' : 'd MMM')
      ),
  ]
    .filter(Boolean)
    .join(' · ')
}

/** The chat's bar, as a messenger's: the open bot's face, its name and what it is doing now, the whole of it one button opening its profile, mute and chat actions. What it looks after is its intro's and its profile's, never a strip under the bar. */
export const BotHeader = ({
  bot,
  onProfile,
}: {
  bot: HomeBot
  onProfile: () => void
}) => {
  const t = useT()
  const mute = useMute(bot)
  return (
    <header className="flex h-14 shrink-0 border-b">
      <div className="mx-auto flex w-full max-w-3xl items-center px-8 max-md:px-2 @max-xl:px-2">
        <DropdownMenu>
          <DropdownMenuTrigger className="hover:bg-accent data-popup-open:bg-accent focus-visible:focus-ring flex min-w-0 flex-1 cursor-pointer items-center gap-3 rounded-xl px-2 py-1 text-left outline-none">
            <BotAvatar bot={bot} size="md" />
            <span className="flex min-w-0 flex-1 flex-col">
              <h1
                data-mask={!!bot.own}
                className="truncate text-sm font-medium"
              >
                {bot.name}
              </h1>
              <span className="text-muted-foreground truncate text-xs">
                <BotStatus bot={bot} />
              </span>
            </span>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            <DropdownMenuItem onClick={onProfile}>
              <HugeiconsIcon icon={SidebarRight01Icon} strokeWidth={2} />
              {t.bots.profile}
              <DropdownMenuShortcut>P</DropdownMenuShortcut>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={mute}>
              <HugeiconsIcon
                icon={bot.muted ? Notification01Icon : NotificationOff01Icon}
                strokeWidth={2}
              />
              {bot.muted ? t.bots.unmute : t.bots.mute}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <BotMenuItems bot={bot} isOpen />
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}

/** Mutes the bot or lets it notify again, shown at once. */
export const useMute = (bot: HomeBot) => {
  const { mutate } = useMutation(
    orpc.bots.mute.mutationOptions({
      onMutate: ({ bot: id, muted }) =>
        showUntilSettled(() => {
          if (botChats.has(id)) {
            botChats.update(id, (row) => {
              row.muted = muted
            })
          }
        }),
      onSettled: (_, __, ___, settle) => settle?.(refreshBots()),
    })
  )
  return () => mutate({ bot: bot.bot, muted: !bot.muted })
}
