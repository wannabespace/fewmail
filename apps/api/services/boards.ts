import { db } from '@fewmail/db'
import { actions, boardEntries, boards, messages } from '@fewmail/db/schema'
import type {
  BoardChart,
  BoardPayment,
  BoardPeriod,
} from '@fewmail/shared/agent'
import {
  ANALYZE_WINDOW_DAYS,
  BOARD_CHART_TYPES,
  BOARD_GROUPINGS,
  BOARD_MEASURES,
  BOARD_PAYMENTS,
  BOARD_PRESET_PERIODS,
  BOARD_PRESETS,
} from '@fewmail/shared/agent'
import { messages as dictionaries } from '@fewmail/shared/i18n'
import type { Locale } from '@fewmail/shared/i18n/locales'
import { englishName } from '@fewmail/shared/i18n/locales'
import { generateText, Output } from 'ai'
import { type } from 'arktype'
import {
  addDays,
  addMonths,
  addWeeks,
  addYears,
  differenceInCalendarDays,
  eachMonthOfInterval,
  eachWeekOfInterval,
  format,
  startOfWeek,
  subDays,
} from 'date-fns'
import type { SQL } from 'drizzle-orm'
import {
  and,
  desc,
  eq,
  gte,
  inArray,
  isNotNull,
  isNull,
  lt,
  sql,
} from 'drizzle-orm'

import { models, trackUsage } from '../lib/ai'
import { ACTION_TOPICS, announceChange } from '../lib/live'
import { logError } from '../lib/log'
import { expectRow } from '../lib/rows'
import { LimitReachedError } from './limit-error'
import { NotFoundError } from './mail-errors'
import { searchMailboxes } from './mailboxes'
import { requireBudget } from './plan'
import { getSettings } from './settings'
import { keptIdOf } from './stored-mail'
import type { ReadMessage } from './stored-mail'

type Board = typeof boards.$inferSelect
type Entry = typeof boardEntries.$inferSelect
type Message = typeof messages.$inferSelect

/** A new board reads at most this many of its emails from the last half year, newest first. */
export const BOARD_HISTORY_LIMIT = 300

const EXTRACT_CONCURRENCY = 4
export const ENTRY_BODY_CHARS = 5000
const MAX_PLANNED_CHARTS = 4
const MAX_BANNER_DAYS = 14
const ENTRIES_SHOWN = 1000
const KNOWN_VALUES_SHOWN = 60
const REJECTED_SHOWN = 20
const TIME_BUCKETS_SHOWN = 12
const SHARE_BUCKETS_SHOWN = 6
const UPCOMING_DAYS = 30
/** A predicted charge this late with no new receipt means the thing stopped (cancelled, moved to another card). */
const OVERDUE_DAYS = 7
const DAYS_PER_MONTH = 30.44
/** An invoice and its receipt, or a failed charge and its retry, arrive within days; a weekly charge never does. */
const SAME_CHARGE_DAYS = 3
/** Reminders of one bill and its payment; a monthly bill's next one comes later. */
const BILL_DAYS = 25

const CADENCES = [
  { days: 7, every: 'week', next: (date: Date) => addWeeks(date, 1) },
  {
    days: DAYS_PER_MONTH,
    every: 'month',
    next: (date: Date) => addMonths(date, 1),
  },
  { days: 91.3, every: 'quarter', next: (date: Date) => addMonths(date, 3) },
  { days: 365.25, every: 'year', next: (date: Date) => addYears(date, 1) },
] as const

const chartSchema = type({
  groupBy: type.enumerated(...BOARD_GROUPINGS),
  measure: type.enumerated(...BOARD_MEASURES),
  title: 'string',
  type: type.enumerated(...BOARD_CHART_TYPES),
})

const planSchema = type({
  bannerDays: 'number | null',
  charts: chartSchema.array(),
  gmailQuery: 'string',
})

const entrySchema = type({
  amount: 'number | null',
  belongs: 'boolean',
  currency: 'string | null',
  dueAt: 'string | null',
  group: 'string | null',
  isUpdate: 'boolean',
  occurredAt: 'string | null',
  payment: type.enumerated(...BOARD_PAYMENTS).or('null'),
  status: 'string | null',
  title: 'string',
})

const chartRules = (language: Locale) =>
  `measure "sum" only when the entries carry amounts. groupBy month or week for a trend, group for who or what (merchant, airline, company), status for the state. type: bar for anything per month or week, since entries are sparse and a line would draw slopes between them; pie only for shares (group or status). title: a few words in ${englishName(language)}.`

const languageOf = async (userId: string) => {
  const settings = await getSettings(userId)
  return settings?.language ?? 'en'
}

const clampBannerDays = (days: number | null) =>
  days === null
    ? null
    : Math.min(MAX_BANNER_DAYS, Math.max(1, Math.round(days)))

const planBoard = async (
  userId: string,
  board: { description: string; name: string }
) => {
  const language = await languageOf(userId)
  const { output } = await generateText({
    instructions: [
      'The user describes a board: a page that collects one kind of email (receipts, trips, job applications…) as entries with a title, a group, a status, an amount and a date.',
      'gmailQuery: a Gmail search query that finds these emails with high recall: OR-ed subject keywords in English and in the languages the description suggests, sender domains you are sure of, Gmail categories (category:purchases) where they fit. Never date operators (newer_than, after, before): they are added later.',
      'bannerDays: when entries carry a next date the user must not miss (a subscription renews, a bill is due, a flight leaves, an event starts), how many days before it they want a heads-up (renewals and bills 3, trips and events 2); null when the entries have no such date.',
      `charts: 1–${MAX_PLANNED_CHARTS} charts that answer what the user most likely wants to see. ${chartRules(language)}`,
    ].join('\n'),
    model: models.writer,
    output: Output.object({ schema: planSchema }),
    prompt: `Name: ${board.name}\nDescription: ${board.description}`,
    telemetry: trackUsage(userId, 'board_plan'),
  })
  return {
    bannerDays: clampBannerDays(output.bannerDays),
    charts: output.charts
      .slice(0, MAX_PLANNED_CHARTS)
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

const getOwnEntry = async (userId: string, id: string) => {
  const [entry] = await db
    .select()
    .from(boardEntries)
    .where(and(eq(boardEntries.id, id), eq(boardEntries.userId, userId)))
  if (!entry) {
    throw new NotFoundError('Entry not found')
  }
  return entry
}

/** Entries before the board's period leave it, but stay stored: a longer period brings them back without asking the model again. */
const isInPeriod = gte(
  boardEntries.occurredAt,
  sql`now() - make_interval(days => ${boards.periodDays}::int)`
)

/** What the user sees of a board: never the entries they took off it, nor those before its period. */
const shownEntries = (where: SQL | undefined) =>
  db
    .select({ entry: boardEntries, threadId: messages.threadId })
    .from(boardEntries)
    .innerJoin(messages, eq(messages.id, boardEntries.messageId))
    .innerJoin(boards, eq(boards.id, boardEntries.boardId))
    .where(and(where, isNull(boardEntries.dismissedAt), isInPeriod))

export const listBoards = (userId: string) =>
  db
    .select({ id: boards.id, name: boards.name })
    .from(boards)
    .where(eq(boards.userId, userId))
    .orderBy(boards.position, boards.createdAt)

export const reorderBoards = async (userId: string, ids: string[]) => {
  await Promise.all(
    ids.map((id, position) =>
      db
        .update(boards)
        .set({ position })
        .where(and(eq(boards.id, id), eq(boards.userId, userId)))
    )
  )
  await announceChange(userId, ['boards', 'today'])
}

/** A refund is money back beside the spending, never taken off it: a refund for last month's charge made this month's sum negative. */
const isSpending = ({ payment }: Entry) => payment === 'paid'

const centsIn = (entries: Entry[], currency: string) => {
  let total = 0
  for (const entry of entries) {
    if (entry.currency === currency) {
      total += entry.amountCents ?? 0
    }
  }
  return total
}

const sumOf = (entries: Entry[], currency: string | null) =>
  currency && entries.length > 0 ? centsIn(entries, currency) : null

/** Refunds are stored negative so sums net them out; an amount always has a payment, so it is never summed blind. */
const moneyOf = (cents: number | null, payment: BoardPayment | null) => {
  if (cents === null) {
    return { amountCents: null, payment: null }
  }
  const kind = payment ?? (cents < 0 ? 'refund' : 'paid')
  return {
    amountCents: kind === 'refund' ? -Math.abs(cents) : Math.abs(cents),
    payment: kind,
  }
}

const chargeKey = (entry: Entry) =>
  [
    entry.payment === 'refund' || entry.payment === 'income'
      ? entry.payment
      : 'charge',
    (entry.group ?? entry.title).toLowerCase(),
    entry.currency,
    entry.amountCents,
  ].join('|')

/**
 * One charge often comes as several emails, each in its own thread: an invoice and its receipt, a failed charge and the retry, reminders of one bill.
 * Each repeat maps to the entry that counts (the settled one, else the newest), so nothing is summed or counted twice.
 */
const repeatsOf = (entries: Entry[]) => {
  const repeatOf = new Map<string, string>()
  const settle = (charge: Entry[]) => {
    const counted =
      charge.find(({ payment }) => payment !== 'due' && payment !== 'failed') ??
      charge.at(-1)
    for (const entry of charge) {
      if (counted && entry !== counted) {
        repeatOf.set(entry.id, counted.id)
      }
    }
  }
  const open = new Map<string, Entry[]>()
  const oldestFirst = entries
    .filter(({ amountCents }) => amountCents !== null)
    .toSorted(
      (left, right) => left.occurredAt.getTime() - right.occurredAt.getTime()
    )
  for (const entry of oldestFirst) {
    const key = chargeKey(entry)
    const charge = open.get(key)
    const settled = charge?.find(
      ({ payment }) => payment !== 'due' && payment !== 'failed'
    )
    const since = settled ?? charge?.[0]
    if (
      charge &&
      since &&
      differenceInCalendarDays(entry.occurredAt, since.occurredAt) <=
        (settled ? SAME_CHARGE_DAYS : BILL_DAYS)
    ) {
      charge.push(entry)
    } else {
      if (charge) {
        settle(charge)
      }
      open.set(key, [entry])
    }
  }
  for (const charge of open.values()) {
    settle(charge)
  }
  return repeatOf
}

const DIGEST_DAYS = 30

/** Per board, what it collected that happened in the last month: how many, what was spent per currency and the newest one. */
export const boardsDigest = async (userId: string) => {
  const rows = await db
    .select({
      board: { id: boards.id, name: boards.name },
      entry: boardEntries,
    })
    .from(boardEntries)
    .innerJoin(boards, eq(boards.id, boardEntries.boardId))
    .where(
      and(
        eq(boardEntries.userId, userId),
        isNull(boardEntries.dismissedAt),
        gte(boardEntries.occurredAt, subDays(new Date(), DIGEST_DAYS)),
        isInPeriod
      )
    )
    .orderBy(desc(boardEntries.occurredAt))
  const byBoard = Map.groupBy(rows, ({ board }) => board.id)
  return [...byBoard.values()].flatMap((all) => {
    const repeatOf = repeatsOf(all.map(({ entry }) => entry))
    const boardRows = all.filter(({ entry }) => !repeatOf.has(entry.id))
    const [newest] = boardRows
    if (!newest) {
      return []
    }
    const totals = new Map<string, number>()
    for (const { entry } of boardRows) {
      if (entry.amountCents !== null && entry.currency && isSpending(entry)) {
        totals.set(
          entry.currency,
          (totals.get(entry.currency) ?? 0) + entry.amountCents
        )
      }
    }
    return [
      {
        count: boardRows.length,
        id: newest.board.id,
        name: newest.board.name,
        newest: newest.entry.title,
        totals: [...totals].map(([currency, amountCents]) => ({
          amountCents,
          currency,
        })),
      },
    ]
  })
}

const trimmed = (value: string | null | undefined) =>
  value === undefined ? undefined : value?.trim() || null

const median = (values: number[]) => {
  const sorted = values.toSorted((left, right) => left - right)
  return sorted[Math.floor(sorted.length / 2)] ?? 0
}

/** Charges of one group that repeat at a steady pace with a steady price: a subscription, rent, a monthly bill. Flights and orders vary in price, so they never read as one. */
const cadenceOf = (oldestFirst: Entry[]) => {
  const charges = oldestFirst.filter(({ payment }) => payment === 'paid')
  const last = charges.at(-1)
  if (!last?.amountCents) {
    return null
  }
  const price = last.amountCents
  const alike = charges.filter(
    ({ amountCents, currency }) =>
      currency === last.currency &&
      amountCents !== null &&
      Math.abs(amountCents - price) <= price * 0.25
  )
  const gaps = alike
    .slice(1)
    .map((entry, index) =>
      differenceInCalendarDays(
        entry.occurredAt,
        alike[index]?.occurredAt ?? entry.occurredAt
      )
    )
    .filter((days) => days > 2)
  if (gaps.length === 0) {
    return null
  }
  const gap = median(gaps)
  const cadence = CADENCES.find(
    ({ days }) => Math.abs(gap - days) <= days * 0.15
  )
  return cadence ? { cadence, last } : null
}

interface ShownEntry {
  entry: Entry
  threadId: string
}

const countedOf = (rows: ShownEntry[]) => {
  const repeatOf = repeatsOf(rows.map(({ entry }) => entry))
  return {
    counted: rows.filter(({ entry }) => !repeatOf.has(entry.id)),
    repeatOf,
  }
}

const perMonthOf = (repeating: ReturnType<typeof cadenceOf>) =>
  repeating &&
  Math.round(
    ((repeating.last.amountCents ?? 0) * DAYS_PER_MONTH) /
      repeating.cadence.days
  )

/** When a group is next due and for how much: a date an email states, else the next one at its pace while it keeps it; the amount is exact only when a bill asked for it. */
const nextOf = (oldestFirst: Entry[], now: Date) => {
  const repeating = cadenceOf(oldestFirst)
  const [stated] = oldestFirst
    .filter(({ dueAt }) => dueAt && dueAt > now)
    .toSorted(
      (left, right) =>
        (left.dueAt?.getTime() ?? 0) - (right.dueAt?.getTime() ?? 0)
    )
  const predicted =
    repeating && repeating.cadence.next(repeating.last.occurredAt)
  const isRunning = Boolean(
    predicted && predicted >= subDays(now, OVERDUE_DAYS)
  )
  const lastPrice = isRunning ? (repeating?.last.amountCents ?? null) : null
  return {
    amountCents: stated ? (stated.amountCents ?? lastPrice) : lastPrice,
    at: stated?.dueAt ?? (isRunning ? predicted : null),
    isEstimate: stated?.payment !== 'due',
    isPredicted: !stated && isRunning,
    isRunning,
    repeating,
  }
}

/** Per group, of the entries that count: what it spent or brought in, how often it comes back and when it is next due — stated in an email, else predicted from its pace. */
const groupsOf = (rows: ShownEntry[]) => {
  const now = new Date()
  const byGroup = Map.groupBy(
    rows.filter(({ entry }) => entry.group),
    ({ entry }) => entry.group ?? ''
  )
  return [...byGroup]
    .map(([name, groupRows]) => {
      const oldestFirst = groupRows.toSorted(
        (left, right) =>
          left.entry.occurredAt.getTime() - right.entry.occurredAt.getTime()
      )
      const latest = oldestFirst.at(-1)
      const entries = oldestFirst.map(({ entry }) => entry)
      const { isRunning, repeating, ...next } = nextOf(entries, now)
      // A declined charge in the card's currency must not relabel a subscription priced in another.
      const currency =
        repeating?.last.currency ??
        entries.findLast((entry) => entry.currency)?.currency ??
        null
      return {
        count: groupRows.length,
        currency,
        every: repeating?.cadence.every ?? null,
        isNextEstimate: next.isEstimate,
        isNextPredicted: next.isPredicted,
        lastAmountCents: repeating?.last.amountCents ?? null,
        lastAt: latest?.entry.occurredAt ?? now,
        latestId: latest?.entry.id ?? '',
        monthlyCents: isRunning ? perMonthOf(repeating) : null,
        name,
        nextAmountCents: next.amountCents,
        nextAt: next.at,
        receivedCents: sumOf(
          entries.filter(({ payment }) => payment === 'income'),
          currency
        ),
        threadId: latest?.threadId ?? '',
        totalCents: sumOf(entries.filter(isSpending), currency),
      }
    })
    .toSorted(
      (left, right) =>
        Number(right.nextAt !== null) - Number(left.nextAt !== null) ||
        (right.totalCents ?? 0) - (left.totalCents ?? 0) ||
        right.count - left.count
    )
}

/** Entries whose next date falls within their board's `bannerDays`: a renewal, a bill, a departure coming up — stated in an email, or predicted from a steady pace. */
export const boardBanners = async (userId: string) => {
  const watched = await db
    .select({
      bannerDays: boards.bannerDays,
      id: boards.id,
      name: boards.name,
    })
    .from(boards)
    .where(and(eq(boards.userId, userId), isNotNull(boards.bannerDays)))
  if (watched.length === 0) {
    return []
  }
  const rows = await shownEntries(
    inArray(
      boardEntries.boardId,
      watched.map(({ id }) => id)
    )
  )
  const now = new Date()
  const byBoard = Map.groupBy(rows, ({ entry }) => entry.boardId)
  return watched
    .flatMap((board) => {
      const { counted: boardRows } = countedOf(byBoard.get(board.id) ?? [])
      const until = addDays(now, board.bannerDays ?? 0)
      const isSoon = (date: Date | null): date is Date =>
        date !== null && date >= now && date <= until
      const stated = boardRows.flatMap(({ entry, threadId }) =>
        isSoon(entry.dueAt)
          ? [
              {
                amountCents: entry.amountCents,
                boardId: board.id,
                boardName: board.name,
                currency: entry.currency,
                dueAt: entry.dueAt,
                id: entry.id,
                isPredicted: false,
                threadId,
                title: entry.title,
              },
            ]
          : []
      )
      const predicted = groupsOf(boardRows).flatMap((group) =>
        group.isNextPredicted && isSoon(group.nextAt)
          ? [
              {
                amountCents: group.lastAmountCents,
                boardId: board.id,
                boardName: board.name,
                currency: group.currency,
                dueAt: group.nextAt,
                id: `${board.id}:${group.name}`,
                isPredicted: true,
                threadId: group.threadId,
                title: group.name,
              },
            ]
          : []
      )
      return [...stated, ...predicted]
    })
    .toSorted((left, right) => left.dueAt.getTime() - right.dueAt.getTime())
}

/** The worker reads the board's period next; the page fills in live. */
export const createBoard = async (
  userId: string,
  input: { description: string; name: string; periodDays?: BoardPeriod }
) => {
  await requireBudget(userId)
  const plan = await planBoard(userId, input)
  const [board] = await db
    .insert(boards)
    .values({
      ...input,
      ...plan,
      position: await db.$count(boards, eq(boards.userId, userId)),
      userId,
    })
    .returning()
  await announceChange(userId, ['boards', 'today'])
  return expectRow(board)
}

export const seedBoards = async (userId: string) => {
  const settings = await getSettings(userId)
  const t = dictionaries[settings?.language ?? 'en']
  const existing = await db
    .select({ name: boards.name })
    .from(boards)
    .where(eq(boards.userId, userId))
  const names = new Set(existing.map(({ name }) => name))
  // Settings may still hold a preset since removed (Paid subscriptions), which has no name to create.
  const presets = (settings?.starterBoards ?? []).filter((preset) =>
    BOARD_PRESETS.includes(preset)
  )
  for (const preset of presets) {
    const input = t.boards.starter[preset]
    if (names.has(input.name)) {
      continue
    }
    // oxlint-disable-next-line no-await-in-loop -- one at a time: each board's plan is paid from the allowance, so seeding stops where it runs out
    const created = await createBoard(userId, {
      ...input,
      periodDays: BOARD_PRESET_PERIODS[preset],
    }).catch((error) => {
      if (error instanceof LimitReachedError) {
        return null
      }
      throw error
    })
    if (!created) {
      return
    }
  }
}

/**
 * A new description or search makes the history read again: the entries go, except those the user edited, added or took off,
 * which keep their place and their lesson. A longer period reads it again too, keeping every entry. Charts stay as the user left them.
 */
export const updateBoard = async (
  userId: string,
  id: string,
  input: {
    bannerDays?: number | null
    charts?: BoardChart[]
    description?: string
    name?: string
    periodDays?: BoardPeriod
  }
) => {
  const { bannerDays, ...rest } = input
  const board = await getOwnBoard(userId, id)
  const isLengthened =
    input.periodDays !== undefined && input.periodDays > board.periodDays
  const isRedescribed =
    input.description !== undefined && input.description !== board.description
  const plan = isRedescribed
    ? await planBoard(userId, {
        description: input.description ?? board.description,
        name: input.name ?? board.name,
      })
    : null
  await db
    .update(boards)
    .set({
      ...rest,
      ...(plan && { bannerDays: plan.bannerDays, gmailQuery: plan.gmailQuery }),
      ...(bannerDays !== undefined && {
        bannerDays: clampBannerDays(bannerDays),
      }),
      ...((plan || isLengthened) && {
        historyFound: null,
        historyReadAt: null,
      }),
    })
    .where(eq(boards.id, id))
  // After the new description is stored: a read still running under the old one checks it before each write (`isUnchanged`).
  if (plan) {
    await db
      .delete(boardEntries)
      .where(
        and(
          eq(boardEntries.boardId, id),
          isNull(boardEntries.editedAt),
          isNull(boardEntries.dismissedAt)
        )
      )
  }
  await announceChange(userId, ['boards', 'today'])
}

export const deleteBoard = async (userId: string, id: string) => {
  await db
    .delete(boards)
    .where(and(eq(boards.id, id), eq(boards.userId, userId)))
  await announceChange(userId, ['boards', 'today'])
}

/** A new description or period reads the history again; a read under the old one must stop writing. */
export const isUnchanged = async (board: Board) => {
  const [current] = await db
    .select({
      description: boards.description,
      gmailQuery: boards.gmailQuery,
      periodDays: boards.periodDays,
    })
    .from(boards)
    .where(eq(boards.id, board.id))
  return (
    current?.description === board.description &&
    current.gmailQuery === board.gmailQuery &&
    current.periodDays === board.periodDays
  )
}

const threadKey = (message: { mailboxId: string; threadId: string }) =>
  `${message.mailboxId}:${message.threadId}`

/** Any rise counts, but not a cent of rounding or exchange. */
const PRICE_RISE = 1.01

const money = (locale: Locale, cents: number, currency: string) =>
  new Intl.NumberFormat(locale, { currency, style: 'currency' }).format(
    cents / 100
  )

/** A steady charge that came back dearer: services announce a new price in small print, if at all. Only fresh mail, so a board's history read never digs up last year's rise. */
const watchPrice = async (
  board: Board,
  entry: Entry | undefined,
  message: ReadMessage
) => {
  if (
    !entry?.group ||
    !entry.currency ||
    !entry.amountCents ||
    entry.payment !== 'paid' ||
    message.receivedAt < subDays(new Date(), ANALYZE_WINDOW_DAYS)
  ) {
    return
  }
  const earlier = await db
    .select()
    .from(boardEntries)
    .where(
      and(
        eq(boardEntries.boardId, board.id),
        eq(boardEntries.currency, entry.currency),
        isNull(boardEntries.dismissedAt),
        lt(boardEntries.occurredAt, entry.occurredAt)
      )
    )
    .orderBy(boardEntries.occurredAt)
  const repeating = cadenceOf(
    earlier.filter(({ group }) => group === entry.group)
  )
  const before = repeating?.last.amountCents
  // Two boards may collect the same charge; one card says it.
  if (
    !before ||
    entry.amountCents <= before * PRICE_RISE ||
    (await db.$count(
      actions,
      and(eq(actions.messageId, entry.messageId), eq(actions.kind, 'heads_up'))
    )) > 0
  ) {
    return
  }
  const language = await languageOf(board.userId)
  const t = dictionaries[language]
  await db.insert(actions).values({
    autonomous: false,
    detail: t.headsUp.priceUp(
      entry.group,
      money(language, before, entry.currency),
      money(language, entry.amountCents, entry.currency)
    ),
    kind: 'heads_up',
    messageId: entry.messageId,
    reason: board.name,
    status: 'pending',
    threadId: message.threadId,
    title: t.headsUp.price,
    userId: board.userId,
  })
  await announceChange(board.userId, ACTION_TOPICS)
}

/** A later email of the same thing keeps the amount the first one gave, but its payment moves on: an invoice due, then paid. */
const movedOn = (
  earlier: Entry,
  amount: ReturnType<typeof moneyOf> & { currency: string | null }
) =>
  earlier.amountCents === null
    ? amount
    : amount.payment && moneyOf(earlier.amountCents, amount.payment)

/** A later email of the same thing (shipped after ordered) updates its entry, so its amount is not counted twice. */
/** Money moves before the email about it: a later date is the model's guess, and such guesses piled a year of receipts into one month. */
const occurredAtOf = (
  stated: string | null,
  { receivedAt }: ReadMessage,
  payment: BoardPayment | null
) => {
  const date = stated ? new Date(stated) : null
  if (!date || Number.isNaN(date.getTime())) {
    return receivedAt
  }
  return payment !== null && date > addDays(receivedAt, 1) ? receivedAt : date
}

const saveEntry = async (
  board: Board,
  message: ReadMessage,
  output: typeof entrySchema.infer,
  earlier: Entry | undefined,
  editedAt: Date | null
) => {
  const status = output.status?.trim() || null
  const amount =
    output.amount !== null && output.amount !== 0 && output.currency
      ? {
          ...moneyOf(Math.round(output.amount * 100), output.payment),
          currency: output.currency.toUpperCase(),
        }
      : { ...moneyOf(null, null), currency: null }
  const due = output.dueAt ? new Date(output.dueAt) : null
  const dueAt = due && due.getTime() > Date.now() ? due : null
  const messageId = await keptIdOf(message)
  if (earlier && output.isUpdate) {
    // What the user corrected is theirs: news in the thread never writes over it.
    if (earlier.editedAt) {
      return
    }
    await db
      .update(boardEntries)
      .set({
        messageId,
        ...(dueAt && { dueAt }),
        ...(status && { status }),
        ...movedOn(earlier, amount),
      })
      .where(eq(boardEntries.id, earlier.id))
    return
  }
  const [entry] = await db
    .insert(boardEntries)
    .values({
      ...amount,
      boardId: board.id,
      dueAt,
      editedAt,
      group: output.group?.trim() || null,
      messageId,
      occurredAt: occurredAtOf(output.occurredAt, message, amount.payment),
      status,
      title: output.title.trim() || message.subject,
      userId: board.userId,
    })
    .onConflictDoNothing()
    .returning()
  await watchPrice(board, entry, message)
}

interface KnownValues {
  groups: string[]
  rejected: { from: string; title: string }[]
  statuses: string[]
}

/** `isAdded`: the user put this email on the board themselves, so it belongs and is its own entry. */
const extractEntry = async (
  board: Board,
  message: ReadMessage,
  context: KnownValues & { isAdded?: boolean; language: Locale }
) => {
  const [stored] = context.isAdded
    ? []
    : await db
        .select({ risk: messages.risk })
        .from(messages)
        .where(eq(messages.id, message.id))
  // A "new IBAN, pay today" email is a fraud warning, never a bill on a money board.
  if (stored?.risk) {
    return
  }
  const [earlier] = context.isAdded
    ? []
    : await db
        .select({ entry: boardEntries })
        .from(boardEntries)
        .innerJoin(messages, eq(messages.id, boardEntries.messageId))
        .where(
          and(
            eq(boardEntries.boardId, board.id),
            eq(messages.mailboxId, message.mailboxId),
            eq(messages.threadId, message.threadId)
          )
        )
        .orderBy(desc(messages.receivedAt))
        .limit(1)
  const language = englishName(context.language)
  const { output } = await generateText({
    instructions: [
      `Board "${board.name}": ${board.description}`,
      'belongs: whether this email is an entry of that board. Marketing, newsletters and anything off-topic do not belong.',
      context.rejected.length > 0
        ? `The user took these off the board as not belonging; mail like them does not belong either: ${context.rejected.map(({ from, title }) => `"${title}" from ${from}`).join('; ')}.`
        : '',
      `Write title and status in ${language}, even when the email is in another language.`,
      'title: what this entry is in a few words ("Lisbon → Kyiv", "Netflix Premium"), never the subject line.',
      `group: who or what it belongs to as people say it ("Netflix", "Ryanair"), or null.${context.groups.length > 0 ? ` Reuse one of these when it is the same: ${context.groups.join(', ')}.` : ''}`,
      `status: its state as this board tracks it besides payment, in one or two lowercase words, or null: orders track delivery (ordered, shipped, delivered), trips a booking (booked, cancelled), applications their stage (applied, rejected); null on a board about money, where payment says it.${context.statuses.length > 0 ? ` Reuse one of these when it means the same: ${context.statuses.join(', ')}.` : ''}`,
      board.bannerDays === null
        ? 'dueAt: null.'
        : 'dueAt: ISO date the email states for the next thing of this board the user must not miss: on a board about money only a date money is due by or a renewal or next charge, else its own event (a departure, an event start, a delivery on a board of orders). null for something already paid that does not renew, for a delivery on any other board, for a date that has passed, for a guess.',
      `amount and currency (ISO 4217): the total charged, due, refunded or received, else null. payment, whenever there is an amount, else null: paid (the user paid or was charged), due (a bill or invoice the user has yet to pay), failed (a charge declined or not gone through), refund (money back for something the user paid: refund, chargeback, credit), income (money paid to the user: a client paying, a payout, a salary). occurredAt: ISO date of the event itself when the email states it (the charge, the departure, the delivery), else null, never today's date nor a guess. Today is ${new Date().toISOString().slice(0, 10)}.`,
      earlier
        ? `isUpdate: this thread already holds the entry "${earlier.entry.title}"${earlier.entry.status ? ` (${earlier.entry.status})` : ''}. true when this email is news about that same thing (shipped, delivered, changed, cancelled), false when it is a new one (next month's receipt, a refund).`
        : 'isUpdate: false.',
    ]
      .filter(Boolean)
      .join('\n'),
    model: models.fast,
    output: Output.object({ schema: entrySchema }),
    prompt: `From: ${message.fromName ?? ''} <${message.fromEmail}>\nDate: ${message.receivedAt.toISOString().slice(0, 10)}\nSubject: ${message.subject}\n\n${message.body.slice(0, ENTRY_BODY_CHARS)}`,
    telemetry: trackUsage(board.userId, 'board_entry'),
  })
  if (context.isAdded) {
    await saveEntry(
      board,
      message,
      { ...output, isUpdate: false },
      undefined,
      new Date()
    )
    return
  }
  if (output.belongs && (await isUnchanged(board))) {
    await saveEntry(board, message, output, earlier?.entry, null)
  }
}

const distinct = (values: (string | null)[]) =>
  [...new Set(values.filter((value) => value !== null))].slice(
    0,
    KNOWN_VALUES_SHOWN
  )

/** Taken-off entries still count as read (their thread is never collected again) and teach the model, but their names are not suggested. */
const knownValues = async (boardId: string) => {
  const rows = await db
    .select({
      dismissedAt: boardEntries.dismissedAt,
      fromEmail: messages.fromEmail,
      group: boardEntries.group,
      mailboxId: messages.mailboxId,
      receivedAt: messages.receivedAt,
      status: boardEntries.status,
      threadId: messages.threadId,
      title: boardEntries.title,
    })
    .from(boardEntries)
    .innerJoin(messages, eq(messages.id, boardEntries.messageId))
    .where(eq(boardEntries.boardId, boardId))
  const latestInThread = new Map<string, number>()
  for (const row of rows) {
    latestInThread.set(
      threadKey(row),
      Math.max(
        latestInThread.get(threadKey(row)) ?? 0,
        row.receivedAt.getTime()
      )
    )
  }
  const kept = rows.filter(({ dismissedAt }) => !dismissedAt)
  return {
    groups: distinct(kept.map(({ group }) => group)),
    latestInThread,
    rejected: rows
      .flatMap(({ dismissedAt, fromEmail, title }) =>
        dismissedAt ? [{ dismissedAt, from: fromEmail, title }] : []
      )
      .toSorted(
        (left, right) =>
          right.dismissedAt.getTime() - left.dismissedAt.getTime()
      )
      .slice(0, REJECTED_SHOWN)
      .map(({ from, title }) => ({ from, title })),
    statuses: distinct(kept.map(({ status }) => status)),
  }
}

/** Each message is read once per board, a thread's oldest first so a later one updates its entry instead of adding one; mail the user sent is never an entry. */
export const collectEntries = async (
  board: Board,
  candidates: ReadMessage[]
) => {
  if (candidates.length === 0) {
    return
  }
  const language = await languageOf(board.userId)
  const { latestInThread } = await knownValues(board.id)
  const fresh = candidates.filter(
    (message) =>
      !message.isFromMe &&
      message.receivedAt.getTime() >
        (latestInThread.get(threadKey(message)) ?? 0)
  )
  const threads = [...Map.groupBy(fresh, threadKey).values()].map((thread) =>
    thread.toSorted(
      (left, right) => left.receivedAt.getTime() - right.receivedAt.getTime()
    )
  )
  const isLong = threads.length > EXTRACT_CONCURRENCY
  for (let index = 0; index < threads.length; index += EXTRACT_CONCURRENCY) {
    // oxlint-disable-next-line eslint/no-await-in-loop -- stop once the board was described anew
    if (!(await isUnchanged(board))) {
      return
    }
    // oxlint-disable-next-line eslint/no-await-in-loop -- each batch sees the groups and statuses the previous one wrote, so spellings converge
    const known = await knownValues(board.id)
    // oxlint-disable-next-line eslint/no-await-in-loop -- batches cap concurrency
    await Promise.allSettled(
      threads.slice(index, index + EXTRACT_CONCURRENCY).map(async (thread) => {
        for (const message of thread) {
          // oxlint-disable-next-line eslint/no-await-in-loop -- in order: each message sees the entry the one before wrote
          await extractEntry(board, message, { ...known, language }).catch(
            (error) => logError(`board entry ${message.id} failed`, error)
          )
        }
      })
    )
    if (isLong) {
      // oxlint-disable-next-line eslint/no-await-in-loop -- a long history read fills the page batch by batch
      await announceChange(board.userId, ['boards'])
    }
  }
}

/** Of `incoming`, collects what the board's query returns within the analysis window. */
export const collectMatching = async (board: Board, incoming: Message[]) => {
  if (incoming.length === 0) {
    return
  }
  const results = await searchMailboxes(
    board.userId,
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
}

/** Boards still reading their history are skipped: `readBoardHistory` catches up on what arrived meanwhile. */
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
  await Promise.all(ready.map((board) => collectMatching(board, incoming)))
  if (ready.length > 0) {
    await announceChange(userId, ['boards', 'today'])
  }
}

/** Puts an email the search missed on the board; one already there and taken off comes back. */
export const addToBoard = async (
  userId: string,
  boardId: string,
  messageId: string
) => {
  const board = await getOwnBoard(userId, boardId)
  const [message] = await db
    .select()
    .from(messages)
    .where(and(eq(messages.id, messageId), eq(messages.userId, userId)))
  if (!message) {
    throw new NotFoundError('Email not found')
  }
  const [present] = await db
    .update(boardEntries)
    .set({ dismissedAt: null, editedAt: new Date() })
    .where(
      and(
        eq(boardEntries.boardId, boardId),
        eq(boardEntries.messageId, messageId)
      )
    )
    .returning({ id: boardEntries.id })
  if (!present) {
    const { groups, rejected, statuses } = await knownValues(boardId)
    await extractEntry(board, message, {
      groups,
      isAdded: true,
      language: await languageOf(userId),
      rejected,
      statuses,
    })
  }
  await announceChange(userId, ['boards', 'today'])
}

/** The user's correction outranks the model: an edited entry survives a new description. */
export const updateEntry = async (
  userId: string,
  id: string,
  input: {
    amountCents?: number | null
    currency?: string | null
    dueAt?: Date | null
    group?: string | null
    occurredAt?: Date
    payment?: BoardPayment | null
    status?: string | null
    title?: string
  }
) => {
  const entry = await getOwnEntry(userId, id)
  const { amountCents = entry.amountCents, payment = entry.payment } = input
  await db
    .update(boardEntries)
    .set({
      ...input,
      ...moneyOf(amountCents, payment),
      currency:
        trimmed(input.currency)?.toUpperCase() ?? trimmed(input.currency),
      editedAt: new Date(),
      group: trimmed(input.group),
      status: trimmed(input.status),
      title: input.title?.trim() || undefined,
    })
    .where(eq(boardEntries.id, id))
  await announceChange(userId, ['boards', 'today'])
}

/** Takes an entry off its board without forgetting it: the email is never collected again and the model learns from it. */
export const dismissEntry = async (
  userId: string,
  id: string,
  isDismissed = true
) => {
  await getOwnEntry(userId, id)
  await db
    .update(boardEntries)
    .set({ dismissedAt: isDismissed ? new Date() : null })
    .where(eq(boardEntries.id, id))
  await announceChange(userId, ['boards', 'today'])
}

/** Renaming a group onto another one's name merges the two. */
export const renameGroup = async (
  userId: string,
  boardId: string,
  input: { from: string; to: string }
) => {
  await getOwnBoard(userId, boardId)
  const rows = await db
    .select({ group: boardEntries.group, id: boardEntries.id })
    .from(boardEntries)
    .where(eq(boardEntries.boardId, boardId))
  const ids = rows
    .filter(({ group }) => group === input.from)
    .map(({ id }) => id)
  if (ids.length > 0) {
    await db
      .update(boardEntries)
      .set({ group: input.to.trim() || null })
      .where(inArray(boardEntries.id, ids))
  }
  await announceChange(userId, ['boards', 'today'])
}

const chartFor = async (board: Board, ask: string, language: Locale) => {
  const { output } = await generateText({
    instructions: [
      `Board "${board.name}": ${board.description}. Its entries carry a title, a group, a status, an amount and a date.`,
      `Turn the user's ask into one chart. ${chartRules(language)}`,
    ].join('\n'),
    model: models.fast,
    output: Output.object({ schema: chartSchema }),
    prompt: ask,
    telemetry: trackUsage(board.userId, 'board_chart'),
  })
  return output
}

/** One more chart from the user's own words ("spending per shop this year"); an empty ask adds a count per month. */
export const addChart = async (
  userId: string,
  boardId: string,
  ask: string
) => {
  const board = await getOwnBoard(userId, boardId)
  const language = await languageOf(userId)
  const chart = ask.trim()
    ? await chartFor(board, ask, language)
    : {
        groupBy: 'month' as const,
        measure: 'count' as const,
        title: dictionaries[language].boards.chart.untitled,
        type: 'bar' as const,
      }
  const added = { ...chart, id: crypto.randomUUID() }
  await db
    .update(boards)
    .set({ charts: [...board.charts, added] })
    .where(eq(boards.id, boardId))
  await announceChange(userId, ['boards'])
  return added
}

const currenciesByUse = (entries: Entry[]) => {
  const counts = new Map<string, number>()
  for (const { currency } of entries) {
    if (currency) {
      counts.set(currency, (counts.get(currency) ?? 0) + 1)
    }
  }
  return [...counts]
    .toSorted((left, right) => right[1] - left[1])
    .map(([currency]) => currency)
}

const bucketOf = (chart: { groupBy: BoardChart['groupBy'] }, entry: Entry) => {
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
      return entry.status ?? entry.payment
    }
  }
}

const timeBuckets = (chart: BoardChart, entries: Entry[]) => {
  const dates = entries.map(({ occurredAt }) => occurredAt.getTime())
  if (dates.length === 0) {
    return []
  }
  const now = Date.now()
  const past = dates.filter((date) => date <= now)
  // Trips and events sit ahead: ending at the furthest one would show empty future buckets instead of the history.
  const interval = {
    end: new Date(Math.max(...(past.length > 0 ? past : dates))),
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

/** Sums add up spending (payments less refunds) in one currency, since mixing them would draw a meaningless total; `left` counts what a sum leaves out and why, so the chart can say so. */
const chartSeries = (chart: BoardChart, entries: Entry[]) => {
  const currencies =
    chart.measure === 'sum' ? currenciesByUse(entries.filter(isSpending)) : []
  const sumCurrency =
    currencies.find((currency) => currency === chart.currency) ??
    currencies[0] ??
    null
  const totals = new Map<string, { count: number; value: number }>()
  const left = { amount: 0, currency: 0, payment: 0 }
  for (const entry of entries) {
    const bucket = bucketOf(chart, entry)
    if (chart.measure === 'sum') {
      const reason =
        (entry.amountCents === null && 'amount') ||
        (!isSpending(entry) && 'payment') ||
        (entry.currency !== sumCurrency && 'currency')
      if (reason) {
        left[reason] += 1
        continue
      }
    }
    if (!bucket) {
      continue
    }
    const total = totals.get(bucket) ?? { count: 0, value: 0 }
    totals.set(bucket, {
      count: total.count + 1,
      value:
        total.value +
        (chart.measure === 'sum' ? (entry.amountCents ?? 0) / 100 : 1),
    })
  }
  const shared = { ...chart, currencies, left, sumCurrency }
  const isOverTime = chart.groupBy === 'month' || chart.groupBy === 'week'
  if (isOverTime) {
    return {
      ...shared,
      points: timeBuckets(chart, entries).map((key) => ({
        count: totals.get(key)?.count ?? 0,
        key,
        value: totals.get(key)?.value ?? 0,
      })),
      rest: 0,
    }
  }
  // A pie cannot draw a negative share: a fully refunded group nets to zero or below and drops out.
  const ranked = [...totals]
    .map(([key, total]) => ({ key, ...total }))
    .filter(({ value }) => chart.measure !== 'sum' || value > 0)
    .toSorted((one, other) => other.value - one.value)
  return {
    ...shared,
    points: ranked.slice(0, SHARE_BUCKETS_SHOWN),
    rest: ranked
      .slice(SHARE_BUCKETS_SHOWN)
      .reduce((sum, { value }) => sum + value, 0),
  }
}

const monthlyCentsOf = (groups: { monthlyCents: number | null }[]) => {
  let total = 0
  for (const { monthlyCents } of groups) {
    total += monthlyCents ?? 0
  }
  return total
}

type Totals = Map<string, { amountCents: number; count: number }>

/** Per month, what was paid, refunded and received in each currency, the board's own first: three numbers side by side, none taken off another. */
const monthsOf = (counted: Entry[], currency: string | null) => {
  const byMonth = Map.groupBy(
    counted.filter((entry) => entry.amountCents !== null && entry.currency),
    (entry) => format(entry.occurredAt, 'yyyy-MM')
  )
  const listed = (entries: Entry[]) => {
    const totals: Totals = new Map()
    for (const entry of entries) {
      const code = entry.currency ?? ''
      const total = totals.get(code) ?? { amountCents: 0, count: 0 }
      totals.set(code, {
        amountCents: total.amountCents + Math.abs(entry.amountCents ?? 0),
        count: total.count + 1,
      })
    }
    return [...totals]
      .map(([code, total]) => ({ currency: code, ...total }))
      .toSorted(
        (one, other) =>
          Number(other.currency === currency) -
            Number(one.currency === currency) || other.count - one.count
      )
  }
  const of = (entries: Entry[], payment: BoardPayment) =>
    listed(entries.filter((entry) => entry.payment === payment))
  return [...byMonth].map(([month, entries]) => ({
    month,
    paid: of(entries, 'paid'),
    received: of(entries, 'income'),
    refunded: of(entries, 'refund'),
  }))
}

/** A failed charge or a bill nobody has paid since, from the last 30 days or still due: what the user has to act on. */
const attentionOf = (counted: Entry[]) => {
  const since = subDays(new Date(), UPCOMING_DAYS)
  const settledLater = (open: Entry) =>
    counted.some(
      (entry) =>
        entry.payment === 'paid' &&
        (entry.group ?? entry.title) === (open.group ?? open.title) &&
        entry.occurredAt >= open.occurredAt
    )
  return counted
    .filter(
      (entry) =>
        (entry.payment === 'failed' || entry.payment === 'due') &&
        (entry.occurredAt >= since || (entry.dueAt ?? since) > new Date()) &&
        !settledLater(entry)
    )
    .map(({ id }) => id)
}

/** A date of the next 30 days: stated in an email, or expected from a group's pace — every one of them, so a weekly charge comes four times. `isEstimate`: the amount is the last price, not one an email asked for. */
const upcomingOf = (
  counted: ShownEntry[],
  groups: ReturnType<typeof groupsOf>
) => {
  const now = new Date()
  const soon = addDays(now, UPCOMING_DAYS)
  const isSoon = (date: Date | null): date is Date =>
    date !== null && date >= now && date <= soon
  // A renewal notice and the last receipt often both name the next date: one charge, listed once, the bill first.
  const stated = new Map<string, ShownEntry & { dueAt: Date }>()
  for (const row of counted.toSorted(
    (left, right) =>
      Number(right.entry.payment === 'due') -
      Number(left.entry.payment === 'due')
  )) {
    const { dueAt, group, title } = row.entry
    const key = `${group ?? title}|${format(dueAt ?? now, 'yyyy-MM-dd')}`
    if (isSoon(dueAt) && !stated.has(key)) {
      stated.set(key, { ...row, dueAt })
    }
  }
  const predicted = groups.filter(
    (group) => group.isNextPredicted && group.nextAt && group.nextAt <= soon
  )
  return [
    ...[...stated.values()].map(({ dueAt, entry, threadId }) => ({
      amountCents: entry.amountCents,
      currency: entry.currency,
      dueAt,
      every: groups.find(({ name }) => name === entry.group)?.every ?? null,
      id: entry.id,
      isEstimate: entry.payment === 'paid',
      isPredicted: false,
      payment: entry.payment,
      threadId,
      title: entry.title,
    })),
    ...predicted.flatMap((group) => {
      const cadence = CADENCES.find(({ every }) => every === group.every)
      if (!cadence || !group.nextAt) {
        return []
      }
      const dates: Date[] = []
      for (let date = group.nextAt; date <= soon; date = cadence.next(date)) {
        if (date >= now) {
          dates.push(date)
        }
      }
      return dates.map((dueAt) => ({
        amountCents: group.lastAmountCents,
        currency: group.currency,
        dueAt,
        every: group.every,
        id: `${group.name}:${dueAt.toISOString()}`,
        isEstimate: true,
        isPredicted: true,
        payment: 'paid' as const,
        threadId: group.threadId,
        title: group.name,
      }))
    }),
  ].toSorted((left, right) => left.dueAt.getTime() - right.dueAt.getTime())
}

const isCharge = (payment: BoardPayment | null) =>
  payment === 'due' || payment === 'paid' || payment === 'failed'

/** The numbers on top of a board: what was paid, refunded and received per month, what repeats per month, what comes up soon and what of it is to pay. */
const summaryOf = (
  { counted }: ReturnType<typeof countedOf>,
  groups: ReturnType<typeof groupsOf>,
  currency: string | null
) => {
  const recurring = groups.filter(
    (group) => group.monthlyCents !== null && group.currency === currency
  )
  const items = upcomingOf(counted, groups)
  const toPay = items.filter(
    (item) =>
      isCharge(item.payment) &&
      item.amountCents !== null &&
      item.currency === currency
  )
  return {
    currency,
    months: monthsOf(
      counted.map(({ entry }) => entry),
      currency
    ),
    recurring:
      recurring.length > 0
        ? { count: recurring.length, monthlyCents: monthlyCentsOf(recurring) }
        : null,
    upcoming: {
      count: items.length,
      items,
      toPay: {
        amountCents: toPay.reduce(
          (sum, { amountCents }) => sum + (amountCents ?? 0),
          0
        ),
        count: toPay.length,
        isEstimate: toPay.some(({ isEstimate }) => isEstimate),
      },
    },
  }
}

export const getBoard = async (userId: string, id: string) => {
  const board = await getOwnBoard(userId, id)
  const rows = await shownEntries(eq(boardEntries.boardId, id)).orderBy(
    desc(boardEntries.occurredAt)
  )
  const charges = countedOf(rows)
  const counted = charges.counted.map(({ entry }) => entry)
  const currencies = currenciesByUse(counted)
  const groups = groupsOf(charges.counted)
  const now = new Date()
  return {
    attention: attentionOf(counted),
    bannerDays: board.bannerDays,
    charts: board.charts.map((chart) => chartSeries(chart, counted)),
    currencies,
    description: board.description,
    entries: rows.slice(0, ENTRIES_SHOWN).map(({ entry, threadId }) => ({
      amountCents: entry.amountCents,
      currency: entry.currency,
      dueAt: entry.dueAt && entry.dueAt > now ? entry.dueAt : null,
      group: entry.group,
      id: entry.id,
      isEdited: entry.editedAt !== null,
      keys: {
        month: bucketOf({ groupBy: 'month' }, entry),
        week: bucketOf({ groupBy: 'week' }, entry),
      },
      occurredAt: entry.occurredAt,
      payment: entry.payment,
      repeatOf: charges.repeatOf.get(entry.id) ?? null,
      status: entry.status,
      threadId,
      title: entry.title,
    })),
    gmailQuery: board.gmailQuery,
    groups,
    historyFound: board.historyFound,
    id: board.id,
    isHistoryCapped: (board.historyFound ?? 0) >= BOARD_HISTORY_LIMIT,
    isReadingHistory: !board.historyReadAt,
    name: board.name,
    periodDays: board.periodDays,
    statuses: distinct(rows.map(({ entry }) => entry.status)),
    summary: summaryOf(charges, groups, currencies[0] ?? null),
    total: rows.length,
  }
}
