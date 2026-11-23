import { db } from '@fewmail/db'
import { bots, userSettings } from '@fewmail/db/schema'
import { BOT_PRESETS } from '@fewmail/shared/agent'
import { messages } from '@fewmail/shared/i18n'
import type { Locale } from '@fewmail/shared/i18n/locales'
import { eq } from 'drizzle-orm'

import { logErrorAs } from '../lib/log'
import { expectRow } from '../lib/rows'
import { presetBot } from './bots'
import { backfillAgentLabels } from './labels'
import { trialUsedBy } from './plan'
import { getSettings } from './settings'
import { syncMailboxes } from './sync'

// Apart from `settings.ts` because sync and labels import `getSettings`: saving starts both.

/** The first save (the first sign-in) seeds the presets and reads the inbox at once; turning Gmail labels on labels recent mail. */
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
    // Home lists the last first, so the Board ends the list.
    await db
      .insert(bots)
      .values(
        BOT_PRESETS.map((preset) =>
          presetBot(userId, preset, messages[input.language])
        )
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
