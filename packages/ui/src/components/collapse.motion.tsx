import { cn } from '@fewmail/ui/lib/utils'
import { motion } from 'motion/react'
import type { ComponentProps, ReactNode } from 'react'

// Clipped while it folds: the clip-path hides the overflow but a scroller still counts it, so a tall block folding at the end of a chat kept the scroll area its full height and the chat jumped into the blank. Unclipped once shown (motion's `transitionEnd` never lets go of the clip), or the rings inside are cut.
const collapsed = { height: 0, opacity: 0, overflow: 'clip' }
const expanded = { height: 'auto', opacity: 1, overflow: 'visible' }

const absorbStackGap = (node: HTMLDivElement | null) => {
  const parent = node?.previousElementSibling?.parentElement
  const inner = node?.firstElementChild
  if (!(parent && inner instanceof HTMLElement)) {
    return
  }
  const { flexDirection, rowGap } = getComputedStyle(parent)
  if (flexDirection !== 'column' || rowGap === 'normal') {
    return
  }
  node.style.marginTop = `-${rowGap}`
  inner.style.paddingTop = rowGap
}

export const MotionCollapse = ({
  children,
  className,
  ...props
}: ComponentProps<typeof motion.div> & { children: ReactNode }) => (
  <motion.div
    ref={absorbStackGap}
    initial={collapsed}
    animate={expanded}
    exit={collapsed}
    transition={{ duration: 0.18, ease: [0.32, 0.72, 0, 1] }}
    // overflow-hidden would cut the focus and invalid rings (3px) of the controls inside
    className={cn('[clip-path:inset(-4px)]', className)}
    {...props}
  >
    <div>{children}</div>
  </motion.div>
)
