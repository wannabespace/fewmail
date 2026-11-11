import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandList,
  CommandPaletteFooter,
  CommandPaletteInput,
  CommandPrimitive,
  CommandShortcut,
} from '@fewmail/ui/components/command'
import { themeStore } from '@fewmail/ui/theme-store'
import {
  Add01Icon,
  AiChat02Icon,
  ComputerIcon,
  CrownIcon,
  Moon02Icon,
  PencilEdit02Icon,
  SparklesIcon,
  Sun03Icon,
  ZapIcon,
} from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { useHotkey } from '@tanstack/react-hotkeys'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import { useState } from 'react'

import { useT } from '~/lib/i18n'
import { useHasAgent } from '~/lib/me'
import { orpc } from '~/lib/orpc'

import { AskAnswer } from './ask-answer'
import { newBoardStore } from './board-dialog'
import { useCompose } from './compose/compose-context'
import { visibleNavItems } from './nav'

const THEME_ICONS = {
  dark: Moon02Icon,
  light: Sun03Icon,
  system: ComputerIcon,
} as const

export const CommandMenu = ({
  onOpenChange: setOpen,
  open,
}: {
  onOpenChange: (open: boolean | ((open: boolean) => boolean)) => void
  open: boolean
}) => {
  const t = useT()
  const hasAgent = useHasAgent()
  const [search, setSearch] = useState('')
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const { openCompose } = useCompose()
  const ask = useMutation(orpc.ask.mutationOptions())
  const askedQuestion = ask.variables?.question

  const refreshBrief = useMutation(
    orpc.today.refreshBrief.mutationOptions({
      onSuccess: () =>
        queryClient.invalidateQueries({ queryKey: orpc.today.key() }),
    })
  )

  useHotkey('Mod+K', () => setOpen((value) => !value), { ignoreInputs: false })

  const run = (action: () => unknown) => {
    setOpen(false)
    setSearch('')
    ask.reset()
    action()
  }

  useHotkey('C', () => openCompose())

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandPrimitive>
        <CommandPaletteInput
          placeholder={t.command.placeholder}
          value={search}
          onValueChange={setSearch}
        />
        <CommandList className="m-1.5 max-h-96">
          <CommandEmpty>{t.command.nothingMatches}</CommandEmpty>
          {askedQuestion && (
            <AskAnswer
              question={askedQuestion}
              result={ask.data}
              onOpenThread={(threadId) =>
                run(() =>
                  navigate({ search: { thread: threadId }, to: '/mail' })
                )
              }
            />
          )}
          {hasAgent && search.trim() && (
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
          <CommandGroup heading={t.command.goTo}>
            {visibleNavItems(hasAgent).map((item) => (
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
        </CommandList>
        <CommandPaletteFooter />
      </CommandPrimitive>
    </CommandDialog>
  )
}
