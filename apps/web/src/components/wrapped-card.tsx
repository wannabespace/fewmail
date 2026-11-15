import type { WrappedStats } from '@fewmail/shared/agent'
import type { Messages } from '@fewmail/shared/i18n'
import { formatMinutes } from '@fewmail/shared/i18n/locales'
import type { Locale } from '@fewmail/shared/i18n/locales'

import { useLocale, useT } from '~/lib/i18n'

/** 2024-01-01 was a Monday, so ISO weekday n is that date plus n - 1 days. */
const weekdayName = (locale: Locale, isoWeekday: number) =>
  new Intl.DateTimeFormat(locale, { timeZone: 'UTC', weekday: 'long' }).format(
    new Date(Date.UTC(2024, 0, isoWeekday))
  )

const hourName = (locale: Locale, hour: number) =>
  new Intl.DateTimeFormat(locale, {
    hour: 'numeric',
    minute: '2-digit',
    timeZone: 'UTC',
  }).formatRange(
    new Date(Date.UTC(2024, 0, 1, hour)),
    new Date(Date.UTC(2024, 0, 1, hour + 1))
  )

/** One list for the page and the image, so both always tell the same story. */
const tilesOf = (t: Messages, locale: Locale, stats: WrappedStats) => {
  const number = (value: number) => value.toLocaleString(locale)
  return [
    {
      caption: t.wrapped.emails,
      detail: t.wrapped.split(
        number(stats.fromPeople),
        number(stats.fromLists),
        number(stats.emails - stats.fromPeople - stats.fromLists)
      ),
      value: number(stats.emails),
    },
    {
      caption: t.wrapped.saved,
      value: formatMinutes(locale, stats.savedMinutes),
    },
    { caption: t.wrapped.handled, value: number(stats.handled) },
    { caption: t.wrapped.replies, value: number(stats.replies) },
    { caption: t.wrapped.unsubscribed, value: number(stats.unsubscribed) },
    { caption: t.wrapped.spam, value: number(stats.spam) },
  ]
}

const busiestOf = (t: Messages, locale: Locale, stats: WrappedStats) =>
  stats.busiestWeekday && stats.busiestHour !== null
    ? t.wrapped.busiest(
        weekdayName(locale, stats.busiestWeekday),
        hourName(locale, stats.busiestHour)
      )
    : null

export const WrappedCard = ({
  label,
  stats,
  title,
}: {
  label: string
  stats: WrappedStats
  title: string
}) => {
  const t = useT()
  const locale = useLocale()
  const busiest = busiestOf(t, locale, stats)

  return (
    <section className="flex flex-col gap-8">
      <header className="flex flex-col gap-2">
        <p className="text-muted-foreground text-sm tabular-nums">{label}</p>
        <h1 className="text-display font-serif tracking-tight">{title}</h1>
      </header>
      <dl className="grid grid-cols-2 gap-x-8 gap-y-7">
        {tilesOf(t, locale, stats).map(({ caption, detail, value }) => (
          <div key={caption} className="flex flex-col gap-1">
            <dt className="sr-only">{caption}</dt>
            <dd className="text-display font-serif tracking-tight tabular-nums">
              {value}
            </dd>
            <dd className="text-muted-foreground text-sm">
              {caption}
              {detail && <span className="block text-xs">{detail}</span>}
            </dd>
          </div>
        ))}
      </dl>
      {busiest && <p className="text-brief font-serif">{busiest}</p>}
    </section>
  )
}

const IMAGE = { height: 1350, margin: 96, width: 1080 }
const serif = (size: number) => `${size}px "Lora Variable", Georgia, serif`
const sans = (size: number) => `${size}px "Inter Variable", sans-serif`

type Context = OffscreenCanvasRenderingContext2D

/** Canvas has no layout: wraps `text` to `width`. CJK text has no spaces and stays one line, shrunk by `maxWidth`. */
const wrapLines = (context: Context, text: string, width: number) => {
  const lines: string[] = []
  for (const word of text.split(' ')) {
    const last = lines.at(-1)
    if (
      last !== undefined &&
      context.measureText(`${last} ${word}`).width <= width
    ) {
      lines[lines.length - 1] = `${last} ${word}`
    } else {
      lines.push(word)
    }
  }
  return lines
}

const drawLines = (
  context: Context,
  text: string,
  at: { lineHeight: number; width: number; x: number; y: number }
) => {
  for (const [row, line] of wrapLines(context, text, at.width).entries()) {
    context.fillText(line, at.x, at.y + row * at.lineHeight, at.width)
  }
}

/** Draws the card as a 4:5 PNG in the page's own colours and fonts, ready for a story or a post. */
export const wrappedImage = async (
  t: Messages,
  locale: Locale,
  { label, stats, title }: { label: string; stats: WrappedStats; title: string }
) => {
  await document.fonts.ready
  const style = getComputedStyle(document.documentElement)
  const color = (name: string) => style.getPropertyValue(name).trim()
  const canvas = new OffscreenCanvas(IMAGE.width, IMAGE.height)
  const context = canvas.getContext('2d')
  if (!context) {
    throw new Error('Canvas 2D is not available')
  }
  const wide = IMAGE.width - IMAGE.margin * 2
  const column = (IMAGE.width - IMAGE.margin * 3) / 2

  context.fillStyle = color('--background')
  context.fillRect(0, 0, IMAGE.width, IMAGE.height)
  context.textBaseline = 'top'
  context.fillStyle = color('--muted-foreground')
  context.font = sans(32)
  context.fillText(label, IMAGE.margin, IMAGE.margin)
  context.fillStyle = color('--foreground')
  context.font = serif(84)
  context.fillText(title, IMAGE.margin, IMAGE.margin + 52, wide)

  for (const [index, { caption, value }] of tilesOf(
    t,
    locale,
    stats
  ).entries()) {
    const x = IMAGE.margin + (index % 2) * (column + IMAGE.margin)
    const y = 330 + Math.floor(index / 2) * 250
    context.fillStyle = color('--foreground')
    context.font = serif(96)
    context.fillText(value, x, y, column)
    context.fillStyle = color('--muted-foreground')
    context.font = sans(30)
    drawLines(context, caption, {
      lineHeight: 40,
      width: column,
      x,
      y: y + 112,
    })
  }

  const busiest = busiestOf(t, locale, stats)
  if (busiest) {
    context.fillStyle = color('--foreground')
    context.font = serif(40)
    drawLines(context, busiest, {
      lineHeight: 52,
      width: wide,
      x: IMAGE.margin,
      y: 1100,
    })
  }
  context.fillStyle = color('--primary')
  context.font = sans(32)
  context.fillText(
    'fewmail.app',
    IMAGE.margin,
    IMAGE.height - IMAGE.margin - 32
  )

  return canvas.convertToBlob({ type: 'image/png' })
}
