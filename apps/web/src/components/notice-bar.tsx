import type { RouterOutputs } from '@fewmail/api/router'
import { Button } from '@fewmail/ui/components/button'
import { cardClass } from '@fewmail/ui/components/card.utils'
import { MotionCollapse } from '@fewmail/ui/components/collapse.motion'
import { IconButton } from '@fewmail/ui/components/custom/icon-button'
import {
  SettingsRow,
  SettingsRows,
} from '@fewmail/ui/components/custom/settings-group'
import { Spinner } from '@fewmail/ui/components/spinner'
import { copy } from '@fewmail/ui/lib/copy'
import { cn } from '@fewmail/ui/lib/utils'
import {
  AiChat02Icon,
  ArrowDown01Icon,
  Cancel01Icon,
  CloudIcon,
  MailAccount01Icon,
  MailSend01Icon,
  Notification01Icon,
} from '@hugeicons/core-free-icons'
import type { IconSvgElement } from '@hugeicons/react'
import { HugeiconsIcon } from '@hugeicons/react'
import { eq, useLiveQuery } from '@tanstack/react-db'
import { useHotkey } from '@tanstack/react-hotkeys'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useNavigate, useRouterState } from '@tanstack/react-router'
import { isFuture } from 'date-fns'
import { AnimatePresence } from 'motion/react'
import { useEffect, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { createStore } from 'seitu'
import { useSubscription } from 'seitu/react'
import { createWebStorageValue } from 'seitu/web'
import { z } from 'zod/mini'

import { SenderAvatar } from '~/components/sender-avatar'
import {
  CODE_FRESH_MS,
  CodeActions,
  sweepOf,
  useMailActions,
} from '~/components/thread-view'
import { signInWithGoogle } from '~/lib/auth'
import { isDesktop } from '~/lib/desktop'
import { useDates, useT } from '~/lib/i18n'
import { mailRowsOf } from '~/lib/mail-db'
import { orpc } from '~/lib/orpc'
import { posthog } from '~/lib/posthog'
import { enablePush, pushStateQuery } from '~/lib/push'

const GOOGLE_STORAGE_URL = 'https://one.google.com/storage/management'

/** How much of the page the bar covers: the first notice only, since the rest stacks over the page when shown. */
export const noticeHeightStore = createStore(0)

/** A code put away stays away for this tab's life; it goes stale within 15 minutes anyway. */
const dismissedCodes = createStore<string[]>([])

/** The desktop app asks for its notifications until they are on or the user says not now, never again after that. */
const notificationsDeclinedStore = createWebStorageValue({
  defaultValue: false,
  key: 'fewmail.notifications-declined',
  schema: z.boolean(),
  type: 'localStorage',
})

/** `Y` already means something on these pages (the cursor row's code, the year view). */
const OWNS_Y = ['/home', '/mail', '/calendar', '/wrapped']

interface Notice {
  /** A step with consequences of its own (sign in, reconnect), named on its button. */
  action?: { label: string; onClick: () => void }
  description?: ReactNode
  /** Only what the app works without may be put away; lost mail access stays until it is fixed. */
  dismiss?: () => void
  end?: ReactNode
  icon: ReactNode
  id: string
  isAvatar?: boolean
  /** Where the notice leads (its email, Home): the whole row opens it. */
  open?: () => void
  title: ReactNode
}

const iconOf = (icon: IconSvgElement) => (
  <HugeiconsIcon icon={icon} strokeWidth={2} className="size-4" />
)

const avatarOf = (sender: { fromEmail: string; fromName?: string | null }) => (
  <SenderAvatar sender={sender} size="sm" />
)

type BannerCard = RouterOutputs['today']['banner'][number]

/** A request says what it asks; a risk warns before naming anyone; urgent mail is who wrote. */
const cardTitle = (card: BannerCard, riskTitle: string) => {
  if (card.kind === 'consent') {
    return card.title
  }
  if (card.kind === 'risk') {
    return riskTitle
  }
  return <span data-mask>{card.fromName ?? card.fromEmail}</span>
}

/** Inbox codes under 15 minutes old, newest first; the list drops each one the moment it goes stale. */
const useFreshCodes = () => {
  const dismissed = useSubscription(dismissedCodes)
  const { data: rows } = useLiveQuery((query) =>
    query.from({ row: mailRowsOf() }).where(({ row }) => eq(row.list, 'inbox'))
  )
  const [now, setNow] = useState(Date.now)
  const fresh = rows
    .flatMap(({ message }) =>
      message.code &&
      !dismissed.includes(message.id) &&
      message.receivedAt.getTime() + CODE_FRESH_MS > now
        ? [{ ...message, code: message.code }]
        : []
    )
    .toSorted((a, b) => b.receivedAt.getTime() - a.receivedAt.getTime())
  const staleAt = Math.min(
    ...fresh.map(({ receivedAt }) => receivedAt.getTime() + CODE_FRESH_MS)
  )
  useEffect(() => {
    if (!Number.isFinite(staleAt)) {
      return
    }
    const timer = setTimeout(() => setNow(Date.now()), staleAt - Date.now())
    return () => clearTimeout(timer)
  }, [staleAt])
  return fresh
}

/**
 * The one place for what the user must act on, above every page; the most pressing shows first, one at a time, the
 * rest a click away. A fresh code, a risk, a request waiting for a yes and urgent mail come before mailbox trouble;
 * Home shows its own codes and cards, so here it keeps only mailbox trouble. Nothing here changes Gmail or says yes
 * except a code's own Copy and archive: the rest opens where the decision is.
 */
export const NoticeBar = () => {
  const t = useT()
  const dates = useDates()
  const navigate = useNavigate()
  const [isExpanded, setIsExpanded] = useState(false)
  const pathname = useRouterState({
    select: ({ location }) => location.pathname,
  })
  const isHome = pathname === '/home'
  const { data: mailboxes = [] } = useQuery(orpc.mailboxes.list.queryOptions())
  const { data: cards = [] } = useQuery({
    ...orpc.today.banner.queryOptions(),
    enabled: !isHome,
  })
  const codes = useFreshCodes()
  const actions = useMailActions()
  const sweep = sweepOf(actions, t, 'inbox')
  const putAway = useMutation(orpc.today.dismissBanner.mutationOptions())
  const queryClient = useQueryClient()
  const { data: push } = useQuery({ ...pushStateQuery, enabled: isDesktop })
  const isNotificationsDeclined = useSubscription(notificationsDeclinedStore)
  const turnOnNotifications = useMutation({
    meta: { event: 'push_enabled' },
    mutationFn: () => enablePush(''),
    onSettled: () =>
      queryClient.invalidateQueries({ queryKey: pushStateQuery.queryKey }),
  })
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
  const storageFull = mailboxes.find(({ storageFullAt }) => storageFullAt)
  const sendBlocked = mailboxes.find(
    ({ sendBlockedUntil }) => sendBlockedUntil && isFuture(sendBlockedUntil)
  )
  const newest = isHome ? undefined : codes[0]
  const canCopyWithY =
    !!newest && !OWNS_Y.some((page) => pathname.startsWith(page))
  const copyCode = (code: string) => {
    posthog.capture('code_copied', { from: 'banner' })
    void copy(code, t.mail.oneTimeCode.copied)
  }
  useHotkey('Y', () => newest && copyCode(newest.code), {
    enabled: canCopyWithY,
  })
  const openThread = (kind: string, threadId: string | null) => () => {
    posthog.capture('banner_opened', { kind })
    void (threadId
      ? navigate({ params: { threadId }, to: '/mail/$threadId' })
      : navigate({ to: '/home' }))
  }

  const notices: (Notice | false)[] = [
    ...(isHome ? [] : codes).map((message): Notice => ({
      description: <span data-mask>{message.subject}</span>,
      dismiss: () => {
        posthog.capture('banner_dismissed', { kind: 'code' })
        dismissedCodes.set([...dismissedCodes.get(), message.id])
      },
      end: (
        <CodeActions
          actions={actions}
          code={message.code}
          messageIds={[message.id]}
          shortcut={message === newest && canCopyWithY ? 'Y' : undefined}
          sweep={sweep}
          onCopy={() => posthog.capture('code_copied', { from: 'banner' })}
        />
      ),
      icon: avatarOf(message),
      id: `code:${message.id}`,
      isAvatar: true,
      title: <span data-mask>{message.fromName ?? message.fromEmail}</span>,
    })),
    ...(isHome ? [] : cards).map((card): Notice => ({
      description:
        card.kind === 'consent' ? (
          card.reason
        ) : (
          <span data-mask>
            {card.kind === 'risk'
              ? `${card.fromName ?? card.fromEmail ?? ''} · ${card.subject ?? ''}`
              : card.subject}
          </span>
        ),
      dismiss: () => putAway.mutate({ id: card.id }),
      icon:
        card.kind === 'consent' || !card.fromEmail
          ? iconOf(AiChat02Icon)
          : avatarOf({ fromEmail: card.fromEmail, fromName: card.fromName }),
      id: `card:${card.id}`,
      isAvatar: card.kind !== 'consent' && !!card.fromEmail,
      open: openThread(
        card.kind,
        card.kind === 'consent' ? null : card.threadId
      ),
      title: cardTitle(card, t.risk.title),
    })),
    signInLost && {
      action: {
        label: t.notices.signInAgain,
        onClick: () => signInWithGoogle(pathname),
      },
      icon: iconOf(MailAccount01Icon),
      id: 'mail',
      title: t.notices.mailLost,
    },
    !!addedLost && {
      action: { label: t.notices.reconnect, onClick: () => reconnect.mutate() },
      icon: iconOf(MailAccount01Icon),
      id: 'mailbox',
      title: <span data-mask>{t.notices.mailboxLost(addedLost.email)}</span>,
    },
    !!storageFull && {
      action: {
        label: t.notices.freeUpSpace,
        onClick: () => window.open(GOOGLE_STORAGE_URL, '_blank', 'noopener'),
      },
      description: t.notices.storageFullHint,
      icon: iconOf(CloudIcon),
      id: 'storage',
      title: <span data-mask>{t.notices.storageFull(storageFull.email)}</span>,
    },
    isDesktop &&
      push?.subscribed === false &&
      !isNotificationsDeclined && {
        action: {
          label: t.today.hint.turnOn,
          onClick: () => turnOnNotifications.mutate(),
        },
        description: t.settings.notifications.off,
        dismiss: () => {
          posthog.capture('banner_dismissed', { kind: 'notifications' })
          notificationsDeclinedStore.set(true)
        },
        icon: iconOf(Notification01Icon),
        id: 'notifications',
        title: t.settings.notifications.title,
      },
    !!sendBlocked?.sendBlockedUntil && {
      icon: iconOf(MailSend01Icon),
      id: 'send',
      title: (
        <span data-mask>
          {t.notices.sendLimit(
            sendBlocked.email,
            dates.fromNow(sendBlocked.sendBlockedUntil)
          )}
        </span>
      ),
    },
  ]
  const shown = notices.filter((notice): notice is Notice => !!notice)
  const more = shown.length - 1
  const firstRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const first = firstRef.current
    if (!first) {
      return
    }
    const observer = new ResizeObserver(() =>
      noticeHeightStore.set(first.offsetHeight)
    )
    observer.observe(first)
    return () => observer.disconnect()
  }, [])

  const rowOf = (notice: Notice, isFirst: boolean) => (
    <SettingsRow
      key={notice.id}
      rowKey={notice.id}
      icon={notice.icon}
      iconVariant={notice.isAvatar ? 'avatar' : undefined}
      title={notice.title}
      description={notice.description}
      trigger={
        notice.open && (
          <button
            type="button"
            aria-label={t.mail.open}
            onClick={() => notice.open?.()}
          />
        )
      }
    >
      {notice.end}
      {notice.action && (
        <Button
          size="sm"
          variant="secondary"
          disabled={reconnect.isPending}
          onClick={() => notice.action?.onClick()}
        >
          {reconnect.isPending && <Spinner />}
          {notice.action.label}
        </Button>
      )}
      {isFirst && more > 0 && (
        // The count, not Show all / Show fewer: a label changing width moved every control left of it.
        <Button
          size="sm"
          variant="ghost-tint-muted"
          aria-expanded={isExpanded}
          aria-label={
            isExpanded ? t.mail.showFewer : t.mail.showAll(shown.length)
          }
          onClick={() => setIsExpanded(!isExpanded)}
        >
          +{more}
          <HugeiconsIcon
            icon={ArrowDown01Icon}
            strokeWidth={2}
            className={cn(
              'transition-transform duration-150',
              isExpanded && 'rotate-180'
            )}
          />
        </Button>
      )}
      {notice.dismiss && (
        <IconButton
          icon={Cancel01Icon}
          label={t.today.hint.notNow}
          size="icon-sm"
          variant="ghost-tint-muted"
          onClick={() => notice.dismiss?.()}
        />
      )}
    </SettingsRow>
  )
  const [first] = shown
  const isStackOpen = isExpanded && more > 0

  // Always mounted, so the last notice can fold away instead of vanishing. Only the first notice is measured, so
  // showing the rest never moves the page; they join its card from below, one card scrolling whole, never a sheet
  // over the page.
  return (
    <div className="pointer-events-none absolute inset-0 z-10 flex flex-col">
      <div className="min-h-0 overflow-y-auto overscroll-contain px-3 pb-2">
        <div ref={firstRef}>
          <AnimatePresence initial={false}>
            {first && (
              <MotionCollapse key="first">
                <div className="pt-2">
                  <div
                    className={cn(
                      cardClass,
                      'pointer-events-auto overflow-hidden transition-[border-radius] duration-150',
                      isStackOpen && 'rounded-b-none'
                    )}
                  >
                    {rowOf(first, true)}
                  </div>
                </div>
              </MotionCollapse>
            )}
          </AnimatePresence>
        </div>
        <AnimatePresence initial={false}>
          {isStackOpen && (
            <MotionCollapse key="rest">
              <div
                className={cn(
                  cardClass,
                  'pointer-events-auto overflow-hidden rounded-t-none'
                )}
              >
                <SettingsRows>
                  {shown.slice(1).map((notice) => rowOf(notice, false))}
                </SettingsRows>
              </div>
            </MotionCollapse>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
