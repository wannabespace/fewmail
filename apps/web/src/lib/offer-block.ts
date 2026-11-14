import type { Messages } from '@fewmail/shared/i18n'
import { toast } from 'sonner'

import { confirm } from '~/components/confirm-dialog'

import { client, refetchChanged } from './orpc'

/** After an unsubscribe a sender that ignores them would keep writing; only the user's yes turns that into a trash rule. */
export const offerBlock = (t: Messages, name: string, messageId: string) =>
  confirm({
    action: t.mail.block,
    description: t.mail.ignoresUnsubscribeHint,
    onConfirm: async () => {
      await client.mail.block({ messageId })
      toast.success(t.mail.blocked)
      refetchChanged(['mail', 'rules'])
    },
    title: t.mail.ignoresUnsubscribe(name),
    variant: 'destructive',
  })
