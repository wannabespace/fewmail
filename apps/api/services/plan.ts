import { db } from '@fewmail/db'
import { subscriptions, usage, userSettings } from '@fewmail/db/schema'
import { PLAN_LIMITS } from '@fewmail/shared/agent'
import type { Plan } from '@fewmail/shared/agent'
import { and, desc, eq, inArray, sql } from 'drizzle-orm'

import { env } from '../env'
import { LimitReachedError, usageResetsAt } from './limit-error'

/** past_due keeps the plan while Stripe retries the card; a lapse ends it with `canceled` or `unpaid`. */
const ACTIVE_STATUSES = ['active', 'trialing', 'past_due']

export class AgentRequiredError extends Error {
  override name = 'AgentRequiredError'
}

const DAY_MS = 86_400_000

const currentMonth = () => `${new Date().toISOString().slice(0, 7)}-01`

/** Urgent mail may run this far past the email limit, so the limit never hides it. */
const URGENT_RESERVE = 1.1

/** Any price but Pro's two is Max: subscribers of the old $15 Pro keep Max limits. */
const paidPlan = (priceId: string): Plan =>
  priceId === env.STRIPE_PRO_MONTHLY_PRICE_ID ||
  priceId === env.STRIPE_PRO_YEARLY_PRICE_ID
    ? 'pro'
    : 'max'

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

export type PlanInfo = Awaited<ReturnType<typeof getPlanInfo>>

/** Everything that runs a model — analysis, drafts, briefs, Telegram, MCP — needs the agent. */
export const hasAgent = <Info extends Pick<PlanInfo, 'kind'>>(
  plan: Info
): plan is Info & { kind: Exclude<Plan, 'free'> } => plan.kind !== 'free'

export const requireAgent = async (userId: string) => {
  const plan = await getPlanInfo(userId)
  if (!hasAgent(plan)) {
    throw new AgentRequiredError('Fewmail Pro is needed for the agent')
  }
  return plan
}

export const getUsage = async (userId: string) => {
  const [row] = await db
    .select({ emails: usage.emails, messages: usage.messages })
    .from(usage)
    .where(and(eq(usage.userId, userId), eq(usage.month, currentMonth())))
  return {
    emails: row?.emails ?? 0,
    messages: row?.messages ?? 0,
    resetsAt: usageResetsAt(),
  }
}

const countUsage = (
  userId: string,
  kind: 'emails' | 'messages',
  amount: number
) =>
  db
    .insert(usage)
    .values({ [kind]: amount, month: currentMonth(), userId })
    .onConflictDoUpdate({
      set: { [kind]: sql`${usage[kind]} + ${amount}` },
      target: [usage.userId, usage.month],
    })

/** One message to the agent — chat, Ask, Telegram or WhatsApp — counted, or refused once the month's are used. */
export const spendMessage = async (userId: string) => {
  const plan = await requireAgent(userId)
  const total = PLAN_LIMITS[plan.kind].messages
  const { messages } = await getUsage(userId)
  if (messages >= total) {
    throw new LimitReachedError('messages', total)
  }
  await countUsage(userId, 'messages', 1)
}

/** Boards and tasks are limited by how many exist at once, not per month. */
export const requireRoom = async (
  userId: string,
  limit: 'boards' | 'tasks',
  count: () => Promise<number>
) => {
  const plan = await requireAgent(userId)
  const total = PLAN_LIMITS[plan.kind][limit]
  if (total !== null && (await count()) >= total) {
    throw new LimitReachedError(limit, total)
  }
}

export type EmailAllowance = (urgent: boolean) => boolean

/** Whether the agent may write for one more email this month; `save` records what was spent. */
export const emailAllowance = async (userId: string) => {
  const plan = await getPlanInfo(userId)
  if (!hasAgent(plan)) {
    return { allowance: null, save: () => Promise.resolve() }
  }
  const limit = PLAN_LIMITS[plan.kind].emails
  const { emails } = await getUsage(userId)
  let spent = 0
  const allowance: EmailAllowance = (urgent) => {
    if (emails + spent >= (urgent ? limit * URGENT_RESERVE : limit)) {
      return false
    }
    spent += 1
    return true
  }
  return {
    allowance,
    save: async () => {
      if (spent > 0) {
        await countUsage(userId, 'emails', spent)
      }
    },
  }
}
