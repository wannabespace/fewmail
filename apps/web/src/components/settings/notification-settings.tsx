import {
  SettingsGroup,
  SettingsRow,
} from '@fewmail/ui/components/custom/settings-group'
import { Switch } from '@fewmail/ui/components/switch'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { MESSENGERS } from '~/components/settings/messenger-settings'
import { useT } from '~/lib/i18n'
import { useHasAgent } from '~/lib/me'
import { orpc } from '~/lib/orpc'
import {
  disablePush,
  enablePush,
  pushStateQuery,
  pushSupported,
} from '~/lib/push'

const MessengerPush = ({ channel }: { channel: keyof typeof MESSENGERS }) => {
  const copy = useT().settings.notifications
  const queryClient = useQueryClient()
  const procedures = orpc.integrations[channel]
  const { data: link } = useQuery(procedures.get.queryOptions())
  const toggle = useMutation(
    procedures.setUrgentPush.mutationOptions({
      onMutate: ({ on }) =>
        queryClient.setQueryData(
          procedures.get.queryKey(),
          (old) => old && { ...old, urgentPush: on }
        ),
      onSettled: () =>
        queryClient.invalidateQueries({ queryKey: procedures.key() }),
    })
  )
  if (!link?.linked) {
    return null
  }
  return (
    <SettingsRow
      title={MESSENGERS[channel]}
      description={link.urgentPush ? copy.messengerOn : copy.messengerOff}
      htmlFor={`${channel}-urgent`}
    >
      <Switch
        id={`${channel}-urgent`}
        checked={link.urgentPush}
        onCheckedChange={(on) => toggle.mutate({ on })}
      />
    </SettingsRow>
  )
}

export const NotificationSettings = () => {
  const copy = useT().settings.notifications
  const hasAgent = useHasAgent()
  const queryClient = useQueryClient()
  const { data: publicKey } = useQuery(orpc.devices.webPushKey.queryOptions())
  const { data: state } = useQuery(pushStateQuery)
  const toggle = useMutation({
    meta: { event: 'push_toggled' },
    mutationFn: (on: boolean) =>
      on && publicKey ? enablePush(publicKey) : disablePush(),
    onSettled: () =>
      queryClient.invalidateQueries({ queryKey: pushStateQuery.queryKey }),
  })
  const available =
    pushSupported && !!publicKey && state?.permission !== 'denied'

  const description = () => {
    if (!pushSupported) {
      return copy.unsupported
    }
    if (publicKey === null) {
      return copy.notConfigured
    }
    if (state?.permission === 'denied') {
      return copy.blocked
    }
    return state?.subscribed ? copy.on : copy.off
  }

  return (
    <SettingsGroup title={copy.title}>
      <SettingsRow
        title={copy.browser}
        description={description()}
        htmlFor="browser-notifications"
      >
        {available && (
          <Switch
            id="browser-notifications"
            checked={!!state?.subscribed}
            disabled={toggle.isPending}
            onCheckedChange={(on) => toggle.mutate(on)}
          />
        )}
      </SettingsRow>
      {hasAgent && (
        <>
          <MessengerPush channel="telegram" />
          <MessengerPush channel="whatsapp" />
        </>
      )}
    </SettingsGroup>
  )
}
