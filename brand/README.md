# Fewmail brand

The mark is a **wax seal**. Terracotta is the colour of sealing wax, and a sealed letter is the product's promise: nothing leaves or changes in your mail without your yes. The letter on the seal (weight 800) and the wordmark (weight 700, tracking -0.04em) are Literata, outlined, so no font is needed to show them.

## Files

| File | Use |
| --- | --- |
| `logo/seal.svg`, `logo/seal-512.png` | The mark, in full colour (wax gradient, debossed f). Default everywhere from 24px up. |
| `logo/seal-flat.svg`, `logo/seal-flat-512.png` | Flat terracotta with a cream f: favicons, anything under 24px, one-colour print. |
| `logo/seal-mono.svg` | One colour (ink) with the f cut out: stamps, embossing, monochrome contexts. |
| `logo/wordmark.svg`, `logo/wordmark-cream.svg` | The word alone, ink for light grounds, cream for dark. |
| `logo/lockup.svg`, `logo/lockup-cream.svg` (+ `.png`) | Seal and wordmark together. The default logo. |
| `icon/app-icon.svg`, `icon/app-icon-1024.png` | App icon: the seal on warm paper, full bleed. The OS masks it (iOS squircle, Android shapes), so it never carries its own rounded corners. |
| `og/og.html` → `og/og.png` | The 1200×630 social card, also copied to `apps/web/public/og.png`. |

In the web app: `apps/web/src/components/logo.tsx` (`apps/web/public/seal.svg` as an image, the wordmark outline inline in `currentColor`), `apps/web/public/favicon.svg` (the flat seal) and `apple-touch-icon.png` (the app icon at 180px).

Run `./export.sh` after changing any source here: it renders every PNG with headless Chrome and copies the seal, favicon, touch icon and OG card into `apps/web/public`. Never edit a PNG by hand.

## Using the logo

- Clear space around the lockup: the height of the seal's f on every side.
- Smallest sizes: the full-colour seal at 24px, the flat seal at 16px, the lockup at 96px wide.
- The seal is never recoloured, rotated, outlined or set on a busy photo. On terracotta, use the mono seal in cream.
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

Wax scale (the seal's gradient runs 400 → 600 → 800; the UI uses wax flat):

| 50 | 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `#FFF0E8` | `#FFDCCC` | `#FCBDA4` | `#F19773` | `#E4744B` | `#CA5831` | `#B84A27` | `#983D21` | `#812E17` | `#5B2012` |

400 is the primary in dark mode (6:1 on night paper); 700 is for small terracotta text on the canvas (6:1).

Marketing only (site illustrations, social, slides), never in the app, which keeps one accent: Postmark `#345C7D`, Sage `#778F6A`, Manila `#E1C38B`.

## Type

| Face | Where | Why |
| --- | --- | --- |
| Literata | Logo only, outlined | A bookish serif with a firm, modern build; kept for the mark so the reading face can stay softer. |
| Lora (variable) | Headlines and everything the person reads | Warm, calligraphic, comfortable at length, full Cyrillic. |
| Inter (variable) | Everything the person operates | Neutral, dense, Cyrillic. |

All three are SIL Open Font License.
