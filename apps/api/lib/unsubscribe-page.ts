import { isPublicHost } from './gmail'

const PAGE_TIMEOUT_MS = 10_000
const MAX_REDIRECTS = 3
const PAGE_CHARS = 300_000
/** What a list's page says once you are off it, in the languages lists write most. */
const DONE =
  /unsubscribed|been removed|opted out|no longer receive|abgemeldet|désabonné|désinscrit|dado de baja|cancelad[ao] tu suscripci|disiscritt|uitgeschreven|wypisan|відписан|отписан|desinscrit|配信停止|구독 취소|退订成功/iu
const LEAVE =
  /unsubscri|opt.?out|abmelden|austragen|désabonn|désinscri|darse de baja|baja|disiscriv|uitschrijven|wypisz|відпис|отпис/iu
const FORM = /<form\b(?<attributes>[^>]*)>(?<body>[\s\S]*?)<\/form>/giu
const FIELD = /<(?:input|button)\b[^>]*>/giu

const attribute = (tag: string, name: string) => {
  const groups = new RegExp(
    String.raw`\b${name}\s*=\s*(?:"(?<double>[^"]*)"|'(?<single>[^']*)'|(?<bare>[^\s>]+))`,
    'iu'
  ).exec(tag)?.groups
  return (groups?.double ?? groups?.single ?? groups?.bare)?.replaceAll(
    '&amp;',
    '&'
  )
}

/** Only public http(s) hosts, every redirect checked on its own: the sender wrote this link. */
const fetchPublic = async (start: URL, init?: RequestInit) => {
  let url = start
  let request = init
  for (let hop = 0; hop <= MAX_REDIRECTS; hop += 1) {
    if (!/^https?:$/u.test(url.protocol) || !isPublicHost(url.hostname)) {
      return null
    }
    // oxlint-disable-next-line eslint/no-await-in-loop -- each redirect is checked before it is followed
    const response = await fetch(url, {
      ...request,
      redirect: 'manual',
      signal: AbortSignal.timeout(PAGE_TIMEOUT_MS),
    })
    const location = response.headers.get('location')
    if (response.status >= 300 && response.status < 400 && location) {
      url = new URL(location, url)
      request = undefined
      continue
    }
    return response.ok ? { response, url } : null
  }
  return null
}

const readPage = async (start: URL, init?: RequestInit) => {
  const reached = await fetchPublic(start, init)
  if (!reached) {
    return null
  }
  const html = await reached.response.text()
  return { html: html.slice(0, PAGE_CHARS), url: reached.url }
}

/** What the form would send: its named fields, checked boxes only, and the first submit button. */
const formFields = (body: string) => {
  const fields = new URLSearchParams()
  let submitted = false
  for (const [tag] of body.matchAll(FIELD)) {
    const name = attribute(tag, 'name')
    const kind = (attribute(tag, 'type') ?? 'text').toLowerCase()
    const isSubmit =
      kind === 'submit' || tag.toLowerCase().startsWith('<button')
    const isUnchecked =
      ['checkbox', 'radio'].includes(kind) && !/\bchecked\b/iu.test(tag)
    if (name && !isUnchecked && !(isSubmit && submitted)) {
      const checkable = kind === 'checkbox' || kind === 'radio'
      fields.append(name, attribute(tag, 'value') ?? (checkable ? 'on' : ''))
      submitted ||= isSubmit
    }
  }
  return fields
}

/** The page's unsubscribe form as a request, or null when it asks for more than a click (a password, a choice). */
const formRequest = (html: string, pageUrl: URL) => {
  for (const match of html.matchAll(FORM)) {
    const { attributes = '', body = '' } = match.groups ?? {}
    if (
      !LEAVE.test(`${attributes} ${body}`) ||
      /type\s*=\s*["']?password/iu.test(body)
    ) {
      continue
    }
    const fields = formFields(body)
    const action = new URL(attribute(attributes, 'action') ?? '', pageUrl)
    const isPost =
      (attribute(attributes, 'method') ?? 'get').toLowerCase() === 'post'
    if (!isPost) {
      for (const [key, value] of fields) {
        action.searchParams.append(key, value)
      }
    }
    return {
      init: isPost
        ? {
            body: fields,
            headers: { 'content-type': 'application/x-www-form-urlencoded' },
            method: 'POST',
          }
        : undefined,
      url: action,
    }
  }
  return null
}

/**
 * A list's plain unsubscribe link, followed the way a person would: open it, and when the page shows a
 * one-click form, send it. True only when a page says the address is off the list; pages that need
 * JavaScript or more than a click fail, and the caller archives instead.
 */
export const unsubscribeByPage = async (link: string) => {
  if (!URL.canParse(link)) {
    return false
  }
  const page = await readPage(new URL(link))
  if (!page) {
    return false
  }
  if (DONE.test(page.html)) {
    return true
  }
  const form = formRequest(page.html, page.url)
  if (!form) {
    return false
  }
  const answer = await readPage(form.url, form.init)
  return !!answer && DONE.test(answer.html)
}
