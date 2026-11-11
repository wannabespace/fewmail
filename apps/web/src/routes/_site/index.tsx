import { PRO_PRICE_USD } from '@fewmail/shared/agent'
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
import { FAQ } from '~/lib/marketing'

const Hero = () => (
  <section
    className={cn(
      CONTAINER,
      'grid items-center gap-12 pt-12 pb-16 sm:pt-20 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.9fr)]'
    )}
  >
    <div className="flex flex-col gap-8">
      <h1 className="text-display sm:text-hero animate-in fade-in slide-in-from-bottom-2 ease-house font-serif tracking-tight text-balance duration-500">
        Only what matters.
      </h1>
      <p className="text-brief text-foreground/75 animate-in fade-in slide-in-from-bottom-2 ease-house fill-mode-both max-w-lg font-serif text-pretty delay-75 duration-500">
        Fewmail is an email agent for Gmail. It reads every email for you,
        drafts the replies in your voice and hands you one short list of what
        actually needs you.
      </p>
      <div className="animate-in fade-in slide-in-from-bottom-2 ease-house fill-mode-both flex flex-col gap-3 delay-150 duration-500">
        <div className="flex flex-wrap gap-2">
          <StartButton>Start free with Google</StartButton>
          <Button size="lg" variant="secondary" render={<Link to="/pricing" />}>
            Pricing
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

const PROMISES = [
  'Nothing is sent without your approval',
  'Your mail is encrypted at rest',
  'Never used to train models',
]

const Promises = () => (
  <Reveal
    className={cn(
      CONTAINER,
      'text-muted-foreground flex flex-wrap gap-x-8 gap-y-3 pb-8 text-sm'
    )}
  >
    {PROMISES.map((promise) => (
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

const LandingPage = () => (
  <>
    <Hero />
    <Promises />
    <Chapter
      id="features"
      number="01"
      label="Today"
      title="One brief. One queue. That’s your inbox."
      description="Every day, at the hour you pick, Fewmail writes a short brief in your language and lines up the few emails that need a decision, most important first. Approve with ⏎, skip with S; the rest is already handled, and you can see exactly what it did."
    >
      <Stage>
        <TodayDemo />
      </Stage>
    </Chapter>
    <Chapter
      number="02"
      label="Replies"
      title="Replies in your voice, in their language."
      description="Fewmail learns how you write from the mail you have sent, then drafts answers ahead of time, in the language of the email. Edit, ask for another take, or send it as it is. Nothing leaves without your yes."
    >
      <Stage>
        <DraftDemo />
      </Stage>
    </Chapter>
    <Chapter
      number="03"
      label="Telegram"
      title="Your inbox, from a chat."
      description="Get the brief and urgent mail in Telegram, approve a reply with one tap, or just send a voice message: “tell Marco Thursday works”. Fewmail finds the thread and drafts it."
    >
      <Stage>
        <TelegramDemo />
      </Stage>
    </Chapter>
    <Chapter
      number="04"
      label="Protection"
      title="Scams stop at the door."
      description="Every plan gets a community spam shield that learns from the people who use Fewmail, without ever sharing an address or a word of your mail. Lookalike domains, known phishing and changed payment details raise a warning before you act."
    >
      <Stage>
        <ShieldDemo />
      </Stage>
    </Chapter>
    <Chapter
      number="05"
      label="Memory"
      title="It remembers so you don’t have to."
      description="Fewmail keeps track of what you promised, who people are, what you pay for and which threads it is still working on for you."
    >
      <FeatureGrid
        features={[
          {
            description:
              'Say “handle this” and the agent works the thread toward your goal, asking before each send or sending on its own.',
            icon: Task01Icon,
            title: 'Handle this',
          },
          {
            description:
              'Promises you make in sent mail come back to you when they are due, before anyone has to chase you.',
            icon: Agreement01Icon,
            title: 'Promises kept',
          },
          {
            description:
              'A short note on everyone you write to, refreshed weekly, right next to their email.',
            icon: UserMultipleIcon,
            title: 'People',
          },
          {
            description:
              'Describe what to track — money, trips, orders — and the agent collects it from your mail, with charts, starting with the last six months.',
            icon: ChartBarLineIcon,
            title: 'Boards',
          },
          {
            description:
              'Mail that expects an answer gets a follow-up, so a thread never dies quietly.',
            icon: Clock01Icon,
            title: 'Follow-ups',
          },
          {
            description:
              'Ask a question in ⌘K and get an answer from your own mail, with the emails it came from.',
            icon: Search01Icon,
            title: 'Ask your mail',
          },
        ]}
      />
    </Chapter>
    <Chapter
      number="06"
      label="Control"
      title="You set the rules. It shows its work."
      description="Tell Fewmail in plain words what to do with mail, decide which rules may act on their own, and review everything it did under Handled."
    >
      <FeatureGrid
        features={[
          {
            description:
              '“Newsletters I never open” or “receipts from shops”: archive, mark read or unsubscribe.',
            icon: FilterIcon,
            title: 'Rules in plain language',
          },
          {
            description:
              'Subjects, bodies, summaries and drafts are encrypted in our database. Sending always needs your approval.',
            icon: LockIcon,
            title: 'Private by design',
          },
          {
            description:
              'Every action has one key and ⌘K reaches everything. Your hands never leave the keyboard.',
            icon: KeyboardIcon,
            title: 'Keyboard first',
          },
          {
            description:
              'Everything the agent did on its own is listed under Handled, each with the reason it acted.',
            icon: Tick02Icon,
            title: 'Handled, in the open',
          },
          {
            description:
              'Optional Fewmail labels show the sorting in Gmail itself, on your phone and in any other mail app.',
            icon: Mail01Icon,
            title: 'Works with any Gmail app',
          },
          {
            description:
              'Connect Claude or any MCP client and let it read, triage and draft with the same agent.',
            icon: McpServerIcon,
            title: 'MCP server',
          },
        ]}
      />
    </Chapter>
    <Chapter
      id="pricing"
      label="Pricing"
      title={`Free for the sorting. $${PRO_PRICE_USD} for the agent.`}
      description="The sorting, rules and protection are free forever. Pro adds everything that reads and writes for you."
    >
      <PlanCards />
    </Chapter>
    <Chapter
      label="Compare"
      title="How Fewmail is different."
      description="Most tools help you get through your inbox faster. Fewmail gets through it for you."
    >
      <CompareCards />
    </Chapter>
    <Chapter
      label="Questions"
      title="Before you connect Gmail."
      description="The short answers. The long ones are in the privacy policy."
    >
      <Reveal className="mt-12 max-w-3xl">
        <Accordion>
          {FAQ.map(({ answer, question }) => (
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

export const Route = createFileRoute('/_site/')({
  beforeLoad: () => {
    if (signedInStore.get()) {
      throw redirect({ to: agentModeStore.get() ? '/agent' : '/today' })
    }
  },
  component: LandingPage,
})
