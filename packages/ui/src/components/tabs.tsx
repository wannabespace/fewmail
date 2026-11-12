import { Tabs as TabsPrimitive } from '@base-ui/react/tabs'
import { cn } from '@fewmail/ui/lib/utils'
import { Cancel01Icon } from '@hugeicons/core-free-icons'
import type { VariantProps } from 'class-variance-authority'

import { IconButton } from './custom/icon-button'
import { tabsListVariants } from './tabs.utils'

const Tabs = ({
  className,
  orientation = 'horizontal',
  ...props
}: TabsPrimitive.Root.Props) => (
  <TabsPrimitive.Root
    data-slot="tabs"
    data-orientation={orientation}
    className={cn(
      `group/tabs flex data-[orientation=horizontal]:flex-col`,
      className
    )}
    {...props}
  />
)

const TabsList = ({
  className,
  variant = 'default',
  ...props
}: TabsPrimitive.List.Props & VariantProps<typeof tabsListVariants>) => (
  <TabsPrimitive.List
    data-slot="tabs-list"
    data-variant={variant}
    className={cn(tabsListVariants({ variant }), className)}
    {...props}
  />
)

const TabsTrigger = ({
  className,
  closeLabel,
  onClose,
  ...props
}: TabsPrimitive.Tab.Props &
  (
    | { closeLabel: string; onClose: () => void }
    | { closeLabel?: never; onClose?: never }
  )) => {
  const tab = (
    <TabsPrimitive.Tab
      data-slot="tabs-trigger"
      className={cn(
        `text-foreground/60 after:bg-foreground hover:text-foreground focus-visible:focus-ring data-active:border-border! data-active:bg-input data-active:text-foreground group-data-[variant=bar]/tabs-list:border-border! group-data-[variant=bar]/tabs-list:hover:bg-background/50 group-data-[variant=bar]/tabs-list:data-active:bg-background group-data-[variant=bar]/tabs-list:font-row group-data-[variant=pill]/tabs-list:not-data-active:hover:bg-accent group-data-[variant=pill]/tabs-list:data-active:bg-foreground group-data-[variant=pill]/tabs-list:data-active:text-background relative inline-flex h-[calc(100%-1px)] flex-1 items-center justify-center gap-1.5 rounded-lg border border-transparent! px-1.5 py-0.5 text-sm whitespace-nowrap transition-all group-data-[orientation=vertical]/tabs:w-full group-data-[orientation=vertical]/tabs:justify-start group-data-[orientation=vertical]/tabs:px-3 group-data-[orientation=vertical]/tabs:py-0.5 group-data-[variant=bar]/tabs-list:h-full group-data-[variant=bar]/tabs-list:cursor-pointer group-data-[variant=bar]/tabs-list:rounded-none group-data-[variant=bar]/tabs-list:border-t-transparent! group-data-[variant=bar]/tabs-list:border-l-transparent! group-data-[variant=bar]/tabs-list:px-3 group-data-[variant=line]/tabs-list:bg-transparent group-data-[variant=pill]/tabs-list:h-7 group-data-[variant=pill]/tabs-list:flex-none group-data-[variant=pill]/tabs-list:cursor-pointer group-data-[variant=pill]/tabs-list:rounded-full group-data-[variant=pill]/tabs-list:px-3 after:absolute after:opacity-0 after:transition-opacity group-data-[orientation=horizontal]/tabs:after:inset-x-0 group-data-[orientation=horizontal]/tabs:after:-bottom-1.25 group-data-[orientation=horizontal]/tabs:after:h-0.5 group-data-[orientation=vertical]/tabs:after:inset-y-0 group-data-[orientation=vertical]/tabs:after:-right-1 group-data-[orientation=vertical]/tabs:after:w-0.5 disabled:pointer-events-none disabled:opacity-50 aria-disabled:pointer-events-none aria-disabled:opacity-50 data-active:shadow-2xs group-data-[variant=bar]/tabs-list:data-active:border-b-transparent! group-data-[variant=bar]/tabs-list:data-active:shadow-none group-data-[variant=line]/tabs-list:data-active:border-transparent! group-data-[variant=line]/tabs-list:data-active:bg-transparent group-data-[variant=pill]/tabs-list:data-active:border-transparent! group-data-[variant=pill]/tabs-list:data-active:shadow-none group-data-[variant=line]/tabs-list:data-active:after:opacity-100 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4`,
        onClose &&
          'group-hover/tab:not-data-active:bg-accent group-hover/tab:not-data-active:text-foreground group-data-[variant=pill]/tabs-list:pr-7',
        className
      )}
      {...props}
    />
  )
  if (!onClose) {
    return tab
  }
  return (
    <span className="group/tab relative flex shrink-0 items-center">
      {tab}
      <IconButton
        className="text-foreground/60 group-has-data-active/tab:text-background absolute right-1 rounded-full opacity-0 group-hover/tab:opacity-100 group-has-data-active/tab:opacity-100 focus-visible:opacity-100"
        icon={Cancel01Icon}
        label={closeLabel}
        size="icon-2xs"
        variant="ghost-current"
        onClick={onClose}
      />
    </span>
  )
}

const TabsContent = ({ className, ...props }: TabsPrimitive.Panel.Props) => (
  <TabsPrimitive.Panel
    data-slot="tabs-content"
    className={cn('flex-1 text-sm outline-none', className)}
    {...props}
  />
)

export { Tabs, TabsContent, TabsList, TabsTrigger }
