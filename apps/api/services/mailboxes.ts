import { randomBytes } from 'node:crypto'

import { db } from '@fewmail/db'
import { accounts, mailboxes, verifications } from '@fewmail/db/schema'
import { addMinutes } from 'date-fns'
import { and, asc, eq, gt, isNotNull } from 'drizzle-orm'

import { exchangeMailboxCode, mailboxConsentUrl } from '../lib/auth'
import { listMessageIds } from '../lib/gmail'
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
