import { db } from '@fewmail/db'
import { actions, mailboxes, messages, outbox } from '@fewmail/db/schema'
import type { OutboxMode } from '@fewmail/shared/agent'
import { UNDO_SEND_SECONDS } from '@fewmail/shared/agent'
import {
  ATTACHMENTS_MAX_BYTES,
  FORWARDED_PREFIX,
  MAIL_FILE_PREFIX,
  forwardSubject,
  replySubject,
} from '@fewmail/shared/email'
import type { OutgoingAttachment } from '@fewmail/shared/email'
import { Result } from 'better-result'
import { addSeconds, subMinutes } from 'date-fns'
import { and, eq, inArray, isNull, lte } from 'drizzle-orm'

import {
  deleteDraft,
  getDraftFiles,
  GmailError,
  saveDraft as saveGmailDraft,
  sendMail,
} from '../lib/gmail'
import { ACTION_TOPICS, announceChange } from '../lib/live'
import { logError, logErrorAs } from '../lib/log'
import { capture } from '../lib/posthog'
import { expectRow } from '../lib/rows'
import { readAttachment } from './attachments'
import { AttachmentsTooLargeError } from './attachments-error'
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
  attachments?: OutgoingAttachment[]
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

/**
 * Every file with its bytes: one without `data` is taken from the saved draft the mail was written in,
 * else, when forwarding, from the forwarded email's own part.
 */
export const filesOf = async (
  userId: string,
  {
    attachments = [],
    draft,
    mode,
    replyToMessageId,
  }: Pick<OutgoingMail, 'attachments' | 'draft' | 'mode' | 'replyToMessageId'>
) => {
  if (attachments.length === 0) {
    return null
  }
  const saved =
    draft && attachments.some(({ data }) => !data)
      ? await getDraftFiles(await ownMailbox(userId, draft.mailboxId), draft.id)
      : []
  const forwardedPart = async (id: string) => {
    const partId = id.startsWith(FORWARDED_PREFIX)
      ? id.slice(FORWARDED_PREFIX.length)
      : null
    if (mode !== 'forward' || !replyToMessageId || partId === null) {
      return
    }
    const { bytes } = await readAttachment(userId, replyToMessageId, partId)
    return bytes.toString('base64')
  }
  const mailPart = async (id: string) => {
    const [messageId, partId] = id.startsWith(MAIL_FILE_PREFIX)
      ? id.slice(MAIL_FILE_PREFIX.length).split(':')
      : []
    if (!messageId || !partId) {
      return
    }
    const { bytes } = await readAttachment(userId, messageId, partId)
    return bytes.toString('base64')
  }
  const files = await Promise.all(
    attachments.map(async (file) => {
      const data =
        file.data ??
        (await saved.find(({ id }) => id === file.id)?.read()) ??
        (await forwardedPart(file.id)) ??
        (await mailPart(file.id))
      if (!data) {
        throw new NotFoundError('Attachment not found')
      }
      return { ...file, data, size: Buffer.byteLength(data, 'base64') }
    })
  )
  if (files.reduce((sum, { size }) => sum + size, 0) > ATTACHMENTS_MAX_BYTES) {
    throw new AttachmentsTooLargeError('Attachments are too large')
  }
  return files
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

const dispatchOutbox = async (id: string) => {
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
  await db
    .update(outbox)
    .set({ attachments: null, status: 'sent' })
    .where(eq(outbox.id, id))
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
  const [headers, attachments] = await Promise.all([
    mailHeaders(userId, mail),
    filesOf(userId, mail),
  ])
  const sendAt = mail.sendAt ?? addSeconds(new Date(), UNDO_SEND_SECONDS)
  const [row] = await db
    .insert(outbox)
    .values({
      actionId: mail.actionId ?? null,
      attachments,
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

/** The files go back into a Gmail draft rather than through the browser, which would have to send them up again. */
const keepAsDraft = async (row: typeof outbox.$inferSelect) => {
  const mailbox = await ownMailbox(row.userId, row.mailboxId)
  const draft = await saveGmailDraft(mailbox, row)
  await db
    .update(outbox)
    .set({ attachments: null })
    .where(eq(outbox.id, row.id))
  return { id: draft.id, mailboxId: mailbox.id }
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
  const gmailDraft = canceled.attachments?.length
    ? await keepAsDraft(canceled)
    : null
  return {
    attachments: (canceled.attachments ?? []).map(
      ({ data: _data, ...file }) => file
    ),
    bcc: canceled.bcc,
    cc: canceled.cc,
    gmailDraft,
    html: canceled.html,
    mailboxId: canceled.mailboxId,
    mode: canceled.mode,
    remindAfterDays: canceled.remindAfterDays,
    replyToMessageId: canceled.replyToMessageId,
    subject: canceled.subject,
    to: canceled.to,
  }
}

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
