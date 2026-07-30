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
});

/* ---- Shared fragments ---- */

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

const recordRows = records => records.map(r => `
  <tr class="click" data-id="${r.id}">
    <td><div style="display:flex;align-items:center;gap:12px"><div class="avatar${r.lane !== 'enterprise' ? ' avatar-alt' : ''}" style="width:32px;height:32px;font-size:12px">${r.initials}</div><span style="font-weight:600">${esc(r.name)}</span></div></td>
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

/* ---- Views ---- */

const views = {

  cockpit() {
    const t = DATA.teamObjective;
    return `
      <h1 class="t-title page-title">Cockpit</h1>
      <p class="t-body t-muted page-sub">${esc(DATA.race.week)} · ${esc(DATA.race.season)}. Points = stage × band multiplier + bonuses − penalties. Handicapped by territory, so the board measures skill, not luck.</p>
      <div class="stats">
        ${DATA.cockpitStats.map((s, i) => `<div class="stat${i === 0 ? ' stat-blue' : i === 3 ? ' stat-dark' : ''}"><span class="m-label">${s.label}</span><strong>${s.value}</strong></div>`).join('')}
      </div>
      <div class="gap"></div>
      ${board("DRIVERS' CHAMPIONSHIP — POINTS THIS SEASON", DATA.reps)}
      <div class="m-data t-muted" style="display:block;margin:6px 0 0">${esc(DATA.race.fastestLap)}</div>
      <div class="gap"></div>
      ${board("CONSTRUCTORS' CHAMPIONSHIP — PRODUCTS BY WIN RATE", DATA.products)}
      <div class="gap"></div>
      <div class="panel" style="padding:18px 20px">
        <span class="m-label">${esc(t.label)}</span>
        <div class="likelihood" style="margin-top:4px"><span class="bar" style="width:100%;height:8px"><b style="width:${Math.round(100 * t.current / t.target)}%"></b></span><span class="m-data">${t.current} / ${t.target}</span></div>
        <div class="t-caption" style="margin-top:10px">Shared target unlocks a team reward — the board never goes zero-sum.</div>
      </div>
      <div class="gap"></div>
      <div class="feed">${DATA.feed.map(f => `<div>${esc(f)}</div>`).join('')}</div>`;
  },

  pipeline() {
    return `
      <h1 class="t-title page-title">Pipeline</h1>
      <p class="t-body t-muted page-sub">Every record captured, enriched, scored fit × intent, banded, and routed by complexity. Click a row for the full dossier.</p>
      ${recordTable(DATA.records)}`;
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
    const recs = DATA.records.filter(r => r.lane !== 'enterprise');
    return `
      <h1 class="t-title page-title">Self-serve</h1>
      <p class="t-body t-muted page-sub">The e-commerce path, plus the assisted lane (complexity 25–54: agent-led, named rep visible). Goal: activation inside 14 days — the strongest predictor of month-3 retention.</p>
      <table class="tbl">
        <thead><tr><th>Account</th><th>Lane</th><th>Lifecycle state</th><th>Band</th><th>Likelihood</th><th>Next action</th></tr></thead>
        <tbody>${recs.map(r => `
          <tr class="click" data-id="${r.id}">
            <td><div style="display:flex;align-items:center;gap:12px"><div class="avatar avatar-alt" style="width:32px;height:32px;font-size:12px">${r.initials}</div><span style="font-weight:600">${esc(r.name)}</span></div></td>
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
    return `
      <h1 class="t-title page-title">Enterprise</h1>
      <p class="t-body t-muted page-sub">Rep-owned; the agent runs research, drafting and admin. Two clocks: proactive ABM we control, tender deadlines we don't.</p>
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
      <p class="t-body t-muted page-sub">The outbound push, stamped with the authority that lets it send: agent tier for content, document risk tier and approver for proposals and contracts.</p>
      <table class="tbl">
        <thead><tr><th>Type</th><th>Item</th><th>Account</th><th>Channel</th><th>When</th><th>Authority</th></tr></thead>
        <tbody>
          ${DATA.engageQueue.map(q => {
            const r = recById(q.record);
            const red = q.authority.startsWith('RED'), amber = q.authority.startsWith('AMBER');
            return `<tr class="click" data-id="${r.id}">
              <td><span class="chip">${q.type}</span></td>
              <td style="font-weight:600">${esc(q.item)}</td>
              <td>${esc(r.name)}</td>
              <td class="t-caption">${esc(q.channel)}</td>
              <td><span class="m-data">${esc(q.when.toUpperCase())}</span></td>
              <td><span class="m-data" style="color:${red ? 'var(--tilly-red)' : amber ? 'var(--tilly-grey-500)' : 'var(--tilly-green)'}">${esc(q.authority)}</span></td>
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
          <div class="avatar" style="background:var(--tilly-black)">${r.initials}</div>
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
      <div class="rec-head">
        <div class="avatar${r.lane !== 'enterprise' ? ' avatar-alt' : ''}">${r.initials}</div>
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
  const row = e.target.closest('[data-id]');
  if (row) location.hash = `#/record/${row.dataset.id}`;
});

window.addEventListener('hashchange', render);

/* Sidebar counts */
document.getElementById('count-pipeline').textContent = DATA.records.length;
document.getElementById('count-selfserve').textContent = DATA.records.filter(r => r.lane !== 'enterprise').length;
document.getElementById('count-enterprise').textContent = DATA.records.filter(r => r.lane === 'enterprise').length;
document.getElementById('count-engage').textContent = DATA.engageQueue.length;
document.getElementById('count-esc').textContent = DATA.records.filter(r => r.escalation).length;

render();
