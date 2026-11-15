import { createFileRoute } from '@tanstack/react-router'

import { MailPage, mailSearch } from '~/components/mail-page'

const ArchivePage = () => <MailPage folder="archive" />

export const Route = createFileRoute('/_app/mail_/archive')({
  component: ArchivePage,
  validateSearch: mailSearch,
})
