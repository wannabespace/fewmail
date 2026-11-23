import { BOT_MESSAGE_CHARS } from '@fewmail/shared/agent'
import { Button } from '@fewmail/ui/components/button'
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupTextarea,
} from '@fewmail/ui/components/input-group'
import {
  ArrowUp02Icon,
  Cancel01Icon,
  ReplyIcon,
} from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { useHotkey } from '@tanstack/react-hotkeys'
import { skipToken, useQuery } from '@tanstack/react-query'
import { useEffect, useRef, useState } from 'react'
import { useSubscription } from 'seitu/react'

import { ReplyQuote, replyStore } from '~/components/bot-chat'
import type { Ask } from '~/components/bot-chat'
import type { HomeBot } from '~/components/bot-list'
import { useT } from '~/lib/i18n'
import { useHasAgent } from '~/lib/me'
import { orpc } from '~/lib/orpc'
import { posthog } from '~/lib/posthog'
/** What the user may send the open bot in a tap, written by the agent for its chat as it stands; none without the agent or past the allowance, none while it answers. */
const useSuggestions = (bot: string, isSending: boolean) => {
  const hasAgent = useHasAgent()
  const { data } = useQuery(
    orpc.bots.suggestions.queryOptions({
      input: hasAgent && !isSending ? { bot } : skipToken,
    })
  )
  return data ?? []
}

/** Where the user writes to the open bot: ⏎ sends, ⇧⏎ breaks the line, `/` comes here and esc drops the reply, then leaves. */
export const BotComposer = ({
  bot,
  isActive,
  onSend,
  isSending,
}: {
  bot: HomeBot
  isActive: boolean
  isSending: boolean
  onSend: (message: Omit<Ask, 'bot'>) => void
}) => {
  const t = useT()
  const ref = useRef<HTMLTextAreaElement>(null)
  const [text, setText] = useState('')
  const reply = useSubscription(replyStore)
  const replyTo = reply?.bot === bot.bot ? reply.quote : undefined
  const suggestions = useSuggestions(bot.bot, isSending)
  useHotkey('/', () => ref.current?.focus(), { enabled: isActive })
  useEffect(() => {
    if (replyTo) {
      ref.current?.focus()
    }
  }, [replyTo])
  const send = () => {
    const message = text.trim()
    if (!message || isSending) {
      return
    }
    onSend({ replyTo, text: message })
    setText('')
    replyStore.set(null)
  }
  return (
    <form
      className="flex flex-col gap-2"
      onSubmit={(event) => {
        event.preventDefault()
        send()
      }}
    >
      {!text && !replyTo && !isSending && suggestions.length > 0 && (
        <div className="flex flex-wrap gap-1.5" data-mask>
          {suggestions.map((suggestion) => (
            <Button
              key={suggestion}
              size="sm"
              variant="secondary"
              onClick={() => {
                posthog.capture('bot_suggestion_asked', {
                  system: bot.bot === 'fewmail',
                })
                onSend({ text: suggestion })
              }}
            >
              {suggestion}
            </Button>
          ))}
        </div>
      )}
      <InputGroup variant="composer">
        {replyTo && (
          <InputGroupAddon align="block-start">
            <div className="bg-muted flex w-full min-w-0 items-center gap-2.5 rounded-2xl py-2 ps-3 pe-2">
              <HugeiconsIcon
                icon={ReplyIcon}
                strokeWidth={2}
                className="text-primary size-4 shrink-0"
              />
              <ReplyQuote botName={bot.name} quote={replyTo} />
              <InputGroupButton
                size="icon-xs"
                aria-label={t.bots.cancelReply}
                className="ml-auto"
                onClick={() => replyStore.set(null)}
              >
                <HugeiconsIcon icon={Cancel01Icon} strokeWidth={2} />
              </InputGroupButton>
            </div>
          </InputGroupAddon>
        )}
        <InputGroupTextarea
          ref={ref}
          aria-label={t.bots.composer(bot.name)}
          placeholder={t.bots.composer(bot.name)}
          maxLength={BOT_MESSAGE_CHARS}
          rows={1}
          value={text}
          onChange={(event) => setText(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Enter' && !event.shiftKey) {
              event.preventDefault()
              send()
            }
            if (event.key === 'Escape' && replyTo) {
              replyStore.set(null)
            } else if (event.key === 'Escape') {
              ref.current?.blur()
            }
          }}
        />
        <InputGroupAddon align="inline-end">
          <InputGroupButton
            type="submit"
            size="icon-sm"
            variant="default"
            aria-label={t.compose.send}
            disabled={!text.trim() || isSending}
          >
            <HugeiconsIcon icon={ArrowUp02Icon} strokeWidth={2} />
          </InputGroupButton>
        </InputGroupAddon>
      </InputGroup>
    </form>
  )
}
