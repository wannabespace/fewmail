import { db } from '@fewmail/db'
import { actions, analyses, commitments, messages } from '@fewmail/db/schema'
import type { CleanupSender, MailCategory } from '@fewmail/shared/agent'
import { textToHtml } from '@fewmail/shared/email'
import { subHours } from 'date-fns'
import { and, desc, eq, exists, gte, inArray, lt, sql } from 'drizzle-orm'
import type { SQL } from 'drizzle-orm'
import { alias } from 'drizzle-orm/pg-core'

import { trashThread, unsubscribeOneClick } from '../lib/gmail'
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
import { activeTask } from './tasks'
import { changeThreadLabels, mailboxOfThread } from './thread-labels'
import { recordUnsubscribe, zombieStats } from './zombies'

export { NotFoundError } from './mail-errors'

const ARCHIVE = { remove: ['INBOX', 'UNREAD'] }
/** Kinds whose approval only acknowledges; the email stays as it is. */
const NO_GMAIL_CHANGE = new Set(['security', 'commitment', 'task', 'cleanup'])
const MARK_READ = { remove: ['UNREAD'] }

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
    .orderBy(desc(analyses.importance), actions.createdAt)

/** Kinds that never wait for the next delivery slot. */
const ALWAYS_NOW = new Set(['security', 'commitment', 'task'])

/** The queue as delivered: urgent items at once, the rest at the last calm slot (see batching). */
export const listQueueWithLater = async (userId: string) => {
  const [pending, settings] = await Promise.all([
    allPending(userId),
    getSettings(userId),
  ])
  if (!settings) {
    return { later: null, queue: pending }
  }
  const slots = deliverySlots(settings.timezone, settings.briefHour)
  const firstDay = settings.onboardedAt > slots.last
  const isVisible = (item: (typeof pending)[number]) =>
    firstDay ||
    item.action.createdAt <= slots.last ||
    ALWAYS_NOW.has(item.action.kind) ||
    (item.analysis?.importance ?? 0) >= 3
  const waiting = pending.filter((item) => !isVisible(item))
  return {
    later:
      waiting.length > 0 ? { at: slots.next, count: waiting.length } : null,
    queue: pending.filter(isVisible),
  }
}

export const listQueue = async (userId: string) => {
  const { queue } = await listQueueWithLater(userId)
  return queue
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

export type MailFilter =
  | 'spam'
  | 'inbox'
  | 'important'
  | 'needs_reply'
  | 'quiet'
  | 'snoozed'

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
    ? await searchMailboxes(userId, await toGmailQuery(input.search), PAGE_SIZE)
    : null
  const searchIds = found?.flatMap(({ ids }) => ids) ?? null

  if (searchIds?.length === 0) {
    return []
  }
  const snoozedIds =
    input.filter === 'snoozed' ? await snoozedThreadIds(userId) : null
  const snoozed = snoozedIds ? [...snoozedIds.keys()] : null
  if (snoozed?.length === 0) {
    return []
  }

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
        snoozed ? inArray(messages.threadId, snoozed) : undefined
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

/** One-click unsubscribe when the sender supports it; the thread is archived either way. */
/**
 * Unsubscribing is remembered so later mail exposes zombie senders; a sender the network
 * already knows ignores unsubscribes is blocked straight away instead of trusted again.
 */
const unsubscribeFrom = async (
  userId: string,
  message: typeof messages.$inferSelect
) => {
  await recordUnsubscribe(userId, message.fromEmail)
  const zombie = await zombieStats(message.fromEmail)
  if (zombie.isZombie) {
    await createRule(userId, {
      effect: 'trash',
      match: { field: 'from', value: message.fromEmail },
    })
  }
  const unsubscribed = message.listUnsubscribe
    ? await unsubscribeOneClick(
        message.listUnsubscribe,
        message.listUnsubscribePost
      )
    : false
  return { blocked: zombie.isZombie, unsubscribed }
}

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
    to: [message.fromEmail],
  })
  return id
}

const applyGmailChange = async (
  userId: string,
  action: typeof actions.$inferSelect,
  message: typeof messages.$inferSelect
) => {
  if (action.kind === 'unsubscribe' || action.kind === 'archive') {
    if (action.kind === 'unsubscribe') {
      await unsubscribeFrom(userId, message)
    }
    await changeThreadLabels(userId, message.threadId, ARCHIVE)
  } else if (action.kind === 'trash') {
    await trashThread(
      await mailboxOfThread(userId, message.threadId),
      message.threadId
    )
  } else {
    await changeThreadLabels(userId, message.threadId, MARK_READ)
  }
}

export const approveAction = async (
  userId: string,
  actionId: string,
  detail?: string
) => {
  const { action, message } = await getAction(userId, actionId)

  let outboxId: string | null = null
  await applyActionSideEffects(userId, action)
  const sendsMail =
    action.kind === 'reply' ||
    (action.kind === 'task' && !!(detail ?? action.detail))
  if (message && sendsMail) {
    outboxId = await scheduleActionReply(
      userId,
      actionId,
      message,
      detail ?? action.detail
    )
  } else if (message && !NO_GMAIL_CHANGE.has(action.kind)) {
    if (action.kind === 'reply') {
      outboxId = await scheduleActionReply(
        userId,
        actionId,
        message,
        detail ?? action.detail
      )
    } else {
      await applyGmailChange(userId, action, message)
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

export const unsubscribeMessage = async (userId: string, messageId: string) => {
  const message = await ownMessage(userId, messageId)
  const result = await unsubscribeFrom(userId, message)
  await changeThreadLabels(userId, message.threadId, ARCHIVE)
  return result
}

export const trashMessage = async (userId: string, messageId: string) => {
  const message = await ownMessage(userId, messageId)
  await trashThread(
    await mailboxOfThread(userId, message.threadId),
    message.threadId
  )
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
