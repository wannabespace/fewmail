import type { RouterOutputs } from '@fewmail/api/router'
import { listSearch } from '@fewmail/shared/agent'
import { Button } from '@fewmail/ui/components/button'
import { LoadingContent } from '@fewmail/ui/components/custom/loading-content'
import {
  SettingsGroup,
  SettingsRow,
  SettingsRows,
} from '@fewmail/ui/components/custom/settings-group'
import {
  Empty,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@fewmail/ui/components/empty'
import { Kbd } from '@fewmail/ui/components/kbd'
import { Spinner } from '@fewmail/ui/components/spinner'
import { cn } from '@fewmail/ui/lib/utils'
import { MailRemove01Icon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { useHotkey } from '@tanstack/react-hotkeys'
import {
  useInfiniteQuery,
  useMutation,
  useMutationState,
  useQuery,
} from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import { useVirtualizer } from '@tanstack/react-virtual'
import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import type { CSSProperties } from 'react'
import { toast } from 'sonner'

import { confirm } from '~/components/confirm-dialog'
import { KeyHints } from '~/components/key-hints'
import { SenderAvatar } from '~/components/sender-avatar'
import { useIsUnderNotice } from '~/components/thread-link'
import { StackView } from '~/components/thread-view'
import { useT } from '~/lib/i18n'
import { offerBlock } from '~/lib/offer-block'
import { orpc, refetchChanged } from '~/lib/orpc'
import { posthog } from '~/lib/posthog'
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
  const t = useT()
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
      {isLoading && <Spinner label={t.nav.loading} />}
    </div>
  )
}

const RowsGap = ({ height }: { height: number }) => (
  <div
    aria-hidden
    className="h-(--gap)"
    style={{ '--gap': `${height}px` } as CSSProperties}
  />
)

/** A sender's emails beside the list, newest first, as one stack: N / P step through them, U leaves the list. */
const SubscriptionStack = ({
  isLeaving,
  onClose,
  onLeave,
  row,
}: {
  isLeaving: boolean
  onClose: () => void
  onLeave: () => void
  row: Subscription
}) => {
  const t = useT()
  const { data } = useQuery(
    orpc.mail.list.queryOptions({
      input: { filter: 'inbox', search: listSearch(row) },
    })
  )
  if (!data) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <Spinner label={t.nav.loading} />
      </div>
    )
  }
  return (
    <StackView
      emails={data.map(({ analysis, message }) => ({
        ...message,
        extracted: analysis?.extracted,
      }))}
      isSnoozed={false}
      place="inbox"
      onClose={onClose}
      onDone={() => {
        onClose()
        refetchChanged(['subscriptions'])
      }}
    >
      <Button
        size="sm"
        variant="secondary"
        disabled={isLeaving}
        onClick={onLeave}
        shortcut={<Kbd>U</Kbd>}
      >
        <LoadingContent loading={isLeaving}>
          {t.subscriptions.unsubscribe}
        </LoadingContent>
      </Button>
    </StackView>
  )
}

const hintsOf = (
  t: ReturnType<typeof useT>,
  isActive: boolean,
  isStackOpen: boolean
): [string, string][] => {
  if (!isActive) {
    return [['J / K', t.keys.move]]
  }
  return isStackOpen
    ? [
        ['J / K', t.keys.move],
        ['N / P', t.keys.stackEmail],
        ['U', t.keys.unsubscribe],
        ['esc', t.keys.close],
      ]
    : [
        ['J / K', t.keys.move],
        ['⏎', t.keys.open],
        ['U', t.keys.unsubscribe],
      ]
}

/** A row's height until it is measured. */
const ROW_SIZE = 68

const SubscriptionsPage = () => {
  const t = useT()
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isPending } =
    useInfiniteQuery(subscriptionPages)
  const [cursor, setCursor] = useState<number | null>(null)
  const [isOpen, setIsOpen] = useState(false)
  const rows = data?.pages.flatMap((page) => page.rows) ?? []
  const total = data?.pages[0]?.total ?? 0
  const activeIndex = cursor === null ? -1 : Math.min(cursor, rows.length - 1)
  const active = rows[activeIndex]
  const scrollerRef = useRef<HTMLDivElement>(null)
  const listRef = useRef<HTMLDivElement>(null)
  const [listTop, setListTop] = useState(0)
  const hasRows = rows.length > 0
  useLayoutEffect(() => {
    const list = listRef.current
    const scroller = scrollerRef.current
    if (list && scroller) {
      setListTop(
        list.getBoundingClientRect().top -
          scroller.getBoundingClientRect().top +
          scroller.scrollTop
      )
    }
  }, [hasRows])
  // oxlint-disable-next-line react/incompatible-library -- the compiler skips this page, which re-renders on every scroll
  const virtualizer = useVirtualizer({
    count: rows.length,
    estimateSize: () => ROW_SIZE,
    getItemKey: (index) => rows[index]?.messageId ?? index,
    getScrollElement: () => scrollerRef.current,
    overscan: 10,
    scrollMargin: listTop,
  })
  useEffect(() => {
    if (activeIndex !== -1) {
      virtualizer.scrollToIndex(activeIndex)
    }
  }, [activeIndex, virtualizer])
  const shown = virtualizer.getVirtualItems()
  const belowHeight =
    virtualizer.getTotalSize() - ((shown.at(-1)?.end ?? listTop) - listTop)

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
  const open = (index: number) => {
    setCursor(index)
    setIsOpen(true)
    posthog.capture('subscription_stack_opened')
  }
  const isStackOpen = isOpen && !!active
  const isUnderNotice = useIsUnderNotice()

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
  useHotkey('O', () => open(activeIndex), rowKeys)
  useHotkey('Enter', () => open(activeIndex), rowKeys)
  useHotkey(
    'Escape',
    () => (isStackOpen ? setIsOpen(false) : setCursor(null)),
    rowKeys
  )

  return (
    <main className="flex flex-1 overflow-hidden">
      <div className="flex min-w-0 flex-1 flex-col">
        <div ref={scrollerRef} className="under-notice flex-1 overflow-y-auto">
          <div className="mx-auto flex max-w-3xl flex-col gap-8 px-10 pt-12 pb-16 max-md:px-4 max-md:pt-6">
            <header className="flex flex-col gap-3">
              <h1 className="text-display font-serif tracking-tight">
                {t.subscriptions.title}
              </h1>
              <p className="text-brief text-foreground/85 font-serif text-balance">
                {t.subscriptions.lead}
              </p>
            </header>

            {!isPending && rows.length === 0 && (
              <Empty>
                <EmptyHeader>
                  <EmptyMedia variant="muted">
                    <HugeiconsIcon icon={MailRemove01Icon} />
                  </EmptyMedia>
                  <EmptyTitle>{t.subscriptions.empty}</EmptyTitle>
                </EmptyHeader>
              </Empty>
            )}
            {rows.length > 0 && (
              <SettingsGroup title={t.subscriptions.count(total)}>
                <div ref={listRef} className="flex flex-col">
                  <RowsGap height={(shown[0]?.start ?? listTop) - listTop} />
                  <SettingsRows
                    listed={new Set(rows.map(({ messageId }) => messageId))}
                  >
                    {shown.map((item) => {
                      const row = rows[item.index]
                      return (
                        row && (
                          <SettingsRow
                            key={item.key}
                            rowKey={row.messageId}
                            ref={virtualizer.measureElement}
                            data-index={item.index}
                            active={row === active}
                            trigger={
                              <button
                                type="button"
                                aria-label={row.fromName ?? row.fromEmail}
                                onClick={() => open(item.index)}
                              />
                            }
                            iconVariant="avatar"
                            icon={<SenderAvatar sender={row} size="sm" />}
                            title={
                              <span data-mask>
                                {row.fromName ?? row.fromEmail}
                              </span>
                            }
                            description={
                              <>
                                <span data-mask>{row.fromEmail}</span> ·{' '}
                                {t.cleanup.emails(row.count)},{' '}
                                {t.subscriptions.opened(row.opened)}
                                {row.leftShare !== null &&
                                  ` · ${t.subscriptions.leftBy(Math.round(row.leftShare * 100))}`}
                              </>
                            }
                          >
                            <Button
                              size="sm"
                              variant="ghost"
                              disabled={leaving.has(row.messageId)}
                              onClick={() => leave(row)}
                              shortcut={row === active && <Kbd>U</Kbd>}
                            >
                              <LoadingContent
                                loading={leaving.has(row.messageId)}
                              >
                                {t.subscriptions.unsubscribe}
                              </LoadingContent>
                            </Button>
                          </SettingsRow>
                        )
                      )
                    })}
                  </SettingsRows>
                  {/* Only while rows are left below: after the last row, the spacer would take its last:border-b-0. */}
                  {belowHeight > 0 && <RowsGap height={belowHeight} />}
                </div>
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
          <KeyHints hints={hintsOf(t, !!active, isStackOpen)} />
        )}
      </div>
      {isStackOpen && (
        <aside
          className={cn(
            'bg-background mt-(--notice-height) flex w-160 max-w-[60%] shrink-0 flex-col border-l',
            isUnderNotice &&
              'mt-[calc(var(--notice-height)+--spacing(2))] rounded-tl-xl border-t'
          )}
        >
          <SubscriptionStack
            key={active.messageId}
            isLeaving={leaving.has(active.messageId)}
            row={active}
            onClose={() => setIsOpen(false)}
            onLeave={() => leave(active)}
          />
        </aside>
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
