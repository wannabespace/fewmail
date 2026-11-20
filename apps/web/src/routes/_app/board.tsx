import { createFileRoute, redirect } from '@tanstack/react-router'

/** The Board is a bot on Home now (`?bot=board`); links to its old page land there. */
export const Route = createFileRoute('/_app/board')({
  beforeLoad: () => {
    throw redirect({ search: { bot: 'board' }, to: '/home' })
  },
})
