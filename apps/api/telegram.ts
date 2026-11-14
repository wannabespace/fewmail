import { SKILLS } from '@fewmail/shared/agent'
import type { Messages } from '@fewmail/shared/i18n'
import { messages } from '@fewmail/shared/i18n'
import { LOCALES, matchLocale } from '@fewmail/shared/i18n/locales'
import { Result } from 'better-result'
import type { Api, Context } from 'grammy'
import { Bot, InlineKeyboard, InputFile, webhookCallback } from 'grammy'

import { env } from './env'
import { canSpeak } from './lib/elevenlabs'
import { logError } from './lib/log'
import { linkTelegramChat, userIdForChat } from './services/integrations'
import { LimitReachedError } from './services/limit-error'
import type { listQueue } from './services/mail'
import type { Button, Channel, Reply, Run } from './services/messenger'
import {
  readingReply,
  failureText,
  follow,
  hear,
  helpReply,
  itemReply,
  localeFor,
  messagesFor,
  press,
  remember,
  runReply,
  speakFor,
  splitText,
  weekReply,
} from './services/messenger'
import { getPlanInfo, hasAgent } from './services/plan'

type QueueItem = Awaited<ReturnType<typeof listQueue>>[number]

const MESSAGE_LIMIT = 4096
const NO_PREVIEW = { is_disabled: true }

const escapeHtml = (text: string) =>
  text.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;')

const channel: Channel = {
  bold: (text) => `<b>${escapeHtml(text)}</b>`,
  italic: (text) => `<i>${escapeHtml(text)}</i>`,
  link: (text, url) => `<a href="${escapeHtml(url)}">${escapeHtml(text)}</a>`,
  name: 'telegram',
  plain: escapeHtml,
  shorter: true,
}

const chatOf = (id: number | string) => ({ channel, id: String(id) })

const keyboard = (buttons: Button[]) =>
  InlineKeyboard.from([
    buttons.map(({ id, title }) => InlineKeyboard.text(title, id)),
  ])

/** A failed voice never takes the text answer with it. */
const sendVoice = async (
  api: Api,
  chatId: number | string,
  voice: NonNullable<Reply['voice']>
) => {
  const sent = await Result.tryPromise(async () => {
    const audio = await speakFor(voice.userId, voice.text, 'messenger')
    await api.sendVoice(
      chatId,
      new InputFile(new Uint8Array(audio), 'voice.ogg')
    )
  })
  if (sent.isErr() && !(sent.error.cause instanceof LimitReachedError)) {
    logError('telegram voice', sent.error.cause)
  }
}

const send = async (
  api: Api,
  chatId: number | string,
  { actionId, buttons, text, voice }: Reply
) => {
  if (voice) {
    await sendVoice(api, chatId, voice)
  }
  if (!text) {
    return
  }
  const parts = splitText(text, MESSAGE_LIMIT)
  const last = parts.pop() ?? ''
  for (const part of parts) {
    // oxlint-disable-next-line eslint/no-await-in-loop -- parts must arrive in order
    await api.sendMessage(chatId, part, {
      link_preview_options: NO_PREVIEW,
      parse_mode: 'HTML',
    })
  }
  const sent = await api.sendMessage(chatId, last, {
    link_preview_options: NO_PREVIEW,
    parse_mode: 'HTML',
    ...(buttons?.length ? { reply_markup: keyboard(buttons) } : {}),
  })
  if (actionId) {
    await remember(chatOf(chatId), String(sent.message_id), actionId)
  }
}

const sendAll = async (api: Api, chatId: number, replies: Reply[]) => {
  for (const reply of replies) {
    // oxlint-disable-next-line eslint/no-await-in-loop -- replies must arrive in order
    await send(api, chatId, reply)
  }
}

const messagesForChat = (ctx: Context) =>
  messages[matchLocale([ctx.from?.language_code ?? 'en'])]

const connectFirst = (ctx: Context) =>
  messagesForChat(ctx).telegram.connectFirst(`${env.WEB_URL}/settings`)

const commandsFor = (t: Messages) => [
  { command: 'queue', description: t.telegram.commands.queue },
  ...SKILLS.map((skill) => ({ command: skill, description: t.skills[skill] })),
]

/** A spoken message is answered by voice too, when the server can speak. */
const followText = async (
  ctx: Context,
  userId: string,
  text: string,
  { spoken = false } = {}
) => {
  if (!ctx.chat) {
    return
  }
  const replyTo = ctx.message?.reply_to_message?.message_id
  await ctx.replyWithChatAction('typing')
  const reply = await follow(
    chatOf(ctx.chat.id),
    userId,
    text,
    replyTo ? String(replyTo) : undefined
  )
  await send(ctx.api, ctx.chat.id, {
    ...reply,
    voice: spoken && canSpeak ? { text: reply.text, userId } : undefined,
  })
}

const createBot = (token: string) => {
  const bot = new Bot(token)

  const requireUser = async (ctx: Context) => {
    const chatId = ctx.chat?.id
    const userId = chatId ? await userIdForChat(String(chatId)) : null
    if (chatId && !userId) {
      await bot.api.sendMessage(chatId, connectFirst(ctx))
      return null
    }
    if (chatId && userId && !hasAgent(await getPlanInfo(userId))) {
      const t = await messagesFor(userId)
      await bot.api.sendMessage(chatId, t.telegram.proOnly)
      return null
    }
    return userId
  }

  const sendHelp = async (chatId: number, userId: string) =>
    send(bot.api, chatId, helpReply(chatOf(chatId), await messagesFor(userId)))

  bot.command('start', async (ctx) => {
    const code = ctx.match.trim()
    const link = code ? await linkTelegramChat(code, String(ctx.chat.id)) : null
    if (link) {
      const t = await messagesFor(link.userId)
      await ctx.reply(link.taken ? t.telegram.chatTaken : t.telegram.connected)
      return
    }
    const userId = await userIdForChat(String(ctx.chat.id))
    await (userId
      ? sendHelp(ctx.chat.id, userId)
      : ctx.reply(connectFirst(ctx)))
  })

  bot.command('help', async (ctx) => {
    const userId = await requireUser(ctx)
    if (userId) {
      await sendHelp(ctx.chat.id, userId)
    }
  })

  bot.command('queue', async (ctx) => {
    const userId = await requireUser(ctx)
    if (!userId) {
      return
    }
    await ctx.replyWithChatAction('typing')
    const { replies } = await press(chatOf(ctx.chat.id), userId, 'queue')
    await sendAll(ctx.api, ctx.chat.id, (await replies?.()) ?? [])
  })

  for (const skill of SKILLS) {
    bot.command(skill, async (ctx) => {
      const userId = await requireUser(ctx)
      if (userId) {
        await followText(ctx, userId, `/${skill} ${ctx.match}`)
      }
    })
  }

  bot.on('callback_query:data', async (ctx) => {
    const userId = await requireUser(ctx)
    if (!userId || !ctx.chat) {
      await ctx.answerCallbackQuery()
      return
    }
    const chatId = ctx.chat.id
    // Telegram takes one answer per press: a second one throws.
    let answered = false
    const pressed = await Result.tryPromise(async () => {
      const { buttons, notice, replies } = await press(
        chatOf(chatId),
        userId,
        ctx.callbackQuery.data
      )
      answered = true
      await ctx.answerCallbackQuery(notice)
      if (buttons) {
        await ctx.editMessageReplyMarkup(
          buttons.length > 0 ? { reply_markup: keyboard(buttons) } : undefined
        )
      }
      if (replies) {
        await sendAll(ctx.api, chatId, await replies())
      }
    })
    if (pressed.isErr()) {
      logError('telegram press', pressed.error.cause)
      const text = failureText(
        await localeFor(userId),
        pressed.error.cause,
        false
      )
      await (answered
        ? ctx.reply(text)
        : ctx.answerCallbackQuery({ show_alert: true, text }))
    }
  })

  bot.on('message:voice', async (ctx) => {
    const userId = await requireUser(ctx)
    if (!userId) {
      return
    }
    const t = await messagesFor(userId)
    const heard = await hear(userId, async () => {
      const file = await ctx.getFile()
      const response = await fetch(
        `https://api.telegram.org/file/bot${token}/${file.file_path ?? ''}`
      )
      return response.arrayBuffer()
    })
    if (!heard) {
      await ctx.reply(t.telegram.voiceFailed)
      return
    }
    await send(ctx.api, ctx.chat.id, {
      text: escapeHtml(t.telegram.heard(heard)),
    })
    await followText(ctx, userId, heard, { spoken: true })
  })

  bot.on('message:text', async (ctx) => {
    const userId = await requireUser(ctx)
    if (userId) {
      await followText(ctx, userId, ctx.message.text)
    }
  })

  // oxlint-disable-next-line promise/prefer-await-to-callbacks -- grammY error handler API
  bot.catch(async ({ ctx, error }) => {
    logError('telegram', error)
    if (!ctx.message) {
      return
    }
    const { message } = ctx
    // The chat may be gone; the error is already logged.
    await Result.tryPromise(async () => {
      const userId = await userIdForChat(String(message.chat.id))
      const locale = userId
        ? await localeFor(userId)
        : matchLocale([ctx.from?.language_code ?? 'en'])
      await ctx.reply(failureText(locale, error, !!message.voice))
    })
  })

  return bot
}

export const bot = env.TELEGRAM_BOT_TOKEN
  ? createBot(env.TELEGRAM_BOT_TOKEN)
  : null

export const telegramWebhook =
  bot && env.TELEGRAM_WEBHOOK_SECRET
    ? webhookCallback(bot, 'std/http', {
        // Drafts and answers take longer than grammY's 10 s: on "throw" Telegram retries the update and holds every later one behind it.
        onTimeout: 'return',
        secretToken: env.TELEGRAM_WEBHOOK_SECRET,
      })
    : null

export const startTelegram = async () => {
  if (!bot) {
    return
  }
  const commands = await Result.tryPromise(() =>
    Promise.all([
      bot.api.setMyCommands(commandsFor(messages.en)),
      ...LOCALES.map(({ code }) =>
        bot.api.setMyCommands(commandsFor(messages[code]), {
          language_code: code,
        })
      ),
    ])
  )
  if (commands.isErr()) {
    logError('telegram commands', commands.error.cause)
  }
  const started = await Result.tryPromise<unknown>(() =>
    env.TELEGRAM_WEBHOOK_SECRET
      ? bot.api.setWebhook(`${env.API_URL}/telegram`, {
          secret_token: env.TELEGRAM_WEBHOOK_SECRET,
        })
      : bot.start()
  )
  if (started.isErr()) {
    // Only the message: grammy's error carries the request payload, webhook secret included.
    logError('telegram start', started.error.cause)
  }
}

export const sendRun = async (chatId: string, run: Run) => {
  if (bot) {
    await send(bot.api, chatId, runReply(chatOf(chatId), run))
  }
}

export const sendWeek = async (
  chatId: string,
  userId: string,
  minutes: number
) => {
  if (bot) {
    const t = await messagesFor(userId)
    await send(bot.api, chatId, weekReply(chatOf(chatId), t, minutes))
  }
}

export const sendReading = async (
  chatId: string,
  userId: string,
  reading: Parameters<typeof readingReply>[2]
) => {
  if (bot) {
    const t = await messagesFor(userId)
    await send(bot.api, chatId, readingReply(chatOf(chatId), t, reading))
  }
}

export const sendUrgent = async (
  chatId: string,
  userId: string,
  item: QueueItem
) => {
  if (bot) {
    const t = await messagesFor(userId)
    await send(bot.api, chatId, itemReply(chatOf(chatId), t, item, true))
  }
}
