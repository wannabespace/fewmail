import { db } from '@fewmail/db'
import { actions, analyses, messages } from '@fewmail/db/schema'
import { generateText, Output } from 'ai'
import { type } from 'arktype'
import { subDays } from 'date-fns'
import { and, desc, eq, gte } from 'drizzle-orm'

import { models } from '../lib/ai'
import { draftReply, redraftAction } from './mail'

const RECENT_DAYS = 7
const CANDIDATES = 15

const targetSchema = type({ index: 'number' })

/** "Tell Anna I'll sign tomorrow": find which email the user means among open drafts and recent mail. */
const resolveTarget = async (userId: string, instruction: string) => {
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
  if (candidates.length === 0) {
    return null
  }
  const { output } = await generateText({
    instructions:
      'The user gives an instruction about replying to one email. Return the index of the email it is about, or -1 when none clearly fits.',
    model: models.fast,
    output: Output.object({ schema: targetSchema }),
    prompt: [
      `Instruction: ${instruction}`,
      ...candidates.map(
        (candidate, index) =>
          `${index}. ${candidate.from ?? candidate.fromEmail} — ${candidate.subject}${'summary' in candidate && candidate.summary ? ` — ${candidate.summary}` : ''}`
      ),
    ].join('\n'),
  })
  return candidates[output.index] ?? null
}

/** Turns a spoken or typed instruction into a reply draft; returns null when it is unclear which email is meant. */
export const draftFromInstruction = async (
  userId: string,
  instruction: string,
  actionId?: string | null
) => {
  if (actionId) {
    return redraftAction(userId, actionId, instruction)
  }
  const target = await resolveTarget(userId, instruction)
  if (!target) {
    return null
  }
  return target.actionId
    ? redraftAction(userId, target.actionId, instruction)
    : draftReply(userId, target.messageId ?? '', instruction)
}
