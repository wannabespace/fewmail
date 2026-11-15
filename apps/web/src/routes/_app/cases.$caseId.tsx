import { Button } from '@fewmail/ui/components/button'
import {
  SettingsGroup,
  SettingsRow,
} from '@fewmail/ui/components/custom/settings-group'
import { Kbd } from '@fewmail/ui/components/kbd'
import { useHotkey } from '@tanstack/react-hotkeys'
import { useQuery } from '@tanstack/react-query'
import { createFileRoute, Link, redirect } from '@tanstack/react-router'

import {
  CaseChecklist,
  CasePlanning,
  useCaseFacts,
  useCaseStatus,
} from '~/components/cases'
import { KeyHints } from '~/components/key-hints'
import { SenderAvatar } from '~/components/sender-avatar'
import { upgradeStore } from '~/components/upgrade-dialog'
import { useDates, useT } from '~/lib/i18n'
import { orpc } from '~/lib/orpc'
import { warmQuery } from '~/lib/query-client'

const CasePage = () => {
  const { caseId } = Route.useParams()
  const t = useT()
  const dates = useDates()
  const facts = useCaseFacts()
  const setStatus = useCaseStatus()
  const { data: found } = useQuery(
    orpc.cases.get.queryOptions({ input: { id: caseId } })
  )
  const status = found?.status
  const set = (next: 'active' | 'done' | 'dropped') =>
    setStatus.mutate({ id: caseId, status: next })

  useHotkey('Enter', () => set('active'), {
    enabled: status === 'proposed' || status === 'done',
  })
  useHotkey('D', () => set('done'), { enabled: status === 'active' })
  useHotkey('Backspace', () => set('dropped'), {
    enabled: status === 'proposed' || status === 'active',
  })

  if (!found) {
    return <main className="flex min-h-0 flex-1 flex-col" />
  }
  const isOpen = found.status === 'proposed' || found.status === 'active'
  const hints: [string, string][] = [
    ...(found.status === 'active'
      ? ([
          ['D', t.cases.close],
          ['⌫', t.cases.drop],
        ] as [string, string][])
      : []),
    ...(found.status === 'proposed'
      ? ([
          ['⏎', t.cases.accept],
          ['⌫', t.cases.decline],
        ] as [string, string][])
      : []),
    ...(found.status === 'done'
      ? ([['⏎', t.cases.reopen]] as [string, string][])
      : []),
  ]

  return (
    <main className="flex min-h-0 flex-1 flex-col">
      <div className="flex-1 overflow-y-auto">
        <div className="mx-auto flex max-w-3xl flex-col gap-8 px-10 pt-12 pb-16">
          <header className="flex flex-col gap-3">
            <span className="text-muted-foreground text-xs font-medium">
              {found.status === 'done'
                ? t.cases.state.done
                : `${t.cases.title} · ${facts(found)}`}
            </span>
            <h1 className="text-display font-serif tracking-tight" data-mask>
              {found.title}
            </h1>
            <p
              className="text-brief text-muted-foreground font-serif"
              data-mask
            >
              {found.goal}
            </p>
            <div className="flex flex-wrap gap-2">
              {found.status === 'proposed' && (
                <Button
                  size="sm"
                  onClick={() => set('active')}
                  shortcut={<Kbd>⏎</Kbd>}
                >
                  {t.cases.accept}
                </Button>
              )}
              {found.status === 'active' && (
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => set('done')}
                  shortcut={<Kbd>D</Kbd>}
                >
                  {t.cases.close}
                </Button>
              )}
              {isOpen && (
                <Button
                  size="sm"
                  variant="ghost-muted"
                  onClick={() => set('dropped')}
                  shortcut={<Kbd>⌫</Kbd>}
                >
                  {found.status === 'proposed' ? t.cases.decline : t.cases.drop}
                </Button>
              )}
              {found.status === 'done' && (
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => set('active')}
                  shortcut={<Kbd>⏎</Kbd>}
                >
                  {t.cases.reopen}
                </Button>
              )}
            </div>
          </header>

          {found.status === 'active' && (
            <section className="flex flex-col gap-2">
              <h2 className="text-muted-foreground text-xs font-medium">
                {t.cases.next}
              </h2>
              {found.next ? (
                <p className="text-brief font-serif" data-mask>
                  {found.next}
                </p>
              ) : (
                <CasePlanning />
              )}
              {found.hasReply && (
                <Button
                  size="sm"
                  className="self-start"
                  render={<Link to="/home" />}
                >
                  {t.agent.decideOnHome}
                </Button>
              )}
            </section>
          )}

          {found.items.length > 0 && <CaseChecklist items={found.items} />}

          {found.mail.length > 0 && (
            <SettingsGroup title={t.cases.emails}>
              {found.mail.map((email) => (
                <SettingsRow
                  key={email.id}
                  iconVariant="avatar"
                  icon={<SenderAvatar sender={email} size="sm" />}
                  render={
                    <Link
                      to="/mail/$threadId"
                      params={{ threadId: email.threadId }}
                    />
                  }
                  title={
                    <span data-mask>{email.fromName ?? email.fromEmail}</span>
                  }
                  description={<span data-mask>{email.subject}</span>}
                >
                  <span className="text-muted-foreground text-xs tabular-nums">
                    {dates.format(new Date(email.receivedAt), 'd MMM')}
                  </span>
                </SettingsRow>
              ))}
            </SettingsGroup>
          )}
        </div>
      </div>
      <KeyHints hints={hints} />
    </main>
  )
}

export const Route = createFileRoute('/_app/cases/$caseId')({
  beforeLoad: ({ context, preload }) => {
    if (context.me.plan.kind === 'free') {
      if (!preload) {
        upgradeStore.set('cases')
      }
      throw redirect({ to: '/mail' })
    }
  },
  component: CasePage,
  loader: ({ params }) =>
    warmQuery(orpc.cases.get.queryOptions({ input: { id: params.caseId } })),
})
