import { AnimatePresence, motion } from 'motion/react'

export const ContentSwitch = ({
  children,
  className,
  activeContent,
  active = true,
}: {
  children: React.ReactNode
  className?: string
  activeContent: React.ReactNode
  active?: boolean
}) => (
  <AnimatePresence mode="popLayout" initial={false}>
    {active ? (
      <motion.span
        key="active"
        className={className}
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0 }}
        transition={{ duration: 0.1 }}
      >
        {activeContent}
      </motion.span>
    ) : (
      <motion.span
        key="default"
        className={className}
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0 }}
        transition={{ duration: 0.1 }}
      >
        {children}
      </motion.span>
    )}
  </AnimatePresence>
)
