import { cn } from '@fewmail/ui/lib/utils'

const Skeleton = ({ className, ...props }: React.ComponentProps<'div'>) => (
  <div
    data-slot="skeleton"
    className={cn('bg-foreground/10 animate-pulse rounded-md', className)}
    {...props}
  />
)

export { Skeleton }
