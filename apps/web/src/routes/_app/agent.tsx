import { IconButton } from '@fewmail/ui/components/custom/icon-button'
import {
  ResizableGroup,
  ResizablePanel,
  ResizableSeparator,
} from '@fewmail/ui/components/custom/resizable'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from '@fewmail/ui/components/dropdown-menu'
import { Kbd } from '@fewmail/ui/components/kbd'
import { Tabs, TabsList, TabsTrigger } from '@fewmail/ui/components/tabs'
import {
  Add01Icon,
  Clock01Icon,
  Delete02Icon,
} from '@hugeicons/core-free-icons'
import { useHotkey } from '@tanstack/react-hotkeys'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { createFileRoute, redirect, useNavigate } from '@tanstack/react-router'
import { type } from 'arktype'
import { useEffect, useState } from 'react'
import { useSubscription } from 'seitu/react'
import { createWebStorageValue } from 'seitu/web'

import { AgentChat } from '~/components/agent-chat'
import { KeyHints } from '~/components/key-hints'
import { ThreadView } from '~/components/thread-view'
import { upgradeStore } from '~/components/upgrade-dialog'
import { useDates, useT } from '~/lib/i18n'
import { orpc } from '~/lib/orpc'
import { warmQuery } from '~/lib/query-client'

const READER_WIDTH = { default: 560, max: '60%', min: 420 } as const

const readerWidthStore = createWebStorageValue({
  defaultValue: READER_WIDTH.default as number,
  key: 'fewmail.agent-reader-width',
  schema: type('number'),
  type: 'localStorage',
})

const openChatsStore = createWebStorageValue({
  defaultValue: [] as string[],
  key: 'fewmail.agent-tabs',
  schema: type('string[]'),
  type: 'localStorage',
})

const AgentPage = () => {
  const t = useT()
  const dates = useDates()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { chat, thread } = Route.useSearch()
  const [draftId, setDraftId] = useState(() => crypto.randomUUID())
  const chatId = chat ?? draftId
  const isSaved = chat !== undefined && chat !== draftId
  const readerWidth = useSubscription(readerWidthStore)
  const [threadList, setThreadList] = useState<string[]>([])
  const threadIndex = thread ? threadList.indexOf(thread) : -1

  const { data: saved } = useQuery(
    orpc.chats.get.queryOptions({
      enabled: isSaved,
      input: { id: chatId },
    })
  )
  const { data: chats = [], isSuccess } = useQuery(
    orpc.chats.list.queryOptions()
  )
  const openIds = useSubscription(openChatsStore)
  const tabIds = [
    ...openIds.filter(
      (id) =>
        id === chatId || !isSuccess || chats.some((item) => item.id === id)
    ),
    ...(openIds.includes(chatId) ? [] : [chatId]),
  ]
  const titleOf = (id: string) =>
    chats.find((item) => item.id === id)?.title ?? t.agent.newChat

  useEffect(() => {
    const open = openChatsStore.get()
    if (chat && !open.includes(chat)) {
      openChatsStore.set([...open, chat])
    }
  }, [chat])

  const startChat = () => {
    setDraftId(crypto.randomUUID())
    void navigate({ search: {}, to: '/agent' })
  }
  const openChat = (id: string) =>
    navigate({
      search: { chat: id === draftId && !chat ? undefined : id },
      to: '/agent',
    })
  const stepChat = (offset: number) => {
    const next = tabIds[tabIds.indexOf(chatId) + offset]
    if (next) {
      void openChat(next)
    }
  }
  const closeChat = (id: string) => {
    openChatsStore.set(openIds.filter((item) => item !== id))
    if (id !== chatId) {
      return
    }
    const index = tabIds.indexOf(id)
    const next = tabIds[index + 1] ?? tabIds[index - 1]
    if (next) {
      void openChat(next)
    } else {
      startChat()
    }
  }
  const showThread = (id: string | undefined) =>
    navigate({
      search: (prev) => ({ ...prev, thread: id }),
      to: '/agent',
    })
  const closeThread = () => showThread(undefined)
  const stepThread = (offset: number) => {
    const next = threadList[threadIndex + offset]
    if (next) {
      void showThread(next)
    }
  }
  const remove = useMutation(
    orpc.chats.delete.mutationOptions({
      onMutate: ({ id }) => {
        closeChat(id)
        queryClient.setQueryData(orpc.chats.list.queryKey(), (old) =>
          old?.filter((item) => item.id !== id)
        )
      },
      onSettled: () =>
        queryClient.invalidateQueries({ queryKey: orpc.chats.list.key() }),
    })
  )

  useHotkey('Mod+Shift+O', startChat, { ignoreInputs: false })
  useHotkey('Alt+ArrowUp', () => stepChat(-1), { ignoreInputs: false })
  useHotkey('Alt+ArrowDown', () => stepChat(1), { ignoreInputs: false })
  useHotkey('Escape', closeThread, { enabled: Boolean(thread) })
  useHotkey('J', () => stepThread(1))
  useHotkey('K', () => stepThread(-1))

  return (
    <ResizableGroup className="flex-1">
      <ResizablePanel className="flex min-w-0 flex-col">
        <header className="flex h-14 shrink-0 items-center gap-1 px-5">
          <Tabs
            className="min-w-0"
            value={chatId}
            onValueChange={(id: string) => openChat(id)}
          >
            <TabsList
              variant="pill"
              className="scroll-fade-x max-w-full scrollbar-none justify-start overflow-x-auto"
            >
              {tabIds.map((id) => (
                <TabsTrigger
                  key={id}
                  value={id}
                  className="max-w-52"
                  closeLabel={t.agent.closeChat}
                  onClose={() => closeChat(id)}
                >
                  <span data-mask className="truncate">
                    {titleOf(id)}
                  </span>
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
          <IconButton
            className="shrink-0"
            icon={Add01Icon}
            label={t.agent.newChat}
            shortcut={<Kbd>⇧⌘O</Kbd>}
            size="icon-sm"
            variant="ghost-muted"
            onClick={startChat}
          />
          <div className="ml-auto flex shrink-0 items-center">
            <DropdownMenu>
              <DropdownMenuTrigger
                render={
                  <IconButton
                    icon={Clock01Icon}
                    label={t.agent.chats}
                    size="icon-sm"
                    variant="ghost-muted"
                  />
                }
              />
              <DropdownMenuContent align="end" className="w-80">
                {chats.length === 0 && (
                  <DropdownMenuItem disabled>
                    {t.agent.noChats}
                  </DropdownMenuItem>
                )}
                {chats.map((item) => (
                  <DropdownMenuItem
                    key={item.id}
                    onClick={() =>
                      navigate({ search: { chat: item.id }, to: '/agent' })
                    }
                  >
                    <span data-mask className="min-w-0 truncate">
                      {item.title}
                    </span>
                    <DropdownMenuShortcut>
                      {dates.ago(item.updatedAt)}
                    </DropdownMenuShortcut>
                    <IconButton
                      className="-mr-1 opacity-0 group-hover/dropdown-menu-item:opacity-100 group-focus/dropdown-menu-item:opacity-100"
                      icon={Delete02Icon}
                      label={t.agent.deleteChat}
                      size="icon-2xs"
                      variant="ghost-destructive"
                      onClick={(event) => {
                        event.stopPropagation()
                        remove.mutate({ id: item.id })
                      }}
                    />
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>
        {isSaved && !saved ? (
          <div className="flex-1" />
        ) : (
          <AgentChat
            key={chatId}
            chatId={chatId}
            initialMessages={saved?.messages ?? []}
            thread={thread}
            onThreadList={setThreadList}
            onSend={() => {
              if (!chat) {
                void navigate({
                  replace: true,
                  search: { chat: chatId },
                  to: '/agent',
                })
              }
            }}
          />
        )}
        <KeyHints
          hints={[
            ['⏎', t.keys.send],
            ['⌘⏎', t.keys.approve],
            ...(threadList.length > 0 && !thread
              ? [['J', t.keys.open] as [string, string]]
              : []),
            ['⇧⌘O', t.agent.newChat],
            ...(tabIds.length > 1
              ? [['⌥↑↓', t.agent.switchChat] as [string, string]]
              : []),
          ]}
        />
      </ResizablePanel>
      {thread && (
        <>
          <ResizableSeparator />
          <ResizablePanel
            className="flex"
            size={readerWidth}
            minSize={READER_WIDTH.min}
            maxSize={READER_WIDTH.max}
            onSizeChange={(width) => readerWidthStore.set(width)}
          >
            <div className="bg-background flex min-w-0 flex-1 flex-col">
              <ThreadView
                key={thread}
                isSnoozed={false}
                threadId={thread}
                onClose={closeThread}
                onDone={() => {
                  void showThread(threadList[threadIndex + 1])
                }}
              />
              <KeyHints
                hints={[
                  ['R', t.keys.reply],
                  ['E', t.keys.archive],
                  ['/', t.keys.ask],
                  ...(threadIndex === -1
                    ? []
                    : [['J / K', t.keys.move] as [string, string]]),
                  ['esc', t.keys.close],
                ]}
              />
            </div>
          </ResizablePanel>
        </>
      )}
    </ResizableGroup>
  )
}

export const Route = createFileRoute('/_app/agent')({
  beforeLoad: ({ context, preload }) => {
    if (context.me.plan.kind === 'free') {
      if (!preload) {
        upgradeStore.set('agent')
      }
      throw redirect({ to: '/mail' })
    }
  },
  component: AgentPage,
  validateSearch: type({ 'chat?': 'string.uuid', 'thread?': 'string' }),
  loaderDeps: ({ search }) => ({ chat: search.chat }),
  loader: async ({ deps: { chat } }) => {
    const chats = await warmQuery(orpc.chats.list.queryOptions())
    // A chat that is still being started is not saved yet: asking for it would answer "not found".
    if (chat && chats?.some(({ id }) => id === chat)) {
      await warmQuery(orpc.chats.get.queryOptions({ input: { id: chat } }))
    }
  },
})
