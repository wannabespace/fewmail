import { db } from '@fewmail/db'
import { subscriptions, users } from '@fewmail/db/schema'
import type { BillingInterval, PaidPlan } from '@fewmail/shared/agent'
import { eq } from 'drizzle-orm'
import { Stripe } from 'stripe'

import { env } from '../env'
import { expectRow } from '../lib/rows'

const stripe = env.STRIPE_SECRET_KEY ? new Stripe(env.STRIPE_SECRET_KEY) : null

const PRICE_IDS: Record<
  PaidPlan,
  Record<BillingInterval, string | undefined>
> = {
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

const customerFor = async (userId: string) => {
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
  await db
    .update(users)
    .set({ stripeCustomerId: customer.id })
    .where(eq(users.id, userId))
  return customer.id
}

export const createCheckout = async (
  userId: string,
  { interval, plan }: { interval: BillingInterval; plan: PaidPlan }
) => {
  const { stripe: client } = requireStripe()
  const priceId = PRICE_IDS[plan][interval]
  if (!priceId) {
    throw new Error('Payments are not configured on this server')
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

export const createBillingPortal = async (userId: string) => {
  const { stripe: client } = requireStripe()
  const session = await client.billingPortal.sessions.create({
    customer: await customerFor(userId),
    return_url: `${env.WEB_URL}/settings`,
  })
  return session.url
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

  const event = await stripe.webhooks.constructEventAsync(
    await request.text(),
    signature,
    env.STRIPE_WEBHOOK_SECRET
  )
  if (!SUBSCRIPTION_EVENTS.has(event.type)) {
    return new Response('Ignored')
  }

  const subscription = event.data.object as Stripe.Subscription
  const { userId } = subscription.metadata
  const [item] = subscription.items.data
  if (!userId || !item) {
    return new Response('Not a Fewmail subscription')
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

  return new Response('ok')
}
