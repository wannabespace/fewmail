import { textToHtml } from '@fewmail/shared/email'
import { Badge } from '@fewmail/ui/components/badge'
import { Button } from '@fewmail/ui/components/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from '@fewmail/ui/components/dropdown-menu'
import { Kbd } from '@fewmail/ui/components/kbd'
import { useHotkey } from '@tanstack/react-hotkeys'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { toast } from 'sonner'

import { useDates, useT } from '~/lib/i18n'
import { gmailThreadUrl, useHasAgent, useMe } from '~/lib/me'
import { orpc } from '~/lib/orpc'

import type { Draft } from './compose/compose-context'
import { EMPTY_DRAFT } from './compose/compose-context'
import { ComposeForm } from './compose/compose-form'
import { SNOOZE_PRESETS } from './compose/schedule'
import type { SnoozePreset } from './compose/schedule'
import { ExtractedChips, ImportanceDot } from './mail-meta'

type ThreadMessage = NonNullable<
  ReturnType<typeof useThread>['data']
>['messages'][number]['message']

const useThread = (threadId: string) =>
  useQuery(orpc.mail.thread.queryOptions({ input: { threadId } }))

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

export const ThreadView = ({
  isSnoozed,
  onDone,
  threadId,
}: {
  isSnoozed: boolean
  onDone: () => void
  threadId: string
}) => {
  const t = useT()
  const dates = useDates()
  const { user } = useMe()
  const hasAgent = useHasAgent()
  const queryClient = useQueryClient()
  const { data } = useThread(threadId)
  const [composing, setComposing] = useState<Draft | null>(null)
  const [isSnoozeOpen, setIsSnoozeOpen] = useState(false)

  const latest = data?.messages.findLast(({ message }) => !message.isFromMe)
  const finish = (message: string) => {
    toast.success(message)
    void queryClient.invalidateQueries({ queryKey: orpc.mail.key() })
    onDone()
  }
  const archive = useMutation(
    orpc.mail.archive.mutationOptions({
      onSuccess: () => finish(t.mail.archived),
    })
  )
  const trash = useMutation(
    orpc.mail.trash.mutationOptions({ onSuccess: () => finish(t.mail.trashed) })
  )
  const block = useMutation(
    orpc.mail.block.mutationOptions({ onSuccess: () => finish(t.mail.blocked) })
  )
  const snooze = useMutation(
    orpc.mail.snooze.mutationOptions({
      onSuccess: (_, { until }) =>
        finish(t.snooze.until(dates.format(until, 'EEE p'))),
    })
  )
  const unsnooze = useMutation(
    orpc.mail.unsnooze.mutationOptions({
      onSuccess: () => finish(t.snooze.unsnooze),
    })
  )
  const unsubscribe = useMutation(
    orpc.mail.unsubscribe.mutationOptions({
      onSuccess: ({ unsubscribed }) =>
        finish(unsubscribed ? t.mail.unsubscribed : t.mail.unsubscribeFailed),
    })
  )

  const target = latest ? { messageId: latest.message.id } : null
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
  useHotkey('E', () => target && archive.mutate(target), keys)
  useHotkey('H', () => setIsSnoozeOpen(true), keys)
  useHotkey('Shift+3', () => target && trash.mutate(target), keys)

  if (!data) {
    return null
  }

  const subject = data.messages[0]?.message.subject

  return (
    <article className="flex min-h-0 flex-1 flex-col">
      <div className="flex-1 overflow-y-auto">
        <div className="mx-auto flex max-w-2xl flex-col gap-6 px-8 py-8">
          <div className="flex flex-col gap-3">
            <h1 data-mask className="font-serif text-2xl tracking-tight">
              {subject}
            </h1>
            {target && (
              <div className="flex flex-wrap items-center gap-2">
                <Button size="sm" onClick={reply}>
                  {t.mail.reply} <Kbd>R</Kbd>
                </Button>
                <Button
                  size="sm"
                  variant="secondary"
                  disabled={archive.isPending}
                  onClick={() => archive.mutate(target)}
                >
                  {t.mail.archive} <Kbd>E</Kbd>
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
                      {SNOOZE_OPTIONS.map((preset) => {
                        const until = SNOOZE_PRESETS[preset]()
                        return (
                          <DropdownMenuItem
                            key={preset}
                            onClick={() => snooze.mutate({ ...target, until })}
                          >
                            {t.snooze[preset]}
                            <DropdownMenuShortcut>
                              {dates.format(until, 'EEE p')}
                            </DropdownMenuShortcut>
                          </DropdownMenuItem>
                        )
                      })}
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
                    <DropdownMenuItem onClick={() => trash.mutate(target)}>
                      {t.mail.trash}
                      <DropdownMenuShortcut>#</DropdownMenuShortcut>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      variant="destructive"
                      onClick={() => block.mutate(target)}
                    >
                      {t.mail.block}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            )}
          </div>

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

          {data.messages.map(({ analysis, message }) => (
            <section key={message.id} className="flex flex-col gap-3">
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
                    <Badge variant="outline">
                      {t.category[analysis.category]}
                    </Badge>
                    {analysis.needsReply && (
                      <Badge variant="outline">{t.mail.expectsReply}</Badge>
                    )}
                    <ExtractedChips extracted={analysis.extracted} />
                  </div>
                </div>
              )}
              <p
                data-mask
                className="text-foreground/90 text-sm/relaxed wrap-break-word whitespace-pre-wrap"
              >
                {message.body}
              </p>
            </section>
          ))}

          {composing && (
            <section className="bg-popover ring-foreground/6 rounded-2xl p-4 shadow-sm ring">
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
