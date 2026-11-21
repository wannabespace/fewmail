import { PRICE_USD } from '@fewmail/shared/agent'
import {
  Calendar03Icon,
  GiftIcon,
  MailRemove01Icon,
  Message01Icon,
  Mic01Icon,
  News01Icon,
  PasswordValidationIcon,
  Shield01Icon,
} from '@hugeicons/core-free-icons'
import { createFileRoute, redirect } from '@tanstack/react-router'

import {
  BotDesk,
  BotPoints,
  Emphasized,
  InboxStory,
  Ledger,
  McpShowcase,
  TrustBand,
} from '~/components/landing-demos'
import {
  Chapter,
  Closing,
  Faq,
  FeatureGrid,
  PlanCards,
} from '~/components/site'
import { signedInStore } from '~/lib/auth'
import { useT } from '~/lib/i18n'
import { TRIAL_DAYS } from '~/lib/marketing'

const FEATURE_ICONS = {
  reading: News01Icon,
  messengers: Message01Icon,
  calendar: Calendar03Icon,
  subscriptions: MailRemove01Icon,
  codes: PasswordValidationIcon,
  shield: Shield01Icon,
  voice: Mic01Icon,
  wrapped: GiftIcon,
}

const LandingPage = () => {
  const t = useT().site
  const { bots, chapters, features, gone, mcp } = t
  return (
    <>
      <InboxStory />
      <Chapter
        id="bots"
        label={bots.label}
        title={<Emphasized {...bots} text={bots.title} />}
        description={bots.lead}
      >
        <BotDesk />
        <BotPoints />
      </Chapter>
      <Chapter
        id="gone"
        label={gone.label}
        title={<Emphasized {...gone} text={gone.title} />}
      >
        <Ledger />
      </Chapter>
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
        title={chapters.pricing.title(PRICE_USD.lite.month)}
      >
        <PlanCards />
      </Chapter>
      <Chapter {...chapters.questions}>
        <Faq items={t.faq(TRIAL_DAYS)} />
      </Chapter>
      <Closing />
    </>
  )
}

export const Route = createFileRoute('/_site/')({
  beforeLoad: () => {
    if (signedInStore.get()) {
      throw redirect({ to: '/mail' })
    }
  },
  component: LandingPage,
})
