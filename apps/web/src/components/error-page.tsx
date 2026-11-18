import { Button } from '@fewmail/ui/components/button'
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@fewmail/ui/components/empty'
import { Kbd } from '@fewmail/ui/components/kbd'
import { Home01Icon, ReloadIcon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { useHotkey } from '@tanstack/react-hotkeys'
import { Link, useNavigate } from '@tanstack/react-router'

import { LogoMark, SleepingLogoMark } from '~/components/logo'
import { useT } from '~/lib/i18n'

/** A reload, not `router.invalidate`: a chunk missing after a deploy only comes back with a fresh page. */
const reload = () => window.location.reload()

const ErrorScreen = ({ isMissing }: { isMissing: boolean }) => {
  const t = useT()
  const navigate = useNavigate()
  const goHome = () => navigate({ to: '/home' })

  useHotkey('Enter', isMissing ? goHome : reload)

  return (
    <Empty>
      <EmptyHeader>
        <EmptyMedia>
          {isMissing ? (
            <SleepingLogoMark className="text-primary size-20" />
          ) : (
            <LogoMark className="size-20" />
          )}
        </EmptyMedia>
        <EmptyTitle>
          {isMissing ? t.errors.missingTitle : t.errors.crashTitle}
        </EmptyTitle>
        <EmptyDescription>
          {isMissing ? t.errors.notFound : t.errors.crashLead}
        </EmptyDescription>
      </EmptyHeader>
      <EmptyContent className="flex-row justify-center">
        {isMissing ? (
          <Button render={<Link to="/home" />} shortcut={<Kbd>⏎</Kbd>}>
            <HugeiconsIcon icon={Home01Icon} strokeWidth={2} />
            {t.nav.home}
          </Button>
        ) : (
          <>
            <Button variant="outline" render={<Link to="/home" />}>
              <HugeiconsIcon icon={Home01Icon} strokeWidth={2} />
              {t.nav.home}
            </Button>
            <Button onClick={reload} shortcut={<Kbd>⏎</Kbd>}>
              <HugeiconsIcon icon={ReloadIcon} strokeWidth={2} />
              {t.agent.retry}
            </Button>
          </>
        )}
      </EmptyContent>
    </Empty>
  )
}

export const ErrorPage = () => <ErrorScreen isMissing={false} />

export const NotFoundPage = () => <ErrorScreen isMissing />
