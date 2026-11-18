import type { rules } from '@fewmail/db/schema'
import { PEOPLE_CATEGORIES } from '@fewmail/shared/agent'
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
  'Urgent: security, money overdue or due within two days, a service about to be suspended or shut down, or a person blocked on the user',
]

export const NEEDS_REPLY =
  'A real person, not an automated sender, is waiting for an answer from the recipient'

/** Only half of the test: `analyze` also checks that the recipient never wrote to the sender, which the email cannot fake. */
export const COLD_OUTREACH =
  'A stranger writes unprompted to sell, pitch a product or service, ask for a call or demo, propose a partnership, recruit, or offer an introduction, including a nudge to their own unanswered pitch, even under Re:; never a customer, user or reader asking something, never an answer to something the recipient asked for'

/** Asked only past the allowance: these emails get the small call that writes a promise or a last day down (`extractLater`). */
export const HAS_LATER =
  'The sender promises to do something for the recipient later (send, refund, call back, deliver, fix), or the email implies a last day: a return window, a free trial turning paid, a warranty end'

const NO_RULE = 'none'
const LATER_SIGNAL = 0.7
const COLD_SIGNAL = 0.7

/** Below these odds for noise as a whole (archive, mark read and unsubscribe together) Jev is guessing, and a guess would put mail that matters into Tidy. */
const NOISE_CONFIDENCE = 0.7
const NOISE_ACTIONS: ReadonlySet<string> = new Set([
  'archive',
  'mark_read',
  'unsubscribe',
])

/** Every decision about an email in one Jev call. */
export const decideWithJev = async (input: {
  asksLater: boolean
  prompt: string
  rules: Rule[]
  userEmail: string
}) => {
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
      cold: noul(COLD_OUTREACH),
      importance: score(
        'How soon the recipient needs to see this; they want calm, but nothing important may slip and anything a real person waits on matters',
        IMPORTANCE_LEVELS
      ),
      ...(input.asksLater && { hasLater: noul(HAS_LATER) }),
      needsReply: noul(NEEDS_REPLY),
      rule: choice(
        "Which of the recipient's rules this email clearly matches",
        {
          [NO_RULE]: 'No rule clearly matches',
          ...ruleCriteria,
        }
      ),
    },
    state: `Recipient: ${input.userEmail}\n\n${input.prompt}`,
  })

  const { action } = answers
  const noiseOdds = [...NOISE_ACTIONS].reduce(
    (sum, kind) =>
      sum + (action.probabilities[kind as keyof typeof ACTION_CRITERIA] ?? 0),
    0
  )
  const [impersonalCategory] = (
    Object.entries(answers.category.probabilities) as [MailCategory, number][]
  )
    .filter(([category]) => !PEOPLE_CATEGORIES.has(category))
    .toSorted(([, a], [, b]) => b - a)
    .map(([category]) => category)
  return {
    category: answers.category.choice,
    hasLater:
      'hasLater' in answers &&
      (answers.hasLater as { noul: number }).noul >= LATER_SIGNAL,
    isCold: answers.cold.noul >= COLD_SIGNAL,
    importance: Math.min(
      3,
      Math.max(0, Math.round(answers.importance.score))
    ) as 0 | 1 | 2 | 3,
    impersonalCategory,
    needsReply: answers.needsReply.noul >= 0.5,
    ruleId: ruleIds.get(answers.rule.choice) ?? null,
    suggestedAction:
      NOISE_ACTIONS.has(action.choice) && noiseOdds < NOISE_CONFIDENCE
        ? 'none'
        : action.choice,
  }
}
