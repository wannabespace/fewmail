import { db } from '@fewmail/db'
import {
  domainAges,
  knownDomains,
  messages,
  patternReports,
  templateReports,
} from '@fewmail/db/schema'
import type { PatternKind, SpamVerdict } from '@fewmail/shared/agent'
import { SUSPICION_SPAM } from '@fewmail/shared/agent'
import { differenceInDays, subDays } from 'date-fns'
import { and, eq, inArray, lt, or, sql } from 'drizzle-orm'

import { domainOf, keyedHash, userHashOf } from '../lib/keyed-hash'
import { fingerprint, isNear, personalWords } from './bulk'
import { popularDomainSet } from './known-domains'

type Message = typeof messages.$inferSelect

export type PatternReason = 'auth' | 'infra' | 'link' | 'signals' | 'template'

const SPAM_PROBABILITY = 0.8
const TEMPLATE_REPORTERS = 3
const LINK_REPORTERS = 3
/** Shared sending networks (SES, SendGrid) carry honest mail too, so a network needs more votes and a cleaner record. */
const INFRA_REPORTERS = 5
const INFRA_PROBABILITY = 0.9
const TEMPLATE_WINDOW_DAYS = 90
const YOUNG_DOMAIN_DAYS = 30
const RDAP_TIMEOUT_MS = 4000
const DAY_MS = 24 * 60 * 60_000

/** Laplace-smoothed share of spam votes: 3 spam / 0 not-spam passes, 3 / 1 does not. */
export const isSpammy = (
  spam: number,
  notSpam: number,
  minReporters: number,
  probability = SPAM_PROBABILITY
) => spam >= minReporters && (spam + 1) / (spam + notSpam + 2) >= probability

const SECOND_LEVEL = /^(?:ac|co|com|edu|go|gov|ne|net|or|org)$/u

/** `mail.shop.example.co.uk` → `example.co.uk`: what someone actually registered. */
export const registrable = (domain: string) => {
  const parts = domain.toLowerCase().split('.').filter(Boolean)
  const keep =
    parts.length >= 3 &&
    SECOND_LEVEL.test(parts.at(-2) ?? '') &&
    (parts.at(-1) ?? '').length === 2
      ? 3
      : 2
  return parts.slice(-keep).join('.')
}

const LINK_HOST = /https?:\/\/(?<host>[^\s/"'<>?#:]+)/giu

const linkDomainsOf = async (message: Message) => {
  const popular = await popularDomainSet()
  const own = registrable(domainOf(message.fromEmail))
  return [
    ...new Set(
      [...message.body.matchAll(LINK_HOST)].map((match) =>
        registrable(match.groups?.host ?? '')
      )
    ),
  ].filter(
    (domain) => domain.includes('.') && domain !== own && !popular.has(domain)
  )
}

const linkHash = (domain: string) => keyedHash(`link:${domain}`)

/** One vote per user on the template, the sending network and every unfamiliar linked domain. */
export const votePatterns = async (
  userId: string,
  message: Message,
  verdict: SpamVerdict
) => {
  const userHash = userHashOf(userId)
  const printed = fingerprint(message.body, await personalWords(userId))
  if (printed) {
    await db
      .insert(templateReports)
      .values({
        ...printed,
        print: printed.print.toString(16),
        userHash,
        verdict,
      })
      .onConflictDoUpdate({
        set: { createdAt: new Date(), verdict },
        target: [templateReports.userHash, templateReports.print],
      })
  }
  const links = await linkDomainsOf(message)
  const patterns: { hash: string; kind: PatternKind }[] = [
    ...(message.infraHash
      ? [{ hash: message.infraHash, kind: 'infra' as const }]
      : []),
    ...links.map((domain) => ({
      hash: linkHash(domain),
      kind: 'link' as const,
    })),
  ]
  if (patterns.length > 0) {
    await db
      .insert(patternReports)
      .values(patterns.map((pattern) => ({ ...pattern, userHash, verdict })))
      .onConflictDoUpdate({
        set: { updatedAt: new Date(), verdict: sql`excluded.verdict` },
        target: [
          patternReports.userHash,
          patternReports.kind,
          patternReports.hash,
        ],
      })
  }
}

const templateIsSpam = async (message: Message, personal: string[]) => {
  const printed = fingerprint(message.body, personal)
  if (!printed) {
    return false
  }
  const near = await db
    .select({
      print: templateReports.print,
      userHash: templateReports.userHash,
      verdict: templateReports.verdict,
    })
    .from(templateReports)
    .where(
      and(
        sql`${templateReports.createdAt} >= ${subDays(new Date(), TEMPLATE_WINDOW_DAYS)}`,
        or(
          eq(templateReports.band0, printed.band0),
          eq(templateReports.band1, printed.band1),
          eq(templateReports.band2, printed.band2),
          eq(templateReports.band3, printed.band3)
        )
      )
    )
  const voters = new Map<string, SpamVerdict>()
  for (const row of near) {
    if (isNear(printed.print, row.print)) {
      voters.set(row.userHash, row.verdict)
    }
  }
  const votes = [...voters.values()]
  return isSpammy(
    votes.filter((verdict) => verdict === 'spam').length,
    votes.filter((verdict) => verdict === 'not_spam').length,
    TEMPLATE_REPORTERS
  )
}

const patternTally = async (kind: PatternKind, hashes: string[]) => {
  if (hashes.length === 0) {
    return new Map<string, { notSpam: number; spam: number }>()
  }
  const rows = await db
    .select({
      hash: patternReports.hash,
      notSpam: sql<number>`count(*) filter (where ${patternReports.verdict} = 'not_spam')::int`,
      spam: sql<number>`count(*) filter (where ${patternReports.verdict} = 'spam')::int`,
    })
    .from(patternReports)
    .where(
      and(eq(patternReports.kind, kind), inArray(patternReports.hash, hashes))
    )
    .groupBy(patternReports.hash)
  return new Map(rows.map(({ hash, ...counts }) => [hash, counts]))
}

const failsAuth = (message: Message) =>
  message.auth?.dmarc === 'fail' &&
  message.auth.spf !== 'pass' &&
  message.auth.dkim !== 'pass'

const weakAuth = (message: Message) =>
  !!message.auth && message.auth.dmarc !== 'pass' && message.auth.spf !== 'pass'

let tlds: { at: number; risky: Set<string> } = { at: 0, risky: new Set() }

/** TLDs where public spammer lists outnumber popular sites by far, learned from the feeds; a country TLD only when no popular site uses it (.id is Indonesia, not spam). */
const riskyTlds = async () => {
  if (Date.now() - tlds.at > DAY_MS) {
    const rows = await db
      .select({
        popular: sql<number>`count(*) filter (where ${knownDomains.list} = 'popular')::int`,
        spam: sql<number>`count(*) filter (where ${knownDomains.list} = 'spam')::int`,
        tld: sql<string>`substring(${knownDomains.domain} from '[^.]+$')`,
      })
      .from(knownDomains)
      .where(inArray(knownDomains.list, ['popular', 'spam']))
      .groupBy(sql`3`)
    tlds = {
      at: Date.now(),
      risky: new Set(
        rows
          .filter(({ popular, spam, tld }) =>
            tld.length === 2
              ? spam >= 200 && popular === 0
              : spam >= 200 && spam / (popular + 1) >= 100
          )
          .map(({ tld }) => tld)
      ),
    }
  }
  return tlds.risky
}

/** Machine-made names flip between letters and digits (k7x9q2mz) or have no vowels to speak of (qwrtpsdfgh). */
export const looksGenerated = (label: string) => {
  if (label.startsWith('xn--')) {
    return false
  }
  const flips = label.match(/(?=\d\p{L}|\p{L}\d)/gu)?.length ?? 0
  const letters = label.replaceAll(/[^a-z]/gu, '')
  return flips >= 5 || (letters.length >= 7 && !/[aeiouy]/u.test(letters))
}

const shapeIsOdd = async (domain: string) => {
  const name = registrable(domain)
  const [label = '', ...rest] = name.split('.')
  const risky = await riskyTlds()
  return looksGenerated(label) || risky.has(rest.at(-1) ?? '')
}

/** RDAP (the registries' own WHOIS successor); a registry without RDAP simply gives no signal. */
export const domainAgeDays = async (domain: string) => {
  const name = registrable(domain)
  const [cached] = await db
    .select()
    .from(domainAges)
    .where(eq(domainAges.domain, name))
  if (cached) {
    return cached.registeredAt
      ? differenceInDays(new Date(), cached.registeredAt)
      : null
  }
  const registeredAt = await fetch(`https://rdap.org/domain/${name}`, {
    headers: { accept: 'application/rdap+json' },
    signal: AbortSignal.timeout(RDAP_TIMEOUT_MS),
  })
    .then(async (response) => {
      if (!response.ok) {
        return null
      }
      const data = (await response.json()) as {
        events?: { eventAction: string; eventDate: string }[]
      }
      const event = data.events?.find(
        ({ eventAction }) => eventAction === 'registration'
      )
      return event ? new Date(event.eventDate) : null
    })
    .catch(() => null)
  await db
    .insert(domainAges)
    .values({ domain: name, registeredAt })
    .onConflictDoNothing()
  return registeredAt ? differenceInDays(new Date(), registeredAt) : null
}

const seenBefore = async (userId: string, domains: string[], before: Date) => {
  if (domains.length === 0) {
    return new Set<string>()
  }
  const rows = await db
    .selectDistinct({
      domain: sql<string>`split_part(${messages.fromEmail}, '@', 2)`,
    })
    .from(messages)
    .where(
      and(
        eq(messages.userId, userId),
        lt(messages.receivedAt, before),
        inArray(sql`split_part(${messages.fromEmail}, '@', 2)`, domains)
      )
    )
  return new Set(rows.map(({ domain }) => domain))
}

const suspicionOf = async (message: Message, isNew: boolean) => {
  const domain = domainOf(message.fromEmail)
  const young = isNew ? await domainAgeDays(domain) : null
  return (
    Number(await shapeIsOdd(domain)) +
    Number(young !== null && young < YOUNG_DOMAIN_DAYS) +
    Number(weakAuth(message))
  )
}

const strongReason = (signals: {
  infraSpam: boolean
  linkSpam: boolean
  message: Message
  template: boolean
}): PatternReason | null => {
  if (signals.template) {
    return 'template'
  }
  if (signals.infraSpam) {
    return 'infra'
  }
  if (signals.linkSpam) {
    return 'link'
  }
  return failsAuth(signals.message) ? 'auth' : null
}

/**
 * Spam by pattern rather than address, for senders the user never wrote to and nobody vouched for:
 * a reported template, a reported sending network, reported link domains, failed authentication,
 * or weak signals (odd domain shape, freshly registered domain, weak authentication) that add up.
 * One weak signal only marks the mail as "maybe spam".
 */
export const readPatterns = async (
  userId: string,
  candidates: Message[],
  skipDomains: Set<string>
) => {
  const reasons = new Map<string, PatternReason>()
  if (candidates.length === 0) {
    return reasons
  }
  const personal = await personalWords(userId)
  const popular = await popularDomainSet()
  const earliest = new Date(
    Math.min(...candidates.map(({ receivedAt }) => receivedAt.getTime()))
  )
  const seen = await seenBefore(
    userId,
    [...new Set(candidates.map(({ fromEmail }) => domainOf(fromEmail)))],
    earliest
  )
  const links = new Map(
    await Promise.all(
      candidates.map(
        async (message) => [message.id, await linkDomainsOf(message)] as const
      )
    )
  )
  const [infra, linkVotes] = await Promise.all([
    patternTally('infra', [
      ...new Set(candidates.flatMap(({ infraHash }) => infraHash ?? [])),
    ]),
    patternTally('link', [
      ...new Set([...links.values()].flat().map(linkHash)),
    ]),
  ])

  for (const message of candidates) {
    const domain = domainOf(message.fromEmail)
    const isNew = !seen.has(domain)
    const infraVotes = message.infraHash
      ? infra.get(message.infraHash)
      : undefined
    const linkSpam = (links.get(message.id) ?? []).some((link) => {
      const votes = linkVotes.get(linkHash(link))
      return votes && isSpammy(votes.spam, votes.notSpam, LINK_REPORTERS)
    })
    // oxlint-disable-next-line eslint/no-await-in-loop -- RDAP results are cached per domain, so a later message from the same domain must wait for the earlier lookup
    const template = await templateIsSpam(message, personal)
    const reason = strongReason({
      infraSpam:
        !!infraVotes &&
        (isNew || message.auth?.dmarc !== 'pass') &&
        isSpammy(
          infraVotes.spam,
          infraVotes.notSpam,
          INFRA_REPORTERS,
          INFRA_PROBABILITY
        ),
      linkSpam,
      message,
      template,
    })
    if (reason) {
      reasons.set(message.id, reason)
      continue
    }
    if (skipDomains.has(domain) || popular.has(registrable(domain))) {
      continue
    }
    // oxlint-disable-next-line eslint/no-await-in-loop -- see above
    const suspicion = await suspicionOf(message, isNew)
    if (suspicion >= SUSPICION_SPAM) {
      reasons.set(message.id, 'signals')
    } else if (suspicion > 0) {
      // oxlint-disable-next-line eslint/no-await-in-loop -- see above
      await db
        .update(messages)
        .set({ suspicion })
        .where(eq(messages.id, message.id))
      message.suspicion = suspicion
    }
  }
  return reasons
}
