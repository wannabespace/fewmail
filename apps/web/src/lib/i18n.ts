import { messages } from '@fewmail/shared/i18n'
import type { Locale } from '@fewmail/shared/i18n/locales'
import { LOCALES, matchLocale } from '@fewmail/shared/i18n/locales'
import { type } from 'arktype'
import type { Locale as DateLocale } from 'date-fns'
import { format, formatDistanceToNowStrict } from 'date-fns'
import {
  de,
  enUS,
  es,
  fr,
  hi,
  id,
  it,
  ja,
  ko,
  nl,
  pl,
  ptBR,
  tr,
  uk,
  zhCN,
} from 'date-fns/locale'
import { useSubscription } from 'seitu/react'
import { createWebStorageValue } from 'seitu/web'

const DATE_LOCALES: Record<Locale, DateLocale> = {
  de,
  en: enUS,
  es,
  fr,
  hi,
  id,
  it,
  ja,
  ko,
  nl,
  pl,
  pt: ptBR,
  tr,
  uk,
  zh: zhCN,
}

/** Before sign-in the browser decides; afterwards the agent language from settings does. */
export const localeStore = createWebStorageValue({
  defaultValue: matchLocale(navigator.languages),
  key: 'fewmail.locale',
  schema: type.enumerated(...LOCALES.map(({ code }) => code)),
  type: 'localStorage',
})

localeStore.subscribe(
  (locale) => {
    document.documentElement.lang = locale
  },
  { immediate: true }
)

export const useLocale = () => useSubscription(localeStore)

export const useT = () => messages[useLocale()]

export const useMoneyFormat = () => {
  const locale = useLocale()
  return (cents: number, currency: string) =>
    new Intl.NumberFormat(locale, { currency, style: 'currency' }).format(
      cents / 100
    )
}

export const useDates = () => {
  const code = useLocale()
  const locale = DATE_LOCALES[code]
  return {
    ago: (date: Date) =>
      Date.now() - date.getTime() < 60_000
        ? messages[code].justNow
        : formatDistanceToNowStrict(date, { addSuffix: true, locale }),
    format: (date: Date | number, pattern: string) =>
      format(date, pattern, { locale }),
  }
}
