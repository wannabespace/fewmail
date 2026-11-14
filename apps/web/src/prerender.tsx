import {
  createMemoryHistory,
  createRouter,
  RouterProvider,
} from '@tanstack/react-router'
import { renderToString } from 'react-dom/server'

import { queryClient } from './lib/query-client'
import { routeTree } from './routeTree.gen'

export const render = async (path: string) => {
  const router = createRouter({
    context: { queryClient },
    history: createMemoryHistory({ initialEntries: [path] }),
    routeTree,
  })
  await router.load()
  return renderToString(<RouterProvider router={router} />)
}
