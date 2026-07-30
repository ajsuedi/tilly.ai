# Tilly

**The AI salesforce for charity retail.**

Tilly is a CRM to prospect and close enterprise and self-service customers in one place. First market: charity retailers in the UK.

## Repo layout

| Path | What it is |
| --- | --- |
| `brand/` | Brand identity source — the brand guide and the direction explorations it came from |
| `design/` | Design infrastructure — [`styles.css`](design/styles.css) (design tokens + component classes) and [`index.html`](design/index.html) (live system reference) |

## The brand in one paragraph

One blue (`#0533F0`), flat squares, huge type, zero decoration. Instrument Sans is the human voice; IBM Plex Mono is the machine's — if it's mono, the AI said it. Radius is always 0. Shadows never. Blue is 100% or nothing, never a tint. Green and red are data-only. The mark is a donation slot: never rotated, outlined, rounded, or gradiented. Voice is declarative with full stops, numbers over adjectives, British spelling, and Tilly speaks in first person about her own work.

## Using the design system

Link the one stylesheet and build from its tokens and classes:

```html
<link rel="stylesheet" href="design/styles.css">
```

- Colours, fonts, and geometry come from `--tilly-*` and `--font-*` variables — never hard-code a hex the tokens carry.
- Components: `.btn` (primary / secondary / outline / text), `.input`, `.badge` (ai / fit / status / ready / won / lost), `.card` + `.card-header` + `.card-row`, `.avatar`, `.mark` + `.wordmark`, `.m-*` machine-voice text styles.
- Open `design/index.html` in a browser to see everything rendered.
