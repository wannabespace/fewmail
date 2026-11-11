import { decrypt, encrypt } from '@fewmail/shared/crypto-node'
import { customType } from 'drizzle-orm/pg-core'

import { env } from './env'

const encryptedTextType = customType<{ data: string; driverData: string }>({
  dataType: () => 'text',
  fromDriver: (encryptedText) =>
    decrypt({ encryptedText, secret: env.ENCRYPTION_SECRET }),
  toDriver: (text) => encrypt({ secret: env.ENCRYPTION_SECRET, text }),
})

export const encryptedText = (name?: string) =>
  name === undefined ? encryptedTextType() : encryptedTextType(name)
