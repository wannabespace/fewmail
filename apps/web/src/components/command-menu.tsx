import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandList,
  CommandPaletteFooter,
  CommandPaletteInput,
  CommandPrimitive,
  defaultFilter,
  CommandShortcut,
} from '@fewmail/ui/components/command'
import { themeStore } from '@fewmail/ui/theme-store'
import {
  Add01Icon,
  AiChat02Icon,
  CleanIcon,
  ComputerIcon,
  CrownIcon,
  DashboardSquare01Icon,
  Delete02Icon,
  Edit02Icon,
  GiftIcon,
  Moon02Icon,
  PencilEdit02Icon,
  Settings01Icon,
  SparklesIcon,
  Sun03Icon,
  Tag01Icon,
  TextAlignLeftIcon,
  ZapIcon,
} from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { useHotkey } from '@tanstack/react-hotkeys'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useNavigate, useRouterState } from '@tanstack/react-router'
import { useState } from 'react'

import { useT } from '~/lib/i18n'
import { useHasAgent } from '~/lib/me'
import { orpc } from '~/lib/orpc'

import { AskAnswer } from './ask-answer'
import { deletingBoardStore, newBoardStore } from './board-dialog'
import { clearOutStore } from './clear-out-dialog'
import { useCompose } from './compose/compose-context'
import { FOLDER_ITEMS, useVisibleNavItems } from './nav'

const THEME_ICONS = {
  dark: Moon02Icon,
  light: Sun03Icon,
  system: ComputerIcon,
} as const

// Asking spends a message: a matching command must win Enter, asking only when nothing else matches.
const rankAskLast = (value: string, search: string, keywords?: string[]) =>
  value.startsWith('ask ')
    ? Number.MIN_VALUE
    : defaultFilter(value, search, keywords)

export const CommandMenu = ({
  onOpenChange: setOpen,
  open,
}: {
  onOpenChange: (open: boolean | ((open: boolean) => boolean)) => void
  open: boolean
}) => {
  const t = useT()
  const hasAgent = useHasAgent()
  const navItems = useVisibleNavItems()
  const [search, setSearch] = useState('')
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const { openCompose } = useCompose()
  const ask = useMutation(orpc.ask.mutationOptions())
  const askedQuestion = ask.variables?.question
  const canAsk = hasAgent && Boolean(search.trim())

  const refreshBrief = useMutation(
    orpc.today.refreshBrief.mutationOptions({
      onSuccess: () =>
        queryClient.invalidateQueries({ queryKey: orpc.today.key() }),
    })
  )

  const pathname = useRouterState({
    select: (state) => state.location.pathname,
  })
  const { data: boards = [] } = useQuery(
    orpc.boards.list.queryOptions({ enabled: hasAgent })
  )
  const { data: labels = [] } = useQuery(orpc.mail.labels.queryOptions())
  const board = boards.find(({ id }) => pathname === `/boards/${id}`)
  const onBoard = (intent: 'chart' | 'describe' | 'rename' | 'settings') =>
    board &&
    navigate({
      params: { boardId: board.id },
      search: { do: intent },
      to: '/boards/$boardId',
    })
  const boardCommands = [
    ['rename', Edit02Icon, t.boards.rename],
    ['describe', TextAlignLeftIcon, t.boards.describe],
    ['settings', Settings01Icon, t.boards.settings.title],
    ['chart', Add01Icon, t.boards.chart.add],
  ] as const

  useHotkey('Mod+K', () => setOpen((value) => !value), { ignoreInputs: false })

  const run = (action: () => unknown) => {
    setOpen(false)
    setSearch('')
    ask.reset()
    action()
  }

  useHotkey('C', () => openCompose())

  return (
    <CommandDialog
      open={open}
      onOpenChange={setOpen}
      title={t.nav.search}
      description={hasAgent ? t.command.placeholder : t.command.commandsOnly}
    >
      <CommandPrimitive filter={rankAskLast}>
        <CommandPaletteInput
          placeholder={
            hasAgent ? t.command.placeholder : t.command.commandsOnly
          }
          value={search}
          onValueChange={setSearch}
        />
        <CommandList className="m-1.5 max-h-96">
          {!canAsk && <CommandEmpty>{t.command.nothingMatches}</CommandEmpty>}
          {askedQuestion && (
            <AskAnswer
              question={askedQuestion}
              result={ask.data}
              onOpenChat={(chatId) =>
                run(() => navigate({ search: { chat: chatId }, to: '/agent' }))
              }
              onOpenThread={(threadId) =>
                run(() =>
                  navigate({ search: { thread: threadId }, to: '/mail' })
                )
              }
            />
          )}
          <CommandGroup heading={t.command.goTo}>
            {navItems.map((item) => (
              <CommandItem
                key={item.to}
                onSelect={() => run(() => navigate({ to: item.to }))}
              >
                <HugeiconsIcon icon={item.icon} strokeWidth={2} />
                {t.nav[item.key]}
                <CommandShortcut>{item.sequence.join(' ')}</CommandShortcut>
              </CommandItem>
            ))}
          </CommandGroup>
          {board && (
            <CommandGroup heading={t.boards.menu}>
              {boardCommands.map(([intent, icon, label]) => (
                <CommandItem
                  key={intent}
                  onSelect={() => run(() => onBoard(intent))}
                >
                  <HugeiconsIcon icon={icon} strokeWidth={2} />
                  {label}
                </CommandItem>
              ))}
              <CommandItem
                onSelect={() => run(() => deletingBoardStore.set(board))}
              >
                <HugeiconsIcon icon={Delete02Icon} strokeWidth={2} />
                {t.boards.delete}
              </CommandItem>
            </CommandGroup>
          )}
          {boards.length > 0 && (
            <CommandGroup heading={t.nav.boards}>
              {boards.map((item, index) => (
                <CommandItem
                  key={item.id}
                  value={`board ${item.id} ${item.name}`}
                  onSelect={() =>
                    run(() =>
                      navigate({
                        params: { boardId: item.id },
                        to: '/boards/$boardId',
                      })
                    )
                  }
                >
                  <HugeiconsIcon icon={DashboardSquare01Icon} strokeWidth={2} />
                  <span data-mask>{item.name}</span>
                  {index < 9 && (
                    <CommandShortcut>G {index + 1}</CommandShortcut>
                  )}
                </CommandItem>
              ))}
            </CommandGroup>
          )}
          <CommandGroup heading={t.nav.folders}>
            {FOLDER_ITEMS.map(({ filter, icon }) => (
              <CommandItem
                key={filter}
                onSelect={() =>
                  run(() => navigate({ search: { filter }, to: '/mail' }))
                }
              >
                <HugeiconsIcon icon={icon} strokeWidth={2} />
                {t.mail.filter[filter]}
              </CommandItem>
            ))}
            {labels.map(({ name, query }) => (
              <CommandItem
                key={name}
                value={`label ${name}`}
                onSelect={() =>
                  run(() => navigate({ search: { q: query }, to: '/mail' }))
                }
              >
                <HugeiconsIcon icon={Tag01Icon} strokeWidth={2} />
                <span data-mask>{name}</span>
              </CommandItem>
            ))}
          </CommandGroup>
          <CommandGroup heading={hasAgent ? t.command.agent : t.nav.mail}>
            <CommandItem onSelect={() => run(() => openCompose())}>
              <HugeiconsIcon icon={PencilEdit02Icon} strokeWidth={2} />
              {t.command.compose}
              <CommandShortcut>C</CommandShortcut>
            </CommandItem>
            {hasAgent && (
              <CommandItem onSelect={() => run(() => refreshBrief.mutate())}>
                <HugeiconsIcon icon={SparklesIcon} strokeWidth={2} />
                {t.command.rewriteBrief}
              </CommandItem>
            )}
            <CommandItem
              onSelect={() => run(() => navigate({ to: '/wrapped' }))}
            >
              <HugeiconsIcon icon={GiftIcon} strokeWidth={2} />
              {t.wrapped.title.year}
            </CommandItem>
            <CommandItem onSelect={() => run(() => clearOutStore.set(true))}>
              <HugeiconsIcon icon={CleanIcon} strokeWidth={2} />
              {t.clearOut.title}
            </CommandItem>
            <CommandItem
              onSelect={() =>
                run(() => navigate({ search: { new: true }, to: '/rules' }))
              }
            >
              <HugeiconsIcon icon={ZapIcon} strokeWidth={2} />
              {t.command.teachRule}
            </CommandItem>
            {hasAgent && (
              <CommandItem onSelect={() => run(() => newBoardStore.set(true))}>
                <HugeiconsIcon icon={Add01Icon} strokeWidth={2} />
                {t.nav.newBoard}
              </CommandItem>
            )}
            {!hasAgent && (
              <CommandItem
                onSelect={() => run(() => navigate({ to: '/settings' }))}
              >
                <HugeiconsIcon icon={CrownIcon} strokeWidth={2} />
                {t.command.upgrade}
              </CommandItem>
            )}
          </CommandGroup>
          <CommandGroup heading={t.command.appearance}>
            {(['light', 'dark', 'system'] as const).map((theme) => (
              <CommandItem
                key={theme}
                onSelect={() => run(() => themeStore.set(theme))}
              >
                <HugeiconsIcon icon={THEME_ICONS[theme]} strokeWidth={2} />
                {t.command.theme[theme]}
              </CommandItem>
            ))}
          </CommandGroup>
          {canAsk && (
            <CommandGroup forceMount heading={t.command.mail}>
              <CommandItem
                forceMount
                value={`ask ${search}`}
                onSelect={() => ask.mutate({ question: search.trim() })}
              >
                <HugeiconsIcon icon={AiChat02Icon} strokeWidth={2} />
                {t.ask.label(search.trim())}
              </CommandItem>
            </CommandGroup>
          )}
        </CommandList>
        <CommandPaletteFooter labels={t.keys} />
      </CommandPrimitive>
    </CommandDialog>
  )
}
