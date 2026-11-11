import { db } from '@fewmail/db'
import { messages } from '@fewmail/db/schema'
import { englishName } from '@fewmail/shared/i18n/locales'
import { generateText, Output } from 'ai'
import { type } from 'arktype'
import { and, eq, inArray } from 'drizzle-orm'

import { models } from '../lib/ai'
import { getMessage } from '../lib/gmail'
import { searchMailboxes } from './mailboxes'
import { getSettings } from './settings'

const SOURCE_LIMIT = 12
const BODY_LIMIT = 1500

const querySchema = type({ gmailQuery: 'string' })
const answerSchema = type({ answer: 'string', sources: 'number[]' })

const GMAIL_OPERATOR = /(?:^|\s)-?[a-z_]+:\S/iu

/** Plain language goes through the fast model; text already in Gmail syntax is used as typed. */
export const toGmailQuery = async (text: string) => {
  if (GMAIL_OPERATOR.test(text)) {
    return text
  }
  const { output } = await generateText({
    instructions: [
      "Turn the question about the user's mailbox into one Gmail search query (from:, to:, subject:, has:attachment, newer_than:, older_than:, quoted phrases, OR).",
      `Prefer few precise terms; add a time filter only when the question implies one. Today is ${new Date()
        .toISOString()
        .slice(0, 10)}.`,
    ].join('\n'),
    model: models.fast,
    output: Output.object({ schema: querySchema }),
    prompt: text,
  })
  return output.gmailQuery || text
}

/** Ask AI: the question becomes a Gmail search, the writer answers from what it finds, citing [n]. */
export const askMail = async (userId: string, question: string) => {
  const settings = await getSettings(userId)
  const gmailQuery = await toGmailQuery(question)

  const results = await searchMailboxes(userId, gmailQuery, SOURCE_LIMIT)
  const ids = results.flatMap((result) => result.ids)
  const stored = ids.length
    ? await db
        .select()
        .from(messages)
        .where(and(eq(messages.userId, userId), inArray(messages.gmailId, ids)))
    : []
  const storedIds = new Set(stored.map(({ gmailId }) => gmailId))
  const fetched = await Promise.all(
    results.flatMap(({ ids: found, mailbox }) =>
      found
        .filter((id) => !storedIds.has(id))
        .map((id) => getMessage(mailbox, id))
    )
  )
  const found = [...stored, ...fetched]
    .toSorted(
      (left, right) => right.receivedAt.getTime() - left.receivedAt.getTime()
    )
    .slice(0, SOURCE_LIMIT)

  const { output } = await generateText({
    instructions: [
      `Answer the user's question about their email in ${englishName(settings?.language ?? 'en')}, briefly and concretely.`,
      'Use only the emails below. Cite them inline as [n]. If they do not answer the question, say so plainly.',
      'sources: the numbers you cited, in order.',
    ].join('\n'),
    model: models.writer,
    output: Output.object({ schema: answerSchema }),
    prompt: [
      `Question: ${question}`,
      ...found.map(
        (mail, index) =>
          `[${index + 1}] ${mail.receivedAt.toISOString()} · ${mail.fromName ?? mail.fromEmail} → ${mail.to.join(', ')}\nSubject: ${mail.subject}\n${mail.body.slice(0, BODY_LIMIT)}`
      ),
    ].join('\n\n'),
  })

  return {
    answer: output.answer,
    query: gmailQuery,
    sources: output.sources.flatMap((number) => {
      const mail = found[number - 1]
      return mail
        ? [
            {
              from: mail.fromName ?? mail.fromEmail,
              number,
              receivedAt: mail.receivedAt,
              subject: mail.subject,
              threadId: mail.threadId,
            },
          ]
        : []
    }),
  }
}
