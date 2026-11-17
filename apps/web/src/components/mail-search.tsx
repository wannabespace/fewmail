import { Button } from '@fewmail/ui/components/button'
import { SearchInput } from '@fewmail/ui/components/custom/search-input'
import {
  SettingsGroup,
  SettingsRow,
} from '@fewmail/ui/components/custom/settings-group'
import { Kbd } from '@fewmail/ui/components/kbd'
import { Popover, PopoverContent } from '@fewmail/ui/components/popover'
import { Spinner } from '@fewmail/ui/components/spinner'
import {
  AiSearchIcon,
  Attachment01Icon,
  Calendar03Icon,
  Clock01Icon,
  Mail01Icon,
  Pdf01Icon,
  TextIcon,
  UserIcon,
} from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import type { IconSvgElement } from '@hugeicons/react'
import { useState } from 'react'
import type { ReactNode, RefObject } from 'react'
import { createStore } from 'seitu'
import { useSubscription } from 'seitu/react'
import { createWebStorageValue } from 'seitu/web'
import { z } from 'zod/mini'

import { useT } from '~/lib/i18n'
import { useHasAgent } from '~/lib/me'
import { posthog } from '~/lib/posthog'

const RECENT_LIMIT = 6

const recentSearchesStore = createWebStorageValue({
  defaultValue: [] as string[],
  key: 'fewmail.recent-searches',
  schema: z.array(z.string()),
  type: 'localStorage',
})

/** Mail's field while a list is open: ⌘F finds there, and anywhere else opens Mail to find. */
export const mailSearchFieldStore = createStore<HTMLInputElement | null>(null)

export const rememberSearch = (query: string) => {
  const trimmed = query.trim()
  if (trimmed) {
    posthog.capture('mail_searched')
    recentSearchesStore.set(
      [
        trimmed,
        ...recentSearchesStore.get().filter((recent) => recent !== trimmed),
      ].slice(0, RECENT_LIMIT)
    )
  }
}

type TipId = 'from' | 'subject' | 'attachment' | 'pdf' | 'unread' | 'week'

/** Only operators on received mail: the list never shows sent mail, so `in:sent` or `to:` would always come back empty. */
const TIPS: {
  example?: string
  icon: IconSvgElement
  id: TipId
  query: string
}[] = [
  { example: 'anna', icon: UserIcon, id: 'from', query: 'from:' },
  { example: 'invoice', icon: TextIcon, id: 'subject', query: 'subject:' },
  { icon: Attachment01Icon, id: 'attachment', query: 'has:attachment' },
  { icon: Pdf01Icon, id: 'pdf', query: 'filename:pdf' },
  { icon: Mail01Icon, id: 'unread', query: 'is:unread' },
  { icon: Calendar03Icon, id: 'week', query: 'newer_than:7d' },
]

/** A row of the search's start, laid out like every list of emails: the whole row picks it. */
const Suggestion = ({
  children,
  hint,
  icon,
  label,
  onPick,
}: {
  children: ReactNode
  hint?: string
  icon: IconSvgElement
  label: string
  onPick: () => void
}) => (
  <SettingsRow
    dense
    trigger={<button type="button" aria-label={label} onClick={onPick} />}
    icon={
      <HugeiconsIcon
        icon={icon}
        strokeWidth={2}
        className="text-muted-foreground size-4"
      />
    }
    title={children}
  >
    {hint && <span className="text-muted-foreground text-xs">{hint}</span>}
  </SettingsRow>
)

const MailSearchStart = ({
  onAdd,
  onSearch,
}: {
  onAdd: (text: string) => void
  onSearch: (query: string) => void
}) => {
  const t = useT()
  const hasAgent = useHasAgent()
  const recent = useSubscription(recentSearchesStore)
  return (
    <div className="flex min-h-0 flex-col gap-6 overflow-y-auto">
      {recent.length > 0 && (
        <SettingsGroup
          title={
            <span className="flex items-center">
              {t.mail.find.recent}
              <Button
                size="xs"
                variant="link-muted"
                className="ml-auto"
                onClick={() => recentSearchesStore.set([])}
              >
                {t.mail.find.clearRecent}
              </Button>
            </span>
          }
        >
          {recent.map((query) => (
            <Suggestion
              key={query}
              icon={Clock01Icon}
              label={query}
              onPick={() => onSearch(query)}
            >
              <span data-mask>{query}</span>
            </Suggestion>
          ))}
        </SettingsGroup>
      )}
      <SettingsGroup title={t.mail.find.tips}>
        {TIPS.map(({ example, icon, id, query }) => (
          <Suggestion
            key={id}
            icon={icon}
            hint={t.mail.find.tip[id]}
            label={`${query}${example ?? ''}`}
            onPick={() => onAdd(query)}
          >
            <span>
              {query}
              {example && (
                <span className="text-muted-foreground font-normal">
                  {example}
                </span>
              )}
            </span>
          </Suggestion>
        ))}
        {hasAgent && (
          <Suggestion
            icon={AiSearchIcon}
            hint={t.mail.find.tip.describe}
            label={t.mail.find.describeExample}
            onPick={() => onSearch(t.mail.find.describeExample)}
          >
            {t.mail.find.describeExample}
          </Suggestion>
        )}
      </SettingsGroup>
    </div>
  )
}

/** Mail's search, always in its header: the list answers as it is typed; recent searches and tips open under the field while it is focused and empty. */
export const MailSearchField = ({
  autoFocus,
  defaultValue,
  fieldRef,
  isEmpty,
  isPending,
  onAdd,
  onInput,
  onSearch,
}: {
  autoFocus: boolean
  defaultValue: string
  fieldRef: RefObject<HTMLInputElement | null>
  isEmpty: boolean
  isPending: boolean
  onAdd: (text: string) => void
  onInput: (value: string) => void
  onSearch: (query: string) => void
}) => {
  const t = useT()
  const [group, setGroup] = useState<HTMLDivElement | null>(null)
  const [isFocused, setIsFocused] = useState(autoFocus)
  return (
    <>
      <SearchInput
        ref={(field) => {
          fieldRef.current = field
          mailSearchFieldStore.set(field)
          return () => mailSearchFieldStore.set(null)
        }}
        groupRef={setGroup}
        className="max-w-64 @max-xl:max-w-none"
        clearLabel={t.nav.clearSearch}
        autoFocus={autoFocus}
        defaultValue={defaultValue}
        onBlur={() => setIsFocused(false)}
        onFocus={() => setIsFocused(true)}
        onValueChange={onInput}
        placeholder={t.mail.search}
        aria-label={t.mail.search}
        end={
          isPending ? (
            <Spinner
              className="text-muted-foreground"
              label={t.mail.find.searching}
            />
          ) : (
            <Kbd>⌘F</Kbd>
          )
        }
      />
      <Popover open={isFocused && isEmpty}>
        {/* The field keeps focus while a row is pressed: blurring it would close the popover under the click. */}
        <PopoverContent
          anchor={group}
          align="end"
          className="w-96"
          finalFocus={false}
          initialFocus={false}
          onMouseDown={(event) => event.preventDefault()}
        >
          <MailSearchStart onAdd={onAdd} onSearch={onSearch} />
        </PopoverContent>
      </Popover>
    </>
  )
}
