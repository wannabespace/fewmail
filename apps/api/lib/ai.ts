import { db } from '@fewmail/db'
import { aiUsage } from '@fewmail/db/schema'
import type { AiFeature } from '@fewmail/db/schema'
import { openrouter } from '@openrouter/ai-sdk-provider'
import type { TelemetryOptions } from 'ai'
import { createRetryableModel } from 'ai-retry/language-model'

import { logError } from './log'

export const FAST_MODEL_ID = 'anthropic/claude-haiku-4.5'
export const FAST_FALLBACK_ID = 'google/gemini-3.8-flash'
export const WRITER_MODEL_ID = 'anthropic/claude-sonnet-5.5'
export const WRITER_FALLBACK_ID = 'x-ai/grok-4.7'

export const models = {
  /** Every incoming message goes through it, so it must stay cheap. */
  fast: createRetryableModel({
    model: openrouter(FAST_MODEL_ID),
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

export const trackUsage = (
  userId: string,
  feature: AiFeature
): TelemetryOptions => ({
  integrations: {
    onLanguageModelCallEnd: async ({ modelId, providerMetadata, usage }) => {
      const billed = providerMetadata?.openrouter?.usage
      try {
        await db.insert(aiUsage).values({
          cacheReadTokens: usage.inputTokenDetails.cacheReadTokens ?? 0,
          cacheWriteTokens: usage.inputTokenDetails.cacheWriteTokens ?? 0,
          cost:
            billed && typeof billed === 'object' && 'cost' in billed
              ? Number(billed.cost)
              : null,
          feature,
          inputTokens: usage.inputTokens ?? 0,
          model: modelId,
          outputTokens: usage.outputTokens ?? 0,
          userId,
        })
      } catch (error) {
        logError('ai usage record failed', error)
      }
    },
  },
})
