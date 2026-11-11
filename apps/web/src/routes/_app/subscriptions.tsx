import type { RouterOutputs } from '@fewmail/api/router'
import { Avatar, AvatarFallback } from '@fewmail/ui/components/avatar'
import { Button } from '@fewmail/ui/components/button'
import {
  SettingsGroup,
  SettingsRow,
} from '@fewmail/ui/components/custom/settings-group'
import { Empty, EmptyDescription } from '@fewmail/ui/components/empty'
import { Kbd } from '@fewmail/ui/components/kbd'
import { useHotkey } from '@tanstack/react-hotkeys'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import { toast } from 'sonner'

import { KeyHints } from '~/components/key-hints'
import { useT } from '~/lib/i18n'
import { orpc } from '~/lib/orpc'

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

  const unsubscribe = useMutation(
    orpc.subscriptions.unsubscribe.mutationOptions({
      onMutate: ({ messageId }) =>
        queryClient.setQueryData<Subscription[]>(listKey, (previous) =>
          previous?.filter((row) => row.messageId !== messageId)
        ),
      onSuccess: ({ unsubscribed }) =>
        toast.success(
          unsubscribed
            ? t.subscriptions.unsubscribed
            : t.subscriptions.archivedOnly
        ),
      onSettled: () => queryClient.invalidateQueries(),
    })
  )
  const leave = (row?: Subscription) =>
    row && unsubscribe.mutate({ messageId: row.messageId })

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
                  title={<span data-mask>{row.fromName ?? row.fromEmail}</span>}
                  description={
                    <>
                      <span data-mask>{row.fromEmail}</span> ·{' '}
                      {t.cleanup.emails(row.count)},{' '}
                      {t.subscriptions.opened(row.opened)}
                    </>
                  }
                >
                  <Button size="sm" variant="ghost" onClick={() => leave(row)}>
                    {t.subscriptions.unsubscribe}
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
            ['U', t.keys.unsubscribe],
            ['⌘K', t.keys.anything],
          ]}
        />
      )}
    </main>
  )
}

export const Route = createFileRoute('/_app/subscriptions')({
  component: SubscriptionsPage,
})
