import { useQuery } from '@tanstack/react-query'

import { useDates, useT } from '~/lib/i18n'
import { orpc } from '~/lib/orpc'

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

  if (!person || person.fromThem + person.toThem < 2) {
    return null
  }

  const elsewhere = [
    ...new Set(
      person.open
        .filter((item) => item.threadId !== threadId)
        .map((item) => item.title)
    ),
  ]

  return (
    <section className="border-border flex flex-col gap-2 border-t pt-5 text-sm">
      <div className="text-muted-foreground flex flex-wrap gap-x-3 gap-y-1 text-xs">
        <span data-mask className="text-foreground font-medium">
          {person.name ?? person.email}
        </span>
        <span>{t.people.threads(person.threads)}</span>
        {person.firstContact && (
          <span>
            {t.people.firstContact(
              dates.format(person.firstContact, 'MMM yyyy')
            )}
          </span>
        )}
        {person.lastContact && (
          <span>{t.people.lastContact(dates.ago(person.lastContact))}</span>
        )}
      </div>
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
            <span key={promise.id} data-mask className="text-foreground">
              {index > 0 && ', '}
              {promise.promise} · {dates.format(promise.dueAt, 'EEE d MMM')}
            </span>
          ))}
        </p>
      )}
      {elsewhere.length > 0 && (
        <p className="text-muted-foreground">
          {t.people.open}:{' '}
          <span data-mask className="text-foreground">
            {elsewhere.join(', ')}
          </span>
        </p>
      )}
    </section>
  )
}
