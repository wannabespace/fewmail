/* oxlint-disable eslint/no-bitwise -- simhash is bit arithmetic */
import { createHash } from 'node:crypto'

import { db } from '@fewmail/db'
import { bulkPrints, messages, users } from '@fewmail/db/schema'
import { subDays } from 'date-fns'
import { and, eq, gte, or } from 'drizzle-orm'

import { userHashOf } from '../lib/keyed-hash'

export { BULK_THRESHOLD } from '@fewmail/shared/agent'

type Message = typeof messages.$inferSelect

const WINDOW_DAYS = 30
const MAX_HAMMING = 3
const MIN_BODY = 200
const SHINGLE = 3
const BITS = 64n
const BAND_MASK = 0xff_ffn

const tokens = (body: string, personal: string[]) => {
  const lines = body
    .replaceAll('\r', '')
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
  return lines
    .slice(1)
    .join(' ')
    .toLowerCase()
    .replaceAll(/https?:\/\/\S+|\S+@\S+|\d+/gu, ' ')
    .split(/[^\p{L}]+/u)
    .filter((word) => word.length > 1 && !personal.includes(word))
}

const hash64 = (value: string) =>
  createHash('sha256').update(value).digest().readBigUInt64BE(0)

/** Simhash over word shingles: near-identical texts land a few bits apart; the original is not recoverable. */
const simhash = (words: string[]) => {
  const weights = Array.from({ length: Number(BITS) }, () => 0)
  for (let index = 0; index + SHINGLE <= words.length; index += 1) {
    const value = hash64(words.slice(index, index + SHINGLE).join(' '))
    for (let bit = 0n; bit < BITS; bit += 1n) {
      const slot = Number(bit)
      weights[slot] = (weights[slot] ?? 0) + ((value >> bit) & 1n ? 1 : -1)
    }
  }
  let print = 0n
  for (const [bit, weight] of weights.entries()) {
    if (weight > 0) {
      print |= 1n << BigInt(bit)
    }
  }
  return print
}

export const hamming = (left: bigint, right: bigint) => {
  let difference = left ^ right
  let count = 0
  while (difference) {
    count += Number(difference & 1n)
    difference >>= 1n
  }
  return count
}

const bands = (print: bigint) =>
  [0n, 16n, 32n, 48n].map((shift) => Number((print >> shift) & BAND_MASK))

export const isNear = (left: bigint, hex: string) =>
  hamming(left, BigInt(`0x${hex}`)) <= MAX_HAMMING

export const personalWords = async (userId: string) => {
  const [user] = await db
    .select({ name: users.name })
    .from(users)
    .where(eq(users.id, userId))
  return (user?.name ?? '').toLowerCase().split(/\s+/u)
}

/** Null for texts too short to tell a template from a coincidence. */
export const fingerprint = (body: string, personal: string[]) => {
  const words = tokens(body, personal)
  if (words.length < SHINGLE * 4) {
    return null
  }
  const print = simhash(words)
  const [band0 = 0, band1 = 0, band2 = 0, band3 = 0] = bands(print)
  return { band0, band1, band2, band3, print }
}

/** Fingerprints fake-personal mail (no List-Unsubscribe) and counts how many Fewmail users got a near copy. */
export const measureBulk = async (userId: string, incoming: Message[]) => {
  const candidates = incoming.filter(
    (message) =>
      !message.isFromMe &&
      !message.listUnsubscribe &&
      message.body.length >= MIN_BODY
  )
  if (candidates.length === 0) {
    return
  }
  const personal = await personalWords(userId)
  const userHash = userHashOf(userId)
  const since = subDays(new Date(), WINDOW_DAYS)

  for (const message of candidates) {
    const printed = fingerprint(message.body, personal)
    if (!printed) {
      continue
    }
    const { band0, band1, band2, band3, print } = printed
    // oxlint-disable-next-line eslint/no-await-in-loop -- each print must see the ones inserted before it
    const near = await db
      .select({ print: bulkPrints.print, userHash: bulkPrints.userHash })
      .from(bulkPrints)
      .where(
        and(
          gte(bulkPrints.createdAt, since),
          or(
            eq(bulkPrints.band0, band0),
            eq(bulkPrints.band1, band1),
            eq(bulkPrints.band2, band2),
            eq(bulkPrints.band3, band3)
          )
        )
      )
    const recipients = new Set(
      near.filter((row) => isNear(print, row.print)).map((row) => row.userHash)
    )
    if (!recipients.has(userHash)) {
      // oxlint-disable-next-line eslint/no-await-in-loop -- see above
      await db.insert(bulkPrints).values({
        band0,
        band1,
        band2,
        band3,
        print: print.toString(16),
        userHash,
      })
      recipients.add(userHash)
    }
    // oxlint-disable-next-line eslint/no-await-in-loop -- see above
    await db
      .update(messages)
      .set({ bulkCount: recipients.size })
      .where(eq(messages.id, message.id))
    message.bulkCount = recipients.size
  }
}
