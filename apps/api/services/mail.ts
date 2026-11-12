import { db } from '@fewmail/db'
import { actions, analyses, commitments, messages } from '@fewmail/db/schema'
import { ACTION_KIND_TRAITS, sendsDraft } from '@fewmail/shared/agent'
import type { CleanupSender, MailCategory } from '@fewmail/shared/agent'
import { replyRecipients, textToHtml } from '@fewmail/shared/email'
import { messages as dictionaries } from '@fewmail/shared/i18n'
import { subHours } from 'date-fns'
import {
  and,
  desc,
  eq,
  exists,
  gte,
  inArray,
  lt,
  notInArray,
  sql,
} from 'drizzle-orm'
import type { SQL } from 'drizzle-orm'
import { alias } from 'drizzle-orm/pg-core'

import { getMessage } from '../lib/gmail'
import { logError } from '../lib/log'
import { expectRow } from '../lib/rows'
import { writeReply } from './agent'
import { toGmailQuery } from './ask'
import { deliverySlots } from './batching'
import { runCleanup } from './cleanup'
import { NotFoundError } from './mail-errors'
import { searchMailboxes } from './mailboxes'
import { scheduleMail } from './outbox'
import { snoozedThreadIds, snoozeThread, unsnoozeThread } from './reminders'
import { createRule } from './rules'
import { getSettings } from './settings'
import { insertMessages } from './sync'
import { activeTask } from './tasks'
import { applyThreadEffect } from './thread-effects'
import { changeThreadLabels, MARK_READ, mailboxOfThread } from './thread-labels'
import { zombieStats } from './zombies'

export { NotFoundError } from './mail-errors'

const messageSummary = {
  bulkCount: messages.bulkCount,
  suspicion: messages.suspicion,
  risk: messages.risk,
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

const allPending = (userId: string) =>
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
    .orderBy(sql`${analyses.importance} desc nulls last`, actions.createdAt)

/** The queue as delivered: urgent items at once, the rest at the last calm slot (see batching). */
export const listQueueWithLater = async (userId: string) => {
  const [pending, settings] = await Promise.all([
    allPending(userId),
    getSettings(userId),
  ])
  if (!settings) {
    return { held: [], later: null, queue: pending }
  }
  const slots = deliverySlots(settings.timezone, settings.briefHour)
  const firstDay = settings.onboardedAt > slots.last
  const isVisible = (item: (typeof pending)[number]) =>
    firstDay ||
    item.action.createdAt <= slots.last ||
    ACTION_KIND_TRAITS[item.action.kind].immediate ||
    (item.analysis?.importance ?? 0) >= 3
  const held = pending.filter((item) => !isVisible(item))
  return {
    held,
    later: held.length > 0 ? { at: slots.next, count: held.length } : null,
    queue: pending.filter(isVisible),
  }
}

export const listQueue = async (userId: string) => {
  const { queue } = await listQueueWithLater(userId)
  return queue
}

export const countQueue = async (userId: string) => {
  const queue = await listQueue(userId)
  return queue.length
}

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
    spam: byKind.spam ?? 0,
    total: rows.reduce((sum, { count }) => sum + count, 0),
    unsubscribed: byKind.unsubscribe ?? 0,
  }
}

const HANDLED_HOURS = 24
const HANDLED_SHOWN = 100

export const listHandled = (
  userId: string,
  since = subHours(new Date(), HANDLED_HOURS)
) =>
  db
    .select({
      action: {
        createdAt: actions.createdAt,
        id: actions.id,
        kind: actions.kind,
        reason: actions.reason,
        title: actions.title,
      },
      message: {
        fromEmail: messages.fromEmail,
        fromName: messages.fromName,
        id: messages.id,
        subject: messages.subject,
        threadId: messages.threadId,
      },
      summary: analyses.summary,
    })
    .from(actions)
    .leftJoin(messages, eq(messages.id, actions.messageId))
    .leftJoin(analyses, eq(analyses.messageId, actions.messageId))
    .where(
      and(
        eq(actions.userId, userId),
        eq(actions.status, 'auto_done'),
        gte(actions.createdAt, since)
      )
    )
    .orderBy(desc(actions.createdAt))
    .limit(HANDLED_SHOWN)

export type MailFilter =
  | 'spam'
  | 'inbox'
  | 'important'
  | 'needs_reply'
  | 'quiet'
  | 'snoozed'
  | 'archive'
  | 'trash'

const PAGE_SIZE = 50
const inThread = alias(messages, 'in_thread')
const INBOX_FILTERS = new Set<MailFilter>([
  'inbox',
  'important',
  'needs_reply',
  'quiet',
])

const FILTER_WHERE: Partial<Record<MailFilter, SQL>> = {
  important: gte(analyses.importance, 2),
  needs_reply: eq(analyses.needsReply, true),
  quiet: lt(analyses.importance, 1),
  spam: sql`'SPAM' = ANY(${messages.labelIds})`,
  archive: sql`not (${messages.labelIds} && array['INBOX', 'SPAM', 'TRASH'])`,
  trash: sql`'TRASH' = ANY(${messages.labelIds})`,
}

// Snoozed threads are out of the inbox too, so Archive must leave them to Snoozed.
const snoozedWhere = async (userId: string, filter: MailFilter) => {
  if (filter !== 'snoozed' && filter !== 'archive') {
    return
  }
  const snoozedIds = await snoozedThreadIds(userId)
  const snoozed = [...snoozedIds.keys()]
  return filter === 'snoozed'
    ? inArray(messages.threadId, snoozed)
    : notInArray(messages.threadId, snoozed)
}

export const listMail = async (
  userId: string,
  input: {
    before?: Date
    category?: MailCategory
    filter: MailFilter
    mailboxId?: string
    search?: string
  }
) => {
  const found = input.search
    ? await searchMailboxes(
        userId,
        await toGmailQuery(userId, input.search),
        PAGE_SIZE,
        input.mailboxId
      )
    : null
  await Promise.all(
    (found ?? []).map(({ ids, mailbox }) =>
      insertMessages(mailbox, ids).catch((error) =>
        logError('storing found mail failed', error)
      )
    )
  )
  const searchIds = found?.flatMap(({ ids }) => ids) ?? null

  if (searchIds?.length === 0) {
    return []
  }
  const snoozed = await snoozedWhere(userId, input.filter)

  const latestInThread = db
    .selectDistinctOn([messages.threadId], {
      id: messages.id,
      receivedAt: messages.receivedAt,
    })
    .from(messages)
    .leftJoin(analyses, eq(analyses.messageId, messages.id))
    .where(
      and(
        eq(messages.userId, userId),
        eq(messages.isFromMe, false),
        input.mailboxId ? eq(messages.mailboxId, input.mailboxId) : undefined,
        searchIds ? inArray(messages.gmailId, searchIds) : undefined,
        input.category ? eq(analyses.category, input.category) : undefined,
        FILTER_WHERE[input.filter],
        INBOX_FILTERS.has(input.filter) && !searchIds
          ? sql`'INBOX' = ANY(${messages.labelIds})`
          : undefined,
        snoozed
      )
    )
    .orderBy(messages.threadId, desc(messages.receivedAt))
    .as('latest_in_thread')

  const sameThread = and(
    eq(inThread.userId, messages.userId),
    eq(inThread.threadId, messages.threadId)
  )
  return db
    .select({
      analysis: analysisSummary,
      message: {
        ...messageSummary,
        isUnread: sql<boolean>`${exists(
          db
            .select({ id: inThread.id })
            .from(inThread)
            .where(and(sameThread, eq(inThread.isUnread, true)))
        )}`,
      },
      threadSize: sql<number>`(${db
        .select({ size: sql`count(*)` })
        .from(inThread)
        .where(sameThread)})`.mapWith(Number),
    })
    .from(latestInThread)
    .innerJoin(messages, eq(messages.id, latestInThread.id))
    .leftJoin(analyses, eq(analyses.messageId, messages.id))
    .where(
      input.before ? lt(latestInThread.receivedAt, input.before) : undefined
    )
    .orderBy(desc(latestInThread.receivedAt))
    .limit(PAGE_SIZE)
}

/** Unread threads still in the inbox, per mail filter. */
export const countUnread = async (userId: string, mailboxId?: string) => {
  const [counts] = await db
    .select({
      important:
        sql<number>`count(distinct ${messages.threadId}) filter (where ${analyses.importance} >= 2)`.mapWith(
          Number
        ),
      inbox: sql<number>`count(distinct ${messages.threadId})`.mapWith(Number),
      needs_reply:
        sql<number>`count(distinct ${messages.threadId}) filter (where ${analyses.needsReply})`.mapWith(
          Number
        ),
      quiet:
        sql<number>`count(distinct ${messages.threadId}) filter (where ${analyses.importance} < 1)`.mapWith(
          Number
        ),
    })
    .from(messages)
    .leftJoin(analyses, eq(analyses.messageId, messages.id))
    .where(
      and(
        eq(messages.userId, userId),
        eq(messages.isFromMe, false),
        eq(messages.isUnread, true),
        mailboxId ? eq(messages.mailboxId, mailboxId) : undefined,
        sql`'INBOX' = ANY(${messages.labelIds})`
      )
    )
  return expectRow(counts)
}

export const markThreadRead = (userId: string, threadId: string) =>
  changeThreadLabels(userId, threadId, MARK_READ)

const fillMissingHtml = async (
  userId: string,
  threadId: string,
  rows: { message: { gmailId: string; html: string | null; id: string } }[]
) => {
  const missing = rows.filter(({ message }) => message.html === null)
  if (missing.length === 0) {
    return
  }
  const mailbox = await mailboxOfThread(userId, threadId)
  await Promise.all(
    missing.map(async ({ message }) => {
      const parsed = await getMessage(mailbox, message.gmailId).catch(
        () => null
      )
      if (parsed) {
        message.html = parsed.html
        await db
          .update(messages)
          .set({ html: parsed.html })
          .where(eq(messages.id, message.id))
      }
    })
  )
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
  await fillMissingHtml(userId, threadId, rows)

  const threadActions = await db
    .select()
    .from(actions)
    .where(and(eq(actions.userId, userId), eq(actions.threadId, threadId)))
    .orderBy(desc(actions.createdAt))

  const latest = rows.findLast(({ message }) => !message.isFromMe)?.message
  const [task, zombie] = await Promise.all([
    activeTask(userId, threadId),
    latest?.listUnsubscribe ? zombieStats(latest.fromEmail) : null,
  ])

  return {
    actions: threadActions,
    messages: rows,
    task: task && { goal: task.goal, id: task.id, summary: task.summary },
    zombieShare:
      zombie && zombie.total >= 3 ? Math.round(zombie.share * 100) : null,
  }
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

const applyActionSideEffects = async (
  userId: string,
  action: typeof actions.$inferSelect
) => {
  if (action.kind === 'cleanup') {
    const senders = (action.payload?.senders ?? []) as CleanupSender[]
    await runCleanup(userId, senders)
  }
  if (
    action.kind === 'commitment' &&
    typeof action.payload?.commitmentId === 'string'
  ) {
    await db
      .update(commitments)
      .set({ status: 'done' })
      .where(
        and(
          eq(commitments.id, action.payload.commitmentId),
          eq(commitments.userId, userId)
        )
      )
  }
}

const scheduleActionReply = async (
  userId: string,
  actionId: string,
  message: typeof messages.$inferSelect,
  body: string | null | undefined
) => {
  if (!body) {
    throw new Error('Nothing to send')
  }
  const { id } = await scheduleMail(userId, {
    actionId,
    html: textToHtml(body),
    mode: 'reply',
    replyToMessageId: message.id,
    subject: message.subject,
    text: body,
    to: replyRecipients(message),
  })
  return id
}

export const approveAction = async (
  userId: string,
  actionId: string,
  detail?: string
) => {
  const { action, message } = await getAction(userId, actionId)
  const [claimed] = await db
    .update(actions)
    .set({ resolvedAt: new Date(), status: 'done' })
    .where(and(eq(actions.id, actionId), eq(actions.status, 'pending')))
    .returning({ id: actions.id })
  if (!claimed) {
    throw new NotFoundError('Action already handled')
  }

  let outboxId: string | null = null
  const body = detail ?? action.detail
  const { gmail } = ACTION_KIND_TRAITS[action.kind]
  try {
    await applyActionSideEffects(userId, action)
    if (message && sendsDraft({ detail: body, kind: action.kind })) {
      outboxId = await scheduleActionReply(userId, actionId, message, body)
    } else if (message && gmail) {
      await applyThreadEffect(userId, message, gmail)
    }
  } catch (error) {
    await db
      .update(actions)
      .set({ resolvedAt: null, status: 'pending' })
      .where(eq(actions.id, actionId))
    throw error
  }

  const [done] = await finish(actionId, 'done', detail)
  return { ...expectRow(done), outboxId }
}

export const dismissAction = async (userId: string, actionId: string) => {
  await getAction(userId, actionId)
  const [dismissed] = await db
    .update(actions)
    .set({ resolvedAt: new Date(), status: 'dismissed' })
    .where(and(eq(actions.id, actionId), eq(actions.status, 'pending')))
    .returning()
  if (!dismissed) {
    throw new NotFoundError('Action already handled')
  }
  return dismissed
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

/** A reply for the composer to edit; nothing is queued. */
export const writeReplyTo = async (
  userId: string,
  messageId: string,
  instruction?: string
) =>
  writeReply({
    instruction,
    message: await ownMessage(userId, messageId),
    userId,
  })

/** Reply on demand, from the Mail view, MCP or Telegram: reuses the open draft for the thread when there is one. */
export const draftReply = async (
  userId: string,
  messageId: string,
  instruction?: string
) => {
  const message = await ownMessage(userId, messageId)
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
  const [detail, settings] = await Promise.all([
    writeReply({ instruction, message, userId }),
    getSettings(userId),
  ])
  const t = dictionaries[settings?.language ?? 'en']
  const [created] = await db
    .insert(actions)
    .values({
      autonomous: false,
      detail,
      kind: 'reply',
      messageId,
      reason: t.queue.askedByYou,
      status: 'pending',
      threadId: message.threadId,
      title: t.actionKind.reply,
      userId,
    })
    .returning()
  return expectRow(created)
}

const worthKnowingSince = (userId: string, hours: number) =>
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

export const recentImportant = (userId: string, hours: number) =>
  worthKnowingSince(userId, hours)
    .orderBy(desc(analyses.importance), desc(messages.receivedAt))
    .limit(40)

const PEOPLE_CATEGORIES = new Set(['person', 'work'])
const LIST_CATEGORIES = new Set(['newsletter', 'promotion'])

/** How much mail came in since `since`, split into people and mailing lists. */
export const mailPulse = async (userId: string, since: Date) => {
  const rows = await db
    .select({ category: analyses.category, count: sql<number>`count(*)::int` })
    .from(messages)
    .leftJoin(analyses, eq(analyses.messageId, messages.id))
    .where(
      and(
        eq(messages.userId, userId),
        eq(messages.isFromMe, false),
        gte(messages.receivedAt, since)
      )
    )
    .groupBy(analyses.category)
  const countOf = (categories: Set<string>) =>
    rows
      .filter(({ category }) => category && categories.has(category))
      .reduce((sum, { count }) => sum + count, 0)
  return {
    lists: countOf(LIST_CATEGORIES),
    people: countOf(PEOPLE_CATEGORIES),
    total: rows.reduce((sum, { count }) => sum + count, 0),
  }
}

const DATES_WINDOW_HOURS = 7 * 24
const DATES_SCANNED = 200
const DATES_SHOWN = 6

/** Recent mail that names a due date or a meeting time, newest first; the dates stay as written. */
export const mailWithDates = async (userId: string) => {
  const rows = await worthKnowingSince(userId, DATES_WINDOW_HOURS)
    .orderBy(desc(messages.receivedAt))
    .limit(DATES_SCANNED)
  return rows
    .filter(
      ({ analysis }) =>
        analysis.extracted.dueDate || analysis.extracted.meetingTime
    )
    .slice(0, DATES_SHOWN)
}

export const archiveMessage = async (userId: string, messageId: string) =>
  applyThreadEffect(userId, await ownMessage(userId, messageId), 'archive')

export const trashMessage = async (userId: string, messageId: string) =>
  applyThreadEffect(userId, await ownMessage(userId, messageId), 'trash')

export const moveToInbox = async (userId: string, messageId: string) => {
  const message = await ownMessage(userId, messageId)
  await changeThreadLabels(userId, message.threadId, {
    add: ['INBOX'],
    remove: ['TRASH'],
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
