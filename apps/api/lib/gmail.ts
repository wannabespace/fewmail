import { Buffer } from 'node:buffer'
import { lookup } from 'node:dns/promises'
import { BlockList, isIP } from 'node:net'

import { titledListId } from '@fewmail/shared/agent'
import { textToHtml } from '@fewmail/shared/email'
import type { MailAttachment, OutgoingAttachment } from '@fewmail/shared/email'

import type { GmailAccount } from './auth'
import { gmailAccessToken } from './auth'
import { domainOf } from './keyed-hash'
import { mailSignals } from './mail-auth'
import { oneTimeCode } from './one-time-code'

const GMAIL_API = 'https://gmail.googleapis.com/gmail/v1/users/me'
// A JSON body carries a few MB at most; mail with files goes up as a media upload.
const GMAIL_UPLOAD = 'https://gmail.googleapis.com/upload/gmail/v1/users/me'

/** A 404 from `/history` means the history id expired. */
export class GmailError extends Error {
  override name = 'GmailError'
  readonly status: number
  /** Set when Gmail refuses for longer than a retry can wait: the daily sending limit lifts only at this time. */
  readonly blockedUntil: Date | null

  constructor(status: number, message: string, blockedUntil: Date | null) {
    super(message)
    this.status = status
    this.blockedUntil = blockedUntil
  }
}

/** Also an expired history id, when it comes from `listHistory`. */
export const isMissing = (error: unknown) =>
  error instanceof GmailError && error.status === 404

const RATE_LIMIT_RETRIES = 6

/** The per-user quota answers 429 or a 403 `rateLimitExceeded`/`userRateLimitExceeded`; it refills within a minute. */
const isRateLimited = (status: number, body: string) =>
  status === 429 || (status === 403 && /ratelimitexceeded/iu.test(body))

/** A spent daily sending limit answers the same rate-limit error, with a "Retry after" hours away. */
const blockedUntilOf = (body: string) => {
  const at = body.match(/Retry after (?<at>\S+Z)/u)?.groups?.at
  const until = at ? new Date(at) : null
  return until && until.getTime() - Date.now() > 60_000 ? until : null
}

const gmail = async <T>(
  account: GmailAccount,
  path: string,
  init?: RequestInit & { contentType?: string; isUpload?: boolean },
  attempt = 0
): Promise<T> => {
  const { contentType = 'application/json', isUpload, ...request } = init ?? {}
  const response = await fetch(
    `${isUpload ? GMAIL_UPLOAD : GMAIL_API}${path}`,
    {
      ...request,
      headers: {
        authorization: `Bearer ${await gmailAccessToken(account)}`,
        'content-type': contentType,
      },
    }
  )

  if (!response.ok) {
    const body = await response.text()
    const blockedUntil = blockedUntilOf(body)
    if (
      isRateLimited(response.status, body) &&
      !blockedUntil &&
      attempt < RATE_LIMIT_RETRIES
    ) {
      await Bun.sleep(1000 * 2 ** attempt + Math.random() * 1000)
      return gmail<T>(account, path, init, attempt + 1)
    }
    throw new GmailError(
      response.status,
      `Gmail ${path} failed: ${response.status} ${body}`,
      blockedUntil
    )
  }

  return (response.status === 204 ? undefined : await response.json()) as T
}

interface GmailPart {
  body?: { data?: string; attachmentId?: string; size?: number }
  filename?: string
  headers?: { name: string; value: string }[]
  mimeType: string
  partId?: string
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

const headerOf = (part: GmailPart, header: string) =>
  part.headers?.find(({ name }) => name.toLowerCase() === header)?.value.trim()

const contentIdOf = (part: GmailPart) =>
  headerOf(part, 'content-id')?.replace(/^<(?<id>.*)>$/u, '$<id>') ?? null

/** How a draft's file is found again on the next save: our own id, Gmail's for files attached there, else its part. */
const draftFileIdOf = (part: GmailPart) =>
  headerOf(part, 'x-attachment-id') ?? part.partId ?? ''

/** Named files and the images an HTML body draws by `cid:`, which often come without a name. */
const fileParts = (part: GmailPart): GmailPart[] => [
  ...(!part.parts &&
  (part.filename || contentIdOf(part)) &&
  (part.body?.attachmentId || part.body?.data)
    ? [part]
    : []),
  ...(part.parts ?? []).flatMap(fileParts),
]

const attachmentsOf = (payload: GmailPart): MailAttachment[] =>
  fileParts(payload).map((part) => ({
    contentId: contentIdOf(part),
    filename: part.filename || 'image',
    mimeType: part.mimeType,
    partId: part.partId ?? '',
    size: part.body?.size ?? 0,
  }))

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
    attachments: attachmentsOf(message.payload),
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
    listId: titledListId(headers.get('list-id')),
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

/** One page of emails, newest first by their own date (a thread's emails each count, unlike `threads.list`). */
export const listMessagePage = async (
  account: GmailAccount,
  query: string,
  max: number,
  pageToken?: string
) => {
  // A search with no match comes back as an empty 204, not `{}`.
  const page = await gmail<
    | {
        messages?: { id: string; threadId: string }[]
        nextPageToken?: string
      }
    | undefined
  >(
    account,
    `/messages?${new URLSearchParams({
      fields: 'messages(id,threadId),nextPageToken',
      maxResults: String(Math.min(LIST_PAGE_MAX, max)),
      q: query,
      ...(pageToken && { pageToken }),
    })}`
  )
  return { messages: page?.messages ?? [], nextPageToken: page?.nextPageToken }
}

/** Newest first; pages past Gmail's 500 a request until `max`. */
export const listMessageIds = async (
  account: GmailAccount,
  query: string,
  max: number
) => {
  const ids: string[] = []
  let pageToken: string | undefined
  do {
    // oxlint-disable-next-line eslint/no-await-in-loop -- pages chain via nextPageToken
    const page = await listMessagePage(
      account,
      query,
      max - ids.length,
      pageToken
    )
    ids.push(...page.messages.map(({ id }) => id))
    pageToken = page.nextPageToken
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
      ['metadataHeaders', 'List-Id'],
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
    listId: titledListId(headers.get('list-id')),
    isUnread: (message.labelIds ?? []).includes('UNREAD'),
  }
}

const messageParts = async (account: GmailAccount, id: string) => {
  const message = await gmail<Pick<GmailMessage, 'payload'>>(
    account,
    `/messages/${id}?${new URLSearchParams({ fields: 'payload', format: 'full' })}`
  )
  return fileParts(message.payload)
}

export const listAttachments = async (account: GmailAccount, id: string) => {
  const parts = await messageParts(account, id)
  return parts
    .filter((part) => part.filename && part.body?.attachmentId)
    .map((part) => ({
      attachmentId: part.body?.attachmentId ?? '',
      filename: part.filename ?? '',
      mimeType: part.mimeType,
      size: part.body?.size ?? 0,
    }))
}

const partBytes = async (
  account: GmailAccount,
  id: string,
  part: GmailPart
) => {
  const attachmentId = part.body?.attachmentId
  if (!attachmentId) {
    return Buffer.from(part.body?.data ?? '', 'base64url')
  }
  const { data } = await gmail<{ data: string }>(
    account,
    `/messages/${id}/attachments/${attachmentId}`
  )
  return Buffer.from(data, 'base64url')
}

/** Standard base64, the encoding data URLs expect. */
export const getAttachment = async (
  account: GmailAccount,
  id: string,
  attachmentId: string
) => {
  const bytes = await partBytes(account, id, {
    body: { attachmentId },
    mimeType: '',
  })
  return bytes.toString('base64')
}

/** Part ids are fixed for a message, unlike Gmail's attachment ids, which change on every read. */
export const getAttachmentPart = async (
  account: GmailAccount,
  id: string,
  partId: string
) => {
  const parts = await messageParts(account, id)
  const part = parts.find((candidate) => candidate.partId === partId)
  return part
    ? {
        bytes: await partBytes(account, id, part),
        filename: part.filename || 'image',
        mimeType: part.mimeType,
      }
    : null
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
  ['metadataHeaders', 'To'],
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

// A line break in any header value would end it and let the rest pass for headers of its own (a `Bcc:` from a subject).
const oneLine = (value: string) => value.replaceAll(/[\r\n]+/gu, ' ')

const encodeHeader = (value: string) =>
  // oxlint-disable-next-line no-control-regex -- RFC 2047 only for non-ASCII headers
  /^[\u0000-\u007F]*$/u.test(value)
    ? oneLine(value)
    : `=?UTF-8?B?${Buffer.from(value).toString('base64')}?=`

const BOUNDARY = 'fewmail-alternative'
const MIXED_BOUNDARY = 'fewmail-mixed'
const UPLOAD_BOUNDARY = 'fewmail-upload'

const encodeAddressList = (addresses: string[]) => oneLine(addresses.join(', '))

interface MailContent {
  attachments?: Required<OutgoingAttachment>[] | null
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

const BASE64_LINE = /.{1,76}/gu

// A quote or a line break in a name would end the header and let the rest pass for headers of its own.
const fileName = (name: string) =>
  encodeHeader(name.replaceAll(/["\\\r\n]/gu, '_'))

const filePart = (file: Required<OutgoingAttachment>) => [
  `--${MIXED_BOUNDARY}`,
  `Content-Type: ${file.mimeType}; name="${fileName(file.filename)}"`,
  `Content-Disposition: attachment; filename="${fileName(file.filename)}"`,
  'Content-Transfer-Encoding: base64',
  `X-Attachment-Id: ${file.id}`,
  '',
  file.data.match(BASE64_LINE)?.join('\r\n') ?? '',
]

const mimeOf = (mail: MailContent) => {
  const alternative = [
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
  ]
  const files = mail.attachments ?? []
  return [
    ...(mail.to.length > 0 ? [`To: ${encodeAddressList(mail.to)}`] : []),
    ...(mail.cc.length > 0 ? [`Cc: ${encodeAddressList(mail.cc)}`] : []),
    ...(mail.bcc.length > 0 ? [`Bcc: ${encodeAddressList(mail.bcc)}`] : []),
    `Subject: ${encodeHeader(mail.subject)}`,
    ...(mail.inReplyTo ? [`In-Reply-To: ${oneLine(mail.inReplyTo)}`] : []),
    ...(mail.references ? [`References: ${oneLine(mail.references)}`] : []),
    'MIME-Version: 1.0',
    ...(files.length === 0
      ? alternative
      : [
          `Content-Type: multipart/mixed; boundary="${MIXED_BOUNDARY}"`,
          '',
          `--${MIXED_BOUNDARY}`,
          ...alternative,
          ...files.flatMap(filePart),
          `--${MIXED_BOUNDARY}--`,
        ]),
  ].join('\r\n')
}

/** Plain mail is one JSON call; mail with files goes up as `message/rfc822`, which a JSON body is too small for. */
const postMail = <T>(
  account: GmailAccount,
  path: string,
  mail: MailContent,
  { draftId, method }: { draftId?: string; method: 'POST' | 'PUT' }
) => {
  const mime = mimeOf(mail)
  const metadata = (raw?: string) => {
    const message = {
      ...(raw && { raw }),
      ...(mail.threadId && { threadId: mail.threadId }),
    }
    return path.startsWith('/drafts')
      ? { ...(draftId && { id: draftId }), message }
      : message
  }
  if (!mail.attachments?.length) {
    return gmail<T>(account, path, {
      body: JSON.stringify(metadata(Buffer.from(mime).toString('base64url'))),
      method,
    })
  }
  return gmail<T>(account, `${path}?uploadType=multipart`, {
    body: [
      `--${UPLOAD_BOUNDARY}`,
      'Content-Type: application/json; charset=UTF-8',
      '',
      JSON.stringify(metadata()),
      `--${UPLOAD_BOUNDARY}`,
      'Content-Type: message/rfc822',
      '',
      mime,
      `--${UPLOAD_BOUNDARY}--`,
    ].join('\r\n'),
    contentType: `multipart/related; boundary=${UPLOAD_BOUNDARY}`,
    isUpload: true,
    method,
  })
}

export const sendMail = (account: GmailAccount, mail: MailContent) =>
  postMail<{ id: string; threadId: string }>(account, '/messages/send', mail, {
    method: 'POST',
  })

export const saveDraft = (
  account: GmailAccount,
  mail: MailContent,
  draftId?: string
) =>
  postMail<{ id: string }>(
    account,
    draftId ? `/drafts/${draftId}` : '/drafts',
    mail,
    { draftId, method: draftId ? 'PUT' : 'POST' }
  )

/** A saved draft's files by the id each was attached under, read only when asked for. */
export const getDraftFiles = async (account: GmailAccount, draftId: string) => {
  const { message } = await gmail<{ message: GmailMessage }>(
    account,
    `/drafts/${draftId}?format=full`
  )
  return fileParts(message.payload).map((part) => ({
    id: draftFileIdOf(part),
    read: async () => {
      const bytes = await partBytes(account, message.id, part)
      return bytes.toString('base64')
    },
  }))
}

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
        files: fileParts(message.payload).map((part) => ({
          filename: part.filename || 'image',
          id: draftFileIdOf(part),
          mimeType: part.mimeType,
          size: part.body?.size ?? 0,
        })),
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

/** Gmail's own counts, whatever Fewmail holds. */
export const getLabelCounts = (account: GmailAccount, id: string) =>
  gmail<{ threadsTotal: number }>(
    account,
    `/labels/${id}?${new URLSearchParams({ fields: 'threadsTotal' })}`
  )

export const deleteLabel = (account: GmailAccount, id: string) =>
  gmail(account, `/labels/${id}`, { method: 'DELETE' })

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

const PRIVATE = new BlockList()
for (const [network, prefix] of [
  ['0.0.0.0', 8],
  ['10.0.0.0', 8],
  ['100.64.0.0', 10],
  ['127.0.0.0', 8],
  ['169.254.0.0', 16],
  ['172.16.0.0', 12],
  ['192.0.0.0', 24],
  ['192.168.0.0', 16],
  ['198.18.0.0', 15],
  ['224.0.0.0', 3],
] as const) {
  PRIVATE.addSubnet(network, prefix, 'ipv4')
}
for (const [network, prefix] of [
  ['::', 127],
  ['64:ff9b::', 96],
  ['fc00::', 7],
  ['fe80::', 10],
  ['ff00::', 8],
] as const) {
  PRIVATE.addSubnet(network, prefix, 'ipv6')
}

/**
 * The sender writes the link and sync posts to it unattended, so it must never reach our own network; redirects are not followed for the same reason.
 * A public name can point anywhere (`127.0.0.1.nip.io`, Railway's private `fd12::/16`), so every address it resolves to is checked.
 */
export const isPublicHost = async (hostname: string) => {
  const host = hostname.replaceAll(/^\[|\]$/gu, '').replace(/\.$/u, '')
  if (
    !host.includes('.') ||
    isIP(host) !== 0 ||
    /\.(?:localhost|local|internal|home\.arpa)$/iu.test(host)
  ) {
    return false
  }
  const addresses = await lookup(host, { all: true }).catch(() => [])
  return (
    addresses.length > 0 &&
    addresses.every(
      ({ address, family }) =>
        !PRIVATE.check(address, family === 6 ? 'ipv6' : 'ipv4')
    )
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
    !/One-Click/iu.test(listUnsubscribePost ?? '') ||
    !(await isPublicHost(new URL(url).hostname))
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
