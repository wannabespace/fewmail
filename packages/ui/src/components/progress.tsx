import { Progress as ProgressPrimitive } from '@base-ui/react/progress'
import { cn } from '@fewmail/ui/lib/utils'
import type { VariantProps } from 'class-variance-authority'
import type { CSSProperties, ReactNode } from 'react'

import { progressIndicatorVariants } from './progress.utils'
import { Tooltip, TooltipContent, TooltipTrigger } from './tooltip'

const Progress = ({
  className,
  variant,
  ...props
}: ProgressPrimitive.Root.Props &
  VariantProps<typeof progressIndicatorVariants>) => (
  <ProgressPrimitive.Root
    data-slot="progress"
    className={cn('w-full', className)}
    {...props}
  >
    <ProgressPrimitive.Track
      data-slot="progress-track"
      className="bg-foreground/8 relative h-0.75 overflow-hidden rounded-full"
    >
      <ProgressPrimitive.Indicator
        data-slot="progress-indicator"
        className={progressIndicatorVariants({ variant })}
      />
    </ProgressPrimitive.Track>
  </ProgressPrimitive.Root>
)

interface ProgressSegment {
  /** The segment's fill, a `bg-*` class. */
  className: string
  key: string
  label: ReactNode
  value: number
}

/** One track split by what filled it; each segment names itself on hover. */
const ProgressSegments = ({
  className,
  max,
  segments,
}: {
  className?: string
  max: number
  segments: ProgressSegment[]
}) => {
  const value = segments.reduce((sum, segment) => sum + segment.value, 0)

  return (
    <ProgressPrimitive.Root
      data-slot="progress"
      value={value}
      max={max}
      className={cn('w-full', className)}
    >
      <ProgressPrimitive.Track
        data-slot="progress-track"
        className="bg-foreground/8 flex h-0.75 gap-0.5 rounded-full"
      >
        {segments
          .filter((segment) => segment.value > 0)
          .map((segment) => (
            <Tooltip key={segment.key}>
              <TooltipTrigger
                render={<span />}
                style={{ '--grow': segment.value } as CSSProperties}
                className={cn(
                  // The bar is 3px tall: the hit area reaches past it so the pointer finds a segment.
                  'ease-house relative min-w-0 grow-(--grow) basis-0 cursor-default rounded-full transition-[flex-grow] duration-450 before:absolute before:inset-x-0 before:-inset-y-2.5 motion-reduce:transition-none',
                  segment.className
                )}
              />
              <TooltipContent>{segment.label}</TooltipContent>
            </Tooltip>
          ))}
        <span
          style={{ '--grow': max - value } as CSSProperties}
          className="ease-house min-w-0 grow-(--grow) basis-0 transition-[flex-grow] duration-450 motion-reduce:transition-none"
        />
      </ProgressPrimitive.Track>
    </ProgressPrimitive.Root>
  )
}

export { Progress, ProgressSegments }
