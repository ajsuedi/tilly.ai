/* Tilly auth flows — prototype, no backend.
   #/login  — enterprise: sales reps sign in, straight to their private page.
   #/signup — self-serve: email → verify → about you → your charity → plan → welcome.
   In test mode the verification "email" goes to the proxy address. */

const $card = document.getElementById('card');
const esc = s => String(s).replace(/[&<>"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const PROXY = DATA.settings.emailProxy;

const state = {
  step: 0,                 // signup step index
  email: '', name: '', org: '', shops: '', sells: '',
  goals: new Set(), plan: 'growth', annual: true,
  seats: 3, entMeeting: false
};

const STEPS = ['VERIFY', 'ABOUT YOU', 'YOUR COMPANY', 'PLAN', 'PAYMENT'];

const PLAN_PRICES = { starter: { m: 39, y: 32, name: 'Starter' }, growth: { m: 79, y: 65, name: 'Growth' } };

function orderTotals() {
  const p = PLAN_PRICES[state.plan] || PLAN_PRICES.growth;
  const perUser = state.annual ? p.y : p.m;
  const months = state.annual ? 12 : 1;
  const sub = perUser * state.seats * months;
  const vat = Math.round(sub * 0.2);
  return { p, perUser, months, sub, vat, total: sub + vat, cycle: state.annual ? 'year' : 'month' };
}

const stepper = active => `
  <div class="stepper">
    ${STEPS.map((s, i) => `
      <div class="step${i === active ? ' on' : i < active ? ' done' : ''}">
        <span class="n">${i < active ? '✓' : String(i + 1).padStart(2, '0')}</span>
        <span class="lbl">${s}</span>
      </div>${i < STEPS.length - 1 ? '<span class="step-line"></span>' : ''}`).join('')}
  </div>`;

/* ---- Views ---- */

function loginView() {
  document.title = 'Tilly — Sign in';
  return `
    <div class="m-section" style="margin-bottom:20px">ENTERPRISE — SALES SIGN IN</div>
    <h1 class="t-title" style="margin:0 0 8px">Back on the grid.</h1>
    <p class="t-body t-muted" style="margin:0 0 32px">Sign in to your pipeline, your tasks and your number. Tilly worked overnight — 112 leads fetched, 9 qualified.</p>
    <div class="field">
      <label>WORK EMAIL</label>
      <input class="input" id="li-email" placeholder="you@tilly.ai" value="priya.kaur@tilly.ai">
    </div>
    <div class="field">
      <label>PASSWORD</label>
      <input class="input" id="li-pass" type="password" placeholder="••••••••••••" value="prototype">
    </div>
    <button class="btn btn-primary btn-block" data-login>Sign in</button>
    <div style="display:flex;justify-content:space-between;margin-top:14px">
      <span class="m-data t-muted">SSO · SAML AVAILABLE ON ENTERPRISE</span>
      <a class="m-data" href="#/signup" style="color:var(--tilly-blue)">NEW CHARITY? START SELF-SERVE →</a>
    </div>
    <div style="margin-top:28px;padding-top:20px;border-top:var(--line)">
      <span class="m-label" style="display:block;margin-bottom:12px">PROTOTYPE — PICK YOUR ACCOUNT</span>
      <div style="display:flex;gap:8px;flex-wrap:wrap">
        ${DATA.reps.map(r => `<button class="btn btn-secondary btn-sm" data-rep="${r.id}">${esc(r.name)}</button>`).join('')}
      </div>
    </div>`;
}

function signupEmail() {
  document.title = 'Tilly — Get started';
  return `
    <div class="m-section" style="margin-bottom:20px">SELF-SERVE — START IN TWO MINUTES</div>
    <h1 class="t-title" style="margin:0 0 8px">Sell to every charity retailer in the UK.</h1>
    <p class="t-body t-muted" style="margin:0 0 12px">11,200 shops, one pipeline. Charity retail buys slowly — Tilly finds them, warms them, and coaches them over the line while your team does the meetings. Full access, no card needed.</p>
    <div style="background:var(--tilly-grey-100);padding:10px 14px;margin-bottom:28px"><span class="m-data" style="color:var(--tilly-green)">100% ACCESS · NO CREDIT CARD REQUIRED</span></div>
    <div class="field" id="f-email">
      <label>WORK EMAIL</label>
      <input class="input" id="su-email" placeholder="you@yourcompany.co.uk" value="${esc(state.email)}">
      <div class="err-msg">Please add your work email.</div>
    </div>
    <label class="checkline"><button class="tick${state.terms ? ' on' : ''}" data-tickterms>${state.terms ? '✓' : ''}</button><span>I accept the <a href="#">Terms of Service</a> and <a href="#">Privacy Notice</a>.</span></label>
    <label class="checkline"><button class="tick${state.tips ? ' on' : ''}" data-ticktips>${state.tips ? '✓' : ''}</button><span class="t-muted">Send me helpful tips and product updates by email.</span></label>
    <div style="height:12px"></div>
    <button class="btn btn-primary btn-block" data-toverify>Start prospecting</button>
    <div style="display:flex;justify-content:space-between;margin-top:14px">
      <span class="m-data t-muted">ALREADY WITH TILLY?</span>
      <a class="m-data" href="#/login" style="color:var(--tilly-blue)">SIGN IN →</a>
    </div>`;
}

function signupVerify() {
  return `
    ${stepper(0)}
    <h1 class="t-title" style="margin:0 0 8px">A code is on its way.</h1>
    <p class="t-body t-muted" style="margin:0 0 8px">Enter the 6-digit code sent to <b>${esc(state.email)}</b>.</p>
    <div style="margin-bottom:28px"><span class="m-data" style="color:var(--tilly-blue)">TEST MODE — THE EMAIL WENT TO ${esc(PROXY.toUpperCase())} · ANY 6 DIGITS WORK</span></div>
    <div class="code-row" id="code-row">
      ${[0,1,2,3,4,5].map(i => `<input maxlength="1" inputmode="numeric" data-code="${i}">`).join('')}
    </div>
    <div style="height:24px"></div>
    <button class="btn btn-primary btn-block" id="verify-btn" disabled style="opacity:.4" data-toabout>Verify account</button>
    <div class="hint" style="font-size:12px;color:var(--tilly-grey-500);margin-top:14px">Something wrong? <a href="#" style="color:var(--tilly-blue)">Resend the email</a> or <a href="#/signup" style="color:var(--tilly-blue)">start over</a> with a different address.</div>`;
}

function signupAbout() {
  return `
    ${stepper(1)}
    <h1 class="t-title" style="margin:0 0 8px">About you.</h1>
    <p class="t-body t-muted" style="margin:0 0 28px">Tilly personalises everything — starting with getting your name right.</p>
    <div class="field">
      <label>YOUR EMAIL</label>
      <div style="display:flex;justify-content:space-between;align-items:center;border:var(--line);padding:13px 16px;background:var(--tilly-grey-100)">
        <span style="font-size:14px">${esc(state.email)}</span><span class="m-data" style="color:var(--tilly-green)">✓ VERIFIED</span>
      </div>
    </div>
    <div class="field" id="f-name">
      <label>YOUR NAME</label>
      <input class="input" id="su-name" placeholder="First and last name" value="${esc(state.name)}">
      <div class="err-msg">Please add your name.</div>
    </div>
    <div class="field">
      <label>CHOOSE A PASSWORD</label>
      <input class="input" id="su-pass" type="password" placeholder="Min 8 characters">
      <div class="hint">If it's mono, the AI said it. If it's over 8 characters, we're happy.</div>
    </div>
    <div class="field">
      <label>WHICH ROLE DESCRIBES YOU BEST?</label>
      <select class="input" id="su-role">
        <option>Founder / CEO</option><option>Sales lead</option><option>SDR / BDR</option>
        <option>Account management</option><option>Customer success</option><option>Marketing</option><option>Other</option>
      </select>
    </div>
    <button class="btn btn-primary btn-block" data-tocompany>Next</button>`;
}

function signupCompany() {
  const goals = ['Find charity retailers ready to buy', 'Nurture long, slow deals without dropping them', 'Coach customers through onboarding', 'Protect renewals with constant support'];
  return `
    ${stepper(2)}
    <h1 class="t-title" style="margin:0 0 8px">Your company.</h1>
    <p class="t-body t-muted" style="margin:0 0 28px">Tell Tilly what you sell — she'll match it to the retailers whose signals say they're ready, and pace the nurture for a sector that takes its time.</p>
    <div class="field" id="f-org">
      <label>COMPANY NAME</label>
      <input class="input" id="su-org" placeholder="e.g. ShopKit Systems Ltd" value="${esc(state.org)}">
      <div class="err-msg">Please add your company's name.</div>
    </div>
    <div class="field">
      <label>WHAT DO YOU SELL INTO CHARITY RETAIL?</label>
      <div style="display:flex;gap:8px;flex-wrap:wrap">
        ${['EPOS & software', 'Gift Aid services', 'Logistics & recycling', 'Insurance & compliance', 'Shopfitting & supplies', 'Other'].map(s => `<button class="fchip${state.sells === s ? ' on' : ''}" data-sells="${esc(s)}" style="padding:12px 14px">${esc(s.toUpperCase())}</button>`).join('')}
      </div>
    </div>
    <div class="field">
      <label>SALES & CS TEAM SIZE</label>
      <div style="display:flex;gap:8px">
        ${['Just me', '2–5', '6–20', '21+'].map(s => `<button class="fchip${state.shops === s ? ' on' : ''}" data-shops="${s}" style="flex:1;padding:12px">${s.toUpperCase()}</button>`).join('')}
      </div>
    </div>
    <div class="field">
      <label>WHAT SHOULD TILLY FOCUS ON FIRST?</label>
      ${goals.map(g => `<div class="goalline${state.goals.has(g) ? ' on' : ''}" data-goal="${esc(g)}"><span class="tick${state.goals.has(g) ? ' on' : ''}">${state.goals.has(g) ? '✓' : ''}</span>${esc(g)}</div>`).join('')}
    </div>
    <button class="btn btn-primary btn-block" data-toplan>Next</button>`;
}

function signupPlan() {
  const a = state.annual;
  const plans = [
    { id: 'starter', name: 'Starter', m: 39, y: 32, sub: 'For one founder-seller', feats: ['All 11,200 charity retailers, scored', 'Nurture sequences that never drop', 'Tilly answers and drafts'] },
    { id: 'growth', name: 'Growth', m: 79, y: 65, sub: 'For sales & CS teams', feats: ['Everything in Starter', 'AI outreach & coaching videos', 'Tender watch, churn radar, QBR flows'] },
    { id: 'enterprise', name: 'Enterprise', m: 0, y: 0, sub: 'Contract path', feats: ['Everything in Growth', 'SSO, DPA & procurement support', 'Named success manager'] }
  ];
  return `
    ${stepper(3)}
    <h1 class="t-title" style="margin:0 0 8px">Pick your plan.</h1>
    <p class="t-body t-muted" style="margin:0 0 6px">Per user, per month. Sales cycles here run long — your plan can pause between pushes, so patience never costs you.</p>
    <div class="seg" style="max-width:360px">
      <button class="${a ? 'on' : ''}" data-annual="1">Annual — save 2 months</button>
      <button class="${a ? '' : 'on'}" data-annual="0">Monthly</button>
    </div>
    <div class="plans">
      ${plans.map(p => `
        <div class="plan${state.plan === p.id ? ' on' : ''}" data-plan="${p.id}">
          <div class="m-label">${p.name.toUpperCase()}</div>
          <div class="price">${p.id === 'enterprise' ? 'Custom' : '£' + (a ? p.y : p.m)}</div>
          <div class="t-caption">${p.id === 'enterprise' ? 'Talk to a human' : 'per user / month' + (a ? ', billed annually' : '')}</div>
          <div style="margin-top:16px">${p.feats.map(f => `<div class="sig" style="font-size:12px">${esc(f)}</div>`).join('')}</div>
          <div style="margin-top:16px"><span class="m-data" style="color:${state.plan === p.id ? 'var(--tilly-blue)' : 'var(--tilly-grey-500)'}">${state.plan === p.id ? '■ SELECTED' : 'SELECT'}</span></div>
        </div>`).join('')}
    </div>
    ${state.plan === 'enterprise'
      ? `<button class="btn btn-primary btn-block" data-ent>Schedule a meeting</button><div class="hint" style="font-size:12px;color:var(--tilly-grey-500);margin-top:10px;text-align:center">Complexity-routed to the contract path — a named rep takes it from here. No card needed.</div>`
      : `<button class="btn btn-primary btn-block" data-topay>Continue to payment</button><div class="hint" style="font-size:12px;color:var(--tilly-grey-500);margin-top:10px;text-align:center">14-day free trial starts today — you won't be charged until it ends. Cancel or pause any time.</div>`}`;
}

function signupPayment() {
  const o = orderTotals();
  return `
    ${stepper(4)}
    <h1 class="t-title" style="margin:0 0 8px">Checkout.</h1>
    <p class="t-body t-muted" style="margin:0 0 12px">Your 14-day trial starts now; the first charge lands when it ends. Cancel or pause any time — patience never costs you.</p>
    <div style="background:var(--tilly-grey-100);padding:10px 14px;margin-bottom:28px"><span class="m-data" style="color:var(--tilly-blue)">TEST MODE — 4242 TEST CARD · NO REAL CHARGE · RECEIPT → ${esc(PROXY.toUpperCase())}</span></div>
    <div class="panel" style="padding:20px;margin-bottom:24px">
      <span class="m-label" style="display:block;margin-bottom:8px">ORDER SUMMARY</span>
      <div class="kv"><span>Plan</span><span>${esc(o.p.name)} · £${o.perUser} per user / month${state.annual ? ', billed annually' : ''}</span></div>
      <div class="kv"><span>Seats</span><span style="display:flex;gap:10px;align-items:center;justify-content:flex-end">
        <button class="fchip" data-seat="-1" style="padding:6px 12px">−</button>
        <span class="fit">${state.seats}</span>
        <button class="fchip" data-seat="1" style="padding:6px 12px">+</button>
      </span></div>
      <div class="kv"><span>Subtotal</span><span>£${o.sub.toLocaleString('en-GB')} / ${o.cycle}</span></div>
      <div class="kv"><span>VAT (20%)</span><span>£${o.vat.toLocaleString('en-GB')}</span></div>
      <div class="kv"><span><b>Total after trial</b></span><span class="fit">£${o.total.toLocaleString('en-GB')} / ${o.cycle}</span></div>
    </div>
    <div class="field" id="f-card">
      <label>CARD NUMBER</label>
      <input class="input" id="su-card" inputmode="numeric" placeholder="4242 4242 4242 4242" value="4242 4242 4242 4242">
      <div class="err-msg">Please add a card number (any 4242 test card works here).</div>
    </div>
    <div style="display:flex;gap:8px">
      <div class="field" style="flex:1"><label>EXPIRY</label><input class="input" style="width:100%;box-sizing:border-box" value="12/28"></div>
      <div class="field" style="flex:1"><label>CVC</label><input class="input" style="width:100%;box-sizing:border-box" value="123"></div>
      <div class="field" style="flex:2"><label>BILLING POSTCODE</label><input class="input" style="width:100%;box-sizing:border-box" placeholder="EC1A 1BB"></div>
    </div>
    <div class="field"><label>NAME ON CARD</label><input class="input" value="${esc(state.name)}"></div>
    <button class="btn btn-primary btn-block" data-paid>Start trial — then £${o.total.toLocaleString('en-GB')} / ${o.cycle}</button>
    <div class="hint" style="font-size:12px;color:var(--tilly-grey-500);margin-top:12px;text-align:center">VAT invoice with every charge · payment failures follow the dunning ladder, never a hard cut-off.</div>`;
}

function signupWelcome() {
  const first = (state.name || 'there').split(' ')[0];
  return `
    <div style="text-align:center;padding:8px 0 0">
      <div class="mark mark-44" style="margin:0 auto 24px"></div>
      <h1 class="t-title" style="margin:0 0 8px">Welcome to Tilly, ${esc(first)}.</h1>
      <p class="t-body t-muted" style="margin:0 auto 8px;max-width:420px">${esc(state.org || 'Your company')} is on the grid. Tilly is already scanning 11,200 charity shops for the retailers most ready to hear from you${state.sells ? ' about ' + esc(state.sells.toLowerCase()) : ''}.</p>
      <div class="m-data" style="color:var(--tilly-blue)">${state.entMeeting
        ? `MEETING REQUEST SENT → ${esc(PROXY.toUpperCase())} (TEST PROXY) · A NAMED REP TAKES IT FROM HERE`
        : `TRIAL STARTED · RECEIPT + CONFIRMATION SENT → ${esc(PROXY.toUpperCase())} (TEST PROXY)`}</div>
      ${!state.entMeeting ? `<div class="m-data t-muted" style="margin-top:6px">${esc((PLAN_PRICES[state.plan] || PLAN_PRICES.growth).name.toUpperCase())} · ${state.seats} SEATS · £${orderTotals().total.toLocaleString('en-GB')} / ${orderTotals().cycle.toUpperCase()} AFTER TRIAL</div>` : ''}
    </div>
    <div class="welcome-cards">
      <div class="wcard rec">
        <div class="m-label" style="display:block;margin-bottom:10px;color:var(--tilly-blue)">RECOMMENDED</div>
        <div class="t-heading" style="font-size:18px;letter-spacing:-0.5px">Cover the essentials</div>
        <p class="t-caption" style="margin:8px 0 20px">A short guided lap of the key features, so day one already pays for itself.</p>
        <a class="btn btn-primary" href="index.html#/tour">Let's go</a>
      </div>
      <div class="wcard">
        <div class="m-label" style="display:block;margin-bottom:10px">AT YOUR OWN PACE</div>
        <div class="t-heading" style="font-size:18px;letter-spacing:-0.5px">Skip ahead</div>
        <p class="t-caption" style="margin:8px 0 20px">Straight into the app. Explore, adjust, and make it yours.</p>
        <a class="btn btn-outline" href="index.html">Start exploring</a>
      </div>
    </div>`;
}

/* ---- Router ---- */

const SIGNUP_STEPS = [signupEmail, signupVerify, signupAbout, signupCompany, signupPlan, signupPayment, signupWelcome];

function render() {
  const hash = location.hash || '#/login';
  $card.innerHTML = hash.startsWith('#/signup') ? SIGNUP_STEPS[state.step]() : loginView();
  document.getElementById('head-note').textContent = hash.startsWith('#/signup')
    ? 'SELF-SERVE SIGNUP · TEST MODE' : 'ENTERPRISE SIGN IN · TEST MODE';
  document.getElementById('demo-signup').classList.toggle('on', hash.startsWith('#/signup'));
  document.getElementById('demo-login').classList.toggle('on', !hash.startsWith('#/signup'));
  const first = $card.querySelector('[data-code="0"]');
  if (first) first.focus();
  window.scrollTo(0, 0);
}

function go(step) { state.step = step; render(); }

$card.addEventListener('click', e => {
  const t = e.target;
  if (t.closest('[data-login]') || t.closest('[data-rep]')) {
    const rep = t.closest('[data-rep]') ? t.closest('[data-rep]').dataset.rep : 'priya';
    location.href = `index.html#/rep/${rep}`;
    return;
  }
  if (t.closest('[data-tickterms]')) { e.preventDefault(); state.terms = !state.terms; render(); return; }
  if (t.closest('[data-ticktips]')) { e.preventDefault(); state.tips = !state.tips; render(); return; }
  if (t.closest('[data-toverify]')) {
    const em = document.getElementById('su-email').value.trim();
    const f = document.getElementById('f-email');
    if (!em.includes('@')) { f.classList.add('err'); return; }
    state.email = em; go(1); return;
  }
  if (t.closest('[data-toabout]') && !t.closest('[disabled]')) { go(2); return; }
  if (t.closest('[data-tocompany]')) {
    const nm = document.getElementById('su-name').value.trim();
    const f = document.getElementById('f-name');
    if (!nm) { f.classList.add('err'); return; }
    state.name = nm; go(3); return;
  }
  const shops = t.closest('[data-shops]');
  if (shops) { state.shops = shops.dataset.shops; render(); return; }
  const sells = t.closest('[data-sells]');
  if (sells) { state.sells = sells.dataset.sells; render(); return; }
  const goal = t.closest('[data-goal]');
  if (goal) {
    const g = goal.dataset.goal;
    state.goals.has(g) ? state.goals.delete(g) : state.goals.add(g);
    render(); return;
  }
  if (t.closest('[data-toplan]')) {
    const org = document.getElementById('su-org').value.trim();
    const f = document.getElementById('f-org');
    if (!org) { f.classList.add('err'); return; }
    state.org = org; go(4); return;
  }
  const annual = t.closest('[data-annual]');
  if (annual) { state.annual = annual.dataset.annual === '1'; render(); return; }
  const plan = t.closest('[data-plan]');
  if (plan) { state.plan = plan.dataset.plan; render(); return; }
  if (t.closest('[data-topay]')) { state.entMeeting = false; go(5); return; }
  if (t.closest('[data-ent]')) { state.entMeeting = true; go(6); return; }
  const seat = t.closest('[data-seat]');
  if (seat) { state.seats = Math.max(1, state.seats + Number(seat.dataset.seat)); render(); return; }
  if (t.closest('[data-paid]')) {
    const card = document.getElementById('su-card').value.trim();
    const f = document.getElementById('f-card');
    if (card.replace(/\s/g, '').length < 12) { f.classList.add('err'); return; }
    go(6); return;
  }
});

/* Keep typed values in state on every keystroke, so re-renders
   (ticking a checkbox, picking a chip) never wipe the form. */
$card.addEventListener('input', e => {
  if (e.target.id === 'su-email') state.email = e.target.value;
  if (e.target.id === 'su-name') state.name = e.target.value;
  if (e.target.id === 'su-org') state.org = e.target.value;
  const box = e.target.closest('[data-code]');
  if (!box) return;
  box.value = box.value.replace(/\D/g, '').slice(0, 1);
  if (box.value) {
    const next = $card.querySelector(`[data-code="${+box.dataset.code + 1}"]`);
    if (next) next.focus();
  }
  const full = [...$card.querySelectorAll('[data-code]')].every(b => b.value);
  const btn = document.getElementById('verify-btn');
  btn.disabled = !full;
  btn.style.opacity = full ? '1' : '.4';
});

window.addEventListener('hashchange', () => {
  if (!location.hash.startsWith('#/signup')) state.step = 0;
  else if (state.step === 0 && location.hash === '#/signup') state.step = 0;
  render();
});

render();
