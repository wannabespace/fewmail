import { db } from '@fewmail/db'
import { actions, analyses, messages } from '@fewmail/db/schema'
import { generateText, Output } from 'ai'
import { type } from 'arktype'
import { subDays } from 'date-fns'
import { and, desc, eq, gte } from 'drizzle-orm'

import { models } from '../lib/ai'
import { askMail } from './ask'
import { draftReply, redraftAction } from './mail'

const RECENT_DAYS = 7
const CANDIDATES = 15

const understandingSchema = type({
  index: 'number',
  intent: "'reply' | 'question' | 'other'",
})

/** "Tell Anna I'll sign tomorrow" names an email among open drafts and recent mail; "when does Netflix renew?" asks about the mail. */
const understand = async (userId: string, text: string) => {
  const [openDrafts, recent] = await Promise.all([
    db
      .select({
        actionId: actions.id,
        from: messages.fromName,
        fromEmail: messages.fromEmail,
        subject: messages.subject,
      })
      .from(actions)
      .innerJoin(messages, eq(messages.id, actions.messageId))
      .where(
        and(
          eq(actions.userId, userId),
          eq(actions.status, 'pending'),
          eq(actions.kind, 'reply')
        )
      )
      .limit(CANDIDATES),
    db
      .select({
        from: messages.fromName,
        fromEmail: messages.fromEmail,
        messageId: messages.id,
        subject: messages.subject,
        summary: analyses.summary,
      })
      .from(messages)
      .leftJoin(analyses, eq(analyses.messageId, messages.id))
      .where(
        and(
          eq(messages.userId, userId),
          eq(messages.isFromMe, false),
          gte(messages.receivedAt, subDays(new Date(), RECENT_DAYS))
        )
      )
      .orderBy(desc(messages.receivedAt))
      .limit(CANDIDATES),
  ])
  const candidates = [
    ...openDrafts.map((draft) => ({ ...draft, messageId: null })),
    ...recent.map((mail) => ({ ...mail, actionId: null })),
  ]
  const { output } = await generateText({
    instructions: [
      'The user writes to their email assistant in a chat.',
      'intent: "reply" when they say what to answer to one email, "question" when they ask something about their mail, "other" for anything else (greetings, what the assistant can do).',
      'index: for "reply", the email it is about, or -1 when none clearly fits; -1 otherwise.',
    ].join('\n'),
    model: models.fast,
    output: Output.object({ schema: understandingSchema }),
    prompt: [
      `Message: ${text}`,
      ...candidates.map(
        (candidate, index) =>
          `${index}. ${candidate.from ?? candidate.fromEmail} — ${candidate.subject}${'summary' in candidate && candidate.summary ? ` — ${candidate.summary}` : ''}`
      ),
    ].join('\n'),
  })
  return {
    intent: output.intent,
    target: output.intent === 'reply' ? candidates[output.index] : undefined,
  }
}

/** A typed or spoken chat message: a reply draft, an answer about the mail, or `help` when it is neither. */
export const followMessage = async (
  userId: string,
  text: string,
  actionId?: string | null
) => {
  if (actionId) {
    return { draft: await redraftAction(userId, actionId, text) }
  }
  const { intent, target } = await understand(userId, text)
  if (intent === 'question') {
    return { answer: await askMail(userId, text) }
  }
  if (!target) {
    return { help: true as const }
  }
  return {
    draft: target.actionId
      ? await redraftAction(userId, target.actionId, text)
      : await draftReply(userId, target.messageId ?? '', text),
  }
}
