import { db } from '@fewmail/db'
import { subscriptions, userSettings } from '@fewmail/db/schema'
import type { Plan } from '@fewmail/shared/agent'
import { and, desc, eq, inArray } from 'drizzle-orm'

/** past_due keeps Pro while Stripe retries the card; a lapse ends it with `canceled` or `unpaid`. */
const ACTIVE_STATUSES = ['active', 'trialing', 'past_due']

export class AgentRequiredError extends Error {
  override name = 'AgentRequiredError'
}

const DAY_MS = 86_400_000

const planKind = (hasSubscription: boolean, trialMsLeft: number): Plan => {
  if (hasSubscription) {
    return 'pro'
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
    kind: planKind(!!subscription, trialMsLeft),
    periodEnd: subscription?.periodEnd ?? null,
    trialDaysLeft:
      !subscription && trialMsLeft > 0 ? Math.ceil(trialMsLeft / DAY_MS) : null,
    trialEndsAt,
  }
}

export type PlanInfo = Awaited<ReturnType<typeof getPlanInfo>>

/** Everything that runs a model — analysis, drafts, briefs, Telegram, MCP — needs the agent. */
export const hasAgent = (plan: Pick<PlanInfo, 'kind'>) => plan.kind !== 'free'

export const requireAgent = async (userId: string) => {
  if (!hasAgent(await getPlanInfo(userId))) {
    throw new AgentRequiredError('Fewmail Pro is needed for the agent')
  }
}
