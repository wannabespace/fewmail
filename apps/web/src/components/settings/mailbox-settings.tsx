import type { Messages } from '@fewmail/shared/i18n'
import { Button } from '@fewmail/ui/components/button'
import {
  SettingsGroup,
  SettingsRow,
} from '@fewmail/ui/components/custom/settings-group'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { confirm } from '~/components/confirm-dialog'
import { useDates, useT } from '~/lib/i18n'
import { orpc } from '~/lib/orpc'

const mailboxStatus = (
  copy: Messages['settings']['mailboxes'],
  mailbox: {
    lastSyncedAt: Date | null
    signIn: boolean
    syncError: string | null
  },
  ago: (date: Date) => string
) => {
  if (mailbox.syncError) {
    return mailbox.signIn ? mailbox.syncError : copy.lost
  }
  if (!mailbox.lastSyncedAt) {
    return copy.reading
  }
  return mailbox.signIn ? copy.signIn : copy.synced(ago(mailbox.lastSyncedAt))
}

export const MailboxSettings = () => {
  const copy = useT().settings.mailboxes
  const dates = useDates()
  const queryClient = useQueryClient()
  const { data: mailboxes = [] } = useQuery(orpc.mailboxes.list.queryOptions())
  const add = useMutation(
    orpc.mailboxes.add.mutationOptions({
      onSuccess: ({ url }) => location.assign(url),
    })
  )
  const remove = useMutation(
    orpc.mailboxes.remove.mutationOptions({
      onMutate: ({ id }) =>
        queryClient.setQueryData(orpc.mailboxes.list.queryKey(), (old) =>
          old?.filter((mailbox) => mailbox.id !== id)
        ),
      onSettled: () =>
        queryClient.invalidateQueries({ queryKey: orpc.mailboxes.key() }),
    })
  )

  return (
    <SettingsGroup title={copy.title}>
      {mailboxes.map((mailbox) => (
        <SettingsRow
          key={mailbox.id}
          title={<span data-mask>{mailbox.email}</span>}
          description={mailboxStatus(copy, mailbox, dates.fromNow)}
        >
          {!mailbox.signIn && (
            <Button
              size="sm"
              variant="ghost-destructive"
              onClick={() =>
                confirm({
                  action: copy.remove,
                  description: copy.removeHint,
                  onConfirm: () => remove.mutate({ id: mailbox.id }),
                  title: copy.removeConfirm(mailbox.email),
                  variant: 'destructive',
                })
              }
            >
              {copy.remove}
            </Button>
          )}
        </SettingsRow>
      ))}
      <SettingsRow title={copy.add} description={copy.addDescription}>
        <Button
          size="sm"
          variant="outline"
          disabled={add.isPending}
          onClick={() => add.mutate()}
        >
          {copy.add}
        </Button>
      </SettingsRow>
    </SettingsGroup>
  )
}
