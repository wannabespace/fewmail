import type { RouterOutputs } from '@fewmail/api/router'
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

type Today = RouterOutputs['today']['get']

type TodayList =
  | 'codes'
  | 'dates'
  | 'newSenders'
  | 'recent'
  | 'ruleOffers'
  | 'tidy'

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
  ruleOffers: todayList('ruleOffers', ({ id }) => id),
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
    ruleOffers: useRanked('ruleOffers'),
    tidy: useRanked('tidy'),
  }
  return { data: data && { ...data, ...lists }, dataUpdatedAt }
}
