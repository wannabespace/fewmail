import type { Messages } from '@fewmail/shared/i18n'
import { Button } from '@fewmail/ui/components/button'
import {
  MessageScroller,
  MessageScrollerButton,
  MessageScrollerContent,
  MessageScrollerProvider,
  MessageScrollerViewport,
} from '@fewmail/ui/components/message-scroller'
import { cn } from '@fewmail/ui/lib/utils'
import { useHotkey } from '@tanstack/react-hotkeys'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { differenceInMinutes, isToday } from 'date-fns'
import { useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import { z } from 'zod/mini'

import { BoardPane, useBoardHints } from '~/components/board'
import {
  BotNow,
  BotTimeline,
  NowPart,
  useAskBot,
  useReadBot,
} from '~/components/bot-chat'
import { BotComposer } from '~/components/bot-composer'
import { BotHeader } from '~/components/bot-header'
import {
  BotAvatar,
  isBoardBot,
  openBotIdOf,
  useBots,
} from '~/components/bot-list'
import type { HomeBot } from '~/components/bot-list'
import { BotProfile } from '~/components/bot-profile'
import { collapseExpanded, useIsThreadExpanded } from '~/components/expand-row'
import {
  HomeHeader,
  useBotWaiting,
  WaitingText,
} from '~/components/home-digest'
import { KeyHints } from '~/components/key-hints'
import { ChatScroller } from '~/components/pane-rows'
import { closeSender, useIsSenderShown } from '~/components/sender-card'
import { SenderSidebar } from '~/components/sender-stack'
import { ReaderSidebar } from '~/components/thread-link'
import { upgradeStore } from '~/components/upgrade-dialog'
import {
  botChats,
  ownBots,
  queueCards,
  todayLists,
  useToday,
  useWaiting,
} from '~/lib/home-db'
import { useT } from '~/lib/i18n'
import { connectedApps } from '~/lib/lists-db'
import { isReadingFirstTime } from '~/lib/mail-db'
import { useHasAgent } from '~/lib/me'
import { orpc } from '~/lib/orpc'
import { posthog } from '~/lib/posthog'
import { warmQuery } from '~/lib/query-client'
import { STILL_POINTER_GUARD } from '~/lib/still-pointer'

/** Home decides nothing with a key: the user answers in words or by voice, so only the chat's own keys are left. */
const homeHints = (
  t: Messages,
  board: [string, string][] | null
): [string, string][] => [
  ...(board ?? []),
  ['[ / ]', t.keys.period],
  ['/', t.keys.reply],
  ['M', t.bots.record],
  ['P', t.bots.profile],
]

/** Coming back to the tab after this long is a new look at Home: what came since is marked new. */
const AWAY_MINUTES = 10

/** Records each real look at Home (opening it, or coming back to the tab after a while) and hands back the look before it. */
const useVisits = (onVisit: () => Promise<unknown>) => {
  const [seenAt, setSeenAt] = useState<Date | null>(null)
  const { mutate: open } = useMutation(
    orpc.today.open.mutationOptions({
      onSuccess: (visit) => {
        setSeenAt(visit.seenAt)
        // The first look on a new day moves the catch-up window.
        if (visit.seenAt && !isToday(visit.seenAt)) {
          void onVisit()
        }
      },
    })
  )
  useEffect(() => {
    open()
    let hiddenAt: Date | null = null
    const onVisibility = () => {
      if (document.hidden) {
        hiddenAt = new Date()
      } else if (
        hiddenAt &&
        differenceInMinutes(new Date(), hiddenAt) >= AWAY_MINUTES
      ) {
        open()
      }
    }
    document.addEventListener('visibilitychange', onVisibility)
    return () => document.removeEventListener('visibilitychange', onVisibility)
  }, [open])
  return seenAt
}

/** The bots as a row of faces over the chat, where the sidebar is a sheet. */
const BotStrip = ({
  bots,
  onOpen,
  openId,
}: {
  bots: HomeBot[]
  onOpen: (bot: string) => void
  openId: string
}) => (
  <div className="flex gap-1 overflow-x-auto md:hidden">
    {bots.map((bot) => (
      <button
        key={bot.bot}
        type="button"
        aria-label={bot.name}
        aria-current={bot.bot === openId || undefined}
        className="aria-current:bg-secondary hover:bg-accent cursor-pointer rounded-full p-1"
        onClick={() => onOpen(bot.bot)}
      >
        <BotAvatar bot={bot} size="md" />
      </button>
    ))}
  </div>
)

/** The open bot: its name, its chat with what it waits on said in words at its end, and where to write or speak to it. Fewmail's latest message is the day's brief. */
const BotPane = ({
  ask,
  asking,
  bot,
  bots,
  head,
  isFocused,
  isProfileOpen,
  onOpen,
  onProfile,
}: {
  ask: ReturnType<typeof useAskBot>['ask']
  asking: ReturnType<typeof useAskBot>['asking']
  bot: HomeBot
  bots: HomeBot[]
  head: ReactNode
  isFocused: boolean
  isProfileOpen: boolean
  onOpen: (bot: string) => void
  onProfile: () => void
}) => {
  const t = useT()
  const hasAgent = useHasAgent()
  const waiting = useBotWaiting(bot.bot)
  const isBoard = isBoardBot(bot)
  const isNow = bot.bot === 'fewmail' || isBoard || !!waiting?.text
  return (
    <div className="under-notice relative flex min-w-0 flex-1">
      {/* A container: an email open beside the page narrows the chat as a phone would, and it takes a phone's gutter. */}
      <div className="@container flex min-w-0 flex-1 flex-col">
        <BotHeader bot={bot} onProfile={onProfile} />
        {/* Keyed: a bot opens at its newest message, not where the last one was scrolled to. */}
        <MessageScrollerProvider key={bot.bot} autoScroll>
          <ChatScroller>
            <MessageScroller className="flex-1">
              <MessageScrollerViewport aria-label={bot.name}>
                <MessageScrollerContent
                  // oxlint-disable shadcn/require-static-classes -- the guard goes on the content itself: a wrapper inside it would hide the messages from the scroller
                  className={cn(
                    'mx-auto w-full max-w-3xl gap-5 px-10 pt-6 pb-6 max-md:px-4 @max-xl:px-4',
                    STILL_POINTER_GUARD
                  )}
                  // oxlint-enable shadcn/require-static-classes
                >
                  <BotStrip bots={bots} openId={bot.bot} onOpen={onOpen} />
                  <BotTimeline bot={bot} asking={asking}>
                    {isNow && (
                      <BotNow>
                        {bot.bot === 'fewmail' && <NowPart>{head}</NowPart>}
                        {isBoard && (
                          <NowPart>
                            {hasAgent ? (
                              <BoardPane isActive={isFocused} />
                            ) : (
                              <Button
                                size="sm"
                                className="self-start"
                                onClick={() => upgradeStore.set('board')}
                              >
                                {t.bots.subscribe}
                              </Button>
                            )}
                          </NowPart>
                        )}
                        {waiting?.text && (
                          <NowPart>
                            <WaitingText waiting={waiting} />
                          </NowPart>
                        )}
                      </BotNow>
                    )}
                  </BotTimeline>
                </MessageScrollerContent>
              </MessageScrollerViewport>
              <MessageScrollerButton
                aria-label={t.bots.toLatest}
                className="data-[direction=end]:bottom-2"
              />
            </MessageScroller>
          </ChatScroller>
          <div className="mx-auto w-full max-w-3xl px-10 pb-4 max-md:px-4 @max-xl:px-4">
            <BotComposer
              bot={bot}
              isActive={isFocused}
              isSending={ask.isPending}
              onSend={(message) =>
                ask.mutate({
                  ...message,
                  bot: bot.bot,
                  seen: waiting?.items.length
                    ? {
                        at: waiting.at,
                        keys: waiting.items.map(({ key }) => key),
                      }
                    : undefined,
                })
              }
            />
          </div>
        </MessageScrollerProvider>
      </div>
      <ReaderSidebar isOpen={isProfileOpen}>
        <BotProfile bot={bot} onClose={onProfile} />
      </ReaderSidebar>
    </div>
  )
}

const useOpenBot = (bots: HomeBot[]) => {
  const navigate = useNavigate()
  const { bot: picked } = Route.useSearch()
  const id = openBotIdOf(bots, picked)
  const bot = bots.find((each) => each.bot === id) ?? bots[0]
  const open = (next: string) => {
    void navigate({ search: { bot: next }, to: '/home' })
  }
  const step = (by: number) => {
    const index = bots.findIndex((each) => each.bot === bot?.bot)
    const next = bots[Math.max(0, Math.min(bots.length - 1, index + by))]
    if (next) {
      open(next.bot)
    }
  }
  return { bot, open, step }
}

/** Home's keys work while nothing lies beside it: an email or a sender's emails take them. */
const useIsHomeFocused = () => {
  const isThreadOpen = useIsThreadExpanded()
  const isSenderOpen = useIsSenderShown()
  return !isThreadOpen && !isSenderOpen
}

/**
 * The open bot's profile in the reader's sidebar, kept open from bot to bot: `P` opens and closes it, esc closes it. It
 * takes the sidebar from an open email or sender, and gives it back to the next one opened.
 */
const useProfile = (bot: string, isFocused: boolean) => {
  const [isOpen, setIsOpen] = useState(false)
  if (isOpen && !isFocused) {
    setIsOpen(false)
  }
  const canUseKeys = isFocused
  const handleToggle = () => {
    if (!isOpen) {
      collapseExpanded()
      closeSender()
      posthog.capture('bot_profile_opened', { system: bot === 'fewmail' })
    }
    setIsOpen(!isOpen)
  }
  useHotkey('P', handleToggle, { enabled: canUseKeys })
  useHotkey('Escape', () => setIsOpen(false), {
    enabled: canUseKeys && isOpen,
  })
  return { handleToggle, isOpen }
}

const HomePage = () => {
  const t = useT()
  const queryClient = useQueryClient()
  const { data: today, dataUpdatedAt } = useToday()
  const bots = useBots()
  const { bot, open: openBot, step: stepBot } = useOpenBot(bots)
  const botId = bot?.bot ?? 'fewmail'
  useReadBot(bot)
  const { ask, asking } = useAskBot()
  const decisions = useWaiting().length
  const isFirstRead = Boolean(today && isReadingFirstTime(today.mailboxes))
  useVisits(() => queryClient.invalidateQueries({ queryKey: orpc.today.key() }))
  const isFocused = useIsHomeFocused()
  useHotkey('[', () => stepBot(-1), { enabled: isFocused })
  useHotkey(']', () => stepBot(1), { enabled: isFocused })
  const profile = useProfile(botId, isFocused)
  const boardHints = useBoardHints()

  return (
    <div className="flex min-h-0 min-w-0 flex-1 flex-col">
      <main className="flex min-h-0 flex-1">
        {bot && (
          <BotPane
            ask={ask}
            asking={asking}
            bot={bot}
            bots={bots}
            head={
              <HomeHeader
                data={today}
                decisions={decisions}
                isFirstRead={isFirstRead}
                updatedAt={dataUpdatedAt}
                onOpenBot={openBot}
              />
            }
            isFocused={isFocused}
            isProfileOpen={profile.isOpen}
            onOpen={openBot}
            onProfile={profile.handleToggle}
          />
        )}
      </main>
      <SenderSidebar />
      <KeyHints
        hints={homeHints(t, bot && isBoardBot(bot) ? boardHints : null)}
      />
    </div>
  )
}

export const Route = createFileRoute('/_app/home')({
  component: HomePage,
  validateSearch: z.object({
    bot: z.optional(z.string()),
  }),
  // Everything Home draws on its first frame: the list of bots and the open bot's chat come with the page.
  loader: async () => {
    await Promise.all([
      warmQuery(orpc.today.get.queryOptions()),
      botChats.preload(),
      ownBots.preload(),
      connectedApps.preload(),
      queueCards.preload(),
      ...Object.values(todayLists).map((list) => list.preload()),
    ])
  },
})
