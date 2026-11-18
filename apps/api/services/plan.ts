import { AsyncLocalStorage } from 'node:async_hooks'

import { db } from '@fewmail/db'
import { subscriptions, usage, userSettings } from '@fewmail/db/schema'
import { PLAN_ALLOWANCE_USD } from '@fewmail/shared/agent'
import type { Plan } from '@fewmail/shared/agent'
import { and, desc, eq, gt, inArray, or, sql } from 'drizzle-orm'
import type { Column } from 'drizzle-orm'

import { env } from '../env'
import { LimitReachedError, usageResetsAt } from './limit-error'

/** past_due keeps the plan while Stripe retries the card; a lapse ends it with `canceled` or `unpaid`. */
const ACTIVE_STATUSES = ['active', 'trialing', 'past_due']

export class AgentRequiredError extends Error {
  override name = 'AgentRequiredError'
}

const DAY_MS = 86_400_000

const currentMonth = () => `${new Date().toISOString().slice(0, 7)}-01`

/** Urgent mail may run this far past the month's allowance, so the allowance never hides it. */
const URGENT_RESERVE = 1.1

const paidPlan = (priceId: string): Plan => {
  if (
    priceId === env.STRIPE_MAX_MONTHLY_PRICE_ID ||
    priceId === env.STRIPE_MAX_YEARLY_PRICE_ID
  ) {
    return 'max'
  }
  return priceId === env.STRIPE_LITE_MONTHLY_PRICE_ID ||
    priceId === env.STRIPE_LITE_YEARLY_PRICE_ID
    ? 'lite'
    : 'pro'
}

const planKind = (
  subscription: { stripePriceId: string } | undefined,
  trialMsLeft: number
): Plan => {
  if (subscription) {
    return paidPlan(subscription.stripePriceId)
  }
  return trialMsLeft > 0 ? 'trial' : 'free'
}

export const getPlanInfo = async (userId: string) => {
  const [[subscription], [settings]] = await Promise.all([
    db
      .select()
      .from(subscriptions)
      .where(
        and(
          eq(subscriptions.userId, userId),
          inArray(subscriptions.status, ACTIVE_STATUSES)
        )
      )
      .orderBy(desc(subscriptions.createdAt))
      .limit(1),
    db
      .select({ trialEndsAt: userSettings.trialEndsAt })
      .from(userSettings)
      .where(eq(userSettings.userId, userId)),
  ])
  const trialEndsAt = settings?.trialEndsAt ?? null
  const trialMsLeft = trialEndsAt ? trialEndsAt.getTime() - Date.now() : 0

  return {
    cancelAtPeriodEnd: subscription?.cancelAtPeriodEnd ?? false,
    kind: planKind(subscription, trialMsLeft),
    periodEnd: subscription?.periodEnd ?? null,
    trialDaysLeft:
      !subscription && trialMsLeft > 0 ? Math.ceil(trialMsLeft / DAY_MS) : null,
    trialEndsAt,
  }
}

type PlanInfo = Awaited<ReturnType<typeof getPlanInfo>>

/** Everything that runs a model — analysis, drafts, Telegram, MCP — needs the agent. */
export const hasAgent = <Info extends Pick<PlanInfo, 'kind'>>(
  plan: Info
): plan is Info & { kind: Exclude<Plan, 'free'> } => plan.kind !== 'free'

/** `hasAgent` as a SQL filter, so the worker skips Free users without asking `getPlanInfo` for each. */
export const hasAgentSql = (userId: Column) =>
  or(
    inArray(
      userId,
      db
        .select({ userId: userSettings.userId })
        .from(userSettings)
        .where(gt(userSettings.trialEndsAt, sql`now()`))
    ),
    inArray(
      userId,
      db
        .select({ userId: subscriptions.userId })
        .from(subscriptions)
        .where(inArray(subscriptions.status, ACTIVE_STATUSES))
    )
  )

export const requireAgent = async (userId: string) => {
  const plan = await getPlanInfo(userId)
  if (!hasAgent(plan)) {
    throw new AgentRequiredError('Fewmail Pro is needed for the agent')
  }
  return plan
}

export const getUsage = async (userId: string) => {
  const [row] = await db
    .select({ spent: usage.spent })
    .from(usage)
    .where(and(eq(usage.userId, userId), eq(usage.month, currentMonth())))
  return { resetsAt: usageResetsAt(), spent: row?.spent ?? 0 }
}

/** Pays for one model call (or voice, or OCR) from the month's allowance, at what it really cost. */
export const charge = async (userId: string, usd: number) => {
  if (usd > 0) {
    await db
      .insert(usage)
      .values({ month: currentMonth(), spent: usd, userId })
      .onConflictDoUpdate({
        set: { spent: sql`${usage.spent} + ${usd}` },
        target: [usage.userId, usage.month],
      })
  }
}

const paidFlows = new AsyncLocalStorage<string>()

/** Whether the agent may still spend this month; `reserve` lets urgent mail run past the allowance. */
export const hasBudget = async (userId: string, reserve = 1) => {
  if (paidFlows.getStore() === userId) {
    return true
  }
  const plan = await getPlanInfo(userId)
  if (!hasAgent(plan)) {
    return false
  }
  const { spent } = await getUsage(userId)
  return spent < PLAN_ALLOWANCE_USD[plan.kind] * reserve
}

/**
 * Rows (a promise, a last day) are cheap structured calls the agent keeps making once the allowance is spent, so the
 * watch never sleeps mid-month; they are still charged. Prose (summaries, drafts, answers) is what the allowance
 * stops. `economics.ts` counts rows outside the cap.
 */
export const keepsRows = async (userId: string) =>
  hasAgent(await getPlanInfo(userId))

/** Anything the user asks of the agent (a message, a voice note, reading aloud, a task) is refused once the month's allowance is spent. */
export const requireBudget = async (userId: string) => {
  await requireAgent(userId)
  if (!(await hasBudget(userId))) {
    throw new LimitReachedError()
  }
}

/**
 * The allowance is read once, when a flow starts: one it let start runs to its end even past it (every check inside
 * passes), so the user never gets half of a reply or an issue; the next flow is refused. Past it the flow runs with
 * its checks as they are.
 */
export const finishPaid = async <T>(userId: string, flow: () => Promise<T>) =>
  (await hasBudget(userId)) ? paidFlows.run(userId, flow) : flow()

export interface EmailAllowance {
  take: (urgent: boolean) => boolean
}

/** Whether the agent may write for one more email this sync; what it writes is charged call by call. */
export const emailAllowance = async (
  userId: string
): Promise<EmailAllowance | null> => {
  const plan = await getPlanInfo(userId)
  if (!hasAgent(plan)) {
    return null
  }
  const allowance = PLAN_ALLOWANCE_USD[plan.kind]
  const { spent } = await getUsage(userId)
  return {
    take: (urgent) => spent < allowance * (urgent ? URGENT_RESERVE : 1),
  }
}
