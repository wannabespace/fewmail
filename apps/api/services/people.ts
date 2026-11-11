import { db } from '@fewmail/db'
import {
  actions,
  analyses,
  commitments,
  messages,
  people,
} from '@fewmail/db/schema'
import { englishName } from '@fewmail/shared/i18n/locales'
import { generateText } from 'ai'
import { subDays } from 'date-fns'
import { and, arrayContains, desc, eq, inArray, or, sql } from 'drizzle-orm'

import { models } from '../lib/ai'
import { getPlanInfo, hasAgent } from './plan'
import { getSettings } from './settings'

const NOTE_MAX_AGE_DAYS = 7
const NOTE_MIN_MESSAGES = 3
const RECENT_SUMMARIES = 12

const withPerson = (userId: string, email: string) =>
  and(
    eq(messages.userId, userId),
    or(
      eq(messages.fromEmail, email),
      arrayContains(messages.to, [email]),
      arrayContains(messages.cc, [email])
    )
  )

const writeNote = async (
  userId: string,
  email: string,
  summaries: string[]
) => {
  const settings = await getSettings(userId)
  const { text } = await generateText({
    instructions: `In ${englishName(settings?.language ?? 'en')}, write 2–3 short sentences for the user about this person: who they are to the user, what they usually write about, and anything still open. Plain prose, no lists, nothing invented.`,
    model: models.writer,
    prompt: `Person: ${email}\nRecent emails, newest first:\n${summaries.join('\n')}`,
  })
  const note = text.trim()
  await db
    .insert(people)
    .values({ email, note, noteUpdatedAt: new Date(), userId })
    .onConflictDoUpdate({
      set: { note, noteUpdatedAt: new Date() },
      target: [people.userId, people.email],
    })
  return note
}

const resolveNote = async (
  userId: string,
  email: string,
  total: number,
  stored: typeof people.$inferSelect | undefined,
  recent: { receivedAt: Date; subject: string; summary: string | null }[]
) => {
  const isStale =
    !stored?.noteUpdatedAt ||
    stored.noteUpdatedAt < subDays(new Date(), NOTE_MAX_AGE_DAYS)
  return total >= NOTE_MIN_MESSAGES &&
    isStale &&
    hasAgent(await getPlanInfo(userId))
    ? await writeNote(
        userId,
        email,
        recent.map(
          ({ receivedAt, subject, summary }) =>
            `${receivedAt.toISOString().slice(0, 10)} · ${summary ?? subject}`
        )
      ).catch(() => stored?.note ?? null)
    : (stored?.note ?? null)
}

/** Everything the user's mail knows about one person; the note is Pro and refreshed at most weekly. */
export const getPerson = async (userId: string, rawEmail: string) => {
  const email = rawEmail.trim().toLowerCase()
  const [stats] = await db
    .select({
      first: sql<Date>`min(${messages.receivedAt})`,
      fromThem: sql<number>`count(*) filter (where ${eq(messages.fromEmail, email)})::int`,
      last: sql<Date>`max(${messages.receivedAt})`,
      name: sql<
        string | null
      >`max(${messages.fromName}) filter (where ${eq(messages.fromEmail, email)})`.mapWith(
        messages.fromName
      ),
      toThem: sql<number>`count(*) filter (where ${messages.isFromMe})::int`,
    })
    .from(messages)
    .where(withPerson(userId, email))

  const threadRows = await db
    .selectDistinct({ threadId: messages.threadId })
    .from(messages)
    .where(withPerson(userId, email))
  const threadIds = threadRows.map(({ threadId }) => threadId)

  const [open, promised, recent, [stored]] = await Promise.all([
    threadIds.length
      ? db
          .select({ id: actions.id, kind: actions.kind, title: actions.title })
          .from(actions)
          .where(
            and(
              eq(actions.userId, userId),
              eq(actions.status, 'pending'),
              inArray(actions.threadId, threadIds)
            )
          )
      : [],
    db
      .select({
        dueAt: commitments.dueAt,
        id: commitments.id,
        promise: commitments.promise,
      })
      .from(commitments)
      .where(
        and(
          eq(commitments.userId, userId),
          eq(commitments.recipient, email),
          inArray(commitments.status, ['open', 'reminded'])
        )
      ),
    db
      .select({
        receivedAt: messages.receivedAt,
        subject: messages.subject,
        summary: analyses.summary,
      })
      .from(messages)
      .leftJoin(analyses, eq(analyses.messageId, messages.id))
      .where(withPerson(userId, email))
      .orderBy(desc(messages.receivedAt))
      .limit(RECENT_SUMMARIES),
    db
      .select()
      .from(people)
      .where(and(eq(people.userId, userId), eq(people.email, email))),
  ])

  const total = (stats?.fromThem ?? 0) + (stats?.toThem ?? 0)
  const note = await resolveNote(userId, email, total, stored, recent)

  return {
    email,
    firstContact: stats?.first ?? null,
    fromThem: stats?.fromThem ?? 0,
    lastContact: stats?.last ?? null,
    name: stats?.name ?? null,
    note,
    open,
    promised,
    threads: threadIds.length,
    toThem: stats?.toThem ?? 0,
  }
}
