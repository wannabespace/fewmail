import { Button } from '@fewmail/ui/components/button'
import { CopyIconButton } from '@fewmail/ui/components/custom/copy-button'
import {
  SettingsGroup,
  SettingsRow,
} from '@fewmail/ui/components/custom/settings-group'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { useDates, useT } from '~/lib/i18n'
import { orpc } from '~/lib/orpc'

const MCP_URL = `${import.meta.env.API_URL}/mcp`

export const McpSettings = () => {
  const t = useT()
  const dates = useDates()
  const queryClient = useQueryClient()
  const { data: apps = [] } = useQuery(
    orpc.integrations.apps.list.queryOptions()
  )
  const disconnect = useMutation(
    orpc.integrations.apps.disconnect.mutationOptions({
      onSuccess: () =>
        queryClient.invalidateQueries({
          queryKey: orpc.integrations.apps.key(),
        }),
    })
  )

  return (
    <SettingsGroup title="MCP">
      <SettingsRow
        title={t.settings.mcp.title}
        description={t.settings.mcp.paste}
      >
        <div className="flex items-center gap-1">
          <span className="text-muted-foreground font-mono text-sm">
            {MCP_URL}
          </span>
          <CopyIconButton label={t.settings.mcp.copy} text={MCP_URL} />
        </div>
      </SettingsRow>
      {apps.map((app) => (
        <SettingsRow
          key={app.clientId}
          title={app.name ?? t.settings.mcp.defaultName}
          description={t.settings.mcp.connected(dates.ago(app.connectedAt))}
        >
          <Button
            size="sm"
            variant="ghost-destructive"
            onClick={() => disconnect.mutate({ clientId: app.clientId })}
          >
            {t.settings.mcp.disconnect}
          </Button>
        </SettingsRow>
      ))}
    </SettingsGroup>
  )
}
