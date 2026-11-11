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
}).defaults({ WEB_URL: 'https://app.fewmail.app' })

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

/**
 * The SPA shell stays `noindex`; each public page is also emitted as `<path>/index.html` with its own
 * title, description and canonical, so crawlers and link previews that never run JS still see them.
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
    for (const [path, page] of Object.entries(PUBLIC_PAGES)) {
      this.emitFile({
        fileName: `${path.slice(1)}/index.html`,
        source: String(shell.source)
          .replace(/<meta name="robots"[^>]*>\s*/u, '')
          .replace(/<title>.*?<\/title>/u, pageHead(path, page)),
        type: 'asset',
      })
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
  resolve: { tsconfigPaths: true },
})
