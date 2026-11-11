import { UNDO_SEND_SECONDS } from '@fewmail/shared/agent'
import type { Messages } from '@fewmail/shared/i18n'
import { messages } from '@fewmail/shared/i18n'
import { LOCALES, matchLocale } from '@fewmail/shared/i18n/locales'
import type { Context } from 'grammy'
import { Bot, InlineKeyboard, webhookCallback } from 'grammy'

import { env } from './env'
import { generateBrief, getLatestBrief, localClock } from './services/brief'
import { linkTelegramChat, userIdForChat } from './services/integrations'
import {
  approveAction,
  dismissAction,
  listQueue,
  redraftAction,
  updateDraft,
} from './services/mail'
import { cancelMail } from './services/outbox'
import { getPlanInfo, hasAgent } from './services/plan'
import { getSettings } from './services/settings'

type QueueItem = Awaited<ReturnType<typeof listQueue>>[number]

const TELEGRAM_TEXT_LIMIT = 3500

/** Chat → action whose draft the next text message replaces. Lost on restart, which only cancels an edit in progress. */
const editing = new Map<string, string>()

const escapeHtml = (text: string) =>
  text.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;')

const messagesForUser = async (userId: string) => {
  const settings = await getSettings(userId)
  return messages[settings?.language ?? 'en']
}

const messagesForChat = (ctx: Context) =>
  messages[matchLocale([ctx.from?.language_code ?? 'en'])]

const itemText = (t: Messages, { action, analysis, message }: QueueItem) =>
  [
    `<b>${escapeHtml(message?.fromName ?? message?.fromEmail ?? 'Fewmail')}</b> · ${escapeHtml(message?.subject ?? action.title)}`,
    analysis?.summary ? escapeHtml(analysis.summary) : null,
    action.kind === 'reply' && action.detail
      ? `\n<i>${t.telegram.draft}</i>\n${escapeHtml(action.detail).slice(0, TELEGRAM_TEXT_LIMIT)}`
      : null,
  ]
    .filter(Boolean)
    .join('\n')

const itemKeyboard = (t: Messages, { action }: QueueItem) => {
  const keyboard = new InlineKeyboard()
  if (action.kind === 'reply') {
    keyboard
      .text(t.telegram.send, `a:${action.id}`)
      .text(t.telegram.shorter, `r:${action.id}`)
      .text(t.telegram.edit, `e:${action.id}`)
  } else {
    keyboard.text(action.title, `a:${action.id}`)
  }
  return keyboard.text(t.telegram.skip, `d:${action.id}`)
}

const draftKeyboard = (t: Messages, actionId: string) =>
  new InlineKeyboard()
    .text(t.telegram.send, `a:${actionId}`)
    .text(t.telegram.edit, `e:${actionId}`)
    .text(t.telegram.skip, `d:${actionId}`)

const createBot = (token: string) => {
  const bot = new Bot(token)

  const requireUser = async (ctx: Context) => {
    const chatId = ctx.chat?.id
    const userId = chatId ? await userIdForChat(String(chatId)) : null
    if (chatId && !userId) {
      await bot.api.sendMessage(
        chatId,
        messagesForChat(ctx).telegram.connectFirst
      )
      return null
    }
    if (chatId && userId && !hasAgent(await getPlanInfo(userId))) {
      const t = await messagesForUser(userId)
      await bot.api.sendMessage(chatId, t.telegram.proOnly)
      return null
    }
    return userId
  }

  const sendQueue = async (chatId: number, userId: string) => {
    const t = await messagesForUser(userId)
    const queue = await listQueue(userId)
    if (queue.length === 0) {
      await bot.api.sendMessage(chatId, t.telegram.nothing)
      return
    }
    for (const item of queue) {
      // oxlint-disable-next-line eslint/no-await-in-loop -- queue items must arrive in order
      await bot.api.sendMessage(chatId, itemText(t, item), {
        parse_mode: 'HTML',
        reply_markup: itemKeyboard(t, item),
      })
    }
  }

  bot.command('start', async (ctx) => {
    const code = ctx.match.trim()
    const link = code ? await linkTelegramChat(code, String(ctx.chat.id)) : null
    if (link) {
      const t = await messagesForUser(link.userId)
      await ctx.reply(t.telegram.connected)
      return
    }
    await ctx.reply(messagesForChat(ctx).telegram.connectFirst)
  })

  bot.command('brief', async (ctx) => {
    const userId = await requireUser(ctx)
    if (!userId) {
      return
    }
    const settings = await getSettings(userId)
    const latest = await getLatestBrief(userId)
    const brief =
      latest && settings && latest.date === localClock(settings.timezone).date
        ? latest
        : await generateBrief(userId)
    await ctx.reply(
      `<b>${escapeHtml(brief.headline)}</b>\n\n${escapeHtml(brief.body)}`,
      { parse_mode: 'HTML' }
    )
  })

  bot.command('queue', async (ctx) => {
    const userId = await requireUser(ctx)
    if (userId) {
      await sendQueue(ctx.chat.id, userId)
    }
  })

  bot.on('callback_query:data', async (ctx) => {
    const userId = await requireUser(ctx)
    if (!userId || !ctx.chat) {
      await ctx.answerCallbackQuery()
      return
    }
    const t = await messagesForUser(userId)
    const [command, actionId = ''] = ctx.callbackQuery.data.split(':')

    try {
      if (command === 'a') {
        const { outboxId } = await approveAction(userId, actionId)
        await ctx.editMessageReplyMarkup(
          outboxId
            ? {
                reply_markup: new InlineKeyboard().text(
                  t.telegram.undo,
                  `u:${outboxId}`
                ),
              }
            : undefined
        )
        await ctx.answerCallbackQuery(
          outboxId ? t.telegram.sendingIn(UNDO_SEND_SECONDS) : t.telegram.done
        )
      } else if (command === 'u') {
        await cancelMail(userId, actionId)
        await ctx.editMessageReplyMarkup()
        await ctx.answerCallbackQuery(t.telegram.canceled)
      } else if (command === 'd') {
        await dismissAction(userId, actionId)
        await ctx.editMessageReplyMarkup()
        await ctx.answerCallbackQuery(t.telegram.skipped)
      } else if (command === 'r') {
        await ctx.answerCallbackQuery(t.telegram.rewriting)
        const action = await redraftAction(
          userId,
          actionId,
          t.queue.shorterInstruction
        )
        await ctx.reply(
          `<i>${t.telegram.newDraft}</i>\n${escapeHtml(action.detail ?? '')}`,
          { parse_mode: 'HTML', reply_markup: draftKeyboard(t, action.id) }
        )
      } else if (command === 'e') {
        editing.set(String(ctx.chat.id), actionId)
        await ctx.answerCallbackQuery()
        await ctx.reply(t.telegram.editPrompt)
      }
    } catch (error) {
      await ctx.answerCallbackQuery({
        show_alert: true,
        text:
          error instanceof Error ? error.message : t.telegram.somethingWrong,
      })
    }
  })

  bot.on('message:text', async (ctx) => {
    const actionId = editing.get(String(ctx.chat.id))
    const userId = actionId ? await requireUser(ctx) : null
    if (!actionId || !userId) {
      return
    }
    editing.delete(String(ctx.chat.id))
    const t = await messagesForUser(userId)
    const { text } = ctx.message

    if (text.startsWith('/')) {
      const action = await redraftAction(userId, actionId, text.slice(1))
      await ctx.reply(
        `<i>${t.telegram.newDraft}</i>\n${escapeHtml(action.detail ?? '')}`,
        { parse_mode: 'HTML', reply_markup: draftKeyboard(t, action.id) }
      )
      return
    }
    await updateDraft(userId, actionId, text)
    await ctx.reply(`<i>${t.telegram.willSend}</i>\n${escapeHtml(text)}`, {
      parse_mode: 'HTML',
      reply_markup: new InlineKeyboard()
        .text(t.telegram.sendThis, `a:${actionId}`)
        .text(t.telegram.skip, `d:${actionId}`),
    })
  })

  // oxlint-disable-next-line promise/prefer-await-to-callbacks -- grammY error handler API
  bot.catch((error) => console.error('telegram', error.error))

  return bot
}

export const bot = env.TELEGRAM_BOT_TOKEN
  ? createBot(env.TELEGRAM_BOT_TOKEN)
  : null

export const telegramWebhook =
  bot && env.TELEGRAM_WEBHOOK_SECRET
    ? webhookCallback(bot, 'std/http', {
        secretToken: env.TELEGRAM_WEBHOOK_SECRET,
      })
    : null

const commandsFor = (t: Messages) => [
  { command: 'brief', description: t.telegram.commands.brief },
  { command: 'queue', description: t.telegram.commands.queue },
]

export const startTelegram = async () => {
  if (!bot) {
    return
  }
  try {
    await Promise.all([
      bot.api.setMyCommands(commandsFor(messages.en)),
      ...LOCALES.map(({ code }) =>
        bot.api.setMyCommands(commandsFor(messages[code]), {
          language_code: code,
        })
      ),
    ])
  } catch (error) {
    console.error('telegram commands', error)
  }
  try {
    await (env.TELEGRAM_WEBHOOK_SECRET
      ? bot.api.setWebhook(`${env.API_URL}/telegram`, {
          secret_token: env.TELEGRAM_WEBHOOK_SECRET,
        })
      : bot.start())
  } catch (error) {
    console.error('telegram start', error)
  }
}

export const sendBrief = async (
  chatId: string,
  userId: string,
  brief: { body: string; headline: string }
) => {
  const t = await messagesForUser(userId)
  await bot?.api.sendMessage(
    chatId,
    `<b>${escapeHtml(brief.headline)}</b>\n\n${escapeHtml(brief.body)}\n\n${t.telegram.queueHint}`,
    { parse_mode: 'HTML' }
  )
}

export const sendUrgent = async (
  chatId: string,
  userId: string,
  item: QueueItem
) => {
  const t = await messagesForUser(userId)
  await bot?.api.sendMessage(
    chatId,
    `${t.telegram.urgent}\n${itemText(t, item)}`,
    { parse_mode: 'HTML', reply_markup: itemKeyboard(t, item) }
  )
}
