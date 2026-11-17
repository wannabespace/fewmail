import { createFileRoute } from '@tanstack/react-router'
import { z } from 'zod/mini'

import { ReadingPage } from '~/components/reading'
import { orpc } from '~/lib/orpc'
import { warmQuery } from '~/lib/query-client'

const ReadingRoute = () => <ReadingPage day={Route.useSearch().day} />

export const Route = createFileRoute('/_app/reading')({
  component: ReadingRoute,
  validateSearch: z.object({
    day: z.optional(z.string().check(z.regex(/^\d{4}-\d{2}-\d{2}$/u))),
  }),
  loaderDeps: ({ search }) => ({ day: search.day }),
  loader: ({ deps }) =>
    warmQuery(orpc.reading.issues.queryOptions()).then((issues) => {
      const day = deps.day ?? issues?.[0]?.day
      return day
        ? warmQuery(orpc.reading.day.queryOptions({ input: { day } }))
        : null
    }),
})
