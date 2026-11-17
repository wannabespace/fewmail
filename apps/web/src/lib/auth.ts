import { oauthProviderClient } from '@better-auth/oauth-provider/client'
import { oneTimeTokenClient } from 'better-auth/client/plugins'
import { createAuthClient } from 'better-auth/react'
import { createWebStorageValue } from 'seitu/web'
import { toast } from 'sonner'
import { z } from 'zod/mini'

import { getT } from './i18n'
import { posthog } from './posthog'
import { disablePush } from './push'

export const authClient = createAuthClient({
  basePath: '/auth',
  baseURL: import.meta.env.API_URL,
  plugins: [oauthProviderClient(), oneTimeTokenClient()],
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
  schema: z.boolean(),
  type: 'localStorage',
})

export const signOut = () => {
  signedInStore.set(false)
  posthog.capture('signed_out')
  toast.loading(getT().today.working)
  void posthog.reset()
  void disablePush()
    .finally(() =>
      Promise.all([
        authClient.signOut(),
        // Imported here, so the public pages that read `signedInStore` never load Mail's collections.
        import('./snapshot').then(({ clearSnapshot }) => clearSnapshot()),
      ])
    )
    .then(() => location.assign('/login'))
}
