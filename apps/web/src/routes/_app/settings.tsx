import type { Plan } from '@fewmail/shared/agent'
import { PRO_PRICE_USD } from '@fewmail/shared/agent'
import { textToHtml } from '@fewmail/shared/email'
import type { Messages } from '@fewmail/shared/i18n'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@fewmail/ui/components/alert-dialog'
import { Button } from '@fewmail/ui/components/button'
import { CodeBlock } from '@fewmail/ui/components/custom/code-block'
import {
  SettingsGroup,
  SettingsRow,
} from '@fewmail/ui/components/custom/settings-group'
import { Input } from '@fewmail/ui/components/input'
import { Switch } from '@fewmail/ui/components/switch'
import { Textarea } from '@fewmail/ui/components/textarea'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { createFileRoute, Link, useRouter } from '@tanstack/react-router'
import { type } from 'arktype'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'

import {
  BriefHourSelect,
  LanguageSelect,
  PersonaSelect,
} from '~/components/agent-fields'
import { authClient, signedInStore } from '~/lib/auth'
import { localeStore, useDates, useT } from '~/lib/i18n'
import { orpc } from '~/lib/orpc'

const AgentSettings = () => {
  const t = useT()
  const { me } = Route.useRouteContext()
  const router = useRouter()
  const save = useMutation(
    orpc.settings.save.mutationOptions({ onSuccess: () => router.invalidate() })
  )
  const { settings } = me
  const update = (change: Partial<typeof settings>) =>
    save.mutate({
      briefHour: settings.briefHour,
      gmailLabels: settings.gmailLabels,
      knowledge: settings.knowledge,
      language: settings.language,
      persona: settings.persona,
      timezone: settings.timezone,
      ...change,
    })
  const [knowledge, setKnowledge] = useState(settings.knowledge ?? '')

  return (
    <SettingsGroup title={t.settings.agent}>
      <SettingsRow
        title={t.settings.language}
        description={t.settings.languageDescription}
      >
        <LanguageSelect
          value={settings.language}
          onChange={(language) => {
            localeStore.set(language)
            update({ language })
          }}
        />
      </SettingsRow>
      <SettingsRow
        title={t.settings.labels.title}
        description={t.settings.labels.description}
        htmlFor="gmail-labels"
      >
        <Switch
          id="gmail-labels"
          checked={settings.gmailLabels}
          onCheckedChange={(gmailLabels) => update({ gmailLabels })}
        />
      </SettingsRow>
      {me.plan.kind !== 'free' && (
        <>
          <SettingsRow
            title={t.settings.persona}
            description={t.persona[settings.persona].description}
          >
            <PersonaSelect
              value={settings.persona}
              onChange={(persona) => update({ persona })}
            />
          </SettingsRow>
          <SettingsRow
            title={t.settings.briefTitle}
            description={t.settings.briefDescription(settings.timezone)}
          >
            <BriefHourSelect
              value={settings.briefHour}
              onChange={(briefHour) => update({ briefHour })}
            />
          </SettingsRow>
          <div className="flex flex-col gap-2 p-3.5">
            <span className="text-sm font-medium">
              {t.settings.knowledge.title}
            </span>
            <span className="text-muted-foreground text-sm">
              {t.settings.knowledge.description}
            </span>
            <Textarea
              data-mask
              value={knowledge}
              rows={4}
              placeholder={t.settings.knowledge.placeholder}
              aria-label={t.settings.knowledge.title}
              onChange={(event) => setKnowledge(event.target.value)}
              onBlur={() =>
                knowledge !== (settings.knowledge ?? '') &&
                update({ knowledge: knowledge.trim() || null })
              }
            />
          </div>
        </>
      )}
    </SettingsGroup>
  )
}

const MESSENGERS = { telegram: 'Telegram', whatsapp: 'WhatsApp' } as const

const messengerDescription = (
  copy: Messages['settings']['telegram'],
  link: { botUrl: string | null; linked: boolean } | undefined
) => {
  if (link?.linked) {
    return copy.linked
  }
  return link?.botUrl ? copy.unlinked : copy.notConfigured
}

const MessengerSettings = ({
  channel,
}: {
  channel: keyof typeof MESSENGERS
}) => {
  const t = useT()
  const copy = t.settings[channel]
  const queryClient = useQueryClient()
  const procedures = orpc.integrations[channel]
  const { data: link } = useQuery(
    procedures.get.queryOptions({ refetchInterval: 5000 })
  )
  const unlink = useMutation(
    procedures.unlink.mutationOptions({
      onSuccess: () =>
        queryClient.invalidateQueries({ queryKey: procedures.key() }),
    })
  )

  return (
    <SettingsRow
      title={MESSENGERS[channel]}
      description={messengerDescription(copy, link)}
    >
      {link?.linked ? (
        <Button
          size="sm"
          variant="ghost-destructive"
          onClick={() => unlink.mutate()}
        >
          {copy.disconnect}
        </Button>
      ) : (
        link?.botUrl && (
          <Button
            size="sm"
            variant="outline"
            render={
              <a
                href={link.botUrl}
                target="_blank"
                rel="noreferrer"
                aria-label={copy.connect}
              />
            }
          >
            {copy.connect}
          </Button>
        )
      )}
    </SettingsRow>
  )
}

const mcpConfig = (key: string) =>
  JSON.stringify(
    {
      mcpServers: {
        fewmail: {
          headers: { Authorization: `Bearer ${key}` },
          type: 'http',
          url: `${import.meta.env.API_URL}/mcp`,
        },
      },
    },
    null,
    2
  )

const McpSettings = () => {
  const t = useT()
  const dates = useDates()
  const queryClient = useQueryClient()
  const [name, setName] = useState('')
  const [createdKey, setCreatedKey] = useState<string | null>(null)
  const { data: keys = [] } = useQuery(
    orpc.integrations.apiKeys.list.queryOptions()
  )
  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: orpc.integrations.apiKeys.key() })
  const create = useMutation(
    orpc.integrations.apiKeys.create.mutationOptions({
      onSuccess: ({ key }) => {
        setCreatedKey(key)
        setName('')
        void invalidate()
      },
    })
  )
  const revoke = useMutation(
    orpc.integrations.apiKeys.revoke.mutationOptions({ onSuccess: invalidate })
  )

  return (
    <SettingsGroup title="MCP">
      <SettingsRow
        title={t.settings.mcp.title}
        description={t.settings.mcp.description}
      >
        <form
          className="flex items-center gap-2"
          onSubmit={(event) => {
            event.preventDefault()
            create.mutate({ name: name.trim() || t.settings.mcp.defaultName })
          }}
        >
          <Input
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder={t.settings.mcp.keyName}
            aria-label={t.settings.mcp.keyName}
            className="w-36"
          />
          <Button size="sm" type="submit" disabled={create.isPending}>
            {t.settings.mcp.create}
          </Button>
        </form>
      </SettingsRow>
      {createdKey && (
        <div className="flex flex-col gap-2 p-3.5">
          <p className="text-muted-foreground text-sm">
            {t.settings.mcp.copyNow}
          </p>
          <CodeBlock code={mcpConfig(createdKey)} language="json" />
        </div>
      )}
      {keys.map((key) => (
        <SettingsRow
          key={key.id}
          title={`${key.name} · ${key.prefix}…`}
          description={
            key.lastUsedAt
              ? t.settings.mcp.used(dates.ago(key.lastUsedAt))
              : t.settings.mcp.neverUsed
          }
        >
          <Button
            size="sm"
            variant="ghost-destructive"
            onClick={() => revoke.mutate({ id: key.id })}
          >
            {t.settings.mcp.revoke}
          </Button>
        </SettingsRow>
      ))}
    </SettingsGroup>
  )
}

const DeleteAccount = () => {
  const t = useT()
  const [isDeleting, setIsDeleting] = useState(false)

  const deleteAccount = async () => {
    setIsDeleting(true)
    const { error } = await authClient.deleteUser()
    if (error) {
      setIsDeleting(false)
      toast.error(error.message ?? error.statusText)
      return
    }
    location.assign('/login')
  }

  return (
    <AlertDialog>
      <AlertDialogTrigger
        render={<Button size="sm" variant="ghost-destructive" />}
      >
        {t.settings.deleteAccount}
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{t.settings.deleteTitle}</AlertDialogTitle>
          <AlertDialogDescription>
            {t.settings.deleteDescription}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>{t.settings.cancel}</AlertDialogCancel>
          <AlertDialogAction
            variant="destructive"
            disabled={isDeleting}
            onClick={deleteAccount}
          >
            {t.settings.deleteConfirm}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

const planDescription = (
  t: Messages,
  plan: {
    cancelAtPeriodEnd: boolean
    kind: Plan
    periodEnd: Date | null
    trialEndsAt: Date | null
  },
  formatDate: (date: Date) => string
) => {
  if (plan.kind === 'trial' && plan.trialEndsAt) {
    return t.plan.trialDescription(formatDate(plan.trialEndsAt))
  }
  if (plan.kind === 'pro' && plan.periodEnd) {
    return plan.cancelAtPeriodEnd
      ? t.plan.proCancels(formatDate(plan.periodEnd))
      : t.plan.proRenews(formatDate(plan.periodEnd))
  }
  return t.plan.freeDescription
}

const redirectTo = ({ url }: { url: string }) => location.assign(url)

const PlanSettings = () => {
  const t = useT()
  const dates = useDates()
  const { me } = Route.useRouteContext()
  const { plan } = me
  const checkout = useMutation(
    orpc.billing.checkout.mutationOptions({ onSuccess: redirectTo })
  )
  const portal = useMutation(
    orpc.billing.portal.mutationOptions({ onSuccess: redirectTo })
  )

  return (
    <SettingsGroup title={t.plan.title}>
      <SettingsRow
        title={t.plan[plan.kind]}
        description={planDescription(t, plan, (date) =>
          dates.format(date, 'PPP')
        )}
      >
        {plan.kind === 'pro' ? (
          <Button
            size="sm"
            variant="outline"
            disabled={portal.isPending}
            onClick={() => portal.mutate()}
          >
            {t.plan.manage}
          </Button>
        ) : (
          <Button
            size="sm"
            variant={plan.kind === 'free' ? 'default' : 'outline'}
            disabled={checkout.isPending}
            onClick={() => checkout.mutate()}
          >
            {t.plan.upgrade} · {t.plan.price(PRO_PRICE_USD)}
          </Button>
        )}
      </SettingsRow>
      {plan.kind !== 'pro' && (
        <p className="text-muted-foreground p-3.5 text-sm">{t.plan.includes}</p>
      )}
    </SettingsGroup>
  )
}

const SnippetsSettings = () => {
  const t = useT()
  const queryClient = useQueryClient()
  const [name, setName] = useState('')
  const [body, setBody] = useState('')
  const { data: snippets = [] } = useQuery(orpc.snippets.list.queryOptions())
  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: orpc.snippets.key() })
  const save = useMutation(
    orpc.snippets.save.mutationOptions({
      onSuccess: () => {
        setName('')
        setBody('')
        void invalidate()
      },
    })
  )
  const remove = useMutation(
    orpc.snippets.delete.mutationOptions({ onSuccess: invalidate })
  )

  return (
    <SettingsGroup title={t.settings.snippets.title}>
      <form
        className="flex flex-col gap-2 p-3.5"
        onSubmit={(event) => {
          event.preventDefault()
          if (name.trim() && body.trim()) {
            save.mutate({ html: textToHtml(body), name: name.trim() })
          }
        }}
      >
        <span className="text-muted-foreground text-sm">
          {t.settings.snippets.description}
        </span>
        <Input
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder={t.settings.snippets.name}
          aria-label={t.settings.snippets.name}
        />
        <Textarea
          data-mask
          value={body}
          rows={3}
          onChange={(event) => setBody(event.target.value)}
          aria-label={t.settings.snippets.body}
          placeholder={t.settings.snippets.body}
        />
        <Button
          size="sm"
          type="submit"
          className="self-start"
          disabled={save.isPending}
        >
          {t.settings.snippets.add}
        </Button>
      </form>
      {snippets.map((snippet) => (
        <SettingsRow
          key={snippet.id}
          title={<span data-mask>;{snippet.name}</span>}
        >
          <Button
            size="sm"
            variant="ghost-destructive"
            onClick={() => remove.mutate({ id: snippet.id })}
          >
            {t.settings.snippets.delete}
          </Button>
        </SettingsRow>
      ))}
    </SettingsGroup>
  )
}

const SettingsPage = () => {
  const t = useT()
  const { me } = Route.useRouteContext()
  const { upgraded } = Route.useSearch()
  const router = useRouter()
  const hasAgent = me.plan.kind !== 'free'

  useEffect(() => {
    if (upgraded) {
      toast.success(t.plan.welcome)
      void router.invalidate()
    }
  }, [upgraded, router, t.plan.welcome])

  return (
    <main className="flex-1 overflow-y-auto">
      <div className="mx-auto flex max-w-3xl flex-col gap-8 px-10 pt-12 pb-16">
        <h1 className="text-display font-serif tracking-tight">
          {t.settings.title}
        </h1>
        <PlanSettings />
        <AgentSettings />
        {hasAgent && (
          <>
            <SettingsGroup title={t.settings.integrations}>
              <MessengerSettings channel="telegram" />
              <MessengerSettings channel="whatsapp" />
            </SettingsGroup>
            <McpSettings />
          </>
        )}
        <SnippetsSettings />
        <SettingsGroup title={t.settings.account}>
          <SettingsRow
            title={<span data-mask>{me.user.email}</span>}
            description={t.settings.signedInWithGoogle}
          >
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                signedInStore.set(false)
                void authClient.signOut().then(() => location.assign('/login'))
              }}
            >
              {t.settings.signOut}
            </Button>
          </SettingsRow>
          <SettingsRow
            title={t.settings.deleteAccount}
            description={t.settings.deleteDescription}
          >
            <DeleteAccount />
          </SettingsRow>
        </SettingsGroup>
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
  validateSearch: type({ 'upgraded?': 'boolean' }),
})
