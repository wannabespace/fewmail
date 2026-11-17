import { createFileRoute, redirect } from '@tanstack/react-router'
import { z } from 'zod/mini'

import { isInboxView, MailPage, mailSearch } from '~/components/mail-page'

export const Route = createFileRoute('/_app/mail')({
  // Folders were `?filter=` before they had pages of their own, and links to them still arrive.
  beforeLoad: ({ search: { filter, ...search } }) => {
    if (filter && !isInboxView(filter)) {
      throw redirect({ search, to: `/mail/${filter}` })
    }
  },
  component: MailPage,
  validateSearch: z.extend(mailSearch, {
    filter: z.optional(
      z.enum([
        'focused',
        'unread',
        'categories',
        'inbox',
        'snoozed',
        'sent',
        'drafts',
        'archive',
        'spam',
        'trash',
      ])
    ),
  }),
})
