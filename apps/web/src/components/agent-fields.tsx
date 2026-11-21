import type { Locale } from '@fewmail/shared/i18n/locales'
import { LOCALES } from '@fewmail/shared/i18n/locales'
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
  ComboboxTrigger,
  ComboboxValue,
} from '@fewmail/ui/components/combobox'
import { InputGroupAddon } from '@fewmail/ui/components/input-group'
import { Search01Icon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'

import { useT } from '~/lib/i18n'

interface Language {
  code: Locale
  english: string
  label: string
}

const LANGUAGES: readonly Language[] = LOCALES

const folded = (text: string) =>
  text.normalize('NFD').replaceAll(/\p{M}/gu, '').toLowerCase()

const matchesLanguage = ({ code, english, label }: Language, query: string) =>
  [code, english, label].some((name) => folded(name).includes(folded(query)))

export const LanguageSelect = ({
  onChange,
  value,
}: {
  onChange: (language: Locale) => void
  value: Locale
}) => {
  const t = useT()

  return (
    <Combobox
      items={LANGUAGES}
      autoHighlight
      itemToStringLabel={({ label }) => label}
      filter={matchesLanguage}
      value={LANGUAGES.find(({ code }) => code === value) ?? null}
      onValueChange={(next) => next && onChange(next.code)}
    >
      <ComboboxTrigger aria-label={t.settings.language} className="w-48">
        <ComboboxValue />
      </ComboboxTrigger>
      <ComboboxContent>
        <ComboboxInput
          showTrigger={false}
          placeholder={t.settings.languageSearch}
          aria-label={t.settings.languageSearch}
        >
          <InputGroupAddon>
            <HugeiconsIcon icon={Search01Icon} strokeWidth={2} />
          </InputGroupAddon>
        </ComboboxInput>
        <ComboboxEmpty>{t.mail.noResults}</ComboboxEmpty>
        <ComboboxList>
          {(language: Language) => (
            <ComboboxItem
              key={language.code}
              value={language}
              lang={language.code}
            >
              {language.label}
            </ComboboxItem>
          )}
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  )
}
