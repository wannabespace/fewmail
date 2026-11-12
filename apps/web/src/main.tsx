import './globals.css'
import { createRouter, RouterProvider } from '@tanstack/react-router'
import { createRoot } from 'react-dom/client'

import { queryClient } from './lib/query-client'
import { pageTitle } from './lib/seo'
import { routeTree } from './routeTree.gen'

const router = createRouter({
  context: { queryClient },
  defaultPreload: 'intent',
  routeTree,
})

router.subscribe('onResolved', ({ toLocation }) => {
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

createRoot(root).render(<RouterProvider router={router} />)
