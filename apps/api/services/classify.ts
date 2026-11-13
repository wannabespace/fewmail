import type { rules } from '@fewmail/db/schema'
import type { ActionKind, MailCategory } from '@fewmail/shared/agent'
import { choice, noul, score } from '@typesafe-ai/sdk'

import { jev } from '../lib/jev'

type Rule = typeof rules.$inferSelect

export const CATEGORY_CRITERIA = {
  calendar: 'Meeting invitations, scheduling, calendar updates',
  finance: 'Bills, invoices, failed or due payments, bank and money matters',
  newsletter: 'Newsletters, digests, blog posts the user subscribed to',
  notification:
    'Automated mail from apps, tools and services: alerts, account and billing notices, status updates',
  other: 'Anything else',
  person:
    'A real person writing personally to the user, never a company or an automated service',
  promotion: 'Marketing, sales offers, discounts, cold outreach',
  receipt: 'Receipts, order confirmations, shipping updates',
  security:
    'Sign-in alerts, password resets, verification codes, security warnings',
  travel: 'Flights, hotels, bookings, itineraries',
  work: 'A colleague, client or partner writing about work in their own words, never a tool or service the user works with',
} satisfies Record<MailCategory, string>

export const ACTION_CRITERIA = {
  archive: 'Noise that can be archived unread',
  follow_up: 'The user should chase someone about something',
  mark_read: 'Noise worth keeping but not reading',
  none: 'Nothing to do',
  pay: 'An amount is due and the user should pay it',
  read: 'Important to read, nothing else to do',
  reply: 'Someone expects the user to answer',
  schedule: 'A meeting time is proposed or requested',
  unsubscribe: 'Marketing the user never engages with',
} satisfies Partial<Record<ActionKind | 'none', string>>

/** Jev and the LLM fallback offer the same actions; anything wider would let an email steer itself into a card kind that is pushed as urgent (security). */
export const SUGGESTED_ACTIONS = Object.keys(ACTION_CRITERIA) as [
  keyof typeof ACTION_CRITERIA,
  ...(keyof typeof ACTION_CRITERIA)[],
]

export const IMPORTANCE_LEVELS = [
  'Noise: nobody needs to see it',
  'Worth knowing, no rush',
  'Needs the user soon: something failed or broke, a deadline, a decision to make',
  'Urgent: security, money due very soon, or a person blocked on the user',
]

export const NEEDS_REPLY =
  'A real person, not an automated sender, is waiting for an answer from the recipient'

const NO_RULE = 'none'

/** Every decision about an email in one Jev call; null when Jev is not configured, so the LLM path decides. */
export const decideWithJev = async (input: {
  prompt: string
  rules: Rule[]
  userEmail: string
}) => {
  if (!jev) {
    return null
  }
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

  return {
    category: answers.category.choice,
    importance: Math.min(
      3,
      Math.max(0, Math.round(answers.importance.score))
    ) as 0 | 1 | 2 | 3,
    needsReply: answers.needsReply.noul >= 0.5,
    ruleId: ruleIds.get(answers.rule.choice) ?? null,
    suggestedAction: answers.action.choice,
  }
}
