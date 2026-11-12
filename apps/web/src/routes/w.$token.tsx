import { Button } from '@fewmail/ui/components/button'
import { Skeleton } from '@fewmail/ui/components/skeleton'
import { useQuery } from '@tanstack/react-query'
import { createFileRoute, Link } from '@tanstack/react-router'

import { Logo } from '~/components/logo'
import { WrappedCard } from '~/components/wrapped-card'
import { useT } from '~/lib/i18n'
import { orpc } from '~/lib/orpc'

/** What someone opens from a shared link: the numbers only, signed by the API, and a way in. */
const SharedWrappedPage = () => {
  const t = useT()
  const { token } = Route.useParams()
  const { data } = useQuery(
    orpc.wrapped.shared.queryOptions({ input: { token } })
  )

  return (
    <main className="bg-background flex min-h-dvh flex-col">
      <div className="mx-auto flex w-full max-w-2xl flex-col gap-10 px-6 py-12">
        <Logo />
        {data ? (
          <WrappedCard
            label={data.label}
            stats={data.stats}
            title={t.wrapped.shared[data.period]}
          />
        ) : (
          <Skeleton className="h-96 w-full" />
        )}
        <div>
          <Button size="lg" render={<Link to="/" />}>
            {t.wrapped.cta}
          </Button>
        </div>
      </div>
    </main>
  )
}

export const Route = createFileRoute('/w/$token')({
  component: SharedWrappedPage,
})
