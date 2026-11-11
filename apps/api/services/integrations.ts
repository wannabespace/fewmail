import { db } from '@fewmail/db'
import {
  oauthAccessTokens,
  oauthClients,
  oauthConsents,
  oauthRefreshTokens,
  telegramLinks,
  whatsappLinks,
} from '@fewmail/db/schema'
import { and, desc, eq } from 'drizzle-orm'
import { customAlphabet } from 'nanoid'

import { env } from '../env'

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

export const isAppConnected = async (userId: string, clientId: string) => {
  const [consent] = await db
    .select({ id: oauthConsents.id })
    .from(oauthConsents)
    .where(
      and(
        eq(oauthConsents.userId, userId),
        eq(oauthConsents.clientId, clientId)
      )
    )
  return !!consent
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
  }
}

export const unlinkTelegram = (userId: string) =>
  db
    .update(telegramLinks)
    .set({ chatId: null, linkCode: linkCode(), linkedAt: null })
    .where(eq(telegramLinks.userId, userId))

export const linkTelegramChat = async (code: string, chatId: string) => {
  const [link] = await db
    .update(telegramLinks)
    .set({ chatId, linkedAt: new Date() })
    .where(eq(telegramLinks.linkCode, code))
    .returning()
  return link ?? null
}

export const userIdForChat = async (chatId: string) => {
  const [link] = await db
    .select({ userId: telegramLinks.userId })
    .from(telegramLinks)
    .where(eq(telegramLinks.chatId, chatId))
  return link?.userId ?? null
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

/** The code arrives inside the prefilled "Fewmail <code>" message the user sends from the wa.me link. */
export const linkWhatsappPhone = async (text: string, phone: string) => {
  const code = /\b[A-Z2-9]{10}\b/u.exec(text.toUpperCase())?.[0]
  if (!code) {
    return null
  }
  const [link] = await db
    .update(whatsappLinks)
    .set({ lastInboundAt: new Date(), linkedAt: new Date(), phone })
    .where(eq(whatsappLinks.linkCode, code))
    .returning()
  return link ?? null
}

/** Records the inbound message that opens WhatsApp's 24 h window and returns who sent it. */
export const userIdForPhone = async (phone: string) => {
  const [link] = await db
    .update(whatsappLinks)
    .set({ lastInboundAt: new Date() })
    .where(eq(whatsappLinks.phone, phone))
    .returning({ userId: whatsappLinks.userId })
  return link?.userId ?? null
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
