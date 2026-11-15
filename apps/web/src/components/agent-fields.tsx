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
}) => {
  const t = useT()

  return (
    <Select
      items={LOCALES.map(({ code, label }) => ({ label, value: code }))}
      value={value}
      onValueChange={(next) => next && onChange(next)}
    >
      <SelectTrigger aria-label={t.settings.language} className="w-48">
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
}

const HOURS = Array.from({ length: 24 }, (_, hour) => hour)

export const formatHour = (hour: number) =>
  `${String(hour).padStart(2, '0')}:00`

export const MorningHourSelect = ({
  onChange,
  value,
}: {
  onChange: (hour: number) => void
  value: number
}) => {
  const t = useT()

  return (
    <Select
      items={HOURS.map((hour) => ({ label: formatHour(hour), value: hour }))}
      value={value}
      onValueChange={(next) => next !== null && onChange(next)}
    >
      <SelectTrigger aria-label={t.settings.morningTitle} className="w-28">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {HOURS.map((hour) => (
          <SelectItem key={hour} value={hour}>
            {formatHour(hour)}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
