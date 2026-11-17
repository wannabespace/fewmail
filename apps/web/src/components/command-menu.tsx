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
  AiChat02Icon,
  CleanIcon,
  ComputerIcon,
  CrownIcon,
  GiftIcon,
  Moon02Icon,
  DashboardSquare01Icon,
  PencilEdit02Icon,
  Sun03Icon,
  Tag01Icon,
  ZapIcon,
} from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { useHotkey } from '@tanstack/react-hotkeys'
import { useMutation, useQuery } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import { useState } from 'react'

import { useT } from '~/lib/i18n'
import { useHasAgent } from '~/lib/me'
import { orpc } from '~/lib/orpc'

import { AskAnswer } from './ask-answer'
import { clearOutStore } from './clear-out-dialog'
import { useCompose } from './compose/compose-context'
import { FOLDER_ITEMS, useGoTo, useNavItems } from './nav'
import { upgradeStore } from './upgrade-dialog'

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
  onOpenChange: (open: boolean) => void
  open: boolean
}) => {
  const t = useT()
  const hasAgent = useHasAgent()
  const [search, setSearch] = useState('')
  const navigate = useNavigate()

  const { openCompose } = useCompose()
  const ask = useMutation(orpc.ask.mutationOptions())
  const canAsk = Boolean(search.trim())
  // The answer's sources are forced to the top of the list, so once the text changes they would take Enter from the new request.
  const askedQuestion =
    ask.variables?.question === search.trim()
      ? ask.variables.question
      : undefined
  const goTo = useGoTo()
  const navItems = useNavItems()

  const { data: labels = [] } = useQuery(orpc.mail.labels.queryOptions())

  useHotkey('Mod+K', () => setOpen(!open), { ignoreInputs: false })

  const run = (action: () => unknown) => {
    setOpen(false)
    setSearch('')
    ask.reset()
    action()
  }

  useHotkey('C', () => openCompose())
  const openBoard = () => navigate({ search: { page: 'board' }, to: '/home' })
  useHotkey(['G', 'B'], openBoard)

  return (
    <CommandDialog
      open={open}
      onOpenChange={setOpen}
      title={t.nav.search}
      description={t.command.placeholder}
    >
      <CommandPrimitive filter={rankAskLast}>
        <CommandPaletteInput
          clearLabel={t.nav.clearSearch}
          placeholder={t.command.placeholder}
          value={search}
          onValueChange={setSearch}
        />
        <CommandList className="m-1.5 max-h-96">
          {!canAsk && <CommandEmpty>{t.command.nothingMatches}</CommandEmpty>}
          {askedQuestion && (
            <AskAnswer
              question={askedQuestion}
              result={ask.data}
              onOpenHome={() => run(() => navigate({ to: '/home' }))}
              onOpenThread={(threadId) =>
                run(() =>
                  navigate({ params: { threadId }, to: '/mail/$threadId' })
                )
              }
            />
          )}
          <CommandGroup heading={t.command.goTo}>
            {navItems.map((item) => (
              <CommandItem key={item.to} onSelect={() => run(() => goTo(item))}>
                <HugeiconsIcon icon={item.icon} strokeWidth={2} />
                {t.nav[item.key]}
                <CommandShortcut>{item.sequence.join(' ')}</CommandShortcut>
              </CommandItem>
            ))}
            <CommandItem onSelect={() => run(openBoard)}>
              <HugeiconsIcon icon={DashboardSquare01Icon} strokeWidth={2} />
              {t.nav.board}
              <CommandShortcut>G B</CommandShortcut>
            </CommandItem>
          </CommandGroup>
          <CommandGroup heading={t.nav.folders}>
            {FOLDER_ITEMS.map(({ folder, icon }) => (
              <CommandItem
                key={folder}
                onSelect={() => run(() => navigate({ to: `/mail/${folder}` }))}
              >
                <HugeiconsIcon icon={icon} strokeWidth={2} />
                {t.mail.filter[folder]}
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
                onSelect={() =>
                  hasAgent
                    ? ask.mutate({ question: search.trim() })
                    : run(() => upgradeStore.set('ask'))
                }
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
