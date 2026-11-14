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

export const PEOPLE_CATEGORIES: ReadonlySet<MailCategory> = new Set([
  'person',
  'work',
])
export const LIST_CATEGORIES: ReadonlySet<MailCategory> = new Set([
  'newsletter',
  'promotion',
])

const AUTOMATED_ADDRESS =
  /(?:^|[._+-])(?:no-?reply|do-?not-?reply|notifications?|notify|alerts?|alerting|billing|payments?|receipts?|invoices?|orders?|newsletters?|marketing|updates?|mailer-daemon|mailer|bounces?|postmaster|automated|security)(?:[._+-]|$)/iu

/** Addresses no person writes from (`cloudplatform-noreply@`, `notifications@`): their mail is never People, whatever the email reads like. */
export const isAutomatedSender = (email: string) =>
  AUTOMATED_ADDRESS.test(email.split('@')[0] ?? '')

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
] as const
export type ActionKind = (typeof ACTION_KINDS)[number]

interface ActionKindTraits {
  /** What approving does to the thread in Gmail; `null` leaves it as it is. */
  gmail: GmailEffect | null
  /** Approving sends the draft. */
  sends: boolean
}

const quiet = (gmail: GmailEffect | null): ActionKindTraits => ({
  gmail,
  sends: false,
})

export const ACTION_KIND_TRAITS: Record<ActionKind, ActionKindTraits> = {
  archive: quiet('archive'),
  cleanup: quiet(null),
  commitment: quiet(null),
  follow_up: quiet('mark_read'),
  mark_read: quiet('mark_read'),
  pay: quiet('mark_read'),
  read: quiet('mark_read'),
  reply: { ...quiet(null), sends: true },
  schedule: quiet('mark_read'),
  security: quiet(null),
  spam: quiet(null),
  trash: quiet('trash'),
  unsubscribe: quiet('unsubscribe'),
}

export const sendsDraft = (action: { kind: ActionKind }) =>
  ACTION_KIND_TRAITS[action.kind].sends

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
export type GmailEffect = (typeof GMAIL_EFFECTS)[number]

/** What Home's Tidy offers to do with quiet mail no rule covers. */
export const TIDY_KINDS = ['archive', 'mark_read', 'unsubscribe'] as const

export const isGmailEffect = (effect: RuleEffect): effect is GmailEffect =>
  (GMAIL_EFFECTS as readonly RuleEffect[]).includes(effect)

export const PLANS = ['free', 'trial', 'lite', 'pro', 'max'] as const
export type Plan = (typeof PLANS)[number]

/** Cheapest first: Settings offers only the plans above the current one. */
export const PAID_PLANS = ['lite', 'pro', 'max'] as const
export type PaidPlan = (typeof PAID_PLANS)[number]

export const isPaidPlan = (plan: Plan): plan is PaidPlan =>
  (PAID_PLANS as readonly Plan[]).includes(plan)

export const BILLING_INTERVALS = ['month', 'year'] as const
export type BillingInterval = (typeof BILLING_INTERVALS)[number]

export const TRIAL_DAYS = 14

/** A year costs ten months; limits stay monthly either way. */
export const PRICE_USD: Record<PaidPlan, Record<BillingInterval, number>> = {
  lite: { month: 5, year: 50 },
  max: { month: 30, year: 300 },
  pro: { month: 10, year: 100 },
}

/**
 * What the agent may cost per calendar month (UTC), in USD of AI: everything it does (writing for an email, a
 * message, a summary, a board entry, reading aloud) is paid from it at its real price, so a feature left unused
 * costs nothing. Sized so a yearly plan keeps 20% after Stripe, the allowance and Jev (`economics.test.ts`).
 * Noise Jev settles costs nothing. Every plan has every feature; only this differs.
 */
export const PLAN_ALLOWANCE_USD = {
  lite: 2.6,
  max: 18.5,
  pro: 5.8,
  trial: 2.6,
} satisfies Record<Exclude<Plan, 'free'>, number>

/** What one email the agent writes for and one message to it cost on typical use, to tell an allowance in both. */
export const TYPICAL_COST_USD = { email: 0.0044, message: 0.045 }

type AgentPlan = keyof typeof PLAN_ALLOWANCE_USD

/** An allowance told in round numbers: about this many emails, or this many messages, at typical use. */
export const allowanceIn = (plan: AgentPlan) => ({
  emails:
    Math.round(PLAN_ALLOWANCE_USD[plan] / TYPICAL_COST_USD.email / 10) * 10,
  messages:
    Math.round(PLAN_ALLOWANCE_USD[plan] / TYPICAL_COST_USD.message / 10) * 10,
})

/** How much of the month's allowance is spent, 0 to 100. */
export const usedPercent = (plan: AgentPlan, spent: number) =>
  Math.min(100, Math.floor((spent / PLAN_ALLOWANCE_USD[plan]) * 100))

/** Where a notification is delivered; mobile and desktop apps join as new kinds with their own sender in `services/notifications.ts`. */
export const DEVICE_KINDS = ['web'] as const
export type DeviceKind = (typeof DEVICE_KINDS)[number]

/** Built-in agent skills, run as `/name` in the chat, as Telegram commands and as MCP prompts; labels come from `skills`. Names stay Telegram-safe: `[a-z0-9_]`. */
export const SKILLS = [
  'today',
  'waiting',
  'followups',
  'bills',
  'week',
  'cleanup',
  'reading',
  'cancel',
] as const
export type Skill = (typeof SKILLS)[number]

/** "/bills netflix" → `{ skill: 'bills', details: 'netflix' }`; anything else → undefined. */
export const parseSkill = (text: string) => {
  const groups = /^\/(?<name>[a-z_]+)(?:\s+(?<details>[\s\S]*))?$/u.exec(
    text.trim()
  )?.groups
  const skill = SKILLS.find((name) => name === groups?.name)
  return skill ? { details: groups?.details?.trim() ?? '', skill } : undefined
}

/** The email open beside the agent chat when the user wrote, sent as a `data-thread` part of their message. */
export interface OpenThread {
  from: string
  messageId: string
  subject: string
  threadId: string
}

/**
 * Every tool of `apps/api/services/agent-tools.ts` with its access. `consent` changes Gmail, sends or lets the agent act alone:
 * the chat asks first and its card must show every input (`ConsentToolName`), MCP marks it destructive.
 */
export const AGENT_TOOLS = {
  add_board_chart: 'write',
  add_to_board: 'write',
  approve_action: 'consent',
  archive_thread: 'consent',
  clear_out: 'consent',
  create_board: 'write',
  create_draft: 'write',
  create_event: 'consent',
  create_rule: 'consent',
  create_schedule: 'consent',
  delete_board: 'consent',
  delete_event: 'consent',
  delete_schedule: 'consent',
  dismiss_action: 'write',
  draft_reply: 'write',
  edit_board_entry: 'write',
  get_board: 'read',
  get_person: 'read',
  get_reading: 'read',
  get_today: 'read',
  get_wrapped: 'read',
  list_boards: 'read',
  list_events: 'read',
  list_handled: 'read',
  list_mail: 'read',
  list_rules: 'read',
  list_schedules: 'read',
  list_subscriptions: 'read',
  mark_not_spam: 'consent',
  move_to_inbox: 'consent',
  preview_clear_out: 'read',
  read_thread: 'read',
  redraft_action: 'write',
  refresh: 'write',
  remove_board_entry: 'write',
  rename_board_group: 'write',
  report_spam: 'consent',
  send_email: 'consent',
  snooze_thread: 'consent',
  tidy_mail: 'consent',
  trash_thread: 'consent',
  undo_clear_out: 'consent',
  unsubscribe: 'consent',
  update_board: 'write',
  update_event: 'consent',
} as const satisfies Record<string, 'read' | 'write' | 'consent'>
export type AgentToolName = keyof typeof AGENT_TOOLS
export type ConsentToolName = {
  [Name in AgentToolName]: (typeof AGENT_TOOLS)[Name] extends 'consent'
    ? Name
    : never
}[AgentToolName]

/** Clear-out groups in the order the dialog lists them; `old` is the one left off by default. */
export const CLEAR_OUT_GROUPS = [
  'promotions',
  'notifications',
  'lists',
  'old',
] as const
export type ClearOutGroup = (typeof CLEAR_OUT_GROUPS)[number]

export const WRAPPED_PERIODS = ['year', 'month'] as const
export type WrappedPeriod = (typeof WRAPPED_PERIODS)[number]

/** What a shared Wrapped link carries: counts only, never a name, address or subject. */
export interface WrappedStats {
  /** ISO weekday 1–7 and hour 0–23 in the user's time zone; null with no mail yet. */
  busiestHour: number | null
  busiestWeekday: number | null
  emails: number
  fromLists: number
  fromPeople: number
  handled: number
  replies: number
  savedMinutes: number
  spam: number
  unsubscribed: number
}

/** Ready-made boards offered at onboarding; names and descriptions come from `boards.starter`. */
export const BOARD_PRESETS = [
  'money',
  'subscriptions',
  'trips',
  'orders',
  'events',
  'invoices',
  'jobs',
  'health',
  'home',
  'learning',
] as const
export type BoardPreset = (typeof BOARD_PRESETS)[number]

/** How far back a board collects, in days: its history read stops there and older entries leave it. */
export const BOARD_PERIODS = [1, 7, 30, 90, 180, 365] as const

export type BoardPeriod = (typeof BOARD_PERIODS)[number]

export const DEFAULT_BOARD_PERIOD: BoardPeriod = 90

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

/** What "time saved" counts: a glance and a click per email the agent handled, writing one reply per draft that went out. */
export const SECONDS_SAVED = { handled: 15, reply: 180 } as const

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

export const BOARD_CHART_TYPES = ['bar', 'line', 'area', 'pie'] as const
export type BoardChartType = (typeof BOARD_CHART_TYPES)[number]
export const BOARD_MEASURES = ['sum', 'count'] as const
export type BoardMeasure = (typeof BOARD_MEASURES)[number]
export const BOARD_GROUPINGS = ['month', 'week', 'group', 'status'] as const
export type BoardGrouping = (typeof BOARD_GROUPINGS)[number]

export interface BoardChart {
  currency?: string
  groupBy: BoardGrouping
  id: string
  measure: BoardMeasure
  title: string
  type: BoardChartType
}

/** Mail older than this is never sent to the model and never becomes a Home card, so an upgrade or a board's history does not flood the queue. */
export const ANALYZE_WINDOW_DAYS = 3

export interface CleanupSender {
  count: number
  fromEmail: string
  fromName: string | null
  /** Absent on cards offered before lists were told apart by List-Id. */
  listId?: string | null
  messageId: string
}

/** RFC 2919: the label in angle brackets names the list, the phrase before it titles it. */
export const listLabelOf = (listId: string) =>
  (/<(?<label>[^>]+)>/u.exec(listId)?.groups?.label ?? listId)
    .trim()
    .toLowerCase()

export const listTitleOf = (listId: string) =>
  listId.split('<')[0]?.trim().replaceAll('"', '') ?? ''

/**
 * Only a List-Id with a title in words is a list of its own (a GitHub repository, a Mailman list). A bare one, or one
 * titled with an address, is often an email service's id per campaign, which would split one newsletter into a list per send.
 */
export const titledListId = (header: string | undefined) => {
  const listId = header?.trim()
  const title = listId ? listTitleOf(listId) : ''
  return listId && /\p{L}/u.test(title) && !title.includes('@') ? listId : null
}

/** A mailing list's mail as Subscriptions and the cleanup card count it: what it sent in the last 30 days. */
export const listSearch = ({
  fromEmail,
  listId,
}: {
  fromEmail: string
  listId?: string | null
}) =>
  `${listId ? `list:${listLabelOf(listId)}` : `from:${fromEmail}`} newer_than:30d`

/** "Personal" mail that this many different Fewmail users got is a mass send, whatever it pretends. */
export const BULK_THRESHOLD = 5

/** Every customer of a service gets the same 2FA notice or receipt by design: that is not a mass send. */
const SYSTEM_CATEGORIES: ReadonlySet<MailCategory> = new Set([
  'calendar',
  'finance',
  'notification',
  'receipt',
  'security',
  'travel',
])

export const isBulk = (bulkCount: number | null, category?: MailCategory) =>
  (bulkCount ?? 0) >= BULK_THRESHOLD &&
  !(category && SYSTEM_CATEGORIES.has(category))

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
