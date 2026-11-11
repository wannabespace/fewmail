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

const labelIdFor = async (userId: string, category: MailCategory) => {
  const [mailbox] = await db
    .select()
    .from(mailboxes)
    .where(eq(mailboxes.userId, userId))
  if (!mailbox) {
    return null
  }
  const cached = mailbox.labelIds[category]
  if (cached) {
    return cached
  }
  const name = labelName(category)
  const labels = await listLabels(userId)
  const existing = labels.find((label) => label.name === name)
  const label = existing ?? (await createLabel(userId, name))
  await db
    .update(mailboxes)
    .set({ labelIds: { ...mailbox.labelIds, [category]: label.id } })
    .where(eq(mailboxes.id, mailbox.id))
  return label.id
}

export const applyAgentLabel = async (
  message: Message,
  category: MailCategory
) => {
  const settings = await getSettings(message.userId)
  if (!settings?.gmailLabels) {
    return
  }
  const labelId = await labelIdFor(message.userId, category)
  if (labelId) {
    await modifyMessage(message.userId, message.gmailId, { add: [labelId] })
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
