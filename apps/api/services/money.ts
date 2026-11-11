import { db } from '@fewmail/db'
import { actions, messages, transactions } from '@fewmail/db/schema'
import { ANALYZE_WINDOW_DAYS } from '@fewmail/shared/agent'
import { messages as dictionaries } from '@fewmail/shared/i18n'
import { generateText, Output } from 'ai'
import { type } from 'arktype'
import { subDays } from 'date-fns'
import { and, desc, eq, gte, lt } from 'drizzle-orm'

import { models } from '../lib/ai'
import { getSettings } from './settings'

type Message = typeof messages.$inferSelect

const PERIOD_PER_MONTH = { month: 1, week: 52 / 12, year: 1 / 12 } as const

const chargeSchema = type({
  amount: 'number | null',
  chargedAt: 'string | null',
  currency: 'string',
  dueAt: 'string | null',
  kind: "'subscription' | 'bill' | 'purchase' | 'cancellation' | 'none'",
  merchant: 'string',
  period: "'month' | 'year' | 'week' | null",
})

const toDate = (value: string | null) =>
  value && !Number.isNaN(Date.parse(value)) ? new Date(value) : null

const formatMoney = (cents: number, currency: string, locale: string) =>
  new Intl.NumberFormat(locale, { currency, style: 'currency' }).format(
    cents / 100
  )

const subscriptionMerchants = async (userId: string) => {
  const rows = await db
    .selectDistinct({ merchant: transactions.merchant })
    .from(transactions)
    .where(
      and(
        eq(transactions.userId, userId),
        eq(transactions.kind, 'subscription')
      )
    )
  return rows.map(({ merchant }) => merchant)
}

/** A notification from a sender that billed a subscription before may be its cancellation. */
export const hasBilledBefore = async (message: Message) => {
  const [billed] = await db
    .select({ id: transactions.id })
    .from(transactions)
    .innerJoin(messages, eq(messages.id, transactions.messageId))
    .where(
      and(
        eq(transactions.userId, message.userId),
        eq(transactions.kind, 'subscription'),
        eq(messages.fromEmail, message.fromEmail)
      )
    )
    .limit(1)
  return Boolean(billed)
}

/** Pro: receipts and bills become a ledger; a subscription that costs more than last time becomes a Today card, a cancelled one leaves the Money page. */
export const recordCharge = async (message: Message) => {
  const merchants = await subscriptionMerchants(message.userId)
  const { output } = await generateText({
    instructions: [
      'Extract the charge from this email. kind: subscription (recurring plan), bill (an amount due to pay), purchase (one-time order), cancellation (a subscription was cancelled or will not renew), or none.',
      'merchant: the company name as people say it ("Notion", not "Notion Labs Inc."). amount: the total as a number, currency: ISO 4217 code.',
      ...(merchants.length > 0
        ? [
            `If it is one of these known subscriptions, use the merchant exactly as written: ${merchants.join(', ')}.`,
          ]
        : []),
      `chargedAt / dueAt: ISO dates if stated (today is ${new Date().toISOString().slice(0, 10)}). period: billing period for subscriptions.`,
    ].join('\n'),
    model: models.fast,
    output: Output.object({ schema: chargeSchema }),
    prompt: `From: ${message.fromName ?? ''} <${message.fromEmail}>\nSubject: ${message.subject}\n\n${message.body.slice(0, 5000)}`,
  })
  const merchant = output.merchant.trim()
  const chargedAt = toDate(output.chargedAt) ?? message.receivedAt
  if (output.kind === 'cancellation') {
    await db
      .insert(transactions)
      .values({
        amountCents: 0,
        chargedAt,
        currency: output.currency.toUpperCase(),
        kind: 'cancellation',
        merchant,
        messageId: message.id,
        userId: message.userId,
      })
      .onConflictDoNothing()
    return
  }
  if (output.kind === 'none' || output.amount === null || output.amount <= 0) {
    return
  }

  const amountCents = Math.round(output.amount * 100)
  const [previous] = await db
    .select()
    .from(transactions)
    .where(
      and(
        eq(transactions.userId, message.userId),
        eq(transactions.merchant, merchant),
        eq(transactions.kind, 'subscription'),
        lt(transactions.chargedAt, chargedAt)
      )
    )
    .orderBy(desc(transactions.chargedAt))
    .limit(1)

  await db
    .insert(transactions)
    .values({
      amountCents,
      chargedAt,
      currency: output.currency.toUpperCase(),
      dueAt: toDate(output.dueAt),
      kind: output.kind,
      merchant,
      messageId: message.id,
      period: output.period,
      userId: message.userId,
    })
    .onConflictDoNothing()

  if (
    output.kind === 'subscription' &&
    message.receivedAt >= subDays(new Date(), ANALYZE_WINDOW_DAYS) &&
    previous &&
    previous.currency === output.currency.toUpperCase() &&
    amountCents > previous.amountCents
  ) {
    const settings = await getSettings(message.userId)
    const t = dictionaries[settings?.language ?? 'en']
    const locale = settings?.language ?? 'en'
    await db.insert(actions).values({
      autonomous: false,
      kind: 'subscription',
      messageId: message.id,
      payload: { from: previous.amountCents, merchant, to: amountCents },
      reason: t.money.priceUp(
        merchant,
        formatMoney(previous.amountCents, previous.currency, locale),
        formatMoney(amountCents, previous.currency, locale)
      ),
      status: 'pending',
      threadId: message.threadId,
      title: t.money.priceUpTitle(merchant),
      userId: message.userId,
    })
  }
}

export const getMoney = async (userId: string) => {
  const rows = await db
    .select()
    .from(transactions)
    .where(eq(transactions.userId, userId))
    .orderBy(desc(transactions.chargedAt))

  const latestByMerchant = new Map<string, (typeof rows)[number]>()
  for (const row of rows) {
    if (
      (row.kind === 'subscription' || row.kind === 'cancellation') &&
      !latestByMerchant.has(row.merchant)
    ) {
      latestByMerchant.set(row.merchant, row)
    }
  }
  const subscriptions = [...latestByMerchant.values()]
    .filter((row) => row.kind === 'subscription')
    .map((row) => ({
      amountCents: row.amountCents,
      currency: row.currency,
      lastChargedAt: row.chargedAt,
      merchant: row.merchant,
      messageId: row.messageId,
      monthlyCents: Math.round(
        row.amountCents * PERIOD_PER_MONTH[row.period ?? 'month']
      ),
      period: row.period ?? 'month',
    }))
  const monthlyByCurrency = Object.entries(
    Object.groupBy(subscriptions, ({ currency }) => currency)
  ).map(([currency, items]) => ({
    currency,
    monthlyCents: (items ?? []).reduce(
      (sum, { monthlyCents }) => sum + monthlyCents,
      0
    ),
  }))

  const upcomingBills = await db
    .select()
    .from(transactions)
    .where(
      and(
        eq(transactions.userId, userId),
        eq(transactions.kind, 'bill'),
        gte(transactions.dueAt, new Date())
      )
    )
    .orderBy(transactions.dueAt)

  return {
    monthlyByCurrency,
    recent: rows
      .filter((row) => row.kind === 'bill' || row.kind === 'purchase')
      .slice(0, 20),
    subscriptions: subscriptions.toSorted(
      (left, right) => right.monthlyCents - left.monthlyCents
    ),
    upcomingBills,
  }
}

export const isChargeCategory = (category: string) =>
  category === 'receipt' || category === 'finance'
