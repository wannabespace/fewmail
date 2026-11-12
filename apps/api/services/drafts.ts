import { db } from '@fewmail/db'
import { mailboxes, messages, outbox } from '@fewmail/db/schema'
import { and, desc, eq, inArray, isNull } from 'drizzle-orm'

import {
  deleteDraft as deleteGmailDraft,
  listDrafts as listGmailDrafts,
  saveDraft as saveGmailDraft,
} from '../lib/gmail'
import { toGmailQueries } from './ask'
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
  const saved = await saveGmailDraft(
    mailbox,
    { ...mail, bcc: mail.bcc ?? [], cc: mail.cc ?? [], ...headers },
    isSameMailbox ? mail.draft?.id : undefined
  )
  if (mail.draft && !isSameMailbox) {
    await deleteDraft(userId, mail.draft)
  }
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
  const [query = ''] = input.search
    ? await toGmailQueries(userId, input.search)
    : []
  const perMailbox = await Promise.all(
    owned.map(async (mailbox) => {
      const found = await listGmailDrafts(mailbox, query, PAGE_SIZE)
      return found.map((draft) => ({ ...draft, mailboxId: mailbox.id }))
    })
  )
  const drafts = perMailbox.flat()
  const failed = input.search
    ? []
    : await db
        .select()
        .from(outbox)
        .where(
          and(
            eq(outbox.userId, userId),
            eq(outbox.status, 'failed'),
            isNull(outbox.actionId),
            input.mailboxId ? eq(outbox.mailboxId, input.mailboxId) : undefined
          )
        )

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

  return [
    ...drafts.map((draft) => {
      const original = answered.find(
        ({ mailboxId, threadId }) =>
          threadId === draft.threadId && mailboxId === draft.mailboxId
      )
      return {
        bcc: draft.bcc,
        cc: draft.cc,
        html: draft.html,
        id: draft.id,
        isFailed: false,
        mailboxId: draft.mailboxId,
        mode: original ? ('reply' as const) : ('new' as const),
        replyToMessageId: original?.id ?? null,
        savedAt: draft.receivedAt,
        snippet: draft.snippet,
        subject: draft.subject,
        to: draft.to,
      }
    }),
    ...failed.map((mail) => ({
      bcc: mail.bcc,
      cc: mail.cc,
      html: mail.html,
      id: mail.id,
      isFailed: true,
      mailboxId: mail.mailboxId,
      mode: mail.mode,
      replyToMessageId: mail.replyToMessageId,
      savedAt: mail.sendAt,
      snippet: mail.text.slice(0, 200),
      subject: mail.subject,
      to: mail.to,
    })),
  ].toSorted((a, b) => b.savedAt.getTime() - a.savedAt.getTime())
}
