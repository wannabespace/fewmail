import { useQuery } from '@tanstack/react-query'

import { useDates, useT } from '~/lib/i18n'
import { orpc } from '~/lib/orpc'

/** Pro: who this person is to the user, from their own mail; quiet when there is nothing to say. */
export const PersonPanel = ({ email }: { email: string }) => {
  const t = useT()
  const dates = useDates()
  const { data: person } = useQuery(
    orpc.person.queryOptions({ input: { email } })
  )

  if (!person || person.fromThem + person.toThem < 2) {
    return null
  }

  return (
    <section className="bg-secondary/40 flex flex-col gap-2 rounded-xl px-4 py-3 text-sm">
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
        <p data-mask className="font-serif text-base/relaxed">
          {person.note}
        </p>
      )}
      {person.promised.length > 0 && (
        <div className="flex flex-col gap-0.5">
          <span className="text-muted-foreground text-xs font-medium">
            {t.people.promised}
          </span>
          {person.promised.map((promise) => (
            <span key={promise.id} data-mask>
              {promise.promise} · {dates.format(promise.dueAt, 'EEE d MMM')}
            </span>
          ))}
        </div>
      )}
      {person.open.length > 0 && (
        <div className="flex flex-col gap-0.5">
          <span className="text-muted-foreground text-xs font-medium">
            {t.people.open}
          </span>
          {person.open.map((item) => (
            <span key={item.id} data-mask>
              {item.title}
            </span>
          ))}
        </div>
      )}
    </section>
  )
}
