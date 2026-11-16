import { searchTokenHashOf } from './keyed-hash'

const MIN_PREFIX = 3
const MAX_PREFIX = 12
const WORD = /[\p{L}\p{N}]+/gu

const wordsOf = (text: string) =>
  text.normalize('NFKD').replaceAll(/\p{M}/gu, '').toLowerCase().match(WORD) ??
  []

/** Each word's beginnings (`amazon`: ama, amaz, amazo, amazon), so a word half typed finds the email without its subject ever being decrypted for search. */
export const searchTokensOf = (userId: string, texts: (string | null)[]) => [
  ...new Set(
    texts
      .flatMap((text) => wordsOf(text ?? ''))
      .flatMap((word) =>
        Array.from(
          {
            length: Math.max(
              0,
              Math.min(word.length, MAX_PREFIX) - MIN_PREFIX + 1
            ),
          },
          (_, index) => word.slice(0, MIN_PREFIX + index)
        )
      )
      .map((prefix) => searchTokenHashOf(userId, prefix))
  ),
]

/** Every typed word must match; one shorter than any indexed beginning is left out. */
export const searchQueryTokensOf = (userId: string, text: string) => [
  ...new Set(
    wordsOf(text)
      .filter((word) => word.length >= MIN_PREFIX)
      .map((word) => searchTokenHashOf(userId, word.slice(0, MAX_PREFIX)))
  ),
]
