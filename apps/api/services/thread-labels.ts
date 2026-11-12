import { db } from '@fewmail/db'
import { actions, mailboxes, messages } from '@fewmail/db/schema'
import type { Messages } from '@fewmail/shared/i18n'
import { and, eq, sql } from 'drizzle-orm'

import { modifyThread, trashThread } from '../lib/gmail'
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

interface LabelChange {
  add?: string[]
  remove?: string[]
}

const textArray = (values: string[]) =>
  sql`array[${sql.join(
    values.map((value) => sql`${value}`),
    sql`, `
  )}]::text[]`

/** Gmail is the source of truth; this mirrors a change locally so lists update before the next sync. */
const mirrorThreadLabels = async (
  userId: string,
  threadId: string,
  change: LabelChange
) => {
  const add = change.add ?? []
  const remove = change.remove ?? []
  await db
    .update(messages)
    .set({
      isUnread:
        add.includes('UNREAD') || remove.includes('UNREAD')
          ? add.includes('UNREAD')
          : undefined,
      labelIds: sql`array(select distinct label from unnest(${messages.labelIds} || ${textArray(add)}) as label where label <> all(${textArray(remove)}))`,
    })
    .where(and(eq(messages.userId, userId), eq(messages.threadId, threadId)))
}

export const changeThreadLabels = async (
  userId: string,
  threadId: string,
  change: LabelChange
) => {
  await modifyThread(await mailboxOfThread(userId, threadId), threadId, change)
  await mirrorThreadLabels(userId, threadId, change)
}

export const ARCHIVE = { remove: ['INBOX', 'UNREAD'] }
export const MARK_READ = { remove: ['UNREAD'] }
export const SPAM = { add: ['SPAM'], remove: ['INBOX', 'UNREAD'] }

/** Spam shield and zombie moves: an autonomous `spam` action records each, for review in the Spam tab. */
export const moveToSpam = async (
  userId: string,
  message: typeof messages.$inferSelect,
  reason: string,
  t: Messages
) => {
  const done = await changeThreadLabels(userId, message.threadId, SPAM).then(
    () => true,
    () => false
  )
  await db.insert(actions).values({
    autonomous: true,
    kind: 'spam',
    messageId: message.id,
    reason,
    resolvedAt: done ? new Date() : null,
    status: done ? 'auto_done' : 'failed',
    threadId: message.threadId,
    title: t.actionKind.spam,
    userId,
  })
}

export const trashThreadOf = async (userId: string, threadId: string) => {
  await trashThread(await mailboxOfThread(userId, threadId), threadId)
  await mirrorThreadLabels(userId, threadId, {
    add: ['TRASH'],
    remove: ['INBOX'],
  })
}
