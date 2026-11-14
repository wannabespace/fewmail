import { domainToUnicode } from 'node:url'

import { db } from '@fewmail/db'
import {
  actions,
  domainSightings,
  messages,
  paymentDetails,
} from '@fewmail/db/schema'
import type { MessageRisk } from '@fewmail/shared/agent'
import { FREEMAIL_DOMAINS, senderDomainOrAddress } from '@fewmail/shared/email'
import { messages as dictionaries } from '@fewmail/shared/i18n'
import { noul } from '@typesafe-ai/sdk'
import { and, eq, lt, sql } from 'drizzle-orm'

import { jev } from '../lib/jev'
import { domainOf, paymentHashOf, userHashOf } from '../lib/keyed-hash'
import { logError } from '../lib/log'
import { listedDomains, popularDomains } from './known-domains'
import {
  domainAgeDays,
  linkHostsOf,
  registrable,
  YOUNG_DOMAIN_DAYS,
} from './patterns'
import { getSettings } from './settings'

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

const labelOf = (domain: string) =>
  registrable(domainToUnicode(domain) || domain).split('.')[0] ?? ''

/** What a domain reads as to a human: confusable letters folded, subdomains and TLD dropped. */
const skeleton = (domain: string) => {
  let text = labelOf(domain).normalize('NFKC').toLowerCase()
  for (const [pattern, letter] of CONFUSABLES) {
    text = text.replace(pattern, letter)
  }
  return text
}

let imitable: {
  at: number
  bySkeleton: Map<string, string>
  domains: Set<string>
} = {
  at: 0,
  bySkeleton: new Map(),
  domains: new Set(),
}

/** Brands first, then the most popular sites, then what the network sees: the first owner of a shape wins. */
const imitableDomains = async () => {
  if (Date.now() - imitable.at > POPULAR_CACHE_MS) {
    const sighted = await db
      .select({ domain: domainSightings.domain })
      .from(domainSightings)
      .groupBy(domainSightings.domain)
      .having(sql`count(*) >= ${POPULAR_DOMAIN_USERS}`)
    const domains = [
      ...BRAND_DOMAINS,
      ...(await popularDomains()),
      ...sighted.map(({ domain }) => domain),
    ]
    const bySkeleton = new Map<string, string>()
    for (const domain of domains) {
      const shape = skeleton(domain)
      if (!bySkeleton.has(shape)) {
        bySkeleton.set(shape, domain)
      }
    }
    imitable = { at: Date.now(), bySkeleton, domains: new Set(domains) }
  }
  return imitable
}

export const imitatedDomain = async (domain: string) => {
  if (!domain || FREEMAIL_DOMAINS.has(domain)) {
    return null
  }
  const { bySkeleton, domains } = await imitableDomains()
  if (domains.has(domain)) {
    return null
  }
  const candidate = bySkeleton.get(skeleton(domain))
  /** Same name in another TLD is usually the brand's own country site (apple.de); only swapped letters count. */
  return candidate &&
    labelOf(candidate) !== labelOf(domain) &&
    !domain.endsWith(`.${candidate}`)
    ? candidate
    : null
}

const IBAN = /\b[A-Z]{2}\d{2}(?:\s?[A-Z0-9]{4}){2,7}(?:\s?[A-Z0-9]{1,4})?\b/gu
const WALLET =
  /\b(?:0x[a-fA-F0-9]{40}|bc1[a-z0-9]{25,59}|T[1-9A-HJ-NP-Za-km-z]{33})\b/gu
const MONEY_WORDS =
  /invoice|payment|pay |iban|bank|wire|transfer|account number|wallet|usdt|btc|crypto|оплат|рахун|реквізит|переказ|rechnung|zahlung|factura|pago|facture|paiement|fattura|pagamento|faktura|płatno/iu

const compact = (detail: string) => detail.replaceAll(/\s/gu, '').toUpperCase()

/** ISO 13616: `- 55` maps A–Z to 10–35. */
const isIban = (iban: string) =>
  BigInt(
    `${iban.slice(4)}${iban.slice(0, 4)}`.replaceAll(/[A-Z]/gu, (letter) =>
      String((letter.codePointAt(0) ?? 0) - 55)
    )
  ) %
    97n ===
  1n

const paymentDetailsIn = (body: string) => [
  ...new Set([
    ...(body.match(IBAN) ?? []).map(compact).filter(isIban),
    ...(body.match(WALLET) ?? []).map(compact),
  ]),
]

const knownSender = async (userId: string, domain: string, before: Date) => {
  const [previous] = await db
    .select({ id: messages.id })
    .from(messages)
    .where(
      and(
        eq(messages.userId, userId),
        eq(messages.fromDomain, domain),
        lt(messages.receivedAt, before)
      )
    )
    .limit(1)
  return !!previous
}

export const RISK_BODY_CHARS = 6000

const jevSignals = async (body: string) => {
  const { answers } = await jev.systemOne({
    questions: {
      detailsChanged: noul(
        'The email says the bank account, payment details or wallet to pay to have changed, or asks to pay to a new account'
      ),
      urgentPayment: noul(
        'The email pressures the reader to pay, transfer money or share credentials urgently'
      ),
    },
    state: body.slice(0, RISK_BODY_CHARS),
  })
  return {
    detailsChanged: answers.detailsChanged.noul >= 0.7,
    urgentPayment: answers.urgentPayment.noul >= 0.7,
  }
}

/** Who the mail pretends to be: a listed phishing domain, a forged known sender or a lookalike name. */
const senderRisk = async (
  message: Message,
  domain: string,
  replyDomain: string
): Promise<MessageRisk | null> => {
  const [phishing] = await listedDomains('phishing', [
    domain,
    replyDomain,
    ...linkHostsOf(message.body),
  ])
  if (phishing) {
    return { imitates: phishing, kind: 'known_phishing' }
  }
  const { domains } = await imitableDomains()
  if (message.auth?.dmarc === 'fail' && domains.has(registrable(domain))) {
    return { imitates: domain, kind: 'spoofed_sender' }
  }
  const imitates = await imitatedDomain(domain)
  return imitates ? { imitates, kind: 'lookalike_domain' } : null
}

const assess = async (
  userId: string,
  message: Message
): Promise<MessageRisk | null> => {
  const domain = domainOf(message.fromEmail)
  const replyDomain = message.replyTo ? domainOf(message.replyTo) : domain
  const pretends = await senderRisk(message, domain, replyDomain)
  if (pretends) {
    return pretends
  }
  const mentionsMoney = MONEY_WORDS.test(`${message.subject}\n${message.body}`)
  if (!mentionsMoney) {
    return null
  }
  // A freemail domain is shared by strangers: its stored details and senders say nothing about this one.
  if (FREEMAIL_DOMAINS.has(domain)) {
    const { detailsChanged } = await jevSignals(message.body)
    return detailsChanged ? { imitates: null, kind: 'payment_change' } : null
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
    (detail) => !knownHashes.has(paymentHashOf(detail))
  )
  const signals = await jevSignals(message.body)

  if ((known.length > 0 && newDetails.length > 0) || signals.detailsChanged) {
    return { imitates: null, kind: 'payment_change' }
  }
  const throwaway = await listedDomains('disposable', [domain, replyDomain])
  const age = details.length > 0 ? await domainAgeDays(domain) : null
  const isThrowaway =
    throwaway.length > 0 || (age !== null && age < YOUNG_DOMAIN_DAYS)
  const isNewSender =
    isThrowaway || !(await knownSender(userId, domain, message.receivedAt))
  if (
    isNewSender &&
    (signals.urgentPayment || replyDomain !== domain || isThrowaway) &&
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
          detailHash: paymentHashOf(detail),
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
      logError('risk check failed', error)
      return null
    })
    if (!risk) {
      // oxlint-disable-next-line eslint/no-await-in-loop -- see above
      await remember(userId, message)
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
      reason: t.risk[risk.kind](
        risk.imitates ?? senderDomainOrAddress(message.fromEmail)
      ),
      status: 'pending',
      threadId: message.threadId,
      title: t.risk.title,
      userId,
    })
  }
}
