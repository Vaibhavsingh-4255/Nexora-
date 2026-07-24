/* NEXORA — nav.js
   Section switching + swipe-between-sections gesture handling. */

/* ===================== NAV ===================== */
function switchView(view){
  VIEW_ORDER.forEach(v=>{
    document.getElementById('section-'+v).classList.toggle('hidden', v!==view);
  });
  document.querySelectorAll('.nav-btn').forEach(b=>b.classList.toggle('active', b.dataset.arg===view));
  document.querySelectorAll('#iconNav .icon-nav-btn').forEach(d=>d.classList.toggle('active', d.dataset.arg===view));
  window.scrollTo({top:0, left:0, behavior:'auto'});
  if(view==='tracker') renderTracker();
  if(view==='completed') renderCompleted();
  if(view==='community') renderCommunity();
  if(view==='notifications') renderNotifications();
  if(view==='profile') renderProfile();
}

function quickNewPost(){
  switchView('community');
  document.getElementById('newPostCard').classList.remove('hidden');
  setTimeout(()=>{
    document.getElementById('newPostCard').scrollIntoView({behavior:'smooth', block:'start'});
    document.getElementById('pTitle').focus();
  }, 80);
}

/* ===================== SWIPE BETWEEN SECTIONS ===================== */
let touchStartX = 0, touchStartY = 0, touchActive = false;
const SWIPE_IGNORE_SELECTOR = '.cat-tabs, .pill-row, .stars, input, textarea, select, .genre-chip-row, .form-grid';

function currentView(){
  return VIEW_ORDER.find(v => !document.getElementById('section-'+v).classList.contains('hidden')) || 'tracker';
}
function swipeToView(direction){
  const idx = VIEW_ORDER.indexOf(currentView());
  const nextIdx = idx + direction;
  if(nextIdx < 0 || nextIdx >= VIEW_ORDER.length) return;
  switchView(VIEW_ORDER[nextIdx]);
}
document.addEventListener('touchstart', function(e){
  if(document.getElementById('view-app').classList.contains('hidden')) return;
  if(e.target.closest(SWIPE_IGNORE_SELECTOR)) { touchActive = false; return; }
  if(e.touches.length !== 1) return;
  touchStartX = e.touches[0].clientX;
  touchStartY = e.touches[0].clientY;
  touchActive = true;
}, {passive:true});
document.addEventListener('touchend', function(e){
  if(!touchActive) return;
  touchActive = false;
  const dx = e.changedTouches[0].clientX - touchStartX;
  const dy = e.changedTouches[0].clientY - touchStartY;
  if(Math.abs(dx) < 65 || Math.abs(dy) > 60) return;
  swipeToView(dx < 0 ? 1 : -1);
}, {passive:true});

