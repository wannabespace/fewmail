import { Button } from '@fewmail/ui/components/button'
import {
  SettingsGroup,
  SettingsRow,
} from '@fewmail/ui/components/custom/settings-group'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { useDates, useT } from '~/lib/i18n'
import { orpc } from '~/lib/orpc'
import { toastDeferred } from '~/lib/undo'

export const ScheduleSettings = () => {
  const t = useT()
  const dates = useDates()
  const queryClient = useQueryClient()
  const { data: schedules = [] } = useQuery(orpc.schedules.list.queryOptions())
  const refetch = () =>
    queryClient.invalidateQueries({ queryKey: orpc.schedules.key() })
  const remove = useMutation(
    orpc.schedules.delete.mutationOptions({ onSettled: refetch })
  )
  const deleteSchedule = (id: string) => {
    queryClient.setQueryData(orpc.schedules.list.queryKey(), (old) =>
      old?.filter((schedule) => schedule.id !== id)
    )
    toastDeferred(
      t.settings.schedules.deleted,
      () => remove.mutate({ id }),
      refetch
    )
  }

  return (
    <SettingsGroup title={t.settings.schedules.title}>
      <span className="text-muted-foreground p-3.5 text-sm">
        {t.settings.schedules.description}
      </span>
      {schedules.map((schedule) => (
        <SettingsRow
          key={schedule.id}
          title={<span data-mask>{schedule.instruction}</span>}
          description={
            <span data-mask>
              {schedule.when} ·{' '}
              {dates.format(schedule.nextRunAt, 'EEE d MMM, HH:mm')}
            </span>
          }
        >
          <Button
            size="sm"
            variant="ghost-destructive"
            onClick={() => deleteSchedule(schedule.id)}
          >
            {t.settings.schedules.delete}
          </Button>
        </SettingsRow>
      ))}
    </SettingsGroup>
  )
}
