import { Button } from '@fewmail/ui/components/button'
import { MotionCollapse } from '@fewmail/ui/components/collapse.motion'
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemMedia,
  ItemTitle,
} from '@fewmail/ui/components/item'
import { useMutation } from '@tanstack/react-query'
import { AnimatePresence } from 'motion/react'
import { useState } from 'react'
import { toast } from 'sonner'

import { SenderAvatar } from '~/components/sender-avatar'
import { useT } from '~/lib/i18n'
import { orpc, refetchChanged } from '~/lib/orpc'
import { pendingToast } from '~/lib/undo'

const RULE_SUGGESTION_TOAST = 'rule-suggestion'

export interface RuleSuggestion {
  count: number
  effect: 'archive' | 'mark_read'
  fromEmail: string
  fromName: string | null
}

const refetch = () => refetchChanged(['today', 'mail', 'rules'])

/** A sender whose every email of the month the agent would archive or mark read: asked once, on Home and in their mail alike. */
export const RuleSuggestionCard = ({
  onAnswer,
  suggestion,
}: {
  onAnswer?: () => void
  suggestion: RuleSuggestion
}) => {
  const t = useT()
  const [isAnswered, setIsAnswered] = useState(false)
  const answered = () => {
    setIsAnswered(true)
    onAnswer?.()
  }
  const accept = useMutation(
    orpc.rules.createSimple.mutationOptions({
      ...pendingToast(RULE_SUGGESTION_TOAST),
      onSettled: refetch,
      onSuccess: () =>
        toast.success(t.today.ruleSuggestion.done[suggestion.effect], {
          id: RULE_SUGGESTION_TOAST,
        }),
    })
  )
  const decline = useMutation(
    orpc.rules.declineSuggestion.mutationOptions({ onSettled: refetch })
  )

  return (
    <AnimatePresence initial={false}>
      {!isAnswered && (
        <MotionCollapse initial={false}>
          <Item variant="card" size="sm">
            <ItemMedia variant="avatar">
              <SenderAvatar sender={suggestion} size="sm" />
            </ItemMedia>
            <ItemContent>
              <ItemTitle className="flex-wrap gap-y-0.5">
                <span data-mask>
                  {suggestion.fromName ?? suggestion.fromEmail}
                </span>
                <span className="text-muted-foreground text-xs font-normal whitespace-nowrap">
                  {t.today.ruleSuggestion.label}
                </span>
              </ItemTitle>
              <ItemDescription>
                {t.today.ruleSuggestion.lead(
                  suggestion.count,
                  suggestion.effect
                )}
              </ItemDescription>
            </ItemContent>
            <ItemActions>
              <Button
                size="sm"
                variant="ghost-muted"
                onClick={() => {
                  answered()
                  decline.mutate({ fromEmail: suggestion.fromEmail })
                }}
              >
                {t.today.ruleSuggestion.no}
              </Button>
              <Button
                size="sm"
                onClick={() => {
                  answered()
                  accept.mutate({
                    effect: suggestion.effect,
                    match: { field: 'from', value: suggestion.fromEmail },
                  })
                }}
              >
                {t.today.ruleSuggestion.yes[suggestion.effect]}
              </Button>
            </ItemActions>
          </Item>
        </MotionCollapse>
      )}
    </AnimatePresence>
  )
}
