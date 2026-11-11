import type { BillingInterval } from '@fewmail/shared/agent'
import { Button } from '@fewmail/ui/components/button'
import { Tabs, TabsList, TabsTrigger } from '@fewmail/ui/components/tabs'
import { cn } from '@fewmail/ui/lib/utils'
import { ArrowRight01Icon, Tick02Icon } from '@hugeicons/core-free-icons'
import type { IconSvgElement } from '@hugeicons/react'
import { HugeiconsIcon } from '@hugeicons/react'
import { Link } from '@tanstack/react-router'
import type { ComponentProps, ReactNode } from 'react'
import { useState } from 'react'

import { COMPARISONS, PLANS, TRIAL_DAYS } from '~/lib/marketing'

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

export const StartButton = ({ children }: { children?: ReactNode }) => (
  <Button size="lg" render={<Link to="/login" />}>
    {children ?? 'Start free'}
    <HugeiconsIcon
      icon={ArrowRight01Icon}
      strokeWidth={2}
      data-icon="inline-end"
    />
  </Button>
)

export const TrialNote = () => (
  <p className="text-muted-foreground text-sm">
    {TRIAL_DAYS} days of Pro, no card. Then free for as long as you like.
  </p>
)

export const SiteHeader = () => (
  <header className="bg-body/85 sticky top-0 z-20 backdrop-blur-md">
    <div className={cn(CONTAINER, 'flex h-16 items-center gap-8')}>
      <Logo />
      <nav className="hidden items-center gap-1 sm:flex">
        <Button variant="ghost-muted" render={<Link to="/" hash="features" />}>
          Features
        </Button>
        <Button variant="ghost-muted" render={<Link to="/pricing" />}>
          Pricing
        </Button>
        <Button variant="ghost-muted" render={<Link to="/compare" />}>
          Compare
        </Button>
      </nav>
      <div className="ml-auto flex items-center gap-2">
        <Button variant="ghost" render={<Link to="/login" />}>
          Sign in
        </Button>
        <Button render={<Link to="/login" />}>Start free</Button>
      </div>
    </div>
  </header>
)

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

export const SiteFooter = () => (
  <footer className="border-t">
    <div
      className={cn(
        CONTAINER,
        'grid gap-10 py-14 sm:grid-cols-[minmax(0,2fr)_repeat(3,minmax(0,1fr))]'
      )}
    >
      <div className="flex flex-col gap-3">
        <Logo />
        <p className="text-muted-foreground max-w-xs text-sm text-pretty">
          The email agent that reads your Gmail and only shows you what needs
          you.
        </p>
      </div>
      <FooterColumn
        title="Product"
        links={[
          {
            label: 'features',
            link: (
              <Link to="/" hash="features">
                Features
              </Link>
            ),
          },
          { label: 'pricing', link: <Link to="/pricing">Pricing</Link> },
          { label: 'login', link: <Link to="/login">Sign in</Link> },
        ]}
      />
      <FooterColumn
        title="Compare"
        links={COMPARISONS.map(({ name, slug }) => ({
          label: slug,
          link: (
            <Link to="/compare/$slug" params={{ slug }}>
              vs {name}
            </Link>
          ),
        }))}
      />
      <FooterColumn
        title="Legal"
        links={[
          { label: 'privacy', link: <Link to="/privacy">Privacy Policy</Link> },
          { label: 'terms', link: <Link to="/terms">Terms of Service</Link> },
        ]}
      />
    </div>
  </footer>
)

export const Chapter = ({
  children,
  description,
  id,
  label,
  number,
  title,
}: {
  children?: ReactNode
  description: ReactNode
  id?: string
  label: string
  number?: string
  title: ReactNode
}) => (
  <section id={id} className={cn(CONTAINER, 'scroll-mt-20 py-14 sm:py-20')}>
    <Reveal className="grid gap-x-10 gap-y-6 border-t pt-8 md:grid-cols-12">
      <div className="flex flex-col gap-6 md:col-span-7">
        <p className="text-sm font-medium">
          {number && (
            <span className="text-muted-foreground mr-2 tabular-nums">
              {number}
            </span>
          )}
          {label}
        </p>
        <h2 className="text-display font-serif tracking-tight text-balance">
          {title}
        </h2>
      </div>
      <p className="text-muted-foreground text-brief font-serif text-pretty md:col-span-5 md:self-end">
        {description}
      </p>
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

export const PlanCards = () => {
  const [billingInterval, setBillingInterval] =
    useState<BillingInterval>('month')
  return (
    <div className="mt-12 flex flex-col items-center gap-6">
      <Tabs
        value={billingInterval}
        onValueChange={(value) => setBillingInterval(value as BillingInterval)}
      >
        <TabsList>
          <TabsTrigger value="month">Monthly</TabsTrigger>
          <TabsTrigger value="year">Yearly · 2 months free</TabsTrigger>
        </TabsList>
      </Tabs>
      <Reveal className="grid w-full gap-4 md:grid-cols-3">
        {PLANS.map((plan) => {
          const isPro = plan.name === 'Pro'
          const isFree = plan.price.month === 0
          return (
            <article
              key={plan.name}
              className={cn(
                'flex flex-col rounded-3xl p-8 ring',
                isPro
                  ? 'bg-popover ring-foreground/10 shadow-sm'
                  : 'bg-background ring-foreground/6'
              )}
            >
              <h3 className="font-medium">{plan.name}</h3>
              <p className="text-muted-foreground mt-1 text-sm">
                {plan.description}
              </p>
              <p className="mt-6 flex items-baseline gap-1.5">
                <span className="text-display font-serif tabular-nums">
                  ${plan.price[billingInterval]}
                </span>
                <span className="text-muted-foreground text-sm">
                  {isFree ? 'forever' : `a ${billingInterval}`}
                </span>
              </p>
              <div className="mt-6 grid">
                <Button
                  size="lg"
                  variant={isPro ? 'default' : 'secondary'}
                  render={<Link to="/login" />}
                >
                  {isFree ? 'Start free' : `Try free for ${TRIAL_DAYS} days`}
                </Button>
              </div>
              <div className="mt-8 flex flex-col gap-3 border-t pt-6 text-sm">
                {'includes' in plan && (
                  <p className="text-muted-foreground">
                    Everything in {plan.includes}, plus
                  </p>
                )}
                <ul className="flex flex-col gap-3">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex gap-2.5">
                      <HugeiconsIcon
                        icon={Tick02Icon}
                        strokeWidth={2}
                        className="text-primary mt-0.5 size-4 shrink-0"
                      />
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            </article>
          )
        })}
      </Reveal>
    </div>
  )
}

export const CompareCards = () => (
  <Reveal className="mt-12 grid gap-4 md:grid-cols-3">
    {COMPARISONS.map(({ name, slug, summary }) => (
      <Link
        key={slug}
        to="/compare/$slug"
        params={{ slug }}
        className="bg-background ring-foreground/6 hover:ring-foreground/12 flex flex-col gap-3 rounded-3xl p-6 text-inherit ring transition-shadow hover:text-inherit"
      >
        <h3 className="font-serif text-xl tracking-tight">Fewmail vs {name}</h3>
        <p className="text-muted-foreground text-sm/relaxed text-pretty">
          {summary}
        </p>
        <span className="text-primary mt-auto flex items-center gap-1 pt-2 text-sm">
          Read the comparison
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

export const Closing = () => (
  <section className={cn(CONTAINER, 'py-24 sm:py-32')}>
    <Reveal className="flex flex-col items-center gap-6 text-center">
      <h2 className="text-display sm:text-hero font-serif tracking-tight text-balance">
        Get your mornings back.
      </h2>
      <p className="text-muted-foreground text-brief max-w-xl font-serif text-pretty">
        Connect Gmail in a minute. Fewmail starts with the last three days of
        mail, so the first decisions are waiting for you right away.
      </p>
      <StartButton />
      <TrialNote />
    </Reveal>
  </section>
)
