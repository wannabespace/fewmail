// Pickers list these as they stand: a new language goes where its `label` sorts.
export const LOCALES = [
  { code: 'id', english: 'Indonesian', label: 'Bahasa Indonesia' },
  { code: 'de', english: 'German', label: 'Deutsch' },
  { code: 'en', english: 'English', label: 'English' },
  { code: 'es', english: 'Spanish', label: 'Español' },
  { code: 'fr', english: 'French', label: 'Français' },
  { code: 'it', english: 'Italian', label: 'Italiano' },
  { code: 'nl', english: 'Dutch', label: 'Nederlands' },
  { code: 'pl', english: 'Polish', label: 'Polski' },
  { code: 'pt', english: 'Portuguese', label: 'Português' },
  { code: 'tr', english: 'Turkish', label: 'Türkçe' },
  { code: 'uk', english: 'Ukrainian', label: 'Українська' },
  { code: 'hi', english: 'Hindi', label: 'हिन्दी' },
  { code: 'ko', english: 'Korean', label: '한국어' },
  { code: 'ja', english: 'Japanese', label: '日本語' },
  { code: 'zh', english: 'Chinese (Simplified)', label: '简体中文' },
] as const

export type Locale = (typeof LOCALES)[number]['code']

export const DEFAULT_LOCALE: Locale = 'en'

export const isLocale = (value: string): value is Locale =>
  LOCALES.some(({ code }) => code === value)

/** Matches `uk-UA`, `pt-BR`, `zh-Hans-CN` to a supported locale. */
export const matchLocale = (tags: readonly string[]): Locale => {
  for (const tag of tags) {
    const base = tag.toLowerCase().split('-')[0] ?? ''
    if (isLocale(base)) {
      return base
    }
  }
  return DEFAULT_LOCALE
}

export const englishName = (locale: Locale) =>
  LOCALES.find(({ code }) => code === locale)?.english ?? 'English'

/** Plan limits reset at a UTC month start, so the day is read in UTC. */
export const formatResetDay = (locale: Locale, date: Date) =>
  new Intl.DateTimeFormat(locale, {
    day: 'numeric',
    month: 'long',
    timeZone: 'UTC',
  }).format(date)

/** An issue's day (YYYY-MM-DD, already the user's own): "Saturday, 14 November". */
export const formatIssueDay = (locale: Locale, day: string) =>
  new Intl.DateTimeFormat(locale, {
    day: 'numeric',
    month: 'long',
    timeZone: 'UTC',
    weekday: 'long',
  }).format(new Date(`${day}T12:00:00Z`))

/** "2 h 10 min" in the locale's own units, minutes dropped from four hours up. */
export const formatMinutes = (locale: Locale, minutes: number) => {
  const unit = (value: number, name: 'hour' | 'minute') =>
    new Intl.NumberFormat(locale, {
      style: 'unit',
      unit: name,
      unitDisplay: 'short',
    }).format(value)
  const hours = Math.floor(minutes / 60)
  const rest = Math.round(minutes % 60)
  if (hours === 0) {
    return unit(rest, 'minute')
  }
  return hours >= 4 || rest === 0
    ? unit(Math.round(minutes / 60), 'hour')
    : `${unit(hours, 'hour')} ${unit(rest, 'minute')}`
}

export const plural = (
  locale: Locale,
  count: number,
  forms: Partial<Record<Intl.LDMLPluralRule, (n: number) => string>> & {
    other: (n: number) => string
  }
) => (forms[new Intl.PluralRules(locale).select(count)] ?? forms.other)(count)

/** A message with typed slots (links, bold names) that the caller fills with its own nodes. */
export type Rich<Slot extends string> = <Node>(
  slots: Record<Slot, Node>
) => (Node | string)[]
