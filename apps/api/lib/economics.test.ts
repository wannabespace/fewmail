import { expect, test } from 'bun:test'

import {
  PAID_PLANS,
  PLAN_ALLOWANCE_USD,
  TYPICAL_COST_USD,
} from '@fewmail/shared/agent'

import { FIM_MODEL, FIM_PRICE } from '../services/autocomplete'
import { FAST_FALLBACK_ID, MODEL_PRICES, WRITER_FALLBACK_ID } from './ai'
import {
  analyzedEmailCost,
  fairAllowance,
  freeMonthCost,
  FULL,
  HEAVY,
  margin,
  messageCost,
  monthCost,
  priceOf,
  TARGET_MARGIN,
  trialCost,
  TYPICAL,
} from './economics'
import { SPEECH_MODEL, SPEECH_USD_PER_CHAR } from './elevenlabs'
import {
  OCR_MODEL,
  OCR_USD_PER_PAGE,
  TRANSCRIBE_MODEL,
  TRANSCRIBE_USD_PER_SECOND,
} from './mistral'

/**
 * Raising a number here costs money: rethink the change, or raise it on purpose and say why in the commit.
 * Each was measured on 2026-11-13, with the chat's prompt cache (in brackets), with a little room for LiteLLM's prices moving.
 * The allowance stops the agent, so no plan loses money on it; only Jev on a heavy inbox is never stopped.
 */
const BUDGET = {
  // A trial spending its whole allowance in 14 days, with a busy inbox through Jev ($2.85).
  fullTrialUsd: 2.9,
  // One counted email at every cap: four earlier emails, two 3-page attachments, a draft ($0.040).
  heaviestEmailUsd: 0.042,
  // One message at 12 steps over a 30k-token chat ($0.27; $1.37 before the cache).
  heaviestMessageUsd: 0.29,
  // A free account with 6,000 incoming and 600 sent emails a month, Jev only ($1.66).
  heavyFreeMonthUsd: 1.75,
  // 450 counted emails and 30 messages a month (Lite: its allowance) (Lite 36% / 30%, Pro 51% / 46%, Max 81% / 79%).
  typicalMargin: {
    lite: { month: 0.34, year: 0.28 },
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

test('the allowance is charged at LiteLLM’s prices', () => {
  for (const [model, price] of Object.entries(MODEL_PRICES)) {
    expect(price.input).toBe(priceOf(model, 'input_cost_per_token'))
    expect(price.output).toBe(priceOf(model, 'output_cost_per_token'))
    expect(price.cacheRead).toBe(priceOf(model, 'cache_read_input_token_cost'))
  }
  expect(FIM_PRICE.input).toBe(priceOf(FIM_MODEL, 'input_cost_per_token'))
  expect(FIM_PRICE.output).toBe(priceOf(FIM_MODEL, 'output_cost_per_token'))
  expect(SPEECH_USD_PER_CHAR).toBe(
    priceOf(SPEECH_MODEL, 'input_cost_per_character')
  )
  expect(TRANSCRIBE_USD_PER_SECOND).toBe(
    priceOf(TRANSCRIBE_MODEL, 'input_cost_per_second')
  )
  expect(OCR_USD_PER_PAGE).toBe(priceOf(OCR_MODEL, 'ocr_cost_per_page'))
})

test('a plan keeps its margin with the allowance spent and a busy inbox', () => {
  for (const plan of PAID_PLANS) {
    const { interval, margin: target } = TARGET_MARGIN[plan]
    expect(
      margin(plan, interval, monthCost(plan, FULL).total)
    ).toBeGreaterThanOrEqual(target)
  }
})

test('the allowance gives users what the margin leaves', () => {
  for (const plan of PAID_PLANS) {
    expect(PLAN_ALLOWANCE_USD[plan]).toBeGreaterThan(fairAllowance(plan) - 0.1)
  }
})

test('the allowance is told in emails and messages at today’s prices', () => {
  const email = analyzedEmailCost(TYPICAL).total
  const message = messageCost(TYPICAL)
  expect(Math.abs(TYPICAL_COST_USD.email - email) / email).toBeLessThan(0.1)
  expect(Math.abs(TYPICAL_COST_USD.message - message) / message).toBeLessThan(
    0.1
  )
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
