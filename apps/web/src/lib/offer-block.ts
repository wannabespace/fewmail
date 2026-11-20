import type { Messages } from '@fewmail/shared/i18n'
import { toast } from 'sonner'

import { confirm } from '~/components/confirm-dialog'

import { client, refetchChanged } from './orpc'

/** After an unsubscribe a sender that ignores them would keep writing; only the user's yes turns that into a trash bot. */
export const offerBlock = (t: Messages, name: string, messageId: string) =>
  confirm({
    action: t.mail.block,
    description: t.mail.ignoresUnsubscribeHint,
    onConfirm: async () => {
      const id = toast.loading(t.today.working)
      const blocked = await client.mail.block({ messageId }).catch(() => null)
      if (!blocked) {
        toast.dismiss(id)
        return
      }
      toast.success(t.mail.blocked, { id })
      refetchChanged(['mail', 'bots'])
    },
    title: t.mail.ignoresUnsubscribe(name),
    variant: 'destructive',
  })
