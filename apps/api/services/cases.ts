import { db } from '@fewmail/db'
import {
  actions,
  caseItems,
  caseMail,
  cases,
  messages,
} from '@fewmail/db/schema'
import { CASE_ITEM_STATES } from '@fewmail/shared/agent'
import type { CaseFile, CaseSource } from '@fewmail/shared/agent'
import { messages as dictionaries } from '@fewmail/shared/i18n'
import { englishName } from '@fewmail/shared/i18n/locales'
import { openrouter } from '@openrouter/ai-sdk-provider'
import { generateText, Output } from 'ai'
import { type } from 'arktype'
import { startOfDay, subDays } from 'date-fns'
import {
  and,
  arrayContains,
  asc,
  desc,
  eq,
  inArray,
  gte,
  isNotNull,
  isNull,
} from 'drizzle-orm'

import {
  FAST_FALLBACK_ID,
  INFORMAL_ADDRESS,
  models,
  NO_EM_DASH,
  trackUsage,
  UNTRUSTED_MAIL,
} from '../lib/ai'
import { localStamp } from '../lib/clock'
import { ACTION_TOPICS, announceChange } from '../lib/live'
import { logErrorAs } from '../lib/log'
import { capture } from '../lib/posthog'
import { writeReply } from './agent'
import { startsCase } from './classify'
import { NotFoundError } from './mail-errors'
import { charge, hasBudget, requireBudget } from './plan'
import { getSettings } from './settings'

type Case = typeof cases.$inferSelect
type Message = typeof messages.$inferSelect

export const CASE_BODY_CHARS = 6000
/** The searches a case runs once it is accepted; each one is paid on top of the model. */
export const CASE_SEARCHES = 2
export const WEB_RESULTS = 2
/** OpenRouter's web plugin (Exa) is billed per result outside the model's tokens: measured as its reported cost less the model's. */
export const WEB_SEARCH_USD = 0.0024 * WEB_RESULTS
/** The newest files of the user's mail the agent may point at as a proof or attach to a reply. */
export const CASE_FILES_SHOWN = 30
const FILES_SCANNED = 400
const TOPICS = ['cases', ...ACTION_TOPICS] as const

const proposalSchema = type({
  dueDate: 'string | null',
  goal: 'string',
  isCase: 'boolean',
  items: type({ isTheirs: 'boolean', text: 'string' }).array(),
  searches: 'string[]',
  title: 'string',
})

const revisionSchema = type({
  done: 'boolean',
  items: type({
    file: 'number | null',
    isTheirs: 'boolean',
    proof: 'string | null',
    source: 'number | null',
    state: type.enumerated(...CASE_ITEM_STATES),
    text: 'string',
  }).array(),
  next: 'string',
  reply: type({ files: 'number[]', instruction: 'string' }).or('null'),
})

const emailPrompt = (message: Message, timezone: string) =>
  `From: ${message.fromName ?? ''} <${message.fromEmail}>\nDate: ${localStamp(timezone, message.receivedAt)}\nSubject: ${message.subject}\n\n${message.body.slice(0, CASE_BODY_CHARS)}`

const dayOf = (date: string | null) =>
  date && /^\d{4}-\d{2}-\d{2}/u.test(date) && !Number.isNaN(Date.parse(date))
    ? new Date(date.slice(0, 10))
    : null

const ownCase = async (userId: string, caseId: string) => {
  const [found] = await db
    .select()
    .from(cases)
    .where(and(eq(cases.id, caseId), eq(cases.userId, userId)))
  if (!found) {
    throw new NotFoundError('Case not found')
  }
  return found
}

/** Only general questions leave for the web: the model writes them from the case, and an address or a long number in one drops it. */
const isGeneral = (query: string) =>
  !/@|\d{5,}/u.test(query) && query.trim().length > 0

/**
 * An email that starts something of several steps becomes a proposed case, once per thread; the user's yes makes it
 * active (`acceptCase`). Jev asked first (`STARTS_CASE`), so only likely cases pay for this call.
 */
const proposeCase = async (message: Message) => {
  const { userId } = message
  const known = await db.$count(
    cases,
    and(
      eq(cases.userId, userId),
      arrayContains(cases.threadIds, [message.threadId])
    )
  )
  if (known > 0 || !(await hasBudget(userId))) {
    return false
  }
  const settings = await getSettings(userId)
  const language = settings?.language ?? 'en'
  const { output } = await generateText({
    instructions: [
      'This email may start something the user must get done in several steps: a company to register, a visa, a flat to rent, an insurance claim, an enrolment.',
      'isCase: true only when the user must do at least two things in different places or wait on others, usually by a deadline; false for a single reply, a bill to pay, a meeting to put in the calendar or anything automated.',
      `Write in ${englishName(language)}: title (a few words naming what gets done, "Company registration"), goal (one or two sentences: what done looks like, who is involved, the deadline) and items (each thing needed as a short line; isTheirs when someone else owes it, like a statement the lawyer sends after).`,
      "dueDate: the deadline as YYYY-MM-DD counted from the email's date, else null.",
      `searches: up to ${CASE_SEARCHES} general web questions whose answers fill what the email leaves out (requirements, how long a step takes, the official rules), in the language official sources of that country use; never a name, address, number or any other detail of this email or person.`,
      INFORMAL_ADDRESS,
      NO_EM_DASH,
      UNTRUSTED_MAIL,
    ].join('\n'),
    model: models.fast,
    output: Output.object({ schema: proposalSchema }),
    prompt: emailPrompt(message, settings?.timezone ?? 'UTC'),
    telemetry: trackUsage(userId, 'case'),
  })
  const dueAt = dayOf(output.dueDate)
  if (
    !output.isCase ||
    output.items.length < 2 ||
    (dueAt && dueAt < startOfDay(new Date()))
  ) {
    return false
  }
  const [created] = await db
    .insert(cases)
    .values({
      dueAt,
      goal: output.goal,
      messageId: message.id,
      searches: output.searches.filter(isGeneral).slice(0, CASE_SEARCHES),
      status: 'proposed',
      threadIds: [message.threadId],
      title: output.title,
      userId,
    })
    .returning({ id: cases.id })
  if (!created) {
    return false
  }
  await db.insert(caseItems).values(
    output.items.map((item, position) => ({
      caseId: created.id,
      isTheirs: item.isTheirs,
      position,
      state: item.isTheirs ? ('waiting' as const) : ('needed' as const),
      text: item.text,
    }))
  )
  await db
    .insert(caseMail)
    .values({ caseId: created.id, messageId: message.id })
  await announceChange(userId, TOPICS)
  return true
}

/** One general question answered from the web with its pages; nothing of the user goes out but the question. */
const searchWeb = async (userId: string, query: string) => {
  const result = await generateText({
    model: openrouter(FAST_FALLBACK_ID, {
      plugins: [{ engine: 'exa', id: 'web', max_results: WEB_RESULTS }],
      // Thinking tripled the tokens of a few-sentence answer and added nothing to it.
      reasoning: { effort: 'minimal' },
    }),
    prompt: `${query}\n\nAnswer in two to four sentences with the concrete requirements, steps, durations and fees the sources give.`,
    telemetry: trackUsage(userId, 'case'),
  })
  await charge(userId, WEB_SEARCH_USD)
  return {
    text: result.text,
    url: result.sources.find((source) => source.sourceType === 'url')?.url,
  }
}

/** The newest files of the user's mail, sent ones first: the documents a case asks for were usually sent before. */
const candidateFiles = async (userId: string) => {
  const rows = await db
    .select({
      attachments: messages.attachments,
      fromEmail: messages.fromEmail,
      id: messages.id,
      isFromMe: messages.isFromMe,
      receivedAt: messages.receivedAt,
      subject: messages.subject,
    })
    .from(messages)
    .where(and(eq(messages.userId, userId), isNotNull(messages.attachments)))
    .orderBy(desc(messages.isFromMe), desc(messages.receivedAt))
    .limit(FILES_SCANNED)
  return rows
    .flatMap((row) =>
      (row.attachments ?? [])
        .filter(({ contentId }) => !contentId)
        .map((file): CaseFile & { about: string } => ({
          about: `${row.isFromMe ? 'sent' : `from ${row.fromEmail}`} ${row.receivedAt.toISOString().slice(0, 10)}, "${row.subject}"`,
          filename: file.filename,
          messageId: row.id,
          mimeType: file.mimeType,
          partId: file.partId,
          size: file.size,
        }))
    )
    .slice(0, CASE_FILES_SHOWN)
}

/** A case's own reply takes the place of any card already waiting on that email, so one email never has two drafts. */
const queueReply = async (
  found: Case,
  replyTo: Message,
  reply: { files: CaseFile[]; instruction: string }
) => {
  const detail = await writeReply({
    instruction: reply.instruction,
    message: replyTo,
    userId: found.userId,
  })
  const settings = await getSettings(found.userId)
  const t = dictionaries[settings?.language ?? 'en']
  await db
    .update(actions)
    .set({ resolvedAt: new Date(), status: 'dismissed' })
    .where(
      and(
        eq(actions.messageId, replyTo.id),
        eq(actions.status, 'pending'),
        inArray(actions.kind, ['reply', 'read'])
      )
    )
  await db.insert(actions).values({
    autonomous: false,
    detail,
    kind: 'reply',
    messageId: replyTo.id,
    payload: { caseId: found.id, files: reply.files },
    reason: found.title,
    status: 'pending',
    threadId: replyTo.threadId,
    title: t.cases.reply,
    userId: found.userId,
  })
}

/**
 * Brings a case up to date: on its yes with the web looked up, and after each email that belongs to it. One fast call
 * rewrites the items (a file found in the mail is a proof, a page is a hint and never makes an item done), what to do
 * now and, when an email asks for it, the reply to write, which waits on Home as a card like any draft.
 */
const reviseCase = async (
  found: Case,
  { message, research }: { message?: Message; research?: boolean }
) => {
  const { userId } = found
  const [items, settings, files, origin] = await Promise.all([
    db
      .select()
      .from(caseItems)
      .where(eq(caseItems.caseId, found.id))
      .orderBy(asc(caseItems.position)),
    getSettings(userId),
    candidateFiles(userId),
    found.messageId
      ? db.select().from(messages).where(eq(messages.id, found.messageId))
      : [],
  ])
  const findings = research
    ? await Promise.all(
        (found.searches ?? []).map((query) => searchWeb(userId, query))
      )
    : []
  const email = message ?? origin[0]
  const timezone = settings?.timezone ?? 'UTC'
  const { output } = await generateText({
    instructions: [
      `The user's case "${found.title}": ${found.goal}${found.dueAt ? ` Deadline: ${found.dueAt.toISOString().slice(0, 10)}.` : ''}`,
      `Rewrite its items in ${englishName(settings?.language ?? 'en')}, keeping their order and adding what the email or the web findings show is also needed. state: done only when the mail proves it (the user sent it, they confirmed it); found when one of the user's files below is that document (file: its number); waiting when someone else owes it; else needed. proof: a few words on where it stands or where it came from, else null. source: the number of the web finding an item comes from, else null; a finding never makes an item done.`,
      'next: one or two sentences on the one thing the user should do now, concrete, with the file or link to use; say plainly when nothing is needed from them.',
      "reply: when the email to handle is someone waiting on the user and a reply can move the case, what that reply must say (instruction) and the numbers of the user's files to attach; else null. Never promise what the user has not done.",
      'done: true only when the mail shows the whole goal reached.',
      INFORMAL_ADDRESS,
      NO_EM_DASH,
      UNTRUSTED_MAIL,
    ].join('\n'),
    model: models.fast,
    output: Output.object({ schema: revisionSchema }),
    prompt: [
      `Items:\n${items.map((item) => `- [${item.state}${item.isTheirs ? ', theirs' : ''}] ${item.text}${item.proof ? ` (${item.proof})` : ''}`).join('\n')}`,
      findings.length > 0
        ? `Web findings:\n${findings.map((finding, index) => `[${index}] ${finding.text}`).join('\n')}`
        : '',
      files.length > 0
        ? `The user's files:\n${files.map((file, index) => `[${index}] ${file.filename} (${file.about})`).join('\n')}`
        : '',
      email ? `The email to handle:\n${emailPrompt(email, timezone)}` : '',
    ]
      .filter(Boolean)
      .join('\n\n'),
    telemetry: trackUsage(userId, 'case'),
  })
  const fileAt = (index: number | null) =>
    index === null ? undefined : files[index]
  const sourceOf = (item: (typeof output.items)[number]): CaseSource | null => {
    const file = fileAt(item.file)
    const url = item.source === null ? undefined : findings[item.source]?.url
    if (file) {
      const { about: _, ...rest } = file
      return { file: rest, messageId: file.messageId }
    }
    return url ? { url } : null
  }
  await db.transaction(async (tx) => {
    await tx.delete(caseItems).where(eq(caseItems.caseId, found.id))
    await tx.insert(caseItems).values(
      output.items.map((item, position) => ({
        caseId: found.id,
        isTheirs: item.isTheirs,
        position,
        proof: item.proof,
        source: sourceOf(item),
        state: item.state,
        text: item.text,
      }))
    )
    await tx
      .update(cases)
      .set({
        next: output.next,
        plannedAt: found.plannedAt ?? new Date(),
        status: output.done ? 'done' : found.status,
        threadIds:
          message && !found.threadIds.includes(message.threadId)
            ? [...found.threadIds, message.threadId]
            : found.threadIds,
      })
      .where(eq(cases.id, found.id))
  })
  if (output.reply && email && !email.isFromMe && !output.done) {
    await queueReply(found, email, {
      files: output.reply.files.flatMap((index) => {
        const file = fileAt(index)
        if (!file) {
          return []
        }
        const { about: _, ...rest } = file
        return [rest]
      }),
      instruction: output.reply.instruction,
    })
  }
  await announceChange(userId, TOPICS)
}

/** After an email is analysed (`analyzeMessage` returns the signal): it moves the case its thread or Jev names, else it may start one. Agent plans only. */
export const routeToCases = async (
  message: Message,
  signal: { agent: boolean; caseId: string | null; startsCase: boolean }
) => {
  if (!signal.agent || message.isFromMe || message.risk) {
    return
  }
  const active = await db
    .select()
    .from(cases)
    .where(and(eq(cases.userId, message.userId), eq(cases.status, 'active')))
  const linked =
    active.find(({ threadIds }) => threadIds.includes(message.threadId)) ??
    active.find(({ id }) => id === signal.caseId)
  if (linked) {
    await db
      .insert(caseMail)
      .values({ caseId: linked.id, messageId: message.id })
      .onConflictDoNothing()
    if (await hasBudget(message.userId)) {
      await reviseCase(linked, { message })
    }
    return
  }
  if (signal.startsCase) {
    await proposeCase(message)
  }
}

/** How far the one look back reaches, how many emails Jev reads for it and how many proposals it may leave on Home. */
export const CASE_SCAN_DAYS = 30
export const CASE_SCAN_LIMIT = 200
const CASE_SCAN_PROPOSALS = 5

/**
 * Once per user (`casesScannedAt`, claimed by the worker): cases already under way when cases began, or when the user
 * signed up, are proposed like new ones. Jev asks its one question of each thread's newest email from a person or a
 * service (never a list), newest first; only its yes pays for a proposal, and a few at most reach Home.
 */
export const scanForCases = async (userId: string) => {
  const recent = await db
    .select()
    .from(messages)
    .where(
      and(
        eq(messages.userId, userId),
        eq(messages.isFromMe, false),
        isNull(messages.listUnsubscribe),
        isNull(messages.risk),
        gte(messages.receivedAt, subDays(new Date(), CASE_SCAN_DAYS))
      )
    )
    .orderBy(desc(messages.receivedAt))
    .limit(CASE_SCAN_LIMIT * 2)
  const threads = new Set<string>()
  const newest = recent
    .filter(({ threadId }) => !threads.has(threadId) && threads.add(threadId))
    .slice(0, CASE_SCAN_LIMIT)
  const settings = await getSettings(userId)
  let proposed = 0
  for (const message of newest) {
    if (proposed >= CASE_SCAN_PROPOSALS) {
      return
    }
    // oxlint-disable-next-line eslint/no-await-in-loop -- one at a time, so it stops at the first few proposals
    if (await startsCase(emailPrompt(message, settings?.timezone ?? 'UTC'))) {
      // oxlint-disable-next-line eslint/no-await-in-loop -- see above
      proposed += Number(await proposeCase(message))
    }
  }
}

/** The user's yes: the case goes active and is planned with the web in the background, so the answer comes at once. */
export const acceptCase = async (userId: string, caseId: string) => {
  await requireBudget(userId)
  const [accepted] = await db
    .update(cases)
    .set({ status: 'active' })
    .where(
      and(
        eq(cases.id, caseId),
        eq(cases.userId, userId),
        eq(cases.status, 'proposed')
      )
    )
    .returning()
  if (!accepted) {
    throw new NotFoundError('Case not found')
  }
  await announceChange(userId, TOPICS)
  reviseCase(accepted, { research: true }).catch(
    logErrorAs(`case ${caseId} plan failed`)
  )
}

/** A case the user asked for in words (the agent, Telegram, MCP): active at once, planned like an accepted one. */
export const startCase = async (
  userId: string,
  input: { dueDate?: string; goal: string; searches?: string[]; title: string }
) => {
  await requireBudget(userId)
  const [started] = await db
    .insert(cases)
    .values({
      dueAt: dayOf(input.dueDate ?? null),
      goal: input.goal,
      searches: (input.searches ?? [])
        .filter(isGeneral)
        .slice(0, CASE_SEARCHES),
      status: 'active',
      threadIds: [],
      title: input.title,
      userId,
    })
    .returning()
  if (!started) {
    throw new NotFoundError('Case not created')
  }
  await reviseCase(started, { research: true })
  return { id: started.id }
}

export const setCaseStatus = async (
  userId: string,
  caseId: string,
  status: 'active' | 'done' | 'dropped'
) => {
  const found = await ownCase(userId, caseId)
  if (found.status === 'proposed' && status === 'active') {
    await acceptCase(userId, caseId)
    return
  }
  await db.update(cases).set({ status }).where(eq(cases.id, caseId))
  await announceChange(userId, TOPICS)
}

/** The user ticks an item themselves: their word is the proof. */
export const setCaseItem = async (
  userId: string,
  itemId: string,
  isDone: boolean
) => {
  const [item] = await db
    .select({ caseId: caseItems.caseId, isTheirs: caseItems.isTheirs })
    .from(caseItems)
    .innerJoin(cases, eq(cases.id, caseItems.caseId))
    .where(and(eq(caseItems.id, itemId), eq(cases.userId, userId)))
  if (!item) {
    throw new NotFoundError('Item not found')
  }
  const undone = item.isTheirs ? 'waiting' : 'needed'
  await db
    .update(caseItems)
    .set({ state: isDone ? 'done' : undone })
    .where(eq(caseItems.id, itemId))
  capture(userId, 'case_item_done', { isDone })
  await announceChange(userId, TOPICS)
}

const itemsOf = (caseIds: string[]) =>
  caseIds.length === 0
    ? []
    : db
        .select()
        .from(caseItems)
        .where(inArray(caseItems.caseId, caseIds))
        .orderBy(asc(caseItems.position))

/** Proposed and active cases, the ones waiting for the user's yes first, with their items. */
export const listCases = async (userId: string) => {
  const open = await db
    .select()
    .from(cases)
    .where(
      and(
        eq(cases.userId, userId),
        inArray(cases.status, ['proposed', 'active'])
      )
    )
    .orderBy(desc(cases.createdAt))
  const items = await itemsOf(open.map(({ id }) => id))
  const byCase = Map.groupBy(items, ({ caseId }) => caseId)
  return open
    .map((found) => ({ ...found, items: byCase.get(found.id) ?? [] }))
    .toSorted(
      (left, right) =>
        Number(right.status === 'proposed') - Number(left.status === 'proposed')
    )
}

/** One case with its items and its emails, newest first. */
export const getCase = async (userId: string, caseId: string) => {
  const found = await ownCase(userId, caseId)
  const [items, mail] = await Promise.all([
    itemsOf([caseId]),
    db
      .select({
        fromEmail: messages.fromEmail,
        fromName: messages.fromName,
        id: messages.id,
        isFromMe: messages.isFromMe,
        receivedAt: messages.receivedAt,
        subject: messages.subject,
        threadId: messages.threadId,
      })
      .from(caseMail)
      .innerJoin(messages, eq(messages.id, caseMail.messageId))
      .where(eq(caseMail.caseId, caseId))
      .orderBy(desc(messages.receivedAt)),
  ])
  const replies = await db
    .select({ payload: actions.payload })
    .from(actions)
    .where(
      and(
        eq(actions.userId, userId),
        eq(actions.kind, 'reply'),
        eq(actions.status, 'pending'),
        inArray(
          actions.messageId,
          mail.map(({ id }) => id)
        )
      )
    )
  return {
    ...found,
    hasReply: replies.some(({ payload }) => payload?.caseId === caseId),
    items,
    mail,
  }
}

/** The case a thread started or belongs to, for the banner over that thread. */
export const caseOfThread = async (userId: string, threadId: string) => {
  const [found] = await db
    .select({ id: cases.id })
    .from(cases)
    .where(
      and(
        eq(cases.userId, userId),
        arrayContains(cases.threadIds, [threadId]),
        inArray(cases.status, ['proposed', 'active'])
      )
    )
    .orderBy(desc(cases.createdAt))
    .limit(1)
  return found ? getCase(userId, found.id) : null
}
