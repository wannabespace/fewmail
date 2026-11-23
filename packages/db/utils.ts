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
  fromDriver: (sealed) =>
    JSON.parse(decrypt({ encryptedText: sealed, secret })) as unknown,
  toDriver: (value) => encrypt({ secret, text: JSON.stringify(value) }),
})

export const encryptedJson = <T>() => encryptedJsonType().$type<T>()

/** Deterministic, so `eq`, `inArray`, unique indexes and `groupBy` work; never use it for free text, where equal ciphertexts reveal equal content. */
const searchableTextType = customType<{ data: string; driverData: string }>({
  dataType: () => 'text',
  fromDriver: (sealed) => decryptSearchable({ encryptedText: sealed, secret }),
  toDriver: (text) => encryptSearchable({ secret, text }),
})

export const searchableText = () => searchableTextType()

/** Deterministic per element, so `arrayContains` finds an address. drizzle-kit writes its column as `text` in a CREATE TABLE: make it `text[]` by hand, or its gin index fails to build. */
export const searchableTextArray = customType<{
  data: string[]
  driverData: string[]
}>({
  dataType: () => 'text[]',
  fromDriver: (values) =>
    values.map((sealed) =>
      decryptSearchable({ encryptedText: sealed, secret })
    ),
  toDriver: (values) =>
    values.map((text) => encryptSearchable({ secret, text })),
})
