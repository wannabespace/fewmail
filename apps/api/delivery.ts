import { env } from './env'
import { logErrorAs } from './lib/log'
import { chatIdForUser, whatsappForUser } from './services/integrations'
import { listQueue } from './services/mail'
import { messagesFor } from './services/messenger'
import {
  availableChannels,
  dispatchDeliveries as dispatchDue,
  enqueueDelivery,
  homeNotification,
} from './services/notifications'
import type { MessengerSender } from './services/notifications'
import { sendRun, sendUrgent } from './telegram'
import { sendWhatsappRun, sendWhatsappUrgent } from './whatsapp'

type Delivery = Parameters<MessengerSender>[0]

/** An urgent card is read when it goes: one already answered has nothing to say. */
const urgentItem = async (delivery: Delivery) => {
  if (!delivery.actionId) {
    return
  }
  const queue = await listQueue(delivery.userId)
  return queue.find(({ action }) => action.id === delivery.actionId)
}

/** A notice on a messenger is a request waiting on Home: the yes happens there, so it ends with the link. */
const runOf = async ({ notice, userId }: Delivery) => {
  const t = await messagesFor(userId)
  return {
    body: `${notice.body}\n\n${t.agent.decideOnHome}: ${env.WEB_URL}${notice.url}`,
    headline: notice.title,
  }
}

const telegram: MessengerSender = async (delivery) => {
  const chatId = await chatIdForUser(delivery.userId)
  if (!chatId) {
    return 'gone'
  }
  if (delivery.actionId) {
    const item = await urgentItem(delivery)
    if (!item) {
      return 'skipped'
    }
    await sendUrgent(chatId, delivery.userId, item)
    return 'sent'
  }
  await sendRun(chatId, await runOf(delivery))
  return 'sent'
}

const whatsapp: MessengerSender = async (delivery) => {
  if (!(await whatsappForUser(delivery.userId))) {
    return 'gone'
  }
  if (delivery.actionId) {
    const item = await urgentItem(delivery)
    if (!item) {
      return 'skipped'
    }
    await sendWhatsappUrgent(delivery.userId, item)
    return 'sent'
  }
  await sendWhatsappRun(delivery.userId, await runOf(delivery))
  return 'sent'
}

/** Every channel: the bots live here, apart from the services they import. */
export const dispatchDeliveries = (userId?: string) =>
  dispatchDue({ telegram, whatsapp }, userId)

/**
 * An MCP client's request waits on Home as a card: a push and the messengers say so. Queued, so a messenger that is
 * down gets it later; never throws, since the card already exists.
 */
export const deliverHomeLink = async (
  userId: string,
  { headline, text }: { headline: string; text: string }
) => {
  await enqueueDelivery(userId, {
    channels: await availableChannels(userId, false),
    notice: homeNotification(headline, text),
  })
  void dispatchDeliveries(userId).catch(logErrorAs('home link'))
}
