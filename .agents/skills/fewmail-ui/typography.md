# Typography, density & radius

- Fonts (fontsource, imported in `globals.css`): **Inter Variable** (`font-sans`, default) for operating UI; **Lora Variable** (`font-serif`, also `--font-heading`) for reading. Mono is the system stack, rarely needed. The logo's Literata is outlined and never loaded (`brand/README.md`).
- Reading scale: `text-display` (2.5rem/1.1) page titles and Home's headline, always `font-serif tracking-tight`; `text-brief` (1.1875rem/1.55, named for the old daily brief) lead and intro paragraphs; drafts render at `text-base/relaxed` serif.
- Operating scale: `text-sm` rows, buttons, nav; `text-xs` metadata, key hints, section labels (`text-muted-foreground text-xs font-medium`, sentence case — no uppercase tracking headers); `text-2xs` micro only.
- **A row's title and description are two blocks, not one paragraph**: kit `ItemDescription` is `text-sm/snug` and `ItemContent` keeps `gap-1` at every size but `xs`, so a two-line description reads as one unit set apart from its title. A call site wrapping the description in a span never sets `text-sm` again, which would reset the leading.
- Content column: reading screens (Home, Rules, Settings) cap at `max-w-3xl` with `px-10 pt-12`; the thread reader caps at `max-w-2xl`.
- Heights: nav rows `h-8`; key-hint footer `h-11`; buttons through size props (`sm` inside cards, default in forms, `lg` on login/onboarding).
- Radius: `--radius` 0.55rem (rounder than Tamery). Queue and choice cards `rounded-2xl` (a dense grid of small choice cards `rounded-xl` with `p-3`); inner blocks (draft, analysis) `rounded-xl`; nav items and inputs `rounded-lg`.
- `tabular-nums` on counts and times in lists.
- Cyrillic: both Lora and Inter draw it, so Ukrainian sets in the same faces as English.
- CJK: Lora and Inter have no CJK glyphs, so ja/zh/ko fall back to system fonts; `globals.css` sets `word-break: auto-phrase` on `:lang(ja|zh|ko)` so display headlines break at phrase boundaries. `<html lang>` follows `localeStore`.
- Every user-visible string comes from `useT()`; never hard-code copy in a component. Labels must survive ~40% longer text (German) and stay short in key hints.
