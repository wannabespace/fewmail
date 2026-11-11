import type { RouterOutputs } from '@fewmail/api/router'
import { textToHtml } from '@fewmail/shared/email'
import { Button } from '@fewmail/ui/components/button'
import { Kbd } from '@fewmail/ui/components/kbd'
import { cn } from '@fewmail/ui/lib/utils'
import { useEffect, useRef } from 'react'

import { useDates, useT } from '~/lib/i18n'
import { useHasAgent } from '~/lib/me'
import { client } from '~/lib/orpc'

import type { ComposerEditorHandle } from './composer/composer-editor'
import { ComposerEditor } from './composer/composer-editor'

export type QueueItem = RouterOutputs['today']['get']['queue'][number]

const QueueCardHeader = ({
  index,
  isSelected,
  item: { action, analysis, message },
}: {
  index: number
  isSelected: boolean
  item: QueueItem
}) => {
  const dates = useDates()

  return (
    <header className="flex items-center gap-3">
      <span
        className={cn(
          'flex size-5.5 shrink-0 items-center justify-center rounded-md text-xs font-semibold tabular-nums',
          isSelected
            ? 'bg-primary text-primary-foreground'
            : 'bg-secondary text-foreground/70'
        )}
      >
        {index + 1}
      </span>
      <strong data-mask className="truncate font-semibold">
        {message?.fromName ?? message?.fromEmail ?? 'Fewmail'}
      </strong>
      <span data-mask className="text-muted-foreground min-w-0 flex-1 truncate">
        {analysis?.summary ?? message?.subject ?? action.title}
      </span>
      {message && (
        <span className="text-muted-foreground shrink-0 text-xs">
          {dates.ago(message.receivedAt)}
        </span>
      )}
    </header>
  )
}

export const QueueCard = ({
  draft,
  index,
  isBusy,
  isEditing,
  isSelected,
  item,
  onApprove,
  onDraftChange,
  onEdit,
  onOpen,
  onRedraft,
  onSelect,
  onSkip,
  onStopEditing,
}: {
  draft: string
  index: number
  isBusy: boolean
  isEditing: boolean
  isSelected: boolean
  item: QueueItem
  onApprove: () => void
  onDraftChange: (draft: string) => void
  onEdit: () => void
  onOpen: () => void
  onRedraft: () => void
  onSelect: () => void
  onSkip: () => void
  onStopEditing: () => void
}) => {
  const t = useT()
  const { action, analysis, message } = item
  const isReply = action.kind === 'reply'
  const ref = useRef<HTMLElement>(null)
  const editorRef = useRef<ComposerEditorHandle>(null)
  const hasAgent = useHasAgent()

  useEffect(() => {
    if (isSelected) {
      ref.current?.scrollIntoView({ block: 'nearest' })
    }
  }, [isSelected])

  useEffect(() => {
    if (isEditing) {
      editorRef.current?.focus()
    }
  }, [isEditing])

  return (
    // oxlint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-noninteractive-element-interactions -- J/K select cards; the click only mirrors it for the mouse
    <article
      ref={ref}
      aria-current={isSelected}
      onClick={onSelect}
      className={cn(
        'bg-popover flex flex-col gap-3 rounded-2xl px-4.5 py-4 ring transition-shadow',
        isSelected ? 'ring-foreground/10 shadow-sm' : 'ring-foreground/6'
      )}
    >
      <QueueCardHeader index={index} isSelected={isSelected} item={item} />

      {isSelected && (
        <div className="flex flex-col gap-3 pl-8.5">
          {isReply &&
            (isEditing ? (
              <ComposerEditor
                ref={editorRef}
                aria-label={t.actionKind.reply}
                placeholder={t.compose.placeholder}
                initialHtml={textToHtml(draft)}
                onChange={({ text }) => onDraftChange(text)}
                onSubmit={onApprove}
                onEscape={onStopEditing}
                complete={
                  hasAgent && message
                    ? ({ prefix, signal, suffix }) =>
                        client.mail
                          .complete(
                            { prefix, replyToMessageId: message.id, suffix },
                            { signal }
                          )
                          .then(({ text }) => text)
                    : undefined
                }
              />
            ) : (
              <p
                data-mask
                className="bg-secondary/60 text-foreground/90 rounded-xl px-4 py-3 font-serif text-base/relaxed whitespace-pre-wrap"
              >
                {draft}
              </p>
            ))}
          {!isReply && analysis?.reason && (
            <p data-mask className="text-muted-foreground text-sm">
              {analysis.reason}
            </p>
          )}
          <div className="flex flex-wrap items-center gap-2">
            <Button size="sm" disabled={isBusy} onClick={onApprove}>
              {isReply
                ? t.queue.send
                : action.title || t.actionKind[action.kind]}
              <Kbd>{isEditing ? '⌘⏎' : '⏎'}</Kbd>
            </Button>
            {isReply && !isEditing && (
              <Button
                size="sm"
                variant="secondary"
                disabled={isBusy}
                onClick={onEdit}
              >
                {t.queue.edit} <Kbd>E</Kbd>
              </Button>
            )}
            {isReply && (
              <Button
                size="sm"
                variant="ghost-muted"
                disabled={isBusy}
                onClick={onRedraft}
              >
                {t.queue.shorter} <Kbd>R</Kbd>
              </Button>
            )}
            {message && (
              <Button size="sm" variant="ghost-muted" onClick={onOpen}>
                {t.queue.open} <Kbd>O</Kbd>
              </Button>
            )}
            <Button
              size="sm"
              variant="ghost-muted"
              disabled={isBusy}
              onClick={onSkip}
            >
              {t.queue.skip} <Kbd>S</Kbd>
            </Button>
            <span className="text-muted-foreground ml-auto text-xs">
              {isReply ? t.queue.draftedInVoice : t.actionKind[action.kind]}
            </span>
          </div>
        </div>
      )}
    </article>
  )
}
