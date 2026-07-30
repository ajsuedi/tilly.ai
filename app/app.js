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
  Object.assign(r, DATA.deals[r.id]);
});

const gbp = n => n >= 1e6 ? '£' + (n / 1e6).toFixed(2) + 'm' : n >= 1000 ? '£' + Math.round(n / 1000) + 'k' : '£' + n;
const pipeValue = recs => recs.reduce((s, r) => s + r.acvNum, 0);
const weightedValue = recs => Math.round(recs.reduce((s, r) => s + r.acvNum * r.likelihood / 100, 0));
const liveARR = () => DATA.subscriptions.reduce((s, x) => s + 12 * (parseInt(x.mrr.replace(/[£,]/g, '')) || 0), 0);

/* ---- UI state (in-memory only) ---- */

let searchQuery = '';
let bandFilter = 'ALL';
let laneFilter = 'ALL';
const expandedGrid = new Set();

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

const laneChip = r => ({
  enterprise: `<span class="chip chip-enterprise">ENTERPRISE</span>`,
  assisted: `<span class="chip chip-assisted">ASSISTED</span>`,
  selfserve: `<span class="chip chip-selfserve">SELF-SERVE</span>`
})[r.lane];

const bandChip = r => {
  const cls = { 'POLE': 'chip-pole', 'FRONT ROW': 'chip-front', 'MIDFIELD': '', 'BACK MARKER': 'chip-back', 'COLD': 'chip-back' }[r.band];
  return `<span class="chip ${cls}">${r.band}</span>`;
};

const tierChip = r => r.tier === 'HUMAN'
  ? `<span class="chip chip-esc">HUMAN OWNER</span>`
  : `<span class="chip">AGENT ${esc(r.tier)}</span>`;

const likelihoodBar = v =>
  `<span class="likelihood"><span class="bar"><b style="width:${v}%"></b></span><span class="m-data">${v}%</span></span>`;

const byLikelihood = records => [...records].sort((a, b) => b.likelihood - a.likelihood);

const recordRows = records => records.map(r => `
  <tr class="click${r.band === 'POLE' ? ' pole' : ''}" data-id="${r.id}">
    <td><div style="display:flex;align-items:center;gap:12px">${avatar(r)}<span style="font-weight:600">${esc(r.name)}</span></div></td>
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

/* ---- Views ---- */

const views = {

  cockpit() {
    const grid = startingGrid();
    const openTasks = DATA.tasks.filter(t => !t.done).length;
    const pole = DATA.records.filter(r => r.band === 'POLE').length;
    const stats = [
      { label: 'NEED A HUMAN NOW', value: String(grid.length), cls: ' stat-blue' },
      { label: 'OPEN TASKS', value: String(openTasks), cls: '' },
      { label: 'POLE — HOT LEADS', value: String(pole), cls: '' },
      { label: 'TEAM STREAK', value: '7 DAYS', cls: ' stat-dark' }
    ];
    const t = DATA.teamObjective;
    return `
      <h1 class="t-title page-title">Cockpit</h1>
      <p class="t-body t-muted page-sub">${esc(DATA.race.week)} · ${esc(DATA.race.season)}. Your race starts below — click a row to see exactly what to do.</p>
      <div class="stats">
        ${stats.map(s => `<div class="stat${s.cls}"><span class="m-label">${s.label}</span><strong>${s.value}</strong></div>`).join('')}
      </div>
      <div class="gap"></div>
      <div class="grid-2" style="align-items:start">
        ${[['STARTING GRID — ENTERPRISE', grid.filter(g => g.r.lane === 'enterprise')],
           ['STARTING GRID — SELF-SERVE & ASSISTED', grid.filter(g => g.r.lane !== 'enterprise')]].map(([title, items]) => `
        <div class="board">
          <div class="zone-head"><span class="m-label" style="margin:0">${title}</span><span class="m-data t-muted">${items.length}</span></div>
          ${items.map(g => {
            const k = g.r.id + '|' + g.label;
            return `
            <div class="grid-row" data-expand="${esc(k)}">
              <span class="clock">${g.urgency}</span>
              ${avatar(g.r)}
              <div style="flex:1;min-width:0"><div class="t-heading" style="font-size:14px">${esc(g.r.name)}</div><div class="m-data t-muted" style="font-size:10px">${esc(g.label)}</div></div>
              <span class="m-data" style="color:var(--tilly-blue)">${expandedGrid.has(k) ? '−' : '+'}</span>
            </div>
            ${expandedGrid.has(k) ? `
            <div class="grid-expand">
              ${g.steps.map(s => `<div class="sig">${esc(s)}</div>`).join('')}
              <div style="display:flex;gap:10px;margin-top:14px;flex-wrap:wrap">
                <button class="btn btn-primary btn-sm" data-goto="${g.goto}">${esc(g.action)}</button>
                <button class="btn btn-secondary btn-sm" data-goto="#/record/${g.r.id}">Open record</button>
              </div>
            </div>` : ''}`;
          }).join('') || '<div class="t-caption" style="padding:16px 20px">Clear — nothing needs a human here.</div>'}
        </div>`).join('')}
      </div>
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
      <div class="m-section" style="margin-bottom:16px">THE CHAMPIONSHIPS</div>
      ${board("DRIVERS' — POINTS THIS SEASON", DATA.reps)}
      <div class="m-data t-muted" style="display:block;margin:6px 0 0">${esc(DATA.race.fastestLap)}</div>
      <div class="gap"></div>
      ${board("CONSTRUCTORS' — PRODUCTS BY WIN RATE", DATA.products)}
      <div class="gap"></div>
      <div class="panel" style="padding:18px 20px">
        <span class="m-label">${esc(t.label)}</span>
        <div class="likelihood" style="margin-top:4px"><span class="bar" style="width:100%;height:8px"><b style="width:${Math.round(100 * t.current / t.target)}%"></b></span><span class="m-data">${t.current} / ${t.target}</span></div>
        <div class="t-caption" style="margin-top:10px">Shared target unlocks a team reward — the board never goes zero-sum.</div>
      </div>
      <div class="gap"></div>
      <div class="feed">${DATA.feed.map(f => `<div>${esc(f)}</div>`).join('')}</div>`;
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
    return `
      <h1 class="t-title page-title">Top of funnel</h1>
      <p class="t-body t-muted page-sub">Tilly fetches, enriches and qualifies leads every night at 02:00. Your job is three things: turn up to meetings, have the conversation, and say the next step out loud — Granola records it and the CRM sets it. Nothing else.</p>
      <div class="stats">
        ${DATA.funnel.run.map((s, i) => `<div class="stat${i === 3 ? ' stat-blue' : ''}"><span class="m-label">${s.label}</span><strong>${s.value}</strong></div>`).join('')}
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
      <p class="t-body t-muted page-sub">Sorted by convert likelihood — work top to bottom. Click a row for the dossier.</p>
      <div class="stats" style="margin-bottom:16px">
        <div class="stat stat-blue"><span class="m-label">TOTAL PIPELINE (ACV)</span><strong>${gbp(pipeValue(DATA.records))}</strong></div>
        <div class="stat"><span class="m-label">WEIGHTED × LIKELIHOOD</span><strong>${gbp(weightedValue(DATA.records))}</strong></div>
        <div class="stat"><span class="m-label">ENTERPRISE</span><strong>${gbp(pipeValue(ent))}</strong></div>
        <div class="stat"><span class="m-label">SELF-SERVE & ASSISTED</span><strong>${gbp(pipeValue(ss))}</strong></div>
      </div>
      <div class="filterbar">
        ${bands.map(b => `<button class="fchip${bandFilter === b ? ' on' : ''}" data-band="${b}">${b}</button>`).join('')}
        <span style="width:12px"></span>
        ${lanes.map(([v, l]) => `<button class="fchip${laneFilter === v ? ' on' : ''}" data-lane="${v}">${l}</button>`).join('')}
        ${q ? `<span class="m-data t-muted">SEARCH: “${esc(searchQuery.trim().toUpperCase())}” · ${recs.length} OF ${DATA.records.length}</span>` : ''}
      </div>
      ${recs.length ? recordTable(recs) : `
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
      <div class="feed" style="margin-bottom:8px">${m.formula.map(f => `<div>${esc(f)}</div>`).join('')}</div>
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
      <p class="t-body t-muted page-sub">The e-commerce path, plus the assisted lane. One funnel from first visit to active usage, then subscription billing tracked to the penny.</p>
      <div class="stats" style="margin-bottom:16px">
        <div class="stat stat-blue"><span class="m-label">PIPELINE VALUE (ACV)</span><strong>${gbp(pipeValue(recs))}</strong></div>
        <div class="stat"><span class="m-label">WEIGHTED × LIKELIHOOD</span><strong>${gbp(weightedValue(recs))}</strong></div>
        <div class="stat"><span class="m-label">LIVE ARR (SUBSCRIPTIONS)</span><strong>${gbp(liveARR())}</strong></div>
        <div class="stat"><span class="m-label">ACTIVATION TARGET</span><strong>14 DAYS</strong></div>
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
      <p class="t-body t-muted page-sub">Rep-owned; the agent runs research, drafting and admin. Deal progress left to right; tender deadlines set the clock.</p>
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
      <p class="t-body t-muted page-sub">The outbound push, stamped with the authority that lets it send. Amber items need one click from you — everything else sends itself.</p>
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
              <td><span class="m-data${q.approved ? ' approved' : ''}" style="color:${q.approved ? 'var(--tilly-green)' : red ? 'var(--tilly-red)' : amber ? 'var(--tilly-grey-500)' : 'var(--tilly-green)'}">${q.approved ? '✓ APPROVED · SENDING' : esc(q.authority)}</span></td>
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

  record(id) {
    const r = recById(id);
    if (!r) return `<p class="t-body">Record not found. <a href="#/pipeline">Back to pipeline</a></p>`;
    return `
      ${backLink()}
      <div class="rec-head">
        ${avatar(r, 56)}
        <div style="flex:1">
          <h1 class="t-title" style="margin:0">${esc(r.name)}</h1>
          <div style="display:flex;gap:8px;margin-top:8px;align-items:center;flex-wrap:wrap">${laneChip(r)} ${bandChip(r)} ${stageChip(r)} ${tierChip(r)} <span class="m-data t-muted">VIA ${esc(r.channel.toUpperCase())}</span></div>
        </div>
        <button class="btn btn-primary">${esc(r.nextAction)}</button>
      </div>
      ${r.escalation ? `<div class="esc-banner"><span class="m-data">▲ ${esc(r.escalation.toUpperCase())} — HANDED TO A HUMAN OWNER. AGENT STAYS ON RESEARCH, DRAFTING AND ADMIN.</span></div><div class="gap"></div>` : ''}
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
        </div>
        <div class="panel">
          <span class="m-label">STAKEHOLDER MAP — BUYING COMMITTEE</span>
          ${r.stakeholders.map(s => `
            <div class="kv"><span>${esc(s.name)} <span class="t-caption">· ${esc(s.role)}</span></span><span><span class="chip${s.tag.startsWith('DECISION') ? ' chip-front' : ''}" style="font-size:9px;padding:4px 8px">${esc(s.tag)}</span></span></div>`).join('')}
        </div>
        <div class="panel" style="grid-column:1 / -1">
          <span class="m-label">SIGNALS</span>
          ${r.signals.map(s => `<div class="sig">${esc(s)}</div>`).join('')}
        </div>
      </div>
      <div class="gap"></div>
      <div class="feed">${r.trace.map(t => `<div>${esc(t)}</div>`).join('')}</div>
      <div class="gap"></div>
      <a href="#/pipeline" class="btn btn-text">← Back to pipeline</a>`;
  }
};

/* ---- Router ---- */

function render() {
  const hash = location.hash || '#/cockpit';
  const [, view, param] = hash.split('/');
  const name = views[view] ? view : 'cockpit';
  $view.innerHTML = views[name](param);
  document.querySelectorAll('.nav a').forEach(a => {
    a.classList.toggle('active', a.dataset.view === name || (name === 'record' && a.dataset.view === 'pipeline'));
  });
  window.scrollTo(0, 0);
}

$view.addEventListener('click', e => {
  const tick = e.target.closest('[data-task]');
  if (tick) {
    DATA.tasks[+tick.dataset.task].done = !DATA.tasks[+tick.dataset.task].done;
    updateCounts(); render();
    return;
  }
  const approve = e.target.closest('[data-approve]');
  if (approve) {
    e.stopPropagation();
    DATA.engageQueue[+approve.dataset.approve].approved = true;
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
    if (fchip.dataset.band) bandFilter = fchip.dataset.band;
    if (fchip.dataset.lane) laneFilter = fchip.dataset.lane;
    render();
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
}
updateCounts();

render();
