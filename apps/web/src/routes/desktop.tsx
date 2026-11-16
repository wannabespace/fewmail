import { Button } from '@fewmail/ui/components/button'
import { createFileRoute, redirect } from '@tanstack/react-router'
import { type } from 'arktype'

import { Logo } from '~/components/logo'
import { authClient, signedInStore } from '~/lib/auth'
import { useT } from '~/lib/i18n'
import { posthog } from '~/lib/posthog'

const safePath = (next?: string) =>
  next?.startsWith('/') && !next.startsWith('//') ? next : '/home'

/**
 * The desktop app's sign-in (`desktop.signIn`, `apps/desktop`): opened in the browser with the app's `state`, it signs in
 * there and hands a one-time token to `fewmail://sign-in`; the app opens it here again with the `token`, inside its own window.
 */
const DesktopPage = () => {
  const t = useT().desktop
  const { link } = Route.useLoaderData()
  return (
    <main className="bg-body flex flex-1 flex-col gap-10 px-6 py-6 sm:px-12 sm:py-8">
      <header>
        <Logo />
      </header>
      <div className="my-auto flex w-full max-w-md flex-col gap-8 self-center">
        <div className="flex flex-col gap-4">
          <h1 className="text-display font-serif tracking-tight text-balance">
            {t.title}
          </h1>
          <p className="text-brief text-foreground/75 font-serif text-pretty">
            {t.lead}
          </p>
        </div>
        <Button
          size="lg"
          className="self-start"
          render={<a href={link} aria-label={t.open} />}
        >
          {t.open}
        </Button>
      </div>
    </main>
  )
}

export const Route = createFileRoute('/desktop')({
  component: DesktopPage,
  loaderDeps: ({ search }) => search,
  loader: async ({ deps: { hint, next, state, token } }) => {
    if (token) {
      const { error } = await authClient.oneTimeToken.verify({ token })
      if (!error) {
        signedInStore.set(true)
        posthog.capture('desktop_signed_in')
      }
      throw redirect({
        href: error ? '/login' : safePath(next),
        reloadDocument: true,
      })
    }
    const { data: session } = await authClient.getSession()
    if (!session) {
      await authClient.signIn.social({
        callbackURL: window.location.href,
        loginHint: hint,
        provider: 'google',
      })
      return { link: '' }
    }
    const { data } = await authClient.oneTimeToken.generate()
    const link = `fewmail://sign-in?${new URLSearchParams({
      next: safePath(next),
      state: state ?? '',
      token: data?.token ?? '',
    })}`
    window.location.assign(link)
    return { link }
  },
  validateSearch: type({
    'hint?': 'string',
    'next?': 'string',
    'state?': 'string',
    'token?': 'string',
  }),
})
