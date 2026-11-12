import { PRICE_USD } from '@fewmail/shared/agent'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@fewmail/ui/components/accordion'
import { cn } from '@fewmail/ui/lib/utils'
import {
  CleanIcon,
  ChartBarLineIcon,
  Calendar03Icon,
  Forward01Icon,
  GiftIcon,
  Mic01Icon,
  News01Icon,
  Search01Icon,
  Task01Icon,
} from '@hugeicons/core-free-icons'
import { createFileRoute, redirect } from '@tanstack/react-router'

import {
  Emphasized,
  InboxStory,
  Ledger,
  McpShowcase,
  PlayQueue,
  TrustBand,
} from '~/components/landing-demos'
import {
  Chapter,
  Closing,
  CONTAINER,
  FeatureGrid,
  PlanCards,
  Reveal,
} from '~/components/site'
import { signedInStore } from '~/lib/auth'
import { useT } from '~/lib/i18n'
import { TRIAL_DAYS } from '~/lib/marketing'

const FEATURE_ICONS = {
  clearOut: CleanIcon,
  reading: News01Icon,
  boards: ChartBarLineIcon,
  handle: Task01Icon,
  voice: Mic01Icon,
  forward: Forward01Icon,
  calendar: Calendar03Icon,
  ask: Search01Icon,
  wrapped: GiftIcon,
}

const LandingPage = () => {
  const t = useT().site
  const { chapters, features, gone, mcp, play } = t
  return (
    <>
      <InboxStory />
      <Chapter
        id="gone"
        label={gone.label}
        title={<Emphasized {...gone} text={gone.title} />}
      >
        <Ledger />
      </Chapter>
      <section
        id="try"
        className={cn(
          CONTAINER,
          'grid scroll-mt-20 gap-10 py-14 sm:py-20 md:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] md:items-start'
        )}
      >
        <Reveal className="flex flex-col gap-6 md:sticky md:top-28">
          <p className="text-sm font-medium">{play.label}</p>
          <h2 className="text-display font-serif tracking-tight text-balance">
            <Emphasized {...play} text={play.title} />
          </h2>
          <p className="text-muted-foreground text-brief font-serif text-pretty">
            {play.lead}
          </p>
        </Reveal>
        <PlayQueue />
      </section>
      <Chapter
        id="features"
        label={features.label}
        title={features.title}
        description={features.description}
      >
        <FeatureGrid
          features={Object.entries(FEATURE_ICONS).map(([key, icon]) => ({
            ...features.items[key as keyof typeof FEATURE_ICONS],
            icon,
          }))}
        />
      </Chapter>
      <Chapter
        id="mcp"
        label={mcp.label}
        title={<Emphasized {...mcp} text={mcp.title} />}
      >
        <McpShowcase />
      </Chapter>
      <TrustBand />
      <Chapter
        id="pricing"
        {...chapters.pricing}
        title={chapters.pricing.title(PRICE_USD.pro.month)}
      >
        <PlanCards />
      </Chapter>
      <Chapter {...chapters.questions}>
        <Reveal className="mt-12 max-w-3xl">
          <Accordion>
            {t.faq(TRIAL_DAYS).map(({ answer, question }) => (
              <AccordionItem key={question} value={question}>
                <AccordionTrigger>{question}</AccordionTrigger>
                <AccordionContent>{answer}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </Reveal>
      </Chapter>
      <Closing />
    </>
  )
}

export const Route = createFileRoute('/_site/')({
  beforeLoad: () => {
    if (signedInStore.get()) {
      throw redirect({ to: '/home' })
    }
  },
  component: LandingPage,
})
