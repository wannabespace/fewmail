import { Mistral } from '@mistralai/mistralai'

import { env } from '../env'

export const mistral = env.MISTRAL_API_KEY
  ? new Mistral({
      apiKey: env.MISTRAL_API_KEY,
      // The SDK retries nothing by default, and a first sync reading many attachments at once hits 429.
      retryConfig: {
        backoff: {
          exponent: 2,
          initialInterval: 1000,
          maxElapsedTime: 60_000,
          maxInterval: 20_000,
        },
        strategy: 'backoff',
      },
    })
  : null

export const TRANSCRIBE_MODEL = 'voxtral-mini-latest'

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

export const OCR_MODEL = 'mistral-ocr-latest'
/** Invoices and contracts state what matters on their first pages; more only costs. */
export const OCR_PAGES = [0, 1, 2]

/** A PDF's or an image's text as Markdown; null without a Mistral key. */
export const readDocument = async (base64: string, mimeType: string) => {
  if (!mistral) {
    return null
  }
  const url = `data:${mimeType};base64,${base64}`
  const isPdf = mimeType === 'application/pdf'
  const { pages } = await mistral.ocr.process({
    document: isPdf
      ? { documentUrl: url, type: 'document_url' }
      : { imageUrl: url, type: 'image_url' },
    model: OCR_MODEL,
    pages: isPdf ? OCR_PAGES : undefined,
  })
  return pages.map(({ markdown }) => markdown).join('\n\n')
}
