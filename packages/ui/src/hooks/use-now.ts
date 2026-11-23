import { useEffect, useState } from 'react'

/** The time now in ms, read again every `intervalMs` until `until` passes. */
export const useNow = (
  intervalMs: number,
  until = Number.POSITIVE_INFINITY
) => {
  const [now, setNow] = useState(Date.now)
  const isTicking = now < until
  useEffect(() => {
    if (!isTicking) {
      return
    }
    const timer = setInterval(() => setNow(Date.now()), intervalMs)
    return () => clearInterval(timer)
  }, [intervalMs, isTicking])
  return now
}
