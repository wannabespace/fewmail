import type { Messages } from '@fewmail/shared/i18n'

import { env } from './env'
import { chatIdForUser } from './services/integrations'
import { notify, scheduleNotification } from './services/notifications'
import { sendRun } from './telegram'
import { sendWhatsappSchedule } from './whatsapp'

/** Messengers get a link because approvals happen in the chat on the web: a scheduled run's answer or an MCP request's yes. */
export const deliverChatLink = async (
  userId: string,
  t: Messages,
  { chatId, headline, text }: { chatId: string; headline: string; text: string }
) => {
  notify(userId, scheduleNotification(headline, text, chatId))
  const run = {
    body: `${text}\n\n${t.schedule.open}: ${env.WEB_URL}/home?chat=${chatId}`,
    headline,
  }
  const telegramChat = await chatIdForUser(userId)
  await Promise.all([
    telegramChat && sendRun(telegramChat, run),
    sendWhatsappSchedule(userId, run, chatId),
  ])
}
