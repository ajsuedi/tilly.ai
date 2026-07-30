/* Tilly CRM — Ask Tilly, the race engineer in the corner. Disclosed AI; data-aware answers; human fallback. */

/* ---- Ask Tilly — your race engineer, one click away (Sidekick-style) ---- */

let askOpen = false;
const askMsgs = [
  { from: 'tilly', text: "I'm Tilly — your AI success assistant, disclosed, not disguised. Ask me where anything lives, why the model did what it did, or what to do next. If I don't know, I get a human.", link: null }
];
const ASK_CHIPS = ['How likely am I to win this deal?', 'How many qualified leads?', "What's my commission?", 'How far am I from target?'];

/* Context: which deal and which rep the question is being asked from */
const askCtx = () => {
  const h = location.hash || '';
  const rec = h.match(/#\/record\/([\w-]+)/);
  const rep = h.match(/#\/rep\/(\w+)/);
  return { rec: rec ? recById(rec[1]) : null, rep: (rep && repById(rep[1])) || repById('priya') };
};

const ASK_ROUTES = [
  { re: /how likely|win this|chance|odds|likelihood of/i, fn: () => {
      const { rec } = askCtx();
      if (rec) return { text: `${rec.name}: ${rec.likelihood}% to convert — ${rec.band} band (0.4 × fit ${rec.fit} + 0.6 × intent ${rec.intent}). Verdict vs ${rec.verdict.vs}: ${rec.verdict.type}. ${rec.verdict.play}`, link: ['#/record/' + rec.id, 'See the full dossier'] };
      const top = byLikelihood(DATA.records.filter(r => r.stage !== 'Won'))[0];
      return { text: `Open a deal and ask again for its exact odds. Best in the book right now: ${top.name} at ${top.likelihood}% (${top.band}).`, link: ['#/record/' + top.id, 'Open ' + top.name] };
    } },
  { re: /qualified|how many lead/i, fn: () => {
      const n = b => DATA.records.filter(r => r.band === b).length;
      const agent = DATA.records.filter(r => r.agentSourced).length;
      return { text: `${DATA.records.length} scored accounts in the book: ${n('POLE')} Pole and ${n('FRONT ROW')} Front Row — that's ${n('POLE') + n('FRONT ROW')} qualified, workable leads — plus ${n('MIDFIELD')} Midfield being nurtured. Last night's run qualified 9 overnight${agent ? `, and the latest agent run promoted ${agent} more` : ''}.`, link: ['#/pipeline', 'Open the pipeline'] };
    } },
  { re: /commission|earn|money/i, fn: () => {
      const { rep } = askCtx();
      const mine = DATA.records.filter(r => r.owner === rep.id);
      const earned = Math.round(rep.closedYTD * rep.commissionRate);
      const proj = Math.round(weightedValue(mine) * rep.commissionRate);
      return { text: `${rep.name.split(' ')[0]}: ${gbp(earned)} earned YTD (${Math.round(rep.commissionRate * 100)}% of ${gbp(rep.closedYTD)} closed). Your weighted open pipeline projects another ${gbp(proj)} — and everything past quota pays ${Math.round(rep.acceleratorRate * 100)}%.`, link: ['#/rep/' + rep.id, 'Open My page'] };
    } },
  { re: /target|quota|far .*(hit|target)|attainment|this quarter/i, fn: () => {
      const { rep } = askCtx();
      const gap = Math.max(0, rep.quota - rep.closedYTD);
      const att = Math.round(100 * rep.closedYTD / rep.quota);
      const cov = Math.round(100 * weightedValue(DATA.records.filter(r => r.owner === rep.id)) / Math.max(1, gap));
      return { text: `You're at ${att}% of your ${gbp(rep.quota)} annual quota — ${gbp(gap)} to go. Your weighted pipeline covers ${cov}% of that gap${cov >= 100 ? ' — close what you have and you\'re over the line.' : ' — worth letting the agent promote more from the funnel.'}`, link: ['#/rep/' + rep.id, 'Open My page'] };
    } },
  { re: /need|right now|today|start|first/i, text: 'Your starting grid has everything needing a human, tightest clock first — it lives on the Cockpit. Work it top to bottom.', link: ['#/cockpit', 'Open the Cockpit'] },
  { re: /risk|churn|ymca|save|red/i, text: 'YMCA is red-flagged: usage −40%, two negative replies, renewal in six weeks. The save play is pause-first — grant-funded budgets respond better to a pause than a discount.', link: ['#/success', 'Open Tilly Success'] },
  { re: /approve|proposal|amber|send/i, text: 'Anything amber waits for one click from you in Engage. Check the discount against the ladder, hit Approve — it sends itself.', link: ['#/engage', 'Open Engage'] },
  { re: /prospect|funnel|new business/i, text: 'Tilly fetches and qualifies overnight at 02:00 — the freshest intake is on the Funnel view. You never prospect manually.', link: ['#/funnel', 'Open Funnel'] },
  { re: /video|coach|adoption|enable/i, text: 'Adoption gaps and coaching videos are in Success — preview the explainer, then send it in-product + email at tier T1.', link: ['#/success', 'Open Success'] },
  { re: /pole|band|score|likelihood|fit|intent/i, text: 'Likelihood = 0.4 × fit + 0.6 × intent, banded Pole to Cold. Hover any chip for its meaning, or read the full model on Channels.', link: ['#/channels', 'Open the model'] },
  { re: /task|to-?do|granola|meeting/i, text: 'Your day lives in Tasks. Say the next step out loud in a recorded meeting and it appears there, dated — you never type a task.', link: ['#/tasks', 'Open Tasks'] },
  { re: /escalat|human|handoff|trigger/i, text: 'Eight triggers hand a deal to a human — each with a threshold and SLA. The full list, and the agent permission tiers, are on Escalations.', link: ['#/escalations', 'Open Escalations'] }
];

function askReply(q) {
  const hit = ASK_ROUTES.find(r => r.re.test(q));
  if (!hit) return { from: 'tilly', text: `I don't know that one — so I won't guess. I've flagged it to a human teammate; they'll reply to ${DATA.settings.emailProxy} (test proxy) within 2 business hours.`, link: null };
  const a = hit.fn ? hit.fn() : { text: hit.text, link: hit.link };
  return { from: 'tilly', text: a.text, link: a.link };
}

function paintAsk() {
  let el = document.getElementById('ask-root');
  if (!el) { el = document.createElement('div'); el.id = 'ask-root'; document.body.appendChild(el); }
  if (!askOpen) {
    el.innerHTML = `<button class="ask-fab" data-ask-open><span style="width:16px;height:16px;background:var(--tilly-blue);position:relative;display:inline-block"><span style="position:absolute;left:3px;right:3px;top:6px;height:3px;background:#fff"></span></span>ASK TILLY</button>`;
    return;
  }
  el.innerHTML = `
    <div class="ask-panel">
      <div class="ask-head">
        <div class="mark mark-20 mark-inverse"></div>
        <div style="flex:1">
          <div style="font-weight:600;font-size:14px;letter-spacing:-0.3px">Ask Tilly</div>
          <div class="m-data" style="color:rgba(255,255,255,.5);font-size:9px">YOUR RACE ENGINEER · AI, DISCLOSED · ESCALATES TO HUMANS</div>
        </div>
        <button class="tour-skip" data-ask-close style="font-size:16px">×</button>
      </div>
      <div class="ask-msgs" id="ask-msgs">
        ${askMsgs.map(m => {
          const recMatch = m.link && m.link[0].match(/^#\/record\/([\w-]+)/);
          const r = recMatch ? recById(recMatch[1]) : null;
          return `
          <div class="ask-msg ${m.from}">${esc(m.text)}${r ? `
            <a href="#/record/${r.id}" class="ask-card">
              ${avatar(r, 30)}
              <div style="flex:1;min-width:0">
                <div style="font-weight:600;font-size:13px">${esc(r.name)}</div>
                <div style="display:flex;gap:8px;align-items:center;margin-top:4px;flex-wrap:wrap">${bandChip(r)}<span class="m-data" style="color:var(--tilly-blue)">${r.likelihood}%</span><span class="m-data" style="color:var(--tilly-grey-500)">${gbp(r.acvNum)}</span></div>
                <div class="t-caption" style="font-size:11px;margin-top:4px">NEXT: ${esc(r.nextAction)}</div>
              </div>
              <span class="m-data" style="color:var(--tilly-blue);flex:none">OPEN →</span>
            </a>`
          : m.link ? `<div style="margin-top:8px"><a href="${m.link[0]}" class="m-data" style="color:var(--tilly-blue)">${esc(m.link[1].toUpperCase())} →</a></div>` : ''}</div>`;
        }).join('')}
      </div>
      <div class="ask-chips">${ASK_CHIPS.map(c => `<button class="fchip" data-ask-chip="${esc(c)}">${esc(c.toUpperCase())}</button>`).join('')}</div>
      <div class="ask-input">
        <input id="ask-text" placeholder="Ask anything — or say it out loud in a meeting…">
        <button data-ask-send>Ask</button>
      </div>
    </div>`;
  const box = document.getElementById('ask-msgs');
  box.scrollTop = box.scrollHeight;
  document.getElementById('ask-text').focus();
}

function askSubmit(q) {
  if (!q.trim()) return;
  askMsgs.push({ from: 'me', text: q.trim(), link: null });
  askMsgs.push(askReply(q));
  paintAsk();
}

document.addEventListener('click', e => {
  if (e.target.closest('[data-ask-open]')) { askOpen = true; paintAsk(); return; }
  if (e.target.closest('[data-ask-close]')) { askOpen = false; paintAsk(); return; }
  const chip = e.target.closest('[data-ask-chip]');
  if (chip) { askSubmit(chip.dataset.askChip); return; }
  if (e.target.closest('[data-ask-send]')) { askSubmit(document.getElementById('ask-text').value); return; }
});
document.addEventListener('keydown', e => {
  if (e.key === 'Enter' && e.target.id === 'ask-text') askSubmit(e.target.value);
});
