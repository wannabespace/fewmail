import { oauthProviderClient } from '@better-auth/oauth-provider/client'
import { type } from 'arktype'
import { createAuthClient } from 'better-auth/react'
import { createWebStorageValue } from 'seitu/web'
import { toast } from 'sonner'

import { getT } from './i18n'
import { posthog } from './posthog'
import { disablePush } from './push'

export const authClient = createAuthClient({
  basePath: '/auth',
  baseURL: import.meta.env.API_URL,
  plugins: [oauthProviderClient()],
})

export const signInWithGoogle = (path = '/home', loginHint?: string) => {
  posthog.capture('sign_in_started')
  return authClient.signIn.social({
    callbackURL: `${location.origin}${path}`,
    loginHint,
    provider: 'google',
  })
}

/** Lets `/` send a returning user straight into the app without waiting for the API; `/_app` corrects it either way. */
export const signedInStore = createWebStorageValue({
  defaultValue: false,
  key: 'fewmail.signed-in',
  schema: type('boolean'),
  type: 'localStorage',
})

export const signOut = () => {
  signedInStore.set(false)
  posthog.capture('signed_out')
  toast.loading(getT().today.working)
  void posthog.reset()
  void disablePush()
    .finally(() => authClient.signOut())
    .then(() => location.assign('/login'))
}
