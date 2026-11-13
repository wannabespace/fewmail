import {
  SettingsGroup,
  SettingsRow,
} from '@fewmail/ui/components/custom/settings-group'
import { Switch } from '@fewmail/ui/components/switch'
import { Textarea } from '@fewmail/ui/components/textarea'
import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'

import { LanguageSelect, MorningHourSelect } from '~/components/agent-fields'
import { localeStore, useT } from '~/lib/i18n'
import { useHasAgent, useMe, useSaveSettings } from '~/lib/me'
import { orpc } from '~/lib/orpc'

/** Browsers still report Kyiv by its old IANA alias. */
const timezoneLabel = (timezone: string) =>
  timezone.replace('Europe/Kiev', 'Europe/Kyiv').replaceAll('_', ' ')

export const AgentSettings = () => {
  const t = useT()
  const { settings } = useMe()
  const hasAgent = useHasAgent()
  const update = useSaveSettings()
  const [knowledge, setKnowledge] = useState(settings.knowledge ?? '')
  const { data: telegram } = useQuery(
    orpc.integrations.telegram.get.queryOptions({ enabled: hasAgent })
  )
  const { data: whatsapp } = useQuery(
    orpc.integrations.whatsapp.get.queryOptions({ enabled: hasAgent })
  )
  const hasMessenger = !!telegram?.linked || !!whatsapp?.linked

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
          {hasMessenger && (
            <>
              <SettingsRow
                title={t.settings.readingDigest.title}
                description={t.settings.readingDigest.description}
                htmlFor="reading-digest"
              >
                <Switch
                  id="reading-digest"
                  checked={settings.readingDigest}
                  onCheckedChange={(readingDigest) => update({ readingDigest })}
                />
              </SettingsRow>
              <SettingsRow
                title={t.settings.morningTitle}
                description={t.settings.morningDescription(
                  timezoneLabel(settings.timezone)
                )}
              >
                <MorningHourSelect
                  value={settings.briefHour}
                  onChange={(briefHour) => update({ briefHour })}
                />
              </SettingsRow>
            </>
          )}
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
