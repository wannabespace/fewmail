import { forwardAddress } from '@fewmail/shared/agent'
import { CopyIconButton } from '@fewmail/ui/components/custom/copy-button'
import {
  SettingsGroup,
  SettingsRow,
} from '@fewmail/ui/components/custom/settings-group'
import { Switch } from '@fewmail/ui/components/switch'
import { Textarea } from '@fewmail/ui/components/textarea'
import { useState } from 'react'

import { BriefHourSelect, LanguageSelect } from '~/components/agent-fields'
import { localeStore, useT } from '~/lib/i18n'
import { useHasAgent, useMe, useSaveSettings } from '~/lib/me'

/** Browsers still report Kyiv by its old IANA alias. */
const timezoneLabel = (timezone: string) =>
  timezone.replace('Europe/Kiev', 'Europe/Kyiv').replaceAll('_', ' ')

export const AgentSettings = () => {
  const t = useT()
  const { settings, user } = useMe()
  const hasAgent = useHasAgent()
  const update = useSaveSettings()
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
            title={t.settings.voiceBrief.title}
            description={t.settings.voiceBrief.description}
            htmlFor="voice-brief"
          >
            <Switch
              id="voice-brief"
              checked={settings.voiceBrief}
              onCheckedChange={(voiceBrief) => update({ voiceBrief })}
            />
          </SettingsRow>
          <SettingsRow
            title={t.settings.forward.title}
            hint={t.settings.forward.description}
          >
            <div className="flex items-center gap-1">
              <span
                className="text-muted-foreground font-mono text-sm"
                data-mask
              >
                {forwardAddress(user.email)}
              </span>
              <CopyIconButton
                label={t.settings.forward.copy}
                text={forwardAddress(user.email)}
              />
            </div>
          </SettingsRow>
          <SettingsRow
            title={t.settings.briefTitle}
            description={t.settings.briefDescription(
              timezoneLabel(settings.timezone)
            )}
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
