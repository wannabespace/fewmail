/** Shared mailbox providers: a spammer on gmail.com says nothing about gmail.com. */
export const FREEMAIL_DOMAINS = new Set([
  '126.com',
  '163.com',
  'abv.bg',
  'aim.com',
  'aliyun.com',
  'aol.com',
  'arcor.de',
  'att.net',
  'bigmir.net',
  'bk.ru',
  'bluewin.ch',
  'bol.com.br',
  'btinternet.com',
  'centrum.cz',
  'comcast.net',
  'daum.net',
  'email.com',
  'email.cz',
  'fastmail.com',
  'fastmail.fm',
  'foxmail.com',
  'free.fr',
  'freenet.de',
  'gazeta.pl',
  'gmail.com',
  'gmx.at',
  'gmx.ch',
  'gmx.co.uk',
  'gmx.com',
  'gmx.de',
  'gmx.fr',
  'gmx.net',
  'gmx.us',
  'googlemail.com',
  'hanmail.net',
  'hey.com',
  'hotmail.be',
  'hotmail.ca',
  'hotmail.co.jp',
  'hotmail.co.uk',
  'hotmail.com',
  'hotmail.com.ar',
  'hotmail.com.br',
  'hotmail.de',
  'hotmail.es',
  'hotmail.fr',
  'hotmail.it',
  'hotmail.nl',
  'hushmail.com',
  'i.ua',
  'icloud.com',
  'inbox.lv',
  'inbox.ru',
  'interia.pl',
  'internet.ru',
  'kakao.com',
  'laposte.net',
  'libero.it',
  'list.ru',
  'live.ca',
  'live.co.uk',
  'live.com',
  'live.com.au',
  'live.de',
  'live.fr',
  'live.it',
  'live.nl',
  'mac.com',
  'mail.com',
  'mail.de',
  'mail.ru',
  'mailfence.com',
  'me.com',
  'meta.ua',
  'msn.com',
  'naver.com',
  'neuf.fr',
  'o2.pl',
  'onet.pl',
  'op.pl',
  'orange.fr',
  'outlook.com',
  'outlook.com.br',
  'outlook.de',
  'outlook.es',
  'outlook.fr',
  'outlook.it',
  'outlook.jp',
  'pm.me',
  'posteo.de',
  'proton.me',
  'protonmail.ch',
  'protonmail.com',
  'qq.com',
  'rambler.ru',
  'rediffmail.com',
  'rocketmail.com',
  'sbcglobal.net',
  'seznam.cz',
  'sfr.fr',
  'sina.com',
  'sohu.com',
  't-online.de',
  'terra.com.br',
  'tiscali.it',
  'tuta.com',
  'tuta.io',
  'tutanota.com',
  'tutanota.de',
  'ukr.net',
  'uol.com.br',
  'verizon.net',
  'virgilio.it',
  'wanadoo.fr',
  'web.de',
  'windowslive.com',
  'wp.pl',
  'ya.ru',
  'yahoo.ca',
  'yahoo.co.id',
  'yahoo.co.in',
  'yahoo.co.jp',
  'yahoo.co.uk',
  'yahoo.com',
  'yahoo.com.ar',
  'yahoo.com.au',
  'yahoo.com.br',
  'yahoo.com.hk',
  'yahoo.com.mx',
  'yahoo.com.ph',
  'yahoo.com.sg',
  'yahoo.com.tw',
  'yahoo.de',
  'yahoo.es',
  'yahoo.fr',
  'yahoo.it',
  'yandex.by',
  'yandex.com',
  'yandex.kz',
  'yandex.ru',
  'yandex.ua',
  'yeah.net',
  'ymail.com',
  'zoho.com',
  'zohomail.com',
])

/** A sender's domain, or its whole address at a mailbox provider: "gmail.com" names nobody. */
export const senderDomainOrAddress = (email: string) => {
  const domain = email.trim().toLowerCase().split('@')[1] ?? ''
  return FREEMAIL_DOMAINS.has(domain) || !domain ? email : domain
}

const ESCAPES: Record<string, string> = {
  '"': '&quot;',
  '&': '&amp;',
  "'": '&#39;',
  '<': '&lt;',
  '>': '&gt;',
}

const escapeHtml = (text: string) =>
  text.replaceAll(/["&'<>]/gu, (char) => ESCAPES[char] ?? char)

export const textToHtml = (text: string) =>
  text
    .replaceAll(/\r\n?/gu, '\n')
    .split(/\n[ \t]*\n/u)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean)
    .map(
      (paragraph) => `<p>${escapeHtml(paragraph).replaceAll('\n', '<br>')}</p>`
    )
    .join('')

const ENTITIES: Record<string, string> = {
  amp: '&',
  apos: "'",
  bull: '•',
  copy: '©',
  euro: '€',
  gt: '>',
  hellip: '…',
  laquo: '«',
  ldquo: '“',
  lsquo: '‘',
  lt: '<',
  mdash: '—',
  middot: '·',
  nbsp: ' ',
  ndash: '–',
  quot: '"',
  raquo: '»',
  rdquo: '”',
  reg: '®',
  rsquo: '’',
  trade: '™',
}

const codePoint = (code: string) =>
  code.startsWith('#x') || code.startsWith('#X')
    ? Number(`0x${code.slice(2)}`)
    : Number(code.slice(1))

const decodeEntities = (text: string) =>
  text.replaceAll(
    /&(?<code>#x[\da-f]+|#\d+|[a-z]+);/giu,
    (entity, code: string) => {
      if (!code.startsWith('#')) {
        return ENTITIES[code.toLowerCase()] ?? entity
      }
      const point = codePoint(code)
      return point > 0 && point <= 0x10_ff_ff
        ? String.fromCodePoint(point)
        : entity
    }
  )

interface ElementNode {
  attrs: string
  children: Node[]
  tag: string
}
type Node = ElementNode | string

const VOID_TAGS = new Set([
  'area',
  'base',
  'br',
  'col',
  'hr',
  'img',
  'input',
  'link',
  'meta',
  'source',
  'wbr',
])
const SKIPPED_TAGS = new Set(['head', 'script', 'style', 'template', 'title'])
const BLOCK_TAGS = new Set([
  'address',
  'article',
  'aside',
  'blockquote',
  'center',
  'dd',
  'div',
  'dl',
  'dt',
  'figure',
  'footer',
  'form',
  'h1',
  'h2',
  'h3',
  'h4',
  'h5',
  'h6',
  'header',
  'hr',
  'li',
  'main',
  'nav',
  'ol',
  'p',
  'pre',
  'section',
  'table',
  'tbody',
  'tfoot',
  'thead',
  'tr',
  'ul',
])

const TOKEN =
  /<!--[\s\S]*?-->|<!\[CDATA\[[\s\S]*?\]\]>|<![^>]*>|<\/(?<closing>[a-z][\w-]*)[^>]*>|<(?<opening>[a-z][\w-]*)(?<attrs>(?:"[^"]*"|'[^']*'|[^'">])*)>|[^<]+|</giu

const parse = (html: string) => {
  const root: ElementNode = { attrs: '', children: [], tag: '#root' }
  const stack = [root]
  const current = () => stack.at(-1) ?? root
  const close = (tag: string) => {
    const index = stack.findLastIndex((node) => node.tag === tag)
    if (index > 0) {
      stack.length = index
    }
  }
  TOKEN.lastIndex = 0
  for (let match = TOKEN.exec(html); match; match = TOKEN.exec(html)) {
    const [token] = match
    const { attrs = '', closing, opening } = match.groups ?? {}
    if (closing) {
      close(closing.toLowerCase())
    } else if (opening) {
      const tag = opening.toLowerCase()
      if (SKIPPED_TAGS.has(tag)) {
        const end = html.toLowerCase().indexOf(`</${tag}`, TOKEN.lastIndex)
        TOKEN.lastIndex = end === -1 ? html.length : end
        continue
      }
      if (tag === 'p' || tag === 'li') {
        const open = current().tag
        if (open === tag) {
          stack.pop()
        }
      }
      const node: ElementNode = { attrs, children: [], tag }
      current().children.push(node)
      if (!VOID_TAGS.has(tag) && !attrs.trimEnd().endsWith('/')) {
        stack.push(node)
      }
    } else if (!token.startsWith('<!') || token === '<') {
      current().children.push(token)
    }
  }
  return root
}

const attr = (node: ElementNode, name: string) => {
  const match = new RegExp(
    `(?:^|\\s)${name}\\s*=\\s*(?:"(?<double>[^"]*)"|'(?<single>[^']*)'|(?<bare>[^\\s>]+))`,
    'iu'
  ).exec(node.attrs)
  const { bare, double, single } = match?.groups ?? {}
  return decodeEntities(double ?? single ?? bare ?? '')
}

const textOf = (nodes: Node[]): string =>
  nodes
    .map((node) => {
      if (typeof node === 'string') {
        return decodeEntities(node)
      }
      return node.tag === 'br' ? '\n' : textOf(node.children)
    })
    .join('')

const indent = (text: string, first: string, rest: string) =>
  text
    .split('\n')
    .map((line, index) => (index === 0 ? first : rest) + line)
    .join('\n')

const children = (node: ElementNode) =>
  node.children.filter(
    (child): child is ElementNode => typeof child !== 'string'
  )

const render = {
  block: (node: ElementNode): string => {
    switch (node.tag) {
      case 'ul':
      case 'ol': {
        return render.list(node)
      }
      case 'blockquote': {
        return render
          .nodes(node.children)
          .split('\n')
          .map((line) => (line ? `> ${line}` : '>'))
          .join('\n')
      }
      case 'pre': {
        return textOf(node.children).replaceAll(' ', ' ').trimEnd()
      }
      case 'hr': {
        return '---'
      }
      case 'tr': {
        return children(node)
          .map((cell) => render.nodes(cell.children, ' '))
          .filter(Boolean)
          .join('  ')
      }
      case 'table':
      case 'tbody':
      case 'thead':
      case 'tfoot': {
        return render.nodes(node.children, '\n')
      }
      default: {
        return render.nodes(node.children)
      }
    }
  },
  inline: (node: ElementNode): string => {
    switch (node.tag) {
      case 'br': {
        return '\n'
      }
      case 'a': {
        return render.link(node)
      }
      case 'img': {
        return attr(node, 'alt')
      }
      case 'td':
      case 'th': {
        return `${render.nodes(node.children, ' ')} `
      }
      default: {
        return render.nodes(node.children, '\n')
      }
    }
  },
  link: (node: ElementNode) => {
    const text = render.nodes(node.children, '\n').trim()
    const href = attr(node, 'href').trim()
    if (!/^(?:https?|mailto|tel):/iu.test(href)) {
      return text
    }
    const target = href.replace(/^mailto:/iu, '')
    if (!text) {
      return target
    }
    return text === target || text === href ? text : `${text} (${href})`
  },
  list: (node: ElementNode) => {
    const ordered = node.tag === 'ol'
    let index = Math.trunc(Number(attr(node, 'start'))) || 1
    return children(node)
      .map((child) => {
        const body = render.nodes(
          child.tag === 'li' ? child.children : [child],
          '\n'
        )
        if (!body || child.tag !== 'li') {
          return body
        }
        const marker = ordered ? `${index}. ` : '- '
        index += 1
        return indent(body, marker, ' '.repeat(marker.length))
      })
      .filter(Boolean)
      .join('\n')
  },
  nodes: (nodes: Node[], separator = '\n\n'): string => {
    const parts: string[] = []
    let inline = ''
    const flush = () => {
      const text = inline
        .replaceAll(/[ \t]+/gu, ' ')
        .replaceAll(/ ?\n ?/gu, '\n')
        .trim()
      if (text) {
        parts.push(text)
      }
      inline = ''
    }
    for (const node of nodes) {
      if (typeof node === 'string') {
        inline += decodeEntities(node.replaceAll(/[\t\n\f\r ]+/gu, ' '))
      } else if (BLOCK_TAGS.has(node.tag)) {
        flush()
        const block = render.block(node)
        if (block.trim()) {
          parts.push(block)
        }
      } else {
        inline += render.inline(node)
      }
    }
    flush()
    return parts.join(separator)
  },
}

export const htmlToText = (html: string) =>
  render
    .nodes(parse(html).children)
    .replaceAll(' ', ' ')
    .replaceAll(/[ \t]+$/gmu, '')
    .replaceAll(/\n{3,}/gu, '\n\n')
    .trim()

const URL_IN_TEXT = /https?:\/\/[^\s<>()"']+[^\s<>()"'.,;:!?]/giu

/** Every web link once, with what the reader sees on it: the anchor's text, an image's alt, or nothing for a bare URL in plain text. */
export const emailLinks = (email: { body: string; html: string | null }) => {
  if (!email.html) {
    return [...new Set(email.body.match(URL_IN_TEXT))].map((url) => ({
      text: '',
      url,
    }))
  }
  const links = new Map<string, string>()
  const walk = (nodes: Node[]) => {
    for (const node of nodes) {
      if (typeof node === 'string') {
        continue
      }
      const url = node.tag === 'a' ? attr(node, 'href').trim() : ''
      if (!url) {
        walk(node.children)
      } else if (/^https?:/iu.test(url) && !links.has(url)) {
        links.set(url, render.nodes(node.children, ' ').trim())
      }
    }
  }
  walk(parse(email.html).children)
  return [...links].map(([url, text]) => ({ text, url }))
}

export const replySubject = (subject: string) =>
  /^re:/iu.test(subject) ? subject : `Re: ${subject}`

/** Who a reply to `message` goes to: its sender, or its recipients when the user sent it. */
export const replyRecipients = (message: {
  fromEmail: string
  isFromMe: boolean
  to: string[]
}) => (message.isFromMe ? message.to : [message.fromEmail])

export const forwardSubject = (subject: string) =>
  /^fwd?:/iu.test(subject) ? subject : `Fwd: ${subject}`

/** "olena", "Olena K" and "olena@" all find Olena Koval <olena.k@acme.com>. */
export const matchesContact = (
  { email, name }: { email: string; name: string | null },
  query: string
) => {
  const needle = query.trim().toLowerCase()
  return email.includes(needle) || Boolean(name?.toLowerCase().includes(needle))
}

/** A file of a received email: listed under it, or drawn inside its HTML when that points at its `Content-ID`. */
export interface MailAttachment {
  contentId: string | null
  filename: string
  mimeType: string
  partId: string
  size: number
}

/** A file the user attaches. Without `data` it is already in the saved Gmail draft, found there by `id`. */
export interface OutgoingAttachment {
  data?: string
  filename: string
  id: string
  mimeType: string
  size: number
}

/** A forwarded email's file goes out under this prefix and its part id, read from that email when sent. */
export const FORWARDED_PREFIX = 'fwd-'

/** Gmail refuses mail over 25 MB, and base64 makes a file a third larger on the way. */
export const ATTACHMENTS_MAX_BYTES = 18_000_000

/** `cid:ii_abc` in the HTML names the part whose Content-ID is `<ii_abc>`. */
export const attachmentOfCid = (attachments: MailAttachment[], src: string) => {
  const contentId = decodeURIComponent(src.replace(/^cid:/iu, ''))
  return attachments.find((file) => file.contentId === contentId)
}

export interface Participant {
  fromEmail: string
  fromName: string | null
  isFromMe: boolean
}

/** Everyone who wrote in a thread, from its emails oldest first: in the order they first wrote, the user once and last. */
export const participantsOf = (written: Participant[]) => {
  const byKey = new Map(
    written.map((email) => [email.isFromMe ? '' : email.fromEmail, email])
  )
  const me = byKey.get('')
  byKey.delete('')
  return me ? [...byKey.values(), me] : [...byKey.values()]
}
