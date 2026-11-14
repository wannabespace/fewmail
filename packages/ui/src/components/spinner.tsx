import { cn } from '@fewmail/ui/lib/utils'
import { Loading03Icon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import type { HugeiconsIconProps } from '@hugeicons/react'

/** Silent beside a text that already says what is loading; alone it needs a `label` in the user's language. */
const Spinner = ({
  className,
  label,
  ...props
}: Omit<HugeiconsIconProps, 'icon'> & { label?: string }) => {
  const icon = (
    <HugeiconsIcon
      icon={Loading03Icon}
      strokeWidth={2}
      className={cn(`size-4 animate-spin`, className)}
      {...props}
    />
  )
  return label ? (
    <output data-slot="spinner" aria-label={label} className="inline-flex">
      {icon}
    </output>
  ) : (
    <span data-slot="spinner" aria-hidden className="inline-flex">
      {icon}
    </span>
  )
}

export { Spinner }
