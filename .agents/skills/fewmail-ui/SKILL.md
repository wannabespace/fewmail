---
name: fewmail-ui
description: Fewmail's UI design system and hard rules — the "warm paper" look, three-level surfaces, serif-for-reading typography, keyboard-first flows, motion recipes and the kit's gotchas. Use whenever building, restyling or reviewing any UI in this repo (components, pages, popovers, menus, animations), before writing the first className.
---

# Fewmail UI

Fewmail is an email agent, not an email client: the person sees what needs them and approves actions, the inbox is secondary. The look is **warm paper** — cream canvas, ink text, one terracotta accent, serif for anything the person *reads* (summaries, drafts, headings), Inter for anything they *operate*. It must feel calm, and every action must be one key away. Built on the kit in `packages/ui` (React + Tailwind v4 + base-ui), inherited from Tamery's kit and re-themed; never copy Tamery's blue/Geist look back in.

Topic files — read what the task touches; record new decisions in the matching file:

| File | When |
|---|---|
| [colors.md](colors.md) | Colors, surfaces, shadows, importance colors |
| [typography.md](typography.md) | Fonts, type scale, reading vs operating text, row heights, radius |
| [patterns.md](patterns.md) | Controls, menus, lists, panes, tooltips, toasts, icons, forms |
| [motion.md](motion.md) | Any animation |
| [gotchas.md](gotchas.md) | Before debugging kit components |

## Hard rules

0. **Search the registry before writing markup.** `pnpm dlx shadcn@latest search @shadcn -q <term>`. A `div` stack re-implementing a registry component (`Item`, `Empty`, `InputGroup`, `Field`, `ButtonGroup`…) is a review blocker. Missing from `packages/ui` → vendor it, rewrite imports to kit conventions, then use. Settings-like lists use `SettingsGroup`/`SettingsRow`.
1. **No `dark:` selectors.** Theme tokens resolve in both themes (`globals.css` `:root` / `.dark`). Several call sites dialing their own alpha on one token = the token is wrong.
2. **No pixel font sizes.** Tokens only (`text-2xs`…`text-base`, `text-brief`, `text-display`); a missing size gets a rem token in `@theme`.
3. **`cursor-pointer` on everything clickable** — controls, menu items and row-styled links.
4. **Kit-level fixes** in `packages/ui` for systemic sizing or color problems; page overrides only for page-specific design. Sizes via size props, never per-page `h-*` on kit components.
5. **No bare interactive icons.** Hover bg + color shift + tooltip, always.
6. **A className on a kit component is a missing prop.** Call sites pass `size`/`variant` and own only layout. Re-dialing a kit component's surface (padding, radius, background, border, font size, height) means the kit needs a variant. `shadcn/no-restyle` enforces it.
7. **`data-mask` on all user data**: sender names and addresses, subjects, summaries, bodies, drafts, rule text, amounts. App chrome never.
8. **Keyboard first, everywhere.** Every action on a screen has a single key (`J/K` move, `⏎` approve/open, `E` edit, `S` skip, `R` reply/redraft, `O` open, `/` or ⌘F search, `N` new), `G`-sequences navigate (`G H`, `G M`, `G R`, `G S`), `⌘K` reaches everything. Keys are registered with `useHotkey` from `@tanstack/react-hotkeys` — never `addEventListener`, never `onKeyDown` on containers. **A list's cursor shows only once the user starts it**: nothing is lit on arrival, the first `J`/`K` (or `↓`/`↑`) lands on the first row and a click puts it on the clicked one; keys that act on the cursor row (`⏎`, `S`, `E`, `Space`…) do nothing until then, list-wide keys (`T`, `⌘A`) still work. A row lit before any key reads as `⏎`'s target nobody picked. A list may come back to the row the user last opened (Reading), never to a default one. **Escape is a ladder**: it undoes the innermost state first (stop editing → blur field → close thread → clear search → clear picks), one step per press.
9. **Shortcuts show only while ⌘ is held, and nothing moves when they do.** A control that has a key carries it in its tooltip (`Button`/`IconButton` `shortcut`), never in its label, so on ⌘ hold the tooltips open with the glyph alone (`patterns.md`). Each screen ends with `KeyHints` listing the keys that work there; it stays hidden until ⌘ (Ctrl elsewhere) has been held alone for 800ms and then lies over the page's last 44px instead of pushing it. `ShortcutRevealObserver` (mounted in `__root.tsx`) sets `data-shortcuts-revealed` on `<html>` for that; an inline `Kbd` with no control to hang a tooltip on (a field's end slot, the end of a row) and the palette footer show only under it too. A `Kbd` inside a tooltip or a menu row's shortcut slot always shows; a keycap is content and always shows. Show only keys that fire in the current state (editing swaps the hints). Global keys never repeat there: `⌘K` already sits in the sidebar search's tooltip. Sidebar nav rows are the exception: they show their count as muted `tabular-nums` (Home's queue, Mail's unread inbox; one look for both, a filled badge was too loud beside a text count) and swap to their `G`-sequence only once ⌘ (Ctrl elsewhere) has been held alone for 800ms (`useModifierHold`, the same delay as tooltip key reveals) — an instant swap flickers on every ⌘ shortcut.
10. **The agent explains itself.** Anything the agent decided — importance, category, an action, an automatic archive — shows why (`reason`, the matched rule) on hover or inline. Nothing changes in Gmail silently: automatic actions are listed under "handled" and are reviewable.
11. **Reading text is serif, operating text is sans.** Headlines, lead paragraphs, drafts and page titles use `font-serif`; buttons, rows, labels, metadata use the sans default. Never mix within one block.
12. **Minimum UI, full power.** Before adding a control, make an existing one smarter (parse input, infer, default). Two controls for one job is a review blocker. Prefer one strong primary action per card plus keys.
13. **A popup driven by nullable data closes with its fade** — copy the last non-null value into state and clear it in `onOpenChangeComplete(false)`, never `item && <Content>`.
14. **Every navigation row and command carries an icon.** Sidebar rows, ⌘K items, menu items and action buttons lead with a Hugeicons glyph ([patterns.md](patterns.md) → icons); a text-only row reads as unfinished. One concept keeps one glyph on every surface (nav `icon` in `NAV_ITEMS` is reused by ⌘K). Only option lists (radio-like choices, filter operators) stay icon-less.
15. **One size, one silhouette.** Controls of the same size tier (buttons, icon buttons, inputs, input groups, selects, comboboxes, number fields) render the same outer height, radius and shadow, so any two sit in one row without a seam: `default`/`icon` 32px `rounded-xl`, `sm`/`icon-sm` 28px `rounded-lg`, `xs`/`icon-xs` 24px `rounded-md`, `lg`/`icon-lg` 36px `rounded-xl`, all `shadow-xs`. The hairline is a 1px `border` inside the box, never an outer `ring`, which adds 2px to the silhouette. A control that only looks like a field (the sidebar's search trigger) is a kit `Button`, never a hand-styled `button`.
16. **Web and desktop are one design.** The desktop app shows the web app, so every screen, control, spacing and color looks the same in both; a change lands on both or on neither. Only what the platform owns may differ — the native title bar, native context menus, text selection — and never the layout or look of a page. A `desktop`-only className or branch that restyles a page is a review blocker.
