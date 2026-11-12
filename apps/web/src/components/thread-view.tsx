import { BULK_THRESHOLD } from '@fewmail/shared/agent'
import { textToHtml } from '@fewmail/shared/email'
import type { Messages } from '@fewmail/shared/i18n'
import {
  Alert,
  AlertAction,
  AlertDescription,
  AlertTitle,
} from '@fewmail/ui/components/alert'
import { Badge } from '@fewmail/ui/components/badge'
import { Button } from '@fewmail/ui/components/button'
import { IconButton } from '@fewmail/ui/components/custom/icon-button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from '@fewmail/ui/components/dropdown-menu'
import { Kbd } from '@fewmail/ui/components/kbd'
import {
  Archive02Icon,
  Cancel01Icon,
  InboxDownloadIcon,
} from '@hugeicons/core-free-icons'
import { eq, useLiveQuery } from '@tanstack/react-db'
import { useHotkey } from '@tanstack/react-hotkeys'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useEffect, useState } from 'react'
import type { CSSProperties } from 'react'
import { toast } from 'sonner'

import { useDates, useT } from '~/lib/i18n'
import {
  hideThread,
  showThreadRead,
  threadOfMessage,
  threads,
} from '~/lib/mail-db'
import { gmailThreadUrl, useHasAgent, useMe } from '~/lib/me'
import { orpc } from '~/lib/orpc'

import { AddToBoardItems } from './board-entries'
import type { Draft } from './compose/compose-context'
import { EMPTY_DRAFT } from './compose/compose-context'
import { ComposeForm } from './compose/compose-form'
import { SNOOZE_PRESETS } from './compose/schedule'
import type { SnoozePreset } from './compose/schedule'
import { HandleDialog } from './handle-dialog'
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

// `overflow-wrap:anywhere` would collapse senders' table columns to one letter per line.
const FRAME_HEAD =
  '<base target="_blank"><style>html{color-scheme:light;overflow-y:hidden}body{margin:0;padding:16px;background:#fff;color:#1c1917;font:14px/1.5 system-ui,sans-serif;overflow-wrap:break-word}img{max-width:100%;height:auto}</style>'

// A frame starts empty on every open; the last measured height keeps a reopened mail from growing into place.
const frameHeights = new Map<string, number>()

/** Senders' HTML is laid out for a white page, so it keeps one. No `allow-scripts`: with it, `allow-same-origin` would hand the mail our session. */
const HtmlBody = ({ html, id }: { html: string; id: string }) => {
  const [height, setHeight] = useState(frameHeights.get(id) ?? 0)
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
      const body = frame.contentDocument?.body
      if (body) {
        observer.observe(body)
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
      srcDoc={FRAME_HEAD + html}
      sandbox="allow-same-origin allow-popups allow-popups-to-escape-sandbox"
      style={{ '--frame-height': `${height}px` } as CSSProperties}
      className="h-(--frame-height) w-full rounded-xl bg-white"
    />
  )
}

const MessageSection = ({
  analysis,
  hasAgent,
  message,
}: {
  analysis: ThreadRow['analysis']
  hasAgent: boolean
  message: ThreadMessage
}) => {
  const t = useT()
  const dates = useDates()
  return (
    <section className="flex flex-col gap-3 not-first:mt-6 not-first:border-t not-first:pt-8">
      <header className="flex flex-wrap items-center gap-2 text-sm">
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
        {message.suspicion && <Badge variant="outline">{t.spam.suspect}</Badge>}
        {(message.bulkCount ?? 0) >= BULK_THRESHOLD && (
          <Badge variant="outline">
            {t.bulk.badge(message.bulkCount ?? 0)}
          </Badge>
        )}
        <span className="text-muted-foreground ml-auto text-xs">
          {dates.format(message.receivedAt, 'd MMM, HH:mm')}
        </span>
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
  hasShortcut,
  message,
  onExpand,
}: {
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
  const queryClient = useQueryClient()
  const cancelTask = useMutation(
    orpc.tasks.cancel.mutationOptions({
      onSuccess: () =>
        queryClient.invalidateQueries({ queryKey: orpc.mail.key() }),
    })
  )

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
      {data.task && (
        <Alert>
          <AlertTitle data-mask>{t.tasks.active(data.task.goal)}</AlertTitle>
          {data.task.summary && (
            <AlertDescription data-mask>{data.task.summary}</AlertDescription>
          )}
          <AlertAction>
            <Button
              size="xs"
              variant="ghost-muted"
              onClick={() =>
                data.task && cancelTask.mutate({ id: data.task.id })
              }
            >
              {t.tasks.cancel}
            </Button>
          </AlertAction>
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

const useMarkRead = (
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
    if (hasUnread) {
      markRead({ threadId })
    }
  }, [hasUnread, markRead, threadId])
}

const LEAVE_YOURSELF_MS = 15_000

export const useMailActions = (onDone?: () => void) => {
  const t = useT()
  const dates = useDates()
  const queryClient = useQueryClient()
  const refresh = () =>
    queryClient.invalidateQueries({ queryKey: orpc.mail.key() })
  // Every action takes the thread out of the current list, so it leaves before the server answers.
  const leave = {
    onError: refresh,
    onMutate: ({ messageId }: { messageId: string }) => {
      const threadId = threadOfMessage(messageId)
      if (threadId) {
        hideThread(threadId)
      }
      onDone?.()
    },
  }
  // The id folds a burst's per-email answers into one toast.
  const finish = (message: string) => {
    toast.success(message, { id: message })
    void refresh()
  }
  const leaveYourself = (link: string) => {
    toast(t.mail.unsubscribeYourself, {
      action: {
        label: t.mail.openUnsubscribePage,
        onClick: () => window.open(link, '_blank', 'noopener'),
      },
      duration: LEAVE_YOURSELF_MS,
    })
    void refresh()
  }
  return {
    archive: useMutation(
      orpc.mail.archive.mutationOptions({
        ...leave,
        onSuccess: () => finish(t.mail.archived),
      })
    ),
    block: useMutation(
      orpc.mail.block.mutationOptions({
        ...leave,
        onSuccess: () => finish(t.mail.blocked),
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
    reportSpam: useMutation(
      orpc.mail.reportSpam.mutationOptions({
        ...leave,
        onSuccess: () => finish(t.mail.reportedSpam),
      })
    ),
    snooze: useMutation(
      orpc.mail.snooze.mutationOptions({
        ...leave,
        onSuccess: (_, { until }) =>
          finish(t.snooze.until(dates.format(until, 'EEE p'))),
      })
    ),
    trash: useMutation(
      orpc.mail.trash.mutationOptions({
        ...leave,
        onSuccess: () => finish(t.mail.trashed),
      })
    ),
    unsnooze: useMutation(
      orpc.mail.unsnooze.mutationOptions({
        ...leave,
        onSuccess: () => finish(t.snooze.unsnooze),
      })
    ),
    unsubscribe: useMutation(
      orpc.mail.unsubscribe.mutationOptions({
        ...leave,
        onSuccess: ({ link, unsubscribed }) =>
          link
            ? leaveYourself(link)
            : finish(
                unsubscribed ? t.mail.unsubscribed : t.mail.unsubscribeFailed
              ),
      })
    ),
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
  return SNOOZE_OPTIONS.map((preset) => {
    const until = SNOOZE_PRESETS[preset]()
    return (
      <DropdownMenuItem key={preset} onClick={() => onSnooze(until)}>
        {t.snooze[preset]}
        <DropdownMenuShortcut>
          {dates.format(until, 'EEE p')}
        </DropdownMenuShortcut>
      </DropdownMenuItem>
    )
  })
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
          <DropdownMenuShortcut>#</DropdownMenuShortcut>
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

const revealComposer = (node: HTMLElement | null) =>
  node?.scrollIntoView({ behavior: 'smooth', block: 'end' })

export const ThreadView = ({
  isSnoozed,
  onClose,
  onDone,
  threadId,
}: {
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
  const [isSnoozeOpen, setIsSnoozeOpen] = useState(false)
  const [isHandleOpen, setIsHandleOpen] = useState(false)

  const latest = data?.messages.findLast(({ message }) => !message.isFromMe)
  const { folded, unfold } = useFolding(data)
  useMarkRead(threadId, data)
  const actions = useMailActions(onDone)
  const { reportSpam, snooze, trash, unsnooze, unsubscribe } = actions

  const target = latest ? { messageId: latest.message.id } : null
  const labelIds = latest?.message.labelIds ?? []
  const sweep = sweepOf(actions, t, placeOf(labelIds, isSnoozed))
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
  useHotkey('Shift+3', () => target && trash.mutate(target), keys)
  useHotkey('Shift+1', () => target && reportSpam.mutate(target), keys)

  if (!data) {
    return null
  }

  const subject = data.messages[0]?.message.subject

  return (
    <article className="flex min-h-0 flex-1 flex-col">
      <div className="flex-1 overflow-y-auto">
        <div className="mx-auto flex max-w-2xl flex-col gap-6 px-8 py-8">
          <div className="flex flex-col gap-3">
            <div className="flex items-start gap-2">
              <h1
                data-mask
                className="flex-1 font-serif text-2xl tracking-tight"
              >
                {subject}
              </h1>
              <IconButton
                icon={Cancel01Icon}
                label={t.mail.close}
                shortcut={<Kbd>esc</Kbd>}
                size="icon-sm"
                variant="ghost-muted"
                onClick={onClose}
              />
            </div>
            {target && (
              <div className="flex flex-wrap items-center gap-2">
                <Button size="sm" onClick={reply}>
                  {t.mail.reply} <Kbd>R</Kbd>
                </Button>
                <Button
                  size="sm"
                  variant="secondary"
                  disabled={sweep.action.isPending}
                  onClick={() => sweep.action.mutate(target)}
                >
                  {sweep.label} <Kbd>E</Kbd>
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
                      render={<Button size="sm" variant="secondary" />}
                    >
                      {t.snooze.title} <Kbd>H</Kbd>
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
                    {hasAgent && !data.task && (
                      <DropdownMenuItem onClick={() => setIsHandleOpen(true)}>
                        {t.tasks.handle}
                      </DropdownMenuItem>
                    )}
                    <AddToBoardItems messageId={target.messageId} />
                    <DropdownMenuItem onClick={forward}>
                      {t.mail.forward}
                      <DropdownMenuShortcut>F</DropdownMenuShortcut>
                    </DropdownMenuItem>
                    {latest?.message.listUnsubscribe && (
                      <DropdownMenuItem
                        onClick={() => unsubscribe.mutate(target)}
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
          </div>

          <ThreadNotices data={data} />
          {hasAgent && data.actions.length > 0 && (
            <ul className="text-muted-foreground flex flex-col gap-1 text-sm">
              {data.actions.map((action) => (
                <li key={action.id}>
                  <span className="text-foreground">{action.title}</span> ·{' '}
                  {t.actionStatus[action.status]}
                  {action.autonomous && ` ${t.byRule}`}
                </li>
              ))}
            </ul>
          )}

          <div className="flex flex-col gap-2">
            {data.messages.map(({ analysis, message }, index) =>
              folded?.has(message.id) ? (
                <CollapsedMessage
                  key={message.id}
                  hasShortcut={
                    !folded.has(data.messages[index - 1]?.message.id ?? '')
                  }
                  message={message}
                  onExpand={unfold}
                />
              ) : (
                <MessageSection
                  key={message.id}
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
      {latest && (
        <HandleDialog
          messageId={latest.message.id}
          open={isHandleOpen}
          onOpenChange={setIsHandleOpen}
        />
      )}
    </article>
  )
}
