import { db } from '@fewmail/db'
import { actions, mailboxes, messages } from '@fewmail/db/schema'
import { SUSPICION_SPAM } from '@fewmail/shared/agent'
import type { Messages } from '@fewmail/shared/i18n'
import { and, eq, sql } from 'drizzle-orm'

import { modifyThread, trashThread } from '../lib/gmail'
import { NotFoundError } from './mail-errors'
import { forgetOlderMail } from './older-mail'

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
  forgetOlderMail(userId)
  await mirrorThreadLabels(userId, threadId, change)
}

export const ARCHIVE = { remove: ['INBOX', 'UNREAD'] }
export const MARK_READ = { remove: ['UNREAD'] }
export const SPAM = { add: ['SPAM'], remove: ['INBOX', 'UNREAD'] }

/**
 * The shield and zombies only propose: the email stays in the inbox marked "Looks like spam"
 * and a `spam` card waits for the user's yes, which moves it (and votes) through `approveAction`.
 */
export const proposeSpam = async (
  userId: string,
  message: typeof messages.$inferSelect,
  reason: string,
  t: Messages
) => {
  await db
    .update(messages)
    .set({ suspicion: SUSPICION_SPAM })
    .where(eq(messages.id, message.id))
  await db.insert(actions).values({
    autonomous: false,
    kind: 'spam',
    messageId: message.id,
    reason,
    status: 'pending',
    threadId: message.threadId,
    title: t.actionKind.spam,
    userId,
  })
}

/** Only for a sender the user reported themselves: that report was their yes, so the move is autonomous and reviewable in the journal. */
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
  forgetOlderMail(userId)
  await mirrorThreadLabels(userId, threadId, {
    add: ['TRASH'],
    remove: ['INBOX'],
  })
}
