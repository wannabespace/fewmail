import { Buffer } from 'node:buffer'
import * as crypto from 'node:crypto'

import { Result } from 'better-result'

const ALGORITHM = 'aes-256-gcm'
const AUTH_TAG_LENGTH = 16
const IV_LENGTH = 12
const KEY_LENGTH = 32
const SALT_LENGTH = 16

export const encrypt = ({ text, secret }: { text: string; secret: string }) => {
  const iv = crypto.randomBytes(IV_LENGTH)
  const salt = crypto.randomBytes(SALT_LENGTH)

  const key = crypto.pbkdf2Sync(secret, salt, 1, KEY_LENGTH, 'sha256')

  const cipher = crypto.createCipheriv(ALGORITHM, key, iv)
  const encrypted = Buffer.concat([
    cipher.update(text, 'utf-8'),
    cipher.final(),
    cipher.getAuthTag(),
  ])

  return `${iv.toString('hex')}.${encrypted.toString('hex')}.${salt.toString('hex')}`
}

export const decrypt = ({
  encryptedText,
  secret,
}: {
  encryptedText: string
  secret: string
}) => {
  const decrypted = Result.try(() => {
    const [ivBase64, encryptedBase64, saltBase64] = encryptedText.split('.')

    if (!ivBase64 || !encryptedBase64 || !saltBase64) {
      throw new Error('Failed to decrypt text')
    }

    const iv = Buffer.from(ivBase64, 'hex')
    const encrypted = Buffer.from(encryptedBase64, 'hex')
    const salt = Buffer.from(saltBase64, 'hex')

    const authTag = encrypted.subarray(-AUTH_TAG_LENGTH)
    const ciphertext = encrypted.subarray(0, -AUTH_TAG_LENGTH)

    const key = crypto.pbkdf2Sync(secret, salt, 1, KEY_LENGTH, 'sha256')
    // Without the length, GCM accepts a truncated tag, which a forger can guess.
    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv, {
      authTagLength: AUTH_TAG_LENGTH,
    })
    decipher.setAuthTag(authTag)

    return Buffer.concat([
      decipher.update(ciphertext),
      decipher.final(),
    ]).toString('utf-8')
  })
  if (decrypted.isErr()) {
    throw new Error('Failed to decrypt text')
  }
  return decrypted.value
}

const searchableKeys = (secret: string) => {
  const keys = Buffer.from(
    crypto.hkdfSync('sha256', secret, '', 'fewmail:searchable', KEY_LENGTH * 2)
  )
  return { cipher: keys.subarray(KEY_LENGTH), iv: keys.subarray(0, KEY_LENGTH) }
}

/**
 * Same text, same ciphertext, so equality, unique indexes and group by keep working.
 * The IV is an HMAC of the text: a random or fixed IV here would either break lookups or reuse a GCM nonce across different texts.
 */
export const encryptSearchable = ({
  text,
  secret,
}: {
  text: string
  secret: string
}) => {
  const keys = searchableKeys(secret)
  const iv = crypto
    .createHmac('sha256', keys.iv)
    .update(text)
    .digest()
    .subarray(0, IV_LENGTH)
  const cipher = crypto.createCipheriv(ALGORITHM, keys.cipher, iv)
  const encrypted = Buffer.concat([
    cipher.update(text, 'utf-8'),
    cipher.final(),
    cipher.getAuthTag(),
  ])
  return `${iv.toString('hex')}.${encrypted.toString('hex')}`
}

export const decryptSearchable = ({
  encryptedText,
  secret,
}: {
  encryptedText: string
  secret: string
}) => {
  const decrypted = Result.try(() => {
    const [ivHex, encryptedHex] = encryptedText.split('.')
    if (!ivHex || !encryptedHex) {
      throw new Error('Failed to decrypt text')
    }
    const encrypted = Buffer.from(encryptedHex, 'hex')
    const decipher = crypto.createDecipheriv(
      ALGORITHM,
      searchableKeys(secret).cipher,
      Buffer.from(ivHex, 'hex'),
      { authTagLength: AUTH_TAG_LENGTH }
    )
    decipher.setAuthTag(encrypted.subarray(-AUTH_TAG_LENGTH))
    return Buffer.concat([
      decipher.update(encrypted.subarray(0, -AUTH_TAG_LENGTH)),
      decipher.final(),
    ]).toString('utf-8')
  })
  if (decrypted.isErr()) {
    throw new Error('Failed to decrypt text')
  }
  return decrypted.value
}
