import { LEGAL_UPDATED_AT } from '../legal/updated-at'
import { COMPARISONS, TRIAL_DAYS } from './marketing'

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
    COMPARISONS.map(({ name, slug, summary }) => [
      `/compare/${slug}`,
      { description: summary, title: `${SITE_NAME} vs ${name}` },
    ])
  ),
  '/login': {
    description:
      'Fewmail reads your Gmail for you, answers in your voice and only shows you what actually needs you.',
    title: `${SITE_NAME}: only what matters in your inbox`,
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
