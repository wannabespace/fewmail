import { createFileRoute } from '@tanstack/react-router'

import { Closing, CompareCards, CONTAINER } from '~/components/site'
import { useT } from '~/lib/i18n'

const ComparePage = () => {
  const t = useT().site.comparePage
  return (
    <>
      <section className={`${CONTAINER} flex flex-col gap-6 pt-16 sm:pt-24`}>
        <h1 className="text-display sm:text-hero font-serif tracking-tight text-balance">
          {t.title}
        </h1>
        <p className="text-brief text-foreground/75 max-w-2xl font-serif text-pretty">
          {t.lead}
        </p>
        <CompareCards />
      </section>
      <Closing />
    </>
  )
}

export const Route = createFileRoute('/_site/compare/')({
  component: ComparePage,
})
