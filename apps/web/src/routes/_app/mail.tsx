import { createFileRoute } from '@tanstack/react-router'
import { z } from 'zod/mini'

import { INBOX_VIEWS, MailPage, mailSearch } from '~/components/mail-page'

export const Route = createFileRoute('/_app/mail')({
  component: MailPage,
  validateSearch: z.extend(mailSearch, {
    filter: z.optional(z.enum(INBOX_VIEWS)),
  }),
})
