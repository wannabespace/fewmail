import path from 'node:path'

const DIST = path.join(import.meta.dir, '../../web/dist')
const IMMUTABLE = 'public, max-age=31536000, immutable'

const distFile = async (urlPath: string) => {
  const file = Bun.file(path.join(DIST, urlPath))
  return (await file.exists()) ? file : null
}

/** `<path>/index.html` for a public page, the file itself, or the `noindex` app shell for any other route. */
export const serveWeb = async (urlPath: string) => {
  if (urlPath.startsWith('/assets/')) {
    const asset = await distFile(urlPath)
    // A missing asset is a 404, never the app shell: a stale chunk must fail loudly, not parse HTML as JS.
    return asset
      ? new Response(asset, { headers: { 'Cache-Control': IMMUTABLE } })
      : new Response('Not found', { status: 404 })
  }
  const page =
    (await distFile(`${urlPath}/index.html`)) ??
    (await distFile(urlPath)) ??
    (await distFile('/app.html'))
  return page ? new Response(page) : new Response('Not found', { status: 404 })
}
