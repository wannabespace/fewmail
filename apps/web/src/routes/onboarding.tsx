import { Button } from '@fewmail/ui/components/button'
import { Kbd } from '@fewmail/ui/components/kbd'
import { useHotkey } from '@tanstack/react-hotkeys'
import { useMutation } from '@tanstack/react-query'
import { createFileRoute, redirect, useNavigate } from '@tanstack/react-router'

import { LanguageSelect } from '~/components/agent-fields'
import { Logo } from '~/components/logo'
import { localeStore, useLocale, useT } from '~/lib/i18n'
import { client, orpc } from '~/lib/orpc'

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

  const save = useMutation(
    orpc.settings.save.mutationOptions({
      onSuccess: () => navigate({ to: '/home' }),
    })
  )
  const submit = () =>
    save.mutate({
      language,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    })

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

        <Button
          size="lg"
          disabled={save.isPending}
          onClick={submit}
          shortcut={<Kbd>⌘⏎</Kbd>}
        >
          {save.isPending ? t.onboarding.reading : t.onboarding.start}
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
      throw redirect({ to: '/home' })
    }
  },
  component: OnboardingPage,
})
