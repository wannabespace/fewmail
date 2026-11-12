import { db } from '@fewmail/db'
import {
  domainAges,
  knownDomains,
  mailboxes,
  messages,
  patternReports,
  templateReports,
} from '@fewmail/db/schema'
import type { PatternKind, SpamVerdict } from '@fewmail/shared/agent'
import { SUSPICION_SPAM } from '@fewmail/shared/agent'
import { differenceInDays, subDays } from 'date-fns'
import type { AnyColumn } from 'drizzle-orm'
import { and, eq, inArray, isNotNull, lt, sql } from 'drizzle-orm'

import { domainOf, linkHashOf, userHashOf } from '../lib/keyed-hash'
import { fingerprint, isNear, personalWords, sharesBand } from './bulk'
import { FREEMAIL_DOMAINS, popularDomainSet } from './known-domains'

type Message = typeof messages.$inferSelect
type Transaction = Parameters<Parameters<typeof db.transaction>[0]>[0]

export type PatternReason = 'auth' | 'infra' | 'link' | 'signals' | 'template'

const SPAM_PROBABILITY = 0.8
const TEMPLATE_REPORTERS = 3
const LINK_REPORTERS = 3
/** Shared sending networks carry honest mail too, so a network needs more votes and a cleaner record. */
const INFRA_REPORTERS = 5
/** Smoothed, 5 spam / 0 not-spam is 6/7 ≈ 0.857: raising this above that silently raises INFRA_REPORTERS. */
const INFRA_PROBABILITY = 0.85
const TEMPLATE_WINDOW_DAYS = 90
export const YOUNG_DOMAIN_DAYS = 30
const RDAP_TIMEOUT_MS = 4000
const DAY_MS = 24 * 60 * 60_000

/** Laplace-smoothed share of spam votes: 3 spam / 0 not-spam passes, 3 / 1 does not. */
export const isSpammy = (
  spam: number,
  notSpam: number,
  minReporters: number,
  probability = SPAM_PROBABILITY
) => spam >= minReporters && (spam + 1) / (spam + notSpam + 2) >= probability

/** Distinct voters, not rows: one person reporting five addresses at a domain is still one reporter. */
export const voteCounts = (voter: AnyColumn, verdict: AnyColumn) => ({
  notSpam: sql<number>`count(distinct ${voter}) filter (where ${verdict} = 'not_spam')::int`,
  spam: sql<number>`count(distinct ${voter}) filter (where ${verdict} = 'spam')::int`,
})

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

export const linkHostsOf = (body: string) =>
  [...body.matchAll(LINK_HOST)].map(
    (match) => match.groups?.host?.toLowerCase() ?? ''
  )

const linkDomainsOf = async (message: Message) => {
  const popular = await popularDomainSet()
  const own = registrable(domainOf(message.fromEmail))
  return [...new Set(linkHostsOf(message.body).map(registrable))].filter(
    (domain) => domain.includes('.') && domain !== own && !popular.has(domain)
  )
}

/** One vote per user on the template, the sending network and every unfamiliar linked domain. */
export const votePatterns = async (
  tx: Transaction,
  userId: string,
  message: Message,
  verdict: SpamVerdict
) => {
  const userHash = userHashOf(userId)
  const printed = fingerprint(message.body, await personalWords(userId))
  if (printed) {
    await tx
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
      hash: linkHashOf(domain),
      kind: 'link' as const,
    })),
  ]
  if (patterns.length > 0) {
    await tx
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
      sharesBand(
        templateReports,
        printed,
        subDays(new Date(), TEMPLATE_WINDOW_DAYS)
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
      ...voteCounts(patternReports.userHash, patternReports.verdict),
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
  /** False on a timeout, rate limit or outage: that is not an answer, so it is not cached. */
  const registeredAt = await fetch(`https://rdap.org/domain/${name}`, {
    headers: { accept: 'application/rdap+json' },
    signal: AbortSignal.timeout(RDAP_TIMEOUT_MS),
  })
    .then(async (response) => {
      if (response.status === 404) {
        return null
      }
      if (!response.ok) {
        return false
      }
      const data = (await response.json()) as {
        events?: { eventAction: string; eventDate: string }[]
      }
      const event = data.events?.find(
        ({ eventAction }) => eventAction === 'registration'
      )
      return event ? new Date(event.eventDate) : null
    })
    .catch(() => false as const)
  if (registeredAt === false) {
    return null
  }
  await db
    .insert(domainAges)
    .values({ domain: name, registeredAt })
    .onConflictDoNothing()
  return registeredAt ? differenceInDays(new Date(), registeredAt) : null
}

/** A mailbox's first sync has nothing older to compare with: none of its domains count as first-seen. */
const firstSeenTest = async (userId: string, candidates: Message[]) => {
  const earliest = new Date(
    Math.min(...candidates.map(({ receivedAt }) => receivedAt.getTime()))
  )
  const [synced, seen] = await Promise.all([
    db
      .select({ id: mailboxes.id })
      .from(mailboxes)
      .where(
        and(
          inArray(mailboxes.id, [
            ...new Set(candidates.map(({ mailboxId }) => mailboxId)),
          ]),
          isNotNull(mailboxes.lastSyncedAt)
        )
      ),
    db
      .selectDistinct({ domain: messages.fromDomain })
      .from(messages)
      .where(
        and(
          eq(messages.userId, userId),
          lt(messages.receivedAt, earliest),
          inArray(messages.fromDomain, [
            ...new Set(candidates.map(({ fromEmail }) => domainOf(fromEmail))),
          ])
        )
      ),
  ])
  const syncedIds = new Set(synced.map(({ id }) => id))
  const seenDomains = new Set(seen.map(({ domain }) => domain))
  return (message: Message) =>
    syncedIds.has(message.mailboxId) &&
    !seenDomains.has(domainOf(message.fromEmail))
}

const suspicionOf = async (message: Message, ageDays: number | null) =>
  Number(await shapeIsOdd(domainOf(message.fromEmail))) +
  Number(ageDays !== null && ageDays < YOUNG_DOMAIN_DAYS) +
  Number(weakAuth(message))

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
 * Community patterns never apply to authenticated mail from a domain the user already gets mail
 * from. One weak signal only yields a suspicion ("maybe spam"), which the caller stores.
 */
export const readPatterns = async (userId: string, candidates: Message[]) => {
  const reasons = new Map<string, PatternReason>()
  const suspicions = new Map<string, number>()
  if (candidates.length === 0) {
    return { reasons, suspicions }
  }
  const [personal, popular, isFirstSeen, links] = await Promise.all([
    personalWords(userId),
    popularDomainSet(),
    firstSeenTest(userId, candidates),
    Promise.all(
      candidates.map(
        async (message) => [message.id, await linkDomainsOf(message)] as const
      )
    ).then((entries) => new Map(entries)),
  ])
  const [infra, linkVotes] = await Promise.all([
    patternTally('infra', [
      ...new Set(candidates.flatMap(({ infraHash }) => infraHash ?? [])),
    ]),
    patternTally('link', [
      ...new Set([...links.values()].flat().map(linkHashOf)),
    ]),
  ])
  const ages = new Map<string, Promise<number | null>>()
  const ageOf = (domain: string) => {
    const age = ages.get(domain) ?? domainAgeDays(domain)
    ages.set(domain, age)
    return age
  }

  await Promise.all(
    candidates.map(async (message) => {
      const domain = domainOf(message.fromEmail)
      const isNew = isFirstSeen(message)
      const established = !isNew && message.auth?.dmarc === 'pass'
      const infraVotes = message.infraHash
        ? infra.get(message.infraHash)
        : undefined
      const reason = strongReason({
        infraSpam:
          !established &&
          !!infraVotes &&
          isSpammy(
            infraVotes.spam,
            infraVotes.notSpam,
            INFRA_REPORTERS,
            INFRA_PROBABILITY
          ),
        linkSpam:
          !established &&
          (links.get(message.id) ?? []).some((link) => {
            const votes = linkVotes.get(linkHashOf(link))
            return votes && isSpammy(votes.spam, votes.notSpam, LINK_REPORTERS)
          }),
        message,
        template: !established && (await templateIsSpam(message, personal)),
      })
      if (reason) {
        reasons.set(message.id, reason)
        return
      }
      if (FREEMAIL_DOMAINS.has(domain) || popular.has(registrable(domain))) {
        return
      }
      const suspicion = await suspicionOf(
        message,
        isNew ? await ageOf(domain) : null
      )
      if (suspicion >= SUSPICION_SPAM) {
        reasons.set(message.id, 'signals')
      } else if (suspicion > 0) {
        suspicions.set(message.id, suspicion)
      }
    })
  )
  return { reasons, suspicions }
}
