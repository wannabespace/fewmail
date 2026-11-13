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
 * Each was measured on 2026-11-13 (in brackets) with a little room for LiteLLM's prices moving.
 * Lite loses money even at typical use, Pro once its limits are spent, and a typical yearly Pro only breaks
 * even: these keep it from getting worse, they do not say it is fine.
 */
const BUDGET = {
  // Every email and message the plan allows, at typical sizes (Lite $7.34, Pro $20.41, Max $99.80).
  fullMonthUsd: { lite: 7.7, max: 104, pro: 21.5 },
  // A trial spending all its emails and messages in 14 days ($10.08).
  fullTrialUsd: 10.6,
  // One counted email at every cap: four earlier emails, two 3-page attachments, a draft ($0.049).
  heaviestEmailUsd: 0.052,
  // One message at 12 steps over a 30k-token chat ($1.37).
  heaviestMessageUsd: 1.45,
  // A free account with 6,000 incoming and 600 sent emails a month, Jev only ($1.66).
  heavyFreeMonthUsd: 1.75,
  // 450 counted emails (Lite: its 330) and 30 messages a month (Lite -49% / -71%, Pro 13% / -1%, Max 68% / 64%).
  typicalMargin: {
    lite: { month: -0.55, year: -0.78 },
    max: { month: 0.65, year: 0.6 },
    pro: { month: 0.1, year: -0.04 },
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
