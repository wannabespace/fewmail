import type { choice, noul, score } from '@typesafe-ai/sdk'

import { env } from '../env'

export const JEV_MODEL_ID = 'jev-latest'

const ENDPOINT = 'https://api.typesafe.ai/v1/systemone'

type ChoiceQuestion = ReturnType<typeof choice>
type Question =
  | ChoiceQuestion
  | ReturnType<typeof noul>
  | ReturnType<typeof score>

type Answer<Q> = Q extends { criteria: infer Criteria; type: 'choice' }
  ? { choice: Extract<keyof Criteria, string>; confidence: number }
  : Q extends { type: 'noul' }
    ? { noul: number }
    : { confidence: number; score: number }

/**
 * The SDK's question builders keep answers typed; the call itself is plain fetch because
 * @typesafe-ai/sdk 0.7's client reads the response body twice under Bun ("Body already used").
 */
const systemOne = async <Questions extends Record<string, Question>>(input: {
  questions: Questions
  state: string
}) => {
  const response = await fetch(ENDPOINT, {
    body: JSON.stringify({ model: JEV_MODEL_ID, ...input }),
    headers: {
      authorization: `Bearer ${env.TYPESAFE_API_KEY}`,
      'content-type': 'application/json',
    },
    method: 'POST',
  })
  if (!response.ok) {
    throw new Error(`Jev ${response.status}`)
  }
  return (await response.json()) as {
    answers: { [Key in keyof Questions]: Answer<Questions[Key]> }
  }
}

/** Typed yes/no, choice and score decisions in ~100 ms for a fraction of an LLM call; null when no key is set. */
export const jev = env.TYPESAFE_API_KEY ? { systemOne } : null
