import { createFileRoute, redirect } from '@tanstack/react-router'
import { type } from 'arktype'

// The agent moved under Home; chat links already sent to Telegram, WhatsApp and push still open /agent.
export const Route = createFileRoute('/_app/agent')({
  validateSearch: type({ 'chat?': 'string.uuid', 'thread?': 'string' }),
  beforeLoad: ({ search }) => {
    throw redirect({ search, to: '/home' })
  },
})
