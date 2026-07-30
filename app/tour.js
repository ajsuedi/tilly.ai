/* Tilly CRM — guided product tour ("here's where you do this"), skippable at every step. */

/* ---- Guided tour — skippable "here's where you do this" walkthrough ---- */

let tour = null;
const TOUR = [
  { hash: '#/cockpit', sel: '.stats', title: 'Your morning, in four numbers', text: "Here's where you see what needs a human right now — the grid count, open tasks, hot leads and the team streak. If these are clear, you're racing well." },
  { hash: '#/cockpit', sel: '.grid-2', title: 'The starting grid', text: "Here's where your day starts: everything needing you, tightest clock first, enterprise and self-serve separated. Click any row and it expands into exact action items." },
  { hash: '#/pipeline', sel: '.filterbar', title: 'The pipeline', text: "Here's where every scored prospect lives. Filter by band or lane, search anything, and work top to bottom — likelihood is computed, never guessed." },
  { hash: '#/funnel', sel: '.stats', title: 'Top of funnel', text: "Here's where Tilly fetches, enriches and qualifies leads — every night at 02:00, without you. Your job is the meetings she books." },
  { hash: '#/tasks', sel: '.panel', title: 'Tasks', text: "Here's where your day lives. Say the next step out loud in any recorded meeting and it appears here, dated — you never type a task." },
  { hash: '#/engage', sel: '.tbl', title: 'Engage', text: "Here's where Tilly's drafts wait to send. Amber items need one click from you; everything else goes itself, education first, pitches second." },
  { hash: '#/success', sel: '.stats', title: 'Tilly Success', text: "Here's where customers are kept: health telemetry nightly, the churn radar, coaching videos, and the safety car when risk lands. Renewals are won here." }
];

function paintTour() {
  document.querySelectorAll('.tour-hl').forEach(el => el.classList.remove('tour-hl'));
  let card = document.getElementById('tour-card');
  if (tour === null) { if (card) card.remove(); return; }
  const step = TOUR[tour];
  if ((location.hash || '#/cockpit').indexOf(step.hash) !== 0) { location.hash = step.hash; return; }
  const el = $view.querySelector(step.sel);
  if (el) { el.classList.add('tour-hl'); el.scrollIntoView({ block: 'center', behavior: 'smooth' }); }
  if (!card) {
    card = document.createElement('div');
    card.id = 'tour-card'; card.className = 'tour-card';
    document.body.appendChild(card);
  }
  card.innerHTML = `
    <span class="m-label">TOUR · ${tour + 1} OF ${TOUR.length}</span>
    <h3>${step.title}</h3>
    <p>${step.text}</p>
    <div class="row">
      <button class="tour-skip" data-tour-skip>SKIP THE TOUR</button>
      <div style="display:flex;gap:8px">
        ${tour > 0 ? '<button class="btn btn-secondary btn-sm" data-tour-back>Back</button>' : ''}
        <button class="btn btn-primary btn-sm" data-tour-next>${tour === TOUR.length - 1 ? 'Finish — start selling' : 'Next'}</button>
      </div>
    </div>`;
}

document.addEventListener('click', e => {
  if (e.target.closest('[data-tour-skip]')) { tour = null; paintTour(); location.hash = '#/cockpit'; return; }
  if (e.target.closest('[data-tour-back]')) { tour = Math.max(0, tour - 1); paintTour(); return; }
  if (e.target.closest('[data-tour-next]')) {
    if (tour >= TOUR.length - 1) { tour = null; paintTour(); location.hash = '#/cockpit'; }
    else { tour++; paintTour(); }
  }
});
