import { Button } from '@fewmail/ui/components/button'
import { Spinner } from '@fewmail/ui/components/spinner'
import { PlayIcon, StopIcon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { useEffect, useRef, useState } from 'react'
import { toast } from 'sonner'

import { useT } from '~/lib/i18n'

/** Spoken by the API on demand, which takes a few seconds; the audio element carries the session cookie (same site). */
export const ListenButton = ({ path }: { path: string }) => {
  const t = useT()
  const audio = useRef<HTMLAudioElement | null>(null)
  const [state, setState] = useState<'idle' | 'loading' | 'playing'>('idle')
  useEffect(() => () => audio.current?.pause(), [])

  const toggle = () => {
    if (audio.current) {
      audio.current.pause()
      audio.current = null
      setState('idle')
      return
    }
    const player = new Audio(`${import.meta.env.API_URL}${path}`)
    audio.current = player
    setState('loading')
    player.addEventListener('playing', () => setState('playing'))
    const stop = () => {
      if (audio.current === player) {
        audio.current = null
        setState('idle')
      }
    }
    player.addEventListener('ended', stop)
    player.addEventListener('error', () => {
      stop()
      toast.error(t.errors.failed)
    })
    void player.play().catch(stop)
  }

  return (
    <Button size="sm" variant="ghost-muted" onClick={toggle}>
      {state === 'loading' ? (
        <Spinner />
      ) : (
        <HugeiconsIcon
          icon={state === 'playing' ? StopIcon : PlayIcon}
          strokeWidth={2}
        />
      )}
      {state === 'idle' ? t.today.listen : t.today.stopListening}
    </Button>
  )
}
