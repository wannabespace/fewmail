import type { RouterOutputs } from '@fewmail/api/router'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@fewmail/ui/components/alert-dialog'
import { IconButton } from '@fewmail/ui/components/custom/icon-button'
import {
  SettingsGroup,
  SettingsRow,
} from '@fewmail/ui/components/custom/settings-group'
import { Empty, EmptyDescription } from '@fewmail/ui/components/empty'
import { Kbd } from '@fewmail/ui/components/kbd'
import {
  BubbleChatIcon,
  Delete02Icon,
  RepeatIcon,
} from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { useHotkey } from '@tanstack/react-hotkeys'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  createFileRoute,
  Link,
  redirect,
  useNavigate,
} from '@tanstack/react-router'
import { type } from 'arktype'
import { useState } from 'react'

import { KeyHints } from '~/components/key-hints'
import { ScheduleSettings } from '~/components/settings/schedule-settings'
import { upgradeStore } from '~/components/upgrade-dialog'
import { useDates, useT } from '~/lib/i18n'
import { orpc } from '~/lib/orpc'
import { warmQuery } from '~/lib/query-client'

type Chat = RouterOutputs['chats']['list'][number]

const ChatsPage = () => {
  const t = useT()
  const dates = useDates()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { data: chats, isPending } = useQuery(orpc.chats.list.queryOptions())
  const [cursor, setCursor] = useState(0)
  const [deleting, setDeleting] = useState<Chat | null>(null)
  const waiting = chats?.filter((chat) => chat.waiting) ?? []
  const rest = chats?.filter((chat) => !chat.waiting) ?? []
  const rows = [...waiting, ...rest]
  const active = rows[Math.min(cursor, rows.length - 1)]
  const remove = useMutation(
    orpc.chats.delete.mutationOptions({
      onMutate: ({ id }) =>
        queryClient.setQueryData(orpc.chats.list.queryKey(), (old) =>
          old?.filter((chat) => chat.id !== id)
        ),
      onSettled: () =>
        queryClient.invalidateQueries({ queryKey: orpc.chats.list.key() }),
    })
  )

  const open = (chat: Chat) =>
    navigate({ search: { chat: chat.id }, to: '/home' })
  const move = (by: number) =>
    setCursor((current) => Math.max(0, Math.min(rows.length - 1, current + by)))
  const keys = { enabled: !!active && !deleting }
  useHotkey('J', () => move(1), keys)
  useHotkey('ArrowDown', () => move(1), keys)
  useHotkey('K', () => move(-1), keys)
  useHotkey('ArrowUp', () => move(-1), keys)
  useHotkey('Enter', () => active && open(active), keys)
  useHotkey('Backspace', () => active && setDeleting(active), keys)

  const row = (chat: Chat) => (
    <SettingsRow
      key={chat.id}
      active={chat === active}
      icon={
        <HugeiconsIcon
          icon={chat.isScheduled ? RepeatIcon : BubbleChatIcon}
          strokeWidth={2}
        />
      }
      title={
        <Link to="/home" search={{ chat: chat.id }} data-mask>
          {chat.title}
        </Link>
      }
      description={dates.ago(chat.updatedAt)}
    >
      <IconButton
        icon={Delete02Icon}
        label={t.agent.deleteChat}
        shortcut={chat === active ? <Kbd>⌫</Kbd> : undefined}
        size="icon-sm"
        variant="ghost-destructive"
        onClick={() => setDeleting(chat)}
      />
    </SettingsRow>
  )

  return (
    <main className="flex flex-1 flex-col overflow-hidden">
      <div className="flex-1 overflow-y-auto">
        <div className="mx-auto flex max-w-3xl flex-col gap-8 px-10 pt-12 pb-16">
          <header className="flex flex-col gap-3">
            <h1 className="text-display font-serif tracking-tight">
              {t.agent.chats}
            </h1>
            <p className="text-brief text-foreground/85 font-serif">
              {t.agent.chatsLead}
            </p>
          </header>
          {waiting.length > 0 && (
            <SettingsGroup title={t.agent.waiting}>
              {waiting.map(row)}
            </SettingsGroup>
          )}
          <ScheduleSettings />
          {rest.length > 0 && (
            <SettingsGroup title={t.agent.chats}>{rest.map(row)}</SettingsGroup>
          )}
          {!isPending && rows.length === 0 && (
            <Empty>
              <EmptyDescription>{t.agent.noChats}</EmptyDescription>
            </Empty>
          )}
        </div>
      </div>
      {active && (
        <KeyHints
          hints={[
            ['J / K', t.keys.move],
            ['⏎', t.keys.open],
            ['⌫', t.agent.deleteChat],
          ]}
        />
      )}
      <AlertDialog
        open={deleting !== null}
        onOpenChange={(isOpen) => !isOpen && setDeleting(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t.agent.deleteChatConfirm}</AlertDialogTitle>
            <AlertDialogDescription>
              {t.agent.deleteChatHint}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t.boards.cancel}</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              onClick={() => {
                if (deleting) {
                  remove.mutate({ id: deleting.id })
                }
                setDeleting(null)
              }}
            >
              {t.agent.deleteChat}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </main>
  )
}

export const Route = createFileRoute('/_app/agent')({
  validateSearch: type({ 'chat?': 'string.uuid', 'thread?': 'string' }),
  beforeLoad: ({ context, preload, search }) => {
    if (context.me.plan.kind === 'free') {
      if (!preload) {
        upgradeStore.set('home')
      }
      throw redirect({ to: '/mail' })
    }
    // Chat links already sent to Telegram, WhatsApp and push open the chat on Home.
    if (search.chat || search.thread) {
      throw redirect({ search, to: '/home' })
    }
  },
  component: ChatsPage,
  loader: () =>
    Promise.all([
      warmQuery(orpc.chats.list.queryOptions()),
      warmQuery(orpc.schedules.list.queryOptions()),
    ]),
})
