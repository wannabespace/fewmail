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

import { TelegramMark } from './login-story'
import { ImportanceDot } from './mail-meta'

const QUEUE = [
  {
    action: 'Send reply',
    importance: 3,
    reason: 'Contract due tomorrow',
    sender: 'Anna Kovalenko',
    summary: 'Needs the signed contract back before Friday’s kickoff.',
  },
  {
    action: 'Pay',
    importance: 2,
    reason: 'Invoice · $1,240 due Nov 20',
    sender: 'Northwind Studio',
    summary: 'October invoice for the website redesign.',
  },
  {
    action: 'Schedule',
    importance: 2,
    reason: 'Meeting proposed',
    sender: 'Marco Bellini',
    summary: 'Suggests Thursday at 15:00 for the quarterly review.',
  },
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

export const TodayDemo = () => (
  <div className="mx-auto grid max-w-4xl gap-6 md:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)] md:items-center">
    <div className="flex flex-col gap-3 text-left">
      <p className="text-muted-foreground text-xs font-medium">
        Thursday brief
      </p>
      <p className="text-display font-serif tracking-tight">
        Three things need you today.
      </p>
      <p className="text-brief text-foreground/75 font-serif">
        Anna is waiting on the contract, Northwind’s invoice is due next week
        and Marco wants a slot on Thursday. Forty-two newsletters and
        notifications were handled.
      </p>
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
              {item.reason}
            </span>
          </div>
          <p className="text-foreground/80 text-sm">{item.summary}</p>
          {index === 0 && (
            <div className="flex gap-2">
              <Button size="sm">
                {item.action}
                <Kbd>⏎</Kbd>
              </Button>
              <Button size="sm" variant="secondary">
                Skip
                <Kbd>S</Kbd>
              </Button>
            </div>
          )}
        </Tile>
      ))}
    </div>
  </div>
)

export const DraftDemo = () => (
  <div className="mx-auto flex max-w-2xl flex-col gap-3">
    <Tile className="flex flex-col gap-2">
      <div className="flex items-center gap-2.5">
        <ImportanceDot importance={2} />
        <span className="text-sm font-medium">Lena Fischer</span>
        <span className="text-muted-foreground ml-auto text-xs">
          Expects a reply
        </span>
      </div>
      <p className="text-foreground/80 text-sm">
        Hast du am Dienstag Zeit für einen kurzen Call zum Angebot?
      </p>
    </Tile>
    <Tile isRaised className="ml-8 flex flex-col gap-3">
      <div className="flex items-center gap-2">
        <Badge variant="secondary">Draft in your voice</Badge>
        <span className="text-muted-foreground text-xs">German, like Lena</span>
      </div>
      <div className="bg-secondary/60 rounded-xl p-4 font-serif text-base/relaxed">
        Hallo Lena, Dienstag passt gut. Wie wäre es um 10 Uhr? Ich schicke dir
        vorher die überarbeitete Version des Angebots.
        <br />
        Viele Grüße, Max
      </div>
      <div className="flex gap-2">
        <Button size="sm">
          Send
          <Kbd>⏎</Kbd>
        </Button>
        <Button size="sm" variant="secondary">
          Edit
          <Kbd>E</Kbd>
        </Button>
        <Button size="sm" variant="secondary">
          Redraft
          <Kbd>R</Kbd>
        </Button>
      </div>
    </Tile>
  </div>
)

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

export const TelegramDemo = () => (
  <div className="mx-auto flex max-w-md flex-col gap-3">
    <div className="flex items-center gap-2 pb-1">
      <span className="bg-primary text-primary-foreground flex size-7 items-center justify-center rounded-full">
        <TelegramMark className="size-4" />
      </span>
      <span className="text-sm font-medium">Fewmail</span>
    </div>
    <Bubble>
      <span className="font-medium">Urgent · Anna Kovalenko</span>
      <br />
      Needs the signed contract before Friday. I drafted a reply.
      <span className="mt-3 grid grid-cols-2 gap-2">
        <Button size="sm">Send</Button>
        <Button size="sm" variant="secondary">
          Skip
        </Button>
      </span>
    </Bubble>
    <Bubble isOwn>
      <span className="flex items-center gap-2">
        <HugeiconsIcon icon={Mic01Icon} strokeWidth={2} className="size-4" />
        “Tell Marco Thursday works, but at four.”
      </span>
    </Bubble>
    <Bubble>
      <span className="flex items-center gap-2">
        <HugeiconsIcon
          icon={Tick02Icon}
          strokeWidth={2}
          className="text-primary size-4"
        />
        Draft ready for Marco: Thursday at 16:00. Send it?
      </span>
    </Bubble>
  </div>
)

const THREATS = [
  {
    detail: 'paypa1-billing.com looks like paypal.com',
    label: 'Lookalike domain',
  },
  {
    detail: 'New IBAN in an invoice from a known supplier',
    label: 'Payment details changed',
  },
  {
    detail: '9 people reported this campaign as spam',
    label: 'Moved to spam',
  },
]

export const ShieldDemo = () => (
  <div className="mx-auto grid max-w-3xl gap-3 sm:grid-cols-3">
    {THREATS.map(({ detail, label }, index) => (
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
