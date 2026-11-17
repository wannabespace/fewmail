// Tauri's `beforeDevCommand` / `beforeBuildCommand`: the few strings the app shows itself (the update prompt), in every
// locale, from the web's own messages, for `src-tauri/src/lib.rs` to include.
import { messages } from '@fewmail/shared/i18n'

const strings = Object.fromEntries(
  Object.entries(messages).map(([locale, t]) => [
    locale,
    {
      available: t.update.available,
      notNow: t.today.hint.notNow,
      reload: t.update.reload,
    },
  ])
)
await Bun.write(
  new URL('../src-tauri/strings.json', import.meta.url),
  JSON.stringify(strings)
)
