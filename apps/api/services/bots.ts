import { db } from '@fewmail/db'
import { botPosts, bots } from '@fewmail/db/schema'
import type { SimpleMatch } from '@fewmail/db/schema'
import { BOT_EFFECTS, GMAIL_EFFECTS } from '@fewmail/shared/agent'
import type { BotEffect } from '@fewmail/shared/agent'
import { messages as dictionaries } from '@fewmail/shared/i18n'
import type { Messages } from '@fewmail/shared/i18n'
import { choice } from '@typesafe-ai/sdk'
import { and, desc, eq } from 'drizzle-orm'

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

const NAME_WORDS = 3
const SHORT_WORD = 3

/** A bot from before names were required is named once from its own words: what it matches, or its instruction's first clause. */
const nameOf = (bot: typeof bots.$inferSelect, t: Messages) => {
  if (bot.match) {
    return bot.match.value || t.bots.simple.title.mailingList()
  }
  const words = (bot.instruction ?? '')
    .split(/[,.;:(]/u)[0]
    ?.trim()
    .split(/\s+/u)
    .slice(0, NAME_WORDS) ?? ['']
  // "Newsletters and" reads as cut off: a short word never ends a name.
  while (words.length > 1 && (words.at(-1)?.length ?? 0) <= SHORT_WORD) {
    words.pop()
  }
  const name = words.join(' ')
  return `${name.charAt(0).toLocaleUpperCase()}${name.slice(1)}`
}

/** A rule's effect was picked apart from its words; a bot's words are the only place it shows, so they say it. */
const sayEffect = (bot: typeof bots.$inferSelect, t: Messages) =>
  bot.instruction && bot.effect !== 'collect'
    ? `${bot.instruction.trim().replace(/[.。]$/u, '')}. ${t.bots.effect[bot.effect]}`
    : bot.instruction

export const listBots = async (userId: string) => {
  const rows = await db
    .select()
    .from(bots)
    .where(eq(bots.userId, userId))
    .orderBy(...BOT_ORDER)
  if (rows.every(({ name }) => name !== null)) {
    return rows
  }
  const settings = await getSettings(userId)
  const t = dictionaries[settings?.language ?? 'en']
  return Promise.all(
    rows.map(async (bot) => {
      if (bot.name !== null) {
        return bot
      }
      const named = { instruction: sayEffect(bot, t), name: nameOf(bot, t) }
      await db.update(bots).set(named).where(eq(bots.id, bot.id))
      return { ...bot, ...named }
    })
  )
}

const UNSAID = 'unsaid'

const EFFECT_CRITERIA: Record<BotEffect | typeof UNSAID, string> = {
  [UNSAID]: 'It only says which emails, not what to do with them',
  always_show: 'Keep them in sight on Home, never let one slip',
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
        ) as Record<BotEffect | typeof UNSAID, string>
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
    effect: BotEffect
    enabled: boolean
    instruction: string
    name: string
  }>
) => {
  await requireAgentFor(userId, input.effect)
  const [bot] = await db
    .update(bots)
    .set(input)
    .where(and(eq(bots.id, id), eq(bots.userId, userId)))
    .returning()
  if (!bot) {
    throw new NotFoundError('Bot not found')
  }
  return bot
}

export const createBot = async (
  userId: string,
  input: { effect: BotEffect; enabled?: boolean; name: string } & (
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
