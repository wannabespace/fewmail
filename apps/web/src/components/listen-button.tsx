import { Button } from '@fewmail/ui/components/button'
import { Spinner } from '@fewmail/ui/components/spinner'
import { PlayIcon, StopIcon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { useSyncExternalStore } from 'react'
import { toast } from 'sonner'

import { useT } from '~/lib/i18n'
import { posthog } from '~/lib/posthog'

interface Playback {
  audio: HTMLAudioElement
  isPlaying: boolean
  path: string
}

let playback: Playback | null = null
const listeners = new Set<() => void>()

const publish = (next: Playback | null) => {
  playback = next
  for (const listener of listeners) {
    listener()
  }
}

const stop = () => {
  playback?.audio.pause()
  publish(null)
}

const subscribe = (listener: () => void) => {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
    // Reading's folded head and its open pane swap buttons in one commit; stopping at once would cut the audio on every open.
    setTimeout(() => {
      if (listeners.size === 0 && playback) {
        stop()
      }
    }, 0)
  }
}

/** Spoken by the API on demand, which takes a few seconds; the audio element carries the session cookie (same site). Every button on the same path shows one playback. */
export const ListenButton = ({ path }: { path: string }) => {
  const t = useT()
  const current = useSyncExternalStore(subscribe, () => playback)
  const isThis = current?.path === path

  const toggle = () => {
    stop()
    if (isThis) {
      return
    }
    posthog.capture('listen_played', { path })
    const audio = new Audio(`${import.meta.env.API_URL}${path}`)
    publish({ audio, isPlaying: false, path })
    const end = () => {
      if (playback?.audio === audio) {
        publish(null)
      }
    }
    audio.addEventListener('playing', () => {
      if (playback?.audio === audio) {
        publish({ ...playback, isPlaying: true })
      }
    })
    audio.addEventListener('ended', end)
    audio.addEventListener('error', () => {
      end()
      toast.error(t.errors.failed)
    })
    void audio.play().catch(end)
  }

  return (
    <Button size="sm" variant="ghost-muted" onClick={toggle}>
      {isThis && !current.isPlaying ? (
        <Spinner />
      ) : (
        <HugeiconsIcon icon={isThis ? StopIcon : PlayIcon} strokeWidth={2} />
      )}
      {isThis ? t.today.stopListening : t.today.listen}
    </Button>
  )
}
