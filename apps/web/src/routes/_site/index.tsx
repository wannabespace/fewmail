import { PRICE_USD } from '@fewmail/shared/agent'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@fewmail/ui/components/accordion'
import { Button } from '@fewmail/ui/components/button'
import { cn } from '@fewmail/ui/lib/utils'
import {
  Agreement01Icon,
  ChartBarLineIcon,
  Clock01Icon,
  FilterIcon,
  KeyboardIcon,
  LockIcon,
  Mail01Icon,
  McpServerIcon,
  Search01Icon,
  Task01Icon,
  Tick02Icon,
  UserMultipleIcon,
} from '@hugeicons/core-free-icons'
import type { IconSvgElement } from '@hugeicons/react'
import { HugeiconsIcon } from '@hugeicons/react'
import { createFileRoute, Link, redirect } from '@tanstack/react-router'

import {
  DraftDemo,
  ShieldDemo,
  TelegramDemo,
  TodayDemo,
} from '~/components/landing-demos'
import { LoginStory } from '~/components/login-story'
import {
  Chapter,
  Closing,
  CompareCards,
  CONTAINER,
  FeatureGrid,
  PlanCards,
  Reveal,
  Stage,
  StartButton,
  TrialNote,
} from '~/components/site'
import { agentModeStore, signedInStore } from '~/lib/auth'
import { useT } from '~/lib/i18n'
import { TRIAL_DAYS } from '~/lib/marketing'

const Hero = () => {
  const t = useT()
  return (
    <section
      className={cn(
        CONTAINER,
        'grid items-center gap-12 pt-12 pb-16 sm:pt-20 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.9fr)]'
      )}
    >
      <div className="flex flex-col gap-8">
        <h1 className="text-display sm:text-hero animate-in fade-in slide-in-from-bottom-2 ease-house font-serif tracking-tight text-balance duration-500">
          {t.login.title}
        </h1>
        <p className="text-brief text-foreground/75 animate-in fade-in slide-in-from-bottom-2 ease-house fill-mode-both max-w-lg font-serif text-pretty delay-75 duration-500">
          {t.site.hero.lead}
        </p>
        <div className="animate-in fade-in slide-in-from-bottom-2 ease-house fill-mode-both flex flex-col gap-3 delay-150 duration-500">
          <div className="flex flex-wrap gap-2">
            <StartButton>{t.site.hero.start}</StartButton>
            <Button
              size="lg"
              variant="secondary"
              render={<Link to="/pricing" />}
            >
              {t.site.nav.pricing}
            </Button>
          </div>
          <TrialNote />
        </div>
      </div>
      <div className="bg-background ring-foreground/6 flex min-h-96 items-center justify-center rounded-3xl px-8 py-12 ring">
        <LoginStory />
      </div>
    </section>
  )
}

const Promises = () => (
  <Reveal
    className={cn(
      CONTAINER,
      'text-muted-foreground flex flex-wrap gap-x-8 gap-y-3 pb-8 text-sm'
    )}
  >
    {useT().site.promises.map((promise) => (
      <span key={promise} className="flex items-center gap-2">
        <HugeiconsIcon
          icon={Tick02Icon}
          strokeWidth={2}
          className="text-primary size-4"
        />
        {promise}
      </span>
    ))}
  </Reveal>
)

const MEMORY_ICONS = {
  ask: Search01Icon,
  boards: ChartBarLineIcon,
  followUps: Clock01Icon,
  handle: Task01Icon,
  people: UserMultipleIcon,
  promises: Agreement01Icon,
}

const CONTROL_ICONS = {
  gmail: Mail01Icon,
  handled: Tick02Icon,
  keyboard: KeyboardIcon,
  mcp: McpServerIcon,
  privacy: LockIcon,
  rules: FilterIcon,
}

const withIcons = <Key extends string>(
  copy: Record<Key, { description: string; title: string }>,
  icons: Record<Key, IconSvgElement>
) =>
  (Object.keys(icons) as Key[]).map((key) => ({
    ...copy[key],
    icon: icons[key],
  }))

const LandingPage = () => {
  const t = useT().site
  const { chapters } = t
  return (
    <>
      <Hero />
      <Promises />
      <Chapter id="features" number="01" {...chapters.today}>
        <Stage>
          <TodayDemo />
        </Stage>
      </Chapter>
      <Chapter number="02" {...chapters.replies}>
        <Stage>
          <DraftDemo />
        </Stage>
      </Chapter>
      <Chapter number="03" {...chapters.telegram}>
        <Stage>
          <TelegramDemo />
        </Stage>
      </Chapter>
      <Chapter number="04" {...chapters.protection}>
        <Stage>
          <ShieldDemo />
        </Stage>
      </Chapter>
      <Chapter number="05" {...chapters.memory}>
        <FeatureGrid features={withIcons(t.memory, MEMORY_ICONS)} />
      </Chapter>
      <Chapter number="06" {...chapters.control}>
        <FeatureGrid features={withIcons(t.control, CONTROL_ICONS)} />
      </Chapter>
      <Chapter
        id="pricing"
        {...chapters.pricing}
        title={chapters.pricing.title(PRICE_USD.pro.month)}
      >
        <PlanCards />
      </Chapter>
      <Chapter {...chapters.compare}>
        <CompareCards />
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
      throw redirect({ to: agentModeStore.get() ? '/agent' : '/today' })
    }
  },
  component: LandingPage,
})
