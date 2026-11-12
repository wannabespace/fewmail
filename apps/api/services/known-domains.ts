import { db } from '@fewmail/db'
import { knownDomains } from '@fewmail/db/schema'
import type { DomainList } from '@fewmail/shared/agent'
import { and, eq, inArray, lt, sql } from 'drizzle-orm'

import { logError } from '../lib/log'

const POPULAR_LIMIT = 10_000
const INSERT_BATCH = 5000
const DAY_MS = 24 * 60 * 60_000

/** Shared mailbox providers: a spammer on gmail.com says nothing about gmail.com. */
export const FREEMAIL_DOMAINS = new Set([
  '126.com',
  '163.com',
  'abv.bg',
  'aim.com',
  'aliyun.com',
  'aol.com',
  'arcor.de',
  'att.net',
  'bigmir.net',
  'bk.ru',
  'bluewin.ch',
  'bol.com.br',
  'btinternet.com',
  'centrum.cz',
  'comcast.net',
  'daum.net',
  'email.com',
  'email.cz',
  'fastmail.com',
  'fastmail.fm',
  'foxmail.com',
  'free.fr',
  'freenet.de',
  'gazeta.pl',
  'gmail.com',
  'gmx.at',
  'gmx.ch',
  'gmx.co.uk',
  'gmx.com',
  'gmx.de',
  'gmx.fr',
  'gmx.net',
  'gmx.us',
  'googlemail.com',
  'hanmail.net',
  'hey.com',
  'hotmail.be',
  'hotmail.ca',
  'hotmail.co.jp',
  'hotmail.co.uk',
  'hotmail.com',
  'hotmail.com.ar',
  'hotmail.com.br',
  'hotmail.de',
  'hotmail.es',
  'hotmail.fr',
  'hotmail.it',
  'hotmail.nl',
  'hushmail.com',
  'i.ua',
  'icloud.com',
  'inbox.lv',
  'inbox.ru',
  'interia.pl',
  'internet.ru',
  'kakao.com',
  'laposte.net',
  'libero.it',
  'list.ru',
  'live.ca',
  'live.co.uk',
  'live.com',
  'live.com.au',
  'live.de',
  'live.fr',
  'live.it',
  'live.nl',
  'mac.com',
  'mail.com',
  'mail.de',
  'mail.ru',
  'mailfence.com',
  'me.com',
  'meta.ua',
  'msn.com',
  'naver.com',
  'neuf.fr',
  'o2.pl',
  'onet.pl',
  'op.pl',
  'orange.fr',
  'outlook.com',
  'outlook.com.br',
  'outlook.de',
  'outlook.es',
  'outlook.fr',
  'outlook.it',
  'outlook.jp',
  'pm.me',
  'posteo.de',
  'proton.me',
  'protonmail.ch',
  'protonmail.com',
  'qq.com',
  'rambler.ru',
  'rediffmail.com',
  'rocketmail.com',
  'sbcglobal.net',
  'seznam.cz',
  'sfr.fr',
  'sina.com',
  'sohu.com',
  't-online.de',
  'terra.com.br',
  'tiscali.it',
  'tuta.com',
  'tuta.io',
  'tutanota.com',
  'tutanota.de',
  'ukr.net',
  'uol.com.br',
  'verizon.net',
  'virgilio.it',
  'wanadoo.fr',
  'web.de',
  'windowslive.com',
  'wp.pl',
  'ya.ru',
  'yahoo.ca',
  'yahoo.co.id',
  'yahoo.co.in',
  'yahoo.co.jp',
  'yahoo.co.uk',
  'yahoo.com',
  'yahoo.com.ar',
  'yahoo.com.au',
  'yahoo.com.br',
  'yahoo.com.hk',
  'yahoo.com.mx',
  'yahoo.com.ph',
  'yahoo.com.sg',
  'yahoo.com.tw',
  'yahoo.de',
  'yahoo.es',
  'yahoo.fr',
  'yahoo.it',
  'yandex.by',
  'yandex.com',
  'yandex.kz',
  'yandex.ru',
  'yandex.ua',
  'yeah.net',
  'ymail.com',
  'zoho.com',
  'zohomail.com',
])

/** Licenses: Majestic Million CC BY 3.0, Phishing.Database MIT, disposable-email-domains CC0, StopForumSpam CC BY-NC with commercial use allowed (no resale). */
const FEEDS: Record<
  DomainList,
  { maxAgeMs: number; parse: (lines: string[]) => string[]; url: string }
> = {
  disposable: {
    maxAgeMs: 7 * DAY_MS,
    parse: (lines) => lines,
    url: 'https://raw.githubusercontent.com/disposable-email-domains/disposable-email-domains/main/disposable_email_blocklist.conf',
  },
  phishing: {
    maxAgeMs: DAY_MS,
    parse: (lines) => lines,
    url: 'https://raw.githubusercontent.com/Phishing-Database/Phishing.Database/master/phishing-domains-ACTIVE.txt',
  },
  spam: {
    maxAgeMs: DAY_MS,
    parse: (lines) => lines,
    url: 'https://www.stopforumspam.com/downloads/toxic_domains_whole.txt',
  },
  popular: {
    maxAgeMs: 30 * DAY_MS,
    parse: (lines) =>
      lines.slice(1, POPULAR_LIMIT + 1).map((line) => line.split(',')[2] ?? ''),
    url: 'https://downloads.majestic.com/majestic_million.csv',
  },
}

const DOMAIN = /^[a-z0-9.-]+\.[a-z]{2,}$/u

/** Majestic is 80 MB; only the head is needed, so stop reading once enough lines arrived. */
const fetchLines = async (url: string, limit: number) => {
  const response = await fetch(url)
  if (!response.ok || !response.body) {
    throw new Error(`${url} answered ${response.status}`)
  }
  const lines: string[] = []
  let rest = ''
  const decoder = new TextDecoder()
  for await (const chunk of response.body) {
    const parts = (rest + decoder.decode(chunk, { stream: true })).split('\n')
    rest = parts.pop() ?? ''
    lines.push(...parts)
    if (lines.length > limit) {
      break
    }
  }
  lines.push(rest)
  return lines.map((line) => line.trim().toLowerCase()).filter(Boolean)
}

const refreshList = async (list: DomainList) => {
  const feed = FEEDS[list]
  const startedAt = new Date()
  const lines = await fetchLines(
    feed.url,
    list === 'popular' ? POPULAR_LIMIT + 1 : Number.POSITIVE_INFINITY
  )
  const domains = [
    ...new Set(
      feed
        .parse(lines)
        .filter((domain) => !domain.startsWith('#') && DOMAIN.test(domain))
    ),
  ]
  if (domains.length === 0) {
    throw new Error(`${list} feed came back empty`)
  }
  for (let start = 0; start < domains.length; start += INSERT_BATCH) {
    // oxlint-disable-next-line eslint/no-await-in-loop -- one batch at a time keeps a 500k-row feed inside Postgres parameter limits
    await db
      .insert(knownDomains)
      .values(
        domains.slice(start, start + INSERT_BATCH).map((domain, index) => ({
          domain,
          list,
          rank: list === 'popular' ? start + index + 1 : null,
          updatedAt: startedAt,
        }))
      )
      .onConflictDoUpdate({
        set: { rank: sql`excluded.rank`, updatedAt: startedAt },
        target: [knownDomains.list, knownDomains.domain],
      })
  }
  await db
    .delete(knownDomains)
    .where(
      and(eq(knownDomains.list, list), lt(knownDomains.updatedAt, startedAt))
    )
  return domains.length
}

const isStale = async (list: DomainList) => {
  const [row] = await db
    .select({ at: sql<Date | null>`max(${knownDomains.updatedAt})` })
    .from(knownDomains)
    .where(eq(knownDomains.list, list))
  return (
    !row?.at || Date.now() - new Date(row.at).getTime() > FEEDS[list].maxAgeMs
  )
}

const CHECK_EVERY_MS = 60 * 60_000
let checkedAt = 0

export const refreshKnownDomains = async ({ force = false } = {}) => {
  if (!force && Date.now() - checkedAt < CHECK_EVERY_MS) {
    return {}
  }
  checkedAt = Date.now()
  const counts: Partial<Record<DomainList, number>> = {}
  for (const list of Object.keys(FEEDS) as DomainList[]) {
    // oxlint-disable-next-line eslint/no-await-in-loop -- feeds load one by one so a slow mirror never holds three big downloads in memory
    if (force || (await isStale(list))) {
      // oxlint-disable-next-line eslint/no-await-in-loop -- same as above
      counts[list] = await refreshList(list).catch((error) => {
        logError(`known domains: ${list} refresh failed`, error)
        return 0
      })
    }
  }
  return counts
}

/** The domain itself and every parent, so `login.paypal.com.evil.ru` meets a listed `evil.ru`. */
const withParents = (domain: string) => {
  const parts = domain.split('.')
  return parts.slice(0, -1).map((_, index) => parts.slice(index).join('.'))
}

export const listedDomains = async (list: DomainList, domains: string[]) => {
  const candidates = [...new Set(domains.flatMap(withParents))]
  if (candidates.length === 0) {
    return []
  }
  const rows = await db
    .select({ domain: knownDomains.domain })
    .from(knownDomains)
    .where(
      and(eq(knownDomains.list, list), inArray(knownDomains.domain, candidates))
    )
  return rows.map(({ domain }) => domain)
}

export const popularDomains = async () => {
  const rows = await db
    .select({ domain: knownDomains.domain })
    .from(knownDomains)
    .where(eq(knownDomains.list, 'popular'))
  return rows.map(({ domain }) => domain)
}

let popular: { at: number; domains: Set<string> } = {
  at: 0,
  domains: new Set(),
}

export const popularDomainSet = async () => {
  if (Date.now() - popular.at > CHECK_EVERY_MS) {
    popular = { at: Date.now(), domains: new Set(await popularDomains()) }
  }
  return popular.domains
}
