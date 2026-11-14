import { cardPayload } from '../agent'
import type { ActionKind } from '../agent'
import type { Locale } from './locales'
import { de } from './messages/de'
import { en } from './messages/en'
import type { Messages } from './messages/en'
import { es } from './messages/es'
import { fr } from './messages/fr'
import { hi } from './messages/hi'
import { id } from './messages/id'
import { it } from './messages/it'
import { ja } from './messages/ja'
import { ko } from './messages/ko'
import { nl } from './messages/nl'
import { pl } from './messages/pl'
import { pt } from './messages/pt'
import { tr } from './messages/tr'
import { uk } from './messages/uk'
import { zh } from './messages/zh'

export type { Messages } from './messages/en'

export const messages: Record<Locale, Messages> = {
  de,
  en,
  es,
  fr,
  hi,
  id,
  it,
  ja,
  ko,
  nl,
  pl,
  pt,
  tr,
  uk,
  zh,
}

type Card = Parameters<typeof cardPayload>[0] & { kind: ActionKind }

/** Fewmail can't pay, read or sign for the user: there the yes only says they did it. */
export const approveTitle = (t: Messages, action: Card) => {
  const { event, link, tool } = cardPayload(action)
  if (tool) {
    return t.agent.yes[tool]
  }
  if (event && action.kind === 'schedule') {
    return t.queue.addToCalendar
  }
  if (link) {
    return t.actionDone[link.purpose]
  }
  return action.kind in t.actionDone
    ? t.actionDone[action.kind as keyof Messages['actionDone']]
    : t.actionKind[action.kind]
}
