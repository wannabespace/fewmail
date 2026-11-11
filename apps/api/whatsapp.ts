import { createHmac, timingSafeEqual } from 'node:crypto'

import { UNDO_SEND_SECONDS } from '@fewmail/shared/agent'
import type { Messages } from '@fewmail/shared/i18n'
import { messages } from '@fewmail/shared/i18n'
import { formatResetDay } from '@fewmail/shared/i18n/locales'
import { addHours, isBefore } from 'date-fns'

import { env } from './env'
import { transcribe } from './lib/mistral'
import { generateBrief, getLatestBrief, localClock } from './services/brief'
import { followMessage } from './services/instructions'
import {
  linkWhatsappPhone,
  userIdForPhone,
  whatsappForUser,
} from './services/integrations'
import { LimitReachedError } from './services/limit-error'
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
interface Button {
  id: string
  title: string
}

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
const TEXT_LIMIT = 4000
const SEEN_LIMIT = 5000

const config =
  env.WHATSAPP_TOKEN && env.WHATSAPP_PHONE_NUMBER_ID && env.WHATSAPP_APP_SECRET
    ? {
        appSecret: env.WHATSAPP_APP_SECRET,
        phoneNumberId: env.WHATSAPP_PHONE_NUMBER_ID,
        token: env.WHATSAPP_TOKEN,
      }
    : null

/** Phone → action whose draft the next text message replaces. Lost on restart, which only cancels an edit in progress. */
const editing = new Map<string, string>()

/** Our message id → the action it shows, so replying to it targets that draft. Also remembers handled inbound ids: Meta redelivers webhooks. */
const shown = new Map<string, string>()

const remember = (messageId: string, actionId: string) => {
  shown.set(messageId, actionId)
  if (shown.size > SEEN_LIMIT) {
    const [oldest] = shown.keys()
    if (oldest) {
      shown.delete(oldest)
    }
  }
}

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

const say = (to: string, text: string) =>
  post(to, { text: { body: text.slice(0, TEXT_LIMIT) }, type: 'text' })

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

const messagesForUser = async (userId: string) => {
  const settings = await getSettings(userId)
  return messages[settings?.language ?? 'en']
}

const itemText = (t: Messages, { action, analysis, message }: QueueItem) =>
  [
    `*${message?.fromName ?? message?.fromEmail ?? 'Fewmail'}* · ${message?.subject ?? action.title}`,
    analysis?.summary ?? null,
    action.kind === 'reply' && action.detail
      ? `\n_${t.telegram.draft}_\n${action.detail}`
      : null,
  ]
    .filter(Boolean)
    .join('\n')

const itemButtons = (t: Messages, { action }: QueueItem): Button[] => [
  action.kind === 'reply'
    ? { id: `a:${action.id}`, title: t.telegram.send }
    : { id: `a:${action.id}`, title: action.title },
  ...(action.kind === 'reply'
    ? [{ id: `e:${action.id}`, title: t.telegram.edit }]
    : []),
  { id: `d:${action.id}`, title: t.telegram.skip },
]

const draftButtons = (t: Messages, actionId: string): Button[] => [
  { id: `a:${actionId}`, title: t.telegram.send },
  { id: `e:${actionId}`, title: t.telegram.edit },
  { id: `d:${actionId}`, title: t.telegram.skip },
]

const queueButton = (t: Messages): Button => ({
  id: 'queue',
  title: t.telegram.commands.queue,
})

const menuButtons = (t: Messages): Button[] => [
  { id: 'brief', title: t.telegram.commands.brief },
  queueButton(t),
]

const showDraft = async (
  to: string,
  t: Messages,
  action: { detail: string | null; id: string }
) => {
  const sent = await ask(
    to,
    `_${t.telegram.newDraft}_\n${action.detail ?? ''}`,
    draftButtons(t, action.id)
  )
  remember(sent, action.id)
}

const sendQueue = async (to: string, userId: string, t: Messages) => {
  const queue = await listQueue(userId)
  if (queue.length === 0) {
    await say(to, t.telegram.nothing)
    return
  }
  for (const item of queue) {
    // oxlint-disable-next-line eslint/no-await-in-loop -- queue items must arrive in order
    const sent = await ask(to, itemText(t, item), itemButtons(t, item))
    remember(sent, item.action.id)
  }
}

const briefText = (brief: { body: string; headline: string }) =>
  `*${brief.headline}*\n\n${brief.body}`

const sendTodayBrief = async (to: string, userId: string, t: Messages) => {
  const settings = await getSettings(userId)
  const latest = await getLatestBrief(userId)
  const brief =
    latest && settings && latest.date === localClock(settings.timezone).date
      ? latest
      : await generateBrief(userId)
  await ask(to, briefText(brief), [queueButton(t)])
}

const press = async (to: string, userId: string, t: Messages, id: string) => {
  const [command, actionId = ''] = id.split(':')
  if (command === 'brief') {
    await sendTodayBrief(to, userId, t)
  } else if (command === 'queue') {
    await sendQueue(to, userId, t)
  } else if (command === 'a') {
    const { outboxId } = await approveAction(userId, actionId)
    await (outboxId
      ? ask(to, t.telegram.sendingIn(UNDO_SEND_SECONDS), [
          { id: `u:${outboxId}`, title: t.telegram.undo },
        ])
      : say(to, t.telegram.done))
  } else if (command === 'u') {
    await cancelMail(userId, actionId)
    await say(to, t.telegram.canceled)
  } else if (command === 'd') {
    await dismissAction(userId, actionId)
    await say(to, t.telegram.skipped)
  } else if (command === 'e') {
    editing.set(to, actionId)
    await say(to, t.telegram.editPrompt)
  }
}

const followText = async (
  inbound: Inbound,
  userId: string,
  t: Messages,
  text: string
) => {
  const to = inbound.from
  const actionId = editing.get(to)
  if (actionId) {
    editing.delete(to)
    if (text.startsWith('/')) {
      await showDraft(
        to,
        t,
        await redraftAction(userId, actionId, text.slice(1))
      )
      return
    }
    await updateDraft(userId, actionId, text)
    const sent = await ask(to, `_${t.telegram.willSend}_\n${text}`, [
      { id: `a:${actionId}`, title: t.telegram.sendThis },
      { id: `d:${actionId}`, title: t.telegram.skip },
    ])
    remember(sent, actionId)
    return
  }
  const targetId = inbound.context ? shown.get(inbound.context.id) : null
  const { answer, draft } = await followMessage(userId, text, targetId)
  if (answer) {
    await say(
      to,
      [
        answer.answer,
        ...answer.sources.map(
          (source) => `_[${source.number}] ${source.from} · ${source.subject}_`
        ),
      ].join('\n')
    )
    return
  }
  if (!draft) {
    await ask(to, t.telegram.help, menuButtons(t))
    return
  }
  await showDraft(to, t, draft)
}

const transcribeVoice = async (mediaId: string) => {
  const media = await graph(mediaId)
  const { url } = (await media.json()) as { url: string }
  const audio = await graph(url)
  return transcribe(await audio.arrayBuffer(), 'voice.ogg')
}

const failureText = async (
  userId: string,
  t: Messages,
  error: unknown,
  isVoice: boolean
) => {
  if (error instanceof LimitReachedError) {
    const settings = await getSettings(userId)
    const language = settings?.language ?? 'en'
    return t.limits.messages(formatResetDay(language, error.resetsAt))
  }
  return isVoice ? t.telegram.voiceFailed : t.telegram.somethingWrong
}

const handle = async (inbound: Inbound) => {
  const to = inbound.from
  const text = inbound.text?.body
  const userId = await userIdForPhone(to)
  if (!userId) {
    const link = text ? await linkWhatsappPhone(text, to) : null
    if (link) {
      const t = await messagesForUser(link.userId)
      await ask(to, t.whatsapp.connected, menuButtons(t))
      return
    }
    await say(to, messages.en.whatsapp.connectFirst)
    return
  }
  const t = await messagesForUser(userId)
  if (!hasAgent(await getPlanInfo(userId))) {
    await say(to, t.whatsapp.proOnly)
    return
  }
  try {
    const pressed =
      inbound.interactive?.button_reply?.id ?? inbound.button?.payload
    if (pressed) {
      await press(to, userId, t, pressed)
    } else if (inbound.audio) {
      const heard = await transcribeVoice(inbound.audio.id)
      if (!heard) {
        await say(to, t.telegram.voiceFailed)
        return
      }
      await say(to, t.telegram.heard(heard))
      await followText(inbound, userId, t, heard)
    } else if (text) {
      await followText(inbound, userId, t, text)
    }
  } catch (error) {
    console.error('whatsapp', error instanceof Error ? error.message : error)
    await say(to, await failureText(userId, t, error, !!inbound.audio))
  }
}

const handleSafely = async (inbound: Inbound) => {
  try {
    await handle(inbound)
  } catch (error) {
    console.error('whatsapp', error instanceof Error ? error.message : error)
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
  for (const message of inbound) {
    if (!shown.has(message.id)) {
      remember(message.id, '')
      // Answered after the 200: Meta retries any webhook that takes longer than a few seconds.
      void handleSafely(message)
    }
  }
  return new Response(null, { status: 200 })
}

/** Free-form messages only reach a user who wrote within 24 h; otherwise an approved template carries a one-line preview and a button that reopens the chat. */
const push = async (
  userId: string,
  preview: string,
  then: 'brief' | 'queue',
  send: (to: string, t: Messages) => Promise<unknown>
) => {
  const link = config ? await whatsappForUser(userId) : null
  if (!link) {
    return
  }
  const t = await messagesForUser(userId)
  if (
    link.lastInboundAt &&
    isBefore(new Date(), addHours(link.lastInboundAt, 23))
  ) {
    await send(link.phone, t)
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

export const sendWhatsappBrief = (
  userId: string,
  brief: { body: string; headline: string }
) =>
  push(userId, brief.headline, 'brief', (to, t) =>
    ask(to, briefText(brief), [queueButton(t)])
  )

export const sendWhatsappUrgent = (userId: string, item: QueueItem) =>
  push(
    userId,
    `${item.message?.fromName ?? item.message?.fromEmail ?? ''} · ${item.message?.subject ?? item.action.title}`,
    'queue',
    async (to, t) => {
      const sent = await ask(
        to,
        `${t.telegram.urgent}\n${itemText(t, item)}`,
        itemButtons(t, item)
      )
      remember(sent, item.action.id)
    }
  )
