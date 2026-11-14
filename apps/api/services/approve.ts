import { db } from '@fewmail/db'
import { actions } from '@fewmail/db/schema'
import { Result } from 'better-result'
import { and, eq } from 'drizzle-orm'

import { capture } from '../lib/posthog'
import { runConsent } from './agent-run'
import { approveAction } from './mail'
import { NotFoundError } from './mail-errors'

/** The outbox row a consent's send left (`send_email` returns it, `approve_action` its id), so the yes gets the same Undo as a card's send. */
const outboxOf = (output: unknown) => {
  const result = output as {
    id?: unknown
    outboxId?: unknown
    sendAt?: unknown
  } | null
  if (typeof result?.outboxId === 'string') {
    return result.outboxId
  }
  return result?.sendAt && typeof result.id === 'string' ? result.id : null
}

/** A consent card is claimed, then its tool runs; a failure puts it back on Home. */
const approveConsent = async (
  userId: string,
  actionId: string,
  payload: Record<string, unknown> | null
) => {
  const [claimed] = await db
    .update(actions)
    .set({ resolvedAt: new Date(), status: 'done' })
    .where(and(eq(actions.id, actionId), eq(actions.status, 'pending')))
    .returning({ id: actions.id })
  if (!claimed) {
    throw new NotFoundError('Action already handled')
  }
  const ran = await Result.tryPromise(() => runConsent(userId, payload))
  if (ran.isErr()) {
    await db
      .update(actions)
      .set({ resolvedAt: null, status: 'pending' })
      .where(eq(actions.id, actionId))
    throw ran.error.cause
  }
  return { outboxId: outboxOf(ran.value) }
}

/**
 * A card's yes from the user, whatever the card: a consent card runs the tool it holds, any other goes through
 * `approveAction`. Apart from `mail.ts` because the tools import it.
 */
export const approveCard = async (
  userId: string,
  actionId: string,
  detail?: string
) => {
  const [action] = await db
    .select({ kind: actions.kind, payload: actions.payload })
    .from(actions)
    .where(and(eq(actions.id, actionId), eq(actions.userId, userId)))
  const approved =
    action?.kind === 'consent'
      ? await approveConsent(userId, actionId, action.payload)
      : await approveAction(userId, actionId, detail)
  capture(userId, 'card_approved', {
    kind: action?.kind ?? null,
    tool:
      action?.kind === 'consent' ? String(action.payload?.tool ?? '') : null,
  })
  return approved
}

/** One by one, so each send keeps its own undo window and a failure leaves the rest approved. */
export const approveCards = async (userId: string, actionIds: string[]) => {
  const outboxIds: string[] = []
  for (const actionId of actionIds) {
    // oxlint-disable-next-line eslint/no-await-in-loop -- approvals share the thread and outbox state
    const { outboxId } = await approveCard(userId, actionId)
    if (outboxId) {
      outboxIds.push(outboxId)
    }
  }
  return { approved: actionIds.length, outboxIds }
}
