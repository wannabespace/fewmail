import { db } from '@fewmail/db'
import type { SimpleMatch, messages } from '@fewmail/db/schema'
import { actions, bots } from '@fewmail/db/schema'
import { messages as dictionaries } from '@fewmail/shared/i18n'
import { and, eq, isNotNull } from 'drizzle-orm'

import { BOT_ORDER } from './bots'
import { getSettings } from './settings'
import { applyThreadEffect } from './thread-effects'

type Message = typeof messages.$inferSelect

const matchesSimple = (match: SimpleMatch, message: Message) => {
  const needle = match.value.trim().toLowerCase()
  switch (match.field) {
    case 'from': {
      return [message.fromEmail, message.fromName ?? '']
        .join(' ')
        .toLowerCase()
        .includes(needle)
    }
    case 'subject': {
      return message.subject.toLowerCase().includes(needle)
    }
    case 'mailingList': {
      return message.listUnsubscribe !== null
    }
    default: {
      return false
    }
  }
}

/** Runs on every plan without a model: the first matching simple bot acts on its own. */
export const applySimpleBots = async (userId: string, incoming: Message[]) => {
  const candidates = incoming.filter((message) => !message.isFromMe)
  if (candidates.length === 0) {
    return
  }
  const simple = await db
    .select()
    .from(bots)
    .where(
      and(
        eq(bots.userId, userId),
        eq(bots.enabled, true),
        isNotNull(bots.match)
      )
    )
    .orderBy(...BOT_ORDER)
  if (simple.length === 0) {
    return
  }
  const settings = await getSettings(userId)
  const t = dictionaries[settings?.language ?? 'en']

  await Promise.all(
    candidates.map(async (message) => {
      const bot = simple.find(
        (candidate) =>
          candidate.match && matchesSimple(candidate.match, message)
      )
      if (
        !bot ||
        (bot.effect !== 'archive' &&
          bot.effect !== 'mark_read' &&
          bot.effect !== 'trash' &&
          bot.effect !== 'unsubscribe')
      ) {
        return
      }
      const done = await applyThreadEffect(userId, message, bot.effect)
        .then(() => true)
        .catch(() => false)
      await db.insert(actions).values({
        autonomous: true,
        kind: bot.effect,
        messageId: message.id,
        reason: '',
        resolvedAt: done ? new Date() : null,
        botId: bot.id,
        status: done ? 'auto_done' : 'failed',
        threadId: message.threadId,
        title: t.bots.effect[bot.effect],
        userId,
      })
    })
  )
}
