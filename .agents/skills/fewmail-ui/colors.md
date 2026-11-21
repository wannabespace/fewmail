# Colors & surfaces

All values are `oklch` tokens in `packages/ui/src/styles/globals.css`, defined for `:root` (paper) and `.dark` (warm ink). Hues stay warm (60–90) everywhere; a cool grey anywhere reads as a bug.

## Three levels

| Level | Tokens | Light | Use |
|---|---|---|---|
| 1 canvas | `bg-body` | cream `#F4EFE6` | App background, sidebar (naked, no card), login |
| 2 surface | `bg-background`, `bg-card` | `#FBF8F2` | Open thread pane, grouped settings |
| 3 elevated | `bg-popover`, `bg-input` | `#FFFDF8` | Queue cards, inputs, menus, choice cards |

- **A control on a row that opens as a whole is `ghost-tint` / `ghost-tint-muted`**, never `ghost` / `ghost-muted`: a `SettingsRow trigger` hovers to `bg-accent`, and a `ghost-muted` button on it hovered to that same fill, so the button never showed it was the thing under the pointer (the notice bar's `+N` and ×, the Board's done and forget).
- Cards and grouped boxes use `ring` (1px, `ring-foreground/6`) rather than `border`; the selected/focused card raises to `ring-foreground/10` + `shadow-sm`.
- Dividers inside a surface: `border-b`/`border-r` (token `--border`, warm ink at 12%).
- Dashed border (`border-dashed`) marks *passive* information: the "handled" summary, empty queue. Never on something clickable.

## Accent

- `--primary` is the brand's **wax** (`oklch(0.55 0.15 38)`, `#B84A27`), lighter in dark (wax 400). The brand names the rest paper, ink and linen; the full wax scale and the marketing-only colours are in `brand/README.md` and stay out of the app. Used for: the one primary button per card, the Home count badge, the unread dot leading a mail row, links, focus ring, "expects a reply".
- Never a second accent color. Categories are text labels, not colors — except **security**, which takes `text-destructive` (a `Shield01Icon` in mail rows, the `destructive` badge in the thread), so a sign-in alert or reset never blends into the rest.

## Importance

The `ImportanceDot` is the only place importance gets color: 3 urgent → `bg-destructive`, 2 needs you → `bg-primary`, 1 worth knowing → `bg-foreground/30`, 0 noise → hollow ring. Always paired with a tooltip carrying the label and the agent's reason. It marks rows in a list (Home's urgent cards, Worth knowing), never an open email's header: there the insight under it already says what the email is (the user's call: the dot beside the sender repeated the Security badge).

## Shadows

Shadows are tinted warm brown (`rgb(60 40 20 / …)`), never black, in light mode. `shadow-sm` is the lifted card (long soft drop); dark mode overrides the elevated tiers heavier. Use the scale, never inline `shadow-[…]`.

## Selection & secondary fills

In a card's rows (a list `Accordion`, a `SettingsRow trigger`) **the pointer's row is half the cursor's fill** (`hover:bg-accent/50`, the J / K row `bg-accent`, kept on hover): at the same fill, the row under the pointer and the cursor's read as two cursors.

`bg-secondary` (`#E6DDCE`-ish) is the warm chip/fill: secondary buttons, the active nav item, draft blocks (`bg-secondary/60`), agent analysis blocks (`bg-secondary/50`). On the canvas, hover/cursor (`bg-accent`, `#ECE4D8`) sits halfway between the canvas and `bg-secondary`, so the active item never reads as merely hovered — keep both steps visible when retuning.
