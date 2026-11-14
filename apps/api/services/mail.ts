import { db } from '@fewmail/db'
import {
  actions,
  analyses,
  commitments,
  mailboxes,
  messages,
  rules,
} from '@fewmail/db/schema'
import {
  ACTION_KIND_TRAITS,
  cardPayload,
  IMPORTANCE,
  LIST_CATEGORIES,
  PEOPLE_CATEGORIES,
  PROPOSAL_KINDS,
  SECONDS_SAVED,
  sendsDraft,
  TIDY_KINDS,
} from '@fewmail/shared/agent'
import type { CleanupSender, MailCategory } from '@fewmail/shared/agent'
import { replyRecipients, textToHtml } from '@fewmail/shared/email'
import { messages as dictionaries } from '@fewmail/shared/i18n'
import { Result } from 'better-result'
import { subHours, subMinutes } from 'date-fns'
import {
  and,
  arrayContains,
  desc,
  eq,
  exists,
  gt,
  gte,
  inArray,
  isNotNull,
  lt,
  ne,
  notExists,
  notInArray,
  or,
  sql,
} from 'drizzle-orm'
import type { SQL } from 'drizzle-orm'
import { alias } from 'drizzle-orm/pg-core'

import { getLabelCounts, getMessage } from '../lib/gmail'
import type { ParsedMessage } from '../lib/gmail'
import { ACTION_TOPICS, announceChange } from '../lib/live'
import { logError } from '../lib/log'
import { capture } from '../lib/posthog'
import { expectRow } from '../lib/rows'
import { writeReply } from './agent'
import { searchByQuestion } from './ask'
import { createEvent } from './calendar'
import { runCleanup } from './cleanup'
import { NotFoundError } from './mail-errors'
import {
  listOlderThreads,
  liveMessageId,
  readOlderMessages,
} from './older-mail'
import { scheduleMail } from './outbox'
import { snoozedThreadIds, snoozeThread, unsnoozeThread } from './reminders'
import { createRule } from './rules'
import { getSettings } from './settings'
import { reportSpam } from './spam'
import { holdThread, ownMessage } from './stored-mail'
import { applyThreadEffect } from './thread-effects'
import { changeThreadLabels, MARK_READ, mailboxOfThread } from './thread-labels'
import { zombieStats } from './zombies'

export { NotFoundError } from './mail-errors'

const messageSummary = {
  bulkCount: messages.bulkCount,
  suspicion: messages.suspicion,
  risk: messages.risk,
  code: messages.code,
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
      message: {
        ...messageSummary,
        isFromMe: messages.isFromMe,
        to: messages.to,
      },
      rule: rules.instruction,
    })
    .from(actions)
    .leftJoin(messages, eq(messages.id, actions.messageId))
    .leftJoin(analyses, eq(analyses.messageId, actions.messageId))
    .leftJoin(rules, eq(rules.id, actions.ruleId))
    .where(and(eq(actions.userId, userId), eq(actions.status, 'pending')))
    .orderBy(
      sql`${analyses.importance} desc nulls last`,
      sql`${analyses.needsReply} desc nulls last`,
      actions.createdAt
    )

/** Pending cards, the agent's proposals apart: Home counts those as one decision (`countToday`). */
export const countQueue = async (userId: string) => {
  const isProposal = inArray(actions.kind, [...PROPOSAL_KINDS])
  const [row] = await db
    .select({
      cards: sql<number>`count(*) filter (where not ${isProposal})::int`,
      proposals: sql<number>`count(*) filter (where ${isProposal})::int`,
    })
    .from(actions)
    .where(and(eq(actions.userId, userId), eq(actions.status, 'pending')))
  return expectRow(row)
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

/** Mail the agent handled on its own plus replies sent from its drafts, priced by `SECONDS_SAVED`. */
export const timeSaved = async (userId: string, since: Date) => {
  const [row] = await db
    .select({
      handled: sql<number>`count(*) filter (where ${actions.status} = 'auto_done' and ${actions.createdAt} >= ${since})::int`,
      replies: sql<number>`count(*) filter (where ${actions.status} = 'done' and ${actions.kind} = 'reply' and ${actions.updatedAt} >= ${since})::int`,
    })
    .from(actions)
    .where(
      and(
        eq(actions.userId, userId),
        inArray(actions.status, ['auto_done', 'done']),
        gte(actions.updatedAt, since)
      )
    )
  const { handled, replies } = expectRow(row)
  return {
    handled,
    minutes: Math.round(
      (handled * SECONDS_SAVED.handled + replies * SECONDS_SAVED.reply) / 60
    ),
    replies,
  }
}

const HANDLED_HOURS = 24
const HANDLED_SHOWN = 100
const actedAt =
  sql<Date>`coalesce(${actions.resolvedAt}, ${actions.createdAt})`.mapWith(
    actions.createdAt
  )

/** The journal: everything the agent did after the user's yes (`done`) or by a rule they turned on (`auto_done`, `rule`), and what failed. */
export const listHandled = (
  userId: string,
  since = subHours(new Date(), HANDLED_HOURS)
) =>
  db
    .select({
      action: {
        actedAt,
        createdAt: actions.createdAt,
        detail: actions.detail,
        id: actions.id,
        kind: actions.kind,
        reason: actions.reason,
        status: actions.status,
        title: actions.title,
      },
      rule: rules.instruction,
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
    .leftJoin(rules, eq(rules.id, actions.ruleId))
    .where(
      and(
        eq(actions.userId, userId),
        inArray(actions.status, ['done', 'auto_done', 'failed']),
        gte(actedAt, since)
      )
    )
    .orderBy(desc(actedAt))
    .limit(HANDLED_SHOWN)

const PAGE_SIZE = 50

export type MailFilter =
  | 'spam'
  | 'inbox'
  | 'unread'
  | 'important'
  | 'needs_reply'
  | 'quiet'
  | 'snoozed'
  | 'archive'
  | 'trash'
  | 'pinned'

const inThread = alias(messages, 'in_thread')
const newerInThread = alias(messages, 'newer_in_thread')
const newerAnalysis = alias(analyses, 'newer_analysis')
const starredInThread = alias(messages, 'starred_in_thread')
const sameSender = alias(messages, 'same_sender')
type MessageTable = typeof messages | typeof newerInThread

/** A pin is Gmail's star on any email of the thread, so it follows the thread whoever starred it. */
const isPinned = (message: MessageTable) =>
  exists(
    db
      .select({ id: starredInThread.id })
      .from(starredInThread)
      .where(
        and(
          eq(starredInThread.userId, message.userId),
          eq(starredInThread.threadId, message.threadId),
          arrayContains(starredInThread.labelIds, ['STARRED'])
        )
      )
  )

/** Mail the user received: their own sent mail is left out unless Gmail put it in the inbox (mail to themselves). */
const isReceived = (message: MessageTable) =>
  or(eq(message.isFromMe, false), arrayContains(message.labelIds, ['INBOX']))
type AnalysisTable = typeof analyses | typeof newerAnalysis

const INBOX_FILTERS = new Set<MailFilter>([
  'inbox',
  'unread',
  'important',
  'needs_reply',
  'quiet',
  'pinned',
])

const FILTER_WHERE: Partial<
  Record<MailFilter, (message: MessageTable, analysis: AnalysisTable) => SQL>
> = {
  unread: (message) => eq(message.isUnread, true),
  important: (_, analysis) => gte(analysis.importance, 2),
  needs_reply: (_, analysis) => eq(analysis.needsReply, true),
  quiet: (_, analysis) => lt(analysis.importance, 1),
  spam: (message) => arrayContains(message.labelIds, ['SPAM']),
  archive: (message) =>
    sql`not (${message.labelIds} && array['INBOX', 'SPAM', 'TRASH'])`,
  trash: (message) => arrayContains(message.labelIds, ['TRASH']),
  pinned: isPinned,
}

// Snoozed threads are out of the inbox too, so Archive must leave them to Snoozed.
const snoozedOf = async (userId: string, filter: MailFilter) => {
  if (filter !== 'snoozed' && filter !== 'archive') {
    return
  }
  const snoozed = await snoozedThreadIds(userId)
  const threadIds = [...snoozed.keys()]
  return {
    isListed: (threadId: string) =>
      snoozed.has(threadId) === (filter === 'snoozed'),
    where:
      filter === 'snoozed'
        ? inArray(messages.threadId, threadIds)
        : notInArray(messages.threadId, threadIds),
  }
}

// A draft may have no From yet, so it reads as received; it is never stored, so opening it would answer Thread not found.
const isReceivedMail = (message: ParsedMessage) =>
  !message.labelIds.includes('DRAFT') &&
  (!message.isFromMe || message.labelIds.includes('INBOX'))

const labelled =
  (...labels: string[]) =>
  (message: ParsedMessage) =>
    isReceivedMail(message) &&
    labels.every((label) => message.labelIds.includes(label))

const OUT_OF_ARCHIVE = new Set(['INBOX', 'SPAM', 'TRASH'])

/** Lists that go on past the held mail, read live from Gmail; the rest need analysis or reminders, which only held mail has. */
const OLDER_LISTS: Partial<
  Record<
    MailFilter,
    { isListed: (message: ParsedMessage) => boolean; query: string }
  >
> = {
  archive: {
    isListed: (message) =>
      isReceivedMail(message) &&
      !message.labelIds.some((label) => OUT_OF_ARCHIVE.has(label)),
    query: '-in:inbox -in:spam -in:trash',
  },
  inbox: { isListed: labelled('INBOX'), query: 'in:inbox' },
  pinned: { isListed: labelled('INBOX'), query: 'in:inbox is:starred' },
  spam: { isListed: labelled('SPAM'), query: 'in:spam' },
  trash: { isListed: labelled('TRASH'), query: 'in:trash' },
  unread: {
    isListed: labelled('INBOX', 'UNREAD'),
    query: 'in:inbox is:unread',
  },
}

type OlderThread = Awaited<
  ReturnType<typeof listOlderThreads>
>['threads'][number]

/** Found mail Fewmail holds is listed from the database; the rest is read live, never stored. */
const searchMail = async (
  userId: string,
  search: string,
  mailboxId?: string
) => {
  const { results } = await searchByQuestion(
    userId,
    search,
    PAGE_SIZE,
    mailboxId
  )
  const ids = results.flatMap((result) => result.ids)
  const held = ids.length
    ? await db
        .select({ gmailId: messages.gmailId, mailboxId: messages.mailboxId })
        .from(messages)
        .where(and(eq(messages.userId, userId), inArray(messages.gmailId, ids)))
    : []
  const heldKeys = new Set(
    held.map((message) => `${message.mailboxId}:${message.gmailId}`)
  )
  const older = await Promise.all(
    results.map(async ({ ids: found, mailbox }) => {
      const read = await Result.tryPromise(() =>
        readOlderMessages(
          mailbox,
          found.filter((id) => !heldKeys.has(`${mailbox.id}:${id}`))
        )
      )
      return read.unwrapOr([])
    })
  )
  return {
    heldIds: held.map(({ gmailId }) => gmailId),
    older: older.flat().filter(({ message }) => isReceivedMail(message)),
  }
}

interface ListInput {
  before?: Date
  category?: MailCategory
  filter: MailFilter
  mailboxId?: string
  search?: string
}

const listHeldMail = (
  userId: string,
  input: ListInput,
  {
    isBounded,
    searchIds,
    snoozed,
  }: { isBounded: boolean; searchIds?: string[]; snoozed?: SQL }
) => {
  const matches = (message: MessageTable, analysis: AnalysisTable) =>
    and(
      eq(message.userId, userId),
      isReceived(message),
      input.mailboxId ? eq(message.mailboxId, input.mailboxId) : undefined,
      searchIds ? inArray(message.gmailId, searchIds) : undefined,
      input.category ? eq(analysis.category, input.category) : undefined,
      FILTER_WHERE[input.filter]?.(message, analysis),
      INBOX_FILTERS.has(input.filter) && !searchIds
        ? arrayContains(message.labelIds, ['INBOX'])
        : undefined
    )
  // Without the id tie-break a thread whose two latest matching messages share a timestamp is listed twice.
  const newerMatch = db
    .select({ id: newerInThread.id })
    .from(newerInThread)
    .leftJoin(newerAnalysis, eq(newerAnalysis.messageId, newerInThread.id))
    .where(
      and(
        eq(newerInThread.threadId, messages.threadId),
        or(
          gt(newerInThread.receivedAt, messages.receivedAt),
          and(
            eq(newerInThread.receivedAt, messages.receivedAt),
            gt(newerInThread.id, messages.id)
          )
        ),
        matches(newerInThread, newerAnalysis)
      )
    )

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
        isPinned: sql<boolean>`${isPinned(messages)}`,
      },
      threadSize: sql<number>`(${db
        .select({ size: sql`count(*)` })
        .from(inThread)
        .where(sameThread)})`.mapWith(Number),
    })
    .from(messages)
    .innerJoin(mailboxes, eq(mailboxes.id, messages.mailboxId))
    .leftJoin(analyses, eq(analyses.messageId, messages.id))
    .where(
      and(
        matches(messages, analyses),
        snoozed,
        // Older mail a thread opened from the live list left behind is listed live with the rest of its age.
        isBounded ? gte(messages.receivedAt, mailboxes.heldSince) : undefined,
        input.before ? lt(messages.receivedAt, input.before) : undefined,
        notExists(newerMatch)
      )
    )
    .orderBy(desc(messages.receivedAt))
    .limit(PAGE_SIZE)
}

type MailRow = Awaited<ReturnType<typeof listHeldMail>>[number]

const olderRowOf = ({ mailbox, message, thread }: OlderThread): MailRow => ({
  analysis: null,
  message: {
    bulkCount: null,
    code: message.code,
    fromEmail: message.fromEmail,
    fromName: message.fromName,
    gmailId: message.gmailId,
    hasAttachments: message.hasAttachments,
    id: liveMessageId(mailbox.id, message.gmailId),
    isPinned: thread.some(({ labelIds }) => labelIds.includes('STARRED')),
    isUnread: thread.some(({ isUnread }) => isUnread),
    receivedAt: message.receivedAt,
    risk: null,
    snippet: message.snippet,
    subject: message.subject,
    suspicion: null,
    threadId: message.threadId,
  },
  threadSize: thread.length,
})

const mailboxesOf = (userId: string, mailboxId?: string) =>
  db
    .select()
    .from(mailboxes)
    .where(
      and(
        eq(mailboxes.userId, userId),
        mailboxId ? eq(mailboxes.id, mailboxId) : undefined
      )
    )

/**
 * A full page of held mail ends at its oldest row: Gmail is asked only for what lies between that and where each
 * mailbox's held mail begins. `floor` is where every source is still whole: a row below it may have older neighbours
 * a source has not read yet, and the web's next page starts after the oldest row it got.
 */
const listOlderMail = async (
  userId: string,
  input: ListInput,
  list: NonNullable<(typeof OLDER_LISTS)[MailFilter]>,
  held: MailRow[]
) => {
  const heldFloor =
    held.length === PAGE_SIZE ? held.at(-1)?.message.receivedAt : undefined
  const owned = await mailboxesOf(userId, input.mailboxId)
  // A failed mailbox fails the page: an empty answer for it let the next page start past all of its older mail.
  const read = await Promise.all(
    owned
      .filter(({ heldSince }) => !heldFloor || heldSince > heldFloor)
      .map((mailbox) =>
        listOlderThreads(mailbox, list, {
          after: heldFloor,
          before: input.before,
        })
      )
  )
  const floors = [heldFloor, ...read.map(({ floor }) => floor)].filter(
    (floor) => floor !== undefined
  )
  return {
    floor: floors.length
      ? new Date(Math.max(...floors.map(Number)))
      : undefined,
    threads: read.flatMap(({ threads }) => threads),
  }
}

export const listMail = async (userId: string, input: ListInput) => {
  const older =
    input.search || input.category ? undefined : OLDER_LISTS[input.filter]
  const [found, snoozed] = await Promise.all([
    input.search ? searchMail(userId, input.search, input.mailboxId) : null,
    snoozedOf(userId, input.filter),
  ])
  if (found?.heldIds.length === 0 && found.older.length === 0) {
    return []
  }
  const held = await listHeldMail(userId, input, {
    isBounded: !!older,
    searchIds: found?.heldIds,
    snoozed: snoozed?.where,
  })
  // The first page is held mail only: Gmail is read when a list is scrolled, never for every list on every refresh.
  const fromGmail =
    older && input.before
      ? await listOlderMail(userId, input, older, held)
      : { floor: undefined, threads: found?.older ?? [] }
  const threadIds = new Set<string>()
  return [
    ...held,
    ...fromGmail.threads
      .filter(({ message }) => snoozed?.isListed(message.threadId) ?? true)
      .map(olderRowOf),
  ]
    .filter(
      ({ message }) => !fromGmail.floor || message.receivedAt >= fromGmail.floor
    )
    .toSorted(
      (left, right) =>
        right.message.receivedAt.getTime() - left.message.receivedAt.getTime()
    )
    .filter(
      ({ message }) =>
        !threadIds.has(message.threadId) && !!threadIds.add(message.threadId)
    )
    .slice(0, PAGE_SIZE)
}

/** Conversations in the inbox as Gmail counts them, held by Fewmail or not. */
export const countInboxInGmail = async (userId: string, mailboxId?: string) => {
  const owned = await mailboxesOf(userId, mailboxId)
  const counts = await Promise.all(
    owned.map((mailbox) => getLabelCounts(mailbox, 'INBOX'))
  )
  return counts.reduce((total, { threadsTotal }) => total + threadsTotal, 0)
}

/** Unread threads still in the inbox. */
export const countUnread = async (userId: string, mailboxId?: string) => {
  const [counts] = await db
    .select({
      inbox: sql<number>`count(distinct ${messages.threadId})`.mapWith(Number),
    })
    .from(messages)
    .where(
      and(
        eq(messages.userId, userId),
        isReceived(messages),
        eq(messages.isUnread, true),
        mailboxId ? eq(messages.mailboxId, mailboxId) : undefined,
        arrayContains(messages.labelIds, ['INBOX'])
      )
    )
  return expectRow(counts)
}

export const markThreadRead = (userId: string, threadId: string) =>
  changeThreadLabels(userId, threadId, MARK_READ)

export const markThreadUnread = (userId: string, threadId: string) =>
  changeThreadLabels(userId, threadId, { add: ['UNREAD'] })

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

const threadRows = (userId: string, threadId: string) =>
  db
    .select({
      analysis: analyses,
      message: messages,
    })
    .from(messages)
    .leftJoin(analyses, eq(analyses.messageId, messages.id))
    .where(and(eq(messages.userId, userId), eq(messages.threadId, threadId)))
    .orderBy(messages.receivedAt)

/** A thread listed live from Gmail is stored when it is first opened, a hover's prefetch included. */
const heldThreadRows = async (userId: string, threadId: string) => {
  const rows = await threadRows(userId, threadId)
  if (rows.length > 0) {
    return rows
  }
  await holdThread(userId, threadId)
  return threadRows(userId, threadId)
}

export const getThread = async (userId: string, threadId: string) => {
  const [rows, threadActions] = await Promise.all([
    heldThreadRows(userId, threadId),
    db
      .select()
      .from(actions)
      .where(and(eq(actions.userId, userId), eq(actions.threadId, threadId)))
      .orderBy(desc(actions.createdAt)),
  ])
  if (rows.length === 0) {
    throw new NotFoundError('Thread not found')
  }

  const latest = rows.findLast(({ message }) => !message.isFromMe)?.message
  const [zombie] = await Promise.all([
    latest?.listUnsubscribe ? zombieStats(latest) : null,
    fillMissingHtml(userId, threadId, rows),
  ])

  return {
    actions: threadActions,
    messages: rows,
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

const MEETING_MINUTES = 60

/** Adds wall-clock minutes without passing through any zone: Google reads both ends in `timeZone`. */
const wallTimeAfter = (start: string, minutes: number) =>
  new Date(Date.parse(`${start}:00Z`) + minutes * 60_000)
    .toISOString()
    .slice(0, 19)

const addEventOf = (
  userId: string,
  action: typeof actions.$inferSelect,
  message: typeof messages.$inferSelect | null
) => {
  const { event } = cardPayload(action)
  return (
    event &&
    createEvent(userId, {
      allDay: false,
      end: wallTimeAfter(event.start, MEETING_MINUTES),
      mailboxId: message?.mailboxId,
      start: `${event.start}:00`,
      timeZone: event.timeZone,
      title: event.title,
    })
  )
}

/** A reply card's meeting goes in the calendar on its own button: the reply still waits for its own yes. */
export const addCardEvent = async (userId: string, actionId: string) => {
  const { action, message } = await getAction(userId, actionId)
  const { event, ...payload } = cardPayload(action)
  if (action.status !== 'pending' || !event) {
    throw new NotFoundError('No event on this card')
  }
  await addEventOf(userId, action, message)
  await db.update(actions).set({ payload }).where(eq(actions.id, actionId))
  await announceChange(userId, ACTION_TOPICS)
}

const applyActionSideEffects = async (
  userId: string,
  action: typeof actions.$inferSelect,
  message: typeof messages.$inferSelect | null
) => {
  // A reply's event is added only by its own button (`addCardEvent`), never by Send.
  if (action.kind === 'schedule') {
    await addEventOf(userId, action, message)
  }
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
  // A consent card runs an agent tool: only `approveCard` (the user's yes) may, never a tool approving it.
  if (action.kind === 'consent') {
    throw new NotFoundError('Only the user approves this card')
  }
  const [claimed] = await db
    .update(actions)
    .set({ resolvedAt: new Date(), status: 'done' })
    .where(and(eq(actions.id, actionId), eq(actions.status, 'pending')))
    .returning({ id: actions.id })
  if (!claimed) {
    throw new NotFoundError('Action already handled')
  }

  const body = detail ?? action.detail
  const { gmail } = ACTION_KIND_TRAITS[action.kind]
  const applied = await Result.tryPromise(async () => {
    await applyActionSideEffects(userId, action, message)
    if (message && sendsDraft(action)) {
      return scheduleActionReply(userId, actionId, message, body)
    }
    if (message && action.kind === 'spam') {
      await reportSpam(userId, message.id)
    }
    if (message && gmail) {
      await applyThreadEffect(userId, message, gmail)
    }
    return null
  })
  if (applied.isErr()) {
    await db
      .update(actions)
      .set({ resolvedAt: null, status: 'pending' })
      .where(eq(actions.id, actionId))
    throw applied.error.cause
  }

  const [done] = await finish(actionId, 'done', detail)
  await announceChange(userId, ACTION_TOPICS)
  return { ...expectRow(done), outboxId: applied.value }
}

/** One by one, so each send keeps its own undo window and a failure leaves the rest approved. */
export const approveActions = async (userId: string, actionIds: string[]) => {
  const outboxIds: string[] = []
  for (const actionId of actionIds) {
    // oxlint-disable-next-line eslint/no-await-in-loop -- approvals share the thread and outbox state
    const { outboxId } = await approveAction(userId, actionId)
    if (outboxId) {
      outboxIds.push(outboxId)
    }
  }
  return { approved: actionIds.length, outboxIds }
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
  await announceChange(userId, ACTION_TOPICS)
  capture(userId, 'card_skipped', { kind: dismissed.kind })
  return dismissed
}

/** Undo of a skip: the card goes back to the queue. */
export const restoreAction = async (userId: string, actionId: string) => {
  await getAction(userId, actionId)
  const [restored] = await db
    .update(actions)
    .set({ resolvedAt: null, status: 'pending' })
    .where(and(eq(actions.id, actionId), eq(actions.status, 'dismissed')))
    .returning()
  if (!restored) {
    throw new NotFoundError('Action is not skipped')
  }
  await announceChange(userId, ACTION_TOPICS)
  return restored
}

const FOLLOW_UP_INSTRUCTION =
  'Nobody has answered the last email yet: write a short, friendly nudge to the same people that brings it back up, without repeating it.'

export const redraftAction = async (
  userId: string,
  actionId: string,
  instruction?: string
) => {
  const { action, message } = await getAction(userId, actionId)
  if (!message) {
    throw new NotFoundError('This action has no email to answer')
  }
  const isFollowUp = action.kind === 'follow_up'
  const detail = await writeReply({
    instruction: isFollowUp
      ? (instruction ?? FOLLOW_UP_INSTRUCTION)
      : instruction,
    message,
    previousDraft: action.detail ?? undefined,
    userId,
  })
  // The reminder becomes a reply card in place: sending it still waits for its own yes.
  const [updated] = await db
    .update(actions)
    .set({ detail, ...(isFollowUp && { kind: 'reply' as const }) })
    .where(eq(actions.id, actionId))
    .returning()
  await announceChange(userId, ACTION_TOPICS)
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
  await announceChange(userId, ACTION_TOPICS)
  return expectRow(updated)
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
  await announceChange(userId, ACTION_TOPICS)
  return expectRow(created)
}

const worthKnowingSince = (userId: string, since: Date, where?: SQL) =>
  db
    .select({ analysis: analysisSummary, message: messageSummary })
    .from(messages)
    .innerJoin(analyses, eq(analyses.messageId, messages.id))
    .where(
      and(
        eq(messages.userId, userId),
        gte(messages.receivedAt, since),
        gte(analyses.importance, 1),
        where
      )
    )

export const recentImportant = (userId: string, since: Date) =>
  worthKnowingSince(
    userId,
    since,
    and(
      arrayContains(messages.labelIds, ['INBOX']),
      eq(messages.isUnread, true)
    )
  )
    .orderBy(desc(analyses.importance), desc(messages.receivedAt))
    .limit(40)

const CODE_FRESH_MINUTES = 15
const CODES_SHOWN = 3

export const freshCodes = (userId: string) =>
  db
    .select(messageSummary)
    .from(messages)
    .where(
      and(
        eq(messages.userId, userId),
        isNotNull(messages.code),
        arrayContains(messages.labelIds, ['INBOX']),
        gte(messages.receivedAt, subMinutes(new Date(), CODE_FRESH_MINUTES))
      )
    )
    .orderBy(desc(messages.receivedAt))
    .limit(CODES_SHOWN)

/**
 * How much mail came in since `since`, split into people, mailing lists and the rest. People is by sender: everything
 * someone wrote who wrote at least one personal email, so their invoice or invite counts with their letters.
 */
export const mailPulse = async (userId: string, since: Date) => {
  const rows = await db
    .select({
      category: analyses.category,
      count: sql<number>`count(*)::int`,
      sealedSender: sql<string>`${messages.fromEmail}`,
    })
    .from(messages)
    .leftJoin(analyses, eq(analyses.messageId, messages.id))
    .where(
      and(
        eq(messages.userId, userId),
        eq(messages.isFromMe, false),
        gte(messages.receivedAt, since)
      )
    )
    .groupBy(analyses.category, messages.fromEmail)
  const isList = (category: (typeof rows)[number]['category']) =>
    !!category && LIST_CATEGORIES.has(category)
  const people = new Set(
    rows
      .filter(({ category }) => category && PEOPLE_CATEGORIES.has(category))
      .map(({ sealedSender }) => sealedSender)
  )
  const countOf = (keep: (row: (typeof rows)[number]) => boolean) =>
    rows.filter(keep).reduce((sum, { count }) => sum + count, 0)
  return {
    lists: countOf(({ category }) => isList(category)),
    people: countOf(
      ({ category, sealedSender }) =>
        people.has(sealedSender) && !isList(category)
    ),
    total: countOf(() => true),
  }
}

const DATES_WINDOW_HOURS = 7 * 24
const DATES_SCANNED = 200

/** Recent mail that names a due date or a meeting time, newest first; the dates stay as written. */
export const mailWithDates = async (userId: string) => {
  const rows = await worthKnowingSince(
    userId,
    subHours(new Date(), DATES_WINDOW_HOURS)
  )
    .orderBy(desc(messages.receivedAt))
    .limit(DATES_SCANNED)
  return rows.filter(
    ({ analysis }) =>
      analysis.extracted.dueDate || analysis.extracted.meetingTime
  )
}

const TIDY_SHOWN = 200
const IGNORED_SENDER_EMAILS = 3

/** Leaving a list cannot be undone, so it is offered only for a sender the user plainly ignores: three emails or more, at most one opened. */
const ignoredSender = sql`${messages.listUnsubscribe} is not null and (select count(*) >= ${IGNORED_SENDER_EMAILS} and count(*) filter (where not ${sameSender.isUnread}) <= 1 from ${messages} ${sameSender} where ${sameSender.userId} = ${messages.userId} and coalesce(${sameSender.listId}, ${sameSender.fromEmail}) = coalesce(${messages.listId}, ${messages.fromEmail}))`

/**
 * Quiet mail the agent would archive, mark read or unsubscribe from that no rule covers: it waits on Home for one yes;
 * an unsubscribe without the evidence above is offered as an archive. Only a thread's newest email, and never a thread
 * with a card or anything already done to that email.
 */
const tidyCandidates = (userId: string, where?: SQL) =>
  db
    .select({
      analysis: {
        ...analysisSummary,
        suggestedAction: sql<
          (typeof TIDY_KINDS)[number]
        >`case when ${analyses.suggestedAction} = 'unsubscribe' and not (${ignoredSender}) then 'archive' else ${analyses.suggestedAction} end`,
      },
      message: messageSummary,
    })
    .from(messages)
    .innerJoin(analyses, eq(analyses.messageId, messages.id))
    .where(
      and(
        eq(messages.userId, userId),
        arrayContains(messages.labelIds, ['INBOX']),
        lt(analyses.importance, IMPORTANCE.high),
        inArray(analyses.suggestedAction, [...TIDY_KINDS]),
        or(
          ne(analyses.suggestedAction, 'mark_read'),
          eq(messages.isUnread, true)
        ),
        notExists(
          db
            .select({ id: newerInThread.id })
            .from(newerInThread)
            .where(
              and(
                eq(newerInThread.userId, messages.userId),
                eq(newerInThread.threadId, messages.threadId),
                gt(newerInThread.receivedAt, messages.receivedAt)
              )
            )
        ),
        notExists(
          db
            .select({ id: actions.id })
            .from(actions)
            .where(
              and(
                eq(actions.userId, messages.userId),
                or(
                  eq(actions.messageId, messages.id),
                  and(
                    eq(actions.threadId, messages.threadId),
                    eq(actions.status, 'pending')
                  )
                )
              )
            )
        ),
        where
      )
    )
    .orderBy(desc(messages.receivedAt))
    .limit(TIDY_SHOWN)

export const listTidy = (userId: string) => tidyCandidates(userId)

/** `done` carries out what the agent suggested for each email, `dismissed` keeps it as it is; either way it leaves the list. */
export const settleTidy = async (
  userId: string,
  messageIds: string[],
  status: 'done' | 'dismissed'
) => {
  const [rows, settings] = await Promise.all([
    tidyCandidates(userId, inArray(messages.id, messageIds)),
    getSettings(userId),
  ])
  const t = dictionaries[settings?.language ?? 'en']
  let settled = 0
  for (const { analysis, message } of rows) {
    const kind = analysis.suggestedAction
    if (status === 'done') {
      // oxlint-disable-next-line eslint/no-await-in-loop -- one Gmail change at a time, like approveActions
      const applied = await Result.tryPromise(async () =>
        applyThreadEffect(userId, await ownMessage(userId, message.id), kind)
      )
      if (applied.isErr()) {
        logError('tidy failed', applied.error.cause)
        continue
      }
    }
    // oxlint-disable-next-line eslint/no-await-in-loop -- recorded right after its own Gmail change
    await db.insert(actions).values({
      autonomous: false,
      kind,
      messageId: message.id,
      reason: analysis.reason,
      resolvedAt: new Date(),
      status,
      threadId: message.threadId,
      title: t.rules.effect[kind],
      userId,
    })
    settled += 1
  }
  return { settled }
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
  const rule = await createRule(userId, {
    effect: 'trash',
    match: { field: 'from', value: message.fromEmail },
  })
  await trashMessage(userId, messageId)
  return { ruleId: rule.id }
}

export const snoozeMessage = async (
  userId: string,
  messageId: string,
  until: Date
) => {
  const message = await ownMessage(userId, messageId)
  await snoozeThread(userId, message.threadId, until)
}

export const pinMessage = async (
  userId: string,
  messageId: string,
  pinned: boolean
) => {
  const message = await ownMessage(userId, messageId)
  await changeThreadLabels(
    userId,
    message.threadId,
    pinned ? { add: ['STARRED'] } : { remove: ['STARRED'] }
  )
}

export const unsnoozeMessage = async (userId: string, messageId: string) => {
  const message = await ownMessage(userId, messageId)
  await unsnoozeThread(userId, message.threadId)
}
