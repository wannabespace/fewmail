import { Button } from '@fewmail/ui/components/button'
import { IconButton } from '@fewmail/ui/components/custom/icon-button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@fewmail/ui/components/dropdown-menu'
import { Field, FieldLabel } from '@fewmail/ui/components/field'
import { Kbd } from '@fewmail/ui/components/kbd'
import { Switch } from '@fewmail/ui/components/switch'
import { Cancel01Icon, PauseIcon, PlayIcon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { useMutation } from '@tanstack/react-query'
import {
  addMonths,
  addWeeks,
  setHours,
  startOfTomorrow,
  subDays,
} from 'date-fns'
import type { ReactNode } from 'react'

import {
  BotForm,
  BotJob,
  BotStatus,
  CardsTrace,
  useBotChat,
  useMute,
} from '~/components/bot-chat'
import { BotAvatar, isBoardBot, pausedUntilOf } from '~/components/bot-list'
import type { HomeBot, OwnBot } from '~/components/bot-list'
import { ownBots } from '~/lib/home-db'
import { useDates, useT } from '~/lib/i18n'
import { orpc } from '~/lib/orpc'
import { queryClient, showUntilSettled } from '~/lib/query-client'

const MORNING_HOUR = 8
const LATELY_SHOWN = 3

const Section = ({
  children,
  title,
}: {
  children: ReactNode
  title: string
}) => (
  <section className="flex flex-col gap-2">
    <h3 className="text-muted-foreground text-xs font-medium">{title}</h3>
    {children}
  </section>
)

/** The cards the bot made or took over the last 7 days, each once: a digest repeats the cards it counted. */
const useWeek = (bot: string) => {
  const { dataUpdatedAt, entries } = useBotChat(bot)
  const since = subDays(dataUpdatedAt, 7)
  const cards = [
    ...new Map(
      entries
        .flatMap((entry) => ('cards' in entry ? entry.cards : []))
        .filter(({ action }) => action.createdAt > since)
        .map((card) => [card.action.id, card])
    ).values(),
  ]
  const count = (status: (typeof cards)[number]['action']['status']) =>
    cards.filter(({ action }) => action.status === status).length
  return {
    approved: count('done'),
    auto: count('auto_done'),
    lately: cards
      .filter(({ action }) => action.status !== 'pending')
      .slice(-LATELY_SHOWN),
    waiting: count('pending'),
  }
}

const Week = ({ bot }: { bot: string }) => {
  const t = useT()
  const week = useWeek(bot)
  return (
    <>
      <Section title={t.bots.week.title}>
        <div className="grid grid-cols-3 gap-2">
          {(['auto', 'approved', 'waiting'] as const).map((key) => (
            <div
              key={key}
              className="bg-popover ring-foreground/6 flex flex-col gap-0.5 rounded-xl px-3 py-2.5 ring"
            >
              <span className="text-lg font-medium tabular-nums">
                {week[key]}
              </span>
              <span className="text-muted-foreground text-xs/snug">
                {t.bots.week[key]}
              </span>
            </div>
          ))}
        </div>
      </Section>
      {week.lately.length > 0 && (
        <Section title={t.bots.lately}>
          <CardsTrace cards={week.lately} />
        </Section>
      )}
    </>
  )
}

/** A pause until tomorrow morning, for a week or a month; paused, the bot takes no mail and Fewmail Bot keeps it. */
const Pause = ({ own }: { own: OwnBot }) => {
  const t = useT()
  const dates = useDates()
  const update = useMutation(
    orpc.bots.update.mutationOptions({
      onMutate: ({ pausedUntil }) =>
        showUntilSettled(() => {
          if (ownBots.has(own.id)) {
            ownBots.update(own.id, (row) => {
              row.pausedUntil = pausedUntil ?? null
            })
          }
        }),
      onSettled: (_, __, ___, settle) =>
        settle?.(queryClient.invalidateQueries({ queryKey: orpc.bots.key() })),
    })
  )
  const pausedUntil = pausedUntilOf({ own })
  const pause = (until: Date) =>
    update.mutate({ id: own.id, pausedUntil: until })
  return (
    <Section title={t.bots.pause.title}>
      {pausedUntil ? (
        <div className="flex items-center gap-2">
          <span className="min-w-0 flex-1 text-sm">
            {t.bots.status.paused(dates.format(pausedUntil, 'd MMM p'))}
          </span>
          <Button
            size="sm"
            variant="secondary"
            onClick={() => update.mutate({ id: own.id, pausedUntil: null })}
          >
            <HugeiconsIcon
              icon={PlayIcon}
              strokeWidth={2}
              data-icon="inline-start"
            />
            {t.bots.pause.resume}
          </Button>
        </div>
      ) : (
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <Button size="sm" variant="secondary" className="self-start" />
            }
          >
            <HugeiconsIcon
              icon={PauseIcon}
              strokeWidth={2}
              data-icon="inline-start"
            />
            {t.bots.pause.title}
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            <DropdownMenuItem
              onClick={() => pause(setHours(startOfTomorrow(), MORNING_HOUR))}
            >
              {t.bots.pause.day}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => pause(addWeeks(new Date(), 1))}>
              {t.bots.pause.week}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => pause(addMonths(new Date(), 1))}>
              {t.bots.pause.month}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )}
      <p className="text-muted-foreground text-xs">{t.bots.pause.hint}</p>
    </Section>
  )
}

/**
 * What the open bot is and does, beside its chat: its face and what it is doing now, what it did in the last 7 days,
 * its words and whether it acts alone, its pause and its notifications. Over the chat where the pane is narrow.
 */
export const BotProfile = ({
  bot,
  onClose,
}: {
  bot: HomeBot
  onClose: () => void
}) => {
  const t = useT()
  const dates = useDates()
  const mute = useMute(bot)
  const { own } = bot
  return (
    <aside
      aria-label={t.bots.profile}
      className="bg-background flex w-80 shrink-0 flex-col gap-6 overflow-y-auto border-s px-5 pt-3 pb-6 max-xl:absolute max-xl:inset-y-0 max-xl:inset-e-0 max-xl:z-30 max-xl:shadow-xl"
    >
      <IconButton
        icon={Cancel01Icon}
        label={t.bots.closeProfile}
        size="icon-sm"
        variant="ghost-muted"
        className="self-end"
        shortcut={<Kbd>esc</Kbd>}
        onClick={onClose}
      />
      <header className="-mt-4 flex flex-col items-center gap-1.5 text-center">
        <BotAvatar bot={bot} size="lg" />
        <h2 data-mask={!!own} className="mt-1 font-serif text-xl">
          {bot.name}
        </h2>
        <div className="text-muted-foreground text-xs">
          <BotStatus bot={bot} />
        </div>
        {own && (
          <p className="text-muted-foreground text-xs">
            {t.bots.since(dates.format(own.createdAt, 'd MMMM'))}
          </p>
        )}
      </header>
      {!own && <BotJob bot={bot} />}
      {!isBoardBot(bot) && <Week bot={bot.bot} />}
      {own && (
        <div className="flex flex-col gap-6">
          <BotForm key={own.id} bot={own} />
          {!isBoardBot(bot) && <Pause own={own} />}
        </div>
      )}
      <Field orientation="horizontal">
        <Switch
          id="bot-notifications"
          checked={!bot.muted}
          onCheckedChange={mute}
        />
        <FieldLabel htmlFor="bot-notifications">
          {t.bots.notifications}
        </FieldLabel>
      </Field>
    </aside>
  )
}
