import { db } from '@fewmail/db'
import { boardEntries, boards, messages } from '@fewmail/db/schema'
import type { BoardChart } from '@fewmail/shared/agent'
import {
  ANALYZE_WINDOW_DAYS,
  BOARD_CHART_TYPES,
  BOARD_GROUPINGS,
  BOARD_MEASURES,
} from '@fewmail/shared/agent'
import { messages as dictionaries } from '@fewmail/shared/i18n'
import type { Locale } from '@fewmail/shared/i18n/locales'
import { englishName } from '@fewmail/shared/i18n/locales'
import { generateText, Output } from 'ai'
import { type } from 'arktype'
import {
  eachMonthOfInterval,
  eachWeekOfInterval,
  format,
  startOfWeek,
} from 'date-fns'
import { and, desc, eq, isNotNull } from 'drizzle-orm'

import { models } from '../lib/ai'
import { announceChange } from '../lib/live'
import { expectRow } from '../lib/rows'
import { NotFoundError } from './mail-errors'
import { searchMailboxes } from './mailboxes'
import { requireRoom } from './plan'
import { getSettings } from './settings'

type Board = typeof boards.$inferSelect
type Entry = typeof boardEntries.$inferSelect
type Message = typeof messages.$inferSelect

const EXTRACT_CONCURRENCY = 4
const MAX_CHARTS = 4
const ENTRIES_SHOWN = 200
const KNOWN_VALUES_SHOWN = 60
const TIME_BUCKETS_SHOWN = 12
const SHARE_BUCKETS_SHOWN = 6

const chartSchema = type({
  groupBy: type.enumerated(...BOARD_GROUPINGS),
  measure: type.enumerated(...BOARD_MEASURES),
  title: 'string',
  type: type.enumerated(...BOARD_CHART_TYPES),
})

const planSchema = type({ charts: chartSchema.array(), gmailQuery: 'string' })

const entrySchema = type({
  amount: 'number | null',
  belongs: 'boolean',
  currency: 'string | null',
  group: 'string | null',
  occurredAt: 'string | null',
  status: 'string | null',
  title: 'string',
})

const languageOf = async (userId: string) => {
  const settings = await getSettings(userId)
  return settings?.language ?? 'en'
}

const planBoard = async (
  board: { description: string; name: string },
  language: Locale
) => {
  const { output } = await generateText({
    instructions: [
      'The user describes a board: a page that collects one kind of email (receipts, trips, job applications…) as entries with a title, a group, a status, an amount and a date.',
      'gmailQuery: a Gmail search query that finds these emails with high recall — OR-ed subject keywords in English and in the languages the description suggests, sender domains you are sure of, Gmail categories (category:purchases) where they fit. Never date operators (newer_than, after, before): they are added later.',
      `charts: 1–${MAX_CHARTS} charts that answer what the user most likely wants to see. measure "sum" only when the entries carry amounts. groupBy month or week for a trend, group for who or what (merchant, airline, company), status for the state. type: bar for totals per period, line or area for a trend, pie only for shares (group or status). title: a few words in ${englishName(language)}.`,
    ].join('\n'),
    model: models.writer,
    output: Output.object({ schema: planSchema }),
    prompt: `Name: ${board.name}\nDescription: ${board.description}`,
  })
  return {
    charts: output.charts
      .slice(0, MAX_CHARTS)
      .map((chart) => ({ ...chart, id: crypto.randomUUID() })),
    gmailQuery: output.gmailQuery,
  }
}

const getOwnBoard = async (userId: string, id: string) => {
  const [board] = await db
    .select()
    .from(boards)
    .where(and(eq(boards.id, id), eq(boards.userId, userId)))
  if (!board) {
    throw new NotFoundError('Board not found')
  }
  return board
}

export const listBoards = (userId: string) =>
  db
    .select({ id: boards.id, name: boards.name })
    .from(boards)
    .where(eq(boards.userId, userId))
    .orderBy(boards.createdAt)

/** The worker reads the last half year next; the page fills in live. */
export const createBoard = async (
  userId: string,
  input: { description: string; name: string }
) => {
  await requireRoom(userId, 'boards', () =>
    db.$count(boards, eq(boards.userId, userId))
  )
  const plan = await planBoard(input, await languageOf(userId))
  const [board] = await db
    .insert(boards)
    .values({ ...input, ...plan, userId })
    .returning()
  await announceChange(userId)
  return expectRow(board)
}

export const seedBoards = async (userId: string) => {
  const t = dictionaries[await languageOf(userId)]
  await createBoard(userId, t.boards.starter.money)
}

/** A new description is a new board: its entries are dropped and the history read again. Charts stay as the user left them. */
export const updateBoard = async (
  userId: string,
  id: string,
  input: { charts?: BoardChart[]; description?: string; name?: string }
) => {
  const board = await getOwnBoard(userId, id)
  const isRedescribed =
    input.description !== undefined && input.description !== board.description
  const plan = isRedescribed
    ? await planBoard(
        {
          description: input.description ?? board.description,
          name: input.name ?? board.name,
        },
        await languageOf(userId)
      )
    : null
  if (isRedescribed) {
    await db.delete(boardEntries).where(eq(boardEntries.boardId, id))
  }
  await db
    .update(boards)
    .set({
      ...input,
      ...(plan && { gmailQuery: plan.gmailQuery, historyReadAt: null }),
    })
    .where(eq(boards.id, id))
  await announceChange(userId)
}

export const deleteBoard = async (userId: string, id: string) => {
  await db
    .delete(boards)
    .where(and(eq(boards.id, id), eq(boards.userId, userId)))
  await announceChange(userId)
}

const extractEntry = async (
  board: Board,
  message: Message,
  context: { groups: string[]; language: Locale; statuses: string[] }
) => {
  const language = englishName(context.language)
  const { output } = await generateText({
    instructions: [
      `Board "${board.name}": ${board.description}`,
      'belongs: whether this email is an entry of that board. Marketing, newsletters and anything off-topic do not belong.',
      `Write title and status in ${language}, even when the email is in another language.`,
      'title: what this entry is in a few words ("Lisbon → Kyiv", "Netflix Premium"), never the subject line.',
      `group: who or what it belongs to as people say it ("Netflix", "Ryanair"), or null.${context.groups.length > 0 ? ` Reuse one of these when it is the same: ${context.groups.join(', ')}.` : ''}`,
      `status: its state in one or two lowercase words (paid, refunded, cancelled, shipped, booked, rejected…), or null.${context.statuses.length > 0 ? ` Reuse one of these when it means the same: ${context.statuses.join(', ')}.` : ''}`,
      `amount and currency (ISO 4217): the total charged or due, else null. occurredAt: ISO date of the event itself (today is ${new Date().toISOString().slice(0, 10)}), else null.`,
    ].join('\n'),
    model: models.fast,
    output: Output.object({ schema: entrySchema }),
    prompt: `From: ${message.fromName ?? ''} <${message.fromEmail}>\nSubject: ${message.subject}\n\n${message.body.slice(0, 5000)}`,
  })
  if (!output.belongs) {
    return
  }
  const occurredAt = output.occurredAt ? new Date(output.occurredAt) : null
  const hasAmount =
    output.amount !== null && output.amount > 0 && Boolean(output.currency)
  await db
    .insert(boardEntries)
    .values({
      amountCents: hasAmount ? Math.round((output.amount ?? 0) * 100) : null,
      boardId: board.id,
      currency: hasAmount ? (output.currency?.toUpperCase() ?? null) : null,
      group: output.group?.trim() || null,
      messageId: message.id,
      occurredAt:
        occurredAt && !Number.isNaN(occurredAt.getTime())
          ? occurredAt
          : message.receivedAt,
      status: output.status?.trim() || null,
      title: output.title.trim(),
      userId: board.userId,
    })
    .onConflictDoNothing()
}

const distinct = (values: (string | null)[]) =>
  [...new Set(values.filter((value) => value !== null))].slice(
    0,
    KNOWN_VALUES_SHOWN
  )

const knownValues = async (boardId: string) => {
  const rows = await db
    .select({
      group: boardEntries.group,
      messageId: boardEntries.messageId,
      status: boardEntries.status,
    })
    .from(boardEntries)
    .where(eq(boardEntries.boardId, boardId))
  return {
    groups: distinct(rows.map(({ group }) => group)),
    messageIds: new Set(rows.map(({ messageId }) => messageId)),
    statuses: distinct(rows.map(({ status }) => status)),
  }
}

/** Each message is read once per board; mail the user sent is never an entry. */
export const collectEntries = async (board: Board, candidates: Message[]) => {
  if (candidates.length === 0) {
    return
  }
  const language = await languageOf(board.userId)
  const { messageIds } = await knownValues(board.id)
  const fresh = candidates.filter(
    (message) => !message.isFromMe && !messageIds.has(message.id)
  )
  for (let index = 0; index < fresh.length; index += EXTRACT_CONCURRENCY) {
    // oxlint-disable-next-line eslint/no-await-in-loop -- each batch sees the groups and statuses the previous one wrote, so spellings converge
    const { groups, statuses } = await knownValues(board.id)
    // oxlint-disable-next-line eslint/no-await-in-loop -- batches cap concurrency
    await Promise.allSettled(
      fresh
        .slice(index, index + EXTRACT_CONCURRENCY)
        .map((message) =>
          extractEntry(board, message, { groups, language, statuses }).catch(
            (error) => console.error(`board entry ${message.id} failed`, error)
          )
        )
    )
  }
}

/** Boards still reading their history pick new mail up there. */
export const collectForNewMail = async (
  userId: string,
  inserted: Message[]
) => {
  const incoming = inserted.filter((message) => !message.isFromMe)
  if (incoming.length === 0) {
    return
  }
  const ready = await db
    .select()
    .from(boards)
    .where(and(eq(boards.userId, userId), isNotNull(boards.historyReadAt)))
  await Promise.all(
    ready.map(async (board) => {
      const results = await searchMailboxes(
        userId,
        `(${board.gmailQuery}) newer_than:${ANALYZE_WINDOW_DAYS}d`,
        incoming.length + 50
      )
      const matching = new Set(
        results.flatMap(({ ids, mailbox }) =>
          ids.map((id) => `${mailbox.id}:${id}`)
        )
      )
      await collectEntries(
        board,
        incoming.filter(({ gmailId, mailboxId }) =>
          matching.has(`${mailboxId}:${gmailId}`)
        )
      )
    })
  )
  if (ready.length > 0) {
    await announceChange(userId)
  }
}

const dominantCurrency = (entries: Entry[]) => {
  const counts = new Map<string, number>()
  for (const { currency } of entries) {
    if (currency) {
      counts.set(currency, (counts.get(currency) ?? 0) + 1)
    }
  }
  return [...counts].toSorted((left, right) => right[1] - left[1])[0]?.[0]
}

const bucketOf = (chart: BoardChart, entry: Entry) => {
  switch (chart.groupBy) {
    case 'month': {
      return format(entry.occurredAt, 'yyyy-MM')
    }
    case 'week': {
      return format(
        startOfWeek(entry.occurredAt, { weekStartsOn: 1 }),
        'yyyy-MM-dd'
      )
    }
    case 'group': {
      return entry.group
    }
    default: {
      return entry.status
    }
  }
}

const timeBuckets = (chart: BoardChart, entries: Entry[]) => {
  const dates = entries.map(({ occurredAt }) => occurredAt.getTime())
  if (dates.length === 0) {
    return []
  }
  const interval = {
    end: new Date(Math.max(...dates)),
    start: new Date(Math.min(...dates)),
  }
  const starts =
    chart.groupBy === 'month'
      ? eachMonthOfInterval(interval).map((date) => format(date, 'yyyy-MM'))
      : eachWeekOfInterval(interval, { weekStartsOn: 1 }).map((date) =>
          format(date, 'yyyy-MM-dd')
        )
  return starts.slice(-TIME_BUCKETS_SHOWN)
}

/** Sums use the most common currency only; mixing currencies would draw a meaningless total. */
const chartSeries = (chart: BoardChart, entries: Entry[]) => {
  const currency =
    chart.measure === 'sum' ? (dominantCurrency(entries) ?? null) : null
  const totals = new Map<string, number>()
  for (const entry of entries) {
    const bucket = bucketOf(chart, entry)
    if (!bucket || (chart.measure === 'sum' && entry.currency !== currency)) {
      continue
    }
    const value = chart.measure === 'sum' ? (entry.amountCents ?? 0) / 100 : 1
    totals.set(bucket, (totals.get(bucket) ?? 0) + value)
  }
  const isOverTime = chart.groupBy === 'month' || chart.groupBy === 'week'
  if (isOverTime) {
    return {
      ...chart,
      currency,
      points: timeBuckets(chart, entries).map((key) => ({
        key,
        value: totals.get(key) ?? 0,
      })),
      rest: 0,
    }
  }
  const ranked = [...totals]
    .map(([key, value]) => ({ key, value }))
    .toSorted((left, right) => right.value - left.value)
  return {
    ...chart,
    currency,
    points: ranked.slice(0, SHARE_BUCKETS_SHOWN),
    rest: ranked
      .slice(SHARE_BUCKETS_SHOWN)
      .reduce((sum, { value }) => sum + value, 0),
  }
}

export const getBoard = async (userId: string, id: string) => {
  const board = await getOwnBoard(userId, id)
  const rows = await db
    .select({ entry: boardEntries, threadId: messages.threadId })
    .from(boardEntries)
    .innerJoin(messages, eq(messages.id, boardEntries.messageId))
    .where(eq(boardEntries.boardId, id))
    .orderBy(desc(boardEntries.occurredAt))
  const entries = rows.map(({ entry }) => entry)
  return {
    charts: board.charts.map((chart) => chartSeries(chart, entries)),
    description: board.description,
    entries: rows.slice(0, ENTRIES_SHOWN).map(({ entry, threadId }) => ({
      amountCents: entry.amountCents,
      currency: entry.currency,
      group: entry.group,
      id: entry.id,
      occurredAt: entry.occurredAt,
      status: entry.status,
      threadId,
      title: entry.title,
    })),
    id: board.id,
    isReadingHistory: !board.historyReadAt,
    name: board.name,
    total: entries.length,
  }
}
