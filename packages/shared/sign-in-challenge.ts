/** No 0/O, 1/I/L: the code is read off the app and compared with the browser. */
const CODE_ALPHABET = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789'

const base64Url = (bytes: Uint8Array) =>
  btoa(String.fromCodePoint(...bytes))
    .replaceAll('+', '-')
    .replaceAll('/', '_')
    .replace(/[=]+$/u, '')

const sha256 = async (text: string) =>
  new Uint8Array(
    await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text))
  )

/**
 * The desktop app's sign-in, as OAuth's PKCE: the app keeps the verifier and the browser only ever sees its challenge,
 * so whoever confirms in the browser hands the session to the app that started it, and nobody else.
 */
export const signInChallenge = {
  challengeOf: async (verifier: string) => base64Url(await sha256(verifier)),
  /** Shown by the app and by the browser, so the user signs in the app they are looking at. */
  codeOf: async (challenge: string) => {
    const hash = await sha256(challenge)
    const code = Array.from(
      hash.subarray(0, 8),
      (byte) => CODE_ALPHABET[byte % CODE_ALPHABET.length]
    ).join('')
    return `${code.slice(0, 4)}-${code.slice(4)}`
  },
  createVerifier: () => base64Url(crypto.getRandomValues(new Uint8Array(32))),
}
