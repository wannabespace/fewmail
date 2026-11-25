import type { Messages } from '@fewmail/shared/i18n'
import { Button } from '@fewmail/ui/components/button'
import {
  SettingsGroup,
  SettingsRow,
  SettingsRows,
} from '@fewmail/ui/components/custom/settings-group'
import { Spinner } from '@fewmail/ui/components/spinner'
import { Switch } from '@fewmail/ui/components/switch'
import { useMutation } from '@tanstack/react-query'

import { confirm } from '~/components/confirm-dialog'
import { useDates, useT } from '~/lib/i18n'
import { mailboxes as mailboxRows, useAllMailboxes } from '~/lib/lists-db'
import { forgetOlderRows } from '~/lib/mail-db'
import { orpc } from '~/lib/orpc'
import type { Settle } from '~/lib/query-client'
import { queryClient, showUntilSettled } from '~/lib/query-client'
import { pendingToast, settleToast } from '~/lib/undo'

const mailboxStatus = (
  copy: Messages['settings']['mailboxes'],
  mailbox: {
    enabled: boolean
    hasLostAccess: boolean
    lastSyncedAt: Date | null
    signIn: boolean
    syncError: string | null
  },
  ago: (date: Date) => string
) => {
  if (!mailbox.enabled) {
    return copy.off
  }
  if (mailbox.hasLostAccess) {
    return mailbox.signIn ? copy.signInLost : copy.lost
  }
  if (mailbox.syncError) {
    return copy.retrying
  }
  if (!mailbox.lastSyncedAt) {
    return copy.reading
  }
  return mailbox.signIn ? copy.signIn : copy.synced(ago(mailbox.lastSyncedAt))
}

const REMOVE_TOAST = 'mailbox-remove'

/** A mailbox that comes or goes changes every list, calendar and count. */
const refetchAll = async (settle?: Settle) => {
  forgetOlderRows()
  await queryClient.invalidateQueries()
  settle?.(undefined)
}

export const MailboxSettings = () => {
  const copy = useT().settings.mailboxes
  const dates = useDates()
  const mailboxes = useAllMailboxes()
  const add = useMutation(
    orpc.mailboxes.add.mutationOptions({
      onSuccess: ({ url }) => location.assign(url),
    })
  )
  const remove = useMutation(
    orpc.mailboxes.remove.mutationOptions({
      onMutate: ({ id }) => {
        pendingToast(REMOVE_TOAST).onMutate()
        return showUntilSettled(() => {
          if (mailboxRows.has(id)) {
            mailboxRows.delete(id)
          }
        })
      },
      onSettled: (_, __, ___, settle) =>
        refetchAll(settle).finally(settleToast(REMOVE_TOAST)),
    })
  )
  const setEnabled = useMutation(
    orpc.mailboxes.setEnabled.mutationOptions({
      onMutate: ({ enabled, id }) =>
        showUntilSettled(() => {
          mailboxRows.update(id, (mailbox) => {
            mailbox.enabled = enabled
          })
        }),
      onSettled: (_, __, ___, settle) => refetchAll(settle),
    })
  )

  return (
    <SettingsGroup title={copy.title}>
      <SettingsRows>
        {mailboxes.map((mailbox) => (
          <SettingsRow
            key={mailbox.id}
            title={<span data-mask>{mailbox.email}</span>}
            description={mailboxStatus(copy, mailbox, dates.fromNow)}
          >
            {!mailbox.signIn && (
              <>
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
                <Switch
                  aria-label={mailbox.email}
                  checked={mailbox.enabled}
                  onCheckedChange={(enabled) =>
                    setEnabled.mutate({ enabled, id: mailbox.id })
                  }
                />
              </>
            )}
          </SettingsRow>
        ))}
      </SettingsRows>
      <SettingsRow title={copy.add} description={copy.addDescription}>
        <Button
          size="sm"
          variant="outline"
          disabled={add.isPending}
          onClick={() => add.mutate()}
        >
          {add.isPending && <Spinner />}
          {copy.add}
        </Button>
      </SettingsRow>
    </SettingsGroup>
  )
}
