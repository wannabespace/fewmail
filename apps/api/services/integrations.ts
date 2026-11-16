import { db } from '@fewmail/db'
import {
  oauthAccessTokens,
  oauthClients,
  oauthConsents,
  oauthRefreshTokens,
  telegramLinks,
  whatsappLinks,
} from '@fewmail/db/schema'
import { and, desc, eq, isNull, or } from 'drizzle-orm'
import { customAlphabet } from 'nanoid'

import { env } from '../env'
import { announceChange } from '../lib/live'
import { capture } from '../lib/posthog'

/** Apps the user allowed into MCP through OAuth; consent is what keeps one connected. */
export const listConnectedApps = (userId: string) =>
  db
    .select({
      clientId: oauthConsents.clientId,
      connectedAt: oauthConsents.createdAt,
      name: oauthClients.name,
    })
    .from(oauthConsents)
    .innerJoin(oauthClients, eq(oauthClients.clientId, oauthConsents.clientId))
    .where(eq(oauthConsents.userId, userId))
    .orderBy(desc(oauthConsents.createdAt))

export const findConnectedApp = async (userId: string, clientId: string) => {
  const [app] = await db
    .select({ name: oauthClients.name })
    .from(oauthConsents)
    .innerJoin(oauthClients, eq(oauthClients.clientId, oauthConsents.clientId))
    .where(
      and(
        eq(oauthConsents.userId, userId),
        eq(oauthConsents.clientId, clientId)
      )
    )
  return app
}

export const disconnectApp = (userId: string, clientId: string) =>
  db.transaction((tx) =>
    Promise.all(
      [oauthConsents, oauthAccessTokens, oauthRefreshTokens].map((table) =>
        tx
          .delete(table)
          .where(and(eq(table.userId, userId), eq(table.clientId, clientId)))
      )
    )
  )

const linkCode = customAlphabet('ABCDEFGHJKLMNPQRSTUVWXYZ23456789', 10)

const MESSENGER_LINKS = { telegram: telegramLinks, whatsapp: whatsappLinks }

type Messenger = keyof typeof MESSENGER_LINKS

/** The owner of `code` when the chat or phone is already `holder`'s: refused, never moved, since switching means Disconnect there first. */
const takenFrom = async (
  channel: Messenger,
  code: string,
  holder: string | null
) => {
  if (!holder) {
    return null
  }
  const table = MESSENGER_LINKS[channel]
  const [owner] = await db
    .select({ userId: table.userId })
    .from(table)
    .where(eq(table.linkCode, code))
  return owner && owner.userId !== holder ? owner.userId : null
}

const linked = async (
  channel: Messenger,
  userId: string | undefined,
  taken: boolean
) => {
  if (!userId) {
    return null
  }
  capture(userId, 'messenger_linked', { channel, taken })
  if (!taken) {
    await announceChange(userId, ['integrations'])
  }
  return { taken, userId }
}

const createTelegramLink = async (userId: string) => {
  const [created] = await db
    .insert(telegramLinks)
    .values({ linkCode: linkCode(), userId })
    .returning()
  if (!created) {
    throw new Error('Telegram link insert returned no row')
  }
  return created
}

export const getTelegramLink = async (userId: string) => {
  const [link] = await db
    .select()
    .from(telegramLinks)
    .where(eq(telegramLinks.userId, userId))
  const current = link ?? (await createTelegramLink(userId))
  return {
    botUrl: env.TELEGRAM_BOT_USERNAME
      ? `https://t.me/${env.TELEGRAM_BOT_USERNAME}?start=${current.linkCode}`
      : null,
    linked: !!current.chatId,
    linkedAt: current.linkedAt,
    urgentPush: current.urgentPush,
  }
}

export const unlinkTelegram = (userId: string) =>
  db
    .update(telegramLinks)
    .set({ chatId: null, linkCode: linkCode(), linkedAt: null })
    .where(eq(telegramLinks.userId, userId))

export const userIdForChat = async (chatId: string) => {
  const [link] = await db
    .select({ userId: telegramLinks.userId })
    .from(telegramLinks)
    .where(eq(telegramLinks.chatId, chatId))
  return link?.userId ?? null
}

export const linkTelegramChat = async (code: string, chatId: string) => {
  const taken = await takenFrom('telegram', code, await userIdForChat(chatId))
  if (taken) {
    return linked('telegram', taken, true)
  }
  const [link] = await db
    .update(telegramLinks)
    .set({ chatId, linkCode: linkCode(), linkedAt: new Date() })
    .where(
      and(
        eq(telegramLinks.linkCode, code),
        or(isNull(telegramLinks.chatId), eq(telegramLinks.chatId, chatId))
      )
    )
    .returning()
  return linked('telegram', link?.userId, false)
}

export const chatIdForUser = async (userId: string) => {
  const [link] = await db
    .select({ chatId: telegramLinks.chatId })
    .from(telegramLinks)
    .where(eq(telegramLinks.userId, userId))
  return link?.chatId ?? null
}

const createWhatsappLink = async (userId: string) => {
  const [created] = await db
    .insert(whatsappLinks)
    .values({ linkCode: linkCode(), userId })
    .returning()
  if (!created) {
    throw new Error('WhatsApp link insert returned no row')
  }
  return created
}

export const getWhatsappLink = async (userId: string) => {
  const [link] = await db
    .select()
    .from(whatsappLinks)
    .where(eq(whatsappLinks.userId, userId))
  const current = link ?? (await createWhatsappLink(userId))
  return {
    botUrl: env.WHATSAPP_NUMBER
      ? `https://wa.me/${env.WHATSAPP_NUMBER}?text=${encodeURIComponent(`Fewmail ${current.linkCode}`)}`
      : null,
    linked: !!current.phone,
    linkedAt: current.linkedAt,
    urgentPush: current.urgentPush,
  }
}

export const unlinkWhatsapp = (userId: string) =>
  db
    .update(whatsappLinks)
    .set({
      lastInboundAt: null,
      linkCode: linkCode(),
      linkedAt: null,
      phone: null,
    })
    .where(eq(whatsappLinks.userId, userId))

/** Records the inbound message that opens WhatsApp's 24 h window and returns who sent it. */
export const userIdForPhone = async (phone: string) => {
  const [link] = await db
    .update(whatsappLinks)
    .set({ lastInboundAt: new Date() })
    .where(eq(whatsappLinks.phone, phone))
    .returning({ userId: whatsappLinks.userId })
  return link?.userId ?? null
}

/** The code arrives inside the prefilled "Fewmail <code>" message the user sends from the wa.me link. */
export const linkWhatsappPhone = async (text: string, phone: string) => {
  const code = /\b[A-Z2-9]{10}\b/u.exec(text.toUpperCase())?.[0]
  if (!code) {
    return null
  }
  const taken = await takenFrom('whatsapp', code, await userIdForPhone(phone))
  if (taken) {
    return linked('whatsapp', taken, true)
  }
  const [link] = await db
    .update(whatsappLinks)
    .set({
      lastInboundAt: new Date(),
      linkCode: linkCode(),
      linkedAt: new Date(),
      phone,
    })
    .where(
      and(
        eq(whatsappLinks.linkCode, code),
        or(isNull(whatsappLinks.phone), eq(whatsappLinks.phone, phone))
      )
    )
    .returning()
  return linked('whatsapp', link?.userId, false)
}

export const whatsappForUser = async (userId: string) => {
  const [link] = await db
    .select({
      lastInboundAt: whatsappLinks.lastInboundAt,
      phone: whatsappLinks.phone,
    })
    .from(whatsappLinks)
    .where(eq(whatsappLinks.userId, userId))
  return link?.phone
    ? { lastInboundAt: link.lastInboundAt, phone: link.phone }
    : null
}

export const setUrgentPush = async (
  userId: string,
  channel: Messenger,
  urgentPush: boolean
) => {
  const table = MESSENGER_LINKS[channel]
  await db.update(table).set({ urgentPush }).where(eq(table.userId, userId))
}

/** Where urgent mail may be pushed: a linked chat whose user has not turned it off. */
export const urgentPushTargets = async (userId: string) => {
  const [[telegram], [whatsapp]] = await Promise.all([
    db
      .select({ chatId: telegramLinks.chatId })
      .from(telegramLinks)
      .where(
        and(
          eq(telegramLinks.userId, userId),
          eq(telegramLinks.urgentPush, true)
        )
      ),
    db
      .select({ userId: whatsappLinks.userId })
      .from(whatsappLinks)
      .where(
        and(
          eq(whatsappLinks.userId, userId),
          eq(whatsappLinks.urgentPush, true)
        )
      ),
  ])
  return { telegramChat: telegram?.chatId ?? null, whatsapp: !!whatsapp }
}
