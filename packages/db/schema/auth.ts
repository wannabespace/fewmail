import * as d from 'drizzle-orm/pg-core'

import { baseTable } from '../base-table'
import { encryptedText, searchableText } from '../utils'

export const users = d.snakeCase.table('users', {
  ...baseTable,
  email: searchableText().notNull().unique(),
  emailVerified: d.boolean().default(false).notNull(),
  image: encryptedText(),
  name: encryptedText().notNull(),
  stripeCustomerId: d.text(),
})

export const sessions = d.snakeCase.table(
  'sessions',
  {
    ...baseTable,
    expiresAt: d.timestamp({ withTimezone: true }).notNull(),
    ipAddress: encryptedText(),
    token: d.text().notNull().unique(),
    userAgent: encryptedText(),
    userId: d
      .uuid()
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
  },
  (table) => [d.index('sessions_userId_idx').on(table.userId)]
)

export const accounts = d.snakeCase.table(
  'accounts',
  {
    ...baseTable,
    accessToken: d.text(),
    accessTokenExpiresAt: d.timestamp({ withTimezone: true }),
    accountId: searchableText().notNull(),
    idToken: encryptedText(),
    password: d.text(),
    providerId: d.text().notNull(),
    refreshToken: d.text(),
    refreshTokenExpiresAt: d.timestamp({ withTimezone: true }),
    scope: d.text(),
    userId: d
      .uuid()
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
  },
  (table) => [d.index('accounts_userId_idx').on(table.userId)]
)

export const verifications = d.snakeCase.table(
  'verifications',
  {
    ...baseTable,
    expiresAt: d.timestamp({ withTimezone: true }).notNull(),
    identifier: d.text().notNull(),
    value: d.text().notNull(),
  },
  (table) => [d.index('verifications_identifier_idx').on(table.identifier)]
)

export const jwks = d.snakeCase.table('jwks', {
  alg: d.text(),
  createdAt: d.timestamp({ withTimezone: true }).defaultNow().notNull(),
  crv: d.text(),
  expiresAt: d.timestamp({ withTimezone: true }),
  id: baseTable.id,
  privateKey: d.text().notNull(),
  publicKey: d.text().notNull(),
})

/** Apps (Claude, Cursor…) that registered themselves to reach `/mcp`; their metadata comes from the app, not the user. */
export const oauthClients = d.snakeCase.table(
  'oauth_clients',
  {
    ...baseTable,
    applicationType: d.text(),
    backchannelLogoutSessionRequired: d.boolean(),
    backchannelLogoutUri: d.text(),
    clientCredentialsScopes: d.text().array().default([]),
    clientDiscoveryId: d.text(),
    clientId: d.text().notNull().unique(),
    clientSecret: d.text(),
    contacts: d.text().array(),
    disabled: d.boolean().default(false),
    dpopBoundAccessTokens: d.boolean().default(false),
    enableEndSession: d.boolean(),
    grantTypes: d.text().array(),
    icon: d.text(),
    jwks: d.text(),
    jwksUri: d.text(),
    metadata: d.jsonb(),
    name: d.text(),
    policy: d.text(),
    postLogoutRedirectUris: d.text().array(),
    redirectUris: d.text().array().notNull(),
    referenceId: d.text(),
    requirePKCE: d.boolean(),
    responseTypes: d.text().array(),
    scopes: d.text().array(),
    skipConsent: d.boolean(),
    softwareId: d.text(),
    softwareStatement: d.text(),
    softwareVersion: d.text(),
    subjectType: d.text(),
    tokenEndpointAuthMethod: d.text(),
    tos: d.text(),
    uri: d.text(),
    userId: d.uuid().references(() => users.id, { onDelete: 'cascade' }),
  },
  (table) => [d.index('oauth_clients_userId_idx').on(table.userId)]
)

export const oauthResources = d.snakeCase.table('oauth_resources', {
  ...baseTable,
  accessTokenTtl: d.integer(),
  allowedScopes: d.text().array(),
  customClaims: d.jsonb(),
  disabled: d.boolean().default(false),
  dpopBoundAccessTokensRequired: d.boolean().default(false),
  identifier: d.text().notNull().unique(),
  metadata: d.jsonb(),
  name: d.text().notNull(),
  policyVersion: d.integer().default(1),
  refreshTokenTtl: d.integer(),
  signingAlgorithm: d.text(),
  signingKeyId: d.text(),
})

export const oauthClientResources = d.snakeCase.table(
  'oauth_client_resources',
  {
    ...baseTable,
    clientId: d
      .text()
      .notNull()
      .references(() => oauthClients.clientId, { onDelete: 'cascade' }),
    metadata: d.jsonb(),
    resourceId: d
      .text()
      .notNull()
      .references(() => oauthResources.identifier, { onDelete: 'cascade' }),
  },
  (table) => [
    d
      .uniqueIndex('oauth_client_resources_pair_idx')
      .on(table.clientId, table.resourceId),
  ]
)

const grantColumns = {
  authorizationCodeId: d.text(),
  clientId: d
    .text()
    .notNull()
    .references(() => oauthClients.clientId, { onDelete: 'cascade' }),
  confirmation: d.jsonb(),
  expiresAt: d.timestamp({ withTimezone: true }),
  referenceId: d.text(),
  requestedUserInfoClaims: d.text().array(),
  resources: d.text().array(),
  revoked: d.timestamp({ withTimezone: true }),
  scopes: d.text().array().notNull(),
  sessionId: d.uuid().references(() => sessions.id, { onDelete: 'set null' }),
}

export const oauthRefreshTokens = d.snakeCase.table(
  'oauth_refresh_tokens',
  {
    ...baseTable,
    ...grantColumns,
    authTime: d.timestamp({ withTimezone: true }),
    rotatedAt: d.timestamp({ withTimezone: true }),
    rotationReplayExpiresAt: d.timestamp({ withTimezone: true }),
    rotationReplayResponse: d.text(),
    token: d.text().notNull().unique(),
    userId: d
      .uuid()
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
  },
  (table) => [d.index('oauth_refresh_tokens_userId_idx').on(table.userId)]
)

export const oauthAccessTokens = d.snakeCase.table(
  'oauth_access_tokens',
  {
    ...baseTable,
    ...grantColumns,
    refreshId: d
      .uuid()
      .references(() => oauthRefreshTokens.id, { onDelete: 'cascade' }),
    token: d.text().unique(),
    userId: d.uuid().references(() => users.id, { onDelete: 'cascade' }),
  },
  (table) => [d.index('oauth_access_tokens_userId_idx').on(table.userId)]
)

export const oauthConsents = d.snakeCase.table(
  'oauth_consents',
  {
    ...baseTable,
    clientId: d
      .text()
      .notNull()
      .references(() => oauthClients.clientId, { onDelete: 'cascade' }),
    referenceId: d.text(),
    requestedUserInfoClaims: d.text().array(),
    resources: d.text().array(),
    scopes: d.text().array().notNull(),
    userId: d.uuid().references(() => users.id, { onDelete: 'cascade' }),
  },
  (table) => [d.index('oauth_consents_userId_idx').on(table.userId)]
)

export const oauthClientAssertions = d.snakeCase.table(
  'oauth_client_assertions',
  {
    expiresAt: d.timestamp({ withTimezone: true }).notNull(),
    // Better Auth sets the id to a digest of the assertion, so it is not a uuid.
    id: d.text().primaryKey(),
  }
)
