import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useRouteContext } from '@tanstack/react-router'

import { orpc } from './orpc'

/** Kept in the query cache, not only in the route context, so a plan or settings change shows without reloading `/_app`. */
export const useMe = () => {
  const loaded = useRouteContext({ from: '/_app' }).me
  const { data } = useQuery(orpc.me.queryOptions())
  return data?.settings ? { ...data, settings: data.settings } : loaded
}

/** Free accounts never see an AI control: no brief, analysis, drafts, Telegram or MCP. */
export const useHasAgent = () => useMe().plan.kind !== 'free'

type Settings = ReturnType<typeof useMe>['settings']

/** Applies at once; the refetch afterwards settles it (and undoes it when the save failed). */
export const useSaveSettings = () => {
  const queryClient = useQueryClient()
  const { settings } = useMe()
  const save = useMutation(
    orpc.settings.save.mutationOptions({
      onSettled: () =>
        queryClient.invalidateQueries({ queryKey: orpc.me.key() }),
    })
  )
  return (change: Partial<Settings>) => {
    const latest = {
      ...(queryClient.getQueryData(orpc.me.queryKey())?.settings ?? settings),
      ...change,
    }
    queryClient.setQueryData(
      orpc.me.queryKey(),
      (me) => me && { ...me, settings: latest }
    )
    save.mutate({
      briefHour: latest.briefHour,
      gmailLabels: latest.gmailLabels,
      knowledge: latest.knowledge,
      language: latest.language,
      timezone: latest.timezone,
    })
  }
}

export const gmailThreadUrl = (email: string, threadId: string) =>
  `https://mail.google.com/mail/?authuser=${encodeURIComponent(email)}#all/${threadId}`
