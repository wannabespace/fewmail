import type { RouterOutputs } from '@fewmail/api/router'
import { botOfCard, usedPercent } from '@fewmail/shared/agent'
import { formatResetDay } from '@fewmail/shared/i18n/locales'
import { Spinner } from '@fewmail/ui/components/spinner'
import { Mail01Icon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { Fragment } from 'react'

import { DigestHeader, DigestLead, digestLead } from '~/components/bot-chat'
import { digestHeadline, useBots } from '~/components/bot-list'
import { expandRow } from '~/components/expand-row'
import { useWaiting } from '~/lib/home-db'
import { useLocale, useT } from '~/lib/i18n'
import { useMe } from '~/lib/me'
import { client, orpc } from '~/lib/orpc'

type Today = RouterOutputs['today']['get']
export type Waiting = RouterOutputs['bots']['waiting']

/** Which chats hold what waits, in words with a link to each: Fewmail's digest speaks for every bot. */
const WaitingWhere = ({ onOpen }: { onOpen: (bot: string) => void }) => {
  const bots = useBots()
  const waiting = Map.groupBy(useWaiting(), botOfCard)
  const holding = bots.filter(({ bot }) => waiting.has(bot))
  if (holding.length < 2 && !holding.some(({ bot }) => bot !== 'fewmail')) {
    return null
  }
  return (
    <p>
      {holding.map((bot, index) => (
        <Fragment key={bot.bot}>
          {index > 0 && ', '}
          <button
            type="button"
            className="text-primary cursor-pointer underline-offset-2 hover:underline"
            data-mask={!!bot.own}
            onClick={() => onOpen(bot.bot)}
          >
            {bot.name}
          </button>{' '}
          <span className="text-muted-foreground tabular-nums">
            {waiting.get(bot.bot)?.length}
          </span>
        </Fragment>
      ))}
    </p>
  )
}

/** What happened, in one sentence computed from the counts (no model text): Fewmail's digest, live. */
export const HomeHeader = ({
  data,
  decisions,
  isFirstRead,
  onOpenBot,
  updatedAt,
}: {
  data?: Today
  decisions: number
  isFirstRead: boolean
  onOpenBot: (bot: string) => void
  updatedAt: number
}) => {
  const t = useT()
  const locale = useLocale()
  const { plan, usage } = useMe()
  // A spent allowance pauses the agent's writing, never its watch: Home says which, so nothing stops silently.
  const paused =
    plan.kind !== 'free' &&
    usedPercent(plan.kind, usage.spent) >= 100 &&
    t.today.allowanceSpent(formatResetDay(locale, usage.resetsAt))
  const headline = isFirstRead ? t.nav.syncing : digestHeadline(t, decisions)
  return (
    <DigestHeader
      at={updatedAt > 0 ? updatedAt : null}
      headline={data ? headline : null}
      isLive
      lead={
        isFirstRead ? (
          <p className="text-muted-foreground flex items-center gap-2 text-sm">
            <Spinner />
            {t.today.firstRead}
          </p>
        ) : (
          data && (
            <DigestLead>
              {[
                digestLead(t, {
                  days: data.days,
                  decisions,
                  handled: data.handled.total,
                  people: data.pulse.people,
                  total: data.pulse.total,
                }),
                paused,
              ]
                .filter(Boolean)
                .join(' ')}
            </DigestLead>
          )
        )
      }
      status={
        !!data?.reading &&
        !isFirstRead && (
          <span className="flex items-center gap-1.5 whitespace-nowrap">
            <Spinner />
            {t.today.readingNow(data.reading)}
          </span>
        )
      }
    >
      {decisions > 0 && <WaitingWhere onOpen={onOpenBot} />}
    </DigestHeader>
  )
}

/** What the open bot waits on, said by the server in words (computed, numbered); read again whenever a card comes or goes. */
export const useBotWaiting = (bot: string) => {
  const cards = useWaiting(bot).map(({ action }) => action.id)
  const { data } = useQuery({
    placeholderData: keepPreviousData,
    queryFn: () => client.bots.waiting({ bot }),
    queryKey: [...orpc.bots.waiting.key(), bot, cards],
  })
  return data
}

/** The bot's message about what waits: its lines as the server wrote them, an item about an email with a link that opens it beside the chat, read only. */
export const WaitingText = ({ waiting }: { waiting: Waiting }) => {
  const t = useT()
  const lines = waiting.text?.split('\n') ?? []
  return (
    <div className="flex flex-col gap-1" data-mask>
      {lines.map((line, index) => {
        const item = waiting.items.find(
          (each, at) => line === each.text || line === `${at + 1}. ${each.text}`
        )
        return (
          <p key={index}>
            {line}
            {item?.threadId && (
              <button
                type="button"
                aria-label={t.keys.open}
                className="text-primary ms-1 inline-flex cursor-pointer align-middle"
                onClick={() =>
                  item.threadId &&
                  expandRow(item.key, { from: 'home', threadId: item.threadId })
                }
              >
                <HugeiconsIcon
                  icon={Mail01Icon}
                  strokeWidth={2}
                  className="size-4"
                />
              </button>
            )}
          </p>
        )
      })}
    </div>
  )
}
