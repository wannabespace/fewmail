import { db } from '@fewmail/db'
import { actions, messages, senderReports } from '@fewmail/db/schema'
import type { SpamVerdict } from '@fewmail/shared/agent'
import { messages as dictionaries } from '@fewmail/shared/i18n'
import { and, eq, inArray, sql } from 'drizzle-orm'

import { domainOf, keyedHash, senderHashOf } from '../lib/keyed-hash'
import { listedDomains } from './known-domains'
import { NotFoundError } from './mail-errors'
import { isSpammy, readPatterns, votePatterns } from './patterns'
import { getSettings } from './settings'
import { changeThreadLabels } from './thread-labels'

type Message = typeof messages.$inferSelect

/** A sender counts as spam for everyone only after this many different people reported it. */
const MIN_SENDER_REPORTERS = 3
/** Company domains need more independent reporters, since one domain hosts many senders. */
const MIN_DOMAIN_REPORTERS = 5

const SPAM = { add: ['SPAM'], remove: ['INBOX', 'UNREAD'] }

/** Shared mailbox providers: a spammer on gmail.com says nothing about gmail.com. */
export const FREEMAIL_DOMAINS = new Set([
  'aol.com',
  'gmail.com',
  'gmx.com',
  'gmx.de',
  'googlemail.com',
  'hotmail.com',
  'i.ua',
  'icloud.com',
  'live.com',
  'mail.com',
  'mail.ru',
  'me.com',
  'msn.com',
  'outlook.com',
  'proton.me',
  'protonmail.com',
  'qq.com',
  'ukr.net',
  'yahoo.com',
  'yandex.ru',
  'zoho.com',
])

export const senderKeys = (email: string) => {
  const domain = domainOf(email)
  return {
    domainHash:
      domain && !FREEMAIL_DOMAINS.has(domain)
        ? keyedHash(`domain:${domain}`)
        : null,
    senderHash: senderHashOf(email),
  }
}

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
      notSpam: sql<number>`count(*) filter (where ${senderReports.verdict} = 'not_spam')::int`,
      spam: sql<number>`count(*) filter (where ${senderReports.verdict} = 'spam')::int`,
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

/** Runs before simple rules and the agent, on every plan; returns the messages it moved to spam. */
/** Public spammer lists name registrable domains; mail often comes from a subdomain of one. */
const isListed = (listed: Set<string>, domain: string) =>
  [...listed].some((entry) => domain === entry || domain.endsWith(`.${entry}`))

export const applySpamShield = async (userId: string, incoming: Message[]) => {
  const inbound = incoming.filter((message) => !message.isFromMe)
  if (inbound.length === 0) {
    return new Set<string>()
  }
  const keyed = inbound.map((message) => ({
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
          senderHash: senderReports.senderHash,
          verdict: senderReports.verdict,
        })
        .from(senderReports)
        .where(
          and(
            eq(senderReports.userId, userId),
            inArray(senderReports.senderHash, senderHashes)
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
  const patterns = await readPatterns(
    userId,
    keyed
      .filter(
        ({ message, senderHash }) =>
          !contacts.has(message.fromEmail.toLowerCase()) &&
          !own.some((row) => row.senderHash === senderHash)
      )
      .map(({ message }) => message),
    FREEMAIL_DOMAINS
  )
  const ownVerdicts = new Map(
    own.map(({ senderHash, verdict }) => [senderHash, verdict])
  )
  const t = dictionaries[settings?.language ?? 'en']

  const verdictFor = ({
    domainHash,
    message,
    senderHash,
  }: (typeof keyed)[number]) => {
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
    const vouched = (domain?.notSpam ?? 0) > 0 || (sender?.notSpam ?? 0) > 0
    if (vouched) {
      return null
    }
    if (isListed(listed, domainOf(message.fromEmail))) {
      return t.spam.reasonList
    }
    const pattern = patterns.get(message.id)
    return pattern ? t.spam.reasonPattern[pattern] : null
  }

  const moved = new Set<string>()
  await Promise.all(
    keyed.map(async (entry) => {
      const reason = verdictFor(entry)
      if (!reason) {
        return
      }
      const done = await changeThreadLabels(
        userId,
        entry.message.threadId,
        SPAM
      ).then(
        () => true,
        () => false
      )
      moved.add(entry.message.id)
      await db.insert(actions).values({
        autonomous: true,
        kind: 'spam',
        messageId: entry.message.id,
        reason,
        resolvedAt: done ? new Date() : null,
        status: done ? 'auto_done' : 'failed',
        threadId: entry.message.threadId,
        title: t.actionKind.spam,
        userId,
      })
    })
  )
  return moved
}

const vote = async (userId: string, message: Message, verdict: SpamVerdict) => {
  const keys = senderKeys(message.fromEmail)
  await db
    .insert(senderReports)
    .values({ ...keys, userId, verdict })
    .onConflictDoUpdate({
      set: { updatedAt: new Date(), verdict },
      target: [senderReports.userId, senderReports.senderHash],
    })
  await votePatterns(userId, message, verdict)
}

const ownMessage = async (userId: string, messageId: string) => {
  const [message] = await db
    .select()
    .from(messages)
    .where(and(eq(messages.id, messageId), eq(messages.userId, userId)))
  if (!message) {
    throw new NotFoundError('Email not found')
  }
  return message
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
  await vote(userId, message, 'not_spam')
}
