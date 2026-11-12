import { Button } from '@fewmail/ui/components/button'
import {
  ResizableGroup,
  ResizablePanel,
  ResizableSeparator,
} from '@fewmail/ui/components/custom/resizable'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from '@fewmail/ui/components/dropdown-menu'
import { Kbd } from '@fewmail/ui/components/kbd'
import { useHotkey } from '@tanstack/react-hotkeys'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { createFileRoute, redirect, useNavigate } from '@tanstack/react-router'
import { type } from 'arktype'
import { useState } from 'react'
import { useSubscription } from 'seitu/react'
import { createWebStorageValue } from 'seitu/web'

import { AgentChat } from '~/components/agent-chat'
import { KeyHints } from '~/components/key-hints'
import { ThreadView } from '~/components/thread-view'
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
  const { data: chats = [] } = useQuery(orpc.chats.list.queryOptions())
  const current = chats.find(({ id }) => id === chatId)

  const startChat = () => {
    setDraftId(crypto.randomUUID())
    void navigate({ search: {}, to: '/agent' })
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
        startChat()
        queryClient.setQueryData(orpc.chats.list.queryKey(), (old) =>
          old?.filter((item) => item.id !== id)
        )
      },
      onSettled: () =>
        queryClient.invalidateQueries({ queryKey: orpc.chats.list.key() }),
    })
  )

  useHotkey('Mod+Shift+O', startChat, { ignoreInputs: false })
  useHotkey('Escape', closeThread, { enabled: Boolean(thread) })
  useHotkey('J', () => stepThread(1))
  useHotkey('K', () => stepThread(-1))

  return (
    <ResizableGroup className="flex-1">
      <ResizablePanel className="flex min-w-0 flex-col">
        <header className="flex h-14 shrink-0 items-center gap-4 px-5">
          <span
            data-mask
            className="text-muted-foreground min-w-0 truncate text-sm"
          >
            {current?.title}
          </span>
          <div className="ml-auto flex shrink-0 items-center gap-1">
            <DropdownMenu>
              <DropdownMenuTrigger
                render={<Button size="sm" variant="ghost-muted" />}
              >
                {t.agent.chats}
              </DropdownMenuTrigger>
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
                  </DropdownMenuItem>
                ))}
                {current && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      variant="destructive"
                      onClick={() => remove.mutate({ id: current.id })}
                    >
                      {t.agent.deleteChat}
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
            <Button size="sm" variant="ghost-muted" onClick={startChat}>
              {t.agent.newChat} <Kbd>⇧⌘O</Kbd>
            </Button>
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
  beforeLoad: ({ context }) => {
    if (context.me.plan.kind === 'free') {
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
