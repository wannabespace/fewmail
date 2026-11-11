import { Toaster } from '@fewmail/ui/components/sonner'
import { TooltipProvider } from '@fewmail/ui/components/tooltip'
import { ThemeObserver } from '@fewmail/ui/theme-observer'
import type { QueryClient } from '@tanstack/react-query'
import { QueryClientProvider } from '@tanstack/react-query'
import { createRootRouteWithContext, Outlet } from '@tanstack/react-router'

const RootComponent = () => {
  const { queryClient } = Route.useRouteContext()

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <ThemeObserver />
        <Outlet />
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  )
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()(
  {
    component: RootComponent,
  }
)
