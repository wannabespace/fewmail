import {
  ResizableGroup,
  ResizablePanel,
  ResizableSeparator,
} from '@fewmail/ui/components/custom/resizable'
import { useQuery } from '@tanstack/react-query'
import {
  createFileRoute,
  Outlet,
  redirect,
  useRouter,
} from '@tanstack/react-router'
import { type } from 'arktype'
import { useEffect, useState } from 'react'
import { useSubscription } from 'seitu/react'
import { createWebStorageValue } from 'seitu/web'
import { toast } from 'sonner'

import { DeleteBoardDialog, NewBoardDialog } from '~/components/board-dialog'
import { ClearOutDialog } from '~/components/clear-out-dialog'
import { CommandMenu } from '~/components/command-menu'
import { ComposeProvider } from '~/components/compose/compose-context'
import { ConfirmDialog } from '~/components/confirm-dialog'
import { Sidebar } from '~/components/nav'
import { NoticeBar } from '~/components/notice-bar'
import { ThreadPane, ThreadPeekPopover } from '~/components/thread-link'
import { SnoozePicker, useFreshCodeToast } from '~/components/thread-view'
import { UpgradeDialog } from '~/components/upgrade-dialog'
import { signedInStore } from '~/lib/auth'
import { localeStore, useT } from '~/lib/i18n'
import { mailRowsOf } from '~/lib/mail-db'
import { useMe } from '~/lib/me'
import { listenForChanges, orpc } from '~/lib/orpc'
import { posthog } from '~/lib/posthog'

const SIDEBAR_WIDTH = { default: 232, max: 320, min: 200 }

const sidebarWidthStore = createWebStorageValue({
  defaultValue: SIDEBAR_WIDTH.default,
  key: 'fewmail.sidebar-width',
  schema: type('number'),
  type: 'localStorage',
})

const BUILT_COMMIT = import.meta.env.RAILWAY_GIT_COMMIT_SHA
const VERSION_CHECK_MS = 60_000

const useNewVersionToast = () => {
  const t = useT().update
  const { data: liveCommit } = useQuery({
    enabled: Boolean(BUILT_COMMIT),
    queryFn: async () => {
      const response = await fetch('/version.txt', { cache: 'no-store' })
      // Without the file Caddy answers with the app shell: that is not a newer commit.
      if (!response.headers.get('content-type')?.startsWith('text/plain')) {
        return BUILT_COMMIT
      }
      const commit = await response.text()
      return commit.trim()
    },
    queryKey: ['version'],
    refetchInterval: VERSION_CHECK_MS,
  })

  useEffect(() => {
    if (liveCommit && liveCommit !== BUILT_COMMIT) {
      toast(t.available, {
        action: { label: t.reload, onClick: () => location.reload() },
        duration: Infinity,
        id: 'new-version',
      })
    }
  }, [liveCommit, t])
}

const useIdentify = () => {
  const { plan, settings, user } = useMe()
  useEffect(() => {
    posthog.identify(user.id, {
      email: user.email,
      language: settings.language,
      name: user.name,
      plan: plan.kind,
    })
  }, [user.id, user.email, user.name, settings.language, plan.kind])
}

const AppLayout = () => {
  const { me } = Route.useRouteContext()
  useNewVersionToast()
  useFreshCodeToast()
  useIdentify()
  const [isCommandMenuOpen, setIsCommandMenuOpen] = useState(false)
  const sidebarWidth = useSubscription(sidebarWidthStore)
  const router = useRouter()

  useEffect(() => {
    // Charts and the AI SDK would otherwise compete with the first page's own requests.
    const idle = requestIdleCallback(() => {
      for (const route of Object.values(router.routesById)) {
        if (route.id.startsWith('/_app/')) {
          void router.loadRouteChunk(route)
        }
      }
    })
    return () => cancelIdleCallback(idle)
  }, [router])
  useEffect(() => {
    void mailRowsOf().preload()
  }, [])
  useEffect(() => {
    const controller = new AbortController()
    void listenForChanges(controller.signal)
    return () => controller.abort()
  }, [])

  return (
    <ComposeProvider>
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
            <NoticeBar />
            <div
              data-slot="thread-pane-area"
              className="relative flex min-h-0 flex-1 flex-col"
            >
              <Outlet />
            </div>
          </ResizablePanel>
        </ResizableGroup>
        <CommandMenu
          open={isCommandMenuOpen}
          onOpenChange={setIsCommandMenuOpen}
        />
        <NewBoardDialog />
        <UpgradeDialog />
        <DeleteBoardDialog />
        <ClearOutDialog />
        <ConfirmDialog />
        <ThreadPeekPopover />
        <ThreadPane />
        <SnoozePicker />
      </div>
    </ComposeProvider>
  )
}

export const Route = createFileRoute('/_app')({
  beforeLoad: async ({ context: { queryClient } }) => {
    const meQuery = orpc.me.queryOptions()
    // Every navigation passes here, so a cached account answers at once; one without settings is onboarding that just finished.
    const me = await (
      queryClient.getQueryData(meQuery.queryKey)?.settings
        ? queryClient.ensureQueryData({ ...meQuery, revalidateIfStale: true })
        : queryClient.fetchQuery({ ...meQuery, staleTime: 0 })
    ).catch(() => null)
    signedInStore.set(Boolean(me))
    if (!me) {
      throw redirect({ to: '/login' })
    }
    if (!me.hasGmail) {
      throw redirect({ search: { missing: 'gmail' }, to: '/login' })
    }
    if (!me.settings) {
      throw redirect({ to: '/onboarding' })
    }
    localeStore.set(me.settings.language)
    return { me: { ...me, settings: me.settings } }
  },
  component: AppLayout,
})
