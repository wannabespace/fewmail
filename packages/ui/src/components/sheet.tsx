import { Dialog as SheetPrimitive } from '@base-ui/react/dialog'
import { DialogCloseButton } from '@fewmail/ui/components/dialog'
import { cn } from '@fewmail/ui/lib/utils'

const Sheet = ({ ...props }: SheetPrimitive.Root.Props) => (
  <SheetPrimitive.Root data-slot="sheet" {...props} />
)

const SheetOverlay = ({
  className,
  ...props
}: SheetPrimitive.Backdrop.Props) => (
  <SheetPrimitive.Backdrop
    data-slot="sheet-overlay"
    className={cn(
      'fixed inset-0 z-50 bg-black/30 transition-opacity duration-200 data-ending-style:opacity-0 data-starting-style:opacity-0 supports-backdrop-filter:backdrop-blur-sm',
      className
    )}
    {...props}
  />
)

const SheetContent = ({
  className,
  children,
  side = 'left',
  showCloseButton = true,
  ...props
}: SheetPrimitive.Popup.Props & {
  side?: 'left' | 'right'
  showCloseButton?: boolean
}) => (
  <SheetPrimitive.Portal data-slot="sheet-portal">
    <SheetOverlay />
    <SheetPrimitive.Popup
      data-slot="sheet-content"
      data-side={side}
      className={cn(
        'bg-body text-foreground fixed inset-y-0 z-50 flex h-full w-4/5 max-w-xs flex-col text-sm shadow-xl transition-transform duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] outline-none data-[side=left]:left-0 data-[side=left]:data-ending-style:-translate-x-full data-[side=left]:data-starting-style:-translate-x-full data-[side=right]:right-0 data-[side=right]:data-ending-style:translate-x-full data-[side=right]:data-starting-style:translate-x-full',
        className
      )}
      {...props}
    >
      {children}
      {showCloseButton && (
        <DialogCloseButton className="absolute top-4 right-4" />
      )}
    </SheetPrimitive.Popup>
  </SheetPrimitive.Portal>
)

export { Sheet, SheetContent }
