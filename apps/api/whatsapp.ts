import { createHmac, timingSafeEqual } from 'node:crypto'

import type { Messages } from '@fewmail/shared/i18n'
import { messages } from '@fewmail/shared/i18n'
import { Result } from 'better-result'
import { addHours, isBefore } from 'date-fns'

import { env } from './env'
import { canSpeak } from './lib/elevenlabs'
import { logError } from './lib/log'
import {
  linkWhatsappPhone,
  userIdForPhone,
  whatsappForUser,
} from './services/integrations'
import { LimitReachedError } from './services/limit-error'
import type { listQueue } from './services/mail'
import type { Button, Channel, Chat, Reply, Run } from './services/messenger'
import {
  readingReply,
  failureText,
  follow,
  hear,
  itemReply,
  localeFor,
  menuButtons,
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

interface Inbound {
  audio?: { id: string }
  button?: { payload: string }
  context?: { id: string }
  from: string
  id: string
  interactive?: { button_reply?: { id: string } }
  text?: { body: string }
}

const GRAPH = 'https://graph.facebook.com/v23.0'
const BUTTON_TITLE_LIMIT = 20
const BODY_LIMIT = 1024
const TEXT_LIMIT = 4096

const config =
  env.WHATSAPP_TOKEN && env.WHATSAPP_PHONE_NUMBER_ID && env.WHATSAPP_APP_SECRET
    ? {
        appSecret: env.WHATSAPP_APP_SECRET,
        phoneNumberId: env.WHATSAPP_PHONE_NUMBER_ID,
        token: env.WHATSAPP_TOKEN,
      }
    : null

const channel: Channel = {
  bold: (text) => `*${text}*`,
  italic: (text) => `_${text}_`,
  link: (text, url) => `${text}\n${url}`,
  name: 'whatsapp',
  plain: (text) => text,
  shorter: false,
}

const chatOf = (phone: string): Chat => ({ channel, id: phone })

/** Takes a Graph path or a full media URL; both need the token. */
const graph = async (path: string, init?: RequestInit) => {
  if (!config) {
    throw new Error('WhatsApp is not configured')
  }
  const response = await fetch(
    path.startsWith('https://') ? path : `${GRAPH}/${path}`,
    {
      ...init,
      headers: {
        Authorization: `Bearer ${config.token}`,
        'Content-Type': 'application/json',
      },
    }
  )
  if (!response.ok) {
    // Only the status and Meta's error: the request body carries mail content.
    throw new Error(`WhatsApp ${response.status}: ${await response.text()}`)
  }
  return response
}

const post = async (to: string, message: Record<string, unknown>) => {
  const response = await graph(`${config?.phoneNumberId}/messages`, {
    body: JSON.stringify({ messaging_product: 'whatsapp', to, ...message }),
    method: 'POST',
  })
  const { messages: sent } = (await response.json()) as {
    messages: { id: string }[]
  }
  return sent[0]?.id ?? ''
}

const say = async (to: string, text: string) => {
  let sent = ''
  for (const part of splitText(text, TEXT_LIMIT)) {
    // oxlint-disable-next-line eslint/no-await-in-loop -- parts must arrive in order
    sent = await post(to, { text: { body: part }, type: 'text' })
  }
  return sent
}

const clip = (text: string) =>
  text.length > BUTTON_TITLE_LIMIT
    ? `${text.slice(0, BUTTON_TITLE_LIMIT - 1)}…`
    : text

/** WhatsApp allows three reply buttons and a 1024-character body; longer text goes first as its own message. */
const ask = async (to: string, text: string, buttons: Button[]) => {
  const fits = text.length <= BODY_LIMIT
  if (!fits) {
    await say(to, text)
  }
  return post(to, {
    interactive: {
      action: {
        buttons: buttons.map(({ id, title }) => ({
          reply: { id, title: clip(title) },
          type: 'reply',
        })),
      },
      body: { text: fits ? text : '⬆️' },
      type: 'button',
    },
    type: 'interactive',
  })
}

/** Media upload is multipart, so it skips `graph`'s JSON header. A failed voice never takes the text answer with it. */
const sendVoice = async (to: string, voice: NonNullable<Reply['voice']>) => {
  const sent = await Result.tryPromise(async () => {
    const audio = await speakFor(voice.userId, voice.text, 'messenger')
    const form = new FormData()
    form.append('messaging_product', 'whatsapp')
    form.append('type', 'audio/ogg')
    form.append('file', new Blob([audio], { type: 'audio/ogg' }), 'voice.ogg')
    const uploaded = await fetch(`${GRAPH}/${config?.phoneNumberId}/media`, {
      body: form,
      headers: { Authorization: `Bearer ${config?.token}` },
      method: 'POST',
    })
    if (!uploaded.ok) {
      throw new Error(
        `WhatsApp media ${uploaded.status}: ${await uploaded.text()}`
      )
    }
    const { id } = (await uploaded.json()) as { id: string }
    await post(to, { audio: { id }, type: 'audio' })
  })
  if (sent.isErr() && !(sent.error.cause instanceof LimitReachedError)) {
    logError('whatsapp voice', sent.error.cause)
  }
}

const send = async (to: string, { actionId, buttons, text, voice }: Reply) => {
  if (voice) {
    await sendVoice(to, voice)
  }
  if (!text) {
    return
  }
  const sent = buttons?.length
    ? await ask(to, text, buttons)
    : await say(to, text)
  if (actionId) {
    await remember(chatOf(to), sent, actionId)
  }
}

const pressButton = async (to: string, userId: string, pressed: string) => {
  const { buttons, notice, replies } = await press(chatOf(to), userId, pressed)
  if (notice) {
    await send(to, { buttons, text: notice })
  }
  for (const reply of (await replies?.()) ?? []) {
    // oxlint-disable-next-line eslint/no-await-in-loop -- replies must arrive in order
    await send(to, reply)
  }
}

const download = async (mediaId: string) => {
  const media = await graph(mediaId)
  const { url } = (await media.json()) as { url: string }
  const audio = await graph(url)
  return audio.arrayBuffer()
}

const handle = async (inbound: Inbound) => {
  const to = inbound.from
  const text = inbound.text?.body
  // Before the phone's own account: a link code sent from a linked phone is never a request to its agent.
  const link = text ? await linkWhatsappPhone(text, to) : null
  if (link) {
    const t = await messagesFor(link.userId)
    await (link.taken
      ? say(to, t.whatsapp.phoneTaken)
      : ask(to, t.whatsapp.connected, menuButtons(t)))
    return
  }
  const userId = await userIdForPhone(to)
  if (!userId) {
    await say(to, messages.en.whatsapp.connectFirst(`${env.WEB_URL}/settings`))
    return
  }
  const t = await messagesFor(userId)
  if (!hasAgent(await getPlanInfo(userId))) {
    await say(to, t.whatsapp.proOnly)
    return
  }
  const { audio, context } = inbound
  const handled = await Result.tryPromise(async () => {
    const pressed =
      inbound.interactive?.button_reply?.id ?? inbound.button?.payload
    if (pressed) {
      await pressButton(to, userId, pressed)
    } else if (audio) {
      const heard = await hear(userId, () => download(audio.id))
      if (!heard) {
        await say(to, t.telegram.voiceFailed)
        return
      }
      await say(to, t.telegram.heard(heard))
      const reply = await follow(chatOf(to), userId, heard, context?.id)
      await send(to, {
        ...reply,
        voice: canSpeak ? { text: reply.text, userId } : undefined,
      })
    } else if (text) {
      await send(to, await follow(chatOf(to), userId, text, context?.id))
    }
  })
  if (handled.isErr()) {
    logError('whatsapp', handled.error.cause)
    await say(
      to,
      failureText(await localeFor(userId), handled.error.cause, !!audio)
    )
  }
}

const handleSafely = async (inbound: Inbound) => {
  const handled = await Result.tryPromise(() => handle(inbound))
  if (handled.isErr()) {
    logError('whatsapp', handled.error.cause)
  }
}

const signed = (body: string, signature: string | null) => {
  if (!(config && signature)) {
    return false
  }
  const expected = Buffer.from(
    `sha256=${createHmac('sha256', config.appSecret).update(body).digest('hex')}`
  )
  const given = Buffer.from(signature)
  return expected.length === given.length && timingSafeEqual(expected, given)
}

/** Meta's one-time subscription check. */
export const verifyWhatsappWebhook = (url: URL) =>
  config &&
  env.WHATSAPP_VERIFY_TOKEN &&
  url.searchParams.get('hub.mode') === 'subscribe' &&
  url.searchParams.get('hub.verify_token') === env.WHATSAPP_VERIFY_TOKEN
    ? new Response(url.searchParams.get('hub.challenge'))
    : new Response(null, { status: 403 })

export const whatsappWebhook = async (request: Request) => {
  const body = await request.text()
  if (!signed(body, request.headers.get('x-hub-signature-256'))) {
    return new Response(null, { status: 401 })
  }
  const payload = JSON.parse(body) as {
    entry?: { changes?: { value?: { messages?: Inbound[] } }[] }[]
  }
  const inbound = (payload.entry ?? []).flatMap(({ changes = [] }) =>
    changes.flatMap(({ value }) => value?.messages ?? [])
  )
  await Promise.all(
    inbound.map(async (message) => {
      if (await remember(chatOf(message.from), message.id, null)) {
        // Answered after the 200: Meta retries any webhook that takes longer than a few seconds.
        void handleSafely(message)
      }
    })
  )
  return new Response(null, { status: 200 })
}

/** Free-form messages only reach a user who wrote within 24 h; otherwise an approved template carries a one-line preview and a button whose payload (a press) brings the content once tapped. */
const push = async (
  userId: string,
  preview: string,
  then: string,
  reply: (chat: Chat, t: Messages) => Reply
) => {
  const link = config ? await whatsappForUser(userId) : null
  if (!link) {
    return
  }
  if (
    link.lastInboundAt &&
    isBefore(new Date(), addHours(link.lastInboundAt, 23))
  ) {
    await send(link.phone, reply(chatOf(link.phone), await messagesFor(userId)))
    return
  }
  if (!env.WHATSAPP_TEMPLATE) {
    return
  }
  await post(link.phone, {
    template: {
      components: [
        {
          parameters: [
            {
              text: preview.replaceAll(/\s+/gu, ' ').slice(0, 200),
              type: 'text',
            },
          ],
          type: 'body',
        },
        {
          index: '0',
          parameters: [{ payload: then, type: 'payload' }],
          sub_type: 'quick_reply',
          type: 'button',
        },
      ],
      language: { code: 'en' },
      name: env.WHATSAPP_TEMPLATE,
    },
    type: 'template',
  })
}

/** Outside the 24-hour window the template's button fetches the report (`week`). */
export const sendWhatsappWeek = async (userId: string, minutes: number) => {
  const t = await messagesFor(userId)
  await push(userId, t.today.saved(minutes), 'week', (chat, chatT) =>
    weekReply(chat, chatT, minutes)
  )
}

/** Outside the 24-hour window the template's button fetches the digest (`reading`). */
export const sendWhatsappReading = async (
  userId: string,
  reading: Parameters<typeof readingReply>[2]
) => {
  const t = await messagesFor(userId)
  await push(
    userId,
    t.reading.digest(reading.rows.length),
    'reading',
    (chat, chatT) => readingReply(chat, chatT, reading)
  )
}

/** The template's button brings back the queue, where the card waits. */
export const sendWhatsappRun = (userId: string, run: Run) =>
  push(userId, run.headline, 'queue', (chat) => runReply(chat, run))

export const sendWhatsappUrgent = (userId: string, item: QueueItem) =>
  push(
    userId,
    `${item.message?.fromName ?? item.message?.fromEmail ?? ''} · ${item.message?.subject ?? item.action.title}`,
    'queue',
    (chat, t) => itemReply(chat, t, item, true)
  )
