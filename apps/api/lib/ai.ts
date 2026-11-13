import { db } from '@fewmail/db'
import { aiUsage } from '@fewmail/db/schema'
import type { AiFeature } from '@fewmail/db/schema'
import { openrouter } from '@openrouter/ai-sdk-provider'
import type { TelemetryOptions } from 'ai'
import { createRetryableModel } from 'ai-retry/language-model'

import { charge } from '../services/plan'
import { logError } from './log'

export const FAST_MODEL_ID = 'typesafe/jev-router'
export const FAST_FALLBACK_ID = 'google/gemini-3.8-flash'
export const WRITER_MODEL_ID = 'anthropic/claude-sonnet-5.5'
export const WRITER_FALLBACK_ID = 'x-ai/grok-4.7'

export const models = {
  /**
   * Every incoming message goes through it, so it must stay cheap. Jev Router picks the model per request;
   * without `data_collection: 'deny'` it may pick a provider that trains on mail, which the privacy policy forbids.
   */
  fast: createRetryableModel({
    model: openrouter(FAST_MODEL_ID, { provider: { data_collection: 'deny' } }),
    retries: [openrouter(FAST_FALLBACK_ID)],
  }),
  /** Drafts: the text a person reads or sends. */
  writer: createRetryableModel({
    model: openrouter(WRITER_MODEL_ID),
    retries: [openrouter(WRITER_FALLBACK_ID)],
  }),
}

export const INFORMAL_ADDRESS =
  'Address the user informally where the language distinguishes (Ukrainian ти, German du, French tu, Spanish tú).'

export const NO_EM_DASH =
  'Never use em dashes (—): a comma, colon, period or parentheses instead.'

/**
 * USD per token, so every call is paid from the allowance at its real price whatever OpenRouter reports (a key
 * of our own makes it report 0). `economics.test.ts` keeps it equal to LiteLLM's table. Jev Router has no price
 * of its own and is charged at OpenRouter's report, so it must never run on a key of our own.
 */
export const MODEL_PRICES: Record<
  string,
  { cacheRead: number; cacheWrite: number; input: number; output: number }
> = {
  [FAST_FALLBACK_ID]: {
    cacheRead: 7.5e-8,
    cacheWrite: 7.5e-7,
    input: 7.5e-7,
    output: 3.75e-6,
  },
  [WRITER_FALLBACK_ID]: {
    cacheRead: 5e-7,
    cacheWrite: 2e-6,
    input: 2e-6,
    output: 6e-6,
  },
  [WRITER_MODEL_ID]: {
    cacheRead: 1e-7,
    cacheWrite: 2.5e-6,
    input: 2e-6,
    output: 1e-5,
  },
}

const reportedCost = (metadata: unknown) => {
  const billed = (metadata as { openrouter?: { usage?: unknown } } | undefined)
    ?.openrouter?.usage
  return billed && typeof billed === 'object' && 'cost' in billed
    ? Number(billed.cost)
    : null
}

export const trackUsage = (
  userId: string,
  feature: AiFeature
): TelemetryOptions => ({
  integrations: {
    onLanguageModelCallEnd: async ({ modelId, providerMetadata, usage }) => {
      const { cacheReadTokens = 0, cacheWriteTokens = 0 } =
        usage.inputTokenDetails
      const inputTokens = usage.inputTokens ?? 0
      const outputTokens = usage.outputTokens ?? 0
      const price = MODEL_PRICES[modelId]
      const cost = price
        ? (inputTokens - cacheReadTokens - cacheWriteTokens) * price.input +
          cacheReadTokens * price.cacheRead +
          cacheWriteTokens * price.cacheWrite +
          outputTokens * price.output
        : reportedCost(providerMetadata)
      try {
        await Promise.all([
          db.insert(aiUsage).values({
            cacheReadTokens,
            cacheWriteTokens,
            cost,
            feature,
            inputTokens,
            model: modelId,
            outputTokens,
            userId,
          }),
          charge(userId, cost ?? 0),
        ])
      } catch (error) {
        logError('ai usage record failed', error)
      }
    },
  },
})
