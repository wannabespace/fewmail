import type { Locale } from '@fewmail/shared/i18n/locales'
import { LOCALES } from '@fewmail/shared/i18n/locales'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@fewmail/ui/components/select'

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
