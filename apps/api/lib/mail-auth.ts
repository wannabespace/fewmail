import type { MailAuth } from '@fewmail/shared/agent'

import { keyedHash } from './keyed-hash'

interface Header {
  name: string
  value: string
}

const RESULT = (method: string) =>
  new RegExp(`\\b${method}=(?<result>[a-z]+)`, 'iu')

/** Gmail's own verdict; a sender can write any Authentication-Results it likes, so only mx.google.com counts. */
const authOf = (headers: Header[]): MailAuth | null => {
  const google = headers.find(
    ({ name, value }) =>
      name.toLowerCase() === 'authentication-results' &&
      value.trimStart().startsWith('mx.google.com')
  )
  if (!google) {
    return null
  }
  const read = (method: string) =>
    google.value.match(RESULT(method))?.groups?.result?.toLowerCase() ?? 'none'
  return { dkim: read('dkim'), dmarc: read('dmarc'), spf: read('spf') }
}

const IPV4 = /\[(?<ip>\d{1,3}(?:\.\d{1,3}){3})\]/u
const IPV6 = /\[(?:IPv6:)?(?<ip>[0-9a-f]*:[0-9a-f:]+)\]/iu

/** The hop that handed the mail to Google: the only Received line a sender cannot forge. */
const sendingBlock = (headers: Header[]) => {
  const hop = headers.find(
    ({ name, value }) =>
      name.toLowerCase() === 'received' && /\bby mx\.google\.com\b/u.test(value)
  )
  const v4 = hop?.value.match(IPV4)?.groups?.ip
  if (v4) {
    return v4.split('.').slice(0, 3).join('.')
  }
  const v6 = hop?.value.match(IPV6)?.groups?.ip
  return v6 ? v6.split(':').slice(0, 3).join(':') : null
}

/** A /24 (or /48) network: spammers rotate domains far faster than servers. */
export const mailSignals = (headers: Header[]) => {
  const block = sendingBlock(headers)
  return {
    auth: authOf(headers),
    infraHash: block ? keyedHash(`infra:${block}`) : null,
  }
}
