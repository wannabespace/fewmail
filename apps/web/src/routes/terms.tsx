import { createFileRoute } from '@tanstack/react-router'

import { LegalDocument } from '~/components/legal-document'
import content from '~/legal/terms-of-service.md?raw'
import { LEGAL_UPDATED_AT } from '~/legal/updated-at'
import { useT } from '~/lib/i18n'

const TermsPage = () => (
  <LegalDocument
    title={useT().legal.terms}
    updatedAt={LEGAL_UPDATED_AT}
    content={content}
  />
)

export const Route = createFileRoute('/terms')({
  component: TermsPage,
  head: () => ({ meta: [{ title: 'Terms of Service · Fewmail' }] }),
})
