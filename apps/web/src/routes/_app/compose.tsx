import { textToHtml } from '@fewmail/shared/email'
import { useHotkey } from '@tanstack/react-hotkeys'
import { createFileRoute, useLocation, useRouter } from '@tanstack/react-router'
import { z } from 'zod/mini'

import type { Draft } from '~/components/compose/compose-context'
import { EMPTY_DRAFT } from '~/components/compose/compose-context'
import { ComposeForm } from '~/components/compose/compose-form'
import { KeyHints } from '~/components/key-hints'
import { useT } from '~/lib/i18n'
import { useHasAgent } from '~/lib/me'

const addressesOf = (value = '') =>
  value
    .split(',')
    .map((part) => part.trim())
    .filter(Boolean)

/**
 * A `mailto:` link (RFC 6068) as a draft: the desktop app opens one here. Its fields are percent-encoded, where a `+`
 * stays a `+` (an address may hold one), so URLSearchParams, which reads it as a space, is not used.
 */
const draftOfMailto = (link: string): Partial<Draft> => {
  const [address = '', query = ''] = link.replace(/^mailto:/iu, '').split('?')
  const fields = new Map(
    query
      .split('&')
      .map((pair) => pair.split('='))
      .map(([name = '', value = '']) => [
        name.toLowerCase(),
        decodeURIComponent(value),
      ])
  )
  return {
    bcc: addressesOf(fields.get('bcc')),
    cc: addressesOf(fields.get('cc')),
    html: textToHtml(fields.get('body') ?? ''),
    subject: fields.get('subject') ?? '',
    to: [
      ...addressesOf(decodeURIComponent(address)),
      ...addressesOf(fields.get('to')),
    ],
  }
}

const ComposePage = () => {
  const t = useT()
  const router = useRouter()
  const hasAgent = useHasAgent()
  const state = useLocation({ select: (location) => location.state })
  const { mailto } = Route.useSearch()
  const draft = {
    ...EMPTY_DRAFT,
    ...state.compose,
    ...(mailto && draftOfMailto(mailto)),
  }
  const leave = () =>
    router.history.canGoBack()
      ? router.history.back()
      : router.navigate({ to: hasAgent ? '/home' : '/mail' })
  useHotkey('Escape', leave, { ignoreInputs: true })

  return (
    <main className="flex flex-1 flex-col overflow-hidden">
      <div className="under-notice flex-1 overflow-y-auto">
        <div className="mx-auto flex max-w-2xl flex-col gap-6 px-10 pt-12 pb-16 max-md:px-4 max-md:pt-6">
          <h1 className="text-display font-serif tracking-tight">
            {t.compose[draft.mode]}
          </h1>
          <ComposeForm
            key={state.__TSR_key ?? mailto}
            draft={draft}
            onDone={leave}
          />
        </div>
      </div>
      <KeyHints
        hints={[
          ['⌘⏎', t.keys.send],
          ['⇧⌘U', t.keys.attach],
          ['esc', t.keys.close],
        ]}
      />
    </main>
  )
}

export const Route = createFileRoute('/_app/compose')({
  component: ComposePage,
  validateSearch: z.object({ mailto: z.optional(z.string()) }),
})
