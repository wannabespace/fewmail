import type { Messages } from '@fewmail/shared/i18n'

import { env } from './env'
import { logError } from './lib/log'
import { chatIdForUser } from './services/integrations'
import { homeNotification, notify } from './services/notifications'
import { sendRun } from './telegram'
import { sendWhatsappRun } from './whatsapp'

/** Messengers get a link because the yes happens on Home, on the web: an MCP client's request waits there as a card. Never throws: the card already exists, and a failed call makes the client ask again. */
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
  const sendTelegram = async () => {
    const telegramChat = await chatIdForUser(userId)
    if (telegramChat) {
      await sendRun(telegramChat, run)
    }
  }
  const sent = await Promise.allSettled([
    sendTelegram(),
    sendWhatsappRun(userId, run),
  ])
  for (const result of sent) {
    if (result.status === 'rejected') {
      logError('home link', result.reason)
    }
  }
}
