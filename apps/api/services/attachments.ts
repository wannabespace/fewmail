import { db } from '@fewmail/db'
import { mailboxes } from '@fewmail/db/schema'
import type { messages } from '@fewmail/db/schema'
import { Result } from 'better-result'
import { eq } from 'drizzle-orm'

import { getAttachment, listAttachments } from '../lib/gmail'
import { logError } from '../lib/log'
import { readDocument } from '../lib/mistral'

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
      const text = await readDocument(data, mimeType)
      return text
        ? `Attachment "${filename}":\n${text.slice(0, TEXT_CHARS)}`
        : ''
    })
  )
  return texts.filter(Boolean).join('\n\n')
}

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
