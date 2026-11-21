import { Badge } from '@fewmail/ui/components/badge'
import { Button } from '@fewmail/ui/components/button'
import { Message, MessageContent } from '@fewmail/ui/components/message'
import { cn } from '@fewmail/ui/lib/utils'
import { Tick02Icon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import type { ReactNode } from 'react'
import { useEffect, useState } from 'react'

import { LogoMark } from '~/components/logo'
import { useT } from '~/lib/i18n'

const EASE = [0.32, 0.72, 0, 1] as const

const ROWS = [
  { bot: 'quick', id: 'a', sender: 'w-1/4', subject: 'w-3/5' },
  { bot: 'later', id: 'b', sender: 'w-1/3', subject: 'w-1/2' },
  { bot: 'important', id: 'c', sender: 'w-2/5', subject: 'w-4/5' },
  { bot: 'quick', id: 'd', sender: 'w-1/4', subject: 'w-2/3' },
] as const

const STEP = {
  arrive: 0,
  sorted: 1,
  noiseGone: 2,
  draft: 3,
  sent: 4,
  promise: 5,
  ask: 6,
  botMade: 7,
}
const STEP_MS = [1400, 1300, 600, 1700, 1100, 1600, 900]
const LAST_STEP = STEP_MS.length

const Line = ({ className }: { className: string }) => (
  <span className={cn('block h-2 rounded-full', className)} />
)

// Not `BotAvatar`: bot-list loads Home's collections, which the login page must not.
const Avatar = ({ children }: { children: ReactNode }) => (
  <span className="bg-popover ring-foreground/8 text-foreground/80 text-2xs grid size-5 shrink-0 place-items-center rounded-full font-medium ring [&>svg]:size-3.5">
    {children}
  </span>
)

const BotName = ({ name }: { name: string }) => (
  <span className="text-muted-foreground mb-1.5 flex items-center gap-1.5 text-xs font-medium">
    <Avatar>{name.charAt(0).toUpperCase()}</Avatar>
    {name}
  </span>
)

const MailRow = ({
  bot,
  isImportant,
  sender,
  subject,
}: {
  bot: string | null
  isImportant: boolean
  sender: string
  subject: string
}) => (
  <div
    className={cn(
      'bg-popover flex items-center gap-3 rounded-2xl p-4 ring',
      isImportant ? 'ring-foreground/10 shadow-sm' : 'ring-foreground/6'
    )}
  >
    <span
      className={cn(
        'size-2 shrink-0 rounded-full',
        isImportant ? 'bg-primary' : 'ring-foreground/30 ring-1'
      )}
    />
    <span className="flex flex-1 flex-col gap-2">
      <Line className={cn('bg-foreground/15', sender)} />
      <Line className={cn('bg-foreground/8', subject)} />
    </span>
    <AnimatePresence>
      {bot && (
        <motion.span
          initial={{ opacity: 0, x: -6 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.25, ease: EASE }}
        >
          <Badge variant="secondary">{bot}</Badge>
        </motion.span>
      )}
    </AnimatePresence>
  </div>
)

/** A bot's message as its chat on Home draws it, with the bot named over it. */
const BotMessage = ({
  children,
  from,
}: {
  children: ReactNode
  from: ReactNode
}) => (
  <Message from="assistant">
    {from}
    <MessageContent className="w-72">{children}</MessageContent>
  </Message>
)

const DraftMessage = ({ isSent }: { isSent: boolean }) => {
  const t = useT()

  return (
    <BotMessage from={<BotName name={t.starterBots.important.name} />}>
      <div className="bg-secondary/60 flex flex-col gap-2 rounded-xl p-3">
        <span className="text-muted-foreground text-xs">
          {t.telegram.draft}
        </span>
        <Line className="bg-foreground/10 w-full" />
        <Line className="bg-foreground/10 w-3/5" />
      </div>
      <div className="relative h-7">
        <AnimatePresence initial={false} mode="popLayout">
          {isSent ? (
            <motion.span
              key="sent"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25, ease: EASE }}
              className="text-muted-foreground flex h-7 items-center gap-1.5 text-sm"
            >
              <HugeiconsIcon
                icon={Tick02Icon}
                strokeWidth={2}
                className="text-primary size-4"
              />
              {t.today.sent}
            </motion.span>
          ) : (
            <motion.div
              key="actions"
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.15, ease: EASE }}
              className="grid grid-cols-2 gap-2"
            >
              <Button size="sm">{t.telegram.send}</Button>
              <Button size="sm" variant="secondary">
                {t.telegram.skip}
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </BotMessage>
  )
}

const PromiseMessage = () => {
  const t = useT()

  return (
    <BotMessage from={<BotName name={t.starterBots.board.name} />}>
      <span>{t.bots.promises(1)}</span>
      <div className="flex flex-col gap-2">
        <span className="text-muted-foreground text-xs">
          {t.board.section.owed}
        </span>
        <Line className="bg-foreground/15 w-4/5" />
      </div>
    </BotMessage>
  )
}

const AskMessage = () => (
  <Message from="user">
    <MessageContent className="w-48">
      <Line className="bg-foreground/15 w-full" />
      <Line className="bg-foreground/15 w-2/3" />
    </MessageContent>
  </Message>
)

const BotMadeMessage = () => {
  const t = useT()

  return (
    <BotMessage
      from={
        <span className="text-muted-foreground mb-1.5 flex items-center gap-1.5 text-xs font-medium">
          <Avatar>
            <LogoMark />
          </Avatar>
          {t.bots.fewmail}
        </span>
      }
    >
      <span>{t.bots.created}</span>
    </BotMessage>
  )
}

const Enter = ({ children }: { children: ReactNode }) => (
  <motion.div
    layout="position"
    initial={{ opacity: 0, scale: 0.96, y: 16 }}
    animate={{ opacity: 1, scale: 1, y: 0 }}
    transition={{ duration: 0.4, ease: EASE }}
    className="shrink-0 origin-bottom-left pt-3"
  >
    {children}
  </motion.div>
)

/** Bots sort the mail, one drafts a reply that goes out on a yes, the Board writes down a promise, and Fewmail Bot makes a new bot when asked. */
export const LoginStory = () => {
  const t = useT()
  const isReduced = useReducedMotion()
  const [step, setStep] = useState(0)
  const shownStep = isReduced ? LAST_STEP : step

  // Plays once: a story on a loop grew WebKit's memory without bound (`architecture.md` → Memory).
  useEffect(() => {
    if (isReduced || step === LAST_STEP) {
      return
    }
    const timer = setTimeout(
      () => setStep((current) => current + 1),
      STEP_MS[step]
    )
    return () => clearTimeout(timer)
  }, [isReduced, step])

  const botNames = {
    important: t.starterBots.important.name,
    later: t.starterBots.later.name,
    quick: t.starterBots.quick.name,
  }

  // The padding is the room the rings and shadows draw in: without it `overflow-hidden` cuts the cards' edges.
  return (
    <div
      inert
      className="flex h-[30rem] w-full max-w-sm flex-col justify-end overflow-hidden mask-t-from-85% px-1 pb-1"
    >
      <AnimatePresence initial={!isReduced}>
        {ROWS.filter(
          (row) => row.bot === 'important' || shownStep < STEP.noiseGone
        ).map((row, index) => (
          <motion.div
            key={row.id}
            layout="position"
            initial={{ height: 0, opacity: 0, y: -12 }}
            animate={{ height: 'auto', opacity: 1, y: 0 }}
            exit={{ height: 0, opacity: 0, x: 32 }}
            transition={{
              delay: shownStep === STEP.arrive ? index * 0.18 : 0,
              duration: 0.4,
              ease: EASE,
            }}
            className={cn(
              'shrink-0 pt-3',
              row.bot !== 'important' && 'overflow-hidden px-px pb-px'
            )}
          >
            <MailRow
              bot={shownStep >= STEP.sorted ? botNames[row.bot] : null}
              isImportant={row.bot === 'important'}
              sender={row.sender}
              subject={row.subject}
            />
          </motion.div>
        ))}
      </AnimatePresence>
      <AnimatePresence initial={!isReduced}>
        {shownStep >= STEP.draft && (
          <Enter key="draft">
            <DraftMessage isSent={shownStep >= STEP.sent} />
          </Enter>
        )}
        {shownStep >= STEP.promise && (
          <Enter key="promise">
            <PromiseMessage />
          </Enter>
        )}
        {shownStep >= STEP.ask && (
          <Enter key="ask">
            <AskMessage />
          </Enter>
        )}
        {shownStep >= STEP.botMade && (
          <Enter key="made">
            <BotMadeMessage />
          </Enter>
        )}
      </AnimatePresence>
    </div>
  )
}
