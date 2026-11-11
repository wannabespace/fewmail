import { Buffer } from 'node:buffer'

import { db } from '@fewmail/db'
import { mailboxes } from '@fewmail/db/schema'
import { addDays } from 'date-fns'
import { eq, isNull, lt, or } from 'drizzle-orm'
import { createRemoteJWKSet, jwtVerify } from 'jose'

import { env } from '../env'
import { watchInbox } from '../lib/gmail'
import { keyedHash } from '../lib/keyed-hash'
import { syncMailbox } from './sync'

type Mailbox = typeof mailboxes.$inferSelect

const addressHashOf = (email: string) =>
  keyedHash(`mailbox:${email.trim().toLowerCase()}`)

/** Gmail asks for a renewal at least every 7 days; renewing a day early keeps pushes from lapsing. */
export const mailboxesToWatch = () =>
  env.GMAIL_PUSH_TOPIC
    ? db
        .select()
        .from(mailboxes)
        .where(
          or(
            isNull(mailboxes.watchExpiresAt),
            lt(mailboxes.watchExpiresAt, addDays(new Date(), 1))
          )
        )
    : Promise.resolve([])

export const watchMailbox = async (mailbox: Mailbox) => {
  if (!env.GMAIL_PUSH_TOPIC) {
    return
  }
  const { expiration } = await watchInbox(mailbox, env.GMAIL_PUSH_TOPIC)
  await db
    .update(mailboxes)
    .set({
      addressHash: addressHashOf(mailbox.email),
      watchExpiresAt: new Date(Number(expiration)),
    })
    .where(eq(mailboxes.id, mailbox.id))
}

const GOOGLE_KEYS = createRemoteJWKSet(
  new URL('https://www.googleapis.com/oauth2/v3/certs')
)

/** Pub/Sub signs each push as the subscription's service account; anything else could make us sync on demand. */
const isFromPubSub = async (request: Request) => {
  const token = request.headers.get('authorization')?.replace(/^Bearer /u, '')
  if (!token || !env.GMAIL_PUSH_SERVICE_ACCOUNT) {
    return false
  }
  try {
    const { payload } = await jwtVerify(token, GOOGLE_KEYS, {
      audience: `${env.API_URL}/gmail/push`,
      issuer: ['https://accounts.google.com', 'accounts.google.com'],
    })
    return (
      payload.email === env.GMAIL_PUSH_SERVICE_ACCOUNT &&
      payload.email_verified === true
    )
  } catch {
    return false
  }
}

const pushedAddress = (body: unknown) => {
  try {
    const data = (body as { message?: { data?: string } }).message?.data
    return (
      JSON.parse(Buffer.from(data ?? '', 'base64').toString('utf-8')) as {
        emailAddress?: string
      }
    ).emailAddress
  } catch {
    return null
  }
}

/** Answers before syncing: Pub/Sub redelivers anything not acknowledged within its deadline. */
export const handleGmailPush = async (request: Request) => {
  if (!(await isFromPubSub(request))) {
    return new Response(null, { status: 403 })
  }
  const address = pushedAddress(await request.json().catch(() => null))
  if (address) {
    const pushed = await db
      .select()
      .from(mailboxes)
      .where(eq(mailboxes.addressHash, addressHashOf(address)))
    for (const mailbox of pushed) {
      void syncMailbox(mailbox).catch(console.error)
    }
  }
  return new Response(null, { status: 204 })
}
