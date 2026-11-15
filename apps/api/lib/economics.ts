/**
 * What a month of each plan costs in AI, estimated from the prompts, limits and models the API really uses and
 * LiteLLM's prices, against what the plan brings in after Stripe. `economics.test.ts` holds the budget;
 * `bun run economics` prints the table. Token counts are estimates: instructions at 4 characters a token,
 * mail at 3 (it mixes scripts), no prompt caching (none is set up).
 */
import process from 'node:process'

import {
  PAID_PLANS,
  PLAN_ALLOWANCE_USD,
  PRICE_USD,
  SPEECH_CHARS,
  TRIAL_DAYS,
} from '@fewmail/shared/agent'
import type { BillingInterval } from '@fewmail/shared/agent'
import { z } from 'zod'

import {
  analyzeInstructions,
  BODY_LIMIT,
  EARLIER_BODY_LIMIT,
  EARLIER_LIMIT,
  LINK_INSTRUCTIONS,
  LINK_LIMIT,
  LINK_TEXT_CHARS,
  SENT_EXAMPLE_CHARS,
  SENT_EXAMPLES,
} from '../services/agent'
import { agentInstructions, MAX_STEPS } from '../services/agent-run'
import { agentTools } from '../services/agent-tools'
import { BODY_LIMIT as ASK_BODY_LIMIT, SOURCE_LIMIT } from '../services/ask'
import { MAX_FILES, TEXT_CHARS } from '../services/attachments'
import {
  CONTEXT_LIMIT,
  FIM_MODEL,
  MAX_TOKENS as FIM_OUTPUT_TOKENS,
} from '../services/autocomplete'
import { ENTRY_BODY_CHARS } from '../services/boards'
import {
  ACTION_CRITERIA,
  CATEGORY_CRITERIA,
  IMPORTANCE_LEVELS,
  NEEDS_REPLY,
} from '../services/classify'
import {
  READING_SHOWN,
  BODY_CHARS as READING_BODY_CHARS,
} from '../services/reading'
import { RISK_BODY_CHARS } from '../services/risk'
import {
  PROMISE_BODY_CHARS,
  SENT_JEV_CHARS,
  VOICE_EVERY_SENT,
  VOICE_INSTRUCTIONS,
  VOICE_SAMPLE,
} from '../services/sent-mail'
import { FIRST_ISSUE_DAYS, FIRST_WEEK_LIMIT } from '../services/sync'
import {
  FAST_FALLBACK_ID,
  FAST_MODEL_ID,
  WRITER_FALLBACK_ID,
  WRITER_MODEL_ID,
} from './ai'
import { SPEECH_MODEL } from './elevenlabs'
import { JEV_MODEL_ID } from './jev'
import { OCR_MODEL, OCR_PAGES, TRANSCRIBE_MODEL } from './mistral'

const LITELLM_PRICES_URL =
  'https://raw.githubusercontent.com/BerriAI/litellm/main/model_prices_and_context_window.json'
const PRICES_TIMEOUT_MS = 10_000

interface Price {
  cache_creation_input_token_cost?: number
  cache_read_input_token_cost?: number
  input_cost_per_character?: number
  input_cost_per_second?: number
  input_cost_per_token?: number
  ocr_cost_per_page?: number
  output_cost_per_token?: number
}

/** LiteLLM lists each model under its provider's own id, not OpenRouter's or the SDK's alias: a new model goes here, or every estimate throws. */
const LITELLM_KEYS: Record<string, string> = {
  [FAST_FALLBACK_ID]: 'gemini/gemini-3.8-flash',
  // Jev Router has no list price; on an email's analysis it cost within 5% of Haiku (2026-11-13).
  [FAST_MODEL_ID]: 'claude-haiku-5-5',
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
const ANALYSIS_OUTPUT_TOKENS = 260
const LINK_HOST_CHARS = 25
const LINK_OUTPUT_TOKENS = 20
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
const READING_SUMMARY_INSTRUCTION_CHARS = 900
const READING_SUMMARY_CHARS_EACH = 450
const READING_SUMMARY_OUTPUT_TOKENS = 600
const NOTE_PROMPT_CHARS = 12 * 200 + 400
const NOTE_OUTPUT_TOKENS = 120
const VOICE_OUTPUT_TOKENS = 250
const ENTRY_INSTRUCTION_CHARS = 1750
const ENTRY_OUTPUT_TOKENS = 125
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
  linkChars: number
  linkedShare: number
  links: number
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
  attachedShare: 0.08,
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
  linkChars: 30,
  linkedShare: 0.1,
  links: 20,
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
  voiceChars: 700,
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
  linkChars: LINK_TEXT_CHARS,
  linkedShare: 1,
  links: LINK_LIMIT,
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

/** A pay or read card points at the email's own link: subject, summary and each link's text and host. */
const linkCost = (use: Use) =>
  llm(
    FAST_MODEL_ID,
    instructionTokens(LINK_INSTRUCTIONS.length) +
      STRUCTURED_OUTPUT_TOKENS +
      mailTokens(HEADER_CHARS + use.links * (use.linkChars + LINK_HOST_CHARS)),
    LINK_OUTPUT_TOKENS
  )

/** One email counted against the plan: the text Jev cannot write, its attachments read, a draft where it wants a reply and the link of its card. */
export const analyzedEmailCost = (use: Use) => {
  const instructions = analyzeInstructions({
    language: 'en',
    rules: fakeRules(use),
    timezone: 'Europe/Kyiv',
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
  const link = use.linkedShare * linkCost(use)
  return { draft, link, ocr, text, total: text + ocr + draft + link }
}

const toolsChars = JSON.stringify(
  Object.entries(agentTools('economics')).map(([name, tool]) => ({
    description: tool.description,
    input: z.toJSONSchema(z.object(tool.input ?? {})),
    name,
  }))
).length

/**
 * Every step sends the instructions, every tool, the whole chat and this turn's tool results again. The first
 * step writes all of it to Anthropic's cache, each later one reads what the step before wrote and writes what
 * it added. The cache lasts five minutes, so a message after a pause writes the tools and instructions again; every message is taken to be one.
 */
const chatCost = (use: Use) => {
  const instructions = agentInstructions({
    knowledge: 'x'.repeat(use.knowledgeChars),
    language: 'en',
    timezone: 'UTC',
  })
  const perStep =
    instructionTokens(instructions.length + toolsChars) + use.chatHistoryTokens
  const growth = use.toolResultTokens + CHAT_STEP_OUTPUT_TOKENS
  const steps = use.chatSteps
  const written = perStep + growth * (steps - 1)
  const read = (steps - 1) * perStep + (growth * (steps - 1) * (steps - 2)) / 2
  return (
    written * priceOf(WRITER_MODEL_ID, 'cache_creation_input_token_cost') +
    read * priceOf(WRITER_MODEL_ID, 'cache_read_input_token_cost') +
    llm(
      WRITER_MODEL_ID,
      0,
      steps * CHAT_STEP_OUTPUT_TOKENS + CHAT_ANSWER_TOKENS
    )
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

/** One day's Reading issue with the agent: each newsletter's own summary, then the issue's. */
const issueCost = (use: Use) =>
  llm(
    FAST_MODEL_ID,
    instructionTokens(READING_INSTRUCTION_CHARS) +
      STRUCTURED_OUTPUT_TOKENS +
      mailTokens(use.newslettersPerDay * READING_BODY_CHARS),
    use.newslettersPerDay * READING_OUTPUT_TOKENS_EACH
  ) +
  llm(
    FAST_MODEL_ID,
    instructionTokens(READING_SUMMARY_INSTRUCTION_CHARS) +
      STRUCTURED_OUTPUT_TOKENS +
      mailTokens(use.newslettersPerDay * READING_SUMMARY_CHARS_EACH),
    READING_SUMMARY_OUTPUT_TOKENS
  )

/** Once, at sign-up: Jev on the week's candidates (all `FIRST_WEEK_LIMIT` of them at worst) and, with the agent, a week of issues. */
export const firstWeekCost = (use: Use, agent: boolean) =>
  FIRST_WEEK_LIMIT * inboundJevCost(use) +
  (agent ? FIRST_ISSUE_DAYS * issueCost(use) : 0)

/** What no plan limit counts: Jev on all mail for everyone, and for the agent the digest, promises, notes, the user's style, board entries and autocomplete. */
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
  // One issue a day, written the morning after.
  const digest = DAYS * issueCost(use)
  const notes =
    use.notes *
    llm(WRITER_MODEL_ID, mailTokens(NOTE_PROMPT_CHARS), NOTE_OUTPUT_TOKENS)
  // Read again after every `VOICE_EVERY_SENT` sent emails, at most once a day.
  const voice =
    Math.min(DAYS, use.sent / VOICE_EVERY_SENT) *
    llm(
      FAST_MODEL_ID,
      instructionTokens(VOICE_INSTRUCTIONS.length) +
        mailTokens(VOICE_SAMPLE * SENT_EXAMPLE_CHARS),
      VOICE_OUTPUT_TOKENS
    )
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
  return {
    completions,
    digest,
    entries,
    jev,
    notes,
    promises,
    total: jev + promises + digest + notes + entries + completions + voice,
    voice,
  }
}

type AgentPlan = keyof typeof PLAN_ALLOWANCE_USD

/** What `use` costs with nothing to stop it: the mail the agent writes for, the messages, reading aloud and the background work, Jev apart. */
export const agentCost = (use: Use) => {
  const emails = use.inbound * use.analyzedShare
  const { jev, total } = backgroundCost(use, true)
  const mail = emails * analyzedEmailCost(use).total
  const talk = use.messages * messageCost(use)
  const speech =
    use.spokenReplies *
    Math.min(use.spokenChars, SPEECH_CHARS) *
    priceOf(SPEECH_MODEL, 'input_cost_per_character')
  const background = total - jev
  return {
    background,
    emails,
    mail,
    speech,
    talk,
    total: background + mail + talk + speech,
  }
}

/** A month of `plan`: the agent stops where the allowance runs out; Jev reads all mail on every plan and is never stopped. */
export const monthCost = (plan: AgentPlan, use: Use) => {
  const agent = Math.min(agentCost(use).total, PLAN_ALLOWANCE_USD[plan])
  const { jev } = backgroundCost(use, true)
  return { agent, jev, total: agent + jev }
}

/** A trial's allowance is a month's, so all of it can go in its `TRIAL_DAYS`. */
export const trialCost = (use: Use) => {
  const month = monthCost('trial', use)
  return month.agent + (month.jev * TRIAL_DAYS) / DAYS
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

/** What a yearly plan keeps after Stripe and AI when its allowance is spent and a busy inbox runs through Jev; Max gives more of its price back. */
export const TARGET_MARGIN: Record<PaidPlan, number> = {
  lite: 0.2,
  max: 0.1,
  pro: 0.2,
}

/** The largest allowance that keeps `TARGET_MARGIN` on a yearly plan; `PLAN_ALLOWANCE_USD` follows it. */
export const fairAllowance = (plan: PaidPlan) =>
  netRevenue(plan, 'year') -
  TARGET_MARGIN[plan] * grossRevenue(plan, 'year') -
  backgroundCost(FULL, true).jev

const usd = (n: number) => `$${n < 0.01 ? n.toFixed(4) : n.toFixed(2)}`
const pct = (n: number) => `${Math.round(n * 100)}%`

const printUnits = (lines: string[], name: string, use: Use) => {
  const email = analyzedEmailCost(use)
  lines.push(
    `${name}`,
    `  incoming email, Jev (every plan): ${usd(inboundJevCost(use))}`,
    `  counted email: ${usd(email.total)} (text ${usd(email.text)}, attachments ${usd(email.ocr)}, draft ${usd(email.draft)}, link ${usd(email.link)})`,
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
    `Plans: the allowance (fair at the plan's target margin yearly), what it buys at typical sizes, AI a month and the margin after Stripe and AI (monthly / yearly)`
  )
  for (const plan of PAID_PLANS) {
    const allowance = PLAN_ALLOWANCE_USD[plan]
    lines.push(
      `  ${plan} $${PRICE_USD[plan].month}/mo: allowance ${usd(allowance)} (fair at ${pct(TARGET_MARGIN[plan])}: ${usd(fairAllowance(plan))}), about ${Math.round(allowance / analyzedEmailCost(TYPICAL).total)} emails or ${Math.round(allowance / messageCost(TYPICAL))} messages; net ${usd(netRevenue(plan, 'month'))} / ${usd(netRevenue(plan, 'year'))}`
    )
    for (const [name, use] of [
      ['typical', TYPICAL],
      ['allowance spent, busy inbox', FULL],
      ['heavy', HEAVY],
    ] as const) {
      const month = monthCost(plan, use)
      lines.push(
        `    ${name}: ${usd(month.total)} (agent ${usd(month.agent)}, Jev ${usd(month.jev)}), margin ${pct(margin(plan, 'month', month.total))} / ${pct(margin(plan, 'year', month.total))}`
      )
    }
  }
  const typical = agentCost(TYPICAL)
  lines.push(
    '',
    `Typical use uncapped: ${usd(typical.total)} (${Math.round(typical.emails)} emails ${usd(typical.mail)}, ${TYPICAL.messages} messages ${usd(typical.talk)}, speech ${usd(typical.speech)}, background ${usd(typical.background)})`,
    `Trial (${TRIAL_DAYS} days, allowance ${usd(PLAN_ALLOWANCE_USD.trial)}): typical ${usd(trialCost(TYPICAL))}, heavy ${usd(trialCost(HEAVY))}`,
    `Free (Jev only): typical ${usd(freeMonthCost(TYPICAL))} a month, heavy ${usd(freeMonthCost(HEAVY))}`,
    `First week at sign-up (once, ${FIRST_WEEK_LIMIT} candidates): with the agent typical ${usd(firstWeekCost(TYPICAL, true))}, heavy ${usd(firstWeekCost(HEAVY, true))}; Free ${usd(firstWeekCost(TYPICAL, false))}`
  )
  process.stdout.write(`${lines.join('\n')}\n`)
}

if (import.meta.main) {
  printReport()
  process.exit(0)
}
