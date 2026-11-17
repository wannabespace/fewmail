import { Button } from '@fewmail/ui/components/button'
import { Kbd } from '@fewmail/ui/components/kbd'
import { Spinner } from '@fewmail/ui/components/spinner'
import { useHotkey } from '@tanstack/react-hotkeys'
import { useMutation, useQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import { z } from 'zod/mini'

import { Logo } from '~/components/logo'
import { authClient } from '~/lib/auth'
import { useT } from '~/lib/i18n'

/** `consentPage` in `apps/api/lib/auth.ts` points here: renaming the route breaks connecting MCP clients. */
const ConnectPage = () => {
  const t = useT()
  const copy = t.settings.mcp
  const { client_id: clientId } = Route.useSearch()
  const { data: app } = useQuery({
    queryFn: async () => {
      const { data } = await authClient.oauth2.publicClient({
        query: { client_id: clientId },
      })
      return data
    },
    queryKey: ['oauth-client', clientId],
  })
  const answer = useMutation({
    meta: { event: 'mcp_consent_answered' },
    mutationFn: (accept: boolean) => authClient.oauth2.consent({ accept }),
  })
  const reply = (accept: boolean) => {
    if (!answer.isPending) {
      answer.mutate(accept)
    }
  }

  useHotkey('Enter', () => reply(true))
  useHotkey('Escape', () => reply(false))

  return (
    <main className="bg-body flex flex-1 flex-col gap-10 px-6 py-6 sm:px-12 sm:py-8">
      <header>
        <Logo />
      </header>
      <div className="my-auto flex w-full max-w-md flex-col gap-8 self-center">
        <div className="flex flex-col gap-4">
          <h1 className="text-display font-serif tracking-tight text-balance">
            {copy.request(app?.client_name ?? copy.defaultName)}
          </h1>
          <p className="text-brief text-foreground/75 font-serif text-pretty">
            {copy.description}
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            size="lg"
            variant="outline"
            disabled={answer.isPending}
            onClick={() => reply(false)}
            shortcut={<Kbd>Esc</Kbd>}
          >
            {answer.isPending && !answer.variables && <Spinner />}
            {copy.deny}
          </Button>
          <Button
            size="lg"
            disabled={answer.isPending}
            onClick={() => reply(true)}
            shortcut={<Kbd>⏎</Kbd>}
          >
            {answer.isPending && answer.variables && <Spinner />}
            {copy.allow}
          </Button>
        </div>
      </div>
    </main>
  )
}

export const Route = createFileRoute('/connect')({
  component: ConnectPage,
  validateSearch: z.object({ client_id: z.string() }),
})
