import { Button } from '@fewmail/ui/components/button'
import {
  SettingsGroup,
  SettingsRow,
} from '@fewmail/ui/components/custom/settings-group'
import { Empty, EmptyDescription } from '@fewmail/ui/components/empty'
import { useHotkey } from '@tanstack/react-hotkeys'
import { useQuery } from '@tanstack/react-query'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useState } from 'react'

import { KeyHints } from '~/components/key-hints'
import { useT } from '~/lib/i18n'
import { orpc } from '~/lib/orpc'
import { warmQuery } from '~/lib/query-client'

const ReadingPage = () => {
  const t = useT()
  const navigate = useNavigate()
  const { data: rows = [], isPending } = useQuery(orpc.reading.queryOptions())
  const [cursor, setCursor] = useState(0)
  const active = rows[Math.min(cursor, rows.length - 1)]
  const open = (threadId?: string) =>
    threadId && navigate({ search: { thread: threadId }, to: '/mail' })

  const listKeys = { enabled: Boolean(active) }
  const down = () => setCursor((index) => Math.min(rows.length - 1, index + 1))
  const up = () => setCursor((index) => Math.max(0, index - 1))
  useHotkey('J', down, listKeys)
  useHotkey('ArrowDown', down, listKeys)
  useHotkey('K', up, listKeys)
  useHotkey('ArrowUp', up, listKeys)
  useHotkey('Enter', () => open(active?.threadId), listKeys)

  return (
    <main className="flex flex-1 flex-col overflow-hidden">
      <div className="flex-1 overflow-y-auto">
        <div className="mx-auto flex max-w-3xl flex-col gap-8 px-10 pt-12 pb-16">
          <header className="flex flex-col gap-3">
            <h1 className="text-display font-serif tracking-tight">
              {t.reading.title}
            </h1>
            <p className="text-brief text-foreground/85 font-serif">
              {t.reading.lead}
            </p>
          </header>

          {!isPending && rows.length === 0 && (
            <Empty>
              <EmptyDescription>{t.reading.empty}</EmptyDescription>
            </Empty>
          )}
          {rows.length > 0 && (
            <SettingsGroup title={t.cleanup.emails(rows.length)}>
              {rows.map((row) => (
                <SettingsRow
                  key={row.id}
                  active={row === active}
                  title={
                    <span data-mask>
                      {row.fromName ?? row.fromEmail} · {row.subject}
                    </span>
                  }
                  description={
                    <span data-mask className="font-serif text-sm">
                      {row.summary}
                    </span>
                  }
                >
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => open(row.threadId)}
                  >
                    {t.mail.open}
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
            ['⏎', t.keys.open],
            ['⌘K', t.keys.anything],
          ]}
        />
      )}
    </main>
  )
}

export const Route = createFileRoute('/_app/reading')({
  component: ReadingPage,
  loader: () => warmQuery(orpc.reading.queryOptions()),
})
