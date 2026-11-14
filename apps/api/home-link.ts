import type { Messages } from '@fewmail/shared/i18n'

import { env } from './env'
import { chatIdForUser } from './services/integrations'
import { homeNotification, notify } from './services/notifications'
import { sendRun } from './telegram'
import { sendWhatsappRun } from './whatsapp'

/** Messengers get a link because the yes happens on Home, on the web: an MCP client's request waits there as a card. */
export const deliverHomeLink = async (
  userId: string,
  t: Messages,
  { headline, text }: { headline: string; text: string }
) => {
  notify(userId, homeNotification(headline, text))
  const run = {
    body: `${text}\n\n${t.agent.decideOnHome}: ${env.WEB_URL}/home`,
    headline,
  }
  const telegramChat = await chatIdForUser(userId)
  await Promise.all([
    telegramChat && sendRun(telegramChat, run),
    sendWhatsappRun(userId, run),
  ])
}
