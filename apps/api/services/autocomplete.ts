import { db } from '@fewmail/db'
import { messages, users } from '@fewmail/db/schema'
import { Mistral } from '@mistralai/mistralai'
import { generateText } from 'ai'
import { and, eq } from 'drizzle-orm'

import { env } from '../env'
import { models } from '../lib/ai'
import { getSettings } from './settings'

const FIM_MODEL = 'codestral-latest'
const MAX_TOKENS = 32
const CONTEXT_LIMIT = 1500

const mistral = env.MISTRAL_API_KEY
  ? new Mistral({ apiKey: env.MISTRAL_API_KEY })
  : null

const preamble = async (userId: string, replyToMessageId?: string) => {
  const [user] = await db
    .select({ name: users.name })
    .from(users)
    .where(eq(users.id, userId))
  const settings = await getSettings(userId)
  const [original] = replyToMessageId
    ? await db
        .select()
        .from(messages)
        .where(
          and(eq(messages.id, replyToMessageId), eq(messages.userId, userId))
        )
    : []
  return [
    `Email written by ${user?.name ?? 'the user'}.`,
    settings?.voice ? `Their style: ${settings.voice}` : null,
    settings?.knowledge
      ? `Facts they use: ${settings.knowledge.slice(0, CONTEXT_LIMIT)}`
      : null,
    original
      ? `Replying to ${original.fromName ?? original.fromEmail}, subject "${original.subject}":\n${original.body.slice(0, CONTEXT_LIMIT)}`
      : null,
    '---',
  ]
    .filter(Boolean)
    .join('\n')
}

const fim = async (prompt: string, suffix: string, signal?: AbortSignal) => {
  if (!mistral) {
    return null
  }
  const { choices } = await mistral.fim.complete(
    {
      maxTokens: MAX_TOKENS,
      model: FIM_MODEL,
      prompt,
      stop: ['\n\n'],
      suffix,
      temperature: 0.2,
    },
    { signal }
  )
  const content = choices[0]?.message?.content
  return typeof content === 'string' ? content : ''
}

const chat = async (prompt: string, suffix: string, signal?: AbortSignal) => {
  const { text } = await generateText({
    abortSignal: signal,
    instructions:
      'You are an inline autocomplete inside an email editor. Continue the text at <CARET> with the next few words the author would most likely write, in their language and tone. Return only the continuation, never repeat text, never more than one sentence. Return an empty string when the thought is complete.',
    maxOutputTokens: MAX_TOKENS,
    model: models.fast,
    prompt: `${prompt}<CARET>${suffix}`,
  })
  return text
}

/** Codestral FIM is the fastest fill-in-the-middle; the chat model covers a missing key or a FIM error. */
export const completeEmail = async (input: {
  prefix: string
  replyToMessageId?: string
  signal?: AbortSignal
  suffix: string
  userId: string
}) => {
  const prompt = `${await preamble(input.userId, input.replyToMessageId)}\n${input.prefix}`
  try {
    const completion = await fim(prompt, input.suffix, input.signal)
    if (completion !== null) {
      return completion
    }
  } catch (error) {
    if (input.signal?.aborted) {
      throw error
    }
  }
  return chat(prompt, input.suffix, input.signal)
}
