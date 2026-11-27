import type { RouterOutputs } from '@fewmail/api/router'

export type QueueItem = RouterOutputs['today']['get']['queue'][number]

export const cardHeadlineOf = ({ action, analysis, message }: QueueItem) => {
  if (action.kind === 'commitment' || action.kind === 'heads_up') {
    return action.detail ?? action.title
  }
  if (action.kind === 'cleanup' || action.kind === 'consent') {
    return action.title
  }
  return analysis?.summary ?? message?.subject ?? action.title
}

/** Whom the card is about: your own promise names whom you promised (its `reason`), never you, the sender of your mail. */
export const whoOf = ({ action, message }: QueueItem) =>
  action.kind === 'commitment' && action.reason
    ? { fromEmail: action.reason, fromName: null }
    : message
