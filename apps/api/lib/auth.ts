import { Buffer } from 'node:buffer'

import { drizzleAdapter } from '@better-auth/drizzle-adapter/relations-v2'
import { oauthProvider } from '@better-auth/oauth-provider'
import { db } from '@fewmail/db'
import { accounts } from '@fewmail/db/schema'
import * as schema from '@fewmail/db/schema'
import { betterAuth } from 'better-auth'
import { jwt } from 'better-auth/plugins'
import { and, eq } from 'drizzle-orm'

import { env } from '../env'

export const GMAIL_SCOPE = 'https://www.googleapis.com/auth/gmail.modify'
export const CALENDAR_SCOPE = 'https://www.googleapis.com/auth/calendar.events'

export const MCP_RESOURCE = `${env.API_URL}/mcp`
export const AUTH_ISSUER = `${env.API_URL}/auth`

export const auth = betterAuth({
  account: {
    encryptOAuthTokens: true,
  },
  advanced: {
    database: { generateId: 'uuid' },
  },
  basePath: '/auth',
  baseURL: env.API_URL,
  // Session JWTs would share the signing key with MCP access tokens.
  disabledPaths: ['/token'],
  database: drizzleAdapter(db, {
    provider: 'pg',
    schema,
    usePlural: true,
  }) as ReturnType<typeof drizzleAdapter>,
  plugins: [
    jwt({
      disableSettingJwtHeader: true,
      schema: { jwks: { modelName: 'jwk' } },
    }),
    oauthProvider({
      allowDynamicClientRegistration: true,
      allowUnauthenticatedClientRegistration: true,
      clientRegistrationDefaultApplicationType: 'infer',
      clientRegistrationDefaultResources: [MCP_RESOURCE],
      consentPage: `${env.WEB_URL}/connect`,
      loginPage: `${env.WEB_URL}/login`,
      resources: [MCP_RESOURCE],
    }),
  ],
  secret: env.BETTER_AUTH_SECRET,
  socialProviders: {
    google: {
      // Without offline access and a forced consent Google returns no refresh token, and the agent loses the mailbox after an hour.
      accessType: 'offline',
      clientId: env.GOOGLE_CLIENT_ID,
      clientSecret: env.GOOGLE_CLIENT_SECRET,
      prompt: 'consent',
      scope: [GMAIL_SCOPE, CALENDAR_SCOPE],
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

export const MAILBOX_CALLBACK_PATH = '/mailboxes/callback'
const GOOGLE_TOKEN_URL = 'https://oauth2.googleapis.com/token'
const mailboxRedirectUri = () => `${env.API_URL}${MAILBOX_CALLBACK_PATH}`

/** An added mailbox is consented to outside Better Auth, so its grant can never sign anyone in. */
export const mailboxConsentUrl = (state: string) =>
  `https://accounts.google.com/o/oauth2/v2/auth?${new URLSearchParams({
    access_type: 'offline',
    client_id: env.GOOGLE_CLIENT_ID,
    prompt: 'consent select_account',
    redirect_uri: mailboxRedirectUri(),
    response_type: 'code',
    scope: ['openid', 'email', GMAIL_SCOPE, CALENDAR_SCOPE].join(' '),
    state,
  })}`

const googleToken = async (body: Record<string, string>) => {
  const response = await fetch(GOOGLE_TOKEN_URL, {
    body: new URLSearchParams({
      client_id: env.GOOGLE_CLIENT_ID,
      client_secret: env.GOOGLE_CLIENT_SECRET,
      ...body,
    }),
    method: 'POST',
  })
  if (!response.ok) {
    throw new Error(`Google token request failed: ${response.status}`)
  }
  return (await response.json()) as {
    access_token: string
    expires_in: number
    id_token?: string
    refresh_token?: string
    scope: string
  }
}

export const exchangeMailboxCode = async (code: string) => {
  const tokens = await googleToken({
    code,
    grant_type: 'authorization_code',
    redirect_uri: mailboxRedirectUri(),
  })
  // Straight from Google's token endpoint over TLS, so the id token needs no signature check (OpenID Connect 3.1.3.7).
  const claims = JSON.parse(
    Buffer.from(tokens.id_token?.split('.')[1] ?? '', 'base64url').toString()
  ) as { email: string; sub: string }
  return {
    email: claims.email,
    googleAccountId: claims.sub,
    hasGmail: tokens.scope.split(' ').includes(GMAIL_SCOPE),
    refreshToken: tokens.refresh_token ?? null,
  }
}

const addedAccessTokens = new Map<
  string,
  { expiresAt: number; token: string }
>()

const addedAccessToken = async (refreshToken: string) => {
  const cached = addedAccessTokens.get(refreshToken)
  if (cached && cached.expiresAt > Date.now()) {
    return cached.token
  }
  const tokens = await googleToken({
    grant_type: 'refresh_token',
    refresh_token: refreshToken,
  })
  addedAccessTokens.set(refreshToken, {
    expiresAt: Date.now() + (tokens.expires_in - 60) * 1000,
    token: tokens.access_token,
  })
  return tokens.access_token
}

/** No refresh token means the sign-in mailbox, read through the user's Better Auth account. */
export interface GmailAccount {
  refreshToken: string | null
  userId: string
}

export const gmailAccessToken = (account: GmailAccount) =>
  account.refreshToken
    ? addedAccessToken(account.refreshToken)
    : googleAccessToken(account.userId)
