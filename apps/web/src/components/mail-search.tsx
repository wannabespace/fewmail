import { Button } from '@fewmail/ui/components/button'
import {
  Item,
  ItemContent,
  ItemDescription,
  ItemMedia,
  ItemTitle,
} from '@fewmail/ui/components/item'
import {
  AiSearchIcon,
  Attachment01Icon,
  Calendar03Icon,
  Mail01Icon,
  Pdf01Icon,
  Search01Icon,
  TextIcon,
  UserIcon,
} from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import type { IconSvgElement } from '@hugeicons/react'
import { type } from 'arktype'
import { useSubscription } from 'seitu/react'
import { createWebStorageValue } from 'seitu/web'

import { useT } from '~/lib/i18n'

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

export const MailSearchStart = ({
  onAdd,
  onSearch,
}: {
  onAdd: (text: string) => void
  onSearch: (query: string) => void
}) => {
  const t = useT()
  const recent = useSubscription(recentSearchesStore)
  return (
    <div className="flex flex-1 flex-col gap-6 overflow-y-auto px-5 py-5">
      {recent.length > 0 && (
        <section className="flex flex-col gap-2.5">
          <h2 className="text-muted-foreground text-xs font-medium">
            {t.mail.find.recent}
          </h2>
          <div className="flex flex-wrap gap-2">
            {recent.map((query) => (
              <Button
                key={query}
                variant="outline"
                size="sm"
                onClick={() => onSearch(query)}
              >
                <HugeiconsIcon icon={Search01Icon} strokeWidth={2} />
                <span data-mask className="max-w-60 truncate">
                  {query}
                </span>
              </Button>
            ))}
          </div>
        </section>
      )}
      <section className="flex flex-col gap-2.5">
        <h2 className="text-muted-foreground text-xs font-medium">
          {t.mail.find.tips}
        </h2>
        <div className="-mx-2.5 grid grid-cols-[repeat(auto-fill,minmax(13rem,1fr))]">
          {TIPS.map(({ example, icon, id, query }) => (
            <Item
              key={id}
              size="xs"
              render={<button type="button" aria-label={t.mail.find.tip[id]} />}
              onClick={() => onAdd(query)}
            >
              <ItemMedia variant="icon">
                <HugeiconsIcon icon={icon} strokeWidth={2} />
              </ItemMedia>
              <ItemContent>
                <ItemTitle>
                  {query}
                  {example && (
                    <span className="text-muted-foreground font-normal">
                      {example}
                    </span>
                  )}
                </ItemTitle>
                <ItemDescription>{t.mail.find.tip[id]}</ItemDescription>
              </ItemContent>
            </Item>
          ))}
          <Item
            size="xs"
            render={
              <button type="button" aria-label={t.mail.find.describeExample} />
            }
            onClick={() => onSearch(t.mail.find.describeExample)}
          >
            <ItemMedia variant="icon">
              <HugeiconsIcon icon={AiSearchIcon} strokeWidth={2} />
            </ItemMedia>
            <ItemContent>
              <ItemTitle>{t.mail.find.describeExample}</ItemTitle>
              <ItemDescription>{t.mail.find.tip.describe}</ItemDescription>
            </ItemContent>
          </Item>
        </div>
        <p className="text-muted-foreground text-xs">{t.mail.find.combine}</p>
      </section>
    </div>
  )
}
