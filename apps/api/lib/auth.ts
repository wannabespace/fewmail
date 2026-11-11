import { drizzleAdapter } from '@better-auth/drizzle-adapter/relations-v2'
import { db } from '@fewmail/db'
import { accounts } from '@fewmail/db/schema'
import * as schema from '@fewmail/db/schema'
import { betterAuth } from 'better-auth'
import { and, eq } from 'drizzle-orm'

import { env } from '../env'

export const GMAIL_SCOPE = 'https://www.googleapis.com/auth/gmail.modify'

export const auth = betterAuth({
  account: {
    encryptOAuthTokens: true,
  },
  advanced: {
    database: { generateId: 'uuid' },
  },
  basePath: '/auth',
  baseURL: env.API_URL,
  database: drizzleAdapter(db, {
    provider: 'pg',
    schema,
    usePlural: true,
  }) as ReturnType<typeof drizzleAdapter>,
  secret: env.BETTER_AUTH_SECRET,
  socialProviders: {
    google: {
      // Without offline access and a forced consent Google returns no refresh token, and the agent loses the mailbox after an hour.
      accessType: 'offline',
      clientId: env.GOOGLE_CLIENT_ID,
      clientSecret: env.GOOGLE_CLIENT_SECRET,
      prompt: 'consent',
      scope: [GMAIL_SCOPE],
    },
  },
  trustedOrigins: [env.WEB_URL],
  user: {
    deleteUser: {
      beforeDelete: async (user) => {
        // Google drops the whole grant, refresh token included, when any of its tokens is revoked.
        // oxlint-disable-next-line eslint/no-use-before-define -- runs per request, long after auth is built; the helper needs auth itself
        const token = await googleAccessToken(user.id).catch(() => null)
        if (token) {
          await fetch('https://oauth2.googleapis.com/revoke', {
            body: new URLSearchParams({ token }),
            method: 'POST',
          }).catch(() => null)
        }
      },
      enabled: true,
    },
  },
})

export const googleAccessToken = async (userId: string) => {
  const [account] = await db
    .select({ id: accounts.id })
    .from(accounts)
    .where(and(eq(accounts.userId, userId), eq(accounts.providerId, 'google')))
  if (!account) {
    throw new Error('No Google account connected')
  }
  const { accessToken } = await auth.api.getAccessToken({
    body: { accountId: account.id, userId },
  })
  return accessToken
}
