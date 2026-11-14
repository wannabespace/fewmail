import { db } from '@fewmail/db'
import {
  actions,
  analyses,
  commitments,
  messages,
  people,
} from '@fewmail/db/schema'
import { isAutomatedSender, PEOPLE_CATEGORIES } from '@fewmail/shared/agent'
import { matchesContact } from '@fewmail/shared/email'
import { englishName } from '@fewmail/shared/i18n/locales'
import { generateText } from 'ai'
import { subDays } from 'date-fns'
import {
  and,
  arrayContains,
  desc,
  eq,
  inArray,
  isNull,
  not,
  or,
  sql,
} from 'drizzle-orm'

import { models, NO_EM_DASH, trackUsage } from '../lib/ai'
import { announceChange } from '../lib/live'
import { logErrorAs } from '../lib/log'
import { listMailboxes } from './mailboxes'
import { hasBudget } from './plan'
import { getSettings } from './settings'

const NOTE_MAX_AGE_DAYS = 7
const NOTE_MIN_MESSAGES = 3
const RECENT_SUMMARIES = 12
const CONVERSATIONS_SHOWN = 20
const CONTACTS_KEPT = 1000
const FOUND_SHOWN = 10
const SENT_WEIGHT = 3

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
    instructions: `In ${englishName(settings?.language ?? 'en')}, write 2–3 short sentences for the user about this person: who they are to the user, what they usually write about, and anything still open. Plain prose, no lists, nothing invented. ${NO_EM_DASH}`,
    model: models.writer,
    prompt: `Person: ${email}\nRecent emails, newest first:\n${summaries.join('\n')}`,
    telemetry: trackUsage(userId, 'person_note'),
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

const refreshing = new Set<string>()

const refreshNote = async (
  userId: string,
  email: string,
  recent: { receivedAt: Date; subject: string; summary: string | null }[]
) => {
  if (!(await hasBudget(userId))) {
    return
  }
  await writeNote(
    userId,
    email,
    recent.map(
      ({ receivedAt, subject, summary }) =>
        `${receivedAt.toISOString().slice(0, 10)} · ${summary ?? subject}`
    )
  )
  await announceChange(userId, ['person'])
}

const refreshStaleNote = (
  userId: string,
  email: string,
  stored: typeof people.$inferSelect | undefined,
  recent: Parameters<typeof refreshNote>[2]
) => {
  const key = `${userId} ${email}`
  const isFresh =
    stored?.noteUpdatedAt &&
    stored.noteUpdatedAt >= subDays(new Date(), NOTE_MAX_AGE_DAYS)
  if (isFresh || refreshing.has(key)) {
    return
  }
  refreshing.add(key)
  void refreshNote(userId, email, recent)
    .catch(logErrorAs('person note failed'))
    .finally(() => refreshing.delete(key))
}

const personStats = async (userId: string, email: string) => {
  const [stats] = await db
    .select({
      first: sql<Date>`min(${messages.receivedAt})`,
      fromThem: sql<number>`count(*) filter (where ${eq(messages.fromEmail, email)})::int`,
      humanFromThem: sql<number>`count(*) filter (where ${and(eq(messages.fromEmail, email), inArray(analyses.category, [...PEOPLE_CATEGORIES]))})::int`,
      last: sql<Date>`max(${messages.receivedAt})`,
      name: sql<
        string | null
      >`max(${messages.fromName}) filter (where ${eq(messages.fromEmail, email)})`.mapWith(
        messages.fromName
      ),
      threads: sql<number>`count(distinct ${messages.threadId})::int`,
      toThem: sql<number>`count(*) filter (where ${messages.isFromMe})::int`,
    })
    .from(messages)
    .leftJoin(analyses, eq(analyses.messageId, messages.id))
    .where(withPerson(userId, email))
  return {
    firstContact: stats?.first ?? null,
    fromThem: stats?.fromThem ?? 0,
    isPerson: (stats?.toThem ?? 0) > 0 || (stats?.humanFromThem ?? 0) > 0,
    lastContact: stats?.last ?? null,
    name: stats?.name ?? null,
    threads: stats?.threads ?? 0,
    toThem: stats?.toThem ?? 0,
  }
}

/** The newest message of each of the person's threads, newest thread first. */
const latestConversations = (userId: string, email: string) =>
  db
    .select({
      receivedAt: messages.receivedAt,
      subject: messages.subject,
      threadId: messages.threadId,
    })
    .from(messages)
    .where(
      inArray(
        messages.id,
        db
          .selectDistinctOn([messages.threadId], { id: messages.id })
          .from(messages)
          .where(withPerson(userId, email))
          .orderBy(messages.threadId, desc(messages.receivedAt))
      )
    )
    .orderBy(desc(messages.receivedAt))
    .limit(CONVERSATIONS_SHOWN)

/** Everything the user's mail knows about one person; the note is Pro, refreshed at most weekly in the background. */
export const getPerson = async (userId: string, rawEmail: string) => {
  const email = rawEmail.trim().toLowerCase()
  const [stats, conversations, open, promised, recent, [stored]] =
    await Promise.all([
      personStats(userId, email),
      latestConversations(userId, email),
      db
        .select({
          id: actions.id,
          kind: actions.kind,
          threadId: actions.threadId,
          title: actions.title,
        })
        .from(actions)
        .where(
          and(
            eq(actions.userId, userId),
            eq(actions.status, 'pending'),
            inArray(
              actions.threadId,
              db
                .select({ threadId: messages.threadId })
                .from(messages)
                .where(withPerson(userId, email))
            )
          )
        ),
      db
        .select({
          dueAt: commitments.dueAt,
          id: commitments.id,
          promise: commitments.promise,
          threadId: commitments.threadId,
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

  if (stats.isPerson && stats.fromThem + stats.toThem >= NOTE_MIN_MESSAGES) {
    refreshStaleNote(userId, email, stored, recent)
  }

  return {
    ...stats,
    conversations,
    email,
    note: stored?.note ?? null,
    open,
    promised,
  }
}

interface Contact {
  email: string
  last: Date
  name: string | null
  score: number
}

/** Everyone the user wrote to and the people who wrote to them, the most written-to first; the composer suggests recipients from it. */
export const listContacts = async (userId: string) => {
  const sentTo = db
    .select({
      address: sql`unnest(${messages.to} || ${messages.cc})`.as('address'),
      receivedAt: messages.receivedAt,
    })
    .from(messages)
    .where(and(eq(messages.userId, userId), eq(messages.isFromMe, true)))
    .as('sent_to')
  const [sent, received, own] = await Promise.all([
    db
      .select({
        count: sql<number>`count(*)::int`,
        email: sql<string>`${sentTo.address}`.mapWith(messages.fromEmail),
        last: sql<Date>`max(${sentTo.receivedAt})`.mapWith(messages.receivedAt),
      })
      .from(sentTo)
      .groupBy(sentTo.address),
    db
      .select({
        count: sql<number>`count(*)::int`,
        email: messages.fromEmail,
        last: sql<Date>`max(${messages.receivedAt})`.mapWith(
          messages.receivedAt
        ),
        name: sql<string | null>`max(${messages.fromName})`.mapWith(
          messages.fromName
        ),
      })
      .from(messages)
      .innerJoin(analyses, eq(analyses.messageId, messages.id))
      .where(
        and(
          eq(messages.userId, userId),
          eq(messages.isFromMe, false),
          isNull(messages.listId),
          isNull(messages.suspicion),
          not(arrayContains(messages.labelIds, ['SPAM'])),
          inArray(analyses.category, [...PEOPLE_CATEGORIES])
        )
      )
      .groupBy(messages.fromEmail),
    listMailboxes(userId),
  ])
  const mine = new Set(own.map(({ email }) => email.toLowerCase()))
  const contacts = new Map<string, Contact>()
  for (const { count, email, last, name } of [
    ...sent.map((row) => ({
      ...row,
      count: row.count * SENT_WEIGHT,
      name: null,
    })),
    ...received,
  ]) {
    const known = contacts.get(email)
    contacts.set(email, {
      email,
      last: known && known.last > last ? known.last : last,
      name: known?.name ?? name,
      score: (known?.score ?? 0) + count,
    })
  }
  return [...contacts.values()]
    .filter(({ email }) => !mine.has(email) && !isAutomatedSender(email))
    .toSorted(
      (a, b) => b.score - a.score || b.last.getTime() - a.last.getTime()
    )
    .slice(0, CONTACTS_KEPT)
    .map(({ email, name }) => ({ email, name }))
}

export const findContacts = async (userId: string, query: string) => {
  const contacts = await listContacts(userId)
  return contacts
    .filter((contact) => matchesContact(contact, query))
    .slice(0, FOUND_SHOWN)
}
