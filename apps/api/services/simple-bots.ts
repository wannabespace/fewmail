import type { messages, SimpleMatch } from '@fewmail/db/schema'

type Message = typeof messages.$inferSelect

/** A simple bot's match, read without a model; Jev still judges the email, so mail that needs the user waits for a yes. */
export const matchesSimple = (match: SimpleMatch, message: Message) => {
  const needle = match.value.trim().toLowerCase()
  switch (match.field) {
    case 'from': {
      return [message.fromEmail, message.fromName ?? '']
        .join(' ')
        .toLowerCase()
        .includes(needle)
    }
    case 'subject': {
      return message.subject.toLowerCase().includes(needle)
    }
    case 'mailingList': {
      return message.listUnsubscribe !== null
    }
    default: {
      return false
    }
  }
}
