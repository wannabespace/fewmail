import { Button } from '@fewmail/ui/components/button'
import {
  SettingsGroup,
  SettingsRow,
} from '@fewmail/ui/components/custom/settings-group'
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
import { type } from 'arktype'
import type { ReactNode } from 'react'
import { useSubscription } from 'seitu/react'
import { createWebStorageValue } from 'seitu/web'

import { useT } from '~/lib/i18n'
import { useHasAgent } from '~/lib/me'
import { posthog } from '~/lib/posthog'

const RECENT_LIMIT = 6

const recentSearchesStore = createWebStorageValue({
  defaultValue: [] as string[],
  key: 'fewmail.recent-searches',
  schema: type('string[]'),
  type: 'localStorage',
})

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

export const MailSearchStart = ({
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
    <div className="flex-1 overflow-y-auto">
      {/* Mail's column: the cards' edges line up with the list's, whose rows sit at the same width. */}
      <div className="mx-auto flex w-full max-w-[calc(var(--container-3xl)+3rem)] flex-col gap-6 px-9.5 pt-2 pb-6">
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
    </div>
  )
}
