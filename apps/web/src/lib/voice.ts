import { useRef, useState } from 'react'

const { API_URL } = import.meta.env

export type VoiceState = 'idle' | 'recording' | 'hearing'

const transcribe = async (audio: Blob) => {
  const response = await fetch(`${API_URL}/voice/hear`, {
    body: audio,
    credentials: 'include',
    headers: { 'content-type': audio.type },
    method: 'POST',
  })
  const { text } = (await response.json()) as { text: string }
  return text.trim()
}

/** Press to talk, press again to stop: the recording is transcribed on the server and handed to `onHeard`. */
export const useVoice = (onHeard: (text: string) => void) => {
  const [state, setState] = useState<VoiceState>('idle')
  const recorder = useRef<MediaRecorder | null>(null)

  const start = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
    const recording = new MediaRecorder(stream)
    const chunks: Blob[] = []
    recording.addEventListener('dataavailable', (event) =>
      chunks.push(event.data)
    )
    recording.addEventListener('stop', async () => {
      for (const track of stream.getTracks()) {
        track.stop()
      }
      setState('hearing')
      const text = await transcribe(
        new Blob(chunks, { type: recording.mimeType })
      ).catch(() => '')
      setState('idle')
      if (text) {
        onHeard(text)
      }
    })
    recording.start()
    recorder.current = recording
    setState('recording')
  }

  const toggle = () => {
    if (state === 'recording') {
      recorder.current?.stop()
    } else if (state === 'idle') {
      void start().catch(() => setState('idle'))
    }
  }

  return { state, toggle }
}

/** Reads an answer aloud in the voice the messengers use. */
export const speakAloud = async (text: string) => {
  const response = await fetch(`${API_URL}/voice/speak`, {
    body: JSON.stringify({ text }),
    credentials: 'include',
    headers: { 'content-type': 'application/json' },
    method: 'POST',
  })
  if (!response.ok) {
    return
  }
  const url = URL.createObjectURL(await response.blob())
  const audio = new Audio(url)
  audio.addEventListener('ended', () => URL.revokeObjectURL(url))
  await audio.play()
}
