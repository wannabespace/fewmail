import { db } from '@fewmail/db'
import { actions, analyses, messages, rules, users } from '@fewmail/db/schema'
import {
  GMAIL_EFFECTS,
  IMPORTANCE,
  isAutomatedSender,
  isBulk,
  isGmailEffect,
  MAIL_CATEGORIES,
  PEOPLE_CATEGORIES,
} from '@fewmail/shared/agent'
import type {
  ActionKind,
  GmailEffect,
  MailCategory,
} from '@fewmail/shared/agent'
import type { Messages } from '@fewmail/shared/i18n'
import { messages as dictionaries } from '@fewmail/shared/i18n'
import { englishName } from '@fewmail/shared/i18n/locales'
import type { Locale } from '@fewmail/shared/i18n/locales'
import { generateText, Output } from 'ai'
import { type } from 'arktype'
import { Result } from 'better-result'
import { and, desc, eq, gt, inArray, isNotNull, lt } from 'drizzle-orm'

import { FAST_MODEL_ID, INFORMAL_ADDRESS, models, NO_EM_DASH } from '../lib/ai'
import { JEV_MODEL_ID } from '../lib/jev'
import { logError } from '../lib/log'
import { oneTimeCode } from '../lib/one-time-code'
import { attachmentText } from './attachments'
import { BULK_THRESHOLD } from './bulk'
import {
  ACTION_CRITERIA,
  CATEGORY_CRITERIA,
  decideWithJev,
  IMPORTANCE_LEVELS,
  NEEDS_REPLY,
  SUGGESTED_ACTIONS,
} from './classify'
import { applyAgentLabel } from './labels'
import type { EmailAllowance } from './plan'
import { getSettings } from './settings'
import { applyThreadEffect } from './thread-effects'

const BODY_LIMIT = 4000
const EARLIER_LIMIT = 4
const EARLIER_BODY_LIMIT = 1000

type Message = typeof messages.$inferSelect
type Rule = typeof rules.$inferSelect
type Settings = NonNullable<Awaited<ReturnType<typeof getSettings>>>

const textSchema = type({
  actionTitle: 'string',
  extracted: {
    amount: 'string | null',
    dueDate: 'string | null',
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

const analyzeInstructions = (input: {
  language: Locale
  rules: Rule[]
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
    INFORMAL_ADDRESS,
    NO_EM_DASH,
    'extracted: an amount with currency, a due date (only a date by which the user must act: pay, reply, sign, renew; never a date when terms, prices or a policy take effect) and a proposed meeting time as written in the email, else null.',
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

const messagePrompt = (message: Message) =>
  [
    `From: ${senderOf(message)}`,
    `To: ${message.to.join(', ')}`,
    message.cc.length > 0 ? `Cc: ${message.cc.join(', ')}` : null,
    `Date: ${message.receivedAt.toISOString()}`,
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
const threadPrompt = async (message: Message) => {
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
    return messagePrompt(message)
  }
  return [
    'Earlier in this thread, oldest first:',
    ...earlier
      .toReversed()
      .map(
        (previous) =>
          `---\nFrom: ${previous.isFromMe ? 'the user' : senderOf(previous)}\nDate: ${previous.receivedAt.toISOString()}\n\n${previous.body.slice(0, EARLIER_BODY_LIMIT)}`
      ),
    '---',
    'The email to handle:',
    messagePrompt(message),
  ].join('\n')
}

const recentSentExamples = async (userId: string) => {
  const sent = await db
    .select({ body: messages.body })
    .from(messages)
    .where(and(eq(messages.userId, userId), eq(messages.isFromMe, true)))
    .orderBy(desc(messages.receivedAt))
    .limit(5)
  return sent.map(({ body }) => {
    const [quoted = ''] = body.split(/\n\s*On .+wrote:/u)
    return quoted.trim().slice(0, 600)
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
  const [examples, [user]] = await Promise.all([
    recentSentExamples(input.userId),
    db
      .select({ name: users.name })
      .from(users)
      .where(eq(users.id, input.userId)),
  ])

  const { text } = await generateText({
    instructions: [
      'You write email replies as the user, in their own voice. Output only the reply body: no subject, no quoted text, no placeholders.',
      'Reply in the language of the email you are answering.',
      'Be brief and concrete. Never invent facts, dates or commitments the user did not make; when a decision is needed, propose the most likely one in a way the user can easily change.',
      NO_EM_DASH,
      user?.name
        ? `The user's name is ${user.name}; sign with it unless their own emails sign differently, never with another name.`
        : null,
      settings?.voice ? `How the user writes: ${settings.voice}` : null,
      settings?.knowledge
        ? `Facts the user wants you to know and use when relevant (never contradict them):\n${settings.knowledge}`
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
  })

  return text.trim()
}

export const writeReply = async (input: ReplyInput) => {
  const [settings, thread] = await Promise.all([
    getSettings(input.userId),
    threadPrompt(input.message),
  ])
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

const NO_EXTRACTED = { amount: null, dueDate: null, meetingTime: null }

/** What the network knows beats what one email claims: mass mail and no-reply senders are never personal, flagged mail is always urgent. */
const withNetworkFacts = <
  Output extends {
    category: MailCategory
    importance: 0 | 1 | 2 | 3
    needsReply: boolean
  },
>(
  output: Output,
  message: Message,
  t: Messages
): Output & { reason?: string } => {
  if (message.risk) {
    return { ...output, importance: 3 }
  }
  if (message.suspicion) {
    return {
      ...output,
      importance: Math.min(output.importance, 1) as 0 | 1,
      needsReply: false,
      reason: t.spam.suspect,
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
 * Jev decides for every plan; the LLM writes text only for the agent and only for mail that
 * matters, while the month's email allowance lasts. Without Jev the LLM does both, never for free.
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
    prompt,
    rules: input.rules,
    userEmail: input.userEmail,
  }).catch((error) => {
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
      prompt,
    }).catch((error: unknown) => {
      allowance.refund()
      throw error
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
  if (!agent || isNoise) {
    return jevOnly(agent)
  }

  const attached = await attachmentText(input.message)
  const written = await Result.tryPromise(() =>
    generateText({
      instructions: [
        `Write in ${englishName(input.settings.language)}: summary (one sentence, concrete names, amounts and dates), reason (why it matters, a few words) and actionTitle (a short label of what to do for: ${decisions.suggestedAction}, phrased like ${labelExamples(input.settings.language)}).`,
        'extracted: an amount with currency, a due date (only a date by which the user must act: pay, reply, sign, renew; never a date when terms, prices or a policy take effect) and a proposed meeting time as written in the email, else null. Never invent anything.',
        INFORMAL_ADDRESS,
        NO_EM_DASH,
      ].join('\n'),
      model: models.fast,
      output: Output.object({ schema: textSchema }),
      prompt: attached ? `${prompt}\n\n${attached}` : prompt,
    })
  )
  if (written.isErr()) {
    allowance?.refund()
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
    importance: number
    needsReply: boolean
    reason: string
    suggestedAction: (typeof analysisSchema.infer)['suggestedAction']
  },
  rule: Rule | null,
  base: {
    messageId: string
    threadId: string
    title: string
    userId: string
  },
  context: { settings: Settings; thread: string }
) => {
  const wantsReply =
    rule?.effect === 'draft_reply' ||
    (output.needsReply && output.importance >= 1)

  if (wantsReply) {
    await db.insert(actions).values({
      ...base,
      autonomous: false,
      detail: await draftReply({
        ...context,
        message,
        userId: message.userId,
      }),
      kind: 'reply',
      reason: output.reason,
      ruleId: rule?.id ?? null,
      status: 'pending',
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
  await db.insert(actions).values({
    ...base,
    autonomous: false,
    kind: step ?? 'read',
    reason: output.reason,
    ruleId: rule?.id ?? null,
    status: 'pending',
    title: step
      ? base.title
      : dictionaries[context.settings.language].actionKind.read,
  })
}

export const analyzeMessage = async (
  message: Message,
  userEmail: string,
  allowance: EmailAllowance | null
) => {
  const [settings, userRules, thread] = await Promise.all([
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
    threadPrompt(message),
  ])
  if (!settings) {
    return
  }

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
  const rule = matched && (agent || actsOnGmail(matched)) ? matched : null

  const [saved] = await db
    .insert(analyses)
    .values({
      category: output.category,
      extracted: output.extracted,
      importance: ruleImportance(rule, output.importance),
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

  const base = {
    messageId: message.id,
    threadId: message.threadId,
    title: output.actionTitle,
    userId: message.userId,
  }

  // A rule never touches mail that needs the user: it waits on Home for a yes (on Free it stays in the inbox).
  if (rule && actsOnGmail(rule) && output.importance < IMPORTANCE.high) {
    await recordRuleAction(message, rule, {
      ...base,
      title: dictionaries[settings.language].rules.effect[rule.effect],
    })
    return
  }
  if (
    !agent ||
    oneTimeCode(message.subject, message.body) ||
    (await hasNewerMail(message))
  ) {
    return
  }

  await queueForAgent(message, output, rule, base, { settings, thread })
}
