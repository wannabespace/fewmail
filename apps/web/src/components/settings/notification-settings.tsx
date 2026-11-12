import {
  SettingsGroup,
  SettingsRow,
} from '@fewmail/ui/components/custom/settings-group'
import { Switch } from '@fewmail/ui/components/switch'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { useT } from '~/lib/i18n'
import { orpc } from '~/lib/orpc'
import {
  disablePush,
  enablePush,
  pushStateQuery,
  pushSupported,
} from '~/lib/push'

export const NotificationSettings = () => {
  const copy = useT().settings.notifications
  const queryClient = useQueryClient()
  const { data: publicKey } = useQuery(orpc.devices.webPushKey.queryOptions())
  const { data: state } = useQuery(pushStateQuery)
  const toggle = useMutation({
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
    </SettingsGroup>
  )
}
