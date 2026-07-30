/* Tilly CRM — mock data model, aligned to the build spec (docs/crm-workflow.html).
   Records carry raw inputs only: fit, intent, complexity. Likelihood, band and
   lane are COMPUTED in app.js per the spec — §4.3 blend, §4.4 bands, §6.2 lanes.
   Figures are illustrative placeholders. */

const DATA = {
  records: [
    {
      id: 'sue-ryder', name: 'Sue Ryder Retail', initials: 'SR',
      charityNo: '1052076', incomeBand: '£10m–£100m', cause: 'Palliative care', staff: 2900, shops: 400,
      fit: 92, intent: 70, complexity: 58, stage: 'Engaged', tier: 'T1',
      channel: 'SDR outreach',
      explain: ['Income band in the target sweet spot', 'Buying committee complete — finance, ops, digital', 'Reply depth: threaded exchange in progress'],
      contact: { name: 'Rachel Holt', role: 'Director of Retail Operations', tenure: '2 yrs 3 mo', note: 'Moved from BHF retail in 2024. Posts about Gift Aid digitisation.' },
      signals: ['Opening 4 shops in the North West', 'Hiring a retail systems manager', 'Warm intro found via trustee network'],
      verdict: { type: 'WIN ZONE', vs: 'Legacy EPOS incumbent', play: 'Lead on differentiators, hold price.' },
      trace: ['sue_ryder: 4 new shops, north west', 'complexity 58 — enterprise lane, rep-owned', 'drafting outreach — email, tuesday 09:10'],
      escalation: null, state: null,
      nextAction: 'Send drafted outreach'
    },
    {
      id: 'barnardos', name: "Barnardo's Trading", initials: 'BT',
      charityNo: '216250', incomeBand: '£100m+', cause: 'Children', staff: 8000, shops: 600,
      fit: 82, intent: 66, complexity: 65, stage: 'Proposal', tier: 'T2',
      channel: 'Events',
      explain: ['Tech stack compatible — no blocking incumbent', 'Multi-contact activity: 3 people from the org', 'Pre-sales question raised on Gift Aid evidence'],
      contact: { name: 'Marcus Webb', role: 'Head of Trading', tenure: '5 yrs 1 mo', note: 'Met at Charity Retail Conference. Asked about Gift Aid uplift evidence.' },
      signals: ['Gift Aid uplift fits FY27 goals', 'Reviewing store tech stack', 'Board paper on retail digitisation due Q4'],
      verdict: { type: 'UNDERCUT', vs: 'Build in-house', play: 'Priced move within the discount ladder — in-house quoted 18 months, we deploy in 3 weeks.' },
      trace: ['barnardos: proposal auto-drafted from stated requirements', 'document tier AMBER — sales lead approval, 1 working day', 'gift_aid_uplift: 12% modelled on their volumes'],
      escalation: null, state: null,
      nextAction: 'Route proposal for approval'
    },
    {
      id: 'bhf', name: 'British Heart Foundation Shops', initials: 'BH',
      charityNo: '225971', incomeBand: '£100m+', cause: 'Health research', staff: 4200, shops: 700,
      fit: 88, intent: 78, complexity: 120, stage: 'Tender', tier: 'T2',
      channel: 'Tender & RFP watch',
      explain: ['Live tender matched at 78% capability', 'Funding health: reserves above 6 months', 'Buying committee mapped — 14 decision makers'],
      contact: { name: 'Amara Osei', role: 'Retail Transformation Lead', tenure: '11 mo', note: 'New in role — came from grocery retail. Values hard numbers.' },
      signals: ['Live RFP: EPOS & CRM replacement', 'Deadline 22 Aug 2026', '14 decision makers mapped'],
      verdict: { type: 'WIN ZONE', vs: 'Two enterprise CRM vendors', play: 'Only bid with charity-retail-specific scoring. Hold price, lead on fit.' },
      trace: ['bhf: rfp captured from find a tender service', 'bid gate: mandatories 100% · scored coverage 78% — BID', 'response 60% drafted · hot-lead clock running'],
      escalation: null, state: null,
      nextAction: 'Complete bid response'
    },
    {
      id: 'cruk', name: 'Cancer Research UK Trading', initials: 'CR',
      charityNo: '1089464', incomeBand: '£100m+', cause: 'Health research', staff: 3900, shops: 570,
      fit: 79, intent: 88, complexity: 80, stage: 'Negotiation', tier: 'HUMAN',
      channel: 'ABM campaigns',
      explain: ['Meeting held — reply depth at maximum', 'Multi-year contract on the table', 'Demo request inside 30-day half-life'],
      contact: { name: 'Daniel Price', role: 'Commercial Director', tenure: '6 yrs 8 mo', note: 'Negotiates hard. Prefers calls over email.' },
      signals: ['Multi-year contract on the table', 'Procurement requested security review', 'Deal value £340k over 3 years'],
      verdict: { type: 'WIN ZONE', vs: 'Incumbent renewal', play: 'Incumbent expires Oct. Switching-cost objection cleared — hold terms.' },
      trace: ['cruk: deal value £340k exceeds enterprise threshold', 'ESCALATED — named rep owns it, agent stays as researcher', 'contract tier RED — legal, 3 working days'],
      escalation: 'Deal value above threshold', state: null,
      nextAction: 'Human owner: final terms call'
    },
    {
      id: 'mind', name: 'Mind Retail', initials: 'MR',
      charityNo: '219830', incomeBand: '£10m–£100m', cause: 'Mental health', staff: 1100, shops: 170,
      fit: 74, intent: 62, complexity: 20, stage: 'Trial', tier: 'T1',
      channel: 'Organic content',
      explain: ['Video completion: 92% of activation clip', 'Pricing page: 4 visits in 14 days', 'Two colleagues invited — multi-contact activity'],
      contact: { name: 'Jess Fielding', role: 'Retail Development Manager', tenure: '3 yrs 4 mo', note: 'Found us via the Gift Aid guide. Watched two webinars.' },
      signals: ['Trial started 11 days ago', '6 of 8 activation steps complete', 'Invited 3 colleagues'],
      verdict: { type: 'WIN ZONE', vs: 'Spreadsheets', play: 'No incumbent system. Activation is the only barrier — day-14 clock matters.' },
      trace: ['mind: activated? 2 of 3 core actions at day 11', 'nudge sent for core action 3', 'upgrade offer queued for day 14'],
      escalation: null, state: 'Trial',
      nextAction: 'Automated — day-14 upgrade offer'
    },
    {
      id: 'salvation-army', name: 'Salvation Army Trading', initials: 'SA',
      charityNo: '215174', incomeBand: '£100m+', cause: 'Social welfare', staff: 4000, shops: 230,
      fit: 68, intent: 25, complexity: 48, stage: 'Prospecting', tier: 'T1',
      channel: 'Signal tracking',
      explain: ['New systems role — hiring signal, 60-day window', 'Income band above target — tapered', 'No intent events yet beyond the job ad'],
      contact: { name: 'Grace Adeyemi', role: 'Head of Retail Systems (new post)', tenure: '2 mo', note: 'Role created this year — signal of systems investment.' },
      signals: ['Hiring: head of retail systems', 'Job ad mentions "CRM modernisation"', 'No incumbent vendor announced'],
      verdict: { type: 'UNKNOWN', vs: 'No signal above low confidence', play: 'Ask the discovery question; do not guess.' },
      trace: ['salvation_army: new role detected via hiring signal', 'complexity 48 — assisted lane, agent-led, rep visible', 'outreach scheduled: linkedin, thursday'],
      escalation: null, state: null,
      nextAction: 'Approve LinkedIn opener'
    },
    {
      id: 'age-uk', name: 'Age UK Trading', initials: 'AU',
      charityNo: '1128267', incomeBand: '£10m–£100m', cause: 'Older people', staff: 1700, shops: 250,
      fit: 71, intent: 75, complexity: 15, stage: 'Onboarding', tier: 'T1',
      channel: 'Paid ads',
      explain: ['Product usage growing week on week', 'Core actions 2 of 3 complete', 'Second region viewed pricing — expansion intent'],
      contact: { name: 'Tom Barker', role: 'Regional Retail Manager', tenure: '4 yrs 6 mo', note: 'Converted from the shop-manager ad funnel. Self-checkout, starter plan.' },
      signals: ['Subscribed: starter plan, 12 shops', 'Onboarding 40% complete', 'Usage growing week on week'],
      verdict: { type: 'WIN ZONE', vs: '—', play: 'Already a customer. Expansion path: 250 shops total estate.' },
      trace: ['age_uk: onboarding nudge 3 of 6 sent', 'usage up 22% wow', 'expansion signal: second region viewed pricing'],
      escalation: null, state: 'Paid',
      nextAction: 'Automated — onboarding sequence'
    },
    {
      id: 'shelter', name: 'Shelter Shops', initials: 'SH',
      charityNo: '263710', incomeBand: '£10m–£100m', cause: 'Housing', staff: 1300, shops: 100,
      fit: 63, intent: 30, complexity: 33, stage: 'Prospecting', tier: 'T1',
      channel: 'Signal tracking',
      explain: ['Grant award — funding health at maximum', 'Tech stack: no blocking incumbent', 'No direct engagement yet — intent is all signals'],
      contact: { name: 'Fiona Marsh', role: 'Director of Fundraising & Trading', tenure: '7 yrs 2 mo', note: 'Speaks at sector events on retail innovation.' },
      signals: ['Grant awarded: retail digitisation fund', 'Tech stack: legacy till system, no CRM', 'Expanding furniture stores'],
      verdict: { type: 'WIN ZONE', vs: 'Open market', play: 'Grant funding earmarked for exactly what we sell. Approach within 30 days.' },
      trace: ['shelter: grant award detected — retail digitisation', 'grant intent expires at 12 months — clock started', 'personalised deck assembling'],
      escalation: null, state: null,
      nextAction: 'Approve outreach timing'
    },
    {
      id: 'scope', name: 'Scope Stores', initials: 'SC',
      charityNo: '208231', incomeBand: '£10m–£100m', cause: 'Disability', staff: 900, shops: 150,
      fit: 58, intent: 55, complexity: 5, stage: 'Funnel', tier: 'T1',
      channel: 'Paid ads',
      explain: ['Checkout started — strongest event on record', 'Ad-funnel landing personalised to rota pain', 'Organisation size below sweet spot — tapered'],
      contact: { name: 'Leah Quinn', role: 'Shop Manager, Bristol', tenure: '1 yr 9 mo', note: 'Clicked the volunteer-rota ad. Landing page personalised to rota pain.' },
      signals: ['Ad click → dynamic landing page', 'Trial signup form 80% complete', 'Abandoned at card step'],
      verdict: { type: 'UNKNOWN', vs: '—', play: 'Self-serve funnel — recovery sequence, no competitive read needed.' },
      trace: ['scope: checkout_started, no checkout_completed', 'recovery sequence: email 1 of 2 sent', 'landing page variant b assembled'],
      escalation: null, state: 'Identified',
      nextAction: 'Automated — recovery sequence'
    },
    {
      id: 'ymca', name: 'YMCA England Shops', initials: 'YM',
      charityNo: '212810', incomeBand: '£10m–£100m', cause: 'Young people', staff: 800, shops: 90,
      fit: 61, intent: 18, complexity: 15, stage: 'At risk', tier: 'HUMAN',
      channel: 'Referral & partner',
      explain: ['Usage down 40% over 30 days — at-risk state entered', 'Intent decayed: no positive event in 6 weeks', 'Renewal due in 6 weeks'],
      contact: { name: 'Owen Hughes', role: 'Trading Manager', tenure: '2 yrs 11 mo', note: 'Referred by a partner charity. Replied tersely to last two emails.' },
      signals: ['Sentiment negative in 2 consecutive replies', 'Usage dropped 40% in 3 weeks', 'Renewal due in 6 weeks'],
      verdict: { type: 'LOSS RISK', vs: 'Churn', play: 'Save play, pause offer first — grant-funded budget cycle. Human touch before renewal.' },
      trace: ['ymca: 2 consecutive negative-classified replies', 'ESCALATED — rep within 4 working hours', 'save offers ranked by clv: pause 3mo → tier down → discount'],
      escalation: 'Negative sentiment detected', state: 'At risk',
      nextAction: 'Human owner: check-in call'
    },
    {
      id: 'emmaus', name: 'Emmaus UK', initials: 'EM',
      charityNo: '1064470', incomeBand: '£1m–£10m', cause: 'Homelessness', staff: 350, shops: 40,
      fit: 55, intent: 48, complexity: 8, stage: 'Engaged', tier: 'HUMAN',
      channel: 'Web & forms',
      explain: ['Demo request — full weight, inside half-life', 'Income band below target — tapered', 'Single contact only — committee incomplete'],
      contact: { name: 'Bea Collins', role: 'Community Director', tenure: '8 yrs 5 mo', note: 'Asked to "speak to a real person" in the demo request form.' },
      signals: ['Demo request via website', 'Explicitly asked for a person', 'Interested in furniture resale features'],
      verdict: { type: 'UNKNOWN', vs: 'Open market', play: 'Warm inbound. Route to human per explicit request — no qualifying questions first.' },
      trace: ['emmaus: demo request captured from web form', 'ESCALATED — customer asked for a person, immediate', 'call slots offered'],
      escalation: 'Customer explicitly asks for a person', state: 'Identified',
      nextAction: 'Human owner: book demo call'
    },
    {
      id: 'oxfam', name: 'Oxfam Trading', initials: 'OX',
      charityNo: '202918', incomeBand: '£100m+', cause: 'Global poverty', staff: 5000, shops: 560,
      fit: 85, intent: 80, complexity: 38, stage: 'Expansion', tier: 'T2',
      channel: 'Organic content',
      explain: ['Product usage: real-time, 214 shops active', 'Plan limit approached — 84% of starter tier', 'NPS 9 — reference-ready champion'],
      contact: { name: 'Priti Shah', role: 'Head of Retail Innovation', tenure: '3 yrs 7 mo', note: 'Champion. Willing to be a case study.' },
      signals: ['Self-service signup: 214 shops on starter', 'Expansion candidate: full estate is 560', 'NPS 9 at day 30'],
      verdict: { type: 'WIN ZONE', vs: '—', play: 'Won and expanding. Promoted to assisted lane — value now warrants a visible rep.' },
      trace: ['oxfam: plan_limit_approached — 84% for 2 weeks', 'tier upsell offer assembled with their own usage charted', 'lane change: self-serve → assisted · audit entry written'],
      escalation: null, state: 'Expanded',
      nextAction: 'Issue tier upsell offer'
    },
    {
      id: 'trinity', name: 'Trinity Hospice Shops', initials: 'TH',
      charityNo: '1013945', incomeBand: '£1m–£10m', cause: 'Hospice care', staff: 180, shops: 34,
      fit: 60, intent: 40, complexity: 12, stage: 'Support', tier: 'HUMAN',
      channel: 'Web & forms',
      explain: ['Paid customer — usage steady', 'Complaint raised — commercial motion suspended', 'Small estate — below seat-count sweet spot'],
      contact: { name: 'Karen Doyle', role: 'Retail & Trading Lead', tenure: '6 yrs 0 mo', note: 'Raised a formal complaint about a duplicate direct debit charge.' },
      signals: ['Formal complaint: duplicate direct debit', 'Refund requested', 'Otherwise healthy usage across 34 shops'],
      verdict: { type: 'LOSS RISK', vs: 'Trust damage', play: 'Resolve the complaint before any commercial motion. No sends until closed.' },
      trace: ['trinity: complaint detected in inbound email', 'ESCALATED — immediate, designated human owner', 'all sequences paused · refund case opened'],
      escalation: 'Safeguarding or complaint raised', state: 'Paid',
      nextAction: 'Human owner: resolve complaint'
    }
  ],

  /* ---- The model (§4–§6, §11 of the spec) — rendered on the Channels view ---- */
  model: {
    formula: ['intent_decayed = Σ ( weight × value × 0.5^(days_since / half_life) )', 'raw = (0.40 × fit) + (0.60 × intent_decayed)', 'likelihood = calibrate(raw) — isotonic, against closed-won history'],
    fitFeatures: [
      { name: 'Income band', weight: 20, rule: 'Peak at target band; taper above and below' },
      { name: 'Funding health', weight: 15, rule: '≥6 months reserves = 1.0; <3 months = 0.3' },
      { name: 'Buying-committee completeness', weight: 15, rule: '1.0 when finance, ops and digital all present' },
      { name: 'Tech stack compatibility', weight: 12, rule: 'Known-good = 1.0; blocking incumbent = 0.2' },
      { name: 'Cause-area match to ICP', weight: 12, rule: 'Core 1.0, adjacent 0.6, out 0.1' },
      { name: 'Organisation size', weight: 10, rule: 'Band curve matched to seat-count sweet spot' },
      { name: 'Legal structure', weight: 10, rule: 'Charity / CIO 1.0, CIC 0.8, contractor 0.7' },
      { name: 'Geography', weight: 6, rule: 'Serviceable nation = 1.0; outside coverage = 0' }
    ],
    intentFeatures: [
      { name: 'Demo or trial request', weight: 20, halfLife: '30 days', rule: 'Binary, full weight on submission' },
      { name: 'Tender / RFP match published', weight: 16, halfLife: 'deadline', rule: 'Scales with capability match %' },
      { name: 'Pricing page engagement', weight: 14, halfLife: '14 days', rule: 'Views capped at 5; time-on-page multiplier' },
      { name: 'Reply depth on outreach', weight: 12, halfLife: '21 days', rule: '1 reply 0.5, threaded 1.0, meeting 1.0' },
      { name: 'Multi-contact activity', weight: 12, halfLife: '21 days', rule: '2 people 0.6, 3+ same org 1.0' },
      { name: 'Video completion', weight: 10, halfLife: '14 days', rule: 'Linear on % watched; ≥80% complete' },
      { name: 'Pre-sales question raised', weight: 10, halfLife: '21 days', rule: 'Commercial questions score full' },
      { name: 'Event / webinar attendance', weight: 6, halfLife: '45 days', rule: 'Registered 0.4, attended 1.0' }
    ],
    bands: [
      { band: 'POLE', range: '80–100', behaviour: 'Immediate personalised outreach, offer generated · 15-min response clock' },
      { band: 'FRONT ROW', range: '60–79', behaviour: 'Accelerated sequence, video pushed, meeting offered' },
      { band: 'MIDFIELD', range: '40–59', behaviour: 'Standard nurture, watching for a trigger event' },
      { band: 'BACK MARKER', range: '20–39', behaviour: 'Low-frequency content only' },
      { band: 'COLD', range: '0–19', behaviour: 'Suppressed; re-enters only on a new signal' }
    ],
    complexityInputs: [
      { name: 'Formal procurement route', points: '40' },
      { name: 'Annual contract value', points: '0–30' },
      { name: 'Custom requirements', points: '0–20' },
      { name: 'Stakeholder count', points: '0–15' },
      { name: 'Security / DPIA review', points: '15' },
      { name: 'Multi-entity or consortium', points: '10' }
    ],
    lanes: [
      { range: '0–24', lane: 'SELF-SERVE', ownership: 'Agent end-to-end, no human touch expected' },
      { range: '25–54', lane: 'ASSISTED', ownership: 'Agent-led, named rep visible and on the hook' },
      { range: '55–130', lane: 'ENTERPRISE', ownership: 'Rep-owned, agent runs research, drafting, admin' }
    ],
    verdicts: [
      { type: 'LOSS RISK', condition: 'Gap on a mandatory, or entrenched incumbent', play: 'No-bid or reposition' },
      { type: 'UNDERCUT', condition: 'Match ≥80% and cost-to-serve ≤70% of their list', play: 'Priced move in the ladder, never below margin floor' },
      { type: 'WIN ZONE', condition: '≥2 differentiators map to requirements, price ±10%', play: 'Lead on differentiators, hold price' },
      { type: 'CONTESTED', condition: '1 differentiator, price ±10%', play: 'Proof-led: reference charity, pilot offer' },
      { type: 'UNKNOWN', condition: 'No signal above low confidence', play: 'Ask the discovery question; do not guess' }
    ],
    tiers: [
      { tier: 'T0', capability: 'Read, enrich, score, research', constraint: 'Always on' },
      { tier: 'T1', capability: 'Send content — email, video, dossier, social', constraint: 'Frequency caps, consent respected' },
      { tier: 'T2', capability: 'Book meetings, issue quotes, apply discounts', constraint: '≤10% new business, ≤20% retention save' },
      { tier: 'T3', capability: 'Issue a contract for signature', constraint: 'Green-tier documents, self-serve lane only' },
      { tier: '—', capability: 'Never permitted', constraint: 'Below margin floor, legal terms, safeguarding, complaints, red tier' }
    ]
  },

  channels: {
    inbound: [
      { name: 'Web & forms', desc: 'Enquiries, demo requests, chat', week: 41 },
      { name: 'Paid ads', desc: 'Search & social funnels', week: 118 },
      { name: 'Organic content', desc: 'SEO, guides, webinars', week: 87 },
      { name: 'Public marketplaces', desc: 'G-Cloud, DPS, framework listings', week: 6 },
      { name: 'Referral & partner', desc: 'Word of mouth, co-marketing', week: 14 }
    ],
    outbound: [
      { name: 'SDR outreach', desc: 'Email & LinkedIn sequences', week: 260 },
      { name: 'ABM campaigns', desc: 'Named enterprise accounts', week: 32 },
      { name: 'Tender & RFP watch', desc: 'Public sector bid alerts', week: 9 },
      { name: 'Events', desc: 'Charity sector conferences', week: 3 }
    ]
  },

  enrichment: [
    { name: 'Org intelligence', desc: 'Charity Commission / OSCR / CCNI · annual refresh · flag at 15 months' },
    { name: 'Contact intelligence', desc: 'Roles & moves · weekly refresh · dossier suppressed at 90 days stale' },
    { name: 'Signal tracking', desc: 'Grants daily, tech stack monthly · tender signals expire at deadline' },
    { name: 'Social & interests', desc: 'Conversation framing ONLY — never a scoring input (UK GDPR)' }
  ],

  core: [
    { name: 'Predictive scoring', desc: 'Fit × intent, five bands, calibrated monthly — model below' },
    { name: 'Competitive analysis', desc: 'Verdict per opportunity: win / contested / loss-risk / undercut' },
    { name: 'Autonomous agent', desc: 'Four permission tiers, autonomous to signature on self-serve' },
    { name: 'Personalisation engine', desc: 'Decides content, tone and timing per person' }
  ],

  escalationTriggers: [
    { trigger: 'Deal value above threshold', threshold: 'ACV above the enterprise threshold', handoff: 'Named rep · agent stays as researcher' },
    { trigger: 'Negative sentiment detected', threshold: '2 consecutive negative-classified replies', handoff: 'Rep within 4 working hours' },
    { trigger: 'Complex negotiation', threshold: 'Counterparty edits below acceptable on the fallback ladder', handoff: 'Commercial owner' },
    { trigger: 'Compliance / legal sign-off', threshold: 'Any red-tier clause or DPIA requirement', handoff: 'Legal, before anything is sent' },
    { trigger: 'Customer explicitly asks for a person', threshold: 'Any request', handoff: 'Immediate — no qualifying questions first' },
    { trigger: 'Safeguarding or complaint raised', threshold: 'Any mention', handoff: 'Immediate — designated human owner' },
    { trigger: 'Agent confidence below floor', threshold: 'Below configured threshold', handoff: 'Ask a human rather than guess' },
    { trigger: 'Same task failed 3 times', threshold: '3 failures', handoff: 'Stop, escalate, do not retry' }
  ],

  tenders: [
    { name: 'BHF — EPOS & CRM replacement', record: 'bhf', source: 'Find a Tender Service', deadline: '22 AUG 2026', state: 'Responding', gate: 'BID — mandatories 100% · scored 78%' },
    { name: 'Royal Voluntary Service — retail CRM call-off', record: null, source: 'Framework / DPS portal', deadline: '05 SEP 2026', state: 'Qualifying', gate: 'BID — clarifications drafted' },
    { name: 'Hospice UK group — member systems framework', record: null, source: 'Charity & funder portals', deadline: '30 SEP 2026', state: 'Identified', gate: 'NO-BID — accreditation not held · partner route under review' }
  ],

  engageQueue: [
    { record: 'sue-ryder', type: 'EMAIL', item: 'Outreach — 4 new shops, warm intro referenced', channel: 'Email', when: 'Tue 09:10', authority: 'T1 · AUTO' },
    { record: 'salvation-army', type: 'LINKEDIN', item: 'Opener — congratulations on the new systems role', channel: 'LinkedIn', when: 'Thu 08:30', authority: 'T1 · AUTO' },
    { record: 'mind', type: 'VIDEO', item: 'Explainer — donation tracking in action, 90s cut', channel: 'In-product', when: 'Today', authority: 'T1 · AUTO' },
    { record: 'barnardos', type: 'PROPOSAL', item: 'Proposal — Gift Aid uplift, scoped from requirements register', channel: 'Email', when: 'On approval', authority: 'AMBER · SALES LEAD · 1 DAY' },
    { record: 'cruk', type: 'CONTRACT', item: 'Contract — 3-year terms assembled from clause library', channel: 'Human owner', when: 'Escalated', authority: 'RED · LEGAL · 3 DAYS' },
    { record: 'oxfam', type: 'QUOTE', item: 'Tier upsell — their own usage charted against plan limit', channel: 'In-product', when: 'Today', authority: 'T2 · AUTO · LOGGED' },
    { record: 'shelter', type: 'DOSSIER', item: 'Dossier — grant award, event talks, 2 conversation openers', channel: 'Internal', when: 'Ready', authority: 'T0 · AUTO' },
    { record: 'scope', type: 'EMAIL', item: 'Recovery — finish setting up your trial, 2 of 2', channel: 'Email', when: 'Tomorrow 10:00', authority: 'T1 · AUTO' },
    { record: 'bhf', type: 'PROPOSAL', item: 'Bid response — 41 requirement line items, 60% drafted', channel: 'Portal', when: '22 Aug deadline', authority: 'AMBER · SALES LEAD · 1 DAY' }
  ],

  /* ---- Gamification (§12): points = stage × band multiplier + bonuses − penalties ---- */
  race: { week: 'RACE — WEEK 31 OF 52', season: 'SEASON Q3 2026', fastestLap: 'FASTEST LAP: PRIYA KAUR — 11 MIN MEDIAN FIRST RESPONSE' },
  teamObjective: { label: 'TEAM OBJECTIVE — 10 CONTRACTS SIGNED THIS RACE', current: 7, target: 10 },
  reps: [
    { pos: 'P1', name: 'Priya Kaur', points: 1240, rate: 92, note: '+50 incumbent win · fastest lap ×3' },
    { pos: 'P2', name: 'Dan Mercer', points: 1105, rate: 87, note: '+150 tender win (BHF pilot)' },
    { pos: 'P3', name: 'Sofia Reyes', points: 980, rate: 81, note: 'YMCA save in progress' },
    { pos: 'P4', name: 'James Tan', points: 720, rate: 73, note: 'Rookie season · handicap applied' }
  ],
  products: [
    { pos: 'P1', name: 'Membership subscription', rate: 71 },
    { pos: 'P2', name: 'Enterprise contract package', rate: 58 },
    { pos: 'P3', name: 'Add-on services', rate: 44 }
  ],

  cockpitStats: [
    { label: 'HOT LEADS (POLE)', value: '38' },
    { label: 'AVG CONVERT LIKELIHOOD', value: '64%' },
    { label: 'IN PIT LANE (SUPPORT)', value: '5' },
    { label: 'TEAM STREAK', value: '7 DAYS' }
  ],

  feed: [
    'scanned 4,218 shops · 02:00',
    '31 expanding · 6 ready to talk',
    'bhf: pole band — 15-min response clock met',
    'cruk: escalated — deal value £340k · red-tier contract with legal',
    'oxfam: lane change self-serve → assisted · audit written',
    'trinity: complaint — all sequences paused, human owner on it',
    'ymca: escalated — 2 negative replies · rep clock 4h',
    'salvation_army: confidence below floor on pricing question — asked a human'
  ]
};
