import { createFileRoute, redirect } from '@tanstack/react-router'

import { isInboxView, MailPage, mailSearch } from '~/components/mail-page'

export const Route = createFileRoute('/_app/mail')({
  // Folders were `?filter=` before they had pages of their own, and links to them still arrive.
  beforeLoad: ({ search: { filter, ...search } }) => {
    if (filter && !isInboxView(filter)) {
      throw redirect({ search, to: `/mail/${filter}` })
    }
  },
  component: MailPage,
  validateSearch: mailSearch.and({
    'filter?':
      "'focused' | 'unread' | 'categories' | 'inbox' | 'snoozed' | 'sent' | 'drafts' | 'archive' | 'spam' | 'trash'",
  }),
})
