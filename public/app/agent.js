/* Tilly CRM — the top-of-funnel agent run: fetch, dedupe, enrich, score, qualify, route, draft. */

/* ---- The agent run: watch Tilly fetch, score, qualify and promote — live ---- */

let agentRunning = false;

function promoteCandidates() {
  DATA.funnel.candidates.forEach(c => {
    if (recById(c.id)) return;
    c.likelihood = Math.round(0.4 * c.fit + 0.6 * c.intent);
    c.band = band(c.likelihood);
    c.lane = lane(c.complexity);
    c.agentSourced = true;
    DATA.records.push(c);
    DATA.engageQueue.unshift({ record: c.id, type: 'EMAIL', item: `First touch — education, no pitch: what good looks like for ${c.shops} shops`, channel: 'Email', when: 'Tue 09:00', authority: 'T1 · AUTO' });
    DATA.feed.unshift({ t: 'NOW', record: c.id, who: c.initials, msg: `Promoted to the pipeline by the agent run — ${c.band}, ${c.lane} lane` });
  });
  DATA.funnel.incoming.forEach(l => {
    if (/PDSA|Sense/.test(l.name)) l.status = 'PROMOTED';
  });
  DATA.funnel.hasRun = true;
  updateCounts();
}

function runAgent() {
  if (agentRunning || DATA.funnel.hasRun) return;
  agentRunning = true;
  const log = document.getElementById('agent-log');
  log.style.display = '';
  const lines = DATA.funnel.runLog;
  let i = 0;
  const tick = setInterval(() => {
    if (i >= lines.length) {
      clearInterval(tick);
      agentRunning = false;
      promoteCandidates();
      render();
      return;
    }
    const l = lines[i];
    document.querySelectorAll('#agent-flow .sseg.cur').forEach(s => { s.classList.remove('cur'); s.classList.add('done'); });
    const seg = document.getElementById('agent-seg-' + l.step);
    if (seg) { seg.classList.remove('done'); seg.classList.add('cur'); }
    const row = document.createElement('div');
    row.textContent = l.msg;
    log.appendChild(row);
    log.scrollIntoView({ block: 'end', behavior: 'smooth' });
    i++;
  }, 600);
}
