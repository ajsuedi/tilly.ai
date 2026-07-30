/* Tilly auth flows — prototype, no backend.
   #/login  — enterprise: sales reps sign in, straight to their private page.
   #/signup — self-serve: email → verify → about you → your charity → plan → welcome.
   In test mode the verification "email" goes to the proxy address. */

const $card = document.getElementById('card');
const esc = s => String(s).replace(/[&<>"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const PROXY = DATA.settings.emailProxy;

const state = {
  step: 0,                 // signup step index
  email: '', name: '', org: '', shops: '', cause: '',
  goals: new Set(), plan: 'growth', annual: true
};

const STEPS = ['VERIFY', 'ABOUT YOU', 'YOUR CHARITY', 'PLAN'];

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
    <h1 class="t-title" style="margin:0 0 8px">Every charity shop in the UK. One pipeline.</h1>
    <p class="t-body t-muted" style="margin:0 0 12px">Full access. No card needed. Tilly starts prospecting while you finish signing up.</p>
    <div style="background:var(--tilly-grey-100);padding:10px 14px;margin-bottom:28px"><span class="m-data" style="color:var(--tilly-green)">100% ACCESS · NO CREDIT CARD REQUIRED</span></div>
    <div class="field" id="f-email">
      <label>WORK EMAIL</label>
      <input class="input" id="su-email" placeholder="you@yourcharity.org.uk" value="${esc(state.email)}">
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
        <option>Shop manager</option><option>Retail / trading lead</option><option>Head of retail</option>
        <option>Finance</option><option>Fundraising</option><option>Trustee</option><option>Other</option>
      </select>
    </div>
    <button class="btn btn-primary btn-block" data-tocompany>Next</button>`;
}

function signupCompany() {
  const goals = ['Sell more donated stock', 'Grow Gift Aid uptake', 'Fill the volunteer rota', 'See every shop in one place'];
  return `
    ${stepper(2)}
    <h1 class="t-title" style="margin:0 0 8px">Your charity.</h1>
    <p class="t-body t-muted" style="margin:0 0 28px">Tilly auto-enriches the rest from the Charity Commission — no forms you don't need.</p>
    <div class="field" id="f-org">
      <label>CHARITY OR TRADING NAME</label>
      <input class="input" id="su-org" placeholder="e.g. St Clare's Hospice Shops" value="${esc(state.org)}">
      <div class="err-msg">Please add your charity's name.</div>
    </div>
    <div class="field">
      <label>HOW MANY SHOPS?</label>
      <div style="display:flex;gap:8px">
        ${['1', '2–10', '11–50', '51–200', '200+'].map(s => `<button class="fchip${state.shops === s ? ' on' : ''}" data-shops="${s}" style="flex:1;padding:12px">${s}</button>`).join('')}
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
    { id: 'starter', name: 'Starter', m: 10, y: 8, sub: 'Up to 50 shops', feats: ['One pipeline, every shop', 'Gift Aid tracking', 'Tilly answers questions'] },
    { id: 'growth', name: 'Growth', m: 14, y: 11, sub: 'Unlimited shops', feats: ['Everything in Starter', 'AI outreach & explainer videos', 'Volunteer rota & reporting'] },
    { id: 'enterprise', name: 'Enterprise', m: 0, y: 0, sub: 'Contract & tender path', feats: ['Everything in Growth', 'Procurement & DPIA support', 'Named driver manager'] }
  ];
  return `
    ${stepper(3)}
    <h1 class="t-title" style="margin:0 0 8px">Pick your plan.</h1>
    <p class="t-body t-muted" style="margin:0 0 6px">Per shop, per month. Change or cancel any time — this is a grant-funded sector, we get it.</p>
    <div class="seg" style="max-width:360px">
      <button class="${a ? 'on' : ''}" data-annual="1">Annual — save 2 months</button>
      <button class="${a ? '' : 'on'}" data-annual="0">Monthly</button>
    </div>
    <div class="plans">
      ${plans.map(p => `
        <div class="plan${state.plan === p.id ? ' on' : ''}" data-plan="${p.id}">
          <div class="m-label">${p.name.toUpperCase()}</div>
          <div class="price">${p.id === 'enterprise' ? 'Custom' : '£' + (a ? p.y : p.m)}</div>
          <div class="t-caption">${p.id === 'enterprise' ? 'Talk to a human' : 'per shop / month' + (a ? ', billed annually' : '')}</div>
          <div style="margin-top:16px">${p.feats.map(f => `<div class="sig" style="font-size:12px">${esc(f)}</div>`).join('')}</div>
          <div style="margin-top:16px"><span class="m-data" style="color:${state.plan === p.id ? 'var(--tilly-blue)' : 'var(--tilly-grey-500)'}">${state.plan === p.id ? '■ SELECTED' : 'SELECT'}</span></div>
        </div>`).join('')}
    </div>
    ${state.plan === 'enterprise'
      ? `<button class="btn btn-primary btn-block" data-done>Schedule a meeting</button><div class="hint" style="font-size:12px;color:var(--tilly-grey-500);margin-top:10px;text-align:center">Complexity-routed to the contract path — a named rep takes it from here.</div>`
      : `<button class="btn btn-primary btn-block" data-done>Start free — card comes later</button><div class="hint" style="font-size:12px;color:var(--tilly-grey-500);margin-top:10px;text-align:center">14-day activation target. Checkout only when you're getting value.</div>`}`;
}

function signupWelcome() {
  const first = (state.name || 'there').split(' ')[0];
  return `
    <div style="text-align:center;padding:8px 0 0">
      <div class="mark mark-44" style="margin:0 auto 24px"></div>
      <h1 class="t-title" style="margin:0 0 8px">Welcome to Tilly, ${esc(first)}.</h1>
      <p class="t-body t-muted" style="margin:0 auto 8px;max-width:420px">${esc(state.org || 'Your charity')} is on the grid. Tilly has already started enriching your record from the Charity Commission.</p>
      <div class="m-data" style="color:var(--tilly-blue)">CONFIRMATION SENT → ${esc(PROXY.toUpperCase())} (TEST PROXY)</div>
    </div>
    <div class="welcome-cards">
      <div class="wcard rec">
        <div class="m-label" style="display:block;margin-bottom:10px;color:var(--tilly-blue)">RECOMMENDED</div>
        <div class="t-heading" style="font-size:18px;letter-spacing:-0.5px">Cover the essentials</div>
        <p class="t-caption" style="margin:8px 0 20px">A short guided lap of the key features, so day one already pays for itself.</p>
        <a class="btn btn-primary" href="index.html#/selfserve">Let's go</a>
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

const SIGNUP_STEPS = [signupEmail, signupVerify, signupAbout, signupCompany, signupPlan, signupWelcome];

function render() {
  const hash = location.hash || '#/login';
  $card.innerHTML = hash.startsWith('#/signup') ? SIGNUP_STEPS[state.step]() : loginView();
  document.getElementById('head-note').textContent = hash.startsWith('#/signup')
    ? 'SELF-SERVE SIGNUP · TEST MODE' : 'ENTERPRISE SIGN IN · TEST MODE';
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
  if (t.closest('[data-done]')) { go(5); return; }
});

/* Verification code boxes: auto-advance, enable Verify when complete */
$card.addEventListener('input', e => {
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
