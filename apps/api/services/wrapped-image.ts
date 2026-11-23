import { fileURLToPath } from 'node:url'

import { messages } from '@fewmail/shared/i18n'
import type { Locale } from '@fewmail/shared/i18n/locales'
import { formatMinutes } from '@fewmail/shared/i18n/locales'
import { initWasm, Resvg } from '@resvg/resvg-wasm'
import { Result } from 'better-result'

import { env } from '../env'
import type { Shared } from './wrapped'

/** Without a browser user agent Google Fonts answers with TrueType, the one format resvg reads. */
const FONTS_CSS =
  'https://fonts.googleapis.com/css2?family=Inter:wght@400;600&family=Lora:wght@500'
/** Scripts Inter and Lora draw; the others fall back to English rather than to empty boxes. */
const DRAWN_LOCALES = new Set<Locale>([
  'de',
  'en',
  'es',
  'fr',
  'id',
  'it',
  'nl',
  'pl',
  'pt',
  'tr',
  'uk',
])
const SIZE = { height: 630, width: 1200 }
const MARGIN = 72
const COLUMN = 360
const CAPTION_CHARS = 26
const COLORS = {
  background: '#faf8f3',
  foreground: '#2b2622',
  muted: '#6e655c',
  primary: '#b5532f',
}

let loading: Promise<Uint8Array[]> | undefined

const loadFonts = async () => {
  const wasm = fileURLToPath(
    import.meta.resolve('@resvg/resvg-wasm/index_bg.wasm')
  )
  await initWasm(await Bun.file(wasm).arrayBuffer())
  const response = await fetch(FONTS_CSS, { headers: { 'user-agent': '' } })
  const css = await response.text()
  const urls = [...css.matchAll(/url\((?<url>https:[^)]+\.ttf)\)/gu)].map(
    ({ groups }) => groups?.url ?? ''
  )
  return Promise.all(
    urls.map(async (url) => {
      const font = await fetch(url)
      return new Uint8Array(await font.arrayBuffer())
    })
  )
}

/** Once per process; a failed load is tried again on the next image. */
const fonts = async () => {
  const pending = loading ?? loadFonts()
  loading = pending
  const loaded = await Result.tryPromise(() => pending)
  if (loaded.isErr()) {
    loading = undefined
    throw loaded.error.cause
  }
  return loaded.value
}

const escape = (text: string) =>
  text.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;')

const wrapLines = (text: string) => {
  const lines: string[] = []
  for (const word of text.split(' ')) {
    const last = lines.at(-1)
    if (last !== undefined && `${last} ${word}`.length <= CAPTION_CHARS) {
      lines[lines.length - 1] = `${last} ${word}`
    } else {
      lines.push(word)
    }
  }
  return lines
}

const text = (
  value: string,
  at: {
    family: 'Inter' | 'Lora'
    fill: string
    size: number
    weight?: number
    x: number
    y: number
  }
) =>
  `<text x="${at.x}" y="${at.y}" font-family="${at.family}" font-size="${at.size}" font-weight="${at.weight ?? 400}" fill="${at.fill}">${escape(value)}</text>`

const cardTitle = (shared: Shared, locale: Locale) =>
  `${messages[locale].wrapped.shared[shared.period]} · ${shared.label}`

const tilesOf = (shared: Shared, locale: Locale) => {
  const t = messages[locale].wrapped
  const number = (value: number) => value.toLocaleString(locale)
  const { stats } = shared
  return [
    { caption: t.emails, value: number(stats.emails) },
    { caption: t.saved, value: formatMinutes(locale, stats.savedMinutes) },
    { caption: t.handled, value: number(stats.handled) },
    { caption: t.replies, value: number(stats.replies) },
    { caption: t.unsubscribed, value: number(stats.unsubscribed) },
    { caption: t.spam, value: number(stats.spam) },
  ]
}

const drawnLocale = (shared: Shared): Locale =>
  DRAWN_LOCALES.has(shared.locale) ? shared.locale : 'en'

/** The 1200×630 preview social apps show for a shared Wrapped link: the same counts as the card, nothing else. */
export const wrappedImage = async (shared: Shared) => {
  const locale = drawnLocale(shared)
  const tiles = tilesOf(shared, locale).flatMap(({ caption, value }, index) => {
    const x = MARGIN + (index % 3) * COLUMN
    const y = 270 + Math.floor(index / 3) * 170
    return [
      text(value, {
        family: 'Lora',
        fill: COLORS.foreground,
        size: 64,
        weight: 500,
        x,
        y,
      }),
      ...wrapLines(caption).map((line, row) =>
        text(line, {
          family: 'Inter',
          fill: COLORS.muted,
          size: 22,
          x,
          y: y + 40 + row * 28,
        })
      ),
    ]
  })
  const svg = [
    `<svg xmlns="http://www.w3.org/2000/svg" width="${SIZE.width}" height="${SIZE.height}">`,
    `<rect width="100%" height="100%" fill="${COLORS.background}"/>`,
    text(cardTitle(shared, locale), {
      family: 'Inter',
      fill: COLORS.foreground,
      size: 48,
      weight: 600,
      x: MARGIN,
      y: 130,
    }),
    ...tiles,
    text('fewmail.app', {
      family: 'Inter',
      fill: COLORS.primary,
      size: 26,
      weight: 600,
      x: MARGIN,
      y: SIZE.height - 48,
    }),
    '</svg>',
  ].join('')
  const rendered = new Resvg(svg, {
    font: {
      defaultFontFamily: 'Inter',
      fontBuffers: await fonts(),
      loadSystemFonts: false,
    },
  }).render()
  return new Uint8Array(rendered.asPng())
}

const attribute = (value: string) => escape(value).replaceAll('"', '&quot;')

/** What a crawler gets for `/w/<token>` (Caddy sends it here): the preview tags, and a person is sent on to the page. */
export const wrappedPreviewHtml = (shared: Shared, token: string) => {
  const locale = drawnLocale(shared)
  const title = cardTitle(shared, locale)
  const description = `${formatMinutes(locale, shared.stats.savedMinutes)} ${messages[locale].wrapped.saved}`
  const page = attribute(`${env.WEB_URL}/w/${encodeURIComponent(token)}`)
  return `<!doctype html><html><head><meta charset="utf-8"><title>${attribute(title)}</title>
<meta property="og:type" content="website">
<meta property="og:title" content="${attribute(title)}">
<meta property="og:description" content="${attribute(description)}">
<meta property="og:url" content="${page}">
<meta property="og:image" content="${attribute(`${env.API_URL}/og/w/${encodeURIComponent(token)}/image.png`)}">
<meta property="og:image:width" content="${SIZE.width}">
<meta property="og:image:height" content="${SIZE.height}">
<meta name="twitter:card" content="summary_large_image">
<meta http-equiv="refresh" content="0;url=${page}">
</head><body><a href="${page}">${attribute(title)}</a></body></html>`
}
