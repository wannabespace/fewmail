import { createFileRoute, Outlet } from '@tanstack/react-router'

import { SiteFooter, SiteHeader } from '~/components/site'

const SiteLayout = () => (
  <div lang="en" className="bg-body flex min-h-svh flex-col overflow-x-clip">
    <SiteHeader />
    <main className="flex-1">
      <Outlet />
    </main>
    <SiteFooter />
  </div>
)

export const Route = createFileRoute('/_site')({
  component: SiteLayout,
})
