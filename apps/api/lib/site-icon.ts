import { Result } from 'better-result'

import { FREEMAIL_DOMAINS } from '../services/known-domains'
import { registrable } from '../services/patterns'
import { logError } from './log'

interface SiteIcon {
  bytes: ArrayBuffer
  type: string
}

const ICON_PX = 64
const CACHED_ICONS = 5000
const FETCH_TIMEOUT_MS = 4000
const DOMAIN = /^(?:[a-z0-9-]+\.)+[a-z]{2,}$/u

const icons = new Map<string, Promise<SiteIcon | null>>()

const fetchIcon = async (site: string) => {
  const icon = await Result.tryPromise(async () => {
    const response = await fetch(
      `https://www.google.com/s2/favicons?sz=${ICON_PX}&domain=${site}`,
      { signal: AbortSignal.timeout(FETCH_TIMEOUT_MS) }
    )
    // Google answers an unknown site with 404 and a generic globe, which would hide the sender's initial.
    return response.ok
      ? {
          bytes: await response.arrayBuffer(),
          type: response.headers.get('content-type') ?? 'image/png',
        }
      : null
  })
  if (icon.isErr()) {
    logError('site icon fetch', icon.error.cause)
    icons.delete(site)
    return null
  }
  return icon.value
}

/** The icon of the company behind a sender's domain, fetched by our server so the browser never tells Google who writes to the user. Mailbox providers have none: a gmail.com sender is a person. */
export const siteIcon = (domain: string) => {
  const site = registrable(domain)
  if (
    !DOMAIN.test(site) ||
    FREEMAIL_DOMAINS.has(domain) ||
    FREEMAIL_DOMAINS.has(site)
  ) {
    return Promise.resolve(null)
  }
  const cached = icons.get(site)
  if (cached) {
    return cached
  }
  if (icons.size >= CACHED_ICONS) {
    icons.delete(icons.keys().next().value ?? '')
  }
  const icon = fetchIcon(site)
  icons.set(site, icon)
  return icon
}
