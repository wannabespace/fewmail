// Bundled by build.rs and run in JavaScriptCore (src/i18n.rs), so the app speaks the web's own messages.
import { messages } from '@fewmail/shared/i18n'
import { LOCALES, matchLocale } from '@fewmail/shared/i18n/locales'

Object.assign(globalThis, { LOCALES, matchLocale, messages })
