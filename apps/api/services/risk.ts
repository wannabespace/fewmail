import { db } from '@fewmail/db'
import {
  actions,
  domainSightings,
  messages,
  paymentDetails,
} from '@fewmail/db/schema'
import type { MessageRisk } from '@fewmail/shared/agent'
import { messages as dictionaries } from '@fewmail/shared/i18n'
import { noul } from '@typesafe-ai/sdk'
import { and, eq, lt, sql } from 'drizzle-orm'

import { jev } from '../lib/jev'
import { domainOf, keyedHash, userHashOf } from '../lib/keyed-hash'
import { getSettings } from './settings'
import { FREEMAIL_DOMAINS } from './spam'

type Message = typeof messages.$inferSelect

/** Brands phishers imitate most; the network adds every domain many users really get mail from. */
const BRAND_DOMAINS = [
  'amazon.com',
  'apple.com',
  'binance.com',
  'coinbase.com',
  'docusign.com',
  'dropbox.com',
  'facebook.com',
  'github.com',
  'google.com',
  'icloud.com',
  'instagram.com',
  'linkedin.com',
  'microsoft.com',
  'monobank.ua',
  'netflix.com',
  'paypal.com',
  'privatbank.ua',
  'revolut.com',
  'stripe.com',
  'wise.com',
]
const POPULAR_DOMAIN_USERS = 20
const POPULAR_CACHE_MS = 10 * 60_000

const CONFUSABLES: [RegExp, string][] = [
  [/rn/gu, 'm'],
  [/vv/gu, 'w'],
  [/[0ο]/gu, 'o'],
  [/[1lі|]/gu, 'l'],
  [/[а]/gu, 'a'],
  [/[е]/gu, 'e'],
  [/[с]/gu, 'c'],
  [/[р]/gu, 'p'],
  [/[х]/gu, 'x'],
  [/[у]/gu, 'y'],
  [/5/gu, 's'],
  [/-/gu, ''],
]

/** What a domain reads as to a human: confusable letters folded, TLD dropped. */
const skeleton = (domain: string) => {
  const label = domain.split('.').slice(0, -1).join('.') || domain
  let text = label.normalize('NFKC').toLowerCase()
  for (const [pattern, letter] of CONFUSABLES) {
    text = text.replace(pattern, letter)
  }
  return text
}

let popular: { at: number; domains: string[] } = { at: 0, domains: [] }

const knownDomains = async () => {
  if (Date.now() - popular.at > POPULAR_CACHE_MS) {
    const rows = await db
      .select({ domain: domainSightings.domain })
      .from(domainSightings)
      .groupBy(domainSightings.domain)
      .having(sql`count(*) >= ${POPULAR_DOMAIN_USERS}`)
    popular = { at: Date.now(), domains: rows.map(({ domain }) => domain) }
  }
  return [...new Set([...BRAND_DOMAINS, ...popular.domains])]
}

export const imitatedDomain = async (domain: string) => {
  if (!domain || FREEMAIL_DOMAINS.has(domain)) {
    return null
  }
  const shape = skeleton(domain)
  const known = await knownDomains()
  return (
    known.find(
      (candidate) =>
        candidate !== domain &&
        !domain.endsWith(`.${candidate}`) &&
        skeleton(candidate) === shape
    ) ?? null
  )
}

const IBAN = /\b[A-Z]{2}\d{2}(?:\s?[A-Z0-9]{4}){2,7}(?:\s?[A-Z0-9]{1,4})?\b/gu
const WALLET =
  /\b(?:0x[a-fA-F0-9]{40}|bc1[a-z0-9]{25,59}|T[1-9A-HJ-NP-Za-km-z]{33})\b/gu
const MONEY_WORDS =
  /invoice|payment|pay |iban|bank|wire|transfer|account number|wallet|usdt|btc|crypto|оплат|рахун|реквізит|переказ|rechnung|zahlung|factura|pago|facture|paiement|fattura|pagamento|faktura|płatno/iu

const paymentDetailsIn = (body: string) =>
  [
    ...new Set([...(body.match(IBAN) ?? []), ...(body.match(WALLET) ?? [])]),
  ].map((detail) => detail.replaceAll(/\s/gu, '').toUpperCase())

const knownSender = async (userId: string, domain: string, before: Date) => {
  const [previous] = await db
    .select({ id: messages.id })
    .from(messages)
    .where(
      and(
        eq(messages.userId, userId),
        sql`split_part(${messages.fromEmail}, '@', 2) = ${domain}`,
        lt(messages.receivedAt, before)
      )
    )
    .limit(1)
  return !!previous
}

const jevSignals = async (body: string) => {
  if (!jev) {
    return null
  }
  const { answers } = await jev.systemOne({
    questions: {
      detailsChanged: noul(
        'The email says the bank account, payment details or wallet to pay to have changed, or asks to pay to a new account'
      ),
      urgentPayment: noul(
        'The email pressures the reader to pay, transfer money or share credentials urgently'
      ),
    },
    state: body.slice(0, 6000),
  })
  return {
    detailsChanged: answers.detailsChanged.noul >= 0.7,
    urgentPayment: answers.urgentPayment.noul >= 0.7,
  }
}

const assess = async (
  userId: string,
  message: Message
): Promise<MessageRisk | null> => {
  const domain = domainOf(message.fromEmail)
  const imitates = await imitatedDomain(domain)
  if (imitates) {
    return { imitates, kind: 'lookalike_domain' }
  }
  const replyDomain = message.replyTo ? domainOf(message.replyTo) : domain
  const mentionsMoney = MONEY_WORDS.test(`${message.subject}\n${message.body}`)
  if (!mentionsMoney || FREEMAIL_DOMAINS.has(domain)) {
    return null
  }

  const details = paymentDetailsIn(message.body)
  const known = details.length
    ? await db
        .select({ detailHash: paymentDetails.detailHash })
        .from(paymentDetails)
        .where(
          and(
            eq(paymentDetails.userId, userId),
            eq(paymentDetails.senderDomain, domain)
          )
        )
    : []
  const knownHashes = new Set(known.map(({ detailHash }) => detailHash))
  const newDetails = details.filter(
    (detail) => !knownHashes.has(keyedHash(`pay:${detail}`))
  )
  const signals = await jevSignals(message.body)

  if ((known.length > 0 && newDetails.length > 0) || signals?.detailsChanged) {
    return { imitates: null, kind: 'payment_change' }
  }
  const isNewSender = !(await knownSender(userId, domain, message.receivedAt))
  if (
    isNewSender &&
    (signals?.urgentPayment || replyDomain !== domain) &&
    details.length > 0
  ) {
    return { imitates: null, kind: 'new_sender_payment' }
  }
  return null
}

const remember = async (userId: string, message: Message) => {
  const domain = domainOf(message.fromEmail)
  if (!domain) {
    return
  }
  await db
    .insert(domainSightings)
    .values({ domain, userHash: userHashOf(userId) })
    .onConflictDoNothing()
  const details = paymentDetailsIn(message.body)
  if (details.length > 0) {
    await db
      .insert(paymentDetails)
      .values(
        details.map((detail) => ({
          detailHash: keyedHash(`pay:${detail}`),
          senderDomain: domain,
          userId,
        }))
      )
      .onConflictDoNothing()
  }
}

/** Phishing and payment-fraud check for new inbound mail, on every plan. */
export const assessRisks = async (userId: string, incoming: Message[]) => {
  const inbound = incoming.filter((message) => !message.isFromMe)
  if (inbound.length === 0) {
    return
  }
  const settings = await getSettings(userId)
  const t = dictionaries[settings?.language ?? 'en']

  for (const message of inbound) {
    // oxlint-disable-next-line eslint/no-await-in-loop -- payment details learned from one email must count for the next
    const risk = await assess(userId, message).catch((error) => {
      console.error('risk check failed', error)
      return null
    })
    // oxlint-disable-next-line eslint/no-await-in-loop -- see above
    await remember(userId, message)
    if (!risk) {
      continue
    }
    // oxlint-disable-next-line eslint/no-await-in-loop -- see above
    await db.update(messages).set({ risk }).where(eq(messages.id, message.id))
    message.risk = risk
    // oxlint-disable-next-line eslint/no-await-in-loop -- see above
    await db.insert(actions).values({
      autonomous: false,
      kind: 'security',
      messageId: message.id,
      reason: t.risk[risk.kind](risk.imitates ?? domainOf(message.fromEmail)),
      status: 'pending',
      threadId: message.threadId,
      title: t.risk.title,
      userId,
    })
  }
}
