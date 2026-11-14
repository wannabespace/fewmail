import type { RouterOutputs } from '@fewmail/api/router'
import { queryCollectionOptions } from '@tanstack/query-db-collection'
import { createCollection } from '@tanstack/react-db'

import { client, orpc } from './orpc'
import { queryClient } from './query-client'

export type QueueCardRow = RouterOutputs['today']['queue'][number] & {
  rank: number
}

// Under `orpc.today.key()`, so the live stream's `today` topic and every existing today invalidation refetch it.
const [todayKey] = orpc.today.key()

/** Home's cards as a collection: new ones arrive live, approved, skipped or deleted ones leave at once (`writeDelete`). */
export const queueCards = createCollection(
  queryCollectionOptions({
    getKey: (row: QueueCardRow) => row.action.id,
    id: 'home-queue',
    queryClient,
    // The server orders by importance; `rank` keeps that order inside the collection.
    queryFn: async (): Promise<QueueCardRow[]> => {
      const rows = await client.today.queue()
      return rows.map((row, rank) => ({ ...row, rank }))
    },
    queryKey: [[...todayKey, 'queue']],
  })
)
