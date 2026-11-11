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
  'subscription',
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

export const PLANS = ['free', 'trial', 'pro'] as const
export type Plan = (typeof PLANS)[number]

export const PRO_PRICE_USD = 15

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

export type TransactionKind = 'subscription' | 'bill' | 'purchase'
export type BillingPeriod = 'month' | 'year' | 'week'

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
