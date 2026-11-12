import { db } from '@fewmail/db'
import { analyses, mailboxes, messages } from '@fewmail/db/schema'
import type { MailCategory } from '@fewmail/shared/agent'
import { subDays } from 'date-fns'
import { and, eq, gte, sql } from 'drizzle-orm'

import {
  createLabel,
  GmailError,
  listLabels,
  modifyMessage,
} from '../lib/gmail'
import { getSettings } from './settings'

type Message = typeof messages.$inferSelect
type Mailbox = typeof mailboxes.$inferSelect

const BACKFILL_DAYS = 7
const BACKFILL_LIMIT = 200

/** One stable English name per category so labels survive a language change and match on every device. */
const labelName = (category: MailCategory) =>
  `Fewmail/${category.charAt(0).toUpperCase()}${category.slice(1)}`

const isGmailStatus = (error: unknown, ...statuses: number[]) =>
  error instanceof GmailError && statuses.includes(error.status)

/** Two analyses may create the same new label at once; the loser finds the winner's (409). */
export const findOrCreateLabel = async (mailbox: Mailbox, name: string) => {
  const find = async () => {
    const labels = await listLabels(mailbox)
    return labels.find((label) => label.name === name)
  }
  return (
    (await find()) ??
    (await createLabel(mailbox, name).catch(async (error) => {
      const raced = isGmailStatus(error, 409) ? await find() : undefined
      if (!raced) {
        throw error
      }
      return raced
    }))
  )
}

const labelIdOf = async (mailbox: Mailbox, category: MailCategory) => {
  const cached = mailbox.labelIds[category]
  if (cached) {
    return cached
  }
  const label = await findOrCreateLabel(mailbox, labelName(category))
  await db
    .update(mailboxes)
    .set({
      labelIds: sql`${mailboxes.labelIds} || jsonb_build_object(${category}::text, ${label.id}::text)`,
    })
    .where(eq(mailboxes.id, mailbox.id))
  return label.id
}

/** A label the user deleted in Gmail is created again instead of failing every email after. */
const forgetLabel = (mailbox: Mailbox, category: MailCategory) =>
  db
    .update(mailboxes)
    .set({ labelIds: sql`${mailboxes.labelIds} - ${category}::text` })
    .where(eq(mailboxes.id, mailbox.id))

export const applyAgentLabel = async (
  message: Message,
  category: MailCategory
) => {
  const settings = await getSettings(message.userId)
  if (!settings?.gmailLabels) {
    return
  }
  const [mailbox] = await db
    .select()
    .from(mailboxes)
    .where(eq(mailboxes.id, message.mailboxId))
  if (!mailbox) {
    return
  }
  const labelId = await labelIdOf(mailbox, category)
  await modifyMessage(mailbox, message.gmailId, { add: [labelId] }).catch(
    async (error) => {
      if (!mailbox.labelIds[category] || !isGmailStatus(error, 400, 404)) {
        throw error
      }
      await forgetLabel(mailbox, category)
      await modifyMessage(mailbox, message.gmailId, {
        add: [await labelIdOf({ ...mailbox, labelIds: {} }, category)],
      })
    }
  )
}

/** Turning labels on labels the last week too, so Gmail looks sorted right away. */
export const backfillAgentLabels = async (userId: string) => {
  const recent = await db
    .select({ category: analyses.category, message: messages })
    .from(messages)
    .innerJoin(analyses, eq(analyses.messageId, messages.id))
    .where(
      and(
        eq(messages.userId, userId),
        gte(messages.receivedAt, subDays(new Date(), BACKFILL_DAYS))
      )
    )
    .limit(BACKFILL_LIMIT)
  for (const { category, message } of recent) {
    // oxlint-disable-next-line eslint/no-await-in-loop -- one at a time keeps label creation race-free and under Gmail's rate limit
    await applyAgentLabel(message, category)
  }
}
