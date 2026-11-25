import { db } from '@fewmail/db'
import { commitmentEvents, commitments, messages } from '@fewmail/db/schema'
import { ACTIVE_COMMITMENT_STATUSES } from '@fewmail/shared/agent'
import type { CommitmentActor, CommitmentStatus } from '@fewmail/shared/agent'
import { choice } from '@typesafe-ai/sdk'
import { and, asc, desc, eq, inArray, lt, ne, or } from 'drizzle-orm'
import { alias } from 'drizzle-orm/pg-core'

import { jev } from '../lib/jev'
import { announceChange } from '../lib/live'
import { logError } from '../lib/log'
import { keepsPromises } from './bots'
import { NotFoundError } from './mail-errors'
import { isThreadOn } from './stored-mail'

type Commitment = typeof commitments.$inferSelect

const evidence = alias(messages, 'evidence')
type Message = typeof messages.$inferSelect

/** How far the agent may move a promise on its own; it never moves one back. */
const PROGRESS: Record<CommitmentStatus, number> = {
  acknowledged: 1,
  broken: 3,
  cancelled: 3,
  fulfilled: 3,
  in_progress: 2,
  open: 0,
}

/**
 * The only way a promise changes status: the row and its event together, and only from the status the caller saw,
 * so the agent reading an email and the user's click never both win.
 */
export const moveCommitment = (
  commitment: Pick<Commitment, 'id' | 'status' | 'userId'>,
  to: CommitmentStatus,
  by: CommitmentActor,
  messageId: string | null = null
) =>
  db.transaction(async (tx) => {
    const [moved] = await tx
      .update(commitments)
      .set({
        status: to,
        ...(messageId && { evidenceMessageId: messageId }),
        ...(by === 'user' && { editedAt: new Date() }),
      })
      .where(
        and(
          eq(commitments.id, commitment.id),
          eq(commitments.status, commitment.status)
        )
      )
      .returning({ id: commitments.id })
    if (!moved) {
      return false
    }
    await tx.insert(commitmentEvents).values({
      by,
      commitmentId: commitment.id,
      from: commitment.status,
      messageId,
      to,
      userId: commitment.userId,
    })
    return true
  })

/** New promises start their history here, so every status they ever had is in `commitment_events`; none without the Board. */
export const recordCommitments = async (
  rows: Omit<typeof commitments.$inferInsert, 'status'>[]
) => {
  if (!rows[0] || !(await keepsPromises(rows[0].userId))) {
    return
  }
  await db.transaction(async (tx) => {
    const created = await tx
      .insert(commitments)
      .values(rows.map((row) => ({ ...row, status: 'open' as const })))
      .returning({
        id: commitments.id,
        messageId: commitments.messageId,
        userId: commitments.userId,
      })
    await tx.insert(commitmentEvents).values(
      created.map(({ id, messageId, userId }) => ({
        by: 'agent' as const,
        commitmentId: id,
        messageId,
        to: 'open' as const,
        userId,
      }))
    )
  })
}

/** What one email can show about a promise; a mere reply is `acknowledged`, never `fulfilled`. */
const EVIDENCE = {
  acknowledged:
    'Someone answered about it, but it is not done: thanks, received your request, looking into it',
  cancelled:
    'It will not happen: withdrawn, refused, or the user said it is no longer needed',
  fulfilled:
    'It is done: this email delivers it or confirms it was completed (the refund arrived, the document is attached, the payment went through, the call took place)',
  in_progress:
    'It is under way but not done: approved, processed, shipped, scheduled, money on its way',
  unrelated: 'This email is not about that promise',
} as const

/** Below these odds Jev is guessing, and a guess must never close a promise. */
const EVIDENCE_ODDS = 0.7
export const CHECKED_PER_EMAIL = 5
export const EVIDENCE_CHARS = 4000

/**
 * Promises an email could be about: the same thread, or for a promise to the user any email from whoever made it,
 * or for the user's own any email they sent to whom they promised. Last days are dates, not deeds: never checked.
 */
const candidatesFor = (message: Message) =>
  db
    .select()
    .from(commitments)
    .where(
      and(
        eq(commitments.userId, message.userId),
        inArray(commitments.status, ACTIVE_COMMITMENT_STATUSES),
        ne(commitments.kind, 'deadline'),
        lt(commitments.createdAt, message.receivedAt),
        or(
          eq(commitments.threadId, message.threadId),
          message.isFromMe
            ? and(
                eq(commitments.kind, 'mine'),
                inArray(commitments.recipient, message.to)
              )
            : and(
                eq(commitments.kind, 'theirs'),
                eq(commitments.recipient, message.fromEmail)
              )
        )
      )
    )
    .orderBy(desc(commitments.createdAt))
    .limit(CHECKED_PER_EMAIL)

/** The user's own promise is kept by what they send; one made to them by what others send. */
const canShow = (commitment: Commitment, message: Message) =>
  commitment.messageId !== message.id &&
  (commitment.kind === 'mine'
    ? message.isFromMe || commitment.threadId === message.threadId
    : !message.isFromMe)

/** One Jev call per email that touches an open promise; the answer only ever moves a promise forward. */
const checkEvidence = async (message: Message) => {
  const found = await candidatesFor(message)
  const candidates = found.filter((commitment) => canShow(commitment, message))
  if (candidates.length === 0) {
    return 0
  }
  const { answers } = await jev.systemOne({
    questions: Object.fromEntries(
      candidates.map((commitment, index) => [
        `promise_${index}`,
        choice(
          `What this email shows about the promise "${commitment.promise}"`,
          EVIDENCE
        ),
      ])
    ),
    state: `From: ${message.fromEmail}\nTo: ${message.to.join(', ')}\nSubject: ${message.subject}\n\n${message.body.slice(0, EVIDENCE_CHARS)}`,
  })
  let moved = 0
  for (const [index, commitment] of candidates.entries()) {
    const answer = answers[`promise_${index}`]
    const to = answer?.choice
    if (
      !to ||
      to === 'unrelated' ||
      (answer.probabilities[to] ?? 0) < EVIDENCE_ODDS ||
      PROGRESS[to] <= PROGRESS[commitment.status]
    ) {
      continue
    }
    // oxlint-disable-next-line eslint/no-await-in-loop -- each move is its own claim on the row
    if (await moveCommitment(commitment, to, 'agent', message.id)) {
      moved += 1
    }
  }
  return moved
}

/** Every new email, sent or received, is checked against the promises it could settle. */
export const trackCommitments = async (userId: string, inserted: Message[]) => {
  let moved = 0
  for (const message of inserted.toSorted(
    (a, b) => a.receivedAt.getTime() - b.receivedAt.getTime()
  )) {
    // oxlint-disable-next-line eslint/no-await-in-loop -- oldest first, so a later email sees what an earlier one moved
    moved += await checkEvidence(message).catch((error: unknown) => {
      logError('promise evidence failed', error)
      return 0
    })
  }
  if (moved > 0) {
    await announceChange(userId, ['commitments'])
  }
}

const isActive = (status: CommitmentStatus) =>
  (ACTIVE_COMMITMENT_STATUSES as readonly string[]).includes(status)

/** Every promise both ways and every last day, the ones still waiting first, each with what happened to it. */
export const listCommitments = async (userId: string) => {
  const rows = await db
    .select({
      commitment: commitments,
      evidenceThreadId: evidence.threadId,
      fromEmail: messages.fromEmail,
      fromName: messages.fromName,
    })
    .from(commitments)
    .leftJoin(messages, eq(messages.id, commitments.messageId))
    .leftJoin(evidence, eq(evidence.id, commitments.evidenceMessageId))
    .where(and(eq(commitments.userId, userId), isThreadOn(commitments)))
    .orderBy(asc(commitments.dueAt))
  const history = rows.length
    ? await db
        .select()
        .from(commitmentEvents)
        .where(
          inArray(
            commitmentEvents.commitmentId,
            rows.map(({ commitment }) => commitment.id)
          )
        )
        .orderBy(asc(commitmentEvents.createdAt))
    : []
  const byCommitment = Map.groupBy(history, ({ commitmentId }) => commitmentId)
  return rows
    .map(({ commitment: row, evidenceThreadId, fromEmail, fromName }) => ({
      amountCents: row.amountCents,
      currency: row.currency,
      dueAt: row.dueAt,
      evidenceMessageId: row.evidenceMessageId,
      evidenceThreadId,
      /** Who wrote the email it came from: the promiser for `theirs`, the user for `mine`. */
      from: fromEmail ? { fromEmail, fromName } : null,
      history: (byCommitment.get(row.id) ?? []).map(
        ({ by, createdAt, messageId, to }) => ({
          at: createdAt,
          by,
          messageId,
          to,
        })
      ),
      id: row.id,
      isEdited: row.editedAt !== null,
      kind: row.kind,
      messageId: row.messageId,
      promise: row.promise,
      recipient: row.recipient,
      status: row.status,
      threadId: row.threadId,
    }))
    .toSorted((a, b) => Number(isActive(b.status)) - Number(isActive(a.status)))
}

/** The user closes, reopens or calls off a promise by hand; any status, back or forward, since it is their word. */
export const setCommitmentStatus = async (
  userId: string,
  id: string,
  status: CommitmentStatus
) => {
  const [commitment] = await db
    .select()
    .from(commitments)
    .where(and(eq(commitments.id, id), eq(commitments.userId, userId)))
  if (!commitment) {
    throw new NotFoundError('No such promise')
  }
  if (commitment.status === status) {
    return
  }
  if (!(await moveCommitment(commitment, status, 'user'))) {
    throw new NotFoundError('The promise changed meanwhile')
  }
  await announceChange(userId, ['commitments'])
}

/** A card's yes says the user kept their promise or saw the last day; chasing someone else's promise proves nothing. */
export const settleByCard = async (userId: string, commitmentId: string) => {
  const [commitment] = await db
    .select()
    .from(commitments)
    .where(
      and(
        eq(commitments.id, commitmentId),
        eq(commitments.userId, userId),
        inArray(commitments.status, ACTIVE_COMMITMENT_STATUSES)
      )
    )
  if (commitment && commitment.kind !== 'theirs') {
    await moveCommitment(commitment, 'fulfilled', 'user')
  }
}
