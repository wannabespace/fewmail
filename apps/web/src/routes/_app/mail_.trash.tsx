import { createFileRoute } from '@tanstack/react-router'

import { MailPage, mailSearch } from '~/components/mail-page'

const TrashPage = () => <MailPage folder="trash" />

export const Route = createFileRoute('/_app/mail_/trash')({
  component: TrashPage,
  validateSearch: mailSearch,
})
