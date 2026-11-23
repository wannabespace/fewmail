import { db } from '@fewmail/db'
import { botPosts, bots } from '@fewmail/db/schema'
import type { SimpleMatch } from '@fewmail/db/schema'
import {
  BOARD_EFFECT,
  BOT_EFFECTS,
  BOT_PRESETS,
  GMAIL_EFFECTS,
} from '@fewmail/shared/agent'
import type { BotEffect, BotPreset, MailBotEffect } from '@fewmail/shared/agent'
import { messages as dictionaries } from '@fewmail/shared/i18n'
import type { Messages } from '@fewmail/shared/i18n'
import { choice } from '@typesafe-ai/sdk'
import { and, desc, eq, isNull, lte, or, sql } from 'drizzle-orm'

import { jev } from '../lib/jev'
import { expectRow } from '../lib/rows'
import { NotFoundError } from './mail-errors'
import { requireAgent } from './plan'
import { getSettings } from './settings'

/** Jev matches bots on every plan and moving or collecting mail needs nothing more; drafting and pinning to Home need the agent. */
const requireAgentFor = async (userId: string, effect?: BotEffect) => {
  if (effect === 'draft_reply' || effect === 'always_show') {
    await requireAgent(userId)
  }
}

/** Newest first; starter bots share one `createdAt`, so the id keeps their order from shuffling between reads. */
export const BOT_ORDER = [desc(bots.createdAt), desc(bots.id)] as const

/** A paused bot takes no mail until its pause ends: its mail is Fewmail's meanwhile. */
export const isWorking = or(
  isNull(bots.pausedUntil),
  lte(bots.pausedUntil, sql`now()`)
)

export const listBots = (userId: string) =>
  db
    .select()
    .from(bots)
    .where(eq(bots.userId, userId))
    .orderBy(...BOT_ORDER)

/** A preset as the user's bot, in their language. */
export const presetBot = (
  userId: string,
  { effect, key }: (typeof BOT_PRESETS)[number],
  t: Messages
) => {
  const words = t.starterBots[key]
  return {
    effect,
    // Nobody said yes to moving their mail yet: the tidying bot asks until the user lets it act on its own.
    enabled: effect !== 'tidy',
    instruction: 'instruction' in words ? words.instruction : null,
    name: words.name,
    userId,
  }
}

const boardOf = (userId: string) =>
  and(eq(bots.userId, userId), eq(bots.effect, BOARD_EFFECT))

/** The agent writes promises and last days down only while the user has the Board. */
export const keepsPromises = async (userId: string) =>
  (await db.$count(bots, boardOf(userId))) > 0

const UNSAID = 'unsaid'

const EFFECT_CRITERIA: Record<MailBotEffect | typeof UNSAID, string> = {
  [UNSAID]: 'It only says which emails, not what to do with them',
  always_show:
    'Show the user every one of them as needing them, never let one slip',
  archive: 'Archive them, take them out of the inbox',
  collect: 'Only gather them in one place and leave the inbox as it is',
  draft_reply: 'Draft a reply to each',
  mark_read: 'Mark them read',
  tidy: 'Tidy them up: archive, mark read or unsubscribe, whichever fits each one',
  trash: 'Delete them or move them to trash',
  unsubscribe: 'Unsubscribe from them',
}

const EFFECT_ODDS = 0.6
/** Gone from the inbox for good: a misread here costs the user mail, so the words must say it plainly. */
const SURE_EFFECTS: ReadonlySet<BotEffect> = new Set(['trash', 'unsubscribe'])
const SURE_ODDS = 0.8

/** What the user's words ask a bot to do with its mail; null when they do not say or Jev is unsure. A simple bot only moves mail. */
export const readBotEffect = async (text: string, simple: boolean) => {
  const effects = simple ? GMAIL_EFFECTS : BOT_EFFECTS
  const { answers } = await jev.systemOne({
    questions: {
      effect: choice(
        'What the user asks their email bot to do with its emails',
        Object.fromEntries(
          ([UNSAID, ...effects] as const).map((each) => [
            each,
            EFFECT_CRITERIA[each],
          ])
        ) as Record<MailBotEffect | typeof UNSAID, string>
      ),
    },
    state: text,
  })
  const { choice: picked, probabilities } = answers.effect
  if (picked === UNSAID) {
    return null
  }
  const odds = SURE_EFFECTS.has(picked) ? SURE_ODDS : EFFECT_ODDS
  return (probabilities[picked] ?? 0) >= odds ? picked : null
}

export const sameText = (a: string, b: string) =>
  a.trim().toLocaleLowerCase() === b.trim().toLocaleLowerCase()

export const updateBot = async (
  userId: string,
  id: string,
  input: Partial<{
    effect: MailBotEffect
    enabled: boolean
    instruction: string
    name: string
    pausedUntil: Date | null
  }>
) => {
  await requireAgentFor(userId, input.effect)
  const own = and(eq(bots.id, id), eq(bots.userId, userId))
  const [current] = await db.select().from(bots).where(own)
  if (!current) {
    throw new NotFoundError('Bot not found')
  }
  // The Board takes no mail: words or an effect would make Jev hand it mail and stop it being the Board.
  const change = current.effect === BOARD_EFFECT ? { name: input.name } : input
  if (Object.values(change).every((value) => value === undefined)) {
    return current
  }
  const [bot] = await db.update(bots).set(change).where(own).returning()
  return expectRow(bot)
}

export const createBot = async (
  userId: string,
  input: { effect: MailBotEffect; enabled?: boolean; name: string } & (
    | { instruction: string }
    | { match: SimpleMatch }
  )
) => {
  await requireAgentFor(userId, input.effect)
  const existing = await listBots(userId)
  const twin = existing.find((bot) =>
    'match' in input
      ? bot.match?.field === input.match.field &&
        sameText(bot.match.value, input.match.value)
      : bot.instruction !== null && sameText(bot.instruction, input.instruction)
  )
  if (twin) {
    return updateBot(userId, twin.id, {
      effect: input.effect,
      enabled: input.enabled ?? true,
      name: input.name,
    })
  }
  const [bot] = await db
    .insert(bots)
    .values({ ...input, userId })
    .returning()
  return expectRow(bot)
}

/** A preset from New bot; the Board comes once, so asking for it again gives the one the user has. */
export const addPresetBot = async (userId: string, key: BotPreset) => {
  const preset = BOT_PRESETS.find((each) => each.key === key)
  if (!preset) {
    throw new NotFoundError('Preset not found')
  }
  const settings = await getSettings(userId)
  const row = presetBot(
    userId,
    preset,
    dictionaries[settings?.language ?? 'en']
  )
  if (preset.effect !== BOARD_EFFECT && row.instruction) {
    return createBot(userId, {
      effect: preset.effect,
      enabled: row.enabled,
      instruction: row.instruction,
      name: row.name,
    })
  }
  const [board] = await db.select().from(bots).where(boardOf(userId))
  if (board) {
    return board
  }
  const [created] = await db.insert(bots).values(row).returning()
  return expectRow(created)
}

/** Its chat goes with it; what it did stays in the mail and under Fewmail's. */
export const deleteBot = async (userId: string, id: string) => {
  await db.transaction(async (tx) => {
    const [deleted] = await tx
      .delete(bots)
      .where(and(eq(bots.id, id), eq(bots.userId, userId)))
      .returning({ id: bots.id })
    if (deleted) {
      await tx
        .delete(botPosts)
        .where(and(eq(botPosts.userId, userId), eq(botPosts.bot, id)))
    }
  })
}
