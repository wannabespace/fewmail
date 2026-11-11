import type { BoardPreset } from '@fewmail/shared/agent'
import { BOARD_PRESETS, PLAN_LIMITS } from '@fewmail/shared/agent'
import { Button } from '@fewmail/ui/components/button'
import { Kbd } from '@fewmail/ui/components/kbd'
import { cn } from '@fewmail/ui/lib/utils'
import { useHotkey } from '@tanstack/react-hotkeys'
import { useMutation } from '@tanstack/react-query'
import { createFileRoute, redirect, useNavigate } from '@tanstack/react-router'
import { useState } from 'react'

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

const MAX_STARTER_BOARDS = PLAN_LIMITS.trial.boards

const BoardPresetChoice = ({
  onChange,
  value,
}: {
  onChange: (presets: BoardPreset[]) => void
  value: BoardPreset[]
}) => {
  const t = useT()
  const isFull = value.length >= MAX_STARTER_BOARDS

  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {BOARD_PRESETS.map((preset) => {
        const isChecked = value.includes(preset)
        return (
          <button
            key={preset}
            type="button"
            // oxlint-disable-next-line jsx-a11y/prefer-tag-over-role -- styled card acting as a checkbox
            role="checkbox"
            aria-checked={isChecked}
            disabled={!isChecked && isFull}
            onClick={() =>
              onChange(
                isChecked
                  ? value.filter((item) => item !== preset)
                  : [...value, preset]
              )
            }
            className={cn(
              'bg-popover focus-visible:focus-ring flex cursor-pointer flex-col gap-1.5 rounded-2xl p-4 text-left shadow-xs ring transition-[box-shadow,background-color,opacity] outline-none disabled:cursor-not-allowed disabled:opacity-50',
              isChecked
                ? 'ring-primary ring-2'
                : 'ring-foreground/6 hover:enabled:ring-foreground/14'
            )}
          >
            <span className="font-medium">{t.boards.starter[preset].name}</span>
            <span className="text-muted-foreground text-sm">
              {t.boards.starter[preset].description}
            </span>
          </button>
        )
      })}
    </div>
  )
}

const OnboardingPage = () => {
  const t = useT()
  const language = useLocale()
  const navigate = useNavigate()
  const [starterBoards, setStarterBoards] = useState<BoardPreset[]>([
    'money',
    'trips',
  ])

  const save = useMutation(
    orpc.settings.save.mutationOptions({
      onSuccess: () => navigate({ to: '/today' }),
    })
  )
  const submit = () =>
    save.mutate({
      language,
      starterBoards,
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

        <Step title={t.onboarding.boardsTitle}>
          <p className="text-muted-foreground text-sm">
            {t.onboarding.boardsHint(MAX_STARTER_BOARDS)}
          </p>
          <BoardPresetChoice
            value={starterBoards}
            onChange={setStarterBoards}
          />
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
