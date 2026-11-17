import { db } from '@fewmail/db'
import { mailboxes, messages } from '@fewmail/db/schema'
import type { GmailEffect } from '@fewmail/shared/agent'
import { textToHtml } from '@fewmail/shared/email'
import { and, eq, isNull } from 'drizzle-orm'

import { sendMail, unsubscribeOneClick } from '../lib/gmail'
import { logError } from '../lib/log'
import { unsubscribeByPage } from '../lib/unsubscribe-page'
import { NotFoundError } from './mail-errors'
import {
  ARCHIVE,
  changeThreadLabels,
  MARK_READ,
  trashThreadOf,
} from './thread-labels'
import { recordUnsubscribe, zombieStats } from './zombies'

type Message = typeof messages.$inferSelect

const listThreadIds = async (userId: string, message: Message) => {
  const rows = await db
    .selectDistinct({ threadId: messages.threadId })
    .from(messages)
    .where(
      and(
        eq(messages.userId, userId),
        message.listId
          ? eq(messages.listId, message.listId)
          : and(
              eq(messages.fromEmail, message.fromEmail),
              isNull(messages.listId)
            )
      )
    )
  return rows.map(({ threadId }) => threadId)
}

const LINKS = /<(?<link>[^>]+)>/gu
const ONE_ADDRESS = /^[^\s@,;<>]+@[^\s@,;<>]+$/u

/** An unsubscribe request by email is part of leaving the list, so it goes out with the unsubscribe the user or their rule chose. The sender wrote the link: one address, and its subject and body only as plain text. */
const unsubscribeByMail = async (message: Message, mailto: string) => {
  const url = new URL(mailto)
  const to = decodeURIComponent(url.pathname)
  const [mailbox] = await db
    .select()
    .from(mailboxes)
    .where(eq(mailboxes.id, message.mailboxId))
  if (!mailbox || !ONE_ADDRESS.test(to)) {
    return false
  }
  const subject = url.searchParams.get('subject') ?? 'unsubscribe'
  const text = url.searchParams.get('body') ?? 'unsubscribe'
  await sendMail(mailbox, {
    bcc: [],
    cc: [],
    html: textToHtml(text),
    inReplyTo: null,
    references: null,
    subject,
    text,
    threadId: null,
    to: [to],
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
 * list sent. Only an unsubscribe that went out is remembered: later mail then makes the list a
 * zombie, so a failed one must not. A list the network already knows ignores unsubscribes comes back as `ignoresUnsubscribe`
 * (unless it has a List-Id: such a sender may send other lists too, and a `from` rule would take them with it), so the user can
 * say yes to a trash rule for the sender; never one made for them.
 */
export const unsubscribe = async (
  userId: string,
  message: Message,
  scope: 'thread' | 'list'
) => {
  const unsubscribed = message.listUnsubscribe
    ? await leaveList(message).catch((error: unknown) => {
        logError('unsubscribe failed', error)
        return false
      })
    : false
  if (unsubscribed) {
    await recordUnsubscribe(userId, message)
  }
  const { isZombie } = await zombieStats(message)
  const threadIds =
    scope === 'thread'
      ? [message.threadId]
      : await listThreadIds(userId, message)
  await Promise.all(
    threadIds.map((threadId) => changeThreadLabels(userId, threadId, ARCHIVE))
  )
  // A page that needs a person (JavaScript, a choice, a login) is left to the user: they get its link.
  return {
    ignoresUnsubscribe: isZombie && !message.listId,
    link: unsubscribed ? null : pageOf(message),
    unsubscribed,
  }
}

export const unsubscribeMessage = async (
  userId: string,
  messageId: string,
  scope: 'thread' | 'list'
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
