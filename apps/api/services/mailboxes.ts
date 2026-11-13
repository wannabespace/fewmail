import { randomBytes } from 'node:crypto'

import { db } from '@fewmail/db'
import type { messages } from '@fewmail/db/schema'
import { accounts, mailboxes, verifications } from '@fewmail/db/schema'
import { noul } from '@typesafe-ai/sdk'
import { addMinutes, isAfter, max } from 'date-fns'
import { and, asc, eq, gt, isNotNull } from 'drizzle-orm'

import { exchangeMailboxCode, mailboxConsentUrl } from '../lib/auth'
import { listMessageIds } from '../lib/gmail'
import { jev } from '../lib/jev'
import { announceChange } from '../lib/live'
import { NotFoundError } from './mail-errors'

const CONSENT_PREFIX = 'mailbox-consent:'
const CONSENT_MINUTES = 10

export type AddMailboxResult = 'added' | 'failed' | 'sign_in'

/** A revoked or narrowed grant, which only the user can fix; any other sync error is retried on its own. */
const LOST_ACCESS =
  /failed: 40[01]\b|invalid_grant|insufficient|access token|No Google account/iu

export const listMailboxes = (userId: string) =>
  db
    .select({
      email: mailboxes.email,
      googleAccountId: mailboxes.googleAccountId,
      historyId: mailboxes.historyId,
      id: mailboxes.id,
      lastSyncedAt: mailboxes.lastSyncedAt,
      sendBlockedUntil: mailboxes.sendBlockedUntil,
      storageFullAt: mailboxes.storageFullAt,
      syncError: mailboxes.syncError,
    })
    .from(mailboxes)
    .where(eq(mailboxes.userId, userId))
    .orderBy(asc(mailboxes.createdAt))
    .then((rows) =>
      rows.map(({ googleAccountId, historyId, ...mailbox }) => ({
        ...mailbox,
        hasLostAccess: LOST_ACCESS.test(mailbox.syncError ?? ''),
        hasSynced: historyId !== null,
        signIn: googleAccountId === null,
      }))
    )

type Mailbox = typeof mailboxes.$inferSelect
type Message = typeof messages.$inferSelect

/** Only Google itself can say the account is full; its other senders (Docs, Drive shares) never do. */
const isGoogleAccountMail = ({ auth, fromDomain }: Message) =>
  /^(?:accounts\.)?google\.com$/u.test(fromDomain) && auth?.dmarc === 'pass'

/** Google's notices are written in the user's language, so Jev reads them instead of a subject match; Jev runs on every plan. */
const saysStorageFull = async (message: Message) => {
  if (!jev) {
    return false
  }
  const { answers } = await jev.systemOne({
    questions: {
      isFull: noul(
        'Google says the account storage is already full, so Gmail can no longer receive or send mail; storage that is almost full or running low, or an offer for more storage, is not'
      ),
    },
    state: `Subject: ${message.subject}\n\n${message.body.slice(0, 3000)}`,
  })
  return answers.isFull.noul >= 0.5
}

/**
 * While storage is full Gmail bounces mail from everyone but Google, so any other email that arrives after Google's
 * notice means there is room again.
 */
export const watchStorage = async (mailbox: Mailbox, inserted: Message[]) => {
  const inbound = inserted.filter(({ isFromMe }) => !isFromMe)
  const notices = await Promise.all(
    inbound
      .filter(isGoogleAccountMail)
      .map(async (message) =>
        (await saysStorageFull(message)) ? message.receivedAt : null
      )
  )
  const fullSince = [mailbox.storageFullAt, ...notices].filter(
    (date) => date !== null
  )
  const latest = fullSince.length > 0 ? max(fullSince) : null
  const storageFullAt =
    latest &&
    !inbound.some(
      (message) =>
        !/(?:^|\.)google\.com$/u.test(message.fromDomain) &&
        isAfter(message.receivedAt, latest)
    )
      ? latest
      : null
  if (storageFullAt?.getTime() === mailbox.storageFullAt?.getTime()) {
    return
  }
  await db
    .update(mailboxes)
    .set({ storageFullAt })
    .where(eq(mailboxes.id, mailbox.id))
  await announceChange(mailbox.userId, ['mailboxes'])
}

export const ownMailbox = async (userId: string, id: string) => {
  const [mailbox] = await db
    .select()
    .from(mailboxes)
    .where(and(eq(mailboxes.id, id), eq(mailboxes.userId, userId)))
  if (!mailbox) {
    throw new NotFoundError('Mailbox not found')
  }
  return mailbox
}

export const startAddingMailbox = async (userId: string) => {
  const state = randomBytes(24).toString('base64url')
  await db.insert(verifications).values({
    expiresAt: addMinutes(new Date(), CONSENT_MINUTES),
    identifier: `${CONSENT_PREFIX}${state}`,
    value: userId,
  })
  return { url: mailboxConsentUrl(state) }
}

/**
 * `signedInUserId` must be the browser's own session: otherwise anyone could send their consent link to someone else
 * and receive that person's mailbox.
 */
export const finishAddingMailbox = async (
  signedInUserId: string | null,
  params: URLSearchParams
): Promise<{ mailboxId?: string; result: AddMailboxResult }> => {
  const state = params.get('state')
  const code = params.get('code')
  if (!state || !signedInUserId) {
    return { result: 'failed' }
  }
  const [consent] = await db
    .delete(verifications)
    .where(
      and(
        eq(verifications.identifier, `${CONSENT_PREFIX}${state}`),
        eq(verifications.value, signedInUserId),
        gt(verifications.expiresAt, new Date())
      )
    )
    .returning()
  if (!consent || !code) {
    return { result: 'failed' }
  }

  const grant = await exchangeMailboxCode(code)
  const [signIn] = await db
    .select({ id: accounts.id })
    .from(accounts)
    .where(
      and(
        eq(accounts.userId, signedInUserId),
        eq(accounts.providerId, 'google'),
        eq(accounts.accountId, grant.googleAccountId)
      )
    )
  if (signIn) {
    return { result: 'sign_in' }
  }
  if (!grant.refreshToken || !grant.hasScopes) {
    return { result: 'failed' }
  }

  const [mailbox] = await db
    .insert(mailboxes)
    .values({
      email: grant.email,
      googleAccountId: grant.googleAccountId,
      refreshToken: grant.refreshToken,
      userId: signedInUserId,
    })
    .onConflictDoUpdate({
      set: { refreshToken: grant.refreshToken, syncError: null },
      target: [mailboxes.userId, mailboxes.googleAccountId],
    })
    .returning({ id: mailboxes.id })
  return { mailboxId: mailbox?.id, result: 'added' }
}

/**
 * The Google grant is not revoked: it is shared by every Fewmail account that holds this Google account, so revoking
 * would also disconnect its owner's own Fewmail.
 */
export const removeMailbox = async (userId: string, id: string) => {
  const [removed] = await db
    .delete(mailboxes)
    .where(
      and(
        eq(mailboxes.id, id),
        eq(mailboxes.userId, userId),
        isNotNull(mailboxes.googleAccountId)
      )
    )
    .returning({ id: mailboxes.id })
  if (!removed) {
    throw new NotFoundError('Mailbox not found')
  }
}

/** Gmail's own search per mailbox, since subjects and bodies are encrypted in our DB. */
export const searchMailboxes = async (
  userId: string,
  query: string,
  limit: number,
  mailboxId?: string
) => {
  const owned = await db
    .select()
    .from(mailboxes)
    .where(
      and(
        eq(mailboxes.userId, userId),
        mailboxId ? eq(mailboxes.id, mailboxId) : undefined
      )
    )
  return Promise.all(
    owned.map(async (mailbox) => ({
      ids: await listMessageIds(mailbox, query, limit),
      mailbox,
    }))
  )
}
