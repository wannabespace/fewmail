import type { RouterOutputs } from '@fewmail/api/router'
import { botOfCard, waitsForUser } from '@fewmail/shared/agent'
import { queryCollectionOptions } from '@tanstack/query-db-collection'
import { createCollection, useLiveQuery } from '@tanstack/react-db'
import { useQuery } from '@tanstack/react-query'

import { client, orpc } from './orpc'
import { listCollection, queryClient } from './query-client'

/** Home's cards: new ones arrive live, approved, skipped or deleted ones leave at once (`showUntilSettled`). */
export const queueCards = listCollection({
  getKey: ({ action }) => action.id,
  id: 'home-queue',
  queryFn: () => client.today.queue(),
  queryKey: orpc.today.queue.key(),
})

/**
 * What waits for the user, the one count every place says ("4 things need you"): every card but Tidy's proposals, all
 * of them or one bot's. The chat's bar, the bot's profile, Fewmail's headline and the tab's title all read it here.
 */
export const useWaiting = (bot?: string) =>
  useLiveQuery((query) => query.from({ card: queueCards })).data.filter(
    (card) =>
      waitsForUser(card.action.kind) && (!bot || botOfCard(card) === bot)
  )

/** The ids of what waits, for a report to say which of its cards still do. */
export const useWaitingIds = (): ReadonlySet<string> =>
  new Set(useWaiting().map(({ action }) => action.id))

/** Home's bots with their latest line and how much is new: muted or read at once (`showUntilSettled`). */
export const botChats = listCollection({
  getKey: ({ bot }) => bot,
  id: 'home-bot-chats',
  queryFn: () => client.bots.chats(),
  queryKey: orpc.bots.chats.key(),
})

/** The user's own bots: renamed, changed or deleted at once. */
export const ownBots = listCollection({
  getKey: ({ id }) => id,
  id: 'home-own-bots',
  queryFn: () => client.bots.list(),
  queryKey: orpc.bots.list.key(),
})

type Today = RouterOutputs['today']['get']

type TodayList = 'codes' | 'dates' | 'newSenders' | 'recent' | 'tidy'

/** One of Home's lists out of `today.get` as a collection, so a row acted on stays gone through every refetch (`showUntilSettled`). */
const todayList = <List extends TodayList>(
  list: List,
  keyOf: (row: Today[List][number]) => string
) =>
  createCollection(
    queryCollectionOptions({
      getKey: keyOf,
      id: `home-${list}`,
      queryClient,
      queryFn: () => client.today.get(),
      queryKey: orpc.today.get.queryKey(),
      // The server orders each list; `rank` keeps that order inside the collection.
      select: (today: Today) =>
        (today[list] as Today[List][number][]).map((row, rank) => ({
          ...row,
          rank,
        })),
    })
  )

export const todayLists = {
  codes: todayList('codes', ({ id }) => id),
  dates: todayList('dates', ({ message }) => message.id),
  newSenders: todayList('newSenders', ({ messageId }) => messageId),
  recent: todayList('recent', ({ message }) => message.id),
  tidy: todayList('tidy', ({ message }) => message.id),
}

const useRanked = <List extends TodayList>(list: List) =>
  useLiveQuery((query) =>
    query.from({ row: todayLists[list] }).orderBy(({ row }) => row.rank)
  ).data

/** `today.get` with its lists as the collections hold them, the rows acted on already gone. */
export const useToday = () => {
  const { data, dataUpdatedAt } = useQuery(orpc.today.get.queryOptions())
  const lists = {
    codes: useRanked('codes'),
    dates: useRanked('dates'),
    newSenders: useRanked('newSenders'),
    recent: useRanked('recent'),
    tidy: useRanked('tidy'),
  }
  return { data: data && { ...data, ...lists }, dataUpdatedAt }
}
