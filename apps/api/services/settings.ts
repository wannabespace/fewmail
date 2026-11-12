import { db } from '@fewmail/db'
import { userSettings } from '@fewmail/db/schema'
import { eq } from 'drizzle-orm'

export const getSettings = async (userId: string) => {
  const [settings] = await db
    .select()
    .from(userSettings)
    .where(eq(userSettings.userId, userId))
  return settings ?? null
}
