/* Tilly CRM — hash router + view renderers. No build step, no dependencies. */

const $view = document.getElementById('view');
const recById = id => DATA.records.find(r => r.id === id);
const esc = s => String(s).replace(/[&<>"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));

/* ---- Shared fragments ---- */

const stageChip = r => {
  if (r.escalation) return `<span class="chip chip-esc">ESCALATED</span>`;
  if (r.stage === 'Won') return `<span class="chip chip-won">WON</span>`;
  return `<span class="chip">${esc(r.stage.toUpperCase())}</span>`;
};

const routeChip = r => r.route === 'enterprise'
  ? `<span class="chip chip-enterprise">ENTERPRISE</span>`
  : `<span class="chip chip-selfserve">SELF-SERVE</span>`;

const likelihoodBar = v =>
  `<span class="likelihood"><span class="bar"><b style="width:${v}%"></b></span><span class="m-data">${v}%</span></span>`;

const recordRows = records => records.map(r => `
  <tr class="click" data-id="${r.id}">
    <td><div style="display:flex;align-items:center;gap:12px"><div class="avatar${r.route === 'selfserve' ? ' avatar-alt' : ''}" style="width:32px;height:32px;font-size:12px">${r.initials}</div><span style="font-weight:600">${esc(r.name)}</span></div></td>
    <td>${routeChip(r)}</td>
    <td>${stageChip(r)}</td>
    <td><span class="fit">${r.fit} FIT</span></td>
    <td>${likelihoodBar(r.likelihood)}</td>
    <td class="t-caption">${esc(r.nextAction)}</td>
  </tr>`).join('');

const recordTable = records => `
  <table class="tbl">
    <thead><tr><th>Account</th><th>Route</th><th>Stage</th><th>Fit</th><th>Convert likelihood</th><th>Next action</th></tr></thead>
    <tbody>${recordRows(records)}</tbody>
  </table>`;

const cardGrid = items => `
  <div class="grid-4">${items.map(c => `
    <div class="panel" style="padding:18px 20px">
      <div class="t-heading" style="font-size:14px">${esc(c.name)}</div>
      <div class="t-caption" style="margin-top:4px">${esc(c.desc)}</div>
      ${c.week !== undefined ? `<div class="m-data" style="margin-top:12px;color:var(--tilly-blue)">${c.week} THIS WEEK</div>` : ''}
    </div>`).join('')}
  </div>`;

const board = (title, rows, detail) => `
  <div class="board">
    <div class="zone-head"><span class="m-label" style="margin:0">${esc(title)}</span></div>
    ${rows.map((r, i) => `
      <div class="board-row${i === 0 ? ' lead' : ''}">
        <span class="pos">${r.pos}</span>
        <span class="name">${esc(r.name)}${detail && r.streak ? ` <span class="detail">— ${esc(r.streak)}</span>` : ''}</span>
        <span class="bar"><b style="width:${r.rate}%"></b></span>
        <span class="val">${r.rate}%</span>
      </div>`).join('')}
  </div>`;

/* ---- Views ---- */

const views = {

  cockpit() {
    return `
      <h1 class="t-title page-title">Cockpit</h1>
      <p class="t-body t-muted page-sub">Race weekend, every week. Outcomes from every path feed the leaderboards live.</p>
      <div class="stats">
        ${DATA.cockpitStats.map((s, i) => `<div class="stat${i === 0 ? ' stat-blue' : i === 3 ? ' stat-dark' : ''}"><span class="m-label">${s.label}</span><strong>${s.value}</strong></div>`).join('')}
      </div>
      <div class="gap"></div>
      ${board("DRIVERS' CHAMPIONSHIP — REPS BY HOT-LEAD CONVERSION", DATA.reps, true)}
      <div class="gap"></div>
      ${board("CONSTRUCTORS' CHAMPIONSHIP — PRODUCTS BY WIN RATE", DATA.products)}
      <div class="gap"></div>
      <div class="feed">${DATA.feed.map(f => `<div>${esc(f)}</div>`).join('')}</div>`;
  },

  pipeline() {
    return `
      <h1 class="t-title page-title">Pipeline</h1>
      <p class="t-body t-muted page-sub">Every record captured from a channel, auto-enriched, scored, and routed. Click a row for the full dossier.</p>
      ${recordTable(DATA.records)}`;
  },

  channels() {
    return `
      <h1 class="t-title page-title">Channels</h1>
      <p class="t-body t-muted page-sub">Nine sources, one record. Every touch creates or matches — no manual entry, ever.</p>
      <div class="m-section" style="margin-bottom:16px">1 — INBOUND</div>
      ${cardGrid(DATA.channels.inbound)}
      <div class="gap-lg"></div>
      <div class="m-section" style="margin-bottom:16px">2 — OUTBOUND</div>
      ${cardGrid(DATA.channels.outbound)}
      <div class="gap-lg"></div>
      <div class="m-section" style="margin-bottom:16px">3 — AUTO-ENRICHMENT ON CAPTURE</div>
      ${cardGrid(DATA.enrichment)}
      <div class="gap-lg"></div>
      <div class="m-section" style="margin-bottom:16px">4 — THE INTELLIGENCE CORE</div>
      ${cardGrid(DATA.core)}`;
  },

  selfserve() {
    const recs = DATA.records.filter(r => r.route === 'selfserve');
    return `
      <h1 class="t-title page-title">Self-serve</h1>
      <p class="t-body t-muted page-sub">The e-commerce path: ad funnel → checkout → onboarding → renewal and upsell. Tilly runs it end to end.</p>
      ${recordTable(recs)}`;
  },

  enterprise() {
    const recs = DATA.records.filter(r => r.route === 'enterprise');
    return `
      <h1 class="t-title page-title">Enterprise</h1>
      <p class="t-body t-muted page-sub">The contract path: tender tracking, auto-drafted proposals, contracts built from need, procurement workflow.</p>
      ${recordTable(recs)}`;
  },

  engage() {
    return `
      <h1 class="t-title page-title">Engage</h1>
      <p class="t-body t-muted page-sub">The outbound push. Video, dossiers, proposals and contracts — sent on the best next channel.</p>
      <table class="tbl">
        <thead><tr><th>Type</th><th>Item</th><th>Account</th><th>Channel</th><th>When</th><th>Status</th></tr></thead>
        <tbody>
          ${DATA.engageQueue.map(q => {
            const r = recById(q.record);
            return `<tr class="click" data-id="${r.id}">
              <td><span class="chip">${q.type}</span></td>
              <td style="font-weight:600">${esc(q.item)}</td>
              <td>${esc(r.name)}</td>
              <td class="t-caption">${esc(q.channel)}</td>
              <td><span class="m-data">${esc(q.when.toUpperCase())}</span></td>
              <td class="t-caption">${esc(q.status)}</td>
            </tr>`;
          }).join('')}
        </tbody>
      </table>`;
  },

  escalations() {
    const escs = DATA.records.filter(r => r.escalation);
    return `
      <h1 class="t-title page-title">Escalations</h1>
      <p class="t-body t-muted page-sub">Tilly owns the journey until one of five triggers fires. These are the only ways a deal reaches a human.</p>
      <div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:32px">
        ${DATA.escalationTriggers.map(t => `<span class="chip" style="color:var(--tilly-red);border-color:var(--tilly-red)">${esc(t.toUpperCase())}</span>`).join('')}
      </div>
      ${escs.map(r => `
        <div class="esc-banner click" data-id="${r.id}" style="cursor:pointer">
          <div class="avatar" style="background:var(--tilly-black)">${r.initials}</div>
          <div style="flex:1"><div class="t-heading" style="font-size:14px">${esc(r.name)}</div><div class="t-caption">${esc(r.nextAction)}</div></div>
          <span class="m-data" style="color:var(--tilly-red)">${esc(r.escalation.toUpperCase())}</span>
        </div>`).join('')}`;
  },

  record(id) {
    const r = recById(id);
    if (!r) return `<p class="t-body">Record not found. <a href="#/pipeline">Back to pipeline</a></p>`;
    return `
      <div class="rec-head">
        <div class="avatar${r.route === 'selfserve' ? ' avatar-alt' : ''}">${r.initials}</div>
        <div style="flex:1">
          <h1 class="t-title" style="margin:0">${esc(r.name)}</h1>
          <div style="display:flex;gap:8px;margin-top:8px;align-items:center">${routeChip(r)} ${stageChip(r)} <span class="fit">${r.fit} FIT</span> <span class="m-data t-muted">CAPTURED VIA ${esc(r.channel.toUpperCase())}</span></div>
        </div>
        <button class="btn btn-primary">${esc(r.nextAction)}</button>
      </div>
      ${r.escalation ? `<div class="esc-banner"><span class="m-data">▲ ${esc(r.escalation.toUpperCase())} — TILLY HAS HANDED THIS TO A HUMAN OWNER. CONTEXT PACK ATTACHED.</span></div><div class="gap"></div>` : ''}
      <div class="grid-2">
        <div class="panel">
          <span class="m-label">ORG INTELLIGENCE — AUTO-ENRICHED</span>
          <div class="kv"><span>Charity number</span><span>${esc(r.charityNo)}</span></div>
          <div class="kv"><span>Income band</span><span>${esc(r.incomeBand)}</span></div>
          <div class="kv"><span>Cause area</span><span>${esc(r.cause)}</span></div>
          <div class="kv"><span>Staff</span><span>${r.staff.toLocaleString('en-GB')}</span></div>
          <div class="kv"><span>Shops</span><span>${r.shops}</span></div>
          <div class="kv"><span>Convert likelihood</span><span>${likelihoodBar(r.likelihood)}</span></div>
        </div>
        <div class="panel">
          <span class="m-label">CONTACT INTELLIGENCE</span>
          <div class="kv"><span>Contact</span><span>${esc(r.contact.name)}</span></div>
          <div class="kv"><span>Role</span><span>${esc(r.contact.role)}</span></div>
          <div class="kv"><span>Tenure</span><span>${esc(r.contact.tenure)}</span></div>
          <div style="margin-top:14px;padding-top:14px;border-top:var(--line)" class="t-caption">${esc(r.contact.note)}</div>
        </div>
        <div class="panel">
          <span class="m-label">SIGNALS</span>
          ${r.signals.map(s => `<div class="sig">${esc(s)}</div>`).join('')}
        </div>
        <div class="panel">
          <span class="m-label">COMPETITIVE POSITION</span>
          <div class="kv"><span>Against</span><span>${esc(r.competitive.vs)}</span></div>
          <div class="kv"><span>Position</span><span style="color:${r.competitive.position === 'lose' ? 'var(--tilly-red)' : 'var(--tilly-green)'}">${r.competitive.position.toUpperCase()}</span></div>
          <div style="margin-top:14px;padding-top:14px;border-top:var(--line)" class="t-caption">${esc(r.competitive.note)}</div>
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
  const row = e.target.closest('[data-id]');
  if (row) location.hash = `#/record/${row.dataset.id}`;
});

window.addEventListener('hashchange', render);

/* Sidebar counts */
document.getElementById('count-pipeline').textContent = DATA.records.length;
document.getElementById('count-selfserve').textContent = DATA.records.filter(r => r.route === 'selfserve').length;
document.getElementById('count-enterprise').textContent = DATA.records.filter(r => r.route === 'enterprise').length;
document.getElementById('count-engage').textContent = DATA.engageQueue.length;
document.getElementById('count-esc').textContent = DATA.records.filter(r => r.escalation).length;

render();
