/* NEXORA — helpers.js
   Small shared utilities (HTML escaping, relative time). */

/* ===================== HELPERS ===================== */
function escapeHtml(str){
  return String(str).replace(/[&<>"']/g, m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
}
function timeAgo(ts){
  const mins = Math.floor((Date.now()-ts)/60000);
  if(mins < 1) return 'just now';
  if(mins < 60) return mins+'m ago';
  const hrs = Math.floor(mins/60);
  if(hrs < 24) return hrs+'h ago';
  return Math.floor(hrs/24)+'d ago';
}

