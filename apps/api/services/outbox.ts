import { db } from '@fewmail/db'
import { actions, mailboxes, messages, outbox } from '@fewmail/db/schema'
import type { OutboxMode } from '@fewmail/shared/agent'
import { UNDO_SEND_SECONDS } from '@fewmail/shared/agent'
import { forwardSubject, replySubject } from '@fewmail/shared/email'
import { Result } from 'better-result'
import { addSeconds, subMinutes } from 'date-fns'
import { and, eq, inArray, isNull, lte } from 'drizzle-orm'

import { deleteDraft, GmailError, sendMail } from '../lib/gmail'
import { ACTION_TOPICS, announceChange } from '../lib/live'
import { logError, logErrorAs } from '../lib/log'
import { capture } from '../lib/posthog'
import { expectRow } from '../lib/rows'
import { NotFoundError } from './mail-errors'
import { ownMailbox } from './mailboxes'
import { scheduleFollowup } from './reminders'
import { changeThreadLabels } from './thread-labels'

/** In-process timers make Undo-sized delays exact; the worker sweep catches anything a restart dropped. */
const timers = new Map<string, ReturnType<typeof setTimeout>>()

const STUCK_SENDING_MINUTES = 10

export class AlreadySentError extends NotFoundError {
  override name = 'AlreadySentError'
}

export interface DraftRef {
  id: string
  mailboxId: string
}

export interface OutgoingMail {
  actionId?: string
  bcc?: string[]
  cc?: string[]
  draft?: DraftRef
  html: string
  /** New mail only: a reply or forward leaves from the mailbox of the original. */
  mailboxId?: string
  mode: OutboxMode
  remindAfterDays?: number | null
  replyToMessageId?: string
  sendAt?: Date
  subject: string
  text: string
  to: string[]
}

const senderMailboxId = async (userId: string, mailboxId?: string) => {
  const [mailbox] = await db
    .select({ id: mailboxes.id })
    .from(mailboxes)
    .where(
      and(
        eq(mailboxes.userId, userId),
        mailboxId
          ? eq(mailboxes.id, mailboxId)
          : isNull(mailboxes.googleAccountId)
      )
    )
  if (!mailbox) {
    throw new NotFoundError('Mailbox not found')
  }
  return mailbox.id
}

export const mailHeaders = async (userId: string, mail: OutgoingMail) => {
  if (!mail.replyToMessageId) {
    return {
      inReplyTo: null,
      mailboxId: await senderMailboxId(userId, mail.mailboxId),
      references: null,
      subject: mail.subject,
      threadId: null,
    }
  }
  const [original] = await db
    .select()
    .from(messages)
    .where(
      and(eq(messages.id, mail.replyToMessageId), eq(messages.userId, userId))
    )
  if (!original) {
    throw new NotFoundError('Email not found')
  }
  if (mail.mode === 'forward') {
    return {
      inReplyTo: null,
      mailboxId: original.mailboxId,
      references: null,
      subject: forwardSubject(mail.subject || original.subject),
      threadId: null,
    }
  }
  return {
    inReplyTo: original.messageIdHeader,
    mailboxId: original.mailboxId,
    references: original.messageIdHeader,
    subject: replySubject(mail.subject || original.subject),
    threadId: original.threadId,
  }
}

/** An approved draft goes back to the queue; the user's own mail is listed among the drafts as not sent. */
const markFailed = async (
  row: Pick<typeof outbox.$inferSelect, 'actionId' | 'id' | 'userId'>,
  error: string
) => {
  await db
    .update(outbox)
    .set({ error, status: 'failed' })
    .where(eq(outbox.id, row.id))
  if (row.actionId) {
    await db
      .update(actions)
      .set({ resolvedAt: null, status: 'pending' })
      .where(and(eq(actions.id, row.actionId), eq(actions.userId, row.userId)))
  }
  await announceChange(row.userId, ACTION_TOPICS)
}

export const dispatchOutbox = async (id: string) => {
  timers.delete(id)
  const [claimed] = await db
    .update(outbox)
    .set({ status: 'sending' })
    .where(
      and(
        eq(outbox.id, id),
        eq(outbox.status, 'scheduled'),
        lte(outbox.sendAt, new Date())
      )
    )
    .returning()
  if (!claimed) {
    return
  }

  const sent = await Result.tryPromise(async () => {
    const [mailbox] = await db
      .select()
      .from(mailboxes)
      .where(eq(mailboxes.id, claimed.mailboxId))
    return sendMail(expectRow(mailbox), claimed)
  })
  if (sent.isErr()) {
    const error = sent.error.cause
    if (error instanceof GmailError && error.blockedUntil) {
      await db
        .update(mailboxes)
        .set({ sendBlockedUntil: error.blockedUntil })
        .where(eq(mailboxes.id, claimed.mailboxId))
      await announceChange(claimed.userId, ['mailboxes'])
    }
    await markFailed(
      claimed,
      error instanceof Error ? error.message : String(error)
    )
    return
  }

  // Gmail already sent it: a failure below must never mark it failed, or it is sent twice.
  await db.update(outbox).set({ status: 'sent' }).where(eq(outbox.id, id))
  capture(claimed.userId, 'mail_sent', { approved: Boolean(claimed.actionId) })
  const recorded = await Result.tryPromise(async () => {
    if (claimed.threadId) {
      await changeThreadLabels(claimed.userId, claimed.threadId, {
        remove: ['UNREAD'],
      })
    }
    // Sync watches every sent message (commitments, automatic follow-up); here only the user's own choice.
    if (claimed.remindAfterDays) {
      await scheduleFollowup(
        claimed.userId,
        sent.value.threadId,
        claimed.remindAfterDays
      )
    }
  })
  if (recorded.isErr()) {
    logError('outbox after-send failed', recorded.error.cause)
  }
}

const arm = (id: string, sendAt: Date) => {
  const delay = sendAt.getTime() - Date.now()
  if (delay <= 60_000) {
    timers.set(
      id,
      setTimeout(
        () => {
          dispatchOutbox(id).catch(logErrorAs('outbox dispatch'))
        },
        Math.max(0, delay)
      )
    )
  }
}

export const scheduleMail = async (userId: string, mail: OutgoingMail) => {
  const headers = await mailHeaders(userId, mail)
  const sendAt = mail.sendAt ?? addSeconds(new Date(), UNDO_SEND_SECONDS)
  const [row] = await db
    .insert(outbox)
    .values({
      actionId: mail.actionId ?? null,
      bcc: mail.bcc ?? [],
      cc: mail.cc ?? [],
      html: mail.html,
      mode: mail.mode,
      remindAfterDays: mail.remindAfterDays ?? null,
      replyToMessageId: mail.replyToMessageId ?? null,
      sendAt,
      status: 'scheduled',
      text: mail.text,
      to: mail.to,
      userId,
      ...headers,
    })
    .returning({ id: outbox.id, sendAt: outbox.sendAt })
  const scheduled = expectRow(row)
  arm(scheduled.id, scheduled.sendAt)
  if (mail.draft) {
    // The mail is already queued: a draft that fails to go must not fail the send, or the client sends it twice.
    const { id, mailboxId } = mail.draft
    await ownMailbox(userId, mailboxId)
      .then((mailbox) => deleteDraft(mailbox, id))
      .catch(() => false)
  }
  return scheduled
}

/** Undo, or reopening mail that failed: works until the outbox claims the row; an approved agent draft goes back to the queue. */
export const cancelMail = async (userId: string, id: string) => {
  const [canceled] = await db
    .update(outbox)
    .set({ status: 'canceled' })
    .where(
      and(
        eq(outbox.id, id),
        eq(outbox.userId, userId),
        inArray(outbox.status, ['scheduled', 'failed'])
      )
    )
    .returning()
  if (!canceled) {
    throw new AlreadySentError('Already sent')
  }
  clearTimeout(timers.get(id))
  timers.delete(id)
  if (canceled.actionId) {
    await db
      .update(actions)
      .set({ resolvedAt: null, status: 'pending' })
      .where(and(eq(actions.id, canceled.actionId), eq(actions.userId, userId)))
    await announceChange(userId, ACTION_TOPICS)
  }
  return {
    bcc: canceled.bcc,
    cc: canceled.cc,
    html: canceled.html,
    mailboxId: canceled.mailboxId,
    mode: canceled.mode,
    remindAfterDays: canceled.remindAfterDays,
    replyToMessageId: canceled.replyToMessageId,
    subject: canceled.subject,
    to: canceled.to,
  }
}

export const listScheduled = (userId: string) =>
  db
    .select({
      id: outbox.id,
      sendAt: outbox.sendAt,
      status: outbox.status,
      subject: outbox.subject,
      to: outbox.to,
    })
    .from(outbox)
    .where(
      and(
        eq(outbox.userId, userId),
        inArray(outbox.status, ['scheduled', 'failed'])
      )
    )
    .orderBy(outbox.sendAt)

export const dispatchDueOutbox = async () => {
  // Never send these again: Gmail may have sent the mail before the process died.
  const stuck = await db
    .select()
    .from(outbox)
    .where(
      and(
        eq(outbox.status, 'sending'),
        lte(outbox.updatedAt, subMinutes(new Date(), STUCK_SENDING_MINUTES))
      )
    )
  await Promise.all(
    stuck.map((row) => markFailed(row, 'Interrupted while sending'))
  )
  const due = await db
    .select({ id: outbox.id })
    .from(outbox)
    .where(and(eq(outbox.status, 'scheduled'), lte(outbox.sendAt, new Date())))
  await Promise.all(due.map(({ id }) => dispatchOutbox(id)))
}
