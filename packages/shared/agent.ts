export const MAIL_CATEGORIES = [
  'person',
  'work',
  'calendar',
  'finance',
  'receipt',
  'travel',
  'notification',
  'newsletter',
  'promotion',
  'security',
  'other',
] as const
export type MailCategory = (typeof MAIL_CATEGORIES)[number]

export const ACTION_KINDS = [
  'reply',
  'pay',
  'schedule',
  'follow_up',
  'read',
  'archive',
  'mark_read',
  'unsubscribe',
  'trash',
  'spam',
  'security',
  'commitment',
  'cleanup',
  'task',
] as const
export type ActionKind = (typeof ACTION_KINDS)[number]

export const ACTION_STATUSES = [
  'pending',
  'done',
  'dismissed',
  'auto_done',
  'failed',
] as const
export type ActionStatus = (typeof ACTION_STATUSES)[number]

export const RULE_EFFECTS = [
  'archive',
  'mark_read',
  'unsubscribe',
  'trash',
  'draft_reply',
  'always_show',
] as const
export type RuleEffect = (typeof RULE_EFFECTS)[number]

export const SIMPLE_MATCH_FIELDS = ['from', 'subject', 'mailingList'] as const
export type SimpleMatchField = (typeof SIMPLE_MATCH_FIELDS)[number]

/** Effects that change Gmail; a simple rule may only use these and always acts on its own. */
export const GMAIL_EFFECTS = [
  'archive',
  'mark_read',
  'unsubscribe',
  'trash',
] as const

export const PLANS = ['free', 'trial', 'pro', 'max'] as const
export type Plan = (typeof PLANS)[number]

export const PAID_PLANS = ['pro', 'max'] as const
export type PaidPlan = (typeof PAID_PLANS)[number]

export const BILLING_INTERVALS = ['month', 'year'] as const
export type BillingInterval = (typeof BILLING_INTERVALS)[number]

/** A year costs ten months; limits stay monthly either way. */
export const PRICE_USD: Record<PaidPlan, Record<BillingInterval, number>> = {
  max: { month: 30, year: 300 },
  pro: { month: 10, year: 100 },
}

/**
 * What the agent may do per calendar month (UTC); `null` is unlimited. `emails` counts only mail the
 * agent wrote for — noise Jev settles costs nothing. Every plan has every feature; only these differ.
 */
export const PLAN_LIMITS = {
  max: { boards: null, emails: 6000, messages: 500, tasks: null },
  pro: { boards: 3, emails: 1000, messages: 100, tasks: 5 },
  trial: { boards: 3, emails: 500, messages: 50, tasks: 5 },
} satisfies Record<
  Exclude<Plan, 'free'>,
  Record<'boards' | 'emails' | 'messages' | 'tasks', number | null>
>

/** Where a notification is delivered; mobile and desktop apps join as new kinds with their own sender in `services/notifications.ts`. */
export const DEVICE_KINDS = ['web'] as const
export type DeviceKind = (typeof DEVICE_KINDS)[number]

/** Reader: wants calm and nothing important lost. Responder: answers a lot and wants drafts first. */
export const PERSONAS = ['reader', 'responder'] as const
export type Persona = (typeof PERSONAS)[number]

export const IMPORTANCE = {
  critical: 3,
  high: 2,
  low: 0,
  normal: 1,
} as const

export const OUTBOX_MODES = ['reply', 'forward', 'new'] as const
export type OutboxMode = (typeof OUTBOX_MODES)[number]
export type OutboxStatus =
  | 'scheduled'
  | 'sending'
  | 'sent'
  | 'canceled'
  | 'failed'

/** Seconds a sent email waits in the outbox so Undo can still stop it. */
export const UNDO_SEND_SECONDS = 10

export type ReminderKind = 'snooze' | 'followup'
export type ReminderStatus = 'pending' | 'done' | 'canceled'

export const FOLLOWUP_DAYS = [1, 3, 7] as const

export type SpamVerdict = 'spam' | 'not_spam'

export type RiskKind =
  | 'known_phishing'
  | 'spoofed_sender'
  | 'lookalike_domain'
  | 'payment_change'
  | 'new_sender_payment'

export interface MessageRisk {
  /** The domain it imitates, for lookalikes. */
  imitates: string | null
  kind: RiskKind
}

export type TaskAutonomy = 'ask' | 'auto'
export type TaskStatus = 'active' | 'done' | 'canceled'

export const BOARD_CHART_TYPES = ['bar', 'line', 'area', 'pie'] as const
export type BoardChartType = (typeof BOARD_CHART_TYPES)[number]
export const BOARD_MEASURES = ['sum', 'count'] as const
export type BoardMeasure = (typeof BOARD_MEASURES)[number]
export const BOARD_GROUPINGS = ['month', 'week', 'group', 'status'] as const
export type BoardGrouping = (typeof BOARD_GROUPINGS)[number]

export interface BoardChart {
  groupBy: BoardGrouping
  id: string
  measure: BoardMeasure
  title: string
  type: BoardChartType
}

/** Mail older than this is never sent to the model and never becomes a Today card, so an upgrade or a board's history does not flood the queue. */
export const ANALYZE_WINDOW_DAYS = 3

/** Two calm deliveries a day; urgent mail never waits. */
export const BATCH_HOURS_AFTER_BRIEF = [0, 7] as const

export interface CleanupSender {
  count: number
  fromEmail: string
  fromName: string | null
  messageId: string
}

/** "Personal" mail that this many different Fewmail users got is a mass send, whatever it pretends. */
export const BULK_THRESHOLD = 5

/** Seeded from public feeds, never from users: popular sites to imitate, live phishing, spammer domains, throwaway mailboxes. */
export const DOMAIN_LISTS = [
  'popular',
  'phishing',
  'spam',
  'disposable',
] as const
export type DomainList = (typeof DOMAIN_LISTS)[number]

/** Gmail's SPF / DKIM / DMARC results for one message: pass, fail, softfail, none, … */
export interface MailAuth {
  dkim: string
  dmarc: string
  spf: string
}

/** Votes on what a spammer cannot cheaply change: the sending network and the domains it links to. */
export const PATTERN_KINDS = ['infra', 'link'] as const
export type PatternKind = (typeof PATTERN_KINDS)[number]

/** Weak signals add up: one makes mail "maybe spam", this many move it to spam. */
export const SUSPICION_SPAM = 2
