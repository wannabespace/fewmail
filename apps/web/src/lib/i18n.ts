import type { Messages } from '@fewmail/shared/i18n'
import type { Locale } from '@fewmail/shared/i18n/locales'
import { LOCALES, matchLocale } from '@fewmail/shared/i18n/locales'
import { en } from '@fewmail/shared/i18n/messages/en'
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
import { createStore } from 'seitu'
import { useSubscription } from 'seitu/react'
import { createCookieValue, createWebStorageValue } from 'seitu/web'

/** date-fns abbreviates Ukrainian weekdays as "пон", "чтв"; people write "пн", "чт", its short width. */
const ukrainian: DateLocale = {
  ...uk,
  localize: {
    ...uk.localize,
    day: (day, options) =>
      uk.localize.day(
        day,
        options?.width === 'abbreviated'
          ? { ...options, width: 'short' }
          : options
      ),
  },
}

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
  uk: ukrainian,
  zh: zhCN,
}

/** Before sign-in the browser decides, or the public site's pick; it seeds onboarding and the next visit. */
const savedLocale = createWebStorageValue({
  defaultValue: matchLocale(navigator.languages),
  key: 'fewmail.locale',
  schema: type.enumerated(...LOCALES.map(({ code }) => code)),
  type: 'localStorage',
})

/**
 * This tab's language; signed in, the account's setting (`_app.tsx`). Never read the storage directly: it is shared by
 * every tab, so the public site's footer in another tab would switch a signed-in app away from the account's language.
 */
export const localeStore = createStore<Locale>(savedLocale.get())
localeStore.subscribe((locale) => savedLocale.set(locale))

/** A copy for the server: `Caddyfile` sends a public page to this language's URL by it. */
const localeCookie = createCookieValue({
  defaultValue: localeStore.get(),
  key: 'fewmail.locale',
  schema: type.enumerated(...LOCALES.map(({ code }) => code)),
})

/** Only English ships in the main bundle (crawlers and the prerender read it); every other language is its own chunk. */
const LOAD_MESSAGES: Record<Exclude<Locale, 'en'>, () => Promise<Messages>> = {
  de: () =>
    import('@fewmail/shared/i18n/messages/de').then((module) => module.de),
  es: () =>
    import('@fewmail/shared/i18n/messages/es').then((module) => module.es),
  fr: () =>
    import('@fewmail/shared/i18n/messages/fr').then((module) => module.fr),
  hi: () =>
    import('@fewmail/shared/i18n/messages/hi').then((module) => module.hi),
  id: () =>
    import('@fewmail/shared/i18n/messages/id').then((module) => module.id),
  it: () =>
    import('@fewmail/shared/i18n/messages/it').then((module) => module.it),
  ja: () =>
    import('@fewmail/shared/i18n/messages/ja').then((module) => module.ja),
  ko: () =>
    import('@fewmail/shared/i18n/messages/ko').then((module) => module.ko),
  nl: () =>
    import('@fewmail/shared/i18n/messages/nl').then((module) => module.nl),
  pl: () =>
    import('@fewmail/shared/i18n/messages/pl').then((module) => module.pl),
  pt: () =>
    import('@fewmail/shared/i18n/messages/pt').then((module) => module.pt),
  tr: () =>
    import('@fewmail/shared/i18n/messages/tr').then((module) => module.tr),
  uk: () =>
    import('@fewmail/shared/i18n/messages/uk').then((module) => module.uk),
  zh: () =>
    import('@fewmail/shared/i18n/messages/zh').then((module) => module.zh),
}

const messagesStore = createStore<Messages>(en)

export const loadMessages = async (locale: Locale) => {
  const loaded = locale === 'en' ? en : await LOAD_MESSAGES[locale]()
  // A slower chunk for an earlier pick must not overwrite a later one.
  if (localeStore.get() === locale) {
    messagesStore.set(loaded)
  }
}

localeStore.subscribe(
  (locale) => {
    document.documentElement.lang = locale
    localeCookie.set(locale)
  },
  { immediate: true }
)
localeStore.subscribe((locale) => {
  void loadMessages(locale)
})

export const useLocale = () => useSubscription(localeStore)

export const useT = () => useSubscription(messagesStore)

/** Outside React: toasts and errors raised by the API client. */
export const getT = () => messagesStore.get()

export const useMoneyFormat = () => {
  const locale = useLocale()
  return (cents: number, currency: string) =>
    new Intl.NumberFormat(locale, { currency, style: 'currency' }).format(
      cents / 100
    )
}

export const weekStartOf = (code: Locale) =>
  DATE_LOCALES[code].options?.weekStartsOn ?? 1

export const useDates = () => {
  const code = useLocale()
  const t = useT()
  const locale = DATE_LOCALES[code]
  return {
    fromNow: (date: Date) =>
      Math.abs(Date.now() - date.getTime()) < 60_000
        ? t.justNow
        : formatDistanceToNowStrict(date, { addSuffix: true, locale }),
    format: (date: Date | number, pattern: string) =>
      format(date, pattern, { locale }),
    locale,
    weekStartsOn: weekStartOf(code),
  }
}
