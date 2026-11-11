import { db } from '@fewmail/db'
import { mailboxes, messages } from '@fewmail/db/schema'
import { and, eq } from 'drizzle-orm'

import { modifyThread } from '../lib/gmail'
import { NotFoundError } from './mail-errors'

/** Thread ids belong to one Gmail account, so every change goes to the mailbox the thread was synced from. */
export const mailboxOfThread = async (userId: string, threadId: string) => {
  const [row] = await db
    .select({ mailbox: mailboxes })
    .from(messages)
    .innerJoin(mailboxes, eq(mailboxes.id, messages.mailboxId))
    .where(and(eq(messages.userId, userId), eq(messages.threadId, threadId)))
    .limit(1)
  if (!row) {
    throw new NotFoundError('Thread not found')
  }
  return row.mailbox
}

/** Gmail is the source of truth; this mirrors a change locally so lists update before the next sync. */
export const changeThreadLabels = async (
  userId: string,
  threadId: string,
  change: { add?: string[]; remove?: string[] }
) => {
  await modifyThread(await mailboxOfThread(userId, threadId), threadId, change)
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
