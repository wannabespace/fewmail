import { db } from '@fewmail/db'
import { actions, analyses, mailboxes, messages } from '@fewmail/db/schema'
import type { MailCategory } from '@fewmail/shared/agent'
import { textToHtml } from '@fewmail/shared/email'
import { subHours } from 'date-fns'
import { and, desc, eq, gte, inArray, lt, sql } from 'drizzle-orm'

import { listMessageIds, trashThread, unsubscribeOneClick } from '../lib/gmail'
import { expectRow } from '../lib/rows'
import { writeReply } from './agent'
import { NotFoundError } from './mail-errors'
import { scheduleMail } from './outbox'
import { snoozedThreadIds, snoozeThread, unsnoozeThread } from './reminders'
import { createRule } from './rules'
import { changeThreadLabels } from './thread-labels'

export { NotFoundError } from './mail-errors'

const ARCHIVE = { remove: ['INBOX', 'UNREAD'] }
const MARK_READ = { remove: ['UNREAD'] }

const messageSummary = {
  fromEmail: messages.fromEmail,
  fromName: messages.fromName,
  gmailId: messages.gmailId,
  hasAttachments: messages.hasAttachments,
  id: messages.id,
  isUnread: messages.isUnread,
  receivedAt: messages.receivedAt,
  snippet: messages.snippet,
  subject: messages.subject,
  threadId: messages.threadId,
}

const analysisSummary = {
  category: analyses.category,
  extracted: analyses.extracted,
  importance: analyses.importance,
  needsReply: analyses.needsReply,
  reason: analyses.reason,
  summary: analyses.summary,
}

export const listQueue = (userId: string) =>
  db
    .select({
      action: actions,
      analysis: analysisSummary,
      message: messageSummary,
    })
    .from(actions)
    .leftJoin(messages, eq(messages.id, actions.messageId))
    .leftJoin(analyses, eq(analyses.messageId, actions.messageId))
    .where(and(eq(actions.userId, userId), eq(actions.status, 'pending')))
    .orderBy(desc(analyses.importance), actions.createdAt)

export const handledSince = async (userId: string, since: Date) => {
  const rows = await db
    .select({ count: sql<number>`count(*)::int`, kind: actions.kind })
    .from(actions)
    .where(
      and(
        eq(actions.userId, userId),
        eq(actions.status, 'auto_done'),
        gte(actions.createdAt, since)
      )
    )
    .groupBy(actions.kind)
  const byKind = Object.fromEntries(
    rows.map(({ count, kind }) => [kind, count])
  )
  return {
    archived: byKind.archive ?? 0,
    markedRead: byKind.mark_read ?? 0,
    total: rows.reduce((sum, { count }) => sum + count, 0),
    unsubscribed: byKind.unsubscribe ?? 0,
  }
}

export const getMailbox = async (userId: string) => {
  const [mailbox] = await db
    .select()
    .from(mailboxes)
    .where(eq(mailboxes.userId, userId))
  return mailbox ?? null
}

export type MailFilter =
  | 'inbox'
  | 'important'
  | 'needs_reply'
  | 'quiet'
  | 'snoozed'

const PAGE_SIZE = 50

export const listMail = async (
  userId: string,
  input: {
    before?: Date
    category?: MailCategory
    filter: MailFilter
    search?: string
  }
) => {
  const searchIds = input.search
    ? await listMessageIds(userId, input.search, PAGE_SIZE)
    : null

  if (searchIds?.length === 0) {
    return []
  }
  const snoozedIds =
    input.filter === 'snoozed' ? await snoozedThreadIds(userId) : null
  const snoozed = snoozedIds ? [...snoozedIds.keys()] : null
  if (snoozed?.length === 0) {
    return []
  }

  return db
    .select({ analysis: analysisSummary, message: messageSummary })
    .from(messages)
    .leftJoin(analyses, eq(analyses.messageId, messages.id))
    .where(
      and(
        eq(messages.userId, userId),
        eq(messages.isFromMe, false),
        searchIds ? inArray(messages.gmailId, searchIds) : undefined,
        input.before ? lt(messages.receivedAt, input.before) : undefined,
        input.category ? eq(analyses.category, input.category) : undefined,
        input.filter === 'important' ? gte(analyses.importance, 2) : undefined,
        input.filter === 'needs_reply'
          ? eq(analyses.needsReply, true)
          : undefined,
        input.filter === 'quiet' ? lt(analyses.importance, 1) : undefined,
        input.filter === 'inbox' && !searchIds
          ? sql`'INBOX' = ANY(${messages.labelIds})`
          : undefined,
        snoozed ? inArray(messages.threadId, snoozed) : undefined
      )
    )
    .orderBy(desc(messages.receivedAt))
    .limit(PAGE_SIZE)
}

export const getThread = async (userId: string, threadId: string) => {
  const rows = await db
    .select({
      analysis: analyses,
      message: messages,
    })
    .from(messages)
    .leftJoin(analyses, eq(analyses.messageId, messages.id))
    .where(and(eq(messages.userId, userId), eq(messages.threadId, threadId)))
    .orderBy(messages.receivedAt)

  if (rows.length === 0) {
    throw new NotFoundError('Thread not found')
  }

  const threadActions = await db
    .select()
    .from(actions)
    .where(and(eq(actions.userId, userId), eq(actions.threadId, threadId)))
    .orderBy(desc(actions.createdAt))

  return { actions: threadActions, messages: rows }
}

const getAction = async (userId: string, actionId: string) => {
  const [row] = await db
    .select({ action: actions, message: messages })
    .from(actions)
    .leftJoin(messages, eq(messages.id, actions.messageId))
    .where(and(eq(actions.id, actionId), eq(actions.userId, userId)))
  if (!row) {
    throw new NotFoundError('Action not found')
  }
  return row
}

const finish = (
  actionId: string,
  status: 'done' | 'dismissed',
  detail?: string
) =>
  db
    .update(actions)
    .set({
      resolvedAt: new Date(),
      status,
      ...(detail !== undefined && { detail }),
    })
    .where(eq(actions.id, actionId))
    .returning()

export const approveAction = async (
  userId: string,
  actionId: string,
  detail?: string
) => {
  const { action, message } = await getAction(userId, actionId)

  let outboxId: string | null = null
  if (message) {
    if (action.kind === 'reply') {
      const body = detail ?? action.detail
      if (!body) {
        throw new Error('Nothing to send')
      }
      ;({ id: outboxId } = await scheduleMail(userId, {
        actionId,
        html: textToHtml(body),
        mode: 'reply',
        replyToMessageId: message.id,
        subject: message.subject,
        text: body,
        to: [message.fromEmail],
      }))
    } else if (action.kind === 'unsubscribe' || action.kind === 'archive') {
      if (action.kind === 'unsubscribe' && message.listUnsubscribe) {
        await unsubscribeOneClick(
          message.listUnsubscribe,
          message.listUnsubscribePost
        )
      }
      await changeThreadLabels(userId, message.threadId, ARCHIVE)
    } else if (action.kind === 'trash') {
      await trashThread(userId, message.threadId)
    } else {
      await changeThreadLabels(userId, message.threadId, MARK_READ)
    }
  }

  const [done] = await finish(actionId, 'done', detail)
  return { ...expectRow(done), outboxId }
}

export const dismissAction = async (userId: string, actionId: string) => {
  await getAction(userId, actionId)
  const [dismissed] = await finish(actionId, 'dismissed')
  return expectRow(dismissed)
}

export const redraftAction = async (
  userId: string,
  actionId: string,
  instruction?: string
) => {
  const { action, message } = await getAction(userId, actionId)
  if (!message) {
    throw new NotFoundError('This action has no email to answer')
  }
  const detail = await writeReply({
    instruction,
    message,
    previousDraft: action.detail ?? undefined,
    userId,
  })
  const [updated] = await db
    .update(actions)
    .set({ detail })
    .where(eq(actions.id, actionId))
    .returning()
  return expectRow(updated)
}

export const updateDraft = async (
  userId: string,
  actionId: string,
  detail: string
) => {
  await getAction(userId, actionId)
  const [updated] = await db
    .update(actions)
    .set({ detail })
    .where(eq(actions.id, actionId))
    .returning()
  return expectRow(updated)
}

/** Reply on demand, from the Mail view, MCP or Telegram: reuses the open draft for the thread when there is one. */
export const draftReply = async (
  userId: string,
  messageId: string,
  instruction?: string
) => {
  const [message] = await db
    .select()
    .from(messages)
    .where(and(eq(messages.id, messageId), eq(messages.userId, userId)))
  if (!message) {
    throw new NotFoundError('Email not found')
  }
  const [open] = await db
    .select()
    .from(actions)
    .where(
      and(
        eq(actions.messageId, messageId),
        eq(actions.kind, 'reply'),
        eq(actions.status, 'pending')
      )
    )
  if (open) {
    return redraftAction(userId, open.id, instruction)
  }
  const [created] = await db
    .insert(actions)
    .values({
      autonomous: false,
      detail: await writeReply({ instruction, message, userId }),
      kind: 'reply',
      messageId,
      reason: 'Asked by you',
      status: 'pending',
      threadId: message.threadId,
      title: 'Reply',
      userId,
    })
    .returning()
  return expectRow(created)
}

export const recentImportant = (userId: string, hours: number) =>
  db
    .select({ analysis: analysisSummary, message: messageSummary })
    .from(messages)
    .innerJoin(analyses, eq(analyses.messageId, messages.id))
    .where(
      and(
        eq(messages.userId, userId),
        gte(messages.receivedAt, subHours(new Date(), hours)),
        gte(analyses.importance, 1)
      )
    )
    .orderBy(desc(analyses.importance), desc(messages.receivedAt))
    .limit(40)

const ownMessage = async (userId: string, messageId: string) => {
  const [message] = await db
    .select()
    .from(messages)
    .where(and(eq(messages.id, messageId), eq(messages.userId, userId)))
  if (!message) {
    throw new NotFoundError('Email not found')
  }
  return message
}

export const archiveMessage = async (userId: string, messageId: string) => {
  const message = await ownMessage(userId, messageId)
  await changeThreadLabels(userId, message.threadId, ARCHIVE)
}

/** One-click unsubscribe when the sender supports it; the thread is archived either way. */
export const unsubscribeMessage = async (userId: string, messageId: string) => {
  const message = await ownMessage(userId, messageId)
  const unsubscribed = message.listUnsubscribe
    ? await unsubscribeOneClick(
        message.listUnsubscribe,
        message.listUnsubscribePost
      )
    : false
  await changeThreadLabels(userId, message.threadId, ARCHIVE)
  return { unsubscribed }
}

export const trashMessage = async (userId: string, messageId: string) => {
  const message = await ownMessage(userId, messageId)
  await trashThread(userId, message.threadId)
  await changeThreadLabels(userId, message.threadId, {
    add: ['TRASH'],
    remove: ['INBOX'],
  })
}

/** Blocking is a simple rule: future mail from the sender goes to the trash on every plan. */
export const blockSender = async (userId: string, messageId: string) => {
  const message = await ownMessage(userId, messageId)
  await createRule(userId, {
    effect: 'trash',
    match: { field: 'from', value: message.fromEmail },
  })
  await trashMessage(userId, messageId)
}

export const snoozeMessage = async (
  userId: string,
  messageId: string,
  until: Date
) => {
  const message = await ownMessage(userId, messageId)
  await snoozeThread(userId, message.threadId, until)
}

export const unsnoozeMessage = async (userId: string, messageId: string) => {
  const message = await ownMessage(userId, messageId)
  await unsnoozeThread(userId, message.threadId)
}
