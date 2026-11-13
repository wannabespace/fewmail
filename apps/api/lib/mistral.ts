import { Mistral } from '@mistralai/mistralai'

import { env } from '../env'
import { charge } from '../services/plan'

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
/** `economics.test.ts` keeps these equal to LiteLLM's prices. */
export const TRANSCRIBE_USD_PER_SECOND = 0.00005
export const OCR_USD_PER_PAGE = 0.004

export const transcribe = async (
  userId: string,
  audio: ArrayBuffer,
  fileName: string
) => {
  if (!mistral) {
    throw new Error('Voice messages need MISTRAL_API_KEY')
  }
  const { text, usage } = await mistral.audio.transcriptions.complete({
    file: { content: audio, fileName },
    model: TRANSCRIBE_MODEL,
  })
  await charge(
    userId,
    (usage.promptAudioSeconds ?? 0) * TRANSCRIBE_USD_PER_SECOND
  )
  return text.trim()
}

export const OCR_MODEL = 'mistral-ocr-latest'
/** Invoices and contracts state what matters on their first pages; more only costs. */
export const OCR_PAGES = [0, 1, 2]

/** A PDF's or an image's text as Markdown; null without a Mistral key. */
export const readDocument = async (
  userId: string,
  base64: string,
  mimeType: string
) => {
  if (!mistral) {
    return null
  }
  const url = `data:${mimeType};base64,${base64}`
  const isPdf = mimeType === 'application/pdf'
  const { pages, usageInfo } = await mistral.ocr.process({
    document: isPdf
      ? { documentUrl: url, type: 'document_url' }
      : { imageUrl: url, type: 'image_url' },
    model: OCR_MODEL,
    pages: isPdf ? OCR_PAGES : undefined,
  })
  await charge(userId, usageInfo.pagesProcessed * OCR_USD_PER_PAGE)
  return pages.map(({ markdown }) => markdown).join('\n\n')
}
