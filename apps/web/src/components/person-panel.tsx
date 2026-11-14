import { Button } from '@fewmail/ui/components/button'
import { useQuery } from '@tanstack/react-query'
import { Link } from '@tanstack/react-router'
import { useState } from 'react'
import type { ReactNode } from 'react'

import { useDates, useT } from '~/lib/i18n'
import { warmThread } from '~/lib/mail-db'
import { orpc } from '~/lib/orpc'

const ThreadLink = ({
  children,
  threadId,
}: {
  children: ReactNode
  threadId: string
}) => (
  <Link
    to="/mail"
    search={(prev) => ({ ...prev, thread: threadId })}
    onPointerEnter={() => {
      void warmThread(threadId)
    }}
    data-mask
    className="text-foreground underline-offset-3 hover:underline"
  >
    {children}
  </Link>
)

/** Pro: who this person is to the user, from their own mail; quiet when there is nothing to say. */
export const PersonPanel = ({
  email,
  threadId,
}: {
  email: string
  threadId: string
}) => {
  const t = useT()
  const dates = useDates()
  const { data: person } = useQuery(
    orpc.person.queryOptions({ input: { email } })
  )
  const [isListed, setIsListed] = useState(false)

  if (!person?.isPerson || person.fromThem + person.toThem < 2) {
    return null
  }

  const elsewhere = [
    ...new Map(
      person.open.flatMap((item) =>
        item.threadId && item.threadId !== threadId
          ? [[item.threadId, { ...item, threadId: item.threadId }] as const]
          : []
      )
    ).values(),
  ]

  return (
    <section className="border-border flex flex-col gap-2 border-t pt-5 text-sm">
      <div className="text-muted-foreground flex flex-wrap items-center gap-x-3 gap-y-1 text-xs">
        <span data-mask className="text-foreground font-medium">
          {person.name ?? person.email}
        </span>
        <Button
          size="xs"
          variant="link-muted"
          aria-expanded={isListed}
          onClick={() => setIsListed(!isListed)}
        >
          {t.people.threads(person.threads)}
        </Button>
        {person.firstContact && (
          <span>
            {t.people.firstContact(
              dates.format(person.firstContact, 'MMM yyyy')
            )}
          </span>
        )}
        {person.lastContact && (
          <span>{t.people.lastContact(dates.fromNow(person.lastContact))}</span>
        )}
      </div>
      {isListed && (
        <ul className="flex flex-col gap-1">
          {person.conversations.map((conversation) => (
            <li
              key={conversation.threadId}
              className="flex items-baseline justify-between gap-3"
            >
              <span className="text-muted-foreground min-w-0 truncate">
                {conversation.threadId === threadId ? (
                  <span data-mask>{conversation.subject}</span>
                ) : (
                  <ThreadLink threadId={conversation.threadId}>
                    {conversation.subject}
                  </ThreadLink>
                )}
              </span>
              <span className="text-muted-foreground shrink-0 text-xs tabular-nums">
                {dates.format(conversation.receivedAt, 'd MMM')}
              </span>
            </li>
          ))}
        </ul>
      )}
      {person.note && (
        <p
          data-mask
          className="text-muted-foreground font-serif text-sm/relaxed"
        >
          {person.note}
        </p>
      )}
      {person.promised.length > 0 && (
        <p className="text-muted-foreground">
          {t.people.promised}:{' '}
          {person.promised.map((promise, index) => (
            <span key={promise.id}>
              {index > 0 && ', '}
              <ThreadLink threadId={promise.threadId}>
                {promise.promise} · {dates.format(promise.dueAt, 'EEE d MMM')}
              </ThreadLink>
            </span>
          ))}
        </p>
      )}
      {elsewhere.length > 0 && (
        <p className="text-muted-foreground">
          {t.people.open}:{' '}
          {elsewhere.map((item, index) => (
            <span key={item.id}>
              {index > 0 && ', '}
              <ThreadLink threadId={item.threadId}>
                {item.subject || t.actionKind[item.kind]}
              </ThreadLink>
              {item.subject && ` · ${t.actionKind[item.kind]}`}
            </span>
          ))}
        </p>
      )}
    </section>
  )
}
