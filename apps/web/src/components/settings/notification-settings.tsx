import { Button } from '@fewmail/ui/components/button'
import {
  SettingsGroup,
  SettingsRow,
} from '@fewmail/ui/components/custom/settings-group'
import { Switch } from '@fewmail/ui/components/switch'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { MESSENGERS } from '~/components/settings/messenger-settings'
import { isDesktop } from '~/lib/desktop'
import { useT } from '~/lib/i18n'
import { useHasAgent } from '~/lib/me'
import { orpc } from '~/lib/orpc'
import {
  disablePush,
  enablePush,
  pushStateQuery,
  pushSupported,
  testPush,
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
  const test = useMutation({
    meta: { event: 'push_tested' },
    mutationFn: () => testPush(publicKey ?? ''),
  })
  const toggle = useMutation({
    meta: { event: 'push_toggled' },
    mutationFn: async (on: boolean) => {
      await (on && publicKey ? enablePush(publicKey) : disablePush())
    },
    onMutate: () => test.reset(),
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
    if (!state?.subscribed) {
      return copy.off
    }
    if (test.isError || (test.data && test.data !== 'sent')) {
      return copy.testFailed
    }
    if (test.data) {
      return isDesktop ? copy.testSentDesktop : copy.testSent
    }
    return copy.on
  }

  return (
    <SettingsGroup title={copy.title}>
      <SettingsRow
        title={isDesktop ? copy.desktop : copy.browser}
        description={description()}
        htmlFor="browser-notifications"
      >
        {available && state?.subscribed && (
          <Button
            size="sm"
            variant="outline"
            disabled={test.isPending}
            onClick={() => test.mutate()}
          >
            {copy.test}
          </Button>
        )}
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
