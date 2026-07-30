/* Tilly CRM — boot entrypoint. Loads last: paints the corner assistant and the first view. */

/* Global back button — steps through the hash history; falls back to the cockpit */
document.getElementById('back-btn').addEventListener('click', () => {
  if (history.length > 1) history.back();
  else { location.hash = '#/cockpit'; render(); }
});

paintAsk();
render();
