import { isBulk } from '@fewmail/shared/agent'
import { textToHtml } from '@fewmail/shared/email'
import type { Messages } from '@fewmail/shared/i18n'
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
import { ButtonGroup, ButtonGroupSeparator } from '@fewmail/ui/components/group'
import { Kbd } from '@fewmail/ui/components/kbd'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@fewmail/ui/components/popover'
import { copy } from '@fewmail/ui/lib/copy'
import { cn } from '@fewmail/ui/lib/utils'
import {
  Archive02Icon,
  ArrowDown01Icon,
  ArrowExpand01Icon,
  ArrowShrink01Icon,
  Cancel01Icon,
  Clock01Icon,
  Delete02Icon,
  InboxDownloadIcon,
  PinIcon,
  PinOffIcon,
} from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { eq, useLiveQuery } from '@tanstack/react-db'
import { useHotkey } from '@tanstack/react-hotkeys'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import { Fragment, useEffect, useState } from 'react'
import type { CSSProperties, ReactNode } from 'react'
import { toast } from 'sonner'

import { useDates, useT } from '~/lib/i18n'
import {
  hideThread,
  showThreadPinned,
  showThreadRead,
  threadOfMessage,
  threads,
} from '~/lib/mail-db'
import { gmailThreadUrl, useHasAgent, useMe } from '~/lib/me'
import { offerBlock } from '~/lib/offer-block'
import { client, orpc } from '~/lib/orpc'
import { posthog } from '~/lib/posthog'

import { AddToBoardItems } from './board-entries'
import type { Draft } from './compose/compose-context'
import { EMPTY_DRAFT } from './compose/compose-context'
import { ComposeForm } from './compose/compose-form'
import { presetTimes, SNOOZE_PRESETS } from './compose/schedule'
import type { SnoozePreset } from './compose/schedule'
import { confirm } from './confirm-dialog'
import { ExtractedChips, ImportanceDot } from './mail-meta'
import { PersonPanel } from './person-panel'

type ThreadMessage = NonNullable<
  ReturnType<typeof useThread>['data']
>['messages'][number]['message']

export const useThread = (threadId: string | undefined) =>
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
    message.risk.imitates ??
      message.fromEmail.split('@')[1] ??
      message.fromEmail
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
            `${action.title} · ${action.autonomous ? t.byRule : t.actionStatus[action.status]}`
        )
        .join(', ')}
    </span>
  )
}

// `overflow-wrap:anywhere` would collapse senders' table columns to one letter per line.
const FRAME_HEAD =
  '<base target="_blank"><style>html{color-scheme:light;overflow-y:hidden}body{margin:0;padding:16px;background:#fff;color:#1c1917;font:14px/1.5 system-ui,sans-serif;overflow-wrap:break-word}img{max-width:100%;height:auto}[data-cited]{border-radius:4px;animation:cited 3s cubic-bezier(.32,.72,0,1)}@keyframes cited{0%,50%{box-shadow:0 0 0 4px oklch(.55 .15 38/.18),inset 0 0 0 100vmax oklch(.55 .15 38/.18)}to{box-shadow:0 0 0 4px transparent,inset 0 0 0 100vmax transparent}}</style>'

const OPENABLE_PROTOCOLS = new Set(['http:', 'https:', 'mailto:', 'tel:'])
// A plain `#id` resolves against our page (srcdoc borrows the parent's base) and loads Fewmail inside the frame.
const IN_MAIL = 'about:srcdoc#'

const inMailTarget = (mail: Document, id: string) =>
  mail.querySelector(`[id="${CSS.escape(id)}"], a[name="${CSS.escape(id)}"]`)

/** A link's own `target` beats our `<base>`, and a page opened inside the frame refuses to be framed: every link leaves for a new tab, jumps within the mail, or stops being a link. */
const pinLinks = (html: string) => {
  const mail = new DOMParser().parseFromString(FRAME_HEAD + html, 'text/html')
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
  return mail.documentElement.outerHTML
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

// A frame starts empty on every open; the last measured height keeps a reopened mail from growing into place.
const frameHeights = new Map<string, number>()

/**
 * Senders' HTML is laid out for a white page, so it keeps one. No `allow-scripts`: with it, `allow-same-origin` would hand the mail our session.
 * With `cite`, the passage it came from is centred and lit for a moment.
 */
export const HtmlBody = ({
  cite,
  html,
  id,
}: {
  cite?: string
  html: string
  id: string
}) => {
  const [height, setHeight] = useState(frameHeights.get(id) ?? 0)
  const [cited, setCited] = useState<HTMLElement>()
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
    <iframe
      ref={watch}
      data-mask
      title="email"
      srcDoc={pinLinks(html)}
      sandbox="allow-same-origin allow-popups allow-popups-to-escape-sandbox"
      style={{ '--frame-height': `${height}px` } as CSSProperties}
      className="h-(--frame-height) w-full rounded-xl bg-white"
    />
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
    [t.compose.subject, message.subject],
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

const MessageSection = ({
  actions,
  analysis,
  hasAgent,
  message,
  subject,
}: {
  actions: ThreadAction[]
  analysis: ThreadRow['analysis']
  hasAgent: boolean
  message: ThreadMessage
  subject?: string
}) => {
  const t = useT()
  const dates = useDates()
  return (
    <section className="flex flex-col gap-3 not-first:mt-6 not-first:border-t not-first:pt-8">
      {subject && (
        <h2 data-mask className="font-serif text-lg tracking-tight">
          {subject}
        </h2>
      )}
      <header className="flex flex-col items-start gap-0.5">
        <div className="flex w-full flex-wrap items-center gap-2 text-sm">
          {hasAgent && analysis && (
            <ImportanceDot
              importance={analysis.importance}
              reason={analysis.reason}
            />
          )}
          <strong data-mask className="font-semibold">
            {message.isFromMe
              ? t.mail.you
              : (message.fromName ?? message.fromEmail)}
          </strong>
          {!message.isFromMe && (
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
        <div className="bg-secondary/50 flex flex-col gap-2 rounded-xl px-4 py-3">
          <p data-mask className="text-sm">
            {analysis.summary}
          </p>
          <div className="flex flex-wrap items-center gap-1.5">
            <Badge
              variant={
                analysis.category === 'security' ? 'destructive' : 'outline'
              }
            >
              {t.category[analysis.category]}
            </Badge>
            {analysis.needsReply && (
              <Badge variant="outline">{t.mail.expectsReply}</Badge>
            )}
            <ExtractedChips extracted={analysis.extracted} />
          </div>
        </div>
      )}
      {message.html ? (
        <HtmlBody html={message.html} id={message.id} />
      ) : (
        <p
          data-mask
          className="text-foreground/90 text-sm/relaxed wrap-break-word whitespace-pre-wrap"
        >
          {message.body.replaceAll(/\n\s*\n\s*\n/gu, '\n\n').trim()}
        </p>
      )}
    </section>
  )
}

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
    </>
  )
}

const useThreadOpen = (
  threadId: string,
  thread?: { messages: { message: { isUnread: boolean } }[] }
) => {
  const queryClient = useQueryClient()
  const hasUnread = thread?.messages.some(({ message }) => message.isUnread)
  const { mutate: markRead } = useMutation(
    orpc.mail.markRead.mutationOptions({
      onMutate: () => showThreadRead(threadId),
      onSuccess: () =>
        queryClient.invalidateQueries({ queryKey: orpc.mail.unread.key() }),
    })
  )
  useEffect(() => {
    posthog.capture('thread_opened')
    // oxlint-disable-next-line react/exhaustive-effect-dependencies -- one event per thread opened
  }, [threadId])
  useEffect(() => {
    if (hasUnread) {
      markRead({ threadId })
    }
  }, [hasUnread, markRead, threadId])
}

const LEAVE_YOURSELF_MS = 15_000
/** Emails acted on under one toast, so its Undo brings back every one of them. */
const bursts = new Map<string, string[]>()
const toInbox = (messageId: string) => client.mail.moveToInbox({ messageId })

export const useMailActions = (onDone?: (messageId: string) => void) => {
  const t = useT()
  const dates = useDates()
  const queryClient = useQueryClient()
  const refresh = () =>
    Promise.all([
      queryClient.invalidateQueries({ queryKey: orpc.mail.key() }),
      queryClient.invalidateQueries({ queryKey: orpc.today.key() }),
    ])
  // Every action takes the thread out of the current list, so it leaves before the server answers.
  const leave = {
    onError: refresh,
    onMutate: ({ messageId }: { messageId: string }) => {
      const threadId = threadOfMessage(messageId)
      if (threadId) {
        hideThread(threadId)
      }
      onDone?.(messageId)
    },
  }
  // The id folds a burst's per-email answers into one toast, and its Undo takes back the whole burst.
  const finish = (
    message: string,
    messageId?: string,
    undo?: (messageId: string) => Promise<unknown>
  ) => {
    void refresh()
    if (!messageId || !undo) {
      toast.success(message, { id: message })
      return
    }
    const burst = [...(bursts.get(message) ?? []), messageId]
    bursts.set(message, burst)
    toast.success(message, {
      action: {
        label: t.compose.undo,
        onClick: () => {
          bursts.delete(message)
          void Promise.all(burst.map(undo)).finally(refresh)
        },
      },
      id: message,
      onAutoClose: () => bursts.delete(message),
      onDismiss: () => bursts.delete(message),
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
    void refresh()
  }
  const unsubscribe = useMutation(
    orpc.mail.unsubscribe.mutationOptions({
      onError: (_, { messageId }) => {
        toast.dismiss(messageId)
        void refresh()
      },
      onMutate: ({ messageId }) => {
        leave.onMutate({ messageId })
        toast.loading(t.mail.unsubscribing, { id: messageId })
      },
      onSuccess: ({ link, unsubscribed }, { messageId }) => {
        if (link) {
          leaveYourself(link, messageId)
          return
        }
        void refresh()
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
        ...leave,
        onSuccess: (_, { messageId }) =>
          finish(t.mail.archived, messageId, toInbox),
      })
    ),
    block: useMutation(
      orpc.mail.block.mutationOptions({
        ...leave,
        onSuccess: ({ ruleId }, { messageId }) =>
          finish(t.mail.blocked, messageId, async () => {
            await client.rules.delete({ id: ruleId })
            await toInbox(messageId)
            void queryClient.invalidateQueries({
              queryKey: orpc.rules.key(),
            })
          }),
      })
    ),
    markRead: useMutation(
      orpc.mail.markRead.mutationOptions({
        onError: refresh,
        onMutate: ({ threadId }) => showThreadRead(threadId),
        onSuccess: (_, { threadId }) =>
          finish(t.mail.markedRead, threadId, (id) => {
            showThreadRead(id, false)
            return client.mail.markUnread({ threadId: id })
          }),
      })
    ),
    moveToInbox: useMutation(
      orpc.mail.moveToInbox.mutationOptions({
        ...leave,
        onSuccess: () => finish(t.mail.backInInbox),
      })
    ),
    notSpam: useMutation(
      orpc.mail.notSpam.mutationOptions({
        ...leave,
        onSuccess: () => finish(t.mail.movedToInbox),
      })
    ),
    pin: useMutation(
      orpc.mail.pin.mutationOptions({
        onMutate: ({ messageId, pinned }) => {
          const threadId = threadOfMessage(messageId)
          if (threadId) {
            showThreadPinned(threadId, pinned)
          }
        },
        onSettled: refresh,
      })
    ),
    reportSpam: useMutation(
      orpc.mail.reportSpam.mutationOptions({
        ...leave,
        onSuccess: (_, { messageId }) =>
          finish(t.mail.reportedSpam, messageId, (id) =>
            client.mail.notSpam({ messageId: id })
          ),
      })
    ),
    snooze: useMutation(
      orpc.mail.snooze.mutationOptions({
        ...leave,
        onSuccess: (_, { messageId, until }) =>
          finish(
            t.snooze.until(dates.format(until, 'EEE p')),
            messageId,
            (id) => client.mail.unsnooze({ messageId: id })
          ),
      })
    ),
    trash: useMutation(
      orpc.mail.trash.mutationOptions({
        ...leave,
        onSuccess: (_, { messageId }) =>
          finish(t.mail.trashed, messageId, toInbox),
      })
    ),
    unsnooze: useMutation(
      orpc.mail.unsnooze.mutationOptions({
        ...leave,
        onSuccess: () => finish(t.mail.backInInbox),
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

export const SnoozeMenuItems = ({
  onSnooze,
}: {
  onSnooze: (until: Date) => void
}) => {
  const t = useT()
  const dates = useDates()
  return presetTimes(SNOOZE_PRESETS, SNOOZE_OPTIONS).map(
    ({ preset, until }) => (
      <DropdownMenuItem key={preset} onClick={() => onSnooze(until)}>
        {t.snooze[preset]}
        <DropdownMenuShortcut>
          {dates.format(until, 'EEE p')}
        </DropdownMenuShortcut>
      </DropdownMenuItem>
    )
  )
}

const ROW_REVEAL =
  'flex opacity-0 transition-opacity duration-150 ease-house group-hover:opacity-100'

export const ROW_ACTIONS = `${ROW_REVEAL} absolute top-1.5 right-4 bg-inherit before:pointer-events-none before:absolute before:inset-y-0 before:right-full before:w-10 before:bg-inherit before:[mask-image:linear-gradient(to_right,transparent,black)]`

// The meta and the actions share one cell, so the cell is always as wide as the actions and hovering never shifts the row.
// The actions must stay last and `relative`: the faded meta (opacity < 1) paints above unpositioned siblings and would swallow their clicks.
export const ROW_SWAP =
  'grid items-center justify-items-end *:[grid-area:1/1] *:transition-opacity *:duration-150 *:ease-house *:last:relative'

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

/** Like iOS's verification codes: copied without opening the email, then the email goes away in the same click. */
export const CodeActions = ({
  actions,
  className,
  code,
  messageIds,
  sweep,
}: {
  actions: ReturnType<typeof useMailActions>
  className?: string
  code: string
  messageIds: string[]
  sweep: Sweep
}) => {
  const t = useT()
  const copyThen = (mutate: (input: { messageId: string }) => void) => () => {
    void copy(code)
    onEach(messageIds, mutate)()
  }
  return (
    <ButtonGroup className={className}>
      <CopyButton
        text={code}
        size="xs"
        variant="outline"
        aria-label={t.mail.oneTimeCode.copy}
      >
        <span data-mask className="font-mono tracking-wider tabular-nums">
          {code}
        </span>
      </CopyButton>
      <ButtonGroupSeparator />
      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <Button size="icon-xs" variant="outline" aria-label={t.mail.more} />
          }
        >
          <HugeiconsIcon icon={ArrowDown01Icon} strokeWidth={2} />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {sweep.action === actions.archive && (
            <DropdownMenuItem onClick={copyThen(actions.archive.mutate)}>
              <HugeiconsIcon icon={sweep.icon} strokeWidth={2} />
              {t.mail.oneTimeCode.archive}
            </DropdownMenuItem>
          )}
          <DropdownMenuItem
            variant="destructive"
            onClick={copyThen(actions.trash.mutate)}
          >
            <HugeiconsIcon icon={Delete02Icon} strokeWidth={2} />
            {t.mail.oneTimeCode.trash}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </ButtonGroup>
  )
}

export const MailRowActions = ({
  actions,
  canSnooze,
  className,
  isPinned,
  isSnoozeOpen,
  messageIds,
  onSnoozeOpenChange,
  sweep,
}: {
  actions: ReturnType<typeof useMailActions>
  canSnooze: boolean
  className?: string
  isPinned?: boolean
  isSnoozeOpen?: boolean
  messageIds: string[]
  onSnoozeOpenChange?: (open: boolean) => void
  sweep: Sweep
}) => {
  const t = useT()
  return (
    <span
      className={cn(
        ROW_REVEAL,
        'has-data-popup-open:opacity-100',
        isSnoozeOpen && 'opacity-100',
        className
      )}
    >
      {isPinned !== undefined && (
        <IconButton
          icon={isPinned ? PinOffIcon : PinIcon}
          label={isPinned ? t.mail.unpin : t.mail.pin}
          size="icon-sm"
          variant="ghost-muted"
          onClick={pinEach(messageIds, !isPinned, actions.pin.mutate)}
        />
      )}
      <IconButton
        icon={sweep.icon}
        label={sweep.label}
        size="icon-sm"
        variant="ghost-muted"
        onClick={onEach(messageIds, sweep.action.mutate)}
      />
      {canSnooze && (
        <DropdownMenu open={isSnoozeOpen} onOpenChange={onSnoozeOpenChange}>
          <DropdownMenuTrigger
            render={
              <IconButton
                icon={Clock01Icon}
                label={t.snooze.title}
                size="icon-sm"
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
        size="icon-sm"
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

/** Sticks to the top of the reader and shrinks as the email scrolls under it. */
const ReaderHeader = ({
  children,
  isFullPage,
  note,
  onClose,
  onOpenFullPage,
  title,
}: {
  children?: ReactNode
  isFullPage?: boolean
  note?: ReactNode
  onClose: () => void
  onOpenFullPage?: () => void
  title: ReactNode
}) => {
  const t = useT()
  return (
    <header className="shrink-on-scroll bg-background sticky top-0 z-10 -mb-3 flex flex-col">
      <div className="flex items-start gap-2">
        <div className="flex flex-1 flex-col gap-1">
          <h1 data-mask className="font-serif text-2xl tracking-tight">
            {title}
          </h1>
          {note && <p className="text-muted-foreground text-sm">{note}</p>}
        </div>
        {onOpenFullPage && (
          <IconButton
            icon={ArrowExpand01Icon}
            label={t.mail.openFullPage}
            shortcut={<Kbd>⇧O</Kbd>}
            size="icon-sm"
            variant="ghost-muted"
            onClick={onOpenFullPage}
          />
        )}
        <IconButton
          icon={isFullPage ? ArrowShrink01Icon : Cancel01Icon}
          label={isFullPage ? t.mail.collapseFullPage : t.mail.close}
          shortcut={<Kbd>esc</Kbd>}
          size="icon-sm"
          variant="ghost-muted"
          onClick={onClose}
        />
      </div>
      {children}
    </header>
  )
}

/** `canOpenFullPage`: a reader beside a list offers the email on its own page (`/mail/$threadId`, ⇧O), where `isFullPage` turns its ✕ into a collapse. */
export const ThreadView = ({
  canOpenFullPage = false,
  isFullPage,
  isSnoozed,
  onClose,
  onDone,
  threadId,
}: {
  canOpenFullPage?: boolean
  isFullPage?: boolean
  isSnoozed: boolean
  onClose: () => void
  onDone: () => void
  threadId: string
}) => {
  const t = useT()
  const navigate = useNavigate()
  const openFullPage = () =>
    navigate({ params: { threadId }, to: '/mail/$threadId' })
  useHotkey('Shift+O', openFullPage, { enabled: canOpenFullPage })
  const dates = useDates()
  const { user } = useMe()
  const hasAgent = useHasAgent()
  const { data } = useThread(threadId)
  const [composing, setComposing] = useState<Draft | null>(null)
  const [isSnoozeOpen, setIsSnoozeOpen] = useState(false)

  const latest = data?.messages.findLast(({ message }) => !message.isFromMe)
  const { folded, unfold } = useFolding(data)
  useThreadOpen(threadId, data)
  const actions = useMailActions(onDone)
  const { pin, reportSpam, snooze, trash, unsnooze, unsubscribe } = actions

  const target = latest ? { messageId: latest.message.id } : null
  const labelIds = latest?.message.labelIds ?? []
  const sweep = sweepOf(actions, t, placeOf(labelIds, isSnoozed))
  const isPinned = isThreadPinned(data)
  const togglePin = () => target && pin.mutate({ ...target, pinned: !isPinned })
  const reply = () =>
    latest &&
    setComposing({
      ...EMPTY_DRAFT,
      mode: 'reply',
      replyToMessageId: latest.message.id,
      subject: latest.message.subject,
      to: [latest.message.fromEmail],
    })
  const forward = () =>
    latest &&
    setComposing(
      forwardDraft(
        latest.message,
        `${t.compose.forwardedMessage} · ${latest.message.fromName ?? latest.message.fromEmail} · ${dates.format(latest.message.receivedAt, 'PPp')}`
      )
    )

  const keys = { enabled: !!target && !composing }
  useHotkey('R', reply, keys)
  useHotkey('F', forward, keys)
  useHotkey('E', () => target && sweep.action.mutate(target), keys)
  useHotkey('H', () => setIsSnoozeOpen(true), keys)
  useHotkey('S', togglePin, keys)
  useHotkey('Backspace', () => target && trash.mutate(target), keys)
  useHotkey('Shift+1', () => target && reportSpam.mutate(target), keys)

  if (!data) {
    return null
  }

  const subject = data.messages[0]?.message.subject
  const actionsOf = settledActionsOf(data, hasAgent)

  return (
    <article className="flex min-h-0 flex-1 flex-col">
      <div className="flex-1 overflow-y-auto">
        <div className="mx-auto flex max-w-2xl flex-col gap-6 px-8 pb-8">
          <ReaderHeader
            title={subject}
            isFullPage={isFullPage}
            onClose={onClose}
            onOpenFullPage={canOpenFullPage ? openFullPage : undefined}
          >
            {target && (
              <div className="flex flex-wrap items-center gap-2">
                <Button size="sm" onClick={reply} shortcut={<Kbd>R</Kbd>}>
                  {t.mail.reply}
                </Button>
                <Button
                  size="sm"
                  variant="secondary"
                  disabled={sweep.action.isPending}
                  onClick={() => sweep.action.mutate(target)}
                  shortcut={<Kbd>E</Kbd>}
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
                    <AddToBoardItems messageId={target.messageId} />
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
                  message={message}
                  hasAgent={hasAgent}
                />
              )
            )}
          </div>

          {hasAgent && latest && (
            <PersonPanel email={latest.message.fromEmail} threadId={threadId} />
          )}

          {composing && (
            <section
              ref={revealComposer}
              className="bg-popover ring-foreground/6 rounded-2xl p-4 shadow-sm ring"
            >
              <ComposeForm
                draft={composing}
                onDone={() => setComposing(null)}
              />
            </section>
          )}
        </div>
      </div>
    </article>
  )
}

interface StackEmail {
  fromEmail: string
  fromName: string | null
  id: string
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
  if (!data || !entry) {
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
      subject={entry.message.subject}
    />
  )
}

/** A whole burst read at once, newest first; its actions take every email in it, as the row's do. */
export const StackView = ({
  emails,
  isSnoozed,
  onClose,
  onDone,
  place,
}: {
  emails: StackEmail[]
  isSnoozed: boolean
  onClose: () => void
  onDone: () => void
  place: Place
}) => {
  const t = useT()
  const actions = useMailActions(onDone)
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
      <div className="flex-1 overflow-y-auto">
        <div className="mx-auto flex max-w-2xl flex-col gap-6 px-8 pb-8">
          <ReaderHeader
            note={t.cleanup.emails(emails.length)}
            title={head?.fromName ?? head?.fromEmail}
            onClose={onClose}
          >
            <div className="flex flex-wrap items-center gap-2">
              <Button
                size="sm"
                variant="secondary"
                disabled={sweep.action.isPending}
                onClick={archiveAll}
                shortcut={<Kbd>E</Kbd>}
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
              >
                {t.mail.trash}
              </Button>
            </div>
          </ReaderHeader>
          <div className="flex flex-col gap-2">
            {emails.map((email) => (
              <StackedEmail key={email.id} email={email} />
            ))}
          </div>
        </div>
      </div>
    </article>
  )
}
