import './globals.css'
import { createRouter, RouterProvider } from '@tanstack/react-router'
import { createRoot } from 'react-dom/client'

import { messagesLoaded } from './lib/i18n'
import { posthog } from './lib/posthog'
import { queryClient } from './lib/query-client'
import { pageTitle } from './lib/seo'
import { routeTree } from './routeTree.gen'

const router = createRouter({
  context: { queryClient },
  defaultOnCatch: (error) => posthog.captureException(error),
  defaultPreload: 'intent',
  routeTree,
})

router.subscribe('onResolved', ({ fromLocation, toLocation }) => {
  if (fromLocation?.pathname !== toLocation.pathname) {
    posthog.capture('$pageview')
  }
  // The signed-in app owns its title: the sidebar adds counts and status.
  if (!router.state.matches.some(({ routeId }) => routeId === '/_app')) {
    document.title = pageTitle(toLocation.pathname)
  }
})

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}

const root = document.querySelector('#root')
if (!root) {
  throw new Error('Missing #root element')
}

await messagesLoaded
// A prerendered public page (vite.config.ts) would blank while its route chunk loads.
if (root.hasChildNodes()) {
  await router.load()
}

createRoot(root).render(<RouterProvider router={router} />)
