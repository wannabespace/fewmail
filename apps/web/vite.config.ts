import { createHash } from 'node:crypto'
import { readFileSync } from 'node:fs'
import process from 'node:process'

import { messages } from '@fewmail/shared/i18n'
import type { Locale } from '@fewmail/shared/i18n/locales'
import { LOCALES } from '@fewmail/shared/i18n/locales'
import { setupPortlessEnvs } from '@fewmail/shared/portless-env'
import { GlobalRegistrator } from '@happy-dom/global-registrator'
import posthog from '@posthog/rollup-plugin'
import babel from '@rolldown/plugin-babel'
import tailwindcss from '@tailwindcss/vite'
import { tanstackRouter } from '@tanstack/router-plugin/vite'
import react, { reactCompilerPreset } from '@vitejs/plugin-react'
import type { Plugin } from 'vite'
import { createServer, defineConfig } from 'vite'

import {
  LOCALIZED_PATHS,
  localizedPath,
  OG_IMAGE,
  pageMeta,
  PUBLIC_PATHS,
  SITE_NAME,
  structuredData,
} from './src/lib/seo'
import type { render } from './src/prerender'

setupPortlessEnvs({
  API_URL: 'api.local.fewmail',
  WEB_URL: 'app.local.fewmail',
}).defaults({ WEB_URL: 'https://fewmail.app' })

const WEB_URL = process.env.WEB_URL?.replace(/\/$/u, '') ?? ''
const THEME_COLOR = '#F4EFE6'

const escape = (value: string) =>
  value
    .replaceAll('&', '&amp;')
    .replaceAll('"', '&quot;')
    .replaceAll('<', '&lt;')

const meta = (key: 'name' | 'property', name: string, content: string) =>
  `<meta ${key}="${name}" content="${escape(content)}" />`

/** Every page to emit: each localized path in every language, the legal documents in English. */
const PAGES = PUBLIC_PATHS.flatMap((path) =>
  (LOCALIZED_PATHS.includes(path)
    ? LOCALES.map(({ code }) => code)
    : (['en'] satisfies Locale[])
  ).map((locale) => ({
    locale,
    path,
    url: localizedPath(locale, path),
    ...(pageMeta(path, messages[locale]) ?? {
      description: '',
      title: SITE_NAME,
    }),
  }))
)

type Page = (typeof PAGES)[number]

/** hreflang alternates: every language of a localized page, English as the default. */
const alternates = (path: string) =>
  LOCALIZED_PATHS.includes(path)
    ? [
        ...LOCALES.map(({ code }) => [code, localizedPath(code, path)]),
        ['x-default', path],
      ]
    : []

const pageHead = ({ description, locale, path, title, url }: Page) => {
  const data = structuredData(path, {
    locale,
    origin: WEB_URL,
    t: messages[locale],
  })
  return [
    `<title>${escape(title)}</title>`,
    meta('name', 'description', description),
    `<link rel="canonical" href="${WEB_URL}${url}" />`,
    ...alternates(path).map(
      ([hreflang, href]) =>
        `<link rel="alternate" hreflang="${hreflang}" href="${WEB_URL}${href}" />`
    ),
    meta('property', 'og:title', title),
    meta('property', 'og:description', description),
    meta('property', 'og:url', `${WEB_URL}${url}`),
    data &&
      `<script type="application/ld+json">${JSON.stringify(data).replaceAll('<', String.raw`\u003c`)}</script>`,
  ]
    .filter(Boolean)
    .join('\n    ')
}

const COMMIT = process.env.RAILWAY_GIT_COMMIT_SHA

const siteFiles = (): Record<string, string> => ({
  ...(COMMIT && { 'version.txt': COMMIT }),
  'llms.txt': `# ${SITE_NAME}\n\n> ${messages.en.site.meta.home}\n\n${PAGES.filter(
    ({ locale }) => locale === 'en'
  )
    .map(
      ({ description, title, url }) =>
        `- [${title}](${WEB_URL}${url}): ${description}`
    )
    .join('\n')}\n`,
  'robots.txt': `User-agent: *\nAllow: /\n\nSitemap: ${WEB_URL}/sitemap.xml\n`,
  'site.webmanifest': JSON.stringify({
    background_color: THEME_COLOR,
    display: 'standalone',
    icons: [
      { sizes: 'any', src: '/favicon.svg', type: 'image/svg+xml' },
      { sizes: '180x180', src: '/apple-touch-icon.png', type: 'image/png' },
    ],
    name: SITE_NAME,
    start_url: '/home',
    theme_color: THEME_COLOR,
  }),
  'sitemap.xml': `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
${PAGES.map(
  ({ path, updatedAt, url }) =>
    `  <url><loc>${WEB_URL}${url}</loc>${updatedAt ? `<lastmod>${updatedAt.toLocaleDateString('sv')}</lastmod>` : ''}${alternates(
      path
    )
      .map(
        ([hreflang, href]) =>
          `<xhtml:link rel="alternate" hreflang="${hreflang}" href="${WEB_URL}${href}"/>`
      )
      .join('')}</url>`
).join('\n')}
</urlset>
`,
})

/**
 * The public pages rendered to HTML, so crawlers that never run JS (Bing, AI search, link previews) read their
 * text; `main.tsx` loads the route before replacing it. The app touches `localStorage`, `navigator` and `document`
 * as it imports, hence happy-dom — registered only after Vite's own server is up, which it would otherwise confuse.
 */
const prerender = async (urls: string[]) => {
  const server = await createServer({
    appType: 'custom',
    configLoader: 'runner',
    logLevel: 'error',
    optimizeDeps: { noDiscovery: true },
    server: { hmr: false, middlewareMode: true, watch: null, ws: false },
  })
  GlobalRegistrator.register({ url: WEB_URL })
  try {
    const app = (await server.ssrLoadModule('/src/prerender.tsx')) as {
      render: typeof render
    }
    const pages: Record<string, string> = {}
    for (const url of urls) {
      // oxlint-disable-next-line no-await-in-loop -- the language lives in global stores, so pages render one at a time
      pages[url] = await app.render(url)
    }
    return pages
  } finally {
    await GlobalRegistrator.unregister()
    await server.close()
  }
}

// A returning user on `/` is redirected into the app: drop the landing before it paints.
const SIGNED_IN_GUARD = `<script>if (localStorage.getItem('fewmail.signed-in') === 'true') document.getElementById('root').replaceChildren()</script>`

const INLINE_SCRIPT =
  /<script(?![^>]*\b(?:src|type)=)[^>]*>(?<body>[\s\S]*?)<\/script>/gu

/** The Caddyfile's CSP runs an inline script only by its hash: one that changes without it would silently stop running. */
const assertScriptsAllowed = (html: string) => {
  const caddyfile = readFileSync(new URL('Caddyfile', import.meta.url), 'utf-8')
  for (const { groups } of html.matchAll(INLINE_SCRIPT)) {
    const hash = `'sha256-${createHash('sha256')
      .update(groups?.body ?? '')
      .digest('base64')}'`
    if (!caddyfile.includes(hash)) {
      throw new Error(
        `Caddyfile's script-src lacks ${hash} for an inline script`
      )
    }
  }
}

const withPage = (html: string, page: Page, body: string) =>
  html
    .replace('<html lang="en">', `<html lang="${page.locale}">`)
    .replace(/<meta name="robots"[^>]*>\s*/u, '')
    .replace(/<title>.*?<\/title>/u, pageHead(page))
    .replace(
      /(?<root><div id="root"[^>]*>)<\/div>/u,
      `$<root>${body}</div>${page.path === '/' ? SIGNED_IN_GUARD : ''}`
    )

/**
 * Each public page is emitted as `<path>/index.html` (in every language, `/<locale><path>`) with its own head,
 * hreflang alternates, structured data and prerendered body, so
 * crawlers and link previews that never run JS still see them. `/` is `index.html` itself, so the
 * `noindex` app shell moves to `app.html`, which `Caddyfile` serves for every other route.
 */
const seo = (): Plugin => ({
  configureServer(server) {
    server.middlewares.use((req, res, next) => {
      const file = siteFiles()[req.url?.slice(1) ?? '']
      if (!file) {
        return next()
      }
      res.end(file)
    })
  },
  enforce: 'post',
  async generateBundle(_, bundle) {
    const shell = bundle['index.html']
    if (shell?.type !== 'asset') {
      return
    }
    for (const [fileName, source] of Object.entries(siteFiles())) {
      this.emitFile({ fileName, source, type: 'asset' })
    }
    const html = String(shell.source)
    this.emitFile({ fileName: 'app.html', source: html, type: 'asset' })
    const bodies = await prerender(PAGES.map(({ url }) => url))
    for (const page of PAGES) {
      const source = withPage(html, page, bodies[page.url] ?? '')
      assertScriptsAllowed(source)
      if (page.url === '/') {
        shell.source = source
      } else {
        this.emitFile({
          fileName: `${page.url.slice(1).replace(/\/$/u, '')}/index.html`,
          source,
          type: 'asset',
        })
      }
    }
  },
  name: 'fewmail-seo',
  transformIndexHtml: (html) =>
    html.replace(
      '</head>',
      `${[
        meta('property', 'og:type', 'website'),
        meta('property', 'og:site_name', SITE_NAME),
        meta('property', 'og:image', `${WEB_URL}${OG_IMAGE.path}`),
        meta('property', 'og:image:width', String(OG_IMAGE.width)),
        meta('property', 'og:image:height', String(OG_IMAGE.height)),
        meta('property', 'og:image:alt', OG_IMAGE.alt),
        meta('name', 'twitter:card', 'summary_large_image'),
        meta('name', 'theme-color', THEME_COLOR),
        '<link rel="apple-touch-icon" href="/apple-touch-icon.png" />',
        '<link rel="manifest" href="/site.webmanifest" />',
      ].join('\n    ')}\n  </head>`
    ),
})

export default defineConfig({
  envDir: '../..',
  // Exact names: a `POSTHOG_` prefix would inline the personal API key too.
  envPrefix: ['VITE_', 'API_URL', 'POSTHOG_TOKEN', 'RAILWAY_GIT_COMMIT_SHA'],
  plugins: [
    tailwindcss(),
    tanstackRouter({
      autoCodeSplitting: true,
      generatedRouteTree: 'src/routeTree.gen.ts',
      routesDirectory: 'src/routes',
    }),
    react(),
    babel({ presets: [reactCompilerPreset()] }),
    seo(),
    process.env.POSTHOG_PERSONAL_API_KEY && process.env.POSTHOG_PROJECT_ID
      ? posthog({
          host: 'https://eu.posthog.com',
          personalApiKey: process.env.POSTHOG_PERSONAL_API_KEY,
          projectId: process.env.POSTHOG_PROJECT_ID,
          sourcemaps: { releaseName: 'fewmail-web', releaseVersion: COMMIT },
        })
      : null,
  ],
  resolve: { tsconfigPaths: true },
})
