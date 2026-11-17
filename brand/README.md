# Fewmail brand

The mark is a **bird**: a round, smiling carrier bird with a small beak, drawn as one solid shape with the eye and smile cut out, so it is always a single colour: wax on light grounds, wax 400 on dark. It is the agent: friendly, quick, and it brings you only the few emails that matter. The wordmark is Baloo 2 ExtraBold, lowercase, tracking -0.02em, outlined so no font is needed to show it.

## Files

| File | Use |
| --- | --- |
| `logo/mark.svg`, `logo/mark-dark.svg`, `logo/mark-512.png` | The bird alone, for light or dark grounds. |
| `logo/mark-happy.svg` | The bird with a happy, arched eye: the logo's hover state. |
| `logo/mark-sleeping.svg` | The bird asleep with two z's: an empty mail list. |
| `logo/wordmark.svg`, `logo/wordmark-dark.svg` | The word alone. |
| `logo/lockup.svg`, `logo/lockup-dark.svg` (+ `.png`) | Bird and wordmark together. The default logo. |
| `logo/favicon.svg` | The bird, wax in a light browser and wax 400 in a dark one. |
| `icon/app-icon.svg`, `icon/app-icon-1024.png` | App icon: the wax 400 bird on an ink tile, full bleed. The OS masks it (iOS squircle, Android shapes), so it never carries its own rounded corners. |
| `icon/app-icon-macos.svg`, `icon/app-icon-macos-1024.png` | The desktop app's icon: the wax bird on a paper tile, on Apple's macOS grid (824px rounded square with its shadow inside a 1024px canvas), since macOS draws icons as they are; Windows and Linux use it too. `tauri icon` in `apps/desktop` turns the PNG into `src-tauri/icons`. |
| `avatar/*.svg` (+ 1024px `.png`) | Social avatars, full bleed with the bird inside the circle crop: `wax-on-paper`, `paper-on-wax` (the default), `wax-on-night`, `happy` (launches, good news), `sleeping` (holidays, downtime), and `postmark`, `sage` from the marketing colours. |
| `og/og.html` → `og/og.png` | The 1200×630 social card, also copied to `apps/web/public/og.png`. |

In the web app: `apps/web/src/components/logo.tsx` (the bird and wordmark outlines inline in `text-primary`, so they lighten in dark), `apps/web/public/favicon.svg` and `apple-touch-icon.png` (the app icon at 180px).

Run `./export.sh` after changing any source here: it renders every PNG with headless Chrome and copies the favicon, touch icon and OG card into `apps/web/public`. Never edit a PNG by hand.

## Using the logo

- Clear space around the lockup: half the bird's height on every side.
- Smallest sizes: the bird at 16px, the lockup at 80px wide.
- One colour only: wax (`#B84A27`) on light, wax 400 (`#E4744B`) on dark; ink or white only where colour cannot print. Never two colours, a gradient, an outline or a rotation.
- The wordmark is always lowercase, `fewmail`; in running text the name is Fewmail.

## Colour: wax, paper and ink

Paper and ink carry about 90% of any surface; wax appears only where a decision is (one primary action, the "needs you" dot, links, focus).

| Name | Hex | Role |
| --- | --- | --- |
| Wax | `#B84A27` · `oklch(0.55 0.15 38)` | `--primary`. 4.5:1 on paper, cream text on it 5:1. |
| Paper | `#F3EEE5` / `#FBF9F4` / `#FFFDFA` | Canvas, surface, raised card. Always warm; a cool grey reads as a bug. |
| Ink | `#1E1A15`, muted `#6B6157` | Text (15:1) and secondary text (5.2:1). Never `#000`. |
| Linen | `#E6DDCE` | Secondary buttons, chips, draft blocks. |
| Night paper | `#171310` / `#1D1915` | Dark canvas and surface. |
| Cream ink | `#F2EEE7` | Text on dark. |

Wax scale:

| 50 | 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `#FFF0E8` | `#FFDCCC` | `#FCBDA4` | `#F19773` | `#E4744B` | `#CA5831` | `#B84A27` | `#983D21` | `#812E17` | `#5B2012` |

400 is the primary in dark mode (6:1 on night paper); 700 is for small terracotta text on the canvas (6:1).

Marketing only (site illustrations, social, slides), never in the app, which keeps one accent: Postmark `#345C7D`, Sage `#778F6A`, Manila `#E1C38B`.

## Type

| Face | Where | Why |
| --- | --- | --- |
| Baloo 2 | Wordmark only, outlined | Round and warm like the bird. |
| Lora (variable) | Headlines and everything the person reads | Warm, calligraphic, comfortable at length, full Cyrillic. |
| Inter (variable) | Everything the person operates | Neutral, dense, Cyrillic. |

All three are SIL Open Font License.
