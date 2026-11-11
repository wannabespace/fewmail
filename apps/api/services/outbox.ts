import { db } from '@fewmail/db'
import { actions, messages, outbox } from '@fewmail/db/schema'
import type { OutboxMode } from '@fewmail/shared/agent'
import { UNDO_SEND_SECONDS } from '@fewmail/shared/agent'
import { forwardSubject, replySubject } from '@fewmail/shared/email'
import { addSeconds } from 'date-fns'
import { and, eq, lte } from 'drizzle-orm'

import { sendMail } from '../lib/gmail'
import { expectRow } from '../lib/rows'
import { NotFoundError } from './mail-errors'
import { scheduleFollowup } from './reminders'
import { watchSentMail } from './sent-mail'
import { changeThreadLabels } from './thread-labels'

/** In-process timers make Undo-sized delays exact; the worker sweep catches anything a restart dropped. */
const timers = new Map<string, ReturnType<typeof setTimeout>>()

export interface OutgoingMail {
  actionId?: string
  bcc?: string[]
  cc?: string[]
  html: string
  mode: OutboxMode
  remindAfterDays?: number | null
  replyToMessageId?: string
  sendAt?: Date
  subject: string
  text: string
  to: string[]
}

const replyHeaders = async (userId: string, mail: OutgoingMail) => {
  if (!mail.replyToMessageId) {
    return {
      inReplyTo: null,
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
      references: null,
      subject: forwardSubject(mail.subject || original.subject),
      threadId: null,
    }
  }
  return {
    inReplyTo: original.messageIdHeader,
    references: original.messageIdHeader,
    subject: replySubject(mail.subject || original.subject),
    threadId: original.threadId,
  }
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

  try {
    const sent = await sendMail(claimed.userId, claimed)
    await db.update(outbox).set({ status: 'sent' }).where(eq(outbox.id, id))
    if (claimed.threadId) {
      await changeThreadLabels(claimed.userId, claimed.threadId, {
        remove: ['UNREAD'],
      })
    }
    await (claimed.remindAfterDays
      ? scheduleFollowup(claimed.userId, sent.threadId, claimed.remindAfterDays)
      : watchSentMail(claimed.userId, {
          text: claimed.text,
          threadId: sent.threadId,
        }))
  } catch (error) {
    await db
      .update(outbox)
      .set({
        error: error instanceof Error ? error.message : String(error),
        status: 'failed',
      })
      .where(eq(outbox.id, id))
    if (claimed.actionId) {
      await db
        .update(actions)
        .set({ resolvedAt: null, status: 'pending' })
        .where(eq(actions.id, claimed.actionId))
    }
  }
}

const arm = (id: string, sendAt: Date) => {
  const delay = sendAt.getTime() - Date.now()
  if (delay <= 60_000) {
    timers.set(
      id,
      setTimeout(
        () => {
          dispatchOutbox(id).catch(console.error)
        },
        Math.max(0, delay)
      )
    )
  }
}

export const scheduleMail = async (userId: string, mail: OutgoingMail) => {
  const headers = await replyHeaders(userId, mail)
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
  return scheduled
}

/** Undo: works until the outbox claims the row; an approved agent draft goes back to the queue. */
export const cancelMail = async (userId: string, id: string) => {
  const [canceled] = await db
    .update(outbox)
    .set({ status: 'canceled' })
    .where(
      and(
        eq(outbox.id, id),
        eq(outbox.userId, userId),
        eq(outbox.status, 'scheduled')
      )
    )
    .returning()
  if (!canceled) {
    throw new NotFoundError('Already sent')
  }
  clearTimeout(timers.get(id))
  timers.delete(id)
  if (canceled.actionId) {
    await db
      .update(actions)
      .set({ resolvedAt: null, status: 'pending' })
      .where(eq(actions.id, canceled.actionId))
  }
  return {
    bcc: canceled.bcc,
    cc: canceled.cc,
    html: canceled.html,
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
      subject: outbox.subject,
      to: outbox.to,
    })
    .from(outbox)
    .where(and(eq(outbox.userId, userId), eq(outbox.status, 'scheduled')))
    .orderBy(outbox.sendAt)

export const dispatchDueOutbox = async () => {
  const due = await db
    .select({ id: outbox.id })
    .from(outbox)
    .where(and(eq(outbox.status, 'scheduled'), lte(outbox.sendAt, new Date())))
  await Promise.all(due.map(({ id }) => dispatchOutbox(id)))
}
