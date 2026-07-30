/* Tilly CRM — prospect intel engine data.
   Market sizing, per-prospect buy intel (incumbent, contract expiry, best route in)
   and international region scoring. Figures are illustrative placeholders. */

const INTEL = {

  /* ---- Total addressable market: UK charity retail ---- */
  tam: {
    headline: [
      { label: 'UK CHARITY SHOPS (TAM)', value: '11,200' },
      { label: 'ORGANISATIONS RUNNING THEM', value: '3,900' },
      { label: 'SERVICEABLE (10+ SHOPS, SAM)', value: '4,850 shops' },
      { label: 'OBTAINABLE 3-YR (SOM)', value: '1,450 shops' }
    ],
    acv: [
      { label: 'TAM VALUE (ACV)', value: '£38.4m' },
      { label: 'SAM VALUE (ACV)', value: '£16.6m' },
      { label: 'SOM VALUE (ACV)', value: '£5.0m' },
      { label: 'CURRENT PENETRATION', value: '0.8%' }
    ],
    segments: [
      { seg: 'National chains (100+ shops)', orgs: 24, shops: 5400, acv: '£68k avg', motion: 'Enterprise — tender & ABM', note: 'Longest cycles, biggest logos. Tender watch is the way in.' },
      { seg: 'Large regionals (30–99 shops)', orgs: 61, shops: 3100, acv: '£31k avg', motion: 'Assisted — SDR + events', note: 'Sweet spot: budget exists, committee is small enough to move.' },
      { seg: 'Mid-size (10–29 shops)', orgs: 210, shops: 3350, acv: '£12k avg', motion: 'Assisted — signal-led outreach', note: 'Highest win rate. Often first system beyond spreadsheets.' },
      { seg: 'Small (2–9 shops)', orgs: 1180, shops: 4100, acv: '£3.2k avg', motion: 'Self-serve — paid ads + content', note: 'Volume play. Never rep-touched; funnel does the work.' },
      { seg: 'Single shop', orgs: 2425, shops: 2425, acv: '£900 avg', motion: 'Self-serve only', note: 'Served at zero marginal cost or not at all.' }
    ]
  },

  /* ---- Best-bet prospects: who to target and how ----
     buyScore blends fit, intent and timing pressure (contract expiry, funding, hiring). */
  prospects: [
    {
      name: 'St Barnabas Hospice Trading', shops: 42, seg: 'Large regional',
      buyScore: 91, competitor: 'Cybertill', expiry: 'Nov 2026', expiryMonths: 4,
      route: 'SDR outreach → retail director', play: 'Renewal window opens in 60 days. Land the switching-cost calculator before the incumbent QBR.',
      why: ['Incumbent contract expires Nov 2026 — inside the 6-month switch window', 'Hiring a head of retail systems', 'Trustee-network warm intro available']
    },
    {
      name: 'Emmaus UK', shops: 34, seg: 'Large regional',
      buyScore: 84, competitor: 'None (spreadsheets)', expiry: '—', expiryMonths: null,
      route: 'Events → Charity Retail Conference', play: 'No incumbent to displace — sell the category, not the product. Gift Aid uplift number leads.',
      why: ['No CRM or EPOS integration today', 'Federated structure just centralised retail ops', 'Attended our conference talk, 3 contacts engaged']
    },
    {
      name: 'PDSA Retail', shops: 120, seg: 'National chain',
      buyScore: 78, competitor: 'Kudos (Access Group)', expiry: 'Mar 2027', expiryMonths: 8,
      route: 'ABM → transformation lead', play: 'Too early to pitch the switch. Nurture with benchmark content; strike at the 6-month mark (Sep 2026… track it).',
      why: ['Board paper on retail digitisation minuted in annual report', 'Contract renewal Mar 2027 — nurture now, engage Sep', 'New commercial director from private-sector retail']
    },
    {
      name: 'YMCA England Retail', shops: 51, seg: 'Large regional',
      buyScore: 74, competitor: 'Nisyst', expiry: 'Jan 2027', expiryMonths: 6,
      route: 'Signal tracking → federated ops leads', play: 'Federation: win 2 regions as references, then the national deal. Switch window just opened.',
      why: ['Incumbent EPOS end-of-life announced', 'Two regional YMCAs already in our funnel', 'Retail digitisation grant application public']
    },
    {
      name: 'Oxfam Trading', shops: 560, seg: 'National chain',
      buyScore: 62, competitor: 'In-house build', expiry: '—', expiryMonths: null,
      route: 'Tender & RFP watch', play: 'In-house team is the competitor. Do not cold-pitch — wait for the tender; capability-match currently 71%.',
      why: ['In-house system, 14-year-old codebase', 'Dev team headcount shrinking (LinkedIn signal)', 'Historically tenders everything above £100k']
    },
    {
      name: 'Marie Curie Retail', shops: 170, seg: 'National chain',
      buyScore: 58, competitor: 'Cybertill', expiry: 'Aug 2028', expiryMonths: 25,
      route: 'Organic content → nurture only', play: 'Locked in for 2 years. Zero rep time — content nurture and an expiry alarm for Feb 2028.',
      why: ['Renewed incumbent 10 months ago', 'Contract runs to Aug 2028', 'Keep warm: retail leadership reads our Gift Aid research']
    }
  ],

  /* ---- Competitor landscape ---- */
  competitors: [
    { name: 'Cybertill (CharityStore)', share: '31% of SAM', strength: 'Incumbent EPOS estate, sector brand', weakness: 'CRM is bolt-on; no agent layer; per-till pricing stings at scale', pitch: 'We are the intelligence layer they never built. Integrate first, replace later.' },
    { name: 'Kudos / Access Group', share: '18% of SAM', strength: 'Group cross-sell, finance suite lock-in', weakness: 'Charity retail is a side product; roadmap starvation', pitch: 'Their roadmap serves the group. Ours serves this sector only.' },
    { name: 'Nisyst (CHARiot)', share: '11% of SAM', strength: 'Loyal mid-market base, Gift Aid heritage', weakness: 'EPOS end-of-life pending; cloud migration is a forced re-purchase', pitch: 'Their migration is our switch moment — same disruption, better destination.' },
    { name: 'In-house builds', share: '9% of SAM', strength: 'Perfect institutional fit, sunk-cost defence', weakness: '18-month backlogs, key-person risk', pitch: 'Undercut on time-to-value: we deploy in 3 weeks, not 18 months.' },
    { name: 'Spreadsheets / nothing', share: '31% of SAM', strength: 'Free and familiar', weakness: 'No Gift Aid capture, no pipeline, no memory', pitch: 'Category creation — sell the Gift Aid uplift, not the software.' }
  ],

  /* ---- Contract expiry radar: switch windows across the tracked estate ---- */
  expiries: [
    { org: 'St Barnabas Hospice Trading', vendor: 'Cybertill', expires: 'Nov 2026', window: 'OPEN', action: 'Engage now — switching-cost pack drafted' },
    { org: 'YMCA England Retail', vendor: 'Nisyst', expires: 'Jan 2027', window: 'OPEN', action: 'Engage now — regional reference play' },
    { org: 'PDSA Retail', vendor: 'Kudos', expires: 'Mar 2027', window: 'OPENS SEP 2026', action: 'Nurture — alarm set for the 6-month mark' },
    { org: 'Sense Retail', vendor: 'Cybertill', expires: 'Jun 2027', window: 'OPENS DEC 2026', action: 'Nurture — quarterly benchmark drop' },
    { org: 'Marie Curie Retail', vendor: 'Cybertill', expires: 'Aug 2028', window: 'CLOSED', action: 'Content only — expiry alarm Feb 2028' }
  ],

  /* ---- International growth regions ----
     score = market size × charity-retail maturity × regulatory fit × competitive whitespace */
  regions: [
    {
      region: 'Ireland', score: 86, shops: '600+', analogue: 'Gift Aid → Charitable Donation Scheme',
      whitespace: 'HIGH — no sector-specific CRM', entry: 'Direct from UK — same language, adjacent regulation, sterling-adjacent pricing',
      note: 'Lowest-friction first step. CRUK and Barnardo\'s equivalents (Irish Cancer Society, Enable Ireland) run meaningful estates.'
    },
    {
      region: 'Australia', score: 81, shops: '3,000+', analogue: 'DGR tax deductibility (no Gift Aid twin)',
      whitespace: 'HIGH — fragmented POS incumbents', entry: 'Remote-first pilot with 2 national charities (Vinnies, Salvos run 1,000+ shops between them)',
      note: 'Largest English-speaking estate outside the UK. Op-shop culture maps 1:1 to UK charity retail.'
    },
    {
      region: 'Netherlands', score: 64, shops: '1,400+', analogue: 'Kringloop reuse mandate (municipal)',
      whitespace: 'MEDIUM — reuse-sector software exists', entry: 'Partner with a kringloop federation; localisation required',
      note: 'Circular-economy regulation drives volume, but the buyer is often municipal — different sales motion.'
    },
    {
      region: 'Canada', score: 61, shops: '1,200+', analogue: 'Charitable receipting rules',
      whitespace: 'MEDIUM — US thrift software spills over', entry: 'Follow Value Village\'s for-profit shadow: pitch charities competing with it',
      note: 'Viable but crowded by US thrift tooling. Second wave, not first.'
    },
    {
      region: 'United States', score: 48, shops: '25,000+', analogue: 'None — donation receipting only',
      whitespace: 'LOW — Goodwill ecosystem has entrenched vendors', entry: 'Do not enter head-on. Watch for a wedge via faith-based independents.',
      note: 'Biggest market, worst fit: no Gift Aid analogue kills our core differentiator. Park it.'
    }
  ]
};
