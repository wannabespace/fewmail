import { useSubscription } from 'seitu/react'
import { createMediaQuery } from 'seitu/web'

// Tailwind's `md`: `max-md:` classes and this hook must switch at the same width.
const mobileQuery = createMediaQuery({ query: '(width < 768px)' })

export const useIsMobile = () => useSubscription(mobileQuery)
