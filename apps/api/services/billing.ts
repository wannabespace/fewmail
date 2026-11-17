import { db } from '@fewmail/db'
import { subscriptions, users } from '@fewmail/db/schema'
import { isPaidPlan } from '@fewmail/shared/agent'
import type { BillingInterval, PaidPlan } from '@fewmail/shared/agent'
import { Result } from 'better-result'
import { and, eq, isNull } from 'drizzle-orm'
import { Stripe } from 'stripe'

import { env } from '../env'
import { announceChange } from '../lib/live'
import { capture } from '../lib/posthog'
import { expectRow } from '../lib/rows'
import { getPlanInfo } from './plan'

const stripe = env.STRIPE_SECRET_KEY ? new Stripe(env.STRIPE_SECRET_KEY) : null

const PRICE_IDS: Record<
  PaidPlan,
  Record<BillingInterval, string | undefined>
> = {
  lite: {
    month: env.STRIPE_LITE_MONTHLY_PRICE_ID,
    year: env.STRIPE_LITE_YEARLY_PRICE_ID,
  },
  max: {
    month: env.STRIPE_MAX_MONTHLY_PRICE_ID,
    year: env.STRIPE_MAX_YEARLY_PRICE_ID,
  },
  pro: {
    month: env.STRIPE_PRO_MONTHLY_PRICE_ID,
    year: env.STRIPE_PRO_YEARLY_PRICE_ID,
  },
}

const requireStripe = () => {
  if (!stripe) {
    throw new Error('Payments are not configured on this server')
  }
  return { stripe }
}

const customerFor = async (userId: string): Promise<string> => {
  const { stripe: client } = requireStripe()
  const [row] = await db.select().from(users).where(eq(users.id, userId))
  const user = expectRow(row)
  if (user.stripeCustomerId) {
    return user.stripeCustomerId
  }
  const customer = await client.customers.create({
    email: user.email,
    metadata: { userId },
    name: user.name,
  })
  const [saved] = await db
    .update(users)
    .set({ stripeCustomerId: customer.id })
    .where(and(eq(users.id, userId), isNull(users.stripeCustomerId)))
    .returning({ id: users.id })
  if (saved) {
    return customer.id
  }
  await client.customers.del(customer.id)
  return customerFor(userId)
}

export const createBillingPortal = async (userId: string) => {
  const { stripe: client } = requireStripe()
  const session = await client.billingPortal.sessions.create({
    customer: await customerFor(userId),
    return_url: `${env.WEB_URL}/settings`,
  })
  return session.url
}

/** A subscriber goes to the portal instead, so a second Checkout never starts a second subscription. */
export const createCheckout = async (
  userId: string,
  { interval, plan }: { interval: BillingInterval; plan: PaidPlan }
) => {
  const { stripe: client } = requireStripe()
  const priceId = PRICE_IDS[plan][interval]
  if (!priceId) {
    throw new Error('Payments are not configured on this server')
  }
  const { kind } = await getPlanInfo(userId)
  if (isPaidPlan(kind)) {
    return createBillingPortal(userId)
  }
  const session = await client.checkout.sessions.create({
    allow_promotion_codes: true,
    cancel_url: `${env.WEB_URL}/settings`,
    customer: await customerFor(userId),
    line_items: [{ price: priceId, quantity: 1 }],
    mode: 'subscription',
    subscription_data: { metadata: { userId } },
    success_url: `${env.WEB_URL}/settings?upgraded=${plan}`,
  })
  return expectRow(session.url ?? undefined)
}

/** Deleting the customer cancels its subscriptions at once and drops the email and name Stripe holds. */
export const deleteStripeCustomer = async (userId: string) => {
  const [user] = await db
    .select({ stripeCustomerId: users.stripeCustomerId })
    .from(users)
    .where(eq(users.id, userId))
  const customerId = user?.stripeCustomerId
  if (!stripe || !customerId) {
    return
  }
  const client = stripe
  const deleted = await Result.tryPromise(() =>
    client.customers.del(customerId)
  )
  if (deleted.isErr()) {
    const { cause } = deleted.error
    // A customer already removed in the Stripe dashboard must not block deleting the account.
    if (
      !(
        cause instanceof Stripe.errors.StripeInvalidRequestError &&
        cause.code === 'resource_missing'
      )
    ) {
      throw cause
    }
  }
}

const SUBSCRIPTION_EVENTS = new Set<Stripe.Event.Type>([
  'customer.subscription.created',
  'customer.subscription.deleted',
  'customer.subscription.updated',
])

export const handleStripeWebhook = async (request: Request) => {
  const signature = request.headers.get('stripe-signature')
  if (!stripe || !env.STRIPE_WEBHOOK_SECRET || !signature) {
    return new Response('Not configured', { status: 400 })
  }

  const event = await stripe.webhooks
    .constructEventAsync(
      await request.text(),
      signature,
      env.STRIPE_WEBHOOK_SECRET
    )
    .catch(() => null)
  if (!event) {
    return new Response('Bad signature', { status: 401 })
  }
  if (!SUBSCRIPTION_EVENTS.has(event.type)) {
    return new Response('Ignored')
  }

  // Stripe does not deliver events in order: the subscription as it is now, not as the event saw it, is what gets stored.
  const subscription = await stripe.subscriptions.retrieve(
    (event.data.object as Stripe.Subscription).id
  )
  const { userId } = subscription.metadata
  const [item] = subscription.items.data
  if (!userId || !item) {
    return new Response('Not a Fewmail subscription')
  }
  // A deleted account's subscription still sends events (its own cancellation among them); a 500 here makes Stripe retry for days.
  const [owner] = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.id, userId))
  if (!owner) {
    return new Response('Account deleted')
  }

  const values = {
    cancelAtPeriodEnd: subscription.cancel_at_period_end,
    periodEnd: new Date(item.current_period_end * 1000),
    status: subscription.status,
    stripePriceId: item.price.id,
  }
  await db
    .insert(subscriptions)
    .values({ ...values, stripeSubscriptionId: subscription.id, userId })
    .onConflictDoUpdate({
      set: values,
      target: subscriptions.stripeSubscriptionId,
    })
  await announceChange(userId)
  const plan = await getPlanInfo(userId)
  capture(userId, 'subscription_changed', {
    cancel_at_period_end: values.cancelAtPeriodEnd,
    plan: plan.kind,
    status: values.status,
  })

  return new Response('ok')
}
