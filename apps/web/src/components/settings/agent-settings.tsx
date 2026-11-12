import {
  SettingsGroup,
  SettingsRow,
} from '@fewmail/ui/components/custom/settings-group'
import { Switch } from '@fewmail/ui/components/switch'
import { Textarea } from '@fewmail/ui/components/textarea'
import { useMutation } from '@tanstack/react-query'
import { useRouter } from '@tanstack/react-router'
import { useState } from 'react'

import { BriefHourSelect, LanguageSelect } from '~/components/agent-fields'
import { localeStore, useT } from '~/lib/i18n'
import { useHasAgent, useMe } from '~/lib/me'
import { orpc } from '~/lib/orpc'

export const AgentSettings = () => {
  const t = useT()
  const { settings } = useMe()
  const hasAgent = useHasAgent()
  const router = useRouter()
  const save = useMutation(
    orpc.settings.save.mutationOptions({ onSuccess: () => router.invalidate() })
  )
  const update = (change: Partial<typeof settings>) =>
    save.mutate({
      briefHour: settings.briefHour,
      gmailLabels: settings.gmailLabels,
      knowledge: settings.knowledge,
      language: settings.language,
      timezone: settings.timezone,
      ...change,
    })
  const [knowledge, setKnowledge] = useState(settings.knowledge ?? '')

  return (
    <SettingsGroup title={t.settings.agent}>
      <SettingsRow
        title={t.settings.language}
        description={t.settings.languageDescription}
      >
        <LanguageSelect
          value={settings.language}
          onChange={(language) => {
            localeStore.set(language)
            update({ language })
          }}
        />
      </SettingsRow>
      <SettingsRow
        title={t.settings.labels.title}
        description={t.settings.labels.description}
        htmlFor="gmail-labels"
      >
        <Switch
          id="gmail-labels"
          checked={settings.gmailLabels}
          onCheckedChange={(gmailLabels) => update({ gmailLabels })}
        />
      </SettingsRow>
      {hasAgent && (
        <>
          <SettingsRow
            title={t.settings.briefTitle}
            description={t.settings.briefDescription(settings.timezone)}
          >
            <BriefHourSelect
              value={settings.briefHour}
              onChange={(briefHour) => update({ briefHour })}
            />
          </SettingsRow>
          <div className="flex flex-col gap-2 p-3.5">
            <span className="text-sm font-medium">
              {t.settings.knowledge.title}
            </span>
            <span className="text-muted-foreground text-sm">
              {t.settings.knowledge.description}
            </span>
            <Textarea
              data-mask
              value={knowledge}
              rows={4}
              placeholder={t.settings.knowledge.placeholder}
              aria-label={t.settings.knowledge.title}
              onChange={(event) => setKnowledge(event.target.value)}
              onBlur={() =>
                knowledge !== (settings.knowledge ?? '') &&
                update({ knowledge: knowledge.trim() || null })
              }
            />
          </div>
        </>
      )}
    </SettingsGroup>
  )
}
