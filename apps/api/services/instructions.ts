import { randomUUID } from 'node:crypto'

import { db } from '@fewmail/db'
import { actions, analyses, messages } from '@fewmail/db/schema'
import { parseSkill } from '@fewmail/shared/agent'
import { generateText, Output } from 'ai'
import { type } from 'arktype'
import { subDays } from 'date-fns'
import { and, desc, eq, gte } from 'drizzle-orm'

import { models, trackUsage } from '../lib/ai'
import type { Exchange } from './ask'
import { askMail, earlierLines } from './ask'
import { askAgent } from './chat'
import { draftReply, redraftAction } from './mail'
import { requireAgent, spendMessage } from './plan'

const RECENT_DAYS = 7
const CANDIDATES = 15

const understandingSchema = type({
  index: 'number',
  intent: "'reply' | 'question' | 'request' | 'other'",
})

/** "Tell Anna I'll sign tomorrow" names an email among open drafts and recent mail; "when does Netflix renew?" asks about the mail; "make a board for trips" is work for the agent. */
const understand = async (
  userId: string,
  text: string,
  earlier: Exchange | null = null
) => {
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
      'intent: "reply" when they say what to answer to one email, "question" when they ask something about their mail, "request" when they ask the assistant to do or change anything else (create or change a board, a rule, a schedule or an event; archive, unsubscribe, hand over a thread), "other" for anything else (greetings, what the assistant can do).',
      'index: for "reply", the email it is about, or -1 when none clearly fits; -1 otherwise.',
    ].join('\n'),
    model: models.fast,
    output: Output.object({ schema: understandingSchema }),
    prompt: [
      ...earlierLines(earlier),
      `Message: ${text}`,
      ...candidates.map(
        (candidate, index) =>
          `${index}. ${candidate.from ?? candidate.fromEmail}: ${candidate.subject}${'summary' in candidate && candidate.summary ? `. ${candidate.summary}` : ''}`
      ),
    ].join('\n'),
    telemetry: trackUsage(userId, 'understand'),
  })
  return {
    intent: output.intent,
    target: output.intent === 'reply' ? candidates[output.index] : undefined,
  }
}

const inNewChat = async (userId: string, text: string) => {
  const chatId = randomUUID()
  return { chatId, text: await askAgent(userId, { id: chatId, text }) }
}

/** ⌘K: a question is answered from the mail; anything else goes to the agent in a new chat, where its approvals wait. */
export const askFewmail = async (userId: string, text: string) => {
  const { intent } = await understand(userId, text)
  if (intent !== 'question') {
    const { chatId, text: answer } = await inNewChat(userId, text)
    return { answer, chatId, query: null, sources: [] }
  }
  await spendMessage(userId)
  return { ...(await askMail(userId, text)), chatId: null }
}

/** A typed or spoken chat message: a skill or a request run in its own agent chat, a reply draft, an answer about the mail, or `help` when it is none of them. */
export const followMessage = async (
  userId: string,
  text: string,
  actionId?: string | null,
  earlier: Exchange | null = null
) => {
  if (parseSkill(text)) {
    return { skill: await inNewChat(userId, text) }
  }
  if (actionId) {
    await spendMessage(userId)
    return { draft: await redraftAction(userId, actionId, text) }
  }
  await requireAgent(userId)
  const { intent, target } = await understand(userId, text, earlier)
  // The agent's chat spends the message itself; spending here too would count it twice.
  if (intent === 'request') {
    return { skill: await inNewChat(userId, text) }
  }
  await spendMessage(userId)
  if (intent === 'question') {
    return { answer: await askMail(userId, text, true, earlier) }
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
