import { copy } from '@fewmail/ui/lib/copy'
import { Copy01Icon, Tick02Icon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import type { ComponentProps, ReactNode } from 'react'
import { useRef, useState } from 'react'

import { Button } from '../button'
import { Tooltip, TooltipContent, TooltipTrigger } from '../tooltip'
import { ContentSwitch } from './content-switch'

const COPIED_MS = 3000

const defaultCopyIcon = (
  <HugeiconsIcon icon={Copy01Icon} strokeWidth={2} data-icon="inline-start" />
)
const defaultSuccessIcon = (
  <HugeiconsIcon
    icon={Tick02Icon}
    strokeWidth={2}
    className="text-success"
    data-icon="inline-start"
  />
)

export const CopyButton = ({
  text,
  copyIcon = defaultCopyIcon,
  successIcon = defaultSuccessIcon,
  children,
  ...props
}: {
  text: string | (() => string)
  copyIcon?: ReactNode
  successIcon?: ReactNode
} & ComponentProps<typeof Button>) => {
  const [copied, setCopied] = useState(false)
  const copiedTimer = useRef<ReturnType<typeof setTimeout>>(undefined)

  const handleCopy = () => {
    copy(typeof text === 'function' ? text() : text)
    setCopied(true)
    clearTimeout(copiedTimer.current)
    copiedTimer.current = setTimeout(() => setCopied(false), COPIED_MS)
  }

  return (
    <Button
      {...props}
      onClick={(e) => {
        props.onClick?.(e)
        handleCopy()
      }}
    >
      <ContentSwitch active={copied} activeContent={successIcon}>
        {copyIcon}
      </ContentSwitch>
      {children}
    </Button>
  )
}

export const CopyIconButton = ({
  label,
  side = 'bottom',
  ...props
}: {
  label: string
  side?: ComponentProps<typeof TooltipContent>['side']
} & ComponentProps<typeof CopyButton>) => (
  <Tooltip>
    <TooltipTrigger
      render={
        <CopyButton
          size="icon-xs"
          variant="ghost-muted"
          aria-label={label}
          {...props}
        />
      }
    />
    <TooltipContent side={side}>{label}</TooltipContent>
  </Tooltip>
)
