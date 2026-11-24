import type { BotPreset } from '@fewmail/shared/agent'
import { Button } from '@fewmail/ui/components/button'
import { MotionCollapse } from '@fewmail/ui/components/collapse.motion'
import {
  SettingsGroup,
  SettingsRow,
} from '@fewmail/ui/components/custom/settings-group'
import { useMutation } from '@tanstack/react-query'
import { AnimatePresence } from 'motion/react'
import { useState } from 'react'
import { toast } from 'sonner'

import { BotAvatar } from '~/components/bot-list'
import { SenderRow } from '~/components/sender-card'
import { useT } from '~/lib/i18n'
import { orpc, refetchChanged } from '~/lib/orpc'
import { pendingToast } from '~/lib/undo'

const BOT_SUGGESTION_TOAST = 'bot-suggestion'

export interface BotSuggestion {
  count: number
  effect: 'archive' | 'mark_read'
  fromEmail: string
  fromName: string | null
}

const refetch = () => refetchChanged(['today', 'mail', 'bots'])

/** A sender whose every email of the month the agent would archive or mark read: asked once, in Fewmail's chat and in their mail alike, a row of a list. */
export const BotSuggestionRow = ({
  isShowable = false,
  onAnswer,
  suggestion,
}: {
  /** On Home the card opens the sender's emails beside the chat; in their email it is already open. */
  isShowable?: boolean
  onAnswer?: () => void
  suggestion: BotSuggestion
}) => {
  const t = useT()
  const [isAnswered, setIsAnswered] = useState(false)
  const answered = () => {
    setIsAnswered(true)
    onAnswer?.()
  }
  const accept = useMutation(
    orpc.bots.createSimple.mutationOptions({
      ...pendingToast(BOT_SUGGESTION_TOAST),
      onSettled: refetch,
      onSuccess: () =>
        toast.success(t.today.botSuggestion.done[suggestion.effect], {
          id: BOT_SUGGESTION_TOAST,
        }),
    })
  )
  const decline = useMutation(
    orpc.bots.declineSuggestion.mutationOptions({ onSettled: refetch })
  )

  return (
    <AnimatePresence initial={false}>
      {!isAnswered && (
        <MotionCollapse initial={false}>
          <SenderRow
            isShowable={isShowable}
            label={t.today.botSuggestion.label}
            lead={t.today.botSuggestion.lead(
              suggestion.count,
              suggestion.effect
            )}
            sender={suggestion}
          >
            <Button
              size="sm"
              variant="ghost-tint-muted"
              onClick={() => {
                answered()
                decline.mutate({ fromEmail: suggestion.fromEmail })
              }}
            >
              {t.today.botSuggestion.no}
            </Button>
            <Button
              size="sm"
              onClick={() => {
                answered()
                accept.mutate({
                  effect: suggestion.effect,
                  match: { field: 'from', value: suggestion.fromEmail },
                  name: suggestion.fromName ?? suggestion.fromEmail,
                })
              }}
            >
              {t.today.botSuggestion.yes[suggestion.effect]}
            </Button>
          </SenderRow>
        </MotionCollapse>
      )}
    </AnimatePresence>
  )
}

/** A ready-made bot Fewmail Bot offers in its chat instead of making it at sign-in: made in a click, or never offered again. */
export const PresetSuggestionRow = ({
  onAnswer,
  preset,
}: {
  onAnswer?: () => void
  preset: BotPreset
}) => {
  const t = useT()
  const [isAnswered, setIsAnswered] = useState(false)
  const words = t.starterBots[preset]
  const answered = () => {
    setIsAnswered(true)
    onAnswer?.()
  }
  const accept = useMutation(
    orpc.bots.addPreset.mutationOptions({
      ...pendingToast(BOT_SUGGESTION_TOAST),
      onSettled: refetch,
      onSuccess: () =>
        toast.success(t.bots.created, { id: BOT_SUGGESTION_TOAST }),
    })
  )
  const decline = useMutation(
    orpc.bots.declinePreset.mutationOptions({ onSettled: refetch })
  )
  return (
    <AnimatePresence initial={false}>
      {!isAnswered && (
        <MotionCollapse initial={false}>
          <SettingsRow
            icon={<BotAvatar bot={{ bot: preset, name: words.name }} />}
            iconVariant="avatar"
            title={
              <span className="flex flex-wrap items-baseline gap-x-2">
                {words.name}
                <span className="text-muted-foreground text-xs font-normal whitespace-nowrap">
                  {t.today.botSuggestion.label}
                </span>
              </span>
            }
            description={
              'instruction' in words
                ? words.instruction
                : t.today.botSuggestion.board
            }
          >
            <Button
              size="sm"
              variant="ghost-tint-muted"
              onClick={() => {
                answered()
                decline.mutate({ preset })
              }}
            >
              {t.today.botSuggestion.no}
            </Button>
            <Button
              size="sm"
              onClick={() => {
                answered()
                accept.mutate({ preset })
              }}
            >
              {t.today.botSuggestion.create}
            </Button>
          </SettingsRow>
        </MotionCollapse>
      )}
    </AnimatePresence>
  )
}

/** In the sender's own email the question is a card of its own, folding away once answered. */
export const BotSuggestionCard = ({
  suggestion,
}: {
  suggestion: BotSuggestion
}) => {
  const [isAnswered, setIsAnswered] = useState(false)
  return (
    <AnimatePresence initial={false}>
      {!isAnswered && (
        <MotionCollapse initial={false}>
          <SettingsGroup>
            <BotSuggestionRow
              suggestion={suggestion}
              onAnswer={() => setIsAnswered(true)}
            />
          </SettingsGroup>
        </MotionCollapse>
      )}
    </AnimatePresence>
  )
}
