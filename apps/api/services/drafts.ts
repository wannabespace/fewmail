import { db } from '@fewmail/db'
import { mailboxes, messages } from '@fewmail/db/schema'
import { and, desc, eq, inArray } from 'drizzle-orm'

import {
  deleteDraft as deleteGmailDraft,
  listDrafts as listGmailDrafts,
  saveDraft as saveGmailDraft,
} from '../lib/gmail'
import { toGmailQuery } from './ask'
import { ownMailbox } from './mailboxes'
import type { DraftRef, OutgoingMail } from './outbox'
import { mailHeaders } from './outbox'

const PAGE_SIZE = 50

export const deleteDraft = async (userId: string, draft: DraftRef) => {
  await deleteGmailDraft(await ownMailbox(userId, draft.mailboxId), draft.id)
}

/** Gmail draft ids belong to one mailbox, so a draft moved to another "From" is created anew there. */
export const saveDraft = async (
  userId: string,
  mail: Omit<OutgoingMail, 'sendAt' | 'remindAfterDays' | 'actionId'>
): Promise<DraftRef> => {
  const headers = await mailHeaders(userId, mail)
  const mailbox = await ownMailbox(userId, headers.mailboxId)
  const isSameMailbox = mail.draft?.mailboxId === mailbox.id
  if (mail.draft && !isSameMailbox) {
    await deleteDraft(userId, mail.draft)
  }
  const saved = await saveGmailDraft(
    mailbox,
    { ...mail, bcc: mail.bcc ?? [], cc: mail.cc ?? [], ...headers },
    isSameMailbox ? mail.draft?.id : undefined
  )
  return { id: saved.id, mailboxId: mailbox.id }
}

export const listDrafts = async (
  userId: string,
  input: { mailboxId?: string; search?: string }
) => {
  const owned = await db
    .select()
    .from(mailboxes)
    .where(
      and(
        eq(mailboxes.userId, userId),
        input.mailboxId ? eq(mailboxes.id, input.mailboxId) : undefined
      )
    )
  const query = input.search ? await toGmailQuery(input.search) : ''
  const perMailbox = await Promise.all(
    owned.map(async (mailbox) => {
      const found = await listGmailDrafts(mailbox, query, PAGE_SIZE)
      return found.map((draft) => ({ ...draft, mailboxId: mailbox.id }))
    })
  )
  const drafts = perMailbox.flat()

  const threadIds = drafts.map(({ threadId }) => threadId)
  const answered = threadIds.length
    ? await db
        .select({
          id: messages.id,
          mailboxId: messages.mailboxId,
          threadId: messages.threadId,
        })
        .from(messages)
        .where(
          and(
            eq(messages.userId, userId),
            inArray(messages.threadId, threadIds)
          )
        )
        .orderBy(desc(messages.receivedAt))
    : []

  return drafts
    .map((draft) => {
      const original = answered.find(
        ({ mailboxId, threadId }) =>
          threadId === draft.threadId && mailboxId === draft.mailboxId
      )
      return {
        cc: draft.cc,
        html: draft.html,
        id: draft.id,
        mailboxId: draft.mailboxId,
        mode: original ? ('reply' as const) : ('new' as const),
        replyToMessageId: original?.id ?? null,
        savedAt: draft.receivedAt,
        snippet: draft.snippet,
        subject: draft.subject,
        to: draft.to,
      }
    })
    .toSorted((a, b) => b.savedAt.getTime() - a.savedAt.getTime())
}
