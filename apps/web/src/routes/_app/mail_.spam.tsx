import { createFileRoute } from '@tanstack/react-router'

import { MailPage, mailSearch } from '~/components/mail-page'

const SpamPage = () => <MailPage folder="spam" />

export const Route = createFileRoute('/_app/mail_/spam')({
  component: SpamPage,
  validateSearch: mailSearch,
})
