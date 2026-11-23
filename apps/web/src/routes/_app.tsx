import {
  ResizableGroup,
  ResizablePanel,
  ResizableSeparator,
} from '@fewmail/ui/components/custom/resizable'
import { useIsMobile } from '@fewmail/ui/hooks/use-is-mobile'
import { useHotkey } from '@tanstack/react-hotkeys'
import { useQuery } from '@tanstack/react-query'
import {
  createFileRoute,
  Outlet,
  redirect,
  useNavigate,
  useRouter,
} from '@tanstack/react-router'
import { useEffect } from 'react'
import type { CSSProperties } from 'react'
import { useSubscription } from 'seitu/react'
import { createWebStorageValue } from 'seitu/web'
import { toast } from 'sonner'
import { z } from 'zod/mini'

import { ComposeProvider } from '~/components/compose/compose-context'
import { ConfirmDialog, NameDialog } from '~/components/confirm-dialog'
import { mailSearchFieldStore } from '~/components/mail-search'
import { MobileBar, Sidebar } from '~/components/nav'
import { NoticeBar, noticeHeightStore } from '~/components/notice-bar'
import { ThreadPane } from '~/components/thread-link'
import { SnoozePicker } from '~/components/thread-view'
import { UpgradeDialog } from '~/components/upgrade-dialog'
import { signedInStore } from '~/lib/auth'
import { localeStore, useT } from '~/lib/i18n'
import { mailRowsOf } from '~/lib/mail-db'
import { useMe } from '~/lib/me'
import { client, listenForChanges, orpc } from '~/lib/orpc'
import { posthog } from '~/lib/posthog'
import { clearSnapshot, restoreSnapshot } from '~/lib/snapshot'
import { undoLatest } from '~/lib/undo'

const SIDEBAR_WIDTH = { default: 272, max: 360, min: 232, rail: 64 }

const sidebarWidthStore = createWebStorageValue({
  defaultValue: SIDEBAR_WIDTH.default,
  key: 'fewmail.sidebar-width',
  schema: z.number(),
  type: 'localStorage',
})

const sidebarCollapsedStore = createWebStorageValue({
  defaultValue: false,
  key: 'fewmail.sidebar-collapsed',
  schema: z.boolean(),
  type: 'localStorage',
})

const useSidebarRail = (isEnabled: boolean) => {
  const isCollapsed = useSubscription(sidebarCollapsedStore)
  const collapse = (collapsed: boolean, key: 'button' | 'drag' | 'mod_b') => {
    posthog.capture('sidebar_toggled', { collapsed, key })
    sidebarCollapsedStore.set(collapsed)
  }
  useHotkey('Mod+B', () => collapse(!isCollapsed, 'mod_b'), {
    enabled: isEnabled,
    ignoreInputs: true,
  })
  return { collapse, isCollapsed }
}

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

/** The notice bar floats over the page, which scrolls under it from `under-notice`. */
const PageColumn = () => {
  const noticeHeight = useSubscription(noticeHeightStore)
  return (
    <div
      data-slot="page-column"
      style={{ '--notice-height': `${noticeHeight}px` } as CSSProperties}
      className="relative flex min-h-0 flex-1 flex-col overflow-clip"
    >
      <NoticeBar />
      {/* isolate: Reading's panes inside stay under the notice bar. */}
      <div
        data-slot="thread-pane-area"
        className="relative isolate flex min-h-0 flex-1 flex-col"
      >
        <Outlet />
      </div>
    </div>
  )
}

const AppLayout = () => {
  const { me } = Route.useRouteContext()
  useNewVersionToast()
  useIdentify()
  // A field keeps ⌘Z for its own text.
  useHotkey('Mod+Z', undoLatest, { ignoreInputs: true })
  const navigate = useNavigate()
  useHotkey('Mod+F', () => {
    posthog.capture('mail_search_opened', { key: 'mod_f' })
    const field = mailSearchFieldStore.get()
    if (field) {
      field.focus()
      field.select()
    } else {
      void navigate({ search: { q: '' }, to: '/mail' })
    }
  })
  const sidebarWidth = useSubscription(sidebarWidthStore)
  const router = useRouter()
  const isMobile = useIsMobile()
  const rail = useSidebarRail(!isMobile)

  useEffect(() => {
    // Charts and the AI SDK would otherwise compete with the first page's own requests.
    const preloadChunks = () => {
      for (const route of Object.values(router.routesById)) {
        if (route.id.startsWith('/_app/')) {
          void router.loadRouteChunk(route)
        }
      }
    }
    // Safari has no requestIdleCallback; calling it there throws and takes the whole app down.
    if (!('requestIdleCallback' in window)) {
      const timeout = setTimeout(preloadChunks, 2000)
      return () => clearTimeout(timeout)
    }
    const idle = requestIdleCallback(preloadChunks)
    return () => cancelIdleCallback(idle)
  }, [router])
  useEffect(() => {
    void mailRowsOf().preload()
    const controller = new AbortController()
    void listenForChanges(controller.signal)
    return () => controller.abort()
  }, [])

  return (
    <ComposeProvider>
      <div className="bg-body flex h-dvh">
        {isMobile ? (
          <div className="flex min-w-0 flex-1 flex-col">
            <MobileBar email={me.user.email} />
            <PageColumn />
          </div>
        ) : (
          <ResizableGroup className="flex-1">
            <ResizablePanel
              className="flex"
              size={sidebarWidth}
              minSize={SIDEBAR_WIDTH.min}
              maxSize={SIDEBAR_WIDTH.max}
              collapsed={rail.isCollapsed}
              collapsedSize={SIDEBAR_WIDTH.rail}
              onCollapsedChange={(collapsed) =>
                rail.collapse(collapsed, 'drag')
              }
              onSizeChange={(width) => sidebarWidthStore.set(width)}
            >
              <Sidebar
                email={me.user.email}
                isCollapsed={rail.isCollapsed}
                onToggleRail={() => rail.collapse(!rail.isCollapsed, 'button')}
              />
            </ResizablePanel>
            <ResizableSeparator />
            <ResizablePanel className="flex min-w-0 flex-col">
              <PageColumn />
            </ResizablePanel>
          </ResizableGroup>
        )}
        <UpgradeDialog />
        <ConfirmDialog />
        <NameDialog />
        <ThreadPane />
        <SnoozePicker />
      </div>
    </ComposeProvider>
  )
}

export const Route = createFileRoute('/_app')({
  beforeLoad: async ({ context: { queryClient } }) => {
    const meQuery = orpc.me.queryOptions()
    // Every navigation passes here, so a cached account answers at once; one without settings has just signed up.
    const me = await (
      queryClient.getQueryData(meQuery.queryKey)?.settings
        ? queryClient.ensureQueryData({ ...meQuery, revalidateIfStale: true })
        : queryClient.fetchQuery({ ...meQuery, staleTime: 0 })
    ).catch(() => null)
    signedInStore.set(Boolean(me))
    if (!me) {
      await clearSnapshot()
      throw redirect({ to: '/login' })
    }
    if (!me.hasGmail) {
      throw redirect({ search: { missing: 'gmail' }, to: '/login' })
    }
    // The first visit saves the language the browser or the login page chose; the first save seeds the starter bots in it.
    const settings =
      me.settings ??
      (await client.settings.save({
        language: localeStore.get(),
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      }))
    if (!me.settings) {
      queryClient.setQueryData(meQuery.queryKey, { ...me, settings })
    }
    localeStore.set(settings.language)
    await restoreSnapshot(me.user.id)
    return { me: { ...me, settings } }
  },
  component: AppLayout,
})
