import type { Persona } from '@fewmail/shared/agent'
import { Button } from '@fewmail/ui/components/button'
import { Kbd } from '@fewmail/ui/components/kbd'
import { useHotkey } from '@tanstack/react-hotkeys'
import { useMutation } from '@tanstack/react-query'
import { createFileRoute, redirect, useNavigate } from '@tanstack/react-router'
import { useState } from 'react'

import {
  BriefHourSelect,
  LanguageSelect,
  PersonaChoice,
} from '~/components/agent-fields'
import { Logo } from '~/components/logo'
import { localeStore, useLocale, useT } from '~/lib/i18n'
import { client, orpc } from '~/lib/orpc'

const DEFAULT_BRIEF_HOUR = 8

const Step = ({
  children,
  title,
}: {
  children: React.ReactNode
  title: string
}) => (
  <section className="flex flex-col gap-3">
    <h2 className="font-serif text-xl">{title}</h2>
    {children}
  </section>
)

const OnboardingPage = () => {
  const t = useT()
  const language = useLocale()
  const navigate = useNavigate()
  const [persona, setPersona] = useState<Persona>('reader')
  const [briefHour, setBriefHour] = useState(DEFAULT_BRIEF_HOUR)

  const save = useMutation(
    orpc.settings.save.mutationOptions({
      onSuccess: () => navigate({ to: '/today' }),
    })
  )
  const submit = () =>
    save.mutate({
      briefHour,
      language,
      persona,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    })

  useHotkey('1', () => setPersona('reader'))
  useHotkey('2', () => setPersona('responder'))
  useHotkey('Mod+Enter', submit)

  return (
    <main className="bg-body flex flex-1 justify-center px-6 py-16">
      <div className="flex w-full max-w-xl flex-col gap-10">
        <Logo />
        <div className="flex flex-col gap-3">
          <h1 className="text-display font-serif tracking-tight">
            {t.onboarding.title}
          </h1>
          <p className="text-brief text-foreground/80 font-serif">
            {t.onboarding.lead}
          </p>
        </div>

        <Step title={t.onboarding.languageTitle}>
          <p className="text-muted-foreground text-sm">
            {t.onboarding.languageHint}
          </p>
          <LanguageSelect
            value={language}
            onChange={(next) => localeStore.set(next)}
          />
        </Step>

        <Step title={t.onboarding.personaTitle}>
          <PersonaChoice value={persona} onChange={setPersona} />
        </Step>

        <Step title={t.onboarding.briefTitle}>
          <BriefHourSelect value={briefHour} onChange={setBriefHour} />
        </Step>

        <Button size="lg" disabled={save.isPending} onClick={submit}>
          {save.isPending ? t.onboarding.reading : t.onboarding.start}
          <Kbd>⌘⏎</Kbd>
        </Button>
      </div>
    </main>
  )
}

export const Route = createFileRoute('/onboarding')({
  beforeLoad: async () => {
    const me = await client.me().catch(() => null)
    if (!me) {
      throw redirect({ to: '/login' })
    }
    if (me.settings) {
      throw redirect({ to: '/today' })
    }
  },
  component: OnboardingPage,
})
