import { Button } from '@fewmail/ui/components/button'
import { createFileRoute, Link } from '@tanstack/react-router'
import { Fragment, useState } from 'react'

import { LanguageSelect } from '~/components/agent-fields'
import { Logo } from '~/components/logo'
import { signInWithGoogle } from '~/lib/auth'
import { localeStore, useLocale, useT } from '~/lib/i18n'

const LoginPage = () => {
  const t = useT()
  const locale = useLocale()
  const [isRedirecting, setIsRedirecting] = useState(false)

  return (
    <main className="bg-body flex flex-1 flex-col items-center justify-center gap-10 px-6 py-12">
      <div className="flex w-full max-w-md flex-col gap-8">
        <Logo />
        <div className="flex flex-col gap-4">
          <h1 className="text-display font-serif tracking-tight">
            {t.login.title}
          </h1>
          <p className="text-brief text-foreground/80 font-serif">
            {t.login.lead}
          </p>
        </div>
        <div className="flex flex-col gap-3">
          <Button
            size="lg"
            disabled={isRedirecting}
            onClick={() => {
              setIsRedirecting(true)
              void signInWithGoogle()
            }}
          >
            {t.login.continue}
          </Button>
          <p className="text-muted-foreground text-xs">{t.login.consent}</p>
          <p className="text-muted-foreground text-xs">
            {t.login
              .agree({
                privacy: <Link to="/privacy">{t.legal.privacy}</Link>,
                terms: <Link to="/terms">{t.legal.terms}</Link>,
              })
              .map((part, index) => (
                // oxlint-disable-next-line react/no-array-index-key -- parts of one sentence never reorder
                <Fragment key={index}>{part}</Fragment>
              ))}
          </p>
        </div>
      </div>
      <LanguageSelect
        value={locale}
        onChange={(next) => localeStore.set(next)}
      />
    </main>
  )
}

export const Route = createFileRoute('/login')({
  component: LoginPage,
})
