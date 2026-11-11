import { createHash } from 'node:crypto'

import { db } from '@fewmail/db'
import { apiKeys, telegramLinks } from '@fewmail/db/schema'
import { and, desc, eq } from 'drizzle-orm'
import { customAlphabet, nanoid } from 'nanoid'

import { env } from '../env'

const API_KEY_PREFIX = 'fm_'

const hashKey = (key: string) => createHash('sha256').update(key).digest('hex')

export const listApiKeys = (userId: string) =>
  db
    .select({
      createdAt: apiKeys.createdAt,
      id: apiKeys.id,
      lastUsedAt: apiKeys.lastUsedAt,
      name: apiKeys.name,
      prefix: apiKeys.prefix,
    })
    .from(apiKeys)
    .where(eq(apiKeys.userId, userId))
    .orderBy(desc(apiKeys.createdAt))

/** The plain key is returned once and never stored. */
export const createApiKey = async (userId: string, name: string) => {
  const key = `${API_KEY_PREFIX}${nanoid(40)}`
  await db.insert(apiKeys).values({
    keyHash: hashKey(key),
    name,
    prefix: key.slice(0, API_KEY_PREFIX.length + 6),
    userId,
  })
  return key
}

export const revokeApiKey = (userId: string, id: string) =>
  db.delete(apiKeys).where(and(eq(apiKeys.id, id), eq(apiKeys.userId, userId)))

export const userIdForApiKey = async (key: string) => {
  const [row] = await db
    .update(apiKeys)
    .set({ lastUsedAt: new Date() })
    .where(eq(apiKeys.keyHash, hashKey(key)))
    .returning({ userId: apiKeys.userId })
  return row?.userId ?? null
}

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
