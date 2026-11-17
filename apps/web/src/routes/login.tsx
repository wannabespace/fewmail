import { signInChallenge } from '@fewmail/shared/sign-in-challenge'
import { Alert, AlertDescription } from '@fewmail/ui/components/alert'
import { Button } from '@fewmail/ui/components/button'
import { Kbd } from '@fewmail/ui/components/kbd'
import { useHotkey } from '@tanstack/react-hotkeys'
import { useMutation } from '@tanstack/react-query'
import { createFileRoute, Link } from '@tanstack/react-router'
import { motion } from 'motion/react'
import { Fragment, useRef, useState } from 'react'
import { z } from 'zod/mini'

import { LanguageSelect } from '~/components/agent-fields'
import { LoginStory } from '~/components/login-story'
import { Logo } from '~/components/logo'
import { authClient, signedInStore, signInWithGoogle } from '~/lib/auth'
import { isDesktop } from '~/lib/desktop'
import { localeStore, useLocale, useT } from '~/lib/i18n'
import { client } from '~/lib/orpc'
import { posthog } from '~/lib/posthog'

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

/**
 * The desktop app signs in through the browser, which Google allows: the server learns this app waits, the browser
 * opens `/desktop` with the challenge, and once the user confirms there the app takes the session (`desktopSignIn`).
 */
const signInFromDesktop = async (
  signal: AbortSignal,
  onCode: (code: string) => void
) => {
  posthog.capture('sign_in_started')
  const verifier = signInChallenge.createVerifier()
  const challenge = await signInChallenge.challengeOf(verifier)
  const events = await client.desktopSignIn.wait({ challenge }, { signal })
  // The browser's confirm refuses a challenge nobody waits on, so it opens only once the server has this one.
  await events.next()
  onCode(await signInChallenge.codeOf(challenge))
  window.open(
    `${location.origin}/desktop?${new URLSearchParams({ challenge })}`,
    '_blank'
  )
  for await (const { isConfirmed } of events) {
    if (isConfirmed) {
      break
    }
  }
  const { token } = await client.desktopSignIn.take({ challenge, verifier })
  await authClient.oneTimeToken.verify({ fetchOptions: { throw: true }, token })
  signedInStore.set(true)
  location.assign('/home')
}

const LoginPage = () => {
  const t = useT()
  const locale = useLocale()
  const { missing } = Route.useSearch()
  const [isRedirecting, setIsRedirecting] = useState(false)
  const [desktopCode, setDesktopCode] = useState<string | null>(null)
  const desktopAbort = useRef<AbortController | null>(null)
  const desktopSignIn = useMutation({
    mutationFn: () => {
      desktopAbort.current = new AbortController()
      return signInFromDesktop(desktopAbort.current.signal, setDesktopCode)
    },
    onSettled: () => setDesktopCode(null),
  })
  const cancelDesktopSignIn = () => {
    posthog.capture('sign_in_cancelled')
    desktopAbort.current?.abort()
    desktopSignIn.reset()
  }

  const signIn = () => {
    if (isDesktop) {
      if (!desktopSignIn.isPending) {
        desktopSignIn.mutate()
      }
      return
    }
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
        {/* The Mac app's traffic lights sit here, and the window is dragged by it. */}
        <div
          className="traffic-lights:block -mb-10 hidden h-6 shrink-0"
          data-tauri-drag-region
        />
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
            {missing === 'gmail' && (
              <Alert variant="error">
                <AlertDescription>{t.login.needsGmail}</AlertDescription>
              </Alert>
            )}
            {desktopSignIn.isError && (
              <Alert variant="error">
                <AlertDescription>{t.desktop.expired}</AlertDescription>
              </Alert>
            )}
            <Button
              size="lg"
              disabled={isRedirecting || desktopSignIn.isPending}
              onClick={signIn}
              shortcut={<Kbd>⏎</Kbd>}
            >
              <GoogleMark />
              {t.login.continue}
            </Button>
            {desktopCode ? (
              <div className="flex items-center justify-between gap-4">
                <p className="text-muted-foreground text-xs/relaxed text-pretty">
                  {t.desktop.waiting(desktopCode)}
                </p>
                <Button size="xs" variant="ghost" onClick={cancelDesktopSignIn}>
                  {t.settings.cancel}
                </Button>
              </div>
            ) : (
              <p className="text-muted-foreground text-xs/relaxed text-pretty">
                {t.login.consent}
              </p>
            )}
          </motion.div>
        </motion.div>

        <footer className="text-muted-foreground text-xs">
          {t.login
            .agree({
              privacy: (
                <Link to="/privacy" target="_blank">
                  {t.legal.privacy}
                </Link>
              ),
              terms: (
                <Link to="/terms" target="_blank">
                  {t.legal.terms}
                </Link>
              ),
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
  validateSearch: z.object({ missing: z.optional(z.literal('gmail')) }),
})
