/* Tilly CRM — prospect intel engine view. Loads after app.js; registers itself
   on the shared views object so the existing hash router picks up #/intel. */

const buyChip = s => {
  const style = s >= 80 ? 'background:var(--tilly-blue);border-color:var(--tilly-blue);color:#fff'
    : s >= 65 ? 'color:var(--tilly-blue);border-color:var(--tilly-blue)'
    : s >= 50 ? '' : 'color:var(--tilly-grey-500)';
  const b = s >= 80 ? 'HOT' : s >= 65 ? 'WARM' : s >= 50 ? 'WATCH' : 'PARK';
  return `<span class="chip" style="${style}">${s} · ${b}</span>`;
};

const windowChip = w =>
  w === 'OPEN' ? `<span class="chip" style="background:var(--tilly-green);border-color:var(--tilly-green);color:#fff">OPEN</span>`
  : w === 'CLOSED' ? `<span class="chip" style="color:var(--tilly-grey-500)">CLOSED</span>`
  : `<span class="chip">${esc(w)}</span>`;

views.intel = () => `
  <h1 class="t-title page-title">Prospect intel</h1>
  <p class="t-body t-muted page-sub">The market, mapped: how big it is, who is most likely to buy, what they run today, when their contracts expire — and where Tilly goes next. Refreshed nightly with the 02:00 scan.</p>

  <div class="m-section" style="margin-bottom:16px">TOTAL ADDRESSABLE MARKET — UK CHARITY RETAIL</div>
  <div class="stats">
    ${INTEL.tam.headline.map((s, i) => `<div class="stat${i === 0 ? ' stat-blue' : ''}"><span class="m-label">${s.label}</span><strong>${s.value}</strong></div>`).join('')}
  </div>
  <div class="gap"></div>
  <div class="stats">
    ${INTEL.tam.acv.map(s => `<div class="stat"><span class="m-label">${s.label}</span><strong>${s.value}</strong></div>`).join('')}
  </div>
  <div class="gap"></div>
  <table class="tbl">
    <thead><tr><th>Segment</th><th>Orgs</th><th>Shops</th><th>ACV</th><th>Motion</th><th>Read</th></tr></thead>
    <tbody>${INTEL.tam.segments.map(s => `
      <tr>
        <td style="font-weight:600">${esc(s.seg)}</td>
        <td><span class="m-data">${s.orgs}</span></td>
        <td><span class="m-data">${s.shops.toLocaleString('en-GB')}</span></td>
        <td><span class="m-data">${esc(s.acv)}</span></td>
        <td><span class="chip">${esc(s.motion.toUpperCase())}</span></td>
        <td class="t-caption">${esc(s.note)}</td>
      </tr>`).join('')}
    </tbody>
  </table>

  <div class="gap-lg"></div>
  <div class="m-section" style="margin-bottom:16px">BEST BETS — RANKED BY LIKELIHOOD TO BUY</div>
  ${INTEL.prospects.map(p => `
    <div class="panel" style="margin-bottom:12px">
      <div style="display:flex;justify-content:space-between;align-items:center;gap:12px;flex-wrap:wrap">
        <div style="display:flex;align-items:center;gap:12px">
          <span style="font-weight:600">${esc(p.name)}</span>
          <span class="t-caption">${p.shops} shops · ${esc(p.seg)}</span>
        </div>
        <div style="display:flex;align-items:center;gap:8px">
          ${buyChip(p.buyScore)}
          <span class="chip">${esc(p.competitor.toUpperCase())}</span>
          ${p.expiry !== '—' ? `<span class="chip${p.expiryMonths !== null && p.expiryMonths <= 6 ? ' chip-esc' : ''}">EXPIRES ${esc(p.expiry.toUpperCase())}</span>` : ''}
        </div>
      </div>
      <div class="kv" style="margin-top:12px"><span>Best route in</span><span>${esc(p.route)}</span></div>
      <div class="kv"><span>The play</span><span class="t-caption">${esc(p.play)}</span></div>
      <div style="margin-top:10px">${p.why.map(w => `<div class="sig">${esc(w)}</div>`).join('')}</div>
    </div>`).join('')}

  <div class="gap-lg"></div>
  <div class="m-section" style="margin-bottom:16px">COMPETITOR LANDSCAPE — WHO WE DISPLACE</div>
  <table class="tbl">
    <thead><tr><th>Competitor</th><th>Share</th><th>Strength</th><th>Weakness</th><th>Our pitch</th></tr></thead>
    <tbody>${INTEL.competitors.map(c => `
      <tr>
        <td style="font-weight:600">${esc(c.name)}</td>
        <td><span class="m-data">${esc(c.share)}</span></td>
        <td class="t-caption">${esc(c.strength)}</td>
        <td class="t-caption">${esc(c.weakness)}</td>
        <td class="t-caption">${esc(c.pitch)}</td>
      </tr>`).join('')}
    </tbody>
  </table>

  <div class="gap-lg"></div>
  <div class="m-section" style="margin-bottom:16px">CONTRACT EXPIRY RADAR — SWITCH WINDOWS</div>
  <table class="tbl">
    <thead><tr><th>Organisation</th><th>Incumbent</th><th>Expires</th><th>Switch window</th><th>Action</th></tr></thead>
    <tbody>${INTEL.expiries.map(x => `
      <tr>
        <td style="font-weight:600">${esc(x.org)}</td>
        <td class="t-caption">${esc(x.vendor)}</td>
        <td><span class="m-data">${esc(x.expires.toUpperCase())}</span></td>
        <td>${windowChip(x.window)}</td>
        <td class="t-caption">${esc(x.action)}</td>
      </tr>`).join('')}
    </tbody>
  </table>
  <div class="t-caption" style="margin-top:12px">The 6-month switch window is when incumbents are cheapest to displace — Tilly sets an alarm for each and drafts the opener the day it opens.</div>

  <div class="gap-lg"></div>
  <div class="m-section" style="margin-bottom:16px">NEXT REGIONS — INTERNATIONAL GROWTH SCORING</div>
  ${INTEL.regions.map(r => `
    <div class="panel" style="margin-bottom:12px">
      <div style="display:flex;justify-content:space-between;align-items:center;gap:12px;flex-wrap:wrap">
        <div style="display:flex;align-items:center;gap:12px">
          <span style="font-weight:600">${esc(r.region)}</span>
          <span class="t-caption">${esc(r.shops)} shops · ${esc(r.analogue)}</span>
        </div>
        <div style="display:flex;align-items:center;gap:8px">
          ${buyChip(r.score)}
          <span class="chip">${esc(r.whitespace.toUpperCase())}</span>
        </div>
      </div>
      <div class="kv" style="margin-top:12px"><span>Entry route</span><span class="t-caption">${esc(r.entry)}</span></div>
      <div class="t-caption" style="margin-top:8px">${esc(r.note)}</div>
    </div>`).join('')}
  <div class="t-caption">Score = market size × charity-retail maturity × regulatory fit × competitive whitespace. Illustrative placeholders until the scan covers these regions.</div>`;
