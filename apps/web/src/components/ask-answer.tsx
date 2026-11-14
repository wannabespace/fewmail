import type { RouterOutputs } from '@fewmail/api/router'
import { CommandGroup, CommandItem } from '@fewmail/ui/components/command'
import { Spinner } from '@fewmail/ui/components/spinner'
import { Home01Icon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'

import { useDates, useT } from '~/lib/i18n'
import { warmThread } from '~/lib/mail-db'

export const AskAnswer = ({
  onOpenHome,
  onOpenThread,
  question,
  result,
}: {
  onOpenHome: () => void
  onOpenThread: (threadId: string) => void
  question: string
  result: RouterOutputs['ask'] | undefined
}) => {
  const t = useT()
  const dates = useDates()

  return (
    <CommandGroup forceMount heading={question}>
      <div className="flex flex-col gap-3 px-2.5 py-2">
        {result ? (
          <p
            data-mask
            className="font-serif text-base/relaxed whitespace-pre-wrap"
          >
            {result.answer}
          </p>
        ) : (
          <p className="text-muted-foreground flex items-center gap-2 text-sm">
            <Spinner />
            {t.ask.thinking}
          </p>
        )}
      </div>
      {result?.sources.map((source) => (
        <CommandItem
          forceMount
          key={`${source.number}-${source.threadId}`}
          value={`source ${source.number} ${source.subject}`}
          onSelect={() => onOpenThread(source.threadId)}
          onPointerEnter={() => {
            void warmThread(source.threadId)
          }}
        >
          <span className="text-muted-foreground tabular-nums">
            [{source.number}]
          </span>
          <span data-mask className="truncate">
            {source.from} · {source.subject}
          </span>
          <span className="text-muted-foreground ml-auto shrink-0 text-xs">
            {dates.format(source.receivedAt, 'd MMM')}
          </span>
        </CommandItem>
      ))}
      {!!result?.waiting && (
        <CommandItem forceMount value="decide on home" onSelect={onOpenHome}>
          <HugeiconsIcon icon={Home01Icon} strokeWidth={2} />
          {t.agent.decideOnHome}
        </CommandItem>
      )}
    </CommandGroup>
  )
}
