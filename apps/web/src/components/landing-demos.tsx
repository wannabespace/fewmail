import { Badge } from '@fewmail/ui/components/badge'
import { Button } from '@fewmail/ui/components/button'
import { Kbd } from '@fewmail/ui/components/kbd'
import { cn } from '@fewmail/ui/lib/utils'
import {
  AlertDiamondIcon,
  Mic01Icon,
  Shield01Icon,
  Tick02Icon,
} from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import type { ReactNode } from 'react'

import { useT } from '~/lib/i18n'

import { TelegramMark } from './login-story'
import { ImportanceDot } from './mail-meta'

const QUEUE = [
  { importance: 3, sender: 'Anna Kovalenko' },
  { importance: 2, sender: 'Northwind Studio' },
  { importance: 2, sender: 'Marco Bellini' },
]

const Tile = ({
  children,
  className,
  isRaised,
}: {
  children: ReactNode
  className?: string
  isRaised?: boolean
}) => (
  <div
    className={cn(
      'bg-popover rounded-2xl p-4 text-left ring',
      isRaised ? 'ring-foreground/10 shadow-sm' : 'ring-foreground/6',
      className
    )}
  >
    {children}
  </div>
)

export const TodayDemo = () => {
  const t = useT()
  const demo = t.site.demos.today
  return (
    <div className="mx-auto grid max-w-4xl gap-6 md:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)] md:items-center">
      <div className="flex flex-col gap-3 text-left">
        <p className="text-muted-foreground text-xs font-medium">{demo.day}</p>
        <p className="text-display font-serif tracking-tight">
          {t.today.headline(QUEUE.length)}
        </p>
        <p className="text-brief text-foreground/75 font-serif">{demo.brief}</p>
      </div>
      <div className="flex flex-col gap-3">
        {QUEUE.map((item, index) => (
          <Tile
            key={item.sender}
            isRaised={index === 0}
            className="flex flex-col gap-3"
          >
            <div className="flex items-center gap-2.5">
              <ImportanceDot importance={item.importance} />
              <span className="text-sm font-medium">{item.sender}</span>
              <span className="text-muted-foreground ml-auto text-xs">
                {demo.queue[index]?.reason}
              </span>
            </div>
            <p className="text-foreground/80 text-sm">
              {demo.queue[index]?.summary}
            </p>
            {index === 0 && (
              <div className="flex gap-2">
                <Button size="sm">
                  {t.queue.send}
                  <Kbd>⏎</Kbd>
                </Button>
                <Button size="sm" variant="secondary">
                  {t.queue.skip}
                  <Kbd>S</Kbd>
                </Button>
              </div>
            )}
          </Tile>
        ))}
      </div>
    </div>
  )
}

export const DraftDemo = () => {
  const t = useT()
  const demo = t.site.demos.draft
  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-3">
      <Tile className="flex flex-col gap-2">
        <div className="flex items-center gap-2.5">
          <ImportanceDot importance={2} />
          <span className="text-sm font-medium">Lena Fischer</span>
          <span className="text-muted-foreground ml-auto text-xs">
            {demo.expectsReply}
          </span>
        </div>
        <p className="text-foreground/80 text-sm">
          Hast du am Dienstag Zeit für einen kurzen Call zum Angebot?
        </p>
      </Tile>
      <Tile isRaised className="ml-8 flex flex-col gap-3">
        <div className="flex items-center gap-2">
          <Badge variant="secondary">{t.queue.draftedInVoice}</Badge>
          <span className="text-muted-foreground text-xs">{demo.language}</span>
        </div>
        <div className="bg-secondary/60 rounded-xl p-4 font-serif text-base/relaxed">
          Hallo Lena, Dienstag passt gut. Wie wäre es um 10 Uhr? Ich schicke dir
          vorher die überarbeitete Version des Angebots.
          <br />
          Viele Grüße, Max
        </div>
        <div className="flex gap-2">
          <Button size="sm">
            {t.queue.send}
            <Kbd>⏎</Kbd>
          </Button>
          <Button size="sm" variant="secondary">
            {t.queue.edit}
            <Kbd>E</Kbd>
          </Button>
          <Button size="sm" variant="secondary">
            {demo.redraft}
            <Kbd>R</Kbd>
          </Button>
        </div>
      </Tile>
    </div>
  )
}

const Bubble = ({
  children,
  isOwn,
}: {
  children: ReactNode
  isOwn?: boolean
}) => (
  <div
    className={cn(
      'max-w-[85%] rounded-2xl px-4 py-3 text-left text-sm/relaxed',
      isOwn
        ? 'bg-primary text-primary-foreground self-end rounded-br-md'
        : 'bg-popover ring-foreground/6 self-start rounded-bl-md ring'
    )}
  >
    {children}
  </div>
)

export const TelegramDemo = () => {
  const t = useT()
  const demo = t.site.demos.telegram
  return (
    <div className="mx-auto flex max-w-md flex-col gap-3">
      <div className="flex items-center gap-2 pb-1">
        <span className="bg-primary text-primary-foreground flex size-7 items-center justify-center rounded-full">
          <TelegramMark className="size-4" />
        </span>
        <span className="text-sm font-medium">Fewmail</span>
      </div>
      <Bubble>
        <span className="font-medium">{t.importance[3]} · Anna Kovalenko</span>
        <br />
        {demo.urgent}
        <span className="mt-3 grid grid-cols-2 gap-2">
          <Button size="sm">{t.telegram.send}</Button>
          <Button size="sm" variant="secondary">
            {t.telegram.skip}
          </Button>
        </span>
      </Bubble>
      <Bubble isOwn>
        <span className="flex items-center gap-2">
          <HugeiconsIcon icon={Mic01Icon} strokeWidth={2} className="size-4" />
          {demo.voice}
        </span>
      </Bubble>
      <Bubble>
        <span className="flex items-center gap-2">
          <HugeiconsIcon
            icon={Tick02Icon}
            strokeWidth={2}
            className="text-primary size-4"
          />
          {demo.draftReady}
        </span>
      </Bubble>
    </div>
  )
}

export const ShieldDemo = () => (
  <div className="mx-auto grid max-w-3xl gap-3 sm:grid-cols-3">
    {useT().site.demos.shield.map(({ detail, label }, index) => (
      <Tile key={label} className="flex flex-col gap-3">
        <span
          className={cn(
            'flex size-8 items-center justify-center rounded-lg',
            index < 2
              ? 'bg-destructive/15 text-destructive'
              : 'bg-secondary text-foreground'
          )}
        >
          <HugeiconsIcon
            icon={index < 2 ? AlertDiamondIcon : Shield01Icon}
            strokeWidth={2}
            className="size-4"
          />
        </span>
        <span className="text-sm font-medium">{label}</span>
        <span className="text-muted-foreground text-xs/relaxed">{detail}</span>
      </Tile>
    ))}
  </div>
)
