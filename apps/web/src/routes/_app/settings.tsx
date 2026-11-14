import { PAID_PLANS } from '@fewmail/shared/agent'
import {
  SettingsGroup,
  SettingsRow,
} from '@fewmail/ui/components/custom/settings-group'
import { useQueryClient } from '@tanstack/react-query'
import { createFileRoute, Link } from '@tanstack/react-router'
import { type } from 'arktype'
import { useEffect } from 'react'
import { toast } from 'sonner'

import { AccountSettings } from '~/components/settings/account-settings'
import { AgentSettings } from '~/components/settings/agent-settings'
import { MailboxSettings } from '~/components/settings/mailbox-settings'
import { McpSettings } from '~/components/settings/mcp-settings'
import { MessengerSettings } from '~/components/settings/messenger-settings'
import { NotificationSettings } from '~/components/settings/notification-settings'
import { PlanSettings } from '~/components/settings/plan-settings'
import { SnippetsSettings } from '~/components/settings/snippets-settings'
import { useT } from '~/lib/i18n'
import { useHasAgent } from '~/lib/me'
import { orpc } from '~/lib/orpc'
import { warmQuery } from '~/lib/query-client'

const SettingsPage = () => {
  const t = useT()
  const hasAgent = useHasAgent()
  const queryClient = useQueryClient()
  const navigate = Route.useNavigate()
  const { deleteAccount, mailbox, upgraded } = Route.useSearch()

  useEffect(() => {
    if (!deleteAccount && !mailbox && !upgraded) {
      return
    }
    const copy = t.settings.mailboxes
    if (mailbox === 'added') {
      toast.success(copy.added)
    } else if (mailbox) {
      toast.error(mailbox === 'sign_in' ? copy.signInChosen : copy.failed)
    }
    if (upgraded) {
      toast.success(t.plan.welcome(t.plan[upgraded]))
      void queryClient.invalidateQueries({ queryKey: orpc.me.key() })
    }
    void navigate({ replace: true, search: {} })
  }, [deleteAccount, mailbox, upgraded, navigate, queryClient, t])

  return (
    <main className="flex-1 overflow-y-auto">
      <div className="mx-auto flex max-w-3xl flex-col gap-8 px-10 pt-12 pb-16">
        <h1 className="text-display font-serif tracking-tight">
          {t.settings.title}
        </h1>
        <PlanSettings />
        <MailboxSettings />
        <AgentSettings />
        <NotificationSettings />
        {hasAgent && (
          <SettingsGroup title={t.settings.integrations}>
            <MessengerSettings channel="telegram" />
            <MessengerSettings channel="whatsapp" />
          </SettingsGroup>
        )}
        <McpSettings />
        <SnippetsSettings />
        <AccountSettings isConfirmingDelete={deleteAccount === 'confirm'} />
        <SettingsGroup title={t.settings.legal}>
          <SettingsRow
            title={t.legal.privacy}
            render={<Link to="/privacy" />}
          />
          <SettingsRow title={t.legal.terms} render={<Link to="/terms" />} />
        </SettingsGroup>
      </div>
    </main>
  )
}

export const Route = createFileRoute('/_app/settings')({
  component: SettingsPage,
  loader: ({ context: { me } }) =>
    Promise.all([
      warmQuery(orpc.mailboxes.list.queryOptions()),
      warmQuery(orpc.devices.webPushKey.queryOptions()),
      warmQuery(orpc.snippets.list.queryOptions()),
      ...(me.plan.kind === 'free'
        ? []
        : [
            warmQuery(orpc.integrations.telegram.get.queryOptions()),
            warmQuery(orpc.integrations.whatsapp.get.queryOptions()),
            warmQuery(orpc.integrations.apps.list.queryOptions()),
          ]),
    ]),
  validateSearch: type({
    'deleteAccount?': "'confirm'",
    'mailbox?': "'added' | 'failed' | 'sign_in'",
    'upgraded?': type.enumerated(...PAID_PLANS),
  }),
})
