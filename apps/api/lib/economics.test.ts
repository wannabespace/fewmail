import { expect, test } from 'bun:test'

import { PAID_PLANS } from '@fewmail/shared/agent'

import { FAST_FALLBACK_ID, WRITER_FALLBACK_ID } from './ai'
import {
  analyzedEmailCost,
  freeMonthCost,
  FULL,
  HEAVY,
  margin,
  messageCost,
  monthCost,
  priceOf,
  trialCost,
  TYPICAL,
} from './economics'

/**
 * Raising a number here costs money: rethink the change, or raise it on purpose and say why in the commit.
 * Each was measured on 2026-11-13, with the chat's prompt cache (in brackets), with a little room for LiteLLM's prices moving.
 * Every plan keeps about 28% even with its limits spent at typical sizes; heavy use (every size at its cap) still loses.
 */
const BUDGET = {
  // Every email and message the plan allows, at typical sizes (Lite $3.11, Pro $6.40, Max $20.09).
  fullMonthUsd: { lite: 3.3, max: 21, pro: 6.7 },
  // A trial spending all its emails, messages and speech in 14 days ($2.71).
  fullTrialUsd: 2.9,
  // One counted email at every cap: four earlier emails, two 3-page attachments, a draft ($0.040).
  heaviestEmailUsd: 0.042,
  // One message at 12 steps over a 30k-token chat ($0.27; $1.37 before the cache).
  heaviestMessageUsd: 0.29,
  // A free account with 6,000 incoming and 600 sent emails a month, Jev only ($1.66).
  heavyFreeMonthUsd: 1.75,
  // The month's speech read aloud whole (Lite $0.48, Pro $1.44, Max $4.80; $30 before the limit).
  speechMonthUsd: { lite: 0.5, max: 5, pro: 1.5 },
  // 450 counted emails (Lite: its 220) and 30 messages a month (Lite: its 20) (Lite 36% / 31%, Pro 52% / 46%, Max 81% / 80%).
  typicalMargin: {
    lite: { month: 0.34, year: 0.29 },
    max: { month: 0.8, year: 0.78 },
    pro: { month: 0.5, year: 0.44 },
  },
}

test('every model the API calls has a price, fallbacks too', () => {
  expect(monthCost('max', HEAVY).total).toBeGreaterThan(0)
  for (const model of [FAST_FALLBACK_ID, WRITER_FALLBACK_ID]) {
    expect(priceOf(model, 'input_cost_per_token')).toBeGreaterThan(0)
    expect(priceOf(model, 'output_cost_per_token')).toBeGreaterThan(0)
  }
})

test('typical use keeps each plan its margin', () => {
  for (const plan of PAID_PLANS) {
    const { total } = monthCost(plan, TYPICAL)
    expect(margin(plan, 'month', total)).toBeGreaterThanOrEqual(
      BUDGET.typicalMargin[plan].month
    )
    expect(margin(plan, 'year', total)).toBeGreaterThanOrEqual(
      BUDGET.typicalMargin[plan].year
    )
  }
})

test('a plan with every limit spent stays within its budget', () => {
  for (const plan of PAID_PLANS) {
    expect(monthCost(plan, FULL).total).toBeLessThanOrEqual(
      BUDGET.fullMonthUsd[plan]
    )
  }
})

test('the dearest email and message stay within the budget', () => {
  expect(analyzedEmailCost(HEAVY).total).toBeLessThanOrEqual(
    BUDGET.heaviestEmailUsd
  )
  expect(messageCost(HEAVY)).toBeLessThanOrEqual(BUDGET.heaviestMessageUsd)
})

test('a trial spent whole stays within the budget', () => {
  expect(trialCost(FULL)).toBeLessThanOrEqual(BUDGET.fullTrialUsd)
})

test('a free account costs only Jev, within the budget', () => {
  expect(freeMonthCost(HEAVY)).toBeLessThanOrEqual(BUDGET.heavyFreeMonthUsd)
})

test('reading aloud stops at the speech limit of each plan', () => {
  for (const plan of PAID_PLANS) {
    expect(monthCost(plan, HEAVY).speech).toBeLessThanOrEqual(
      BUDGET.speechMonthUsd[plan]
    )
  }
})
