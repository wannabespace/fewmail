import { useEffect, useRef } from 'react'

/** Calls `load` while the returned ref's element is within 600px under the end of its scroller, the closest `root`. */
export const useLoadNearEnd = <T extends Element>(
  load: () => unknown,
  { isEnabled, root }: { isEnabled: boolean; root: string }
) => {
  const ref = useRef<T>(null)
  useEffect(() => {
    const node = ref.current
    if (!node || !isEnabled) {
      return
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          load()
        }
      },
      { root: node.closest(root), rootMargin: '0px 0px 600px 0px' }
    )
    observer.observe(node)
    return () => observer.disconnect()
  }, [isEnabled, load, root])
  return ref
}
