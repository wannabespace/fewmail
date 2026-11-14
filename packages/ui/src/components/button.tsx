import { Button as ButtonPrimitive } from '@base-ui/react/button'
import { cn } from '@fewmail/ui/lib/utils'
import type { VariantProps } from 'class-variance-authority'
import type { ReactNode } from 'react'

import { buttonVariants } from './button.utils'
import { Tooltip, TooltipContent, TooltipTrigger } from './tooltip'

const Button = ({
  className,
  variant = 'default',
  size = 'default',
  render,
  nativeButton = !render,
  shortcut,
  ...props
}: ButtonPrimitive.Props &
  VariantProps<typeof buttonVariants> & { shortcut?: ReactNode }) => {
  const button = (
    <ButtonPrimitive
      data-slot="button"
      className={cn(buttonVariants({ className, size, variant }))}
      render={render}
      nativeButton={nativeButton}
      {...props}
    />
  )

  return shortcut && !props.disabled ? (
    <Tooltip shortcut={shortcut}>
      <TooltipTrigger render={button} />
      <TooltipContent />
    </Tooltip>
  ) : (
    button
  )
}

export { Button }
