import './globals.css'
import { RouterProvider } from '@tanstack/react-router'
import { createRoot } from 'react-dom/client'

import { getT, loadMessages, localeStore } from './lib/i18n'
import { posthog } from './lib/posthog'
import { LOCALIZED_PATHS, localizedPath, pageTitle, urlLocale } from './lib/seo'
import { createAppRouter } from './router'

// On a public page the URL names the language, also after back and forward.
const followUrlLocale = (pathname: string) => {
  const locale = urlLocale(pathname)
  if (locale && locale !== localeStore.get()) {
    localeStore.set(locale)
  }
}
followUrlLocale(location.pathname)

const router = createAppRouter()
// Its own location: the history notifies before it writes `window.location`.
router.history.subscribe(({ location: { pathname } }) =>
  followUrlLocale(pathname)
)

router.subscribe('onResolved', ({ fromLocation, toLocation }) => {
  if (fromLocation?.pathname !== toLocation.pathname) {
    posthog.capture('$pageview')
  }
  // The signed-in app owns its title: the sidebar adds counts and status.
  if (!router.state.matches.some(({ routeId }) => routeId === '/_app')) {
    document.title = pageTitle(toLocation.pathname, getT())
  }
})

// Picking a language on a public page moves it to that language's URL.
localeStore.subscribe(async (locale) => {
  await loadMessages(locale)
  // Drops the links the router cached, which still point at the old language.
  router.update(router.options)
  const { pathname } = router.state.location
  const next = localizedPath(locale, pathname)
  if (
    LOCALIZED_PATHS.includes(pathname) &&
    next !== router.history.location.pathname
  ) {
    await router.navigate({
      href: `${next}${location.search}${location.hash}`,
      replace: true,
      resetScroll: false,
    })
  }
})

const root = document.querySelector('#root')
if (!root) {
  throw new Error('Missing #root element')
}

await loadMessages(localeStore.get())
// A prerendered public page (vite.config.ts) would blank while its route chunk loads.
if (root.hasChildNodes()) {
  await router.load()
}

createRoot(root).render(<RouterProvider router={router} />)
