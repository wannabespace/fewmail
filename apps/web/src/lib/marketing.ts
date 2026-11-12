import { PRICE_USD } from '@fewmail/shared/agent'

export const TRIAL_DAYS = 14

export const PLANS = [
  { id: 'free', price: { month: 0, year: 0 } },
  { id: 'pro', includes: 'free', price: PRICE_USD.pro },
  { id: 'max', includes: 'pro', price: PRICE_USD.max },
] as const

export const COMPARISON_GROUPS = {
  day: ['brief', 'importance', 'rules', 'snooze', 'followUps', 'calendar'],
  agent: ['drafts', 'summaries', 'ask', 'handOver', 'memory', 'mcp'],
  safety: ['unsubscribe', 'spamShield', 'phishing'],
  reach: ['gmail', 'outlook', 'otherProviders', 'keepApp', 'phone', 'teams'],
} as const

export type ComparisonFeature =
  (typeof COMPARISON_GROUPS)[keyof typeof COMPARISON_GROUPS][number]

export const FEWMAIL_LACKS: readonly ComparisonFeature[] = [
  'outlook',
  'otherProviders',
  'teams',
]

/**
 * Their side (`site.comparisons` in the messages) is only what the product publicly offers, checked in
 * `COMPARISONS_CHECKED_AT`. Prices are USD a month (the plan note says per seat or billed yearly); `null` is quoted by sales.
 */
export const COMPARISONS = [
  {
    lacks: [
      'brief',
      'handOver',
      'memory',
      'spamShield',
      'phishing',
      'otherProviders',
      'keepApp',
    ],
    name: 'Superhuman',
    plans: [
      { id: 'starter', name: 'Starter', price: 30 },
      { id: 'business', name: 'Business', price: 40 },
      { id: 'enterprise', name: 'Enterprise', price: null },
    ],
    slug: 'superhuman',
  },
  {
    lacks: [
      'brief',
      'handOver',
      'spamShield',
      'phishing',
      'outlook',
      'keepApp',
    ],
    name: 'Shortwave',
    plans: [
      { id: 'free', name: 'Free', price: 0 },
      { id: 'pro', name: 'Pro', price: 18 },
      { id: 'business', name: 'Business', price: 30 },
      { id: 'premier', name: 'Premier', price: 45 },
      { id: 'max', name: 'Max', price: 120 },
    ],
    slug: 'shortwave',
  },
  {
    lacks: [
      'rules',
      'calendar',
      'ask',
      'handOver',
      'memory',
      'mcp',
      'spamShield',
      'phishing',
      'teams',
    ],
    name: 'SaneBox',
    plans: [
      { id: 'snack', name: 'Snack', price: 4.54 },
      { id: 'lunch', name: 'Lunch', price: 7.46 },
      { id: 'dinner', name: 'Dinner', price: 22.04 },
    ],
    slug: 'sanebox',
  },
] as const satisfies {
  lacks: readonly ComparisonFeature[]
  name: string
  plans: readonly { id: string; name: string; price: number | null }[]
  slug: string
}[]

export const COMPARISONS_CHECKED_AT = new Date(2026, 10)
