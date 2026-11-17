import type { Messages } from '@fewmail/shared/i18n'
import type { Locale } from '@fewmail/shared/i18n/locales'
import { isLocale } from '@fewmail/shared/i18n/locales'

import { LEGAL_UPDATED_AT } from '../legal/updated-at'
import {
  COMPARISONS,
  COMPARISONS_CHECKED_AT,
  PLANS,
  TRIAL_DAYS,
} from './marketing'

export const SITE_NAME = 'Fewmail'

export const OG_IMAGE = {
  alt: `${SITE_NAME}: only what matters in your inbox`,
  height: 630,
  path: '/og.png',
  width: 1200,
}

/** Every public page but the legal documents exists in each language: English at its path, the rest under `/<locale>`. */
export const LOCALIZED_PATHS = [
  '/',
  '/pricing',
  '/compare',
  ...COMPARISONS.map(({ slug }) => `/compare/${slug}`),
  '/mcp',
  '/ai-email-assistant',
  '/login',
]

const LEGAL_PAGES: Record<string, PageMeta> = {
  '/privacy': {
    description:
      'What Fewmail reads in Gmail, how AI and connected services use it, and your privacy and deletion choices.',
    title: `Privacy Policy · ${SITE_NAME}`,
    updatedAt: LEGAL_UPDATED_AT,
  },
  '/terms': {
    description:
      'The terms for using Fewmail, the email agent that reads your Gmail and only shows you what needs you.',
    title: `Terms of Service · ${SITE_NAME}`,
    updatedAt: LEGAL_UPDATED_AT,
  },
}

/** The only indexable routes; every other path is the signed-in app and stays `noindex`. */
export const PUBLIC_PATHS = [...LOCALIZED_PATHS, ...Object.keys(LEGAL_PAGES)]

interface PageMeta {
  description: string
  title: string
  updatedAt?: Date
}

export const localizedPath = (locale: Locale, path: string) =>
  locale === 'en' ? path : `/${locale}${path}`

/** `/uk/pricing` → `uk` and `/pricing`. Only a localized page has a locale prefix; `/id/...` is never an app route. */
export const splitLocale = (pathname: string) => {
  const [, first = '', ...rest] = pathname.split('/')
  const path = `/${rest.join('/')}`
  return first !== 'en' && isLocale(first) && LOCALIZED_PATHS.includes(path)
    ? { locale: first, path }
    : { locale: null, path: pathname }
}

/** The language a public page's URL names (`en` when unprefixed); `null` off the localized pages. */
export const urlLocale = (pathname: string): Locale | null => {
  const { locale, path } = splitLocale(pathname)
  return LOCALIZED_PATHS.includes(path) ? (locale ?? 'en') : null
}

export const pageMeta = (path: string, t: Messages): PageMeta | undefined => {
  const { comparison, comparisons, meta, nav } = t.site
  const pages: Record<string, PageMeta> = {
    '/': { description: meta.home, title: `${SITE_NAME}: ${meta.tagline}` },
    '/ai-email-assistant': {
      description: meta.assistant,
      title: `${meta.assistantTitle} · ${SITE_NAME}`,
    },
    '/compare': {
      description: meta.compare,
      title: `${meta.compareTitle} · ${SITE_NAME}`,
    },
    ...Object.fromEntries(
      COMPARISONS.map(({ name, slug }) => [
        `/compare/${slug}`,
        {
          description: comparisons[slug].summary,
          title: comparison.title(name),
          updatedAt: COMPARISONS_CHECKED_AT,
        },
      ])
    ),
    '/login': { description: meta.login, title: `${SITE_NAME}: ${meta.motto}` },
    '/mcp': { description: meta.mcp, title: `${nav.mcp} · ${SITE_NAME}` },
    '/pricing': {
      description: meta.pricing(TRIAL_DAYS),
      title: `${nav.pricing} · ${SITE_NAME}`,
    },
    ...LEGAL_PAGES,
  }
  return pages[path]
}

export const pageTitle = (path: string, t: Messages) =>
  pageMeta(path, t)?.title ?? SITE_NAME

const faqPage = (items: { answer: string; question: string }[]) => ({
  '@type': 'FAQPage',
  mainEntity: items.map(({ answer, question }) => ({
    '@type': 'Question',
    acceptedAnswer: { '@type': 'Answer', text: answer },
    name: question,
  })),
})

/** schema.org JSON-LD for a public page. `WebSite` on `/` is what makes Google name the result "Fewmail" instead of the domain. */
export const structuredData = (
  path: string,
  { locale, origin, t }: { locale: Locale; origin: string; t: Messages }
) => {
  const { site } = t
  const url = (to: string) => `${origin}${localizedPath(locale, to)}`
  const prices = PLANS.map(({ price }) => price.month)
  const app = {
    '@type': 'SoftwareApplication',
    applicationCategory: 'CommunicationApplication',
    description: site.meta.home,
    inLanguage: locale,
    name: SITE_NAME,
    offers: {
      '@type': 'AggregateOffer',
      highPrice: Math.max(...prices),
      lowPrice: Math.min(...prices),
      offerCount: PLANS.length,
      priceCurrency: 'USD',
    },
    operatingSystem: 'Web',
    url: url('/'),
  }
  const comparison = COMPARISONS.find(({ slug }) => path === `/compare/${slug}`)
  const graph =
    {
      '/': [
        {
          '@type': 'WebSite',
          inLanguage: locale,
          name: SITE_NAME,
          url: url('/'),
        },
        {
          '@type': 'Organization',
          legalName: 'Wannabe Space, LLC',
          logo: `${origin}/apple-touch-icon.png`,
          name: SITE_NAME,
          url: `${origin}/`,
        },
        app,
        faqPage(site.faq(TRIAL_DAYS)),
      ],
      '/ai-email-assistant': [app, faqPage(site.assistantPage.faq(TRIAL_DAYS))],
      '/pricing': [app],
    }[path] ??
    (comparison && [
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          [site.nav.compare, url('/compare')],
          [comparison.name, url(path)],
        ].map(([name, item], index) => ({
          '@type': 'ListItem',
          item,
          name,
          position: index + 1,
        })),
      },
    ])
  return graph && { '@context': 'https://schema.org', '@graph': graph }
}
