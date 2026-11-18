import { useHotkey } from '@tanstack/react-hotkeys'
import {
  createFileRoute,
  useCanGoBack,
  useRouter,
} from '@tanstack/react-router'

import { KeyHints } from '~/components/key-hints'
import { ThreadView } from '~/components/thread-view'
import { useT } from '~/lib/i18n'

/** Any email on its own, the whole width: esc and ✕ go back to wherever it was opened from, or from a link to Mail. */
const EmailPage = () => {
  const t = useT()
  const router = useRouter()
  const canGoBack = useCanGoBack()
  const { threadId } = Route.useParams()
  const close = () =>
    canGoBack ? router.history.back() : router.navigate({ to: '/mail' })
  // An editor's own esc (leave the draft) comes first: one step per press.
  useHotkey('Escape', close, { ignoreDefaultPrevented: true })

  return (
    <div className="bg-background under-notice flex min-h-0 min-w-0 flex-1 flex-col">
      <ThreadView
        key={threadId}
        isFullPage
        isSnoozed={false}
        threadId={threadId}
        onClose={close}
        onDone={close}
      />
      <KeyHints
        hints={[
          ['R', t.keys.reply],
          ['E', t.keys.archive],
          ['esc', t.keys.close],
        ]}
      />
    </div>
  )
}

export const Route = createFileRoute('/_app/mail_/$threadId')({
  component: EmailPage,
})
