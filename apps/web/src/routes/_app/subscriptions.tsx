import type { RouterOutputs } from '@fewmail/api/router'
import { listSearch } from '@fewmail/shared/agent'
import { Avatar, AvatarFallback } from '@fewmail/ui/components/avatar'
import { Button } from '@fewmail/ui/components/button'
import { LoadingContent } from '@fewmail/ui/components/custom/loading-content'
import {
  SettingsGroup,
  SettingsRow,
} from '@fewmail/ui/components/custom/settings-group'
import { Empty, EmptyDescription } from '@fewmail/ui/components/empty'
import { Kbd } from '@fewmail/ui/components/kbd'
import { Spinner } from '@fewmail/ui/components/spinner'
import { useHotkey } from '@tanstack/react-hotkeys'
import {
  useInfiniteQuery,
  useMutation,
  useMutationState,
} from '@tanstack/react-query'
import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { useEffect, useRef, useState } from 'react'
import { toast } from 'sonner'

import { confirm } from '~/components/confirm-dialog'
import { KeyHints } from '~/components/key-hints'
import { useT } from '~/lib/i18n'
import { offerBlock } from '~/lib/offer-block'
import { orpc, refetchChanged } from '~/lib/orpc'
import { queryClient } from '~/lib/query-client'

type Subscription = RouterOutputs['subscriptions']['list']['rows'][number]

const subscriptionPages = orpc.subscriptions.list.infiniteOptions({
  getNextPageParam: ({ nextOffset }) => nextOffset ?? undefined,
  initialPageParam: 0,
  input: (offset: number) => ({ offset }),
})

/** Watches the list's end inside the page's scroller and asks for the next page before it shows. */
const NextPageLoader = ({
  hasMore,
  isLoading,
  load,
}: {
  hasMore: boolean
  isLoading: boolean
  load: () => unknown
}) => {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const node = ref.current
    if (!node || !hasMore || isLoading) {
      return
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          load()
        }
      },
      { root: node.closest('main > div'), rootMargin: '0px 0px 600px 0px' }
    )
    observer.observe(node)
    return () => observer.disconnect()
  }, [hasMore, isLoading, load])
  return (
    <div ref={ref} hidden={!hasMore} className="flex justify-center py-3">
      {isLoading && <Spinner />}
    </div>
  )
}

const SubscriptionsPage = () => {
  const t = useT()
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isPending } =
    useInfiniteQuery(subscriptionPages)
  const [cursor, setCursor] = useState<number | null>(null)
  const rows = data?.pages.flatMap((page) => page.rows) ?? []
  const total = data?.pages[0]?.total ?? 0
  const active =
    cursor === null ? undefined : rows[Math.min(cursor, rows.length - 1)]

  const navigate = useNavigate()
  const unsubscribe = useMutation(
    orpc.subscriptions.unsubscribe.mutationOptions({
      // Leaving a list can take a while (its page, a mailto): the row stays, spinning, until the answer.
      onMutate: ({ messageId }) => {
        toast.loading(t.mail.unsubscribing, { id: messageId })
      },
      onError: (_, { messageId }) => toast.dismiss(messageId),
      onSuccess: ({ link, unsubscribed }, { messageId }) => {
        queryClient.setQueryData(
          subscriptionPages.queryKey,
          (previous) =>
            previous && {
              ...previous,
              pages: previous.pages.map((page) => ({
                ...page,
                rows: page.rows.filter((row) => row.messageId !== messageId),
                total: page.total - 1,
              })),
            }
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
      onConfirm: () =>
        unsubscribe.mutate(
          { messageId: row.messageId },
          {
            onSuccess: ({ ignoresUnsubscribe }) =>
              ignoresUnsubscribe &&
              offerBlock(t, row.fromName ?? row.fromEmail, row.messageId),
          }
        ),
      title: t.mail.unsubscribeConfirm(row.fromName ?? row.fromEmail),
      variant: 'warning',
    })
  const show = (row?: Subscription) =>
    row && navigate({ search: { q: listSearch(row) }, to: '/mail' })

  const listKeys = { enabled: rows.length > 0 }
  const rowKeys = { enabled: Boolean(active) }
  const step = (by: number) =>
    setCursor((index) =>
      Math.max(0, Math.min(rows.length - 1, (index ?? -1) + by))
    )
  useHotkey('J', () => step(1), listKeys)
  useHotkey('ArrowDown', () => step(1), listKeys)
  useHotkey('K', () => step(-1), listKeys)
  useHotkey('ArrowUp', () => step(-1), listKeys)
  useHotkey('U', () => leave(active), rowKeys)
  useHotkey('O', () => show(active), rowKeys)
  useHotkey('Enter', () => show(active), rowKeys)

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
            <SettingsGroup title={t.subscriptions.count(total)}>
              {rows.map((row) => (
                <SettingsRow
                  key={row.messageId}
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
                    <Link to="/mail" search={{ q: listSearch(row) }} data-mask>
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
          <NextPageLoader
            hasMore={hasNextPage}
            isLoading={isFetchingNextPage}
            load={fetchNextPage}
          />
        </div>
      </div>
      {rows.length > 0 && (
        <KeyHints
          hints={
            active
              ? [
                  ['J / K', t.keys.move],
                  ['⏎', t.keys.open],
                  ['U', t.keys.unsubscribe],
                ]
              : [['J / K', t.keys.move]]
          }
        />
      )}
    </main>
  )
}

export const Route = createFileRoute('/_app/subscriptions')({
  component: SubscriptionsPage,
  loader: () =>
    queryClient
      .ensureInfiniteQueryData({
        ...subscriptionPages,
        revalidateIfStale: true,
      })
      .catch(() => null),
})
