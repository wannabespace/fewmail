import { openrouter } from '@openrouter/ai-sdk-provider'
import { createRetryableModel } from 'ai-retry/language-model'

export const models = {
  /** Every incoming message goes through it, so it must stay cheap. */
  fast: createRetryableModel({
    model: openrouter('anthropic/claude-haiku-4.5'),
    retries: [openrouter('google/gemini-3.8-flash')],
  }),
  /** Drafts: the text a person reads or sends. */
  writer: createRetryableModel({
    model: openrouter('anthropic/claude-sonnet-5.5'),
    retries: [openrouter('x-ai/grok-4.7')],
  }),
}

export const INFORMAL_ADDRESS =
  'Address the user informally where the language distinguishes (Ukrainian ти, German du, French tu, Spanish tú).'

export const NO_EM_DASH =
  'Never use em dashes (—): a comma, colon, period or parentheses instead.'

export const FAST_MODEL_ID = 'anthropic/claude-haiku-4.5'
