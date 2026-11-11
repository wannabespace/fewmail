import { db } from '@fewmail/db'
import { commitments } from '@fewmail/db/schema'
import { englishName } from '@fewmail/shared/i18n/locales'
import { noul } from '@typesafe-ai/sdk'
import { generateText, Output } from 'ai'
import { type } from 'arktype'
import { addDays } from 'date-fns'

import { models } from '../lib/ai'
import { jev } from '../lib/jev'
import { getPlanInfo, hasAgent } from './plan'
import { scheduleFollowup } from './reminders'
import { getSettings } from './settings'

const AUTO_FOLLOWUP_DAYS = 3
const SIGNAL = 0.7
/** A promise without a date is still due soon; nobody writes "I'll send it" meaning next quarter. */
const DEFAULT_PROMISE_DAYS = 2

const promisesSchema = type({
  promises: type({
    due: 'string | null',
    promise: 'string',
    recipient: 'string | null',
  }).array(),
})

const extractPromises = async (userId: string, text: string) => {
  const settings = await getSettings(userId)
  const { output } = await generateText({
    instructions: [
      'List every concrete promise the writer of this email makes to do something themselves (send, sign, call, review, pay…).',
      `promise: a short reminder phrased to the writer in ${englishName(settings?.language ?? 'en')}, e.g. "Send Anna the signed contract".`,
      `due: the deadline as an ISO date if the email gives or implies one (today is ${new Date().toISOString().slice(0, 10)}), else null. recipient: who it was promised to, or null.`,
      'Ignore requests to others, pleasantries and conditional offers.',
    ].join('\n'),
    model: models.fast,
    output: Output.object({ schema: promisesSchema }),
    prompt: text.slice(0, 6000),
  })
  return output.promises
}

/**
 * One Jev call decides whether sent mail waits for an answer (follow-up, every plan) and whether
 * the user promised something (commitment, agent only); only promises go on to the LLM for wording.
 */
export const watchSentMail = async (
  userId: string,
  sent: { messageId?: string | null; text: string; threadId: string }
) => {
  if (!jev) {
    return
  }
  const { answers } = await jev.systemOne({
    questions: {
      expectsReply: noul(
        'This email asks the recipient a question, requests something or proposes something they must answer'
      ),
      promises: noul(
        'The writer promises to do something themselves later, like sending, signing, calling or paying'
      ),
    },
    state: sent.text.slice(0, 4000),
  })
  if (answers.expectsReply.noul >= SIGNAL) {
    await scheduleFollowup(userId, sent.threadId, AUTO_FOLLOWUP_DAYS)
  }
  if (answers.promises.noul < SIGNAL || !hasAgent(await getPlanInfo(userId))) {
    return
  }
  const promises = await extractPromises(userId, sent.text)
  if (promises.length === 0) {
    return
  }
  await db.insert(commitments).values(
    promises.map(({ due, promise, recipient }) => ({
      dueAt:
        due && !Number.isNaN(Date.parse(due))
          ? new Date(due)
          : addDays(new Date(), DEFAULT_PROMISE_DAYS),
      messageId: sent.messageId ?? null,
      promise,
      recipient,
      status: 'open' as const,
      threadId: sent.threadId,
      userId,
    }))
  )
}
