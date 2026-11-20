import { db } from '@fewmail/db'
import { bots, userSettings } from '@fewmail/db/schema'
import type { BotEffect } from '@fewmail/shared/agent'
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

/** Only a prefill: the user renames, rewrites or deletes them like any bot of their own. Home lists the last first. */
const STARTER_BOTS: {
  effect: BotEffect
  key: keyof Messages['starterBots']
}[] = [
  { effect: 'tidy', key: 'quick' },
  { effect: 'collect', key: 'later' },
  { effect: 'always_show', key: 'important' },
]

/** The first save (the first sign-in) seeds the starter bots and reads the inbox at once; turning Gmail labels on labels recent mail. */
export const saveSettings = async (
  userId: string,
  input: {
    briefHour?: number
    language: Locale
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
    await db.insert(bots).values(
      STARTER_BOTS.map(({ effect, key }) => ({
        effect,
        // Nobody said yes to moving their mail yet: the tidying bot asks until the user lets it act on its own.
        enabled: effect !== 'tidy',
        ...messages[input.language].starterBots[key],
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
