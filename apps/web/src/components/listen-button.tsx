import { SPEECH_CHARS } from '@fewmail/shared/agent'
import { Button } from '@fewmail/ui/components/button'
import { Spinner } from '@fewmail/ui/components/spinner'
import { PauseIcon, PlayIcon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { useSyncExternalStore } from 'react'
import { toast } from 'sonner'

import { useLocale, useT } from '~/lib/i18n'
import { posthog } from '~/lib/posthog'

interface Playback {
  audio: HTMLAudioElement
  path: string
  /** Seconds left, once the audio knows its length. */
  remaining?: number
  state: 'loading' | 'paused' | 'playing'
}

/** How fast the voice reads, for the length shown before the audio exists. */
const CHARS_PER_SECOND = 15

const clock = (seconds: number) =>
  `${Math.floor(seconds / 60)}:${String(Math.floor(seconds % 60)).padStart(2, '0')}`

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

const play = (path: string, onError: () => void) => {
  posthog.capture('listen_played', { path })
  const audio = new Audio(`${import.meta.env.API_URL}${path}`)
  publish({ audio, path, state: 'loading' })
  const settle = (state: Playback['state']) => {
    if (playback?.audio === audio) {
      publish({ ...playback, state })
    }
  }
  const tick = () => {
    if (playback?.audio === audio && Number.isFinite(audio.duration)) {
      publish({ ...playback, remaining: audio.duration - audio.currentTime })
    }
  }
  const end = () => {
    if (playback?.audio === audio) {
      publish(null)
    }
  }
  audio.addEventListener('playing', () => settle('playing'))
  audio.addEventListener('pause', () => settle('paused'))
  audio.addEventListener('loadedmetadata', tick)
  audio.addEventListener('timeupdate', tick)
  audio.addEventListener('ended', end)
  audio.addEventListener('error', () => {
    end()
    onError()
  })
  void audio.play().catch(end)
}

/** Plays a spoken path at once, as the button would: a bot's answer to a voice message reads itself out. */
export const speakAloud = (path: string) => {
  stop()
  play(path, stop)
}

/**
 * Spoken by the API on demand, which takes a few seconds; the audio element carries the session cookie (same site). Every
 * button on the same path shows one playback, which pauses and resumes where it stopped. `text` is what the API speaks,
 * for its length before the audio exists; then the time left.
 */
export const ListenButton = ({
  path,
  text,
}: {
  path: string
  text: string
}) => {
  const t = useT()
  const locale = useLocale()
  const current = useSyncExternalStore(subscribe, () => playback)
  const state = current?.path === path ? current.state : undefined

  const toggle = () => {
    if (state === 'playing') {
      posthog.capture('listen_paused', { path })
      current?.audio.pause()
      return
    }
    if (state === 'paused') {
      void current?.audio.play().catch(stop)
      return
    }
    stop()
    if (!state) {
      play(path, () => toast.error(t.errors.failed))
    }
  }

  const labels = {
    loading: t.today.listen,
    paused: t.today.resumeListening,
    playing: t.today.pauseListening,
  }
  const label = state ? labels[state] : t.today.listen
  const minutes = Math.max(
    1,
    Math.round(Math.min(text.length, SPEECH_CHARS) / CHARS_PER_SECOND / 60)
  )
  const length =
    current?.path === path && current.remaining !== undefined
      ? clock(current.remaining)
      : `~${new Intl.NumberFormat(locale, { style: 'unit', unit: 'minute', unitDisplay: 'short' }).format(minutes)}`

  return (
    <Button size="sm" variant="ghost-muted" onClick={toggle}>
      {state === 'loading' ? (
        <Spinner />
      ) : (
        <HugeiconsIcon
          icon={state === 'playing' ? PauseIcon : PlayIcon}
          strokeWidth={2}
        />
      )}
      {label}
      <span className="text-muted-foreground/70 tabular-nums">{length}</span>
    </Button>
  )
}
