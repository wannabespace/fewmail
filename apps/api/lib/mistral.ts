import { Mistral } from '@mistralai/mistralai'

import { env } from '../env'

export const mistral = env.MISTRAL_API_KEY
  ? new Mistral({ apiKey: env.MISTRAL_API_KEY })
  : null

const TRANSCRIBE_MODEL = 'voxtral-mini-latest'

export const transcribe = async (audio: ArrayBuffer, fileName: string) => {
  if (!mistral) {
    throw new Error('Voice messages need MISTRAL_API_KEY')
  }
  const { text } = await mistral.audio.transcriptions.complete({
    file: { content: audio, fileName },
    model: TRANSCRIBE_MODEL,
  })
  return text.trim()
}
