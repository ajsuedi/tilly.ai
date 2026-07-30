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

  /* ---- Org marks: each customer's own brand colour on the flat square avatar.
     Third-party identity is data, not our decoration — the one-blue rule applies
     to Tilly's own UI, not to the customer's mark. Drop real logo files in
     app/logos/<id>.png later and swap these for images. ---- */
  /* Test mode: every outbound email the CRM would send is proxied here instead */
  settings: { testMode: true, emailProxy: 'alina.suedi@listaid.ai' },

  logos: {
    'sue-ryder': '#00857E', 'barnardos': '#6AA338', 'bhf': '#D20019', 'cruk': '#2E008B',
    'mind': '#0033A0', 'salvation-army': '#B71234', 'age-uk': '#C6007E', 'shelter': '#E52713',
    'scope': '#D0006F', 'ymca': '#6D2077', 'emmaus': '#D97B26', 'oxfam': '#0B7030', 'trinity': '#7A3A8E'
  },

  /* ---- Deal values (ACV £/yr) — merged onto records at boot. Illustrative. ---- */
  acvNums: {
    'sue-ryder': 96000, 'barnardos': 142000, 'bhf': 340000, 'cruk': 113000,
    'mind': 8400, 'salvation-army': 22000, 'age-uk': 3600, 'shelter': 12000,
    'scope': 1188, 'ymca': 5760, 'emmaus': 2400, 'oxfam': 38000, 'trinity': 3120
  },

  /* ---- Deal & stakeholder enrichment — merged onto records at boot ---- */
  deals: {
    'sue-ryder': { acv: '£96,000 proposed', term: '24 months', users: '420 seats scoped', stakeholders: [
      { name: 'Rachel Holt', role: 'Director of Retail Operations', tag: 'DECISION MAKER' },
      { name: 'Ian Frost', role: 'Finance Director', tag: 'ECONOMIC BUYER' },
      { name: 'Meera Patel', role: 'Retail Systems Manager (being hired)', tag: 'USER LEAD' },
      { name: 'Trustee board contact', role: 'Warm intro route', tag: 'INFLUENCER' }
    ]},
    'barnardos': { acv: '£142,000', term: '36 months pending', users: '640 seats scoped', stakeholders: [
      { name: 'Marcus Webb', role: 'Head of Trading', tag: 'DECISION MAKER' },
      { name: 'Sally Nkomo', role: 'Finance Business Partner', tag: 'ECONOMIC BUYER' },
      { name: 'Dev Sharma', role: 'Head of IT — tech stack review', tag: 'INFLUENCER' },
      { name: 'Shop managers ×600', role: 'Store operations', tag: 'USERS' }
    ]},
    'bhf': { acv: '£340,000', term: '36 months (tender)', users: '2,100 seats scoped', stakeholders: [
      { name: 'Gareth Llewellyn', role: 'Retail Operations Director', tag: 'DECISION MAKER' },
      { name: 'Nadia Hussain', role: 'Chief Financial Officer', tag: 'ECONOMIC BUYER' },
      { name: 'Amara Osei', role: 'Retail Transformation Lead', tag: 'CHAMPION' },
      { name: 'Evaluation panel ×14', role: 'Tender scoring', tag: 'EVALUATORS' },
      { name: 'Procurement office', role: 'Compliance & process', tag: 'PROCUREMENT' }
    ]},
    'cruk': { acv: '£113,000 (£340k / 3 yrs)', term: '36 months', users: '1,800 seats', stakeholders: [
      { name: 'Daniel Price', role: 'Commercial Director', tag: 'DECISION MAKER' },
      { name: 'Tom Okafor', role: 'Head of Retail Systems', tag: 'USER LEAD' },
      { name: 'In-house legal', role: 'Red-tier contract review', tag: 'LEGAL' },
      { name: 'Procurement', role: 'Security review requested', tag: 'PROCUREMENT' }
    ]},
    'mind': { acv: '£8,400 (growth plan)', term: '12 months', users: '14 active in trial', stakeholders: [
      { name: 'Jess Fielding', role: 'Retail Development Manager', tag: 'DECISION MAKER' },
      { name: 'Paul Whitby', role: 'Finance Officer', tag: 'ECONOMIC BUYER' },
      { name: 'Trial colleagues ×3', role: 'Invited this week', tag: 'USERS' }
    ]},
    'salvation-army': { acv: 'est £22,000', term: 'not yet scoped', users: '—', stakeholders: [
      { name: 'Grace Adeyemi', role: 'Head of Retail Systems (new post)', tag: 'DECISION MAKER' },
      { name: 'Territorial HQ finance', role: 'Budget holder', tag: 'ECONOMIC BUYER' },
      { name: 'Divisional retail managers ×8', role: 'Regional operations', tag: 'USERS' }
    ]},
    'age-uk': { acv: '£3,600 (starter, 12 shops)', term: 'monthly rolling', users: '31 active', stakeholders: [
      { name: 'Tom Barker', role: 'Regional Retail Manager', tag: 'CHAMPION' },
      { name: 'Susan Cole', role: 'National Retail Director', tag: 'DECISION MAKER — NOT YET ENGAGED' },
      { name: 'Shop managers ×12', role: 'Daily users', tag: 'USERS' }
    ]},
    'shelter': { acv: 'est £12,000', term: 'not yet scoped', users: '—', stakeholders: [
      { name: 'Fiona Marsh', role: 'Director of Fundraising & Trading', tag: 'DECISION MAKER' },
      { name: 'Digitisation grant board', role: 'Ring-fenced budget', tag: 'ECONOMIC BUYER' },
      { name: 'Josh Carey', role: 'Retail Operations Lead', tag: 'USER LEAD' }
    ]},
    'scope': { acv: '£1,188 (starter)', term: 'monthly rolling', users: '1 — trial pending', stakeholders: [
      { name: 'Leah Quinn', role: 'Shop Manager, Bristol', tag: 'USER' },
      { name: 'Head office retail leadership', role: 'Unknown', tag: 'DECISION MAKER — UNMAPPED' }
    ]},
    'ymca': { acv: '£5,760 at renewal', term: '12 months', users: '22 active · usage −40%', stakeholders: [
      { name: 'Owen Hughes', role: 'Trading Manager', tag: 'DECISION MAKER' },
      { name: 'Finance Manager', role: 'Renewal sign-off', tag: 'ECONOMIC BUYER' },
      { name: 'Shop staff ×22', role: 'Daily users', tag: 'USERS' }
    ]},
    'emmaus': { acv: 'est £2,400', term: 'not yet scoped', users: '—', stakeholders: [
      { name: 'Bea Collins', role: 'Community Director', tag: 'DECISION MAKER' },
      { name: 'Community leaders ×5', role: 'Site-level operations', tag: 'USERS' }
    ]},
    'oxfam': { acv: '£14,300 → £38,000 proposed', term: '12 months', users: '640 active across 214 shops', stakeholders: [
      { name: 'Priti Shah', role: 'Head of Retail Innovation', tag: 'DECISION MAKER' },
      { name: 'Colin Bright', role: 'Finance Business Partner', tag: 'ECONOMIC BUYER' },
      { name: 'Region 2 retail lead', role: 'Expansion sponsor', tag: 'INFLUENCER' },
      { name: 'Shop managers ×214', role: 'Daily users', tag: 'USERS' }
    ]},
    'trinity': { acv: '£3,120', term: '12 months', users: '48 active', stakeholders: [
      { name: 'Karen Doyle', role: 'Retail & Trading Lead', tag: 'DECISION MAKER' },
      { name: 'Finance Officer', role: 'Raised the duplicate charge', tag: 'ECONOMIC BUYER' },
      { name: 'Shop staff ×48', role: 'Daily users', tag: 'USERS' }
    ]}
  },

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
    { name: 'BHF — EPOS & CRM replacement', record: 'bhf', source: 'Find a Tender Service', noticeId: 'FTS-2026-012345',
      sourceUrl: 'https://www.find-tender.service.gov.uk/Notice/012345-2026',
      deadline: '22 AUG 2026', deadlineISO: '2026-08-22', state: 'Responding', bid: 'BID',
      gate: 'BID — mandatories 100% · scored 78%',
      bidStages: ['Identified', 'Qualifying', 'Responding', 'Submitted', 'Negotiating', 'Awarded'], bidStage: 'Responding',
      gates: [
        { test: 'Mandatory coverage', req: '100% or auto no-bid', val: '100%', pass: true },
        { test: 'Scored coverage', req: '≥70% of marks', val: '78%', pass: true },
        { test: 'Value to effort', req: '≥8× bid cost', val: '11×', pass: true },
        { test: 'Deadline feasibility', req: '≥5 working days', val: 'on track', pass: true },
        { test: 'Accreditation held', req: 'or a partner route', val: 'Cyber Essentials+ held', pass: true },
        { test: 'Incumbent risk', req: 'loss-risk flips to no-bid', val: 'WIN ZONE', pass: true }
      ],
      docs: [
        { name: 'Invitation to Tender (ITT).pdf', kind: 'SOURCE', added: '02 JUL' },
        { name: 'Technical specification annex.pdf', kind: 'SOURCE', added: '02 JUL' },
        { name: 'Requirements register — 41 items.xlsx', kind: 'REGISTER', added: '03 JUL' },
        { name: 'Draft bid response v3.docx', kind: 'DRAFT · 60%', added: 'TODAY' },
        { name: 'Pricing schedule.xlsx', kind: 'DRAFT', added: 'YESTERDAY' },
        { name: 'DPIA & security annex.pdf', kind: 'COMPLIANCE', added: '18 JUL' }
      ] },
    { name: 'Royal Voluntary Service — retail CRM call-off', record: null, source: 'Framework / DPS portal', noticeId: 'DPS-RM6294-CALL-0071',
      sourceUrl: 'https://www.contractsfinder.service.gov.uk/', deadline: '05 SEP 2026', deadlineISO: '2026-09-05', state: 'Qualifying', bid: 'BID',
      gate: 'BID — clarifications drafted' },
    { name: 'Hospice UK group — member systems framework', record: null, source: 'Charity & funder portals', noticeId: 'CHFP-2026-118',
      sourceUrl: 'https://www.hospiceuk.org/', deadline: '30 SEP 2026', deadlineISO: '2026-09-30', state: 'Identified', bid: 'NO-BID',
      gate: 'NO-BID — accreditation not held · partner route under review' }
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

  /* ---- Rep to-do workflow: the human's day, kept to meetings and calls ---- */
  tasks: [
    { title: 'Check-in call — YMCA save play', record: 'ymca', due: 'NOW', kind: 'CALL', source: 'Escalation: negative sentiment · 4h SLA', done: false },
    { title: 'Resolve billing complaint — Trinity Hospice', record: 'trinity', due: 'NOW', kind: 'CALL', source: 'Escalation: complaint · immediate · refund already queued', done: false },
    { title: 'Demo — Emmaus UK, 14:00', record: 'emmaus', due: 'TODAY', kind: 'MEETING', source: 'Customer asked for a person · Granola will record', done: false },
    { title: 'Final terms call — Cancer Research UK', record: 'cruk', due: 'TODAY', kind: 'MEETING', source: 'Deal value escalation · £340k · contract with legal', done: false },
    { title: "Approve Barnardo's proposal", record: 'barnardos', due: 'TODAY', kind: 'APPROVAL', source: 'Amber tier · discount within your authority', goto: '#/engage', done: false },
    { title: 'Send proposal draft — Sue Ryder', record: 'sue-ryder', due: 'THIS WEEK', kind: 'FOLLOW-UP', source: 'AUTO — Granola: you said it on the intro call, Tilly set it', auto: true, done: false },
    { title: 'Enable Gift Aid module — Mind trial', record: 'mind', due: 'THIS WEEK', kind: 'FOLLOW-UP', source: 'AUTO — Granola: activation check-in, next step captured', auto: true, done: true },
    { title: 'Review weak sections — BHF bid response', record: 'bhf', due: 'THIS WEEK', kind: 'REVIEW', source: 'Bid gate: scored coverage 78% — two sections flagged', done: false }
  ],

  /* ---- Granola-captured meetings: talk, and the CRM writes itself ---- */
  meetings: [
    { record: 'sue-ryder', title: 'Intro call — Rachel Holt', when: 'YESTERDAY 15:00', nextStep: 'Send proposal draft by Friday', task: 'TASK AUTO-CREATED' },
    { record: 'mind', title: 'Activation check-in — Jess Fielding', when: 'MON 11:00', nextStep: 'Enable Gift Aid module on the trial', task: 'TASK AUTO-CREATED' },
    { record: 'emmaus', title: 'Demo — Bea Collins', when: 'TODAY 14:00', nextStep: 'Set it verbally in the meeting — Tilly captures it', task: 'PENDING' }
  ],

  /* ---- Top of funnel: the agent's nightly run keeps the book full ---- */
  funnel: {
    hasRun: false,
    /* The agentic flow itself — every step is the agent acting, not suggesting */
    flow: [
      { step: 'SOURCES', tier: 'T0', desc: '9 channels polled — filings, job ads, tenders, grants, web signals' },
      { step: 'FETCH', tier: 'T0', desc: 'New organisations pulled with the signal that surfaced them' },
      { step: 'DEDUPE', tier: 'T0', desc: 'Matched against the book — every touch updates, never duplicates' },
      { step: 'ENRICH', tier: 'T0', desc: 'Org, contact, signals — each field with source, confidence, date' },
      { step: 'SCORE', tier: 'T0', desc: 'Fit × intent computed, likelihood banded Pole → Cold' },
      { step: 'QUALIFY', tier: 'T0', desc: 'Below the sweet spot is out — with a coded reason, politely' },
      { step: 'ROUTE', tier: 'T0', desc: 'Complexity assigns the lane, territory assigns the owner' },
      { step: 'OUTREACH', tier: 'T1', desc: 'First-touch education drafted and queued — never a cold pitch' }
    ],
    runLog: [
      { step: 0, msg: 'polling 9 sources — filings, job boards, tender portals, grant registers' },
      { step: 1, msg: 'fetched 3 candidates: pdsa, sense, crisis' },
      { step: 2, msg: 'deduped against 13 records in the book — all 3 are new' },
      { step: 3, msg: 'pdsa: enriched — charity 208217 · 120 shops · head of retail ops identified' },
      { step: 3, msg: 'sense: enriched — charity 289868 · 100 shops · hiring a retail systems analyst' },
      { step: 4, msg: 'pdsa: fit 64 · intent 58 → likelihood 60 — FRONT ROW' },
      { step: 4, msg: 'sense: fit 61 · intent 44 → likelihood 51 — MIDFIELD' },
      { step: 5, msg: 'crisis: disqualified — 11 shops, below the seat sweet spot · reason coded' },
      { step: 6, msg: 'routed: both self-serve lane, complexity <25 · owner: tilly (agent)' },
      { step: 7, msg: 'first-touch education drafted for both — queued T1, tuesday 09:00' },
      { step: 7, msg: 'run complete — 2 promoted to the pipeline · drafts waiting in engage' }
    ],
    /* Fully-formed records the run promotes into the pipeline */
    candidates: [
      {
        id: 'pdsa', name: 'PDSA Charity Shops', initials: 'PD', logo: '#0072BC',
        charityNo: '208217', incomeBand: '£10m–£100m', cause: 'Animal welfare', staff: 700, shops: 120,
        fit: 64, intent: 58, complexity: 18, stage: 'Prospecting', tier: 'T1',
        channel: 'Signal tracking', owner: 'tilly', acvNum: 9000,
        acv: 'est £9,000', term: 'not yet scoped', users: '—',
        explain: ['120 shops — inside the seat sweet spot', 'Retail ops hiring signal, 60-day window', 'No engagement yet — intent is all signals'],
        contact: { name: 'Helen Ward', role: 'Head of Retail Operations', tenure: '4 yrs 1 mo', note: 'Surfaced by the hiring signal. No prior contact — education first.' },
        signals: ['Job ad: retail operations assistant, mentions stock systems', 'Steady shop-count growth', 'No incumbent CRM detected'],
        verdict: { type: 'UNKNOWN', vs: 'Open market', play: 'Ask the discovery question; do not guess.' },
        trace: ['pdsa: fetched by nightly run — hiring signal', 'scored 64 fit · 58 intent — front row', 'first-touch education drafted, queued T1'],
        escalation: null, state: null, nextAction: 'Approve first-touch education',
        stakeholders: [
          { name: 'Helen Ward', role: 'Head of Retail Operations', tag: 'DECISION MAKER' },
          { name: 'Shop managers ×120', role: 'Store operations', tag: 'USERS' }
        ]
      },
      {
        id: 'sense', name: 'Sense Trading', initials: 'SE', logo: '#D6083B',
        charityNo: '289868', incomeBand: '£10m–£100m', cause: 'Disability', staff: 550, shops: 100,
        fit: 61, intent: 44, complexity: 14, stage: 'Prospecting', tier: 'T1',
        channel: 'Signal tracking', owner: 'tilly', acvNum: 7500,
        acv: 'est £7,500', term: 'not yet scoped', users: '—',
        explain: ['100 shops — inside the sweet spot', 'Hiring a retail systems analyst — modernisation signal', 'Cause area adjacent to ICP core'],
        contact: { name: 'Marcus Bell', role: 'Retail Support Manager', tenure: '2 yrs 8 mo', note: 'Surfaced by the systems-analyst job ad. Education-first approach.' },
        signals: ['Job ad: retail systems analyst', 'Recent shop refits reported', 'Active on sector forums'],
        verdict: { type: 'UNKNOWN', vs: 'Open market', play: 'Ask the discovery question; do not guess.' },
        trace: ['sense: fetched by nightly run — systems-analyst signal', 'scored 61 fit · 44 intent — midfield', 'first-touch education drafted, queued T1'],
        escalation: null, state: null, nextAction: 'Approve first-touch education',
        stakeholders: [
          { name: 'Marcus Bell', role: 'Retail Support Manager', tag: 'DECISION MAKER — TO CONFIRM' },
          { name: 'Shop managers ×100', role: 'Store operations', tag: 'USERS' }
        ]
      }
    ],
    run: [
      { label: 'SHOPS SCANNED · 02:00', value: '4,218' },
      { label: 'NEW LEADS FETCHED', value: '112' },
      { label: 'QUALIFIED OVERNIGHT', value: '9' },
      { label: 'PROMOTED TO PIPELINE', value: '3' }
    ],
    incoming: [
      { name: 'Marie Curie Retail', cause: 'Palliative care', shops: 170, status: 'PROMOTED', fit: 81 },
      { name: 'PDSA Charity Shops', cause: 'Animal welfare', shops: 120, status: 'QUALIFYING', fit: 64 },
      { name: 'Sense Trading', cause: 'Disability', shops: 100, status: 'QUALIFYING', fit: 61 },
      { name: 'Blue Cross Shops', cause: 'Animal welfare', shops: 60, status: 'FETCHED', fit: null },
      { name: 'Crisis Shops', cause: 'Homelessness', shops: 11, status: 'DISQUALIFIED', fit: 32 }
    ]
  },

  /* ---- GTM: inbound ad traffic and the paid funnel, by channel.
     Landing → sign-up → trial → subscribed, with the drop-off point named.
     Tilly optimises budget and creative herself at T2; you approve the plays. ---- */
  gtm: {
    channels: [
      { id: 'google', name: 'GOOGLE ADS', spend: '£1,240 / wk', cpl: '£19 CPL', trend: '+12% CVR WOW', read: 'Best converter — high-intent “charity retail software” terms' },
      { id: 'meta', name: 'META ADS', spend: '£980 / wk', cpl: '£41 CPL', trend: '−8% CVR WOW', read: 'Cheap clicks, weak checkout — mobile card step is the leak' },
      { id: 'linkedin', name: 'LINKEDIN ADS', spend: '£720 / wk', cpl: '£62 CPL', trend: 'FLAT', read: 'Expensive but senior — best trial-to-paid rate of the three' }
    ],
    funnel: [
      { id: 'google', steps: [1880, 188, 121, 34], drop: 'Biggest drop: landing → sign-up (90%) — normal for cold search', dropStage: 1 },
      { id: 'meta', steps: [2140, 132, 74, 12], drop: 'Biggest drop: card step on mobile — 71% abandon at payment', dropStage: 3 },
      { id: 'linkedin', steps: [460, 55, 38, 9], drop: 'Biggest drop: landing → sign-up — creative fatigue after 3 weeks', dropStage: 1 }
    ],
    stages: ['LANDING', 'SIGN-UP', 'TRIAL ACTIVE', 'SUBSCRIBED'],
    leads: [
      { when: '09:41', org: 'Havens Hospices Retail', channel: 'GOOGLE', stage: 'SUBSCRIBED', status: 'Starter · £32/user — payment confirmed, onboarding started', good: true },
      { when: '09:36', org: 'Scope Stores', channel: 'META', stage: 'DROP-OFF', status: 'Abandoned at card step (mobile) — recovery email 2 of 2 queued', record: 'scope' },
      { when: '09:20', org: 'Willow Wood Hospice', channel: 'LINKEDIN', stage: 'TRIAL', status: 'Day 2 — completed core action 1 of 3', good: true },
      { when: '08:54', org: 'Age UK Trading', channel: 'GOOGLE', stage: 'SUBSCRIBED', status: 'Converted from the shop-manager ad funnel', record: 'age-uk', good: true },
      { when: '08:31', org: 'St Elizabeth Shops', channel: 'META', stage: 'DROP-OFF', status: 'Bounced on landing — 4s dwell, wrong-audience signal logged' },
      { when: '07:58', org: 'Cats Protection Shops', channel: 'GOOGLE', stage: 'SIGN-UP', status: 'Email verified — plan page viewed twice' }
    ],
    plays: [
      { id: 'shift-budget', text: 'Shift £40/day Meta → Google', detail: 'Google CPL £19 vs Meta £41 with double the checkout completion. Tilly reallocates within your cap — reversible any time.', tier: 'T2' },
      { id: 'fix-card', text: 'Fix the Meta mobile card step', detail: '71% abandon at payment on mobile. Enable Apple Pay / Google Pay and move the card form above the fold. Flagged to engineering with session recordings attached.', tier: 'FLAG' },
      { id: 'rotate-creative', text: 'Rotate LinkedIn creative', detail: 'Frequency 6.1 and CTR falling three weeks straight. Swap in the Oxfam case-study ad — drafted, on brand, ready to go.', tier: 'T1' }
    ],
    applied: {}
  },

  /* ---- Self-serve e-commerce funnel & subscription payment tracking ---- */
  selfServeFunnel: [
    { stage: 'VISIT', count: 4820, note: 'Ad + organic sessions this month' },
    { stage: 'SIGN UP', count: 402, note: '8.3% of visits — dynamic landing pages' },
    { stage: 'APP DOWNLOAD', count: 288, note: '72% of sign-ups — nudge at 24h if missing' },
    { stage: 'SUBSCRIPTION SELECTED', count: 131, note: '46% of downloads — plan matched to shop count' },
    { stage: 'ACTIVE USAGE', count: 94, note: '72% activated — 3 core actions inside 14 days' }
  ],
  subscriptions: [
    { record: 'oxfam', plan: 'Growth', seats: 640, mrr: '£1,192', billing: 'PAID', next: '01 AUG', note: 'Tier upsell offer out — their own usage charted' },
    { record: 'ymca', plan: 'Starter', seats: 22, mrr: '£480', billing: 'RETRY 2 OF 4', next: 'DAY 7 RETRY', note: 'Payment failed · read-only at day 21 · save play running' },
    { record: 'age-uk', plan: 'Starter', seats: 31, mrr: '£300', billing: 'PAID', next: '03 AUG', note: 'Healthy — expansion signal from region 2' },
    { record: 'trinity', plan: 'Starter', seats: 48, mrr: '£260', billing: 'REFUND OPEN', next: 'ON HOLD', note: 'Duplicate charge — billing frozen until complaint closes' },
    { record: 'mind', plan: 'Trial', seats: 14, mrr: '£0', billing: 'TRIAL — DAY 11', next: 'DAY 14 OFFER', note: '2 of 3 core actions — activation nudge live' },
    { record: 'scope', plan: '—', seats: 1, mrr: '£0', billing: 'CHECKOUT ABANDONED', next: 'RECOVERY 2 OF 2', note: 'Dropped at card step — recovery email tomorrow 10:00' }
  ],

  /* ---- Tilly Success: sales → CS handoff, implementation, and the health book.
     The obligation register comes straight from the signed contract (§9.6) —
     commitments become dated tasks so what was sold is what gets delivered. ---- */
  success: {
    /* Autopilot: what Tilly is running herself right now, no human in the loop */
    autopilot: [
      { record: 'mind', action: 'Onboarding nudges — day 1/3/7 sequence toward first value', tier: 'T1', status: 'RUNNING · STEP 2 OF 6' },
      { record: 'age-uk', action: 'Activation push to the second user group', tier: 'T1', status: 'RUNNING' },
      { record: 'oxfam', action: 'Tier upsell — their own usage charted, offer live', tier: 'T2', status: 'SENT · AWAITING REPLY' },
      { record: 'scope', action: 'Checkout recovery sequence', tier: 'T1', status: 'EMAIL 2 OF 2 · TOMORROW 10:00' },
      { record: 'trinity', action: 'All commercial sequences paused while the complaint is open', tier: 'T0', status: 'FROZEN — AUTOMATIC' },
      { record: 'ymca', action: 'Save-play context pack and drafts refreshed daily behind the human', tier: 'T0', status: 'RUNNING' }
    ],

    /* §1.1 The garage — who is who */
    garage: [
      { who: 'THE CUSTOMER', role: 'Driver', desc: 'Their outcomes are the only score that counts' },
      { who: 'CSM', role: 'Driver manager', desc: 'Owns the relationship and the season plan' },
      { who: 'TILLY', role: 'Race engineer', desc: 'Always on the radio, sees the telemetry first', tilly: true },
      { who: 'SUPPORT & IMPLEMENTATION', role: 'Pit crew', desc: 'Executes fast, measured interventions' },
      { who: 'CS LEADER', role: 'Team principal', desc: 'Portfolio calls, escalations, resourcing' },
      { who: 'CS OPS', role: 'Strategist', desc: 'Owns the models, playbooks and calendar' }
    ],

    /* §2 Health telemetry — score, trend and stage per account. Flag is COMPUTED
       in app.js per §2.3: band(score), escalated one level if Δ30 ≤ −10 or Δ7 ≤ −15. */
    health: [
      { record: 'oxfam', score: 88, d30: 4, d7: 1, stage: 'Embedded', tier: 'TIER 2', csm: 'Hannah Cole', usage: '+22% MOM', nps: '9', renewal: '01 MAY 2027 · £38k', play: 'Green flag — expansion allowed. Region 2 upsell is out; ask for the case study while NPS is 9' },
      { record: 'age-uk', score: 79, d30: 6, d7: 2, stage: 'Adopting', tier: 'TIER 3', csm: 'Tilly · Ravi Menon pool', usage: '+8% WOW', nps: '8', renewal: 'MONTHLY ROLLING', play: 'Drive activation across the second user group — breadth is protection' },
      { record: 'mind', score: 72, d30: 9, d7: 3, stage: 'Mobilising', tier: 'TIER 3', csm: 'Tilly · Hannah Cole pool', usage: 'TRIAL → PAID', nps: '—', renewal: '12 AUG 2027 · £8.4k', play: 'Yellow only because outcome attainment is unweighted this early — install lap booked, first value clock running' },
      { record: 'trinity', score: 58, d30: -18, d7: -4, stage: 'Embedded', tier: 'TIER 3', csm: 'Hannah Cole', usage: 'STEADY', nps: '6', renewal: '01 MAR 2027 · £3.1k', play: 'Trend escalation: 58 falling ≥15 in 30 days — safety car deployed, commercial motions frozen' },
      { record: 'ymca', score: 41, d30: -16, d7: -6, stage: 'Renewal window', tier: 'TIER 3', csm: 'Ravi Menon', usage: '−40% / 30 DAYS', nps: '4', renewal: '11 SEP 2026 · £5.8k', renewalSoon: true, play: 'Escalated to red flag: safety-car band and collapsing. Team principal owns — recover or manage exit' },
      { record: 'barnardos', score: 61, d30: -8, d7: -3, stage: 'First value', tier: 'TIER 1', csm: 'Hannah Cole', usage: 'PILOT — 12 SHOPS', nps: '7', renewal: 'PILOT ENDS 30 SEP', renewalSoon: true, play: 'Paid pilot running alongside the open proposal — usage slipping in week 3. QBR before the board paper, not after' }
    ],

    /* Churn radar: risk = (100 − health) + trend penalty + renewal proximity.
       Retention flows are lane-specific: tier 1/2 → exec QBR request;
       tier 3 → courtesy connect with a CSM, or a gift in the post to the
       primary user. Statuses are set at runtime when a flow is triggered. */
    retention: {},
    retentionNote: 'Risk is computed, never hand-set: (100 − health) + 1.5 × 30-day fall + 10 if renewal or pilot end is inside 90 days. Critical ≥60 · High 40–59 · Medium 25–39 · Low <25. Flows respect the safety car — a gift or courtesy connect is allowed mid-freeze; commercial asks are not.',
    healthModel: {
      dimensions: [
        { name: 'Adoption depth', weight: 22 }, { name: 'Usage frequency & trend', weight: 20 },
        { name: 'Outcome attainment', weight: 18 }, { name: 'Relationship strength', weight: 14 },
        { name: 'Sentiment', weight: 12 }, { name: 'Support burden', weight: 8 }, { name: 'Commercial signals', weight: 6 }
      ],
      formula: ['flag = band(score) · green 75–100 · yellow 55–74 · safety car 35–54 · red 0–34', 'escalate one level if Δ30 ≤ −10 or Δ7 ≤ −15', 'de-escalate if Δ30 ≥ +10 and score ≥ band floor for 21 days', 'weights shift by stage: outcome attainment 8 while mobilising → 26 in the renewal window'],
      note: 'Recomputed nightly and on material events. The score always exposes its contributing dimensions — a conversation starter, not a verdict.'
    },

    /* §3 Safety car — active interventions. Commercial motions freeze FIRST. */
    safetyCars: [
      { record: 'trinity', severity: 'SC1', trigger: 'Detractor score from economic buyer + open complaint', cause: 'Support pain — duplicate direct debit', play: 'Remediation: written plan with dates, refund confirmed, senior apology', owner: 'Hannah Cole + team principal', clock: 'HOUR 3 · FIRST CONTACT MADE (SLA 4H)', exit: 'Health ≥55 for 21 days · complaint resolved · customer confirms · upsell stays off 30 more days' },
      { record: 'ymca', severity: 'SC1', trigger: 'Renewal <90 days with health <55 + core usage −40%', cause: 'Funding ended — grant that funded the purchase expired', play: 'Commercial restructure: pause or align term to next funding cycle BEFORE any discount', owner: 'Ravi Menon + team principal', clock: 'DAY 4 · EXEC SPONSOR CALL BOOKED', exit: 'Health ≥55 for 21 days · funding route agreed · dated next milestone' }
    ],
    frozenNote: 'While a safety car runs: no upsell, no price-increase notice, no dunning escalation, no NPS survey, no automated renewal prompt. Tilly built each risk brief within 1 hour of the trigger.',

    /* §4 Pit wall — upcoming pit stops with prep pack status */
    pitWall: [
      { record: 'mind', type: 'INSTALL LAP', when: 'TOMORROW 10:00', length: '60 MIN', owner: 'Hannah Cole', pack: 'READY' },
      { record: 'ymca', type: 'QUALIFYING (RENEWAL)', when: 'THU 14:00', length: '45 MIN', owner: 'Ravi Menon', pack: 'READY' },
      { record: 'oxfam', type: 'RACE DEBRIEF', when: 'FRI 11:00', length: '60 MIN', owner: 'Hannah Cole', pack: 'BUILDING' },
      { record: 'age-uk', type: 'SHAKEDOWN (DAY 30)', when: 'MON 09:30', length: '30 MIN', owner: 'Tilly pool', pack: 'READY' }
    ],
    pitStopNote: 'Prep pack assembled by Tilly 24h before every stop: health movement, usage delta, open items, people changes, talking points, a ranked agenda and a draft outcome. Target: ≤10 manual minutes per stop, prep plus admin — the number that makes 1:400 coverage real.',

    /* §5 Season calendar — milestones, renewals and the charity-sector calendar */
    season: [
      { when: 'TOMORROW', account: 'mind', item: 'Install lap — success plan agreed, milestones dated', kind: 'MILESTONE', status: 'ON TRACK' },
      { when: '12 AUG', account: 'mind', item: 'Day 14 — first value: first core action by a real user', kind: 'MILESTONE', status: 'CLOCK RUNNING' },
      { when: '15 AUG', account: 'age-uk', item: 'Day 45 — second user group live (breadth is protection)', kind: 'MILESTONE', status: 'ON TRACK' },
      { when: '01 SEP', account: 'oxfam', item: 'Day 90 — outcome evidenced: Gift Aid uplift vs baseline', kind: 'MILESTONE', status: 'EVIDENCE REQUESTED' },
      { when: '11 SEP', account: 'ymca', item: 'Renewal decision — £5.8k', kind: 'RENEWAL', status: 'SAFETY CAR' },
      { when: 'SEP', account: null, label: 'Harvest appeal peaks (several accounts)', item: 'No proactive meetings or commercial asks', kind: 'BLACKOUT', status: 'PLANNER AVOIDS' },
      { when: '08 OCT', account: 'oxfam', item: 'Trustee board — outcome evidence ready 10 days before', kind: 'TARGET', status: 'PREP QUEUED' },
      { when: 'NOV–DEC', account: null, label: 'Christmas appeal (whole book)', item: 'Blackout for reviews and renewals; support only', kind: 'BLACKOUT', status: 'PLANNER AVOIDS' }
    ],

    /* §7 The +75 NPS system */
    nps: { score: '+71', response: '58% RESPONSE', note: 'Every detractor costs two points — the safety car is the NPS instrument, not the survey. Never shown without its response rate.' },
    npsIndicators: [
      { name: 'Time to first value', target: '≤14 days', actual: '11 days', ok: true },
      { name: 'Onboarding effort score', target: '≤2 of 7', actual: '1.8', ok: true },
      { name: 'Outcome attainment', target: '≥85% due milestones', actual: '88%', ok: true },
      { name: 'First response time', target: '<2 business hours', actual: '38 min', ok: true },
      { name: 'Safety car recovery rate', target: '≥70%', actual: '67%', ok: false },
      { name: 'Green flag share', target: '≥75% of accounts', actual: '40%', ok: false },
      { name: 'Overdue action age', target: '<7 days median', actual: '3 days', ok: true },
      { name: 'Pit stop punctuality', target: '≥95% held', actual: '97%', ok: true },
      { name: 'Video action rate', target: '≥40% act in 7 days', actual: '46%', ok: true }
    ],

    /* §8.2 CS leaderboard — outcomes only, book-size handicapped */
    csBoard: [
      { pos: 'P1', name: 'Hannah Cole', rate: 84, note: 'NRR 112% · 3 of 3 books green or recovering · handicap: mixed tier 2/3 book' },
      { pos: 'P2', name: 'Ravi Menon', rate: 76, note: 'Two safety cars owned · recovery clock running · handicap: heavier tier 3 pool' }
    ],
    csBoardNote: 'Scored on NRR, health improvement, safety-car recovery, NPS-in-book and outcome attainment. Meetings held, emails sent and videos pushed are explicitly excluded — busy is not the same as good.',

    /* §1.5 The handover gate — blocking */
    gate: { record: 'mind', items: [
      { name: 'Obligation register from contract', done: true }, { name: 'Stated objectives, verbatim', done: true },
      { name: 'Named driver manager', done: true }, { name: 'Stakeholder map incl. the sceptic', done: false },
      { name: 'Install lap booked inside 5 days', done: true }, { name: 'Success plan draft', done: true },
      { name: 'Baseline metrics captured', done: true }, { name: 'Known risks carried from sales notes', done: true }
    ]},

    /* §6 Tilly persona guardrails shown in the UI */
    tillyRules: ['Disclosed as "Tilly, your AI success assistant" on first contact — never passed off as human', 'Says "I don\'t know, let me get someone who does" instead of guessing', 'Handoffs name the human, the reason and a timeframe', 'Max 2 videos per contact per month, 4 per organisation', 'No video during SC1/SC2 or to anyone with an open complaint', 'Captions, transcript and a text-only equivalent, always'],

    /* Product adoption: features a customer pays for but isn't using.
       Tilly detects the gap from usage events; the fix is an explainer
       video sent in-product + email (agent T1), or by the rep. */
    adoption: [
      { record: 'oxfam', product: 'Comparison tool', idle: 'NEVER USED · 88 DAYS SINCE GO-LIVE', why: 'Shops using it price donated stock 12% higher on average', video: 'videos/comparison-tool-guide.mp4', videoLabel: 'Expert Explainer — Comparison Tool Guide (example asset)', status: null },
      { record: 'trinity', product: 'Comparison tool', idle: 'NEVER USED', why: 'Highest-value fix available while the account is frozen for sales motions — enablement is not a commercial motion', video: 'videos/comparison-tool-guide.mp4', videoLabel: 'Expert Explainer — Comparison Tool Guide (example asset)', status: null },
      { record: 'age-uk', product: 'Volunteer rota', idle: 'UNUSED IN 34 DAYS', why: 'Rota users log in 3× more often — strongest activation lever', video: 'videos/comparison-tool-guide.mp4', videoLabel: 'Rota explainer in production — sample video attached', status: null },
      { record: 'ymca', product: 'Gift Aid tracking', idle: 'DROPPED 6 WEEKS AGO', why: 'Was their original reason to buy — usage recovery starts here, pairs with the save play', video: 'videos/comparison-tool-guide.mp4', videoLabel: 'Gift Aid explainer in production — sample video attached', status: null },
      { record: 'mind', product: 'Donation intake', idle: 'NOT YET ENABLED', why: 'Third core action — enabling it completes activation inside the 14-day window', video: 'videos/comparison-tool-guide.mp4', videoLabel: 'Intake explainer in production — sample video attached', status: null }
    ]
  },

  /* ---- People intelligence: stakeholder profiles, keyed "recordId|Name".
     Disposition: PROMOTER / PASSIVE / DETRACTOR / UNKNOWN. Ease 0–100 = how easy
     they are to do business with — a close-likelihood signal at person level.
     Social data is conversation framing ONLY, never a scoring input (UK GDPR). ---- */
  people: {
    'sue-ryder|Rachel Holt': { disposition: 'PROMOTER', nps: null, ease: 78, phone: '+44 20 7946 0810', linkedin: 'in/rachelholt-retail', channel: 'Email, mornings',
      posts: [
        { when: '2 DAYS AGO', platform: 'LINKEDIN', text: 'Four new Sue Ryder shops opening in the North West this quarter — proud of this team.' },
        { when: 'LAST WEEK', platform: 'LINKEDIN', text: 'Gift Aid digitisation is the biggest unclaimed win in charity retail. Fight me.' }
      ],
      read: ['warm intro via trustee network — she knows we are coming', 'posts align exactly with our pitch — reference the gift aid thread', 'ease 78: engaged, responsive, decision maker'], opener: 'Congratulate her on the NW openings, then pick up her own Gift Aid thread.' },
    'barnardos|Marcus Webb': { disposition: 'PASSIVE', nps: null, ease: 62, phone: '+44 20 7946 0223', linkedin: 'in/marcuswebbtrading', channel: 'Email',
      posts: [{ when: '3 WEEKS AGO', platform: 'LINKEDIN', text: 'Good session at Charity Retail Conference — lots of vendors promising, fewer proving.' }],
      read: ['met at conference — asked for gift aid evidence, not promises', 'passive until he sees numbers: lead with the 12% model', 'ease 62: workable, evidence-driven'], opener: 'Send the Gift Aid uplift model before any call — he buys proof.' },
    'bhf|Amara Osei': { disposition: 'PROMOTER', nps: null, ease: 74, phone: '+44 20 7946 0551', linkedin: 'in/amaraosei', channel: 'Email · fast replies',
      posts: [{ when: 'THIS WEEK', platform: 'LINKEDIN', text: 'Modernising a 700-shop estate is a marathon run at sprint pace. Loving it.' }],
      read: ['champion inside the tender — new in role, wants a win', 'values hard numbers from her grocery-retail background', 'ease 74: your advocate on the evaluation panel'], opener: 'Arm her with the bid’s hardest numbers — she will carry them inside.' },
    'bhf|Gareth Llewellyn': { disposition: 'UNKNOWN', nps: null, ease: 55, phone: '+44 20 7946 0552', linkedin: 'in/gllewellyn', channel: 'Formal — via the panel',
      posts: [],
      read: ['decision maker, no direct contact yet — tender rules apply', 'ease 55: unknown personally; the panel process decides'], opener: 'Do not go around the process — win him through the scored response.' },
    'cruk|Daniel Price': { disposition: 'PASSIVE', nps: null, ease: 48, phone: '+44 20 7946 0119', linkedin: 'in/danielprice-commercial', channel: 'Phone — hates long email',
      posts: [{ when: 'LAST MONTH', platform: 'LINKEDIN', text: 'Negotiation is not conflict. It is two teams finding the real price of certainty.' }],
      read: ['negotiates hard but decides fast — a clean yes/no culture', 'prefers calls; keep email to confirmations', 'ease 48: hard going, but decisive once terms land'], opener: 'Call, don’t write. Bring one number you can defend and hold it.' },
    'oxfam|Priti Shah': { disposition: 'PROMOTER', nps: 9, ease: 90, phone: '+44 20 7946 0334', linkedin: 'in/pritishah-retail', channel: 'Anything — replies same day',
      posts: [
        { when: 'YESTERDAY', platform: 'LINKEDIN', text: '214 shops on one system and the managers actually like it. Small miracles.' },
        { when: '2 WEEKS AGO', platform: 'X', text: 'Charity retail tech is finally getting interesting.' }
      ],
      read: ['nps 9 — reference-ready champion, posted publicly about us', 'ease 90: smoothest relationship in the book', 'expansion sponsor for region 2'], opener: 'Ask for the case study while the goodwill is public — then the upsell.' },
    'ymca|Owen Hughes': { disposition: 'DETRACTOR', nps: 4, ease: 25, phone: '+44 20 7946 0771', linkedin: 'in/owenhughes-trading', channel: 'Phone only — email sentiment negative',
      posts: [{ when: 'THIS MONTH', platform: 'LINKEDIN', text: 'Budget season in the charity sector: the annual art of doing more with less.' }],
      read: ['nps 4 · two terse replies — do not send anything automated', 'his post is the tell: this is a funding problem, not a product one', 'ease 25: hard going — pause offer, human voice, no pitch'], opener: 'Open with the pause offer and his budget reality. No product talk.' },
    'trinity|Karen Doyle': { disposition: 'DETRACTOR', nps: 6, ease: 30, phone: '+44 20 7946 0448', linkedin: 'in/karendoyle-trinity', channel: 'Phone — complaint open',
      posts: [],
      read: ['complaint owner — duplicate direct debit hit their finances', 'previously healthy relationship; recoverable if the refund is fast', 'ease 30 today; was 70 before the billing error'], opener: 'Lead with the confirmed refund and an apology. Nothing else until closed.' },
    'salvation-army|Grace Adeyemi': { disposition: 'UNKNOWN', nps: null, ease: 60, phone: '+44 20 7946 0662', linkedin: 'in/graceadeyemi', channel: 'LinkedIn — new in post',
      posts: [{ when: 'THIS WEEK', platform: 'LINKEDIN', text: 'Week 8 in the new role. The to-do list is a mountain range, and I brought good boots.' }],
      read: ['brand-new post — building her plan right now', 'first vendor to genuinely help her wins the relationship', 'ease 60: open window, no incumbent bias'], opener: 'Congratulate her on the role and offer the sector benchmark — help first.' },
    'mind|Jess Fielding': { disposition: 'PROMOTER', nps: null, ease: 80, phone: '+44 20 7946 0885', linkedin: 'in/jessfielding', channel: 'In-product + email',
      posts: [{ when: 'LAST WEEK', platform: 'LINKEDIN', text: 'Trialling new retail tooling. The bar is low, folks. Impress me.' }],
      read: ['found us herself via the gift aid guide — self-driven', 'watched two webinars, invited colleagues: activation energy is hers', 'ease 80: smooth — keep the trial frictionless'], opener: 'Answer fast, remove friction — she is selling herself.' },
    'emmaus|Bea Collins': { disposition: 'PASSIVE', nps: null, ease: 65, phone: '+44 20 7946 0993', linkedin: 'in/beacollins-emmaus', channel: 'Phone or in person — asked for a human',
      posts: [{ when: 'LAST MONTH', platform: 'FACEBOOK', text: 'Our companions built three new furniture displays this week. Community is the product.' }],
      read: ['explicitly asked for a person — honour it, no automation', 'mission-first communicator; match that register', 'ease 65: warm once trust is human'], opener: 'A person calls, talks community outcomes, books nothing on the first call.' },
    'pdsa|Helen Ward': { disposition: 'UNKNOWN', nps: null, ease: 58, phone: '+44 20 7946 0104', linkedin: 'in/helenward-retail', channel: 'Email',
      posts: [{ when: '2 WEEKS AGO', platform: 'LINKEDIN', text: 'Hiring! Retail operations assistant — come help 120 shops run smoother.' }],
      read: ['surfaced by her own hiring post — the door is ajar', 'no contact history: education first, always', 'ease 58: unknown but reachable'], opener: 'Reference the hiring post — teams that grow need systems that scale.' }
  },

  /* ---- LinkedIn automation: connection + outreach sequence, guard-railed.
     Pacing-capped, personalised from the person's own posts, stops the moment
     they reply (a human takes over), and never runs on detractors or open
     complaints. Production note: ship this on LinkedIn's official APIs. ---- */
  linkedin: {
    caps: '15 invites / day · personalised from their own posts · stops on reply — a human takes over · never sent to detractors or open complaints',
    sequence: [
      { day: 'DAY 0', step: 'Connect', desc: 'Invite with a personalised note built from their latest post — never a pitch' },
      { day: 'DAY 2', step: 'Thanks + insight', desc: 'On accept: thank you plus one sector benchmark relevant to their role' },
      { day: 'DAY 5', step: 'Education asset', desc: 'The explainer matched to their category — teaching, not selling' },
      { day: 'DAY 9', step: 'Soft ask', desc: '15-minute call offer, framed around their stated goal · then stop and nurture' }
    ],
    queued: {},
    bulkDone: false
  },

  /* ---- Media monitor: news about enterprise accounts = a reason to reach out ---- */
  media: [
    { record: 'bhf', outlet: 'CHARITY RETAIL WEEK', when: 'TODAY', headline: 'BHF confirms plan to modernise its 700-shop estate', angle: 'Reference the announcement in the bid cover letter — it names the exact outcomes in our response.' },
    { record: 'sue-ryder', outlet: 'THIRD SECTOR', when: 'YESTERDAY', headline: 'Sue Ryder opens four new shops across the North West', angle: 'Congratulate Rachel on the openings — the drafted outreach already references the expansion.' },
    { record: 'cruk', outlet: 'RETAIL GAZETTE', when: '2 DAYS AGO', headline: 'Cancer Research UK reviews retail technology partners', angle: 'Share with the human owner before the final terms call — public signal strengthens our position.' },
    { record: 'barnardos', outlet: 'CIVIL SOCIETY', when: 'THIS WEEK', headline: "Barnardo's board approves FY27 retail digitisation budget", angle: 'The proposal maps to this budget line — mention the board paper when it goes out.' },
    { record: 'salvation-army', outlet: 'CHARITY TIMES', when: 'THIS WEEK', headline: 'Salvation Army Trading creates first head of retail systems role', angle: 'The LinkedIn opener congratulates Grace — approve it and it references this coverage.' }
  ],

  /* ---- Gamification (§12): points = stage × band multiplier + bonuses − penalties ---- */
  race: { week: 'RACE — WEEK 31 OF 52', season: 'SEASON Q3 2026', fastestLap: 'FASTEST LAP: PRIYA KAUR — 11 MIN MEDIAN FIRST RESPONSE' },
  teamObjective: { label: 'TEAM OBJECTIVE — 10 CONTRACTS SIGNED THIS RACE', current: 7, target: 10 },
  reps: [
    { id: 'priya', pos: 'P1', name: 'Priya Kaur', points: 1240, rate: 92, note: '+50 incumbent win · fastest lap ×3', quota: 400000, closedYTD: 310000, commissionRate: 0.08, acceleratorRate: 0.12 },
    { id: 'dan', pos: 'P2', name: 'Dan Mercer', points: 1105, rate: 87, note: '+150 tender win (BHF pilot)', quota: 400000, closedYTD: 248000, commissionRate: 0.08, acceleratorRate: 0.12 },
    { id: 'sofia', pos: 'P3', name: 'Sofia Reyes', points: 980, rate: 81, note: 'YMCA save in progress', quota: 350000, closedYTD: 152000, commissionRate: 0.08, acceleratorRate: 0.12 },
    { id: 'james', pos: 'P4', name: 'James Tan', points: 720, rate: 73, note: 'Rookie season · handicap applied', quota: 250000, closedYTD: 84000, commissionRate: 0.08, acceleratorRate: 0.12 }
  ],

  /* ---- Deal ownership: every deal has one owner. 'tilly' = agent-run self-serve. ---- */
  owners: {
    'sue-ryder': 'priya', 'cruk': 'priya',
    'bhf': 'dan', 'barnardos': 'dan',
    'ymca': 'sofia', 'shelter': 'sofia',
    'salvation-army': 'james', 'emmaus': 'james',
    'mind': 'tilly', 'age-uk': 'tilly', 'scope': 'tilly', 'oxfam': 'tilly', 'trinity': 'tilly'
  },
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
    { t: '02:00', record: null, who: 'NIGHTLY RUN', msg: 'Scanned 4,218 shops — fetch, enrich and score complete' },
    { t: '02:04', record: null, who: 'NIGHTLY RUN', msg: '31 retailers expanding · 6 ready to talk — promoted to your grid' },
    { t: '07:12', record: 'bhf', who: 'BHF', msg: 'Entered pole band — 15-min response clock met' },
    { t: '08:30', record: 'cruk', who: 'CRUK', msg: 'Escalated — deal value £340k · red-tier contract with legal' },
    { t: '08:41', record: 'oxfam', who: 'OXFAM', msg: 'Lane change self-serve → assisted · audit entry written' },
    { t: '09:02', record: 'trinity', who: 'TRINITY', msg: 'Complaint detected — all sequences paused, human owner assigned' },
    { t: '09:15', record: 'ymca', who: 'YMCA', msg: 'Escalated — 2 negative replies · rep clock 4h started' },
    { t: '09:20', record: 'salvation-army', who: 'SALVATION ARMY', msg: 'Confidence below floor on a pricing question — asked a human' }
  ]
};
