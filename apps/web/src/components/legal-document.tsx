import { Response } from '@fewmail/ui/components/response'

import { useDates, useLocale, useT } from '~/lib/i18n'

import { Logo } from './logo'

export const LegalDocument = ({
  content,
  title,
  updatedAt,
}: {
  content: string
  title: string
  updatedAt: Date
}) => {
  const t = useT()
  const dates = useDates()
  const locale = useLocale()

  return (
    <main className="bg-body flex-1">
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-12 px-6 py-16">
        <Logo />
        <header className="flex flex-col gap-3">
          <h1 className="text-display font-serif tracking-tight">{title}</h1>
          <p className="text-muted-foreground text-sm">
            {t.legal.updated(dates.format(updatedAt, 'PPP'))}
          </p>
          {locale !== 'en' && (
            <p className="text-muted-foreground text-sm">
              {t.legal.englishOnly}
            </p>
          )}
        </header>
        <div lang="en">
          <Response variant="document" mode="static">
            {content}
          </Response>
        </div>
      </div>
    </main>
  )
}
