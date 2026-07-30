/* Tilly CRM — mock data model.
   Every record mirrors the workflow: captured from a channel, auto-enriched,
   scored by the core, routed self-serve or enterprise, engaged, escalated
   only when a trigger fires. Figures are illustrative placeholders. */

const DATA = {
  records: [
    {
      id: 'sue-ryder', name: 'Sue Ryder Retail', initials: 'SR',
      charityNo: '1052076', incomeBand: '£10m–£100m', cause: 'Palliative care', staff: 2900, shops: 400,
      route: 'enterprise', stage: 'Engaged', fit: 92, likelihood: 78,
      channel: 'SDR outreach',
      contact: { name: 'Rachel Holt', role: 'Director of Retail Operations', tenure: '2 yrs 3 mo', note: 'Moved from BHF retail in 2024. Posts about Gift Aid digitisation.' },
      signals: ['Opening 4 shops in the North West', 'Hiring a retail systems manager', 'Warm intro found via trustee network'],
      competitive: { vs: 'Legacy EPOS incumbent', position: 'win', note: 'Incumbent has no AI prospecting. We win on speed to value.' },
      trace: ['sue_ryder: 4 new shops, north west', 'warm intro found via trustee network', 'drafting outreach — email, tuesday 09:10'],
      escalation: null,
      nextAction: 'Send drafted outreach'
    },
    {
      id: 'barnardos', name: "Barnardo's Trading", initials: 'BT',
      charityNo: '216250', incomeBand: '£100m+', cause: 'Children', staff: 8000, shops: 600,
      route: 'enterprise', stage: 'Proposal', fit: 82, likelihood: 71,
      channel: 'Events',
      contact: { name: 'Marcus Webb', role: 'Head of Trading', tenure: '5 yrs 1 mo', note: 'Met at Charity Retail Conference. Asked about Gift Aid uplift evidence.' },
      signals: ['Gift Aid uplift fits FY27 goals', 'Reviewing store tech stack', 'Board paper on retail digitisation due Q4'],
      competitive: { vs: 'Build in-house', position: 'undercut', note: 'In-house build quoted 18 months. Tilly deploys in 3 weeks.' },
      trace: ['barnardos: proposal auto-drafted from stated requirements', 'gift_aid_uplift: 12% modelled on their volumes', 'awaiting review'],
      escalation: null,
      nextAction: 'Review drafted proposal'
    },
    {
      id: 'bhf', name: 'British Heart Foundation Shops', initials: 'BH',
      charityNo: '225971', incomeBand: '£100m+', cause: 'Health research', staff: 4200, shops: 700,
      route: 'enterprise', stage: 'Tender', fit: 88, likelihood: 62,
      channel: 'Tender & RFP watch',
      contact: { name: 'Amara Osei', role: 'Retail Transformation Lead', tenure: '11 mo', note: 'New in role — came from grocery retail. Values hard numbers.' },
      signals: ['Live RFP: EPOS & CRM replacement', 'Deadline 22 Aug 2026', '14 decision makers mapped'],
      competitive: { vs: 'Two enterprise CRM vendors', position: 'win', note: 'Only bid with charity-retail-specific scoring. Price mid-pack.' },
      trace: ['bhf: rfp captured from framework listing', 'requirement matrix extracted — 41 line items', 'bid response 60% drafted'],
      escalation: null,
      nextAction: 'Complete bid response'
    },
    {
      id: 'cruk', name: 'Cancer Research UK Trading', initials: 'CR',
      charityNo: '1089464', incomeBand: '£100m+', cause: 'Health research', staff: 3900, shops: 570,
      route: 'enterprise', stage: 'Negotiation', fit: 79, likelihood: 84,
      channel: 'ABM campaigns',
      contact: { name: 'Daniel Price', role: 'Commercial Director', tenure: '6 yrs 8 mo', note: 'Negotiates hard. Prefers calls over email.' },
      signals: ['Multi-year contract on the table', 'Procurement requested security review', 'Deal value £340k over 3 years'],
      competitive: { vs: 'Incumbent renewal', position: 'win', note: 'Incumbent contract expires Oct. Switching cost objection cleared.' },
      trace: ['cruk: deal value £340k exceeds £100k threshold', 'ESCALATED — handed to human owner', 'context pack prepared'],
      escalation: 'Deal value above threshold',
      nextAction: 'Human owner: final terms call'
    },
    {
      id: 'mind', name: 'Mind Retail', initials: 'MR',
      charityNo: '219830', incomeBand: '£10m–£100m', cause: 'Mental health', staff: 1100, shops: 170,
      route: 'selfserve', stage: 'Trial', fit: 74, likelihood: 66,
      channel: 'Organic content',
      contact: { name: 'Jess Fielding', role: 'Retail Development Manager', tenure: '3 yrs 4 mo', note: 'Found us via the Gift Aid guide. Watched two webinars.' },
      signals: ['Trial started 11 days ago', '6 of 8 activation steps complete', 'Invited 3 colleagues'],
      competitive: { vs: 'Spreadsheets', position: 'win', note: 'No incumbent system. Activation is the only barrier.' },
      trace: ['mind: activation 75% — nudge sent for step 7', 'explainer video matched: donation tracking', 'upgrade offer queued for day 14'],
      escalation: null,
      nextAction: 'Automated — day-14 upgrade offer'
    },
    {
      id: 'salvation-army', name: 'Salvation Army Trading', initials: 'SA',
      charityNo: '215174', incomeBand: '£100m+', cause: 'Social welfare', staff: 4000, shops: 230,
      route: 'enterprise', stage: 'Prospecting', fit: 68, likelihood: 41,
      channel: 'Signal tracking',
      contact: { name: 'Grace Adeyemi', role: 'Head of Retail Systems (new post)', tenure: '2 mo', note: 'Role created this year — signal of systems investment.' },
      signals: ['Hiring: head of retail systems', 'Job ad mentions "CRM modernisation"', 'No incumbent vendor announced'],
      competitive: { vs: 'Open market', position: 'win', note: 'First mover. No competing conversation detected.' },
      trace: ['salvation_army: new role detected via hiring signal', 'dossier compiled — 2 conversation openers', 'outreach scheduled: linkedin, thursday'],
      escalation: null,
      nextAction: 'Approve LinkedIn opener'
    },
    {
      id: 'age-uk', name: 'Age UK Trading', initials: 'AU',
      charityNo: '1128267', incomeBand: '£10m–£100m', cause: 'Older people', staff: 1700, shops: 250,
      route: 'selfserve', stage: 'Onboarding', fit: 71, likelihood: 74,
      channel: 'Paid ads',
      contact: { name: 'Tom Barker', role: 'Regional Retail Manager', tenure: '4 yrs 6 mo', note: 'Converted from the shop-manager ad funnel. Self-checkout, starter plan.' },
      signals: ['Subscribed: starter plan, 12 shops', 'Onboarding 40% complete', 'Usage growing week on week'],
      competitive: { vs: '—', position: 'win', note: 'Already a customer. Expansion path: 250 shops total estate.' },
      trace: ['age_uk: onboarding nudge 3 of 6 sent', 'usage up 22% wow', 'expansion signal: second region viewed pricing'],
      escalation: null,
      nextAction: 'Automated — onboarding sequence'
    },
    {
      id: 'shelter', name: 'Shelter Shops', initials: 'SH',
      charityNo: '263710', incomeBand: '£10m–£100m', cause: 'Housing', staff: 1300, shops: 100,
      route: 'enterprise', stage: 'Prospecting', fit: 63, likelihood: 38,
      channel: 'Signal tracking',
      contact: { name: 'Fiona Marsh', role: 'Director of Fundraising & Trading', tenure: '7 yrs 2 mo', note: 'Speaks at sector events on retail innovation.' },
      signals: ['Grant awarded: retail digitisation fund', 'Tech stack: legacy till system, no CRM', 'Expanding furniture stores'],
      competitive: { vs: 'Open market', position: 'win', note: 'Grant funding earmarked for exactly what we sell.' },
      trace: ['shelter: grant award detected — retail digitisation', 'timing model: approach within 30 days', 'personalised deck assembling'],
      escalation: null,
      nextAction: 'Approve outreach timing'
    },
    {
      id: 'scope', name: 'Scope Stores', initials: 'SC',
      charityNo: '208231', incomeBand: '£10m–£100m', cause: 'Disability', staff: 900, shops: 150,
      route: 'selfserve', stage: 'Funnel', fit: 58, likelihood: 52,
      channel: 'Paid ads',
      contact: { name: 'Leah Quinn', role: 'Shop Manager, Bristol', tenure: '1 yr 9 mo', note: 'Clicked the volunteer-rota ad. Landing page personalised to rota pain.' },
      signals: ['Ad click → dynamic landing page', 'Trial signup form 80% complete', 'Abandoned at card step'],
      competitive: { vs: '—', position: 'win', note: 'Self-serve funnel. Recovery email queued.' },
      trace: ['scope: checkout abandoned at card step', 'recovery sequence: email 1 of 2 sent', 'landing page variant b assembled'],
      escalation: null,
      nextAction: 'Automated — recovery sequence'
    },
    {
      id: 'ymca', name: 'YMCA England Shops', initials: 'YM',
      charityNo: '212810', incomeBand: '£10m–£100m', cause: 'Young people', staff: 800, shops: 90,
      route: 'selfserve', stage: 'At risk', fit: 61, likelihood: 29,
      channel: 'Referral & partner',
      contact: { name: 'Owen Hughes', role: 'Trading Manager', tenure: '2 yrs 11 mo', note: 'Referred by a partner charity. Replied tersely to last two emails.' },
      signals: ['Sentiment turned negative in last reply', 'Usage dropped 40% in 3 weeks', 'Renewal due in 6 weeks'],
      competitive: { vs: 'Churn risk', position: 'lose', note: 'At risk. Human touch required before renewal conversation.' },
      trace: ['ymca: negative sentiment detected in reply', 'ESCALATED — handed to human owner', 'save-play context pack prepared'],
      escalation: 'Negative sentiment detected',
      nextAction: 'Human owner: check-in call'
    },
    {
      id: 'emmaus', name: 'Emmaus UK', initials: 'EM',
      charityNo: '1064470', incomeBand: '£1m–£10m', cause: 'Homelessness', staff: 350, shops: 40,
      route: 'selfserve', stage: 'Engaged', fit: 55, likelihood: 47,
      channel: 'Web & forms',
      contact: { name: 'Bea Collins', role: 'Community Director', tenure: '8 yrs 5 mo', note: 'Asked to "speak to a real person" in the demo request form.' },
      signals: ['Demo request via website', 'Explicitly asked for a person', 'Interested in furniture resale features'],
      competitive: { vs: 'Open market', position: 'win', note: 'Warm inbound. Route to human per explicit request.' },
      trace: ['emmaus: demo request captured from web form', 'ESCALATED — customer asked for a person', 'call slots offered'],
      escalation: 'Customer explicitly asks for a person',
      nextAction: 'Human owner: book demo call'
    },
    {
      id: 'oxfam', name: 'Oxfam Trading', initials: 'OX',
      charityNo: '202918', incomeBand: '£100m+', cause: 'Global poverty', staff: 5000, shops: 560,
      route: 'selfserve', stage: 'Won', fit: 85, likelihood: 100,
      channel: 'Organic content',
      contact: { name: 'Priti Shah', role: 'Head of Retail Innovation', tenure: '3 yrs 7 mo', note: 'Champion. Willing to be a case study.' },
      signals: ['Self-service signup: 214 shops on starter', 'Expansion candidate: full estate is 560', 'NPS 9 at day 30'],
      competitive: { vs: '—', position: 'win', note: 'Won. Usage-triggered tier move queued when region 2 activates.' },
      trace: ['oxfam: 214 shops active', 'upsell trigger armed: region 2 activation', 'case study request drafted'],
      escalation: null,
      nextAction: 'Automated — upsell on trigger'
    }
  ],

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
    { name: 'Org intelligence', desc: 'Charity number, income band, cause area, staff size' },
    { name: 'Contact intelligence', desc: 'Job changes, role moves, tenure, seniority' },
    { name: 'Signal tracking', desc: 'Grant awards, funding rounds, tech stack, hiring' },
    { name: 'Social & interests', desc: 'Public posts, causes, conversation starters' }
  ],

  core: [
    { name: 'Predictive scoring', desc: 'Ranks every prospect by likelihood to convert' },
    { name: 'Competitive analysis', desc: 'Where we win, lose, or can undercut' },
    { name: 'Autonomous agent', desc: 'Runs the journey end-to-end, no human needed' },
    { name: 'Personalisation engine', desc: 'Decides content, tone and timing per person' }
  ],

  escalationTriggers: [
    'Deal value above threshold',
    'Negative sentiment detected',
    'Complex negotiation',
    'Compliance / legal sign-off',
    'Customer explicitly asks for a person'
  ],

  engageQueue: [
    { record: 'sue-ryder', type: 'EMAIL', item: 'Outreach — 4 new shops, warm intro referenced', channel: 'Email', when: 'Tue 09:10', status: 'Awaiting approval' },
    { record: 'salvation-army', type: 'LINKEDIN', item: 'Opener — congratulations on the new systems role', channel: 'LinkedIn', when: 'Thu 08:30', status: 'Awaiting approval' },
    { record: 'mind', type: 'VIDEO', item: 'Explainer — donation tracking in action, 90s cut', channel: 'In-product', when: 'Today', status: 'Scheduled' },
    { record: 'barnardos', type: 'PROPOSAL', item: 'Proposal — Gift Aid uplift, scoped from stated requirements', channel: 'Email', when: 'On approval', status: 'Drafted' },
    { record: 'cruk', type: 'CONTRACT', item: 'Contract — 3-year terms generated from captured needs', channel: 'Human owner', when: 'Escalated', status: 'With human' },
    { record: 'shelter', type: 'DOSSIER', item: 'Dossier — grant award, event talks, 2 conversation openers', channel: 'Internal', when: 'Ready', status: 'Ready' },
    { record: 'scope', type: 'EMAIL', item: 'Recovery — finish setting up your trial, 2 of 2', channel: 'Email', when: 'Tomorrow 10:00', status: 'Scheduled' },
    { record: 'bhf', type: 'PROPOSAL', item: 'Bid response — 41 requirement line items, 60% drafted', channel: 'Portal', when: '22 Aug deadline', status: 'Drafting' }
  ],

  reps: [
    { pos: 'P1', name: 'Priya Kaur', rate: 92, streak: 'Fastest lap: 4-day close' },
    { pos: 'P2', name: 'Dan Mercer', rate: 87, streak: '3 wins this week' },
    { pos: 'P3', name: 'Sofia Reyes', rate: 81, streak: 'Best recovery: YMCA save in progress' },
    { pos: 'P4', name: 'James Tan', rate: 73, streak: 'Rookie season' }
  ],

  products: [
    { pos: 'P1', name: 'Membership subscription', rate: 71 },
    { pos: 'P2', name: 'Enterprise contract package', rate: 58 },
    { pos: 'P3', name: 'Add-on services', rate: 44 }
  ],

  cockpitStats: [
    { label: 'HOT LEADS', value: '38' },
    { label: 'AVG CONVERT LIKELIHOOD', value: '64%' },
    { label: 'IN PIT LANE (SUPPORT)', value: '5' },
    { label: 'TEAM STREAK', value: '7 DAYS' }
  ],

  feed: [
    'scanned 4,218 shops · 02:00',
    '31 expanding · 6 ready to talk',
    'bhf: bid response 60% drafted',
    'cruk: escalated — deal value £340k',
    'salvation_army: new systems role detected',
    'shelter: grant award — approach within 30 days',
    'ymca: escalated — negative sentiment',
    'oxfam: upsell trigger armed'
  ]
};
