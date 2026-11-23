import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@fewmail/ui/components/tooltip'
import type { ReactElement, ReactNode } from 'react'

// The `group/sidebar` these read is the sidebar's `nav`, which sets `data-collapsed` while it is folded to its rail.

/** Whatever a row says beside its icon fades while the sidebar folds to its rail. */
export const FADES_IN_RAIL =
  'transition-opacity duration-200 ease-house group-data-collapsed/sidebar:pointer-events-none group-data-collapsed/sidebar:opacity-0'

/** A branch's `border-s` guide straightens out in the rail, so its icons line up under the others. */
export const GUIDE_IN_RAIL =
  'ms-4.5 border-s ps-1.5 transition-[margin,padding,border-color] duration-250 ease-house group-data-collapsed/sidebar:ms-0 group-data-collapsed/sidebar:border-transparent group-data-collapsed/sidebar:ps-0'

/** In the rail a row's name is gone, so it moves into a tooltip to the right; out of it, the tooltip says in full what the row cuts short (`cut`), only while `isCut` says it is. */
export const RailTip = ({
  children,
  cut,
  isCollapsed,
  isCut,
  label,
  shortcut,
}: {
  children: ReactElement
  cut?: ReactNode
  isCollapsed: boolean
  isCut?: () => boolean
  label: ReactNode
  shortcut?: ReactNode
}) => (
  // Never `disabled` until a hover measures the line: a tooltip enabled while the pointer is already over it misses that hover.
  <Tooltip
    disabled={!isCollapsed && !cut}
    shortcut={isCollapsed ? shortcut : undefined}
    onOpenChange={(isOpening, details) => {
      if (isOpening && !isCollapsed && !isCut?.()) {
        details.cancel()
      }
    }}
  >
    <TooltipTrigger render={children} />
    <TooltipContent side="right">{isCollapsed ? label : cut}</TooltipContent>
  </Tooltip>
)
