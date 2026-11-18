import { WRAPPED_PERIODS } from '@fewmail/shared/agent'
import type { WrappedPeriod } from '@fewmail/shared/agent'
import { Button } from '@fewmail/ui/components/button'
import {
  SettingsGroup,
  SettingsRow,
} from '@fewmail/ui/components/custom/settings-group'
import { Empty, EmptyDescription } from '@fewmail/ui/components/empty'
import { Kbd } from '@fewmail/ui/components/kbd'
import { Skeleton } from '@fewmail/ui/components/skeleton'
import { Tabs, TabsList, TabsTrigger } from '@fewmail/ui/components/tabs'
import { useHotkey } from '@tanstack/react-hotkeys'
import { useQuery } from '@tanstack/react-query'
import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { toast } from 'sonner'
import { z } from 'zod/mini'

import { KeyHints } from '~/components/key-hints'
import { SenderAvatar } from '~/components/sender-avatar'
import { WrappedCard, wrappedImage } from '~/components/wrapped-card'
import { useLocale, useT } from '~/lib/i18n'
import { orpc } from '~/lib/orpc'
import { warmQuery } from '~/lib/query-client'

const MIN_EMAILS = 10

const WrappedPage = () => {
  const t = useT()
  const locale = useLocale()
  const navigate = useNavigate({ from: '/wrapped' })
  const { period = 'year' } = Route.useSearch()
  const { data } = useQuery(
    orpc.wrapped.get.queryOptions({ input: { period } })
  )
  const show = (next: WrappedPeriod) => navigate({ search: { period: next } })
  const title = t.wrapped.title[period]
  const hasStory = !!data && data.stats.emails >= MIN_EMAILS

  const copyLink = () =>
    data &&
    navigator.clipboard
      .writeText(`${window.location.origin}/w/${data.shareToken}`)
      .then(() => toast.success(t.wrapped.copied))
  const saveImage = async () => {
    if (!data) {
      return
    }
    const blob = await wrappedImage(t, locale, { ...data, title })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `fewmail-${data.label}.png`
    link.click()
    URL.revokeObjectURL(link.href)
  }

  useHotkey('Y', () => show('year'))
  useHotkey('M', () => show('month'))
  useHotkey('L', () => copyLink(), { enabled: hasStory })
  useHotkey('I', () => saveImage(), { enabled: hasStory })

  return (
    <main className="flex flex-1 flex-col overflow-hidden">
      <div className="under-notice flex-1 overflow-y-auto">
        <div className="mx-auto flex max-w-3xl flex-col gap-10 px-10 pt-12 pb-16 max-md:px-4 max-md:pt-6">
          <Tabs
            value={period}
            onValueChange={(next: WrappedPeriod) => show(next)}
          >
            <TabsList>
              {WRAPPED_PERIODS.map((option) => (
                <TabsTrigger key={option} value={option}>
                  {t.wrapped.period[option]}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>

          {!data && <Skeleton className="h-96 w-full" />}
          {data && !hasStory && (
            <Empty>
              <EmptyDescription>{t.wrapped.empty}</EmptyDescription>
            </Empty>
          )}
          {data && hasStory && (
            <>
              <WrappedCard
                label={data.label}
                stats={data.stats}
                title={title}
              />
              {data.stats.handled === 0 && (
                <div className="flex flex-col items-start gap-1">
                  <p className="text-muted-foreground text-sm">
                    {t.wrapped.handledHint}
                  </p>
                  <Button
                    size="xs"
                    variant="link-muted"
                    render={<Link to="/rules" />}
                  >
                    {t.nav.rules}
                  </Button>
                </div>
              )}
              {data.people.length > 0 && (
                <SettingsGroup title={t.wrapped.people}>
                  {data.people.map((person) => (
                    <SettingsRow
                      key={person.fromEmail}
                      iconVariant="avatar"
                      icon={<SenderAvatar sender={person} size="sm" />}
                      title={
                        <span data-mask>
                          {person.fromName ?? person.fromEmail}
                        </span>
                      }
                      description={
                        <span data-mask>{t.cleanup.emails(person.count)}</span>
                      }
                    />
                  ))}
                </SettingsGroup>
              )}
              <div className="flex flex-col gap-3">
                <div className="flex gap-2">
                  <Button onClick={() => saveImage()} shortcut={<Kbd>I</Kbd>}>
                    {t.wrapped.saveImage}
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={() => copyLink()}
                    shortcut={<Kbd>L</Kbd>}
                  >
                    {t.wrapped.copyLink}
                  </Button>
                </div>
                <p className="text-muted-foreground text-xs">
                  {t.wrapped.shareNote}
                </p>
              </div>
            </>
          )}
        </div>
      </div>
      <KeyHints
        hints={[
          ['Y / M', `${t.wrapped.period.year} / ${t.wrapped.period.month}`],
          ...(hasStory
            ? ([
                ['I', t.wrapped.saveImage],
                ['L', t.wrapped.copyLink],
              ] as [string, string][])
            : []),
        ]}
      />
    </main>
  )
}

export const Route = createFileRoute('/_app/wrapped')({
  component: WrappedPage,
  validateSearch: z.object({
    period: z.optional(z.enum(WRAPPED_PERIODS)),
  }),
  loaderDeps: ({ search }) => search,
  loader: ({ deps }) =>
    warmQuery(
      orpc.wrapped.get.queryOptions({
        input: { period: deps.period ?? 'year' },
      })
    ),
})
