import { decrypt, encrypt } from '@fewmail/shared/crypto-node'
import { signInChallenge } from '@fewmail/shared/sign-in-challenge'

import { env } from '../env'
import { auth } from '../lib/auth'
import { announceSignIn, watchSignIn } from '../lib/live'
import { NotFoundError } from './mail-errors'

const WAIT_MS = 5 * 60 * 1000

/** Better Auth's `verification` rows: the app's wait, then the browser's one-time token for it. */
const waiting = (challenge: string) => `desktop-sign-in-waiting:${challenge}`
const confirmed = (challenge: string) => `desktop-sign-in:${challenge}`

const find = async (identifier: string) => {
  const context = await auth.$context
  const row = await context.internalAdapter.findVerificationValue(identifier)
  return row && row.expiresAt > new Date() ? row : null
}

const expired = () =>
  new NotFoundError('This sign-in expired. Start it again in the app.')

/**
 * The app, signed out, waits for the browser; only a challenge an app waits on can ever be confirmed.
 *
 * @yields {{ isConfirmed: boolean }} Whether the browser confirmed: at once, then when it does.
 */
export const waitForSignIn = async function* waitForSignIn(
  challenge: string,
  signal?: AbortSignal
) {
  const events = watchSignIn(challenge, signal)
  if (!(await find(waiting(challenge)))) {
    const context = await auth.$context
    await context.internalAdapter.createVerificationValue({
      expiresAt: new Date(Date.now() + WAIT_MS),
      identifier: waiting(challenge),
      value: '',
    })
  }
  yield { isConfirmed: !!(await find(confirmed(challenge))) }
  for await (const _event of events) {
    yield { isConfirmed: true }
  }
}

/** The browser, signed in, confirms: a one-time token for its user waits for the app, encrypted. */
export const confirmSignIn = async (headers: Headers, challenge: string) => {
  if (!(await find(waiting(challenge)))) {
    throw expired()
  }
  const { token } = await auth.api.generateOneTimeToken({ headers })
  const context = await auth.$context
  await context.internalAdapter.createVerificationValue({
    expiresAt: new Date(Date.now() + WAIT_MS),
    identifier: confirmed(challenge),
    value: encrypt({ secret: env.ENCRYPTION_SECRET, text: token }),
  })
  await announceSignIn(challenge)
}

/** The app proves it started this sign-in and takes the token, once; the web turns it into its session. */
export const takeSignIn = async (challenge: string, verifier: string) => {
  if ((await signInChallenge.challengeOf(verifier)) !== challenge) {
    throw expired()
  }
  const context = await auth.$context
  const row = await context.internalAdapter.consumeVerificationValue(
    confirmed(challenge)
  )
  await context.internalAdapter.deleteVerificationByIdentifier(
    waiting(challenge)
  )
  if (!row || row.expiresAt <= new Date()) {
    throw expired()
  }
  return {
    token: decrypt({
      encryptedText: row.value,
      secret: env.ENCRYPTION_SECRET,
    }),
  }
}
