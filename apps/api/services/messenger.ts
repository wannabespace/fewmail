import { db } from '@fewmail/db'
import { botMessages } from '@fewmail/db/schema'
import {
  parseSkill,
  PLAN_LIMITS,
  SKILLS,
  UNDO_SEND_SECONDS,
} from '@fewmail/shared/agent'
import type { Messages } from '@fewmail/shared/i18n'
import { messages } from '@fewmail/shared/i18n'
import type { Locale } from '@fewmail/shared/i18n/locales'
import { formatResetDay } from '@fewmail/shared/i18n/locales'
import { isAfter, subDays, subMinutes } from 'date-fns'
import { eq, lt } from 'drizzle-orm'

import { env } from '../env'
import { transcribe } from '../lib/mistral'
import { getChat } from './chat'
import { savedThisWeek } from './home'
import { followMessage } from './instructions'
import { LimitReachedError } from './limit-error'
import {
  approveAction,
  approveActions,
  dismissAction,
  listQueue,
  redraftAction,
  updateDraft,
} from './mail'
import { cancelMail } from './outbox'
import { getUsage, requireAgent } from './plan'
import { getReading } from './reading'
import { getSettings } from './settings'

type QueueItem = Awaited<ReturnType<typeof listQueue>>[number]

export interface Button {
  id: string
  title: string
}

/** `actionId` is remembered for the sent message, so replying to it targets that draft. */
export interface Reply {
  actionId?: string
  buttons?: Button[]
  text: string
  /** Also sent as a voice note, spoken from this text; a reply with only a voice has empty `text`. */
  voice?: string
}

/** What a button press changes: a short notice, the pressed message's new buttons (`[]` removes them) and slower replies after. */
export interface Pressed {
  buttons?: Button[]
  notice?: string
  replies?: () => Promise<Reply[]>
}

export interface Channel {
  bold: (text: string) => string
  italic: (text: string) => string
  name: 'telegram' | 'whatsapp'
  /** Every piece of mail or user text goes through it: Telegram parses HTML. */
  plain: (text: string) => string
  shorter: boolean
}

/** One conversation: a Telegram chat id or a WhatsApp phone. */
export interface Chat {
  channel: Channel
  id: string
}

const DRAFT_LIMIT = 3500
const KEEP_DAYS = 30
const EDIT_MINUTES = 30
const THREAD_LINK = /\[(?<label>[^\]]+)\]\(\?thread=[^)]*\)/gu

export const localeFor = async (userId: string): Promise<Locale> => {
  const settings = await getSettings(userId)
  return settings?.language ?? 'en'
}

export const messagesFor = async (userId: string) =>
  messages[await localeFor(userId)]

export const failureText = (locale: Locale, error: unknown, voice: boolean) => {
  const t = messages[locale]
  if (error instanceof LimitReachedError) {
    return t.limits.messages(formatResetDay(locale, error.resetsAt))
  }
  return voice ? t.telegram.voiceFailed : t.telegram.somethingWrong
}

/** Splits at line breaks, so Telegram's HTML tags (never wider than a line here) stay whole; an overlong line is cut before any entity it would break. */
export const splitText = (text: string, limit: number) => {
  const parts: string[] = []
  let part = ''
  for (const line of text.split('\n')) {
    const joined = part ? `${part}\n${line}` : line
    if (joined.length <= limit) {
      part = joined
      continue
    }
    if (part) {
      parts.push(part)
    }
    part = line
    while (part.length > limit) {
      const entity = part.lastIndexOf('&', limit - 1)
      const cut = entity > limit - 5 ? entity : limit
      parts.push(part.slice(0, cut))
      part = part.slice(cut)
    }
  }
  return [...parts, part]
}

const keyOf = (chat: Chat, suffix: string) =>
  `${chat.channel.name}:${chat.id}:${suffix}`

/** Resolves false when the message was already remembered — how WhatsApp's redeliveries are skipped. */
export const remember = async (
  chat: Chat,
  messageId: string,
  actionId: string | null
) => {
  await db
    .delete(botMessages)
    .where(lt(botMessages.createdAt, subDays(new Date(), KEEP_DAYS)))
  const added = await db
    .insert(botMessages)
    .values({ actionId, key: keyOf(chat, messageId) })
    .onConflictDoNothing()
    .returning({ key: botMessages.key })
  return added.length > 0
}

const shownAction = async (chat: Chat, messageId: string) => {
  const [shown] = await db
    .select({ actionId: botMessages.actionId })
    .from(botMessages)
    .where(eq(botMessages.key, keyOf(chat, messageId)))
  return shown?.actionId ?? null
}

const startEdit = (chat: Chat, actionId: string) =>
  db
    .insert(botMessages)
    .values({ actionId, key: keyOf(chat, 'edit') })
    .onConflictDoUpdate({
      set: { actionId, createdAt: new Date() },
      target: botMessages.key,
    })

/** Edit mode ends with the next message, or after `EDIT_MINUTES` so a forgotten one never swallows a later message. */
const takeEdit = async (chat: Chat) => {
  const [edit] = await db
    .delete(botMessages)
    .where(eq(botMessages.key, keyOf(chat, 'edit')))
    .returning()
  return edit?.actionId &&
    isAfter(edit.createdAt, subMinutes(new Date(), EDIT_MINUTES))
    ? edit.actionId
    : null
}

const clipped = ({ channel }: Chat, t: Messages, draft: string) =>
  draft.length > DRAFT_LIMIT
    ? `${channel.plain(`${draft.slice(0, DRAFT_LIMIT)}…`)}\n${channel.italic(t.telegram.draftClipped)}`
    : channel.plain(draft)

const draftButtons = (t: Messages, actionId: string): Button[] => [
  { id: `a:${actionId}`, title: t.telegram.send },
  { id: `e:${actionId}`, title: t.telegram.edit },
  { id: `d:${actionId}`, title: t.telegram.skip },
]

const draftReply = (
  chat: Chat,
  t: Messages,
  action: { detail: string | null; id: string }
): Reply => ({
  actionId: action.id,
  buttons: draftButtons(t, action.id),
  text: `${chat.channel.italic(t.telegram.newDraft)}\n${clipped(chat, t, action.detail ?? '')}`,
})

const queueButton = (t: Messages): Button => ({
  id: 'queue',
  title: t.telegram.commands.queue,
})

export const menuButtons = (t: Messages): Button[] => [queueButton(t)]

export const helpReply = (chat: Chat, t: Messages): Reply => ({
  buttons: menuButtons(t),
  text: chat.channel.plain(
    [
      `${t.telegram.help}\n`,
      ...SKILLS.map((skill) => `/${skill}: ${t.skills[skill]}`),
    ].join('\n')
  ),
})

const chatLinkReply = (
  chat: Chat,
  t: Messages,
  text: string,
  chatId: string
): Reply => ({
  text: chat.channel.plain(
    `${text}\n\n${t.schedule.open}: ${env.WEB_URL}/agent?chat=${chatId}`
  ),
})

export const itemReply = (
  chat: Chat,
  t: Messages,
  item: QueueItem,
  urgent = false
): Reply => {
  const { bold, plain } = chat.channel
  const { action, analysis, message } = item
  const isReply = action.kind === 'reply'
  return {
    actionId: action.id,
    buttons: [
      { id: `a:${action.id}`, title: isReply ? t.telegram.send : action.title },
      ...(isReply && chat.channel.shorter
        ? [{ id: `r:${action.id}`, title: t.telegram.shorter }]
        : []),
      ...(isReply ? [{ id: `e:${action.id}`, title: t.telegram.edit }] : []),
      { id: `d:${action.id}`, title: t.telegram.skip },
    ],
    text: [
      urgent ? plain(t.telegram.urgent) : null,
      `${bold(message?.fromName ?? message?.fromEmail ?? 'Fewmail')} · ${plain(message?.subject ?? action.title)}`,
      analysis?.summary ? plain(analysis.summary) : null,
      isReply && action.detail
        ? `\n${chat.channel.italic(t.telegram.draft)}\n${clipped(chat, t, action.detail)}`
        : null,
    ]
      .filter(Boolean)
      .join('\n'),
  }
}

export interface Run {
  body: string
  headline: string
}

/** A schedule run's or a forwarded email's answer. */
export const runReply = (chat: Chat, run: Run): Reply => ({
  text: `${chat.channel.bold(run.headline)}\n\n${chat.channel.plain(run.body)}`,
})

/** Monday's weekly report: the time the agent saved over the last 7 days. */
export const weekReply = (chat: Chat, t: Messages, minutes: number): Reply => ({
  text: `${chat.channel.bold(t.today.saved(minutes))}\n\n${env.WEB_URL}/wrapped`,
})

const DIGEST_SHOWN = 10

/** The day's newsletters as one message: sender in bold, what it says, then the page for the rest. */
export const readingReply = (
  chat: Chat,
  t: Messages,
  rows: Awaited<ReturnType<typeof getReading>>
): Reply => ({
  text: [
    chat.channel.bold(t.reading.digest(rows.length)),
    ...rows
      .slice(0, DIGEST_SHOWN)
      .map(
        ({ fromEmail, fromName, summary }) =>
          `${chat.channel.bold(fromName ?? fromEmail)}: ${chat.channel.plain(summary)}`
      ),
    `${env.WEB_URL}/reading`,
  ].join('\n\n'),
})

const SPOKEN_ITEMS = 5

/** Read aloud on Home: how many things need the user, then the first cards of the queue by title. */
export const spokenHome = async (userId: string) => {
  const [t, queue] = await Promise.all([messagesFor(userId), listQueue(userId)])
  return [
    t.today.headline(queue.length),
    ...queue
      .slice(0, SPOKEN_ITEMS)
      .map(({ action, analysis }) => analysis?.summary ?? action.title),
  ].join('\n')
}

/** WhatsApp shows three buttons at most. */
const ALIKE_BUTTONS = 3

/** After the cards, one button per kind with two or more of them: approving them all is still the user's yes. */
const alikeReply = (chat: Chat, t: Messages, queue: QueueItem[]): Reply[] => {
  const kinds = [...Map.groupBy(queue, ({ action }) => action.kind)]
    .filter(([, items]) => items.length > 1)
    .slice(0, ALIKE_BUTTONS)
  return kinds.length === 0
    ? []
    : [
        {
          buttons: kinds.map(([kind, items]) => ({
            id: `all:${kind}`,
            title: `${t.actionKind[kind]} · ${items.length}`,
          })),
          text: chat.channel.italic(t.telegram.approveAlike),
        },
      ]
}

const queueReplies = async (chat: Chat, userId: string, t: Messages) => {
  const queue = await listQueue(userId)
  return queue.length === 0
    ? [{ text: chat.channel.plain(t.telegram.nothing) }]
    : [
        ...queue.map((item) => itemReply(chat, t, item)),
        ...alikeReply(chat, t, queue),
      ]
}

const scheduleAnswer = async (
  chat: Chat,
  t: Messages,
  userId: string,
  chatId: string
) => {
  const { messages: history } = await getChat(userId, chatId)
  const answer =
    history
      .at(-1)
      ?.parts.flatMap((part) => (part.type === 'text' ? [part.text] : []))
      .join('\n')
      .replaceAll(THREAD_LINK, '$<label>') ?? ''
  return chatLinkReply(chat, t, answer, chatId)
}

/** Buttons and commands: `a:` approve, `u:` undo a send, `d:` skip, `r:` shorter, `e:` edit, `queue`, `reading`, `week`, `chat:` a schedule run's answer. */
export const press = async (
  chat: Chat,
  userId: string,
  pressed: string
): Promise<Pressed> => {
  const t = await messagesFor(userId)
  const [command, id = ''] = pressed.split(':')
  if (command === 'reading') {
    return {
      replies: async () => [readingReply(chat, t, await getReading(userId))],
    }
  }
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
  if (command === 'chat') {
    return { replies: async () => [await scheduleAnswer(chat, t, userId, id)] }
  }
  if (command === 'a') {
    const { outboxId } = await approveAction(userId, id)
    return outboxId
      ? {
          buttons: [{ id: `u:${outboxId}`, title: t.telegram.undo }],
          notice: t.telegram.sendingIn(UNDO_SEND_SECONDS),
        }
      : { buttons: [], notice: t.telegram.done }
  }
  if (command === 'all') {
    const queue = await listQueue(userId)
    const { approved } = await approveActions(
      userId,
      queue
        .filter(({ action }) => action.kind === id)
        .map(({ action }) => action.id)
    )
    return { buttons: [], notice: t.today.approvedMany(approved) }
  }
  if (command === 'u') {
    await cancelMail(userId, id)
    return { buttons: [], notice: t.telegram.canceled }
  }
  if (command === 'd') {
    await dismissAction(userId, id)
    return { buttons: [], notice: t.telegram.skipped }
  }
  if (command === 'r') {
    return {
      notice: t.telegram.rewriting,
      replies: async () => [
        draftReply(
          chat,
          t,
          await redraftAction(userId, id, t.queue.shorterInstruction)
        ),
      ],
    }
  }
  if (command === 'e') {
    await startEdit(chat, id)
    return {
      replies: () =>
        Promise.resolve([{ text: chat.channel.plain(t.telegram.editPrompt) }]),
    }
  }
  return {}
}

/** Checked before transcribing, which costs money whatever the message turns out to be. */
const requireMessageRoom = async (userId: string) => {
  const [plan, usage] = await Promise.all([
    requireAgent(userId),
    getUsage(userId),
  ])
  const total = PLAN_LIMITS[plan.kind].messages
  if (usage.messages >= total) {
    throw new LimitReachedError('messages', total)
  }
}

export const hear = async (
  userId: string,
  audio: () => Promise<ArrayBuffer>,
  fileName = 'voice.ogg'
) => {
  await requireMessageRoom(userId)
  return transcribe(await audio(), fileName)
}

/** A typed or spoken message: the replacement for a draft in edit mode, else whatever `followMessage` makes of it; `replyTo` is the bot message it answers. */
export const follow = async (
  chat: Chat,
  userId: string,
  text: string,
  replyTo?: string
): Promise<Reply> => {
  const t = await messagesFor(userId)
  const { italic, plain } = chat.channel
  const editing = await takeEdit(chat)
  if (editing) {
    if (text.startsWith('/')) {
      return draftReply(
        chat,
        t,
        await redraftAction(userId, editing, text.slice(1))
      )
    }
    await updateDraft(userId, editing, text)
    return {
      actionId: editing,
      buttons: [
        { id: `a:${editing}`, title: t.telegram.sendThis },
        { id: `d:${editing}`, title: t.telegram.skip },
      ],
      text: `${italic(t.telegram.willSend)}\n${clipped(chat, t, text)}`,
    }
  }
  if (text.startsWith('/') && !parseSkill(text)) {
    return helpReply(chat, t)
  }
  const targetId = replyTo ? await shownAction(chat, replyTo) : null
  const { answer, draft, skill } = await followMessage(userId, text, targetId)
  if (skill) {
    return chatLinkReply(chat, t, skill.text, skill.chatId)
  }
  if (answer) {
    return {
      text: [
        plain(answer.answer),
        ...answer.sources.map((source) =>
          italic(`[${source.number}] ${source.from} · ${source.subject}`)
        ),
      ].join('\n'),
    }
  }
  return draft ? draftReply(chat, t, draft) : helpReply(chat, t)
}
