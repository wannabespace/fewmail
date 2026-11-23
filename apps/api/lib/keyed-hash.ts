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

export const trialHashOf = (email: string) =>
  keyedHash(`trial:${email.trim().toLowerCase()}`)

export const userHashOf = (userId: string) => keyedHash(`user:${userId}`)

export const domainHashOf = (domain: string) => keyedHash(`domain:${domain}`)

export const linkHashOf = (domain: string) => keyedHash(`link:${domain}`)

export const infraHashOf = (block: string) => keyedHash(`infra:${block}`)

export const paymentHashOf = (detail: string) => keyedHash(`pay:${detail}`)

export const domainOf = (email: string) =>
  email.trim().toLowerCase().split('@')[1] ?? ''

/** Per user, so the same word in two people's mail never shares a hash; 64 bits keep a mailbox's index small. */
export const searchTokenHashOf = (userId: string, prefix: string) =>
  keyedHash(`search:${userId}:${prefix}`).slice(0, 16)
