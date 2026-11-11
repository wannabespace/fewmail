import process from 'node:process'

import { setupPortlessEnvs } from '@fewmail/shared/portless-env'
import { type } from 'arktype'

if (process.env.NODE_ENV === 'development') {
  setupPortlessEnvs({
    API_URL: 'api.local.fewmail',
    WEB_URL: 'app.local.fewmail',
  })
}

// A Railway reference to a variable that is not set on `api` arrives as "", which would fail
// optional formats like `string.numeric`: treat it as unset.
export const env = type({
  API_URL: 'string.url',
  BETTER_AUTH_SECRET: 'string',
  GOOGLE_CLIENT_ID: 'string',
  GOOGLE_CLIENT_SECRET: 'string',
  'GMAIL_PUSH_SECRET?': 'string',
  'GMAIL_PUSH_TOPIC?': 'string',
  'MISTRAL_API_KEY?': 'string',
  OPENROUTER_API_KEY: 'string',
  'PORT?': 'string.numeric.parse',
  'STRIPE_PRICE_ID?': 'string',
  'STRIPE_SECRET_KEY?': 'string',
  'STRIPE_WEBHOOK_SECRET?': 'string',
  'TELEGRAM_BOT_TOKEN?': 'string',
  'TYPESAFE_API_KEY?': 'string',
  'TELEGRAM_BOT_USERNAME?': 'string',
  'TELEGRAM_WEBHOOK_SECRET?': 'string',
  'VAPID_PRIVATE_KEY?': 'string',
  'VAPID_PUBLIC_KEY?': 'string',
  WEB_URL: 'string.url',
  'WHATSAPP_APP_SECRET?': 'string',
  'WHATSAPP_NUMBER?': 'string.numeric',
  'WHATSAPP_PHONE_NUMBER_ID?': 'string',
  'WHATSAPP_TEMPLATE?': 'string',
  'WHATSAPP_TOKEN?': 'string',
  'WHATSAPP_VERIFY_TOKEN?': 'string',
}).assert(
  Object.fromEntries(Object.entries(process.env).filter(([, value]) => value))
)
