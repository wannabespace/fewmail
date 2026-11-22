import {
  isBulk,
  OUTLIVE_ARCHIVE_KINDS,
  sendsDraft,
} from '@fewmail/shared/agent'
import {
  FORWARDED_PREFIX,
  participantsOf,
  senderDomainOrAddress,
  textToHtml,
} from '@fewmail/shared/email'
import type { Participant } from '@fewmail/shared/email'
import type { Messages } from '@fewmail/shared/i18n'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@fewmail/ui/components/accordion'
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from '@fewmail/ui/components/alert'
import { Badge } from '@fewmail/ui/components/badge'
import { Button } from '@fewmail/ui/components/button'
import { CopyButton } from '@fewmail/ui/components/custom/copy-button'
import { IconButton } from '@fewmail/ui/components/custom/icon-button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from '@fewmail/ui/components/dropdown-menu'
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemGroup,
  ItemMedia,
  ItemTitle,
} from '@fewmail/ui/components/item'
import { Kbd } from '@fewmail/ui/components/kbd'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@fewmail/ui/components/popover'
import { Skeleton } from '@fewmail/ui/components/skeleton'
import { useIsMobile } from '@fewmail/ui/hooks/use-is-mobile'
import { cn } from '@fewmail/ui/lib/utils'
import { useResolvedTheme } from '@fewmail/ui/theme-store'
import type { ResolvedTheme } from '@fewmail/ui/theme-store'
import {
  Archive02Icon,
  ArrowDown01Icon,
  Calendar03Icon,
  Cancel01Icon,
  Clock01Icon,
  Delete02Icon,
  InboxDownloadIcon,
  LinkSquare02Icon,
  Mail01Icon,
  MailOpenIcon,
  MailReply01Icon,
  PinIcon,
  PinOffIcon,
  Shield01Icon,
} from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { eq, useLiveQuery } from '@tanstack/react-db'
import { useHotkey } from '@tanstack/react-hotkeys'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Link } from '@tanstack/react-router'
import { isToday } from 'date-fns'
import { Fragment, useEffect, useMemo, useRef, useState } from 'react'
import type { CSSProperties, ReactNode } from 'react'
import { createStore } from 'seitu'
import { useSubscription } from 'seitu/react'
import { createWebStorageValue } from 'seitu/web'
import { toast } from 'sonner'
import { z } from 'zod/mini'

import type { Expanded } from '~/components/expand-row'
import { queueCards } from '~/lib/home-db'
import { useDates, useT } from '~/lib/i18n'
import { useMailboxes } from '~/lib/lists-db'
import {
  hideThread,
  showThreadPinned,
  showThreadRead,
  findMessage,
  threadOfMessage,
  threads,
} from '~/lib/mail-db'
import type { Thread } from '~/lib/mail-db'
import { gmailThreadUrl, useHasAgent, useMe } from '~/lib/me'
import { offerBlock } from '~/lib/offer-block'
import { client, orpc, refetchChanged } from '~/lib/orpc'
import { posthog } from '~/lib/posthog'
import { showUntilSettled } from '~/lib/query-client'
import { runUndo, UNDO_TOAST_MS } from '~/lib/undo'

import { cidSource, listedAttachments, MessageAttachments } from './attachments'
import { BotSuggestionCard } from './bot-suggestion'
import type { Draft } from './compose/compose-context'
import { EMPTY_DRAFT } from './compose/compose-context'
import { ComposeForm } from './compose/compose-form'
import { presetTimes, SNOOZE_PRESETS } from './compose/schedule'
import type { SnoozePreset } from './compose/schedule'
import { PickTime } from './compose/send-later'
import { confirm } from './confirm-dialog'
import { ExtractedChips } from './mail-meta'
import { CardProposal } from './queue-card'
import type { QueueItem } from './queue-card'
import {
  ParticipantAvatars,
  participantNamesOf,
  SenderAvatar,
} from './sender-avatar'

type ThreadMessage = NonNullable<
  ReturnType<typeof useThread>['data']
>['messages'][number]['message']

/** At most 60%: a wider reader squeezed the list into unreadable initials on a 1024px screen. */
export const READER_WIDTH = { default: 640, max: '60%', min: 420 } as const
const READER_SHARE = 0.6

export const readerWidthStore = createWebStorageValue({
  defaultValue: READER_WIDTH.default as number,
  key: 'fewmail.reader-width',
  schema: z.number(),
  type: 'localStorage',
})

/** The reader's width beside `spaceWidth`: `maxSize` bounds only a drag, so the remembered width is clamped here. */
export const useReaderWidthIn = (spaceWidth: number) => {
  const remembered = useSubscription(readerWidthStore)
  return spaceWidth > 0
    ? Math.min(
        remembered,
        Math.max(READER_WIDTH.min, Math.round(spaceWidth * READER_SHARE))
      )
    : remembered
}

/** Less than this beside the reader's narrowest and the page is unreadable: Mail's list was `q…` rows at 800px. */
const BESIDE_READER_MIN = 320

/** A phone, or a window with no readable room beside the reader: the reader then takes the whole width, over the page. */
export const useIsReaderCrowded = (spaceWidth: number) =>
  useIsMobile() ||
  (spaceWidth > 0 && spaceWidth - READER_WIDTH.min < BESIDE_READER_MIN)

/** How the reader opens and shuts, on Mail beside its list and in every other page's sidebar: `motion-panels`' own fold, the email riding in from 24px off its edge with no fade, so a click lands on readable text at once. */
export const READER_FOLD = {
  animate: { x: 0 },
  initial: { x: 24 },
  transition: { duration: 0.25, ease: [0.32, 0.72, 0, 1] },
} as const

const useThread = (threadId: string | undefined) =>
  useLiveQuery((q) =>
    threadId
      ? q
          .from({ thread: threads })
          .where(({ thread }) => eq(thread.threadId, threadId))
          .findOne()
      : undefined
  )

const isThreadPinned = (
  thread: ReturnType<typeof useThread>['data'] | undefined
) =>
  !!thread?.messages.some(({ message }) => message.labelIds.includes('STARRED'))

const riskOf = (rows: { message: ThreadMessage }[]) =>
  rows.findLast(({ message }) => message.risk)?.message ?? null

const riskText = (t: Messages, rows: { message: ThreadMessage }[]) => {
  const message = riskOf(rows)
  if (!message?.risk) {
    return ''
  }
  return t.risk[message.risk.kind](
    message.risk.imitates ?? senderDomainOrAddress(message.fromEmail)
  )
}

const SNOOZE_OPTIONS: SnoozePreset[] = [
  'laterToday',
  'tomorrow',
  'weekend',
  'nextWeek',
]

const forwardDraft = (message: ThreadMessage, header: string): Draft => ({
  ...EMPTY_DRAFT,
  attachments: listedAttachments(message).map(
    ({ filename, mimeType, partId, size }) => ({
      filename,
      id: `${FORWARDED_PREFIX}${partId}`,
      mimeType,
      size,
    })
  ),
  html: `<p></p><blockquote>${textToHtml(header)}${textToHtml(message.body)}</blockquote>`,
  mode: 'forward',
  replyToMessageId: message.id,
  subject: message.subject,
})

type ThreadRow = NonNullable<
  ReturnType<typeof useThread>['data']
>['messages'][number]

type ThreadAction = NonNullable<
  ReturnType<typeof useThread>['data']
>['actions'][number]

/** What the agent did with one email, next to it; pending cards live on Home. */
const ActionNote = ({ actions }: { actions: ThreadAction[] }) => {
  const t = useT()
  if (actions.length === 0) {
    return null
  }
  return (
    <span data-mask className="text-muted-foreground shrink-0 text-xs">
      {actions
        .map(
          (action) =>
            `${action.title} · ${action.autonomous ? t.byBot : t.actionStatus[action.status]}`
        )
        .join(', ')}
    </span>
  )
}

// `overflow-wrap:anywhere` would collapse senders' table columns to one letter per line.
const FRAME_HEAD =
  '<base target="_blank"><style>html{color-scheme:light;overflow-y:hidden}body{margin:0;padding:16px;background:#fff;color:#1c1917;font:14px/1.5 system-ui,sans-serif;overflow-wrap:break-word}img{max-width:100%;height:auto}[data-cited]{border-radius:4px;animation:cited 3s cubic-bezier(.32,.72,0,1)}@keyframes cited{0%,50%{box-shadow:0 0 0 4px oklch(.55 .15 38/.18),inset 0 0 0 100vmax oklch(.55 .15 38/.18)}to{box-shadow:0 0 0 4px transparent,inset 0 0 0 100vmax transparent}}</style>'

// Spam loads nothing from the web until the user asks: no image, pixel or font tells its sender the address is read.
const NOTHING_REMOTE = `<meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src 'unsafe-inline'">`

const OPENABLE_PROTOCOLS = new Set(['http:', 'https:', 'mailto:', 'tel:'])
// A plain `#id` resolves against the sender's `<base>` and loads their site inside the frame.
const IN_MAIL = 'about:blank#'

const inMailTarget = (mail: Document, id: string) =>
  mail.querySelector(`[id="${CSS.escape(id)}"], a[name="${CSS.escape(id)}"]`)

// Anything the sender painted or pictured may be dark on transparent: such mail keeps the white page.
const OWN_LOOK =
  '[bgcolor], [background], [color], [text], [link], [style*="color" i], [style*="background" i], img, svg, picture, video'

const setsNoColours = (mail: Document) =>
  !mail.querySelector(OWN_LOOK) &&
  ![...mail.querySelectorAll('style')].some((style) =>
    /color|background/iu.test(style.textContent ?? '')
  )

/** CSS variables stop at the frame's edge, so plain mail gets the tokens' values; `color-scheme` matches the app's, or the frame paints an opaque canvas. */
const appInk = () => {
  const tokens = getComputedStyle(document.documentElement)
  return `<style>html{color-scheme:light dark}body{padding:0;background:none;color:color-mix(in oklch,${tokens.getPropertyValue('--foreground')} 90%,transparent);line-height:1.625}a{color:${tokens.getPropertyValue('--primary')}}</style>`
}

/**
 * A link's own `target` beats our `<base>`, and a page opened inside the frame refuses to be framed: every link leaves for a new tab, jumps within the mail, or stops being a link.
 * `theme` is only there to redo plain mail in the new ink on a switch.
 */
const frameMail = ({
  blockImages,
  cidImage,
  html,
}: {
  blockImages?: boolean
  cidImage?: (src: string) => string | undefined
  html: string
  theme: ResolvedTheme
}) => {
  const mail = new DOMParser().parseFromString(html, 'text/html')
  const plain = setsNoColours(mail)
  mail.head.insertAdjacentHTML(
    'afterbegin',
    (blockImages ? NOTHING_REMOTE : '') + FRAME_HEAD + (plain ? appInk() : '')
  )
  for (const image of mail.querySelectorAll('img[src^="cid:" i]')) {
    const src = cidImage?.(image.getAttribute('src') ?? '')
    if (src) {
      image.setAttribute('src', src)
    }
  }
  for (const meta of mail.querySelectorAll('meta[http-equiv="refresh" i]')) {
    meta.remove()
  }
  const senderBase =
    mail.querySelector('base[href]')?.getAttribute('href') ?? undefined
  for (const link of mail.querySelectorAll('a[href], area[href]')) {
    const href = link.getAttribute('href')?.trim() ?? ''
    const fragment = href.startsWith('#') ? href.slice(1) : null
    const url = fragment === null ? URL.parse(href, senderBase) : null
    if (url && OPENABLE_PROTOCOLS.has(url.protocol)) {
      link.setAttribute('href', url.href)
      link.setAttribute('target', '_blank')
      link.setAttribute('rel', 'noopener noreferrer')
    } else if (fragment && inMailTarget(mail, fragment)) {
      link.setAttribute('href', IN_MAIL + fragment)
      link.setAttribute('target', '_self')
    } else {
      link.removeAttribute('href')
    }
  }
  const doctype = mail.doctype
    ? new XMLSerializer().serializeToString(mail.doctype)
    : ''
  return { isPlain: plain, page: doctype + mail.documentElement.outerHTML }
}

const jumpWithinMail = (event: MouseEvent) => {
  const link = (event.target as Element).closest?.(
    `a[href^="${IN_MAIL}"], area[href^="${IN_MAIL}"]`
  )
  if (!link) {
    return
  }
  event.preventDefault()
  const id = link.getAttribute('href')?.slice(IN_MAIL.length) ?? ''
  inMailTarget(link.ownerDocument, id)?.scrollIntoView({ behavior: 'smooth' })
}

// Acronyms and numbers count however short: "SDK", "#538" are what a summary keeps verbatim.
const KEY_WORD = /[\p{L}\p{N}][\p{L}\p{N}'’-]*/gu
const stemsOf = (text: string) =>
  new Set(
    text
      .match(KEY_WORD)
      ?.filter((word) => word.length > 4 || /\d|\p{Lu}.*\p{Lu}/u.test(word))
      .map((word) => word.toLowerCase().slice(0, 6))
  )
const PASSAGE_CHARS = 1000

/** The passage a summary sentence came from: the smallest block sharing the most word stems with it, two at least. */
const citedPassage = (mail: Document, cite: string) => {
  const wanted = [...stemsOf(cite)]
  let passage: HTMLElement | undefined
  let best = 1
  for (const block of mail.body.querySelectorAll<HTMLElement>(
    'p, li, td, blockquote, h1, h2, h3, h4, div'
  )) {
    const text = block.textContent ?? ''
    // Senders hide a preview line at the top that repeats the subject.
    const isSeen = block.checkVisibility({
      opacityProperty: true,
      visibilityProperty: true,
    })
    const stems =
      isSeen && block.offsetHeight > 1 && text.length <= PASSAGE_CHARS
        ? stemsOf(text)
        : null
    const score = stems ? wanted.filter((stem) => stems.has(stem)).length : 0
    if (score > best || (score === best && passage?.contains(block))) {
      passage = block
      best = score
    }
  }
  return passage
}

const BodySkeleton = () => (
  <div className="flex flex-col gap-3 p-2">
    <Skeleton className="h-5 w-full" />
    <Skeleton className="h-5 w-11/12" />
    <Skeleton className="h-5 w-3/5" />
  </div>
)

// A frame starts empty on every open; the last measured height keeps a reopened mail from growing into place.
const frameHeights = new Map<string, number>()

/**
 * Senders' HTML is laid out for a white page, so it keeps one unless it sets no colours of its own. No `allow-scripts`: with it, `allow-same-origin` would hand the mail our session.
 * With `cite`, the passage it came from is centred and lit for a moment.
 */
const HtmlBody = ({
  blockImages,
  cidImage,
  cite,
  html,
  id,
}: {
  blockImages?: boolean
  cidImage?: (src: string) => string | undefined
  cite?: string
  html: string
  id: string
}) => {
  const [height, setHeight] = useState(frameHeights.get(id) ?? 0)
  const [cited, setCited] = useState<HTMLElement>()
  const theme = useResolvedTheme()
  const { isPlain, page } = frameMail({ blockImages, cidImage, html, theme })
  // Not `srcDoc`: a srcdoc page is never in quirks mode, and mail written without a doctype lays out as every other client shows it only in quirks mode.
  // The charset beats a `<meta charset>` the mail still carries from before it was decoded.
  const src = useMemo(
    () =>
      URL.createObjectURL(
        new Blob([page], { type: 'text/html;charset=utf-8' })
      ),
    [page]
  )
  useEffect(() => () => URL.revokeObjectURL(src), [src])
  useEffect(() => {
    // Images load after the first centring and push the passage down; it follows them while it is lit.
    if (height > 0 && cited?.getAnimations().length) {
      cited.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }
  }, [cited, height])
  const watch = (frame: HTMLIFrameElement | null) => {
    if (!frame) {
      return
    }
    const observer = new ResizeObserver(() => {
      const measured = frame.contentDocument?.documentElement.scrollHeight ?? 0
      frameHeights.set(id, measured)
      setHeight(measured)
    })
    const observeBody = () => {
      frame.contentDocument?.addEventListener('click', jumpWithinMail)
      const body = frame.contentDocument?.body
      if (body) {
        observer.observe(body)
      }
      const passage =
        cite &&
        frame.contentDocument &&
        citedPassage(frame.contentDocument, cite)
      if (passage) {
        passage.dataset.cited = ''
        setCited(passage)
      }
    }
    frame.addEventListener('load', observeBody)
    return () => {
      frame.removeEventListener('load', observeBody)
      observer.disconnect()
    }
  }
  return (
    <>
      <iframe
        ref={watch}
        data-mask
        title="email"
        src={src}
        sandbox="allow-same-origin allow-popups allow-popups-to-escape-sandbox"
        style={{ '--frame-height': `${height}px` } as CSSProperties}
        className={cn(
          'h-(--frame-height) w-full',
          !isPlain && 'rounded-xl bg-white'
        )}
      />
      {height === 0 && <BodySkeleton />}
    </>
  )
}

/** Gmail's "to me ▾": who else got it, which of the user's addresses it reached, and whether the sender checked out. */
const MessageDetails = ({ message }: { message: ThreadMessage }) => {
  const t = useT()
  const dates = useDates()
  const rows = [
    [
      t.compose.from,
      message.fromName
        ? `${message.fromName} <${message.fromEmail}>`
        : message.fromEmail,
    ],
    [
      t.mail.replyTo,
      message.replyTo === message.fromEmail ? null : message.replyTo,
    ],
    [t.compose.to, message.to.join(', ')],
    [t.compose.cc, message.cc.join(', ')],
    [t.mail.date, dates.format(message.receivedAt, 'PPpp')],
    [
      t.mail.authentication,
      message.auth &&
        `SPF ${message.auth.spf} · DKIM ${message.auth.dkim} · DMARC ${message.auth.dmarc}`,
    ],
  ] as const
  return (
    <Popover>
      <PopoverTrigger
        render={
          <Button
            variant="ghost-muted"
            size="xs"
            className="-ml-2 max-w-full"
          />
        }
      >
        <span data-mask className="truncate">
          {t.mail.toLine(message.to.join(', ') || t.mail.noRecipients)}
        </span>
        <HugeiconsIcon icon={ArrowDown01Icon} data-icon="inline-end" />
      </PopoverTrigger>
      <PopoverContent align="start" className="w-auto max-w-md">
        <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1.5 text-xs">
          {rows.map(
            ([label, value]) =>
              value && (
                <Fragment key={label}>
                  <dt className="text-muted-foreground">{label}</dt>
                  <dd data-mask className="wrap-break-word">
                    {value}
                  </dd>
                </Fragment>
              )
          )}
        </dl>
      </PopoverContent>
    </Popover>
  )
}

const SHORT_BODY_CHARS = 600

// A newsletter's text/plain part is often a "view in browser" stub, so HTML is measured by its own text.
const textLength = (message: ThreadMessage) =>
  (message.html
    ? message.html.replaceAll(
        /<(?<tag>style|script)[\s\S]*?<\/\k<tag>>|<[^>]+>/giu,
        ' '
      )
    : message.body
  )
    .replaceAll(/\s+/gu, ' ')
    .trim().length

/** The agent's summary over its chips; a short email keeps only the chips, since the summary would repeat it. */
const MessageInsight = ({
  analysis,
  isShort,
}: {
  analysis: NonNullable<ThreadRow['analysis']>
  isShort: boolean
}) => {
  const t = useT()
  return (
    <div
      className={cn(
        'flex flex-col gap-2',
        !isShort && 'bg-secondary/50 rounded-xl px-4 py-3'
      )}
    >
      {!isShort && (
        <p data-mask className="text-sm">
          {analysis.summary}
        </p>
      )}
      <div className="flex flex-wrap items-center gap-1.5">
        <Badge
          variant={analysis.category === 'security' ? 'destructive' : 'outline'}
        >
          {t.category[analysis.category]}
        </Badge>
        {analysis.needsReply && (
          <Badge variant="outline">{t.mail.expectsReply}</Badge>
        )}
        <ExtractedChips extracted={analysis.extracted} />
      </div>
    </div>
  )
}

const MessageSection = ({
  actions,
  analysis,
  cite,
  hasAgent,
  message,
  subject,
}: {
  actions: ThreadAction[]
  analysis: ThreadRow['analysis']
  cite?: string
  hasAgent: boolean
  message: ThreadMessage
  subject?: string
}) => {
  const t = useT()
  const dates = useDates()
  const isSpam = message.labelIds.includes('SPAM')
  const [showsImages, setShowsImages] = useState(false)
  return (
    <section className="flex flex-col gap-3 not-first:mt-6 not-first:border-t not-first:pt-8">
      {subject && (
        <h2 data-mask className="font-serif text-lg tracking-tight">
          {subject}
        </h2>
      )}
      <header className="flex flex-col items-start gap-0.5">
        <div className="flex w-full flex-wrap items-center gap-2 text-sm">
          <SenderAvatar sender={message} />
          <strong data-mask className="font-semibold">
            {message.isFromMe
              ? t.mail.you
              : (message.fromName ?? message.fromEmail)}
          </strong>
          {message.isFromMe ? (
            <Badge variant="outline">{t.mail.sent}</Badge>
          ) : (
            <span data-mask className="text-muted-foreground">
              {message.fromEmail}
            </span>
          )}
          {message.suspicion && (
            <Badge variant="outline">{t.spam.suspect}</Badge>
          )}
          {isBulk(message.bulkCount, analysis?.category) && (
            <Badge variant="outline">
              {t.bulk.badge(message.bulkCount ?? 0)}
            </Badge>
          )}
          <span className="text-muted-foreground ml-auto flex items-center gap-2 text-xs">
            <ActionNote actions={actions} />
            {dates.format(message.receivedAt, 'd MMM, HH:mm')}
          </span>
        </div>
        <MessageDetails message={message} />
      </header>
      {hasAgent && analysis && (
        <MessageInsight
          analysis={analysis}
          isShort={textLength(message) <= SHORT_BODY_CHARS}
        />
      )}
      {message.html && isSpam && !showsImages && (
        <div className="text-muted-foreground flex items-center gap-3 text-sm">
          {t.spam.imagesHidden}
          <Button
            size="xs"
            variant="secondary"
            onClick={() => {
              setShowsImages(true)
              posthog.capture('spam_images_shown')
            }}
          >
            {t.spam.showImages}
          </Button>
        </div>
      )}
      {message.html ? (
        <HtmlBody
          blockImages={isSpam && !showsImages}
          cidImage={cidSource(message)}
          cite={cite}
          html={message.html}
          id={message.id}
        />
      ) : (
        <p
          data-mask
          className="text-foreground/90 text-sm/relaxed wrap-break-word whitespace-pre-wrap"
        >
          {message.body.replaceAll(/\n\s*\n\s*\n/gu, '\n\n').trim()}
        </p>
      )}
      <MessageAttachments message={message} />
    </section>
  )
}

const MessageSkeleton = ({ hasAgent }: { hasAgent: boolean }) => (
  <section className="flex flex-col gap-3">
    <div className="flex items-center gap-2">
      <Skeleton className="size-8 rounded-full" />
      <Skeleton className="h-4 w-40" />
      <Skeleton className="ml-auto h-3 w-20" />
    </div>
    <Skeleton className="my-1 h-4 w-32" />
    {hasAgent && <Skeleton className="h-20 w-full rounded-xl" />}
    <BodySkeleton />
  </section>
)

/** Read mail before the latest email folds to one line, as in Gmail; any of them unfolds the thread. */
const CollapsedMessage = ({
  actions,
  hasShortcut,
  message,
  onExpand,
}: {
  actions: ThreadAction[]
  hasShortcut: boolean
  message: ThreadMessage
  onExpand: () => void
}) => {
  const t = useT()
  const dates = useDates()
  return (
    <button
      type="button"
      onClick={onExpand}
      className="hover:bg-accent -mx-3 flex cursor-pointer items-center gap-2 rounded-lg px-3 py-1.5 text-left text-sm"
    >
      <SenderAvatar sender={message} />
      <strong data-mask className="shrink-0 font-semibold">
        {message.isFromMe
          ? t.mail.you
          : (message.fromName ?? message.fromEmail)}
      </strong>
      <span data-mask className="text-muted-foreground min-w-0 flex-1 truncate">
        {message.snippet}
      </span>
      <ActionNote actions={actions} />
      <span className="text-muted-foreground shrink-0 text-xs">
        {dates.format(message.receivedAt, 'd MMM, HH:mm')}
      </span>
      {hasShortcut && <Kbd>;</Kbd>}
    </button>
  )
}

/** Folds once, on the first load: opening the thread marks it read, which must not fold what was unread. */
const useFolding = (thread?: { messages: { message: ThreadMessage }[] }) => {
  const [folded, setFolded] = useState<Set<string> | null>(null)
  if (thread && !folded) {
    setFolded(
      new Set(
        thread.messages
          .slice(0, -1)
          .filter(({ message }) => !message.isUnread)
          .map(({ message }) => message.id)
      )
    )
  }
  const unfold = () => setFolded(new Set())
  useHotkey(';', unfold, { enabled: !!folded?.size })
  return { folded, unfold }
}

const ThreadNotices = ({
  data,
}: {
  data: NonNullable<ReturnType<typeof useThread>['data']>
}) => {
  const t = useT()

  return (
    <>
      {riskOf(data.messages) && (
        <Alert variant="destructive">
          <AlertTitle>{t.risk.title}</AlertTitle>
          <AlertDescription data-mask>
            {riskText(t, data.messages)}
          </AlertDescription>
        </Alert>
      )}
      {data.zombieShare !== null && data.zombieShare >= 30 && (
        <p className="text-muted-foreground text-sm">
          {t.zombie.badge(data.zombieShare)}
        </p>
      )}
      {data.botSuggestion && (
        <BotSuggestionCard suggestion={data.botSuggestion} />
      )}
    </>
  )
}

// Settled together like live events, and every shown change stays until it lands (`showUntilSettled`).
const refresh = () => refetchChanged(['mail', 'reading', 'today'])

interface Shown {
  burst: string
  settle: (refetched: Promise<unknown>) => void
  subject?: string
}

/** The read each thread's opening sent: an unread from anywhere waits for it, or that read lands last and the email stays read. */
const openingReads = new Map<string, Promise<unknown>>()

const afterOpeningRead = (threadId: string) =>
  openingReads.get(threadId) ?? Promise.resolve()

const useThreadOpen = (
  threadId: string,
  thread?: { messages: { message: { isUnread: boolean } }[] }
) => {
  const queryClient = useQueryClient()
  const hasUnread = thread?.messages.some(({ message }) => message.isUnread)
  const isKeptUnread = useRef(false)
  const { mutateAsync: markRead } = useMutation(
    orpc.mail.markRead.mutationOptions({
      onMutate: () => showThreadRead(threadId),
      onSettled: (_, __, ___, settle) => settle?.(refresh()),
      onSuccess: () =>
        queryClient.invalidateQueries({ queryKey: orpc.mail.unread.key() }),
    })
  )
  useEffect(() => {
    posthog.capture('thread_opened')
    // oxlint-disable-next-line react/exhaustive-effect-dependencies -- one event per thread opened
  }, [threadId])
  useEffect(() => {
    if (hasUnread && !isKeptUnread.current) {
      openingReads.set(
        threadId,
        markRead({ threadId }).catch(() => null)
      )
    }
  }, [hasUnread, markRead, threadId])
  /** Marked unread while open: never read again on its own, and only after the read its opening sent, or that read lands last. */
  const keepUnread = (markUnread: () => void) => {
    isKeptUnread.current = true
    void afterOpeningRead(threadId).then(markUnread)
  }
  return keepUnread
}

const LEAVE_YOURSELF_MS = 15_000
interface Finished {
  subject?: string
  undo?: () => Promise<unknown>
}
/** Emails acted on under one toast, so its Undo brings back every one of them. */
const bursts = new Map<string, Finished[]>()
let burstCount = 0
let openBurst: string | undefined
const frontBurst = () => `burst-${burstCount}`
/**
 * A burst is what one click or key acts on (a stack, the picks): all its emails start in the same task. Never the
 * toast's text as its id: a later action would update an earlier toast that is closing, or that sits behind a newer
 * one with its content hidden, and no Undo would show.
 */
const joinBurst = () => {
  if (!openBurst) {
    // Only the newest burst keeps its toast. `toast.dismiss` without an id closes every toast, so the id is never empty.
    toast.dismiss(frontBurst())
    burstCount += 1
    openBurst = frontBurst()
    setTimeout(() => {
      openBurst = undefined
    }, 0)
  }
  return openBurst
}
const toInbox = (messageId: string) => client.mail.moveToInbox({ messageId })

/** The cards `archiveMessage` skips with the email, gone from Home before the server answers. */
const hideArchivedCards = (messageId: string) => {
  const threadId =
    findMessage(messageId)?.threadId ??
    queueCards.toArray.find(({ message }) => message?.id === messageId)?.message
      ?.threadId
  const ids = queueCards.toArray
    .filter(
      ({ action, message }) =>
        message?.threadId === threadId &&
        !(OUTLIVE_ARCHIVE_KINDS as readonly string[]).includes(action.kind)
    )
    .map(({ action }) => action.id)
  return showUntilSettled(() => {
    if (ids.length > 0) {
      queueCards.delete(ids)
    }
  })
}

const settleFailed = (_error: unknown, _input: unknown, shown?: Shown) => {
  if (shown && !bursts.has(shown.burst)) {
    toast.dismiss(shown.burst)
  }
  shown?.settle(refresh())
}

/** `hide` takes the email out of collections besides Mail's (Home's lists) in a transaction that settles with the thread's. */
export const useMailActions = (
  onDone?: (messageId: string) => void,
  hide?: (messageId: string) => void
) => {
  const t = useT()
  const dates = useDates()
  const queryClient = useQueryClient()
  // The press already shows its outcome, so the toast says the request is still running until the answer replaces it.
  const startBurst = () => {
    const burst = joinBurst()
    toast.loading(t.today.working, { id: burst })
    return burst
  }
  // Every action takes the thread out of the current list, so it leaves before the server answers.
  const leave = {
    onError: settleFailed,
    onMutate: ({ messageId }: { messageId: string }): Shown => {
      const found = findMessage(messageId)
      const settleThread = found ? hideThread(found.threadId) : () => null
      const settleHidden = hide
        ? showUntilSettled(() => hide(messageId))
        : () => null
      onDone?.(messageId)
      return {
        burst: startBurst(),
        settle: (refetched) => {
          settleThread(refetched)
          settleHidden(refetched)
        },
        subject: found?.subject,
      }
    },
  }
  // The burst's id folds its per-email answers into one toast, and its Undo takes back the whole burst.
  const finish = (
    message: string,
    { burst: id, settle, subject }: Shown,
    done?: {
      messageId: string
      undo: (messageId: string) => Promise<unknown>
    }
  ) => {
    settle(refresh())
    if (id !== frontBurst()) {
      return
    }
    const burst = [
      ...(bursts.get(id) ?? []),
      { subject, undo: done && (() => done.undo(done.messageId)) },
    ]
    bursts.set(id, burst)
    const named = burst.find((finished) => finished.subject)?.subject
    const forget = () => bursts.delete(id)
    toast.success(message, {
      action: done && {
        label: t.compose.undo,
        onClick: () => {
          forget()
          void runUndo(() =>
            Promise.all(burst.map(({ undo }) => undo?.()))
          ).finally(refresh)
        },
      },
      classNames: { description: 'truncate' },
      description:
        named && (burst.length > 1 ? `${named} +${burst.length - 1}` : named),
      duration: done && UNDO_TOAST_MS,
      id,
      onAutoClose: forget,
      onDismiss: forget,
    })
  }
  const leaveYourself = (link: string, id: string) => {
    toast(t.mail.unsubscribeYourself, {
      action: {
        label: t.mail.openUnsubscribePage,
        onClick: () => window.open(link, '_blank', 'noopener'),
      },
      duration: LEAVE_YOURSELF_MS,
      id,
    })
  }
  const unsubscribe = useMutation(
    orpc.mail.unsubscribe.mutationOptions({
      onError: (_, { messageId }) => toast.dismiss(messageId),
      onMutate: ({ messageId }) => {
        const shown = leave.onMutate({ messageId })
        toast.loading(t.mail.unsubscribing, { id: messageId })
        return shown
      },
      onSettled: (_, __, ___, shown) => shown?.settle(refresh()),
      onSuccess: ({ link, unsubscribed }, { messageId }) => {
        if (link) {
          leaveYourself(link, messageId)
          return
        }
        toast.success(
          unsubscribed ? t.mail.unsubscribed : t.mail.unsubscribeFailed,
          { id: messageId }
        )
      },
    })
  )
  return {
    archive: useMutation(
      orpc.mail.archive.mutationOptions({
        onError: settleFailed,
        onMutate: ({ messageId }): Shown => {
          const shown = leave.onMutate({ messageId })
          const settleCards = hideArchivedCards(messageId)
          return {
            ...shown,
            settle: (refetched) => {
              shown.settle(refetched)
              settleCards(refetched)
            },
          }
        },
        onSuccess: ({ skipped }, { messageId }, shown) =>
          finish(t.mail.archived, shown, {
            messageId,
            undo: (id) =>
              Promise.all([
                toInbox(id),
                ...skipped.map((card) => client.actions.restore({ id: card })),
              ]),
          }),
      })
    ),
    block: useMutation(
      orpc.mail.block.mutationOptions({
        ...leave,
        onSuccess: ({ botId }, { messageId }, shown) => {
          void queryClient.invalidateQueries({ queryKey: orpc.bots.key() })
          finish(t.mail.blocked, shown, {
            messageId,
            undo: async () => {
              await client.bots.delete({ id: botId })
              await toInbox(messageId)
              void queryClient.invalidateQueries({
                queryKey: orpc.bots.key(),
              })
            },
          })
        },
      })
    ),
    markRead: useMutation(
      orpc.mail.markRead.mutationOptions({
        onError: settleFailed,
        onMutate: ({ threadId }): Shown => {
          const settle = showThreadRead(threadId)
          return { burst: startBurst(), settle }
        },
        onSuccess: (_, { threadId }, shown) =>
          finish(t.mail.markedRead, shown, {
            messageId: threadId,
            undo: (id) => {
              const settle = showThreadRead(id, false)
              return client.mail
                .markUnread({ threadId: id })
                .finally(() => settle(refresh()))
            },
          }),
      })
    ),
    markUnread: useMutation(
      orpc.mail.markUnread.mutationOptions({
        onError: settleFailed,
        onMutate: ({ threadId }): Shown => {
          const settle = showThreadRead(threadId, false)
          return { burst: startBurst(), settle }
        },
        onSuccess: (_, { threadId }, shown) =>
          finish(t.mail.markedUnread, shown, {
            messageId: threadId,
            undo: (id) => {
              const settle = showThreadRead(id)
              return client.mail
                .markRead({ threadId: id })
                .finally(() => settle(refresh()))
            },
          }),
      })
    ),
    moveToInbox: useMutation(
      orpc.mail.moveToInbox.mutationOptions({
        ...leave,
        onSuccess: (_, __, shown) => finish(t.mail.backInInbox, shown),
      })
    ),
    notSpam: useMutation(
      orpc.mail.notSpam.mutationOptions({
        ...leave,
        onSuccess: (_, __, shown) => finish(t.mail.movedToInbox, shown),
      })
    ),
    pin: useMutation(
      orpc.mail.pin.mutationOptions({
        onMutate: ({ messageId, pinned }) => {
          const threadId = threadOfMessage(messageId)
          return threadId ? showThreadPinned(threadId, pinned) : undefined
        },
        onSettled: (_, __, ___, settle) => settle?.(refresh()),
      })
    ),
    reportSpam: useMutation(
      orpc.mail.reportSpam.mutationOptions({
        ...leave,
        onSuccess: (_, { messageId }, shown) =>
          finish(t.mail.reportedSpam, shown, {
            messageId,
            undo: (id) => client.mail.notSpam({ messageId: id }),
          }),
      })
    ),
    snooze: useMutation(
      orpc.mail.snooze.mutationOptions({
        ...leave,
        onSuccess: (_, { messageId, until }, shown) =>
          finish(t.snooze.until(dates.format(until, 'EEE p')), shown, {
            messageId,
            undo: (id) => client.mail.unsnooze({ messageId: id }),
          }),
      })
    ),
    trash: useMutation(
      orpc.mail.trash.mutationOptions({
        ...leave,
        onSuccess: (_, { messageId }, shown) =>
          finish(t.mail.trashed, shown, { messageId, undo: toInbox }),
      })
    ),
    unsnooze: useMutation(
      orpc.mail.unsnooze.mutationOptions({
        ...leave,
        onSuccess: (_, __, shown) => finish(t.mail.backInInbox, shown),
      })
    ),
    /** Leaving a list has no undo, so it always asks first. */
    unsubscribe: (target: { messageId: string }, sender: string) =>
      confirm({
        action: t.mail.unsubscribe,
        description: t.mail.unsubscribeHint,
        onConfirm: () =>
          unsubscribe.mutate(target, {
            onSuccess: ({ ignoresUnsubscribe }) =>
              ignoresUnsubscribe && offerBlock(t, sender, target.messageId),
          }),
        title: t.mail.unsubscribeConfirm(sender),
        variant: 'warning',
      }),
  }
}

export type Place = 'inbox' | 'spam' | 'elsewhere'

/** What `E` does: archive from the inbox, bring back from anywhere else. */
export const sweepOf = (
  actions: ReturnType<typeof useMailActions>,
  t: Messages,
  place: Place
) => {
  if (place === 'inbox') {
    return {
      action: actions.archive,
      icon: Archive02Icon,
      label: t.mail.archive,
    }
  }
  return place === 'spam'
    ? {
        action: actions.notSpam,
        icon: InboxDownloadIcon,
        label: t.mail.notSpam,
      }
    : {
        action: actions.moveToInbox,
        icon: InboxDownloadIcon,
        label: t.mail.moveToInbox,
      }
}

export type Sweep = ReturnType<typeof sweepOf>

const placeOf = (labelIds: string[], isSnoozed: boolean): Place => {
  if (isSnoozed || labelIds.includes('INBOX')) {
    return 'inbox'
  }
  return labelIds.includes('SPAM') ? 'spam' : 'elsewhere'
}

const snoozePick = createStore<{
  anchor: DOMRect
  onSnooze: (until: Date) => void
} | null>(null)

export const SnoozeMenuItems = ({
  onSnooze,
}: {
  onSnooze: (until: Date) => void
}) => {
  const t = useT()
  const dates = useDates()
  return (
    <>
      {presetTimes(SNOOZE_PRESETS, SNOOZE_OPTIONS).map(({ preset, until }) => (
        <DropdownMenuItem key={preset} onClick={() => onSnooze(until)}>
          {t.snooze[preset]}
          <DropdownMenuShortcut>
            {dates.format(until, 'EEE p')}
          </DropdownMenuShortcut>
        </DropdownMenuItem>
      ))}
      <DropdownMenuSeparator />
      <DropdownMenuItem
        onClick={(event) =>
          snoozePick.set({
            anchor: event.currentTarget.getBoundingClientRect(),
            onSnooze,
          })
        }
      >
        <HugeiconsIcon icon={Calendar03Icon} strokeWidth={2} />
        {t.compose.later.pick}
      </DropdownMenuItem>
    </>
  )
}

/** One picker for every snooze menu, mounted once: the menu that asked is gone by then, so it opens where its item was. */
export const SnoozePicker = () => {
  const t = useT()
  const asked = useSubscription(snoozePick)
  const [shown, setShown] = useState(asked)
  if (asked && asked !== shown) {
    setShown(asked)
  }
  return (
    <Popover
      open={!!asked}
      onOpenChange={(open) => !open && snoozePick.set(null)}
      onOpenChangeComplete={(open) => !open && setShown(null)}
    >
      <PopoverContent
        anchor={shown && { getBoundingClientRect: () => shown.anchor }}
        align="end"
        className="w-auto"
      >
        {shown && (
          <PickTime
            action={t.snooze.title}
            onPick={(until) => {
              snoozePick.set(null)
              shown.onSnooze(until)
            }}
          />
        )}
      </PopoverContent>
    </Popover>
  )
}

const ROW_REVEAL =
  'flex opacity-0 transition-opacity duration-150 ease-house group-hover:opacity-100'

const FADING_EDGE =
  'before:pointer-events-none before:absolute before:inset-y-0 before:right-full before:w-10 before:bg-inherit before:[mask-image:linear-gradient(to_right,transparent,black)]'

export const ROW_ACTIONS = `${ROW_REVEAL} absolute top-1.5 right-2 bg-inherit ${FADING_EDGE}`

// Keyed to its own line (`group/line`): the row's `group-hover` would light every line of a stack at once.
const LINE_ACTIONS = `flex opacity-0 transition-opacity duration-150 ease-house group-hover/line:opacity-100 relative rounded-r-md bg-secondary ${FADING_EDGE}`

// The row's facts must leave while its hover actions lie over them, or a chip half under them reads as cut ("due" of "due 14 Nov").
export const UNDER_ROW_ACTIONS =
  'transition-opacity duration-150 ease-house group-hover:opacity-0 group-has-data-popup-open:opacity-0'

export const onEach =
  (messageIds: string[], mutate: (input: { messageId: string }) => void) =>
  () => {
    for (const messageId of messageIds) {
      mutate({ messageId })
    }
  }

export const pinEach =
  (
    messageIds: string[],
    pinned: boolean,
    mutate: (input: { messageId: string; pinned: boolean }) => void
  ) =>
  () => {
    for (const messageId of messageIds) {
      mutate({ messageId, pinned })
    }
  }

/** Like iOS's verification codes: one press copies it without opening the email, and the toast takes the email away. */
export const CodeActions = ({
  actions,
  className,
  code,
  messageIds,
  onCopy,
  shortcut,
  sweep,
}: {
  actions: ReturnType<typeof useMailActions>
  className?: string
  code: string
  messageIds: string[]
  onCopy?: () => void
  shortcut?: string
  sweep: Sweep
}) => {
  const t = useT()
  const isInInbox = sweep.action === actions.archive
  return (
    <CopyButton
      text={code}
      size="xs"
      variant="secondary"
      className={className}
      aria-label={t.mail.oneTimeCode.copy}
      shortcut={shortcut}
      onClick={() => {
        onCopy?.()
        toast.success(t.mail.oneTimeCode.copied, {
          action: {
            label: isInInbox ? t.mail.archive : t.mail.trash,
            onClick: onEach(
              messageIds,
              (isInInbox ? actions.archive : actions.trash).mutate
            ),
          },
        })
      }}
    >
      <span data-mask className="font-mono text-sm tabular-nums">
        {code}
      </span>
    </CopyButton>
  )
}

/** A code is worth showing outside its email this long after it came. */
export const CODE_FRESH_MS = 15 * 60_000

export const MailRowActions = ({
  actions,
  canSnooze,
  className,
  isPinned,
  isSnoozeOpen,
  messageIds,
  onMarkUnread,
  onSnoozeOpenChange,
  reveal = 'row',
  sweep,
  thread,
}: {
  actions: ReturnType<typeof useMailActions>
  canSnooze: boolean
  className?: string
  isPinned?: boolean
  isSnoozeOpen?: boolean
  messageIds: string[]
  /** The row's email is open: its reader would read it again, so marking it unread closes it. */
  onMarkUnread?: () => void
  onSnoozeOpenChange?: (open: boolean) => void
  reveal?: 'line' | 'row'
  sweep: Sweep
  thread?: { isUnread: boolean; threadId: string }
}) => {
  const t = useT()
  const size = reveal === 'line' ? 'icon-2xs' : 'icon-sm'
  return (
    <span
      className={cn(
        reveal === 'line' ? LINE_ACTIONS : ROW_REVEAL,
        'has-data-popup-open:opacity-100',
        isSnoozeOpen && 'opacity-100',
        className
      )}
    >
      {isPinned !== undefined && (
        <IconButton
          icon={isPinned ? PinOffIcon : PinIcon}
          label={isPinned ? t.mail.unpin : t.mail.pin}
          size={size}
          variant="ghost-muted"
          onClick={pinEach(messageIds, !isPinned, actions.pin.mutate)}
        />
      )}
      <IconButton
        icon={sweep.icon}
        label={sweep.label}
        size={size}
        variant="ghost-muted"
        onClick={onEach(messageIds, sweep.action.mutate)}
      />
      {thread && (
        <IconButton
          icon={thread.isUnread ? MailOpenIcon : Mail01Icon}
          label={thread.isUnread ? t.actionKind.mark_read : t.mail.markUnread}
          size={size}
          variant="ghost-muted"
          onClick={() => {
            if (thread.isUnread) {
              actions.markRead.mutate({ threadId: thread.threadId })
              return
            }
            void afterOpeningRead(thread.threadId).then(() =>
              actions.markUnread.mutate({ threadId: thread.threadId })
            )
            onMarkUnread?.()
          }}
        />
      )}
      {canSnooze && (
        <DropdownMenu open={isSnoozeOpen} onOpenChange={onSnoozeOpenChange}>
          <DropdownMenuTrigger
            render={
              <IconButton
                icon={Clock01Icon}
                label={t.snooze.title}
                size={size}
                variant="ghost-muted"
              />
            }
          />
          <DropdownMenuContent align="end">
            <SnoozeMenuItems
              onSnooze={(until) =>
                onEach(messageIds, ({ messageId }) =>
                  actions.snooze.mutate({ messageId, until })
                )()
              }
            />
          </DropdownMenuContent>
        </DropdownMenu>
      )}
      <IconButton
        icon={Delete02Icon}
        label={t.mail.trash}
        size={size}
        variant="ghost-destructive"
        onClick={onEach(messageIds, actions.trash.mutate)}
      />
    </span>
  )
}

const DiscardItems = ({
  actions: { block, reportSpam, trash },
  labelIds,
  target,
}: {
  actions: ReturnType<typeof useMailActions>
  labelIds: string[]
  target: { messageId: string }
}) => {
  const t = useT()
  return (
    <>
      {!labelIds.includes('TRASH') && (
        <DropdownMenuItem onClick={() => trash.mutate(target)}>
          {t.mail.trash}
          <DropdownMenuShortcut>⌫</DropdownMenuShortcut>
        </DropdownMenuItem>
      )}
      {!labelIds.includes('SPAM') && (
        <DropdownMenuItem onClick={() => reportSpam.mutate(target)}>
          {t.mail.reportSpam}
          <DropdownMenuShortcut>!</DropdownMenuShortcut>
        </DropdownMenuItem>
      )}
      <DropdownMenuItem
        variant="destructive"
        onClick={() => block.mutate(target)}
      >
        {t.mail.block}
      </DropdownMenuItem>
    </>
  )
}

const settledActionsOf = (
  data: NonNullable<ReturnType<typeof useThread>['data']>,
  hasAgent: boolean
) => {
  const settled = hasAgent
    ? data.actions.filter(
        ({ status }) => status !== 'dismissed' && status !== 'pending'
      )
    : []
  return (messageId: string, isLatest: boolean) =>
    settled.filter((action) =>
      action.messageId ? action.messageId === messageId : isLatest
    )
}

const revealComposer = (node: HTMLElement | null) =>
  node?.scrollIntoView({ behavior: 'smooth', block: 'end' })

/** The card Home holds for this thread, its proposal shown under the email. */
const useThreadCard = (threadId: string) => {
  const { data: cards } = useLiveQuery((query) =>
    query.from({ card: queueCards }).orderBy(({ card }) => card.rank)
  )
  return cards.find(({ message }) => message?.threadId === threadId)
}

/** Under the last email: the reply being written, what the agent proposes for it, or a field to start one. */
const ReplyArea = ({
  card,
  composing,
  isEditingDraft,
  onComposed,
  onReply,
  onStopEditingDraft,
}: {
  card: QueueItem | undefined
  composing: Draft | null
  isEditingDraft: boolean
  onComposed: () => void
  onReply: () => void
  onStopEditingDraft: () => void
}) => {
  const t = useT()
  if (composing) {
    return (
      <section ref={revealComposer}>
        <ComposeForm draft={composing} onDone={onComposed} />
      </section>
    )
  }
  if (card) {
    return (
      <div ref={isEditingDraft ? revealComposer : undefined}>
        <CardProposal
          key={`${card.action.id}-${card.action.detail}`}
          item={card}
          isEditing={isEditingDraft}
          onEdit={onReply}
          onStopEditing={onStopEditingDraft}
        />
      </div>
    )
  }
  return (
    <Button
      variant="outline-muted"
      className="justify-start"
      onClick={onReply}
      shortcut={<Kbd>R</Kbd>}
    >
      <HugeiconsIcon
        icon={MailReply01Icon}
        strokeWidth={2}
        data-icon="inline-start"
      />
      {t.mail.writeReply}
    </Button>
  )
}

const personKeyOf = ({ fromEmail, isFromMe }: Participant) =>
  isFromMe ? '' : fromEmail.toLowerCase()

/**
 * Everyone who wrote in the thread, under its title; nothing while only one person did. A click lists them in full with
 * how many emails each wrote, then whoever only got it in To or Cc.
 */
const ThreadPeople = ({ thread }: { thread: Thread }) => {
  const t = useT()
  const mailboxes = useMailboxes()
  const messages = thread.messages
    .map(({ message }) => message)
    .filter((message) => !message.labelIds.includes('DRAFT'))
  const participants = participantsOf(messages)
  if (participants.length < 2) {
    return null
  }
  const written = Map.groupBy(messages, personKeyOf)
  const known = new Set([
    ...mailboxes.map(({ email }) => email.toLowerCase()),
    ...messages.map(({ fromEmail }) => fromEmail.toLowerCase()),
  ])
  const onlyGot = [
    ...new Set(
      messages.flatMap(({ cc, to }) =>
        [...to, ...cc].map((email) => email.toLowerCase())
      )
    ),
  ].filter((email) => !known.has(email))
  const people = [
    ...participants,
    ...onlyGot.map((fromEmail) => ({
      fromEmail,
      fromName: null,
      isFromMe: false,
    })),
  ]
  return (
    <Popover>
      <PopoverTrigger
        render={
          <Button
            variant="ghost"
            size="sm"
            className="-ml-2 max-w-full hover:[--avatar-ring:var(--color-accent)] aria-expanded:[--avatar-ring:var(--color-accent)]"
          />
        }
      >
        <ParticipantAvatars participants={participants} size="sm" />
        <span data-mask className="text-foreground truncate">
          {participantNamesOf(participants, t.mail.you)}
        </span>
      </PopoverTrigger>
      <PopoverContent align="start" padding="none" className="w-auto max-w-sm">
        <div className="p-1.5">
          <ItemGroup>
            {people.map((person) => {
              const wrote = written.get(personKeyOf(person))?.length
              return (
                <Item key={personKeyOf(person)} size="compact">
                  <ItemMedia>
                    <SenderAvatar sender={person} size="sm" />
                  </ItemMedia>
                  <ItemContent className="min-w-0">
                    <ItemTitle data-mask>
                      {person.isFromMe
                        ? t.mail.you
                        : (person.fromName ?? person.fromEmail)}
                    </ItemTitle>
                    {(person.isFromMe || person.fromName) && (
                      <ItemDescription data-mask>
                        {person.fromEmail}
                      </ItemDescription>
                    )}
                  </ItemContent>
                  {wrote !== undefined && (
                    <ItemActions>
                      <span className="text-muted-foreground text-xs tabular-nums">
                        {t.cleanup.emails(wrote)}
                      </span>
                    </ItemActions>
                  )}
                </Item>
              )
            })}
          </ItemGroup>
        </div>
      </PopoverContent>
    </Popover>
  )
}

/** The title scrolls away with the email; the bar with the close buttons and the actions stay on top. */
const ReaderHeader = ({
  children,
  isFullPage,
  note,
  onClose,
  threadId,
  title,
}: {
  children?: ReactNode
  isFullPage?: boolean
  note?: ReactNode
  onClose: () => void
  threadId?: string
  /** `null` while the email loads. */
  title: ReactNode
}) => {
  const t = useT()
  const hasOpenInNewTab = Boolean(threadId) && !isFullPage
  return (
    <header className="reader-header">
      <div data-slot="reader-pin" className="-mb-6">
        <div data-slot="reader-bar" className="flex items-center gap-2">
          <p
            aria-hidden
            data-mask
            data-slot="reader-bar-title"
            className="min-w-0 flex-1 truncate font-serif text-lg tracking-tight"
          >
            {title}
          </p>
          {threadId && hasOpenInNewTab && (
            <IconButton
              icon={LinkSquare02Icon}
              label={t.mail.openInNewTab}
              size="icon-sm"
              variant="ghost-muted"
              render={
                <Link
                  to="/mail/$threadId"
                  params={{ threadId }}
                  target="_blank"
                  aria-label={t.mail.openInNewTab}
                />
              }
            />
          )}
          <IconButton
            icon={Cancel01Icon}
            label={t.mail.close}
            shortcut={<Kbd>esc</Kbd>}
            size="icon-sm"
            variant="ghost-muted"
            onClick={onClose}
          />
        </div>
      </div>
      <div
        className={cn(
          'flex flex-col gap-1 pt-8',
          hasOpenInNewTab ? 'pr-18' : 'pr-9'
        )}
      >
        {title === null ? (
          <Skeleton className="my-1 h-6 w-3/4" />
        ) : (
          <h1
            data-mask
            data-slot="reader-title"
            className="font-serif text-2xl tracking-tight"
          >
            {title}
          </h1>
        )}
        {note && <div className="text-muted-foreground text-sm">{note}</div>}
      </div>
      {children && (
        <div
          data-slot="reader-actions"
          className="bg-background -mt-3 -mb-3 pb-3"
        >
          {children}
        </div>
      )}
    </header>
  )
}

/** `isFullPage`: the email on its own page (`/mail/$threadId`), with no link to open it in a new tab. */
export const ThreadView = ({
  cite,
  isFullPage,
  isSnoozed,
  onClose,
  onDone,
  threadId,
}: {
  cite?: Expanded['cite']
  isFullPage?: boolean
  isSnoozed: boolean
  onClose: () => void
  onDone: () => void
  threadId: string
}) => {
  const t = useT()
  const dates = useDates()
  const { user } = useMe()
  const hasAgent = useHasAgent()
  const { data } = useThread(threadId)
  const [composing, setComposing] = useState<Draft | null>(null)
  const [isEditingDraft, setIsEditingDraft] = useState(false)
  const [isSnoozeOpen, setIsSnoozeOpen] = useState(false)

  const latest = data?.messages.findLast(({ message }) => !message.isFromMe)
  const card = useThreadCard(threadId)
  const { folded, unfold } = useFolding(data)
  const scrollRef = useRef<HTMLDivElement>(null)
  const isLoaded = !!data
  // An email on its own (a card, its page) takes the arrows and space once it shows, so they scroll it rather than nothing.
  useEffect(() => {
    if (isFullPage && isLoaded) {
      scrollRef.current?.focus({ preventScroll: true })
    }
  }, [isFullPage, isLoaded])
  const keepUnread = useThreadOpen(threadId, data)
  const actions = useMailActions(onDone)
  const { pin, reportSpam, snooze, trash, unsnooze, unsubscribe } = actions

  const target = latest ? { messageId: latest.message.id } : null
  const labelIds = latest?.message.labelIds ?? []
  const sweep = sweepOf(actions, t, placeOf(labelIds, isSnoozed))
  const isPinned = isThreadPinned(data)
  const togglePin = () => target && pin.mutate({ ...target, pinned: !isPinned })
  const markUnread = () => {
    keepUnread(() => actions.markUnread.mutate({ threadId }))
    onClose()
  }
  const reply = () => {
    if (card && sendsDraft(card.action)) {
      setIsEditingDraft(true)
      return
    }
    if (latest) {
      setComposing({
        ...EMPTY_DRAFT,
        mode: 'reply',
        replyToMessageId: latest.message.id,
        subject: latest.message.subject,
        to: [latest.message.fromEmail],
      })
    }
  }
  const forward = () =>
    latest &&
    setComposing(
      forwardDraft(
        latest.message,
        `${t.compose.forwardedMessage} · ${latest.message.fromName ?? latest.message.fromEmail} · ${dates.format(latest.message.receivedAt, 'PPp')}`
      )
    )

  const keys = { enabled: !!target && !composing && !isEditingDraft }
  useHotkey('R', reply, keys)
  useHotkey('F', forward, keys)
  useHotkey('E', () => target && sweep.action.mutate(target), keys)
  useHotkey('H', () => setIsSnoozeOpen(true), keys)
  // A card's S skips it (`CardProposal`), as on Home.
  useHotkey('S', togglePin, { enabled: keys.enabled && !card })
  useHotkey('Shift+U', markUnread, keys)
  useHotkey('Backspace', () => target && trash.mutate(target), keys)
  useHotkey('Shift+1', () => target && reportSpam.mutate(target), keys)

  if (!data) {
    return (
      <article className="@container flex min-h-0 flex-1 flex-col">
        <div className="mx-auto flex w-full max-w-2xl flex-col gap-6 px-8 pb-8 max-md:px-4">
          <ReaderHeader
            title={null}
            isFullPage={isFullPage}
            threadId={threadId}
            onClose={onClose}
          >
            <div className="flex gap-2">
              <Skeleton className="h-7 w-20 rounded-lg" />
              <Skeleton className="h-7 w-24 rounded-lg" />
              <Skeleton className="h-7 w-28 rounded-lg" />
              <Skeleton className="h-7 w-16 rounded-lg" />
            </div>
          </ReaderHeader>
          <MessageSkeleton hasAgent={hasAgent} />
        </div>
      </article>
    )
  }

  const subject = data.messages[0]?.message.subject
  const actionsOf = settledActionsOf(data, hasAgent)

  return (
    <article className="flex min-h-0 flex-1 flex-col">
      <div
        ref={scrollRef}
        tabIndex={-1}
        className="@container flex-1 overflow-y-auto outline-none"
      >
        <div className="mx-auto flex max-w-2xl flex-col gap-6 px-8 pb-8 max-md:px-4">
          <ReaderHeader
            note={<ThreadPeople thread={data} />}
            title={subject}
            isFullPage={isFullPage}
            threadId={threadId}
            onClose={onClose}
          >
            {target && (
              <div className="flex flex-wrap items-center gap-2">
                <Button
                  size="sm"
                  variant="secondary"
                  disabled={sweep.action.isPending}
                  onClick={() => sweep.action.mutate(target)}
                  shortcut={<Kbd>E</Kbd>}
                  side="bottom"
                >
                  {sweep.label}
                </Button>
                {isSnoozed ? (
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => unsnooze.mutate(target)}
                  >
                    {t.snooze.unsnooze}
                  </Button>
                ) : (
                  <DropdownMenu
                    open={isSnoozeOpen}
                    onOpenChange={setIsSnoozeOpen}
                  >
                    <DropdownMenuTrigger
                      render={
                        <Button
                          size="sm"
                          variant="secondary"
                          shortcut={<Kbd>H</Kbd>}
                          side="bottom"
                        />
                      }
                    >
                      {t.snooze.title}
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <SnoozeMenuItems
                        onSnooze={(until) =>
                          snooze.mutate({ ...target, until })
                        }
                      />
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
                <DropdownMenu>
                  <DropdownMenuTrigger
                    render={<Button size="sm" variant="ghost-muted" />}
                  >
                    {t.mail.more}
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem onClick={togglePin}>
                      {isPinned ? t.mail.unpin : t.mail.pin}
                      <DropdownMenuShortcut>S</DropdownMenuShortcut>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={markUnread}>
                      {t.mail.markUnread}
                      <DropdownMenuShortcut>⇧U</DropdownMenuShortcut>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={forward}>
                      {t.mail.forward}
                      <DropdownMenuShortcut>F</DropdownMenuShortcut>
                    </DropdownMenuItem>
                    {latest?.message.listUnsubscribe && (
                      <DropdownMenuItem
                        onClick={() =>
                          unsubscribe(
                            target,
                            latest.message.fromName ?? latest.message.fromEmail
                          )
                        }
                      >
                        {t.mail.unsubscribe}
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem
                      render={
                        <a
                          href={gmailThreadUrl(user.email, threadId)}
                          target="_blank"
                          rel="noreferrer"
                          aria-label={t.mail.openInGmail}
                        />
                      }
                    >
                      {t.mail.openInGmail}
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DiscardItems
                      actions={actions}
                      labelIds={labelIds}
                      target={target}
                    />
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            )}
          </ReaderHeader>

          <ThreadNotices data={data} />

          <div className="flex flex-col gap-2">
            {data.messages.map(({ analysis, message }, index) =>
              folded?.has(message.id) ? (
                <CollapsedMessage
                  key={message.id}
                  actions={actionsOf(
                    message.id,
                    index === data.messages.length - 1
                  )}
                  hasShortcut={
                    !folded.has(data.messages[index - 1]?.message.id ?? '')
                  }
                  message={message}
                  onExpand={unfold}
                />
              ) : (
                <MessageSection
                  key={message.id}
                  actions={actionsOf(
                    message.id,
                    index === data.messages.length - 1
                  )}
                  analysis={analysis}
                  cite={cite?.messageId === message.id ? cite.text : undefined}
                  message={message}
                  hasAgent={hasAgent}
                />
              )
            )}
          </div>

          {(latest || card) && (
            <ReplyArea
              card={card}
              composing={composing}
              isEditingDraft={isEditingDraft}
              onComposed={() => setComposing(null)}
              onReply={reply}
              onStopEditingDraft={() => setIsEditingDraft(false)}
            />
          )}
        </div>
      </div>
    </article>
  )
}

interface StackEmail {
  extracted?: Parameters<typeof ExtractedChips>[0]['extracted']
  fromEmail: string
  fromName: string | null
  id: string
  receivedAt: Date
  risk?: unknown
  subject: string
  threadId: string
}

/** One email of a stack, as it was listed, whatever came after it in its thread. */
const StackedEmail = ({ email }: { email: StackEmail }) => {
  const hasAgent = useHasAgent()
  const { data } = useThread(email.threadId)
  useThreadOpen(email.threadId, data)
  const index =
    data?.messages.findIndex(({ message }) => message.id === email.id) ?? -1
  const entry = data?.messages[index]
  if (!data) {
    return <MessageSkeleton hasAgent={hasAgent} />
  }
  if (!entry) {
    return null
  }
  return (
    <MessageSection
      actions={settledActionsOf(data, hasAgent)(
        entry.message.id,
        index === data.messages.length - 1
      )}
      analysis={entry.analysis}
      hasAgent={hasAgent}
      message={entry.message}
    />
  )
}

/**
 * A whole burst, newest first, one email unfolded at a time (N / P step through them); its actions take every email in it, as the row's do.
 * `children`: actions of the place it was opened from, before the burst's own.
 */
export const StackView = ({
  children,
  emails,
  isSnoozed,
  onClose,
  onDone,
  place,
}: {
  children?: ReactNode
  emails: StackEmail[]
  isSnoozed: boolean
  onClose: () => void
  onDone: () => void
  place: Place
}) => {
  const t = useT()
  const dates = useDates()
  const actions = useMailActions(onDone)
  const [openId, setOpenId] = useState(emails[0]?.id)
  const stepEmail = (by: number) => {
    const index = emails.findIndex(({ id }) => id === openId)
    const next = emails[Math.min(emails.length - 1, Math.max(0, index + by))]
    setOpenId(next?.id)
  }
  useHotkey('N', () => stepEmail(1))
  useHotkey('P', () => stepEmail(-1))
  const [isSnoozeOpen, setIsSnoozeOpen] = useState(false)
  const [head] = emails
  const messageIds = emails.map(({ id }) => id)
  const sweep = sweepOf(actions, t, place)
  const archiveAll = onEach(messageIds, sweep.action.mutate)
  const trashAll = onEach(messageIds, actions.trash.mutate)
  useHotkey('E', archiveAll)
  useHotkey('H', () => setIsSnoozeOpen(true), { enabled: !isSnoozed })
  useHotkey('Backspace', trashAll)

  return (
    <article className="flex min-h-0 flex-1 flex-col">
      <div className="@container flex-1 overflow-y-auto">
        <div className="mx-auto flex max-w-2xl flex-col gap-6 px-8 pb-8 max-md:px-4">
          <ReaderHeader
            note={t.cleanup.emails(emails.length)}
            title={head?.fromName ?? head?.fromEmail}
            onClose={onClose}
          >
            <div className="flex flex-wrap items-center gap-2">
              {children}
              <Button
                size="sm"
                variant="secondary"
                disabled={sweep.action.isPending}
                onClick={archiveAll}
                shortcut={<Kbd>E</Kbd>}
                side="bottom"
              >
                {sweep.label}
              </Button>
              {isSnoozed ? (
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={onEach(messageIds, actions.unsnooze.mutate)}
                >
                  {t.snooze.unsnooze}
                </Button>
              ) : (
                <DropdownMenu
                  open={isSnoozeOpen}
                  onOpenChange={setIsSnoozeOpen}
                >
                  <DropdownMenuTrigger
                    render={
                      <Button
                        size="sm"
                        variant="secondary"
                        shortcut={<Kbd>H</Kbd>}
                        side="bottom"
                      />
                    }
                  >
                    {t.snooze.title}
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <SnoozeMenuItems
                      onSnooze={(until) =>
                        onEach(messageIds, ({ messageId }) =>
                          actions.snooze.mutate({ messageId, until })
                        )()
                      }
                    />
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
              <Button
                size="sm"
                variant="ghost-muted"
                onClick={trashAll}
                shortcut={<Kbd>⌫</Kbd>}
                side="bottom"
              >
                {t.mail.trash}
              </Button>
            </div>
          </ReaderHeader>
          {/* Not bled like Home's cards: in a pane as narrow as the reader they ran into its edge. */}
          <Accordion
            variant="cards"
            className="mx-0"
            value={openId ? [openId] : []}
            onValueChange={([id]) => setOpenId(id)}
          >
            {emails.map((email) => (
              <AccordionItem key={email.id} value={email.id}>
                <AccordionTrigger>
                  <SenderAvatar sender={email} size="sm" />
                  {Boolean(email.risk) && (
                    <HugeiconsIcon
                      icon={Shield01Icon}
                      strokeWidth={2}
                      aria-label={t.risk.title}
                      className="text-destructive size-3.5 shrink-0"
                    />
                  )}
                  <span
                    data-mask
                    className={cn(
                      'min-w-0 flex-1 truncate text-sm font-medium',
                      Boolean(email.risk) && 'text-destructive'
                    )}
                  >
                    {email.subject}
                  </span>
                  {email.extracted && (
                    <ExtractedChips extracted={email.extracted} size="sm" />
                  )}
                  <span className="text-muted-foreground shrink-0 text-xs tabular-nums">
                    {dates.format(
                      email.receivedAt,
                      isToday(email.receivedAt) ? 'HH:mm' : 'd MMM'
                    )}
                  </span>
                </AccordionTrigger>
                <AccordionContent>
                  <StackedEmail email={email} />
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </article>
  )
}
