import { db } from '@fewmail/db'
import { mailboxes } from '@fewmail/db/schema'
import type { messages } from '@fewmail/db/schema'
import { IMPORTANCE } from '@fewmail/shared/agent'
import type { MailCategory } from '@fewmail/shared/agent'
import { Result } from 'better-result'
import { eq } from 'drizzle-orm'

import { getAttachment, getAttachmentPart, listAttachments } from '../lib/gmail'
import { logError } from '../lib/log'
import { readDocument } from '../lib/mistral'
import { NotFoundError } from './mail-errors'
import { ownMailbox } from './mailboxes'
import { ownMessage } from './stored-mail'

type Message = typeof messages.$inferSelect

const READABLE = new Set([
  'application/pdf',
  'image/jpeg',
  'image/png',
  'image/webp',
])
export const MAX_FILES = 2
const MAX_BYTES = 10_000_000
export const TEXT_CHARS = 4000

const readAll = async (message: Message) => {
  const [mailbox] = await db
    .select()
    .from(mailboxes)
    .where(eq(mailboxes.id, message.mailboxId))
  if (!mailbox) {
    return ''
  }
  const files = await listAttachments(mailbox, message.gmailId)
  const readable = files
    .filter(({ mimeType, size }) => READABLE.has(mimeType) && size <= MAX_BYTES)
    .slice(0, MAX_FILES)
  const texts = await Promise.all(
    readable.map(async ({ attachmentId, filename, mimeType }) => {
      const data = await getAttachment(mailbox, message.gmailId, attachmentId)
      const text = await readDocument(message.userId, data, mimeType)
      return text
        ? `Attachment "${filename}":\n${text.slice(0, TEXT_CHARS)}`
        : ''
    })
  )
  return texts.filter(Boolean).join('\n\n')
}

const DOCUMENT_CATEGORIES: ReadonlySet<MailCategory> = new Set([
  'finance',
  'travel',
])

/** Reading a file costs as much as writing the email's text, so only mail that needs the user, bills and tickets get it. */
export const worthReading = ({
  category,
  importance,
}: {
  category: MailCategory
  importance: number
}) => importance >= IMPORTANCE.high || DOCUMENT_CATEGORIES.has(category)

/**
 * The text of an email's PDFs and images (invoices, contracts, tickets), read for the analysis only and
 * never stored. A failure leaves the analysis to the email body.
 */
export const attachmentText = async (message: Message) => {
  if (!message.hasAttachments) {
    return ''
  }
  const read = await Result.tryPromise(() => readAll(message))
  if (read.isErr()) {
    logError('reading attachments failed', read.error.cause)
    return ''
  }
  return read.value
}

/** One file of the user's email, read from Gmail when it is opened and never stored. */
export const readAttachment = async (
  userId: string,
  messageId: string,
  partId: string
) => {
  const message = await ownMessage(userId, messageId)
  const mailbox = await ownMailbox(userId, message.mailboxId)
  const file = await getAttachmentPart(mailbox, message.gmailId, partId)
  if (!file) {
    throw new NotFoundError('Attachment not found')
  }
  return file
}
