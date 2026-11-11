import { createFileRoute } from '@tanstack/react-router'

import { Closing, CompareCards, CONTAINER, PlanCards } from '~/components/site'
import { TRIAL_DAYS } from '~/lib/marketing'

const PricingPage = () => (
  <>
    <section className={`${CONTAINER} flex flex-col gap-6 pt-16 sm:pt-24`}>
      <h1 className="text-display sm:text-hero font-serif tracking-tight text-balance">
        Pay for the agent, not the inbox.
      </h1>
      <p className="text-brief text-foreground/75 max-w-2xl font-serif text-pretty">
        Sorting, plain-language rules and protection are free forever. Pro is
        the agent that reads, writes and remembers for you; Max is the same
        agent with room for a busy inbox. Every account starts with {TRIAL_DAYS}{' '}
        days of Pro, and when they end you simply stay on Free.
      </p>
      <PlanCards />
    </section>
    <section className={`${CONTAINER} py-16 sm:py-24`}>
      <h2 className="text-display font-serif tracking-tight">
        Thinking about another tool?
      </h2>
      <CompareCards />
    </section>
    <Closing />
  </>
)

export const Route = createFileRoute('/_site/pricing')({
  component: PricingPage,
})
