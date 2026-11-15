import { Badge } from '@fewmail/ui/components/badge'
import { Button } from '@fewmail/ui/components/button'
import { cn } from '@fewmail/ui/lib/utils'
import { Tick02Icon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { useEffect, useState } from 'react'

import { useT } from '~/lib/i18n'

const EASE = [0.32, 0.72, 0, 1] as const

const TelegramMark = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" aria-hidden="true" className={className}>
    <path
      fill="currentColor"
      d="M21.2 3.6 2.9 10.7c-1.2.5-1.2 1.2 0 1.6l4.7 1.5 1.8 5.6c.2.6.4.8.9.8.4 0 .6-.2.9-.5l2.3-2.2 4.7 3.5c.9.5 1.5.2 1.7-.8l3.1-14.6c.3-1.3-.5-1.9-1.4-1.5ZM9.9 14.4l-.4 4.1-1.4-4.6 10.7-6.8-8.9 7.3Z"
    />
  </svg>
)

const ROWS = [
  { id: 'a', outcome: 'archived', sender: 'w-1/4', subject: 'w-3/5' },
  { id: 'b', outcome: 'unsubscribed', sender: 'w-1/3', subject: 'w-1/2' },
  { id: 'c', outcome: null, sender: 'w-2/5', subject: 'w-4/5' },
  { id: 'd', outcome: 'archived', sender: 'w-1/4', subject: 'w-2/3' },
] as const

const STEP_MS = [1500, 1100, 700, 1700, 2200]
const LAST_STEP = STEP_MS.length - 1

const Line = ({ className }: { className: string }) => (
  <span className={cn('block h-2 rounded-full', className)} />
)

const MailRow = ({
  isImportant,
  outcome,
  sender,
  subject,
}: {
  isImportant: boolean
  outcome: string | null
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
      {outcome && (
        <motion.span
          initial={{ opacity: 0, x: -6 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.25, ease: EASE }}
        >
          <Badge variant="secondary">
            <HugeiconsIcon
              icon={Tick02Icon}
              strokeWidth={2}
              data-icon="inline-start"
            />
            {outcome}
          </Badge>
        </motion.span>
      )}
    </AnimatePresence>
  </div>
)

const TelegramMessage = ({ isSent }: { isSent: boolean }) => {
  const t = useT()

  return (
    <div className="bg-popover ring-foreground/10 flex flex-col gap-3 rounded-2xl rounded-tl-md p-4 shadow-sm ring">
      <div className="flex items-center gap-2">
        <span className="bg-primary text-primary-foreground flex size-6 items-center justify-center rounded-full">
          <TelegramMark className="size-3.5" />
        </span>
        <span className="text-sm font-medium">Fewmail</span>
        <Badge variant="destructive" size="sm">
          {t.telegram.urgent}
        </Badge>
      </div>
      <span className="flex flex-col gap-2">
        <Line className="bg-foreground/15 w-2/5" />
        <Line className="bg-foreground/8 w-4/5" />
      </span>
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
    </div>
  )
}

export const LoginStory = () => {
  const t = useT()
  const isReduced = useReducedMotion()
  const [step, setStep] = useState(0)
  const shownStep = isReduced ? LAST_STEP : step

  useEffect(() => {
    if (isReduced) {
      return
    }
    const timer = setTimeout(
      () => setStep((current) => (current + 1) % STEP_MS.length),
      STEP_MS[step]
    )
    return () => clearTimeout(timer)
  }, [isReduced, step])

  const outcomes = {
    archived: t.mail.archived,
    unsubscribed: t.mail.unsubscribed,
  }

  return (
    <div inert className="flex h-80 w-full max-w-sm flex-col">
      <AnimatePresence initial={!isReduced}>
        {ROWS.filter((row) => row.outcome === null || shownStep < 2).map(
          (row, index) => (
            <motion.div
              key={row.id}
              layout="position"
              initial={{ height: 0, opacity: 0, y: -12 }}
              animate={{ height: 'auto', opacity: 1, y: 0 }}
              exit={{ height: 0, opacity: 0, x: 32 }}
              transition={{
                delay: shownStep === 0 ? index * 0.18 : 0,
                duration: 0.4,
                ease: EASE,
              }}
              className={cn('pb-3', row.outcome && 'overflow-hidden')}
            >
              <MailRow
                isImportant={row.outcome === null}
                outcome={
                  row.outcome && shownStep >= 1 ? outcomes[row.outcome] : null
                }
                sender={row.sender}
                subject={row.subject}
              />
            </motion.div>
          )
        )}
      </AnimatePresence>
      <AnimatePresence>
        {shownStep >= 3 && (
          <motion.div
            layout="position"
            initial={{ opacity: 0, scale: 0.96, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            transition={{ duration: 0.4, ease: EASE }}
            className="mt-3 ml-8 origin-top-left"
          >
            <TelegramMessage isSent={shownStep >= 4} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
