import { db } from '@fewmail/db'
import { actions, messages, senderReports } from '@fewmail/db/schema'
import type { SpamVerdict } from '@fewmail/shared/agent'
import { FREEMAIL_DOMAINS } from '@fewmail/shared/email'
import { messages as dictionaries } from '@fewmail/shared/i18n'
import { and, eq, inArray, or } from 'drizzle-orm'

import { domainHashOf, domainOf, senderHashOf } from '../lib/keyed-hash'
import { ACTION_TOPICS, announceChange } from '../lib/live'
import { listedDomains } from './known-domains'
import { isSpammy, readPatterns, voteCounts, votePatterns } from './patterns'
import { getSettings } from './settings'
import { ownMessage } from './stored-mail'
import {
  changeThreadLabels,
  moveToSpam,
  proposeSpam,
  SPAM,
} from './thread-labels'

type Message = typeof messages.$inferSelect

/** A sender counts as spam (or vouched not-spam) for everyone only after this many different people said so. */
const MIN_SENDER_REPORTERS = 3
/** Company domains need more independent reporters, since one domain hosts many senders. */
const MIN_DOMAIN_REPORTERS = 5

const senderKeys = (email: string) => {
  const domain = domainOf(email)
  return {
    domainHash:
      domain && !FREEMAIL_DOMAINS.has(domain) ? domainHashOf(domain) : null,
    senderHash: senderHashOf(email),
  }
}

type Keyed = ReturnType<typeof senderKeys> & { message: Message }

const tally = async (
  column: typeof senderReports.senderHash | typeof senderReports.domainHash,
  hashes: string[]
) => {
  if (hashes.length === 0) {
    return new Map<string, { notSpam: number; spam: number }>()
  }
  const rows = await db
    .select({
      hash: column,
      ...voteCounts(senderReports.userId, senderReports.verdict),
    })
    .from(senderReports)
    .where(inArray(column, hashes))
    .groupBy(column)
  return new Map(rows.map(({ hash, ...counts }) => [hash ?? '', counts]))
}

const contactsOf = async (userId: string) => {
  const sent = await db
    .select({ to: messages.to })
    .from(messages)
    .where(and(eq(messages.userId, userId), eq(messages.isFromMe, true)))
  return new Set(
    sent.flatMap(({ to }) => to.map((address) => address.toLowerCase()))
  )
}

/** Public spammer lists name registrable domains; mail often comes from a subdomain of one. */
const isListed = (listed: Set<string>, domain: string) =>
  [...listed].some((entry) => domain === entry || domain.endsWith(`.${entry}`))

/** Runs before simple rules and the agent, on every plan; returns the messages it moved to spam. */
export const applySpamShield = async (userId: string, incoming: Message[]) => {
  const inbound = incoming.filter((message) => !message.isFromMe)
  if (inbound.length === 0) {
    return new Set<string>()
  }
  const keyed: Keyed[] = inbound.map((message) => ({
    message,
    ...senderKeys(message.fromEmail),
  }))
  const senderHashes = [...new Set(keyed.map(({ senderHash }) => senderHash))]
  const domainHashes = [
    ...new Set(
      keyed.flatMap(({ domainHash }) => (domainHash ? [domainHash] : []))
    ),
  ]

  const [own, senders, domains, contacts, settings, listed] = await Promise.all(
    [
      db
        .select({
          domainHash: senderReports.domainHash,
          senderHash: senderReports.senderHash,
          verdict: senderReports.verdict,
        })
        .from(senderReports)
        .where(
          and(
            eq(senderReports.userId, userId),
            or(
              inArray(senderReports.senderHash, senderHashes),
              inArray(senderReports.domainHash, domainHashes)
            )
          )
        ),
      tally(senderReports.senderHash, senderHashes),
      tally(senderReports.domainHash, domainHashes),
      contactsOf(userId),
      getSettings(userId),
      listedDomains(
        'spam',
        keyed
          .map(({ message }) => domainOf(message.fromEmail))
          .filter((domain) => domain && !FREEMAIL_DOMAINS.has(domain))
      ).then((rows) => new Set(rows)),
    ]
  )
  const ownVerdicts = new Map(
    own.map(({ senderHash, verdict }) => [senderHash, verdict])
  )
  const ownVouched = new Set(
    own.flatMap(({ domainHash, verdict }) =>
      domainHash && verdict === 'not_spam' ? [domainHash] : []
    )
  )
  const t = dictionaries[settings?.language ?? 'en']

  /** Vouching for others takes as many people as reporting, or one account could clear its own spam. */
  const isVouched = ({ domainHash, senderHash }: Keyed) =>
    (!!domainHash && ownVouched.has(domainHash)) ||
    (senders.get(senderHash)?.notSpam ?? 0) >= MIN_SENDER_REPORTERS ||
    (domainHash ? (domains.get(domainHash)?.notSpam ?? 0) : 0) >=
      MIN_DOMAIN_REPORTERS

  const isTrusted = (entry: Keyed) =>
    ownVerdicts.has(entry.senderHash) ||
    contacts.has(entry.message.fromEmail.toLowerCase()) ||
    isVouched(entry)

  const addressVerdict = (entry: Keyed) => {
    const { domainHash, message, senderHash } = entry
    const ownVerdict = ownVerdicts.get(senderHash)
    if (ownVerdict) {
      return ownVerdict === 'spam' ? t.spam.reasonYou : null
    }
    if (contacts.has(message.fromEmail.toLowerCase())) {
      return null
    }
    const sender = senders.get(senderHash)
    const domain = domainHash ? domains.get(domainHash) : undefined
    const community =
      (sender && isSpammy(sender.spam, sender.notSpam, MIN_SENDER_REPORTERS)) ||
      (domain && isSpammy(domain.spam, domain.notSpam, MIN_DOMAIN_REPORTERS))
    if (community) {
      return t.spam.reasonCommunity
    }
    return !isVouched(entry) && isListed(listed, domainOf(message.fromEmail))
      ? t.spam.reasonList
      : null
  }

  const { reasons: patterns, suspicions } = await readPatterns(
    userId,
    keyed
      .filter((entry) => !isTrusted(entry) && !addressVerdict(entry))
      .map(({ message }) => message)
  )
  await Promise.all(
    keyed.flatMap(({ message }) => {
      const suspicion = suspicions.get(message.id)
      if (!suspicion) {
        return []
      }
      message.suspicion = suspicion
      return [
        db
          .update(messages)
          .set({ suspicion })
          .where(eq(messages.id, message.id)),
      ]
    })
  )

  const moved = new Set<string>()
  await Promise.all(
    keyed.map(async (entry) => {
      const pattern = patterns.get(entry.message.id)
      const reason =
        addressVerdict(entry) ??
        (pattern ? t.spam.reasonPattern[pattern] : null)
      if (!reason) {
        return
      }
      moved.add(entry.message.id)
      await (reason === t.spam.reasonYou ? moveToSpam : proposeSpam)(
        userId,
        entry.message,
        reason,
        t
      )
    })
  )
  return moved
}

const vote = async (userId: string, message: Message, verdict: SpamVerdict) => {
  const keys = senderKeys(message.fromEmail)
  await db.transaction(async (tx) => {
    await tx
      .insert(senderReports)
      .values({ ...keys, userId, verdict })
      .onConflictDoUpdate({
        set: { updatedAt: new Date(), verdict },
        target: [senderReports.userId, senderReports.senderHash],
      })
    await votePatterns(tx, userId, message, verdict)
  })
}

export const reportSpam = async (userId: string, messageId: string) => {
  const message = await ownMessage(userId, messageId)
  await changeThreadLabels(userId, message.threadId, SPAM)
  await vote(userId, message, 'spam')
}

export const markNotSpam = async (userId: string, messageId: string) => {
  const message = await ownMessage(userId, messageId)
  await changeThreadLabels(userId, message.threadId, {
    add: ['INBOX'],
    remove: ['SPAM'],
  })
  await db
    .update(messages)
    .set({ suspicion: null })
    .where(
      and(eq(messages.userId, userId), eq(messages.threadId, message.threadId))
    )
  await db
    .update(actions)
    .set({ resolvedAt: new Date(), status: 'dismissed' })
    .where(
      and(
        eq(actions.userId, userId),
        eq(actions.threadId, message.threadId),
        eq(actions.kind, 'spam'),
        eq(actions.status, 'pending')
      )
    )
  await vote(userId, message, 'not_spam')
  await announceChange(userId, ACTION_TOPICS)
}
