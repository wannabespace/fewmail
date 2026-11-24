import type { messages, SimpleMatch } from '@fewmail/db/schema'

type Message = typeof messages.$inferSelect

/** An address is one sender and `@domain` its domain: a part of either would take a stranger's mail (ann@ is in joann@). */
export const fromMatches = (
  value: string,
  fromEmail: string,
  fromName: string | null
) => {
  const needle = value.trim().toLowerCase()
  const email = fromEmail.toLowerCase()
  if (!needle.includes('@')) {
    return `${email} ${fromName ?? ''}`.toLowerCase().includes(needle)
  }
  return needle.startsWith('@') ? email.endsWith(needle) : email === needle
}

/** A simple bot's match, read without a model; Jev still judges the email, so mail that needs the user waits for a yes. */
export const matchesSimple = (match: SimpleMatch, message: Message) => {
  switch (match.field) {
    case 'from': {
      return fromMatches(match.value, message.fromEmail, message.fromName)
    }
    case 'subject': {
      return message.subject
        .toLowerCase()
        .includes(match.value.trim().toLowerCase())
    }
    case 'mailingList': {
      return message.listUnsubscribe !== null
    }
    default: {
      return false
    }
  }
}
