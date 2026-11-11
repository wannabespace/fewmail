import { cn } from '@fewmail/ui/lib/utils'

export const Indicator = ({
  className,
  ...props
}: React.ComponentProps<'span'>) => (
  <span
    className={cn(
      `bg-primary absolute -top-1 -right-1 size-2 rounded-full`,
      className
    )}
    {...props}
  />
)
