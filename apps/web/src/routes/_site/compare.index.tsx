import { createFileRoute } from '@tanstack/react-router'

import { Closing, CompareCards, CONTAINER } from '~/components/site'

const ComparePage = () => (
  <>
    <section className={`${CONTAINER} flex flex-col gap-6 pt-16 sm:pt-24`}>
      <h1 className="text-display sm:text-hero font-serif tracking-tight text-balance">
        Fewmail compared.
      </h1>
      <p className="text-brief text-foreground/75 max-w-2xl font-serif text-pretty">
        Email clients make you faster at reading every email. Filters move mail
        into folders. Fewmail is an agent: it reads the mail, decides what can
        wait and asks you only about the rest.
      </p>
      <CompareCards />
    </section>
    <Closing />
  </>
)

export const Route = createFileRoute('/_site/compare/')({
  component: ComparePage,
})
