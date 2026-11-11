import { db } from '@fewmail/db'
import { messages } from '@fewmail/db/schema'
import { and, eq } from 'drizzle-orm'

import { modifyThread } from '../lib/gmail'

/** Gmail is the source of truth; this mirrors a change locally so lists update before the next sync. */
export const changeThreadLabels = async (
  userId: string,
  threadId: string,
  change: { add?: string[]; remove?: string[] }
) => {
  await modifyThread(userId, threadId, change)
  const rows = await db
    .select({ id: messages.id, labelIds: messages.labelIds })
    .from(messages)
    .where(and(eq(messages.userId, userId), eq(messages.threadId, threadId)))
  await Promise.all(
    rows.map(({ id, labelIds }) =>
      db
        .update(messages)
        .set({
          isUnread:
            change.add?.includes('UNREAD') ??
            (change.remove?.includes('UNREAD') ? false : undefined),
          labelIds: [
            ...new Set([
              ...labelIds.filter((label) => !change.remove?.includes(label)),
              ...(change.add ?? []),
            ]),
          ],
        })
        .where(eq(messages.id, id))
    )
  )
}
