import type { Messages } from '@fewmail/shared/i18n'
import { Button } from '@fewmail/ui/components/button'
import { SettingsRow } from '@fewmail/ui/components/custom/settings-group'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { useT } from '~/lib/i18n'
import { orpc } from '~/lib/orpc'

const MESSENGERS = { telegram: 'Telegram', whatsapp: 'WhatsApp' } as const

const messengerDescription = (
  copy: Messages['settings']['telegram'],
  link: { botUrl: string | null; linked: boolean } | undefined
) => {
  if (link?.linked) {
    return copy.linked
  }
  return link?.botUrl ? copy.unlinked : copy.notConfigured
}

export const MessengerSettings = ({
  channel,
}: {
  channel: keyof typeof MESSENGERS
}) => {
  const t = useT()
  const copy = t.settings[channel]
  const queryClient = useQueryClient()
  const procedures = orpc.integrations[channel]
  const { data: link } = useQuery(procedures.get.queryOptions())
  const unlink = useMutation(
    procedures.unlink.mutationOptions({
      onMutate: () =>
        queryClient.setQueryData(
          procedures.get.queryKey(),
          (old) => old && { ...old, linked: false }
        ),
      onSettled: () =>
        queryClient.invalidateQueries({ queryKey: procedures.key() }),
    })
  )

  return (
    <SettingsRow
      title={MESSENGERS[channel]}
      description={messengerDescription(copy, link)}
    >
      {link?.linked ? (
        <Button
          size="sm"
          variant="ghost-destructive"
          onClick={() => unlink.mutate()}
        >
          {copy.disconnect}
        </Button>
      ) : (
        link?.botUrl && (
          <Button
            size="sm"
            variant="outline"
            render={
              <a
                href={link.botUrl}
                target="_blank"
                rel="noreferrer"
                aria-label={copy.connect}
              />
            }
          >
            {copy.connect}
          </Button>
        )
      )}
    </SettingsRow>
  )
}
