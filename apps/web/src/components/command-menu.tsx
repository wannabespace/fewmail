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
import { useHotkey } from '@tanstack/react-hotkeys'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import { useState } from 'react'
import { toast } from 'sonner'

import { useT } from '~/lib/i18n'
import { useHasAgent } from '~/lib/me'
import { orpc } from '~/lib/orpc'

import { AskAnswer } from './ask-answer'
import { useCompose } from './compose/compose-context'
import { visibleNavItems } from './nav'

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

  const sync = useMutation(
    orpc.mail.sync.mutationOptions({
      onSuccess: () => {
        void queryClient.invalidateQueries()
        toast.success(t.command.inboxUpToDate)
      },
    })
  )
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
          {search.trim() && (
            <CommandGroup heading={t.command.mail}>
              {hasAgent && (
                <CommandItem
                  value={`ask ${search}`}
                  onSelect={() => ask.mutate({ question: search.trim() })}
                >
                  {t.ask.label(search.trim())}
                </CommandItem>
              )}
              <CommandItem
                value={`search ${search}`}
                onSelect={() =>
                  run(() =>
                    navigate({ search: { q: search.trim() }, to: '/mail' })
                  )
                }
              >
                {t.command.searchFor(search.trim())}
              </CommandItem>
            </CommandGroup>
          )}
          <CommandGroup heading={t.command.goTo}>
            {visibleNavItems(hasAgent).map((item) => (
              <CommandItem
                key={item.to}
                onSelect={() => run(() => navigate({ to: item.to }))}
              >
                {t.nav[item.key]}
                <CommandShortcut>{item.sequence.join(' ')}</CommandShortcut>
              </CommandItem>
            ))}
          </CommandGroup>
          <CommandGroup heading={hasAgent ? t.command.agent : t.nav.mail}>
            <CommandItem onSelect={() => run(() => openCompose())}>
              {t.command.compose}
              <CommandShortcut>C</CommandShortcut>
            </CommandItem>
            <CommandItem onSelect={() => run(() => sync.mutate())}>
              {t.command.checkMail}
            </CommandItem>
            {hasAgent && (
              <CommandItem onSelect={() => run(() => refreshBrief.mutate())}>
                {t.command.rewriteBrief}
              </CommandItem>
            )}
            <CommandItem
              onSelect={() =>
                run(() => navigate({ search: { new: true }, to: '/rules' }))
              }
            >
              {t.command.teachRule}
            </CommandItem>
            {!hasAgent && (
              <CommandItem
                onSelect={() => run(() => navigate({ to: '/settings' }))}
              >
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
