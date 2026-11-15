import type { rules } from '@fewmail/db/schema'
import type { ActionKind, MailCategory } from '@fewmail/shared/agent'
import { choice, noul, score } from '@typesafe-ai/sdk'

import { jev } from '../lib/jev'

type Rule = typeof rules.$inferSelect

export const CATEGORY_CRITERIA = {
  calendar: 'Meeting invitations, scheduling, calendar updates',
  finance: 'Bills, payments due or failed, subscriptions, bank and money',
  newsletter: 'Newsletters, digests, blog posts the user subscribed to',
  notification:
    'App and service mail, not money or security: alerts, status, account notices',
  other: 'Anything else',
  person: 'A real person writing personally, never a company or service',
  promotion: 'Marketing, sales offers, discounts, cold outreach',
  receipt: 'Receipts, order and shipping confirmations',
  security:
    'Sign-in alerts, password resets, verification codes, security warnings',
  travel: 'Flights, hotels, bookings, itineraries',
  work: 'A colleague, client or partner writing about work, never a tool or service',
} satisfies Record<MailCategory, string>

export const ACTION_CRITERIA = {
  archive: 'Noise: promotions, stale app notices',
  follow_up: 'Chase someone who has not answered',
  mark_read: 'Keep but no need to read: receipts, statements',
  none: 'Nothing to do',
  pay: 'An amount is due and the user should pay it',
  read: 'Must see or act outside email: a deadline, something expiring or being deleted; not a sale',
  reply: 'Someone expects the user to answer',
  schedule: 'A meeting time is proposed or requested',
  unsubscribe: 'Marketing the user would rather stop getting',
} satisfies Partial<Record<ActionKind | 'none', string>>

/** Jev and the LLM fallback offer the same actions; anything wider would let an email steer itself into a card kind that is pushed as urgent (security). */
export const SUGGESTED_ACTIONS = Object.keys(ACTION_CRITERIA) as [
  keyof typeof ACTION_CRITERIA,
  ...(keyof typeof ACTION_CRITERIA)[],
]

export const IMPORTANCE_LEVELS = [
  'Noise: nobody needs to see it',
  'Worth knowing, no rush',
  'Needs the user soon: something broke, their deadline or expiry (never a sale), a decision',
  'Urgent: security, money due within two days, or a person blocked on the user',
]

export const NEEDS_REPLY =
  'A real person, not an automated sender, is waiting for an answer from the recipient'

const NO_RULE = 'none'

export const STARTS_CASE =
  'Asks the recipient to get several things done that one reply cannot settle, like registering a company, a visa or renting a flat'

/** One more yes or no about the same email: costs nothing on top of the call. */
const CASE_SIGNAL = 0.7

/** The question alone, for mail read before cases existed (`scanForCases`). */
export const startsCase = async (prompt: string) => {
  const { answers } = await jev.systemOne({
    questions: { startsCase: noul(STARTS_CASE) },
    state: prompt,
  })
  return answers.startsCase.noul >= CASE_SIGNAL
}

/** Below these odds for noise as a whole (archive, mark read and unsubscribe together) Jev is guessing, and a guess would put mail that matters into Tidy. */
const NOISE_CONFIDENCE = 0.7
const NOISE_ACTIONS: ReadonlySet<string> = new Set([
  'archive',
  'mark_read',
  'unsubscribe',
])

/** Every decision about an email in one Jev call. */
export const decideWithJev = async (input: {
  cases: { id: string; title: string }[]
  prompt: string
  rules: Rule[]
  userEmail: string
}) => {
  const caseIds = new Map(
    input.cases.map((open, index) => [`case_${index}`, open.id])
  )
  const ruleIds = new Map(
    input.rules.map((rule, index) => [`rule_${index}`, rule.id])
  )
  const ruleCriteria = Object.fromEntries(
    input.rules.map((rule, index) => [`rule_${index}`, rule.instruction ?? ''])
  )

  const { answers } = await jev.systemOne({
    questions: {
      action: choice(
        'What the recipient should do about this email',
        ACTION_CRITERIA
      ),
      category: choice('What kind of email this is', CATEGORY_CRITERIA),
      importance: score(
        'How soon the recipient needs to see this; they want calm, but nothing important may slip and anything a real person waits on matters',
        IMPORTANCE_LEVELS
      ),
      needsReply: noul(NEEDS_REPLY),
      // Asked only with open cases: every email pays for every question.
      ...(input.cases.length > 0
        ? {
            openCase: choice(
              "Which of the recipient's open cases this is about",
              {
                [NO_RULE]: 'None',
                ...Object.fromEntries(
                  input.cases.map((open, index) => [
                    `case_${index}`,
                    open.title,
                  ])
                ),
              }
            ),
          }
        : {}),
      rule: choice(
        "Which of the recipient's rules this email clearly matches",
        {
          [NO_RULE]: 'No rule clearly matches',
          ...ruleCriteria,
        }
      ),
      startsCase: noul(STARTS_CASE),
    },
    state: `Recipient: ${input.userEmail}\n\n${input.prompt}`,
  })

  const { action } = answers
  const noiseOdds = [...NOISE_ACTIONS].reduce(
    (sum, kind) =>
      sum + (action.probabilities[kind as keyof typeof ACTION_CRITERIA] ?? 0),
    0
  )
  return {
    caseId:
      caseIds.get(
        (answers as { openCase?: { choice: string } }).openCase?.choice ??
          NO_RULE
      ) ?? null,
    category: answers.category.choice,
    importance: Math.min(
      3,
      Math.max(0, Math.round(answers.importance.score))
    ) as 0 | 1 | 2 | 3,
    needsReply: answers.needsReply.noul >= 0.5,
    ruleId: ruleIds.get(answers.rule.choice) ?? null,
    startsCase: answers.startsCase.noul >= CASE_SIGNAL,
    suggestedAction:
      NOISE_ACTIONS.has(action.choice) && noiseOdds < NOISE_CONFIDENCE
        ? 'none'
        : action.choice,
  }
}
