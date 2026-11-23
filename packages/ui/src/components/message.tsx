import { cn } from '@fewmail/ui/lib/utils'
import { createContext, use } from 'react'
import type { ComponentProps } from 'react'

const MessageContext = createContext<{ from: 'assistant' | 'user' }>({
  from: 'assistant',
})

/**
 * One turn of a chat, as a messenger draws it: the assistant's words in a bubble at the left (`MessageBubble`), the
 * user's in a bubble at the right. What the assistant sends besides words (tool blocks, lists, cards, buttons) sits
 * under its bubble across the column, never inside: a bubble around cards read as a card in a card.
 */
const Message = ({
  children,
  className,
  from,
  ...props
}: ComponentProps<'div'> & {
  from: 'assistant' | 'user'
}) => (
  <div
    data-slot="message"
    data-from={from}
    className={cn(
      'group/message flex w-full flex-col',
      from === 'user'
        ? 'items-end has-data-[slot=message-reactions]:mb-3'
        : 'items-start',
      className
    )}
    {...props}
  >
    <div
      className={cn(
        'flex min-w-0 flex-col',
        from === 'user' ? 'max-w-[85%] items-end' : 'w-full'
      )}
    >
      <MessageContext value={{ from }}>{children}</MessageContext>
    </div>
  </div>
)

const MessageContent = ({ className, ...props }: ComponentProps<'div'>) => {
  const { from } = use(MessageContext)
  return (
    <div
      data-slot="message-content"
      // Cards inside read it to stop bleeding past the column (`smallItemBleedClassName`).
      data-flush={from === 'assistant' || undefined}
      className={cn(
        'relative flex max-w-full min-w-0 flex-col text-sm/relaxed',
        from === 'user'
          ? 'bg-secondary w-fit gap-2.5 rounded-2xl rounded-br-md px-3.5 py-2.5 whitespace-pre-line'
          : 'w-full gap-3',
        className
      )}
      {...props}
    />
  )
}

/** The assistant's words, a bubble at the left on level 3, its tail corner at the bottom left. */
const MessageBubble = ({ className, ...props }: ComponentProps<'div'>) => (
  <div
    data-slot="message-bubble"
    className={cn(
      'bg-popover flex w-fit max-w-[85%] flex-col gap-2.5 rounded-2xl rounded-bl-md px-3.5 py-2.5',
      className
    )}
    {...props}
  />
)

/** When it was written: at the bubble's end on the user's, under the bubble on the assistant's. */
const MessageTime = ({ className, ...props }: ComponentProps<'time'>) => {
  const { from } = use(MessageContext)
  return (
    <time
      data-slot="message-time"
      className={cn(
        'text-muted-foreground text-xs tabular-nums',
        from === 'user' ? '-mt-1 self-end' : 'self-start',
        className
      )}
      {...props}
    />
  )
}

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

/**
 * shadcn's `BubbleReactions`: on the user's bubble, over its edge, ringed in the chat's own background; on the
 * assistant's, in the line under its bubble. Goes inside `MessageContent`.
 */
const MessageReactions = ({
  align = 'end',
  className,
  ...props
}: ComponentProps<'div'> & {
  align?: 'end' | 'start'
}) => {
  const { from } = use(MessageContext)
  return (
    <div
      data-slot="message-reactions"
      data-align={align}
      className={cn(
        'bg-popover inset-ring-foreground/10 flex w-fit shrink-0 items-center justify-center gap-1 rounded-full px-1.5 py-0.5 text-sm shadow-sm inset-ring has-[button]:p-0 [&>button]:rounded-full',
        from === 'user'
          ? [
              'ring-body absolute bottom-0 z-10 translate-y-3/4 ring-3',
              align === 'start' ? 'left-3' : 'right-3',
            ]
          : 'self-start',
        className
      )}
      {...props}
    />
  )
}

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
  MessageBubble,
  MessageContent,
  MessageDay,
  MessageReactions,
  MessageTime,
}
