# Tilly

**The AI salesforce for charity retail.**

Tilly is a CRM for companies that prospect and sell into UK charity retailers — a market that is famously slow to adopt technology and needs constant support and coaching through both the sales and retention funnels. Tilly does the nurturing, educating and remembering; your team does the meetings. One CRM for both motions: enterprise contract deals and self-serve subscriptions.

Why the Formula 1 framing throughout: the sector buys slowly, and slow markets breed slow teams. The race format — grids, pit stops, safety cars, championships — deliberately injects pace *inside* the team while the funnel itself stays patient with the buyer. Fast on our side of the table, unhurried on theirs.

## For judges — the claims, and where they're real

> "Not a contact database. A CRM that thinks ahead of the rep."

| Claim | Working feature |
| --- | --- |
| Predictive scoring | Likelihood = `0.4×fit + 0.6×intent`, computed in [`app/app.js`](app/app.js); five F1 bands drive agent behaviour |
| Competitive market analysis | Win zone / Contested / Loss risk / Undercut verdict with a recommended play on every dossier |
| Next-best action | "Your next step" panel on every deal — the action, the clock, the why, the owner |
| Auto-enriched records | Org/contact intelligence, live signals, freshness rules, media monitor with reach-out angles |
| As agentic as possible | Permission tiers T0–T3, autonomous sends, eight escalation triggers, an audit-logged activity radio |

Three surfaces, one demo bar: self-serve signup (with checkout + guided tour), enterprise sign-in, and the CRM itself. Demo script in [DEMO.md](DEMO.md).

## Repo layout

| Path | What it is |
| --- | --- |
| `brand/` | Brand identity source — the brand guide and the direction explorations it came from |
| `design/` | Design infrastructure — [`styles.css`](design/styles.css) (design tokens + component classes) and [`index.html`](design/index.html) (live system reference) |
| `app/` | The CRM — clickable prototype implementing the full workflow. Open [`app/index.html`](app/index.html) in a browser; no build step, no dependencies |
| `docs/` | Architecture reference — [`crm-workflow.html`](docs/crm-workflow.html), the workflow the app implements |

## The CRM in one pass

Read the app the way you read the build spec, top to bottom: **Channels** capture (nine sources, one record, no manual entry) and auto-enrich on a freshness-governed cadence. The **intelligence core** scores every record twice — fit (slow-moving, weighted features) × intent (fast-moving, half-life decay) — blends them (`0.4×fit + 0.6×intent`), assigns an F1 band (Pole → Cold), and routes by **complexity score** into one of three lanes: self-serve (0–24), assisted (25–54), enterprise (55–130). **Enterprise** adds tender intake with a bid/no-bid gate; **Engage** stamps every push with its authority — agent tier (T0–T3) for content, Green/Amber/Red document tier for proposals and contracts, discount ladder enforced. Tilly owns every journey until one of **eight escalation triggers** fires, each with a threshold and named handoff. Outcomes race on the **Cockpit** — points = stage × band multiplier + bonuses − penalties, weekly races, quarterly seasons, a team objective so the board never goes zero-sum. The scoring blend, bands and lane routing are genuinely computed in `app/app.js`; all figures are illustrative placeholders.

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
