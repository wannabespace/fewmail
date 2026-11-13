/**
 * What a month of each plan costs in AI, estimated from the prompts, limits and models the API really uses and
 * LiteLLM's prices, against what the plan brings in after Stripe. `economics.test.ts` holds the budget;
 * `bun run economics` prints the table. Token counts are estimates: instructions at 4 characters a token,
 * mail at 3 (it mixes scripts), no prompt caching (none is set up).
 */
import process from 'node:process'

import {
  PAID_PLANS,
  PLAN_LIMITS,
  PRICE_USD,
  TRIAL_DAYS,
} from '@fewmail/shared/agent'
import type { BillingInterval } from '@fewmail/shared/agent'
import { z } from 'zod'

import {
  analyzeInstructions,
  BODY_LIMIT,
  EARLIER_BODY_LIMIT,
  EARLIER_LIMIT,
  SENT_EXAMPLE_CHARS,
  SENT_EXAMPLES,
} from '../services/agent'
import { agentTools } from '../services/agent-tools'
import { BODY_LIMIT as ASK_BODY_LIMIT, SOURCE_LIMIT } from '../services/ask'
import { MAX_FILES, TEXT_CHARS } from '../services/attachments'
import {
  CONTEXT_LIMIT,
  FIM_MODEL,
  MAX_TOKENS as FIM_OUTPUT_TOKENS,
} from '../services/autocomplete'
import { ENTRY_BODY_CHARS } from '../services/boards'
import { chatInstructions, MAX_STEPS } from '../services/chat'
import {
  ACTION_CRITERIA,
  CATEGORY_CRITERIA,
  IMPORTANCE_LEVELS,
  NEEDS_REPLY,
} from '../services/classify'
import { URGENT_RESERVE } from '../services/plan'
import {
  READING_SHOWN,
  BODY_CHARS as READING_BODY_CHARS,
} from '../services/reading'
import { RISK_BODY_CHARS } from '../services/risk'
import { PROMISE_BODY_CHARS, SENT_JEV_CHARS } from '../services/sent-mail'
import {
  FAST_FALLBACK_ID,
  FAST_MODEL_ID,
  WRITER_FALLBACK_ID,
  WRITER_MODEL_ID,
} from './ai'
import { SPEECH_CHARS, SPEECH_MODEL } from './elevenlabs'
import { JEV_MODEL_ID } from './jev'
import { OCR_MODEL, OCR_PAGES, TRANSCRIBE_MODEL } from './mistral'

const LITELLM_PRICES_URL =
  'https://raw.githubusercontent.com/BerriAI/litellm/main/model_prices_and_context_window.json'
const PRICES_TIMEOUT_MS = 10_000

interface Price {
  input_cost_per_character?: number
  input_cost_per_second?: number
  input_cost_per_token?: number
  ocr_cost_per_page?: number
  output_cost_per_token?: number
}

/** LiteLLM lists each model under its provider's own id, not OpenRouter's or the SDK's alias: a new model goes here, or every estimate throws. */
const LITELLM_KEYS: Record<string, string> = {
  [FAST_FALLBACK_ID]: 'gemini/gemini-3.8-flash',
  [FAST_MODEL_ID]: 'claude-haiku-4-5',
  [FIM_MODEL]: 'mistral/codestral-latest',
  [JEV_MODEL_ID]: 'typesafe/jev-latest',
  [OCR_MODEL]: 'mistral/mistral-ocr-latest',
  [SPEECH_MODEL]: 'elevenlabs/eleven_flash_v2_5',
  [TRANSCRIBE_MODEL]: 'mistral/voxtral-mini-latest',
  [WRITER_FALLBACK_ID]: 'xai/grok-4.7',
  [WRITER_MODEL_ID]: 'claude-sonnet-5-5',
}

export const MODELS = Object.keys(LITELLM_KEYS)

const response = await fetch(LITELLM_PRICES_URL, {
  signal: AbortSignal.timeout(PRICES_TIMEOUT_MS),
})
if (!response.ok) {
  throw new Error(`LiteLLM prices: HTTP ${response.status}`)
}
const prices = (await response.json()) as Record<string, Price>

export const priceOf = (model: string, unit: keyof Price) => {
  const price = prices[LITELLM_KEYS[model] ?? model]?.[unit]
  if (price === undefined) {
    throw new Error(`${model} has no ${unit} in LiteLLM: see LITELLM_KEYS`)
  }
  return price
}

const llm = (model: string, inputTokens: number, outputTokens: number) =>
  inputTokens * priceOf(model, 'input_cost_per_token') +
  outputTokens * priceOf(model, 'output_cost_per_token')

const INSTRUCTION_CHARS_PER_TOKEN = 4
const MAIL_CHARS_PER_TOKEN = 3
const instructionTokens = (chars: number) => chars / INSTRUCTION_CHARS_PER_TOKEN
const mailTokens = (chars: number) => chars / MAIL_CHARS_PER_TOKEN

const HEADER_CHARS = 250
const STRUCTURED_OUTPUT_TOKENS = 300
const ANALYSIS_OUTPUT_TOKENS = 250
const DRAFT_INSTRUCTION_CHARS = 800
const DRAFT_OUTPUT_TOKENS = 400
const JEV_QUESTION_CHARS = 400
const RISK_QUESTION_CHARS = 250
const PROMISE_INSTRUCTION_CHARS = 600
const PROMISE_OUTPUT_TOKENS = 100
const ASK_QUERY_INSTRUCTION_CHARS = 1500
const ASK_QUERY_OUTPUT_TOKENS = 60
const ASK_ANSWER_INSTRUCTION_CHARS = 900
const ASK_ANSWER_OUTPUT_TOKENS = 300
const CHAT_STEP_OUTPUT_TOKENS = 150
const CHAT_ANSWER_TOKENS = 300
const READING_INSTRUCTION_CHARS = 500
const READING_OUTPUT_TOKENS_EACH = 80
const NOTE_PROMPT_CHARS = 12 * 200 + 400
const NOTE_OUTPUT_TOKENS = 120
const ENTRY_INSTRUCTION_CHARS = 1500
const ENTRY_OUTPUT_TOKENS = 120
const COMPLETION_PREFIX_CHARS = 1000
const DAYS = 30

/** How one account uses Fewmail: sizes of what it sends the models and volumes no plan limit counts. */
export interface Use {
  analyzedShare: number
  attachedShare: number
  bodyChars: number
  chatHistoryTokens: number
  chatSteps: number
  completions: number
  draftedShare: number
  earlierChars: number
  earlierEmails: number
  entries: number
  inbound: number
  knowledgeChars: number
  messages: number
  newslettersPerDay: number
  notes: number
  promisedShare: number
  ruleChars: number
  rules: number
  sent: number
  spokenChars: number
  spokenReplies: number
  toolResultTokens: number
  voiceChars: number
  voiceSeconds: number
  voiceShare: number
}

export const TYPICAL: Use = {
  analyzedShare: 0.3,
  attachedShare: 0.15,
  bodyChars: 1500,
  chatHistoryTokens: 3000,
  chatSteps: 3,
  completions: 300,
  draftedShare: 0.25,
  earlierChars: 800,
  earlierEmails: 1,
  entries: 100,
  inbound: 1500,
  knowledgeChars: 500,
  messages: 30,
  newslettersPerDay: 8,
  notes: 20,
  promisedShare: 0.2,
  ruleChars: 80,
  rules: 5,
  sent: 150,
  spokenChars: 600,
  spokenReplies: 20,
  toolResultTokens: 1500,
  voiceChars: 200,
  voiceSeconds: 20,
  voiceShare: 0.1,
}

/** Every size at its cap or past any sensible use, every limit spent. */
export const HEAVY: Use = {
  analyzedShare: 1,
  attachedShare: 1,
  bodyChars: BODY_LIMIT,
  chatHistoryTokens: 30_000,
  chatSteps: MAX_STEPS,
  completions: 3000,
  draftedShare: 1,
  earlierChars: EARLIER_BODY_LIMIT,
  earlierEmails: EARLIER_LIMIT,
  entries: 600,
  inbound: 6000,
  knowledgeChars: 4000,
  messages: Number.POSITIVE_INFINITY,
  newslettersPerDay: READING_SHOWN,
  notes: 100,
  promisedShare: 0.5,
  ruleChars: 200,
  rules: 30,
  sent: 600,
  spokenChars: SPEECH_CHARS,
  spokenReplies: 300,
  toolResultTokens: 3000,
  voiceChars: 1000,
  voiceSeconds: 120,
  voiceShare: 1,
}

/** Typical sizes, every email and message the plan allows spent. */
export const FULL: Use = {
  ...TYPICAL,
  analyzedShare: 1,
  inbound: HEAVY.inbound,
  messages: HEAVY.messages,
}

const threadChars = (use: Use) =>
  use.earlierEmails * (use.earlierChars + HEADER_CHARS) +
  use.bodyChars +
  HEADER_CHARS

const fakeRules = (use: Use) =>
  Array.from({ length: use.rules }, (_, index) => ({
    id: `rule_${index}`,
    instruction: 'x'.repeat(use.ruleChars),
  }))

const criteriaChars = JSON.stringify([
  ACTION_CRITERIA,
  CATEGORY_CRITERIA,
  IMPORTANCE_LEVELS,
  NEEDS_REPLY,
]).length

/** Jev's decision and its risk check, on every plan for every incoming email. */
export const inboundJevCost = (use: Use) =>
  llm(
    JEV_MODEL_ID,
    mailTokens(threadChars(use)) +
      instructionTokens(
        criteriaChars + JEV_QUESTION_CHARS + use.rules * use.ruleChars
      ) +
      mailTokens(Math.min(use.bodyChars, RISK_BODY_CHARS)) +
      instructionTokens(RISK_QUESTION_CHARS),
    0
  )

const sentJevCost = (use: Use) =>
  llm(JEV_MODEL_ID, mailTokens(Math.min(use.bodyChars, SENT_JEV_CHARS)), 0)

const draftCost = (use: Use) =>
  llm(
    WRITER_MODEL_ID,
    instructionTokens(
      DRAFT_INSTRUCTION_CHARS + use.knowledgeChars + use.voiceChars
    ) + mailTokens(SENT_EXAMPLES * SENT_EXAMPLE_CHARS + threadChars(use)),
    DRAFT_OUTPUT_TOKENS
  )

/** One email counted against the plan: the text Jev cannot write, its attachments read, and a draft where it wants a reply. */
export const analyzedEmailCost = (use: Use) => {
  const instructions = analyzeInstructions({
    language: 'en',
    rules: fakeRules(use),
    userEmail: 'someone@example.com',
  })
  const attachedChars = use.attachedShare * MAX_FILES * TEXT_CHARS
  const text = llm(
    FAST_MODEL_ID,
    instructionTokens(instructions.length) +
      STRUCTURED_OUTPUT_TOKENS +
      mailTokens(threadChars(use) + attachedChars),
    ANALYSIS_OUTPUT_TOKENS
  )
  const ocr =
    use.attachedShare *
    MAX_FILES *
    OCR_PAGES.length *
    priceOf(OCR_MODEL, 'ocr_cost_per_page')
  const draft = use.draftedShare * draftCost(use)
  return { draft, ocr, text, total: text + ocr + draft }
}

const toolsChars = JSON.stringify(
  Object.entries(agentTools('economics')).map(([name, tool]) => ({
    description: tool.description,
    input: z.toJSONSchema(z.object(tool.input ?? {})),
    name,
  }))
).length

/** Every step sends the instructions, every tool, the whole chat and this turn's tool results again. */
const chatCost = (use: Use) => {
  const instructions = chatInstructions({
    knowledge: 'x'.repeat(use.knowledgeChars),
    language: 'en',
    timezone: 'UTC',
  })
  const perStep =
    instructionTokens(instructions.length + toolsChars) + use.chatHistoryTokens
  const growth = use.toolResultTokens + CHAT_STEP_OUTPUT_TOKENS
  const steps = use.chatSteps
  return llm(
    WRITER_MODEL_ID,
    steps * perStep + (growth * steps * (steps - 1)) / 2,
    steps * CHAT_STEP_OUTPUT_TOKENS + CHAT_ANSWER_TOKENS
  )
}

const askCost = () =>
  llm(
    FAST_MODEL_ID,
    instructionTokens(ASK_QUERY_INSTRUCTION_CHARS),
    ASK_QUERY_OUTPUT_TOKENS
  ) +
  llm(
    WRITER_MODEL_ID,
    instructionTokens(ASK_ANSWER_INSTRUCTION_CHARS) +
      STRUCTURED_OUTPUT_TOKENS +
      mailTokens(SOURCE_LIMIT * (ASK_BODY_LIMIT + HEADER_CHARS)),
    ASK_ANSWER_OUTPUT_TOKENS
  )

/** One message counted against the plan, the dearer of a chat turn and Ask, spoken to it or typed. */
export const messageCost = (use: Use) =>
  Math.max(chatCost(use), askCost()) +
  use.voiceShare *
    use.voiceSeconds *
    priceOf(TRANSCRIBE_MODEL, 'input_cost_per_second')

/** What no plan limit counts: Jev on all mail for everyone, and for the agent the digest, promises, notes, board entries, autocomplete and speech. */
export const backgroundCost = (use: Use, agent: boolean) => {
  const jev = use.inbound * inboundJevCost(use) + use.sent * sentJevCost(use)
  if (!agent) {
    return { jev, total: jev }
  }
  const promises =
    use.sent *
    use.promisedShare *
    llm(
      FAST_MODEL_ID,
      instructionTokens(PROMISE_INSTRUCTION_CHARS) +
        STRUCTURED_OUTPUT_TOKENS +
        mailTokens(Math.min(use.bodyChars, PROMISE_BODY_CHARS)),
      PROMISE_OUTPUT_TOKENS
    )
  const digest =
    DAYS *
    llm(
      FAST_MODEL_ID,
      instructionTokens(READING_INSTRUCTION_CHARS) +
        STRUCTURED_OUTPUT_TOKENS +
        mailTokens(use.newslettersPerDay * READING_BODY_CHARS),
      use.newslettersPerDay * READING_OUTPUT_TOKENS_EACH
    )
  const notes =
    use.notes *
    llm(WRITER_MODEL_ID, mailTokens(NOTE_PROMPT_CHARS), NOTE_OUTPUT_TOKENS)
  const entries =
    use.entries *
    llm(
      FAST_MODEL_ID,
      instructionTokens(ENTRY_INSTRUCTION_CHARS) +
        STRUCTURED_OUTPUT_TOKENS +
        mailTokens(Math.min(use.bodyChars, ENTRY_BODY_CHARS)),
      ENTRY_OUTPUT_TOKENS
    )
  const completions =
    use.completions *
    llm(
      FIM_MODEL,
      mailTokens(
        COMPLETION_PREFIX_CHARS +
          Math.min(use.knowledgeChars, CONTEXT_LIMIT) +
          Math.min(use.bodyChars, CONTEXT_LIMIT)
      ),
      FIM_OUTPUT_TOKENS
    )
  const speech =
    use.spokenReplies *
    Math.min(use.spokenChars, SPEECH_CHARS) *
    priceOf(SPEECH_MODEL, 'input_cost_per_character')
  return {
    completions,
    digest,
    entries,
    jev,
    notes,
    promises,
    speech,
    total: jev + promises + digest + notes + entries + completions + speech,
  }
}

type AgentPlan = keyof typeof PLAN_LIMITS

/** A month of `plan` used as `use` says, its emails and messages held to the plan's limits. */
export const monthCost = (plan: AgentPlan, use: Use) => {
  const limits = PLAN_LIMITS[plan]
  const emails = Math.min(
    use.inbound * use.analyzedShare,
    limits.emails * URGENT_RESERVE
  )
  const messages = Math.min(use.messages, limits.messages)
  const background = backgroundCost(use, true).total
  const mail = emails * analyzedEmailCost(use).total
  const talk = messages * messageCost(use)
  return {
    background,
    emails,
    mail,
    messages,
    talk,
    total: background + mail + talk,
  }
}

/** A trial lasts `TRIAL_DAYS` but its limits are a month's, so all of them can go in it. */
export const trialCost = (use: Use) => {
  const month = monthCost('trial', use)
  return month.mail + month.talk + (month.background * TRIAL_DAYS) / DAYS
}

export const freeMonthCost = (use: Use) => backgroundCost(use, false).total

const STRIPE_RATE = 0.036
const STRIPE_FIXED_USD = 0.3
const MONTHS_A_YEAR = 12

const monthsOf = (interval: BillingInterval) =>
  interval === 'year' ? MONTHS_A_YEAR : 1

type PaidPlan = (typeof PAID_PLANS)[number]

export const grossRevenue = (plan: PaidPlan, interval: BillingInterval) =>
  PRICE_USD[plan][interval] / monthsOf(interval)

/** A yearly charge pays Stripe's fixed fee once for twelve months. */
export const netRevenue = (plan: PaidPlan, interval: BillingInterval) =>
  (PRICE_USD[plan][interval] * (1 - STRIPE_RATE) - STRIPE_FIXED_USD) /
  monthsOf(interval)

export const margin = (
  plan: PaidPlan,
  interval: BillingInterval,
  aiUsd: number
) => (netRevenue(plan, interval) - aiUsd) / grossRevenue(plan, interval)

const usd = (n: number) => `$${n < 0.01 ? n.toFixed(4) : n.toFixed(2)}`
const pct = (n: number) => `${Math.round(n * 100)}%`

const printUnits = (lines: string[], name: string, use: Use) => {
  const email = analyzedEmailCost(use)
  lines.push(
    `${name}`,
    `  incoming email, Jev (every plan): ${usd(inboundJevCost(use))}`,
    `  counted email: ${usd(email.total)} (text ${usd(email.text)}, attachments ${usd(email.ocr)}, draft ${usd(email.draft)})`,
    `  counted message: ${usd(messageCost(use))} (chat ${usd(chatCost(use))}, Ask ${usd(askCost())})`
  )
  for (const [what, cost] of Object.entries(backgroundCost(use, true))) {
    lines.push(`  a month of ${what}: ${usd(cost)}`)
  }
}

const printReport = () => {
  const lines = [
    `Models: ${MODELS.map((model) => `${model} (${LITELLM_KEYS[model]})`).join(', ')}`,
    `Chat sends ${Math.round(instructionTokens(toolsChars))} tokens of tool definitions every step, up to ${MAX_STEPS} steps a message`,
    '',
  ]
  printUnits(lines, 'Typical use', TYPICAL)
  lines.push('')
  printUnits(lines, 'Heavy use (every size at its cap)', HEAVY)
  lines.push(
    '',
    'Plans: AI a month, margin after Stripe and AI (monthly / yearly)'
  )
  for (const plan of PAID_PLANS) {
    const limits = PLAN_LIMITS[plan]
    lines.push(
      `  ${plan} $${PRICE_USD[plan].month}/mo, ${limits.emails} emails, ${limits.messages} messages: net ${usd(netRevenue(plan, 'month'))} / ${usd(netRevenue(plan, 'year'))}`
    )
    for (const [name, use] of [
      ['typical', TYPICAL],
      ['limits spent, typical sizes', FULL],
      ['heavy', HEAVY],
    ] as const) {
      const month = monthCost(plan, use)
      lines.push(
        `    ${name}: ${usd(month.total)} (${Math.round(month.emails)} emails ${usd(month.mail)}, ${month.messages} messages ${usd(month.talk)}, background ${usd(month.background)}), margin ${pct(margin(plan, 'month', month.total))} / ${pct(margin(plan, 'year', month.total))}`
      )
    }
  }
  lines.push(
    '',
    `Trial (${TRIAL_DAYS} days, ${PLAN_LIMITS.trial.emails} emails, ${PLAN_LIMITS.trial.messages} messages): typical ${usd(trialCost(TYPICAL))}, heavy ${usd(trialCost(HEAVY))}`,
    `Free (Jev only): typical ${usd(freeMonthCost(TYPICAL))} a month, heavy ${usd(freeMonthCost(HEAVY))}`
  )
  process.stdout.write(`${lines.join('\n')}\n`)
}

if (import.meta.main) {
  printReport()
  process.exit(0)
}
