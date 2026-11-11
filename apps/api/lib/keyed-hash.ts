import { createHmac } from 'node:crypto'

import { env } from '../env'

/**
 * Network features store only keyed hashes, so tables cannot be reversed by hashing known
 * addresses. Keyed with the auth secret: rotating it resets spam, zombie and bulk reputation.
 */
export const keyedHash = (value: string) =>
  createHmac('sha256', env.BETTER_AUTH_SECRET).update(value).digest('hex')

export const senderHashOf = (email: string) =>
  keyedHash(`sender:${email.trim().toLowerCase()}`)

export const userHashOf = (userId: string) => keyedHash(`user:${userId}`)

export const domainOf = (email: string) =>
  email.trim().toLowerCase().split('@')[1] ?? ''
