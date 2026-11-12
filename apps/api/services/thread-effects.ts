import { db } from '@fewmail/db'
import { mailboxes, messages } from '@fewmail/db/schema'
import type { GmailEffect } from '@fewmail/shared/agent'
import { and, eq } from 'drizzle-orm'

import { sendMail, unsubscribeOneClick } from '../lib/gmail'
import { logError } from '../lib/log'
import { unsubscribeByPage } from '../lib/unsubscribe-page'
import { NotFoundError } from './mail-errors'
import { createRule, listRules } from './rules'
import {
  ARCHIVE,
  changeThreadLabels,
  MARK_READ,
  trashThreadOf,
} from './thread-labels'
import { recordUnsubscribe, zombieStats } from './zombies'

type Message = typeof messages.$inferSelect

const blockSenderOnce = async (userId: string, fromEmail: string) => {
  const existing = await listRules(userId)
  const isBlocked = existing.some(
    ({ effect, match }) =>
      effect === 'trash' && match?.field === 'from' && match.value === fromEmail
  )
  if (!isBlocked) {
    await createRule(userId, {
      effect: 'trash',
      match: { field: 'from', value: fromEmail },
    })
  }
}

const senderThreadIds = async (userId: string, fromEmail: string) => {
  const rows = await db
    .selectDistinct({ threadId: messages.threadId })
    .from(messages)
    .where(and(eq(messages.userId, userId), eq(messages.fromEmail, fromEmail)))
  return rows.map(({ threadId }) => threadId)
}

const LINKS = /<(?<link>[^>]+)>/gu

/** An unsubscribe request by email is part of leaving the list, so it goes out with the unsubscribe the user or their rule chose. */
const unsubscribeByMail = async (message: Message, mailto: string) => {
  const url = new URL(mailto)
  const [mailbox] = await db
    .select()
    .from(mailboxes)
    .where(eq(mailboxes.id, message.mailboxId))
  if (!mailbox || !url.pathname.includes('@')) {
    return false
  }
  const subject = url.searchParams.get('subject') ?? 'unsubscribe'
  const text = url.searchParams.get('body') ?? 'unsubscribe'
  await sendMail(mailbox, {
    bcc: [],
    cc: [],
    html: text,
    inReplyTo: null,
    references: null,
    subject,
    text,
    threadId: null,
    to: [decodeURIComponent(url.pathname)],
  })
  return true
}

const listLinks = (message: Message) =>
  [...(message.listUnsubscribe ?? '').matchAll(LINKS)].map(
    ({ groups }) => groups?.link?.trim() ?? ''
  )

const pageOf = (message: Message) =>
  listLinks(message).find((link) => /^https?:/iu.test(link)) ?? null

/** One-click first (RFC 8058), then the list's page, then its mailto: the order a person would try them. */
const leaveList = async (message: Message) => {
  if (
    await unsubscribeOneClick(
      message.listUnsubscribe ?? '',
      message.listUnsubscribePost
    )
  ) {
    return true
  }
  const links = listLinks(message)
  const page = pageOf(message)
  if (page && (await unsubscribeByPage(page))) {
    return true
  }
  const mailto = links.find((link) => /^mailto:/iu.test(link))
  return mailto ? unsubscribeByMail(message, mailto) : false
}

/**
 * Leaves the list `message` came from (RFC 8058 one-click, its page or its mailto) and archives its thread or everything the
 * sender sent. Only an unsubscribe that went out is remembered: later mail then makes the sender a
 * zombie, so a failed one must not. A sender the network already knows ignores unsubscribes is blocked.
 */
export const unsubscribe = async (
  userId: string,
  message: Message,
  scope: 'thread' | 'sender'
) => {
  const unsubscribed = message.listUnsubscribe
    ? await leaveList(message).catch((error: unknown) => {
        logError('unsubscribe failed', error)
        return false
      })
    : false
  if (unsubscribed) {
    await recordUnsubscribe(userId, message.fromEmail)
  }
  const { isZombie } = await zombieStats(message.fromEmail)
  if (isZombie) {
    await blockSenderOnce(userId, message.fromEmail)
  }
  const threadIds =
    scope === 'thread'
      ? [message.threadId]
      : await senderThreadIds(userId, message.fromEmail)
  await Promise.all(
    threadIds.map((threadId) => changeThreadLabels(userId, threadId, ARCHIVE))
  )
  // A page that needs a person (JavaScript, a choice, a login) is left to the user: they get its link.
  return {
    blocked: isZombie,
    link: unsubscribed ? null : pageOf(message),
    unsubscribed,
  }
}

export const unsubscribeMessage = async (
  userId: string,
  messageId: string,
  scope: 'thread' | 'sender'
) => {
  const [message] = await db
    .select()
    .from(messages)
    .where(and(eq(messages.id, messageId), eq(messages.userId, userId)))
  if (!message) {
    throw new NotFoundError('Message not found')
  }
  return unsubscribe(userId, message, scope)
}

/** The one way an approved action, a rule or a click changes a thread in Gmail. */
export const applyThreadEffect = async (
  userId: string,
  message: Message,
  effect: GmailEffect
) => {
  if (effect === 'unsubscribe') {
    await unsubscribe(userId, message, 'thread')
  } else if (effect === 'trash') {
    await trashThreadOf(userId, message.threadId)
  } else {
    await changeThreadLabels(
      userId,
      message.threadId,
      effect === 'archive' ? ARCHIVE : MARK_READ
    )
  }
}
