import { createMemoryHistory, RouterProvider } from '@tanstack/react-router'
import { renderToString } from 'react-dom/server'

import { loadMessages, localeStore } from './lib/i18n'
import { urlLocale } from './lib/seo'
import { createAppRouter } from './router'

/** `url` is the public one (`/uk/pricing`); the legal pages, which have no language in their URL, render in English. */
export const render = async (url: string) => {
  localeStore.set(urlLocale(url) ?? 'en')
  const router = createAppRouter(createMemoryHistory({ initialEntries: [url] }))
  await loadMessages(localeStore.get())
  await router.load()
  return renderToString(<RouterProvider router={router} />)
}
