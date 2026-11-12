import { createFileRoute } from '@tanstack/react-router'

import { Closing, CompareCards, CONTAINER, PlanCards } from '~/components/site'
import { useT } from '~/lib/i18n'
import { TRIAL_DAYS } from '~/lib/marketing'

const PricingPage = () => {
  const t = useT().site.pricingPage
  return (
    <>
      <section className={`${CONTAINER} flex flex-col gap-6 pt-16 sm:pt-24`}>
        <h1 className="text-display sm:text-hero font-serif tracking-tight text-balance">
          {t.title}
        </h1>
        <p className="text-brief text-foreground/75 max-w-2xl font-serif text-pretty">
          {t.lead(TRIAL_DAYS)}
        </p>
        <PlanCards />
      </section>
      <section className={`${CONTAINER} py-16 sm:py-24`}>
        <h2 className="text-display font-serif tracking-tight">
          {t.otherTool}
        </h2>
        <CompareCards />
      </section>
      <Closing />
    </>
  )
}

export const Route = createFileRoute('/_site/pricing')({
  component: PricingPage,
})
