import { cn } from '@fewmail/ui/lib/utils'
import { Tick02Icon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { createFileRoute, notFound } from '@tanstack/react-router'

import { LogoMark } from '~/components/logo'
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
        <Reveal className="bg-background ring-foreground/6 relative grid rounded-3xl ring sm:grid-cols-[minmax(0,0.7fr)_minmax(0,1fr)_minmax(0,1fr)]">
          <div className="bg-popover ring-foreground/10 absolute inset-x-0 -inset-y-3 col-start-2 col-end-3 hidden rounded-3xl shadow-sm ring sm:block" />
          <div className="text-muted-foreground hidden text-sm font-medium sm:col-span-3 sm:grid sm:grid-cols-subgrid sm:*:px-6 sm:*:py-5">
            <span className="border-b" />
            <span className="text-foreground relative flex items-center gap-2 font-serif text-lg tracking-tight">
              <LogoMark className="size-5" />
              Fewmail
            </span>
            <span className="border-b">{name}</span>
          </div>
          {rows.map(({ fewmail, them, topic }) => (
            <div
              key={topic}
              className="grid gap-2 border-b px-6 py-5 text-sm/relaxed last:border-b-0 sm:col-span-3 sm:grid-cols-subgrid sm:gap-0 sm:border-b-0 sm:p-0 sm:*:px-6 sm:*:py-5 sm:[&:not(:last-child)>:not(:nth-child(2))]:border-b"
            >
              <span className="text-muted-foreground font-medium">{topic}</span>
              <span className="relative flex gap-2.5">
                <HugeiconsIcon
                  icon={Tick02Icon}
                  strokeWidth={2}
                  className="text-primary mt-0.5 size-4 shrink-0"
                />
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
