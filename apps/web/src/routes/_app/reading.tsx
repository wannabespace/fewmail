import { createFileRoute, redirect } from '@tanstack/react-router'

// Links in digests already sent to Telegram and WhatsApp still point here.
export const Route = createFileRoute('/_app/reading')({
  beforeLoad: () => {
    throw redirect({ search: { page: 'reading' }, to: '/home' })
  },
})
