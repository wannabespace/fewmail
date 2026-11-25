import { db } from '@fewmail/db'
import { mailboxes, messages } from '@fewmail/db/schema'
import { Result } from 'better-result'
import { subDays } from 'date-fns'
import { and, asc, eq, inArray, isNotNull, lt, notExists } from 'drizzle-orm'
import type { AnyPgColumn } from 'drizzle-orm/pg-core'
import { alias } from 'drizzle-orm/pg-core'

import { inBatches } from '../lib/batches'
import { getMessage, isMissing, listThreadMessageIds } from '../lib/gmail'
import { searchTokensOf } from '../lib/search-tokens'
import { NotFoundError } from './mail-errors'
import { parseLiveMessageId } from './older-mail'

type Mailbox = typeof mailboxes.$inferSelect
type Message = typeof messages.$inferSelect

const STORE_CONCURRENCY = 4

const offMessage = alias(messages, 'off_message')

/** Not in a mailbox the user turned off: such mail stays stored and is shown nowhere. A row without an email passes. */
export const isMailboxOn = ({ mailboxId }: { mailboxId: AnyPgColumn }) =>
  notExists(
    db
      .select({ id: mailboxes.id })
      .from(mailboxes)
      .where(and(eq(mailboxes.id, mailboxId), eq(mailboxes.enabled, false)))
  )

/** `isMailboxOn` for a row that knows only its thread; nothing acts on a thread of a mailbox that is off. */
export const isThreadOn = (row: {
  threadId: AnyPgColumn
  userId: AnyPgColumn
}) =>
  notExists(
    db
      .select({ id: offMessage.id })
      .from(offMessage)
      .innerJoin(
        mailboxes,
        and(
          eq(mailboxes.id, offMessage.mailboxId),
          eq(mailboxes.enabled, false)
        )
      )
      .where(
        and(
          eq(offMessage.userId, row.userId),
          eq(offMessage.threadId, row.threadId)
        )
      )
  )

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

const HTML_KEPT_DAYS = 30
const HTML_BATCH = 1000

/** Old mail keeps its text; its HTML, most of a row, is read again from Gmail when it is opened (`fillFromGmail`). */
export const dropOldHtml = () =>
  db
    .update(messages)
    .set({ html: null })
    .where(
      inArray(
        messages.id,
        db
          .select({ id: messages.id })
          .from(messages)
          .where(
            and(
              isNotNull(messages.html),
              lt(messages.receivedAt, subDays(new Date(), HTML_KEPT_DAYS))
            )
          )
          .limit(HTML_BATCH)
      )
    )

/** The mailboxes the user keeps on. */
export const activeMailboxes = (userId: string, mailboxId?: string) =>
  db
    .select()
    .from(mailboxes)
    .where(
      and(
        eq(mailboxes.userId, userId),
        eq(mailboxes.enabled, true),
        mailboxId ? eq(mailboxes.id, mailboxId) : undefined
      )
    )
    .orderBy(asc(mailboxes.createdAt))

/** A thread read live from Gmail is stored whole once it is opened or acted on; a thread id belongs to one mailbox. */
export const holdThread = async (userId: string, threadId: string) => {
  for (const mailbox of await activeMailboxes(userId)) {
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
  const owned = await activeMailboxes(userId)
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
