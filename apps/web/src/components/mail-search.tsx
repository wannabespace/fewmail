import { Button } from '@fewmail/ui/components/button'
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

const SECTION_HEADER =
  'bg-body text-muted-foreground sticky top-0 z-10 flex items-center gap-2 border-b px-5 py-1.5 pl-11 text-xs font-medium'

const Suggestion = ({
  children,
  hint,
  icon,
  onPick,
}: {
  children: ReactNode
  hint?: string
  icon: IconSvgElement
  onPick: () => void
}) => (
  <li className="border-b">
    <button
      type="button"
      onClick={onPick}
      className="hover:bg-accent focus-visible:bg-accent flex w-full cursor-pointer items-center gap-2 px-5 py-2 text-left text-sm outline-none"
    >
      <HugeiconsIcon
        icon={icon}
        strokeWidth={2}
        className="text-muted-foreground size-4 shrink-0"
      />
      <span className="min-w-0 shrink-0 truncate font-medium">{children}</span>
      {hint && (
        <span className="text-muted-foreground ml-auto truncate pl-4 text-xs">
          {hint}
        </span>
      )}
    </button>
  </li>
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
    <ul className="flex-1 overflow-y-auto">
      {recent.length > 0 && (
        <>
          <li className={SECTION_HEADER}>
            {t.mail.find.recent}
            <Button
              size="xs"
              variant="link-muted"
              className="ml-auto"
              onClick={() => recentSearchesStore.set([])}
            >
              {t.mail.find.clearRecent}
            </Button>
          </li>
          {recent.map((query) => (
            <Suggestion
              key={query}
              icon={Clock01Icon}
              onPick={() => onSearch(query)}
            >
              <span data-mask>{query}</span>
            </Suggestion>
          ))}
        </>
      )}
      <li className={SECTION_HEADER}>{t.mail.find.tips}</li>
      {TIPS.map(({ example, icon, id, query }) => (
        <Suggestion
          key={id}
          icon={icon}
          hint={t.mail.find.tip[id]}
          onPick={() => onAdd(query)}
        >
          {query}
          {example && (
            <span className="text-muted-foreground font-normal">{example}</span>
          )}
        </Suggestion>
      ))}
      {hasAgent && (
        <Suggestion
          icon={AiSearchIcon}
          hint={t.mail.find.tip.describe}
          onPick={() => onSearch(t.mail.find.describeExample)}
        >
          {t.mail.find.describeExample}
        </Suggestion>
      )}
    </ul>
  )
}
