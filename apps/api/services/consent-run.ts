import { db } from '@fewmail/db'
import { actions, analyses, messages } from '@fewmail/db/schema'
import type { ConsentToolName } from '@fewmail/shared/agent'
import { messages as dictionaries } from '@fewmail/shared/i18n'
import { addDays, subDays } from 'date-fns'
import { and, eq, inArray, sql } from 'drizzle-orm'

import { keyedHash } from '../lib/keyed-hash'
import { announceChange } from '../lib/live'
import { agentTools } from './agent-tools'
import { listEvents } from './calendar'
import { ConsentChangedError } from './consent-error'
import type { Transaction } from './patterns'
import { getSettings } from './settings'
import { ownMessage } from './stored-mail'

type ToolInput = Record<string, unknown>

const EVENTS_AROUND = (now: Date) => ({
  from: subDays(now, 30).toISOString(),
  to: addDays(now, 365).toISOString(),
})

/** The reads the card finds its email, card or event in; without them the user would say yes blind. */
const consentReads = async (
  userId: string,
  name: ConsentToolName,
  input: ToolInput
): Promise<
  { input: ToolInput; name: keyof ReturnType<typeof agentTools> }[]
> => {
  if (typeof input.messageId === 'string') {
    const { threadId } = await ownMessage(userId, input.messageId)
    return [{ input: { threadId }, name: 'read_thread' }]
  }
  if (
    name === 'approve_action' ||
    name === 'dismiss_action' ||
    name === 'tidy_mail'
  ) {
    return [{ input: {}, name: 'get_today' }]
  }
  if (
    name === 'create_event' ||
    name === 'update_event' ||
    name === 'delete_event'
  ) {
    return [{ input: EVENTS_AROUND(new Date()), name: 'list_events' }]
  }
  if (name === 'update_bot') {
    return [{ input: {}, name: 'list_bots' }]
  }
  return []
}

/**
 * What a yes covers beyond the call's own input, read when it was asked: the draft an approval sends, the thread a
 * move touches, what Tidy would do to each email, and the event a change rewrites. Null when
 * the input says it all (a new email, a bot).
 */
const consentState = async (
  userId: string,
  name: ConsentToolName,
  input: ToolInput
): Promise<unknown> => {
  if (
    (name === 'approve_action' || name === 'dismiss_action') &&
    typeof input.actionId === 'string'
  ) {
    const [action] = await db
      .select({
        detail: actions.detail,
        kind: actions.kind,
        messageId: actions.messageId,
        status: actions.status,
      })
      .from(actions)
      .where(and(eq(actions.id, input.actionId), eq(actions.userId, userId)))
    return action ?? null
  }
  if (typeof input.messageId === 'string') {
    const { mailboxId, threadId } = await ownMessage(userId, input.messageId)
    return { mailboxId, threadId }
  }
  if (name === 'tidy_mail' && Array.isArray(input.messageIds)) {
    const suggested = await db
      .select({ id: analyses.messageId, suggested: analyses.suggestedAction })
      .from(analyses)
      .innerJoin(messages, eq(messages.id, analyses.messageId))
      .where(
        and(
          eq(messages.userId, userId),
          inArray(analyses.messageId, input.messageIds as string[])
        )
      )
    return suggested.toSorted((a, b) => a.id.localeCompare(b.id))
  }
  if (name === 'update_event' || name === 'delete_event') {
    const around = EVENTS_AROUND(new Date())
    const { events } = await listEvents(userId, {
      from: new Date(around.from),
      to: new Date(around.to),
    })
    return (
      events.find(
        ({ id, mailboxId }) => id === input.id && mailboxId === input.mailboxId
      ) ?? null
    )
  }
  return null
}

/** What the card shows (`context`) and what its yes is bound to (`state`), read together. */
const consentSnapshot = async (
  userId: string,
  name: ConsentToolName,
  input: ToolInput
) => {
  const tools = agentTools(userId)
  const reads = await consentReads(userId, name, input)
  const [context, state] = await Promise.all([
    Promise.all(reads.map((read) => tools[read.name].run(read.input as never))),
    consentState(userId, name, input),
  ])
  return { context, state }
}

/** The same request again (an MCP client retrying a call) is the card already waiting, or one yes would run it twice. */
const isWaiting = async (
  tx: Transaction,
  userId: string,
  name: ConsentToolName,
  asked: string
) => {
  const pending = await tx
    .select({ payload: actions.payload })
    .from(actions)
    .where(
      and(
        eq(actions.userId, userId),
        eq(actions.kind, 'consent'),
        eq(actions.status, 'pending')
      )
    )
  return pending.some(
    ({ payload }) =>
      payload?.tool === name && JSON.stringify(payload.input) === asked
  )
}

/**
 * A consent tool never runs on the agent's or an MCP client's word: it waits as a `consent` card on Home carrying the
 * tool, its input and what the reads found (`context`), so the card shows exactly what the yes does; `runConsent` does it.
 */
export const proposeConsent = async (
  userId: string,
  {
    bot,
    from,
    input,
    name,
  }: {
    /** The chat that asked: its card waits there. Fewmail's, a messenger's and an MCP client's carry none. */
    bot?: string
    from: string
    input: ToolInput
    name: ConsentToolName
  }
) => {
  const settings = await getSettings(userId)
  const t = dictionaries[settings?.language ?? 'en']
  const { context, state } = await consentSnapshot(userId, name, input)
  const asked = JSON.stringify(input)
  // Two identical calls at the same moment (a client retrying in parallel) must queue here, or both see no card and add one each.
  const id = await db.transaction(async (tx) => {
    await tx.execute(
      sql`select pg_advisory_xact_lock(hashtextextended(${keyedHash(`consent:${userId}:${name}:${asked}`)}, 0))`
    )
    if (await isWaiting(tx, userId, name, asked)) {
      return null
    }
    const [card] = await tx
      .insert(actions)
      .values({
        autonomous: false,
        botId: bot && bot !== 'fewmail' ? bot : null,
        kind: 'consent',
        messageId: typeof input.messageId === 'string' ? input.messageId : null,
        payload: { context, input, state, tool: name },
        reason: from,
        status: 'pending',
        title: t.agent.confirm[name],
        userId,
      })
      .returning({ id: actions.id })
    return card?.id ?? null
  })
  if (id) {
    await announceChange(userId, ['actions', 'today'])
  }
  return { id, isNew: !!id, question: t.agent.confirm[name] }
}

/**
 * Runs the tool only when what the yes covered is still what the card showed: a draft edited, a thread moved or an
 * event changed since makes the card show the new state and ask again (`ConsentChangedError`).
 */
export const runConsent = async (
  userId: string,
  actionId: string,
  payload: Record<string, unknown> | null
) => {
  const name = payload?.tool as ConsentToolName
  const input = (payload?.input ?? {}) as ToolInput
  const now = await consentState(userId, name, input)
  if (JSON.stringify(now) !== JSON.stringify(payload?.state)) {
    const snapshot = await consentSnapshot(userId, name, input)
    await db
      .update(actions)
      .set({ payload: { ...payload, ...snapshot } })
      .where(eq(actions.id, actionId))
    await announceChange(userId, ['actions', 'today'])
    throw new ConsentChangedError('The card changed since it was asked')
  }
  return agentTools(userId)[name].run(input as never)
}
