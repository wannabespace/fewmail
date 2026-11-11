import { Button } from '@fewmail/ui/components/button'
import { Kbd } from '@fewmail/ui/components/kbd'
import { BubbleChatIcon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { useHotkey } from '@tanstack/react-hotkeys'
import { createFileRoute, Link } from '@tanstack/react-router'
import { motion } from 'motion/react'
import { Fragment, useState } from 'react'

import { LanguageSelect } from '~/components/agent-fields'
import { LoginStory } from '~/components/login-story'
import { Logo } from '~/components/logo'
import { signInWithGoogle } from '~/lib/auth'
import { localeStore, useLocale, useT } from '~/lib/i18n'

const EASE = [0.32, 0.72, 0, 1] as const

const rise = {
  hidden: { opacity: 0, y: 8 },
  shown: { opacity: 1, transition: { duration: 0.25, ease: EASE }, y: 0 },
}

const GoogleMark = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path
      fill="currentColor"
      d="M21.35 11.1H12v2.98h5.35c-.23 1.4-1.66 4.1-5.35 4.1-3.22 0-5.85-2.67-5.85-5.96S8.78 6.26 12 6.26c1.83 0 3.06.78 3.76 1.45l2.56-2.47C16.68 3.7 14.55 2.75 12 2.75 6.89 2.75 2.75 6.89 2.75 12s4.14 9.25 9.25 9.25c5.34 0 8.88-3.75 8.88-9.04 0-.6-.07-1.06-.15-1.51z"
    />
  </svg>
)

const LoginPage = () => {
  const t = useT()
  const locale = useLocale()
  const [isRedirecting, setIsRedirecting] = useState(false)

  const signIn = () => {
    if (isRedirecting) {
      return
    }
    setIsRedirecting(true)
    void signInWithGoogle()
  }

  useHotkey('Enter', signIn)

  return (
    <main className="bg-body grid flex-1 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
      <section className="flex flex-col gap-10 px-6 py-6 sm:px-12 sm:py-8">
        <header className="flex items-center justify-between gap-4">
          <Logo />
          <LanguageSelect
            value={locale}
            onChange={(next) => localeStore.set(next)}
          />
        </header>

        <motion.div
          initial="hidden"
          animate="shown"
          transition={{ staggerChildren: 0.04 }}
          className="my-auto flex w-full max-w-md flex-col gap-8 self-center"
        >
          <motion.div variants={rise} className="flex flex-col gap-4">
            <h1 className="text-display font-serif tracking-tight text-balance">
              {t.login.title}
            </h1>
            <p className="text-brief text-foreground/75 font-serif text-pretty">
              {t.login.lead}
            </p>
          </motion.div>
          <motion.p
            variants={rise}
            className="text-muted-foreground flex items-center gap-3 text-sm text-pretty"
          >
            <span className="bg-secondary text-foreground flex size-8 shrink-0 items-center justify-center rounded-lg">
              <HugeiconsIcon
                icon={BubbleChatIcon}
                strokeWidth={2}
                className="size-4"
              />
            </span>
            {t.login.messengers}
          </motion.p>
          <motion.div variants={rise} className="flex flex-col gap-4">
            <Button size="lg" disabled={isRedirecting} onClick={signIn}>
              <GoogleMark />
              {t.login.continue}
              <Kbd>⏎</Kbd>
            </Button>
            <p className="text-muted-foreground text-xs/relaxed text-pretty">
              {t.login.consent}
            </p>
          </motion.div>
        </motion.div>

        <footer className="text-muted-foreground text-xs">
          {t.login
            .agree({
              privacy: <Link to="/privacy">{t.legal.privacy}</Link>,
              terms: <Link to="/terms">{t.legal.terms}</Link>,
            })
            .map((part, index) => (
              // oxlint-disable-next-line react/no-array-index-key -- parts of one sentence never reorder
              <Fragment key={index}>{part}</Fragment>
            ))}
        </footer>
      </section>

      <aside className="bg-background ring-foreground/6 m-3 hidden items-center justify-center overflow-hidden rounded-3xl px-12 ring lg:flex">
        <LoginStory />
      </aside>
    </main>
  )
}

export const Route = createFileRoute('/login')({
  component: LoginPage,
})
