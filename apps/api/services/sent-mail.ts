import { db } from '@fewmail/db'
import { commitments, messages } from '@fewmail/db/schema'
import { englishName } from '@fewmail/shared/i18n/locales'
import { noul } from '@typesafe-ai/sdk'
import { generateText, Output } from 'ai'
import { type } from 'arktype'
import { addDays } from 'date-fns'
import { eq } from 'drizzle-orm'

import { models, trackUsage } from '../lib/ai'
import { localClock } from '../lib/clock'
import { jev } from '../lib/jev'
import { hasBudget } from './plan'
import { watchForReply } from './reminders'
import { getSettings } from './settings'

const AUTO_FOLLOWUP_DAYS = 3
const SIGNAL = 0.7
/** A promise without a date is still due soon; nobody writes "I'll send it" meaning next quarter. */
const DEFAULT_PROMISE_DAYS = 2
export const SENT_JEV_CHARS = 4000
export const PROMISE_BODY_CHARS = 6000

const promisesSchema = type({
  promises: type({
    due: 'string | null',
    promise: 'string',
    recipient: 'string | null',
  }).array(),
})

/** `dueAt` holds the calendar date at UTC midnight; `processDueCommitments` reads it in the user's timezone. */
const extractPromises = async (
  userId: string,
  sent: { text: string; to: string[] }
) => {
  const settings = await getSettings(userId)
  const today = localClock(settings?.timezone ?? 'UTC').date
  const { output } = await generateText({
    instructions: [
      'List every concrete promise the writer of this email makes to do something themselves (send, sign, call, review, pay…).',
      `promise: a short reminder phrased to the writer in ${englishName(settings?.language ?? 'en')}, e.g. "Send Anna the signed contract".`,
      `due: the deadline as an ISO date if the email gives or implies one (today is ${today}), else null. recipient: the address from To it was promised to, or null.`,
      'Ignore requests to others, pleasantries and conditional offers.',
    ].join('\n'),
    model: models.fast,
    output: Output.object({ schema: promisesSchema }),
    prompt: `To: ${sent.to.join(', ')}\n\n${sent.text.slice(0, PROMISE_BODY_CHARS)}`,
    telemetry: trackUsage(userId, 'promises'),
  })
  return output.promises.map(({ due, promise, recipient }) => ({
    dueAt:
      due && !Number.isNaN(Date.parse(due))
        ? new Date(due.slice(0, 10))
        : addDays(new Date(today), DEFAULT_PROMISE_DAYS),
    promise,
    recipient:
      sent.to.find((address) => address === recipient?.trim().toLowerCase()) ??
      (sent.to.length === 1 ? sent.to[0] : null),
  }))
}

/**
 * One Jev call decides whether sent mail waits for an answer (follow-up, every plan) and whether
 * the user promised something (commitment, agent only); only promises go on to the LLM for wording.
 */
export const watchSentMail = async (
  userId: string,
  sent: { messageId: string; text: string; threadId: string }
) => {
  const { answers } = await jev.systemOne({
    questions: {
      expectsReply: noul(
        'This email asks the recipient a question, requests something or proposes something they must answer'
      ),
      promises: noul(
        'The writer promises to do something themselves later, like sending, signing, calling or paying'
      ),
    },
    state: sent.text.slice(0, SENT_JEV_CHARS),
  })
  if (answers.expectsReply.noul >= SIGNAL) {
    await watchForReply(userId, sent.threadId, AUTO_FOLLOWUP_DAYS)
  }
  if (answers.promises.noul < SIGNAL || !(await hasBudget(userId))) {
    return
  }
  const [message] = await db
    .select({ to: messages.to })
    .from(messages)
    .where(eq(messages.id, sent.messageId))
  const promises = await extractPromises(userId, {
    text: sent.text,
    to: message?.to ?? [],
  })
  if (promises.length === 0) {
    return
  }
  await db.insert(commitments).values(
    promises.map((promise) => ({
      ...promise,
      messageId: sent.messageId,
      status: 'open' as const,
      threadId: sent.threadId,
      userId,
    }))
  )
}
