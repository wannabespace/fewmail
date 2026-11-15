import { createFileRoute } from '@tanstack/react-router'

import { MailPage, mailSearch } from '~/components/mail-page'

const SentPage = () => <MailPage folder="sent" />

export const Route = createFileRoute('/_app/mail_/sent')({
  component: SentPage,
  validateSearch: mailSearch,
})
