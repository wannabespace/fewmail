import { createFileRoute } from '@tanstack/react-router'

import { MailPage, mailSearch } from '~/components/mail-page'

const DraftsPage = () => <MailPage folder="drafts" />

export const Route = createFileRoute('/_app/mail_/drafts')({
  component: DraftsPage,
  validateSearch: mailSearch,
})
