import { db } from '@fewmail/db'
import { userSettings } from '@fewmail/db/schema'
import type { Locale } from '@fewmail/shared/i18n/locales'
import { eq } from 'drizzle-orm'

import { logErrorAs } from '../lib/log'
import { expectRow } from '../lib/rows'
import { backfillAgentLabels } from './labels'
import { trialUsedBy } from './plan'
import { getSettings } from './settings'
import { syncMailboxes } from './sync'

// Apart from `settings.ts` because sync and labels import `getSettings`: saving starts both.

/** The first save (the first sign-in) reads the inbox at once (the ready-made bots are Fewmail Bot's to offer); turning Gmail labels on labels recent mail. */
export const saveSettings = async (
  userId: string,
  input: {
    language: Locale
    gmailLabels?: boolean
    knowledge?: string | null
    timezone: string
    voice?: string | null
  }
) => {
  const before = await getSettings(userId)
  const trialUsed = !before && (await trialUsedBy(userId))
  const [inserted] = await db
    .insert(userSettings)
    .values({ ...input, userId, ...(trialUsed && { trialEndsAt: new Date() }) })
    .onConflictDoNothing()
    .returning()

  if (inserted) {
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
