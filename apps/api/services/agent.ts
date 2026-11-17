import { db } from '@fewmail/db'
import { actions, analyses, messages, rules, users } from '@fewmail/db/schema'
import {
  GMAIL_EFFECTS,
  IMPORTANCE,
  isAutomatedSender,
  isBulk,
  hostOf,
  isGmailEffect,
  LINK_PURPOSES,
  MAIL_CATEGORIES,
  PEOPLE_CATEGORIES,
} from '@fewmail/shared/agent'
import type {
  ActionKind,
  CardEvent,
  CardLink,
  GmailEffect,
  MailCategory,
} from '@fewmail/shared/agent'
import { emailLinks } from '@fewmail/shared/email'
import type { Messages } from '@fewmail/shared/i18n'
import { messages as dictionaries } from '@fewmail/shared/i18n'
import { englishName } from '@fewmail/shared/i18n/locales'
import type { Locale } from '@fewmail/shared/i18n/locales'
import { generateText, Output } from 'ai'
import { type } from 'arktype'
import { Result } from 'better-result'
import { addDays } from 'date-fns'
import {
  and,
  arrayContains,
  desc,
  eq,
  gt,
  inArray,
  isNotNull,
  lt,
  or,
} from 'drizzle-orm'

import {
  FAST_MODEL_ID,
  INFORMAL_ADDRESS,
  models,
  NEWSLETTER_SUMMARY,
  NO_EM_DASH,
  trackUsage,
} from '../lib/ai'
import { localStamp } from '../lib/clock'
import { JEV_MODEL_ID } from '../lib/jev'
import { logError } from '../lib/log'
import { oneTimeCode } from '../lib/one-time-code'
import { attachmentText, worthReading } from './attachments'
import { BULK_THRESHOLD } from './bulk'
import { hasMailboxCalendar } from './calendar'
import {
  ACTION_CRITERIA,
  CATEGORY_CRITERIA,
  decideWithJev,
  IMPORTANCE_LEVELS,
  NEEDS_REPLY,
  SUGGESTED_ACTIONS,
} from './classify'
import { recordCommitments } from './commitments'
import { applyAgentLabel } from './labels'
import { listMailboxes } from './mailboxes'
import type { EmailAllowance } from './plan'
import { getSettings } from './settings'
import { applyThreadEffect } from './thread-effects'

export const BODY_LIMIT = 4000
export const EARLIER_LIMIT = 4
export const EARLIER_BODY_LIMIT = 1000
export const SENT_EXAMPLES = 5
export const SENT_EXAMPLE_CHARS = 600

type Message = typeof messages.$inferSelect
type Rule = typeof rules.$inferSelect
type Settings = NonNullable<Awaited<ReturnType<typeof getSettings>>>

const laterSchema = type({
  later: {
    deadline: 'string | null',
    deadlineDate: 'string | null',
    promise: 'string | null',
    promiseAmount: 'string | null',
    promiseDue: 'string | null',
  },
})

const textSchema = laterSchema.merge({
  actionTitle: 'string',
  extracted: {
    amount: 'string | null',
    dueDate: 'string | null',
    meetingStart: 'string | null',
    meetingTime: 'string | null',
  },
  reason: 'string',
  summary: 'string',
})

const analysisSchema = textSchema.merge({
  category: type.enumerated(...MAIL_CATEGORIES),
  importance: '0 | 1 | 2 | 3',
  needsReply: 'boolean',
  ruleId: 'string | null',
  suggestedAction: type.enumerated(...SUGGESTED_ACTIONS),
})

const listed = (criteria: Record<string, string>) =>
  Object.entries(criteria)
    .map(([key, meaning]) => `${key} = ${meaning}`)
    .join('; ')

const labelExamples = (language: Locale) => {
  const { actionKind } = dictionaries[language]
  return `"${actionKind.reply}", "${actionKind.pay}", "${actionKind.schedule}"`
}

/** `meetingStart` is what a schedule card puts in the calendar, so it must be the time the email names; the web formats `amount` only in exactly this shape. */
const extractedInstruction = (timezone: string) =>
  `extracted: the amount the user pays or is paid (never a promotion's price or threshold) as a plain number and its ISO 4217 code ("1250.00 USD", "2499 UAH"), a due date as YYYY-MM-DD (only a date by which the user must act: pay, reply, sign, renew; never a date when terms, prices or a policy take effect or a sale ends), the first proposed meeting time as a short date and start time in the language of the email ("18 Nov, 18:00"), never a sentence, and that meeting's start as YYYY-MM-DDTHH:mm in the user's time zone (${timezone}), converted only when the email names another zone, else null. Never invent anything.`

/** What comes back to the user later as a card (`processDueCommitments`): a promise made to them, a last day nobody will remind them of. */
export const laterInstruction = (language: Locale) =>
  `later: promise: what the sender promises to do for the user later (send, refund, call back, deliver, fix), one short line in ${englishName(language)} naming who promised what ("Anna promised the signed contract"), never a promotion, a newsletter or a routine notice; promiseDue: its date as YYYY-MM-DD when the email gives or implies one, counted from the email's date, else null; promiseAmount: when the promise is money for the user (a refund, a payment, compensation), its amount as a plain number and its ISO 4217 code ("184.90 EUR"), else null. deadline: a last day the email implies without asking the user to act by it: the end of a return window for what was bought, the day a free trial turns into a paid plan, the end of a warranty; one short line in ${englishName(language)} with the date written as people write it ("Last day to return the headphones: 18 November"); deadlineDate: that date as YYYY-MM-DD. Each null when absent; never invent anything.`

/** A summary that reads as a to-do must never pass a fraudster's instructions on. */
const summaryStyle = (language: Locale) =>
  `Never open the summary with a date; write dates and amounts the way ${englishName(language)} writes them, never as YYYY-MM-DD. When the email is flagged as a risk or asks to pay to new or changed payment details, summary and reason warn that it may be fraud and never tell the user to pay or follow it.`

const flagged = (message: Message, prompt: string) =>
  message.risk
    ? `Flagged as a risk: ${message.risk.kind}.\n\n${prompt}`
    : prompt

export const analyzeInstructions = (input: {
  language: Locale
  rules: Pick<Rule, 'id' | 'instruction'>[]
  timezone: string
  userEmail: string
}) =>
  [
    `You are Fewmail, an email agent working for ${input.userEmail}. You read every incoming email so the user does not have to.`,
    'The user wants calm: nothing important may slip, anything a real person expects an answer to matters, everything else stays quiet.',
    '',
    `category: ${listed(CATEGORY_CRITERIA)}.`,
    `importance: ${listed(Object.fromEntries(IMPORTANCE_LEVELS.entries()))}.`,
    `needsReply is true only when: ${NEEDS_REPLY}.`,
    `suggestedAction: ${listed(ACTION_CRITERIA)}.`,
    `Write summary (one sentence), reason (why this importance, a few words) and actionTitle (a short label of what to do, phrased like ${labelExamples(input.language)}) in ${englishName(input.language)}.`,
    NEWSLETTER_SUMMARY,
    summaryStyle(input.language),
    INFORMAL_ADDRESS,
    NO_EM_DASH,
    extractedInstruction(input.timezone),
    laterInstruction(input.language),
    '',
    input.rules.length > 0
      ? `User rules. Set ruleId to the id of the first rule this email clearly matches, else null:\n${input.rules
          .map((rule) => `- ${rule.id}: ${rule.instruction}`)
          .join('\n')}`
      : 'The user has no rules: ruleId is null.',
  ].join('\n')

const senderOf = (message: Message) =>
  message.fromName
    ? `${message.fromName} <${message.fromEmail}>`
    : message.fromEmail

const messagePrompt = (message: Message, timezone: string) =>
  [
    `From: ${senderOf(message)}`,
    `To: ${message.to.join(', ')}`,
    message.cc.length > 0 ? `Cc: ${message.cc.join(', ')}` : null,
    `Date: ${localStamp(timezone, message.receivedAt)}`,
    `Subject: ${message.subject}`,
    message.listUnsubscribe
      ? 'Has List-Unsubscribe header (bulk sender).'
      : null,
    message.hasAttachments ? 'Has attachments.' : null,
    '',
    message.body.slice(0, BODY_LIMIT),
  ]
    .filter((line) => line !== null)
    .join('\n')

/** The email with what came before it in its thread, so a judgement or a reply knows the conversation. */
const threadPrompt = async (message: Message, timezone: string) => {
  const earlier = await db
    .select()
    .from(messages)
    .where(
      and(
        eq(messages.userId, message.userId),
        eq(messages.threadId, message.threadId),
        lt(messages.receivedAt, message.receivedAt)
      )
    )
    .orderBy(desc(messages.receivedAt))
    .limit(EARLIER_LIMIT)
  if (earlier.length === 0) {
    return messagePrompt(message, timezone)
  }
  return [
    'Earlier in this thread, oldest first:',
    ...earlier
      .toReversed()
      .map(
        (previous) =>
          `---\nFrom: ${previous.isFromMe ? 'the user' : senderOf(previous)}\nDate: ${localStamp(timezone, previous.receivedAt)}\n\n${previous.body.slice(0, EARLIER_BODY_LIMIT)}`
      ),
    '---',
    'The email to handle:',
    messagePrompt(message, timezone),
  ].join('\n')
}

export const recentSentExamples = async (
  userId: string,
  limit = SENT_EXAMPLES
) => {
  const sent = await db
    .select({ body: messages.body })
    .from(messages)
    .where(and(eq(messages.userId, userId), eq(messages.isFromMe, true)))
    .orderBy(desc(messages.receivedAt))
    .limit(limit)
  return sent.map(({ body }) => {
    const [quoted = ''] = body.split(/\n\s*On .+wrote:/u)
    return quoted.trim().slice(0, SENT_EXAMPLE_CHARS)
  })
}

interface ReplyInput {
  instruction?: string
  message: Message
  previousDraft?: string
  userId: string
}

const draftReply = async (
  input: ReplyInput & { settings: Settings | null; thread: string }
) => {
  const { settings } = input
  const [examples, [user], mailboxes] = await Promise.all([
    recentSentExamples(input.userId),
    db
      .select({ name: users.name })
      .from(users)
      .where(eq(users.id, input.userId)),
    listMailboxes(input.userId),
  ])

  const { text } = await generateText({
    instructions: [
      'You write email replies as the user, in their own voice. Output only the reply body: no subject, no quoted text, no placeholders.',
      'Reply in the language of the email you are answering.',
      `The user is ${mailboxes.map(({ email }) => email).join(', ')}. The email you answer is from ${input.message.fromEmail}, another person even when the names match: what it proposes or asks is theirs, and the user answers it.`,
      'Be brief and concrete. Never invent facts, dates or commitments the user did not make. When the email asks the user to choose between options and nothing here settles it, never pick one: acknowledge it and say their decision follows. Any other decision: propose the most likely one in a way the user can easily change.',
      NO_EM_DASH,
      user?.name
        ? `The user's name is ${user.name}. Sign with it written in the script of the reply's language (transliterated when needed), the same way every time, never with another name.`
        : null,
      settings?.voice ? `How the user writes: ${settings.voice}` : null,
      settings?.knowledge
        ? `Facts the user wants you to know. Use one only when the email is about it, never mention it otherwise, never contradict it:\n${settings.knowledge}`
        : null,
      examples.length > 0
        ? `Emails the user wrote recently, for tone and sign-off only:\n${examples.map((example) => `---\n${example}`).join('\n')}`
        : null,
    ]
      .filter(Boolean)
      .join('\n\n'),
    model: models.writer,
    prompt: [
      input.thread,
      input.previousDraft ? `\nCurrent draft:\n${input.previousDraft}` : null,
      input.instruction
        ? `\nUser instruction for the draft: ${input.instruction}`
        : null,
    ]
      .filter(Boolean)
      .join('\n'),
    telemetry: trackUsage(input.userId, 'draft'),
  })

  return text.trim()
}

export const writeReply = async (input: ReplyInput) => {
  const settings = await getSettings(input.userId)
  const thread = await threadPrompt(input.message, settings?.timezone ?? 'UTC')
  return draftReply({ ...input, settings, thread })
}

const NOISE_ACTIONS = new Set<string>(GMAIL_EFFECTS)

const ruleImportance = (rule: Rule | null, importance: number) =>
  rule?.effect === 'always_show' ? Math.max(importance, 2) : importance

type GmailRule = Rule & { effect: GmailEffect }

/** Without Home a free account cannot see a draft or a pinned email, so only rules that act on Gmail run. */
const actsOnGmail = (rule: Rule): rule is GmailRule =>
  isGmailEffect(rule.effect)

const recordRuleAction = async (
  message: Message,
  rule: GmailRule,
  base: {
    messageId: string
    threadId: string
    title: string
    userId: string
  }
) => {
  const done = await applyThreadEffect(
    message.userId,
    message,
    rule.effect
  ).then(
    () => true,
    () => false
  )
  await db.insert(actions).values({
    ...base,
    autonomous: true,
    kind: rule.effect,
    reason: rule.instruction ?? '',
    resolvedAt: done ? new Date() : null,
    ruleId: rule.id,
    status: done ? 'auto_done' : 'failed',
  })
}

const NO_EXTRACTED = {
  amount: null,
  dueDate: null,
  meetingStart: null,
  meetingTime: null,
}

/** The user wrote to this address or took part in this thread: whoever writes is no stranger, whatever the email says. */
const hasWrittenTo = async (message: Message) => {
  const [mine] = await db
    .select({ id: messages.id })
    .from(messages)
    .where(
      and(
        eq(messages.userId, message.userId),
        eq(messages.isFromMe, true),
        or(
          eq(messages.threadId, message.threadId),
          arrayContains(messages.to, [message.fromEmail]),
          arrayContains(messages.cc, [message.fromEmail])
        )
      )
    )
    .limit(1)
  return !!mine
}

/** What the network knows beats what one email claims: mass mail and no-reply senders are never personal, flagged mail is always urgent, a stranger's pitch waits in Tidy. */
const withNetworkFacts = <
  Output extends {
    category: MailCategory
    importance: 0 | 1 | 2 | 3
    isCold?: boolean
    needsReply: boolean
    suggestedAction: (typeof analysisSchema.infer)['suggestedAction']
  },
>(
  output: Output,
  message: Message,
  t: Messages
): Output & { reason?: string } => {
  if (message.risk) {
    return { ...output, importance: 3, needsReply: false, reason: t.risk.title }
  }
  if (message.suspicion) {
    return {
      ...output,
      importance: Math.min(output.importance, 1) as 0 | 1,
      needsReply: false,
      reason: t.spam.suspect,
    }
  }
  if (output.isCold) {
    return {
      ...output,
      category: 'promotion',
      importance: 0,
      needsReply: false,
      reason: t.cold.reason,
      suggestedAction: 'archive',
    }
  }
  if (!isBulk(message.bulkCount, output.category)) {
    return isAutomatedSender(message.fromEmail) &&
      PEOPLE_CATEGORIES.has(output.category)
      ? { ...output, category: 'notification', needsReply: false }
      : output
  }
  return {
    ...output,
    category: PEOPLE_CATEGORIES.has(output.category)
      ? 'promotion'
      : output.category,
    importance: Math.min(output.importance, 1) as 0 | 1,
    needsReply: false,
    reason: t.bulk.reason(message.bulkCount ?? BULK_THRESHOLD),
  }
}

/**
 * Past the allowance the agent writes no summary, but a promise or a last day is a row, not prose: written down
 * from the emails Jev says hold one (`keepsRows`), so the watch never sleeps mid-month.
 */
const extractLater = async (input: {
  message: Message
  prompt: string
  settings: Settings
}) => {
  const written = await Result.tryPromise(() =>
    generateText({
      instructions: [
        laterInstruction(input.settings.language),
        NO_EM_DASH,
      ].join('\n'),
      model: models.fast,
      output: Output.object({ schema: laterSchema }),
      prompt: flagged(input.message, input.prompt),
      telemetry: trackUsage(input.message.userId, 'promises'),
    })
  )
  if (written.isErr()) {
    logError('promise extraction failed', written.error.cause)
    return null
  }
  return written.value.output.later
}

/**
 * Jev decides for every plan; the LLM writes text only for the agent and only for mail that
 * matters, while the month's allowance lasts. When Jev fails the LLM does both, never for free.
 * `agent` says whether this email gets the agent at all — past the allowance it is treated as Free.
 * Network facts apply before the allowance: bulk mail must not pay for text, flagged mail needs the urgent reserve.
 */
const analyze = async (input: {
  allowance: EmailAllowance | null
  message: Message
  prompt: string
  rules: Rule[]
  settings: Settings
  userEmail: string
}) => {
  const { allowance, prompt } = input
  const t = dictionaries[input.settings.language]
  const decided = await decideWithJev({
    // Within the allowance the text call writes promises down; past it only this question picks the emails that need it.
    asksLater: !!allowance && !allowance.take(false),
    prompt,
    rules: input.rules,
    userEmail: input.userEmail,
  })
    .then(async (jev) => ({
      ...jev,
      isCold: jev.isCold && !(await hasWrittenTo(input.message)),
    }))
    .catch((error) => {
      logError('jev failed, falling back to the LLM', error)
      return null
    })

  if (!decided) {
    if (!allowance?.take(false)) {
      return null
    }
    const { output } = await generateText({
      instructions: analyzeInstructions({
        ...input.settings,
        rules: input.rules,
        userEmail: input.userEmail,
      }),
      model: models.fast,
      output: Output.object({ schema: analysisSchema }),
      prompt: flagged(input.message, prompt),
      telemetry: trackUsage(input.message.userId, 'analysis'),
    })
    return {
      agent: true,
      model: FAST_MODEL_ID,
      output: withNetworkFacts(output, input.message, t),
    }
  }

  const decisions = withNetworkFacts(decided, input.message, t)
  const rule = input.rules.find(({ id }) => id === decisions.ruleId)
  const isNoise =
    decisions.importance === 0 &&
    !decisions.needsReply &&
    (!rule || actsOnGmail(rule))
  const agent =
    !!allowance &&
    (isNoise || allowance.take(decisions.importance >= IMPORTANCE.critical))
  const jevOnly = (withAgent: boolean) => ({
    agent: withAgent,
    model: JEV_MODEL_ID,
    output: {
      ...decisions,
      actionTitle:
        decisions.suggestedAction === 'none'
          ? t.actionKind.read
          : t.actionKind[decisions.suggestedAction],
      extracted: NO_EXTRACTED,
      reason: decisions.reason ?? t.category[decisions.category],
      summary: input.message.snippet.slice(0, 240),
    },
  })
  if (allowance && !agent && !isNoise && decided.hasLater) {
    const later = await extractLater(input)
    const kept = jevOnly(false)
    return later ? { ...kept, output: { ...kept.output, later } } : kept
  }
  if (!agent || isNoise) {
    return jevOnly(agent)
  }

  const attached = worthReading(decisions)
    ? await attachmentText(input.message)
    : ''
  const written = await Result.tryPromise(() =>
    generateText({
      instructions: [
        `Write in ${englishName(input.settings.language)}: summary (one sentence, concrete names, amounts and dates), reason (why it matters, a few words) and actionTitle (a short label of what to do for: ${decisions.suggestedAction}, phrased like ${labelExamples(input.settings.language)}).`,
        ...(decisions.category === 'newsletter' ? [NEWSLETTER_SUMMARY] : []),
        summaryStyle(input.settings.language),
        extractedInstruction(input.settings.timezone),
        laterInstruction(input.settings.language),
        INFORMAL_ADDRESS,
        NO_EM_DASH,
      ].join('\n'),
      model: models.fast,
      output: Output.object({ schema: textSchema }),
      prompt: flagged(
        input.message,
        attached ? `${prompt}\n\n${attached}` : prompt
      ),
      telemetry: trackUsage(input.message.userId, 'analysis'),
    })
  )
  if (written.isErr()) {
    logError('analysis text failed, keeping Jev only', written.error.cause)
    return jevOnly(false)
  }
  const { output: text } = written.value
  return {
    agent: true,
    model: `${JEV_MODEL_ID}+${FAST_MODEL_ID}`,
    output: {
      ...decisions,
      ...text,
      reason: decisions.reason ?? text.reason,
    },
  }
}

/** Cards that answer one email of a thread; a newer email in it makes them stale. */
const PER_EMAIL_KINDS: ActionKind[] = [
  'reply',
  'pay',
  'schedule',
  'follow_up',
  'read',
]

/**
 * Leaves one card per conversation: pending cards of the thread's older emails go once a newer
 * email arrives. Only older ones — a first sync stores old sent mail after newer incoming mail.
 */
export const retireStaleActions = (
  userId: string,
  newer: Pick<Message, 'receivedAt' | 'threadId'>
) =>
  db
    .update(actions)
    .set({ resolvedAt: new Date(), status: 'dismissed' })
    .where(
      and(
        eq(actions.userId, userId),
        eq(actions.threadId, newer.threadId),
        eq(actions.status, 'pending'),
        inArray(actions.kind, PER_EMAIL_KINDS),
        inArray(
          actions.messageId,
          db
            .select({ id: messages.id })
            .from(messages)
            .where(
              and(
                eq(messages.userId, userId),
                eq(messages.threadId, newer.threadId),
                lt(messages.receivedAt, newer.receivedAt)
              )
            )
        )
      )
    )

export const LINK_LIMIT = 40
export const LINK_TEXT_CHARS = 80
export const LINK_INSTRUCTIONS =
  'Pick the one link of this email that does what it asks the user to do: pay a bill, sign a document, renew a subscription, confirm something, or read what it is about. Answer its number and what it does. index is null when no link does that; never a logo, a social profile, an unsubscribe, settings or help link.'

const linkSchema = type({
  index: 'number | null',
  purpose: type.enumerated(...LINK_PURPOSES),
})

/** The model only points at one of the email's own links by number, so it can never hand the user an address the email does not hold. */
const pickLink = async (
  message: Message,
  summary: string
): Promise<CardLink | null> => {
  const links = emailLinks(message)
    .filter(({ url }) => URL.canParse(url))
    .slice(0, LINK_LIMIT)
  if (message.risk || message.suspicion || links.length === 0) {
    return null
  }
  const picked = await Result.tryPromise(() =>
    generateText({
      instructions: LINK_INSTRUCTIONS,
      model: models.fast,
      output: Output.object({ schema: linkSchema }),
      prompt: [
        `Subject: ${message.subject}`,
        `About: ${summary}`,
        '',
        ...links.map(
          ({ text, url }, index) =>
            `${index}. ${text.slice(0, LINK_TEXT_CHARS) || '(no text)'} → ${hostOf(url)}`
        ),
      ].join('\n'),
      telemetry: trackUsage(message.userId, 'card_link'),
    })
  )
  if (picked.isErr()) {
    logError(
      'card link failed, the card keeps its yes only',
      picked.error.cause
    )
    return null
  }
  const { index, purpose } = picked.value.output
  const link = index === null ? undefined : links[index]
  return link ? { purpose, url: link.url } : null
}

/** What a card can do besides its yes: open the email's own link, or put its meeting in the calendar. */
const cardPayload = async (
  message: Message,
  kind: ActionKind,
  output: {
    actionTitle: string
    extracted: { meetingStart?: string | null }
    summary: string
  },
  context: { settings: Settings; writes: boolean }
): Promise<{ event: CardEvent } | { link: CardLink } | null> => {
  const start = output.extracted.meetingStart
  if (
    (kind === 'schedule' || kind === 'reply') &&
    start &&
    /^\d{4}-\d\d-\d\dT\d\d:\d\d$/u.test(start) &&
    (await hasMailboxCalendar(message.mailboxId))
  ) {
    return {
      event: {
        start,
        timeZone: context.settings.timezone,
        title: message.subject || output.actionTitle,
      },
    }
  }
  if (!context.writes || (kind !== 'pay' && kind !== 'read')) {
    return null
  }
  const link = await pickLink(message, output.summary)
  return link && { link }
}

/** "I'll get back to you" without a date still means within days. */
const THEIR_PROMISE_DAYS = 3
const ISO_DAY = /^\d{4}-\d{2}-\d{2}/u

const AMOUNT = /^(?<value>\d+(?:\.\d{1,2})?) (?<currency>[A-Z]{3})$/u

/** "184.90 EUR" → cents and currency; anything else is no amount, never a guess. */
const moneyOf = (amount: string | null) => {
  const groups = amount ? AMOUNT.exec(amount.trim())?.groups : undefined
  return groups?.value && groups.currency
    ? {
        amountCents: Math.round(Number(groups.value) * 100),
        currency: groups.currency,
      }
    : { amountCents: null, currency: null }
}

const dayOf = (date: string | null) =>
  date && ISO_DAY.test(date) && !Number.isNaN(Date.parse(date.slice(0, 10)))
    ? date.slice(0, 10)
    : null

/** A promise made to the user and a last day the email implies come back as cards when due (`processDueCommitments`). */
const rememberLater = async (
  message: Message,
  later: (typeof textSchema.infer)['later']
) => {
  if (message.risk || message.isFromMe) {
    return
  }
  const today = new Date().toISOString().slice(0, 10)
  const deadline = dayOf(later.deadlineDate)
  const rows = [
    ...(later.promise
      ? [
          {
            dueAt: new Date(
              dayOf(later.promiseDue) ??
                addDays(message.receivedAt, THEIR_PROMISE_DAYS)
                  .toISOString()
                  .slice(0, 10)
            ),
            kind: 'theirs' as const,
            ...moneyOf(later.promiseAmount),
            promise: later.promise,
            recipient: message.fromEmail,
          },
        ]
      : []),
    ...(later.deadline && deadline && deadline >= today
      ? [
          {
            dueAt: new Date(deadline),
            kind: 'deadline' as const,
            promise: later.deadline,
            recipient: null,
          },
        ]
      : []),
  ]
  await recordCommitments(
    rows.map((row) => ({
      ...row,
      messageId: message.id,
      threadId: message.threadId,
      userId: message.userId,
    }))
  )
}

/** Its newer email carries the conversation's card, even when this one's analysis finishes later. */
const hasNewerMail = async (message: Message) =>
  (await db.$count(
    messages,
    and(
      eq(messages.userId, message.userId),
      eq(messages.threadId, message.threadId),
      gt(messages.receivedAt, message.receivedAt)
    )
  )) > 0

/** Home cards: a drafted reply for mail that wants one, otherwise the suggested next step for mail that matters. */
const queueForAgent = async (
  message: Message,
  output: {
    actionTitle: string
    extracted: { meetingStart?: string | null }
    importance: number
    needsReply: boolean
    reason: string
    suggestedAction: (typeof analysisSchema.infer)['suggestedAction']
    summary: string
  },
  rule: Rule | null,
  base: {
    messageId: string
    threadId: string
    title: string
    userId: string
  },
  context: { settings: Settings; thread: string; writes: boolean }
) => {
  const wantsReply =
    rule?.effect === 'draft_reply' ||
    (output.needsReply && output.importance >= 1)

  const readTitle = dictionaries[context.settings.language].actionKind.read

  if (wantsReply) {
    const draft = context.writes
      ? await draftReply({ ...context, message, userId: message.userId }).catch(
          (error: unknown) => {
            logError('draft failed, queueing a read card instead', error)
            return null
          }
        )
      : null
    // A reply card always sends: without a draft it would send an empty email, so it asks to read instead.
    const kind = draft ? 'reply' : 'read'
    await db.insert(actions).values({
      ...base,
      autonomous: false,
      detail: draft,
      kind,
      payload: await cardPayload(message, kind, output, context),
      reason: output.reason,
      ruleId: rule?.id ?? null,
      status: 'pending',
      title: draft ? base.title : readTitle,
    })
    return
  }

  if (rule && actsOnGmail(rule)) {
    await db.insert(actions).values({
      ...base,
      autonomous: false,
      kind: rule.effect,
      reason: output.reason,
      ruleId: rule.id,
      status: 'pending',
      title: dictionaries[context.settings.language].rules.effect[rule.effect],
    })
    return
  }

  if (output.importance < IMPORTANCE.high) {
    return
  }
  const step =
    output.suggestedAction === 'none' ||
    NOISE_ACTIONS.has(output.suggestedAction)
      ? null
      : output.suggestedAction
  const kind = step ?? 'read'
  await db.insert(actions).values({
    ...base,
    autonomous: false,
    kind,
    payload: await cardPayload(message, kind, output, context),
    reason: output.reason,
    ruleId: rule?.id ?? null,
    status: 'pending',
    title: step ? base.title : readTitle,
  })
}

/** Mail from before sign-up read for Reading: Jev's category alone, kept only for a newsletter and never a card, a rule's action, a label or a Tidy suggestion. */
export const recordNewsletter = async (message: Message, userEmail: string) => {
  const settings = await getSettings(message.userId)
  if (!settings) {
    return
  }
  const analysis = await analyze({
    allowance: null,
    message,
    prompt: await threadPrompt(message, settings.timezone),
    rules: [],
    settings,
    userEmail,
  })
  if (analysis?.output.category !== 'newsletter') {
    return
  }
  const { model, output } = analysis
  await db
    .insert(analyses)
    .values({
      category: output.category,
      extracted: output.extracted,
      importance: output.importance,
      messageId: message.id,
      model,
      needsReply: output.needsReply,
      reason: output.reason,
      summary: output.summary,
    })
    .onConflictDoNothing()
}

export const analyzeMessage = async (
  message: Message,
  userEmail: string,
  allowance: EmailAllowance | null
) => {
  const [settings, userRules] = await Promise.all([
    getSettings(message.userId),
    db
      .select()
      .from(rules)
      .where(
        and(
          eq(rules.userId, message.userId),
          eq(rules.enabled, true),
          isNotNull(rules.instruction)
        )
      ),
  ])
  if (!settings) {
    return
  }
  const thread = await threadPrompt(message, settings.timezone)

  const analysis = await analyze({
    allowance,
    message,
    prompt: thread,
    rules: allowance ? userRules : userRules.filter(actsOnGmail),
    settings,
    userEmail,
  })
  if (!analysis) {
    return
  }
  const { agent, model, output } = analysis

  const matched = userRules.find(({ id }) => id === output.ruleId) ?? null
  const rule = matched && (allowance || actsOnGmail(matched)) ? matched : null
  const importance = ruleImportance(rule, output.importance)

  const [saved] = await db
    .insert(analyses)
    .values({
      category: output.category,
      extracted: output.extracted,
      importance,
      messageId: message.id,
      model,
      needsReply: output.needsReply,
      reason: output.reason,
      ruleId: rule?.id ?? null,
      suggestedAction:
        output.suggestedAction === 'none' ? null : output.suggestedAction,
      summary: output.summary,
    })
    .onConflictDoNothing()
    .returning({ messageId: analyses.messageId })
  if (!saved) {
    return
  }
  await retireStaleActions(message.userId, message)

  await applyAgentLabel(message, output.category).catch((error) =>
    logError('agent label failed', error)
  )
  if ('later' in output) {
    await rememberLater(message, output.later)
  }

  const base = {
    messageId: message.id,
    threadId: message.threadId,
    title: output.actionTitle,
    userId: message.userId,
  }

  // A rule never touches mail that needs the user: it waits on Home for a yes.
  if (rule && actsOnGmail(rule) && output.importance < IMPORTANCE.high) {
    await recordRuleAction(message, rule, {
      ...base,
      title: dictionaries[settings.language].rules.effect[rule.effect],
    })
    return
  }
  // On Free or past the allowance the agent writes nothing, but the email still gets its card. Risky mail already has its security card.
  if (
    message.risk ||
    oneTimeCode(message.subject, message.body) ||
    (await hasNewerMail(message))
  ) {
    return
  }

  await queueForAgent(message, { ...output, importance }, rule, base, {
    settings,
    thread,
    writes: agent,
  })
}
