import { createAuthClient } from 'better-auth/react'

export const authClient = createAuthClient({
  basePath: '/auth',
  baseURL: import.meta.env.API_URL,
})

export const signInWithGoogle = () =>
  authClient.signIn.social({
    callbackURL: `${location.origin}/today`,
    provider: 'google',
  })
