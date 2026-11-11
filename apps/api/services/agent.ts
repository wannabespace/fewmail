import { db } from '@fewmail/db'
import { actions, analyses, messages, rules } from '@fewmail/db/schema'
import {
  ACTION_KINDS,
  IMPORTANCE,
  MAIL_CATEGORIES,
} from '@fewmail/shared/agent'
import type { MailCategory, Persona } from '@fewmail/shared/agent'
import type { Messages } from '@fewmail/shared/i18n'
import { messages as dictionaries } from '@fewmail/shared/i18n'
import { englishName } from '@fewmail/shared/i18n/locales'
import type { Locale } from '@fewmail/shared/i18n/locales'
import { generateText, Output } from 'ai'
import { type } from 'arktype'
import { and, desc, eq, isNotNull } from 'drizzle-orm'

import { FAST_MODEL_ID, models } from '../lib/ai'
import { trashThread, unsubscribeOneClick } from '../lib/gmail'
import { JEV_MODEL_ID } from '../lib/jev'
import { BULK_THRESHOLD } from './bulk'
import { decideWithJev } from './classify'
import { applyAgentLabel } from './labels'
import type { EmailAllowance } from './plan'
import { getSettings } from './settings'
import { changeThreadLabels, mailboxOfThread } from './thread-labels'
import { recordUnsubscribe } from './zombies'

const BODY_LIMIT = 4000

type Message = typeof messages.$inferSelect
type Rule = typeof rules.$inferSelect

const analysisSchema = type({
  actionTitle: 'string',
  category: type.enumerated(...MAIL_CATEGORIES),
  extracted: {
    amount: 'string | null',
    dueDate: 'string | null',
    meetingTime: 'string | null',
  },
  importance: '0 | 1 | 2 | 3',
  needsReply: 'boolean',
  reason: 'string',
  ruleId: 'string | null',
  suggestedAction: type.enumerated(...ACTION_KINDS, 'none'),
  summary: 'string',
})

const analyzeInstructions = (input: {
  language: Locale
  persona: Persona
  rules: Rule[]
  userEmail: string
}) =>
  [
    `You are Fewmail, an email agent working for ${input.userEmail}. You read every incoming email so the user does not have to.`,
    input.persona === 'reader'
      ? 'The user mostly reads and wants calm: nothing important may slip, everything else stays quiet.'
      : 'The user replies a lot: anything a real person expects an answer to matters.',
    '',
    'Importance: 3 = urgent or time-critical (security, money due soon, a person blocked on the user); 2 = needs the user soon; 1 = worth knowing; 0 = noise.',
    'needsReply is true only when a real person (not an automated sender) is waiting for an answer from the user.',
    'suggestedAction: reply, pay (an amount is due), schedule (a meeting time is proposed), follow_up (the user should chase something), read (important to read, nothing to do), archive or mark_read (noise), unsubscribe (marketing the user never engages with), none.',
    `Write summary (one sentence), reason (why this importance, a few words) and actionTitle (a short imperative button label) in ${englishName(input.language)}.`,
    'extracted: an amount with currency, a due date and a proposed meeting time as written in the email, else null.',
    '',
    input.rules.length > 0
      ? `User rules. Set ruleId to the id of the first rule this email clearly matches, else null:\n${input.rules
          .map((rule) => `- ${rule.id}: ${rule.instruction}`)
          .join('\n')}`
      : 'The user has no rules: ruleId is null.',
  ].join('\n')

const messagePrompt = (message: Message) =>
  [
    `From: ${message.fromName ? `${message.fromName} <${message.fromEmail}>` : message.fromEmail}`,
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

export const writeReply = async (input: {
  instruction?: string
  message: Message
  previousDraft?: string
  userId: string
}) => {
  const settings = await getSettings(input.userId)
  const examples = await recentSentExamples(input.userId)

  const { text } = await generateText({
    instructions: [
      'You write email replies as the user, in their own voice. Output only the reply body: no subject, no quoted text, no placeholders.',
      'Reply in the language of the email you are answering.',
      'Be brief and concrete. Never invent facts, dates or commitments the user did not make; when a decision is needed, propose the most likely one in a way the user can easily change.',
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
      messagePrompt(input.message),
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

const NOISE_ACTIONS = new Set(['archive', 'mark_read', 'unsubscribe', 'trash'])

export const applyEffect = async (
  userId: string,
  message: Message,
  effect: string
) => {
  if (effect === 'unsubscribe') {
    await recordUnsubscribe(userId, message.fromEmail)
  }
  if (effect === 'unsubscribe' && message.listUnsubscribe) {
    await unsubscribeOneClick(
      message.listUnsubscribe,
      message.listUnsubscribePost
    )
  }
  if (effect === 'trash') {
    await trashThread(
      await mailboxOfThread(userId, message.threadId),
      message.threadId
    )
    return
  }
  await changeThreadLabels(userId, message.threadId, {
    remove: effect === 'mark_read' ? ['UNREAD'] : ['INBOX', 'UNREAD'],
  })
}

const ruleImportance = (rule: Rule | null, importance: number) =>
  rule?.effect === 'always_show' ? Math.max(importance, 2) : importance

const recordRuleAction = async (
  message: Message,
  rule: Rule & {
    effect: Exclude<Rule['effect'], 'always_show' | 'draft_reply'>
  },
  base: {
    messageId: string
    threadId: string
    title: string
    userId: string
  }
) => {
  const done = rule.autonomous
    ? await applyEffect(message.userId, message, rule.effect).then(
        () => true,
        () => false
      )
    : false
  const autonomousStatus = done ? 'auto_done' : 'failed'
  await db.insert(actions).values({
    ...base,
    autonomous: rule.autonomous,
    kind: rule.effect,
    reason: rule.instruction ?? '',
    resolvedAt: done ? new Date() : null,
    ruleId: rule.id,
    status: rule.autonomous ? autonomousStatus : 'pending',
  })
}

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

const NO_EXTRACTED = { amount: null, dueDate: null, meetingTime: null }

type Settings = NonNullable<Awaited<ReturnType<typeof getSettings>>>

/**
 * Jev decides for every plan; the LLM writes text only for the agent and only for mail that
 * matters, while the month's email allowance lasts. Without Jev the LLM does both, never for free.
 * `agent` says whether this email gets the agent at all — past the allowance it is treated as Free.
 */
const analyze = async (input: {
  allowance: EmailAllowance | null
  message: Message
  rules: Rule[]
  settings: Settings
  userEmail: string
}) => {
  const prompt = messagePrompt(input.message)
  const decisions = await decideWithJev({
    persona: input.settings.persona,
    prompt,
    rules: input.rules,
    userEmail: input.userEmail,
  }).catch((error) => {
    console.error('jev failed, falling back to the LLM', error)
    return null
  })

  if (!decisions) {
    if (!input.allowance?.(false)) {
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
    })
    return { agent: true, model: FAST_MODEL_ID, output }
  }

  const t = dictionaries[input.settings.language]
  const isNoise = decisions.importance === 0 && !decisions.needsReply
  const agent =
    !!input.allowance &&
    (isNoise || input.allowance(decisions.importance >= IMPORTANCE.critical))
  if (!agent || isNoise) {
    return {
      agent,
      model: JEV_MODEL_ID,
      output: {
        ...decisions,
        actionTitle:
          decisions.suggestedAction === 'none'
            ? t.actionKind.read
            : t.actionKind[decisions.suggestedAction],
        extracted: NO_EXTRACTED,
        reason: t.category[decisions.category],
        summary: input.message.snippet.slice(0, 240),
      },
    }
  }

  const { output: text } = await generateText({
    instructions: [
      `Write in ${englishName(input.settings.language)}: summary (one sentence, concrete names, amounts and dates), reason (why it matters, a few words) and actionTitle (a short imperative button label for: ${decisions.suggestedAction}).`,
      'extracted: an amount with currency, a due date and a proposed meeting time as written in the email, else null. Never invent anything.',
    ].join('\n'),
    model: models.fast,
    output: Output.object({ schema: textSchema }),
    prompt,
  })
  return {
    agent: true,
    model: `${JEV_MODEL_ID}+${FAST_MODEL_ID}`,
    output: { ...decisions, ...text },
  }
}

const isBulk = (message: Message) => (message.bulkCount ?? 0) >= BULK_THRESHOLD

const PERSONAL_CATEGORIES = new Set(['person', 'work'])

/** What the network knows beats what one email claims: mass mail is never personal, flagged mail is always urgent. */
const withNetworkFacts = <
  Output extends {
    category: MailCategory
    importance: 0 | 1 | 2 | 3
    needsReply: boolean
    reason: string
  },
>(
  output: Output,
  message: Message,
  t: Messages
): Output => {
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
  if (!isBulk(message)) {
    return output
  }
  return {
    ...output,
    category: PERSONAL_CATEGORIES.has(output.category)
      ? 'promotion'
      : output.category,
    importance: Math.min(output.importance, 1) as 0 | 1,
    needsReply: false,
    reason: t.bulk.reason(message.bulkCount ?? BULK_THRESHOLD),
  }
}

/** Today cards: a drafted reply for mail that wants one, otherwise the suggested next step for mail that matters. */
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
  }
) => {
  const wantsReply =
    rule?.effect === 'draft_reply' ||
    (output.needsReply && output.importance >= 1)

  if (wantsReply) {
    await db.insert(actions).values({
      ...base,
      autonomous: false,
      detail: await writeReply({ message, userId: message.userId }),
      kind: 'reply',
      reason: output.reason,
      ruleId: rule?.id ?? null,
      status: 'pending',
    })
    return
  }

  if (
    output.suggestedAction !== 'none' &&
    !NOISE_ACTIONS.has(output.suggestedAction) &&
    output.importance >= 2
  ) {
    await db.insert(actions).values({
      ...base,
      autonomous: false,
      kind: output.suggestedAction,
      reason: output.reason,
      ruleId: rule?.id ?? null,
      status: 'pending',
    })
  }
}

/** Without Today a free account cannot confirm a suggestion, so only rules that act on their own run. */
const isFreeRule = (rule: Rule) =>
  rule.autonomous &&
  rule.effect !== 'always_show' &&
  rule.effect !== 'draft_reply'

export const analyzeMessage = async (
  message: Message,
  userEmail: string,
  allowance: EmailAllowance | null
) => {
  const settings = await getSettings(message.userId)
  if (!settings) {
    return
  }
  const userRules = await db
    .select()
    .from(rules)
    .where(
      and(
        eq(rules.userId, message.userId),
        eq(rules.enabled, true),
        isNotNull(rules.instruction)
      )
    )

  const analysis = await analyze({
    allowance,
    message,
    rules: userRules,
    settings,
    userEmail,
  })
  if (!analysis) {
    return
  }
  const { agent, model } = analysis
  const output = withNetworkFacts(
    analysis.output,
    message,
    dictionaries[settings.language]
  )

  const matched = userRules.find(({ id }) => id === output.ruleId) ?? null
  const rule = matched && (agent || isFreeRule(matched)) ? matched : null

  await db
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
      summary: output.summary,
    })
    .onConflictDoNothing()

  await applyAgentLabel(message, output.category).catch((error) =>
    console.error('agent label failed', error)
  )

  const base = {
    messageId: message.id,
    threadId: message.threadId,
    title: output.actionTitle,
    userId: message.userId,
  }

  if (rule && rule.effect !== 'always_show' && rule.effect !== 'draft_reply') {
    await recordRuleAction(message, { ...rule, effect: rule.effect }, base)
    return
  }
  if (!agent) {
    return
  }

  await queueForAgent(message, output, rule, base)
}
