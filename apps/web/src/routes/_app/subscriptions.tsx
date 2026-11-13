import type { RouterOutputs } from '@fewmail/api/router'
import { Avatar, AvatarFallback } from '@fewmail/ui/components/avatar'
import { Button } from '@fewmail/ui/components/button'
import { LoadingContent } from '@fewmail/ui/components/custom/loading-content'
import {
  SettingsGroup,
  SettingsRow,
} from '@fewmail/ui/components/custom/settings-group'
import { Empty, EmptyDescription } from '@fewmail/ui/components/empty'
import { Kbd } from '@fewmail/ui/components/kbd'
import { useHotkey } from '@tanstack/react-hotkeys'
import {
  useMutation,
  useMutationState,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query'
import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { useState } from 'react'
import { toast } from 'sonner'

import { confirm } from '~/components/confirm-dialog'
import { KeyHints } from '~/components/key-hints'
import { listSearch } from '~/components/mail-search'
import { useT } from '~/lib/i18n'
import { orpc, refetchChanged } from '~/lib/orpc'
import { warmQuery } from '~/lib/query-client'

type Subscription = RouterOutputs['subscriptions']['list'][number]

const SubscriptionsPage = () => {
  const t = useT()
  const queryClient = useQueryClient()
  const listKey = orpc.subscriptions.list.queryKey()
  const { data: subscriptions, isPending } = useQuery(
    orpc.subscriptions.list.queryOptions()
  )
  const [cursor, setCursor] = useState(0)
  const rows = subscriptions ?? []
  const active = rows[Math.min(cursor, rows.length - 1)]

  const navigate = useNavigate()
  const unsubscribe = useMutation(
    orpc.subscriptions.unsubscribe.mutationOptions({
      // Leaving a list can take a while (its page, a mailto): the row stays, spinning, until the answer.
      onMutate: ({ messageId }) => {
        toast.loading(t.mail.unsubscribing, { id: messageId })
      },
      onError: (_, { messageId }) => toast.dismiss(messageId),
      onSuccess: ({ link, unsubscribed }, { messageId }) => {
        queryClient.setQueryData<Subscription[]>(listKey, (previous) =>
          previous?.filter((row) => row.messageId !== messageId)
        )
        if (link) {
          toast(t.mail.unsubscribeYourself, {
            action: {
              label: t.mail.openUnsubscribePage,
              onClick: () => window.open(link, '_blank', 'noopener'),
            },
            id: messageId,
          })
          return
        }
        toast.success(
          unsubscribed
            ? t.subscriptions.unsubscribed
            : t.subscriptions.archivedOnly,
          { id: messageId }
        )
      },
      onSettled: () => refetchChanged(['subscriptions', 'mail', 'rules']),
    })
  )
  const leaving = new Set(
    useMutationState({
      filters: {
        mutationKey: orpc.subscriptions.unsubscribe.mutationKey(),
        status: 'pending',
      },
      select: ({ state }) =>
        (state.variables as { messageId: string } | undefined)?.messageId,
    })
  )
  const leave = (row?: Subscription) =>
    row &&
    !leaving.has(row.messageId) &&
    confirm({
      action: t.subscriptions.unsubscribe,
      description: t.subscriptions.unsubscribeHint(t.cleanup.emails(row.count)),
      onConfirm: () => unsubscribe.mutate({ messageId: row.messageId }),
      title: t.mail.unsubscribeConfirm(row.fromName ?? row.fromEmail),
      variant: 'warning',
    })
  const show = (row?: Subscription) =>
    row && navigate({ search: { q: listSearch(row.fromEmail) }, to: '/mail' })

  const listKeys = { enabled: Boolean(active) }
  useHotkey(
    'J',
    () => setCursor((index) => Math.min(rows.length - 1, index + 1)),
    listKeys
  )
  useHotkey(
    'ArrowDown',
    () => setCursor((index) => Math.min(rows.length - 1, index + 1)),
    listKeys
  )
  useHotkey('K', () => setCursor((index) => Math.max(0, index - 1)), listKeys)
  useHotkey(
    'ArrowUp',
    () => setCursor((index) => Math.max(0, index - 1)),
    listKeys
  )
  useHotkey('U', () => leave(active), listKeys)
  useHotkey('O', () => show(active), listKeys)
  useHotkey('Enter', () => show(active), listKeys)

  return (
    <main className="flex flex-1 flex-col overflow-hidden">
      <div className="flex-1 overflow-y-auto">
        <div className="mx-auto flex max-w-3xl flex-col gap-8 px-10 pt-12 pb-16">
          <header className="flex flex-col gap-3">
            <h1 className="text-display font-serif tracking-tight">
              {t.subscriptions.title}
            </h1>
            <p className="text-brief text-foreground/85 font-serif">
              {t.subscriptions.lead}
            </p>
          </header>

          {!isPending && rows.length === 0 && (
            <Empty>
              <EmptyDescription>{t.subscriptions.empty}</EmptyDescription>
            </Empty>
          )}
          {rows.length > 0 && (
            <SettingsGroup title={t.subscriptions.count(rows.length)}>
              {rows.map((row) => (
                <SettingsRow
                  key={row.fromEmail}
                  active={row === active}
                  iconVariant="avatar"
                  icon={
                    <Avatar size="sm">
                      <AvatarFallback data-mask>
                        {(row.fromName ?? row.fromEmail)[0]?.toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  }
                  title={
                    <Link
                      to="/mail"
                      search={{ q: listSearch(row.fromEmail) }}
                      data-mask
                    >
                      {row.fromName ?? row.fromEmail}
                    </Link>
                  }
                  description={
                    <>
                      <span data-mask>{row.fromEmail}</span> ·{' '}
                      {t.cleanup.emails(row.count)},{' '}
                      {t.subscriptions.opened(row.opened)}
                    </>
                  }
                >
                  <Button
                    size="sm"
                    variant="ghost"
                    disabled={leaving.has(row.messageId)}
                    onClick={() => leave(row)}
                  >
                    <LoadingContent loading={leaving.has(row.messageId)}>
                      {t.subscriptions.unsubscribe}
                    </LoadingContent>
                    {row === active && <Kbd>U</Kbd>}
                  </Button>
                </SettingsRow>
              ))}
            </SettingsGroup>
          )}
        </div>
      </div>
      {active && (
        <KeyHints
          hints={[
            ['J / K', t.keys.move],
            ['⏎', t.keys.open],
            ['U', t.keys.unsubscribe],
          ]}
        />
      )}
    </main>
  )
}

export const Route = createFileRoute('/_app/subscriptions')({
  component: SubscriptionsPage,
  loader: () => warmQuery(orpc.subscriptions.list.queryOptions()),
})
