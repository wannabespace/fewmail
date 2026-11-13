import { Buffer } from 'node:buffer'
import { isIP } from 'node:net'

import { textToHtml } from '@fewmail/shared/email'

import type { GmailAccount } from './auth'
import { gmailAccessToken } from './auth'
import { domainOf } from './keyed-hash'
import { mailSignals } from './mail-auth'
import { oneTimeCode } from './one-time-code'

const GMAIL_API = 'https://gmail.googleapis.com/gmail/v1/users/me'

/** A 404 from `/history` means the history id expired. */
export class GmailError extends Error {
  override name = 'GmailError'
  readonly status: number

  constructor(status: number, message: string) {
    super(message)
    this.status = status
  }
}

/** Also an expired history id, when it comes from `listHistory`. */
export const isMissing = (error: unknown) =>
  error instanceof GmailError && error.status === 404

const RATE_LIMIT_RETRIES = 6

/** The per-user quota answers 429 or a 403 `rateLimitExceeded`/`userRateLimitExceeded`; it refills within a minute. */
const isRateLimited = (status: number, body: string) =>
  status === 429 || (status === 403 && /ratelimitexceeded/iu.test(body))

const gmail = async <T>(
  account: GmailAccount,
  path: string,
  init?: RequestInit,
  attempt = 0
): Promise<T> => {
  const response = await fetch(`${GMAIL_API}${path}`, {
    ...init,
    headers: {
      authorization: `Bearer ${await gmailAccessToken(account)}`,
      'content-type': 'application/json',
    },
  })

  if (!response.ok) {
    const body = await response.text()
    if (isRateLimited(response.status, body) && attempt < RATE_LIMIT_RETRIES) {
      await Bun.sleep(1000 * 2 ** attempt + Math.random() * 1000)
      return gmail<T>(account, path, init, attempt + 1)
    }
    throw new GmailError(
      response.status,
      `Gmail ${path} failed: ${response.status} ${body}`
    )
  }

  return (response.status === 204 ? undefined : await response.json()) as T
}

interface GmailPart {
  body?: { data?: string; attachmentId?: string; size?: number }
  filename?: string
  headers?: { name: string; value: string }[]
  mimeType: string
  parts?: GmailPart[]
}

interface GmailMessage {
  historyId: string
  id: string
  internalDate: string
  labelIds?: string[]
  payload: GmailPart
  snippet: string
  threadId: string
}

const decodeBase64Url = (data: string) =>
  Buffer.from(data, 'base64url').toString('utf-8')

const findPart = (part: GmailPart, mimeType: string): GmailPart | undefined =>
  part.mimeType === mimeType && part.body?.data
    ? part
    : part.parts?.map((child) => findPart(child, mimeType)).find(Boolean)

const NAMED_ENTITIES: Record<string, string> = {
  amp: '&',
  apos: "'",
  gt: '>',
  lt: '<',
  nbsp: ' ',
  quot: '"',
}

/** One pass, so `&amp;lt;` stays `&lt;` instead of turning into `<`. */
const decodeEntities = (text: string) =>
  text.replaceAll(
    /&(?:#(?<hex>x[\da-f]+)|#(?<dec>\d+)|(?<name>[a-z]+));/giu,
    (entity, ...args) => {
      const { dec, hex, name } = args.at(-1) as Record<string, string>
      const code = hex ? Number.parseInt(hex.slice(1), 16) : Number(dec)
      if (name) {
        return NAMED_ENTITIES[name.toLowerCase()] ?? entity
      }
      return code > 0 && code <= 0x10_ff_ff
        ? String.fromCodePoint(code)
        : entity
    }
  )

const htmlToText = (html: string) =>
  decodeEntities(
    html
      .replaceAll(/<(?<tag>style|script)[\s\S]*?<\/\k<tag>>/giu, '')
      .replaceAll(/<br\s*\/?>|<\/(?:p|div|tr|li|h\d)>/giu, '\n')
      .replaceAll(/<[^>]+>/gu, '')
  )
    .replaceAll(/\n{3,}/gu, '\n\n')
    .trim()

const hasAttachment = (part: GmailPart): boolean =>
  !!part.filename || !!part.parts?.some(hasAttachment)

const parseAddress = (value: string) => {
  const groups = value.match(
    /^\s*"?(?<name>[^"<]*?)"?\s*<(?<email>[^>]+)>\s*$/u
  )?.groups
  return groups?.email
    ? { email: groups.email.toLowerCase(), name: groups.name?.trim() || null }
    : { email: value.trim().toLowerCase(), name: null }
}

const splitAddresses = (value: string | undefined) =>
  value
    ? value
        .split(/,(?=(?:[^"]*"[^"]*")*[^"]*$)/u)
        .map((address) => parseAddress(address).email)
        .filter(Boolean)
    : []

const messageBody = (
  plain: string | undefined,
  html: string | undefined,
  snippet: string
) => {
  if (plain) {
    return decodeBase64Url(plain)
  }
  return html ? htmlToText(decodeBase64Url(html)) : snippet
}

export const parseMessage = (message: GmailMessage) => {
  const headers = new Map(
    (message.payload.headers ?? []).map(({ name, value }) => [
      name.toLowerCase(),
      value,
    ])
  )
  const plain = findPart(message.payload, 'text/plain')?.body?.data
  const html = findPart(message.payload, 'text/html')?.body?.data
  const from = parseAddress(headers.get('from') ?? '')
  const labelIds = message.labelIds ?? []
  const snippet = decodeEntities(message.snippet)
  const subject = headers.get('subject') ?? '(no subject)'
  const body = messageBody(plain, html, snippet)
  const isFromMe = labelIds.includes('SENT')

  return {
    ...mailSignals(message.payload.headers ?? []),
    body,
    cc: splitAddresses(headers.get('cc')),
    fromDomain: domainOf(from.email),
    fromEmail: from.email,
    fromName: from.name,
    gmailId: message.id,
    hasAttachments: hasAttachment(message.payload),
    html: html ? decodeBase64Url(html) : '',
    code: isFromMe ? null : oneTimeCode(subject, body),
    isFromMe,
    isUnread: labelIds.includes('UNREAD'),
    labelIds,
    listUnsubscribe: headers.get('list-unsubscribe') ?? null,
    listUnsubscribePost: headers.get('list-unsubscribe-post') ?? null,
    messageIdHeader: headers.get('message-id') ?? null,
    receivedAt: new Date(Number(message.internalDate)),
    replyTo: headers.get('reply-to')
      ? parseAddress(headers.get('reply-to') ?? '').email
      : null,
    snippet,
    subject,
    threadId: message.threadId,
    to: splitAddresses(headers.get('to')),
  }
}

export type ParsedMessage = ReturnType<typeof parseMessage>

export const getProfile = (account: GmailAccount) =>
  gmail<{ emailAddress: string; historyId: string }>(account, '/profile')

const LIST_PAGE_MAX = 500

/** Newest first; pages past Gmail's 500 a request until `max`. */
export const listMessageIds = async (
  account: GmailAccount,
  query: string,
  max: number
) => {
  const ids: string[] = []
  let pageToken: string | undefined
  do {
    // A search with no match comes back as an empty 204, not `{}`.
    // oxlint-disable-next-line eslint/no-await-in-loop -- pages chain via nextPageToken
    const page = await gmail<
      | {
          messages?: { id: string }[]
          nextPageToken?: string
        }
      | undefined
    >(
      account,
      `/messages?${new URLSearchParams({
        fields: 'messages/id,nextPageToken',
        maxResults: String(Math.min(LIST_PAGE_MAX, max - ids.length)),
        q: query,
        ...(pageToken && { pageToken }),
      })}`
    )
    ids.push(...(page?.messages ?? []).map(({ id }) => id))
    pageToken = page?.nextPageToken
  } while (pageToken && ids.length < max)
  return ids
}

/** Sender and list headers only: a fraction of a full message, for scanning a whole inbox. */
export const getMessageHeaders = async (account: GmailAccount, id: string) => {
  const message = await gmail<Pick<GmailMessage, 'labelIds' | 'payload'>>(
    account,
    `/messages/${id}?${new URLSearchParams([
      ['format', 'metadata'],
      ['metadataHeaders', 'From'],
      ['metadataHeaders', 'List-Unsubscribe'],
      ['fields', 'labelIds,payload/headers'],
    ])}`
  )
  const headers = new Map(
    (message.payload.headers ?? []).map(({ name, value }) => [
      name.toLowerCase(),
      value,
    ])
  )
  return {
    from: parseAddress(headers.get('from') ?? ''),
    gmailId: id,
    isList: headers.has('list-unsubscribe'),
    isUnread: (message.labelIds ?? []).includes('UNREAD'),
  }
}

const attachmentParts = (part: GmailPart): GmailPart[] => [
  ...(part.filename && part.body?.attachmentId ? [part] : []),
  ...(part.parts ?? []).flatMap(attachmentParts),
]

export const listAttachments = async (account: GmailAccount, id: string) => {
  const message = await gmail<Pick<GmailMessage, 'payload'>>(
    account,
    `/messages/${id}?${new URLSearchParams({ fields: 'payload', format: 'full' })}`
  )
  return attachmentParts(message.payload).map((part) => ({
    attachmentId: part.body?.attachmentId ?? '',
    filename: part.filename ?? '',
    mimeType: part.mimeType,
    size: part.body?.size ?? 0,
  }))
}

/** Standard base64, the encoding data URLs expect. */
export const getAttachment = async (
  account: GmailAccount,
  id: string,
  attachmentId: string
) => {
  const { data } = await gmail<{ data: string }>(
    account,
    `/messages/${id}/attachments/${attachmentId}`
  )
  return Buffer.from(data, 'base64url').toString('base64')
}

const BATCH_MODIFY_MAX = 1000

export const modifyMessages = async (
  account: GmailAccount,
  ids: string[],
  change: { add?: string[]; remove?: string[] }
) => {
  for (let index = 0; index < ids.length; index += BATCH_MODIFY_MAX) {
    // oxlint-disable-next-line eslint/no-await-in-loop -- one batch at a time stays inside the per-user quota
    await gmail(account, '/messages/batchModify', {
      body: JSON.stringify({
        addLabelIds: change.add ?? [],
        ids: ids.slice(index, index + BATCH_MODIFY_MAX),
        removeLabelIds: change.remove ?? [],
      }),
      method: 'POST',
    })
  }
}

export const listThreadMessageIds = async (
  account: GmailAccount,
  threadId: string
) => {
  const { messages = [] } = await gmail<{ messages?: { id: string }[] }>(
    account,
    `/threads/${threadId}?${new URLSearchParams({ fields: 'messages/id', format: 'minimal' })}`
  )
  return messages.map(({ id }) => id)
}

export const watchInbox = (account: GmailAccount, topicName: string) =>
  gmail<{ expiration: string; historyId: string }>(account, '/watch', {
    body: JSON.stringify({ topicName }),
    method: 'POST',
  })

interface HistoryMessage {
  message: { id: string; labelIds?: string[] }
}

/** New message ids plus the current labels of messages whose labels changed (archive, read, snooze elsewhere). */
export const listHistory = async (
  account: GmailAccount,
  startHistoryId: string
) => {
  const ids = new Set<string>()
  const labelChanges = new Map<string, string[]>()
  let pageToken: string | undefined
  let historyId = startHistoryId

  do {
    // oxlint-disable-next-line eslint/no-await-in-loop -- history pages chain via nextPageToken
    const page = await gmail<{
      history?: {
        labelsAdded?: HistoryMessage[]
        labelsRemoved?: HistoryMessage[]
        messagesAdded?: HistoryMessage[]
      }[]
      historyId: string
      nextPageToken?: string
    }>(
      account,
      `/history?${new URLSearchParams([
        ['historyTypes', 'messageAdded'],
        ['historyTypes', 'labelAdded'],
        ['historyTypes', 'labelRemoved'],
        ['startHistoryId', startHistoryId],
        ...(pageToken ? [['pageToken', pageToken]] : []),
      ])}`
    )
    for (const entry of page.history ?? []) {
      for (const added of entry.messagesAdded ?? []) {
        ids.add(added.message.id)
      }
      for (const changed of [
        ...(entry.labelsAdded ?? []),
        ...(entry.labelsRemoved ?? []),
      ]) {
        labelChanges.set(changed.message.id, changed.message.labelIds ?? [])
      }
    }
    ;({ historyId } = page)
    pageToken = page.nextPageToken
  } while (pageToken)

  return { historyId, ids: [...ids], labelChanges }
}

export const getMessage = async (account: GmailAccount, id: string) =>
  parseMessage(
    await gmail<GmailMessage>(account, `/messages/${id}?format=full`)
  )

// Without a body the parsed `body` is the snippet and `html` is empty: enough for a list row, never for reading.
const SUMMARY_FORMAT = [
  ['format', 'metadata'],
  ['metadataHeaders', 'From'],
  ['metadataHeaders', 'Subject'],
]

export const getMessageSummary = async (account: GmailAccount, id: string) =>
  parseMessage(
    await gmail<GmailMessage>(
      account,
      `/messages/${id}?${new URLSearchParams(SUMMARY_FORMAT)}`
    )
  )

export const getThreadSummary = async (
  account: GmailAccount,
  threadId: string
) => {
  const { messages = [] } = await gmail<{ messages?: GmailMessage[] }>(
    account,
    `/threads/${threadId}?${new URLSearchParams(SUMMARY_FORMAT)}`
  )
  return messages.map(parseMessage)
}

/** One page of threads, newest first. */
export const listThreadIds = async (
  account: GmailAccount,
  query: string,
  max: number
) => {
  // A search with no match comes back as an empty 204, not `{}`.
  const page = await gmail<{ threads?: { id: string }[] } | undefined>(
    account,
    `/threads?${new URLSearchParams({
      fields: 'threads/id',
      maxResults: String(max),
      q: query,
    })}`
  )
  return (page?.threads ?? []).map(({ id }) => id)
}

export const modifyMessage = (
  account: GmailAccount,
  id: string,
  change: { add?: string[]; remove?: string[] }
) =>
  gmail(account, `/messages/${id}/modify`, {
    body: JSON.stringify({
      addLabelIds: change.add ?? [],
      removeLabelIds: change.remove ?? [],
    }),
    method: 'POST',
  })

const encodeHeader = (value: string) =>
  // oxlint-disable-next-line no-control-regex -- RFC 2047 only for non-ASCII headers
  /^[\u0000-\u007F]*$/u.test(value)
    ? value
    : `=?UTF-8?B?${Buffer.from(value).toString('base64')}?=`

const BOUNDARY = 'fewmail-alternative'

const encodeAddressList = (addresses: string[]) => addresses.join(', ')

interface MailContent {
  bcc: string[]
  cc: string[]
  html: string
  inReplyTo: string | null
  references: string | null
  subject: string
  text: string
  threadId: string | null
  to: string[]
}

const rawMessage = (mail: MailContent) => ({
  raw: Buffer.from(
    [
      ...(mail.to.length > 0 ? [`To: ${encodeAddressList(mail.to)}`] : []),
      ...(mail.cc.length > 0 ? [`Cc: ${encodeAddressList(mail.cc)}`] : []),
      ...(mail.bcc.length > 0 ? [`Bcc: ${encodeAddressList(mail.bcc)}`] : []),
      `Subject: ${encodeHeader(mail.subject)}`,
      ...(mail.inReplyTo ? [`In-Reply-To: ${mail.inReplyTo}`] : []),
      ...(mail.references ? [`References: ${mail.references}`] : []),
      'MIME-Version: 1.0',
      `Content-Type: multipart/alternative; boundary="${BOUNDARY}"`,
      '',
      `--${BOUNDARY}`,
      'Content-Type: text/plain; charset="UTF-8"',
      'Content-Transfer-Encoding: base64',
      '',
      Buffer.from(mail.text).toString('base64'),
      `--${BOUNDARY}`,
      'Content-Type: text/html; charset="UTF-8"',
      'Content-Transfer-Encoding: base64',
      '',
      Buffer.from(mail.html).toString('base64'),
      `--${BOUNDARY}--`,
    ].join('\r\n')
  ).toString('base64url'),
  ...(mail.threadId && { threadId: mail.threadId }),
})

export const sendMail = (account: GmailAccount, mail: MailContent) =>
  gmail<{ id: string; threadId: string }>(account, '/messages/send', {
    body: JSON.stringify(rawMessage(mail)),
    method: 'POST',
  })

export const saveDraft = (
  account: GmailAccount,
  mail: MailContent,
  draftId?: string
) =>
  gmail<{ id: string }>(account, draftId ? `/drafts/${draftId}` : '/drafts', {
    body: JSON.stringify({
      ...(draftId && { id: draftId }),
      message: rawMessage(mail),
    }),
    method: draftId ? 'PUT' : 'POST',
  })

export const listDrafts = async (
  account: GmailAccount,
  query: string,
  max: number
) => {
  const { drafts = [] } = await gmail<{ drafts?: { id: string }[] }>(
    account,
    `/drafts?${new URLSearchParams({ maxResults: String(max), q: query })}`
  )
  return Promise.all(
    drafts.map(async ({ id }) => {
      const { message } = await gmail<{ message: GmailMessage }>(
        account,
        `/drafts/${id}?format=full`
      )
      const parsed = parseMessage(message)
      return {
        ...parsed,
        bcc: splitAddresses(
          message.payload.headers?.find(
            ({ name }) => name.toLowerCase() === 'bcc'
          )?.value
        ),
        html: parsed.html || textToHtml(parsed.body),
        id,
      }
    })
  )
}

export const deleteDraft = (account: GmailAccount, draftId: string) =>
  gmail(account, `/drafts/${draftId}`, { method: 'DELETE' })

export const modifyThread = (
  account: GmailAccount,
  threadId: string,
  change: { add?: string[]; remove?: string[] }
) =>
  gmail(account, `/threads/${threadId}/modify`, {
    body: JSON.stringify({
      addLabelIds: change.add ?? [],
      removeLabelIds: change.remove ?? [],
    }),
    method: 'POST',
  })

export const trashThread = (account: GmailAccount, threadId: string) =>
  gmail(account, `/threads/${threadId}/trash`, { method: 'POST' })

export const listLabels = async (account: GmailAccount) => {
  const { labels = [] } = await gmail<{
    labels?: { id: string; name: string; type: 'system' | 'user' }[]
  }>(account, '/labels')
  return labels
}

export const createLabel = (account: GmailAccount, name: string) =>
  gmail<{ id: string; name: string }>(account, '/labels', {
    body: JSON.stringify({
      labelListVisibility: 'labelShow',
      messageListVisibility: 'show',
      name,
    }),
    method: 'POST',
  })

const UNSUBSCRIBE_TIMEOUT_MS = 10_000

/** The sender writes the link and sync posts to it unattended, so it must never reach our own network; redirects are not followed for the same reason. */
export const isPublicHost = (hostname: string) => {
  const host = hostname.replaceAll(/^\[|\]$/gu, '').replace(/\.$/u, '')
  return (
    host.includes('.') &&
    isIP(host) === 0 &&
    !/\.(?:localhost|local|internal|home\.arpa)$/iu.test(host)
  )
}

/** RFC 8058 one-click only: a mailto or a plain link needs a person, so the caller falls back to archiving. */
export const unsubscribeOneClick = async (
  listUnsubscribe: string,
  listUnsubscribePost: string | null
) => {
  const url = listUnsubscribe.match(/<(?<url>https:[^>]+)>/u)?.groups?.url
  if (
    !url ||
    !URL.canParse(url) ||
    !isPublicHost(new URL(url).hostname) ||
    !/One-Click/iu.test(listUnsubscribePost ?? '')
  ) {
    return false
  }
  const response = await fetch(url, {
    body: 'List-Unsubscribe=One-Click',
    headers: { 'content-type': 'application/x-www-form-urlencoded' },
    method: 'POST',
    redirect: 'manual',
    signal: AbortSignal.timeout(UNSUBSCRIBE_TIMEOUT_MS),
  })
  return response.status >= 200 && response.status < 400
}
