import { createFileRoute, Outlet, redirect } from '@tanstack/react-router'
import { useState } from 'react'

import { CommandMenu } from '~/components/command-menu'
import { ComposeProvider } from '~/components/compose/compose-context'
import { ComposeDialog } from '~/components/compose/compose-dialog'
import { Sidebar } from '~/components/nav'
import { signedInStore } from '~/lib/auth'
import { localeStore } from '~/lib/i18n'
import { client } from '~/lib/orpc'

const AppLayout = () => {
  const { me } = Route.useRouteContext()
  const [isCommandMenuOpen, setIsCommandMenuOpen] = useState(false)

  return (
    <ComposeProvider renderDialog={(props) => <ComposeDialog {...props} />}>
      <div className="bg-body flex h-svh">
        <Sidebar
          email={me.user.email}
          onSearch={() => setIsCommandMenuOpen(true)}
        />
        <div className="flex min-w-0 flex-1 flex-col">
          <Outlet />
        </div>
        <CommandMenu
          open={isCommandMenuOpen}
          onOpenChange={setIsCommandMenuOpen}
        />
      </div>
    </ComposeProvider>
  )
}

export const Route = createFileRoute('/_app')({
  beforeLoad: async () => {
    const me = await client.me().catch(() => null)
    signedInStore.set(Boolean(me))
    if (!me) {
      throw redirect({ to: '/login' })
    }
    if (!me.settings) {
      throw redirect({ to: '/onboarding' })
    }
    localeStore.set(me.settings.language)
    return { me: { ...me, settings: me.settings } }
  },
  component: AppLayout,
})
