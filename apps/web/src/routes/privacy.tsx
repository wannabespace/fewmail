import { createFileRoute } from '@tanstack/react-router'

import { LegalDocument } from '~/components/legal-document'
import content from '~/legal/privacy-policy.md?raw'
import { LEGAL_UPDATED_AT } from '~/legal/updated-at'
import { useT } from '~/lib/i18n'

const PrivacyPage = () => (
  <LegalDocument
    title={useT().legal.privacy}
    updatedAt={LEGAL_UPDATED_AT}
    content={content}
  />
)

export const Route = createFileRoute('/privacy')({
  component: PrivacyPage,
  head: () => ({ meta: [{ title: 'Privacy Policy · Fewmail' }] }),
})
