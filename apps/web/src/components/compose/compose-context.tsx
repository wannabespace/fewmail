import type { OutboxMode } from '@fewmail/shared/agent'
import { UNDO_SEND_SECONDS } from '@fewmail/shared/agent'
import type { OutgoingAttachment } from '@fewmail/shared/email'
import { useNow } from '@fewmail/ui/hooks/use-now'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import type { ReactNode } from 'react'
import { createContext, use } from 'react'
import { toast } from 'sonner'

import { useDates, useT } from '~/lib/i18n'
import { client, orpc } from '~/lib/orpc'
import { runUndo } from '~/lib/undo'

export interface Draft {
  attachments: OutgoingAttachment[]
  bcc: string[]
  cc: string[]
  gmailDraft: { id: string; mailboxId: string } | null
  html: string
  mailboxId: string | null
  mode: OutboxMode
  remindAfterDays: number | null
  replyToMessageId: string | null
  subject: string
  to: string[]
}

declare module '@tanstack/react-router' {
  interface HistoryState {
    compose?: Draft
  }
}

export const EMPTY_DRAFT: Draft = {
  attachments: [],
  bcc: [],
  cc: [],
  gmailDraft: null,
  html: '',
  mailboxId: null,
  mode: 'new',
  remindAfterDays: null,
  replyToMessageId: null,
  subject: '',
  to: [],
}

interface ComposeContextValue {
  /** Opens the compose page; a restored draft (after Undo) comes back exactly as it was. */
  openCompose: (draft?: Partial<Draft>) => Promise<void>
  send: (draft: Draft & { sendAt?: Date; text: string }) => void
}

const SendingIn = ({ sendAt }: { sendAt: Date }) => {
  const t = useT()
  const ms = sendAt.getTime() - useNow(250, sendAt.getTime())
  return t.compose.sendingIn(Math.max(0, Math.ceil(ms / 1000)))
}

const sendingIn = (sendAt: Date) => <SendingIn sendAt={sendAt} />

const ComposeContext = createContext<ComposeContextValue | null>(null)

export const useCompose = () => {
  const value = use(ComposeContext)
  if (!value) {
    throw new Error('useCompose needs ComposeProvider')
  }
  return value
}

export const ComposeProvider = ({ children }: { children: ReactNode }) => {
  const t = useT()
  const dates = useDates()
  const queryClient = useQueryClient()
  const navigate = useNavigate()
  const openCompose = (next?: Partial<Draft>) =>
    navigate({
      state: { compose: { ...EMPTY_DRAFT, ...next } },
      to: '/compose',
    })

  const sendMutation = useMutation(
    orpc.mail.send.mutationOptions({
      onError: (_error, _input, sending) => toast.dismiss(sending?.toastId),
      onMutate: (_input: unknown) => ({
        toastId: toast.loading(t.today.working),
      }),
      onSuccess: ({ id, sendAt }, _input, { toastId }) => {
        const isUndoWindow =
          sendAt.getTime() - Date.now() <= (UNDO_SEND_SECONDS + 1) * 1000
        toast.success(
          isUndoWindow
            ? sendingIn(sendAt)
            : t.compose.scheduledFor(dates.format(sendAt, 'PPp')),
          {
            action: {
              label: t.compose.undo,
              onClick: async () => {
                // The client's error interceptor already toasts "already sent"; a toast here would double it.
                const restored = await runUndo(() =>
                  client.mail.cancelSend({ id }).catch(() => null)
                )
                if (restored) {
                  void openCompose(restored)
                  toast(t.compose.canceled)
                }
              },
            },
            duration: isUndoWindow ? UNDO_SEND_SECONDS * 1000 : 6000,
            id: toastId,
          }
        )
        void queryClient.invalidateQueries({ queryKey: orpc.mail.key() })
      },
    })
  )

  return (
    <ComposeContext
      value={{
        openCompose,
        send: ({
          gmailDraft,
          mailboxId,
          remindAfterDays,
          replyToMessageId,
          ...input
        }) =>
          sendMutation.mutate({
            ...input,
            ...(gmailDraft && { draft: gmailDraft }),
            ...(mailboxId && { mailboxId }),
            ...(remindAfterDays && {
              remindAfterDays: remindAfterDays as 1 | 3 | 7,
            }),
            ...(replyToMessageId && { replyToMessageId }),
          }),
      }}
    >
      {children}
    </ComposeContext>
  )
}
