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

import { ClearOutDialog } from '~/components/clear-out-dialog'
import { ComposeProvider } from '~/components/compose/compose-context'
import { ConfirmDialog } from '~/components/confirm-dialog'
import { pageColumn } from '~/components/home-card'
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
import { listenForChanges, orpc } from '~/lib/orpc'
import { posthog } from '~/lib/posthog'
import { clearSnapshot, restoreSnapshot } from '~/lib/snapshot'
import { undoLatest } from '~/lib/undo'

const SIDEBAR_WIDTH = { default: 232, max: 320, min: 200 }

const sidebarWidthStore = createWebStorageValue({
  defaultValue: SIDEBAR_WIDTH.default,
  key: 'fewmail.sidebar-width',
  schema: z.number(),
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

/**
 * The notice bar floats over the page, which scrolls under it from `under-notice`; a pane a Home card grows into covers
 * both (`page-column`, `HomeCardPane`), so a notice never sits on top of what the user opened.
 */
const setPageColumn = (node: HTMLDivElement | null) => pageColumn.set(node)

const PageColumn = () => {
  const noticeHeight = useSubscription(noticeHeightStore)
  return (
    <div
      ref={setPageColumn}
      data-slot="page-column"
      style={{ '--notice-height': `${noticeHeight}px` } as CSSProperties}
      // Clipped: a Home pane with no card left to land on slides off the bottom, and would scroll the page while it does.
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
  }, [])
  useEffect(() => {
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
              onSizeChange={(width) => sidebarWidthStore.set(width)}
            >
              <Sidebar email={me.user.email} />
            </ResizablePanel>
            <ResizableSeparator />
            <ResizablePanel className="flex min-w-0 flex-col">
              <PageColumn />
            </ResizablePanel>
          </ResizableGroup>
        )}
        <UpgradeDialog />
        <ClearOutDialog />
        <ConfirmDialog />
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
      await clearSnapshot()
      throw redirect({ to: '/login' })
    }
    if (!me.hasGmail) {
      throw redirect({ search: { missing: 'gmail' }, to: '/login' })
    }
    if (!me.settings) {
      throw redirect({ to: '/onboarding' })
    }
    localeStore.set(me.settings.language)
    await restoreSnapshot(me.user.id)
    return { me: { ...me, settings: me.settings } }
  },
  component: AppLayout,
})
