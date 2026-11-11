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

export const replySubject = (subject: string) =>
  /^re:/iu.test(subject) ? subject : `Re: ${subject}`

export const forwardSubject = (subject: string) =>
  /^fwd?:/iu.test(subject) ? subject : `Fwd: ${subject}`
