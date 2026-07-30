# Tilly — 3-minute demo script

Run `npm run dev` and open http://localhost:3000 (or open `public/app/index.html` directly). The black **DEMO** bar at the top switches between the three surfaces at any time.

## 1. Self-serve signup (~45s)

DEMO bar → **SELF-SERVE SIGN-UP**.

- "Tilly is a CRM for companies selling into UK charity retail — a market that buys slowly and needs coaching. Signup takes two minutes."
- Enter any email → **Start prospecting** → type any 6 digits (test mode banner explains the proxy) → **Verify**.
- Skim the About/Company steps — point out the sell-into categories and the coaching goals.
- **Plan step**: flip the annual/monthly toggle (price reprices live), then **Continue to payment**.
- **Checkout**: bump seats with +/−, note VAT and "first charge when the trial ends", **Start trial**.
- **Welcome** → **Let's go** launches the guided tour.

## 2. The guided tour → the CRM (~60s)

- Let the tour run 2–3 steps ("here's where you do this"), then **skip** — shows onboarding for slow-adopting users.
- **Cockpit**: the starting grid — everything needing a human, tightest clock first, enterprise vs self-serve. Expand a row → exact action items. Click the **POLE — HOT LEADS** tile → pre-filtered pipeline.
- **Pipeline**: toggle **▦ BOARD** and drag a card between stages — the audit line lands on Tilly's Radio. Open any deal → **stage tracker + "Your next step"** with the why and the clock.
- Hover a **POLE** chip — the model explains itself. Likelihood is computed: `0.4×fit + 0.6×intent`.

## 3. The moat: Success + Ask Tilly (~45s)

- **Success**: health telemetry with computed flag escalation, the **safety car** freezing commercial motions, the **churn radar** routing enterprise risk to QBRs and self-serve risk to a courtesy connect **or a gift in the post**. Play an **explainer video** inline — coaching, not marketing.
- Click **ASK TILLY** (bottom right): ask "why is YMCA at risk?" — routed answer with a take-me-there link; ask something absurd — she says "I don't know" and gets a human. Disclosed AI, per the CS spec.

## Closing line

"Everything you saw runs from two specs in `docs/` — predictive scoring, competitive verdicts, next-best action, auto-enrichment, and agents that act, not suggest. The F1 framing is deliberate: race pace inside the team, patience with a market that buys slowly."
