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

/** Gmail's Promotions, or a list's unsubscribe header outside Forums (a group a colleague writes to): whoever signs it, nobody wrote it to the user. Mirrored in SQL by `isMassMail` in `services/mail.ts`. */
export const isMassMail = (message: {
  labelIds: string[]
  listUnsubscribe: string | null
}) =>
  message.labelIds.includes('CATEGORY_PROMOTIONS') ||
  (!!message.listUnsubscribe && !message.labelIds.includes('CATEGORY_FORUMS'))

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
  'heads_up',
  'cleanup',
  'consent',
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
  consent: quiet(null),
  commitment: quiet(null),
  follow_up: quiet('mark_read'),
  mark_read: quiet('mark_read'),
  heads_up: quiet(null),
  pay: quiet('mark_read'),
  read: quiet('mark_read'),
  reply: { ...quiet(null), sends: true },
  schedule: quiet('mark_read'),
  security: quiet('mark_read'),
  spam: quiet(null),
  trash: quiet('trash'),
  unsubscribe: quiet('unsubscribe'),
}

export const sendsDraft = (action: { kind: ActionKind }) =>
  ACTION_KIND_TRAITS[action.kind].sends

export const LINK_PURPOSES = [
  'pay',
  'sign',
  'renew',
  'confirm',
  'read',
] as const
export type LinkPurpose = (typeof LINK_PURPOSES)[number]

/** A link from the email itself that does what the card asks; Fewmail only opens it. */
export interface CardLink {
  purpose: LinkPurpose
  url: string
}

/** `start` is the wall time `yyyy-MM-ddTHH:mm` in `timeZone`, as the email named it. */
export interface CardEvent {
  start: string
  timeZone: string
  title: string
}

interface CardPayload {
  /** A `consent` card: what the server read for it, so the card shows exactly what the yes does. */
  context?: unknown[]
  event?: CardEvent
  input?: Record<string, unknown>
  link?: CardLink
  tool?: ConsentToolName
}

export const cardPayload = (action: {
  payload: Record<string, unknown> | null
}) => (action.payload ?? {}) as CardPayload

export const hostOf = (url: string) =>
  new URL(url).hostname.replace(/^www\./u, '')

export const ACTION_STATUSES = [
  'pending',
  'done',
  'dismissed',
  'auto_done',
  'failed',
] as const
export type ActionStatus = (typeof ACTION_STATUSES)[number]

export const BOT_EFFECTS = [
  'archive',
  'mark_read',
  'unsubscribe',
  'trash',
  'draft_reply',
  'always_show',
  'collect',
  'tidy',
] as const
export type MailBotEffect = (typeof BOT_EFFECTS)[number]
/** The Board's: it takes no mail; while the user has it, the agent writes down promises and last days. Never one a mail bot can pick. */
export const BOARD_EFFECT = 'promises'
export type BotEffect = MailBotEffect | typeof BOARD_EFFECT

/** What New bot offers and the first sign-in seeds, named in the user's language (`starterBots`); the Board at most once. */
export const BOT_PRESETS = [
  { effect: BOARD_EFFECT, key: 'board' },
  { effect: 'tidy', key: 'quick' },
  { effect: 'collect', key: 'later' },
  { effect: 'always_show', key: 'important' },
] as const
export type BotPreset = (typeof BOT_PRESETS)[number]['key']

export const SIMPLE_MATCH_FIELDS = ['from', 'subject', 'mailingList'] as const
export type SimpleMatchField = (typeof SIMPLE_MATCH_FIELDS)[number]

/** Effects that change Gmail; a simple bot may only use these and always acts on its own. */
export const GMAIL_EFFECTS = [
  'archive',
  'mark_read',
  'unsubscribe',
  'trash',
] as const
export type GmailEffect = (typeof GMAIL_EFFECTS)[number]

/** Cards that only move mail around: the agent proposes them on its own, so Home asks for them together as one decision. */
export const PROPOSAL_KINDS = [
  'archive',
  'mark_read',
  'unsubscribe',
  'spam',
  'trash',
] as const
export type ProposalKind = (typeof PROPOSAL_KINDS)[number]

/** What Home's Tidy offers to do with quiet mail no bot covers. */
export const TIDY_KINDS = ['archive', 'mark_read', 'unsubscribe'] as const

/** Which occurrences of a recurring event a change reaches. */
export const EVENT_SCOPES = ['this', 'following', 'all'] as const
export type EventScope = (typeof EVENT_SCOPES)[number]

export const isGmailEffect = (effect: BotEffect): effect is GmailEffect =>
  (GMAIL_EFFECTS as readonly BotEffect[]).includes(effect)

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
 * message, a summary, reading aloud) is paid from it at its real price, so a feature left unused
 * costs nothing. Sized so a yearly plan keeps 20% (Max: 25% monthly) after Stripe, the allowance and Jev (`economics.test.ts`).
 * Noise Jev settles costs nothing. Every plan has every feature; only this differs.
 */
export const PLAN_ALLOWANCE_USD = {
  lite: 2.5,
  max: 20.4,
  pro: 5.69,
  trial: 2.5,
} satisfies Record<Exclude<Plan, 'free'>, number>

/** What one email the agent writes for and one message to it cost on typical use, to tell an allowance in both. */
export const TYPICAL_COST_USD = { email: 0.0044, message: 0.044 }

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
export const DEVICE_KINDS = ['web', 'desktop'] as const
export type DeviceKind = (typeof DEVICE_KINDS)[number]

/** Where a notification can go, in the order a failed one falls back along. `web` is every device the user has. */
export const DELIVERY_CHANNELS = ['telegram', 'whatsapp', 'web'] as const
export type DeliveryChannel = (typeof DELIVERY_CHANNELS)[number]
/** `failed` waits for its next attempt; `dead` gave up; `skipped`: the card it was about was answered first. */
export type DeliveryStatus =
  | 'pending'
  | 'sending'
  | 'failed'
  | 'sent'
  | 'dead'
  | 'skipped'
/** A notification's own text: `title` is the push's title and a messenger's headline. */
export interface DeliveryNotice {
  body: string
  title: string
  url: string
}

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

/**
 * Every tool of `apps/api/services/agent-tools.ts` with its access. `consent` changes Gmail, sends, settles a card in the user's place or lets the agent act alone:
 * it never runs on the agent's or an MCP client's word: it waits as a `consent` card on Home (`proposeConsent`), whose details must show every input (`ConsentToolName`), and the yes runs it.
 */
export const AGENT_TOOLS = {
  approve_action: 'consent',
  archive_thread: 'consent',
  clear_out: 'consent',
  create_draft: 'write',
  create_event: 'consent',
  create_bot: 'consent',
  delete_event: 'consent',
  dismiss_action: 'consent',
  draft_reply: 'write',
  find_people: 'read',
  get_bot_chat: 'read',
  get_person: 'read',
  get_reading: 'read',
  get_today: 'read',
  get_wrapped: 'read',
  list_events: 'read',
  list_handled: 'read',
  list_mail: 'read',
  list_promises: 'read',
  list_bots: 'read',
  list_subscriptions: 'read',
  mark_not_spam: 'consent',
  move_to_inbox: 'consent',
  preview_clear_out: 'read',
  read_thread: 'read',
  redraft_action: 'write',
  refresh: 'write',
  remind_later: 'write',
  report_spam: 'consent',
  send_email: 'consent',
  set_promise_status: 'write',
  snooze_thread: 'consent',
  tidy_mail: 'consent',
  trash_thread: 'consent',
  undo_clear_out: 'consent',
  unsubscribe: 'consent',
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

export const IMPORTANCE = {
  critical: 3,
  high: 2,
  low: 0,
  normal: 1,
} as const

/** Cards that only ask to read or notice something: Home leaves them for Later unless the email is urgent. */
export const LATER_KINDS = ['read', 'heads_up'] as const

/** What Home lists first and counts (`countImportant` counts the same in SQL): a card that asks for a step, urgent mail, or a person waiting for an answer the agent could not draft. */
export const isImportant = (
  kind: ActionKind,
  analysis: { importance: number; needsReply: boolean } | null | undefined
) =>
  !(PROPOSAL_KINDS as readonly string[]).includes(kind) &&
  (!(LATER_KINDS as readonly string[]).includes(kind) ||
    !!analysis?.needsReply ||
    (analysis?.importance ?? 0) >= IMPORTANCE.critical)

/** Whose chat a card is in: the bot that made it, else the bot its email matched, else Fewmail's. */
export const botOfCard = (card: {
  action: { botId: string | null }
  analysis: { botId: string | null } | null
}) => card.action.botId ?? card.analysis?.botId ?? 'fewmail'

/** `message` / `answer`: the chat; `nudge`: what the bot said it would come back with (`remind_later`); `no_plan` / `spent`: why it could not answer; `digest`: the bot's report of the day. */
export const BOT_POST_KINDS = [
  'message',
  'answer',
  'nudge',
  'no_plan',
  'spent',
  'digest',
] as const
export type BotPostKind = (typeof BOT_POST_KINDS)[number]

/** What Fewmail's digest counted when it was written: the headline and its sentence, kept as they were that morning. */
export interface DigestCounts {
  days: number
  decisions: number
  handled: number
  people: number
  total: number
}

/** One on a message, from the other side of the chat: the user's on the bot's words, the bot's on the user's (`react`, a whole reply for a fraction of its tokens). */
export const BOT_REACTIONS = ['👍', '👀', '❤️', '🔥', '😂', '🙏'] as const

/** A folder of bots in the sidebar: its name is the user's, so it is stored encrypted with the list. */
export interface BotFolder {
  bots: string[]
  id: string
  name: string
}

export const BOT_FOLDER_NAME_CHARS = 40
export const BOT_FOLDERS_MAX = 20
export type BotReaction = (typeof BOT_REACTIONS)[number]

/** What a reply reads back of its bot's chat: the last messages, up to this much text. Raising either raises what every message costs. */
export const BOT_HISTORY = { chars: 12_000, messages: 12 } as const

/** Most a message to a bot may say. */
export const BOT_MESSAGE_CHARS = 4000
/** How much of the message a reply quotes goes to the bot with it. Raising it raises what a reply costs. */
export const BOT_REPLY_QUOTE_CHARS = 500

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

/** `mine`: a promise in the user's sent mail; `theirs`: one made to the user in mail they got; `deadline`: a last day an email implies (a return window, a trial turning paid). */
export const COMMITMENT_KINDS = ['mine', 'theirs', 'deadline'] as const
export type CommitmentKind = (typeof COMMITMENT_KINDS)[number]

/**
 * A reply only acknowledges a promise; it is fulfilled when an email proves it (`evidenceMessageId`) or the user says
 * so. The agent moves a promise forward along this order only; `broken` and a reopening are the user's word.
 */
export const COMMITMENT_STATUSES = [
  'open',
  'acknowledged',
  'in_progress',
  'fulfilled',
  'broken',
  'cancelled',
] as const
export type CommitmentStatus = (typeof COMMITMENT_STATUSES)[number]
/** Still waiting on someone: these surface on their morning and are checked against new mail. */
export const ACTIVE_COMMITMENT_STATUSES = [
  'open',
  'acknowledged',
  'in_progress',
] as const satisfies CommitmentStatus[]
/** Who moved a promise: `agent` from an email (the evidence), `user` by hand or by a card's yes. */
export type CommitmentActor = 'agent' | 'user'
export type ReminderStatus = 'pending' | 'done' | 'canceled'

export const FOLLOWUP_DAYS = [1, 3, 7] as const

export type SpamVerdict = 'spam' | 'not_spam'

export type RiskKind =
  | 'known_phishing'
  | 'credential_phishing'
  | 'spoofed_sender'
  | 'lookalike_domain'
  | 'payment_change'
  | 'new_sender_payment'
  | 'prompt_injection'

export interface MessageRisk {
  /** The domain it imitates, for lookalikes. */
  imitates: string | null
  kind: RiskKind
}

/** Mail older than this is never sent to the model and never becomes a Home card, so an upgrade does not flood the queue. */
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

/** A mailing list's mail as Subscriptions and the cleanup card count it: what it sent in the last 30 days, trashed and spam included, since Gmail's search leaves those out by default. */
export const listSearch = ({
  fromEmail,
  listId,
}: {
  fromEmail: string
  listId?: string | null
}) =>
  `${listId ? `list:${listLabelOf(listId)}` : `from:${fromEmail}`} newer_than:30d in:anywhere`

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

/** What one listen speaks at most; the API cuts the rest. Raising it raises what every listen costs. */
export const SPEECH_CHARS = 2500

/** Reading's summary as it is spoken: the intro, then each topic's title and sentences. */
export const readingSpeech = (summary: {
  intro: string
  sections: { sentences: { text: string }[]; title: string }[]
}) =>
  [
    summary.intro,
    ...summary.sections.flatMap(({ sentences, title }) => [
      title,
      ...sentences.map(({ text }) => text),
    ]),
  ].join('\n')
