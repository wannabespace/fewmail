---
name: fewmail-ui
description: Fewmail's UI design system and hard rules — the "warm paper" look, three-level surfaces, serif-for-reading typography, keyboard-first flows, motion recipes and the kit's gotchas. Use whenever building, restyling or reviewing any UI in this repo (components, pages, popovers, menus, animations), before writing the first className.
---

# Fewmail UI

Fewmail is an email agent, not an email client: the person reads a brief and approves actions, the inbox is secondary. The look is **warm paper** — cream canvas, ink text, one terracotta accent, serif for anything the person *reads* (brief, drafts, headings), Inter for anything they *operate*. It must feel calm, and every action must be one key away. Built on the kit in `packages/ui` (React + Tailwind v4 + base-ui), inherited from Tamery's kit and re-themed; never copy Tamery's blue/Geist look back in.

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
3. **No `cursor-pointer`.** It is an app: `cursor-default` on controls and row-styled links.
4. **Kit-level fixes** in `packages/ui` for systemic sizing or color problems; page overrides only for page-specific design. Sizes via size props, never per-page `h-*` on kit components.
5. **No bare interactive icons.** Hover bg + color shift + tooltip, always.
6. **A className on a kit component is a missing prop.** Call sites pass `size`/`variant` and own only layout. Re-dialing a kit component's surface (padding, radius, background, border, font size, height) means the kit needs a variant. `shadcn/no-restyle` enforces it.
7. **`data-mask` on all user data**: sender names and addresses, subjects, summaries, bodies, drafts, rule text, amounts. App chrome never.
8. **Keyboard first, everywhere.** Every action on a screen has a single key (`J/K` move, `⏎` approve/open, `E` edit, `S` skip, `R` reply/redraft, `O` open, `/` search, `N` new), `G`-sequences navigate (`G T`, `G M`, `G R`, `G S`), `⌘K` reaches everything. Keys are registered with `useHotkey` from `@tanstack/react-hotkeys` — never `addEventListener`, never `onKeyDown` on containers. **Escape is a ladder**: it undoes the innermost state first (stop editing → blur field → close thread → clear search), one step per press.
9. **Shortcuts are visible.** A control that has a key shows it (`Kbd` inside the button) and each screen ends with `KeyHints` listing the keys that work there. Show only keys that fire in the current state (editing swaps the hints).
10. **The agent explains itself.** Anything the agent decided — importance, category, an action, an automatic archive — shows why (`reason`, the matched rule) on hover or inline. Nothing changes in Gmail silently: automatic actions are listed under "handled" and are reviewable.
11. **Reading text is serif, operating text is sans.** Brief, headlines, drafts and page titles use `font-serif`; buttons, rows, labels, metadata use the sans default. Never mix within one block.
12. **Minimum UI, full power.** Before adding a control, make an existing one smarter (parse input, infer, default). Two controls for one job is a review blocker. Prefer one strong primary action per card plus keys.
13. **A popup driven by nullable data closes with its fade** — copy the last non-null value into state and clear it in `onOpenChangeComplete(false)`, never `item && <Content>`.
