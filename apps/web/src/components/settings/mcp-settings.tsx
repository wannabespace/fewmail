import { Button } from '@fewmail/ui/components/button'
import { CopyIconButton } from '@fewmail/ui/components/custom/copy-button'
import {
  SettingsGroup,
  SettingsRow,
  SettingsRows,
} from '@fewmail/ui/components/custom/settings-group'
import { useMutation } from '@tanstack/react-query'

import { confirm } from '~/components/confirm-dialog'
import { useDates, useT } from '~/lib/i18n'
import { connectedApps } from '~/lib/lists-db'
import { orpc } from '~/lib/orpc'
import { queryClient, showUntilSettled, useRanked } from '~/lib/query-client'
import { pendingToast, settleToast } from '~/lib/undo'

const MCP_URL = `${import.meta.env.API_URL}/mcp`

export const McpSettings = () => {
  const t = useT()
  const dates = useDates()
  const { data: apps = [] } = useRanked(connectedApps)
  const disconnect = useMutation(
    orpc.integrations.apps.disconnect.mutationOptions({
      onMutate: ({ clientId }) => {
        pendingToast(clientId).onMutate()
        return showUntilSettled(() => {
          if (connectedApps.has(clientId)) {
            connectedApps.delete(clientId)
          }
        })
      },
      onSettled: (_result, _error, { clientId }, settle) =>
        settle?.(
          queryClient
            .invalidateQueries({ queryKey: orpc.integrations.apps.key() })
            .finally(settleToast(clientId))
        ),
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
      <SettingsRows>
        {apps.map((app) => (
          <SettingsRow
            key={app.clientId}
            title={app.name ?? t.settings.mcp.defaultName}
            description={t.settings.mcp.connected(
              dates.fromNow(app.connectedAt)
            )}
          >
            <Button
              size="sm"
              variant="ghost-destructive"
              onClick={() =>
                confirm({
                  action: t.settings.mcp.disconnect,
                  description: t.settings.mcp.disconnectHint,
                  onConfirm: () =>
                    disconnect.mutate({ clientId: app.clientId }),
                  title: t.settings.disconnectConfirm(
                    app.name ?? t.settings.mcp.defaultName
                  ),
                  variant: 'destructive',
                })
              }
            >
              {t.settings.mcp.disconnect}
            </Button>
          </SettingsRow>
        ))}
      </SettingsRows>
    </SettingsGroup>
  )
}
