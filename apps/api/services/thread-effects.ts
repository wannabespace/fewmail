import { db } from '@fewmail/db'
import { messages } from '@fewmail/db/schema'
import type { GmailEffect } from '@fewmail/shared/agent'
import { and, eq } from 'drizzle-orm'

import { unsubscribeOneClick } from '../lib/gmail'
import { logError } from '../lib/log'
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

/**
 * Leaves the list `message` came from (RFC 8058 one-click) and archives its thread or everything the
 * sender sent. Only an unsubscribe that went out is remembered: later mail then makes the sender a
 * zombie, so a failed one must not. A sender the network already knows ignores unsubscribes is blocked.
 */
export const unsubscribe = async (
  userId: string,
  message: Message,
  scope: 'thread' | 'sender'
) => {
  const unsubscribed = message.listUnsubscribe
    ? await unsubscribeOneClick(
        message.listUnsubscribe,
        message.listUnsubscribePost
      ).catch((error: unknown) => {
        logError('one-click unsubscribe failed', error)
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
  return { blocked: isZombie, unsubscribed }
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
