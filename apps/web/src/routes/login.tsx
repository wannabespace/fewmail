import { Button } from '@fewmail/ui/components/button'
import { Kbd } from '@fewmail/ui/components/kbd'
import { cn } from '@fewmail/ui/lib/utils'
import { useHotkey } from '@tanstack/react-hotkeys'
import { createFileRoute, Link } from '@tanstack/react-router'
import { motion, useReducedMotion } from 'motion/react'
import { Fragment, useState } from 'react'

import { LanguageSelect } from '~/components/agent-fields'
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

const PREVIEW_ROWS = [
  { isImportant: false, width: 'w-3/5' },
  { isImportant: false, width: 'w-2/3' },
  { isImportant: true, width: 'w-4/5' },
  { isImportant: false, width: 'w-1/2' },
  { isImportant: false, width: 'w-3/4' },
]

const InboxPreview = () => {
  const isReduced = useReducedMotion()

  return (
    <div aria-hidden="true" className="flex w-full max-w-sm flex-col gap-3">
      {PREVIEW_ROWS.map(({ isImportant, width }, index) => (
        <motion.div
          // oxlint-disable-next-line react/no-array-index-key -- static decoration, never reorders
          key={index}
          initial={isReduced ? false : { opacity: 0, y: 12 }}
          animate={
            isImportant
              ? { opacity: 1, scale: 1.04, y: 0 }
              : { opacity: 0.55, scale: 0.97, x: 20, y: 0 }
          }
          transition={{
            delay: isReduced ? 0 : 0.15 + index * 0.06,
            duration: 0.5,
            ease: EASE,
            opacity: { delay: isReduced ? 0 : 0.9 + index * 0.08 },
            scale: { delay: isReduced ? 0 : 0.9 + index * 0.08 },
            x: { delay: isReduced ? 0 : 0.9 + index * 0.08 },
          }}
          className={cn(
            'bg-popover flex items-center gap-3 rounded-2xl p-4 ring',
            isImportant ? 'ring-foreground/10 shadow-sm' : 'ring-foreground/6'
          )}
        >
          <span
            className={cn(
              'size-2 shrink-0 rounded-full',
              isImportant ? 'bg-primary' : 'ring-foreground/30 ring-1'
            )}
          />
          <span className="flex flex-1 flex-col gap-2">
            <span className="bg-foreground/15 h-2 w-1/3 rounded-full" />
            <span className={cn('bg-foreground/8 h-2 rounded-full', width)} />
          </span>
        </motion.div>
      ))}
    </div>
  )
}

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
        <InboxPreview />
      </aside>
    </main>
  )
}

export const Route = createFileRoute('/login')({
  component: LoginPage,
})
