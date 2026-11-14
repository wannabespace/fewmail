import type { RouterHistory } from '@tanstack/react-router'
import { createRouter } from '@tanstack/react-router'

import { localeStore } from './lib/i18n'
import { posthog } from './lib/posthog'
import { queryClient } from './lib/query-client'
import { LOCALIZED_PATHS, localizedPath, splitLocale } from './lib/seo'
import { routeTree } from './routeTree.gen'

/**
 * A public page carries its language in the URL (`/uk/pricing`, English unprefixed); the routes never see it. The
 * rewrite stays free of side effects: `router.update` re-reads the URL, so setting the language here would undo a pick.
 */
export const createAppRouter = (history?: RouterHistory) =>
  createRouter({
    context: { queryClient },
    defaultOnCatch: (error) => posthog.captureException(error),
    defaultPreload: 'intent',
    history,
    rewrite: {
      input: ({ url }) => {
        const { path } = splitLocale(url.pathname)
        if (!LOCALIZED_PATHS.includes(path)) {
          return
        }
        url.pathname = path
        return url
      },
      output: ({ url }) => {
        if (!LOCALIZED_PATHS.includes(url.pathname)) {
          return
        }
        url.pathname = localizedPath(localeStore.get(), url.pathname)
        return url
      },
    },
    routeTree,
  })

declare module '@tanstack/react-router' {
  interface Register {
    router: ReturnType<typeof createAppRouter>
  }
}
