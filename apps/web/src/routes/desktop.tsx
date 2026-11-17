import { signInChallenge } from '@fewmail/shared/sign-in-challenge'
import { Alert, AlertDescription } from '@fewmail/ui/components/alert'
import { Button } from '@fewmail/ui/components/button'
import { useMutation } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import { z } from 'zod/mini'

import { Logo } from '~/components/logo'
import { authClient, signInWithGoogle } from '~/lib/auth'
import { useT } from '~/lib/i18n'
import { orpc } from '~/lib/orpc'

/**
 * Where the desktop app (`apps/desktop`) signs in, since Google refuses embedded views: the app opens this
 * in the browser with its PKCE `challenge` (`services/desktop-sign-in.ts`); signed in here, the user checks that the
 * code matches the app's and confirms, and the app takes the session.
 */
const DesktopPage = () => {
  const t = useT().desktop
  const { challenge } = Route.useSearch()
  const { code } = Route.useLoaderData()
  const confirm = useMutation(orpc.desktopSignIn.confirm.mutationOptions())
  const lead = code ? t.confirmLead(code) : t.expired
  return (
    <main className="bg-body flex flex-1 flex-col gap-10 px-6 py-6 sm:px-12 sm:py-8">
      <header>
        <Logo />
      </header>
      <div className="my-auto flex w-full max-w-md flex-col gap-8 self-center">
        <div className="flex flex-col gap-4">
          <h1 className="text-display font-serif tracking-tight text-balance">
            {confirm.isSuccess ? t.title : t.confirmTitle}
          </h1>
          <p className="text-brief text-foreground/75 font-serif text-pretty">
            {confirm.isSuccess ? t.lead : lead}
          </p>
        </div>
        {confirm.isError && (
          <Alert variant="error">
            <AlertDescription>{t.expired}</AlertDescription>
          </Alert>
        )}
        {challenge && code && !confirm.isSuccess && (
          <Button
            size="lg"
            className="self-start"
            disabled={confirm.isPending}
            onClick={() => confirm.mutate({ challenge })}
          >
            {t.confirm}
          </Button>
        )}
      </div>
    </main>
  )
}

export const Route = createFileRoute('/desktop')({
  component: DesktopPage,
  loaderDeps: ({ search }) => search,
  loader: async ({ deps: { challenge } }) => {
    const { data: session } = await authClient.getSession()
    if (!session) {
      await signInWithGoogle(`${location.pathname}${location.search}`)
    }
    return {
      code: challenge ? await signInChallenge.codeOf(challenge) : null,
    }
  },
  validateSearch: z.object({ challenge: z.optional(z.string()) }),
})
