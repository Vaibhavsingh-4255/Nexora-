/* NEXORA — nav.js
   Section switching + swipe-between-sections gesture handling. */

/* ===================== NAV ===================== */
const EXTRA_SECTIONS = ['user-profile','followlist','search'];
const ALL_SECTIONS = [...VIEW_ORDER, ...EXTRA_SECTIONS];

function switchView(view){
  ALL_SECTIONS.forEach(v=>{
    document.getElementById('section-'+v).classList.toggle('hidden', v!==view);
  });
  document.querySelectorAll('.nav-btn').forEach(b=>b.classList.toggle('active', b.dataset.arg===view));
  document.querySelectorAll('#iconNav .dock-item').forEach(d=>d.classList.toggle('active', d.dataset.arg===view));
  window.scrollTo({top:0, left:0, behavior:'auto'});
  if(view==='tracker') renderTracker();
  if(view==='completed') renderCompleted();
  if(view==='community') renderCommunity();
  if(view==='messages') renderMessages();
  if(view==='notifications') renderNotifications();
  if(view==='profile') renderProfile();
  if(view==='user-profile') renderUserProfile();
  if(view==='followlist') renderFollowList();
  if(view==='search') renderPeopleSearchResults();
  if(view!=='community') applyPageTheme();
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
const SWIPE_IGNORE_SELECTOR = '.cat-tabs, .pill-row, .stars, input, textarea, select, .genre-chip-row, .form-grid, .search-row';

function currentView(){
  return ALL_SECTIONS.find(v => !document.getElementById('section-'+v).classList.contains('hidden')) || 'tracker';
}
function swipeToView(direction){
  const view = currentView();
  if(!VIEW_ORDER.includes(view)) return; // no swiping while on a sub-view (profile detail, follow list)
  const idx = VIEW_ORDER.indexOf(view);
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
/* ===================== FLOATING DOCK CLICK HANDLERS ===================== */
document.addEventListener('DOMContentLoaded', () => {
  const dock = document.getElementById('iconNav');
  if (!dock) return;

  dock.addEventListener('click', (e) => {
    // 1. Handle standard tab navigation buttons
    const navBtn = e.target.closest('.dock-item[data-action="nav"]');
    if (navBtn && navBtn.dataset.arg) {
      switchView(navBtn.dataset.arg);
      return;
    }

    // 2. Handle the Center "+" Quick Post CTA button
    const quickPostBtn = e.target.closest('.dock-item[data-action="quick-post"]');
    if (quickPostBtn) {
      quickNewPost();
    }
  });
});