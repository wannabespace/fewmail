import { db } from '@fewmail/db'
import { messages } from '@fewmail/db/schema'
import { englishName } from '@fewmail/shared/i18n/locales'
import { generateText, Output } from 'ai'
import { type } from 'arktype'
import { and, eq, inArray } from 'drizzle-orm'

import { INFORMAL_ADDRESS, models, NO_EM_DASH, trackUsage } from '../lib/ai'
import { getMessage } from '../lib/gmail'
import { searchMailboxes } from './mailboxes'
import { hasBudget } from './plan'
import { getSettings } from './settings'

export const SOURCE_LIMIT = 12
export const BODY_LIMIT = 1500

export interface Exchange {
  answer: string
  question: string
}

export const earlierLines = (earlier: Exchange | null) =>
  earlier
    ? [
        `Earlier in this chat the user asked: ${earlier.question}`,
        `You answered: ${earlier.answer}`,
      ]
    : []

const querySchema = type({ gmailQueries: 'string[]' })
const answerSchema = type({ answer: 'string', sources: 'number[]' })

export const GMAIL_OPERATOR = /(?:^|\s)-?[a-z_]+:\S/iu
const ONE_WORD = /^\S+$/u

/** Plain language goes through the fast model (agent only) as a few queries, strictest first; one word or text already in Gmail syntax is used as typed. */
export const toGmailQueries = async (
  userId: string,
  text: string,
  earlier: Exchange | null = null
) => {
  if (
    (!earlier && ONE_WORD.test(text.trim())) ||
    GMAIL_OPERATOR.test(text) ||
    !(await hasBudget(userId))
  ) {
    return [text]
  }
  const { output } = await generateText({
    instructions: [
      "Turn the question about the user's mailbox into up to three Gmail search queries (from:, to:, subject:, has:attachment, newer_than:, older_than:, quoted phrases, OR), strictest first. The last one is only the sender (from:name) when there is one, else the main noun in English OR the question's language, so it still finds the mail when the others guessed wrong.",
      'Search in the language the emails are likely written in, not the language of the question: services and companies mostly write in English, so add English terms (receipt OR invoice OR payment for money) next to any in the question’s language.',
      'Name the company that sends the mail, not only the product (Claude is billed by Anthropic), but never guess a company the user did not name or imply (no airline for a flight). from: takes one word of its name (from:anthropic), never a guessed domain; subject: only for words the user quoted.',
      `Prefer few precise terms. Add a time filter only when the question names a past period, written as after:YYYY/MM/DD or newer_than:7d / 2m / 1y, nothing else. Today is ${new Date()
        .toISOString()
        .slice(0, 10)}.`,
      'A follow-up ("when did it arrive?") is about what the earlier exchange was about: search for that.',
    ].join('\n'),
    model: models.fast,
    output: Output.object({ schema: querySchema }),
    prompt: [...earlierLines(earlier), `Question: ${text}`].join('\n'),
    telemetry: trackUsage(userId, 'ask_query'),
  })
  const queries = output.gmailQueries.filter(Boolean)
  return queries.length > 0 ? queries : [text]
}

/** The first query that finds anything, so a guess that was too strict falls back to a broader one. */
export const searchByQuestion = async (
  userId: string,
  text: string,
  limit: number,
  mailboxId?: string,
  earlier: Exchange | null = null
) => {
  const queries = await toGmailQueries(userId, text, earlier)
  for (const query of queries) {
    // oxlint-disable-next-line eslint/no-await-in-loop -- the next query runs only when this one found nothing
    const results = await searchMailboxes(userId, query, limit, mailboxId)
    if (results.some(({ ids }) => ids.length > 0)) {
      return { query, results }
    }
  }
  return { query: queries.at(-1) ?? text, results: [] }
}

const TEXTED = [
  'Write it like a friend texting back: the answer itself in one to three short sentences, no [n] markers, no account numbers or ids, no retelling of email subjects.',
  'sources: the emails the user asked to see (to find, show or list them), else none; they arrive as links under your answer, so do not describe them.',
]

/** Ask AI in Telegram and WhatsApp: the question becomes a Gmail search, the writer answers from what it finds. */
export const askMail = async (
  userId: string,
  question: string,
  earlier: Exchange | null = null
) => {
  const settings = await getSettings(userId)
  const { query: gmailQuery, results } = await searchByQuestion(
    userId,
    question,
    SOURCE_LIMIT,
    undefined,
    earlier
  )
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
      'Use only the emails below. Lead with the answer. When they do not state it outright but point to it (a billing period, past charge dates, a renewal notice), give your best estimate and say it is one; only when they say nothing about it, say so plainly.',
      ...TEXTED,
      INFORMAL_ADDRESS,
      NO_EM_DASH,
    ].join('\n'),
    model: models.writer,
    output: Output.object({ schema: answerSchema }),
    prompt: [
      ...earlierLines(earlier),
      `Question: ${question}`,
      ...found.map(
        (mail, index) =>
          `[${index + 1}] ${mail.receivedAt.toISOString()} · ${mail.fromName ?? mail.fromEmail} → ${mail.to.join(', ')}\nSubject: ${mail.subject}\n${mail.body.slice(0, BODY_LIMIT)}`
      ),
    ].join('\n\n'),
    telemetry: trackUsage(userId, 'ask_answer'),
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
