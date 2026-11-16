import { createFileRoute, redirect } from '@tanstack/react-router'

/** The Board lives on Home now (`?page=board`); links to its old page land there. */
export const Route = createFileRoute('/_app/board')({
  beforeLoad: () => {
    throw redirect({ search: { page: 'board' }, to: '/home' })
  },
})
