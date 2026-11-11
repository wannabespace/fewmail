import { db } from '@fewmail/db'
import { rules, userSettings } from '@fewmail/db/schema'
import type { Persona, RuleEffect } from '@fewmail/shared/agent'
import type { Messages } from '@fewmail/shared/i18n'
import { messages } from '@fewmail/shared/i18n'
import type { Locale } from '@fewmail/shared/i18n/locales'
import { eq } from 'drizzle-orm'

export const getSettings = async (userId: string) => {
  const [settings] = await db
    .select()
    .from(userSettings)
    .where(eq(userSettings.userId, userId))
  return settings ?? null
}

const STARTER_RULES: Record<
  Persona,
  {
    autonomous: boolean
    effect: RuleEffect
    instruction: keyof Messages['starterRules']
  }[]
> = {
  reader: [
    { autonomous: true, effect: 'archive', instruction: 'promotions' },
    { autonomous: true, effect: 'mark_read', instruction: 'newsletters' },
    { autonomous: true, effect: 'mark_read', instruction: 'receipts' },
    { autonomous: false, effect: 'always_show', instruction: 'alwaysShow' },
  ],
  responder: [
    { autonomous: true, effect: 'archive', instruction: 'promotions' },
    { autonomous: true, effect: 'mark_read', instruction: 'notifications' },
    { autonomous: false, effect: 'draft_reply', instruction: 'people' },
  ],
}

export const saveSettings = async (
  userId: string,
  input: {
    briefHour?: number
    language: Locale
    persona: Persona
    gmailLabels?: boolean
    knowledge?: string | null
    timezone: string
    voice?: string | null
  }
) => {
  const existing = await getSettings(userId)

  await db
    .insert(userSettings)
    .values({ ...input, userId })
    .onConflictDoUpdate({ set: input, target: userSettings.userId })

  if (!existing) {
    await db.insert(rules).values(
      STARTER_RULES[input.persona].map((rule) => ({
        ...rule,
        instruction: messages[input.language].starterRules[rule.instruction],
        userId,
      }))
    )
  }

  return getSettings(userId)
}
