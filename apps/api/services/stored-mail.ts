import { db } from '@fewmail/db'
import { mailboxes, messages } from '@fewmail/db/schema'
import { Result } from 'better-result'
import { and, eq, inArray, isNull } from 'drizzle-orm'

import { inBatches } from '../lib/batches'
import { getMessage, isMissing, listThreadMessageIds } from '../lib/gmail'
import { searchTokensOf } from '../lib/search-tokens'
import { NotFoundError } from './mail-errors'
import { parseLiveMessageId } from './older-mail'

type Mailbox = typeof mailboxes.$inferSelect
type Message = typeof messages.$inferSelect

const STORE_CONCURRENCY = 4

/** A vanished email or a draft is nothing to store. */
const readStorable = async (mailbox: Mailbox, id: string) => {
  const parsed = await getMessage(mailbox, id).catch((error) => {
    if (isMissing(error)) {
      return null
    }
    throw error
  })
  return parsed?.labelIds.includes('DRAFT') ? null : parsed
}

/**
 * A failed sync keeps its history id, so the same mail comes back next time; forgetting what it
 * stored lets that mail be processed then instead of being skipped as known.
 */
export const forget = async (inserted: Message[]) => {
  if (inserted.length > 0) {
    await db.delete(messages).where(
      inArray(
        messages.id,
        inserted.map(({ id }) => id)
      )
    )
  }
}

/** Only stores: mail found by search must never reach `processIncoming`. Without `keepsHtml` the html is fetched on first open. */
export const insertMessages = async (
  mailbox: Mailbox,
  ids: string[],
  { keepsHtml = true } = {}
) => {
  const known = ids.length
    ? await db
        .select({ gmailId: messages.gmailId })
        .from(messages)
        .where(
          and(
            eq(messages.mailboxId, mailbox.id),
            inArray(messages.gmailId, ids)
          )
        )
    : []
  const knownIds = new Set(known.map(({ gmailId }) => gmailId))

  const inserted: Message[] = []
  const stored = await Result.tryPromise(() =>
    inBatches(
      ids.filter((id) => !knownIds.has(id)),
      STORE_CONCURRENCY,
      async (id) => {
        const parsed = await readStorable(mailbox, id)
        if (!parsed) {
          return
        }
        const rows = await db
          .insert(messages)
          .values({
            ...parsed,
            html: keepsHtml ? parsed.html : null,
            mailboxId: mailbox.id,
            searchTokens: searchTokensOf(mailbox.userId, [
              parsed.subject,
              parsed.fromName,
              parsed.fromEmail,
            ]),
            userId: mailbox.userId,
          })
          .onConflictDoNothing()
          .returning()
        inserted.push(...rows)
      }
    )
  )
  if (stored.isErr()) {
    await forget(inserted)
    throw stored.error.cause
  }
  return inserted
}

const INDEX_BATCH = 1000

/** Mail stored before the search index existed, a batch a tick. */
export const indexStoredMail = async () => {
  const due = await db
    .select({
      fromEmail: messages.fromEmail,
      fromName: messages.fromName,
      id: messages.id,
      subject: messages.subject,
      userId: messages.userId,
    })
    .from(messages)
    .where(isNull(messages.searchTokens))
    .limit(INDEX_BATCH)
  await inBatches(
    due,
    STORE_CONCURRENCY,
    ({ fromEmail, fromName, id, subject, userId }) =>
      db
        .update(messages)
        .set({
          searchTokens: searchTokensOf(userId, [subject, fromName, fromEmail]),
        })
        .where(eq(messages.id, id))
  )
}

const ownedMailboxes = (userId: string) =>
  db.select().from(mailboxes).where(eq(mailboxes.userId, userId))

/** A thread read live from Gmail is stored whole once it is opened or acted on; a thread id belongs to one mailbox. */
export const holdThread = async (userId: string, threadId: string) => {
  for (const mailbox of await ownedMailboxes(userId)) {
    // oxlint-disable-next-line eslint/no-await-in-loop -- the other mailboxes are not asked once one has the thread
    const ids = await Result.tryPromise(() =>
      listThreadMessageIds(mailbox, threadId)
    )
    if (ids.isOk()) {
      // oxlint-disable-next-line eslint/no-await-in-loop -- returns right after
      await insertMessages(mailbox, ids.value)
      return
    }
    if (!isMissing(ids.error.cause)) {
      throw ids.error.cause
    }
  }
}

const holdMessage = async (
  userId: string,
  { gmailId, mailboxPrefix }: { gmailId: string; mailboxPrefix: string }
) => {
  const owned = await ownedMailboxes(userId)
  const mailbox = owned.find(({ id }) =>
    id.replaceAll('-', '').startsWith(mailboxPrefix)
  )
  if (!mailbox) {
    return []
  }
  await insertMessages(mailbox, [gmailId])
  const stored = await db
    .select()
    .from(messages)
    .where(
      and(eq(messages.mailboxId, mailbox.id), eq(messages.gmailId, gmailId))
    )
  if (stored[0]) {
    await insertMessages(
      mailbox,
      await listThreadMessageIds(mailbox, stored[0].threadId)
    )
  }
  return stored
}

/** Takes a live row's id too (`liveMessageId`): its thread is stored first. */
export const ownMessage = async (userId: string, messageId: string) => {
  const live = parseLiveMessageId(messageId)
  const [message] = live
    ? await holdMessage(userId, live)
    : await db
        .select()
        .from(messages)
        .where(and(eq(messages.id, messageId), eq(messages.userId, userId)))
  if (!message) {
    throw new NotFoundError('Email not found')
  }
  return message
}
