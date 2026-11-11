import { cn } from '@fewmail/ui/lib/utils'
import { createFileRoute, notFound } from '@tanstack/react-router'

import {
  Closing,
  CompareCards,
  CONTAINER,
  Reveal,
  StartButton,
  TrialNote,
} from '~/components/site'
import { COMPARISONS, COMPARISONS_CHECKED_AT } from '~/lib/marketing'

const ComparisonPage = () => {
  const { name, rows, summary, verdict } = Route.useLoaderData()

  return (
    <>
      <section className={cn(CONTAINER, 'flex flex-col gap-6 pt-16 sm:pt-24')}>
        <h1 className="text-display sm:text-hero font-serif tracking-tight text-balance">
          Fewmail vs {name}
        </h1>
        <p className="text-brief text-foreground/75 max-w-2xl font-serif text-pretty">
          {summary}
        </p>
        <div className="flex flex-col gap-3">
          <div>
            <StartButton>Try Fewmail free</StartButton>
          </div>
          <TrialNote />
        </div>
      </section>
      <section className={cn(CONTAINER, 'py-16')}>
        <Reveal className="bg-background ring-foreground/6 overflow-hidden rounded-3xl ring">
          <div className="text-muted-foreground hidden gap-6 border-b px-6 py-4 text-sm font-medium sm:grid sm:grid-cols-[minmax(0,0.7fr)_minmax(0,1fr)_minmax(0,1fr)]">
            <span />
            <span className="text-foreground">Fewmail</span>
            <span>{name}</span>
          </div>
          {rows.map(({ fewmail, them, topic }) => (
            <div
              key={topic}
              className="grid gap-1 border-b px-6 py-5 text-sm/relaxed last:border-b-0 sm:grid-cols-[minmax(0,0.7fr)_minmax(0,1fr)_minmax(0,1fr)] sm:gap-6"
            >
              <span className="text-muted-foreground font-medium">{topic}</span>
              <span>
                <span className="font-medium sm:hidden">Fewmail: </span>
                {fewmail}
              </span>
              <span className="text-muted-foreground">
                <span className="font-medium sm:hidden">{name}: </span>
                {them}
              </span>
            </div>
          ))}
        </Reveal>
        <p className="text-muted-foreground mt-4 text-xs">
          {name} details come from its public website, checked in{' '}
          {COMPARISONS_CHECKED_AT}. Prices and features change; check their site
          for the current offer.
        </p>
      </section>
      <section className={cn(CONTAINER, 'pb-16')}>
        <Reveal className="flex max-w-3xl flex-col gap-4 border-t pt-8">
          <h2 className="text-display font-serif tracking-tight">
            Which one is for you?
          </h2>
          <p className="text-brief text-foreground/75 font-serif text-pretty">
            {verdict}
          </p>
        </Reveal>
      </section>
      <section className={cn(CONTAINER, 'pb-8')}>
        <h2 className="text-muted-foreground text-sm font-medium">
          More comparisons
        </h2>
        <CompareCards />
      </section>
      <Closing />
    </>
  )
}

export const Route = createFileRoute('/_site/compare/$slug')({
  component: ComparisonPage,
  loader: ({ params }) => {
    const comparison = COMPARISONS.find(({ slug }) => slug === params.slug)
    if (!comparison) {
      throw notFound()
    }
    return comparison
  },
})
