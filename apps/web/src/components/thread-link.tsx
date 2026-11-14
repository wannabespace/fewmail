import {
  createPopoverHandle,
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@fewmail/ui/components/popover'
import { useHotkey } from '@tanstack/react-hotkeys'
import { useNavigate } from '@tanstack/react-router'
import { useEffect } from 'react'
import type { ComponentProps } from 'react'

import { ThreadPeek } from '~/components/thread-view'
import { prefetchThread } from '~/lib/mail-db'

type Peeked = ComponentProps<typeof ThreadPeek>['message'] & {
  from: ComponentProps<typeof ThreadPeek>['from']
}

const threadPeek = createPopoverHandle<Peeked>()

/** Opens the email over the page; `SettingsRow trigger` lays it over the whole row, or `render` makes it a button. */
export const PeekTrigger = ({
  message,
  ...props
}: Omit<ComponentProps<typeof PopoverTrigger>, 'handle' | 'payload'> & {
  message: Peeked
}) => (
  <PopoverTrigger
    handle={threadPeek}
    payload={message}
    onPointerEnter={() => {
      void prefetchThread(message.threadId)
    }}
    {...props}
  />
)

/** The id a row's `PeekTrigger` takes, so its list's `O` can peek from it. */
export const peekIdOf = (rowId: string) => `peek-${rowId}`

const hasTrigger = (triggerId: string | undefined) =>
  !!triggerId && !!document.querySelector(`#${CSS.escape(triggerId)}`)

/** `O` peeks at the cursor row's email, or closes the peek; an open peek follows the cursor, and closes on a row with no email. */
export const usePeekKey = (rowId: string | undefined, enabled: boolean) => {
  const triggerId = rowId && peekIdOf(rowId)
  useHotkey(
    'O',
    () => {
      if (threadPeek.isOpen) {
        threadPeek.close()
      } else if (triggerId && hasTrigger(triggerId)) {
        threadPeek.open(triggerId)
      }
    },
    { enabled: enabled && !!rowId }
  )
  useEffect(() => {
    if (!threadPeek.isOpen) {
      return
    }
    if (triggerId && hasTrigger(triggerId)) {
      threadPeek.open(triggerId)
    } else {
      threadPeek.close()
    }
  }, [triggerId])
}

/** One peek for every `PeekTrigger`, mounted once in the app's layout. */
export const ThreadPeekPopover = () => {
  const navigate = useNavigate()
  return (
    <Popover handle={threadPeek}>
      {({ payload }) => (
        <PopoverContent
          align="start"
          initialFocus={false}
          finalFocus={false}
          padding="none"
          className="w-160"
        >
          {payload && (
            <ThreadPeek
              key={payload.id}
              from={payload.from}
              message={payload}
              onOpen={() => {
                threadPeek.close()
                void navigate({
                  params: { threadId: payload.threadId },
                  to: '/mail/$threadId',
                })
              }}
            />
          )}
        </PopoverContent>
      )}
    </Popover>
  )
}
