import { useHotkey } from '@tanstack/react-hotkeys'
import {
  createFileRoute,
  useCanGoBack,
  useRouter,
} from '@tanstack/react-router'

import { KeyHints } from '~/components/key-hints'
import { ThreadView } from '~/components/thread-view'
import { useT } from '~/lib/i18n'

/** Any email on its own, the whole width: esc goes back to wherever it was opened from, or to Mail from a link. */
const EmailPage = () => {
  const t = useT()
  const router = useRouter()
  const canGoBack = useCanGoBack()
  const { threadId } = Route.useParams()
  const close = () =>
    canGoBack ? router.history.back() : router.navigate({ to: '/mail' })
  useHotkey('Escape', close)

  return (
    <div className="bg-background flex min-h-0 min-w-0 flex-1 flex-col">
      <ThreadView
        key={threadId}
        isSnoozed={false}
        threadId={threadId}
        onClose={close}
        onDone={close}
      />
      <KeyHints
        hints={[
          ['R', t.keys.reply],
          ['E', t.keys.archive],
          ['/', t.keys.ask],
          ['esc', t.keys.close],
        ]}
      />
    </div>
  )
}

export const Route = createFileRoute('/_app/mail_/$threadId')({
  component: EmailPage,
})
