import { parseSkill } from '@fewmail/shared/agent'
import type { Skill } from '@fewmail/shared/agent'
import type { UIMessage } from 'ai'

const INSTRUCTIONS: Record<Skill, string> = {
  bills:
    'Find bills, invoices, renewals and payments that are due in the next 14 days or overdue: check get_today for pay actions and search the mail. List each with payee, amount and due date, soonest first, then the total per currency. Never guess an amount or a date that the mail does not state.',
  cleanup:
    'Find the newsletters, promotions and notifications that pile up unread: list_mail with filter quiet, and searches for mailing lists over the last 30 days. Name the senders that send most and are never opened, with how many emails each sent, and offer to unsubscribe from them or add a rule that archives them, through the tools, so the user confirms each.',
  followups:
    'Find threads where the user wrote last and nobody has answered for more than 3 days (search their sent mail from the last 30 days and read the threads). List who owes them an answer and about what, oldest first, and offer to draft a short nudge for each.',
  today:
    'Tell the user what needs them today: get_today, then the important mail in the inbox. Most urgent first, one line each with why it matters. Offer to draft the replies that are expected.',
  waiting:
    'Find everyone waiting for the user to reply: pending reply actions in get_today and list_mail with filter needs_reply. List who, since when and what they want, longest waiting first, and offer to draft the replies.',
  week: 'Sum up the user’s mail from the last 7 days: a short paragraph on what mattered and what was decided, then a list of what is still open, each with a link to its thread.',
}

/** The model's prompt for `/name details`, or undefined for any other text. */
export const skillPrompt = (text: string) => {
  const parsed = parseSkill(text)
  if (!parsed) {
    return
  }
  return [
    INSTRUCTIONS[parsed.skill],
    parsed.details && `The user added: ${parsed.details}`,
  ]
    .filter(Boolean)
    .join('\n')
}

/** History keeps what the user typed (`/bills`); only the model sees the skill's instructions. */
export const expandSkills = (messages: UIMessage[]) =>
  messages.map((message) =>
    message.role === 'user'
      ? {
          ...message,
          parts: message.parts.map((part) =>
            part.type === 'text'
              ? { ...part, text: skillPrompt(part.text) ?? part.text }
              : part
          ),
        }
      : message
  )
