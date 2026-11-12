import { cn } from '@fewmail/ui/lib/utils'
import { MinusSignIcon, Tick02Icon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { createFileRoute, notFound } from '@tanstack/react-router'
import type { ReactNode } from 'react'

import { LogoMark } from '~/components/logo'
import {
  Closing,
  CompareCards,
  CONTAINER,
  Reveal,
  StartButton,
  TrialNote,
} from '~/components/site'
import { useDates, useT } from '~/lib/i18n'
import type { ComparisonFeature } from '~/lib/marketing'
import {
  COMPARISON_GROUPS,
  COMPARISONS,
  COMPARISONS_CHECKED_AT,
  FEWMAIL_LACKS,
  PLANS,
} from '~/lib/marketing'

const FewmailTitle = () => (
  <span className="text-foreground flex items-center gap-2 font-serif text-lg tracking-tight">
    <LogoMark className="size-5" />
    Fewmail
  </span>
)

const PriceCard = ({
  featured,
  plans,
  title,
}: {
  featured?: boolean
  plans: { id: string; name: string; note?: string; price: number | null }[]
  title: ReactNode
}) => {
  const t = useT().site
  return (
    <article
      className={cn(
        'flex flex-col rounded-3xl px-8 py-6 ring',
        featured
          ? 'bg-popover ring-foreground/10 shadow-sm'
          : 'bg-background ring-foreground/6'
      )}
    >
      <h3 className="text-muted-foreground flex h-10 items-center text-sm font-medium">
        {title}
      </h3>
      <ul className="mt-2 flex flex-col divide-y border-t">
        {plans.map(({ id, name, note, price }) => (
          <li key={id} className="flex items-baseline gap-4 py-4">
            <div className="flex min-w-0 flex-1 flex-col gap-0.5">
              <span className="text-sm font-medium">{name}</span>
              <span className="text-muted-foreground text-sm text-pretty">
                {note}
              </span>
            </div>
            <span className="flex shrink-0 items-baseline gap-1.5">
              <span className="font-serif text-xl tabular-nums">
                {price === null ? t.comparison.custom : `$${price}`}
              </span>
              {price !== null && (
                <span className="text-muted-foreground text-sm">
                  {t.plans.per.month}
                </span>
              )}
            </span>
          </li>
        ))}
      </ul>
      {!plans.some(({ price }) => price === 0) && (
        <p className="text-muted-foreground mt-auto border-t pt-4 text-sm">
          {t.comparison.noFreePlan}
        </p>
      )}
    </article>
  )
}

const Support = ({
  has,
  name,
  note,
}: {
  has: boolean
  name: string
  note?: string
}) => {
  const t = useT().site.comparison
  return (
    <span className={cn('flex gap-2.5', !has && 'text-muted-foreground')}>
      <HugeiconsIcon
        icon={has ? Tick02Icon : MinusSignIcon}
        strokeWidth={2}
        className={cn('mt-0.5 size-4 shrink-0', has && 'text-primary')}
      />
      <span>
        <span className="font-medium sm:hidden">
          {name}
          {note && ': '}
        </span>
        {note ?? <span className="sr-only">{has ? t.yes : t.no}</span>}
      </span>
    </span>
  )
}

const ComparisonPage = () => {
  const { lacks, name, plans, slug } = Route.useLoaderData()
  const root = useT()
  const t = root.site
  const dates = useDates()
  const { summary, them, verdict } = t.comparisons[slug]
  const ours: Partial<Record<ComparisonFeature, string>> = t.comparison.ours
  const theirs: Partial<Record<ComparisonFeature, string>> = them
  const theirNotes: Partial<Record<string, string>> = t.comparisons[slug].plans

  return (
    <>
      <section className={cn(CONTAINER, 'flex flex-col gap-6 pt-16 sm:pt-24')}>
        <h1 className="text-display sm:text-hero font-serif tracking-tight text-balance">
          {t.comparison.title(name)}
        </h1>
        <p className="text-brief text-foreground/75 max-w-2xl font-serif text-pretty">
          {summary}
        </p>
        <div className="flex flex-col gap-3">
          <div>
            <StartButton>{t.comparison.tryFree}</StartButton>
          </div>
          <TrialNote />
        </div>
      </section>
      <section className={cn(CONTAINER, 'flex flex-col gap-6 pt-16')}>
        <h2 className="text-muted-foreground text-sm font-medium">
          {t.comparison.plans}
        </h2>
        <Reveal className="grid gap-4 md:grid-cols-2">
          <PriceCard
            featured
            title={<FewmailTitle />}
            plans={PLANS.map(({ id, price }) => ({
              id,
              name: root.plan[id],
              note: t.plans[id].description,
              price: price.month,
            }))}
          />
          <PriceCard
            title={name}
            plans={plans.map((plan) => ({
              ...plan,
              note: theirNotes[plan.id],
            }))}
          />
        </Reveal>
      </section>
      <section className={cn(CONTAINER, 'flex flex-col gap-6 py-16')}>
        <h2 className="text-muted-foreground text-sm font-medium">
          {t.comparison.features}
        </h2>
        <Reveal className="bg-background ring-foreground/6 relative grid rounded-3xl pb-3 ring sm:grid-cols-[minmax(0,0.8fr)_minmax(0,1fr)_minmax(0,1fr)]">
          <div className="bg-popover ring-foreground/10 absolute inset-x-0 -inset-y-3 col-start-2 col-end-3 hidden rounded-3xl shadow-sm ring sm:block" />
          <div className="text-muted-foreground hidden text-sm font-medium sm:col-span-3 sm:grid sm:grid-cols-subgrid sm:items-center sm:*:px-6 sm:*:py-5">
            <span />
            <span className="relative">
              <FewmailTitle />
            </span>
            <span>{name}</span>
          </div>
          {Object.entries(COMPARISON_GROUPS).map(([group, features]) => (
            <div
              key={group}
              className="grid sm:col-span-3 sm:grid-cols-subgrid"
            >
              <h3 className="px-6 pt-6 pb-2 text-xs font-medium sm:col-span-3">
                {t.comparison.groups[group as keyof typeof COMPARISON_GROUPS]}
              </h3>
              {features.map((feature) => (
                <div
                  key={feature}
                  className="grid gap-2 border-t px-6 py-4 text-sm/relaxed sm:col-span-3 sm:grid-cols-subgrid sm:gap-0 sm:border-t-0 sm:p-0 sm:*:px-6 sm:*:py-4 sm:[&>:not(:nth-child(2))]:border-t"
                >
                  <span className="text-muted-foreground">
                    {t.comparison.labels[feature]}
                  </span>
                  <span className="relative">
                    <Support
                      has={!FEWMAIL_LACKS.includes(feature)}
                      name="Fewmail"
                      note={ours[feature]}
                    />
                  </span>
                  <Support
                    has={!(lacks as readonly string[]).includes(feature)}
                    name={name}
                    note={theirs[feature]}
                  />
                </div>
              ))}
            </div>
          ))}
        </Reveal>
        <p className="text-muted-foreground text-xs">
          {t.comparison.source(
            name,
            dates.format(COMPARISONS_CHECKED_AT, 'LLLL yyyy')
          )}
        </p>
      </section>
      <section className={cn(CONTAINER, 'pb-16')}>
        <Reveal className="flex max-w-3xl flex-col gap-4 border-t pt-8">
          <h2 className="text-display font-serif tracking-tight">
            {t.comparison.which}
          </h2>
          <p className="text-brief text-foreground/75 font-serif text-pretty">
            {verdict}
          </p>
        </Reveal>
      </section>
      <section className={cn(CONTAINER, 'pb-8')}>
        <h2 className="text-muted-foreground text-sm font-medium">
          {t.comparison.more}
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
