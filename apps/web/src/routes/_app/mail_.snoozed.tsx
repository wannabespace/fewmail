import { createFileRoute } from '@tanstack/react-router'

import { MailPage, mailSearch } from '~/components/mail-page'

const SnoozedPage = () => <MailPage folder="snoozed" />

export const Route = createFileRoute('/_app/mail_/snoozed')({
  component: SnoozedPage,
  validateSearch: mailSearch,
})
