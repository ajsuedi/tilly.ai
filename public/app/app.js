/* Tilly CRM — hash router + view renderers. No build step, no dependencies.
   Likelihood, band and lane are computed here per the build spec:
   §4.3 blend, §4.4 bands, §6.2 complexity lanes. */

const $view = document.getElementById('view');
const recById = id => DATA.records.find(r => r.id === id);
const esc = s => String(s).replace(/[&<>"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));

/* ---- The model (§4.3, §4.4, §6.2) ---- */

const band = l => l >= 80 ? 'POLE' : l >= 60 ? 'FRONT ROW' : l >= 40 ? 'MIDFIELD' : l >= 20 ? 'BACK MARKER' : 'COLD';
const lane = c => c <= 24 ? 'selfserve' : c <= 54 ? 'assisted' : 'enterprise';

DATA.records.forEach(r => {
  r.likelihood = Math.round(0.4 * r.fit + 0.6 * r.intent);
  r.band = band(r.likelihood);
  r.lane = lane(r.complexity);
  r.logo = DATA.logos[r.id];
  r.acvNum = DATA.acvNums[r.id];
  r.owner = DATA.owners[r.id];
  Object.assign(r, DATA.deals[r.id]);
});

const repById = id => DATA.reps.find(x => x.id === id);
const ownerName = r => r.owner === 'tilly' ? 'Tilly (agent)' : repById(r.owner).name;

/* CS health flags (§2.3): band by score, escalate one level on a falling trend */
const FLAG_ORDER = ['RED FLAG', 'SAFETY CAR', 'YELLOW FLAG', 'GREEN FLAG'];
const flagFor = h => {
  let i = h.score >= 75 ? 3 : h.score >= 55 ? 2 : h.score >= 35 ? 1 : 0;
  if (h.d30 <= -10 || h.d7 <= -15) i = Math.max(0, i - 1);
  return FLAG_ORDER[i];
};
/* Churn radar: risk = (100 − health) + trend penalty + renewal proximity */
const riskFor = h => Math.min(100, Math.round((100 - h.score) + 1.5 * Math.max(0, -h.d30) + (h.renewalSoon ? 10 : 0)));
const riskBand = v => v >= 60 ? 'CRITICAL' : v >= 40 ? 'HIGH' : v >= 25 ? 'MEDIUM' : 'LOW';
const riskChip = v => {
  const b = riskBand(v);
  const style = b === 'CRITICAL' ? 'background:var(--tilly-red);border-color:var(--tilly-red);color:#fff'
    : b === 'HIGH' ? 'color:var(--tilly-red);border-color:var(--tilly-red)'
    : b === 'MEDIUM' ? '' : 'color:var(--tilly-green);border-color:var(--tilly-grey-200)';
  return `<span class="chip" style="${style}">${v} · ${b}</span>`;
};

const flagChip = f => ({
  'GREEN FLAG': `<span class="chip chip-won">GREEN FLAG</span>`,
  'YELLOW FLAG': `<span class="chip">YELLOW FLAG</span>`,
  'SAFETY CAR': `<span class="chip chip-esc">SAFETY CAR</span>`,
  'RED FLAG': `<span class="chip" style="background:var(--tilly-red);border-color:var(--tilly-red);color:#fff">RED FLAG</span>`
})[f];

const gbp = n => n >= 1e6 ? '£' + (n / 1e6).toFixed(2) + 'm' : n >= 1000 ? '£' + Math.round(n / 1000) + 'k' : '£' + n;
const pipeValue = recs => recs.reduce((s, r) => s + r.acvNum, 0);
const weightedValue = recs => Math.round(recs.reduce((s, r) => s + r.acvNum * r.likelihood / 100, 0));
const liveARR = () => DATA.subscriptions.reduce((s, x) => s + 12 * (parseInt(x.mrr.replace(/[£,]/g, '')) || 0), 0);

/* ---- UI state (in-memory only) ---- */

let searchQuery = '';
let bandFilter = 'ALL';
let laneFilter = 'ALL';
let previewVideo = null;
let pipeView = 'list';
let dragId = null;
const expandedGrid = new Set();

/* Canonical board columns — both lanes mapped onto one drag-and-drop flow */
const BOARD_COLS = ['Prospecting', 'Engaged', 'Proposal', 'Negotiation', 'Won'];
const BOARD_MAP = { 'Prospecting': 'Prospecting', 'Engaged': 'Engaged', 'Funnel': 'Engaged', 'Identified': 'Engaged', 'Trial': 'Engaged', 'Proposal': 'Proposal', 'Tender': 'Proposal', 'Negotiation': 'Negotiation', 'Onboarding': 'Won', 'Paid': 'Won', 'Expansion': 'Won', 'At risk': 'Won', 'Support': 'Won', 'Won': 'Won' };

/* ---- The starting grid: everything that needs a human, by urgency ---- */

const URGENCY_RANK = { 'IMMEDIATE': 0, '15 MIN': 1, '4 H': 2, 'TODAY': 3, '1 DAY': 4, '3 DAYS': 5 };

const ESC_ACTIONS = {
  'Deal value above threshold': ['Take the final terms call — it is on your task list', 'The contract is with legal (red tier, 3-day SLA)', 'Tilly keeps research and drafting running behind you'],
  'Negative sentiment detected': ['Call inside the 4-hour SLA', 'Lead with the pause offer, not a discount — grant-funded sector', 'The save-play context pack is on the record'],
  'Safeguarding or complaint raised': ['Call first — the refund is already queued', 'Confirm the duplicate charge is reversed', 'Close the complaint; paused sequences resume automatically'],
  'Customer explicitly asks for a person': ['Book the demo — slots already offered', 'No qualifying questions first', 'Granola records it and sets the next step you say out loud']
};

function startingGrid() {
  const items = [];
  DATA.records.filter(r => r.band === 'POLE' && !r.escalation).forEach(r =>
    items.push({ r, label: 'POLE — RESPONSE CLOCK RUNNING', urgency: '15 MIN', action: r.nextAction, goto: `#/record/${r.id}`,
      steps: ['Call now — the 15-minute clock is running', 'Or send the drafted outreach unchanged', 'Log the outcome; Granola captures the next step'] }));
  DATA.records.filter(r => r.escalation).forEach(r => {
    const u = /Safeguarding|asks for a person/.test(r.escalation) ? 'IMMEDIATE'
      : /sentiment/.test(r.escalation) ? '4 H' : 'TODAY';
    items.push({ r, label: r.escalation.toUpperCase(), urgency: u, action: r.nextAction, goto: `#/record/${r.id}`,
      steps: ESC_ACTIONS[r.escalation] || ['Open the record for the context pack'] });
  });
  DATA.engageQueue.filter(q => /^(AMBER|RED)/.test(q.authority) && !q.approved).forEach(q =>
    items.push({ r: recById(q.record), label: 'APPROVAL WAITING — ' + q.authority, urgency: q.authority.startsWith('AMBER') ? '1 DAY' : '3 DAYS', action: 'Review & approve', goto: '#/engage',
      steps: ['Open the draft and check the discount against the ladder', 'Approve — it sends itself', 'Or push back with a reason code; Tilly redrafts'] }));
  return items.sort((a, b) => URGENCY_RANK[a.urgency] - URGENCY_RANK[b.urgency]);
}

/* ---- Shared fragments ---- */

const avatar = (r, size = 32) =>
  `<div class="avatar" style="width:${size}px;height:${size}px;font-size:${Math.round(size * 0.38)}px;background:${r.logo || 'var(--tilly-blue)'}">${r.initials}</div>`;

const stageChip = r => {
  if (r.escalation) return `<span class="chip chip-esc">ESCALATED</span>`;
  if (r.stage === 'Won' || r.stage === 'Expansion') return `<span class="chip chip-won">${esc(r.stage.toUpperCase())}</span>`;
  return `<span class="chip">${esc(r.stage.toUpperCase())}</span>`;
};

/* Tooltips built from the model itself, so the hover text can't drift from the spec */
const BAND_TIPS = Object.fromEntries(DATA.model.bands.map(b => [b.band, `Likelihood ${b.range}. ${b.behaviour}`]));
const LANE_TIPS = Object.fromEntries(DATA.model.lanes.map(l => [l.lane, `Complexity ${l.range}. ${l.ownership}`]));
const TIER_TIPS = Object.fromEntries(DATA.model.tiers.map(t => [t.tier, `${t.capability}. ${t.constraint}`]));

const laneChip = r => ({
  enterprise: `<span class="chip chip-enterprise" data-tip="${esc(LANE_TIPS['ENTERPRISE'])}">ENTERPRISE</span>`,
  assisted: `<span class="chip chip-assisted" data-tip="${esc(LANE_TIPS['ASSISTED'])}">ASSISTED</span>`,
  selfserve: `<span class="chip chip-selfserve" data-tip="${esc(LANE_TIPS['SELF-SERVE'])}">SELF-SERVE</span>`
})[r.lane];

const bandChip = r => {
  const cls = { 'POLE': 'chip-pole', 'FRONT ROW': 'chip-front', 'MIDFIELD': '', 'BACK MARKER': 'chip-back', 'COLD': 'chip-back' }[r.band];
  return `<span class="chip ${cls}" data-tip="${esc(BAND_TIPS[r.band])}">${r.band}</span>`;
};

const tierChip = r => r.tier === 'HUMAN'
  ? `<span class="chip chip-esc" data-tip="An escalation trigger fired — a named human owns this deal now. The agent stays on research, drafting and admin.">HUMAN OWNER</span>`
  : `<span class="chip" data-tip="${esc(TIER_TIPS[r.tier] || '')}">AGENT ${esc(r.tier)}</span>`;

const likelihoodBar = v =>
  `<span class="likelihood"><span class="bar"><b style="width:${v}%"></b></span><span class="m-data">${v}%</span></span>`;

const byLikelihood = records => [...records].sort((a, b) => b.likelihood - a.likelihood);

const recordRows = records => records.map(r => `
  <tr class="click${r.band === 'POLE' ? ' pole' : ''}" data-id="${r.id}">
    <td><div style="display:flex;align-items:center;gap:12px">${avatar(r)}<span style="font-weight:600">${esc(r.name)}</span>${r.agentSourced ? '<span class="chip chip-pole" style="font-size:9px;padding:3px 7px">NEW · AGENT</span>' : ''}</div></td>
    <td>${laneChip(r)}</td>
    <td>${bandChip(r)}</td>
    <td>${stageChip(r)}</td>
    <td><span class="fit">${r.fit} FIT</span> <span class="m-data t-muted">· ${r.intent} INT</span></td>
    <td>${likelihoodBar(r.likelihood)}</td>
    <td class="t-caption">${esc(r.nextAction)}</td>
  </tr>`).join('');

const recordTable = records => `
  <table class="tbl">
    <thead><tr><th>Account</th><th>Lane</th><th>Band</th><th>Stage</th><th>Fit · Intent</th><th>Likelihood</th><th>Next action</th></tr></thead>
    <tbody>${recordRows(byLikelihood(records))}</tbody>
  </table>`;

const cardGrid = items => `
  <div class="grid-4">${items.map(c => `
    <div class="panel" style="padding:18px 20px">
      <div class="t-heading" style="font-size:14px">${esc(c.name)}</div>
      <div class="t-caption" style="margin-top:4px">${esc(c.desc)}</div>
      ${c.week !== undefined ? `<div class="m-data" style="margin-top:12px;color:var(--tilly-blue)">${c.week} THIS WEEK</div>` : ''}
    </div>`).join('')}
  </div>`;

const specTable = (headers, rows) => `
  <table class="tbl">
    <thead><tr>${headers.map(h => `<th>${esc(h)}</th>`).join('')}</tr></thead>
    <tbody>${rows.map(cells => `<tr>${cells.map(c => `<td>${c}</td>`).join('')}</tr>`).join('')}</tbody>
  </table>`;

const board = (title, rows) => `
  <div class="board">
    <div class="zone-head"><span class="m-label" style="margin:0">${esc(title)}</span></div>
    ${rows.map((r, i) => `
      <div class="board-row${i === 0 ? ' lead' : ''}">
        <span class="pos">${r.pos}</span>
        <span class="name">${esc(r.name)}${r.note ? ` <span class="detail">— ${esc(r.note)}</span>` : ''}</span>
        <span class="bar"><b style="width:${r.points ? Math.round(100 * r.points / rows[0].points) : r.rate}%"></b></span>
        <span class="val">${r.points ? r.points + ' PTS' : r.rate + '%'}</span>
      </div>`).join('')}
  </div>`;

/* Deal-progress board: one column per stage, cards click through to the dossier */
const kanban = (stages, pick) => `
  <div class="kanban" style="grid-template-columns:repeat(${stages.length},1fr)">
    ${stages.map(s => {
      const cards = byLikelihood(DATA.records.filter(r => pick(r) === s.key));
      return `
        <div class="kcol">
          <div class="m-label" style="display:block;margin-bottom:8px">${esc(s.label)} · ${cards.length}</div>
          ${cards.map(r => `
            <div class="kcard click" data-id="${r.id}">
              <div style="display:flex;align-items:center;gap:10px">${avatar(r, 26)}<span style="font-weight:600;font-size:13px">${esc(r.name)}</span></div>
              <div style="display:flex;justify-content:space-between;align-items:center;margin-top:10px">
                <span class="m-data" style="color:var(--tilly-blue)">${r.likelihood}%</span>
                <span class="m-data t-muted">${esc(r.acv.split(' ')[0])}</span>
              </div>
            </div>`).join('') || '<div class="t-caption" style="padding:6px 0">—</div>'}
        </div>`;
    }).join('')}
  </div>`;

const backLink = () => `<a href="#/pipeline" class="btn btn-text" style="padding:16px 0 0;display:inline-block">← Pipeline</a>`;

/* Pipeline stage tracker + next step — so a rep always knows where the deal is and what to do */
const STAGE_SEQ = {
  enterprise: ['Prospecting', 'Engaged', 'Proposal', 'Negotiation', 'Won'],
  selfserve: ['Prospecting', 'Identified', 'Trial', 'Paid', 'Expanded']
};
const STAGE_ALIAS = { 'Tender': 'Proposal', 'Funnel': 'Identified', 'Onboarding': 'Paid', 'Expansion': 'Expanded', 'Support': 'Paid', 'At risk': 'Paid' };
const NEXT_HINT = {
  'enterprise:Engaged': 'a first meeting or threaded reply moves it here',
  'enterprise:Proposal': 'issuing the proposal or bid response moves it here',
  'enterprise:Negotiation': 'a terms conversation moves it here',
  'enterprise:Won': 'countersignature moves it here — commission pays on this',
  'selfserve:Identified': 'an email captured or org resolved moves it here',
  'selfserve:Trial': 'account created moves it here',
  'selfserve:Paid': 'first successful charge moves it here',
  'selfserve:Expanded': 'a seat or tier increase moves it here'
};

function stageIndex(r, seq) {
  if (r.stage === 'Won') return seq.length - 1;
  let s = STAGE_ALIAS[r.stage] || r.stage;
  if (r.lane !== 'enterprise' && s === 'Engaged') s = 'Identified';
  const i = seq.indexOf(s);
  return i < 0 ? 0 : i;
}

function stageBar(r) {
  const laneKey = r.lane === 'enterprise' ? 'enterprise' : 'selfserve';
  const seq = STAGE_SEQ[laneKey];
  const cur = stageIndex(r, seq);
  const nextStage = seq[cur + 1];
  return `
    <span class="m-label" style="display:block;margin-bottom:8px">PIPELINE STAGE — ${esc(laneKey === 'enterprise' ? 'ENTERPRISE PATH' : 'SELF-SERVE PATH')}</span>
    <div class="stagebar">
      ${seq.map((s, i) => `
        <div class="sseg${i < cur ? ' done' : i === cur ? ' cur' : i === cur + 1 ? ' next' : ''}">
          <span class="sn">${i < cur ? '✓ DONE' : i === cur ? '● NOW' : 'STAGE ' + (i + 1)}</span>
          <span class="sl">${esc(i === cur ? r.stage : s)}</span>
        </div>`).join('')}
    </div>
    ${nextStage ? `<div class="t-caption" style="margin-bottom:24px">Next stage: <b>${esc(nextStage)}</b> — ${esc(NEXT_HINT[laneKey + ':' + nextStage] || '')}</div>` : `<div class="t-caption" style="margin-bottom:24px">Final stage — protect it and expand it.</div>`}`;
}

function nextStepPanel(r) {
  const clock = r.escalation === 'Negative sentiment detected' ? 'SLA — 4 WORKING HOURS'
    : r.escalation ? 'IMMEDIATE'
    : r.band === 'POLE' ? '15-MIN RESPONSE CLOCK'
    : r.band === 'FRONT ROW' ? 'TODAY'
    : 'THIS WEEK';
  const task = DATA.tasks.find(t => t.record === r.id && !t.done);
  return `
    <div class="panel" style="border:2px solid var(--tilly-blue);padding:24px;margin-bottom:8px">
      <span class="m-label" style="color:var(--tilly-blue)">YOUR NEXT STEP · ${clock}</span>
      <div class="t-heading" style="font-size:22px;letter-spacing:-0.8px;margin:6px 0 8px">${esc(r.nextAction)}</div>
      <div class="t-caption" style="margin-bottom:18px"><b>Why now:</b> ${esc(r.verdict.play)}</div>
      <div style="display:flex;gap:10px;align-items:center;flex-wrap:wrap">
        ${r.actionQueued
          ? `<span class="m-data" style="color:var(--tilly-green)">✓ QUEUED — TILLY'S ON IT</span>`
          : `<button class="btn btn-primary" data-do="${r.id}">${esc(r.tier === 'HUMAN' ? 'Take it — you own this one' : 'Do it now')}</button>`}
        ${task ? `<button class="btn btn-secondary" data-goto="#/tasks">On your task list — ${esc(task.due)}</button>` : ''}
        <button class="btn btn-outline" data-ask-open>Ask Tilly about this deal</button>
        <span style="margin-left:auto">${tierChip(r)}</span>
      </div>
    </div>`;
}

/* Tilly's radio: the labelled live feed — timestamp, account, what happened, click through */
const radio = items => `
  <div class="feed">
    <div class="feed-head"><span class="feed-live">● LIVE</span><span class="feed-title">TILLY'S RADIO — WHAT YOUR AGENT DID, AND WHY</span><span class="feed-sub">IF IT'S MONO, THE AI SAID IT</span></div>
    ${items.map(f => {
      const r = f.record ? recById(f.record) : null;
      return `<div class="feed-row${r ? ' click' : ''}"${r ? ` data-id="${r.id}"` : ''}><span class="ft">${esc(f.t)}</span><span class="fa">${esc(f.who)}</span><span class="fm">${esc(f.msg)}</span>${r ? '<span class="go">OPEN →</span>' : ''}</div>`;
    }).join('')}
  </div>`;

function S_setRetention(recordId, status) {
  DATA.success.retention[recordId] = status;
  render();
}

/* ---- Views ---- */

const views = {

  cockpit() {
    const grid = startingGrid();
    const openTasks = DATA.tasks.filter(t => !t.done).length;
    const pole = DATA.records.filter(r => r.band === 'POLE').length;
    const stats = [
      { label: 'NEED A HUMAN NOW', value: String(grid.length), cls: ' stat-blue', attr: 'data-scroll=".f1wrap"' },
      { label: 'OPEN TASKS', value: String(openTasks), cls: '', attr: 'data-goto="#/tasks"' },
      { label: 'POLE — HOT LEADS', value: String(pole), cls: '', attr: 'data-pole-filter' },
      { label: 'TEAM STREAK', value: '7 DAYS', cls: ' stat-dark', attr: 'data-scroll="#championships"' }
    ];
    const t = DATA.teamObjective;
    return `
      <h1 class="t-title page-title">Cockpit</h1>
      <p class="t-body t-muted page-sub">${esc(DATA.race.week)} · ${esc(DATA.race.season)}. Charity retail buys slowly — the F1 format is how we keep race pace inside the team anyway. Your grid is below; click a row to see exactly what to do.</p>
      <div class="stats">
        ${stats.map(s => `<div class="stat click${s.cls}" ${s.attr}><span class="m-label">${s.label}</span><strong>${s.value}</strong><span class="stat-go">→</span></div>`).join('')}
      </div>
      <div class="gap"></div>
      <div class="f1wrap">
        <div class="f1head">
          <span class="checker"></span>
          <span class="m-label" style="margin:0;color:#fff">STARTING GRID — TIGHTEST CLOCK ON POLE</span>
          <span class="m-data" style="margin-left:auto;color:rgba(255,255,255,.45)">${grid.length} ON THE GRID</span>
        </div>
        <div class="f1grid">
          ${[['ENTERPRISE SIDE', grid.filter(g => g.r.lane === 'enterprise'), ''],
             ['SELF-SERVE & ASSISTED SIDE', grid.filter(g => g.r.lane !== 'enterprise'), ' f1col-r']].map(([laneTitle, items, cls]) => `
          <div class="f1col${cls}">
            <div class="f1lane">${laneTitle}</div>
            ${items.map(g => `
            <div class="f1slot" data-goto="#/record/${g.r.id}">
              <div class="f1top"><span class="f1pos">P${grid.indexOf(g) + 1}</span><span class="f1clock">▮ ${g.urgency}</span></div>
              <div style="display:flex;align-items:center;gap:12px">
                ${avatar(g.r, 30)}
                <div style="min-width:0"><div class="f1name">${esc(g.r.name)}</div><div class="f1why">${esc(g.label)}</div></div>
              </div>
            </div>`).join('') || '<div class="f1lane">CLEAR — NOTHING NEEDS A HUMAN</div>'}
          </div>`).join('')}
        </div>
      </div>
      <div class="t-caption" style="margin-top:10px">P1 is your tightest clock. Click a slot to open the deal — its next step and action items are at the top of the dossier.</div>
      <div class="gap-lg"></div>
      <div class="m-section" style="margin-bottom:16px">TOP 10 OPPORTUNITIES — BY WEIGHTED VALUE</div>
      <div class="board">
        ${[...DATA.records].sort((a, b) => b.acvNum * b.likelihood - a.acvNum * a.likelihood).slice(0, 10).map((r, i) => `
          <div class="board-row click${i === 0 ? ' lead' : ''}" data-id="${r.id}">
            <span class="pos">P${i + 1}</span>
            ${avatar(r, 26)}
            <span class="name">${esc(r.name)} <span class="detail">— ${esc(r.nextAction)}</span></span>
            ${bandChip(r)}
            <span class="m-data" style="color:var(--tilly-blue);min-width:52px;text-align:right">${gbp(r.acvNum)}</span>
            <span class="val">${r.likelihood}%</span>
          </div>`).join('')}
      </div>
      <div class="gap"></div>
      <div class="m-section" style="margin:24px 0 16px">MEDIA MONITOR — NEWS ON YOUR ENTERPRISE BOOK · REASONS TO REACH OUT</div>
      <div class="board">
        ${DATA.media.map(m => {
          const r = recById(m.record);
          return `
          <div class="grid-row" data-goto="#/record/${r.id}">
            ${avatar(r)}
            <div style="flex:1;min-width:0">
              <div class="t-heading" style="font-size:14px">${esc(m.headline)}</div>
              <div class="m-data t-muted" style="font-size:10px">${esc(m.outlet)} · ${esc(m.when)} · ${esc(r.name.toUpperCase())}</div>
              <div class="t-caption" style="margin-top:6px">${esc(m.angle)}</div>
            </div>
            <button class="btn btn-primary btn-sm" data-goto="#/record/${r.id}">Engage</button>
          </div>`;
        }).join('')}
      </div>
      <div class="gap-lg"></div>
      <div class="m-section" id="championships" style="margin-bottom:16px">THE CHAMPIONSHIPS</div>
      <div class="tower">
        <div class="f1head" style="padding:0 0 12px;margin-bottom:4px">
          <span class="checker"></span>
          <span class="m-label" style="margin:0;color:#fff">DRIVERS' CLASSIFICATION — ${esc(DATA.race.season)}</span>
        </div>
        ${[...DATA.reps].sort((a, b) => b.points - a.points).map((r, i, a) => `
          <div class="trow">
            <span class="tpos">${i + 1}</span>
            <span class="tstripe" style="background:${['var(--tilly-blue)', '#FFFFFF', '#9AA3B2', '#5B616E'][i] || '#5B616E'}"></span>
            <span class="tcode">${esc(r.name.split(' ')[1].slice(0, 3).toUpperCase())}</span>
            <span class="tname">${esc(r.name)} — ${esc(r.note)}</span>
            ${r.id === 'priya' ? '<span class="tfl">FASTEST LAP</span>' : ''}
            <span class="tgap">${i === 0 ? r.points + ' PTS' : '+' + (a[i - 1].points - r.points) + ' INT'}</span>
          </div>`).join('')}
      </div>
      <div class="m-data t-muted" style="display:block;margin:6px 0 0">${esc(DATA.race.fastestLap)} · INT = POINTS TO THE DRIVER AHEAD</div>
      <div class="gap"></div>
      ${board("CONSTRUCTORS' — PRODUCTS BY WIN RATE", DATA.products)}
      <div class="gap"></div>
      <div class="panel" style="padding:18px 20px">
        <span class="m-label">${esc(t.label)}</span>
        <div class="likelihood" style="margin-top:4px"><span class="bar" style="width:100%;height:8px"><b style="width:${Math.round(100 * t.current / t.target)}%"></b></span><span class="m-data">${t.current} / ${t.target}</span></div>
        <div class="t-caption" style="margin-top:10px">Shared target unlocks a team reward — the board never goes zero-sum.</div>
      </div>
      <div class="gap"></div>
      ${radio(DATA.feed)}`;
  },

  tasks() {
    const groups = ['NOW', 'TODAY', 'THIS WEEK'];
    const open = DATA.tasks.filter(t => !t.done).length;
    const done = DATA.tasks.length - open;
    return `
      <h1 class="t-title page-title">Tasks</h1>
      <p class="t-body t-muted page-sub">Your day, kept to what only a human can do: meetings, calls, approvals. Everything else Tilly does herself — and tasks marked AUTO were set from what you said out loud in a Granola-recorded meeting.</p>
      <div class="panel" style="padding:18px 20px;margin-bottom:8px">
        <span class="m-label">TODAY'S LAP — ${done} OF ${DATA.tasks.length} DONE</span>
        <div class="likelihood" style="margin-top:4px"><span class="bar" style="width:100%;height:8px"><b style="width:${Math.round(100 * done / DATA.tasks.length)}%"></b></span><span class="m-data">${Math.round(100 * done / DATA.tasks.length)}%</span></div>
      </div>
      ${groups.map(g => {
        const ts = DATA.tasks.map((t, i) => ({ t, i })).filter(x => x.t.due === g);
        if (!ts.length) return '';
        return `
          <div class="board" style="margin-bottom:8px">
            <div class="zone-head"><span class="m-label" style="margin:0">${g}</span><span class="m-data t-muted">${ts.filter(x => !x.t.done).length} OPEN</span></div>
            ${ts.map(({ t, i }) => {
              const r = recById(t.record);
              return `
              <div class="task-row${t.done ? ' done' : ''}">
                <button class="tick${t.done ? ' on' : ''}" data-task="${i}" aria-label="toggle">${t.done ? '✓' : ''}</button>
                ${avatar(r, 26)}
                <div style="flex:1;min-width:0" class="click" data-goto="${t.goto || '#/record/' + r.id}">
                  <div class="t-heading task-title" style="font-size:14px">${esc(t.title)}</div>
                  <div class="t-caption" style="font-size:11px">${esc(t.source)}</div>
                </div>
                ${t.auto ? '<span class="chip chip-pole" style="font-size:9px">AUTO · GRANOLA</span>' : ''}
                <span class="chip">${esc(t.kind)}</span>
              </div>`;
            }).join('')}
          </div>`;
      }).join('')}
      <div class="panel" style="padding:18px 20px">
        <span class="m-label">HOW TASKS GET HERE</span>
        <div class="t-caption" style="line-height:2">Escalations and approvals create tasks automatically. Meetings recorded by Granola create follow-ups from the next step you set verbally — say "I'll send the proposal by Friday" in the call and it appears here, dated, before you're back at your desk. You never type a task.</div>
      </div>`;
  },

  funnel() {
    const F = DATA.funnel;
    return `
      <h1 class="t-title page-title">Top of funnel</h1>
      <p class="t-body t-muted page-sub">Tilly fetches, enriches and qualifies leads every night at 02:00. Your job is three things: turn up, coach, and say the next step out loud — Granola records it and the CRM sets it. Selling here is teaching; most of your buyers have never used anything like what you sell.</p>
      <div class="stats">
        ${F.run.map((s, i) => `<div class="stat${i === 3 ? ' stat-blue' : ''}"><span class="m-label">${s.label}</span><strong>${s.value}</strong></div>`).join('')}
      </div>
      <div class="gap-lg"></div>
      <div class="m-section" style="margin-bottom:16px">THE AGENT FLOW — TILLY ACTS, YOU APPROVE</div>
      <div class="stagebar" id="agent-flow">
        ${F.flow.map((s, i) => `
          <div class="sseg" id="agent-seg-${i}">
            <span class="sn">${s.tier} · STEP ${i + 1}</span>
            <span class="sl">${esc(s.step)}</span>
          </div>`).join('')}
      </div>
      <div class="t-caption" style="margin-bottom:16px">${F.flow.map(s => esc(s.step.charAt(0) + s.step.slice(1).toLowerCase()) + ': ' + esc(s.desc)).join(' · ')}</div>
      <div style="display:flex;gap:12px;align-items:center;margin-bottom:8px">
        ${F.hasRun
          ? `<span class="m-data" style="color:var(--tilly-green)">✓ RUN COMPLETE — 2 PROMOTED TO THE PIPELINE · DRAFTS IN ENGAGE</span> <button class="btn btn-secondary btn-sm" data-goto="#/pipeline">See them in the pipeline</button>`
          : `<button class="btn btn-primary" data-run-agent>▶ Run the agent now</button><span class="m-data t-muted">OR WAIT — IT RUNS ITSELF AT 02:00</span>`}
      </div>
      <div class="feed" id="agent-log" style="${F.hasRun ? '' : 'display:none'}">
        <div class="feed-head"><span class="feed-live">● LIVE</span><span class="feed-title">AGENT RUN — WATCH TILLY WORK</span></div>
        ${F.hasRun ? F.runLog.map(l => `<div>${esc(l.msg)}</div>`).join('') : ''}
      </div>
      <div class="gap-lg"></div>
      <div class="m-section" style="margin-bottom:16px">OVERNIGHT INTAKE — QUALIFYING WITHOUT YOU</div>
      <table class="tbl">
        <thead><tr><th>Organisation</th><th>Cause</th><th>Shops</th><th>Fit so far</th><th>Status</th></tr></thead>
        <tbody>${DATA.funnel.incoming.map(l => `
          <tr>
            <td style="font-weight:600">${esc(l.name)}</td>
            <td class="t-caption">${esc(l.cause)}</td>
            <td><span class="m-data">${l.shops}</span></td>
            <td>${l.fit ? `<span class="fit">${l.fit} FIT</span>` : '<span class="t-caption">enriching…</span>'}</td>
            <td><span class="chip${l.status === 'PROMOTED' ? ' chip-pole' : l.status === 'DISQUALIFIED' ? ' chip-back' : ''}">${esc(l.status)}</span></td>
          </tr>`).join('')}
        </tbody>
      </table>
      <div class="gap-lg"></div>
      <div class="m-section" style="margin-bottom:16px">MEETINGS — GRANOLA CAPTURES, THE CRM WRITES ITSELF</div>
      <table class="tbl">
        <thead><tr><th>Meeting</th><th>Account</th><th>When</th><th>Next step (said out loud)</th><th>Captured</th></tr></thead>
        <tbody>${DATA.meetings.map(m => {
          const r = recById(m.record);
          return `<tr class="click" data-id="${r.id}">
            <td style="font-weight:600">${esc(m.title)}</td>
            <td><div style="display:flex;align-items:center;gap:10px">${avatar(r, 26)}${esc(r.name)}</div></td>
            <td><span class="m-data">${esc(m.when)}</span></td>
            <td class="t-caption">${esc(m.nextStep)}</td>
            <td><span class="m-data" style="color:${m.task === 'PENDING' ? 'var(--tilly-grey-500)' : 'var(--tilly-green)'}">${esc(m.task)}</span></td>
          </tr>`;
        }).join('')}
        </tbody>
      </table>
      <div class="gap"></div>
      <div class="panel" style="padding:18px 20px">
        <span class="m-label">THE DIVISION OF LABOUR</span>
        <div class="t-caption" style="line-height:2">Tilly: fetch, enrich, score, qualify, draft, chase, schedule, log. You: meetings, conversations, judgement. If you're typing into the CRM, something is wrong — say it in the meeting instead.</div>
      </div>`;
  },

  pipeline() {
    const bands = ['ALL', 'POLE', 'FRONT ROW', 'MIDFIELD', 'BACK MARKER'];
    const lanes = [['ALL', 'ALL LANES'], ['selfserve', 'SELF-SERVE'], ['assisted', 'ASSISTED'], ['enterprise', 'ENTERPRISE']];
    const q = searchQuery.trim().toLowerCase();
    const recs = DATA.records.filter(r =>
      (bandFilter === 'ALL' || r.band === bandFilter) &&
      (laneFilter === 'ALL' || r.lane === laneFilter) &&
      (!q || (r.name + ' ' + r.cause + ' ' + r.contact.name + ' ' + r.stage).toLowerCase().includes(q)));
    const ent = DATA.records.filter(r => r.lane === 'enterprise');
    const ss = DATA.records.filter(r => r.lane !== 'enterprise');
    return `
      <h1 class="t-title page-title">Pipeline</h1>
      <p class="t-body t-muted page-sub">Sorted by convert likelihood — work top to bottom. This sector takes its time: intent decays gently, nurture never stops, and a Midfield account is a future win being coached, not a dead one.</p>
      <div class="stats" style="margin-bottom:16px">
        <div class="stat stat-blue"><span class="m-label">TOTAL PIPELINE (ACV)</span><strong>${gbp(pipeValue(DATA.records))}</strong></div>
        <div class="stat"><span class="m-label">WEIGHTED × LIKELIHOOD</span><strong>${gbp(weightedValue(DATA.records))}</strong></div>
        <div class="stat"><span class="m-label">ENTERPRISE</span><strong>${gbp(pipeValue(ent))}</strong></div>
        <div class="stat"><span class="m-label">SELF-SERVE & ASSISTED</span><strong>${gbp(pipeValue(ss))}</strong></div>
      </div>
      <div class="filterbar">
        <button class="fchip${pipeView === 'list' ? ' on' : ''}" data-pview="list">≡ LIST</button>
        <button class="fchip${pipeView === 'board' ? ' on' : ''}" data-pview="board">▦ BOARD — DRAG & DROP</button>
        <span style="width:12px"></span>
        ${bands.map(b => `<button class="fchip${bandFilter === b ? ' on' : ''}" data-band="${b}">${b}</button>`).join('')}
        <span style="width:12px"></span>
        ${lanes.map(([v, l]) => `<button class="fchip${laneFilter === v ? ' on' : ''}" data-lane="${v}">${l}</button>`).join('')}
        ${q ? `<span class="m-data t-muted">SEARCH: “${esc(searchQuery.trim().toUpperCase())}” · ${recs.length} OF ${DATA.records.length}</span>` : ''}
      </div>
      ${pipeView === 'board' ? `
      <div class="kanban" style="grid-template-columns:repeat(${BOARD_COLS.length},1fr)">
        ${BOARD_COLS.map(col => {
          const cards = byLikelihood(recs.filter(r => (BOARD_MAP[r.stage] || 'Prospecting') === col));
          return `
          <div class="kcol" data-drop="${col}">
            <div class="m-label" style="display:block;margin-bottom:4px">${col.toUpperCase()} · ${cards.length}</div>
            <div class="m-data t-muted" style="display:block;margin-bottom:10px">${gbp(pipeValue(cards))}</div>
            ${cards.map(r => `
              <div class="kcard click" draggable="true" data-drag="${r.id}" data-id="${r.id}">
                <div style="display:flex;align-items:center;gap:10px">${avatar(r, 26)}<span style="font-weight:600;font-size:13px">${esc(r.name)}</span></div>
                <div style="display:flex;justify-content:space-between;align-items:center;margin-top:10px">
                  <span class="m-data" style="color:var(--tilly-blue)">${r.likelihood}%</span>
                  ${bandChip(r)}
                </div>
                <div class="t-caption" style="margin-top:8px;font-size:11px">${esc(r.nextAction)}</div>
              </div>`).join('') || '<div class="t-caption" style="padding:6px 0">Drop a deal here</div>'}
          </div>`;
        }).join('')}
      </div>
      <div class="t-caption" style="margin-top:12px">Drag a card to move its stage — Tilly writes the audit entry and recomputes what's next. Won is where commission pays.</div>` : recs.length ? recordTable(recs) : `
        <div class="panel" style="padding:32px;text-align:center">
          <div class="t-heading">No records match.</div>
          <div class="t-caption" style="margin:6px 0 16px">Tilly is still watching all 11,200 shops — this filter just has nothing in it.</div>
          <button class="btn btn-secondary btn-sm" data-clear-filters>Clear filters</button>
        </div>`}`;
  },

  channels() {
    const m = DATA.model;
    return `
      <h1 class="t-title page-title">Channels & the model</h1>
      <p class="t-body t-muted page-sub">Nine sources, one record, no manual entry — then the intelligence core scores and routes everything it captures.</p>
      <div class="m-section" style="margin-bottom:16px">1 — INBOUND</div>
      ${cardGrid(DATA.channels.inbound)}
      <div class="gap-lg"></div>
      <div class="m-section" style="margin-bottom:16px">2 — OUTBOUND</div>
      ${cardGrid(DATA.channels.outbound)}
      <div class="gap-lg"></div>
      <div class="m-section" style="margin-bottom:16px">3 — AUTO-ENRICHMENT · FRESHNESS-GOVERNED</div>
      ${cardGrid(DATA.enrichment)}
      <div class="gap-lg"></div>
      <div class="m-section" style="margin-bottom:16px">4 — THE INTELLIGENCE CORE</div>
      ${cardGrid(DATA.core)}
      <div class="gap-lg"></div>
      <div class="m-section" style="margin-bottom:16px">5 — PREDICTIVE SCORING — FIT × INTENT</div>
      <div class="feed" style="margin-bottom:8px">
        <div class="feed-head"><span class="feed-title">THE SCORING FORMULA — §4.3</span></div>
        ${m.formula.map(f => `<div>${esc(f)}</div>`).join('')}
      </div>
      <div class="grid-2">
        <div>
          <div class="m-label" style="display:block;margin-bottom:8px">FIT — WHO THEY ARE, SLOW-MOVING</div>
          ${specTable(['Feature', 'Wt', 'Rule'], m.fitFeatures.map(f => [`<b>${esc(f.name)}</b>`, `<span class="m-data">${f.weight}</span>`, `<span class="t-caption">${esc(f.rule)}</span>`]))}
        </div>
        <div>
          <div class="m-label" style="display:block;margin-bottom:8px">INTENT — WHAT THEY DO, DECAYS BY HALF-LIFE</div>
          ${specTable(['Feature', 'Wt', 'T½', 'Rule'], m.intentFeatures.map(f => [`<b>${esc(f.name)}</b>`, `<span class="m-data">${f.weight}</span>`, `<span class="m-data">${esc(f.halfLife)}</span>`, `<span class="t-caption">${esc(f.rule)}</span>`]))}
        </div>
      </div>
      <div class="gap"></div>
      <div class="grid-2">
        <div>
          <div class="m-label" style="display:block;margin-bottom:8px">BANDS — DRIVE AGENT BEHAVIOUR & MULTIPLIERS</div>
          ${specTable(['Band', 'Range', 'Agent behaviour'], m.bands.map(b => [`<span class="chip ${b.band === 'POLE' ? 'chip-pole' : b.band === 'FRONT ROW' ? 'chip-front' : b.band === 'MIDFIELD' ? '' : 'chip-back'}">${b.band}</span>`, `<span class="m-data">${b.range}</span>`, `<span class="t-caption">${esc(b.behaviour)}</span>`]))}
        </div>
        <div>
          <div class="m-label" style="display:block;margin-bottom:8px">ROUTING — COMPLEXITY DECIDES THE LANE, NOT VALUE</div>
          ${specTable(['Complexity', 'Lane', 'Ownership'], m.lanes.map(l => [`<span class="m-data">${l.range}</span>`, `<span class="chip ${l.lane === 'ENTERPRISE' ? 'chip-enterprise' : l.lane === 'ASSISTED' ? 'chip-assisted' : 'chip-selfserve'}">${l.lane}</span>`, `<span class="t-caption">${esc(l.ownership)}</span>`]))}
          <div class="gap"></div>
          ${specTable(['Complexity input', 'Points'], m.complexityInputs.map(c => [`<b>${esc(c.name)}</b>`, `<span class="m-data">${c.points}</span>`]))}
        </div>
      </div>
      <div class="gap"></div>
      <div class="m-label" style="display:block;margin-bottom:8px">COMPETITIVE VERDICTS — FIRST MATCH WINS · UNDERCUT PROPOSES, NEVER APPLIES</div>
      ${specTable(['Verdict', 'Condition', 'Recommended play'], m.verdicts.map(v => [`<b>${esc(v.type)}</b>`, `<span class="t-caption">${esc(v.condition)}</span>`, `<span class="t-caption">${esc(v.play)}</span>`]))}`;
  },

  selfserve() {
    const recs = byLikelihood(DATA.records.filter(r => r.lane !== 'enterprise'));
    const stages = [
      { key: 'Prospecting', label: 'PROSPECTING' },
      { key: 'Identified', label: 'IDENTIFIED' },
      { key: 'Trial', label: 'TRIAL' },
      { key: 'Paid', label: 'PAID' },
      { key: 'Expanded', label: 'EXPANDED' },
      { key: 'At risk', label: 'AT RISK' }
    ];
    return `
      <h1 class="t-title page-title">Self-serve</h1>
      <p class="t-body t-muted page-sub">The e-commerce path, plus the assisted lane. Your buyers are new to tools like this — so the funnel is built for hand-holding: guided activation, patient nudges, pause-first saves, billing tracked to the penny.</p>
      <div class="stats" style="margin-bottom:16px">
        <div class="stat stat-blue"><span class="m-label">PIPELINE VALUE (ACV)</span><strong>${gbp(pipeValue(recs))}</strong></div>
        <div class="stat"><span class="m-label">WEIGHTED × LIKELIHOOD</span><strong>${gbp(weightedValue(recs))}</strong></div>
        <div class="stat"><span class="m-label">LIVE ARR (SUBSCRIPTIONS)</span><strong>${gbp(liveARR())}</strong></div>
        <div class="stat"><span class="m-label">ACTIVATION TARGET</span><strong>14 DAYS</strong></div>
      </div>
      <div class="m-section" style="margin-bottom:16px">INBOUND AD TRAFFIC — GTM FUNNEL BY CHANNEL</div>
      <div class="grid-4" style="grid-template-columns:repeat(3,1fr);margin-bottom:8px">
        ${DATA.gtm.channels.map(c => `
          <div class="panel" style="padding:18px 20px">
            <div style="display:flex;justify-content:space-between;align-items:baseline"><span class="m-label" style="margin:0">${esc(c.name)}</span><span class="m-data" style="color:${c.trend.startsWith('+') ? 'var(--tilly-green)' : c.trend.startsWith('−') ? 'var(--tilly-red)' : 'var(--tilly-grey-500)'}">${esc(c.trend)}</span></div>
            <div style="display:flex;gap:14px;align-items:baseline;margin-top:10px"><span class="t-heading" style="font-size:20px;letter-spacing:-0.6px">${esc(c.spend)}</span><span class="fit">${esc(c.cpl)}</span></div>
            <div class="t-caption" style="margin-top:8px">${esc(c.read)}</div>
          </div>`).join('')}
      </div>
      <table class="tbl" style="margin-bottom:8px">
        <thead><tr><th>Channel</th>${DATA.gtm.stages.map(s => `<th>${s}</th>`).join('')}<th>Where they drop</th></tr></thead>
        <tbody>${DATA.gtm.funnel.map(f => {
          const ch = DATA.gtm.channels.find(c => c.id === f.id);
          return `<tr>
            <td style="font-weight:600">${esc(ch.name)}</td>
            ${f.steps.map((n, i) => `<td>
              <div style="display:flex;flex-direction:column;gap:4px">
                <span class="m-data" style="color:${i === f.dropStage ? 'var(--tilly-red)' : i === f.steps.length - 1 ? 'var(--tilly-green)' : 'var(--tilly-black)'}">${n.toLocaleString('en-GB')}${i > 0 ? ' · ' + Math.round(100 * n / f.steps[i - 1]) + '%' : ''}</span>
                <span class="bar" style="width:100%"><b style="width:${Math.max(2, Math.round(100 * n / f.steps[0]))}%"></b></span>
              </div>
            </td>`).join('')}
            <td class="t-caption">${esc(f.drop)}</td>
          </tr>`;
        }).join('')}
        </tbody>
      </table>
      <div class="board" style="margin-bottom:8px">
        <div class="zone-head"><span class="m-label" style="margin:0">LIVE — WHERE INBOUND LEADS ARE IN THE FUNNEL RIGHT NOW</span><span class="m-data t-muted">TODAY</span></div>
        ${DATA.gtm.leads.map(l => `
          <div class="grid-row"${l.record ? ` data-goto="#/record/${l.record}" style="cursor:pointer"` : ' style="cursor:default"'}>
            <span class="m-data t-muted" style="min-width:40px;flex:none">${esc(l.when)}</span>
            <span class="chip" style="flex:none">${esc(l.channel)}</span>
            <div style="flex:1;min-width:0">
              <div class="t-heading" style="font-size:13px">${esc(l.org)}</div>
              <div class="t-caption" style="font-size:11px">${esc(l.status)}</div>
            </div>
            <span class="m-data" style="flex:none;color:${l.stage === 'SUBSCRIBED' ? 'var(--tilly-green)' : l.stage === 'DROP-OFF' ? 'var(--tilly-red)' : 'var(--tilly-grey-500)'}">${esc(l.stage)}</span>
          </div>`).join('')}
      </div>
      <div class="board" style="margin-bottom:40px">
        <div class="zone-head"><span class="m-label" style="margin:0;color:var(--tilly-blue)">● TILLY'S OPTIMISATION PLAYS — ONE CLICK EACH</span></div>
        ${DATA.gtm.plays.map(p => `
          <div class="grid-row" style="cursor:default">
            <span class="chip" style="flex:none">${esc(p.tier)}</span>
            <div style="flex:1;min-width:0">
              <div class="t-heading" style="font-size:13px">${esc(p.text)}</div>
              <div class="t-caption" style="font-size:11px">${esc(p.detail)}</div>
            </div>
            ${DATA.gtm.applied[p.id]
              ? `<span class="m-data" style="color:var(--tilly-green);flex:none">✓ ${esc(DATA.gtm.applied[p.id])}</span>`
              : `<button class="btn btn-primary btn-sm" data-gtm="${p.id}" style="flex:none">${p.tier === 'FLAG' ? 'Flag to engineering' : 'Apply'}</button>`}
          </div>`).join('')}
      </div>
      <div class="m-section" style="margin-bottom:16px">CONVERSION FUNNEL — SIGN-UP → DOWNLOAD → SUBSCRIPTION → USAGE</div>
      <div class="board" style="margin-bottom:8px">
        ${DATA.selfServeFunnel.map((f, i, a) => `
          <div class="board-row">
            <span class="m-label" style="min-width:190px;margin:0">${f.stage}</span>
            <span class="bar" style="flex:1;height:22px"><b style="width:${Math.max(2, Math.round(100 * f.count / a[0].count))}%"></b></span>
            <span class="val" style="min-width:56px">${f.count.toLocaleString('en-GB')}</span>
            <span class="detail" style="min-width:280px;font-size:12px;color:var(--tilly-grey-500)">${esc(f.note)}</span>
          </div>`).join('')}
      </div>
      <div class="gap-lg"></div>
      <div class="m-section" style="margin-bottom:16px">SUBSCRIPTIONS & PAYMENT TRACKING</div>
      <table class="tbl">
        <thead><tr><th>Account</th><th>Plan</th><th>Seats</th><th>MRR</th><th>Billing</th><th>Next event</th><th>Tilly's read</th></tr></thead>
        <tbody>${DATA.subscriptions.map(s => {
          const r = recById(s.record);
          const good = s.billing === 'PAID', bad = /RETRY|REFUND|ABANDONED/.test(s.billing);
          return `<tr class="click" data-id="${r.id}">
            <td><div style="display:flex;align-items:center;gap:10px">${avatar(r, 26)}<span style="font-weight:600">${esc(r.name)}</span></div></td>
            <td><span class="chip">${esc(s.plan.toUpperCase())}</span></td>
            <td><span class="m-data">${s.seats}</span></td>
            <td><span class="fit">${esc(s.mrr)}</span></td>
            <td><span class="m-data" style="color:${good ? 'var(--tilly-green)' : bad ? 'var(--tilly-red)' : 'var(--tilly-grey-500)'}">${esc(s.billing)}</span></td>
            <td><span class="m-data">${esc(s.next)}</span></td>
            <td class="t-caption">${esc(s.note)}</td>
          </tr>`;
        }).join('')}
        </tbody>
      </table>
      <div class="gap-lg"></div>
      <div class="m-section" style="margin-bottom:16px">DEAL PROGRESS</div>
      ${kanban(stages, r => r.lane === 'enterprise' ? null : (r.state || 'Prospecting'))}
      <div class="gap-lg"></div>
      <div class="m-section" style="margin-bottom:16px">ALL SELF-SERVE & ASSISTED</div>
      <table class="tbl">
        <thead><tr><th>Account</th><th>Lane</th><th>Lifecycle state</th><th>Band</th><th>Likelihood</th><th>Next action</th></tr></thead>
        <tbody>${recs.map(r => `
          <tr class="click${r.band === 'POLE' ? ' pole' : ''}" data-id="${r.id}">
            <td><div style="display:flex;align-items:center;gap:12px">${avatar(r)}<span style="font-weight:600">${esc(r.name)}</span></div></td>
            <td>${laneChip(r)}</td>
            <td>${r.state ? `<span class="chip">${esc(r.state.toUpperCase())}</span>` : '<span class="t-caption">—</span>'}</td>
            <td>${bandChip(r)}</td>
            <td>${likelihoodBar(r.likelihood)}</td>
            <td class="t-caption">${esc(r.nextAction)}</td>
          </tr>`).join('')}
        </tbody>
      </table>
      <div class="gap"></div>
      <div class="panel" style="padding:18px 20px">
        <span class="m-label">LIFECYCLE — §7.1</span>
        <div class="t-caption" style="line-height:2">Anonymous → Identified → Trial → Activated (3 core actions in 14 days) → Paid → Expanded → At risk (usage −40% or payment failed) → Churned. Dunning: retry day 1 / 3 / 7 / 14 · read-only day 21 · cancel day 30. Save offers ranked by predicted CLV: pause 3 months → tier down → time-boxed discount — pause first, this is a grant-funded sector.</div>
      </div>`;
  },

  enterprise() {
    const recs = DATA.records.filter(r => r.lane === 'enterprise');
    const stages = [
      { key: 'Prospecting', label: 'PROSPECTING' },
      { key: 'Engaged', label: 'ENGAGED' },
      { key: 'Proposal', label: 'PROPOSAL' },
      { key: 'Tender', label: 'TENDER' },
      { key: 'Negotiation', label: 'NEGOTIATION' }
    ];
    return `
      <h1 class="t-title page-title">Enterprise</h1>
      <p class="t-body t-muted page-sub">Rep-owned; the agent runs research, drafting and admin. Committee decisions here take months and tender deadlines don't move — Tilly holds the thread between the moments that matter.</p>
      <div class="stats" style="margin-bottom:16px">
        <div class="stat stat-blue"><span class="m-label">PIPELINE VALUE (ACV)</span><strong>${gbp(pipeValue(recs))}</strong></div>
        <div class="stat"><span class="m-label">WEIGHTED × LIKELIHOOD</span><strong>${gbp(weightedValue(recs))}</strong></div>
        <div class="stat"><span class="m-label">LARGEST DEAL</span><strong>${gbp(Math.max(...recs.map(r => r.acvNum)))}</strong></div>
        <div class="stat"><span class="m-label">LIVE TENDERS</span><strong>${DATA.tenders.length}</strong></div>
      </div>
      <div class="m-section" style="margin-bottom:16px">DEAL PROGRESS</div>
      ${kanban(stages, r => r.lane === 'enterprise' ? r.stage : null)}
      <div class="gap-lg"></div>
      <div class="m-section" style="margin-bottom:16px">ALL ENTERPRISE</div>
      ${recordTable(recs)}
      <div class="gap-lg"></div>
      <div class="m-section" style="margin-bottom:16px">TENDER INTAKE — POLLED DAILY, BID/NO-BID GATED</div>
      <table class="tbl">
        <thead><tr><th>Tender</th><th>Source</th><th>Deadline</th><th>State</th><th>Gate decision</th></tr></thead>
        <tbody>${DATA.tenders.map(t => `
          <tr${t.record ? ` class="click" data-id="${t.record}"` : ''}>
            <td style="font-weight:600">${esc(t.name)}</td>
            <td class="t-caption">${esc(t.source)}</td>
            <td><span class="m-data" style="color:var(--tilly-blue)">${esc(t.deadline)}</span></td>
            <td><span class="chip">${esc(t.state.toUpperCase())}</span></td>
            <td class="t-caption">${esc(t.gate)}</td>
          </tr>`).join('')}
        </tbody>
      </table>
      <div class="gap"></div>
      <div class="panel" style="padding:18px 20px">
        <span class="m-label">PROCUREMENT STATES — §8.4</span>
        <div class="t-caption" style="line-height:2">Identified → Qualifying → Responding → Submitted → Negotiating → Awarded / lost → Mobilising. An unmet mandatory is an auto no-bid. On award, contract commitments become the obligation register — dated tasks with owners, handed to delivery.</div>
      </div>`;
  },

  engage() {
    return `
      <h1 class="t-title page-title">Engage</h1>
      <p class="t-body t-muted page-sub">The outbound push — education first, pitches second, because slow adopters buy from whoever teaches them. Every send is stamped with the authority that lets it go; amber items need one click from you.</p>
      ${DATA.settings.testMode ? `<div class="panel" style="padding:12px 20px;margin-bottom:8px"><span class="m-data" style="color:var(--tilly-blue)">TEST MODE — EVERY OUTBOUND EMAIL IS PROXIED TO ${esc(DATA.settings.emailProxy.toUpperCase())} · NOTHING REACHES A CUSTOMER</span></div>` : ''}
      <div class="board" style="margin-bottom:8px">
        <div class="zone-head"><span class="m-label" style="margin:0;color:var(--tilly-blue)">● LINKEDIN AUTOMATION — CONNECT & NURTURE, GUARD-RAILED</span>
          ${DATA.linkedin.bulkDone
            ? `<span class="m-data" style="color:var(--tilly-green)">✓ ${Object.keys(DATA.linkedin.queued).length} CONNECTIONS QUEUED · 15/DAY PACING</span>`
            : `<button class="btn btn-primary btn-sm" data-li-bulk>Queue connections — all open prospects</button>`}
        </div>
        ${DATA.linkedin.sequence.map(sq => `
          <div class="grid-row" style="cursor:default">
            <span class="m-data" style="color:var(--tilly-blue);min-width:52px;flex:none">${esc(sq.day)}</span>
            <span class="t-heading" style="font-size:13px;min-width:120px;flex:none">${esc(sq.step)}</span>
            <span class="t-caption" style="flex:1">${esc(sq.desc)}</span>
          </div>`).join('')}
        <div class="grid-row" style="cursor:default;background:var(--tilly-grey-100)">
          <span class="t-caption">${esc(DATA.linkedin.caps)}</span>
        </div>
      </div>
      <table class="tbl">
        <thead><tr><th>Type</th><th>Item</th><th>Account</th><th>Channel</th><th>When</th><th>Authority</th><th></th></tr></thead>
        <tbody>
          ${DATA.engageQueue.map((q, i) => {
            const r = recById(q.record);
            const red = q.authority.startsWith('RED'), amber = q.authority.startsWith('AMBER');
            return `<tr class="click" data-id="${r.id}">
              <td><span class="chip">${q.type}</span></td>
              <td style="font-weight:600">${esc(q.item)}</td>
              <td><div style="display:flex;align-items:center;gap:10px">${avatar(r, 26)}${esc(r.name)}</div></td>
              <td class="t-caption">${esc(q.channel)}</td>
              <td><span class="m-data">${esc(q.when.toUpperCase())}</span></td>
              <td><span class="m-data${q.approved ? ' approved' : ''}" style="color:${q.approved ? 'var(--tilly-green)' : red ? 'var(--tilly-red)' : amber ? 'var(--tilly-grey-500)' : 'var(--tilly-green)'}">${q.approved ? (q.proxied ? '✓ APPROVED → ' + esc(DATA.settings.emailProxy.toUpperCase()) : '✓ APPROVED · SENDING') : esc(q.authority)}</span></td>
              <td>${amber && !q.approved ? `<button class="btn btn-primary btn-sm" data-approve="${i}">Approve</button>` : red && !q.approved ? `<span class="t-caption">with legal</span>` : ''}</td>
            </tr>`;
          }).join('')}
        </tbody>
      </table>
      <div class="gap"></div>
      <div class="panel" style="padding:18px 20px">
        <span class="m-label">DISCOUNT LADDER — §9.4 · THE BUILDER CANNOT GENERATE OUTSIDE IT</span>
        <div class="t-caption" style="line-height:2">Agent 0–10% auto-logged · sales lead to 20% · commercial director to 30% · blocked above. Retention saves: max 20%, max 3 months, separate authority. Margin floor blocks regardless of tier. Liability cap 12 months' fees — unlimited is never issuable.</div>
      </div>`;
  },

  escalations() {
    const escs = DATA.records.filter(r => r.escalation);
    return `
      <h1 class="t-title page-title">Escalations</h1>
      <p class="t-body t-muted page-sub">Autonomy is defined by permission tier, not good intentions. Eight triggers break it — each with a threshold and a named handoff. Escalation is a handoff, not an abandonment: the agent keeps researching and drafting behind the human.</p>
      ${escs.map(r => `
        <div class="esc-banner click" data-id="${r.id}" style="cursor:pointer">
          ${avatar(r, 36)}
          <div style="flex:1"><div class="t-heading" style="font-size:14px">${esc(r.name)}</div><div class="t-caption">${esc(r.nextAction)}</div></div>
          <span class="m-data" style="color:var(--tilly-red)">${esc(r.escalation.toUpperCase())}</span>
        </div>`).join('')}
      <div class="gap"></div>
      <div class="m-label" style="display:block;margin-bottom:8px">THE EIGHT TRIGGERS — §11.2</div>
      ${specTable(['Trigger', 'Threshold', 'Handoff'], DATA.escalationTriggers.map(t => [`<b>${esc(t.trigger)}</b>`, `<span class="t-caption">${esc(t.threshold)}</span>`, `<span class="t-caption">${esc(t.handoff)}</span>`]))}
      <div class="gap"></div>
      <div class="m-label" style="display:block;margin-bottom:8px">AGENT PERMISSION TIERS — §11.1</div>
      ${specTable(['Tier', 'Capability', 'Constraint'], DATA.model.tiers.map(t => [`<span class="m-data">${esc(t.tier)}</span>`, `<b>${esc(t.capability)}</b>`, `<span class="t-caption">${esc(t.constraint)}</span>`]))}`;
  },

  rep(id) {
    const rep = repById(id) || DATA.reps[0];
    const mine = byLikelihood(DATA.records.filter(r => r.owner === rep.id));
    const openValue = pipeValue(mine);
    const weighted = weightedValue(mine);
    const attainment = Math.round(100 * rep.closedYTD / rep.quota);
    const earned = Math.round(rep.closedYTD * rep.commissionRate);
    const projected = Math.round(weighted * rep.commissionRate);
    const toQuota = Math.max(0, rep.quota - rep.closedYTD);
    return `
      <h1 class="t-title page-title">My page — ${esc(rep.name)}</h1>
      <p class="t-body t-muted page-sub">Your deals, your number, your commission. Private to you${rep.pos === 'P1' ? ' — and currently P1, keep it up' : ''}. In production this page is per-login; the switcher below simulates it.</p>
      <div class="filterbar">
        ${DATA.reps.map(x => `<button class="fchip${x.id === rep.id ? ' on' : ''}" data-rep="${x.id}">${esc(x.name.toUpperCase())}</button>`).join('')}
      </div>
      <div class="stats">
        <div class="stat stat-blue"><span class="m-label">QUOTA ATTAINMENT</span><strong>${attainment}%</strong></div>
        <div class="stat"><span class="m-label">CLOSED YTD</span><strong>${gbp(rep.closedYTD)}</strong></div>
        <div class="stat"><span class="m-label">ANNUAL QUOTA</span><strong>${gbp(rep.quota)}</strong></div>
        <div class="stat stat-dark"><span class="m-label">COMMISSION EARNED YTD</span><strong>${gbp(earned)}</strong></div>
      </div>
      <div class="gap"></div>
      <div class="panel" style="padding:18px 20px">
        <span class="m-label">TARGET TO QUOTA — ${gbp(toQuota)} TO GO</span>
        <div class="likelihood" style="margin-top:4px"><span class="bar" style="width:100%;height:10px"><b style="width:${Math.min(100, attainment)}%"></b></span><span class="m-data">${gbp(rep.closedYTD)} / ${gbp(rep.quota)}</span></div>
        <div class="t-caption" style="margin-top:10px">Weighted open pipeline covers ${Math.round(100 * weighted / Math.max(1, toQuota))}% of the gap. ${weighted >= toQuota ? 'Cover the gap and everything past 100% pays at the accelerator.' : 'Below 100% coverage — ask Tilly to promote more from the funnel.'}</div>
      </div>
      <div class="gap-lg"></div>
      <div class="m-section" style="margin-bottom:16px">MY DEALS — ${mine.length} OPEN · ${gbp(openValue)} ACV · ${gbp(weighted)} WEIGHTED</div>
      ${mine.length ? `
      <table class="tbl">
        <thead><tr><th>Deal</th><th>Stage</th><th>Band</th><th>ACV</th><th>Likelihood</th><th>Commission if won</th><th>Next action</th></tr></thead>
        <tbody>${mine.map(r => `
          <tr class="click${r.band === 'POLE' ? ' pole' : ''}" data-id="${r.id}">
            <td><div style="display:flex;align-items:center;gap:12px">${avatar(r)}<span style="font-weight:600">${esc(r.name)}</span></div></td>
            <td>${stageChip(r)}</td>
            <td>${bandChip(r)}</td>
            <td><span class="fit">${gbp(r.acvNum)}</span></td>
            <td>${likelihoodBar(r.likelihood)}</td>
            <td><span class="m-data" style="color:var(--tilly-green)">${gbp(Math.round(r.acvNum * rep.commissionRate))}</span></td>
            <td class="t-caption">${esc(r.nextAction)}</td>
          </tr>`).join('')}
        </tbody>
      </table>` : '<div class="panel" style="padding:24px" class="t-caption">No open deals — Tilly is qualifying the next ones overnight.</div>'}
      <div class="gap"></div>
      <div class="panel" style="padding:18px 20px">
        <span class="m-label">COMMISSION PLAN</span>
        <div class="kv"><span>Base rate</span><span>${Math.round(rep.commissionRate * 100)}% of closed ACV</span></div>
        <div class="kv"><span>Accelerator above 100% of quota</span><span>${Math.round(rep.acceleratorRate * 100)}% on everything past ${gbp(rep.quota)}</span></div>
        <div class="kv"><span>Projected from weighted pipeline</span><span class="fit">${gbp(projected)}</span></div>
        <div class="kv"><span>Paid</span><span>Monthly, on countersignature</span></div>
        <div class="t-caption" style="margin-top:14px;padding-top:14px;border-top:var(--line)">Figures are illustrative. Stage points and the leaderboard measure behaviour; commission pays on outcomes — countersigned contracts only, per the anti-gaming rules in §12.2.</div>
      </div>`;
  },

  success() {
    const S = DATA.success;
    const flags = Object.fromEntries(S.health.map(h => [h.record, flagFor(h)]));
    const greenShare = Math.round(100 * Object.values(flags).filter(f => f === 'GREEN FLAG').length / S.health.length);
    const scActive = S.safetyCars.length;
    const byRisk = [...S.health].sort((a, b) => (100 - b.score) * recById(b.record).acvNum - (100 - a.score) * recById(a.record).acvNum);
    const kindChip = k => k === 'BLACKOUT' ? `<span class="chip" style="color:var(--tilly-red);border-color:var(--tilly-red)">BLACKOUT</span>`
      : k === 'TARGET' ? `<span class="chip chip-pole">TARGET</span>`
      : k === 'RENEWAL' ? `<span class="chip chip-enterprise">RENEWAL</span>`
      : `<span class="chip">MILESTONE</span>`;
    return `
      <h1 class="t-title page-title">Tilly Success</h1>
      <p class="t-body t-muted page-sub">The garage. Your customers adopt slowly and need constant coaching — that's not a problem, it's the operating model. Success runs on autopilot: Tilly does everything below herself, and the red list is the entire human workload. The +75 NPS is earned here, not in the survey.</p>
      <div class="grid-2" style="align-items:start;margin-bottom:8px">
        <div class="board">
          <div class="zone-head"><span class="m-label" style="margin:0;color:var(--tilly-blue)">● AUTOPILOT — TILLY IS HANDLING</span><span class="m-data t-muted">${S.autopilot.length} RUNNING</span></div>
          ${S.autopilot.map(a => {
            const r = recById(a.record);
            return `
            <div class="grid-row" data-goto="#/record/${r.id}">
              ${avatar(r, 26)}
              <div style="flex:1;min-width:0">
                <div class="t-heading" style="font-size:13px">${esc(r.name)}</div>
                <div class="t-caption" style="font-size:11px">${esc(a.action)}</div>
              </div>
              <span class="chip" style="font-size:9px">${esc(a.tier)}</span>
              <span class="m-data" style="color:var(--tilly-green);font-size:10px">${esc(a.status)}</span>
            </div>`;
          }).join('')}
        </div>
        <div class="board">
          <div class="zone-head"><span class="m-label" style="margin:0;color:var(--tilly-red)">▲ NEEDS A HUMAN — THE ONLY ASKS</span><span class="m-data t-muted">EVERYTHING ELSE IS HANDLED</span></div>
          ${[
            ...S.safetyCars.map(sc => ({ record: sc.record, why: `${sc.severity} safety car — ${sc.cause}`, owner: sc.owner, sla: sc.clock })),
            ...(S.retention['barnardos'] ? [] : [{ record: 'barnardos', why: 'Churn radar CRITICAL — exec QBR request needs your click', owner: 'You', sla: 'PILOT ENDS 30 SEP' }]),
            ...(S.gate.items.some(i => !i.done) ? [{ record: S.gate.record, why: `Handover gate blocked — ${S.gate.items.find(i => !i.done).name.toLowerCase()}`, owner: 'Sales → CS', sla: 'BEFORE GO-LIVE' }] : [])
          ].map(n => {
            const r = recById(n.record);
            return `
            <div class="grid-row" data-goto="#/record/${r.id}">
              ${avatar(r, 26)}
              <div style="flex:1;min-width:0">
                <div class="t-heading" style="font-size:13px">${esc(r.name)}</div>
                <div class="t-caption" style="font-size:11px">${esc(n.why)} · <b>${esc(n.owner)}</b></div>
              </div>
              <span class="clock" style="min-width:0;font-size:10px">${esc(n.sla)}</span>
            </div>`;
          }).join('')}
        </div>
      </div>
      <div class="stats">
        <div class="stat${greenShare >= 75 ? ' stat-blue' : ''}"><span class="m-label">GREEN FLAG SHARE (TARGET ≥75%)</span><strong>${greenShare}%</strong></div>
        <div class="stat"><span class="m-label">SAFETY CARS ACTIVE</span><strong>${scActive}</strong></div>
        <div class="stat"><span class="m-label">NPS · ${esc(S.nps.response)}</span><strong>${esc(S.nps.score)}</strong></div>
        <div class="stat stat-dark"><span class="m-label">MEDIAN PIT STOP TIME</span><strong>9 MIN</strong></div>
      </div>
      <div class="gap"></div>
      <div class="grid-4" style="grid-template-columns:repeat(3,1fr)">
        ${S.garage.map(g => `
          <div class="panel" style="padding:16px 18px${g.tilly ? ';border-color:var(--tilly-blue);border-width:2px' : ''}">
            <div class="m-label" style="margin-bottom:4px;display:block${g.tilly ? ';color:var(--tilly-blue)' : ''}">${esc(g.who)}</div>
            <div class="t-heading" style="font-size:14px">${esc(g.role)}</div>
            <div class="t-caption" style="margin-top:2px">${esc(g.desc)}</div>
          </div>`).join('')}
      </div>
      <div class="gap-lg"></div>

      ${[['THE GRID — ENTERPRISE & ASSISTED (TIER 1–2)', byRisk.filter(h => h.tier !== 'TIER 3')],
         ['THE GRID — SELF-SERVE (TIER 3, TILLY-MANAGED)', byRisk.filter(h => h.tier === 'TIER 3')]].map(([title, rows]) => `
      <div class="m-section" style="margin-bottom:16px">${title}</div>
      <table class="tbl" style="margin-bottom:24px">
        <thead><tr><th>Account</th><th>Stage · tier</th><th>Health</th><th>Flag</th><th>Driver manager</th><th>Renewal</th><th>Tilly's read</th></tr></thead>
        <tbody>${rows.map(h => {
          const r = recById(h.record);
          const f = flags[h.record];
          return `<tr class="click" data-id="${r.id}">
            <td><div style="display:flex;align-items:center;gap:10px">${avatar(r, 26)}<span style="font-weight:600">${esc(r.name)}</span></div></td>
            <td><span class="chip">${esc(h.stage.toUpperCase())}</span> <span class="m-data t-muted">${esc(h.tier)}</span></td>
            <td><span class="fit">${h.score}</span> <span class="m-data" style="color:${h.d30 < 0 ? 'var(--tilly-red)' : 'var(--tilly-green)'}">${h.d30 > 0 ? '+' : ''}${h.d30} / 30D</span></td>
            <td>${flagChip(f)}</td>
            <td class="t-caption">${esc(h.csm)}</td>
            <td><span class="m-data" style="color:var(--tilly-blue)">${esc(h.renewal)}</span></td>
            <td class="t-caption">${esc(h.play)}</td>
          </tr>`;
        }).join('')}
        </tbody>
      </table>`).join('')}
      <div class="gap"></div>
      <div class="feed">
        <div class="feed-head"><span class="feed-title">FLAG LOGIC — §2.3</span></div>
        ${S.healthModel.formula.map(f => `<div>${esc(f)}</div>`).join('')}
      </div>
      <div class="gap"></div>
      <div class="panel" style="padding:18px 20px">
        <span class="m-label">HEALTH DIMENSIONS — DEFAULT WEIGHTS, RE-WEIGHTED BY STAGE</span>
        <div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:4px">
          ${S.healthModel.dimensions.map(d => `<span class="chip">${esc(d.name.toUpperCase())} · ${d.weight}</span>`).join('')}
        </div>
        <div class="t-caption" style="margin-top:12px">${esc(S.healthModel.note)}</div>
      </div>
      <div class="gap-lg"></div>

      <div class="m-section" style="margin-bottom:16px">SAFETY CAR BOARD — COMMERCIAL MOTIONS FREEZE FIRST</div>
      ${S.safetyCars.map(sc => {
        const r = recById(sc.record);
        return `
        <div class="esc-banner click" data-id="${r.id}" style="cursor:pointer;align-items:flex-start">
          <span class="chip chip-esc" style="flex:none">${esc(sc.severity)}</span>
          ${avatar(r, 32)}
          <div style="flex:1;min-width:0">
            <div class="t-heading" style="font-size:14px">${esc(r.name)} <span class="m-data" style="color:var(--tilly-red)">· ${esc(sc.clock)}</span></div>
            <div class="t-caption" style="margin-top:4px"><b>Trigger:</b> ${esc(sc.trigger)} · <b>Root cause:</b> ${esc(sc.cause)}</div>
            <div class="t-caption" style="margin-top:2px"><b>Play:</b> ${esc(sc.play)}</div>
            <div class="t-caption" style="margin-top:2px"><b>Owner:</b> ${esc(sc.owner)} · <b>Exit:</b> ${esc(sc.exit)}</div>
          </div>
        </div>`;
      }).join('')}
      <div class="panel" style="padding:14px 20px;margin-top:2px">
        <span class="m-data" style="color:var(--tilly-red)">FROZEN:</span> <span class="t-caption">${esc(S.frozenNote)}</span>
      </div>
      <div class="gap-lg"></div>

      <div class="m-section" style="margin-bottom:16px">CHURN RADAR — RISK SCORED NIGHTLY, ROUTED TO A RETENTION FLOW BY LANE</div>
      ${[['ENTERPRISE & ASSISTED — QBR FLOW', S.health.filter(h => h.tier !== 'TIER 3')],
         ['SELF-SERVE — COURTESY CONNECT OR A GIFT IN THE POST', S.health.filter(h => h.tier === 'TIER 3')]].map(([title, rows]) => `
      <div class="board" style="margin-bottom:8px">
        <div class="zone-head"><span class="m-label" style="margin:0">${title}</span></div>
        ${rows.map(h => ({ h, risk: riskFor(h) })).sort((a, b) => b.risk - a.risk).map(({ h, risk }) => {
          const r = recById(h.record);
          const status = S.retention[h.record];
          const drivers = `${100 - h.score} health gap${h.d30 < 0 ? ` + ${Math.round(1.5 * -h.d30)} falling trend` : ''}${h.renewalSoon ? ' + 10 renewal <90d' : ''}`;
          const low = riskBand(risk) === 'LOW';
          const ent = h.tier !== 'TIER 3';
          return `
          <div class="grid-row">
            ${avatar(r)}
            <div style="flex:1;min-width:0">
              <div class="t-heading" style="font-size:14px">${esc(r.name)}</div>
              <div class="m-data t-muted" style="font-size:10px">${esc(drivers.toUpperCase())} · PRIMARY USER: ${esc(r.contact.name.toUpperCase())}</div>
            </div>
            ${riskChip(risk)}
            ${status ? `<span class="m-data" style="color:var(--tilly-green)">✓ ${esc(status)}</span>`
              : low ? `<span class="m-data t-muted">GREEN — NO FLOW NEEDED</span>`
              : ent ? `<button class="btn btn-primary btn-sm" data-qbr="${r.id}">Request exec QBR</button>`
              : `<button class="btn btn-primary btn-sm" data-connect="${r.id}">Courtesy connect</button>
                 <button class="btn btn-secondary btn-sm" data-gift="${r.id}">Send gift in the post</button>`}
          </div>`;
        }).join('')}
      </div>`).join('')}
      <div class="panel" style="padding:14px 20px;margin-top:2px;margin-bottom:40px"><span class="t-caption">${esc(S.retentionNote)}</span></div>

      <div class="m-section" style="margin-bottom:16px">PIT WALL — NEXT STOPS, PREP PACK STATUS</div>
      <table class="tbl">
        <thead><tr><th>Account</th><th>Pit stop</th><th>When</th><th>Length</th><th>Owner</th><th>Prep pack</th></tr></thead>
        <tbody>${S.pitWall.map(p => {
          const r = recById(p.record);
          return `<tr class="click" data-id="${r.id}">
            <td><div style="display:flex;align-items:center;gap:10px">${avatar(r, 26)}${esc(r.name)}</div></td>
            <td><span class="chip">${esc(p.type)}</span></td>
            <td><span class="m-data">${esc(p.when)}</span></td>
            <td><span class="m-data t-muted">${esc(p.length)}</span></td>
            <td class="t-caption">${esc(p.owner)}</td>
            <td><span class="m-data" style="color:${p.pack === 'READY' ? 'var(--tilly-green)' : p.pack === 'BUILDING' ? 'var(--tilly-grey-500)' : 'var(--tilly-red)'}">${esc(p.pack)}</span></td>
          </tr>`;
        }).join('')}
        </tbody>
      </table>
      <div class="panel" style="padding:14px 20px;margin-top:2px"><span class="t-caption">${esc(S.pitStopNote)}</span></div>
      <div class="gap-lg"></div>

      <div class="m-section" style="margin-bottom:16px">SEASON CALENDAR — MILESTONES, RENEWALS AND THE CHARITY-SECTOR CLOCK</div>
      <table class="tbl">
        <thead><tr><th>When</th><th>Account</th><th>Item</th><th>Kind</th><th>Status</th></tr></thead>
        <tbody>${S.season.map(s => {
          const r = s.account ? recById(s.account) : null;
          return `<tr${r ? ` class="click" data-id="${r.id}"` : ''}>
            <td><span class="m-data" style="color:var(--tilly-blue)">${esc(s.when)}</span></td>
            <td>${r ? `<div style="display:flex;align-items:center;gap:10px">${avatar(r, 22)}${esc(r.name)}</div>` : `<span class="t-caption">${esc(s.label)}</span>`}</td>
            <td class="t-caption">${esc(s.item)}</td>
            <td>${kindChip(s.kind)}</td>
            <td><span class="m-data t-muted">${esc(s.status)}</span></td>
          </tr>`;
        }).join('')}
        </tbody>
      </table>
      <div class="gap-lg"></div>

      <div class="m-section" style="margin-bottom:16px">THE +75 NPS SYSTEM — LEADING INDICATORS THE TEAM ACTUALLY MANAGES</div>
      <table class="tbl">
        <thead><tr><th>Indicator</th><th>Target</th><th>Now</th><th></th></tr></thead>
        <tbody>${S.npsIndicators.map(n => `
          <tr>
            <td style="font-weight:600">${esc(n.name)}</td>
            <td><span class="m-data t-muted">${esc(n.target)}</span></td>
            <td><span class="m-data">${esc(n.actual)}</span></td>
            <td><span class="m-data" style="color:${n.ok ? 'var(--tilly-green)' : 'var(--tilly-red)'}">${n.ok ? '● ON TARGET' : '● BEHIND'}</span></td>
          </tr>`).join('')}
        </tbody>
      </table>
      <div class="panel" style="padding:14px 20px;margin-top:2px"><span class="t-caption">${esc(S.nps.note)}</span></div>
      <div class="gap-lg"></div>

      <div class="m-section" style="margin-bottom:16px">DRIVER MANAGERS — SCORED ON OUTCOMES, BOOK-HANDICAPPED</div>
      ${board('CS STANDINGS', S.csBoard)}
      <div class="panel" style="padding:14px 20px;margin-top:2px"><span class="t-caption">${esc(S.csBoardNote)}</span></div>
      <div class="gap-lg"></div>

      <div class="m-section" style="margin-bottom:16px">HANDOVER GATE — BLOCKING · ${esc(recById(S.gate.record).name.toUpperCase())} CANNOT LEAVE HANDOVER UNTIL 8/8</div>
      <div class="panel" style="padding:18px 20px">
        ${S.gate.items.map(i => `<div class="kv"><span>${esc(i.name)}</span><span class="m-data" style="color:${i.done ? 'var(--tilly-green)' : 'var(--tilly-red)'}">${i.done ? '✓ PRESENT' : '✗ MISSING — BLOCKS EXIT'}</span></div>`).join('')}
      </div>
      <div class="gap-lg"></div>
      <div class="m-section" style="margin-bottom:16px">PRODUCT ADOPTION — PAID FOR, NOT USED · FIX WITH A VIDEO, NOT A CALL</div>
      ${DATA.settings.testMode ? `<div class="panel" style="padding:12px 20px;margin-bottom:8px"><span class="m-data" style="color:var(--tilly-blue)">TEST MODE — EVERY OUTBOUND EMAIL IS PROXIED TO ${esc(DATA.settings.emailProxy.toUpperCase())}</span></div>` : ''}
      <div class="board">
        ${S.adoption.map((a, i) => {
          const r = recById(a.record);
          return `
          <div class="grid-row">
            ${avatar(r)}
            <div style="flex:1;min-width:0">
              <div class="t-heading" style="font-size:14px">${esc(r.name)} — <span style="color:var(--tilly-blue)">${esc(a.product)}</span></div>
              <div class="m-data" style="font-size:10px;color:var(--tilly-red)">${esc(a.idle)}</div>
              <div class="t-caption" style="margin-top:4px">${esc(a.why)}</div>
            </div>
            <button class="btn btn-secondary btn-sm" data-preview-video="${i}">${previewVideo === i ? 'Hide video' : '▶ Preview video'}</button>
            ${a.status
              ? `<span class="m-data" style="color:var(--tilly-green)">✓ ${esc(a.status)}</span>`
              : `<button class="btn btn-primary btn-sm" data-send-video="${i}">Send explainer</button>`}
          </div>
          ${previewVideo === i ? `
          <div class="grid-expand" style="padding:16px 20px">
            <div class="m-label" style="display:block;margin-bottom:10px">${esc(a.videoLabel)}</div>
            <video controls preload="metadata" src="${esc(a.video)}" style="width:100%;max-width:720px;display:block;background:var(--tilly-black)"></video>
            <div class="t-caption" style="margin-top:10px">This is what the customer receives — in-product prompt plus email, matched to the unused feature. Sending is agent tier T1: frequency-capped, consent respected.${DATA.settings.testMode ? ' In test mode the email goes to ' + esc(DATA.settings.emailProxy) + ' instead of the customer.' : ''}</div>
          </div>` : ''}`;
        }).join('')}
      </div>
      <div class="gap"></div>
      <div class="panel" style="padding:18px 20px">
        <span class="m-label">TILLY — NAMED, DISCLOSED, GUARD-RAILED</span>
        ${S.tillyRules.map(t => `<div class="sig">${esc(t)}</div>`).join('')}
      </div>`;
  },

  person(param) {
    const [recId, idx] = (param || '').split('.');
    const r = recById(recId);
    const s = r && r.stakeholders[+idx];
    if (!r || !s) return `<p class="t-body">Person not found. <a href="#/pipeline">Back to pipeline</a></p>`;
    const p = DATA.people[r.id + '|' + s.name];
    const disposition = p ? p.disposition : 'UNKNOWN';
    const ease = p ? p.ease : Math.round(50 + (r.likelihood - 50) / 2);
    const easeBand = ease >= 70 ? 'SMOOTH — LEAN IN' : ease >= 45 ? 'WORKABLE — STANDARD PLAY' : 'HARD GOING — HUMAN TOUCH ONLY';
    const dispColor = disposition === 'PROMOTER' ? 'var(--tilly-green)' : disposition === 'DETRACTOR' ? 'var(--tilly-red)' : 'var(--tilly-grey-500)';
    const domain = r.name.toLowerCase().replace(/[^a-z]+/g, '').slice(0, 14) + '.org.uk';
    const email = s.name.toLowerCase().replace(/[^a-z]+/g, '.') + '@' + domain;
    const initials = s.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
    const isPrimary = r.contact.name === s.name;
    const posts = (p && p.posts.length) ? p.posts : [{ when: '—', platform: 'NO PUBLIC ACTIVITY', text: 'Nothing recent found. Tilly checks monthly; social data frames conversations only — it never scores.' }];
    return `
      <a href="#/record/${r.id}" class="btn btn-text" style="padding:16px 0 0;display:inline-block">← ${esc(r.name)}</a>
      <div class="rec-head">
        <div class="avatar" style="width:56px;height:56px;font-size:20px;background:${r.logo}">${initials}</div>
        <div style="flex:1">
          <h1 class="t-title" style="margin:0">${esc(s.name)}</h1>
          <div style="display:flex;gap:8px;margin-top:8px;align-items:center;flex-wrap:wrap">
            <span class="chip${s.tag.startsWith('DECISION') ? ' chip-front' : ''}">${esc(s.tag)}</span>
            <span class="chip" style="color:${dispColor};border-color:${dispColor}">${disposition}${p && p.nps !== null && p.nps !== undefined ? ' · NPS ' + p.nps : ''}</span>
            <span class="m-data t-muted">${esc(s.role.toUpperCase())} · ${esc(r.name.toUpperCase())}</span>
          </div>
        </div>
        <a class="btn btn-primary" href="#/record/${r.id}">Open the deal</a>
      </div>
      <div class="grid-2">
        <div class="panel">
          <span class="m-label">EASE OF DOING BUSINESS — CLOSE SIGNAL AT PERSON LEVEL</span>
          <div class="kv"><span>Ease score</span><span>${likelihoodBar(ease)}</span></div>
          <div class="kv"><span>Read</span><span class="m-data" style="color:${ease >= 70 ? 'var(--tilly-green)' : ease >= 45 ? 'var(--tilly-grey-500)' : 'var(--tilly-red)'}">${easeBand}</span></div>
          <div class="kv"><span>Deal likelihood (whole account)</span><span class="fit">${r.likelihood}%</span></div>
          <div style="margin-top:14px;padding-top:14px;border-top:var(--line)" class="t-caption">${disposition === 'PROMOTER' ? 'A promoter in this seat lifts the close odds — route the relationship through them.' : disposition === 'DETRACTOR' ? 'A detractor in this seat drags the close odds — resolve their issue before any commercial motion.' : 'Disposition unknown or neutral — the discovery conversation sets it.'}</div>
        </div>
        <div class="panel">
          <span class="m-label">CONTACT DETAILS</span>
          <div class="kv"><span>Email</span><span>${esc(email)}</span></div>
          <div class="kv"><span>Phone</span><span>${esc(p ? p.phone : '—')}</span></div>
          <div class="kv"><span>LinkedIn</span><span style="display:flex;gap:8px;align-items:center;justify-content:flex-end;flex-wrap:wrap">
            ${p ? `<a class="btn btn-secondary btn-sm" href="https://www.linkedin.com/${esc(p.linkedin)}" target="_blank" rel="noopener">View profile ↗</a>` : '<span class="t-caption">—</span>'}
            ${DATA.linkedin.queued[r.id + '|' + s.name]
              ? `<span class="m-data" style="color:var(--tilly-green)">✓ ${esc(DATA.linkedin.queued[r.id + '|' + s.name])}</span>`
              : (disposition === 'DETRACTOR' || r.escalation === 'Safeguarding or complaint raised')
                ? `<span class="m-data" style="color:var(--tilly-red)">AUTOMATION BLOCKED — HUMAN ONLY</span>`
                : `<button class="btn btn-primary btn-sm" data-li-connect="${r.id}.${idx}">Connect on LinkedIn</button>`}
          </span></div>
          <div class="kv"><span>Preferred channel</span><span>${esc(p ? p.channel : 'Unknown — default to email')}</span></div>
          ${isPrimary ? `<div class="kv"><span>Tenure</span><span>${esc(r.contact.tenure)}</span></div>` : ''}
          ${isPrimary ? `<div style="margin-top:14px;padding-top:14px;border-top:var(--line)" class="t-caption">${esc(r.contact.note)}</div>` : ''}
        </div>
        <div class="panel" style="grid-column:1 / -1">
          <span class="m-label">SOCIAL — WHAT THEY'VE BEEN POSTING · FRAMING ONLY, NEVER SCORED</span>
          ${posts.map(post => `
            <div class="grid-row" style="cursor:default">
              <span class="m-data" style="color:var(--tilly-blue);min-width:86px;flex:none">${esc(post.platform)}</span>
              <div style="flex:1;font-size:13px;line-height:1.5">“${esc(post.text)}”</div>
              <span class="m-data t-muted" style="flex:none">${esc(post.when)}</span>
            </div>`).join('')}
        </div>
      </div>
      <div class="gap"></div>
      <div class="feed">
        <div class="feed-head"><span class="feed-live">● LIVE</span><span class="feed-title">TILLY'S READ — THIS PERSON</span></div>
        ${(p ? p.read : ['no profile authored yet — tilly enriches on first contact', `ease estimated ${ease} from account likelihood`]).map(t => `<div>${esc(t)}</div>`).join('')}
      </div>
      ${p ? `<div class="panel" style="border:2px solid var(--tilly-blue);padding:20px 24px;margin-top:8px">
        <span class="m-label" style="color:var(--tilly-blue)">SUGGESTED OPENER</span>
        <div class="t-heading" style="font-size:16px;letter-spacing:-0.4px;margin-top:6px">${esc(p.opener)}</div>
      </div>` : ''}
      <div class="gap"></div>
      <a href="#/record/${r.id}" class="btn btn-text">← Back to ${esc(r.name)}</a>`;
  },

  record(id) {
    const r = recById(id);
    if (!r) return `<p class="t-body">Record not found. <a href="#/pipeline">Back to pipeline</a></p>`;
    return `
      ${backLink()}
      <div class="rec-head">
        ${avatar(r, 56)}
        <div style="flex:1">
          <h1 class="t-title" style="margin:0">${esc(r.name)}</h1>
          <div style="display:flex;gap:8px;margin-top:8px;align-items:center;flex-wrap:wrap">${laneChip(r)} ${bandChip(r)} ${tierChip(r)} <span class="m-data t-muted">VIA ${esc(r.channel.toUpperCase())}</span></div>
        </div>
      </div>
      ${r.escalation ? `<div class="esc-banner"><span class="m-data">▲ ${esc(r.escalation.toUpperCase())} — HANDED TO A HUMAN OWNER. AGENT STAYS ON RESEARCH, DRAFTING AND ADMIN.</span></div><div class="gap"></div>` : ''}
      ${stageBar(r)}
      ${nextStepPanel(r)}
      <div class="grid-2">
        <div class="panel">
          <span class="m-label">SCORE — WHY, IN PLAIN ENGLISH</span>
          <div class="kv"><span>Fit (slow-moving)</span><span class="fit">${r.fit}</span></div>
          <div class="kv"><span>Intent (decayed)</span><span class="fit">${r.intent}</span></div>
          <div class="kv"><span>Likelihood = 0.4×fit + 0.6×intent</span><span>${likelihoodBar(r.likelihood)}</span></div>
          <div class="kv"><span>Band</span><span>${bandChip(r)}</span></div>
          <div style="margin-top:14px;padding-top:6px;border-top:var(--line)">
            ${r.explain.map(x => `<div class="sig">${esc(x)}</div>`).join('')}
          </div>
        </div>
        <div class="panel">
          <span class="m-label">ROUTING & VERDICT</span>
          <div class="kv"><span>Complexity score</span><span class="fit">${r.complexity} / 130</span></div>
          <div class="kv"><span>Lane</span><span>${laneChip(r)}</span></div>
          <div class="kv"><span>Verdict — vs ${esc(r.verdict.vs)}</span><span style="color:${r.verdict.type === 'LOSS RISK' ? 'var(--tilly-red)' : r.verdict.type === 'UNKNOWN' ? 'var(--tilly-grey-500)' : 'var(--tilly-green)'}">${esc(r.verdict.type)}</span></div>
          <div style="margin-top:14px;padding-top:14px;border-top:var(--line)" class="t-caption">${esc(r.verdict.play)}</div>
        </div>
        <div class="panel">
          <span class="m-label">ORG INTELLIGENCE — AUTO-ENRICHED</span>
          <div class="kv"><span>Charity number</span><span>${esc(r.charityNo)}</span></div>
          <div class="kv"><span>Income band</span><span>${esc(r.incomeBand)}</span></div>
          <div class="kv"><span>Cause area</span><span>${esc(r.cause)}</span></div>
          <div class="kv"><span>Staff</span><span>${r.staff.toLocaleString('en-GB')}</span></div>
          <div class="kv"><span>Shops</span><span>${r.shops}</span></div>
          ${r.state ? `<div class="kv"><span>Lifecycle state</span><span>${esc(r.state)}</span></div>` : ''}
        </div>
        <div class="panel">
          <span class="m-label">CONTACT INTELLIGENCE</span>
          <div class="kv"><span>Contact</span><span>${esc(r.contact.name)}</span></div>
          <div class="kv"><span>Role</span><span>${esc(r.contact.role)}</span></div>
          <div class="kv"><span>Tenure</span><span>${esc(r.contact.tenure)}</span></div>
          <div style="margin-top:14px;padding-top:14px;border-top:var(--line)" class="t-caption">${esc(r.contact.note)}</div>
        </div>
        <div class="panel">
          <span class="m-label">DEAL</span>
          <div class="kv"><span>Deal size (ACV)</span><span class="fit">${esc(r.acv)}</span></div>
          <div class="kv"><span>Term</span><span>${esc(r.term)}</span></div>
          <div class="kv"><span>Users</span><span>${esc(r.users)}</span></div>
          <div class="kv"><span>Decision maker</span><span>${esc((r.stakeholders.find(s => s.tag.startsWith('DECISION MAKER')) || {}).name || '—')}</span></div>
          <div class="kv"><span>Deal owner</span><span>${esc(ownerName(r))}</span></div>
        </div>
        <div class="panel">
          <span class="m-label">STAKEHOLDER MAP — CLICK A PERSON FOR THEIR FULL PROFILE</span>
          ${r.stakeholders.map((s, i) => {
            const clickable = /^[A-Z][a-z]+ [A-Z][a-z]+$/.test(s.name);
            return `
            <div class="kv${clickable ? ' click' : ''}"${clickable ? ` data-goto="#/person/${r.id}.${i}" style="cursor:pointer"` : ''}>
              <span>${clickable ? `<span style="color:var(--tilly-blue);font-weight:600">${esc(s.name)}</span>` : esc(s.name)} <span class="t-caption">· ${esc(s.role)}</span></span>
              <span style="display:flex;gap:8px;align-items:center"><span class="chip${s.tag.startsWith('DECISION') ? ' chip-front' : ''}" style="font-size:9px;padding:4px 8px">${esc(s.tag)}</span>${clickable ? '<span class="m-data" style="color:var(--tilly-blue)">→</span>' : ''}</span>
            </div>`;
          }).join('')}
        </div>
        <div class="panel" style="grid-column:1 / -1">
          <span class="m-label">SIGNALS</span>
          ${r.signals.map(s => `<div class="sig">${esc(s)}</div>`).join('')}
        </div>
      </div>
      <div class="gap"></div>
      <div class="feed">
        <div class="feed-head"><span class="feed-live">● LIVE</span><span class="feed-title">TILLY'S REASONING — THIS ACCOUNT</span><span class="feed-sub">IF IT'S MONO, THE AI SAID IT</span></div>
        ${r.trace.map(t => `<div>${esc(t)}</div>`).join('')}
      </div>
      <div class="gap"></div>
      <a href="#/pipeline" class="btn btn-text">← Back to pipeline</a>`;
  }
};

/* ---- Router ---- */

function render() {
  const hash = location.hash || '#/cockpit';
  let [, view, param] = hash.split('/');
  if (view === 'tour') { tour = 0; view = 'cockpit'; }
  const name = views[view] ? view : 'cockpit';
  $view.innerHTML = views[name](param);
  document.querySelectorAll('.nav a').forEach(a => {
    a.classList.toggle('active', a.dataset.view === name || ((name === 'record' || name === 'person') && a.dataset.view === 'pipeline'));
  });
  window.scrollTo(0, 0);
  paintTour();
}

$view.addEventListener('click', e => {
  const tick = e.target.closest('[data-task]');
  if (tick) {
    DATA.tasks[+tick.dataset.task].done = !DATA.tasks[+tick.dataset.task].done;
    updateCounts(); render();
    return;
  }
  const pv = e.target.closest('[data-preview-video]');
  if (pv) {
    const i = +pv.dataset.previewVideo;
    previewVideo = previewVideo === i ? null : i;
    render();
    return;
  }
  const sv = e.target.closest('[data-send-video]');
  if (sv) {
    DATA.success.adoption[+sv.dataset.sendVideo].status = DATA.settings.testMode
      ? `QUEUED · T1 → ${DATA.settings.emailProxy.toUpperCase()} (TEST PROXY)`
      : 'QUEUED — IN-PRODUCT + EMAIL · T1';
    render();
    return;
  }
  const qbr = e.target.closest('[data-qbr]');
  if (qbr) {
    const id = qbr.dataset.qbr;
    S_setRetention(id, `QBR REQUEST + PREP PACK → ${DATA.settings.emailProxy.toUpperCase()} (TEST PROXY)`);
    return;
  }
  const conn = e.target.closest('[data-connect]');
  if (conn) {
    S_setRetention(conn.dataset.connect, `COURTESY CONNECT OFFERED — 15 MIN, NO AGENDA → ${DATA.settings.emailProxy.toUpperCase()} (TEST PROXY)`);
    return;
  }
  const gift = e.target.closest('[data-gift]');
  if (gift) {
    const r = recById(gift.dataset.gift);
    S_setRetention(r.id, `GIFT QUEUED — HANDWRITTEN CARD + HAMPER TO ${r.contact.name.toUpperCase()}, DISPATCH 48H`);
    return;
  }
  const approve = e.target.closest('[data-approve]');
  if (approve) {
    e.stopPropagation();
    DATA.engageQueue[+approve.dataset.approve].approved = true;
    DATA.engageQueue[+approve.dataset.approve].proxied = DATA.settings.testMode;
    render();
    return;
  }
  if (e.target.closest('[data-run-agent]')) { runAgent(); return; }
  const lic = e.target.closest('[data-li-connect]');
  if (lic) {
    const [recId, idx] = lic.dataset.liConnect.split('.');
    const r = recById(recId);
    const s = r.stakeholders[+idx];
    DATA.linkedin.queued[r.id + '|' + s.name] = 'CONNECTION QUEUED — PERSONALISED NOTE';
    DATA.feed.unshift({ t: 'NOW', record: r.id, who: r.initials, msg: `LinkedIn invite queued for ${s.name} — note drafted from their latest post` });
    render();
    return;
  }
  if (e.target.closest('[data-li-bulk]')) {
    let n = 0;
    const OPEN_STAGES = ['Prospecting', 'Engaged', 'Funnel', 'Identified', 'Trial', 'Tender', 'Proposal', 'Negotiation'];
    DATA.records.forEach(r => {
      if (!OPEN_STAGES.includes(r.stage) || r.escalation) return;
      const p = DATA.people[r.id + '|' + r.contact.name];
      if (p && p.disposition === 'DETRACTOR') return;
      if (!/^[A-Z][a-z]+ [A-Z][a-z]+$/.test(r.contact.name)) return;
      const key = r.id + '|' + r.contact.name;
      if (!DATA.linkedin.queued[key]) { DATA.linkedin.queued[key] = 'IN SEQUENCE — DAY 0 QUEUED'; n++; }
    });
    DATA.linkedin.bulkDone = true;
    DATA.feed.unshift({ t: 'NOW', record: null, who: 'LINKEDIN', msg: `${n} connection invites queued at 15/day — detractors, complaints and won accounts excluded` });
    render();
    return;
  }
  const gtm = e.target.closest('[data-gtm]');
  if (gtm) {
    const play = DATA.gtm.plays.find(p => p.id === gtm.dataset.gtm);
    DATA.gtm.applied[play.id] = play.tier === 'FLAG' ? 'FLAGGED — SESSION RECORDINGS ATTACHED' : play.tier === 'T2' ? 'APPLIED · LOGGED — REVERSIBLE' : 'QUEUED · T1';
    DATA.feed.unshift({ t: 'NOW', record: null, who: 'GTM', msg: `${play.text} — ${play.tier === 'FLAG' ? 'flagged to engineering' : 'applied by Tilly, audit written'}` });
    render();
    return;
  }
  if (e.target.closest('[data-clear-filters]')) {
    bandFilter = 'ALL'; laneFilter = 'ALL'; searchQuery = '';
    document.getElementById('search').value = '';
    render();
    return;
  }
  const fchip = e.target.closest('.fchip');
  if (fchip) {
    if (fchip.dataset.rep) { location.hash = '#/rep/' + fchip.dataset.rep; return; }
    if (fchip.dataset.pview) pipeView = fchip.dataset.pview;
    if (fchip.dataset.band) bandFilter = fchip.dataset.band;
    if (fchip.dataset.lane) laneFilter = fchip.dataset.lane;
    render();
    return;
  }
  const doBtn = e.target.closest('[data-do]');
  if (doBtn) {
    const r = recById(doBtn.dataset.do);
    const task = DATA.tasks.find(t => t.record === r.id && !t.done);
    const eng = DATA.engageQueue.find(q => q.record === r.id && !q.approved && /^(AMBER|RED)/.test(q.authority));
    if (task) { location.hash = '#/tasks'; render(); }
    else if (eng) { location.hash = '#/engage'; render(); }
    else {
      r.actionQueued = true;
      DATA.feed.unshift({ t: 'NOW', record: r.id, who: r.initials, msg: `${r.nextAction} — queued by you, Tilly executing` });
      render();
    }
    return;
  }
  const scr = e.target.closest('[data-scroll]');
  if (scr) {
    const target = $view.querySelector(scr.dataset.scroll);
    if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    return;
  }
  if (e.target.closest('[data-pole-filter]')) {
    bandFilter = 'POLE'; laneFilter = 'ALL';
    location.hash = '#/pipeline'; render();
    return;
  }
  const goto = e.target.closest('[data-goto]');
  if (goto) { location.hash = goto.dataset.goto; render(); return; }
  const expand = e.target.closest('[data-expand]');
  if (expand) {
    const k = expand.dataset.expand;
    expandedGrid.has(k) ? expandedGrid.delete(k) : expandedGrid.add(k);
    render();
    return;
  }
  const row = e.target.closest('[data-id]');
  if (row) location.hash = `#/record/${row.dataset.id}`;
});

/* Drag & drop on the pipeline board */
$view.addEventListener('dragstart', e => {
  const card = e.target.closest('[data-drag]');
  if (card) { dragId = card.dataset.drag; if (e.dataTransfer) e.dataTransfer.effectAllowed = 'move'; }
});
$view.addEventListener('dragover', e => {
  const col = e.target.closest('[data-drop]');
  if (col && dragId) {
    e.preventDefault();
    document.querySelectorAll('.kcol.dropover').forEach(c => c.classList.remove('dropover'));
    col.classList.add('dropover');
  }
});
$view.addEventListener('dragleave', e => {
  const col = e.target.closest('[data-drop]');
  if (col) col.classList.remove('dropover');
});
$view.addEventListener('drop', e => {
  const col = e.target.closest('[data-drop]');
  if (!col || !dragId) return;
  e.preventDefault();
  const r = recById(dragId);
  const newStage = col.dataset.drop;
  if (r && BOARD_MAP[r.stage] !== newStage) {
    r.stage = newStage;
    DATA.feed.unshift({ t: 'NOW', record: r.id, who: r.name.toUpperCase().split(' ')[0], msg: `Stage moved to ${newStage} by you — audit entry written, next action recomputed` });
  }
  dragId = null;
  render();
});

/* Search — lives in the static topbar, so focus survives re-render */
const $search = document.getElementById('search');
$search.addEventListener('input', () => {
  searchQuery = $search.value;
  if ((location.hash || '#/cockpit').indexOf('#/pipeline') !== 0) location.hash = '#/pipeline';
  else render();
});

window.addEventListener('hashchange', render);

/* Sidebar counts */
function updateCounts() {
  document.getElementById('count-tasks').textContent = DATA.tasks.filter(t => !t.done).length;
  document.getElementById('count-pipeline').textContent = DATA.records.length;
  document.getElementById('count-selfserve').textContent = DATA.records.filter(r => r.lane !== 'enterprise').length;
  document.getElementById('count-enterprise').textContent = DATA.records.filter(r => r.lane === 'enterprise').length;
  document.getElementById('count-engage').textContent = DATA.engageQueue.length;
  document.getElementById('count-esc').textContent = DATA.records.filter(r => r.escalation).length;
  document.getElementById('count-success').textContent = DATA.success.health.length;
  document.getElementById('count-rep').textContent = DATA.records.filter(r => r.owner === 'priya').length;
}
updateCounts();

