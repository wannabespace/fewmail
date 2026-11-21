import type {
  ClearOutGroup,
  ConsentToolName,
  EventScope,
} from '@fewmail/shared/agent'
import type { Messages } from '@fewmail/shared/i18n'
import { isSameDay, parseISO, subDays } from 'date-fns'
import type { ReactNode } from 'react'

import { useDates, useT } from '~/lib/i18n'

export const DraftText = ({ text }: { text: string }) => (
  <p
    data-mask
    className="bg-secondary/60 text-foreground/90 rounded-xl px-4 py-3 font-serif text-base/relaxed whitespace-pre-wrap"
  >
    {text}
  </p>
)

interface Known {
  allDay?: boolean
  analysis?: { suggestedAction?: keyof Messages['bots']['effect'] | null }
  detail?: string | null
  email?: string
  end?: string
  fromEmail?: string
  fromName?: string | null
  id?: string
  instruction?: string
  kind?: string
  mailboxId?: string
  message?: Known
  messageId?: string | null
  name?: string
  start?: string
  subject?: string
  title?: string
}

interface ToolInput {
  actionId?: string
  allDay?: boolean
  cc?: string[]
  description?: string
  effect?: keyof Messages['bots']['effect']
  enabled?: boolean
  end?: string
  groups?: ClearOutGroup[]
  id?: string
  instruction?: string
  lists?: { fromEmail: string }[]
  location?: string
  mailboxId?: string
  messageId?: string
  messageIds?: string[]
  name?: string
  pausedUntil?: string | null
  scope?: EventScope
  search?: string
  start?: string
  subject?: string
  text?: string
  title?: string
  to?: string[]
  until?: string
}

interface Details {
  action?: Known
  calendar?: Known
  dates: ReturnType<typeof useDates>
  email?: Known
  /** What `input.id` names, from what the card's reads found: the event. */
  target?: Known
  input: ToolInput
  tidy?: Known[]
  t: Messages
  text?: string | null
}

const findKnown = (
  value: unknown,
  matches: (known: Known) => boolean
): Known | undefined => {
  if (!value || typeof value !== 'object') {
    return undefined
  }
  if (matches(value as Known)) {
    return value as Known
  }
  for (const child of Object.values(value)) {
    const found = findKnown(child, matches)
    if (found) {
      return found
    }
  }
  return undefined
}

const EmailLine = ({ email }: { email?: Known }) =>
  email?.subject ? (
    <p data-mask className="text-muted-foreground truncate text-sm">
      {email.fromName ?? email.fromEmail} · {email.subject}
    </p>
  ) : null

const Recipients = ({ cc, to }: { cc?: string[]; to?: string[] }) => {
  const t = useT()

  return (
    <>
      {to && to.length > 0 && (
        <p data-mask className="text-muted-foreground text-sm">
          {t.agent.to(to.join(', '))}
        </p>
      )}
      {cc && cc.length > 0 && (
        <p data-mask className="text-muted-foreground text-sm">
          {t.agent.cc(cc.join(', '))}
        </p>
      )}
    </>
  )
}

const eventSpan = (
  dates: ReturnType<typeof useDates>,
  { allDay, end, start }: Known
) => {
  if (!start) {
    return ''
  }
  const from = parseISO(start)
  if (allDay) {
    const last = end ? subDays(parseISO(end), 1) : from
    return last > from
      ? `${dates.format(from, 'EEE PP')} – ${dates.format(last, 'EEE PP')}`
      : dates.format(from, 'EEE PP')
  }
  if (!end) {
    return dates.format(from, 'EEE PP p')
  }
  const to = parseISO(end)
  return `${dates.format(from, 'EEE PP p')} – ${dates.format(to, isSameDay(from, to) ? 'p' : 'EEE PP p')}`
}

const EventDetails = ({
  calendar,
  event,
  previous,
}: {
  calendar?: Known
  event: Known & { description?: string; location?: string }
  previous?: Known
}) => {
  const t = useT()
  const dates = useDates()

  return (
    <>
      {previous?.title && (
        <p data-mask className="text-muted-foreground text-sm line-through">
          {previous.title} · {eventSpan(dates, previous)}
        </p>
      )}
      <p className="text-sm">
        <span data-mask>{event.title}</span>
        <span className="text-muted-foreground" data-mask>
          {' · '}
          {eventSpan(dates, event)}
        </span>
      </p>
      {event.location && (
        <p data-mask className="text-muted-foreground text-sm">
          {event.location}
        </p>
      )}
      {event.description && (
        <p
          data-mask
          className="text-muted-foreground line-clamp-4 text-sm whitespace-pre-wrap"
        >
          {event.description}
        </p>
      )}
      {calendar?.email && (
        <p data-mask className="text-muted-foreground text-sm">
          {t.agent.calendar(calendar.email)}
        </p>
      )}
    </>
  )
}

/** Every input of a consent tool must show here, or the user says yes to something they cannot see. */
const CONSENT_DETAILS: Record<
  ConsentToolName,
  (details: Details) => ReactNode
> = {
  approve_action: ({ action, email, text }) => (
    <>
      <EmailLine email={email} />
      {text ? (
        <>
          <Recipients to={email?.fromEmail ? [email.fromEmail] : undefined} />
          <DraftText text={text} />
        </>
      ) : (
        action?.title && (
          <p data-mask className="text-muted-foreground text-sm">
            {action.title}
          </p>
        )
      )}
    </>
  ),
  archive_thread: ({ email }) => <EmailLine email={email} />,
  clear_out: ({ input, t }) => (
    <p className="text-sm">
      {input.groups?.map((group) => t.clearOut.groups[group]).join(' · ')}
      {input.lists && input.lists.length > 0 && (
        <span data-mask className="text-muted-foreground block">
          {input.lists.map(({ fromEmail }) => fromEmail).join(', ')}
        </span>
      )}
    </p>
  ),
  create_event: ({ calendar, input }) => (
    <EventDetails calendar={calendar} event={input} />
  ),
  create_bot: ({ input, t }) => (
    <p className="text-sm">
      <span data-mask>{input.instruction}</span>
      {input.effect && (
        <span className="text-muted-foreground">
          {' · '}
          {t.bots.effect[input.effect]}
        </span>
      )}
    </p>
  ),
  dismiss_action: ({ action, email }) => (
    <>
      <EmailLine email={email} />
      {action?.title && (
        <p data-mask className="text-muted-foreground text-sm">
          {action.title}
        </p>
      )}
    </>
  ),
  delete_event: ({ calendar, input, t, target }) => (
    <>
      {target && <EventDetails calendar={calendar} event={target} />}
      {input.scope && (
        <p className="text-muted-foreground text-sm">
          {t.calendar.scope[input.scope]}
        </p>
      )}
    </>
  ),
  send_email: ({ input }) => (
    <>
      <Recipients cc={input.cc} to={input.to} />
      {input.subject && (
        <p data-mask className="text-sm font-medium">
          {input.subject}
        </p>
      )}
      {input.text && <DraftText text={input.text} />}
    </>
  ),
  snooze_thread: ({ dates, email, input, t }) => (
    <>
      <EmailLine email={email} />
      {input.until && (
        <p className="text-muted-foreground text-sm">
          {t.agent.until(dates.format(new Date(input.until), 'EEE p'))}
        </p>
      )}
    </>
  ),
  mark_not_spam: ({ email }) => <EmailLine email={email} />,
  move_to_inbox: ({ email }) => <EmailLine email={email} />,
  report_spam: ({ email }) => <EmailLine email={email} />,
  trash_thread: ({ email }) => <EmailLine email={email} />,
  tidy_mail: ({ t, tidy }) =>
    tidy?.map(({ analysis, message }) => (
      <p key={message?.id} className="truncate text-sm">
        {analysis?.suggestedAction && t.bots.effect[analysis.suggestedAction]}
        <span data-mask className="text-muted-foreground">
          {' · '}
          {message?.fromName ?? message?.fromEmail} · {message?.subject}
        </span>
      </p>
    )),
  undo_clear_out: () => null,
  unsubscribe: ({ email }) => <EmailLine email={email} />,
  update_bot: ({ dates, input, t, target }) => (
    <>
      <p data-mask className="text-sm font-medium">
        {input.name && target?.name && (
          <span className="text-muted-foreground font-normal line-through">
            {target.name}
          </span>
        )}{' '}
        {input.name ?? target?.name}
      </p>
      {input.instruction && (
        <>
          {target?.instruction && (
            <p data-mask className="text-muted-foreground text-sm line-through">
              {target.instruction}
            </p>
          )}
          <DraftText text={input.instruction} />
        </>
      )}
      {input.effect && <p className="text-sm">{t.bots.effect[input.effect]}</p>}
      {input.enabled !== undefined && (
        <p className="text-sm">
          {t.bots.status[input.enabled ? 'acts' : 'asks']}
        </p>
      )}
      {input.pausedUntil !== undefined && (
        <p className="text-sm">
          {input.pausedUntil
            ? t.bots.status.paused(
                dates.format(new Date(input.pausedUntil), 'EEE PP p')
              )
            : t.bots.pause.resume}
        </p>
      )}
    </>
  ),
  update_event: ({ calendar, input, t, target }) => (
    <>
      <EventDetails calendar={calendar} event={input} previous={target} />
      {input.scope && (
        <p className="text-muted-foreground text-sm">
          {t.calendar.scope[input.scope]}
        </p>
      )}
    </>
  ),
}

/** What a consent card's yes does, every input shown: `context` is what the server read for it (the email, the card, the events). */
export const ConsentDetails = ({
  context,
  input,
  name,
}: {
  context: unknown
  input: ToolInput
  name: ConsentToolName
}) => {
  const t = useT()
  const dates = useDates()
  const byId = (id: string | null | undefined) =>
    id ? findKnown(context, (known) => known.id === id) : undefined
  const action = byId(input.actionId)
  const email = byId(input.messageId ?? action?.messageId)
  const text =
    input.text ?? (action?.kind === 'reply' ? action.detail : undefined)

  return CONSENT_DETAILS[name]({
    action,
    calendar: input.mailboxId
      ? findKnown(
          context,
          (known) => known.mailboxId === input.mailboxId && !!known.email
        )
      : undefined,
    dates,
    email,
    input,
    t,
    target: byId(input.id),
    text,
    tidy: input.messageIds?.flatMap(
      (id) => findKnown(context, (known) => known.message?.id === id) ?? []
    ),
  })
}
