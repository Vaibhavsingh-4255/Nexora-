/* NEXORA — search.js
   Search people by username or name, from the icon next to the logo.
   Follow (or send a follow request, for private accounts) right from
   the results list — same button behavior as a profile page. */

let cameFromSearch = 'community';

function openSearchView(){
  cameFromSearch = currentView();
  switchView('search');
  renderPeopleSearchResults();
  setTimeout(() => {
    const input = document.getElementById('peopleSearchInput');
    if(input){ input.value = ''; input.focus(); }
  }, 60);
}
function backFromSearch(){ switchView(cameFromSearch); }

function renderPeopleSearchResults(){
  const input = document.getElementById('peopleSearchInput');
  const el = document.getElementById('searchResultsBody');
  if(!el) return;
  const q = (input ? input.value : '').trim().toLowerCase();

  const results = Object.values(users).filter(u => {
    if(u.username === currentUser) return false;
    if(!q) return true;
    return u.username.toLowerCase().includes(q) || (u.name || '').toLowerCase().includes(q);
  });

  if(results.length === 0){
    el.innerHTML = `<div class="empty">${q ? 'No one matches that search.' : 'Search by username or name to find people to follow.'}</div>`;
    return;
  }

  el.innerHTML = results.map(u => {
    const following = isFollowing(currentUser, u.username);
    const pending = hasPendingRequest(currentUser, u.username);
    const label = following ? 'Following ✓' : pending ? 'Requested' : 'Follow';
    const btnClass = (following || pending) ? 'btn-ghost' : 'btn-primary';
    const badge = badgeById(u.badge);
    return `
    <div class="my-post-card" style="cursor:default;">
      <div class="row" style="gap:10px; justify-content:space-between; align-items:center;">
        <button class="row" style="gap:10px; background:none; border:none; padding:0; cursor:pointer; text-align:left; flex:1; min-width:0;" data-action="view-profile" data-arg="${u.username}" type="button">
          <div class="avatar-ring" style="width:38px;height:38px; flex:none;"><div class="avatar-inner" style="font-size:15px;">${u.username[0].toUpperCase()}</div></div>
          <div style="min-width:0;">
            <div style="font-weight:700; font-size:13.5px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${escapeHtml(u.name || u.username)}${!u.publicProfile ? ' 🔒' : ''}</div>
            <div style="font-size:11.5px; color:var(--paper-faint); white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">@${escapeHtml(u.username)}${badge ? ' · '+badge.icon+' '+escapeHtml(badge.label) : ''}</div>
          </div>
        </button>
        <button class="btn ${btnClass} btn-small" style="flex:none;" data-action="follow-from-search" data-arg="${u.username}" type="button">${label}</button>
      </div>
    </div>`;
  }).join('');
}

function toggleFollowFromSearch(username){
  const prevViewed = viewedProfileUser;
  viewedProfileUser = username;
  toggleFollow();
  viewedProfileUser = prevViewed;
  renderPeopleSearchResults();
}
