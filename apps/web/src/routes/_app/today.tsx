import { createFileRoute, redirect } from '@tanstack/react-router'

// Installed apps (manifest start_url) and links sent before the rename still open /today.
export const Route = createFileRoute('/_app/today')({
  beforeLoad: () => {
    throw redirect({ to: '/home' })
  },
})
