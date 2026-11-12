import { db } from '@fewmail/db'
import { rules, userSettings } from '@fewmail/db/schema'
import type { BoardPreset, RuleEffect } from '@fewmail/shared/agent'
import type { Messages } from '@fewmail/shared/i18n'
import { messages } from '@fewmail/shared/i18n'
import type { Locale } from '@fewmail/shared/i18n/locales'
import { eq } from 'drizzle-orm'

import { logErrorAs } from '../lib/log'
import { expectRow } from '../lib/rows'
import { backfillAgentLabels } from './labels'
import { getSettings } from './settings'
import { syncMailboxes } from './sync'

// Apart from `settings.ts` because sync and labels import `getSettings`: saving starts both.

const STARTER_RULES: {
  effect: RuleEffect
  instruction: keyof Messages['starterRules']
}[] = [
  { effect: 'archive', instruction: 'promotions' },
  { effect: 'mark_read', instruction: 'newsletters' },
  { effect: 'mark_read', instruction: 'receipts' },
  { effect: 'mark_read', instruction: 'notifications' },
  { effect: 'always_show', instruction: 'alwaysShow' },
]

/** The first save (onboarding) seeds the starter rules and reads the inbox at once; turning Gmail labels on labels recent mail. */
export const saveSettings = async (
  userId: string,
  input: {
    briefHour?: number
    language: Locale
    starterBoards?: BoardPreset[]
    gmailLabels?: boolean
    knowledge?: string | null
    readingDigest?: boolean
    timezone: string
    voice?: string | null
  }
) => {
  const before = await getSettings(userId)
  const [inserted] = await db
    .insert(userSettings)
    .values({ ...input, userId })
    .onConflictDoNothing()
    .returning()

  if (inserted) {
    await db.insert(rules).values(
      STARTER_RULES.map((rule) => ({
        ...rule,
        instruction: messages[input.language].starterRules[rule.instruction],
        userId,
      }))
    )
    void syncMailboxes(userId).catch(logErrorAs('first sync'))
    return inserted
  }

  const [updated] = await db
    .update(userSettings)
    .set(input)
    .where(eq(userSettings.userId, userId))
    .returning()
  if (input.gmailLabels && !before?.gmailLabels) {
    void backfillAgentLabels(userId).catch(logErrorAs('label backfill'))
  }
  return expectRow(updated)
}
