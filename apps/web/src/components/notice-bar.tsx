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
import {
  Calendar03Icon,
  Cancel01Icon,
  MailAccount01Icon,
} from '@hugeicons/core-free-icons'
import type { IconSvgElement } from '@hugeicons/react'
import { HugeiconsIcon } from '@hugeicons/react'
import { useMutation, useQuery } from '@tanstack/react-query'
import { useRouterState } from '@tanstack/react-router'
import { type } from 'arktype'
import { useSubscription } from 'seitu/react'
import { createWebStorageValue } from 'seitu/web'

import { signInWithGoogle } from '~/lib/auth'
import { useT } from '~/lib/i18n'
import { useMe } from '~/lib/me'
import { orpc } from '~/lib/orpc'

const NOTICES = ['mail', 'mailbox', 'calendar'] as const

const dismissedStore = createWebStorageValue({
  defaultValue: [],
  key: 'fewmail.dismissed-notices',
  schema: type.enumerated(...NOTICES).array(),
  type: 'localStorage',
})

interface Notice {
  action: { label: string; onClick: () => void }
  description?: string
  icon: IconSvgElement
  id: (typeof NOTICES)[number]
  /** Only what the app works without may be put away; lost mail access stays until it is fixed. */
  isOptional: boolean
  title: string
}

/** The one place for what the user must act on, above every page; the most pressing shows first, one at a time. */
export const NoticeBar = () => {
  const t = useT()
  const { hasCalendar } = useMe()
  const dismissed = useSubscription(dismissedStore)
  const pathname = useRouterState({
    select: ({ location }) => location.pathname,
  })
  const { data: mailboxes = [] } = useQuery(orpc.mailboxes.list.queryOptions())
  const reconnect = useMutation(
    orpc.mailboxes.add.mutationOptions({
      onSuccess: ({ url }) => location.assign(url),
    })
  )
  const signInLost = mailboxes.some(
    ({ hasLostAccess, signIn }) => hasLostAccess && signIn
  )
  const addedLost = mailboxes.find(
    ({ hasLostAccess, signIn }) => hasLostAccess && !signIn
  )
  const isCalendarPage = pathname === '/calendar'

  const notices: (Notice | false)[] = [
    signInLost && {
      action: {
        label: t.notices.signInAgain,
        onClick: () => signInWithGoogle(pathname),
      },
      icon: MailAccount01Icon,
      id: 'mail',
      isOptional: false,
      title: t.notices.mailLost,
    },
    !!addedLost && {
      action: { label: t.notices.reconnect, onClick: () => reconnect.mutate() },
      icon: MailAccount01Icon,
      id: 'mailbox',
      isOptional: false,
      title: t.notices.mailboxLost(addedLost.email),
    },
    !hasCalendar && {
      action: {
        label: t.calendar.noAccess.allow,
        onClick: () => signInWithGoogle('/calendar'),
      },
      description: t.calendar.noAccess.description,
      icon: Calendar03Icon,
      id: 'calendar',
      isOptional: !isCalendarPage,
      title: t.calendar.noAccess.title,
    },
  ]
  const notice = notices.find(
    (item): item is Notice =>
      !!item && !(item.isOptional && dismissed.includes(item.id))
  )
  if (!notice) {
    return null
  }

  return (
    <Item variant="grouped" size="sm">
      <ItemMedia variant="icon">
        <HugeiconsIcon icon={notice.icon} strokeWidth={2} />
      </ItemMedia>
      <ItemContent>
        <ItemTitle data-mask={notice.id === 'mailbox' || undefined}>
          {notice.title}
        </ItemTitle>
        {notice.description && (
          <ItemDescription>{notice.description}</ItemDescription>
        )}
      </ItemContent>
      <ItemActions>
        <Button
          size="sm"
          variant="secondary"
          disabled={reconnect.isPending}
          onClick={() => notice.action.onClick()}
        >
          {notice.action.label}
        </Button>
        {notice.isOptional && (
          <IconButton
            icon={Cancel01Icon}
            label={t.today.hint.notNow}
            size="icon-sm"
            variant="ghost-muted"
            onClick={() => dismissedStore.set([...dismissed, notice.id])}
          />
        )}
      </ItemActions>
    </Item>
  )
}
