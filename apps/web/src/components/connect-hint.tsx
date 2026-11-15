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
  Cancel01Icon,
  DashboardSquare01Icon,
  McpServerIcon,
  Notification01Icon,
  PencilEdit02Icon,
  TelegramIcon,
  WhatsappIcon,
} from '@hugeicons/core-free-icons'
import type { IconSvgElement } from '@hugeicons/react'
import { HugeiconsIcon } from '@hugeicons/react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Link } from '@tanstack/react-router'
import { type } from 'arktype'
import type { ComponentProps, ReactNode } from 'react'
import { useSubscription } from 'seitu/react'
import { createWebStorageValue } from 'seitu/web'

import { useT } from '~/lib/i18n'
import { useHasAgent } from '~/lib/me'
import { orpc } from '~/lib/orpc'
import { posthog } from '~/lib/posthog'
import { enablePush, pushStateQuery, pushSupported } from '~/lib/push'

/** On Free the first three tell what Pro adds, one a day like the rest; Telegram and WhatsApp need the agent. */
const HINTS = [
  'drafts',
  'ask',
  'boards',
  'telegram',
  'whatsapp',
  'mcp',
  'push',
] as const

const today = () => new Date().toDateString()

/** A dismissed hint never returns, and the next one waits until another day so Home never nags. */
const hintsStore = createWebStorageValue({
  defaultValue: { dismissed: [], dismissedOn: null },
  key: 'fewmail.hints',
  schema: type({
    dismissed: type.enumerated(...HINTS).array(),
    dismissedOn: 'string | null',
  }),
  type: 'localStorage',
})

interface Hint {
  action: Pick<ComponentProps<typeof Button>, 'disabled' | 'onClick' | 'render'>
  description: string
  icon: IconSvgElement
  /** `undefined` while unknown: a later hint must not flash in before an earlier one loads. */
  isNeeded: boolean | undefined
  label: ReactNode
  title: string
}

const messengerLink = (
  link: { botUrl: string | null } | undefined,
  label: string
) => ({
  render: (
    <a
      href={link?.botUrl ?? undefined}
      target="_blank"
      rel="noreferrer"
      aria-label={label}
    />
  ),
})

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
    feature: 'ask' | 'boards' | 'drafts',
    icon: IconSvgElement,
    title: string
  ): Hint => ({
    action: {
      onClick: () => posthog.capture('upgrade_hint_clicked', { feature }),
      render: <Link to="/settings" />,
    },
    description: t.upgrade.hints[feature],
    icon,
    isNeeded: !hasAgent,
    label: t.command.upgrade,
    title,
  })
  const hints: Record<(typeof HINTS)[number], Hint> = {
    ask: proTip('ask', AiChat02Icon, t.upgrade.ask),
    boards: proTip('boards', DashboardSquare01Icon, t.nav.boards),
    drafts: proTip('drafts', PencilEdit02Icon, t.compose.writeForMe),
    mcp: {
      action: { render: <Link to="/settings" /> },
      description: t.settings.mcp.description,
      icon: McpServerIcon,
      isNeeded: apps && apps.length === 0,
      label: copy.setUp,
      title: t.settings.mcp.title,
    },
    push: {
      action: {
        disabled: turnOnPush.isPending,
        onClick: () => turnOnPush.mutate(),
      },
      description: t.settings.notifications.off,
      icon: Notification01Icon,
      isNeeded: pushNeeded(),
      label: copy.turnOn,
      title: t.settings.notifications.title,
    },
    telegram: {
      action: messengerLink(telegram, t.settings.telegram.connect),
      description: t.settings.telegram.unlinked,
      icon: TelegramIcon,
      isNeeded: hasAgent && telegram && !telegram.linked && !!telegram.botUrl,
      label: t.settings.telegram.connect,
      title: 'Telegram',
    },
    whatsapp: {
      action: messengerLink(whatsapp, t.settings.whatsapp.connect),
      description: t.settings.whatsapp.unlinked,
      icon: WhatsappIcon,
      isNeeded: hasAgent && whatsapp && !whatsapp.linked && !!whatsapp.botUrl,
      label: t.settings.whatsapp.connect,
      title: 'WhatsApp',
    },
  }

  if (store.dismissedOn === today()) {
    return null
  }
  const pending = HINTS.filter((id) => !store.dismissed.includes(id))
  const current = pending.find((id) => hints[id].isNeeded !== false)
  if (!current || hints[current].isNeeded === undefined) {
    return null
  }
  const hint = hints[current]

  return (
    <div className={cn('flex flex-col', cardsBleedClassName)}>
      <Item variant="card" size="sm">
        <ItemMedia variant="icon">
          <HugeiconsIcon icon={hint.icon} strokeWidth={2} />
        </ItemMedia>
        <ItemContent>
          <ItemTitle>{hint.title}</ItemTitle>
          <ItemDescription>{hint.description}</ItemDescription>
        </ItemContent>
        <ItemActions>
          <Button size="sm" variant="secondary" {...hint.action}>
            {hint.label}
          </Button>
          <IconButton
            icon={Cancel01Icon}
            label={copy.notNow}
            size="icon-sm"
            variant="ghost-muted"
            onClick={() => {
              posthog.capture('hint_dismissed', { hint: current })
              hintsStore.set({
                dismissed: [...store.dismissed, current],
                dismissedOn: today(),
              })
            }}
          />
        </ItemActions>
      </Item>
    </div>
  )
}
