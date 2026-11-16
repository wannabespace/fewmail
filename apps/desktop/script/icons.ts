// Run by build.rs: every `icon("Name")` in src becomes the web's Hugeicons glyph (`@hugeicons/core-free-icons`, at
// the web's strokeWidth 2), listed in `<out>/icons.rs` for `ui::ICONS`.
import { readdirSync, readFileSync, writeFileSync } from 'node:fs'
import { argv } from 'node:process'

import * as hugeicons from '@hugeicons/core-free-icons'

const out = argv[2]
const names = [
  ...new Set(
    readdirSync('src', { recursive: true })
      .filter((file) => String(file).endsWith('.rs'))
      .flatMap((file) => [
        ...readFileSync(`src/${file}`, 'utf8').matchAll(/icon\("(\w+Icon)"\)/gu),
      ])
      .map(([, name]) => name)
  ),
].toSorted()

const attribute = (key: string) =>
  key.replaceAll(/[A-Z]/gu, (letter) => `-${letter.toLowerCase()}`)

const svgOf = (name: string) => {
  const icon = hugeicons[name as keyof typeof hugeicons] as unknown as [
    string,
    Record<string, string>,
  ][]
  if (!icon) {
    throw new Error(`No Hugeicon named ${name}`)
  }
  const body = icon
    .map(([tag, attrs]) => {
      const parts = Object.entries(attrs)
        .filter(([key]) => key !== 'key')
        .map(([key, value]) =>
          key === 'strokeWidth'
            ? 'stroke-width="2"'
            : `${attribute(key)}="${value}"`
        )
      return `<${tag} ${parts.join(' ')}/>`
    })
    .join('')
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none">${body}</svg>`
}

writeFileSync(
  `${out}/icons.rs`,
  `pub const ICONS: &[(&str, &str)] = &[\n${names
    .map((name) => `    (${JSON.stringify(name)}, ${JSON.stringify(svgOf(name))}),`)
    .join('\n')}\n];\n`
)
