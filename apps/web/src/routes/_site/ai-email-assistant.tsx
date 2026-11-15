import {
  FilterHorizontalIcon,
  MailOpen01Icon,
  News01Icon,
  PencilEdit02Icon,
  Search01Icon,
  SecurityCheckIcon,
} from '@hugeicons/core-free-icons'
import { createFileRoute } from '@tanstack/react-router'

import { TrustBand } from '~/components/landing-demos'
import {
  Chapter,
  Closing,
  CompareCards,
  CONTAINER,
  Faq,
  FeatureGrid,
  StartButton,
  TrialNote,
} from '~/components/site'
import { useT } from '~/lib/i18n'
import { TRIAL_DAYS } from '~/lib/marketing'

const ABILITY_ICONS = {
  sorting: MailOpen01Icon,
  drafts: PencilEdit02Icon,
  rules: FilterHorizontalIcon,
  reading: News01Icon,
  protection: SecurityCheckIcon,
  ask: Search01Icon,
}

const AssistantPage = () => {
  const t = useT().site
  const page = t.assistantPage
  return (
    <>
      <section className={`${CONTAINER} flex flex-col gap-6 pt-16 sm:pt-24`}>
        <h1 className="text-display sm:text-hero max-w-4xl font-serif tracking-tight text-balance">
          {page.title}
        </h1>
        <p className="text-brief text-foreground/75 max-w-2xl font-serif text-pretty">
          {page.lead}
        </p>
        <div className="flex flex-col items-start gap-3">
          <StartButton />
          <TrialNote />
        </div>
      </section>
      <Chapter
        label={page.abilitiesLabel}
        title={page.abilitiesTitle}
        description={page.abilitiesDescription}
      >
        <FeatureGrid
          features={Object.entries(ABILITY_ICONS).map(([key, icon]) => ({
            ...page.abilities[key as keyof typeof ABILITY_ICONS],
            icon,
          }))}
        />
      </Chapter>
      <TrustBand />
      <Chapter label={t.nav.compare} title={page.compareTitle}>
        <CompareCards />
      </Chapter>
      <Chapter label={t.chapters.questions.label} title={page.faqTitle}>
        <Faq items={page.faq(TRIAL_DAYS)} />
      </Chapter>
      <Closing />
    </>
  )
}

export const Route = createFileRoute('/_site/ai-email-assistant')({
  component: AssistantPage,
})
