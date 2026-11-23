import { Button } from '@fewmail/ui/components/button'
import { cn } from '@fewmail/ui/lib/utils'
import { ArrowDown02Icon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import {
  MessageScroller as MessageScrollerPrimitive,
  useMessageScroller,
} from '@shadcn/react/message-scroller'
import type { ComponentProps } from 'react'

const MessageScrollerProvider = (
  props: ComponentProps<typeof MessageScrollerPrimitive.Provider>
) => <MessageScrollerPrimitive.Provider {...props} />

const MessageScroller = ({
  className,
  ...props
}: ComponentProps<typeof MessageScrollerPrimitive.Root>) => (
  <MessageScrollerPrimitive.Root
    data-slot="message-scroller"
    className={cn(
      'group/message-scroller relative flex size-full min-h-0 flex-col overflow-hidden',
      className
    )}
    {...props}
  />
)

const MessageScrollerViewport = ({
  className,
  ...props
}: ComponentProps<typeof MessageScrollerPrimitive.Viewport>) => (
  <MessageScrollerPrimitive.Viewport
    data-slot="message-scroller-viewport"
    className={cn(
      'scroll-fade-b size-full min-h-0 min-w-0 scrollbar-thin overflow-y-auto overscroll-contain outline-none data-autoscrolling:scrollbar-thumb-transparent data-autoscrolling:scrollbar-track-transparent data-pending-scroll:invisible',
      className
    )}
    {...props}
  />
)

/** Its direct children are what it measures: a wrapper with `display: contents` has no box and hides the chat's end from it. */
const MessageScrollerContent = ({
  className,
  ...props
}: ComponentProps<typeof MessageScrollerPrimitive.Content>) => (
  <MessageScrollerPrimitive.Content
    data-slot="message-scroller-content"
    className={cn('flex h-max min-h-full flex-col gap-6', className)}
    {...props}
  />
)

/** A message; with `scrollAnchor`, its arrival moves it to the top, and the answer streams in under it. */
const MessageScrollerItem = ({
  className,
  scrollAnchor = false,
  ...props
}: ComponentProps<typeof MessageScrollerPrimitive.Item>) => (
  <MessageScrollerPrimitive.Item
    data-slot="message-scroller-item"
    scrollAnchor={scrollAnchor}
    className={cn('min-w-0 shrink-0', className)}
    {...props}
  />
)

/** Back to the newest message (or the first), there only while there is somewhere to go. */
const MessageScrollerButton = ({
  className,
  direction = 'end',
  ...props
}: ComponentProps<typeof MessageScrollerPrimitive.Button>) => (
  <MessageScrollerPrimitive.Button
    data-slot="message-scroller-button"
    data-direction={direction}
    direction={direction}
    className={cn(
      'absolute inset-s-1/2 -translate-x-1/2 rounded-full transition-[translate,scale,opacity] duration-200 data-[active=false]:pointer-events-none data-[active=false]:scale-95 data-[active=false]:opacity-0 data-[active=false]:duration-400 data-[active=false]:ease-[cubic-bezier(0.7,0,0.84,0)] data-[active=true]:translate-y-0 data-[active=true]:scale-100 data-[active=true]:opacity-100 data-[active=true]:ease-[cubic-bezier(0.23,1,0.32,1)] data-[direction=end]:bottom-4 data-[direction=end]:data-[active=false]:translate-y-full data-[direction=start]:top-4 data-[direction=start]:data-[active=false]:-translate-y-full motion-reduce:transition-none rtl:translate-x-1/2 data-[direction=start]:[&_svg]:rotate-180',
      className
    )}
    render={<Button variant="outline" size="icon-sm" />}
    {...props}
  >
    <HugeiconsIcon icon={ArrowDown02Icon} strokeWidth={2} />
  </MessageScrollerPrimitive.Button>
)

export {
  MessageScroller,
  MessageScrollerButton,
  MessageScrollerContent,
  MessageScrollerItem,
  MessageScrollerProvider,
  MessageScrollerViewport,
  useMessageScroller,
}
