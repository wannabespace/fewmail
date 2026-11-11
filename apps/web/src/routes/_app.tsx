import {
  ResizableGroup,
  ResizablePanel,
  ResizableSeparator,
} from '@fewmail/ui/components/custom/resizable'
import {
  createFileRoute,
  Outlet,
  redirect,
  useRouter,
  useRouterState,
} from '@tanstack/react-router'
import { type } from 'arktype'
import { useEffect, useState } from 'react'
import { useSubscription } from 'seitu/react'
import { createWebStorageValue } from 'seitu/web'

import { NewBoardDialog } from '~/components/board-dialog'
import { CommandMenu } from '~/components/command-menu'
import { ComposeProvider } from '~/components/compose/compose-context'
import { ComposeDialog } from '~/components/compose/compose-dialog'
import { Sidebar } from '~/components/nav'
import { agentModeStore, signedInStore } from '~/lib/auth'
import { localeStore } from '~/lib/i18n'
import { client, listenForChanges } from '~/lib/orpc'

const SIDEBAR_WIDTH = { default: 232, max: 320, min: 200 }

const sidebarWidthStore = createWebStorageValue({
  defaultValue: SIDEBAR_WIDTH.default,
  key: 'fewmail.sidebar-width',
  schema: type('number'),
  type: 'localStorage',
})

const AppLayout = () => {
  const { me } = Route.useRouteContext()
  const [isCommandMenuOpen, setIsCommandMenuOpen] = useState(false)
  const sidebarWidth = useSubscription(sidebarWidthStore)
  const router = useRouter()
  const isAgentMode = useRouterState({
    select: ({ location }) => location.pathname === '/agent',
  })

  useEffect(() => {
    for (const route of Object.values(router.routesById)) {
      if (route.id.startsWith('/_app/')) {
        void router.loadRouteChunk(route)
      }
    }
  }, [router])
  useEffect(() => {
    agentModeStore.set(isAgentMode)
  }, [isAgentMode])
  useEffect(() => {
    const controller = new AbortController()
    void listenForChanges(controller.signal)
    return () => controller.abort()
  }, [])

  return (
    <ComposeProvider renderDialog={(props) => <ComposeDialog {...props} />}>
      <div className="bg-body flex h-svh">
        <ResizableGroup className="flex-1">
          <ResizablePanel
            className="flex"
            size={sidebarWidth}
            minSize={SIDEBAR_WIDTH.min}
            maxSize={SIDEBAR_WIDTH.max}
            onSizeChange={(width) => sidebarWidthStore.set(width)}
          >
            <Sidebar
              email={me.user.email}
              onSearch={() => setIsCommandMenuOpen(true)}
            />
          </ResizablePanel>
          <ResizableSeparator />
          <ResizablePanel className="flex min-w-0 flex-col">
            <Outlet />
          </ResizablePanel>
        </ResizableGroup>
        <CommandMenu
          open={isCommandMenuOpen}
          onOpenChange={setIsCommandMenuOpen}
        />
        <NewBoardDialog />
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
