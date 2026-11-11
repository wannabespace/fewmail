import type { Persona } from '@fewmail/shared/agent'
import { PERSONAS } from '@fewmail/shared/agent'
import type { Locale } from '@fewmail/shared/i18n/locales'
import { LOCALES } from '@fewmail/shared/i18n/locales'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@fewmail/ui/components/select'
import { cn } from '@fewmail/ui/lib/utils'

import { useT } from '~/lib/i18n'

export const LanguageSelect = ({
  onChange,
  value,
}: {
  onChange: (language: Locale) => void
  value: Locale
}) => (
  <Select
    items={LOCALES.map(({ code, label }) => ({ label, value: code }))}
    value={value}
    onValueChange={(next) => next && onChange(next)}
  >
    <SelectTrigger aria-label="Language" className="w-48">
      <SelectValue />
    </SelectTrigger>
    <SelectContent>
      {LOCALES.map(({ code, label }) => (
        <SelectItem key={code} value={code} lang={code}>
          {label}
        </SelectItem>
      ))}
    </SelectContent>
  </Select>
)

const BRIEF_HOURS = Array.from({ length: 24 }, (_, hour) => hour)

export const formatHour = (hour: number) =>
  `${String(hour).padStart(2, '0')}:00`

export const BriefHourSelect = ({
  label,
  onChange,
  value,
}: {
  label?: (time: string) => string
  onChange: (hour: number) => void
  value: number
}) => {
  const t = useT()

  return (
    <Select
      items={BRIEF_HOURS.map((hour) => ({
        label: formatHour(hour),
        value: hour,
      }))}
      value={value}
      onValueChange={(next) => next !== null && onChange(next)}
    >
      {label ? (
        <SelectTrigger
          aria-label={t.settings.briefTitle}
          size="sm"
          variant="ghost-faint"
        >
          <SelectValue>{(hour: number) => label(formatHour(hour))}</SelectValue>
        </SelectTrigger>
      ) : (
        <SelectTrigger aria-label={t.settings.briefTitle} className="w-28">
          <SelectValue />
        </SelectTrigger>
      )}
      <SelectContent>
        {BRIEF_HOURS.map((hour) => (
          <SelectItem key={hour} value={hour}>
            {formatHour(hour)}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}

export const PersonaSelect = ({
  onChange,
  value,
}: {
  onChange: (persona: Persona) => void
  value: Persona
}) => {
  const t = useT()

  return (
    <Select
      items={PERSONAS.map((persona) => ({
        label: t.persona[persona].title,
        value: persona,
      }))}
      value={value}
      onValueChange={(persona) => persona && onChange(persona)}
    >
      <SelectTrigger aria-label={t.settings.persona} className="w-44">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {PERSONAS.map((persona) => (
          <SelectItem key={persona} value={persona}>
            {t.persona[persona].title}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}

export const PersonaChoice = ({
  onChange,
  value,
}: {
  onChange: (persona: Persona) => void
  value: Persona
}) => {
  const t = useT()

  return (
    <div
      role="radiogroup"
      aria-label={t.onboarding.personaTitle}
      className="grid gap-3 sm:grid-cols-2"
    >
      {PERSONAS.map((persona, index) => (
        <button
          key={persona}
          type="button"
          // oxlint-disable-next-line jsx-a11y/prefer-tag-over-role -- styled card acting as a radio
          role="radio"
          aria-checked={value === persona}
          onClick={() => onChange(persona)}
          className={cn(
            'bg-popover focus-visible:focus-ring flex cursor-pointer flex-col gap-1.5 rounded-2xl p-4 text-left shadow-xs ring transition-[box-shadow,background-color] outline-none',
            value === persona
              ? 'ring-primary ring-2'
              : 'ring-foreground/6 hover:ring-foreground/14'
          )}
        >
          <span className="flex items-center justify-between">
            <span className="font-medium">{t.persona[persona].title}</span>
            <span className="text-muted-foreground text-xs">{index + 1}</span>
          </span>
          <span className="text-muted-foreground text-sm">
            {t.persona[persona].description}
          </span>
        </button>
      ))}
    </div>
  )
}
