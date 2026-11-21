import { Button } from '@fewmail/ui/components/button'
import { MotionCollapse } from '@fewmail/ui/components/collapse.motion'
import { useMutation } from '@tanstack/react-query'
import { AnimatePresence } from 'motion/react'
import { useState } from 'react'
import { toast } from 'sonner'

import { SenderCard } from '~/components/sender-card'
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

/** A sender whose every email of the month the agent would archive or mark read: asked once, on Home and in their mail alike. */
export const BotSuggestionCard = ({
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
          <SenderCard
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
          </SenderCard>
        </MotionCollapse>
      )}
    </AnimatePresence>
  )
}
