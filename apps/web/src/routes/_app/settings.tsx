import { PAID_PLANS } from '@fewmail/shared/agent'
import {
  SettingsGroup,
  SettingsRow,
} from '@fewmail/ui/components/custom/settings-group'
import { createFileRoute, Link, useRouter } from '@tanstack/react-router'
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
import { ScheduleSettings } from '~/components/settings/schedule-settings'
import { SnippetsSettings } from '~/components/settings/snippets-settings'
import { useT } from '~/lib/i18n'
import { useHasAgent } from '~/lib/me'

const SettingsPage = () => {
  const t = useT()
  const hasAgent = useHasAgent()
  const router = useRouter()
  const navigate = Route.useNavigate()
  const { mailbox, upgraded } = Route.useSearch()

  useEffect(() => {
    if (!mailbox && !upgraded) {
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
      void router.invalidate()
    }
    void navigate({ replace: true, search: {} })
  }, [mailbox, upgraded, navigate, router, t])

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
          <>
            <SettingsGroup title={t.settings.integrations}>
              <MessengerSettings channel="telegram" />
              <MessengerSettings channel="whatsapp" />
            </SettingsGroup>
            <McpSettings />
            <ScheduleSettings />
          </>
        )}
        <SnippetsSettings />
        <AccountSettings />
        <SettingsGroup title={t.settings.legal}>
          <SettingsRow title={<Link to="/privacy">{t.legal.privacy}</Link>} />
          <SettingsRow title={<Link to="/terms">{t.legal.terms}</Link>} />
        </SettingsGroup>
      </div>
    </main>
  )
}

export const Route = createFileRoute('/_app/settings')({
  component: SettingsPage,
  validateSearch: type({
    'mailbox?': "'added' | 'failed' | 'sign_in'",
    'upgraded?': type.enumerated(...PAID_PLANS),
  }),
})
