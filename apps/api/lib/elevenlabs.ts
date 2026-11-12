import { env } from '../env'

const SPEECH_API = 'https://api.elevenlabs.io/v1/text-to-speech'
/** Multilingual and fast enough for a reply in a chat. */
const SPEECH_MODEL = 'eleven_flash_v2_5'
const DEFAULT_VOICE = 'JBFqnCBsd6RMkjVDRZzb'
const SPEECH_CHARS = 2500
/** Messengers want Ogg Opus voice notes; Safari plays only MP3 of the two. */
const FORMATS = { messenger: 'opus_48000_64', web: 'mp3_44100_64' } as const

export const canSpeak = !!env.ELEVENLABS_API_KEY

/** Telegram HTML and WhatsApp `*bold*` would otherwise be read aloud. */
const spokenText = (text: string) =>
  text
    .replaceAll(/<[^>]+>/gu, '')
    .replaceAll(/[*_~]/gu, '')
    .replaceAll('&lt;', '<')
    .replaceAll('&gt;', '>')
    .replaceAll('&amp;', '&')
    .slice(0, SPEECH_CHARS)

export const speak = async (text: string, format: keyof typeof FORMATS) => {
  if (!env.ELEVENLABS_API_KEY) {
    throw new Error('Speaking needs ELEVENLABS_API_KEY')
  }
  const response = await fetch(
    `${SPEECH_API}/${env.ELEVENLABS_VOICE_ID ?? DEFAULT_VOICE}?output_format=${FORMATS[format]}`,
    {
      body: JSON.stringify({ model_id: SPEECH_MODEL, text: spokenText(text) }),
      headers: {
        'content-type': 'application/json',
        'xi-api-key': env.ELEVENLABS_API_KEY,
      },
      method: 'POST',
    }
  )
  if (!response.ok) {
    throw new Error(`ElevenLabs ${response.status}: ${await response.text()}`)
  }
  return response.arrayBuffer()
}
