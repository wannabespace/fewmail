import { cardsBleedClassName } from '@fewmail/ui/components/accordion'
import { Button } from '@fewmail/ui/components/button'
import { IconButton } from '@fewmail/ui/components/custom/icon-button'
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemMedia,
  ItemTitle,
} from '@fewmail/ui/components/item'
import { cn } from '@fewmail/ui/lib/utils'
import {
  AiChat02Icon,
  BubbleChatIcon,
  Cancel01Icon,
  McpServerIcon,
  Notification01Icon,
  PencilEdit02Icon,
} from '@hugeicons/core-free-icons'
import type { IconSvgElement } from '@hugeicons/react'
import { HugeiconsIcon } from '@hugeicons/react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Link } from '@tanstack/react-router'
import { type } from 'arktype'
import { AnimatePresence, motion } from 'motion/react'
import type { ComponentProps } from 'react'
import { useSubscription } from 'seitu/react'
import { createWebStorageValue } from 'seitu/web'

import { useT } from '~/lib/i18n'
import { useHasAgent } from '~/lib/me'
import { orpc } from '~/lib/orpc'
import { posthog } from '~/lib/posthog'
import { enablePush, pushStateQuery, pushSupported } from '~/lib/push'

/** On Free the first two tell what Pro adds; the messengers need the agent. */
const HINTS = ['drafts', 'ask', 'messengers', 'mcp', 'push'] as const

const SLIDE = { duration: 0.15, ease: [0.32, 0.72, 0, 1] } as const

/** A dismissed hint never returns, and the next one slides in at once. */
const hintsStore = createWebStorageValue({
  defaultValue: { dismissed: [] },
  key: 'fewmail.hints',
  schema: type({
    // Browsers still hold the retired hints; without them the whole list fails to parse and every dismissed hint comes back.
    dismissed: type
      .enumerated(...HINTS, 'boards', 'telegram', 'whatsapp')
      .array(),
  }),
  type: 'localStorage',
})

type HintAction = Pick<
  ComponentProps<typeof Button>,
  'disabled' | 'onClick' | 'render'
> & { label: string }

interface Hint {
  actions: HintAction[]
  description: string
  icon: IconSvgElement
  /** `undefined` while unknown: a later hint must not flash in before an earlier one loads. */
  isNeeded: boolean | undefined
  title: string
}

const messengerAction = (
  link: { botUrl: string | null } | undefined,
  label: string,
  connect: string
): HintAction[] =>
  link?.botUrl
    ? [
        {
          label,
          render: (
            <a
              href={link.botUrl}
              target="_blank"
              rel="noreferrer"
              aria-label={connect}
            />
          ),
        },
      ]
    : []

export const ConnectHint = () => {
  const t = useT()
  const copy = t.today.hint
  const hasAgent = useHasAgent()
  const queryClient = useQueryClient()
  const store = useSubscription(hintsStore)
  const { data: telegram } = useQuery(
    orpc.integrations.telegram.get.queryOptions({ enabled: hasAgent })
  )
  const { data: whatsapp } = useQuery(
    orpc.integrations.whatsapp.get.queryOptions({ enabled: hasAgent })
  )
  const { data: apps } = useQuery(orpc.integrations.apps.list.queryOptions())
  const { data: publicKey } = useQuery(orpc.devices.webPushKey.queryOptions())
  const { data: push } = useQuery(pushStateQuery)
  const turnOnPush = useMutation({
    meta: { event: 'push_enabled' },
    mutationFn: () => enablePush(publicKey ?? ''),
    onSettled: () =>
      queryClient.invalidateQueries({ queryKey: pushStateQuery.queryKey }),
  })

  const pushNeeded = () => {
    if (!pushSupported) {
      return false
    }
    if (!push || publicKey === undefined) {
      return
    }
    return !!publicKey && !push.subscribed && push.permission === 'default'
  }
  const proTip = (
    feature: 'ask' | 'drafts',
    icon: IconSvgElement,
    title: string
  ): Hint => ({
    actions: [
      {
        label: t.command.upgrade,
        onClick: () => posthog.capture('upgrade_hint_clicked', { feature }),
        render: <Link to="/settings" />,
      },
    ],
    description: t.upgrade.hints[feature],
    icon,
    isNeeded: !hasAgent,
    title,
  })
  const hints: Record<(typeof HINTS)[number], Hint> = {
    ask: proTip('ask', AiChat02Icon, t.upgrade.ask),
    drafts: proTip('drafts', PencilEdit02Icon, t.compose.writeForMe),
    mcp: {
      actions: [{ label: copy.setUp, render: <Link to="/settings" /> }],
      description: t.settings.mcp.description,
      icon: McpServerIcon,
      isNeeded: apps && apps.length === 0,
      title: t.settings.mcp.title,
    },
    messengers: {
      actions: [
        ...messengerAction(telegram, 'Telegram', t.settings.telegram.connect),
        ...messengerAction(whatsapp, 'WhatsApp', t.settings.whatsapp.connect),
      ],
      description: copy.messengers.lead,
      icon: BubbleChatIcon,
      isNeeded:
        hasAgent &&
        telegram &&
        whatsapp &&
        !telegram.linked &&
        !whatsapp.linked &&
        !!(telegram.botUrl || whatsapp.botUrl),
      title: copy.messengers.title,
    },
    push: {
      actions: [
        {
          disabled: turnOnPush.isPending,
          label: copy.turnOn,
          onClick: () => turnOnPush.mutate(),
        },
      ],
      description: t.settings.notifications.off,
      icon: Notification01Icon,
      isNeeded: pushNeeded(),
      title: t.settings.notifications.title,
    },
  }

  const current = HINTS.filter((id) => !store.dismissed.includes(id)).find(
    (id) => hints[id].isNeeded !== false
  )
  const hint = current && hints[current].isNeeded ? hints[current] : undefined

  return (
    <AnimatePresence initial={false} mode="wait">
      {hint && current && (
        <motion.div
          key={current}
          className={cn('flex flex-col', cardsBleedClassName)}
          initial={{ opacity: 0, x: 24 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -24 }}
          transition={SLIDE}
        >
          <Item variant="card" size="sm">
            <ItemMedia variant="icon">
              <HugeiconsIcon icon={hint.icon} strokeWidth={2} />
            </ItemMedia>
            <ItemContent>
              <ItemTitle>{hint.title}</ItemTitle>
              <ItemDescription>{hint.description}</ItemDescription>
            </ItemContent>
            <ItemActions>
              {hint.actions.map(({ label, ...action }) => (
                <Button key={label} size="sm" variant="secondary" {...action}>
                  {label}
                </Button>
              ))}
              <IconButton
                icon={Cancel01Icon}
                label={copy.notNow}
                size="icon-sm"
                variant="ghost-muted"
                onClick={() => {
                  posthog.capture('hint_dismissed', { hint: current })
                  hintsStore.set({ dismissed: [...store.dismissed, current] })
                }}
              />
            </ItemActions>
          </Item>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
