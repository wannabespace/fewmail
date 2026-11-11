import { db } from '@fewmail/db'
import type { SimpleMatch, messages } from '@fewmail/db/schema'
import { actions, rules } from '@fewmail/db/schema'
import { messages as dictionaries } from '@fewmail/shared/i18n'
import { and, eq, isNotNull } from 'drizzle-orm'

import { applyEffect } from './agent'
import { getSettings } from './settings'

type Message = typeof messages.$inferSelect

export const matchesSimple = (match: SimpleMatch, message: Message) => {
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

/** Runs on every plan without a model: the first matching simple rule acts on its own. */
export const applySimpleRules = async (userId: string, incoming: Message[]) => {
  const candidates = incoming.filter((message) => !message.isFromMe)
  if (candidates.length === 0) {
    return
  }
  const simple = await db
    .select()
    .from(rules)
    .where(
      and(
        eq(rules.userId, userId),
        eq(rules.enabled, true),
        isNotNull(rules.match)
      )
    )
  if (simple.length === 0) {
    return
  }
  const settings = await getSettings(userId)
  const t = dictionaries[settings?.language ?? 'en']

  await Promise.all(
    candidates.map(async (message) => {
      const rule = simple.find(
        (candidate) =>
          candidate.match && matchesSimple(candidate.match, message)
      )
      if (
        !rule ||
        (rule.effect !== 'archive' &&
          rule.effect !== 'mark_read' &&
          rule.effect !== 'unsubscribe')
      ) {
        return
      }
      const done = await applyEffect(userId, message, rule.effect).then(
        () => true,
        () => false
      )
      await db.insert(actions).values({
        autonomous: true,
        kind: rule.effect,
        messageId: message.id,
        reason: '',
        resolvedAt: done ? new Date() : null,
        ruleId: rule.id,
        status: done ? 'auto_done' : 'failed',
        threadId: message.threadId,
        title: t.rules.effect[rule.effect],
        userId,
      })
    })
  )
}
