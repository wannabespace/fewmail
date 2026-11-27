import { db } from '@fewmail/db'
import { botMessages } from '@fewmail/db/schema'
import { parseSkill, readingSpeech, SKILLS } from '@fewmail/shared/agent'
import type { Messages } from '@fewmail/shared/i18n'
import { messages } from '@fewmail/shared/i18n'
import type { Locale } from '@fewmail/shared/i18n/locales'
import { formatResetDay } from '@fewmail/shared/i18n/locales'
import { isAfter, subDays, subMinutes } from 'date-fns'
import { and, desc, eq, isNotNull, like, lt } from 'drizzle-orm'

import { env } from '../env'
import { speak } from '../lib/elevenlabs'
import { transcribe } from '../lib/mistral'
import { capture } from '../lib/posthog'
import { ConsentChangedError } from './consent-error'
import { cardItem, decide, openItems, waitingText } from './decide'
import { savedThisWeek } from './home'
import { followMessage } from './instructions'
import { LimitReachedError } from './limit-error'
import type { listQueue } from './mail'
import { requireBudget } from './plan'
import { getReadingDay } from './reading'
import { getSettings } from './settings'

type QueueItem = Awaited<ReturnType<typeof listQueue>>[number]

/** `actionId` and `shown` are remembered for the sent message: replying to it targets that draft, and an answer in words binds to the items it put to the user (`decide`). */
export interface Reply {
  actionId?: string
  shown?: string[]
  text: string
  /** Also sent as a voice note, spoken from this text and counted against the user's speech; a reply with only a voice has empty `text`. */
  voice?: { text: string; userId: string }
}

/** What a typed command (or WhatsApp's template button) answers with. */
interface Pressed {
  replies?: () => Promise<Reply[]>
}

export interface Channel {
  bold: (text: string) => string
  italic: (text: string) => string
  link: (text: string, url: string) => string
  name: 'telegram' | 'whatsapp'
  /** Every piece of mail or user text goes through it: Telegram parses HTML. */
  plain: (text: string) => string
  /** Lines already formatted. */
  quote: (lines: string[]) => string
  shorter: boolean
}

/** One conversation: a Telegram chat id or a WhatsApp phone. */
export interface Chat {
  channel: Channel
  id: string
}

const DRAFT_LIMIT = 3500
const KEEP_DAYS = 30
const EXCHANGE_MINUTES = 30

export const localeFor = async (userId: string): Promise<Locale> => {
  const settings = await getSettings(userId)
  return settings?.language ?? 'en'
}

export const messagesFor = async (userId: string) =>
  messages[await localeFor(userId)]

export const failureText = (locale: Locale, error: unknown, voice: boolean) => {
  const t = messages[locale]
  if (error instanceof LimitReachedError) {
    return t.limits.usage(formatResetDay(locale, error.resetsAt))
  }
  if (error instanceof ConsentChangedError) {
    return t.errors.consentChanged
  }
  return voice ? t.telegram.voiceFailed : t.telegram.somethingWrong
}

const QUOTE_OPEN = '<blockquote>'
const QUOTE_CLOSE = '</blockquote>'

/** Splits at line breaks, so Telegram's HTML tags (never wider than a line here, but a `<blockquote>`, closed and reopened across parts) stay whole; an overlong line is cut before any entity it would break. */
export const splitText = (text: string, limit: number) => {
  const parts: string[] = []
  const room = limit - QUOTE_CLOSE.length
  let part = ''
  const cutAt = (end: number) => {
    const piece = part.slice(0, end)
    const quoted =
      piece.lastIndexOf(QUOTE_OPEN) > piece.lastIndexOf(QUOTE_CLOSE)
    parts.push(quoted ? `${piece}${QUOTE_CLOSE}` : piece)
    part = `${quoted ? QUOTE_OPEN : ''}${part.slice(end)}`
  }
  for (const line of text.split('\n')) {
    const joined = part ? `${part}\n${line}` : line
    if (joined.length <= room) {
      part = joined
      continue
    }
    if (part) {
      cutAt(part.length)
    }
    part += line
    while (part.length > room) {
      const entity = part.lastIndexOf('&', room - 1)
      cutAt(entity > room - 5 ? entity : room)
    }
  }
  return [...parts, part]
}

const INLINE =
  /\*\*(?<bold>.+?)\*\*|(?<![\p{L}\p{N}*_])[*_](?<italic>[^\s*_](?:.*?[^\s*_])?)[*_](?![\p{L}\p{N}*_])/gu
const QUOTED = /^>\s?/u
const BULLET = /^\s*[-*]\s+/u

const inline = (channel: Channel, line: string) => {
  let formatted = ''
  let at = 0
  for (const match of line.matchAll(INLINE)) {
    const { bold, italic = '' } = match.groups ?? {}
    formatted += channel.plain(line.slice(at, match.index))
    formatted +=
      bold === undefined ? channel.italic(italic) : channel.bold(bold)
    at = match.index + match[0].length
  }
  return formatted + channel.plain(line.slice(at))
}

/** The agent's Markdown (`agentInstructions` allows bold, italic, `- ` lists and `> ` quotes) in the channel's own formatting. */
export const fromMarkdown = (channel: Channel, text: string) => {
  const lines: string[] = []
  let quote: string[] = []
  for (const line of text.split('\n')) {
    if (QUOTED.test(line)) {
      quote.push(inline(channel, line.replace(QUOTED, '')))
      continue
    }
    if (quote.length > 0) {
      lines.push(channel.quote(quote))
      quote = []
    }
    lines.push(inline(channel, line.replace(BULLET, '• ')))
  }
  if (quote.length > 0) {
    lines.push(channel.quote(quote))
  }
  return lines.join('\n')
}

const keyOf = (chat: Chat, suffix: string) =>
  `${chat.channel.name}:${chat.id}:${suffix}`

/** Resolves false when the message was already remembered — how WhatsApp's redeliveries are skipped. */
export const remember = async (
  chat: Chat,
  messageId: string,
  actionId: string | null,
  shown?: string[]
) => {
  await db
    .delete(botMessages)
    .where(lt(botMessages.createdAt, subDays(new Date(), KEEP_DAYS)))
  const added = await db
    .insert(botMessages)
    .values({ actionId, key: keyOf(chat, messageId), shown })
    .onConflictDoNothing()
    .returning({ key: botMessages.key })
  return added.length > 0
}

/** What the user answers: the bot message they replied to, else the last list the bot put to them in this chat, and when. */
const answeredIn = async (chat: Chat, replyTo?: string) => {
  const [row] = await db
    .select({
      actionId: botMessages.actionId,
      createdAt: botMessages.createdAt,
      shown: botMessages.shown,
    })
    .from(botMessages)
    .where(
      replyTo
        ? eq(botMessages.key, keyOf(chat, replyTo))
        : and(
            like(botMessages.key, keyOf(chat, '%')),
            isNotNull(botMessages.shown)
          )
    )
    .orderBy(desc(botMessages.createdAt))
    .limit(1)
  return {
    actionId: replyTo ? (row?.actionId ?? null) : null,
    seenAt: row?.shown ? row.createdAt : undefined,
    shown: row?.shown ?? undefined,
  }
}

const rememberExchange = (
  chat: Chat,
  exchange: { answer: string; question: string }
) =>
  db
    .insert(botMessages)
    .values({ exchange, key: keyOf(chat, 'exchange') })
    .onConflictDoUpdate({
      set: { createdAt: new Date(), exchange },
      target: botMessages.key,
    })

/** "When did this one arrive?" only makes sense after the question before it, so the last exchange is kept for `EXCHANGE_MINUTES`. */
const lastExchange = async (chat: Chat) => {
  const [last] = await db
    .select()
    .from(botMessages)
    .where(eq(botMessages.key, keyOf(chat, 'exchange')))
  return last?.exchange &&
    isAfter(last.createdAt, subMinutes(new Date(), EXCHANGE_MINUTES))
    ? last.exchange
    : null
}

const clipped = ({ channel }: Chat, t: Messages, draft: string) =>
  draft.length > DRAFT_LIMIT
    ? `${channel.plain(`${draft.slice(0, DRAFT_LIMIT)}…`)}\n${channel.italic(t.telegram.draftClipped)}`
    : channel.plain(draft)

const draftReply = (
  chat: Chat,
  t: Messages,
  action: { detail: string | null; id: string }
): Reply => ({
  actionId: action.id,
  shown: [`card:${action.id}`],
  text: `${chat.channel.italic(t.telegram.newDraft)}\n${clipped(chat, t, action.detail ?? '')}\n${chat.channel.plain(`${t.telegram.send}?`)}`,
})

export const helpReply = (chat: Chat, t: Messages): Reply => ({
  text: chat.channel.plain(
    [
      `${t.telegram.help}\n`,
      ...SKILLS.map((skill) => `/${skill}: ${t.skills[skill]}`),
    ].join('\n')
  ),
})

/** The agent's answer; when it left something waiting for a yes, what waits after it, answered here in words like any list. */
const agentReply = async (
  chat: Chat,
  userId: string,
  t: Messages,
  { text, waiting }: { text: string; waiting: number }
): Promise<Reply> => {
  const [list] = waiting > 0 ? await queueReplies(chat, userId, t) : []
  return {
    shown: list?.shown,
    text: [fromMarkdown(chat.channel, text), list?.text]
      .filter(Boolean)
      .join('\n\n'),
  }
}

const senderLine = ({ channel }: Chat, { action, message }: QueueItem) =>
  `${channel.bold(message?.fromName ?? message?.fromEmail ?? 'Fewmail')} · ${channel.plain(message?.subject ?? action.title)}`

export const itemReply = (
  chat: Chat,
  t: Messages,
  item: QueueItem,
  urgent = false
): Reply => {
  const { plain } = chat.channel
  const { action, analysis } = item
  const open = cardItem(t, item)
  return {
    actionId: action.id,
    shown: [open.key],
    text: [
      urgent ? plain(t.telegram.urgent) : null,
      senderLine(chat, item),
      // A promise or a heads-up says what it is about in its own words; the email's summary only gives the context.
      action.kind === 'commitment' || action.kind === 'heads_up'
        ? plain(action.detail ?? action.title)
        : null,
      analysis?.summary ? plain(analysis.summary) : null,
      fromMarkdown(chat.channel, open.text.split('\n').slice(1).join('\n')),
    ]
      .filter(Boolean)
      .join('\n'),
  }
}

export interface Run {
  body: string
  headline: string
}

/** A schedule run's answer. */
export const runReply = (chat: Chat, run: Run): Reply => ({
  text: `${chat.channel.bold(run.headline)}\n\n${chat.channel.plain(run.body)}`,
})

/** Monday's weekly report: the time the agent saved over the last 7 days. */
export const weekReply = (chat: Chat, t: Messages, minutes: number): Reply => ({
  text: `${chat.channel.bold(t.today.saved(minutes))}\n\n${env.WEB_URL}/wrapped`,
})

/** Read aloud on Reading: a day's summary as it is written, titles as their own sentences. */
export const spokenReading = async (userId: string, day?: string) => {
  const { summary } = await getReadingDay(userId, day)
  return summary ? readingSpeech(summary) : ''
}

/** What waits, every bot's, as one numbered message the user answers in words. */
const queueReplies = async (
  chat: Chat,
  userId: string,
  t: Messages
): Promise<Reply[]> => {
  const items = await openItems(userId, null, t)
  const text = waitingText(t, items, true)
  return [
    text
      ? {
          shown: items.filter(({ listed }) => listed).map(({ key }) => key),
          text: fromMarkdown(chat.channel, text),
        }
      : { text: chat.channel.plain(t.telegram.nothing) },
  ]
}

/** Typed commands and WhatsApp's template button: `queue` says what waits, `week` the weekly report. Nothing is decided by a press. */
export const press = async (
  chat: Chat,
  userId: string,
  pressed: string
): Promise<Pressed> => {
  const t = await messagesFor(userId)
  const [command] = pressed.split(':')
  capture(userId, 'bot_pressed', { channel: chat.channel.name, command })
  if (command === 'week') {
    return {
      replies: async () => {
        const { minutes } = await savedThisWeek(userId)
        return [weekReply(chat, t, minutes)]
      },
    }
  }
  if (command === 'queue') {
    return { replies: () => queueReplies(chat, userId, t) }
  }
  return {}
}

export const hear = async (
  userId: string,
  audio: () => Promise<ArrayBuffer>,
  fileName = 'voice.ogg'
) => {
  // Checked before transcribing, which costs money whatever the message turns out to be.
  await requireBudget(userId)
  return transcribe(userId, await audio(), fileName)
}

/** Text read aloud in the agent's voice, paid from the month's allowance. */
export const speakFor = async (
  userId: string,
  text: string,
  format: Parameters<typeof speak>[2]
) => {
  await requireBudget(userId)
  return speak(userId, text, format)
}

/**
 * A typed or spoken message: first read against what the bot put to the user (`decide`: the message they replied to,
 * else the last list in this chat), and what it does not settle goes to `followMessage`; `replyTo` is the bot message it answers.
 */
export const follow = async (
  chat: Chat,
  userId: string,
  text: string,
  { replyTo, voice = false }: { replyTo?: string; voice?: boolean } = {}
): Promise<Reply> => {
  const t = await messagesFor(userId)
  const { link, plain } = chat.channel
  const skill = parseSkill(text)
  capture(userId, 'bot_messaged', { channel: chat.channel.name, voice })
  if (text.startsWith('/') && !skill) {
    return helpReply(chat, t)
  }
  const answered = await answeredIn(chat, replyTo)
  const decided = skill
    ? null
    : await decide(userId, {
        bot: null,
        channel: chat.channel.name,
        // The messenger already said what it heard.
        heard: false,
        seenAt: answered.seenAt,
        shown: answered.shown,
        text,
        voice,
      })
  if (decided && !decided.rest) {
    return { text: fromMarkdown(chat.channel, decided.text) }
  }
  const settled = decided
    ? `${fromMarkdown(chat.channel, decided.text)}\n\n`
    : ''
  const followed = await followMessage(
    userId,
    text,
    answered.actionId,
    await lastExchange(chat)
  )
  if (followed.skill) {
    return agentReply(chat, userId, t, followed.skill)
  }
  if (followed.answer) {
    const { answer } = followed
    await rememberExchange(chat, { answer: answer.answer, question: text })
    return {
      text: [
        settled + plain(answer.answer),
        ...(answer.sources.length ? [''] : []),
        ...answer.sources.map((source) =>
          link(
            `${source.from}: ${source.subject}`,
            `${env.WEB_URL}/mail/${source.threadId}`
          )
        ),
      ].join('\n'),
    }
  }
  if (followed.draft) {
    return draftReply(chat, t, followed.draft)
  }
  return decided ? { text: settled.trim() } : helpReply(chat, t)
}
