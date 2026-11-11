import { type } from 'arktype'
import { createAuthClient } from 'better-auth/react'
import { createWebStorageValue } from 'seitu/web'

export const authClient = createAuthClient({
  basePath: '/auth',
  baseURL: import.meta.env.API_URL,
})

export const signInWithGoogle = () =>
  authClient.signIn.social({
    callbackURL: `${location.origin}/today`,
    provider: 'google',
  })

/** Lets `/` send a returning user straight into the app without waiting for the API; `/_app` corrects it either way. */
export const signedInStore = createWebStorageValue({
  defaultValue: false,
  key: 'fewmail.signed-in',
  schema: type('boolean'),
  type: 'localStorage',
})
