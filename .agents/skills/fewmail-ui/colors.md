# Colors & surfaces

All values are `oklch` tokens in `packages/ui/src/styles/globals.css`, defined for `:root` (paper) and `.dark` (warm ink). Hues stay warm (60–90) everywhere; a cool grey anywhere reads as a bug.

## Three levels

| Level | Tokens | Light | Use |
|---|---|---|---|
| 1 canvas | `bg-body` | cream `#F4EFE6` | App background, sidebar (naked, no card), onboarding/login |
| 2 surface | `bg-background`, `bg-card` | `#FBF8F2` | Open thread pane, grouped settings |
| 3 elevated | `bg-popover`, `bg-input` | `#FFFDF8` | Queue cards, inputs, menus, choice cards |

- Cards and grouped boxes use `ring` (1px, `ring-foreground/6`) rather than `border`; the selected/focused card raises to `ring-foreground/10` + `shadow-sm`.
- Dividers inside a surface: `border-b`/`border-r` (token `--border`, warm ink at 12%).
- Dashed border (`border-dashed`) marks *passive* information: the "handled" summary, empty queue. Never on something clickable.

## Accent

- `--primary` terracotta (`oklch(0.55 0.15 38)`, ≈ `#B8431F`), lighter in dark. Used for: the one primary button per card, the Today count badge, the unread dot leading a mail row, the selected card's index chip, links, focus ring, "expects a reply".
- Never a second accent color. Categories are text labels, not colors.

## Importance

The `ImportanceDot` is the only place importance gets color: 3 urgent → `bg-destructive`, 2 needs you → `bg-primary`, 1 worth knowing → `bg-foreground/30`, 0 noise → hollow ring. Always paired with a tooltip carrying the label and the agent's reason.

## Shadows

Shadows are tinted warm brown (`rgb(60 40 20 / …)`), never black, in light mode. `shadow-sm` is the lifted card (long soft drop); dark mode overrides the elevated tiers heavier. Use the scale, never inline `shadow-[…]`.

## Selection & secondary fills

`bg-secondary` (`#EFE7DA`-ish) is the warm chip/fill: secondary buttons, the active nav item, draft blocks (`bg-secondary/60`), agent analysis blocks (`bg-secondary/50`).

## Charts

Boards draw with the EvilCharts registry (`packages/ui/src/components/evilcharts`, Recharts underneath), wrapped once in `apps/web/src/components/board-chart.tsx`. Every series is the one accent, `var(--primary)`; a pie steps that accent's strength (`color-mix` toward transparent) instead of adding hues, since a second color would read as a category. A chart sits in a `bg-card` ring card with its title in sans and a ghost settings `IconButton` opening its editor popover.
