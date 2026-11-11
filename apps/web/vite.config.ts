import process from 'node:process'

import { setupPortlessEnvs } from '@fewmail/shared/portless-env'
import babel from '@rolldown/plugin-babel'
import tailwindcss from '@tailwindcss/vite'
import { tanstackRouter } from '@tanstack/router-plugin/vite'
import react, { reactCompilerPreset } from '@vitejs/plugin-react'
import type { Plugin } from 'vite'
import { defineConfig } from 'vite'

import { OG_IMAGE, PUBLIC_PAGES, SITE_NAME } from './src/lib/seo'

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

const pageHead = (
  path: string,
  { description, title }: { description: string; title: string }
) => {
  const url = `${WEB_URL}${path}`
  return [
    `<title>${escape(title)}</title>`,
    meta('name', 'description', description),
    `<link rel="canonical" href="${url}" />`,
    meta('property', 'og:title', title),
    meta('property', 'og:description', description),
    meta('property', 'og:url', url),
  ].join('\n    ')
}

const siteFiles = (): Record<string, string> => ({
  'robots.txt': `User-agent: *\nAllow: /\n\nSitemap: ${WEB_URL}/sitemap.xml\n`,
  'site.webmanifest': JSON.stringify({
    background_color: THEME_COLOR,
    display: 'standalone',
    icons: [
      { sizes: 'any', src: '/favicon.svg', type: 'image/svg+xml' },
      { sizes: '180x180', src: '/apple-touch-icon.png', type: 'image/png' },
    ],
    name: SITE_NAME,
    start_url: '/today',
    theme_color: THEME_COLOR,
  }),
  'sitemap.xml': `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${Object.entries(PUBLIC_PAGES)
  .map(
    ([path, { updatedAt }]) =>
      `  <url><loc>${WEB_URL}${path}</loc>${updatedAt ? `<lastmod>${updatedAt.toLocaleDateString('sv')}</lastmod>` : ''}</url>`
  )
  .join('\n')}
</urlset>
`,
})

const withHead = (html: string, path: string) =>
  html
    .replace(/<meta name="robots"[^>]*>\s*/u, '')
    .replace(
      /<title>.*?<\/title>/u,
      pageHead(
        path,
        PUBLIC_PAGES[path] ?? { description: '', title: SITE_NAME }
      )
    )

/**
 * Each public page is emitted as `<path>/index.html` with its own title, description and canonical, so
 * crawlers and link previews that never run JS still see them. `/` is `index.html` itself, so the
 * `noindex` app shell moves to `app.html`, and the preview server answers every other route with it.
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
  generateBundle(_, bundle) {
    const shell = bundle['index.html']
    if (shell?.type !== 'asset') {
      return
    }
    for (const [fileName, source] of Object.entries(siteFiles())) {
      this.emitFile({ fileName, source, type: 'asset' })
    }
    const html = String(shell.source)
    this.emitFile({ fileName: 'app.html', source: html, type: 'asset' })
    for (const path of Object.keys(PUBLIC_PAGES)) {
      if (path === '/') {
        shell.source = withHead(html, path)
      } else {
        this.emitFile({
          fileName: `${path.slice(1)}/index.html`,
          source: withHead(html, path),
          type: 'asset',
        })
      }
    }
  },
  configurePreviewServer(server) {
    server.middlewares.use((req, _res, next) => {
      const url = req.url?.split('?')[0] ?? '/'
      const path = url.length > 1 ? url.replace(/\/$/u, '') : url
      if (!path.includes('.')) {
        req.url = path in PUBLIC_PAGES ? `${path}/index.html` : '/app.html'
      }
      next()
    })
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
  envPrefix: ['VITE_', 'API_URL'],
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
  ],
  preview: {
    allowedHosts: ['fewmail.app', 'healthcheck.railway.app'],
    host: true,
    port: Number(process.env.PORT) || undefined,
  },
  resolve: { tsconfigPaths: true },
})
