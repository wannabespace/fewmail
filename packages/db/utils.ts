import {
  decrypt,
  decryptSearchable,
  encrypt,
  encryptSearchable,
} from '@fewmail/shared/crypto-node'
import { customType } from 'drizzle-orm/pg-core'

import { env } from './env'

const secret = env.ENCRYPTION_SECRET

const encryptedTextType = customType<{ data: string; driverData: string }>({
  dataType: () => 'text',
  fromDriver: (encryptedText) => decrypt({ encryptedText, secret }),
  toDriver: (text) => encrypt({ secret, text }),
})

export const encryptedText = (name?: string) =>
  name === undefined ? encryptedTextType() : encryptedTextType(name)

const encryptedJsonType = customType<{ data: unknown; driverData: string }>({
  dataType: () => 'text',
  fromDriver: (encryptedText) =>
    JSON.parse(decrypt({ encryptedText, secret })) as unknown,
  toDriver: (value) => encrypt({ secret, text: JSON.stringify(value) }),
})

export const encryptedJson = <T>() => encryptedJsonType().$type<T>()

/** Deterministic, so `eq`, `inArray`, unique indexes and `groupBy` work; never use it for free text, where equal ciphertexts reveal equal content. */
const searchableTextType = customType<{ data: string; driverData: string }>({
  dataType: () => 'text',
  fromDriver: (encryptedText) => decryptSearchable({ encryptedText, secret }),
  toDriver: (text) => encryptSearchable({ secret, text }),
})

export const searchableText = () => searchableTextType()

/** Deterministic per element, so `arrayContains` finds an address. */
export const searchableTextArray = customType<{
  data: string[]
  driverData: string[]
}>({
  dataType: () => 'text[]',
  fromDriver: (values) =>
    values.map((encryptedText) => decryptSearchable({ encryptedText, secret })),
  toDriver: (values) =>
    values.map((text) => encryptSearchable({ secret, text })),
})
