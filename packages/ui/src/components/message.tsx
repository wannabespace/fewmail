import { cn } from '@fewmail/ui/lib/utils'
import { createContext, use } from 'react'
import type { ComponentProps } from 'react'

const MessageContext = createContext<{
  from: 'assistant' | 'user'
  isWide: boolean
}>({ from: 'assistant', isWide: false })

/**
 * One turn of a chat, as a messenger draws it: the assistant's bubble at the left, the user's at the right. `isWide`
 * is a message that is lists of its own cards: a bubble across the whole column, padded past the cards' bleed so
 * they never meet its edges.
 */
const Message = ({
  children,
  className,
  from,
  isWide = false,
  ...props
}: ComponentProps<'div'> & {
  from: 'assistant' | 'user'
  isWide?: boolean
}) => (
  <div
    data-slot="message"
    data-from={from}
    className={cn(
      'group/message flex w-full flex-col has-data-[slot=message-reactions]:mb-3',
      from === 'user' ? 'items-end' : 'items-start',
      className
    )}
    {...props}
  >
    <div
      className={cn(
        'flex min-w-0 flex-col',
        isWide ? 'w-full' : 'max-w-[85%]',
        from === 'user' && 'items-end'
      )}
    >
      <MessageContext value={{ from, isWide }}>{children}</MessageContext>
    </div>
  </div>
)

const BUBBLES = {
  assistant: 'bg-card ring-foreground/6 rounded-bl-md ring',
  user: 'bg-secondary rounded-br-md whitespace-pre-line',
}

const MessageContent = ({ className, ...props }: ComponentProps<'div'>) => {
  const { from, isWide } = use(MessageContext)
  return (
    <div
      data-slot="message-content"
      className={cn(
        'flex max-w-full min-w-0 flex-col text-sm/relaxed',
        'relative rounded-2xl',
        BUBBLES[from],
        isWide
          ? 'w-full gap-6 px-4 py-4 md:px-7 md:py-5'
          : 'w-fit gap-2.5 px-3.5 py-2.5',
        className
      )}
      {...props}
    />
  )
}

/** When it was written, at the bubble's end as a messenger puts it. */
const MessageTime = ({ className, ...props }: ComponentProps<'time'>) => (
  <time
    data-slot="message-time"
    className={cn(
      'text-muted-foreground -mt-1 self-end text-xs tabular-nums',
      className
    )}
    {...props}
  />
)

/** The day the messages under it were written, a chip across the chat. */
const MessageDay = ({ className, ...props }: ComponentProps<'p'>) => (
  <p
    data-slot="message-day"
    className={cn(
      'bg-secondary text-muted-foreground self-center rounded-full px-2.5 py-0.5 text-xs font-medium',
      className
    )}
    {...props}
  />
)

/** shadcn's `BubbleReactions`: reactions over the bubble's edge, ringed in the chat's own background. Goes inside `MessageContent`. */
const MessageReactions = ({
  align = 'end',
  className,
  side = 'bottom',
  ...props
}: ComponentProps<'div'> & {
  align?: 'end' | 'start'
  side?: 'bottom' | 'top'
}) => (
  <div
    data-slot="message-reactions"
    data-align={align}
    data-side={side}
    className={cn(
      'bg-popover ring-body inset-ring-foreground/10 absolute z-10 flex w-fit shrink-0 items-center justify-center gap-1 rounded-full px-1.5 py-0.5 text-sm shadow-sm ring-3 inset-ring has-[button]:p-0 [&>button]:rounded-full',
      side === 'top' ? 'top-0 -translate-y-3/4' : 'bottom-0 translate-y-3/4',
      align === 'start' ? 'left-3' : 'right-3',
      className
    )}
    {...props}
  />
)

const MessageActions = ({ className, ...props }: ComponentProps<'div'>) => (
  <div
    data-slot="message-actions"
    className={cn('flex flex-wrap items-center gap-2', className)}
    {...props}
  />
)

export {
  Message,
  MessageActions,
  MessageContent,
  MessageDay,
  MessageReactions,
  MessageTime,
}
