import type { BillingInterval } from '@fewmail/shared/agent'
import { allowanceIn, PAID_PLANS } from '@fewmail/shared/agent'
import { Button } from '@fewmail/ui/components/button'
import { Tabs, TabsList, TabsTrigger } from '@fewmail/ui/components/tabs'
import { cn } from '@fewmail/ui/lib/utils'
import {
  ArrowRight01Icon,
  MinusSignIcon,
  Tick02Icon,
} from '@hugeicons/core-free-icons'
import type { IconSvgElement } from '@hugeicons/react'
import { HugeiconsIcon } from '@hugeicons/react'
import { Link } from '@tanstack/react-router'
import type { ComponentProps, ReactNode } from 'react'
import { useState } from 'react'

import { localeStore, useLocale, useT } from '~/lib/i18n'
import type { ComparisonFeature } from '~/lib/marketing'
import {
  AGENT_FEATURES,
  COMPARISON_GROUPS,
  COMPARISONS,
  FEWMAIL_LACKS,
  PLANS,
  TRIAL_DAYS,
} from '~/lib/marketing'

import { LanguageSelect } from './agent-fields'
import { Logo } from './logo'

export const CONTAINER = 'mx-auto w-full max-w-6xl px-6'

export const Reveal = ({ className, ...props }: ComponentProps<'div'>) => (
  <div
    className={cn(
      'animate-in fade-in slide-in-from-bottom-4 fill-mode-both ease-house duration-600 [animation-range:entry_10%_entry_90%] [animation-timeline:view()] motion-reduce:animate-none',
      className
    )}
    {...props}
  />
)

export const StartButton = ({ children }: { children?: ReactNode }) => {
  const t = useT()
  return (
    <Button size="lg" render={<Link to="/login" />}>
      {children ?? t.site.startFree}
      <HugeiconsIcon
        icon={ArrowRight01Icon}
        strokeWidth={2}
        data-icon="inline-end"
      />
    </Button>
  )
}

export const TrialNote = () => (
  <p className="text-muted-foreground text-sm">
    {useT().site.trialNote(TRIAL_DAYS)}
  </p>
)

export const SiteHeader = () => {
  const t = useT().site
  return (
    <header className="bg-body/85 sticky top-0 z-20 backdrop-blur-md">
      <div className={cn(CONTAINER, 'flex h-16 items-center gap-8')}>
        <Logo />
        <nav className="hidden items-center gap-1 md:flex">
          <Button
            variant="ghost-muted"
            render={<Link to="/" hash="features" />}
          >
            {t.nav.features}
          </Button>
          <Button variant="ghost-muted" render={<Link to="/pricing" />}>
            {t.nav.pricing}
          </Button>
          <Button variant="ghost-muted" render={<Link to="/compare" />}>
            {t.nav.compare}
          </Button>
        </nav>
        <div className="ml-auto flex items-center gap-2">
          <Button
            variant="ghost"
            render={<Link to="/login" />}
            className="max-sm:hidden"
          >
            {t.nav.signIn}
          </Button>
          <Button render={<Link to="/login" />}>{t.startFree}</Button>
        </div>
      </div>
    </header>
  )
}

const FooterColumn = ({
  links,
  title,
}: {
  links: { label: string; link: ReactNode }[]
  title: string
}) => (
  <div className="flex flex-col gap-3 text-sm">
    <p className="font-medium">{title}</p>
    {links.map(({ label, link }) => (
      <span
        key={label}
        className="text-muted-foreground [&_a:hover]:text-foreground [&_a]:text-inherit"
      >
        {link}
      </span>
    ))}
  </div>
)

export const SiteFooter = () => {
  const t = useT()
  const locale = useLocale()
  return (
    <footer className="border-t">
      <div
        className={cn(
          CONTAINER,
          'grid gap-10 py-14 sm:grid-cols-[minmax(0,2fr)_repeat(3,minmax(0,1fr))]'
        )}
      >
        <div className="flex flex-col items-start gap-3">
          <Logo />
          <p className="text-muted-foreground max-w-xs text-sm text-pretty">
            {t.site.footer.tagline}
          </p>
          <LanguageSelect
            value={locale}
            onChange={(next) => localeStore.set(next)}
          />
        </div>
        <FooterColumn
          title={t.site.footer.product}
          links={[
            {
              label: 'features',
              link: (
                <Link to="/" hash="features">
                  {t.site.nav.features}
                </Link>
              ),
            },
            {
              label: 'pricing',
              link: <Link to="/pricing">{t.site.nav.pricing}</Link>,
            },
            {
              label: 'mcp',
              link: <Link to="/mcp">{t.site.nav.mcp}</Link>,
            },
            {
              label: 'login',
              link: <Link to="/login">{t.site.nav.signIn}</Link>,
            },
          ]}
        />
        <FooterColumn
          title={t.site.nav.compare}
          links={COMPARISONS.map(({ name, slug }) => ({
            label: slug,
            link: (
              <Link to="/compare/$slug" params={{ slug }}>
                {t.site.footer.versus(name)}
              </Link>
            ),
          }))}
        />
        <FooterColumn
          title={t.site.footer.legal}
          links={[
            {
              label: 'privacy',
              link: <Link to="/privacy">{t.legal.privacy}</Link>,
            },
            {
              label: 'terms',
              link: <Link to="/terms">{t.legal.terms}</Link>,
            },
          ]}
        />
      </div>
    </footer>
  )
}

export const Chapter = ({
  children,
  description,
  id,
  label,
  title,
}: {
  children?: ReactNode
  description?: ReactNode
  id?: string
  label: string
  title: ReactNode
}) => (
  <section id={id} className={cn(CONTAINER, 'scroll-mt-20 py-14 sm:py-20')}>
    <Reveal className="grid gap-x-10 gap-y-6 border-t pt-8 md:grid-cols-12">
      <div className="flex flex-col gap-6 md:col-span-7">
        <p className="text-sm font-medium">{label}</p>
        <h2 className="text-display font-serif tracking-tight text-balance">
          {title}
        </h2>
      </div>
      {description && (
        <p className="text-muted-foreground text-brief font-serif text-pretty md:col-span-5 md:self-end">
          {description}
        </p>
      )}
    </Reveal>
    {children}
  </section>
)

export const Stage = ({ children, className }: ComponentProps<'div'>) => (
  <Reveal
    className={cn(
      'bg-background ring-foreground/6 mt-12 flex items-center justify-center overflow-hidden rounded-3xl px-6 py-12 ring',
      className
    )}
  >
    <div inert className="w-full">
      {children}
    </div>
  </Reveal>
)

export const FeatureGrid = ({
  features,
}: {
  features: { description: string; icon: IconSvgElement; title: string }[]
}) => (
  <Reveal className="mt-12 grid gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
    {features.map(({ description, icon, title }) => (
      <div key={title} className="flex flex-col gap-3">
        <span className="bg-secondary text-foreground flex size-9 items-center justify-center rounded-xl">
          <HugeiconsIcon icon={icon} strokeWidth={2} className="size-4.5" />
        </span>
        <h3 className="font-medium">{title}</h3>
        <p className="text-muted-foreground text-sm/relaxed text-pretty">
          {description}
        </p>
      </div>
    ))}
  </Reveal>
)

/** Below xl the plans stack and every cell names its plan; from xl the plans head the columns. */
const PLAN_ROW =
  'grid grid-cols-[1.4fr_repeat(3,1fr)] gap-x-2 gap-y-2 border-t px-6 py-4 lg:grid-cols-4 xl:col-span-5 xl:grid-cols-subgrid xl:gap-0 xl:border-t-0 xl:p-0 xl:*:border-t xl:*:px-6 xl:*:py-4'

const PlanCell = ({
  children,
  className,
  name,
}: {
  children: ReactNode
  className?: string
  name: string
}) => (
  <span className={cn('flex flex-col gap-1 xl:justify-center', className)}>
    <span className="text-muted-foreground truncate text-xs xl:hidden">
      {name}
    </span>
    {children}
  </span>
)

const Lacks = () => (
  <HugeiconsIcon
    icon={MinusSignIcon}
    strokeWidth={2}
    className="text-muted-foreground size-4"
  />
)

const featureList = (features: readonly ComparisonFeature[]) =>
  features.filter((feature) => !FEWMAIL_LACKS.includes(feature))

const EVERY_PLAN = featureList(
  Object.values(COMPARISON_GROUPS)
    .flat()
    .filter((feature) => !AGENT_FEATURES.includes(feature))
)

const Ticked = ({ labels }: { labels: string[] }) => (
  <ul className="flex flex-wrap gap-x-5 gap-y-1.5">
    {labels.map((label) => (
      <li key={label} className="flex items-center gap-1.5">
        <HugeiconsIcon
          icon={Tick02Icon}
          strokeWidth={2}
          className="text-primary size-4 shrink-0"
        />
        {label}
      </li>
    ))}
  </ul>
)

/** The plans differ only in what the agent may do a month, so the table shows only that and what Free lacks. */
export const PlanTable = () => {
  const t = useT()
  const locale = useLocale()
  const [billingInterval, setBillingInterval] =
    useState<BillingInterval>('month')
  const { comparison, plans } = t.site
  const paidName = PAID_PLANS.map((plan) => t.plan[plan]).join(' · ')
  const allowanceRow = (label: string, unit: 'emails' | 'messages') => (
    <div className={PLAN_ROW}>
      <span className="text-muted-foreground col-span-4 text-sm xl:col-span-1">
        {label}
      </span>
      {PLANS.map((plan) => (
        <PlanCell key={plan.id} name={t.plan[plan.id]}>
          {plan.id === 'free' ? (
            <Lacks />
          ) : (
            <span className="font-medium tabular-nums">
              {allowanceIn(plan.id)[unit].toLocaleString(locale)}
            </span>
          )}
        </PlanCell>
      ))}
    </div>
  )
  return (
    <div className="mt-12 flex flex-col items-center gap-6">
      <Tabs
        value={billingInterval}
        onValueChange={(value) => setBillingInterval(value as BillingInterval)}
      >
        <TabsList>
          <TabsTrigger value="month">{plans.monthly}</TabsTrigger>
          <TabsTrigger value="year">{plans.yearly}</TabsTrigger>
        </TabsList>
      </Tabs>
      <Reveal className="bg-background ring-foreground/6 grid w-full rounded-3xl ring xl:grid-cols-5">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 xl:col-span-5 xl:grid-cols-subgrid xl:grid-rows-[repeat(3,auto)]">
          <span className="hidden xl:row-span-3 xl:block" />
          {PLANS.map((plan) => {
            const isFree = plan.id === 'free'
            return (
              <div
                key={plan.id}
                className="grid content-start gap-4 px-6 py-6 xl:row-span-3 xl:grid-rows-subgrid"
              >
                <div>
                  <h3 className="font-medium">{t.plan[plan.id]}</h3>
                  <p className="text-muted-foreground mt-1 text-sm text-pretty">
                    {plans[plan.id].description}
                  </p>
                </div>
                <p className="flex items-baseline gap-1.5">
                  <span className="text-display font-serif tabular-nums">
                    ${plan.price[billingInterval]}
                  </span>
                  <span className="text-muted-foreground text-sm">
                    {isFree ? plans.forever : plans.per[billingInterval]}
                  </span>
                </p>
                <Button
                  size="lg"
                  variant={plan.id === 'pro' ? 'default' : 'secondary'}
                  render={<Link to="/login" />}
                >
                  {isFree ? t.site.startFree : plans.tryFree(TRIAL_DAYS)}
                </Button>
              </div>
            )
          })}
        </div>
        {allowanceRow(plans.emails, 'emails')}
        {allowanceRow(plans.messages, 'messages')}
        <div className={PLAN_ROW}>
          <span className="text-muted-foreground col-span-4 text-sm xl:col-span-1">
            {plans.agent}
          </span>
          <PlanCell name={t.plan.free}>
            <Lacks />
          </PlanCell>
          <PlanCell name={paidName} className="col-span-3 text-sm">
            <Ticked
              labels={featureList(AGENT_FEATURES).map(
                (feature) => comparison.labels[feature]
              )}
            />
          </PlanCell>
        </div>
        <div className="flex flex-col gap-3 border-t px-6 py-5 text-sm xl:col-span-5 xl:grid xl:grid-cols-subgrid xl:gap-0 xl:px-0 xl:*:px-6">
          <span className="text-muted-foreground">{plans.everyPlan}</span>
          <div className="xl:col-span-4">
            <Ticked
              labels={EVERY_PLAN.map((feature) => comparison.labels[feature])}
            />
          </div>
        </div>
      </Reveal>
      <p className="text-muted-foreground self-start text-xs">
        {plans.oneAllowance}
      </p>
    </div>
  )
}

export const CompareCards = () => {
  const t = useT().site
  return (
    <Reveal className="mt-12 grid gap-4 md:grid-cols-3">
      {COMPARISONS.map(({ name, slug }) => (
        <Link
          key={slug}
          to="/compare/$slug"
          params={{ slug }}
          className="bg-background ring-foreground/6 hover:ring-foreground/12 flex flex-col gap-3 rounded-3xl p-6 text-inherit ring transition-shadow hover:text-inherit"
        >
          <h3 className="font-serif text-xl tracking-tight">
            {t.comparison.title(name)}
          </h3>
          <p className="text-muted-foreground text-sm/relaxed text-pretty">
            {t.comparisons[slug].summary}
          </p>
          <span className="text-primary mt-auto flex items-center gap-1 pt-2 text-sm">
            {t.comparison.read}
            <HugeiconsIcon
              icon={ArrowRight01Icon}
              strokeWidth={2}
              className="size-4"
            />
          </span>
        </Link>
      ))}
    </Reveal>
  )
}

export const Closing = () => {
  const t = useT().site
  return (
    <section className={cn(CONTAINER, 'py-24 sm:py-32')}>
      <Reveal className="flex flex-col items-center gap-6 text-center">
        <h2 className="text-display sm:text-hero font-serif tracking-tight text-balance">
          {t.closing.title}
        </h2>
        <p className="text-muted-foreground text-brief max-w-xl font-serif text-pretty">
          {t.closing.lead}
        </p>
        <StartButton />
        <TrialNote />
      </Reveal>
    </section>
  )
}
