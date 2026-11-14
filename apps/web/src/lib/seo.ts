import { en } from '@fewmail/shared/i18n/messages/en'

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

/** English only: crawlers get one language. The only indexable routes; every other path is the signed-in app and stays `noindex`. */
export const PUBLIC_PAGES: Record<
  string,
  { description: string; title: string; updatedAt?: Date }
> = {
  '/': {
    description:
      'Fewmail is an email agent for Gmail: it reads every email, drafts replies in your voice and shows you only what needs you.',
    title: `${SITE_NAME}: the email agent for Gmail`,
  },
  '/compare': {
    description:
      'How Fewmail compares to Superhuman, Shortwave and SaneBox: an agent that reads your mail instead of a faster way to read it yourself.',
    title: `Compare · ${SITE_NAME}`,
  },
  ...Object.fromEntries(
    COMPARISONS.map(({ name, slug }) => [
      `/compare/${slug}`,
      {
        description: en.site.comparisons[slug].summary,
        title: en.site.comparison.title(name),
        updatedAt: COMPARISONS_CHECKED_AT,
      },
    ])
  ),
  '/login': {
    description:
      'Fewmail reads your Gmail for you, answers in your voice and only shows you what actually needs you.',
    title: `${SITE_NAME}: only what matters in your inbox`,
  },
  '/mcp': {
    description:
      'Connect Fewmail to Claude, ChatGPT, Claude Code or Cursor as an MCP server: read and triage your Gmail from the AI you already use.',
    title: `MCP · ${SITE_NAME}`,
  },
  '/pricing': {
    description: `Fewmail is free forever for sorting, rules and spam protection. Pro, the whole agent, starts with ${TRIAL_DAYS} free days and no card.`,
    title: `Pricing · ${SITE_NAME}`,
  },
  '/privacy': {
    description:
      'What Fewmail reads in your Gmail, what it stores encrypted, what it shares and how to delete everything.',
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

export const pageTitle = (pathname: string) =>
  PUBLIC_PAGES[pathname]?.title ?? SITE_NAME

/** schema.org JSON-LD for a public page. `WebSite` on `/` is what makes Google name the result "Fewmail" instead of the domain. */
export const structuredData = (path: string, origin: string) => {
  const { site } = en
  const prices = PLANS.map(({ price }) => price.month)
  const app = {
    '@type': 'SoftwareApplication',
    applicationCategory: 'CommunicationApplication',
    description: PUBLIC_PAGES['/']?.description,
    name: SITE_NAME,
    offers: {
      '@type': 'AggregateOffer',
      highPrice: Math.max(...prices),
      lowPrice: Math.min(...prices),
      offerCount: PLANS.length,
      priceCurrency: 'USD',
    },
    operatingSystem: 'Web',
    url: `${origin}/`,
  }
  const comparison = COMPARISONS.find(({ slug }) => path === `/compare/${slug}`)
  const graph =
    {
      '/': [
        {
          '@type': 'WebSite',
          name: SITE_NAME,
          url: `${origin}/`,
        },
        {
          '@type': 'Organization',
          legalName: 'Wannabe Space, LLC',
          logo: `${origin}/apple-touch-icon.png`,
          name: SITE_NAME,
          url: `${origin}/`,
        },
        app,
        {
          '@type': 'FAQPage',
          mainEntity: site.faq(TRIAL_DAYS).map(({ answer, question }) => ({
            '@type': 'Question',
            acceptedAnswer: { '@type': 'Answer', text: answer },
            name: question,
          })),
        },
      ],
      '/pricing': [app],
    }[path] ??
    (comparison && [
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          [site.nav.compare, `${origin}/compare`],
          [comparison.name, `${origin}${path}`],
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
