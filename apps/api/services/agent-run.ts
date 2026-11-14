import { db } from '@fewmail/db'
import { actions } from '@fewmail/db/schema'
import type { ConsentToolName } from '@fewmail/shared/agent'
import { messages as dictionaries } from '@fewmail/shared/i18n'
import { englishName } from '@fewmail/shared/i18n/locales'
import { generateText, stepCountIs, tool } from 'ai'
import { addDays, subDays } from 'date-fns'
import { z } from 'zod'

import { INFORMAL_ADDRESS, models, NO_EM_DASH, trackUsage } from '../lib/ai'
import { announceChange } from '../lib/live'
import { agentTools, toolAccess } from './agent-tools'
import { requireBudget } from './plan'
import { getSettings } from './settings'
import { skillPrompt } from './skills'
import { ownMessage } from './stored-mail'

export const MAX_STEPS = 12
/** Every step resends the tools and instructions: Anthropic reads the prefix the previous step wrote at a tenth of the price. */
const CACHE_PREFIX = {
  openrouter: { cacheControl: { type: 'ephemeral' } },
} as const

type AgentSettings = Pick<
  NonNullable<Awaited<ReturnType<typeof getSettings>>>,
  'knowledge' | 'language' | 'timezone'
> | null

/** Never put anything that changes between requests here: it would rewrite the cached tools and instructions every time. */
export const agentInstructions = (settings: AgentSettings) =>
  [
    "You are Fewmail, the user's email agent. You read all of their mail so they do not have to.",
    `Write in ${englishName(settings?.language ?? 'en')}, or in the language the user writes in. Replies to an email are written in the language of that email.`,
    INFORMAL_ADDRESS,
    NO_EM_DASH,
    'The user wants calm and nothing important lost: people waiting for them come first.',
    settings?.knowledge
      ? `What the user told you to know:\n${settings.knowledge}`
      : '',
    'Use the tools for anything about their mail and never invent emails, people, amounts or dates; search before saying something is not there.',
    'Speak like a person, not a program: never name your tools, fields, ids, categories or action kinds (no get_today, finance, pay). Say what you looked at in plain words, like "your queue" or "money mail".',
    'The queue lives on the app\'s Home screen; in another language call it by that language\'s word for a home page, never the English "Home". You are the agent: say "I", never "the agent".',
    'Be brief: a few sentences or a short list.',
    'To send a reply: draft_reply, then approve_action with that action id. Sending, archiving, snoozing, unsubscribing, rules and calendar changes never happen on your word: the tool puts a card on Home and the user decides there. Call the tool instead of asking in text, and say it waits for their yes on Home.',
  ]
    .filter(Boolean)
    .join('\n')

const clock = (settings: AgentSettings) => {
  const timezone = settings?.timezone ?? 'UTC'
  const now = new Date().toLocaleString('en-GB', {
    dateStyle: 'full',
    timeStyle: 'short',
    timeZone: timezone,
  })
  return `Now: ${now} (${timezone}).`
}

type ToolInput = Record<string, unknown>

const EVENTS_AROUND = (now: Date) => ({
  from: subDays(now, 30).toISOString(),
  to: addDays(now, 365).toISOString(),
})

/** The reads the card finds its email, card, board or event in; without them the user would say yes blind. */
const consentReads = async (
  userId: string,
  name: ConsentToolName,
  input: ToolInput
): Promise<
  { input: ToolInput; name: keyof ReturnType<typeof agentTools> }[]
> => {
  if (typeof input.messageId === 'string') {
    const { threadId } = await ownMessage(userId, input.messageId)
    return [{ input: { threadId }, name: 'read_thread' }]
  }
  if (
    name === 'approve_action' ||
    name === 'dismiss_action' ||
    name === 'tidy_mail'
  ) {
    return [{ input: {}, name: 'get_today' }]
  }
  if (name === 'delete_board') {
    return [{ input: {}, name: 'list_boards' }]
  }
  if (
    name === 'create_event' ||
    name === 'update_event' ||
    name === 'delete_event'
  ) {
    return [{ input: EVENTS_AROUND(new Date()), name: 'list_events' }]
  }
  return []
}

/**
 * A consent tool never runs on the agent's or an MCP client's word: it waits as a `consent` card on Home carrying the
 * tool, its input and what the reads found (`context`), so the card shows exactly what the yes does; `runConsent` does it.
 */
export const proposeConsent = async (
  userId: string,
  {
    from,
    input,
    name,
  }: { from: string; input: ToolInput; name: ConsentToolName }
) => {
  const settings = await getSettings(userId)
  const t = dictionaries[settings?.language ?? 'en']
  const tools = agentTools(userId)
  const reads = await consentReads(userId, name, input)
  const context = await Promise.all(
    reads.map((read) => tools[read.name].run(read.input as never))
  )
  await db.insert(actions).values({
    autonomous: false,
    kind: 'consent',
    messageId: typeof input.messageId === 'string' ? input.messageId : null,
    payload: { context, input, tool: name },
    reason: from,
    status: 'pending',
    title: t.agent.confirm[name],
    userId,
  })
  await announceChange(userId, ['actions', 'today'])
  return { question: t.agent.confirm[name] }
}

export const runConsent = (
  userId: string,
  payload: Record<string, unknown> | null
) => {
  const name = payload?.tool as ConsentToolName
  return agentTools(userId)[name].run((payload?.input ?? {}) as never)
}

const THREAD_LINK = /\[(?<label>[^\]]+)\]\(\?thread=[^)]*\)/gu

/** One request to the agent from a messenger or ⌘K: plain text back, every consent left as a card on Home. */
export const askAgent = async (userId: string, text: string) => {
  await requireBudget(userId)
  const settings = await getSettings(userId)
  const t = dictionaries[settings?.language ?? 'en']
  let waiting = 0
  const tools = Object.fromEntries(
    Object.entries(agentTools(userId)).map(([name, agentTool]) => [
      name,
      tool({
        description: agentTool.description,
        execute: async (input: unknown) => {
          if (toolAccess(name) !== 'consent') {
            return agentTool.run(input as never)
          }
          waiting += 1
          await proposeConsent(userId, {
            from: t.agent.fromAgent,
            input: input as ToolInput,
            name: name as ConsentToolName,
          })
          return {
            note: 'Nothing happened yet: a card waits for the user on Home. Tell them so, and do not call it again.',
            status: 'waiting_for_approval',
          }
        },
        inputSchema: z.object(agentTool.input ?? {}),
      }),
    ])
  )
  const result = await generateText({
    instructions: [
      {
        content: agentInstructions(settings),
        providerOptions: CACHE_PREFIX,
        role: 'system',
      },
      { content: clock(settings), role: 'system' },
    ],
    model: models.writer,
    prompt: skillPrompt(text) ?? text,
    providerOptions: CACHE_PREFIX,
    stopWhen: stepCountIs(MAX_STEPS),
    telemetry: trackUsage(userId, 'chat'),
    tools,
  })
  return {
    text: result.text.replaceAll(THREAD_LINK, '$<label>'),
    waiting,
  }
}
