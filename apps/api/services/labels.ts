import { db } from '@fewmail/db'
import { analyses, mailboxes, messages } from '@fewmail/db/schema'
import type { MailCategory } from '@fewmail/shared/agent'
import { subDays } from 'date-fns'
import { and, eq, gte } from 'drizzle-orm'

import { createLabel, listLabels, modifyMessage } from '../lib/gmail'
import { getSettings } from './settings'

type Message = typeof messages.$inferSelect

const BACKFILL_DAYS = 7
const BACKFILL_LIMIT = 200

/** One stable English name per category so labels survive a language change and match on every device. */
const labelName = (category: MailCategory) =>
  `Fewmail/${category.charAt(0).toUpperCase()}${category.slice(1)}`

const mailboxWithLabel = async (mailboxId: string, category: MailCategory) => {
  const [mailbox] = await db
    .select()
    .from(mailboxes)
    .where(eq(mailboxes.id, mailboxId))
  if (!mailbox) {
    return null
  }
  const cached = mailbox.labelIds[category]
  if (cached) {
    return { ...mailbox, labelId: cached }
  }
  const name = labelName(category)
  const labels = await listLabels(mailbox)
  const existing = labels.find((label) => label.name === name)
  const label = existing ?? (await createLabel(mailbox, name))
  await db
    .update(mailboxes)
    .set({ labelIds: { ...mailbox.labelIds, [category]: label.id } })
    .where(eq(mailboxes.id, mailbox.id))
  return { ...mailbox, labelId: label.id }
}

export const applyAgentLabel = async (
  message: Message,
  category: MailCategory
) => {
  const settings = await getSettings(message.userId)
  if (!settings?.gmailLabels) {
    return
  }
  const mailbox = await mailboxWithLabel(message.mailboxId, category)
  if (mailbox) {
    await modifyMessage(mailbox, message.gmailId, { add: [mailbox.labelId] })
  }
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
